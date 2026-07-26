import re

with open('src/config/mlBlogData.ts', 'r', encoding='utf-8') as f:
    ml_text = f.read()

# Pattern for keys in ML_BLOG_DATA
keys = re.findall(r'^\s*"([a-z0-9-]+)":\s*\{', ml_text, re.MULTILINE)

print(f"Total keys in mlBlogData.ts: {len(keys)}\n")

# Extract title, tagline, category for each key
pattern = r'"([a-z0-9-]+)":\s*\{\s*"title":\s*"([^"]+)",\s*"tagline":\s*"([^"]+)",\s*"category":\s*"([^"]+)"'
entries = re.findall(pattern, ml_text)

print(f"Matched entries: {len(entries)}\n")

categories = {}
for slug, title, tagline, cat in entries:
    if cat not in categories:
        categories[cat] = []
    categories[cat].append((title, slug, tagline))

total = 0
for cat, blogs in categories.items():
    print(f"### {cat} ({len(blogs)} blogs)")
    for title, slug, tagline in blogs:
        total += 1
        print(f"{total}. **{title}** (`{slug}`): {tagline}")
    print()

print(f"**Total Blogs:** {total}")
