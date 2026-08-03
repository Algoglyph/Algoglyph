"""
Insert dark mode DSA images into blog markdown fields in blogData.ts.
For each DSA-category blog without an image, if a matching dark image file
exists for its slug, insert ![Title](/images/dsa/slug-dark.ext#dark) right
after the H1 title in the markdown.

Uses simple string operations (no regex on the title) to avoid re.escape issues.
"""
import re
import os

file_path = r"C:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\src\config\blogData.ts"
dsa_dir = r"C:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\public\images\dsa"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Get all dark image files
dark_files = [f for f in os.listdir(dsa_dir) if 'light' not in f.lower()]
dark_basenames = {}
for f in dark_files:
    m = re.match(r'(.+)-dark\.(jpg|png)$', f)
    if m:
        dark_basenames[m.group(1)] = f

# DSA categories that should use the /images/dsa/ assets
dsa_cats = {'Algorithms', 'Data Structures', 'DSA Foundations', 'Advanced CP', 'Theoretical CS'}

# The literal two-character sequence backslash-n as it appears in the file
NL = chr(92) + 'n'          # backslash + n  (i.e. the text "\n")
DBL_NL = NL + NL            # "\n\n"

lines = content.split('\n')
changes_made = []
skipped_no_image = []

i = 0
while i < len(lines):
    line = lines[i]
    slug_m = re.match(r'^\s*"slug":\s*"([^"]+)"', line)
    if not slug_m:
        i += 1
        continue

    current_slug = slug_m.group(1)

    # Look forward (up to 30 lines) for markdown AND category
    md_line_idx = None
    md_val = None
    current_category = None
    for j in range(i + 1, min(i + 30, len(lines))):
        lj = lines[j]
        cat_m = re.match(r'^\s*"category":\s*"([^"]+)"', lj)
        if cat_m:
            current_category = cat_m.group(1)
            continue
        md_m = re.match(r'^(\s*)"markdown":\s*"(.+)\"\s*,?\s*$', lj)
        if md_m:
            md_line_idx = j
            md_val = md_m.group(2)
            continue

    if current_category not in dsa_cats:
        i += 1
        continue

    if md_line_idx is None:
        i += 1
        continue

    # Skip if already has an image
    if '/images/dsa/' in md_val:
        i += 1
        continue

    # Check for matching dark image
    if current_slug not in dark_basenames:
        skipped_no_image.append((current_slug, current_category))
        i += 1
        continue

    img_file = dark_basenames[current_slug]

    # The markdown starts with "# Title\n\n...". Find the first DBL_NL
    # (literal backslash-n backslash-n) and insert the image right after it.
    idx = md_val.find(DBL_NL)
    if idx == -1:
        # Fall back to a single \n
        idx = md_val.find(NL)
        if idx == -1:
            print(f"  WARN: no newline marker in {current_slug}")
            skipped_no_image.append((current_slug, current_category))
            i += 1
            continue
        insert_pos = idx + len(NL)
    else:
        insert_pos = idx + len(DBL_NL)

    # Extract the title text (between "# " and the first newline sequence)
    title_text = md_val[2:idx].strip()
    img_tag = f'![{title_text}](/images/dsa/{img_file}#dark)'

    # Insert: existing content + image + DBL_NL + rest
    new_md_val = md_val[:insert_pos] + img_tag + DBL_NL + md_val[insert_pos:]

    indent = re.match(r'^(\s*)', lines[md_line_idx]).group(1)
    lines[md_line_idx] = indent + '"markdown": "' + new_md_val + '",'
    changes_made.append({
        'slug': current_slug,
        'image': img_file,
        'title': title_text,
        'category': current_category,
    })
    print(f"  Updated [{current_category}] {current_slug} -> {img_file}")
    i += 1

print(f"\n=== Total changes: {len(changes_made)} ===")
print(f"\n=== DSA blogs WITHOUT a matching dark image ({len(skipped_no_image)}) ===")
for slug, cat in skipped_no_image:
    print(f"  [{cat}] {slug}")

if changes_made:
    new_content = '\n'.join(lines)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("\nFile updated successfully!")
else:
    print("\nNo changes written.")
