const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

const fileSlugMap = {
  'approxalgos.md': 'approximation-algorithm-bounds-bounds',
  'cfg.md': 'cfg-production-grammars-bounds',
  'chomsky.md': 'chomsky-grammar-hierarchies',
  'churchturing.md': 'church-turing-computability-lambda-calculus',
  'circuitcomplexity.md': 'circuit-complexity-gates-bounds',
  'cooklevin.md': 'cook-levin-theorem-sat-formulas',
  'detvsnon.md': 'deterministic-vs-non-deterministic-complexity',
  'dfa.md': 'dfa-state-transitions-automatas',
  'dijkstra.md': 'dijkstra-algorithm',
  'godel.md': 'g-del-incompleteness-logic-limits',
  'graphiso.md': 'graph-isomorphism-classification',
  'halting.md': 'halting-problem-undecidability-contradiction',
  'interactiveproofs.md': 'interactive-proofs-ip-classes',
  'npcomplete.md': 'np-complete-polynomial-reductions',
  'parameterized.md': 'parameterized-complexity-tractability-splits',
  'pda.md': 'pushdown-automata-stack-transitions',
  'polyverify.md': 'polynomial-time-verification-runs',
  'pspace.md': 'space-complexity-class-pspace',
  'pvsnp.md': 'p-vs-np-class-limits',
  'quantum.md': 'quantum-complexity-bqp-bounds',
  'randomized.md': 'randomized-algorithm-probability-checks',
  'regex.md': 'regular-language-matches-expressions',
  'satsolvers.md': 'boolean-satisfiability-solvers-algorithms',
  'timehier.md': 'time-hierarchy-theorem-bounds',
  'turing.md': 'turing-tape-state-transitions',
  'zeroknowledge.md': 'zero-knowledge-proof-protocols-verification'
};

Object.entries(fileSlugMap).forEach(([file, slug]) => {
  const contentMd = fs.readFileSync(`./content/${file}`, 'utf8');

  // Find slug in blogData.ts
  const pos = blogDataRaw.indexOf(`"slug": "${slug}"`);
  if (pos !== -1) {
    const end = blogDataRaw.indexOf('"content":', pos);
    const slice = blogDataRaw.substring(pos, end !== -1 ? end : pos + 5000);
    const mdMatch = slice.match(/"markdown":\s*"([\s\S]*?)"\s*,\s*"\w+":/);
    const mdInBlogData = mdMatch ? mdMatch[1] : null;

    console.log(`Slug: ${slug}`);
    console.log(`  - File content length: ${contentMd.length}`);
    console.log(`  - blogData.ts markdown length: ${mdInBlogData ? mdInBlogData.length : 0}`);
    if (mdInBlogData) {
      console.log(`  - Same content? ${contentMd.trim() === mdInBlogData.trim() ? 'YES' : 'NO'}`);
      console.log(`  - Has SVG in blogData.ts? ${mdInBlogData.includes('<svg')}`);
    }
  } else {
    console.log(`Slug: ${slug} NOT FOUND in blogData.ts!`);
  }
});
