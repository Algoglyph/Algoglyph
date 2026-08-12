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
const browserTypesPath = path.join(repositoryRoot, 'src', 'lib', 'mcp', 'types.ts');
const packagePath = path.join(packageDirectory, 'package.json');
const shrinkwrapPath = path.join(packageDirectory, 'npm-shrinkwrap.json');
const installSmoke = process.argv.includes('--install-smoke');

const expectedFiles = [
  'README.md',
  'bin/algoglyph-mcp-connector.js',
  'bin/algoglyph-mcp-connector.mjs',
  'npm-shrinkwrap.json',
  'package.json',
];

const expectedDependencies = {
  '@modelcontextprotocol/sdk': '1.30.0',
  '@xterm/headless': '6.0.0',
  'node-pty': '1.1.0',
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
  fail(`installed connector did not become healthy within 15 seconds: ${diagnostics()}`);
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

const runInstallSmoke = async (manifest, protocolVersion) => {
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

    const installedShimDirectory = path.join(installDirectory, 'node_modules', '.bin');
    const installedShim = path.join(
      installedShimDirectory,
      process.platform === 'win32' ? 'algoglyph-mcp-connector.cmd' : 'algoglyph-mcp-connector',
    );
    await access(installedShim);
    if (process.platform === 'win32') {
      await access(path.join(installedShimDirectory, 'algoglyph-mcp-connector.ps1'));
    }

    const port = await reservePort();
    const npmCli = await npmCliPath();
    if (!npmCli) fail('could not locate npm to exercise the installed package executable');
    let childOutput = '';
    child = spawn(process.execPath, [
      npmCli,
      'exec',
      '--offline',
      '--',
      'algoglyph-mcp-connector',
    ], {
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
        ALGOGLYPH_CONNECTOR_PORT: String(port),
        ALGOGLYPH_CONNECTOR_TOKEN: 'release-smoke-token-is-local-ephemeral-and-at-least-32-bytes-long',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
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
  } finally {
    if (child) await stopChild(child);
    await rm(temporaryDirectory, { force: true, maxRetries: 3, recursive: true });
  }
};

const main = async () => {
  const manifest = parseJson(await readFile(packagePath, 'utf8'), 'package manifest');
  const shrinkwrap = parseJson(await readFile(shrinkwrapPath, 'utf8'), 'package shrinkwrap');
  const runtimeSource = await readFile(runtimePath, 'utf8');
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
  if (manifest.version !== '0.2.0') fail(`expected release candidate 0.2.0, found ${manifest.version}`);
  if (manifest.engines?.node !== '>=20.18.1') fail('Node engine floor must match undici 7.29.0');
  if (JSON.stringify(manifest.dependencies) !== JSON.stringify(expectedDependencies)) {
    fail('direct runtime dependencies are not exactly pinned to the reviewed versions');
  }
  if (
    shrinkwrap.name !== manifest.name
    || shrinkwrap.version !== manifest.version
    || shrinkwrap.lockfileVersion !== 3
    || JSON.stringify(shrinkwrap.packages?.['']?.dependencies) !== JSON.stringify(expectedDependencies)
  ) {
    fail('publishable transitive dependency lock is missing or out of sync');
  }
  if (manifest.scripts && Object.keys(manifest.scripts).length > 0) {
    fail('the package must not define lifecycle or other npm scripts');
  }
  if (manifest.repository?.directory !== 'packages/mcp-connector' || !manifest.bugs?.url) {
    fail('repository or bug-reporting metadata is incomplete');
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
    ['awaitable warm shutdown', /if \(session\.stopPromise\) return session\.stopPromise/],
    ['post-submission transcript boundary', /candidate\.createdAtMs >= submittedAtMs/],
    ['connector-owned MCP relay', /\/internal\/mcp\/\$\{id\}/],
  ];
  for (const [label, expression] of requiredSecurityInvariants) {
    if (!expression.test(runtimeSource)) fail(`missing security invariant: ${label}`);
  }
  if (runtimeProtocol !== browserProtocol) fail('browser and runtime protocol versions differ');
  if (runtimeProtocol !== 2) fail(`release candidate must implement protocol v2, found v${runtimeProtocol}`);

  if (installSmoke) await runInstallSmoke(manifest, runtimeProtocol);

  console.log(
    `Validated @algoglyph/mcp-connector@${manifest.version}: ${packedFiles.length} files, protocol v${runtimeProtocol}`
      + (installSmoke ? ', clean install/audit and health smoke passed.' : '.'),
  );
};

await main();
