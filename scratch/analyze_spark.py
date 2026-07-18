# -*- coding: utf-8 -*-
import os
from PIL import Image

brain_dir = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605"
images = [
    "media__1784295740902.jpg", # A*
    "media__1784295768785.jpg", # Aho-Corasick
    "media__1784295801964.jpg", # AVL
    "media__1784295831421.jpg", # B+
    "media__1784295881080.jpg"  # Balanced Search
]

# Let's inspect the bounding box of high intensity pixels in the bottom right quadrant (x > 800, y > 800)
for name in images:
    path = os.path.join(brain_dir, name)
    if os.path.exists(path):
        im = Image.open(path)
        pixels = im.load()
        width, height = im.size
        
        min_x, max_x = width, 0
        min_y, max_y = height, 0
        
        # Check area
        for x in range(800, width):
            for y in range(800, height):
                r, g, b = pixels[x, y]
                # The spark logo is bright silver/white, so r, g, b will be higher than the dark background
                if r > 80 and g > 80 and b > 80:
                    if x < min_x: min_x = x
                    if x > max_x: max_x = x
                    if y < min_y: min_y = y
                    if y > max_y: max_y = y
                    
        print(f"{name}: bright pixels box: x=[{min_x}, {max_x}], y=[{min_y}, {max_y}]")
