# -*- coding: utf-8 -*-
import os
from PIL import Image

path = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605\media__1784296262591.jpg"
im = Image.open(path)
width, height = im.size

min_x, max_x = width, 0
min_y, max_y = height, 0

# Let's find all pixels in the bottom-right quadrant with the spark signature:
# sat < 13, and bright R, G, B > 60
for x in range(800, width):
    for y in range(800, height):
        r, g, b = im.getpixel((x, y))
        sat = max(abs(r-g), abs(g-b), abs(r-b))
        if r > 60 and g > 60 and b > 60 and sat < 13:
            # Check if this might be text (the chalk color is yellowish, so sat is usually higher.
            # But let's print them to see the bounding box of all neutral bright pixels)
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

print(f"Neutral bright pixels bounding box: x=[{min_x}, {max_x}], y=[{min_y}, {max_y}]")
