import type { FC, MouseEvent } from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
  onViewRoadmap: () => void;
  onViewBlog?: (slug?: string) => void;
}

const LANDING_SECTIONS = [
  { label: 'Features', id: 'features' },
  { label: 'Visualizers', id: 'visualizer' },
  { label: 'Use Cases', id: 'usecases' },
] as const;

/**
 * The landing page is intentionally empty beneath the restored site header.
 * Its former content and future redesign context remain archived in
 * docs/landing-page-context.md.
 */
export const LandingPage: FC<LandingPageProps> = ({ onLaunch, onViewRoadmap }) => {
  const handleSectionLink = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      data-landing-theme="dark"
      className="min-h-screen w-full bg-[#08080a] text-white font-sans antialiased"
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
    </div>
  );
};
