# -*- coding: utf-8 -*-
import os
import numpy as np
from PIL import Image, ImageFilter

images_map = {
    "media__1784295740902.jpg": "a-star-dark.png",
    "media__1784295768785.jpg": "aho-corasick-dark.png",
    "media__1784295801964.jpg": "avl-trees-dark.png",
    "media__1784295831421.jpg": "b-trees-dark.png",
    "media__1784295881080.jpg": "avl-red-black-tree-dark.png",
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

def find_clean_patch(im, width, height, patch_size=100):
    # We want to find a patch of size patch_size x patch_size that has:
    # 1. Low average color (background is dark blackboard, typically around 30-45)
    # 2. Very low variance (no lines, text, or shapes)
    arr = np.array(im)
    best_score = float('inf')
    best_coords = None
    
    # We search the margins: top, bottom, left, right
    # To be safe, let's scan in steps of 20 pixels
    for y in range(20, height - patch_size - 20, 20):
        for x in range(20, width - patch_size - 20, 20):
            # Skip the bottom-right corner where the logo is
            if x > width - 250 and y > height - 250:
                continue
                
            sub = arr[y:y+patch_size, x:x+patch_size]
            mean = np.mean(sub, axis=(0, 1))
            std = np.std(sub, axis=(0, 1))
            
            # We want dark background (mean around 30-50) and flat (std < 3)
            # Score: std deviation sum + penalize if it's too bright or too dark
            if mean[0] > 60 or mean[0] < 20:
                continue
                
            score = np.sum(std)
            if score < best_score:
                best_score = score
                best_coords = (x, y)
                
    return best_coords

# Create a 100x100 feather mask
mask = Image.new("L", (100, 100), 0)
for y in range(100):
    for x in range(100):
        dx = abs(x - 50)
        dy = abs(y - 50)
        dist = max(dx, dy)
        if dist < 30:
            val = 255
        elif dist > 48:
            val = 0
        else:
            val = int(255 * (1.0 - (dist - 30) / 18.0))
        mask.putpixel((x, y), val)
mask = mask.filter(ImageFilter.GaussianBlur(3))

for src_name, dest_name in images_map.items():
    src_path = os.path.join(brain_dir, src_name)
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        continue
        
    im = Image.open(src_path).convert("RGB")
    width, height = im.size
    
    # Locate clean background patch
    coords = find_clean_patch(im, width, height, patch_size=100)
    if not coords:
        # Fallback if no clean patch found (should not happen)
        coords = (50, 50)
        
    clean_x, clean_y = coords
    print(f"{src_name}: Using clean patch at ({clean_x}, {clean_y})")
    
    clean_patch = im.crop((clean_x, clean_y, clean_x + 100, clean_y + 100))
    
    # Destination box for the spark logo: centered around x=900, y=900 (so 850 to 950)
    # Wait, let's look at the spark coordinates from analyze_spark:
    # A* was x=[880, 927], y=[880, 927]
    # BFS Traversal was x=[880, 927] as well.
    # So a 100x100 box at (850, 850, 950, 950) covers it perfectly!
    dest_box = (850, 850, 950, 950)
    
    # Color match the clean patch to the destination neighborhood
    clean_avg = np.mean(np.array(clean_patch), axis=(0, 1))
    
    # Calculate target neighborhood average (excluding the logo box itself)
    # We sample a ring around the target box: x in [820, 840], y in [850, 950]
    target_sample = np.array(im.crop((820, 850, 840, 950)))
    target_avg = np.mean(target_sample, axis=(0, 1))
    
    # Shift colors
    adj_array = np.array(clean_patch, dtype=np.float32)
    for i in range(3):
        adj_array[:, :, i] += (target_avg[i] - clean_avg[i])
    adj_array = np.clip(adj_array, 0, 255).astype(np.uint8)
    adjusted_patch = Image.fromarray(adj_array)
    
    # Paste with feather mask
    im.paste(adjusted_patch, (850, 850), mask)
    
    # Save output
    for d in dest_dirs:
        dest_path = os.path.join(d, dest_name)
        im.save(dest_path, "PNG")
        print(f"Saved successfully: {dest_name} to {dest_path}")
