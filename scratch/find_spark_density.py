# -*- coding: utf-8 -*-
import os
import numpy as np
from PIL import Image

brain_dir = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605"
files = [
    "media__1784295740902.jpg",
    "media__1784295768785.jpg",
    "media__1784295801964.jpg",
    "media__1784295831421.jpg",
    "media__1784295881080.jpg",
    "media__1784296252002.jpg",
    "media__1784296257170.jpg",
    "media__1784296262591.jpg",
    "media__1784296278120.jpg",
    "media__1784296295088.jpg"
]

for f in files:
    path = os.path.join(brain_dir, f)
    if os.path.exists(path):
        im = Image.open(path).convert("RGB")
        arr = np.array(im)
        height, width, _ = arr.shape
        
        # 1. Create a binary map of neutral bright pixels
        # R > 75, sat < 15
        binary_map = np.zeros((height, width), dtype=np.uint8)
        for y in range(700, height - 10):
            for x in range(700, width - 10):
                r, g, b = arr[y, x]
                sat = max(abs(int(r)-int(g)), abs(int(g)-int(b)), abs(int(r)-int(b)))
                if r > 75 and g > 75 and b > 75 and sat < 15:
                    binary_map[y, x] = 1
                    
        # 2. Find the pixel with maximum density of 1s in a 40x40 neighborhood
        best_density = 0
        best_center = None
        
        # We slide a 40x40 window in steps of 5 pixels
        for y in range(700, height - 40, 5):
            for x in range(700, width - 40, 5):
                density = np.sum(binary_map[y:y+40, x:x+40])
                if density > best_density:
                    best_density = density
                    best_center = (x + 20, y + 20)
                    
        print(f"{f}: Spark center found at {best_center} with density {best_density}")
