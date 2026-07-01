import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PanelRightClose } from 'lucide-react';
import { getAlgorithm } from '../config/algorithms';
import { getAlgorithmDoc } from '../config/algorithmDocs';
import { useWorkspaceStore } from '../store/workspaceStore';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark, vscodeLight } from '../config/editorTheme';
import { BLOG_POSTS } from '../config/blogData';

import { ROADMAP_ZONES } from '../config/roadmapData';

const getNestedRoadmapUrl = (slug: string) => {
  const clean = slug.toLowerCase();
  for (const zone of ROADMAP_ZONES) {
    for (const topic of zone.topics) {
      for (const concept of topic.concepts) {
        for (const subtopic of concept.subtopics) {
          if (subtopic.blogSlug === clean || subtopic.blogSlug === clean + 's' || subtopic.blogSlug === clean.slice(0, -1)) {
            return `/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`;
          }
        }
      }
    }
  }
  return `/roadmap`;
};

interface Props {
  algorithmId: string;
  onClose: () => void;
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 640;

import {
  LinearScanHero,
  BinarySearchHero,
  LowerBoundHero,
  UpperBoundHero,
  TernarySearchHero,
} from './SearchHeroes';

const HERO: Record<string, React.FC<{ isDark: boolean }>> = {
  'linear-search': LinearScanHero,
  'binary-search': BinarySearchHero,
  'lower-bound': LowerBoundHero,
  'upper-bound': UpperBoundHero,
  'ternary-search': TernarySearchHero,
};

export const DocSidebar: React.FC<Props> = ({ algorithmId, onClose }) => {
  const theme = useWorkspaceStore((s) => s.theme);
  const isDark = theme === 'dark';
  const reduce = useReducedMotion();

  const algo = getAlgorithm(algorithmId);
  const doc = getAlgorithmDoc(algorithmId);

  const [width, setWidth] = useState(384);
  const [isResizing, setIsResizing] = useState(false);
  const rightEdge = useRef(0);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) =>
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, rightEdge.current - e.clientX)));
    const onUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizing]);

  // Escape collapses the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!doc || !algo) return null;

  const eyebrow = `font-mono text-[9.5px] uppercase tracking-[0.1em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`;
  const bodyText = isDark ? 'text-zinc-300' : 'text-zinc-600';
  const strongText = isDark ? 'text-zinc-100' : 'text-zinc-900';

  return (
    <>
      {/* Overlay so the canvas doesn't swallow the resize drag. */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}

      <motion.aside
        initial={reduce ? false : { x: 28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        style={{ width }}
        className={`relative z-20 flex h-full shrink-0 flex-col border-l ${
          isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-zinc-200 bg-white'
        }`}
      >
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            rightEdge.current = e.currentTarget.parentElement!.getBoundingClientRect().right;
            setIsResizing(true);
          }}
          tabIndex={0}
          role="separator"
          aria-orientation="vertical"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setWidth((w) => Math.min(MAX_WIDTH, w + 10));
            if (e.key === 'ArrowRight') setWidth((w) => Math.max(MIN_WIDTH, w - 10));
          }}
          title="Drag to resize"
          className="group absolute left-0 top-0 z-40 flex h-full w-1.5 -translate-x-1/2 cursor-col-resize justify-center outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:bg-link/20"
        >
          <span className={`h-full w-px transition-colors ${isResizing ? 'bg-link' : 'bg-transparent group-hover:bg-link'}`} />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
          <div className="flex min-w-0 items-baseline gap-2 overflow-hidden">
            <h2 className={`min-w-0 truncate text-[15px] font-semibold tracking-[-0.02em] ${strongText}`}>{algo.name}</h2>
            <span className={`shrink-0 font-mono text-[12px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{algo.complexity}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Collapse panel"
            aria-label="Collapse panel"
            className={`flex shrink-0 items-center rounded-md p-1 cursor-pointer transition-colors outline-none focus-visible:ring-2 ${
              isDark ? 'text-zinc-400 hover:bg-white/10 hover:text-white focus-visible:ring-white/50' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400'
            }`}
          >
            <PanelRightClose size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {(() => {
            const Hero = HERO[algorithmId];
            return Hero ? <Hero isDark={isDark} /> : null;
          })()}

          <p className={`mt-4 text-[13.5px] leading-relaxed ${strongText}`}>{doc.tagline}</p>
          <p className={`mt-2.5 text-[12.5px] leading-relaxed ${bodyText}`}>{doc.idea}</p>

          {/* Theory & Roadmap integrations */}
          {(() => {
            const algoToBlogSlug = (id: string): string => {
              // Searching
              if (id === 'linear-search' || id === 'binary-search' || id === 'ternary-search' || id === 'lower-bound' || id === 'upper-bound') return 'searching';
              // Sorting
              if (id === 'bubble-sort' || id === 'selection-sort' || id === 'insertion-sort' || id === 'merge-sort' || id === 'quick-sort' || id === 'heap-sort' || id === 'counting-sort' || id === 'radix-sort') return 'sorting';
              // Pointers & Sliding Window
              if (id === 'two-pointers' || id === 'sliding-window') return 'arrays';
              if (id === 'fast-slow-pointer') return 'linked-list';
              // Recursion & Backtracking
              if (id === 'recursion' || id === 'recursion-tree' || id === 'backtracking' || id === 'subsets' || id === 'permutations' || id === 'combination-sum' || id === 'n-queens') return 'backtracking';
              // Tree traversals
              if (id === 'dfs-tree' || id === 'bfs-tree' || id === 'preorder' || id === 'inorder' || id === 'postorder' || id === 'level-order' || id === 'morris-traversal') return 'tree-traversal';
              // Graphs
              if (id === 'bfs-graph') return 'bfs';
              if (id === 'dfs-graph') return 'dfs';
              if (id === 'topological-sort') return 'topological-sort';
              if (id === 'dijkstra') return 'dijkstra';
              if (id === 'bellman-ford' || id === 'floyd-warshall') return 'bellman-ford-floyd-warshall';
              if (id === 'kruskal' || id === 'prim' || id === 'union-find') return 'mst-union-find';
              if (id === 'kosaraju' || id === 'tarjan' || id === 'bridges') return 'scc-bridges';
              // Dynamic Programming
              if (id === '1d-dp' || id === '2d-dp' || id === 'knapsack' || id === 'lis' || id === 'lcs' || id === 'dp-on-trees' || id === 'digit-dp' || id === 'bitmask-dp') return 'dynamic-programming';
              // Greedy
              if (id === 'activity-selection' || id === 'interval-scheduling' || id === 'huffman-coding') return 'greedy';
              // String
              if (id === 'kmp') return 'kmp-algorithm';
              if (id === 'rabin-karp' || id === 'z-algorithm' || id === 'manacher') return 'string-algorithms';
              // Range query & trees
              if (id === 'fenwick-tree-algo') return 'fenwick-tree';
              if (id === 'sparse-table-algo') return 'sparse-table';
              if (id === 'segment-tree-algo' || id === 'lazy-propagation') return 'segment-tree';
              // Advanced CP
              if (id === 'binary-lifting' || id === 'euler-tour' || id === 'mos-algorithm' || id === 'sweep-line' || id === 'coordinate-compression') return 'advanced-cp';
              
              // Fallbacks
              if (id.includes('sort')) return 'sorting';
              if (id.includes('search')) return 'searching';
              if (id.includes('tree')) return 'tree-traversal';
              if (id.includes('graph')) return 'dfs';
              return 'arrays';
            };
            const blogSlug = algoToBlogSlug(algorithmId);
            const matchedPost = Array.isArray(BLOG_POSTS) ? BLOG_POSTS.find((p: any) => p.slug === blogSlug) : null;

            return (
              <>
                <div className="mt-4.5 flex flex-col gap-2 border-t border-hairline pt-4.5 font-mono text-[11px]">
                  <button
                    onClick={() => {
                      if ((window as any).navigateTo) {
                        (window as any).navigateTo('roadmap', getNestedRoadmapUrl(blogSlug));
                      }
                    }}
                    className="w-full text-left py-1 hover:text-link transition-colors flex items-center gap-1.5 cursor-pointer text-body"
                  >
                    <span className="text-link">→</span> Read Theory & Guides
                  </button>
                  <button
                    onClick={() => {
                      if ((window as any).navigateTo) {
                        (window as any).navigateTo('roadmap');
                      }
                    }}
                    className="w-full text-left py-1 hover:text-link transition-colors flex items-center gap-1.5 cursor-pointer text-body"
                  >
                    <span className="text-link">→</span> Continue Roadmap Curriculum
                  </button>
                </div>

                {matchedPost && matchedPost.related && matchedPost.related.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-4">
                    <span className={eyebrow}>Related Concepts</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {matchedPost.related.map((relSlug: string) => (
                        <button
                          key={relSlug}
                          onClick={() => {
                            if ((window as any).navigateTo) {
                              (window as any).navigateTo('roadmap', getNestedRoadmapUrl(relSlug));
                            }
                          }}
                          className={`px-2 py-0.5 rounded border text-[9.5px] font-mono transition cursor-pointer ${
                            isDark
                              ? 'border-white/8 bg-white/[0.02] text-zinc-400 hover:text-white'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900'
                          }`}
                        >
                          #{relSlug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* How it works — a genuine sequence, so it's numbered. */}
          <Section eyebrow={eyebrow} label="How it works">
            <ol className="flex flex-col gap-2">
              {doc.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className={`mt-px font-mono text-[12px] tabular-nums ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[12.5px] leading-snug ${bodyText}`}>{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Complexity */}
          <Section eyebrow={eyebrow} label="Complexity">
            <dl className={`overflow-hidden rounded-lg border ${isDark ? 'border-white/[0.08]' : 'border-zinc-200'}`}>
              {doc.complexity.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-baseline gap-3 px-3 py-2 ${
                    i > 0 ? (isDark ? 'border-t border-white/[0.06]' : 'border-t border-zinc-100') : ''
                  }`}
                >
                  <dt className={`w-16 shrink-0 text-[11.5px] ${bodyText}`}>{row.label}</dt>
                  <dd className={`w-16 shrink-0 font-mono text-[12px] ${strongText}`}>{row.value}</dd>
                  <dd className={`text-[11.5px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{row.note}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* Reach for it when */}
          <Section eyebrow={eyebrow} label="Reach for it when">
            <BulletList items={doc.useWhen} marker="+" markerClass="text-emerald-500" bodyText={bodyText} />
          </Section>

          {/* Watch out */}
          <Section eyebrow={eyebrow} label="Watch out">
            <BulletList items={doc.watchOut} marker="!" markerClass={isDark ? 'text-amber-500' : 'text-amber-600'} bodyText={bodyText} />
          </Section>

          {/* Reference implementation */}
          <Section eyebrow={eyebrow} label="Reference">
            <div className={`overflow-hidden rounded-lg border text-[11.5px] [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent ${isDark ? 'border-white/[0.08] bg-black/40' : 'border-zinc-200 bg-zinc-50'}`}>
              <CodeMirror
                value={doc.code}
                readOnly={true}
                editable={false}
                theme={isDark ? vscodeDark : vscodeLight}
                extensions={[doc.code.includes('function ') || doc.code.includes('let ') ? javascript() : cpp()]}
                basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: false, highlightActiveLineGutter: false }}
              />
            </div>
          </Section>
        </div>
      </motion.aside>
    </>
  );
};

const Section: React.FC<{ eyebrow: string; label: string; children: React.ReactNode }> = ({ eyebrow, label, children }) => (
  <section className="mt-6">
    <div className="mb-2.5 flex items-center gap-2">
      <span className={eyebrow}>{label}</span>
      <span className="h-px flex-1 bg-current opacity-10" />
    </div>
    {children}
  </section>
);

const BulletList: React.FC<{ items: string[]; marker: string; markerClass: string; bodyText: string }> = ({ items, marker, markerClass, bodyText }) => (
  <ul className="flex flex-col gap-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2.5">
        <span className={`mt-px font-mono text-[11px] ${markerClass}`}>{marker}</span>
        <span className={`text-[12.5px] leading-snug ${bodyText}`}>{item}</span>
      </li>
    ))}
  </ul>
);
