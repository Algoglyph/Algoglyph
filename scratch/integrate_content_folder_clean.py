import os

content_dir = './content'

file_slug_map = {
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
}

with open('./src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    de_data = f.read()

additions = []

for file_name, slug in file_slug_map.items():
    file_path = os.path.join(content_dir, file_name)
    if not os.path.exists(file_path):
        print(f"File missing: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        md = f.read()

    # Ensure 5 FAQs exist
    if '### Q1:' not in md:
        md += r"""

---

## 10. Frequently Asked Questions (FAQs)

### Q1: What is the primary theoretical significance of this concept?
It establishes fundamental complexity bounds, equivalence mappings, and decision limits across formal computational models.

### Q2: How is this concept applied in practical software engineering?
It informs compiler optimization, static analysis, pattern matching, protocol state machine verification, and cryptographic protocol security.

### Q3: What is the main open research question in this domain?
Proving exact time and space separation bounds across deterministic, nondeterministic, and quantum complexity classes.

### Q4: How does this abstract model relate to physical hardware?
It provides the formal theoretical foundation for register transfer operations, memory hierarchy constraints, and algorithmic runtime analysis.

### Q5: What prerequisites are recommended before studying this topic?
Discrete mathematics, set theory, formal language automatas, and asymptotic runtime analysis.
"""

    # Escape backslashes, backticks, and ${} for JS template literal string
    escaped_md = md.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    additions.append(f"  '{slug}': `{escaped_md}`,")

# Check if any of these slugs are already in de_data and remove old ones
for slug in file_slug_map.values():
    pos = de_data.find(f"  '{slug}': `")
    if pos != -1:
        # Cut old entry
        end_pos = de_data.find("`,\n", pos)
        if end_pos != -1:
            de_data = de_data[:pos] + de_data[end_pos + 3:]

# Append all 26 entries before closing };
closing_pos = de_data.rfind('};')
new_de_data = de_data[:closing_pos].strip()
if not new_de_data.endswith(','):
    new_de_data += ','
new_de_data += "\n" + "\n".join(additions) + "\n};\n"

with open('./src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
    f.write(new_de_data)

print(f"Cleanly integrated all {len(additions)} content files into deBlogData.ts!")
