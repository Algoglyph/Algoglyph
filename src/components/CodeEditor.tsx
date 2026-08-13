import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { Play, RotateCcw, ChevronUp, ChevronDown, Trash2, Globe } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { LANGUAGES, getLanguage } from '../config/languages';
import { vscodeDark, vscodeLight } from '../config/editorTheme';
import { runCode } from '../lib/wandbox';
import type { RunResult } from '../lib/wandbox';
import { LoadingSpinner } from './LoadingSpinner';

export const CodeEditor: React.FC = () => {
  const code = useWorkspaceStore((state) => state.code);
  const codeLanguage = useWorkspaceStore((state) => state.codeLanguage);
  const updateCode = useWorkspaceStore((state) => state.updateCode);
  const setCodeLanguage = useWorkspaceStore((state) => state.setCodeLanguage);
  const theme = useWorkspaceStore((state) => state.theme);

  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lang = getLanguage(codeLanguage);

  // Tracks the last template we auto-inserted, so we can tell an untouched
  // template apart from code the user actually wrote.
  const lastStarterRef = useRef('');

  // Load the language's starter when the buffer is empty or still holds an
  // untouched template — but never clobber code the user has edited.
  useEffect(() => {
    const starter = getLanguage(codeLanguage).starter;
    const current = useWorkspaceStore.getState().code;
    if (!current.trim() || current === lastStarterRef.current) {
      lastStarterRef.current = starter;
      updateCode(starter);
    }
    // Only when the language changes (and on mount); not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeLanguage]);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await runCode({
        wandboxLanguage: lang.wandboxLanguage,
        preferPattern: lang.preferPattern,
        code,
        stdin,
      });
      setResult(res);
    } catch (e: any) {
      setError(e?.message || 'Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const resetTemplate = () => {
    lastStarterRef.current = lang.starter;
    updateCode(lang.starter);
  };
  const clearOutput = () => {
    setResult(null);
    setError(null);
  };

  // Assemble the console text from compiler + program output.
  const compileErr = result?.compilerMessage?.trim();
  const runOut = result?.programMessage ?? '';
  const exitCode = result && result.status !== '' ? Number(result.status) : null;

  return (
    <div className={`flex flex-col h-full w-full select-text ${theme === 'dark' ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-50 text-zinc-800'}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between gap-2 px-3 py-1.5 border-b select-none ${theme === 'dark' ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <select
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            className={`rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-emerald-500/60 cursor-pointer ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800 text-zinc-200' : 'bg-white border border-zinc-200 text-zinc-800'}`}
            title="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors cursor-pointer shadow-sm shadow-emerald-900/40"
            title="Run (sends code to the Wandbox runner)"
          >
            {running ? <LoadingSpinner size={13} inverted /> : <Play size={13} />}
            {running ? 'Running…' : 'Run'}
          </button>

          <button
            onClick={resetTemplate}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200'}`}
            title="Reset to template"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        <div className={`flex items-center gap-1.5 text-[10px] font-mono ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}`} title="Code runs on the public Wandbox API (requires internet)">
          <Globe size={11} />
          <span className="hidden sm:inline">runs online via Wandbox</span>
        </div>
      </div>

      {/* Code editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          theme={theme === 'dark' ? vscodeDark : vscodeLight}
          extensions={[lang.cm()]}
          onChange={(value) => updateCode(value)}
          basicSetup={{ lineNumbers: true, highlightActiveLine: true, autocompletion: true }}
          style={{ height: '100%', fontSize: 13 }}
        />
      </div>

      {/* stdin (collapsible) */}
      <div className={`border-t select-none ${theme === 'dark' ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-100/50'}`}>
        <button
          onClick={() => setShowStdin((s) => !s)}
          className={`flex items-center gap-1 px-3 py-1 text-[10px] font-mono uppercase tracking-wide cursor-pointer ${theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          {showStdin ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
          Input (stdin)
        </button>
        {showStdin && (
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Standard input passed to your program…"
            className={`w-full h-20 border-t px-3 py-2 text-xs font-mono resize-none focus:outline-none select-text ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-800 placeholder-zinc-400'}`}
          />
        )}
      </div>

      {/* Output console */}
      <div className={`h-[30%] min-h-[120px] flex flex-col border-t ${theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
        <div className={`flex items-center justify-between px-3 py-1 border-b select-none ${theme === 'dark' ? 'border-zinc-900 bg-zinc-950' : 'border-zinc-200 bg-zinc-100'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-500">Output</span>
            {exitCode !== undefined && exitCode !== null && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  exitCode === 0
                    ? 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30'
                    : 'text-rose-400 border-rose-900/50 bg-rose-950/30'
                }`}
              >
                exit {exitCode}
              </span>
            )}
            {result && (
              <span className="text-[9px] text-zinc-600 font-mono truncate max-w-[160px]">
                {result.compiler}
              </span>
            )}
          </div>
          <button
            onClick={clearOutput}
            className={`p-1 rounded cursor-pointer ${theme === 'dark' ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200'}`}
            title="Clear output"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-3 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {running ? (
            <span className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}>Running on the remote runner…</span>
          ) : error ? (
            <span className="text-rose-400">{error}</span>
          ) : result ? (
            <>
              {compileErr && <div className="text-amber-500 mb-2">{compileErr}</div>}
              {runOut ? (
                <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}>{runOut}</span>
              ) : (
                !compileErr && <span className={theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}>(no output)</span>
              )}
            </>
          ) : (
            <span className={theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}>Run your code to see the output here.</span>
          )}
        </div>
      </div>
    </div>
  );
};
