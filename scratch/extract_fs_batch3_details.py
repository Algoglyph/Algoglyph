import re

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

target_slugs = [
    "basic-aws-services", "checkpoint-deployment", "mesh-like-structures",
    "ansible-configuration", "terraform-iac", "checkpoint-automation",
    "checkpoint-infrastructure", "github-actions-cicd", "monit-monitoring",
    "checkpoint-cicd", "checkpoint-monitoring"
]

# We want to extract details for each slug
subtopic_pattern = r"\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*blogSlug:\s*'([^']+)'\s*\}"
subtopics = re.findall(subtopic_pattern, fs_domain_str)

subtopics_map = {slug: (sid, name) for sid, name, slug in subtopics}

for slug in target_slugs:
    if slug in subtopics_map:
        sid, name = subtopics_map[slug]
        print(f"Slug: {slug:<30} | ID: {sid:<30} | Name: {name}")
    else:
        print(f"Slug: {slug:<30} | NOT FOUND")
