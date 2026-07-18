# -*- coding: utf-8 -*-
import os
from PIL import Image, ImageFilter, ImageChops

images_map = {
    # Batch 1-5 (previous ones)
    "media__1784295740902.jpg": "a-star-dark.png",
    "media__1784295768785.jpg": "aho-corasick-dark.png",
    "media__1784295801964.jpg": "avl-trees-dark.png",
    "media__1784295831421.jpg": "b-trees-dark.png",
    "media__1784295881080.jpg": "avl-red-black-tree-dark.png",
    
    # New ones
    "media__1784296252002.jpg": "bfs-traversal-dark.png",
    "media__1784296257170.jpg": "bellman-ford-dark.png",
    "media__1784296262591.jpg": "bellman-ford-floyd-warshall-dark.png",
    "media__1784296278120.jpg": "heap-dark.png",
    "media__1784296295088.jpg": "binary-search-trees-dark.png"
}

brain_dir = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605"
dest_dirs = [
    r"c:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\public\images\dsa",
    r"c:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\dist\images\dsa"
]

for d in dest_dirs:
    os.makedirs(d, exist_ok=True)

# Create a 120x120 feather mask (soft edges)
mask = Image.new("L", (120, 120), 0)
for y in range(120):
    for x in range(120):
        # distance from center
        dx = abs(x - 60)
        dy = abs(y - 60)
        dist = max(dx, dy)
        if dist < 40:
            val = 255
        elif dist > 60:
            val = 0
        else:
            val = int(255 * (1.0 - (dist - 40) / 20.0))
        mask.putpixel((x, y), val)

# Blur the mask to make the transition even softer
mask = mask.filter(ImageFilter.GaussianBlur(5))

for src_name, dest_name in images_map.items():
    src_path = os.path.join(brain_dir, src_name)
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        continue
        
    im = Image.open(src_path).convert("RGB")
    width, height = im.size
    
    # 1. Bounding box for the logo is centered at (900, 900). We use a 120x120 box.
    # Box: x in [840, 960], y in [840, 960]
    # Let's crop a clean patch from (50, 50, 170, 170)
    clean_patch = im.crop((50, 50, 170, 170))
    
    # 2. Color matching:
    # Calculate average color of clean patch
    clean_pixels = clean_patch.load()
    r_sum, g_sum, b_sum = 0, 0, 0
    for x in range(120):
        for y in range(120):
            r, g, b = clean_pixels[x, y]
            r_sum += r
            g_sum += g
            b_sum += b
    clean_avg = (r_sum/14400.0, g_sum/14400.0, b_sum/14400.0)
    
    # Calculate average color of destination surrounding region (just above/left of the logo box)
    # Let's sample x in [800, 830], y in [840, 960] (clean background right next to it)
    dest_r, dest_g, dest_b = 0, 0, 0
    count = 0
    for x in range(800, 830):
        for y in range(840, 960):
            r, g, b = im.getpixel((x, y))
            dest_r += r
            dest_g += g
            dest_b += b
            count += 1
    dest_avg = (dest_r/float(count), dest_g/float(count), dest_b/float(count))
    
    # Adjust clean patch pixels to match destination average color
    adjusted_patch = Image.new("RGB", (120, 120))
    adj_pixels = adjusted_patch.load()
    for x in range(120):
        for y in range(120):
            r, g, b = clean_pixels[x, y]
            new_r = max(0, min(255, int(r - clean_avg[0] + dest_avg[0])))
            new_g = max(0, min(255, int(g - clean_avg[1] + dest_avg[1])))
            new_b = max(0, min(255, int(b - clean_avg[2] + dest_avg[2])))
            adj_pixels[x, y] = (new_r, new_g, new_b)
            
    # 3. Paste adjusted clean patch with feather mask to blend seamlessly
    im.paste(adjusted_patch, (840, 840), mask)
    
    # Save output to PNG
    for d in dest_dirs:
        dest_path = os.path.join(d, dest_name)
        im.save(dest_path, "PNG")
        print(f"Saved seamlessly: {dest_name} -> {dest_path}")
