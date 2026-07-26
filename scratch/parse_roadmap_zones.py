import json
import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Match all zones and their names
zone_matches = re.findall(r'name:\s*[\'"]([^\'"]+)[\'"]', text)

print("Found names in roadmapData.ts:")
for idx, name in enumerate(zone_matches[:20], 1):
    print(f" {idx}. {name}")
