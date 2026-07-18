# -*- coding: utf-8 -*-
import os
from PIL import Image

path = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605\media__1784295740902.jpg" # A*
im = Image.open(path)
# Let's print a 60x60 grid of intensities around x in [875, 935], y in [875, 935]
# We'll print a character grid where '.' is dark background and '#' is bright spark pixel.
for y in range(875, 935):
    line = ""
    for x in range(875, 935):
        r, g, b = im.getpixel((x, y))
        if r > 70:
            line += "#"
        else:
            line += "."
    print(line)
