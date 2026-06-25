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
