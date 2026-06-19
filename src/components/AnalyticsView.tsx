import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { X, TrendingUp, Award, Activity, Globe, Loader2 } from 'lucide-react';

interface AnalyticsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ isOpen, onClose }) => {
  const userProfile = useWorkspaceStore((state) => state.userProfile);
  const allWorkspaces = useWorkspaceStore((state) => state.allWorkspaces);

  const leetcodeUsername = userProfile?.leetcodeUsername || localStorage.getItem('leetcode_username') || '';
  const codeforcesUsername = userProfile?.codeforcesUsername || localStorage.getItem('codeforces_username') || '';

  const cfRating = userProfile?.cfRating ?? (localStorage.getItem('codeforces_rating') ? parseInt(localStorage.getItem('codeforces_rating')!) : undefined);
  const cfRank = userProfile?.cfRank || localStorage.getItem('codeforces_rank') || '';
  const cfMaxRating = userProfile?.cfMaxRating ?? (localStorage.getItem('codeforces_max_rating') ? parseInt(localStorage.getItem('codeforces_max_rating')!) : undefined);
  const cfMaxRank = userProfile?.cfMaxRank || localStorage.getItem('codeforces_max_rank') || '';

  // LeetCode Stats Fetch State
  const [lcStats, setLcStats] = useState<{ totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number } | null>(null);
  const [lcLoading, setLcLoading] = useState(false);
  const [lcError, setLcError] = useState(false);

  // Fetch LeetCode stats from public stats proxy
  useEffect(() => {
    if (isOpen && leetcodeUsername) {
      setLcLoading(true);
      setLcError(false);
      fetch(`https://leetcode-stats-api.herokuapp.com/${leetcodeUsername.trim()}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch stats');
        })
        .then((data) => {
          if (data.status === 'success') {
            setLcStats({
              totalSolved: data.totalSolved,
              easySolved: data.easySolved,
              mediumSolved: data.mediumSolved,
              hardSolved: data.hardSolved,
            });
          } else {
            setLcError(true);
          }
        })
        .catch((err) => {
          console.error(err);
          setLcError(true);
        })
        .finally(() => {
          setLcLoading(false);
        });
    } else {
      setLcStats(null);
    }
  }, [isOpen, leetcodeUsername]);

  if (!isOpen) return null;

  // Compute local workspace statistics
  const localLeetCodeWorkspaces = allWorkspaces.filter(ws => ws.problemMeta?.platform === 'leetcode').length;
  const localCodeforcesWorkspaces = allWorkspaces.filter(ws => ws.problemMeta?.platform === 'codeforces').length;
  const localCustomWorkspaces = allWorkspaces.filter(ws => !ws.problemMeta).length;
  const totalLocalWorkspaces = allWorkspaces.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0 cursor-default" onClick={onClose} />

      {/* Main Analytics Container */}
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono z-10 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-purple-400" />
            <span className="text-xs font-bold tracking-wider text-zinc-100 uppercase">Growth & Analytics</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Analytics Body */}
        <div className="p-4 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          
          {/* Section 1: Local Workspace Statistics */}
          <div className="flex flex-col gap-3 p-3 bg-zinc-900/40 border border-zinc-900 rounded">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-1.5">
              <Activity size={13} className="text-purple-400" />
              <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Local Workspaces</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-500 uppercase">LeetCode</span>
                <span className="text-base font-bold text-amber-500 mt-0.5">{localLeetCodeWorkspaces}</span>
              </div>
              <div className="flex flex-col border-x border-zinc-900">
                <span className="text-[8px] text-zinc-500 uppercase">Codeforces</span>
                <span className="text-base font-bold text-blue-500 mt-0.5">{localCodeforcesWorkspaces}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-500 uppercase">Custom Sheets</span>
                <span className="text-base font-bold text-purple-500 mt-0.5">{localCustomWorkspaces}</span>
              </div>
            </div>

            <div className="h-1.5 w-full bg-zinc-950 rounded-full flex overflow-hidden mt-1">
              {totalLocalWorkspaces > 0 ? (
                <>
                  <div className="bg-amber-500 h-full" style={{ width: `${(localLeetCodeWorkspaces / totalLocalWorkspaces) * 100}%` }} title="LeetCode Workspaces" />
                  <div className="bg-blue-500 h-full" style={{ width: `${(localCodeforcesWorkspaces / totalLocalWorkspaces) * 100}%` }} title="Codeforces Workspaces" />
                  <div className="bg-purple-500 h-full" style={{ width: `${(localCustomWorkspaces / totalLocalWorkspaces) * 100}%` }} title="Custom Workspaces" />
                </>
              ) : (
                <div className="bg-zinc-900 h-full w-full" />
              )}
            </div>
          </div>

          {/* Section 2: LeetCode Stats (Real Online Data) */}
          <div className="flex flex-col gap-3 p-3 bg-zinc-900/40 border border-zinc-900 rounded">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Award size={13} className="text-amber-500" />
                <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">LeetCode Profile</h3>
              </div>
              {leetcodeUsername && (
                <span className="text-[9px] text-zinc-500 font-mono">@{leetcodeUsername}</span>
              )}
            </div>

            {!leetcodeUsername ? (
              <div className="text-center py-4 text-[10px] text-zinc-600 font-mono">
                No LeetCode account connected
              </div>
            ) : lcLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-[10px] text-zinc-500 font-mono">
                <Loader2 size={12} className="animate-spin text-amber-500" />
                <span>Loading profile statistics...</span>
              </div>
            ) : lcError || !lcStats ? (
              <div className="text-center py-4 text-[10px] text-rose-400 font-mono uppercase font-semibold">
                Stats unavailable
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {/* Total Solved badge */}
                <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded border border-zinc-900">
                  <span className="text-[9px] uppercase text-zinc-500 font-bold">Total Solved</span>
                  <span className="text-lg font-bold text-zinc-100">{lcStats.totalSolved}</span>
                </div>

                {/* Progress breakdown */}
                <div className="flex flex-col gap-2 text-[10px] text-zinc-400 font-mono">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-500 font-bold">Easy</span>
                      <span>{lcStats.easySolved}</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${lcStats.totalSolved ? (lcStats.easySolved / lcStats.totalSolved) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-amber-500 font-bold">Medium</span>
                      <span>{lcStats.mediumSolved}</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: `${lcStats.totalSolved ? (lcStats.mediumSolved / lcStats.totalSolved) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-rose-500 font-bold">Hard</span>
                      <span>{lcStats.hardSolved}</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${lcStats.totalSolved ? (lcStats.hardSolved / lcStats.totalSolved) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Codeforces Stats (Real Online Data) */}
          <div className="flex flex-col gap-3 p-3 bg-zinc-900/40 border border-zinc-900 rounded">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Globe size={13} className="text-blue-400" />
                <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Codeforces Profile</h3>
              </div>
              {codeforcesUsername && (
                <span className="text-[9px] text-zinc-500 font-mono">@{codeforcesUsername}</span>
              )}
            </div>

            {!codeforcesUsername ? (
              <div className="text-center py-4 text-[10px] text-zinc-600 font-mono">
                No Codeforces account connected
              </div>
            ) : cfRating === undefined ? (
              <div className="text-center py-4 text-[10px] text-rose-400 font-mono uppercase font-semibold">
                Unable to fetch Codeforces profile
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-[10px] text-zinc-400 font-mono">
                <div className="flex flex-col p-2 bg-zinc-950 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Rating</span>
                  <span className="text-sm font-bold text-zinc-200 mt-1">{cfRating}</span>
                </div>
                <div className="flex flex-col p-2 bg-zinc-950 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Rank</span>
                  <span className="text-xs font-bold text-zinc-200 mt-1 capitalize">{cfRank}</span>
                </div>
                <div className="flex flex-col p-2 bg-zinc-950 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Max Rating</span>
                  <span className="text-sm font-bold text-zinc-200 mt-1">{cfMaxRating}</span>
                </div>
                <div className="flex flex-col p-2 bg-zinc-950 rounded border border-zinc-900">
                  <span className="text-[8px] text-zinc-500 uppercase font-bold">Max Rank</span>
                  <span className="text-xs font-bold text-zinc-200 mt-1 capitalize">{cfMaxRank}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-zinc-900 bg-zinc-950/20 text-center select-none">
          <span className="text-[9px] text-zinc-600">Statistics show real fetched metrics. Sync handles in the Profile drawer.</span>
        </div>
      </div>
    </div>
  );
};
