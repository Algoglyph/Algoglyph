import re

print("=== FINDING DUPLICATE KEYS IN deBlogData.ts ===")

with open('src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find all keys declared inside the export const deBlogData object
# Matches keys like:   'async-coroutines': `
keys_with_lines = []
for i, line in enumerate(content.splitlines(), 1):
    m = re.match(r"^\s*['\"]([^'\"]+)['\"]\s*:", line)
    if m:
        keys_with_lines.append((m.group(1), i))

seen = {}
duplicates = []
for key, line in keys_with_lines:
    if key in seen:
        duplicates.append((key, seen[key], line))
    else:
        seen[key] = line

print(f"Total keys found: {len(keys_with_lines)}")
print(f"Duplicate keys found: {len(duplicates)}")
for dup in duplicates:
    print(f"Key: '{dup[0]}' first seen at line {dup[1]}, duplicated at line {dup[2]}")
