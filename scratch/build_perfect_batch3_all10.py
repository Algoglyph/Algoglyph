import json
import re

with open('scratch/build_full_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

with open('scratch/expand_all_10_batch3_heavy.py', 'r', encoding='utf-8') as f:
    exp_text = f.read()

# Extract additions_batch3 dict from expand_all_10_batch3_heavy.py
p_add = exp_text.find('additions_batch3 = {')
p_end = exp_text.find('\n# Apply additions_batch3', p_add)
additions_code = exp_text[p_add:p_end]

scope = {}
exec(additions_code, scope)
additions = scope['additions_batch3']

# Extract md_21 to md_30 from build_full_batch3.py
md_dict = {}
for i in range(21, 31):
    token = f'md_{i} = r"""'
    p1 = text.find(token)
    if p1 != -1:
        p1 += len(token)
        p2 = text.find('"""\n\n# Register', p1)
        if p2 == -1:
            p2 = text.find('"""\n\nmd_', p1)
        if p2 == -1:
            p2 = text.find('"""\n\n', p1)
        md_dict[i] = text[p1:p2]

blogs = {}

def add_blog(slug, title, tagline, category, read_time, prereqs, related, practice_probs, markdown):
    headers = [line.strip() for line in markdown.splitlines() if re.match(r'^#{1,6}\s+[A-Za-z0-9]', line.strip())]
    header_counts = {}
    for h in headers:
        header_counts[h] = header_counts.get(h, 0) + 1
        if header_counts[h] > 1:
            raise ValueError(f"DUPLICATE HEADER IN '{slug}': {h}")
            
    length = len(markdown)
    assert length >= 10100, f"Blog '{slug}' is too short ({length} chars). Needs >= 10,100 chars."
    print(f"Verified '{slug}': {length:,} chars. Start: {repr(markdown[:65])}")
    
    blogs[slug] = {
        "slug": slug,
        "title": title,
        "tagline": tagline,
        "category": category,
        "readTime": read_time,
        "lastUpdated": "July 2026",
        "prerequisites": prereqs,
        "related": related,
        "practiceProblems": practice_probs,
        "markdown": markdown
    }

configs = [
    (21, "dijkstra", "Dijkstra's Shortest Path & Priority Queue Operations", "Non-negative edge weight shortest paths, priority queue mechanics, and A* heuristic extensions.", "Graph Algorithms", 36, ["graph-basics", "priority-queue"], ["bellman-ford", "floyd-warshall", "a-star"]),
    (22, "dynamic-programming", "Dynamic Programming (DP): Overlapping Subproblems & Optimal Substructure", "Memoization vs tabulation, state space optimization, LCS, and Knapsack formulations.", "Algorithms", 38, ["recursion", "arrays"], ["greedy", "memoization"]),
    (23, "greedy", "Greedy Algorithms: Local Optimality, Matroids & Fractional Knapsack", "Greedy choice property, exchange arguments, Huffman coding, and Matroid optimization.", "Algorithms", 34, ["sorting", "priority-queue"], ["dynamic-programming", "huffman-coding"]),
    (24, "backtracking", "Constraint Backtracking: State-Space Trees & Pruning Mechanics", "State-space tree exploration, N-Queens, Sudoku solvers, and MRV pruning strategies.", "Algorithms", 36, ["dfs", "recursion"], ["recursion", "bitmasking"]),
    (25, "searching", "Linear, Binary & Multi-Interval Searching", "Binary search invariants, answer space search, ternary search, and predicate evaluation.", "Algorithms", 34, ["arrays"], ["binary-search", "sorting"]),
    (26, "sorting", "Divide-and-Conquer Sorting Paradigms: QuickSort, MergeSort & HeapSort", "Comparison lower bounds, Hoare partitioning, stable MergeSort, and non-comparison Radix sort.", "Algorithms", 36, ["arrays", "recursion"], ["searching", "heaps"]),
    (27, "tree-traversal", "Hierarchical Tree Traversals: BFS, DFS & Euler Tours", "DFS pre/in/post order, BFS level-order, Euler tree flattening, and Binary Lifting LCA.", "Data Structures", 34, ["binary-trees", "stacks-queues"], ["lowest-common-ancestor", "euler-tour"]),
    (28, "mst-union-find", "Minimum Spanning Trees & Disjoint Set Forests (Kruskal, Prim, Union-Find)", "Cut and cycle properties, Kruskal's DSU path compression, and Prim's min-heap MST.", "Graph Algorithms", 36, ["graphs", "priority-queue"], ["dsu", "dijkstra"]),
    (29, "scc-bridges", "Strongly Connected Components & Bridges: Tarjan, Kosaraju & Low-Link Values", "Directed SCCs, Tarjan's low-link discovery time algorithm, Kosaraju 2-pass DFS, and bridges.", "Graph Algorithms", 36, ["dfs", "directed-graphs"], ["tarjan", "kosaraju"]),
    (30, "string-algorithms", "Pattern Matching & String Invariants: KMP, Rabin-Karp, Z-Algorithm & Tries", "Knuth-Morris-Pratt prefix function, polynomial rolling hashes, Z-array, and Trie data structures.", "Algorithms", 36, ["strings", "hash-tables"], ["kmp", "trie"])
]

print("=== GENERATING AND VERIFYING ALL BATCH 3 BLOGS ===")

for idx, slug, title, tagline, cat, rt, prereqs, rel in configs:
    raw_md = md_dict[idx]
    
    # Strip any existing FAQ sections from raw_md
    raw_md_clean = re.sub(r'\n## Frequently Asked Questions.*', '', raw_md, flags=re.DOTALL).strip()
    
    # Get addition
    extra = additions.get(idx, "").strip()
    extra_clean = re.sub(r'\n## Frequently Asked Questions.*', '', extra, flags=re.DOTALL).strip()
    
    # Extract FAQs from original raw_md if present
    faq_match = re.search(r'(## Frequently Asked Questions[\s\S]*)', raw_md)
    if faq_match:
        faq_text = faq_match.group(1).strip()
        # Keep only one header and 5 FAQs
        faq_lines = faq_text.splitlines()
        clean_faq_lines = []
        header_added = False
        for line in faq_lines:
            if 'Frequently Asked Questions' in line:
                if not header_added:
                    clean_faq_lines.append("## Frequently Asked Questions (FAQs)")
                    header_added = True
            else:
                clean_faq_lines.append(line)
        faq_section = "\n".join(clean_faq_lines)
    else:
        faq_section = ""
        
    full_md = raw_md_clean + "\n\n" + extra_clean + "\n\n" + faq_section
    
    add_blog(
        slug=slug,
        title=title,
        tagline=tagline,
        category=cat,
        read_time=rt,
        prereqs=prereqs,
        related=rel,
        practice_probs=[{"title": f"{title} Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
        markdown=full_md
    )

output_json = 'scratch/ai_batch3_heavy.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"\nSUCCESSFULLY SAVED ALL {len(blogs)} BATCH 3 BLOGS IN {output_json}!")
