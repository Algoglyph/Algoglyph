import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find domain 07: Machine Learning
ml_start = text.find("id: 'machine-learning'")
# Find domain 08: Operating Systems
os_start = text.find("id: 'operating-systems'")

ml_text = text[ml_start:os_start]

# Find all concepts/topics inside Machine Learning domain
# Extract subtopic objects: { id: '...', name: '...', blogSlug: '...' }
subtopics = re.findall(r"{\s*id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]\s*}", ml_text)

print(f"Total subtopics/blogs under Machine Learning domain (id: machine-learning): {len(subtopics)}\n")

for idx, (sid, name, slug) in enumerate(subtopics, 1):
    print(f"{idx}. **{name}** (`{slug}`)")

