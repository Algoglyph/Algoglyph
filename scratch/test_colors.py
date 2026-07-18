# -*- coding: utf-8 -*-
import os
from PIL import Image

path = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605\media__1784296295088.jpg" # BST
im = Image.open(path)
width, height = im.size

# Let's inspect pixels around x in [880, 930], y in [880, 930] (where the spark overlaps with 70)
# We print pixels that are bright (R > 100) and show their R, G, B and R-B difference
for x in range(875, 935):
    for y in range(875, 935):
        r, g, b = im.getpixel((x, y))
        if r > 120:
            # Let's print a sample to see the distribution
            if x % 5 == 0 and y % 5 == 0:
                print(f"Pixel at ({x}, {y}): RGB=({r}, {g}, {b}), R-B={r-b}")
