import json
import re

with open('scratch/ai_batch2_heavy.json', 'r', encoding='utf-8') as f:
    blogs = json.load(f)

print(f"Loaded {len(blogs)} blogs from scratch/ai_batch2_heavy.json.")

with open('src/config/mlBlogData.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Replace each blog entry in mlBlogData.ts
for slug, b in blogs.items():
    markdown = b['markdown']
    # Escape backticks and ${}
    safe_md = markdown.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    # Pattern to match 'slug': `...` or 'slug': ""
    pattern = rf"('{slug}':\s*)(`[\s\S]*?`|\"\")"
    replacement = rf"\1`{safe_md}`"
    
    if re.search(pattern, ts_content):
        ts_content = re.sub(pattern, replacement, ts_content, count=1)
        print(f"Successfully injected '{slug}' into src/config/mlBlogData.ts.")
    else:
        print(f"WARNING: Slug '{slug}' not found in src/config/mlBlogData.ts!")

with open('src/config/mlBlogData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Updated src/config/mlBlogData.ts successfully.")
