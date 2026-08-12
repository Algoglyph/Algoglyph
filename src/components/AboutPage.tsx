import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_IDENTITY } from '../config/siteIdentity';

const COVERAGE = [
  'Data structures and algorithms',
  'Computer science fundamentals',
  'Competitive programming patterns',
  'System design and backend engineering',
  'Machine learning and data engineering',
] as const;

export function AboutPage() {
  return (
    <div className="h-screen w-full overflow-y-auto bg-[#050708] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050708]/90 px-6 py-4 backdrop-blur sm:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-white/70 no-underline hover:text-white">
            <ArrowLeft aria-hidden="true" size={15} />
            Home
          </Link>
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black no-underline hover:bg-neutral-200"
          >
            Open workspace
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 sm:px-12 sm:py-24">
        <article className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-blue-300">About AlgoGlyph</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-[-0.045em] sm:text-7xl">
            A visual workspace for learning computer science.
          </h1>
          <p className="mt-8 text-xl leading-8 text-white/72">
            {SITE_IDENTITY.description}
          </p>

          <section className="mt-16 border-t border-white/12 pt-10">
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">What problem does AlgoGlyph solve?</h2>
            <p className="mt-5 text-base leading-7 text-white/68">
              Computer science learning is often split across videos, documents, diagram tools, code editors, and
              disconnected practice sites. AlgoGlyph brings the explanation, visual model, implementation, and
              execution trace into one workspace, so a learner can move from an idea to a testable mental model
              without losing context.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">Who is it for?</h2>
            <p className="mt-5 text-base leading-7 text-white/68">
              AlgoGlyph is for computer science students, self-directed learners, interview candidates, educators,
              and working developers who benefit from connecting diagrams, notes, and executable code. Workspace
              data is local-first; public roadmap material is separate from private user work.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">What can you study?</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {COVERAGE.map((topic) => (
                <li key={topic} className="rounded-xl border border-white/12 bg-white/[0.035] px-4 py-4 text-white/75">
                  {topic}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">What makes it different?</h2>
            <p className="mt-5 text-base leading-7 text-white/68">
              AlgoGlyph is visual-first and editable. Its canvas uses native workspace drawing primitives, its
              visualizers show state changes step by step, and its MCP connector lets a user-selected local agent add
              notes, code, and diagrams to the same workspace. The result remains user-editable rather than becoming
              a static generated image.
            </p>
          </section>

          <nav aria-label="Explore AlgoGlyph" className="mt-16 flex flex-wrap gap-3 border-t border-white/12 pt-10">
            <Link to="/roadmap" className="rounded-full border border-white/18 px-5 py-3 text-sm text-white no-underline hover:bg-white/10">
              Explore the CS roadmap
            </Link>
            <Link to="/workspace" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black no-underline hover:bg-neutral-200">
              Launch the workspace
            </Link>
            <a
              href={SITE_IDENTITY.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/18 px-5 py-3 text-sm text-white no-underline hover:bg-white/10"
            >
              View the repository
            </a>
          </nav>
        </article>
      </main>
    </div>
  );
}

