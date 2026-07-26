import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's locate "id: 'software-engineering'" or "name: 'Full Stack Development'"
# We will do a robust brace-matching parser from that point
start_idx = content.find("id: 'software-engineering'")
if start_idx == -1:
    start_idx = content.find("name: 'Full Stack Development'")

print(f"Start index: {start_idx}")

# Let's extract the Full Stack Development block using brace counting
brace_count = 0
found_first_brace = False
block_chars = []

for i in range(start_idx, len(content)):
    char = content[i]
    if char == '{':
        brace_count += 1
        found_first_brace = True
    elif char == '}':
        brace_count -= 1
        
    if found_first_brace:
        block_chars.append(char)
        if brace_count == 0:
            break

fs_block = "".join(block_chars)
print(f"Extracted block length: {len(fs_block)} characters")

# Find all occurrences of blogSlug inside fs_block
slugs = re.findall(r"blogSlug:\s*'([^']+)'", fs_block)
print(f"Found {len(slugs)} slugs in the Full Stack Development roadmap:")
for idx, s in enumerate(slugs, 1):
    print(f"{idx}. {s}")
