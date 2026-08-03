"""
Classify DSA blogs into 3 buckets:
  A) Has markdown WITH image
  B) Has markdown WITHOUT image (proper written content, just missing the image)
  C) Generic content (NO markdown field - uses templated content object only)
"""
import re

file_path = r"C:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\src\config\blogData.ts"
dsa_cats = {'Algorithms', 'Data Structures', 'DSA Foundations', 'Advanced CP', 'Theoretical CS'}

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

A = []  # markdown + image
B = []  # markdown + no image
C = []  # generic content (no markdown)

i = 0
while i < len(lines):
    sm = re.match(r'^\s*"slug":\s*"([^"]+)"', lines[i])
    if not sm:
        i += 1
        continue
    slug = sm.group(1)

    # Scan forward within the current blog object until the next slug or end of object
    cat = None
    md = None
    has_md = False
    j = i + 1
    while j < len(lines) and j < i + 200:
        lj = lines[j]
        # Stop if we hit the next blog object
        if re.match(r'^\s*"slug":\s*"', lj) and j > i:
            break
        cm = re.match(r'^\s*"category":\s*"([^"]+)"', lj)
        if cm:
            cat = cm.group(1)
        # markdown field - could span multiple physical lines if it ends with ", or just "
        if re.match(r'^\s*"markdown":\s*"', lj):
            has_md = True
            # Check this line has the full value (ends with ",) or continues
            # We just need to know if there is a markdown field
        j += 1

    if cat in dsa_cats:
        # Determine if any /images/dsa/ reference exists in this blog block
        block = '\n'.join(lines[i:j])
        has_img = '/images/dsa/' in block and has_md
        if not has_md:
            C.append((cat, slug))
        elif has_img:
            A.append((cat, slug))
        else:
            B.append((cat, slug))
    i += 1

print(f"=== DSA blogs classification ===\n")
print(f"A) Markdown WITH image:        {len(A)}")
print(f"B) Markdown WITHOUT image:     {len(B)}")
print(f"C) Generic content (no md):    {len(C)}")
print(f"Total: {len(A)+len(B)+len(C)}")

print(f"\n=== A) Markdown WITH image ({len(A)}) ===")
for c, s in A:
    print(f"  [{c}] {s}")

print(f"\n=== B) Markdown WITHOUT image ({len(B)}) ===")
for c, s in B:
    print(f"  [{c}] {s}")

print(f"\n=== C) GENERIC CONTENT - no markdown field ({len(C)}) ===")
for c, s in C:
    print(f"  [{c}] {s}")
