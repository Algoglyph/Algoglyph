import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, Copy } from 'lucide-react';

interface LandingContinuationProps {
  onLaunch: () => void;
  onViewRoadmap: () => void;
}

type CopyState = 'idle' | 'copied' | 'error';

const CONNECTOR_COMMAND = 'npx @algoglyph/mcp-connector';

const FAQ_ITEMS = [
  {
    question: 'What is Algoglyph?',
    answer: 'A local-first workspace for notes, canvas, code, visualizers, MCP agents, and a complete computer science roadmap.',
  },
  {
    question: 'How is it different from Notion?',
    answer: 'Algoglyph is built for visual reasoning and executable ideas, not general-purpose documents.',
  },
  {
    question: 'Can I create connected visual notes?',
    answer: 'Yes. Keep notes beside diagrams and connect related topics across workspace tabs.',
  },
  {
    question: 'Can I run and visualize code?',
    answer: 'Yes. Run code and step through arrays, graphs, grids, tables, trees, and other algorithm families.',
  },
  {
    question: 'Does it include a complete CS roadmap?',
    answer: 'Yes. Explore more than 1,000 articles across algorithms, systems, AI, security, and related disciplines.',
  },
  {
    question: 'Is Algoglyph free?',
    answer: 'Yes. The core workspace and computer science roadmap are free for personal learning.',
  },
] as const;

const WORKFLOWS = [
  {
    title: 'Interview preparation',
    body: 'Trace the structure, test the invariant, and keep the result.',
  },
  {
    title: 'Coursework',
    body: 'Keep lectures, diagrams, and experiments in one workspace.',
  },
  {
    title: 'System design',
    body: 'Map architecture decisions beside the code that proves them.',
  },
] as const;

type LorenzPoint = readonly [number, number, number];

const createLorenzOrbit = (length: number): LorenzPoint[] => {
  const points: LorenzPoint[] = [];
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  const timeStep = 0.005;
  let x = 0.1;
  let y = 0;
  let z = 0;

  for (let index = 0; index < length + 1200; index += 1) {
    x += sigma * (y - x) * timeStep;
    y += (x * (rho - z) - y) * timeStep;
    z += (x * y - beta * z) * timeStep;

    if (index >= 1200) points.push([x, y, z]);
  }

  return points;
};

function LorenzAttractorVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const orbit = createLorenzOrbit(6200);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (elapsed = 0) => {
      context.clearRect(0, 0, width, height);

      const angle = reduceMotion ? -0.22 : elapsed * 0.000045 - 0.22;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const scale = Math.min(width / 54, height / 50);
      const horizontalScale = scale * 0.82;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const currentIndex = reduceMotion ? orbit.length : Math.floor(elapsed * 0.32) % orbit.length;

      for (let index = 0; index < orbit.length; index += 2) {
        const [x, y, z] = orbit[index];
        const rotatedX = x * cosine - y * sine;
        const depth = x * sine + y * cosine;
        const screenX = centerX + rotatedX * horizontalScale;
        const screenY = centerY - (z - 25 + depth * 0.085) * scale;
        const trailDistance = (currentIndex - index + orbit.length) % orbit.length;
        const trailGlow = reduceMotion ? 0 : Math.max(0, 1 - trailDistance / 760);
        const alpha = 0.24 + trailGlow * 0.72;
        const size = trailGlow > 0.55 || index % 18 === 0 ? 1.8 : 1.05;

        context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        context.fillRect(screenX, screenY, size, size);
      }

      if (!reduceMotion) frameId = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });

    resizeObserver.observe(canvas);
    resize();
    draw();

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      className="relative h-full min-h-[320px] overflow-hidden bg-[#050708] lg:min-h-full"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Animated particle simulation of a Lorenz attractor"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

const createRosslerOrbit = (length: number): LorenzPoint[] => {
  const points: LorenzPoint[] = [];
  const a = 0.2;
  const b = 0.2;
  const c = 5.7;
  const timeStep = 0.012;
  let x = 0.1;
  let y = 0;
  let z = 0;

  for (let index = 0; index < length + 2400; index += 1) {
    x += (-y - z) * timeStep;
    y += (x + a * y) * timeStep;
    z += (b + z * (x - c)) * timeStep;

    if (index >= 2400) points.push([x, y, z]);
  }

  return points;
};

function RosslerAttractorVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const orbit = createRosslerOrbit(7600);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (elapsed = 0) => {
      context.clearRect(0, 0, width, height);

      const angle = reduceMotion ? 0.38 : elapsed * 0.000055 + 0.38;
      const cosine = Math.cos(angle);
      const sine = Math.sin(angle);
      const scale = Math.min(width / 31, height / 31);
      const horizontalScale = scale * 0.88;
      const centerX = width * 0.5;
      const centerY = height * 0.53;
      const currentIndex = reduceMotion ? orbit.length : Math.floor(elapsed * 0.38) % orbit.length;

      for (let index = 0; index < orbit.length; index += 2) {
        const [x, y, z] = orbit[index];
        const rotatedX = x * cosine - y * sine;
        const rotatedY = x * sine + y * cosine;
        const screenX = centerX + rotatedX * horizontalScale;
        const screenY = centerY + (rotatedY * 0.72 - z * 0.82 + 2.5) * scale;
        const trailDistance = (currentIndex - index + orbit.length) % orbit.length;
        const trailGlow = reduceMotion ? 0 : Math.max(0, 1 - trailDistance / 880);
        const alpha = 0.2 + trailGlow * 0.76;
        const size = trailGlow > 0.52 || index % 20 === 0 ? 1.8 : 1.05;

        context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        context.fillRect(screenX, screenY, size, size);
      }

      if (!reduceMotion) frameId = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });

    resizeObserver.observe(canvas);
    resize();
    draw();

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden bg-[#0c0e10] lg:min-h-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Animated particle simulation of a Rössler system"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

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
    <section className="bg-[#050708] px-5 pb-10 pt-14 text-white sm:px-12 sm:pb-12 sm:pt-20">
      <div className="mx-auto max-w-[1320px]">
        <h2 className="text-[clamp(1.8rem,3vw,2.7rem)] font-semibold tracking-[-0.035em]">
          Quick start
        </h2>

        <div className="mt-7 border border-white/14 bg-[#0a0c0d]">
          <div className="flex min-h-14 items-center justify-between gap-6 border-b border-white/12 px-4 sm:px-6">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-white/56">
              MCP connector
            </span>
            <button
              type="button"
              onClick={copyCommand}
              className="group inline-flex min-h-11 cursor-pointer items-center gap-3 font-mono text-[11px] font-medium text-white/64 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)] active:text-[var(--lp-hero-cyan)]"
            >
              <span aria-live="polite">{copyLabel}</span>
              <CopyIcon aria-hidden="true" size={16} strokeWidth={1.7} />
            </button>
          </div>

          <div className="px-4 py-7 sm:px-7 sm:py-9">
            <p className="font-mono text-[12px] italic text-white/48 sm:text-[14px]">
              # Connect Algoglyph to any MCP client
            </p>
            <code className="mt-5 block overflow-x-auto whitespace-nowrap font-mono text-[clamp(1rem,2.35vw,1.75rem)] font-medium tracking-[-0.025em] text-white">
              <span className="mr-3 text-[var(--lp-hero-cyan)]">$</span>
              {CONNECTOR_COMMAND}
            </code>
          </div>
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
      className={`lp-feature-sheet relative flex min-h-[560px] items-center overflow-hidden lg:sticky lg:top-16 lg:min-h-[78dvh] ${className}`}
      style={{ zIndex: 10 + index }}
    >
      {children}
    </article>
  );
}

const ORBITING_AGENTS = [
  { name: 'Claude Code', logo: '/brands/claude-code.png', position: 'claude' },
  { name: 'Codex', logo: '/brands/codex.png', position: 'codex' },
  { name: 'Antigravity', logo: '/brands/antigravity.png', position: 'antigravity' },
] as const;

const AGENT_ROWS = [
  { name: 'Claude Code', role: 'MCP client', logo: '/brands/claude-code.png' },
  { name: 'Codex', role: 'MCP client', logo: '/brands/codex.png' },
  { name: 'Antigravity', role: 'MCP client', logo: '/brands/antigravity.png' },
  { name: 'Algoglyph', role: 'local workspace', logo: null },
] as const;

function AgentCluster() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-8 h-[220px] w-[220px] -translate-x-1/2 sm:top-10 sm:h-[280px] sm:w-[280px] lg:top-12 lg:h-[330px] lg:w-[330px]"
      aria-label="Claude Code, Codex, and Antigravity rotating together"
    >
      {ORBITING_AGENTS.map((agent) => (
        <div
          key={agent.name}
          className={`lp-agent-cluster-node lp-agent-cluster-node--${agent.position} absolute`}
        >
          <img
            src={agent.logo}
            alt=""
            className="lp-agent-cluster-logo h-14 w-14 object-contain sm:h-[68px] sm:w-[68px] lg:h-[76px] lg:w-[76px]"
          />
        </div>
      ))}
    </div>
  );
}

function StickyProductStory() {
  return (
    <section id="features" className="relative scroll-mt-16 bg-[#050708]">
      <div className="mx-auto max-w-[1500px] px-5 py-12 sm:px-12 sm:py-14">
        <h2 className="max-w-[900px] text-balance text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-white">
          Build understanding in one moving surface.
        </h2>
      </div>

      <div className="relative">
        <StorySheet index={0} className="bg-[#050708] text-white">
          <div className="lp-blueprint-field mx-auto grid min-h-[560px] w-full max-w-[1680px] lg:min-h-[78dvh] lg:grid-cols-[minmax(280px,0.6fr)_minmax(0,1.4fr)]">
            <div className="flex flex-col justify-end border-b border-white/18 px-5 py-10 sm:px-12 sm:py-14 lg:border-b-0 lg:border-r lg:px-14 lg:py-16">
              <h3 className="max-w-[8ch] text-[clamp(2.8rem,5.5vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
                Think in space.
              </h3>
              <p className="mt-6 max-w-[34ch] text-[15px] leading-[1.55] text-white/62 sm:text-[17px]">
                Draw structures beside the notes that explain them.
              </p>
            </div>
            <div className="relative min-h-[320px] overflow-hidden bg-[#050708] lg:min-h-full">
              <LorenzAttractorVisual />
            </div>
          </div>
        </StorySheet>

        <StorySheet index={1} className="bg-[#0c0e10] text-white">
          <div className="lp-blueprint-field mx-auto grid min-h-[560px] w-full max-w-[1680px] lg:min-h-[78dvh] lg:grid-cols-[minmax(280px,0.6fr)_minmax(0,1.4fr)]">
            <div className="flex flex-col justify-end border-b border-white/18 px-5 py-10 sm:px-12 sm:py-14 lg:border-b-0 lg:border-r lg:px-14 lg:py-16">
              <h3 className="max-w-[9ch] text-[clamp(2.8rem,5.5vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
                Keep proof beside the idea.
              </h3>
            </div>
            <div className="relative min-h-[320px] overflow-hidden bg-[#0c0e10] lg:min-h-full">
              <RosslerAttractorVisual />
            </div>
          </div>
        </StorySheet>

        <StorySheet index={2} className="bg-[#dbe3ff] text-[#0a1027]">
          <div className="mx-auto grid min-h-[560px] w-full max-w-[1680px] lg:min-h-[78dvh] lg:grid-cols-[minmax(0,1.14fr)_minmax(300px,0.86fr)]">
            <div className="order-2 flex items-center px-5 py-10 sm:px-12 sm:py-14 lg:order-1 lg:px-16">
              <div className="w-full border-y border-[#0a1027]/18">
                {AGENT_ROWS.map(({ name, role, logo }, index) => (
                  <div
                    key={name}
                    className={`grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:py-6 ${
                      index > 0 ? 'border-t border-[#0a1027]/18' : ''
                    } ${name === 'Algoglyph' ? 'text-[#1737ee]' : ''}`}
                  >
                    <span className="flex min-w-0 items-center gap-4 text-[clamp(1.45rem,2.8vw,2.6rem)] font-semibold tracking-[-0.035em]">
                      <span>{name}</span>
                      {logo ? (
                        <img
                          src={logo}
                          alt=""
                          className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11"
                        />
                      ) : null}
                    </span>
                    <span className="font-mono text-[11px] text-[#0a1027]/64">{role}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-1 flex flex-col justify-end overflow-hidden border-b border-[#0a1027]/18 px-5 py-10 pt-[220px] sm:px-12 sm:py-14 sm:pt-[270px] lg:order-2 lg:border-b-0 lg:border-l lg:px-14 lg:py-16 lg:pt-[300px]">
              <AgentCluster />
              <h3 className="max-w-[8ch] text-[clamp(2.7rem,5.2vw,5.3rem)] font-semibold leading-[0.92] tracking-[-0.04em]">
                Agents enter your workspace.
              </h3>
              <p className="mt-6 max-w-[34ch] text-[15px] leading-[1.55] text-[#0a1027]/68 sm:text-[17px]">
                Let MCP clients write, draw, and leave editable work.
              </p>
            </div>
          </div>
        </StorySheet>

        <StorySheet index={3} className="bg-[#061035] text-white">
          <div className="lp-blueprint-field mx-auto grid min-h-[560px] w-full max-w-[1680px] lg:min-h-[78dvh] lg:grid-cols-[minmax(280px,0.6fr)_minmax(0,1.4fr)]">
            <div className="flex flex-col justify-end border-b border-white/12 px-5 py-10 sm:px-12 sm:py-14 lg:border-b-0 lg:border-r lg:px-14 lg:py-16">
              <h3 className="max-w-[8ch] text-[clamp(2.8rem,5.5vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
                Watch state change.
              </h3>
              <p className="mt-6 max-w-[32ch] text-[15px] leading-[1.55] text-blue-50/72 sm:text-[17px]">
                Step through algorithms frame by frame.
              </p>
            </div>
            <div
              id="visualizer"
              className="flex min-h-[340px] scroll-mt-16 items-center justify-center overflow-hidden bg-[#1737ee]/38 px-4 py-6 sm:py-8 lg:min-h-full lg:px-10"
            >
              <img
                src="/images/dsa/dijkstra-dark.jpg"
                alt="Dijkstra shortest-path lesson showing weighted edges, visited nodes, and distance updates"
                className="h-full max-h-[calc(78dvh-7rem)] w-full object-cover lg:object-contain"
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
    <section id="usecases" className="relative z-30 scroll-mt-16 bg-[#f2f2ef] px-5 py-20 text-[#111214] sm:px-12 sm:py-28">
      <div className="mx-auto max-w-[1500px]">
        <h2 className="w-full text-[clamp(2.7rem,5vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.04em]">
          One product. Every learning loop.
        </h2>
        <p className="mt-5 text-[17px] font-medium tracking-[-0.02em] text-[#111214]/62 sm:text-[20px]">
          Read. Map. Run. Retain.
        </p>

        <div className="mt-12 grid overflow-hidden border-y border-black/14 sm:mt-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <div className="relative min-h-[46dvh] overflow-hidden bg-[#171918] lg:min-h-[62dvh]">
            <img
              src="/illustrations/algorithms.png"
              alt="Chalkboard showing binary search, merge sort, and a recursive sorting flowchart"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-end border-t border-black/14 px-0 py-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
            <div className="border-t border-black/14 text-[15px] font-medium leading-[1.5] sm:text-[16px]">
              <p className="py-5">Roadmap: start with the concept.</p>
              <p className="border-t border-black/14 py-5">Canvas: map the relationship.</p>
              <p className="border-t border-black/14 py-5">Runner: test the model.</p>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-10 sm:mt-24 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
          <h3 className="max-w-[10ch] text-[clamp(2.2rem,4vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Different work. Same mental model.
          </h3>
          <div className="border-t border-black/18">
            {WORKFLOWS.map((workflow) => (
              <div
                key={workflow.title}
                className="grid gap-2 border-b border-black/14 py-6 sm:grid-cols-[minmax(180px,0.45fr)_minmax(0,1fr)] sm:gap-8"
              >
                <h4 className="text-[16px] font-semibold tracking-[-0.025em] sm:text-[18px]">{workflow.title}</h4>
                <p className="max-w-[48ch] text-[14px] leading-[1.55] text-[#111214]/64 sm:text-[15px]">{workflow.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="relative z-30 scroll-mt-16 border-t border-black/12 bg-[#f2f2ef] px-5 py-16 text-[#111214] sm:px-12 sm:py-24">
      <div className="mx-auto max-w-[980px]">
        <h2 className="max-w-[680px] text-[clamp(2.4rem,4.5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em]">
          Questions, answered plainly.
        </h2>

        <div className="mt-10 border-t border-black/18 sm:mt-12">
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
                  className="group flex w-full cursor-pointer items-center justify-between gap-5 py-5 text-left sm:py-6"
                >
                  <span className="pr-2 text-[16px] font-medium leading-snug text-[#111214]/80 transition-colors group-hover:text-[#111214] sm:text-[18px]">
                    {item.question}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.6}
                    className={`shrink-0 text-[#1737ee] transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  id={answerId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[720px] pb-6 pr-10 text-[14px] leading-[1.6] text-[#111214]/64 sm:text-[15px]">
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
  );
}

function PortalEnding({ onLaunch, onViewRoadmap }: LandingContinuationProps) {
  return (
    <section id="portal" className="relative z-30 min-h-[880px] overflow-hidden bg-black text-white sm:min-h-[100dvh]">
      <div className="relative z-30 mx-auto flex max-w-[1200px] flex-col items-center px-5 pt-16 text-center sm:px-12 sm:pt-20">
        <h2 className="max-w-[880px] text-balance text-[clamp(3rem,5.5vw,5.75rem)] font-semibold leading-[0.94] tracking-[-0.04em]">
          Make thought visible.
        </h2>
        <div className="mt-7 flex w-full max-w-[390px] flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onLaunch}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-[#050708] transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          >
            Launch Workspace
          </button>
          <button
            type="button"
            onClick={onViewRoadmap}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-white/18 px-6 text-[14px] font-semibold text-white/80 transition-[transform,border-color,color] hover:-translate-y-0.5 hover:border-white/42 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          >
            Explore Roadmap
          </button>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[35%] z-0 text-center text-[clamp(6.5rem,21vw,20rem)] font-semibold leading-none tracking-[-0.075em] text-white/[0.055]"
      >
        ALGOGLYPH
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 h-[68%] aspect-[972/1619] -translate-x-1/2 sm:h-[74%]">
        <img
          src="/illustrations/algoglyph-oracle.png"
          alt="Engraved algorithm cartographer shaping a sphere of graphs, arrays, and state transitions"
          loading="lazy"
          className="lp-oracle-figure absolute inset-0 h-full w-full object-contain object-bottom"
        />
        <img
          src="/illustrations/algoglyph-orb.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="lp-oracle-orb absolute left-[43%] top-[20%] w-[60%] max-w-none"
        />
      </div>
    </section>
  );
}

export function LandingContinuation({ onLaunch, onViewRoadmap }: LandingContinuationProps) {
  return (
    <>
      <InstallConnector />
      <StickyProductStory />
      <WhiteExplanation />
      <FAQ />
      <PortalEnding onLaunch={onLaunch} onViewRoadmap={onViewRoadmap} />
    </>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative z-30 border-t border-white/[0.07] bg-[#050708] px-6 py-10 sm:px-12 sm:py-12">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 font-mono text-[11px] tracking-[0.02em] text-white/48 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Algoglyph. Built for visual computer science.</span>
        <nav aria-label="Legal and repository" className="flex flex-wrap items-center gap-5 sm:gap-7">
          <a href="/privacy" className="underline-offset-4 transition-colors hover:text-white hover:underline">
            Privacy
          </a>
          <a href="/terms" className="underline-offset-4 transition-colors hover:text-white hover:underline">
            Terms
          </a>
          <a
            href="https://github.com/Algoglyph/AlgoGlyph"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Repository
          </a>
        </nav>
      </div>
    </footer>
  );
}
