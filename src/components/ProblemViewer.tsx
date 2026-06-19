import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { ExternalLink, Tag, BookOpen, AlertCircle } from 'lucide-react';

export const ProblemViewer: React.FC = () => {
  const problemMeta = useWorkspaceStore((state) => state.problemMeta);

  if (!problemMeta) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-zinc-500 font-mono">
        <AlertCircle size={24} className="mb-2 text-zinc-600" />
        <p className="text-xs">No problem metadata linked to this sheet.</p>
        <p className="text-[10px] text-zinc-700 mt-1">Search and import a problem to get started.</p>
      </div>
    );
  }

  const { title, platform, difficulty, url, tags, statement, constraints, examples } = problemMeta;

  // Determine difficulty color badges
  let difficultyBadge = null;
  if (platform === 'leetcode') {
    let diffColor = 'text-emerald-400 border-emerald-950 bg-emerald-950/20';
    if (difficulty === 'Medium') {
      diffColor = 'text-amber-400 border-amber-950 bg-amber-950/20';
    } else if (difficulty === 'Hard') {
      diffColor = 'text-rose-400 border-rose-950 bg-rose-950/20';
    }
    difficultyBadge = (
      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold font-mono ${diffColor}`}>
        {difficulty || 'Easy'}
      </span>
    );
  } else if (platform === 'codeforces') {
    const ratingNum = parseInt(difficulty || '800');
    let ratingColor = 'text-emerald-400 border-emerald-950 bg-emerald-950/20';
    if (ratingNum >= 1200 && ratingNum < 1500) {
      ratingColor = 'text-teal-400 border-teal-950 bg-teal-950/20';
    } else if (ratingNum >= 1500 && ratingNum < 1900) {
      ratingColor = 'text-indigo-400 border-indigo-950 bg-indigo-950/20';
    } else if (ratingNum >= 1900 && ratingNum < 2100) {
      ratingColor = 'text-purple-400 border-purple-950 bg-purple-950/20';
    } else if (ratingNum >= 2100) {
      ratingColor = 'text-rose-400 border-rose-950 bg-rose-950/20';
    }
    difficultyBadge = (
      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold font-mono ${ratingColor}`}>
        CF Rating: {difficulty || '800'}
      </span>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900 border-r border-zinc-900 text-zinc-300 select-text overflow-y-auto">
      {/* Header section */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/25 select-none flex-shrink-0">
        <div className="flex items-center gap-2 mb-2 text-[9px] font-mono tracking-widest">
          <BookOpen size={10} className="text-purple-400" />
          <span className={`uppercase font-bold ${platform === 'leetcode' ? 'text-amber-500' : 'text-blue-400'}`}>
            {platform}
          </span>
          <span className="text-zinc-700">•</span>
          {difficultyBadge}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h2 className="text-sm font-bold font-mono text-zinc-100">{title}</h2>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Official Website"
              className="p-1 rounded hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-800/40 text-zinc-400 text-[8px] font-mono"
              >
                <Tag size={7} className="text-zinc-500" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content body */}
      <div className="p-4 flex-1 space-y-5 max-w-none prose prose-invert prose-xs">
        {/* Render statement */}
        <div
          className="markdown-body space-y-2.5 text-[11px] leading-relaxed text-zinc-300"
          dangerouslySetInnerHTML={{ __html: statement || '<p>No problem description available.</p>' }}
        />

        {/* Render examples section if statement does not contain examples already and examples are provided */}
        {examples && examples.length > 0 && (
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <h4 className="text-[10px] font-bold font-mono tracking-wider text-zinc-200 uppercase">Examples</h4>
            {examples.map((ex, i) => (
              <div key={ex.id || i} className="bg-zinc-800 border border-zinc-700/60 rounded p-3 font-mono text-[11px]">
                <div className="text-[9px] text-zinc-500 font-bold uppercase mb-1.5">Example {i + 1}</div>
                <div className="space-y-1.5">
                  <div className="flex items-start">
                    <span className="text-zinc-500 font-medium w-12 flex-shrink-0">Input:</span>
                    <pre className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-300 whitespace-pre-wrap select-all font-mono text-[11px] ml-1">
                      {ex.input}
                    </pre>
                  </div>
                  {ex.expectedOutput && (
                    <div className="flex items-start">
                      <span className="text-zinc-500 font-medium w-12 flex-shrink-0">Output:</span>
                      <pre className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-350 whitespace-pre-wrap select-all font-mono text-[11px] ml-1">
                        {ex.expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Render constraints section */}
        {constraints && constraints.length > 0 && (
          <div className="border-t border-zinc-800 pt-4">
            <h4 className="text-[10px] font-bold font-mono tracking-wider text-zinc-200 uppercase mb-2">Constraints</h4>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-400 font-mono">
              {constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
