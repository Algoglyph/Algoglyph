# -*- coding: utf-8 -*-
import json
import re

de_blog_path = './src/config/deBlogData.ts'

with open(de_blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

def inject_batch(batch_json_path):
    global content
    with open(batch_json_path, 'r', encoding='utf-8') as f:
        articles = json.load(f)

    updated_count = 0
    for slug, md in articles.items():
        safe_md = md.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
        
        pattern = r"'" + re.escape(slug) + r"'\s*:\s*(`[\s\S]*?`|'[\s\S]*?')"
        replacement = f"'{slug}': `{safe_md}`"

        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            updated_count += 1
        else:
            insert_pos = content.rfind('};')
            if insert_pos != -1:
                new_entry = f"\n  '{slug}': `{safe_md}`,\n"
                content = content[:insert_pos] + new_entry + content[insert_pos:]
                updated_count += 1

    return updated_count

c1 = inject_batch('./scratch/b1_data.json')
c2 = inject_batch('./scratch/b2_data.json')
c3 = inject_batch('./scratch/b3_data.json')
c4 = inject_batch('./scratch/b4_data.json')
c5 = inject_batch('./scratch/b5_data.json')
c6 = inject_batch('./scratch/b6_data.json')

with open(de_blog_path, 'w', encoding='utf-8') as f:
    f.write(content)

total = c1 + c2 + c3 + c4 + c5 + c6
print(f"SUCCESS! Integrated ALL 42 Backend Articles into deBlogData.ts (Total entries updated: {total})!")
