import React, { useState, useMemo } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { fetchLeetCodeProblem, LEETCODE_POPULAR_PROBLEMS } from '../lib/leetcode';
import { fetchCodeforcesProblem, CODEFORCES_POPULAR_PROBLEMS } from '../lib/codeforces';
import { BookOpen, Search, Filter, Plus, FileText, Check, Loader2, Sparkles } from 'lucide-react';

export const ProblemsSidebar: React.FC = () => {
  const isOpen = useWorkspaceStore((state) => state.problemsSidebarOpen);
  const tabs = useWorkspaceStore((state) => state.tabs);
  const allWorkspaces = useWorkspaceStore((state) => state.allWorkspaces);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const switchTab = useWorkspaceStore((state) => state.switchTab);
  const createWorkspaceTab = useWorkspaceStore((state) => state.createWorkspaceTab);
  const showNotification = useWorkspaceStore((state) => state.showNotification);

  const [activePlatform, setActivePlatform] = useState<'leetcode' | 'codeforces' | 'recent'>('leetcode');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProblem, setLoadingProblem] = useState<string | null>(null);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [cfRatingFilter, setCfRatingFilter] = useState<'All' | '800' | '1000' | '1200+'>('All');

  // Filtered LeetCode problems
  const filteredLeetCode = useMemo(() => {
    return LEETCODE_POPULAR_PROBLEMS.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
      return matchSearch && matchDiff;
    });
  }, [searchQuery, difficultyFilter]);

  // Filtered Codeforces problems
  const filteredCodeforces = useMemo(() => {
    return CODEFORCES_POPULAR_PROBLEMS.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          `${p.contestId}${p.index}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const rating = p.rating || 800;
      let matchRating = true;
      if (cfRatingFilter === '800') matchRating = rating <= 800;
      else if (cfRatingFilter === '1000') matchRating = rating > 800 && rating <= 1100;
      else if (cfRatingFilter === '1200+') matchRating = rating >= 1200;
      
      return matchSearch && matchRating;
    });
  }, [searchQuery, cfRatingFilter]);

  // Filtered Recent/Saved problems (workspaces that have problemMeta)
  const recentProblems = useMemo(() => {
    return allWorkspaces
      .filter((ws) => ws.problemMeta && ws.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [allWorkspaces, searchQuery]);

  // Check if a problem is already imported as a local workspace
  const getWorkspaceForProblem = (platform: 'leetcode' | 'codeforces', id: string) => {
    return allWorkspaces.find(
      (ws) => ws.problemMeta && ws.problemMeta.platform === platform && ws.problemMeta.platformId === id
    );
  };

  // Import / Select Problem
  const handleProblemClick = async (platform: 'leetcode' | 'codeforces', problemId: string, title: string) => {
    const existing = getWorkspaceForProblem(platform, problemId);
    if (existing) {
      // Problem already imported, check if active, if not switch tab
      const isTabOpen = tabs.some((t) => t.id === existing.id);
      if (isTabOpen) {
        switchTab(existing.id);
      } else {
        switchTab(existing.id);
      }
      showNotification(`Switched to workspace for ${title}`, 'success');
      return;
    }

    // Otherwise, import and create
    setLoadingProblem(problemId);
    showNotification(`Importing "${title}" from ${platform}...`, 'info');

    try {
      if (platform === 'leetcode') {
        const problem = await fetchLeetCodeProblem(problemId);
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
      } else {
        // Parse contestId & index
        const match = problemId.match(/^(\d+)([A-Za-z]\d*)$/);
        if (match) {
          const contestId = parseInt(match[1]);
          const index = match[2];
          const problem = await fetchCodeforcesProblem(contestId, index);
          await createWorkspaceTab(
            problem.name,
            'codeforces',
            problemId,
            problem.rating ? `${problem.rating}` : 'Normal',
            problem.url,
            problem.codeSnippet,
            problem.testCases,
            problem.tags,
            problem.content
          );
        } else {
          // Curated item or custom import
          const contestId = parseInt(problemId.replace(/\D/g, '')) || 4;
          const index = problemId.replace(/\d/g, '') || 'A';
          const problem = await fetchCodeforcesProblem(contestId, index);
          await createWorkspaceTab(
            problem.name,
            'codeforces',
            problemId,
            problem.rating ? `${problem.rating}` : 'Normal',
            problem.url,
            problem.codeSnippet,
            problem.testCases,
            problem.tags,
            problem.content
          );
        }
      }
      showNotification(`Imported "${title}" successfully`, 'success');
    } catch (err) {
      console.error(err);
      showNotification(`Failed to import problem from ${platform}`, 'error');
    } finally {
      setLoadingProblem(null);
    }
  };

  return (
    <div
      style={{ width: isOpen ? '16rem' : '0rem' }}
      className={`h-full flex-shrink-0 select-none z-30 overflow-hidden bg-zinc-950 transition-[width] duration-300 ease-in-out ${
        isOpen ? 'border-r border-zinc-900' : 'border-r-0'
      }`}
    >
      <div className="flex flex-col h-full w-64 bg-zinc-950">
        {/* Title area */}
        <div className="p-4 border-b border-zinc-900 flex items-center gap-2 select-none flex-shrink-0">
          <BookOpen size={14} className="text-purple-400" />
          <span className="font-mono text-xs font-bold tracking-wider text-zinc-100 uppercase">Problems</span>
        </div>

        {/* Platform tabs selector */}
        <div className="flex px-3 pt-3 gap-1 select-none flex-shrink-0">
          <button
            onClick={() => setActivePlatform('leetcode')}
            className={`flex-1 py-1 rounded text-[10px] font-mono font-semibold transition-all duration-150 cursor-pointer border ${
              activePlatform === 'leetcode'
                ? 'bg-amber-950/20 text-amber-400 border-amber-900/40'
                : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/35'
            }`}
          >
            LeetCode
          </button>
          <button
            onClick={() => setActivePlatform('codeforces')}
            className={`flex-1 py-1 rounded text-[10px] font-mono font-semibold transition-all duration-150 cursor-pointer border ${
              activePlatform === 'codeforces'
                ? 'bg-blue-950/20 text-blue-400 border-blue-900/40'
                : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/35'
            }`}
          >
            Codeforces
          </button>
          <button
            onClick={() => setActivePlatform('recent')}
            className={`flex-1 py-1 rounded text-[10px] font-mono font-semibold transition-all duration-150 cursor-pointer border ${
              activePlatform === 'recent'
                ? 'bg-purple-950/20 text-purple-400 border-purple-900/40'
                : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/35'
            }`}
          >
            Recent
          </button>
        </div>

        {/* Search input area */}
        <div className="p-3 select-none flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-900/40 border border-zinc-800/80 rounded focus-within:border-zinc-700 transition-colors">
            <Search size={11} className="text-zinc-500" />
            <input
              type="text"
              placeholder="Search catalog or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-[11px] text-zinc-200 focus:outline-none placeholder-zinc-750 w-full font-mono"
            />
          </div>
        </div>

        {/* Platform-specific filter controls */}
        {activePlatform === 'leetcode' && (
          <div className="px-3 pb-2 flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 flex-shrink-0 select-none">
            <Filter size={10} className="text-zinc-600" />
            <span>Difficulty:</span>
            <div className="flex bg-zinc-900 rounded p-0.5 ml-auto border border-zinc-850">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-1.5 py-0.5 rounded-sm transition-colors cursor-pointer ${
                    difficultyFilter === diff ? 'bg-zinc-800 text-amber-400 font-bold' : 'hover:text-zinc-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {activePlatform === 'codeforces' && (
          <div className="px-3 pb-2 flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 flex-shrink-0 select-none">
            <Filter size={10} className="text-zinc-600" />
            <span>Rating:</span>
            <div className="flex bg-zinc-900 rounded p-0.5 ml-auto border border-zinc-850">
              {(['All', '800', '1000', '1200+'] as const).map((rate) => (
                <button
                  key={rate}
                  onClick={() => setCfRatingFilter(rate)}
                  className={`px-1.5 py-0.5 rounded-sm transition-colors cursor-pointer ${
                    cfRatingFilter === rate ? 'bg-zinc-800 text-blue-400 font-bold' : 'hover:text-zinc-300'
                  }`}
                >
                  {rate}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Problems list body */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {activePlatform === 'leetcode' && (
            filteredLeetCode.length > 0 ? (
              filteredLeetCode.map((p) => {
                const ws = getWorkspaceForProblem('leetcode', p.slug);
                const isLoading = loadingProblem === p.slug;
                const isActive = ws && ws.id === activeTabId;
                
                return (
                  <button
                    key={p.slug}
                    onClick={() => handleProblemClick('leetcode', p.slug, p.title)}
                    disabled={!!loadingProblem}
                    className={`w-full group p-2 rounded border text-left flex flex-col gap-1 transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-sm'
                        : ws
                        ? 'bg-zinc-900 border-zinc-900/60 text-zinc-300 hover:border-zinc-800'
                        : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:border-zinc-850'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1 w-full">
                      <span className={`text-[11px] font-semibold font-mono truncate flex-1 ${
                        isActive ? 'text-amber-400' : 'group-hover:text-amber-500'
                      }`}>
                        {p.title}
                      </span>
                      {isLoading ? (
                        <Loader2 size={11} className="animate-spin text-amber-500 flex-shrink-0 mt-0.5" />
                      ) : ws ? (
                        <Check size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Plus size={11} className="text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 w-full mt-0.5">
                      <span className={
                        p.difficulty === 'Easy' ? 'text-emerald-500' : p.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                      }>{p.difficulty}</span>
                      <span className="truncate max-w-[120px] text-zinc-650">{p.tags.join(', ')}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-[10px] text-zinc-600 font-mono">No matching LeetCode problems.</div>
            )
          )}

          {activePlatform === 'codeforces' && (
            filteredCodeforces.length > 0 ? (
              filteredCodeforces.map((p) => {
                const problemId = `${p.contestId}${p.index}`;
                const ws = getWorkspaceForProblem('codeforces', problemId);
                const isLoading = loadingProblem === problemId;
                const isActive = ws && ws.id === activeTabId;

                return (
                  <button
                    key={problemId}
                    onClick={() => handleProblemClick('codeforces', problemId, p.name)}
                    disabled={!!loadingProblem}
                    className={`w-full group p-2 rounded border text-left flex flex-col gap-1 transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-sm'
                        : ws
                        ? 'bg-zinc-900 border-zinc-900/60 text-zinc-300 hover:border-zinc-800'
                        : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:border-zinc-850'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1 w-full">
                      <span className={`text-[11px] font-semibold font-mono truncate flex-1 ${
                        isActive ? 'text-blue-400' : 'group-hover:text-blue-500'
                      }`}>
                        {p.contestId}{p.index}. {p.name}
                      </span>
                      {isLoading ? (
                        <Loader2 size={11} className="animate-spin text-blue-500 flex-shrink-0 mt-0.5" />
                      ) : ws ? (
                        <Check size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Plus size={11} className="text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 w-full mt-0.5">
                      <span className="text-zinc-400">★ {p.rating || 800}</span>
                      <span className="truncate max-w-[120px] text-zinc-650">{p.tags.join(', ')}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-[10px] text-zinc-600 font-mono">No matching Codeforces problems.</div>
            )
          )}

          {activePlatform === 'recent' && (
            recentProblems.length > 0 ? (
              recentProblems.map((ws) => {
                const isActive = ws.id === activeTabId;
                const platform = ws.problemMeta?.platform || 'custom';
                return (
                  <button
                    key={ws.id}
                    onClick={() => switchTab(ws.id)}
                    className={`w-full group p-2 rounded border text-left flex flex-col gap-1 transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-sm'
                        : 'bg-zinc-900 border-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <FileText size={11} className={isActive ? 'text-purple-400' : 'text-zinc-500'} />
                      <span className="text-[11px] font-semibold font-mono truncate flex-1">{ws.title}</span>
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-zinc-650 w-full mt-0.5">
                      <span className="uppercase">{platform}</span>
                      <span>{new Date(ws.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-[10px] text-zinc-600 font-mono">No recent problem sheets.</div>
            )
          )}
        </div>

        {/* Footer actions / hint */}
        <div className="mt-auto p-3 bg-zinc-950/20 text-[9px] text-zinc-600 font-mono border-t border-zinc-900 flex items-center gap-1.5 flex-shrink-0 select-none">
          <Sparkles size={10} className="text-purple-500" />
          <span>Click to select coding workspace</span>
        </div>
      </div>
    </div>
  );
};
