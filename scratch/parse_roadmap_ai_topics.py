import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find domain with id 'ai-data-scientist'
pos = text.find("id: 'ai-data-scientist'")
if pos == -1:
    pos = text.find('id: "ai-data-scientist"')

sub_text = text[pos:pos+40000]

# Find all subtopic blocks or blogSlugs in this domain sub_text until next domain `id:`
next_domain = sub_text.find("id: '", 50)
if next_domain != -1:
    domain_text = sub_text[:next_domain]
else:
    domain_text = sub_text

slugs = re.findall(r"blogSlug:\s*'([^']+)'", domain_text)
titles = re.findall(r"title:\s*'([^']+)'", domain_text)

print(f"Extracted {len(slugs)} slugs for AI & Data Scientist domain:\n")

print("=== Batch 2 Slugs (Blogs 11 to 20) ===")
for idx, (s, t) in enumerate(zip(slugs[10:20], titles[10:20]), 11):
    print(f"{idx}. {s} | Title: {t}")
