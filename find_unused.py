"""Find which dark images are still unused after the first insertion pass."""
import re
import os

file_path = r"C:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\src\config\blogData.ts"
dsa_dir = r"C:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\public\images\dsa"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

dark_files = [f for f in os.listdir(dsa_dir) if 'light' not in f.lower()]
dark_basenames = {}
for f in dark_files:
    m = re.match(r'(.+)-dark\.(jpg|png)$', f)
    if m:
        dark_basenames[m.group(1)] = f

# Find all basenames referenced in any markdown
used = set()
for m in re.finditer(r'/images/dsa/([^)\s]+?)(?:#dark|#light)?\)', content):
    fname = m.group(1)
    bm = re.match(r'(.+)-dark\.(jpg|png)', fname)
    if bm:
        used.add(bm.group(1))

unused = sorted(b for b in dark_basenames if b not in used)
print(f"Total dark basenames: {len(dark_basenames)}")
print(f"Used: {len(used)}")
print(f"Unused ({len(unused)}):")
for b in unused:
    print(f"  {b} -> {dark_basenames[b]}")
