import { constants as fsConstants } from 'node:fs';
import { access, readFile, realpath, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { posix, win32 } from 'node:path';

const MAX_WINDOWS_SHIM_BYTES = 16 * 1024;
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
  return directories.filter((directory) => {
    if (!directory) return false;
    const absolute = pathApi(platform).resolve(directory);
    const key = normalizedPath(absolute, platform);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const executableSearchDirectories = ({
  platform = process.platform,
  pathValue = process.env.PATH || '',
  nodeExecutable = process.execPath,
  homeDirectory = homedir(),
} = {}) => {
  const pathDelimiter = platform === 'win32' ? ';' : ':';
  const directories = pathValue.split(pathDelimiter).filter(Boolean);
  const paths = pathApi(platform);
  directories.push(paths.dirname(nodeExecutable));
  if (platform === 'darwin') {
    // GUI-launched processes often receive a reduced PATH. These are fixed
    // executable locations, not login-shell execution or directory scans.
    directories.push(
      '/opt/homebrew/bin',
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      homeDirectory && paths.join(homeDirectory, '.local', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.npm-global', 'bin'),
      homeDirectory && paths.join(homeDirectory, '.volta', 'bin'),
    );
  }
  return uniqueDirectories(directories, platform);
};

export const buildExecutableCandidates = (command, {
  platform = process.platform,
  pathValue = process.env.PATH || '',
  pathExtValue = process.env.PATHEXT || '.COM;.EXE;.CMD;.BAT',
  nodeExecutable = process.execPath,
  homeDirectory = homedir(),
} = {}) => {
  const paths = pathApi(platform);
  if (paths.isAbsolute(command)) return [command];
  const extensions = platform === 'win32'
    ? pathExtValue.split(';').map((extension) => extension.trim()).filter(Boolean)
    : [''];
  const candidates = [];
  for (const directory of executableSearchDirectories({ platform, pathValue, nodeExecutable, homeDirectory })) {
    for (const extension of extensions) candidates.push(paths.join(directory, `${command}${extension}`));
  }
  return candidates;
};

const isUntrustedImplicitCandidate = (candidate, projectDirectory, platform) => {
  const paths = pathApi(platform);
  const normalized = normalizedPath(paths.resolve(candidate), platform);
  const projectRoot = `${normalizedPath(paths.resolve(projectDirectory), platform)}${paths.sep}`;
  const dependencyBin = `${paths.sep}node_modules${paths.sep}.bin${paths.sep}`;
  return normalized.startsWith(projectRoot) || normalized.includes(dependencyBin);
};

const resolveWindowsNpmNodeShim = async (shimPath, nodeExecutable) => {
  const metadata = await stat(shimPath);
  if (!metadata.isFile() || metadata.size > MAX_WINDOWS_SHIM_BYTES) return undefined;
  const source = await readFile(shimPath, 'utf8');
  if (!/CALL\s+:find_dp0/i.test(source) || !/SET\s+"_prog=.*node(?:\.exe)?"/i.test(source)) return undefined;

  const entryMatches = [...source.matchAll(/"%dp0%[\\/]+([^"\r\n]+?\.(?:cjs|mjs|js))"\s+%\*/gi)];
  if (entryMatches.length !== 1) return undefined;
  const shimDirectory = win32.dirname(shimPath);
  const lexicalEntry = win32.resolve(shimDirectory, entryMatches[0][1].replace(/[\\/]+/g, win32.sep));
  if (!isContainedPath(lexicalEntry, shimDirectory, 'win32')) return undefined;

  const entryPath = await realpath(lexicalEntry);
  const entryMetadata = await stat(entryPath);
  if (!entryMetadata.isFile() || !isContainedPath(entryPath, shimDirectory, 'win32')) return undefined;
  return {
    command: nodeExecutable,
    argsPrefix: [entryPath],
    resolvedPath: shimPath,
    kind: 'npm-node-shim',
    pathEntries: uniqueDirectories([shimDirectory, win32.dirname(nodeExecutable)], 'win32'),
  };
};

export const resolveCliInvocation = async ({
  command,
  configuredPath,
  platform = process.platform,
  pathValue = process.env.PATH || '',
  pathExtValue = process.env.PATHEXT || '.COM;.EXE;.CMD;.BAT',
  nodeExecutable = process.execPath,
  homeDirectory = homedir(),
  projectDirectory = process.cwd(),
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
    });

  for (const candidate of candidates) {
    try {
      if (!configuredPath && isUntrustedImplicitCandidate(candidate, projectDirectory, platform)) continue;
      const absolute = await realpath(paths.resolve(candidate));
      const metadata = await stat(absolute);
      if (!metadata.isFile()) continue;
      if (!configuredPath && isUntrustedImplicitCandidate(absolute, projectDirectory, platform)) continue;

      if (platform === 'win32') {
        const extension = absolute.slice(absolute.lastIndexOf('.')).toLowerCase();
        if (extension === '.cmd') {
          const shimInvocation = await resolveWindowsNpmNodeShim(absolute, nodeExecutable);
          if (shimInvocation) return shimInvocation;
          continue;
        }
        if (!['.exe', '.com'].includes(extension)) continue;
      } else {
        await access(absolute, fsConstants.X_OK);
      }

      return {
        command: absolute,
        argsPrefix: [],
        resolvedPath: absolute,
        kind: 'native',
        pathEntries: uniqueDirectories([paths.dirname(absolute), paths.dirname(nodeExecutable)], platform),
      };
    } catch {
      // Missing, non-executable, or unsupported candidates are not available.
    }
  }
  return undefined;
};

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
