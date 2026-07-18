# -*- coding: utf-8 -*-
import os
import numpy as np
from PIL import Image

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

# We reload the original images directly from the brain directory to get a clean source
for src_name, dest_name in images_map.items():
    src_path = os.path.join(brain_dir, src_name)
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        continue
        
    im = Image.open(src_path).convert("RGB")
    width, height = im.size
    
    # 1. Find the exact spark center using density method
    arr = np.array(im)
    binary_map = np.zeros((height, width), dtype=np.uint8)
    for y in range(700, height - 10):
        for x in range(700, width - 10):
            r, g, b = arr[y, x]
            sat = max(abs(int(r)-int(g)), abs(int(g)-int(b)), abs(int(r)-int(b)))
            if r > 75 and g > 75 and b > 75 and sat < 15:
                binary_map[y, x] = 1
                
    best_density = 0
    best_center = (905, 905)
    for y in range(700, height - 40, 5):
        for x in range(700, width - 40, 5):
            density = np.sum(binary_map[y:y+40, x:x+40])
            if density > best_density:
                best_density = density
                best_center = (x + 20, y + 20)
                
    cx, cy = best_center
    print(f"{src_name}: detected spark center at ({cx}, {cy})")
    
    # 2. Define the exact spark mask
    # We create a boolean mask of pixels to be replaced within a 35x35 box around the center
    spark_mask = np.zeros((height, width), dtype=bool)
    pixels = im.load()
    
    for x in range(cx - 35, cx + 35):
        for y in range(cy - 35, cy + 35):
            r, g, b = pixels[x, y]
            sat = max(abs(r-g), abs(g-b), abs(r-b))
            
            # Spark signature: bright, neutral color, not part of yellow/cream chalk (sat >= 15)
            is_spark = False
            if r > 46 and g > 46 and b > 46 and sat < 13:
                is_spark = True
            
            # Double check to prevent removing chalk text
            if sat >= 15:
                is_spark = False
            elif r > 160 and g > 160 and b > 110 and (r - b) > 18:
                is_spark = False
                
            if is_spark:
                spark_mask[y, x] = True
                
    # 3. Seamless Local Neighborhood Averaging (Inpainting)
    # For each spark pixel, we replace it with the average of its non-spark neighbors in a 5x5 window
    # We do this iteratively so that we can fill in the entire spark shape smoothly
    for iteration in range(3):
        new_pixels = {}
        for y in range(cy - 35, cy + 35):
            for x in range(cx - 35, cx + 35):
                if spark_mask[y, x]:
                    # Sample a 5x5 neighborhood around the pixel
                    neighbors = []
                    for dy in range(-2, 3):
                        for dx in range(-2, 3):
                            ny, nx = y + dy, x + dx
                            if not spark_mask[ny, nx]:
                                neighbors.append(pixels[nx, ny])
                    if neighbors:
                        # Average the colors of non-mask neighbors
                        avg_color = tuple(np.mean(neighbors, axis=0).astype(int))
                        new_pixels[(x, y)] = avg_color
                        
        # Apply the updates and remove them from the mask so they can help average remaining pixels
        for (x, y), color in new_pixels.items():
            pixels[x, y] = color
            spark_mask[y, x] = False
            
    print(f"Inpainted spark area around ({cx}, {cy}) successfully.")
    
    # Save output to PNG
    for d in dest_dirs:
        dest_path = os.path.join(d, dest_name)
        im.save(dest_path, "PNG")
        print(f"Saved: {dest_name} to {dest_path}")
