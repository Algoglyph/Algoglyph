import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

batch3_slugs = [
    "dijkstra",
    "dynamic-programming",
    "greedy",
    "backtracking",
    "searching",
    "sorting",
    "tree-traversal",
    "mst-union-find",
    "scc-bridges",
    "string-algorithms"
]

print("=== LOCATING BATCH 3 SLUGS IN blogData.ts ===")

for slug in batch3_slugs:
    matches = [m.start() for m in re.finditer(r'"' + slug + r'"', text)]
    print(f"Slug '{slug}': found {len(matches)} times at positions {matches[:5]}")
