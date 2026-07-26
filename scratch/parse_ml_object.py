import re

with open('src/config/mlBlogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the start of ML_BLOG_DATA object
start = text.find("export const ML_BLOG_DATA")
if start != -1:
    # find where ML_BLOG_DATA ends or where another export begins
    next_export = text.find("export const", start + 20)
    if next_export != -1:
        ml_part = text[start:next_export]
    else:
        ml_part = text[start:]
    
    # Extract keys and titles
    matches = re.findall(r'"([a-z0-9-]+)":\s*\{\s*"title":\s*"([^"]+)"', ml_part)
    print(f"Total blogs in ML_BLOG_DATA object: {len(matches)}\n")
    for idx, (slug, title) in enumerate(matches, 1):
        print(f"{idx}. **{title}** (`{slug}`)")
