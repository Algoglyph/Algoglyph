import json
import re
import os

file_path = r"C:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\src\config\blogData.ts"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "export const BLOG_POSTS: BlogPost[] = ["
start_idx = content.find(start_marker)
arr_start = start_idx + len(start_marker)
depth = 1
end_idx = -1
in_string = False
string_char = None
i = arr_start
escape = False
backslash = chr(92)
while i < len(content):
    c = content[i]
    if in_string:
        if escape:
            escape = False
        elif c == backslash:
            escape = True
        elif c == string_char:
            in_string = False
    else:
        if c == '"' or c == "'":
            in_string = True
            string_char = c
        elif c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                end_idx = i
                break
    i += 1

arr_str = content[arr_start:end_idx+1]


def extract_objects(s):
    objs = []
    d2 = 0
    start = None
    in_str = False
    sc = None
    esc = False
    for idx, c in enumerate(s):
        if in_str:
            if esc:
                esc = False
            elif c == backslash:
                esc = True
            elif c == sc:
                in_str = False
        else:
            if c == '"' or c == "'":
                in_str = True
                sc = c
            elif c == '{':
                if d2 == 0:
                    start = idx
                d2 += 1
            elif c == '}':
                d2 -= 1
                if d2 == 0 and start is not None:
                    objs.append(s[start:idx+1])
                    start = None
    return objs


objs = extract_objects(arr_str)

# Parse slug, category, and markdown from each (robust to escape issues)
# Use line-by-line extraction instead of full json.loads
results = []
for obj_str in objs:
    slug_m = re.search(r'"slug"\s*:\s*"([^"]+)"', obj_str)
    cat_m = re.search(r'"category"\s*:\s*"([^"]+)"', obj_str)
    slug = slug_m.group(1) if slug_m else '???'
    cat = cat_m.group(1) if cat_m else '???'
    # markdown value is everything after "markdown": " until the unescaped closing "
    md_m = re.search(r'"markdown"\s*:\s*"(.*)",\s*\n\s*"title"', obj_str, re.DOTALL)
    md = md_m.group(1) if md_m else ''
    has_dsa_img = '/images/dsa/' in md
    img_matches = re.findall(r'!\[[^\]]*\]\((/images/dsa/[^)]+)\)', md)
    results.append({
        'slug': slug,
        'category': cat,
        'has_img': has_dsa_img,
        'images': img_matches,
        'title_line': None,
    })

dsa_cats = ['Algorithms', 'Data Structures', 'DSA Foundations', 'Advanced CP', 'Theoretical CS']

# Get all available dark image files
dsa_dir = r"C:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\public\images\dsa"
dark_files = [f for f in os.listdir(dsa_dir) if 'light' not in f.lower()]
dark_basenames = {}  # normalized base -> filename
for f in dark_files:
    # e.g. 'a-star-algorithm-dark.jpg' -> base 'a-star-algorithm'
    m = re.match(r'(.+)-dark\.(jpg|png)$', f)
    if m:
        dark_basenames[m.group(1)] = f

print("=== DSA-category blogs and their image status ===")
dsa_blogs = [r for r in results if r['category'] in dsa_cats]
print(f"Total DSA-category blogs: {len(dsa_blogs)}")
with_img = [r for r in dsa_blogs if r['has_img']]
without_img = [r for r in dsa_blogs if not r['has_img']]
print(f"With image: {len(with_img)}")
print(f"Without image: {len(without_img)}")

print("\n=== DSA blogs WITHOUT image ===")
for r in without_img:
    # check if a dark image exists for this slug
    slug = r['slug']
    match = None
    if slug in dark_basenames:
        match = dark_basenames[slug]
    print(f"  {slug}  |  match: {match}")

print("\n=== Available dark image basenames NOT yet referenced ===")
# All basenames that are not used by any blog
used_basenames = set()
for r in results:
    for img in r['images']:
        # e.g. /images/dsa/foo-dark.png#dark
        m = re.match(r'/images/dsa/(.+)-dark\.(jpg|png)', img)
        if m:
            used_basenames.add(m.group(1))
unused = [b for b in dark_basenames if b not in used_basenames]
print(f"Total dark basenames: {len(dark_basenames)}")
print(f"Used: {len(used_basenames)}")
print(f"Unused: {len(unused)}")
for b in sorted(unused):
    print(f"  {b} -> {dark_basenames[b]}")
