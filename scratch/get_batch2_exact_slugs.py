import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find("id: 'ai-data-scientist'")
next_zone = text.find("id: '", pos + 30)

zone8_text = text[pos:next_zone] if next_zone != -1 else text[pos:]

slug_matches = re.findall(r"blogSlug:\s*'([^']+)'", zone8_text)

print(f"Total blogSlugs in AI & Data Scientist domain (Zone 08): {len(slug_matches)}\n")

for idx, slug in enumerate(slug_matches, 1):
    print(f"{idx:2d}. {slug}")

print("\n=== BATCH 2 SLUGS (Blogs 11 to 20) ===")
for idx, slug in enumerate(slug_matches[10:20], 11):
    print(f"{idx:2d}. {slug}")
