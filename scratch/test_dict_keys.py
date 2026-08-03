import re

with open('scratch/build_clean_batch2_perfect.py', 'r', encoding='utf-8') as f:
    text = f.read()

matches = [m.start() for m in re.finditer(r'^\s*\d+:\s*', text, re.M)]
for m in matches:
    print(repr(text[m-20:m+40]))
