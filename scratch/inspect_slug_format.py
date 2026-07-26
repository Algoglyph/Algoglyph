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

for s in batch3_slugs:
    p = text.find(s)
    if p != -1:
        print(f"Slug '{s}' found at pos {p}: {repr(text[p-20:p+40])}")
    else:
        print(f"Slug '{s}' NOT FOUND!")
