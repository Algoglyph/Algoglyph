export const SITE_IDENTITY = {
  name: 'AlgoGlyph',
  url: 'https://algoglyph.com',
  locale: 'en_US',
  language: 'en',
  logoPath: '/favicon.png',
  defaultImagePath: '/og-image.png',
  defaultImageWidth: 1024,
  defaultImageHeight: 1024,
  githubUrl: 'https://github.com/Algoglyph/AlgoGlyph',
  description:
    'AlgoGlyph is a local-first visual computer science workspace that combines canvas diagrams, notes, code, algorithm visualizers, an interactive roadmap, and MCP-connected agents.',
} as const;

export const LANDING_FAQ = [
  {
    question: 'What is AlgoGlyph?',
    answer:
      'AlgoGlyph is a local-first visual computer science workspace for notes, canvas diagrams, code, algorithm visualizers, MCP agents, and a structured computer science roadmap.',
  },
  {
    question: 'Who is AlgoGlyph for?',
    answer:
      'AlgoGlyph is designed for computer science students, self-directed learners, interview candidates, and developers who understand technical ideas best by connecting explanations, diagrams, and executable code.',
  },
  {
    question: 'Can I create connected visual notes?',
    answer:
      'Yes. Notes and editable diagrams can sit side by side in the same tab, while additional tabs keep related topics and experiments organized.',
  },
  {
    question: 'Can I run and visualize code?',
    answer:
      'Yes. AlgoGlyph includes a coding workspace and step-by-step visualizers for arrays, graphs, grids, tables, trees, and other algorithm families.',
  },
  {
    question: 'Does AlgoGlyph include a computer science roadmap?',
    answer:
      'Yes. The public roadmap connects data structures, algorithms, computer science fundamentals, system design, machine learning, backend engineering, and related disciplines.',
  },
  {
    question: 'Is AlgoGlyph free?',
    answer: 'Yes. The core workspace and public computer science roadmap are free for personal learning.',
  },
] as const;
