import json

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's locate the Full Stack Development block
start_idx = content.find("id: 'software-engineering'")
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

fs_domain_str = content[open_brace_idx:close_brace_idx+1]

# Let's target the 12 slugs to extract:
target_slugs = [
    "react-components", "tailwind-css", "checkpoint-frontend-apps",
    "node-js-runtime", "checkpoint-cli-apps", "postgresql-databases",
    "checkpoint-crud-apps", "restful-api-design", "jwt-authentication",
    "redis-caching", "checkpoint-complete-app", "linux-cli-basics"
]

# Let's search for each slug in fs_domain_str and extract its parent structure
# In roadmapData, a subtopic is like: { id: '...', name: '...', blogSlug: '...' }
# And a concept contains subtopics, and a topic contains concepts.
# Let's write a python regex or simple search to find the subtopic definition and printing the surrounding context.
import re

for slug in target_slugs:
    # Find the pattern of subtopic containing this blogSlug
    pattern = r"\{\s*id:\s*'[^']+',\s*name:\s*'([^']+)',\s*blogSlug:\s*'" + slug + r"'\s*\}"
    match = re.search(pattern, fs_domain_str)
    if match:
        name = match.group(1)
        print(f"Slug: {slug:<30} | Name in Roadmap: {name}")
    else:
        # Check without spaces or other structures
        pattern_flexible = r"blogSlug:\s*'" + slug + r"'"
        match_flex = re.search(pattern_flexible, fs_domain_str)
        if match_flex:
            pos = match_flex.start()
            subtopic_chunk = fs_domain_str[max(0, pos-150):min(len(fs_domain_str), pos+150)]
            print(f"Flexible match for {slug}:")
            print(subtopic_chunk.strip())
            print("-" * 40)
        else:
            print(f"Not found: {slug}")
