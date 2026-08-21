#!/usr/bin/env node

import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageDirectory = path.resolve(testDirectory, '..');
const repositoryRoot = path.resolve(packageDirectory, '..', '..');
const runtimePath = path.join(packageDirectory, 'bin', 'algoglyph-mcp-connector.mjs');
const packageBinShimPath = path.join(packageDirectory, 'bin', 'algoglyph-mcp-connector.js');
const repositoryShimPath = path.join(repositoryRoot, 'scripts', 'algoglyph-mcp-connector.mjs');
const browserTypesPath = path.join(repositoryRoot, 'src', 'lib', 'mcp', 'types.ts');
const packagePath = path.join(packageDirectory, 'package.json');
const repositoryPackagePath = path.join(repositoryRoot, 'package.json');
const reviewLockPath = path.join(packageDirectory, 'package-lock.json');
const installSmoke = process.argv.includes('--install-smoke');
const EXPECTED_LOCKED_PRODUCTION_PACKAGES = 21;
const EXPECTED_INSTALL_SCRIPT_PACKAGES = ['node_modules/node-pty'];

const expectedFiles = [
  'LICENSE',
  'NOTICE',
  'README.md',
  'bin/algoglyph-mcp-connector.js',
  'bin/algoglyph-mcp-connector.mjs',
  'bin/cli-runtime.mjs',
  'package.json',
];

const expectedDependencies = {
  '@modelcontextprotocol/client': '2.0.0',
  '@modelcontextprotocol/node': '2.0.0',
  '@modelcontextprotocol/server': '2.0.0',
  '@xterm/headless': '6.0.0',
  hono: '4.13.1',
  'node-pty': '1.2.0-beta.15',
  undici: '7.29.0',
};

const fail = (message) => {
  throw new Error(`Package release validation failed: ${message}`);
};

const parseJson = (source, label) => {
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`${label} is not valid JSON (${error instanceof Error ? error.message : String(error)}).`);
  }
};

const npmCliPath = async () => {
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next location.
    }
  }

  return null;
};

const runNpm = async (args, cwd) => {
  const npmCli = await npmCliPath();
  const command = npmCli ? process.execPath : 'npm';
  const commandArgs = npmCli ? [npmCli, ...args] : args;
  return execFileAsync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
};

const parsePackResult = (stdout) => {
  const result = parseJson(stdout, 'npm pack output');
  if (!Array.isArray(result) || result.length !== 1 || !Array.isArray(result[0]?.files)) {
    fail('npm pack returned an unexpected result shape.');
  }
  return result[0];
};

const packageNameFromLockPath = (lockPath) => {
  const matches = [...lockPath.matchAll(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/g)];
  return matches.at(-1)?.[1] || null;
};

const lockedProductionIdentities = (lock, excludedNames = new Set()) => [...new Set(
  Object.entries(lock.packages || {})
    .filter(([lockPath, entry]) => lockPath && entry?.dev !== true && typeof entry?.version === 'string')
    .map(([lockPath, entry]) => {
      const packageName = packageNameFromLockPath(lockPath);
      return packageName && !excludedNames.has(packageName)
        ? `${packageName}@${entry.version}`
        : null;
    })
    .filter(Boolean),
)].sort();

const readReleaseSources = async () => Promise.all(
  expectedFiles.map(async (relativePath) => [
    relativePath,
    await readFile(path.join(packageDirectory, relativePath), 'utf8'),
  ]),
);

const validateNoSecrets = (sources) => {
  const forbiddenPath = /(^|\/)(?:\.env(?:\.|$)|id_(?:rsa|ed25519)|credentials?|secrets?|.*\.(?:pem|p12|pfx|key))$/i;
  const secretPatterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/,
    /\bnpm_[A-Za-z0-9]{36,}\b/,
    /\/\/(?:[^\s/@:]+):(?:[^\s/@]+)@[^\s/]+/,
  ];

  for (const [relativePath, source] of sources) {
    if (forbiddenPath.test(relativePath.replaceAll('\\', '/'))) {
      fail(`secret-like path would be published: ${relativePath}`);
    }
    for (const pattern of secretPatterns) {
      if (pattern.test(source)) fail(`secret-like content detected in ${relativePath}`);
    }
  }
};

const extractRequiredMatch = (source, expression, label) => {
  const value = source.match(expression)?.[1];
  if (!value) fail(`could not read ${label}`);
  return value;
};

const reservePort = async () => {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') fail('could not reserve a loopback port');
  const { port } = address;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
};

const waitForHealth = async (endpoint, child, diagnostics) => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      fail(`installed connector exited with code ${child.exitCode}: ${diagnostics()}`);
    }
    try {
      const response = await fetch(`${endpoint}/health`, { signal: AbortSignal.timeout(750) });
      if (response.ok) return response.json();
    } catch {
      // The native dependency and connector may still be initializing.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fail(`installed connector did not become healthy within 30 seconds: ${diagnostics()}`);
};

const stopChild = async (child) => {
  if (child.exitCode !== null) return;
  if (process.platform === 'win32' && child.pid) {
    await execFileAsync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
      windowsHide: true,
    }).catch(() => child.kill('SIGTERM'));
  } else if (child.pid) {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
  } else {
    child.kill('SIGTERM');
  }
  await Promise.race([
    once(child, 'exit'),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  if (child.exitCode === null) {
    if (process.platform !== 'win32' && child.pid) {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        child.kill('SIGKILL');
      }
    } else {
      child.kill('SIGKILL');
    }
  }
};

const runInstallSmoke = async (manifest, protocolVersion, reviewedDependencyIdentities) => {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'algoglyph-mcp-release-'));
  let child = null;
  try {
    const packed = parsePackResult((await runNpm([
      'pack',
      '.',
      '--json',
      '--ignore-scripts',
      '--pack-destination',
      temporaryDirectory,
    ], packageDirectory)).stdout);
    const tarballPath = path.join(temporaryDirectory, packed.filename);
    const installDirectory = path.join(temporaryDirectory, 'install');
    await writeFile(path.join(temporaryDirectory, 'package.json'), JSON.stringify({
      name: 'algoglyph-mcp-release-smoke',
      private: true,
      version: '0.0.0',
    }, null, 2));

    await runNpm([
      'install',
      '--no-audit',
      '--no-fund',
      '--save-exact',
      '--prefix',
      installDirectory,
      tarballPath,
    ], temporaryDirectory);

    await runNpm([
      'audit',
      'signatures',
      '--prefix',
      installDirectory,
    ], temporaryDirectory);

    const audit = parseJson((await runNpm([
      'audit',
      '--omit=dev',
      '--json',
      '--prefix',
      installDirectory,
    ], temporaryDirectory)).stdout, 'isolated installed-package audit');
    if (audit.metadata?.vulnerabilities?.total !== 0) {
      fail(`isolated installed package has ${audit.metadata?.vulnerabilities?.total} known vulnerabilities`);
    }

    const installedPackageDirectory = path.join(
      installDirectory,
      'node_modules',
      '@algoglyph',
      'mcp-connector',
    );
    const installedManifest = parseJson(
      await readFile(path.join(installedPackageDirectory, 'package.json'), 'utf8'),
      'installed package manifest',
    );
    if (installedManifest.version !== manifest.version) fail('clean install changed the package version');

    const installedLock = parseJson(
      await readFile(path.join(installDirectory, 'package-lock.json'), 'utf8'),
      'clean-install package lock',
    );
    const installedDependencyIdentities = lockedProductionIdentities(
      installedLock,
      new Set([manifest.name]),
    );
    if (JSON.stringify(installedDependencyIdentities) !== JSON.stringify(reviewedDependencyIdentities)) {
      fail([
        'clean install resolved a dependency tree that differs from the reviewed source lock',
        `reviewed: ${reviewedDependencyIdentities.join(', ')}`,
        `installed: ${installedDependencyIdentities.join(', ')}`,
      ].join('; '));
    }

    const installedShimDirectory = path.join(installDirectory, 'node_modules', '.bin');
    const installedShim = path.join(
      installedShimDirectory,
      process.platform === 'win32' ? 'algoglyph-mcp-connector.cmd' : 'algoglyph-mcp-connector',
    );
    await access(installedShim);
    if (process.platform === 'win32') {
      await access(path.join(installedShimDirectory, 'algoglyph-mcp-connector.ps1'));
    }

    const installedEntry = path.join(
      installedPackageDirectory,
      installedManifest.bin?.['algoglyph-mcp-connector'] || '',
    );
    await access(installedEntry);

    const port = await reservePort();
    let childOutput = '';
    child = spawn(
      process.platform === 'win32' ? process.execPath : installedShim,
      process.platform === 'win32' ? [installedEntry] : [],
      {
      cwd: installDirectory,
      detached: process.platform !== 'win32',
      env: {
        ComSpec: process.env.ComSpec,
        SystemRoot: process.env.SystemRoot,
        WINDIR: process.env.WINDIR,
        PATH: [
          path.dirname(process.execPath),
          process.env.SystemRoot ? path.join(process.env.SystemRoot, 'System32') : null,
        ].filter(Boolean).join(path.delimiter),
        TEMP: temporaryDirectory,
        TMP: temporaryDirectory,
        HOME: temporaryDirectory,
        USERPROFILE: temporaryDirectory,
        NODE_ENV: 'test',
        ALGOGLYPH_CONNECTOR_PORT: String(port),
        ALGOGLYPH_CONNECTOR_TOKEN: 'release-smoke-token-is-local-ephemeral-and-at-least-32-bytes-long',
        ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE: path.join(
          testDirectory,
          'fixtures',
          'warmAntigravityAgent.mjs',
        ),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      },
    );
    const collectOutput = (chunk) => {
      childOutput = `${childOutput}${chunk.toString('utf8')}`.slice(-4_096);
    };
    child.stdout.on('data', collectOutput);
    child.stderr.on('data', collectOutput);
    const health = await waitForHealth(
      `http://127.0.0.1:${port}`,
      child,
      () => childOutput.trim() || 'no child output',
    );
    if (health.version !== manifest.version) fail('installed binary reports the wrong release version');
    if (health.protocolVersion !== protocolVersion) fail('installed binary reports the wrong protocol version');

    const origin = 'https://algoglyph.com';
    const jsonRequest = async (requestPath, body, token) => {
      const response = await fetch(`http://127.0.0.1:${port}/${requestPath}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Origin: origin,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      const payload = await response.json();
      if (!response.ok) fail(`installed connector ${requestPath} smoke failed (${response.status})`);
      return payload;
    };
    const pairing = await jsonRequest('v1/pairings', {});
    const session = await jsonRequest('v1/session', { pairingToken: pairing.pairingToken });
    const antigravityResponse = await fetch(`http://127.0.0.1:${port}/v1/agents/run`, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${session.sessionToken}`,
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify({
        agentId: 'antigravity',
        prompt: 'WARM_REQUEST_INSTALL_SMOKE',
        outputMode: 'buffered',
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const antigravityOutput = await antigravityResponse.text();
    if (!antigravityResponse.ok
      || !antigravityOutput.includes('WARM_REQUEST_INSTALL_SMOKE')
      || !antigravityOutput.includes('event: exit')) {
      fail(`installed native PTY smoke failed (${antigravityResponse.status}): ${antigravityOutput.slice(-1_024)}`);
    }
  } finally {
    if (child) await stopChild(child);
    await rm(temporaryDirectory, { force: true, maxRetries: 3, recursive: true });
  }
};

const main = async () => {
  const manifest = parseJson(await readFile(packagePath, 'utf8'), 'package manifest');
  const repositoryManifest = parseJson(
    await readFile(repositoryPackagePath, 'utf8'),
    'repository package manifest',
  );
  const reviewLock = parseJson(await readFile(reviewLockPath, 'utf8'), 'source review lock');
  const runtimeSource = await readFile(runtimePath, 'utf8');
  const packageBinShimSource = await readFile(packageBinShimPath, 'utf8');
  const repositoryShimSource = await readFile(repositoryShimPath, 'utf8');
  const browserTypesSource = await readFile(browserTypesPath, 'utf8');
  const dryRun = parsePackResult((await runNpm([
    'pack',
    '--dry-run',
    '--json',
    '--ignore-scripts',
  ], packageDirectory)).stdout);
  const packedFiles = dryRun.files.map(({ path: packedPath }) => packedPath).sort();

  if (JSON.stringify(packedFiles) !== JSON.stringify(expectedFiles)) {
    fail(`unexpected tarball inventory: ${packedFiles.join(', ')}`);
  }
  if (manifest.version !== '0.2.5') fail(`expected release candidate 0.2.5, found ${manifest.version}`);
  if (manifest.license !== 'Apache-2.0') fail(`expected Apache-2.0 license, found ${manifest.license}`);
  if (manifest.engines?.node !== '>=20.18.1') fail('Node engine floor must match undici 7.29.0');
  if (JSON.stringify(manifest.dependencies) !== JSON.stringify(expectedDependencies)) {
    fail('direct runtime dependencies are not exactly pinned to the reviewed versions');
  }
  if (
    reviewLock.name !== manifest.name
    || reviewLock.version !== manifest.version
    || reviewLock.lockfileVersion !== 3
    || reviewLock.packages?.['']?.license !== manifest.license
    || JSON.stringify(reviewLock.packages?.['']?.dependencies) !== JSON.stringify(expectedDependencies)
  ) {
    fail('source-only dependency review lock is missing or out of sync');
  }
  const lockedProductionPackages = Object.keys(reviewLock.packages || {})
    .filter((packagePath) => packagePath.length > 0).length;
  if (lockedProductionPackages !== EXPECTED_LOCKED_PRODUCTION_PACKAGES) {
    fail(`locked production tree changed from ${EXPECTED_LOCKED_PRODUCTION_PACKAGES} packages`);
  }
  const lockedEntries = Object.entries(reviewLock.packages || {})
    .filter(([packagePath]) => packagePath.length > 0);
  for (const [packagePath, lockedPackage] of lockedEntries) {
    if (!lockedPackage.integrity
      || !lockedPackage.resolved?.startsWith('https://registry.npmjs.org/')) {
      fail(`locked dependency is not integrity-pinned to the npm registry: ${packagePath}`);
    }
  }
  const installScriptPackages = lockedEntries
    .filter(([, lockedPackage]) => lockedPackage.hasInstallScript === true)
    .map(([packagePath]) => packagePath)
    .sort();
  if (JSON.stringify(installScriptPackages) !== JSON.stringify(EXPECTED_INSTALL_SCRIPT_PACKAGES)) {
    fail(`unexpected dependency install-script surface: ${installScriptPackages.join(', ')}`);
  }
  if (manifest.scripts && Object.keys(manifest.scripts).length > 0) {
    fail('the package must not define lifecycle or other npm scripts');
  }
  if (manifest.repository?.directory !== 'packages/mcp-connector' || !manifest.bugs?.url) {
    fail('repository or bug-reporting metadata is incomplete');
  }
  if (repositoryManifest.scripts?.['mcp:connector'] !== 'node scripts/algoglyph-mcp-connector.mjs') {
    fail('repository mcp:connector script does not use the reviewed development shim');
  }
  if (!/^#!\/usr\/bin\/env node\s+await import\('\.\/algoglyph-mcp-connector\.mjs'\);\s*$/s.test(packageBinShimSource)) {
    fail('NPX executable does not delegate directly to the reviewed connector runtime');
  }
  if (!/process\.env\.ALGOGLYPH_DEV_ORIGINS \|\|= '1';[\s\S]*?await import\('\.\.\/packages\/mcp-connector\/bin\/algoglyph-mcp-connector\.mjs'\);/.test(repositoryShimSource)) {
    fail('repository command does not delegate to the same reviewed connector runtime');
  }

  validateNoSecrets(await readReleaseSources());

  const runtimeVersion = extractRequiredMatch(
    runtimeSource,
    /const CONNECTOR_VERSION\s*=\s*['"]([^'"]+)['"]/,
    'runtime connector version',
  );
  const browserProtocol = Number(extractRequiredMatch(
    browserTypesSource,
    /MCP_CONNECTOR_PROTOCOL_VERSION\s*=\s*(\d+)/,
    'browser protocol version',
  ));
  const runtimeProtocolMatch = runtimeSource.match(/CONNECTOR_PROTOCOL_VERSION\s*=\s*(\d+)/);
  const runtimeProtocol = Number(runtimeProtocolMatch?.[1]);

  if (runtimeVersion !== manifest.version) fail('manifest and runtime connector versions differ');
  if (!Number.isInteger(runtimeProtocol)) fail('could not read runtime protocol version');
  if (!/protocolVersion:\s*CONNECTOR_PROTOCOL_VERSION\b/.test(runtimeSource)) {
    fail('runtime health must reference CONNECTOR_PROTOCOL_VERSION instead of a second literal');
  }
  const requiredSecurityInvariants = [
    ['Codex shell-tool denial', /features\.shell_tool=false/],
    ['Codex unified-exec denial', /features\.unified_exec=false/],
    ['Codex deny-root permission profile', /filesystem = \{ ":root" = "deny" \}/],
    ['Codex empty tool-child environment', /\[shell_environment_policy\][\s\S]*?inherit = "none"/],
    ['macOS Antigravity file-backed auth', /GEMINI_FORCE_FILE_STORAGE = 'true'[\s\S]*?environment\.TZ = 'UTC'/],
    ['awaitable warm shutdown', /if \(session\.stopPromise\) return session\.stopPromise/],
    ['bounded MCP transport close', /MCP_CLOSE_TIMEOUT_MS[\s\S]*?client\.close\(\)/],
    ['abort-bounded DNS resolution', /validateMcpDestination[\s\S]*?raceWithAbort/],
    ['monotonic security lifetimes', /expiresAtMonotonic[\s\S]*?monotonicMilliseconds/],
    ['monotonic rate limits', /timestamps\.push\(monotonicMilliseconds\(\)\)/],
    ['post-submission transcript boundary', /candidate\.createdAtMs >= submittedAtMs/],
    ['post-submission transcript byte boundary', /previousTranscript\.fileSnapshots/],
    ['connector-owned MCP relay', /\/internal\/mcp\/\$\{id\}/],
  ];
  for (const [label, expression] of requiredSecurityInvariants) {
    if (!expression.test(runtimeSource)) fail(`missing security invariant: ${label}`);
  }
  if (runtimeProtocol !== browserProtocol) fail('browser and runtime protocol versions differ');
  if (runtimeProtocol !== 2) fail(`release candidate must implement protocol v2, found v${runtimeProtocol}`);

  if (installSmoke) {
    await runInstallSmoke(
      manifest,
      runtimeProtocol,
      lockedProductionIdentities(reviewLock),
    );
  }

  console.log(
    `Validated @algoglyph/mcp-connector@${manifest.version}: ${packedFiles.length} files, protocol v${runtimeProtocol}`
      + (installSmoke ? ', clean install/signatures/audit, health, and native PTY smoke passed.' : '.'),
  );
};

await main();
