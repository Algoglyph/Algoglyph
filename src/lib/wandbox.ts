// Thin client for the public Wandbox code-execution API (https://wandbox.org).
// Used by the Code editor to compile + run DSA snippets in many languages
// without a local toolchain.
//
// NOTE: this sends the user's code to a third-party service (wandbox.org) over
// the network. It is the only part of the app that is not offline/local-first.

const WANDBOX_BASE = 'https://wandbox.org/api';

interface WandboxCompiler {
  name: string;
  language: string;
}

export interface RunResult {
  compiler: string; // the compiler name actually used
  status: string; // "0" on success, otherwise an exit/error code
  compilerMessage: string; // compiler stdout+stderr (warnings / errors)
  programMessage: string; // program stdout+stderr, interleaved
  signal?: string;
}

let compilersCache: WandboxCompiler[] | null = null;

async function getCompilers(): Promise<WandboxCompiler[]> {
  if (compilersCache) return compilersCache;
  const res = await fetch(`${WANDBOX_BASE}/list.json`);
  if (!res.ok) throw new Error(`Could not reach the code runner (${res.status})`);
  compilersCache = (await res.json()) as WandboxCompiler[];
  return compilersCache;
}

export interface RunCodeArgs {
  wandboxLanguage: string; // Wandbox "language" field, e.g. "C++", "Java", "Python"
  preferPattern?: string; // regex to prefer a specific compiler (e.g. avoid Python 2)
  code: string;
  stdin?: string;
}

export async function runCode({ wandboxLanguage, preferPattern, code, stdin }: RunCodeArgs): Promise<RunResult> {
  const compilers = await getCompilers();
  const candidates = compilers.filter((c) => c.language === wandboxLanguage);
  if (candidates.length === 0) {
    throw new Error(`"${wandboxLanguage}" is not available on the runner`);
  }
  const preferred = preferPattern
    ? candidates.find((c) => new RegExp(preferPattern).test(c.name))
    : undefined;
  const compiler = preferred ?? candidates[0];

  const res = await fetch(`${WANDBOX_BASE}/compile.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler: compiler.name, code, stdin: stdin ?? '' }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Runner error ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  return {
    compiler: compiler.name,
    status: String(data.status ?? ''),
    compilerMessage: data.compiler_message ?? '',
    programMessage: data.program_message ?? data.program_output ?? '',
    signal: data.signal,
  };
}
