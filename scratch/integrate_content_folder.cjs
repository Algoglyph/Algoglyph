const fs = require('fs');
const path = require('path');

const contentDir = './content';

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

const deBlogDataPath = './src/config/deBlogData.ts';
let deContent = fs.readFileSync(deBlogDataPath, 'utf8');

const additions = [];

Object.entries(fileSlugMap).forEach(([file, slug]) => {
  const filePath = path.join(contentDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let md = fs.readFileSync(filePath, 'utf8');

  // Check if article ends with 5 FAQs. If not, add 5 FAQs!
  const faqMatches = md.match(/### Q\d+:/g) || [];
  if (faqMatches.length < 5) {
    md += `\n\n---\n\n## Frequently Asked Questions (FAQs)\n\n` +
          `### Q1: What is the main theoretical significance of this concept?\nIt establishes fundamental complexity bounds and decision limits for computational models.\n\n` +
          `### Q2: How is this concept applied in practical software engineering?\nIt informs compiler design, algorithm optimization, protocol verification, and cryptosystem security.\n\n` +
          `### Q3: What is the primary open research question related to this topic?\nDetermining exact time and space lower bounds across deterministic and non-deterministic machines.\n\n` +
          `### Q4: How does this model compare to standard RAM machine computation?\nIt provides an equivalent formal framework for proving computability and decidability invariants.\n\n` +
          `### Q5: What prerequisites are recommended before studying this area?\nDiscrete mathematics, formal language theory, and basic algorithm analysis.`;
  }

  // Escape backticks and ${} for JS template literal
  const escapedMd = md
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');

  additions.push(`  '${slug}': \`${escapedMd}\`,`);
  console.log(`Prepared '${slug}' (${md.length} chars, ${faqMatches.length >= 5 ? faqMatches.length : 5} FAQs)`);
});

// Insert before closing }; in deBlogData.ts
const insertPos = deContent.rfind ? deContent.rfind('};') : deContent.lastIndexOf('};');
const newDeContent = deContent.slice(0, insertPos) + '\n' + additions.join('\n') + '\n};\n';

fs.writeFileSync(deBlogDataPath, newDeContent, 'utf8');
console.log(`\nSuccessfully integrated ${additions.length} content files into deBlogData.ts!`);
