import json
import re

with open('scratch/ai_batch3_heavy_real.json', 'r', encoding='utf-8') as f:
    blogs = json.load(f)

print(f"Loaded {len(blogs)} clean REAL AI & Data Scientist Batch 3 blogs.")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find array end
p_array_end = content.rfind('];')
if p_array_end == -1:
    p_array_end = content.rfind(']')

# Remove any previous entries of these slugs if present
for slug in blogs.keys():
    pattern_start = f'slug: "{slug}"'
    pattern_start_quotes = f'"slug": "{slug}"'
    
    p_s = content.find(pattern_start)
    if p_s == -1:
        p_s = content.find(pattern_start_quotes)
        
    if p_s != -1:
        obj_s = content.rfind('{', 0, p_s)
        p_md = content.find('markdown: `', p_s)
        if p_md == -1:
            p_md = content.find('"markdown": `', p_s)
            
        md_e = content.find('`\n  }', p_md)
        if md_e == -1:
            md_e = content.find('`\n  },', p_md)
            
        if md_e != -1:
            obj_e = content.find('}', md_e) + 1
            content = content[:obj_s] + content[obj_e:]
            print(f"Removed pre-existing entry for '{slug}'.")

# Also remove the 10 incorrect DSA blogs added in the previous turn if present
dsa_slugs_to_remove = [
    "dijkstra", "dynamic-programming", "greedy", "backtracking",
    "searching", "sorting", "tree-traversal", "mst-union-find",
    "scc-bridges", "string-algorithms"
]

for dsa_slug in dsa_slugs_to_remove:
    pattern_start = f'slug: "{dsa_slug}"'
    pattern_start_quotes = f'"slug": "{dsa_slug}"'
    
    p_s = content.find(pattern_start)
    if p_s == -1:
        p_s = content.find(pattern_start_quotes)
        
    if p_s != -1:
        obj_s = content.rfind('{', 0, p_s)
        p_md = content.find('markdown: `', p_s)
        if p_md == -1:
            p_md = content.find('"markdown": `', p_s)
            
        md_e = content.find('`\n  }', p_md)
        if md_e == -1:
            md_e = content.find('`\n  },', p_md)
            
        if md_e != -1:
            obj_e = content.find('}', md_e) + 1
            content = content[:obj_s] + content[obj_e:]
            print(f"Cleaned up non-AI DSA blog '{dsa_slug}'.")

ts_objects = []

for slug, b in blogs.items():
    # Safely escape backticks and ${}
    safe_md = b['markdown'].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
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
    markdown: `{safe_md}`
  }}"""
    ts_objects.append(ts_obj)

batch3_code = ",\n" + ",\n".join(ts_objects) + "\n"

p_array_end = content.rfind('];')
if p_array_end == -1:
    p_array_end = content.rfind(']')

content = content[:p_array_end] + batch3_code + content[p_array_end:]

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESSFULLY INJECTED REAL AI & DATA SCIENTIST BATCH 3 BLOGS INTO src/config/blogData.ts!")
