const fs = require('fs');
const path = require('path');

const contentDir = './content';
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

console.log(`Found ${files.length} markdown files in ${contentDir}:\n`);

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

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

files.forEach(f => {
  const filePath = path.join(contentDir, f);
  const md = fs.readFileSync(filePath, 'utf8');
  const slug = fileSlugMap[f] || f.replace('.md', '');
  
  const hasLatex = md.includes('$') || md.includes('\\(') || md.includes('\\[');
  const mathDollarCount = (md.match(/\$/g) || []).length;
  const hasSvg = md.includes('<svg') && md.includes('</svg>');
  const inBlogData = blogDataRaw.includes(`"slug": "${slug}"`);
  const inDeBlogData = deBlogDataRaw.includes(`'${slug}':`);

  console.log(`File: ${f} -> Slug: '${slug}'`);
  console.log(`  - Length: ${md.length} chars`);
  console.log(`  - Has SVG: ${hasSvg ? 'YES' : '❌ NO'}`);
  console.log(`  - Dollar ($) Count: ${mathDollarCount}`);
  console.log(`  - In blogData.ts: ${inBlogData ? 'YES' : 'NO'}`);
  console.log(`  - In deBlogData.ts: ${inDeBlogData ? 'YES' : 'NO'}`);
});
