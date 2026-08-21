import { constants as fsConstants } from 'node:fs';
import { access, open, readFile, realpath, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { posix, win32 } from 'node:path';

const MAX_WINDOWS_SHIM_BYTES = 16 * 1024;
const MAX_SHEBANG_BYTES = 512;
const pathApi = (platform) => platform === 'win32' ? win32 : posix;

const normalizedPath = (value, platform) => platform === 'win32' ? value.toLowerCase() : value;

const isContainedPath = (candidate, root, platform) => {
  const normalizedCandidate = normalizedPath(candidate, platform);
  const normalizedRoot = normalizedPath(root, platform);
  return normalizedCandidate === normalizedRoot
    || normalizedCandidate.startsWith(`${normalizedRoot}${pathApi(platform).sep}`);
};

const uniqueDirectories = (directories, platform) => {
  const seen = new Set();
  const unique = [];
  for (const directory of directories) {
    if (!directory) continue;
    const trimmed = String(directory).trim();
    const unquoted = trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
    if (!pathApi(platform).isAbsolute(unquoted)) continue;
    const absolute = pathApi(platform).resolve(unquoted);
    const key = normalizedPath(absolute, platform);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(absolute);
  }
  return unique;
};

const readFilePrefix = async (path, byteLimit) => {
  const handle = await open(path, 'r');
  try {
    const buffer = Buffer.alloc(byteLimit);
    const { bytesRead } = await handle.read(buffer, 0, byteLimit, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
};

const DEFAULT_FILE_SYSTEM = Object.freeze({ access, readFile, readFilePrefix, realpath, stat });

const environmentDirectoryHints = ({ platform, environment, homeDirectory }) => {
  const paths = pathApi(platform);
  const direct = [
    environment.NVM_BIN,
    environment.PNPM_HOME,
    environment.FNM_MULTISHELL_PATH,
  ];
  const rooted = [
    environment.VOLTA_HOME && paths.join(environment.VOLTA_HOME, 'bin'),
    environment.BUN_INSTALL && paths.join(environment.BUN_INSTALL, 'bin'),
    environment.ASDF_DATA_DIR && paths.join(environment.ASDF_DATA_DIR, 'shims'),
    environment.MISE_DATA_DIR && paths.join(environment.MISE_DATA_DIR, 'shims'),
  ];
  const npmPrefix = environment.NPM_CONFIG_PREFIX || environment.npm_config_prefix;
  if (npmPrefix) rooted.push(platform === 'win32' ? npmPrefix : paths.join(npmPrefix, 'bin'));

  if (platform === 'win32') {
    const appData = environment.APPDATA || (homeDirectory && paths.join(homeDirectory, 'AppData', 'Roaming'));
    const localAppData = environment.LOCALAPPDATA
      || (homeDirectory && paths.join(homeDirectory, 'AppData', 'Local'));
    rooted.push(
      appData && paths.join(appData, 'npm'),
      localAppData && paths.join(localAppData, 'agy', 'bin'),
      localAppData && paths.join(localAppData, 'pnpm'),
      homeDirectory && paths.join(homeDirectory, '.volta', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.bun', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.local', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.local', 'share', 'pnpm'),
      homeDirectory && paths.join(homeDirectory, 'scoop', 'shims'),
    );
  } else if (platform === 'darwin') {
    rooted.push(
      '/opt/homebrew/bin',
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      homeDirectory && paths.join(homeDirectory, '.local', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.npm-global', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.volta', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.bun', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.asdf', 'shims'),
      homeDirectory && paths.join(homeDirectory, '.local', 'share', 'pnpm'),
      homeDirectory && paths.join(homeDirectory, 'Library', 'pnpm'),
    );
  }
  return [...direct, ...rooted];
};

export const executableSearchDirectories = ({
  platform = process.platform,
  pathValue = process.env.PATH || '',
  nodeExecutable = process.execPath,
  homeDirectory = homedir(),
  environment = process.env,
} = {}) => {
  const pathDelimiter = platform === 'win32' ? ';' : ':';
  const directories = pathValue.split(pathDelimiter).filter(Boolean);
  const paths = pathApi(platform);
  directories.push(paths.dirname(nodeExecutable));
  // GUI-launched desktop processes commonly receive a reduced PATH. Use only
  // explicit package-manager hints and well-known per-user bin roots; never
  // invoke a login shell or recursively scan a home directory.
  directories.push(...environmentDirectoryHints({ platform, environment, homeDirectory }));
  return uniqueDirectories(directories, platform);
};

export const buildExecutableCandidates = (command, {
  platform = process.platform,
  pathValue = process.env.PATH || '',
  pathExtValue = process.env.PATHEXT || '.COM;.EXE;.CMD;.BAT',
  nodeExecutable = process.execPath,
  homeDirectory = homedir(),
  environment = process.env,
} = {}) => {
  const paths = pathApi(platform);
  if (paths.isAbsolute(command)) return [command];
  const extensions = platform === 'win32'
    ? [...new Set([
      ...pathExtValue.split(';').map((extension) => extension.trim().toUpperCase()),
      '.EXE', '.COM', '.CMD',
    ].filter((extension) => ['.EXE', '.COM', '.CMD'].includes(extension)))]
    : [''];
  const candidates = [];
  for (const directory of executableSearchDirectories({
    platform, pathValue, nodeExecutable, homeDirectory, environment,
  })) {
    for (const extension of extensions) candidates.push(paths.join(directory, `${command}${extension}`));
  }
  return candidates;
};

const isTrustedDiscoveryCandidate = (candidate, trustedDirectories, platform) => {
  const paths = pathApi(platform);
  const candidateDirectory = normalizedPath(paths.dirname(paths.resolve(candidate)), platform);
  return trustedDirectories.some(
    (directory) => normalizedPath(paths.resolve(directory), platform) === candidateDirectory,
  );
};

const isUntrustedImplicitCandidate = (
  candidate,
  projectDirectory,
  platform,
  allowProjectRoot = false,
) => {
  const paths = pathApi(platform);
  const normalized = normalizedPath(paths.resolve(candidate), platform);
  const projectRoot = `${normalizedPath(paths.resolve(projectDirectory), platform)}${paths.sep}`;
  const dependencyBin = `${paths.sep}node_modules${paths.sep}.bin${paths.sep}`;
  return normalized.includes(dependencyBin) || (!allowProjectRoot && normalized.startsWith(projectRoot));
};

const resolveTrustedNodeExecutable = async (nodeExecutable, platform, fileSystem) => {
  const paths = pathApi(platform);
  if (!paths.isAbsolute(nodeExecutable)) return undefined;
  const absolute = await fileSystem.realpath(nodeExecutable);
  const metadata = await fileSystem.stat(absolute);
  if (!metadata.isFile()) return undefined;
  if (platform === 'win32') {
    const extension = paths.extname(absolute).toLowerCase();
    if (!['.exe', '.com'].includes(extension)) return undefined;
  } else {
    await fileSystem.access(absolute, fsConstants.X_OK);
  }
  return absolute;
};

const resolveWindowsNodeShimPath = (value, shimDirectory) => {
  const prefix = value.match(/^(?:%~dp0|%dp0%)/i)?.[0];
  if (!prefix) return undefined;
  const suffix = value.slice(prefix.length).replace(/^[\\/]+/, '');
  if (!suffix || suffix.includes('%')) return undefined;
  return win32.resolve(shimDirectory, suffix.replace(/[\\/]+/g, win32.sep));
};

const resolveWindowsNpmNodeShim = async ({
  shimPath,
  nodeExecutable,
  fileSystem,
  configured,
  projectDirectory,
  allowProjectRoot,
}) => {
  const metadata = await fileSystem.stat(shimPath);
  if (!metadata.isFile() || metadata.size > MAX_WINDOWS_SHIM_BYTES) return undefined;
  const source = await fileSystem.readFile(shimPath, 'utf8');
  const npmTemplate = /CALL\s+:find_dp0/i.test(source) && /SET\s+"_prog=.*node(?:\.exe)?"/i.test(source);
  const directNodeTemplate = /^\s*"?%~dp0[^\r\n"]*node(?:\.exe)?"?\s+/im.test(source);
  if (!npmTemplate && !directNodeTemplate) return undefined;

  const entryMatches = [...source.matchAll(/"(%(?:~)?dp0%?[^"\r\n]+?\.(?:cjs|mjs|js))"\s+%\*/gi)];
  if (entryMatches.length !== 1) return undefined;
  const shimDirectory = win32.dirname(shimPath);
  const lexicalEntry = resolveWindowsNodeShimPath(entryMatches[0][1], shimDirectory);
  if (!lexicalEntry) return undefined;
  // npm's standard wrapper keeps its entry point below the shim directory.
  // Other package managers may place a shell-free Node wrapper beside a
  // relative global-store entry; accept that only after the same project/.bin
  // rejection used for executable candidates.
  if (npmTemplate && !isContainedPath(lexicalEntry, shimDirectory, 'win32')) return undefined;
  if (!configured && isUntrustedImplicitCandidate(
    lexicalEntry,
    projectDirectory,
    'win32',
    allowProjectRoot,
  )) return undefined;

  const entryPath = await fileSystem.realpath(lexicalEntry);
  const entryMetadata = await fileSystem.stat(entryPath);
  if (!entryMetadata.isFile()) return undefined;
  if (npmTemplate && !isContainedPath(entryPath, shimDirectory, 'win32')) return undefined;
  if (!configured && isUntrustedImplicitCandidate(
    entryPath,
    projectDirectory,
    'win32',
    allowProjectRoot,
  )) return undefined;
  return {
    command: nodeExecutable,
    argsPrefix: [entryPath],
    resolvedPath: shimPath,
    kind: npmTemplate ? 'npm-node-shim' : 'node-command-shim',
    pathEntries: uniqueDirectories([win32.dirname(nodeExecutable), shimDirectory], 'win32'),
  };
};

const NODE_SHEBANG_PATTERN = /^#!\s*(?:\/usr\/bin\/env(?:\s+-S)?\s+node|\/[^\s]*\/node)(?:\s|$)/;

const resolvePosixInvocation = async ({ candidate, absolute, nodeExecutable, fileSystem, platform }) => {
  await fileSystem.access(absolute, fsConstants.X_OK);
  const prefix = (await fileSystem.readFilePrefix(absolute, MAX_SHEBANG_BYTES)).toString('utf8');
  if (!prefix.startsWith('#!')) {
    return {
      command: absolute,
      argsPrefix: [],
      resolvedPath: absolute,
      kind: 'native',
      pathEntries: uniqueDirectories([
        posix.dirname(absolute), posix.dirname(nodeExecutable), posix.dirname(candidate),
      ], platform),
    };
  }
  if (!NODE_SHEBANG_PATTERN.test(prefix)) return undefined;
  return {
    command: nodeExecutable,
    argsPrefix: [absolute],
    resolvedPath: absolute,
    kind: 'node-script',
    pathEntries: uniqueDirectories([
      posix.dirname(nodeExecutable), posix.dirname(candidate), posix.dirname(absolute),
    ], platform),
  };
};

export const resolveCliInvocations = async ({
  command,
  configuredPath,
  platform = process.platform,
  pathValue = process.env.PATH || '',
  pathExtValue = process.env.PATHEXT || '.COM;.EXE;.CMD;.BAT',
  nodeExecutable = process.execPath,
  homeDirectory = homedir(),
  projectDirectory = process.cwd(),
  environment = process.env,
  fileSystem = DEFAULT_FILE_SYSTEM,
}) => {
  const paths = pathApi(platform);
  if (configuredPath && !paths.isAbsolute(configuredPath)) {
    throw new Error('Configured CLI paths must be absolute.');
  }
  const candidates = configuredPath
    ? [configuredPath]
    : buildExecutableCandidates(command, {
      platform,
      pathValue,
      pathExtValue,
      nodeExecutable,
      homeDirectory,
      environment,
    });

  let trustedNode;
  try {
    trustedNode = await resolveTrustedNodeExecutable(nodeExecutable, platform, fileSystem);
  } catch {
    return [];
  }
  if (!trustedNode) return [];

  // A connector launched from the user's home directory must still be able to
  // use CLIs installed in the explicit package-manager and per-user locations
  // above. Preserve the project-shadowing guard for arbitrary PATH entries and
  // always reject node_modules/.bin, but trust candidates found directly in a
  // recognized installation root even when that root sits below process.cwd().
  const trustedDiscoveryDirectories = uniqueDirectories([
    paths.dirname(nodeExecutable),
    ...environmentDirectoryHints({ platform, environment, homeDirectory }),
  ], platform);
  const invocations = [];
  const seenInvocations = new Set();
  for (const candidate of candidates) {
    try {
      const allowProjectRoot = !configuredPath
        && isTrustedDiscoveryCandidate(candidate, trustedDiscoveryDirectories, platform);
      if (!configuredPath && isUntrustedImplicitCandidate(
        candidate,
        projectDirectory,
        platform,
        allowProjectRoot,
      )) continue;
      const absolute = await fileSystem.realpath(paths.resolve(candidate));
      const metadata = await fileSystem.stat(absolute);
      if (!metadata.isFile()) continue;
      if (!configuredPath && isUntrustedImplicitCandidate(
        absolute,
        projectDirectory,
        platform,
        allowProjectRoot,
      )) continue;

      if (platform === 'win32') {
        const extension = absolute.slice(absolute.lastIndexOf('.')).toLowerCase();
        if (extension === '.cmd') {
          const shimInvocation = await resolveWindowsNpmNodeShim({
            shimPath: absolute,
            nodeExecutable: trustedNode,
            fileSystem,
            configured: Boolean(configuredPath),
            projectDirectory,
            allowProjectRoot,
          });
          if (shimInvocation) {
            const key = `${shimInvocation.command}\0${shimInvocation.argsPrefix.join('\0')}`;
            if (!seenInvocations.has(key)) {
              seenInvocations.add(key);
              invocations.push(shimInvocation);
            }
          }
          continue;
        }
        if (!['.exe', '.com'].includes(extension)) continue;
      } else {
        const invocation = await resolvePosixInvocation({
          candidate: paths.resolve(candidate),
          absolute,
          nodeExecutable: trustedNode,
          fileSystem,
          platform,
        });
        if (invocation) {
          const key = `${invocation.command}\0${invocation.argsPrefix.join('\0')}`;
          if (!seenInvocations.has(key)) {
            seenInvocations.add(key);
            invocations.push(invocation);
          }
        }
        continue;
      }

      const invocation = {
        command: absolute,
        argsPrefix: [],
        resolvedPath: absolute,
        kind: 'native',
        pathEntries: uniqueDirectories([paths.dirname(absolute), paths.dirname(trustedNode)], platform),
      };
      const key = `${invocation.command}\0${invocation.argsPrefix.join('\0')}`;
      if (!seenInvocations.has(key)) {
        seenInvocations.add(key);
        invocations.push(invocation);
      }
    } catch {
      // Missing, non-executable, or unsupported candidates are not available.
    }
  }
  return invocations;
};

export const resolveCliInvocation = async (options) => (await resolveCliInvocations(options))[0];

export const invocationArgs = (invocation, args) => [...invocation.argsPrefix, ...args];

export const invocationPath = (invocation, {
  platform = process.platform,
  systemRoot = process.env.SystemRoot,
} = {}) => uniqueDirectories([
  ...invocation.pathEntries,
  platform === 'win32' && systemRoot ? win32.join(systemRoot, 'System32') : undefined,
  platform !== 'win32' ? '/usr/bin' : undefined,
  platform !== 'win32' ? '/bin' : undefined,
], platform).join(platform === 'win32' ? ';' : ':');
