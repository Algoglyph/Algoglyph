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
    arr = np.array(im)
    best_score = float('inf')
    best_coords = None
    
    for y in range(20, height - patch_size - 20, 20):
        for x in range(20, width - patch_size - 20, 20):
            if x > width - 250 and y > height - 250:
                continue
            sub = arr[y:y+patch_size, x:x+patch_size]
            mean = np.mean(sub, axis=(0, 1))
            std = np.std(sub, axis=(0, 1))
            if mean[0] > 60 or mean[0] < 20:
                continue
            score = np.sum(std)
            if score < best_score:
                best_score = score
                best_coords = (x, y)
    return best_coords

for src_name, dest_name in images_map.items():
    src_path = os.path.join(brain_dir, src_name)
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        continue
        
    im = Image.open(src_path).convert("RGB")
    width, height = im.size
    
    # Find clean background patch to sample texture
    coords = find_clean_patch(im, width, height, patch_size=120)
    if not coords:
        coords = (50, 50)
    clean_x, clean_y = coords
    clean_patch = im.crop((clean_x, clean_y, clean_x + 120, clean_y + 120))
    clean_avg = np.mean(np.array(clean_patch), axis=(0, 1))
    
    # Sample target neighborhood to match lighting
    target_sample = np.array(im.crop((800, 850, 830, 950)))
    target_avg = np.mean(target_sample, axis=(0, 1))
    
    # Adjust clean patch colors
    adj_array = np.array(clean_patch, dtype=np.float32)
    for i in range(3):
        adj_array[:, :, i] += (target_avg[i] - clean_avg[i])
    adj_array = np.clip(adj_array, 0, 255).astype(np.uint8)
    adjusted_patch = Image.fromarray(adj_array)
    
    # Now, edit pixels of the image directly in the logo box (850, 850, 950, 950)
    pixels = im.load()
    adj_pixels = adjusted_patch.load()
    
    # Precise segmentation:
    # Any pixel in [850, 950] x [850, 950] that is bright (R > 90, G > 90, B > 90)
    # and has low saturation (neutral silver/white spark color: max diff between channels < 12)
    # is replaced by the corresponding clean background pixel from adjusted_patch.
    # To handle the halo/glow around the spark, we can also replace pixels that are slightly darker but still neutral.
    replaced = 0
    for x in range(840, 960):
        for y in range(840, 960):
            r, g, b = pixels[x, y]
            sat = max(abs(r-g), abs(g-b), abs(r-b))
            
            # The spark is neutral. The chalk text is warm/yellowish.
            # Spark detection rule:
            is_spark = False
            if r > 80 and g > 80 and b > 80 and sat < 13:
                is_spark = True
            elif r > 60 and g > 60 and b > 60 and sat < 8: # softer glow
                is_spark = True
                
            if is_spark:
                # Replace with clean background texture pixel
                px_color = adj_pixels[(x - 840) % 120, (y - 840) % 120]
                pixels[x, y] = px_color
                replaced += 1
                
    print(f"{src_name} -> Replaced {replaced} spark pixels seamlessly.")
    
    # Save output to PNG
    for d in dest_dirs:
        dest_path = os.path.join(d, dest_name)
        im.save(dest_path, "PNG")
        print(f"Saved successfully: {dest_name} to {dest_path}")
