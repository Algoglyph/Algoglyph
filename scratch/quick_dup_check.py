import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

all_slugs = re.findall(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']''', content)
all_slugs = [s for s in all_slugs if s != 'string']

seen = {}
duplicates = []
for s in all_slugs:
    if s in seen:
        seen[s] += 1
        if s not in duplicates:
            duplicates.append(s)
    else:
        seen[s] = 1

print(f"Total slugs: {len(all_slugs)}")
if duplicates:
    print(f"DUPLICATE SLUGS ({len(duplicates)}):")
    for d in duplicates:
        print(f"  - {d} ({seen[d]} times)")
else:
    print("SUCCESS: No duplicate slugs found!")
