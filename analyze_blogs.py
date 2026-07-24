import json
import re
import os

file_path = r"C:\Users\varun\Documents\stuff\Coding\Antigravity-Github\ScratchPad\src\config\blogData.ts"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "export const BLOG_POSTS: BlogPost[] = ["
start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find start marker")
    exit(1)

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

if end_idx == -1:
    print("Could not find end")
    exit(1)

arr_str = content[arr_start:end_idx+1]
print(f"arr_str length: {len(arr_str)}")
print(f"arr_str starts: {arr_str[:50]!r}")
print(f"arr_str ends: {arr_str[-50:]!r}")


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
print(f"Found {len(objs)} blog objects")

results = []
for obj_str in objs:
    try:
        d = json.loads(obj_str)
    except Exception as e:
        m = re.search(r'"slug"\s*:\s*"([^"]+)"', obj_str)
        slug = m.group(1) if m else "???"
        print(f"PARSE FAIL for {slug}: {e}")
        continue
    slug = d.get('slug', '')
    category = d.get('category', '')
    md = d.get('markdown', '') or ''
    has_dsa_img = '/images/dsa/' in md
    img_matches = re.findall(r'!\[[^\]]*\]\((/images/dsa/[^)]+)\)', md)
    results.append((slug, category, has_dsa_img, img_matches))

print(f"\n=== Total blogs: {len(results)} ===")
with_img = [r for r in results if r[2]]
without_img = [r for r in results if not r[2]]
print(f"With dsa image: {len(with_img)}")
print(f"Without dsa image: {len(without_img)}")

print("\n=== Blogs WITH image ===")
for slug, cat, _, imgs in with_img:
    print(f"  [{cat}] {slug} -> {imgs}")

print(f"\n=== Blogs WITHOUT image (all {len(without_img)}) ===")
for slug, cat, _, _ in without_img:
    print(f"  [{cat}] {slug}")
