import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, Copy } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { MockWorkspace } from './MockWorkspace';

interface LandingContinuationProps {
  onLaunch: () => void;
}

type CopyState = 'idle' | 'copied' | 'error';

const CONNECTOR_COMMAND = 'npx @algoglyph/mcp-connector';

const FAQ_ITEMS = [
  {
    question: 'What is Algoglyph?',
    answer:
      'Algoglyph is a local-first visual workspace for studying computer science. It brings notes, an infinite canvas, a code runner, algorithm visualizers, MCP-connected agents, and a complete CS roadmap into one place.',
  },
  {
    question: 'How is Algoglyph different from Notion?',
    answer:
      'Notion is primarily a document workspace. Algoglyph is built around visual reasoning: sketch structures on an infinite canvas, keep durable notes beside them, run code, and step through algorithms without breaking your study flow.',
  },
  {
    question: 'Can I create visual computer-science notes?',
    answer:
      'Yes. Draw diagrams with the canvas, place data structures and algorithms from the built-in library, and keep the explanation beside the visual in the same tab.',
  },
  {
    question: 'Does Algoglyph include interactive algorithm visualizers?',
    answer:
      'Yes. The visualizer workspace includes step-by-step playback for arrays, graphs, grids, dynamic-programming tables, trees, and other core algorithm families.',
  },
  {
    question: 'Does Algoglyph include a complete Computer Science roadmap?',
    answer:
      'Yes. The roadmap connects more than 1,000 deep-dive articles across data structures, algorithms, systems, software engineering, AI, security, and related computer-science disciplines.',
  },
  {
    question: 'Can I connect notes across different topics?',
    answer:
      'Yes. Organize subjects in separate tabs, connect concepts spatially on the canvas, and move between related notes, diagrams, code, and visualizer work without rebuilding your context.',
  },
  {
    question: 'Can I write code while studying?',
    answer:
      'Yes. The integrated editor lets you write, compile, and run code beside your notes and diagrams, so an idea can move directly from explanation to experiment.',
  },
  {
    question: 'Is Algoglyph free?',
    answer:
      'Yes. The core workspace and computer-science roadmap are free to use for personal learning.',
  },
] as const;

const WORKFLOWS = [
  {
    title: 'Interview preparation',
    body: 'Trace the structure, annotate the invariant, and test the implementation without rebuilding context.',
  },
  {
    title: 'Coursework',
    body: 'Keep lecture notes, diagrams, experiments, and the next topic in one continuous workspace.',
  },
  {
    title: 'System design',
    body: 'Map architecture decisions beside the code and explanations that made those decisions useful.',
  },
] as const;

function InstallConnector() {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const copyCommand = async () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);

    try {
      await navigator.clipboard.writeText(CONNECTOR_COMMAND);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }

    resetTimer.current = window.setTimeout(() => setCopyState('idle'), 2400);
  };

  const CopyIcon = copyState === 'copied' ? Check : copyState === 'error' ? AlertTriangle : Copy;
  const copyLabel = copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Select command' : 'Copy command';

  return (
    <section className="relative overflow-hidden bg-[#050708] px-5 py-28 sm:px-12 sm:py-40">
      <div aria-hidden="true" className="lp-install-orbit" />
      <div className="relative mx-auto max-w-[1500px]">
        <h2 className="max-w-[980px] text-balance text-[clamp(2.7rem,6.5vw,6rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-[var(--lp-hero-ink)]">
          One command. Then your workspace can act.
        </h2>
        <p className="mt-7 max-w-[620px] text-[16px] leading-[1.65] text-white/58 sm:text-[19px]">
          Start the local connector, pair your agent, and keep every credential on your machine.
        </p>

        <div className="mt-16 grid border-y border-white/12 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_auto]">
          <code className="min-w-0 overflow-x-auto py-8 font-mono text-[clamp(1.15rem,3.4vw,3.4rem)] font-medium tracking-[-0.035em] text-white sm:py-11">
            <span className="text-[var(--lp-hero-cyan)]">npx</span>{' '}
            <span>@algoglyph/mcp-connector</span>
          </code>
          <button
            type="button"
            onClick={copyCommand}
            className="group flex min-h-16 cursor-pointer items-center justify-between gap-8 border-t border-white/12 px-1 py-5 text-left font-mono text-[12px] font-medium text-white/68 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--lp-hero-cyan)] active:bg-white/[0.045] lg:min-w-56 lg:justify-center lg:border-l lg:border-t-0 lg:px-8"
          >
            <span aria-live="polite">{copyLabel}</span>
            <CopyIcon aria-hidden="true" size={17} strokeWidth={1.7} />
          </button>
        </div>

        <div className="grid border-b border-white/12 font-mono text-[11px] text-white/42 sm:grid-cols-3 sm:text-[12px]">
          <span className="py-5 sm:border-r sm:border-white/12 sm:px-5">Node 20+</span>
          <span className="border-t border-white/12 py-5 sm:border-r sm:border-t-0 sm:border-white/12 sm:px-5">
            Loopback connection only
          </span>
          <span className="border-t border-white/12 py-5 sm:border-t-0 sm:px-5">Pairs on 127.0.0.1:4319</span>
        </div>
      </div>
    </section>
  );
}

function StorySheet({
  index,
  children,
  className,
}: {
  index: number;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <article
      className={`lp-feature-sheet sticky top-16 flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden ${className}`}
      style={{ zIndex: 10 + index }}
    >
      {children}
    </article>
  );
}

function StickyProductStory() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="relative scroll-mt-16 bg-[#050708]">
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-24 sm:px-12 sm:pb-28 sm:pt-36">
        <h2 className="max-w-[1040px] text-balance text-[clamp(2.6rem,6vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-white">
          Build understanding in one moving surface.
        </h2>
      </div>

      <div className="relative">
        <StorySheet index={0} className="bg-[#1737ee] text-white">
          <div className="lp-blueprint-field mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[1680px] grid-cols-1 lg:grid-cols-[minmax(300px,0.68fr)_minmax(0,1.32fr)]">
            <div className="flex flex-col justify-end border-b border-white/18 px-5 py-12 sm:px-12 sm:py-16 lg:border-b-0 lg:border-r lg:px-14 lg:py-20">
              <h3 className="max-w-[9ch] text-[clamp(3rem,6.4vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.04em]">
                Think in space.
              </h3>
              <p className="mt-8 max-w-[38ch] text-[16px] leading-[1.6] text-blue-50/78 sm:text-[18px]">
                Draw the structure, keep the explanation nearby, and move ideas until the relationship is obvious.
              </p>
            </div>
            <motion.div
              initial={reduceMotion ? false : { clipPath: 'inset(12% 0 0 0)', opacity: 0.68 }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)', opacity: 1 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[52dvh] overflow-hidden bg-[#111318] lg:min-h-full"
            >
              <img
                src="/og-image.png"
                alt="Algoglyph canvas showing graphs, flowcharts, and an array visualizer drawn on a chalkboard surface"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,16,61,0.2),transparent_45%)]" />
            </motion.div>
          </div>
        </StorySheet>

        <StorySheet index={1} className="bg-[#090a0d] text-white">
          <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[1680px] grid-cols-1 lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
            <div className="flex flex-col justify-between border-b border-white/10 px-5 py-12 sm:px-12 sm:py-16 lg:border-b-0 lg:border-r lg:px-14 lg:py-20">
              <h3 className="max-w-[10ch] text-[clamp(2.8rem,5.6vw,6rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
                Keep proof beside the idea.
              </h3>
              <div className="mt-12 max-w-[39ch] lg:mt-0">
                <p className="text-[16px] leading-[1.65] text-white/58 sm:text-[18px]">
                  Notes, code, output, and visual state share the same workspace. Switch modes without losing the thread.
                </p>
                <p className="mt-6 font-mono text-[11px] leading-[1.7] text-[var(--lp-hero-cyan)]">
                  The preview is interactive. Try Split View, Code Runner, and Algorithm Visualizer.
                </p>
              </div>
            </div>
            <div className="flex h-[42dvh] min-h-0 items-center justify-center overflow-hidden bg-[#0d1121] px-4 py-6 sm:min-h-[58dvh] sm:px-8 sm:py-10 lg:h-auto lg:min-h-full lg:px-12">
              <div className="w-[760px] shrink-0 sm:w-full">
                <MockWorkspace />
              </div>
            </div>
          </div>
        </StorySheet>

        <StorySheet index={2} className="bg-[#dbe3ff] text-[#0a1027]">
          <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[1680px] grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="order-2 flex h-[45dvh] min-h-0 items-center px-5 py-8 sm:min-h-[50dvh] sm:px-12 sm:py-12 lg:order-1 lg:h-auto lg:min-h-full lg:px-16">
              <div className="w-full border-y border-[#0a1027]/18">
                <div className="grid gap-5 py-7 sm:grid-cols-[1fr_auto] sm:items-center">
                  <span className="text-[clamp(1.6rem,3vw,3rem)] font-semibold tracking-[-0.035em]">Claude Code</span>
                  <span className="font-mono text-[11px] text-[#0a1027]/55">local agent</span>
                </div>
                <div className="grid gap-5 border-t border-[#0a1027]/18 py-7 sm:grid-cols-[1fr_auto] sm:items-center">
                  <span className="text-[clamp(1.6rem,3vw,3rem)] font-semibold tracking-[-0.035em]">Codex</span>
                  <span className="font-mono text-[11px] text-[#0a1027]/55">local agent</span>
                </div>
                <div className="grid gap-5 border-t border-[#0a1027]/18 py-7 sm:grid-cols-[1fr_auto] sm:items-center">
                  <span className="text-[clamp(1.6rem,3vw,3rem)] font-semibold tracking-[-0.035em]">Antigravity</span>
                  <span className="font-mono text-[11px] text-[#0a1027]/55">local agent</span>
                </div>
                <div className="grid gap-5 border-t border-[#0a1027]/18 bg-[#1737ee] px-5 py-7 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:px-7">
                  <span className="text-[clamp(1.6rem,3vw,3rem)] font-semibold tracking-[-0.035em]">Algoglyph workspace</span>
                  <span className="font-mono text-[11px] text-white/68">paired locally</span>
                </div>
              </div>
            </div>
            <div className="order-1 flex flex-col justify-end border-b border-[#0a1027]/18 px-5 py-12 sm:px-12 sm:py-16 lg:order-2 lg:border-b-0 lg:border-l lg:px-14 lg:py-20">
              <h3 className="max-w-[10ch] text-[clamp(2.8rem,5.8vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
                Agents enter your workspace.
              </h3>
              <p className="mt-8 max-w-[38ch] text-[16px] leading-[1.65] text-[#0a1027]/68 sm:text-[18px]">
                Give an agent a real place to write notes, draw structures, and leave work you can keep editing.
              </p>
            </div>
          </div>
        </StorySheet>

        <StorySheet index={3} className="bg-[#061035] text-white">
          <div className="lp-blueprint-field mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[1680px] grid-cols-1 lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
            <div className="flex flex-col justify-end border-b border-white/12 px-5 py-12 sm:px-12 sm:py-16 lg:border-b-0 lg:border-r lg:px-14 lg:py-20">
              <h3 className="max-w-[9ch] text-[clamp(2.8rem,5.8vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
                Watch state change.
              </h3>
              <p className="mt-8 max-w-[38ch] text-[16px] leading-[1.65] text-blue-50/66 sm:text-[18px]">
                Step through arrays, graphs, grids, trees, and dynamic programs one immutable frame at a time.
              </p>
            </div>
            <div id="visualizer" className="flex h-[48dvh] min-h-0 scroll-mt-16 items-center justify-center overflow-hidden bg-[#1737ee]/45 px-4 py-6 sm:min-h-[58dvh] sm:py-10 lg:h-auto lg:min-h-full">
              <motion.img
                src="/images/dsa/dijkstra-dark.jpg"
                alt="Dijkstra shortest-path lesson showing weighted edges, visited nodes, and distance updates"
                initial={reduceMotion ? false : { clipPath: 'inset(8% 8% 8% 8%)', opacity: 0.72 }}
                whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-full max-h-[calc(100dvh-8rem)] w-full object-cover lg:object-contain"
              />
            </div>
          </div>
        </StorySheet>
      </div>
    </section>
  );
}

function WhiteExplanation() {
  return (
    <section id="usecases" className="relative z-30 scroll-mt-16 bg-[#f2f2ef] px-5 py-28 text-[#111214] sm:px-12 sm:py-40">
      <div className="mx-auto max-w-[1500px]">
        <h2 className="max-w-[980px] text-balance text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.94] tracking-[-0.04em]">
          One product, every learning loop.
        </h2>
        <p className="mt-7 max-w-[640px] text-[17px] leading-[1.65] text-[#111214]/62 sm:text-[20px]">
          Read the concept, map the relationships, run the code, and keep the result where the next question begins.
        </p>

        <div className="mt-16 grid overflow-hidden border-y border-black/14 lg:mt-24 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="relative min-h-[52dvh] overflow-hidden bg-[#171918] lg:min-h-[76dvh]">
            <img
              src="/illustrations/algorithms.png"
              alt="Chalkboard showing binary search, merge sort, and a recursive sorting flowchart"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-between border-t border-black/14 px-0 py-10 lg:border-l lg:border-t-0 lg:px-12 lg:py-14">
            <h3 className="max-w-[10ch] text-[clamp(2.2rem,4.3vw,4.6rem)] font-medium leading-[0.96] tracking-[-0.04em]">
              Read. Map. Run. Retain.
            </h3>
            <div className="mt-16 border-t border-black/14 text-[15px] leading-[1.55] sm:text-[16px]">
              <p className="py-5">Deep-dive roadmap articles give the idea a clear starting point.</p>
              <p className="border-t border-black/14 py-5">The canvas turns symbols and relationships into spatial memory.</p>
              <p className="border-t border-black/14 py-5">The runner and visualizer test what you think you understand.</p>
            </div>
          </div>
        </div>

        <div className="mt-28 grid gap-12 sm:mt-36 lg:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)] lg:gap-24">
          <h3 className="max-w-[11ch] text-[clamp(2.2rem,4.2vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Different work. Same mental model.
          </h3>
          <div className="border-t border-black/18">
            {WORKFLOWS.map((workflow) => (
              <div key={workflow.title} className="grid gap-3 border-b border-black/14 py-7 sm:grid-cols-[minmax(180px,0.45fr)_minmax(0,1fr)] sm:gap-10 sm:py-8">
                <h4 className="text-[17px] font-semibold tracking-[-0.025em] sm:text-[19px]">{workflow.title}</h4>
                <p className="max-w-[52ch] text-[15px] leading-[1.65] text-[#111214]/62 sm:text-[16px]">{workflow.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingContinuation({ onLaunch }: LandingContinuationProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <InstallConnector />
      <StickyProductStory />
      <WhiteExplanation />

      <section id="faq" className="relative z-30 scroll-mt-16 border-t border-black/12 bg-[#f2f2ef] px-5 py-24 text-[#111214] sm:px-12 sm:py-36">
        <div className="mx-auto max-w-[980px]">
          <h2 className="max-w-[720px] text-[clamp(2.4rem,4.8vw,4.8rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Questions, answered plainly.
          </h2>

          <div className="mt-12 border-t border-black/18 sm:mt-16">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              const answerId = `landing-faq-answer-${index}`;

              return (
                <div key={item.question} className="border-b border-black/14">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenFaq((current) => (current === index ? null : index))}
                    className="group flex w-full cursor-pointer items-center justify-between gap-5 py-6 text-left sm:py-7"
                  >
                    <span className="pr-2 text-[16px] font-medium leading-snug text-[#111214]/78 transition-colors duration-300 group-hover:text-[#111214] sm:text-[18px]">
                      {item.question}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      size={18}
                      strokeWidth={1.6}
                      className={`shrink-0 text-[#1737ee] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    id={answerId}
                    aria-hidden={!isOpen}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[760px] pb-7 pr-10 text-[15px] leading-[1.7] text-[#111214]/62 sm:text-[16px]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-30 flex min-h-[70dvh] items-center bg-[#f2f2ef] px-5 py-28 text-[#111214] sm:px-12 sm:py-36">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center text-center">
          <h2 className="max-w-[1020px] text-balance text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.95] tracking-[-0.04em]">
            Your next idea needs room to move.
          </h2>
          <p className="mt-7 max-w-[560px] text-[16px] leading-[1.65] text-[#111214]/62 sm:text-[18px]">
            Open the workspace and turn the next difficult concept into something you can see, test, and keep.
          </p>
          <button
            type="button"
            onClick={onLaunch}
            className="mt-9 inline-flex min-h-14 cursor-pointer items-center justify-center bg-[#111214] px-8 text-[15px] font-semibold text-[#f2f2ef] transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:bg-[#1737ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1737ee] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f2f2ef] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          >
            Launch Workspace
          </button>
        </div>
      </section>
    </>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative z-30 border-t border-white/[0.07] bg-[#050708] px-6 py-12 sm:px-12 sm:py-16">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-7 font-mono text-[11px] tracking-[0.02em] text-white/42 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Algoglyph. Built for visual computer science.</span>
        <nav aria-label="Legal and repository" className="flex flex-wrap items-center gap-5 sm:gap-7">
          <a href="/privacy" className="underline-offset-4 transition-colors duration-300 hover:text-white hover:underline">
            Privacy
          </a>
          <a href="/terms" className="underline-offset-4 transition-colors duration-300 hover:text-white hover:underline">
            Terms
          </a>
          <a
            href="https://github.com/Algoglyph/AlgoGlyph"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 transition-colors duration-300 hover:text-white hover:underline"
          >
            Repository
          </a>
        </nav>
      </div>
    </footer>
  );
}
