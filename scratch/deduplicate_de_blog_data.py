import re

print("=== DEDUPLICATING deBlogData.ts ===")

with open('src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the start of the object: export const deBlogData: Record<string, string> = {
start_match = re.search(r"export\s+const\s+deBlogData\s*:\s*Record<string,\s*string>\s*=\s*\{", content)
if not start_match:
    print("Could not find start of deBlogData object!")
    exit(1)

start_idx = start_match.end()
end_idx = content.rfind("};")

object_body = content[start_idx:end_idx]

# Let's extract each key-value block.
# Since values are wrapped in backticks (which can contain inner backticks, but usually not nested backticks at the start/end),
# we can match: \s*['"]([^'"]+)['"]\s*:\s*`([\s\S]*?)`\s*(,|$)
pattern = r"(\s*['\"]([^'\"]+)['\"]\s*:\s*`[\s\S]*?`\s*,?)"
blocks = re.findall(pattern, object_body)

print(f"Parsed {len(blocks)} total key-value blocks.")

seen_keys = set()
deduplicated_blocks = []
removed_count = 0

# We iterate and keep only the first occurrence of each key
for block_text, key in blocks:
    if key in seen_keys:
        removed_count += 1
        continue
    seen_keys.add(key)
    deduplicated_blocks.append(block_text)

print(f"Keys kept: {len(seen_keys)}")
print(f"Duplicate blocks removed: {removed_count}")

# Reconstruct the file content
new_object_body = "".join(deduplicated_blocks)
new_content = content[:start_idx] + new_object_body + content[end_idx:]

with open('src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Deduplication of deBlogData.ts completed successfully!")
