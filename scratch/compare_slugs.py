import subprocess
import re

# Get the old blogData.ts from last git commit
result = subprocess.run(
    ['git', 'show', 'c600d83:src/config/blogData.ts'],
    capture_output=True, text=True, encoding='utf-8',
    cwd='.'
)
old_content = result.stdout
print(f"Old content length: {len(old_content)} chars")

# Find all slugs in old file
old_slugs = re.findall(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']''', old_content)
old_slugs = [s for s in old_slugs if s != 'string']
print(f"Total slugs in old commit: {len(old_slugs)}")

# Get current slugs
with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    new_content = f.read()
new_slugs = re.findall(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']''', new_content)
new_slugs = [s for s in new_slugs if s != 'string']
print(f"Total slugs in current file: {len(new_slugs)}")

# Find slugs in old but not in new
missing = set(old_slugs) - set(new_slugs)
print(f"\nSlugs present in old commit but MISSING from current file ({len(missing)}):")
for s in sorted(missing):
    print(f"  - {s}")
