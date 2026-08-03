import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find all subtopic blocks
# Format:
# "id": "...",
# "name": "...",
# "blogSlug": "..."

pattern = r'"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"blogSlug":\s*"([^"]+)"'
matches = re.findall(pattern, text)

print(f"Found {len(matches)} total subtopics with blogSlugs:")
for idx, (s_id, name, slug) in enumerate(matches, 1):
    print(f"{idx:3d}. ID: {s_id} | Name: {name} | Slug: {slug}")
