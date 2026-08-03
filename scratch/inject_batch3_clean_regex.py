import json
import re

with open('scratch/ai_batch3_heavy.json', 'r', encoding='utf-8') as f:
    blogs = json.load(f)

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

for slug, b in blogs.items():
    # Escape backticks and ${}
    safe_md = b['markdown'].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    # Pattern to match the entire object for this slug
    pattern = r'\{\s*slug:\s*"' + re.escape(slug) + r'"[\s\S]*?markdown:\s*`[\s\S]*?`\s*\}'
    
    replacement = f"""{{
    slug: "{b['slug']}",
    title: "{b['title']}",
    tagline: "{b['tagline']}",
    category: "{b['category']}",
    readTime: {b['readTime']},
    lastUpdated: "{b['lastUpdated']}",
    prerequisites: {json.dumps(b['prerequisites'])},
    related: {json.dumps(b['related'])},
    practiceProblems: {json.dumps(b['practiceProblems'])},
    markdown: `{safe_md}`
  }}"""

    match = re.search(pattern, content)
    if match:
        content = content[:match.start()] + replacement + content[match.end():]
        print(f"[REPLACED] Slug '{slug}' successfully.")
    else:
        print(f"[NOT FOUND] Slug '{slug}' pattern did not match.")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESSFULLY UPDATED src/config/blogData.ts!")
