import json

with open('scratch/ai_batch3_heavy.json', 'r', encoding='utf-8') as f:
    blogs = json.load(f)

print(f"Loaded {len(blogs)} clean Batch 3 blogs from scratch/ai_batch3_heavy.json.")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of BLOG_POSTS array (before export or file end)
# Find last closing bracket of array
p_array_end = content.rfind('];')
if p_array_end == -1:
    p_array_end = content.rfind(']')

print(f"Array end position: {p_array_end}")

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

# Check if any of these slugs already exist in BLOG_POSTS array, if so remove old entries
for slug in blogs.keys():
    pattern_start = f'slug: "{slug}"'
    if pattern_start in content:
        p_s = content.find(pattern_start)
        obj_s = content.rfind('{', 0, p_s)
        p_md = content.find('markdown: `', p_s)
        md_e = content.find('`\n  }', p_md)
        if md_e != -1:
            obj_e = md_e + 4
            content = content[:obj_s] + content[obj_e:]
            print(f"Removed pre-existing object for '{slug}'.")

# Recalculate p_array_end
p_array_end = content.rfind('];')
if p_array_end == -1:
    p_array_end = content.rfind(']')

content = content[:p_array_end] + batch3_code + content[p_array_end:]

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESSFULLY APPENDED BATCH 3 BLOGS TO src/config/blogData.ts!")
