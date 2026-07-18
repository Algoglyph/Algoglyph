# -*- coding: utf-8 -*-
import os
import numpy as np
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

for f in files:
    path = os.path.join(brain_dir, f)
    if os.path.exists(path):
        im = Image.open(path).convert("RGB")
        arr = np.array(im)
        height, width, _ = arr.shape
        
        # We search the lower-right quadrant (x > 500, y > 500)
        # The spark is a bright, neutral star. The center of the star is the brightest local point.
        # Let's find candidate pixels: R > 150, G > 150, B > 150, sat < 10
        candidates = []
        for y in range(500, height - 30):
            for x in range(500, width - 30):
                r, g, b = arr[y, x]
                sat = max(abs(int(r)-int(g)), abs(int(g)-int(b)), abs(int(r)-int(b)))
                if r > 150 and g > 150 and b > 150 and sat < 8:
                    candidates.append((x, y, int(r)+int(g)+int(b)))
                    
        # Find the candidate that has the best star shape properties
        # The spark has a horizontal line of bright pixels and a vertical line of bright pixels meeting at the center.
        best_center = None
        best_score = 0
        for x, y, brightness in candidates:
            # Let's check the vertical and horizontal extent of bright neutral pixels
            # Count how far we can go left, right, up, down with R > 80, sat < 15
            h_len = 0
            v_len = 0
            
            # Left
            for dx in range(1, 40):
                if x - dx < 0: break
                r, g, b = arr[y, x - dx]
                sat = max(abs(int(r)-int(g)), abs(int(g)-int(b)), abs(int(r)-int(b)))
                if r > 80 and sat < 15: h_len += 1
                else: break
            # Right
            for dx in range(1, 40):
                if x + dx >= width: break
                r, g, b = arr[y, x + dx]
                sat = max(abs(int(r)-int(g)), abs(int(g)-int(b)), abs(int(r)-int(b)))
                if r > 80 and sat < 15: h_len += 1
                else: break
                
            # Up
            for dy in range(1, 40):
                if y - dy < 0: break
                r, g, b = arr[y - dy, x]
                sat = max(abs(int(r)-int(g)), abs(int(g)-int(b)), abs(int(r)-int(b)))
                if r > 80 and sat < 15: v_len += 1
                else: break
            # Down
            for dy in range(1, 40):
                if y + dy >= height: break
                r, g, b = arr[y + dy, x]
                sat = max(abs(int(r)-int(g)), abs(int(g)-int(b)), abs(int(r)-int(b)))
                if r > 80 and sat < 15: v_len += 1
                else: break
                
            # A star shape has both horizontal and vertical arms of length between 15 and 35
            score = h_len + v_len
            if h_len > 10 and v_len > 10 and score > best_score:
                best_score = score
                best_center = (x, y)
                
        print(f"{f}: Spark center found at {best_center} with score {best_score}")
