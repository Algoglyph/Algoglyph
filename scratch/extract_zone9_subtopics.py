import json
import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

p_se = text.find("id: 'software-engineering'")
p_next = text.find("id: 'blockchain'", p_se)

se_text = text[p_se:p_next]

subtopic_matches = re.findall(r"{\s*id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]\s*}", se_text)

print(f"Total Subtopics in Zone 09 (Full Stack Development / Software Engineering): {len(subtopic_matches)}")
print("="*60)
for idx, (s_id, name, slug) in enumerate(subtopic_matches, 1):
    print(f"{idx:3d}. Name: {name} | Slug: {slug}")
