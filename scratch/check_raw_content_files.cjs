const fs = require('fs');

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

console.log(`Checking 26 raw markdown files in content/...\n`);

let totalSvgs = 0;
let totalLatexMath = 0;

Object.entries(fileSlugMap).forEach(([file, slug]) => {
  const md = fs.readFileSync(`./content/${file}`, 'utf8');
  const hasSvg = md.includes('<svg') && md.includes('</svg>');
  const mathMatches = md.match(/\$([^$]+)\$/g) || [];
  
  if (hasSvg) totalSvgs++;
  if (mathMatches.length > 0) totalLatexMath++;

  console.log(`[${file}] -> '${slug}':`);
  console.log(`  - Has SVG: ${hasSvg ? '✅ YES' : '❌ NO'}`);
  console.log(`  - LaTeX Inline/Block Math Count: ${mathMatches.length}`);
});

console.log(`\n======================================================`);
console.log(`✅ Files with Inline SVG Diagrams: ${totalSvgs} / 26`);
console.log(`✅ Files with LaTeX Math Formulae: ${totalLatexMath} / 26`);
console.log(`======================================================\n`);
