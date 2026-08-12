import { useEffect } from 'react';
import type { FC, MouseEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { AsciiCodeSculpturesField } from './landing/AsciiCodeSculpturesField';
import { LandingContinuation, LandingFooter } from './landing/LandingContinuation';
import { LiquidGlassHeadline } from './landing/LiquidGlassHeadline';

interface LandingPageProps {
  onLaunch: () => void;
  onViewRoadmap: () => void;
  onViewBlog?: (slug?: string) => void;
}

const LANDING_SECTIONS = [
  { label: 'Features', id: 'features' },
  { label: 'Use Cases', id: 'usecases' },
] as const;

export const LandingPage: FC<LandingPageProps> = ({ onLaunch, onViewRoadmap }) => {
  useEffect(() => {
    const scrollToHashTarget = () => {
      const targetId = window.location.hash.slice(1);
      if (!targetId) return;

      window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
      });
    };

    scrollToHashTarget();
    window.addEventListener('hashchange', scrollToHashTarget);
    return () => window.removeEventListener('hashchange', scrollToHashTarget);
  }, []);

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
        <a href="/" aria-label="AlgoGlyph home" className="flex items-center gap-3 text-white no-underline">
          <img
            src="/favicon.png"
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 object-contain"
          />
          <span className="font-display text-lg font-bold tracking-[-0.03em] text-white">
            AlgoGlyph
          </span>
        </a>

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
          <a
            href="/roadmap"
            onClick={(event) => { event.preventDefault(); onViewRoadmap(); }}
            className="cursor-pointer rounded border border-white/5 bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-white/80 transition-colors hover:text-white"
          >
            Roadmap
          </a>
          <a href="/about" className="whitespace-nowrap transition-colors hover:text-white">About</a>
        </nav>

        <a
          href="/workspace"
          onClick={(event) => { event.preventDefault(); onLaunch(); }}
          className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[14.5px] font-semibold text-black transition-colors hover:bg-neutral-200"
        >
          <span className="hidden sm:inline">Launch Workspace</span>
          <span className="sm:hidden">Launch</span>
          <ArrowRight aria-hidden="true" size={13} strokeWidth={2.25} />
        </a>
      </header>

      <main>
        <section className="relative min-h-[clamp(540px,72dvh,680px)] overflow-hidden bg-[var(--lp-hero-bg)] pt-16">
          <div className="absolute inset-0 opacity-60 sm:opacity-75">
            <AsciiCodeSculpturesField />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,7,8,0.98)_0%,rgba(5,7,8,0.9)_60%,rgba(5,7,8,0.12)_100%)] sm:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_42%_68%_at_50%_50%,rgba(5,7,8,0.99)_0%,rgba(5,7,8,0.9)_58%,rgba(5,7,8,0.04)_100%)] sm:block"
          />

          <div className="relative z-10 mx-auto flex min-h-[calc(clamp(540px,72dvh,680px)_-_4rem)] w-full max-w-[1040px] flex-col items-center justify-center px-5 py-12 text-center sm:px-12 sm:py-16">
            <LiquidGlassHeadline />

            <p className="mt-5 max-w-[570px] text-balance text-[14px] leading-[1.55] tracking-[-0.012em] text-[var(--lp-hero-muted)] sm:mt-6 sm:text-[16px]">
              Give any MCP client access to notes, canvas, code, and visualizers, all locally.
            </p>

            <div
              className="mt-7 flex w-full max-w-[390px] flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center"
              aria-label="Hero actions"
            >
              <a
                href="/workspace"
                onClick={(event) => { event.preventDefault(); onLaunch(); }}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-[#050708] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--lp-hero-cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050708] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
              >
                Launch Workspace
                <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
              </a>
              <a
                href="/roadmap"
                onClick={(event) => { event.preventDefault(); onViewRoadmap(); }}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-white/18 bg-white/[0.025] px-6 text-[14px] font-semibold text-white/82 transition-[transform,border-color,color] duration-300 hover:-translate-y-0.5 hover:border-white/42 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)] active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
              >
                Explore Roadmap
              </a>
            </div>
          </div>
        </section>
        <LandingContinuation onLaunch={onLaunch} onViewRoadmap={onViewRoadmap} />
      </main>
      <LandingFooter />
    </div>
  );
};
