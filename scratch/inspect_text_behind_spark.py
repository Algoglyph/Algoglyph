# -*- coding: utf-8 -*-
import os
from PIL import Image

brain_dir = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605"
files = [
    "media__1784295740902.jpg", # A*
    "media__1784295768785.jpg", # Aho-Corasick
    "media__1784295801964.jpg", # AVL
    "media__1784295831421.jpg", # B+
    "media__1784295881080.jpg", # Balanced Search
    "media__1784296252002.jpg", # BFS Traversal
    "media__1784296257170.jpg", # Bellman-Ford
    "media__1784296262591.jpg", # Bellman-Ford/Floyd-Warshall
    "media__1784296278120.jpg", # Heap
    "media__1784296295088.jpg"  # BST
]

# Let's save a crop of the bottom-right region (800, 800, 1024, 1024) to a temp folder so we can inspect it or analyze
# the text pixels.
os.makedirs("scratch/crops", exist_ok=True)
for f in files:
    path = os.path.join(brain_dir, f)
    if os.path.exists(path):
        im = Image.open(path)
        crop = im.crop((780, 780, 1010, 1010))
        crop.save(f"scratch/crops/{f}.png")
        print(f"Saved crop for {f}")
