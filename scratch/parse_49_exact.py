import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

ml_domain_pos = text.find("id: 'machine-learning'")
next_domain_pos = text.find("id: 'operating-systems'")

domain_text = text[ml_domain_pos:next_domain_pos]

# Parse subtopic names and slugs
topics = re.findall(r"name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]", domain_text)

print(f"Showing the 49 AI & Data Scientist Blogs from Roadmap (Total found in domain slice: {len(topics)})\n")

for idx, (name, slug) in enumerate(topics[:49], 1):
    print(f"{idx}. **{name}** (`{slug}`)")

