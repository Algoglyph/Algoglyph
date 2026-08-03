import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pos_start = text.find("id: 'ai-data-scientist'")
pos_end = text.find("number: '09'", pos_start)
if pos_end == -1:
    pos_end = text.find("number: '09'", pos_start)

zone8_text = text[pos_start:pos_end] if pos_end != -1 else text[pos_start:pos_start+50000]

slugs = re.findall(r"blogSlug:\s*'([^']+)'", zone8_text)

print(f"Total Slugs in Zone 08 (AI & Data Scientist): {len(slugs)}\n")

for i, s in enumerate(slugs, 1):
    print(f"{i:2d}. {s}")

print("\n=== BATCH 2 SLUGS (Blogs 11 to 20) ===")
for i, s in enumerate(slugs[10:20], 11):
    print(f"{i:2d}. {s}")
