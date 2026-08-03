import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all slugs with their categories
pattern = re.compile(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\'].*?["\']?category["\']?\s*:\s*["\']([^"\']+)["\']''', re.DOTALL)
matches = list(pattern.finditer(content))

category_slugs = {}
for m in matches:
    slug = m.group(1)
    cat = m.group(2)
    if slug == 'string':
        continue
    category_slugs.setdefault(cat, []).append(slug)

print("Slugs grouped by category:")
for cat, slugs in sorted(category_slugs.items()):
    print(f"\n[{cat}] ({len(slugs)} entries):")
    for s in slugs:
        print(f"  - {s}")
