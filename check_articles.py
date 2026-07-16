import re

with open('src/config/deBlogData.ts', 'r') as f:
    content = f.read()

pattern = r"'de-[^']+':\s*`([\s\S]*?)`,"
matches = list(re.finditer(pattern, content))

print(f'Found {len(matches)} articles with template literals.')
if matches:
    lengths = [len(m.group(1)) for m in matches]
    svgs = [m.group(1).count('<svg') for m in matches]
    codes = [m.group(1).count('```') // 2 for m in matches]
    
    print(f'Average chars per article: {sum(lengths)/len(lengths):.0f}')
    print(f'Min chars: {min(lengths)}, Max chars: {max(lengths)}')
    
    print(f'Articles with at least 1 SVG: {sum(1 for s in svgs if s > 0)} / {len(matches)}')
    print(f'Articles with at least 1 Code block: {sum(1 for c in codes if c > 0)} / {len(matches)}')
    
    # List articles missing SVGs
    missing_svgs = [m.group(0).split(':')[0].strip("'") for m in matches if m.group(1).count('<svg') == 0]
    if missing_svgs:
        print(f'Articles missing SVGs: {missing_svgs}')

# Also check for empty strings just in case
empty = re.findall(r"'de-[^']+':\s*(?:''|\"\"),", content)
if empty:
    print(f'Empty articles: {len(empty)}')
else:
    print('No empty articles found.')
