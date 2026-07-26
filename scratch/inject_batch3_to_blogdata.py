import json
import re

with open('scratch/ai_batch3_heavy.json', 'r', encoding='utf-8') as f:
    blogs = json.load(f)

print(f"Loaded {len(blogs)} clean Batch 3 blogs.")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace each blog object in blogData.ts
for slug, b in blogs.items():
    p_start = content.find(f'"slug": "{slug}"')
    if p_start == -1:
        print(f"ERROR: Slug '{slug}' not found in src/config/blogData.ts!")
        continue
        
    # Find start of object (look back for '{')
    obj_start = content.rfind('{', 0, p_start)
    # Find end of markdown field `\n  }` or `\n  },`
    p_md = content.find('"markdown": `', p_start)
    md_start = p_md + len('"markdown": `')
    md_end = content.find('`\n  },', md_start)
    if md_end == -1:
        md_end = content.find('`\n  }', md_start)
    obj_end = md_end + 1  # includes trailing backtick
    
    # Safely escape backticks and ${} in markdown
    safe_md = b['markdown'].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    # Construct TS object snippet
    ts_obj = f"""  {{
    slug: "{b['slug']}",
    title: "{b['title']}",
    tagline: "{b['tagline']}",
    category: "{b['category']}",
    readTime: {b['readTime']},
    lastUpdated: "{b['lastUpdated']}",
    prerequisites: {json.dumps(b['prerequisites'])},
    related: {json.dumps(b['related'])},
    practiceProblems: {json.dumps(b['practiceProblems'])},
    markdown: `{safe_md}`"""

    content = content[:obj_start] + ts_obj + content[obj_end:]
    print(f"Successfully replaced '{slug}' in blogData.ts.")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESSFULLY REBUILT src/config/blogData.ts WITH BATCH 3 BLOGS!")
