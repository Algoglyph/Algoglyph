import React, { useEffect, useState, useRef, useMemo } from 'react';
import { dsaStructures } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';
import { Search, CornerDownLeft, FileText, Shapes, Plus, Loader2 } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { insertStructureIntoCanvas } from '../lib/insertStructure';
import { fetchLeetCodeProblem, LEETCODE_POPULAR_PROBLEMS } from '../lib/leetcode';
import { fetchCodeforcesProblem, CODEFORCES_POPULAR_PROBLEMS } from '../lib/codeforces';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  type: 'workspace' | 'structure' | 'leetcode-action' | 'codeforces-action';
  title: string;
  subtitle?: string;
  metadata?: any;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showNotification = useWorkspaceStore((state) => state.showNotification);
  const allWorkspaces = useWorkspaceStore((state) => state.allWorkspaces);
  const tabs = useWorkspaceStore((state) => state.tabs);
  const switchTab = useWorkspaceStore((state) => state.switchTab);
  const createWorkspaceTab = useWorkspaceStore((state) => state.createWorkspaceTab);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Parse query for Codeforces format (e.g. "4A" or "1900B")
  const cfDetails = useMemo(() => {
    const trimmed = query.trim();
    const match = trimmed.match(/^(\d+)\s*([A-Za-z]\d*)$/);
    if (match) {
      return { contestId: parseInt(match[1]), index: match[2].toUpperCase() };
    }
    return null;
  }, [query]);

  // Compute matched items
  const items = useMemo<PaletteItem[]>(() => {
    if (loading) return [];

    const list: PaletteItem[] = [];
    const searchStr = query.toLowerCase().trim();

    // 1. Curated / Matching Problems Autocomplete
    if (searchStr.length > 0) {
      // LeetCode Match
      const lcMatches = LEETCODE_POPULAR_PROBLEMS.filter(p => 
        p.title.toLowerCase().includes(searchStr) || p.slug.toLowerCase().includes(searchStr) ||
        p.tags.some(t => t.toLowerCase().includes(searchStr))
      );
      lcMatches.forEach(p => {
        list.push({
          id: `lc-curated-${p.slug}`,
          type: 'leetcode-action',
          title: `[LeetCode] ${p.title}`,
          subtitle: `Browse & Import · ${p.difficulty} · ${p.tags.join(', ')}`,
          metadata: { slug: p.slug, title: p.title },
          icon: <Plus size={14} className="text-amber-500" />
        });
      });

      // Codeforces Match
      const cfMatches = CODEFORCES_POPULAR_PROBLEMS.filter(p => 
        p.name.toLowerCase().includes(searchStr) || `${p.contestId}${p.index}`.toLowerCase().includes(searchStr) ||
        p.tags.some(t => t.toLowerCase().includes(searchStr))
      );
      cfMatches.forEach(p => {
        const problemId = `${p.contestId}${p.index}`;
        list.push({
          id: `cf-curated-${problemId}`,
          type: 'codeforces-action',
          title: `[Codeforces] ${problemId}. ${p.name}`,
          subtitle: `Browse & Import · Rating ${p.rating || 800} · ${p.tags.join(', ')}`,
          metadata: { problemId, title: p.name, contestId: p.contestId, index: p.index },
          icon: <Plus size={14} className="text-blue-500" />
        });
      });

      // Generic imports actions as fallback
      list.push({
        id: 'lc-import',
        type: 'leetcode-action',
        title: `Search & Import LeetCode "${query}"`,
        subtitle: 'Creates a workspace with constraints, examples, and snippet template',
        icon: <Plus size={14} className="text-amber-500" />
      });

      const cfTitle = cfDetails 
        ? `Import Codeforces Problem ${cfDetails.contestId}${cfDetails.index}` 
        : `Search & Import Codeforces "${query}" (e.g. 4A)`;
      list.push({
        id: 'cf-import',
        type: 'codeforces-action',
        title: cfTitle,
        subtitle: 'Fetches problem description, test cases and C++ template',
        icon: <Plus size={14} className="text-blue-500" />
      });
    }

    // 2. Filter local workspaces
    const matchedWorkspaces = allWorkspaces.filter(ws => 
      ws.title.toLowerCase().includes(searchStr) ||
      (ws.problemMeta?.platform && ws.problemMeta.platform.toLowerCase().includes(searchStr))
    );

    matchedWorkspaces.forEach(ws => {
      list.push({
        id: `ws-${ws.id}`,
        type: 'workspace',
        title: ws.title,
        subtitle: ws.problemMeta 
          ? `Local Workspace · ${ws.problemMeta.platform.toUpperCase()} (${ws.problemMeta.difficulty || 'Normal'})`
          : 'Local Workspace · Custom Draft',
        metadata: { workspaceId: ws.id },
        icon: <FileText size={14} className="text-purple-400" />
      });
    });

    // 3. Filter algorithmic drawing structures
    const matchedStructures = dsaStructures.filter(s => 
      s.name.toLowerCase().includes(searchStr) ||
      s.description.toLowerCase().includes(searchStr) ||
      s.commands.some(c => c.toLowerCase().includes(searchStr))
    );

    matchedStructures.forEach(s => {
      list.push({
        id: `struct-${s.id}`,
        type: 'structure',
        title: s.name,
        subtitle: `DSA Visual Template · ${s.description}`,
        metadata: { structure: s },
        icon: <Shapes size={14} className="text-emerald-400" />
      });
    });

    return list;
  }, [query, allWorkspaces, cfDetails, loading]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(prev => prev >= items.length ? 0 : prev);
  }, [items]);

  // Execute selected command
  const handleExecute = async (item: PaletteItem) => {
    if (item.type === 'structure') {
      const struct = item.metadata.structure as DSAStructure;
      insertStructureIntoCanvas(struct, (msg) => showNotification(msg, 'error'));
      onClose();
    } else if (item.type === 'workspace') {
      const wsId = item.metadata.workspaceId;
      const isOpen = tabs.some(t => t.id === wsId);
      if (isOpen) {
        switchTab(wsId);
      } else {
        // Just load/switch
        switchTab(wsId);
      }
      onClose();
    } else if (item.type === 'leetcode-action') {
      setLoading(true);
      const targetSlug = item.metadata?.slug || query;
      const targetTitle = item.metadata?.title || query;
      showNotification(`Fetching problem "${targetTitle}" from LeetCode...`, 'info');
      try {
        const problem = await fetchLeetCodeProblem(targetSlug);
        await createWorkspaceTab(
          problem.title,
          'leetcode',
          problem.titleSlug,
          problem.difficulty,
          problem.url,
          problem.codeSnippet,
          problem.testCases,
          problem.tags,
          problem.content
        );
        showNotification(`Workspace created for "${problem.title}"`, 'success');
      } catch (err) {
        console.error(err);
        showNotification('Failed to import LeetCode problem', 'error');
      } finally {
        setLoading(false);
        onClose();
      }
    } else if (item.type === 'codeforces-action') {
      const isCurated = !!item.metadata;
      let contestId = cfDetails?.contestId;
      let index = cfDetails?.index;
      let targetId = `${contestId}${index}`;
      let targetTitle = query;
      if (isCurated) {
        contestId = item.metadata.contestId;
        index = item.metadata.index;
        targetId = item.metadata.problemId;
        targetTitle = item.metadata.title;
      }
      if (!isCurated && !cfDetails) {
        showNotification('Format incorrect. Use "contestId + index" (e.g. 4A, 1823B)', 'info');
        return;
      }
      setLoading(true);
      showNotification(`Fetching problem "${targetTitle}"...`, 'info');
      try {
        const problem = await fetchCodeforcesProblem(contestId!, index!);
        await createWorkspaceTab(
          problem.name,
          'codeforces',
          targetId,
          problem.rating ? `${problem.rating}` : 'Normal',
          problem.url,
          problem.codeSnippet,
          problem.testCases,
          problem.tags,
          problem.content
        );
        showNotification(`Workspace created for "${problem.name}"`, 'success');
      } catch (err) {
        console.error(err);
        showNotification('Failed to import Codeforces problem', 'error');
      } finally {
        setLoading(false);
        onClose();
      }
    }
  };

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          handleExecute(items[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-[15vh]">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0 cursor-default" onClick={onClose} />

      {/* Main Palette Box */}
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono z-10 mx-4">
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900 bg-zinc-950">
          <Search size={16} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search local sheets, CF rounds, LeetCode (e.g. lc two sum)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-zinc-100 focus:outline-none placeholder-zinc-700 disabled:opacity-50"
          />
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
            <Loader2 size={24} className="animate-spin text-purple-500" />
            <span className="text-xs tracking-wider">CREATING PROBLEM WORKSPACE...</span>
          </div>
        )}

        {/* List of matches */}
        {!loading && (
          <div className="max-h-80 overflow-y-auto p-1.5 bg-zinc-950/40">
            {items.length > 0 ? (
              items.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleExecute(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                        : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.icon}
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        {item.subtitle && (
                          <span className="text-[10px] text-zinc-500 mt-0.5 truncate">{item.subtitle}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && <CornerDownLeft size={10} className="text-purple-400 flex-shrink-0" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-xs text-zinc-600 text-center">
                {query.trim().length === 0 
                  ? 'Type to search local workspaces, LeetCode, or DSA drawing templates.'
                  : 'No results found. Type a problem title slug or contest indexing.'}
              </div>
            )}
          </div>
        )}

        {/* Footer controls */}
        <div className="p-3 border-t border-zinc-900 bg-zinc-950/20 text-[9px] text-zinc-600 flex justify-between select-none">
          <div className="flex gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to execute</span>
          </div>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
};
