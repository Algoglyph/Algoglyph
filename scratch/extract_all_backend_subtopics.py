import json
import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate Zone 03 'backend' or Zone 09 'software-engineering'
p_backend = text.find("id: 'backend'")
p_next_zone = text.find("id: 'network-engineering'", p_backend)

backend_text = text[p_backend:p_next_zone]

# Extract all subtopic blocks: { id: '...', name: '...', blogSlug: '...' }
subtopic_matches = re.findall(r"{\s*id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]\s*}", backend_text)

print(f"Total Subtopics in Backend / Full Stack Zone: {len(subtopic_matches)}")
print("="*60)
for idx, (s_id, name, slug) in enumerate(subtopic_matches, 1):
    print(f"{idx:3d}. Name: {name} | Slug: {slug}")
