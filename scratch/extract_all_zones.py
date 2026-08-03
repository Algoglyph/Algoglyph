import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find zone names and number
zones = re.findall(r'"number":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', text)
print(f"Found {len(zones)} roadmap zones:\n")
for num, name in zones:
    print(f"Zone {num}: {name}")

# Now let's extract zone 08 "AI & Data Scientist" topics and slugs
pos_zone8 = text.find('"number": "08"')
if pos_zone8 == -1:
    pos_zone8 = text.find('"number": \'08\'')
if pos_zone8 == -1:
    pos_zone8 = text.find('AI & Data Scientist')

print(f"\nZone 08 position: {pos_zone8}")

if pos_zone8 != -1:
    zone8_text = text[pos_zone8:pos_zone8+30000]
    slugs = re.findall(r'"blogSlug":\s*"([^"]+)"', zone8_text)
    names = re.findall(r'"name":\s*"([^"]+)"', zone8_text)
    print(f"Total blogSlugs in Zone 08: {len(slugs)}")
    
    print("\n=== Batch 2 Slugs (Blogs 11 to 20) ===")
    for i, s in enumerate(slugs[10:20], 11):
        print(f"{i}. {s}")
