# -*- coding: utf-8 -*-
import os
from PIL import Image

images = [
    "media__1784295740902.jpg",
    "media__1784295768785.jpg",
    "media__1784295801964.jpg",
    "media__1784295831421.jpg",
    "media__1784295881080.jpg"
]

brain_dir = r"C:\Users\varun\.gemini\antigravity-ide\brain\a677b7e1-be37-4910-a22c-f728d1de7605"

for img_name in images:
    path = os.path.join(brain_dir, img_name)
    if os.path.exists(path):
        im = Image.open(path)
        print(f"{img_name}: size={im.size}, mode={im.mode}")
    else:
        print(f"{img_name} does not exist")
