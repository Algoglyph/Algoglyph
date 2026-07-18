# -*- coding: utf-8 -*-
import os
from PIL import Image

path = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605\media__1784296295088.jpg" # BST
im = Image.open(path)
pixels = im.load()
width, height = im.size

# Let's count how many pixels in the logo box (850, 850, 950, 950) are detected as spark
spark_count = 0
text_count = 0
bg_count = 0

for x in range(850, 950):
    for y in range(850, 950):
        r, g, b = pixels[x, y]
        sat = max(abs(r-g), abs(g-b), abs(r-b))
        if r > 90 and g > 90 and b > 90 and sat < 12:
            spark_count += 1
        elif r > 90 and g > 90 and b > 90 and sat >= 12:
            text_count += 1
        else:
            bg_count += 1

print(f"Spark pixels: {spark_count}, Text/Line pixels: {text_count}, Background pixels: {bg_count}")
