import re

with open('src/config/deBlogData.ts', 'r') as f:
    content = f.read()

pattern = r"'de-[^']+':\s*`([\s\S]*?)`,"
matches = list(re.finditer(pattern, content))

if matches:
    codes = [m.group(1).count(r'\`\`\`') // 2 for m in matches]
    print(f'Articles with at least 1 Code block: {sum(1 for c in codes if c > 0)} / {len(matches)}')
