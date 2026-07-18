# -*- coding: utf-8 -*-
import os
import numpy as np
from PIL import Image

path = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605\media__1784296262591.jpg"
im = Image.open(path).convert("RGB")
arr = np.array(im)
height, width, _ = arr.shape

# Let's map the entire image for neutral bright clusters
binary_map = np.zeros((height, width), dtype=np.uint8)
for y in range(width):
    for x in range(height):
        r, g, b = arr[y, x]
        sat = max(abs(int(r)-int(g)), abs(int(g)-int(b)), abs(int(r)-int(b)))
        if r > 80 and g > 80 and b > 80 and sat < 15:
            binary_map[y, x] = 1

# Let's slide a 50x50 window and print all local maxima where density is significant (e.g. > 150)
for y in range(0, height - 50, 10):
    for x in range(0, width - 50, 10):
        density = np.sum(binary_map[y:y+50, x:x+50])
        # If density is high and it's a local maximum in a 100x100 neighborhood
        if density > 180:
            # Let's see if this is indeed a local maximum
            is_max = True
            for dy in range(-20, 30, 10):
                for dx in range(-20, 30, 10):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < height - 50 and 0 <= nx < width - 50:
                        if np.sum(binary_map[ny:ny+50, nx:nx+50]) > density:
                            is_max = False
                            break
                if not is_max: break
            if is_max:
                print(f"Cluster found at x={x+25}, y={y+25} with density {density}")
