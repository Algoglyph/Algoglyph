import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate domain 07: Machine Learning
ml_idx = text.find("id: 'machine-learning'")
if ml_idx == -1:
    ml_idx = text.find('id: "machine-learning"')

# Next main domain in ROADMAP_DOMAINS array is id: 'operating-systems'
os_idx = text.find("id: 'operating-systems'", ml_idx)
if os_idx == -1:
    os_idx = text.find('id: "operating-systems"', ml_idx)

ml_text = text[ml_idx:os_idx]

# Extract all topics and concepts
topics = re.findall(r"name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]", ml_text)

print(f"Machine Learning Roadmap Domain (`machine-learning`) Blog Count: {len(topics)}\n")

for idx, (name, slug) in enumerate(topics, 1):
    print(f"{idx}. **{name}** (`{slug}`)")

