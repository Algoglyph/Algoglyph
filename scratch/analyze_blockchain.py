import re
import os

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for ID or Name related to Blockchain
# We can find all matches of domain names:
domain_matches = list(re.finditer(r"id:\s*'([^']+)',\s*(?:number:\s*'[^']+',\s*)?name:\s*'([^']+)'", content))

blockchain_domain = None
for m in domain_matches:
    if 'blockchain' in m.group(2).lower() or 'blockchain' in m.group(1).lower():
        blockchain_domain = m
        print(f"Found Blockchain domain: ID={m.group(1)}, Name={m.group(2)} at index {m.start()}")

if not blockchain_domain:
    print("Blockchain domain not found in roadmapData.ts!")
    exit(1)

# Let's find the closing brace of the blockchain domain block:
start_idx = blockchain_domain.start()
open_brace_idx = content.rfind("{", 0, start_idx)

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

blockchain_block = content[open_brace_idx:close_brace_idx+1]
print(f"Extracted block length: {len(blockchain_block)} characters")

# Find all slugs
slugs = re.findall(r"blogSlug:\s*'([^']+)'", blockchain_block)
print(f"Found {len(slugs)} slugs in the Blockchain roadmap:")
for idx, s in enumerate(slugs, 1):
    print(f"  {idx}. {s}")

# Let's create the folder in public/images/blockchain
folder_path = "public/images/blockchain"
os.makedirs(folder_path, exist_ok=True)
print(f"\nCreated folder: {folder_path}")

# Let's also check if .gitkeep is needed
gitkeep_path = os.path.join(folder_path, ".gitkeep")
with open(gitkeep_path, 'w') as f:
    f.write("")
print(f"Created .gitkeep in: {folder_path}")
