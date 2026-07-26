import re

print("=== ESCAPING BACKTICKS IN ARRAYS ENTRY ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

p1 = content.find('"slug": "arrays"')
if p1 == -1:
    p1 = content.find("slug: 'arrays'")

p2 = content.find('"slug": "linked-list"')
if p2 == -1:
    p2 = content.find("slug: 'linked-list'")

block = content[p1:p2]
p_md_start = block.find('markdown": `') + len('markdown": `')
p_md_end = block.rfind('`,')

md = block[p_md_start:p_md_end]
# Escape backticks
md_clean = re.sub(r'\\+`', '`', md)
md_escaped = md_clean.replace('`', r'\`')

new_block = block[:p_md_start] + md_escaped + block[p_md_end:]
content = content[:p1] + new_block + content[p2:]

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("ARRAYS BACKTICKS ESCAPED SUCCESSFULLY!")
