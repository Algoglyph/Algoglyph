# -*- coding: utf-8 -*-
import os
from PIL import Image

path = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605\media__1784296262591.jpg"
im = Image.open(path)
# Let's print pixel values in a grid around the spark center (x=900, y=900)
for y in range(880, 930):
    line = ""
    for x in range(880, 930):
        r, g, b = im.getpixel((x, y))
        # Let's see what the values are.
        # We can format it as a character grid
        # Background is around (36, 40, 43). Let's see if the spark is brighter or has a specific signature.
        line += f"{r:02x} "
    if y % 3 == 0:
        print(f"y={y}: {line[:90]}")
