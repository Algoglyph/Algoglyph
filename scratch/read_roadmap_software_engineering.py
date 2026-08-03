with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find("id: 'software-engineering'")
print(f"Start index: {start_idx}")

# Let's count matching brackets to extract the exact software-engineering domain object.
# It starts with the object containing "id: 'software-engineering'" (e.g. the { before it).
# Let's find the { before "id: 'software-engineering'".
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
fs_domain_str = content[open_brace_idx:close_brace_idx+1]
print(f"Domain string length: {len(fs_domain_str)}")

# Let's count blogSlug definitions in it:
import re
slugs = re.findall(r"blogSlug:\s*'([^']+)'", fs_domain_str)
print(f"Found {len(slugs)} slugs:")
for s in slugs:
    print("  " + s)

# Let's write the entire domain string to a file so we can view it or inspect
with open('scratch/fs_domain.json', 'w', encoding='utf-8') as f:
    f.write(fs_domain_str)
