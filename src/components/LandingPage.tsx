import type { FC, MouseEvent, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { AsciiCodeSculpturesField } from './landing/AsciiCodeSculpturesField';
import { LandingContinuation, LandingFooter } from './landing/LandingContinuation';
import { LiquidGlassHeadline } from './landing/LiquidGlassHeadline';

interface LandingPageProps {
  onLaunch: () => void;
  onViewRoadmap: () => void;
  onViewBlog?: (slug?: string) => void;
}

interface IllustratedActionProps {
  children: ReactNode;
  label: string;
  onClick: () => void;
}

const LANDING_SECTIONS = [
  { label: 'Features', id: 'features' },
  { label: 'Visualizers', id: 'visualizer' },
  { label: 'Use Cases', id: 'usecases' },
] as const;

const WorkspaceBookIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 128 108"
    className="h-[78px] w-[92px] overflow-visible sm:h-[88px] sm:w-[106px]"
    fill="none"
  >
    <path
      d="M8 72c18-5 37-3 56 10 18-13 37-15 56-10l-3 23c-20-4-37-1-53 10-16-11-33-14-53-10L8 72Z"
      fill="currentColor"
      opacity="0.1"
    />
    <path
      d="M8 72c20-5 39-2 56 10 17-12 36-15 56-10M11 86c20-4 37-1 53 10 16-11 33-14 53-10M64 82v14"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M65 76c4-17 12-32 24-44 8-8 17-13 25-25 2 15-1 28-10 38-8 9-20 14-33 17 8-1 15-3 22-7-5 9-14 16-28 21Z"
      fill="currentColor"
    />
    <path
      d="M65 75C75 54 91 32 112 9"
      stroke="#070a0b"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="m68 61 13-13m-8 5 1-12m8 2 14-10M65 70l-5 17 5-5 3 6 2-16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RoadmapBookIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 128 108"
    className="h-[78px] w-[92px] overflow-visible sm:h-[88px] sm:w-[106px]"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M13 26c20-5 37 1 51 15 14-14 31-20 51-15v57c-19-3-36 1-51 14-15-13-32-17-51-14V26Z"
      strokeWidth="2.4"
    />
    <path d="M64 41v56M13 32 7 35v55c21-3 40 0 57 7 17-7 36-10 57-7V35l-6-3" strokeWidth="1.7" opacity="0.66" />
    <path d="M23 44c12-2 22 1 31 8M23 57c12-2 22 1 31 8M23 70c12-2 22 1 31 8" strokeWidth="2" />
    <path d="M105 44c-12-2-22 1-31 8M105 57c-12-2-22 1-31 8M105 70c-12-2-22 1-31 8" strokeWidth="2" />
  </svg>
);

const IllustratedAction: FC<IllustratedActionProps> = ({ children, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="group relative flex h-[104px] min-w-0 flex-1 cursor-pointer items-center justify-center rounded-[1.65rem] bg-white/[0.025] p-1.5 text-white/68 ring-1 ring-inset ring-white/[0.07] transition-[transform,color,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-white/[0.045] hover:text-[var(--lp-hero-cyan)] focus-visible:outline-none focus-visible:ring-[var(--lp-hero-cyan)] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:h-[122px] sm:w-[148px] sm:flex-none"
  >
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-1.5 rounded-[calc(1.65rem-0.375rem)] bg-[radial-gradient(circle_at_50%_35%,rgba(131,234,255,0.08),rgba(255,255,255,0.018)_48%,rgba(0,0,0,0.1)_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.09)]"
    />
    <span className="relative transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:scale-[1.035] motion-reduce:transform-none">
      {children}
    </span>
    <span className="sr-only">{label}</span>
  </button>
);

export const LandingPage: FC<LandingPageProps> = ({ onLaunch, onViewRoadmap }) => {
  const handleSectionLink = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      data-landing-theme="dark"
      className="landing-page-shell h-full min-h-screen w-full overflow-y-auto bg-[var(--lp-hero-bg)] text-white font-sans antialiased"
    >
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.04] bg-black/60 px-6 backdrop-blur-md sm:px-12">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 object-contain"
          />
          <span className="font-display text-lg font-bold tracking-[-0.03em] text-white">
            Algoglyph
          </span>
        </div>

        <nav
          aria-label="Landing page"
          className="hidden items-center gap-10 text-[15px] font-medium text-white/70 md:flex"
        >
          {LANDING_SECTIONS.map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(event) => handleSectionLink(event, id)}
              className="whitespace-nowrap transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
          <button
            type="button"
            onClick={onViewRoadmap}
            className="cursor-pointer rounded border border-white/5 bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-white/80 transition-colors hover:text-white"
          >
            Roadmap
          </button>
        </nav>

        <button
          type="button"
          onClick={onLaunch}
          className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[14.5px] font-semibold text-black transition-colors hover:bg-neutral-200"
        >
          <span className="hidden sm:inline">Launch Workspace</span>
          <span className="sm:hidden">Launch</span>
          <ArrowRight aria-hidden="true" size={13} strokeWidth={2.25} />
        </button>
      </header>

      <main>
        <section className="relative min-h-[100dvh] overflow-hidden bg-[var(--lp-hero-bg)] pt-16">
          <div className="absolute inset-0">
            <AsciiCodeSculpturesField />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,7,8,0.98)_0%,rgba(5,7,8,0.98)_62%,rgba(5,7,8,0)_68%)] sm:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_48%_56%_at_50%_49%,rgba(5,7,8,1)_0%,rgba(5,7,8,0.92)_52%,rgba(5,7,8,0)_100%)] sm:block"
          />

          <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1040px] flex-col items-center justify-start px-5 pb-[17rem] pt-14 text-center sm:justify-center sm:px-12 sm:py-20">
            <div className="flex items-center gap-3 font-mono text-[9px] font-medium uppercase tracking-[0.3em] text-[var(--lp-hero-muted)] sm:text-[10px]">
              <span aria-hidden="true" className="h-px w-7 bg-white/20 sm:w-10" />
              <span>Visual Computer Science Workspace</span>
              <span aria-hidden="true" className="h-px w-7 bg-white/20 sm:w-10" />
            </div>

            <LiquidGlassHeadline />

            <p className="mt-6 max-w-[660px] text-balance text-[14px] leading-[1.55] tracking-[-0.012em] text-[var(--lp-hero-muted)] sm:mt-7 sm:text-[17px] sm:leading-[1.5]">
              Notes, an infinite whiteboard, a code runner, and live visualizers, all in one place.
              Stop juggling six tabs and start seeing how computer science actually works, then
              check out the roadmap for 1000+ articles.
            </p>

            <div
              className="mt-7 flex w-full max-w-[350px] items-center justify-center gap-3 sm:mt-9 sm:max-w-none sm:gap-8"
              aria-label="Hero actions"
            >
              <IllustratedAction label="Launch Workspace" onClick={onLaunch}>
                <WorkspaceBookIcon />
              </IllustratedAction>
              <IllustratedAction label="Explore CS Roadmap" onClick={onViewRoadmap}>
                <RoadmapBookIcon />
              </IllustratedAction>
            </div>
          </div>
        </section>
        <LandingContinuation onLaunch={onLaunch} />
      </main>
      <LandingFooter />
    </div>
  );
};
