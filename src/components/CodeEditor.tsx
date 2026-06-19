import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { Play, Loader2, RotateCcw, ChevronUp, ChevronDown, Globe, Search, Plus, X } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { LANGUAGES, getLanguage } from '../config/languages';
import { runCode } from '../lib/wandbox';
import type { TestCase } from '../db/indexedDB';
import leetcodeData from '../data/leetcode-top100.json';

export const CodeEditor: React.FC = () => {
  const code = useWorkspaceStore((state) => state.code);
  const codeLanguage = useWorkspaceStore((state) => state.codeLanguage);
  const testCases = useWorkspaceStore((state) => state.testCases || []);
  const updateCode = useWorkspaceStore((state) => state.updateCode);
  const setCodeLanguage = useWorkspaceStore((state) => state.setCodeLanguage);
  const openSearchPalette = useWorkspaceStore((state) => state.openSearchPalette);
  const updateTestCases = useWorkspaceStore((state) => state.updateActiveWorkspaceTestCases);
  const problemMeta = useWorkspaceStore((state) => state.problemMeta);

  const [running, setRunning] = useState(false);
  const [activeTestCaseId, setActiveTestCaseId] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [suiteResults, setSuiteResults] = useState<Record<string, {
    status: 'passed' | 'failed' | 'error' | 'running';
    actualOutput: string;
    compileErr?: string;
    runtimeStat?: string;
    duration?: number;
  }>>({});

  const lang = getLanguage(codeLanguage);
  const lastStarterRef = useRef('');

  // Setup initial active test case
  useEffect(() => {
    if (testCases.length > 0 && (!activeTestCaseId || !testCases.some(t => t.id === activeTestCaseId))) {
      setActiveTestCaseId(testCases[0].id);
    }
  }, [testCases, activeTestCaseId]);

  // Load the language's starter when empty
  useEffect(() => {
    const starter = getLanguage(codeLanguage).starter;
    const current = useWorkspaceStore.getState().code;
    if (!current.trim() || current === lastStarterRef.current) {
      lastStarterRef.current = starter;
      updateCode(starter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeLanguage]);

  // Add custom test case
  const handleAddTestCase = () => {
    const newCase: TestCase = {
      id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      input: '',
      expectedOutput: '',
      isCustom: true
    };
    const updated = [...testCases, newCase];
    updateTestCases(updated);
    setActiveTestCaseId(newCase.id);
    setDrawerOpen(true);
  };

  // Delete test case
  const handleDeleteTestCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = testCases.filter(t => t.id !== id);
    updateTestCases(updated);
    if (activeTestCaseId === id && updated.length > 0) {
      setActiveTestCaseId(updated[0].id);
    }
  };

  // Update specific test case fields
  const handleUpdateTestCase = (id: string, updates: Partial<TestCase>) => {
    const updated = testCases.map(t => t.id === id ? { ...t, ...updates } : t);
    updateTestCases(updated);
  };

  // Prepare code with LeetCode helper structures and driver if C++ LeetCode problem
  const getPreparedCode = () => {
    if (problemMeta && problemMeta.platform === 'leetcode' && codeLanguage === 'cpp') {
      const slug = problemMeta.platformId;
      const problemData = (leetcodeData as any[]).find(p => p.slug === slug);
      const driverCode = problemData?.driver || '';

      const prepend = `// Auto-injected LeetCode helper structures
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <map>
#include <unordered_set>
#include <set>
#include <queue>
#include <stack>
#include <algorithm>
#include <numeric>
#include <sstream>
#include <utility>
#include <climits>

using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node* left;
    Node* right;
    Node* next;
    Node() : val(0), left(nullptr), right(nullptr), next(nullptr) {}
    Node(int _val) : val(_val), left(nullptr), right(nullptr), next(nullptr) {}
    Node(int _val, vector<Node*> _neighbors) {
        val = _val;
        neighbors = _neighbors;
        left = nullptr;
        right = nullptr;
        next = nullptr;
    }
};

`;
      return `${prepend}\n${code}\n\n${driverCode}`;
    }
    return code;
  };

  // Run a single test case
  const handleRunCase = async (id: string) => {
    const tc = testCases.find(t => t.id === id);
    if (!tc) return;

    setRunning(true);
    setDrawerOpen(true);

    setSuiteResults(prev => ({
      ...prev,
      [id]: { status: 'running', actualOutput: '' }
    }));

    const preparedCode = getPreparedCode();

    try {
      const startTime = performance.now();
      const res = await runCode({
        wandboxLanguage: lang.wandboxLanguage,
        preferPattern: lang.preferPattern,
        code: preparedCode,
        stdin: tc.input,
      });
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const compileErr = res.compilerMessage?.trim();
      const actualOutput = res.programMessage?.trim() ?? '';
      const expected = tc.expectedOutput.trim();

      let status: 'passed' | 'failed' | 'error' = 'passed';
      if (compileErr) {
        status = 'error';
      } else if (actualOutput !== expected) {
        status = 'failed';
      }

      setSuiteResults(prev => ({
        ...prev,
        [id]: {
          status,
          actualOutput,
          compileErr,
          runtimeStat: res.status !== '' ? `exit ${res.status}` : undefined,
          duration
        }
      }));
    } catch (err: any) {
      setSuiteResults(prev => ({
        ...prev,
        [id]: {
          status: 'error',
          actualOutput: '',
          compileErr: err?.message || 'Failed to connect'
        }
      }));
    }
    setRunning(false);
  };

  // Run the test cases suite
  const handleRunSuite = async () => {
    if (testCases.length === 0) {
      useWorkspaceStore.getState().showNotification('Please add at least one test case', 'info');
      return;
    }
    setRunning(true);
    setDrawerOpen(true);

    const initialResults: typeof suiteResults = {};
    testCases.forEach(tc => {
      initialResults[tc.id] = { status: 'running', actualOutput: '' };
    });
    setSuiteResults(initialResults);

    const preparedCode = getPreparedCode();

    // Execute in parallel (or sequential)
    for (const tc of testCases) {
      try {
        const startTime = performance.now();
        const res = await runCode({
          wandboxLanguage: lang.wandboxLanguage,
          preferPattern: lang.preferPattern,
          code: preparedCode,
          stdin: tc.input,
        });
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        const compileErr = res.compilerMessage?.trim();
        const actualOutput = res.programMessage?.trim() ?? '';
        const expected = tc.expectedOutput.trim();

        let status: 'passed' | 'failed' | 'error' = 'passed';
        if (compileErr) {
          status = 'error';
        } else if (actualOutput !== expected) {
          status = 'failed';
        }

        setSuiteResults(prev => ({
          ...prev,
          [tc.id]: {
            status,
            actualOutput,
            compileErr,
            runtimeStat: res.status !== '' ? `exit ${res.status}` : undefined,
            duration
          }
        }));
      } catch (err: any) {
        setSuiteResults(prev => ({
          ...prev,
          [tc.id]: {
            status: 'error',
            actualOutput: '',
            compileErr: err?.message || 'Failed to connect'
          }
        }));
      }
    }
    setRunning(false);
  };

  // Handle Ctrl+Enter keypress shortcut to run suite
  useEffect(() => {
    const handleGlobalRun = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunSuite();
      }
    };
    window.addEventListener('keydown', handleGlobalRun);
    return () => window.removeEventListener('keydown', handleGlobalRun);
  }, [code, testCases, codeLanguage, problemMeta]);

  const activeTC = testCases.find(t => t.id === activeTestCaseId);
  const activeRes = activeTestCaseId ? suiteResults[activeTestCaseId] : null;

  const resetTemplate = () => {
    lastStarterRef.current = lang.starter;
    updateCode(lang.starter);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 text-zinc-300 select-text">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-zinc-950/25 border-b border-zinc-900 select-none flex-shrink-0">
        <div className="flex items-center gap-2">
          <select
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            className="bg-zinc-900 border border-zinc-800/80 rounded px-2 py-0.5 text-xs text-zinc-200 font-mono transition-colors focus:outline-none focus:border-zinc-700 cursor-pointer"
            title="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunSuite}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-purple-600 hover:bg-purple-650 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Run Suite (Ctrl+Enter)"
          >
            {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            {running ? 'Running Suite…' : 'Run Suite'}
          </button>

          <button
            onClick={() => activeTestCaseId && handleRunCase(activeTestCaseId)}
            disabled={running || !activeTestCaseId}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 border border-zinc-700/60 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Run Active Case"
          >
            {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            <span>Run Case</span>
          </button>

          <button
            onClick={resetTemplate}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-800 hover:bg-zinc-900/60 transition-colors cursor-pointer"
            title="Reset to template"
          >
            <RotateCcw size={12} />
          </button>

          <button
            onClick={() => openSearchPalette('current')}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-800 hover:bg-zinc-900/60 transition-colors cursor-pointer"
            title="Search Workspace (Ctrl+F)"
          >
            <Search size={12} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono" title="Runs safely online">
          <Globe size={11} />
          <span className="hidden sm:inline">runs online via Wandbox</span>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <CodeMirror
          ref={(node) => {
            (window as any).codeEditor = node;
          }}
          value={code}
          height="100%"
          theme="dark"
          extensions={[lang.cm()]}
          onChange={(value) => updateCode(value)}
          basicSetup={{ lineNumbers: true, highlightActiveLine: true, autocompletion: true }}
          style={{ height: '100%', fontSize: 13 }}
          onKeyDownCapture={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
              e.preventDefault();
              e.stopPropagation();
              openSearchPalette('current');
            }
          }}
        />
      </div>

      {/* Redesigned Test Runner Drawer */}
      <div className="flex flex-col border-t border-zinc-800 bg-zinc-950 flex-shrink-0">
        {/* Drawer Header & Tabs Selector */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950 border-b border-zinc-900 select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-500 uppercase mr-2">Tests</span>
            {testCases.map((tc, index) => {
              const isActive = tc.id === activeTestCaseId;
              const res = suiteResults[tc.id];
              return (
                <button
                  key={tc.id}
                  onClick={() => {
                    setActiveTestCaseId(tc.id);
                    setDrawerOpen(true);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border cursor-pointer transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-100 font-semibold border-b-transparent shadow-xs'
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {res && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      res.status === 'running' ? 'bg-purple-400 animate-pulse' :
                      res.status === 'passed' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' :
                      res.status === 'failed' ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]' :
                      'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                    }`} />
                  )}
                  <span>Case {index + 1}</span>
                  {testCases.length > 1 && (
                    <span 
                      onClick={(e) => handleDeleteTestCase(tc.id, e)}
                      className="text-zinc-600 hover:text-rose-400 transition-colors ml-1 p-0.5 rounded hover:bg-zinc-800"
                      title="Delete Test Case"
                    >
                      <X size={9} />
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={handleAddTestCase}
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 text-xs font-mono cursor-pointer transition-colors"
              title="Add Custom Test Case"
            >
              <Plus size={11} />
              <span>Add</span>
            </button>
          </div>

          <button
            onClick={() => setDrawerOpen(o => !o)}
            className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            {drawerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Drawer Content */}
        {drawerOpen && activeTC && (
          <div className="h-44 bg-zinc-950/40 p-3 overflow-y-auto flex flex-col gap-3 font-mono text-xs select-text">
            {/* Inputs & Expected Column */}
            <div className="flex gap-4 min-w-0">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase text-zinc-600">Input (stdin)</span>
                <textarea
                  value={activeTC.input}
                  onChange={(e) => handleUpdateTestCase(activeTC.id, { input: e.target.value })}
                  placeholder="Input variables passed to stdin..."
                  className="bg-zinc-950 border border-zinc-900 rounded p-2 text-xs font-mono text-zinc-200 placeholder-zinc-800 resize-none h-20 focus:outline-none focus:border-zinc-800"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase text-zinc-600">Expected Output</span>
                <textarea
                  value={activeTC.expectedOutput}
                  onChange={(e) => handleUpdateTestCase(activeTC.id, { expectedOutput: e.target.value })}
                  placeholder="Expected stdout values..."
                  className="bg-zinc-950 border border-zinc-900 rounded p-2 text-xs font-mono text-zinc-200 placeholder-zinc-800 resize-none h-20 focus:outline-none focus:border-zinc-800"
                />
              </div>

              {/* Execution outputs details */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <span className="text-[10px] uppercase text-zinc-600">Actual Output</span>
                {activeRes ? (
                  activeRes.status === 'running' ? (
                    <div className="border border-zinc-900 bg-zinc-950/20 rounded p-2 text-zinc-500 h-20 flex items-center justify-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-purple-400" />
                      <span>Executing case...</span>
                    </div>
                  ) : activeRes.compileErr ? (
                    <div className="border border-rose-950/40 bg-rose-950/10 text-rose-400 rounded p-2 overflow-auto h-20 whitespace-pre-wrap">
                      {activeRes.compileErr}
                    </div>
                  ) : (
                    <div className={`border rounded p-2 overflow-auto h-20 whitespace-pre-wrap ${
                      activeRes.status === 'passed' 
                        ? 'border-emerald-950/40 bg-emerald-950/10 text-emerald-400' 
                        : 'border-rose-950/40 bg-rose-950/10 text-rose-400'
                    }`}>
                      {activeRes.actualOutput || '(no stdout output)'}
                    </div>
                  )
                ) : (
                  <div className="border border-zinc-900 bg-zinc-950/20 rounded p-2 text-zinc-700 h-20 flex items-center justify-center">
                    <span>Run code to see stdout.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Diff / Feedback row */}
            {activeRes && activeRes.status !== 'running' && (
              <div className="flex items-center gap-2 border-t border-zinc-900/60 pt-2 text-[10px]">
                <span className="text-zinc-600">Verdict:</span>
                {activeRes.compileErr ? (
                  <span className="text-amber-400 bg-amber-950/40 border border-amber-900/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Compile Error</span>
                ) : activeRes.status === 'passed' ? (
                  <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Passed</span>
                ) : (
                  <>
                    <span className="text-rose-400 bg-rose-950/40 border border-rose-900/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Failed</span>
                    <span className="text-zinc-500 ml-2">Expected:</span>
                    <span className="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-zinc-300 font-bold">{activeTC.expectedOutput || 'empty'}</span>
                    <span className="text-zinc-500">but got:</span>
                    <span className="bg-rose-950/60 border border-rose-900/40 px-1 py-0.5 rounded text-rose-200 font-bold">{activeRes.actualOutput || 'empty'}</span>
                  </>
                )}
                {activeRes.runtimeStat && <span className="text-zinc-600 ml-2">{activeRes.runtimeStat}</span>}
                {activeRes.duration !== undefined && (
                  <span className="text-zinc-500 ml-auto flex items-center gap-1">
                    <span className="text-zinc-600">Time:</span>
                    <span className="text-zinc-300 font-semibold">{activeRes.duration} ms</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
