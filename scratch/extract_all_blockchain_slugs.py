import re
import os

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's locate "id: 'blockchain'" exactly
start_idx = content.find("id: 'blockchain'")
if start_idx == -1:
    print("Could not find id: 'blockchain'")
    exit(1)

print(f"Start index: {start_idx}")

# Let's find the { before start_idx
open_brace_idx = content.rfind("{", 0, start_idx)
print(f"Open brace index: {open_brace_idx}")

brace_count = 0
close_brace_idx = -1
for i in range(open_brace_idx, len(content)):
    char = content[i]
    if char == '{':
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0:
            close_brace_idx = i
            break

print(f"Close brace index: {close_brace_idx}")
blockchain_block = content[open_brace_idx:close_brace_idx+1]
print(f"Blockchain domain string length: {len(blockchain_block)}")

# Let's find all unique blogSlug definitions in the blockchain block
slugs = re.findall(r"blogSlug:\s*'([^']+)'", blockchain_block)

# Since some slugs might be duplicates or we want to list them clean:
unique_slugs = []
seen = set()
for s in slugs:
    if s not in seen:
        seen.add(s)
        unique_slugs.append(s)

print(f"\nFound {len(unique_slugs)} unique slugs in the Blockchain roadmap:")
for idx, s in enumerate(unique_slugs, 1):
    # Let's also print the name associated with this subtopic
    # Let's find the subtopic object containing the slug to get its name
    sub_pattern = r"name:\s*'([^']+)',\s*blogSlug:\s*'" + s + r"'"
    m = re.search(sub_pattern, blockchain_block)
    name = m.group(1) if m else "Unknown"
    print(f"  {idx:02d}. Slug: {s:<35} | Name: {name}")

# Create folder public/images/blockchain if not exists
os.makedirs("public/images/blockchain", exist_ok=True)
print("\nDirectory public/images/blockchain verified.")
