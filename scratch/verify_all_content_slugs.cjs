const fs = require('fs');

const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

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

let passCount = 0;
let latexCheckCount = 0;
let svgCheckCount = 0;

Object.entries(fileSlugMap).forEach(([file, slug]) => {
  const token = `'${slug}': \``;
  const start = deBlogDataRaw.indexOf(token);
  if (start !== -1) {
    const end = deBlogDataRaw.indexOf('`,', start);
    const md = deBlogDataRaw.substring(start, end !== -1 ? end : start + 30000);

    const hasLatex = md.includes('\\\\delta') || md.includes('\\\\Sigma') || md.includes('\\\\to') || md.includes('\\\\in') || md.includes('\\\\forall') || md.includes('$');
    const hasSvg = md.includes('<svg') && md.includes('</svg>');
    const faqCount = (md.match(/### Q\d+:/g) || []).length;

    if (hasLatex) latexCheckCount++;
    if (hasSvg) svgCheckCount++;
    if (hasLatex && hasSvg && faqCount >= 5) passCount++;

    console.log(`Slug '${slug}': LaTeX=${hasLatex ? '✅' : '❌'}, SVG=${hasSvg ? '✅' : '❌'}, FAQs=${faqCount}`);
  } else {
    console.log(`Slug '${slug}' NOT FOUND in deBlogData.ts!`);
  }
});

console.log(`\n=================================================`);
console.log(` VERIFICATION SUMMARY FOR 26 THEORETICAL CS / DSA BLOGS`);
console.log(`=================================================`);
console.log(`✅ Articles with Pristine LaTeX Math: ${latexCheckCount} / 26`);
console.log(`✅ Articles with Visual SVG Diagrams: ${svgCheckCount} / 26`);
console.log(`✅ All Checks Passed (LaTeX + SVG + FAQs): ${passCount} / 26`);
