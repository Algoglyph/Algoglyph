import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  FileText,
  FolderSync,
  Layers3,
  LayoutPanelTop,
  PenTool,
  PlugZap,
  Search,
  Sparkles,
  WandSparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { WORKSPACE_TOUR_EVENT } from '../lib/workspaceTour';
import { useWorkspaceStore, type LayoutMode } from '../store/workspaceStore';

const TOUR_STORAGE_KEY = 'algoglyph-workspace-tour-v1';

type Placement = 'top' | 'right' | 'bottom' | 'left' | 'center';

interface TourStep {
  title: string;
  eyebrow: string;
  body: string;
  icon: LucideIcon;
  target?: string;
  placement?: Placement;
  layout?: LayoutMode;
  shortcut?: string;
}

interface TargetBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const readTourSeen = (): boolean => {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === 'complete';
  } catch {
    return false;
  }
};

const rememberTour = (): void => {
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, 'complete');
  } catch {
    // The tour still works when local storage is unavailable.
  }
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));

export const WorkspaceTour: React.FC = () => {
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);
  const autoStartedRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetBox, setTargetBox] = useState<TargetBox | null>(null);
  const [cardHeight, setCardHeight] = useState(290);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1280 : window.innerWidth,
    height: typeof window === 'undefined' ? 800 : window.innerHeight,
  }));

  const steps = useMemo<TourStep[]>(() => [
    {
      eyebrow: 'Workspace tour',
      title: 'One workspace, two ways to think',
      body: 'Sketch the idea on an infinite canvas, shape it into durable notes, and let a local AI agent move between both. This takes about two minutes.',
      icon: Compass,
      placement: 'center',
      layout: isMobile ? 'canvas-only' : 'split',
    },
    {
      eyebrow: 'View controls',
      title: isMobile ? 'Canvas and notes, one tap apart' : 'Choose your working surface',
      body: isMobile
        ? 'Use the bottom navigation to move between the canvas and notes. The tour will switch views for you as we go.'
        : 'Canvas, Split, and Notes let you change focus without changing documents. Split is the home base for visual thinking beside written explanation.',
      icon: LayoutPanelTop,
      target: isMobile ? '[data-tour="mobile-nav"]' : '[data-tour="layout"]',
      placement: isMobile ? 'top' : 'bottom',
      layout: isMobile ? 'canvas-only' : 'split',
      shortcut: isMobile ? undefined : '⌘ B',
    },
    {
      eyebrow: 'Workspaces',
      title: 'Tabs keep problems separate',
      body: 'Each tab carries its own canvas, notes, and saved state. Add a tab with +, switch with one click, or double-click its name to rename it. Search on the left reaches across every tab.',
      icon: Layers3,
      target: '[data-tour="tabs"]',
      placement: 'bottom',
      layout: isMobile ? 'canvas-only' : 'split',
      shortcut: '⌘ T',
    },
    {
      eyebrow: 'Infinite canvas',
      title: 'Think spatially',
      body: 'Draw freely with Excalidraw or drag ready-made DSA and architecture structures from the left library. Everything remains editable, movable, and saved locally.',
      icon: PenTool,
      target: '[data-tour="canvas"]',
      placement: 'right',
      layout: isMobile ? 'canvas-only' : 'split',
      shortcut: 'T  D  A  R',
    },
    {
      eyebrow: 'Canvas AI',
      title: 'Turn a sentence into a diagram',
      body: 'Type a request directly on the canvas, select it, then choose Ask AI. Your local agent returns real Excalidraw shapes and arrows—not a flattened image.',
      icon: Sparkles,
      target: '[data-tour="canvas-ai"]',
      placement: 'top',
      layout: isMobile ? 'canvas-only' : 'split',
      shortcut: '⌘ Enter',
    },
    {
      eyebrow: 'Markdown notes',
      title: 'Write the explanation beside the sketch',
      body: 'The notes pane supports Markdown, code blocks, tables, math, PDFs, and file drop. It autosaves with the rest of this tab, so the reasoning stays attached to the drawing.',
      icon: FileText,
      target: '[data-tour="notes"]',
      placement: 'left',
      layout: isMobile ? 'notes-only' : 'split',
      shortcut: '⌘ F',
    },
    {
      eyebrow: 'AI notes',
      title: 'Make the canvas explain itself',
      body: 'AI can build notes from a selected topic, explain the current diagram, or summarize the whole canvas. The result is inserted as editable Markdown.',
      icon: WandSparkles,
      target: '[data-tour="notes-ai"]',
      placement: 'bottom',
      layout: isMobile ? 'notes-only' : 'split',
    },
    {
      eyebrow: 'MCP + local agents',
      title: 'Connect intelligence without handing over your workspace',
      body: 'Start the AlgoGlyph connector, then choose Claude Code, Codex, or Antigravity here. The browser talks to the agent through a loopback MCP bridge; provider credentials stay on your machine.',
      icon: PlugZap,
      target: '[data-tour="mcp"]',
      placement: 'bottom',
      layout: isMobile ? 'notes-only' : 'split',
      shortcut: 'npx --yes @algoglyph/mcp-connector@0.2.6',
    },
    {
      eyebrow: 'Local-first files',
      title: 'Carry your work with you',
      body: 'Your workspace autosaves locally. Import or export a portable Markdown workspace, download notes as .md, or take the drawing with you as an Excalidraw file.',
      icon: FolderSync,
      target: isMobile ? '[data-tour="workspace-actions"]' : '[data-tour="portability"]',
      placement: isMobile ? 'bottom' : 'bottom',
      layout: isMobile ? 'notes-only' : 'split',
      shortcut: '⌘ S',
    },
    {
      eyebrow: 'Ready',
      title: 'Start with the idea in your head',
      body: 'Open a tab, sketch the moving parts, and turn the result into notes. Search, save, and local AI are always within reach.',
      icon: Check,
      placement: 'center',
      layout: isMobile ? 'canvas-only' : 'split',
      shortcut: '⌘ ⇧ F  ·  Search all tabs',
    },
  ], [isMobile]);

  const step = steps[stepIndex];
  const targetSelector = step?.target;

  const openTour = useCallback(() => {
    if (isMobile) useWorkspaceStore.getState().setStructuresPanelOpen(false);
    setStepIndex(0);
    setIsOpen(true);
  }, [isMobile]);

  const closeTour = useCallback((remember = true) => {
    if (remember) rememberTour();
    setIsOpen(false);
    setTargetBox(null);
  }, []);

  const measureTarget = useCallback(() => {
    setViewport({ width: window.innerWidth, height: window.innerHeight });
    if (!targetSelector) {
      setTargetBox(null);
      return;
    }

    const target = document.querySelector<HTMLElement>(targetSelector);
    if (!target) {
      setTargetBox(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const padding = 6;
    setTargetBox({
      top: Math.max(4, rect.top - padding),
      left: Math.max(4, rect.left - padding),
      width: Math.min(window.innerWidth - 8, rect.width + padding * 2),
      height: Math.min(window.innerHeight - 8, rect.height + padding * 2),
    });
  }, [targetSelector]);

  useEffect(() => {
    const handleStart = () => openTour();
    window.addEventListener(WORKSPACE_TOUR_EVENT, handleStart);
    return () => window.removeEventListener(WORKSPACE_TOUR_EVENT, handleStart);
  }, [openTour]);

  useEffect(() => {
    if (isLoading || autoStartedRef.current) return;
    autoStartedRef.current = true;
    if (readTourSeen()) return;
    const timer = window.setTimeout(openTour, 700);
    return () => window.clearTimeout(timer);
  }, [isLoading, openTour]);

  useEffect(() => {
    if (!isOpen || !step) return;
    if (step.layout) setLayoutMode(step.layout);

    const firstFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(measureTarget);
    });
    const settleTimer = window.setTimeout(measureTarget, 340);
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [isOpen, measureTarget, setLayoutMode, step]);

  useEffect(() => {
    if (!isOpen) return;
    cardRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeTour();
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        if (stepIndex === steps.length - 1) closeTour();
        else setStepIndex((index) => Math.min(index + 1, steps.length - 1));
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setStepIndex((index) => Math.max(index - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeTour, isOpen, stepIndex, steps.length]);

  useEffect(() => {
    if (!isOpen || !cardRef.current) return;
    const card = cardRef.current;
    const updateHeight = () => setCardHeight(card.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(card);
    return () => observer.disconnect();
  }, [isOpen, stepIndex]);

  if (!isOpen || !step) return null;

  const cardWidth = Math.min(360, viewport.width - 24);
  const gap = 18;
  const margin = 12;
  let cardLeft = (viewport.width - cardWidth) / 2;
  let cardTop = (viewport.height - cardHeight) / 2;

  if (targetBox && step.placement !== 'center') {
    if (step.placement === 'top') {
      cardLeft = targetBox.left + targetBox.width / 2 - cardWidth / 2;
      cardTop = targetBox.top - cardHeight - gap;
    } else if (step.placement === 'bottom') {
      cardLeft = targetBox.left + targetBox.width / 2 - cardWidth / 2;
      cardTop = targetBox.top + targetBox.height + gap;
    } else if (step.placement === 'left') {
      cardLeft = targetBox.left - cardWidth - gap;
      cardTop = targetBox.top + targetBox.height / 2 - cardHeight / 2;
    } else if (step.placement === 'right') {
      cardLeft = targetBox.left + targetBox.width + gap;
      cardTop = targetBox.top + targetBox.height / 2 - cardHeight / 2;
    }
  }

  // The Canvas AI control sits against the bottom edge. Keep its explanation
  // comfortably upright instead of visually attaching the card to the footer.
  if (stepIndex === 4 && targetBox) {
    const upperScreenLimit = isMobile ? 72 : Math.max(96, viewport.height * 0.3);
    cardTop = Math.min(cardTop, upperScreenLimit);
  }

  cardLeft = clamp(cardLeft, margin, Math.max(margin, viewport.width - cardWidth - margin));
  cardTop = clamp(cardTop, margin, Math.max(margin, viewport.height - cardHeight - margin));

  const StepIcon = step.icon;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[120]" aria-live="polite">
      {targetBox ? (
        <motion.div
          className="pointer-events-none fixed rounded-xl border border-white ring-2 ring-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.76),0_0_0_6px_rgba(255,255,255,0.16)]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{
            opacity: 1,
            top: targetBox.top,
            left: targetBox.left,
            width: targetBox.width,
            height: targetBox.height,
          }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 bg-black/75 backdrop-blur-[2px]" />
      )}

      <AnimatePresence mode="wait">
        <motion.section
          key={stepIndex}
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="workspace-tour-title"
          tabIndex={-1}
          className="fixed overflow-hidden rounded-xl border border-hairline-strong bg-canvas text-ink shadow-[var(--shadow-modal)] outline-none"
          style={{ width: cardWidth, left: cardLeft, top: cardTop }}
          initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.99 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="h-1 w-full bg-canvas-soft">
            <motion.div
              className="h-full bg-ink"
              initial={false}
              animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
            />
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-hairline-strong bg-canvas-soft text-ink">
                  <StepIcon size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">{step.eyebrow}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-body">{String(stepIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => closeTour()}
                className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-md text-mute transition-colors hover:bg-canvas-soft hover:text-ink"
                aria-label="Close workspace tour"
                title="Close tour"
              >
                <X size={15} />
              </button>
            </div>

            <h2 id="workspace-tour-title" className="mt-5 font-display text-xl font-semibold tracking-[-0.025em] text-ink">
              {step.title}
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-body">{step.body}</p>

            {step.shortcut && (
              <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-md border border-hairline bg-canvas-soft px-2.5 py-1.5 font-mono text-[10px] text-body">
                {stepIndex === 2 ? <Search size={12} aria-hidden="true" /> : <Sparkles size={12} aria-hidden="true" />}
                <span className="truncate">{step.shortcut}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-hairline pt-4">
              <button
                type="button"
                onClick={() => closeTour()}
                className="text-[11px] font-medium text-mute transition-colors hover:text-ink"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:border-hairline-strong hover:text-ink"
                  >
                    <ArrowLeft size={13} />
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isLast) closeTour();
                    else setStepIndex((index) => Math.min(steps.length - 1, index + 1));
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-3.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90"
                >
                  {isLast ? 'Start working' : 'Next'}
                  {isLast ? <Check size={13} /> : <ArrowRight size={13} />}
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
};
