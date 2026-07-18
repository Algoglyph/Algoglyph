# -*- coding: utf-8 -*-
import os
from PIL import Image

path = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605\media__1784296295088.jpg" # BST
im = Image.open(path)
for y in range(875, 935):
    line = ""
    for x in range(875, 935):
        r, g, b = im.getpixel((x, y))
        # Since the text is also bright, let's see if we can identify it.
        # Let's print the character grid
        if r > 100:
            line += "#"
        else:
            line += "."
    print(line)
