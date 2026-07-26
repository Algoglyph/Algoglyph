import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Match the domain object for machine-learning
ml_domain_pos = text.find("id: 'machine-learning'")
# find the next domain object at the same level
next_domain_pos = text.find("id: 'operating-systems'")

domain_text = text[ml_domain_pos:next_domain_pos]

# Parse zones / topics
topics = re.findall(r"name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]", domain_text)

print(f"Total AI & Machine Learning Blogs in Roadmap: {len(topics)}\n")

for idx, (name, slug) in enumerate(topics, 1):
    print(f"{idx}. {name} (`{slug}`)")

