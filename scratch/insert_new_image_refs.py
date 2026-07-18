# -*- coding: utf-8 -*-
with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    content = f.read()

REPLACEMENTS = {
    '# BFS Traversal: Radial Wavefront Expansion & Shortest Paths\\n\\n': 
    '# BFS Traversal: Radial Wavefront Expansion & Shortest Paths\\n\\n![BFS Traversal](/images/dsa/bfs-traversal-dark.png#dark)\\n\\n',
    
    '# Bellman-Ford Algorithm: Edge Relaxations, SPFA Optimizations & Negative Cycles\\n\\n':
    '# Bellman-Ford Algorithm: Edge Relaxations, SPFA Optimizations & Negative Cycles\\n\\n![Bellman-Ford Algorithm](/images/dsa/bellman-ford-dark.png#dark)\\n\\n',
    
    '# Bellman-Ford & Floyd-Warshall: Negative Weights, Cycles & All-Pairs Paths\\n\\n':
    '# Bellman-Ford & Floyd-Warshall: Negative Weights, Cycles & All-Pairs Paths\\n\\n![Bellman-Ford & Floyd-Warshall](/images/dsa/bellman-ford-floyd-warshall-dark.png#dark)\\n\\n',
    
    '# Binary Heaps & Priority Queues\\n\\n':
    '# Binary Heaps & Priority Queues\\n\\n![Binary Heaps & Priority Queues](/images/dsa/heap-dark.png#dark)\\n\\n',
    
    '# Binary Search Trees: Structural Order Invariants & Node Deletions\\n\\n':
    '# Binary Search Trees: Structural Order Invariants & Node Deletions\\n\\n![Binary Search Trees](/images/dsa/binary-search-trees-dark.png#dark)\\n\\n'
}

replaced_count = 0
for old, new in REPLACEMENTS.items():
    if old in content:
        content = content.replace(old, new)
        replaced_count += 1
        print(f"Replaced {old[:30]}...")
    else:
        old_normalized = old.replace('\\n', '\n')
        new_normalized = new.replace('\\n', '\n')
        if old_normalized in content:
            content = content.replace(old_normalized, new_normalized)
            replaced_count += 1
            print(f"Replaced normalized {old[:30]}...")
        else:
            print(f"Warning: could not find {old[:30]} in blogData.ts")

with open("src/config/blogData.ts", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Success: Replaced {replaced_count} image references.")
