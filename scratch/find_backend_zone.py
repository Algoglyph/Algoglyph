import json
import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Locate ROADMAP_ZONES array
# Print all zone names and their topic counts
pattern = r'{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*number:\s*[\'"]([^\'"]+)[\'"],\s*name:\s*[\'"]([^\'"]+)[\'"]'
matches = re.findall(pattern, text)

print("ROADMAP ZONES:")
for z_id, num, name in matches:
    print(f"Zone {num} [{z_id}]: {name}")
