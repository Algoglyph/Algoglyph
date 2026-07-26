import json
import re

with open('scratch/ai_batch2_heavy.json', 'r', encoding='utf-8') as f:
    blogs = json.load(f)

print(f"Loaded {len(blogs)} blogs from scratch/ai_batch2_heavy.json.")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

for slug, b in blogs.items():
    md = b['markdown']
    
    # Escape backslashes, backticks, and ${} for template literals inside JS object
    safe_md = md.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    # Match the "markdown": `...` field for this slug in BLOG_POSTS
    pattern = rf'("slug":\s*"{slug}"[\s\S]*?"markdown":\s*)(`[\s\S]*?`|"[^"]*")'
    
    if re.search(pattern, content):
        content = re.sub(pattern, rf'\1`{safe_md}`', content, count=1)
        print(f"Successfully updated markdown for '{slug}' in blogData.ts")
    else:
        print(f"FAILED to match pattern for '{slug}'!")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished updating src/config/blogData.ts!")
