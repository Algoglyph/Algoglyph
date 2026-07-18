# -*- coding: utf-8 -*-
with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Let's search for keywords in blogData.ts to find the correct slugs:
keywords = [
    ("bfs-traversal", "BFS Traversal"),
    ("bfs", "Breadth-First Search"),
    ("bellman-ford-floyd-warshall", "Bellman-Ford & Floyd-Warshall"),
    ("bellman-ford", "Bellman-Ford"),
    ("floyd-warshall", "Floyd-Warshall"),
    ("heap", "Heap"),
    ("priority-queue", "Priority Queue"),
    ("binary-search-trees", "Binary Search Tree")
]

for kw, desc in keywords:
    if kw in text:
        print(f"Keyword: {kw} (for {desc}) is in blogData.ts")
    else:
        print(f"Keyword: {kw} (for {desc}) NOT found")
