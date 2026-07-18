# -*- coding: utf-8 -*-
import os
from PIL import Image

images_map = {
    "media__1784295740902.jpg": "a-star-dark.png",
    "media__1784295768785.jpg": "aho-corasick-dark.png",
    "media__1784295801964.jpg": "avl-trees-dark.png",
    "media__1784295831421.jpg": "b-trees-dark.png",
    "media__1784295881080.jpg": "avl-red-black-tree-dark.png"
}

brain_dir = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605"
dest_dirs = [
    r"c:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\public\images\dsa",
    r"c:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\dist\images\dsa"
]

for d in dest_dirs:
    os.makedirs(d, exist_ok=True)

for src_name, dest_name in images_map.items():
    src_path = os.path.join(brain_dir, src_name)
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        continue
        
    im = Image.open(src_path)
    # The logo is in the bottom right corner.
    # Let's copy a patch from the top-right corner where it's clean background
    # Bounding box of the logo: x in [830, 1010], y in [830, 1010] (180x180 box)
    # Let's copy a clean patch from x in [830, 1010], y in [50, 230]
    clean_patch = im.crop((830, 50, 1010, 230))
    im.paste(clean_patch, (830, 830))
    
    # Save to all destination directories
    for d in dest_dirs:
        dest_path = os.path.join(d, dest_name)
        im.save(dest_path, "PNG")
        print(f"Saved {dest_name} to {dest_path}")
