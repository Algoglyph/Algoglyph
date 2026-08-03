import subprocess
import re

# Get old content from git
result = subprocess.run(
    ['git', 'show', 'c600d83:src/config/blogData.ts'],
    capture_output=True, text=True, encoding='utf-8',
    cwd='.'
)
old_content = result.stdout

# Find all slugs with categories in old content
pattern = re.compile(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\'].*?["\']?category["\']?\s*:\s*["\']([^"\']+)["\']''', re.DOTALL)
matches = list(pattern.finditer(old_content))

category_slugs = {}
for m in matches:
    slug = m.group(1)
    cat = m.group(2)
    if slug == 'string':
        continue
    category_slugs.setdefault(cat, []).append(slug)

print("Categories in old git commit:")
for cat in sorted(category_slugs.keys()):
    print(f"  [{cat}] - {len(category_slugs[cat])} entries")
