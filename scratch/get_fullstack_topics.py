import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate domain for backend / full-stack
# Let's search for domain title containing System Design / Backend / Full Stack
p_start = text.find("id: 'system-design'")
if p_start == -1:
    p_start = text.find('id: "system-design"')

p_next_domain = text.find("id: 'machine-learning'", p_start)
if p_next_domain == -1:
    p_next_domain = text.find("id: 'ml'", p_start)
if p_next_domain == -1:
    p_next_domain = text.find("id: 'os-architecture'", p_start)

domain_chunk = text[p_start:p_next_domain] if p_next_domain != -1 else text[p_start:]

# Extract all topics
topics = re.findall(r"title:\s*['\"]([^'\"]+)['\"][\s\S]*?blogSlug:\s*['\"]([^'\"]+)['\"]", domain_chunk)

print(f"Extracted {len(topics)} topics from domain:")
for idx, (title, slug) in enumerate(topics, 1):
    print(f"{idx:2d}. Title: {title} | Slug: {slug}")
