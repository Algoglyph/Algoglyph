# -*- coding: utf-8 -*-
import os

filenames = [
    "a-star-dark.png",
    "aho-corasick-dark.png",
    "avl-trees-dark.png",
    "b-trees-dark.png",
    "avl-red-black-tree-dark.png",
    "bfs-traversal-dark.png",
    "bellman-ford-dark.png",
    "bellman-ford-floyd-warshall-dark.png",
    "heap-dark.png",
    "binary-search-trees-dark.png"
]

dirs = [
    r"c:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\public\images\dsa",
    r"c:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\dist\images\dsa"
]

deleted_count = 0
for d in dirs:
    for f in filenames:
        path = os.path.join(d, f)
        if os.path.exists(path):
            os.remove(path)
            deleted_count += 1
            print(f"Deleted {path}")

print(f"Total deleted image files: {deleted_count}")
