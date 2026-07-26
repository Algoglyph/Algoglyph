import json
import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's load ROADMAP_ZONES by evaluating or regex parsing
# Let's find Zone 03 (Backend) and Zone 09 (Full Stack Development / Software Engineering)

def get_zone_subtopics(zone_id):
    pos = text.find(f'"id": "{zone_id}"')
    if pos == -1:
        pos = text.find(f"'id': '{zone_id}'")
    if pos == -1:
        return []
    
    # Find end of zone (next zone starts with "number": or "id": "...")
    next_zone_pos = text.find('"number":', pos + 30)
    if next_zone_pos == -1:
        next_zone_pos = len(text)
        
    chunk = text[pos:next_zone_pos]
    
    # Find all subtopic objects
    subtopics = re.findall(r'{\s*"id":\s*"([^"]+)",\s*"name":\s*"([^"]+)",\s*"blogSlug":\s*"([^"]+)"\s*}', chunk)
    return subtopics

backend = get_zone_subtopics("backend")
fullstack = get_zone_subtopics("software-engineering")
sysdesign = get_zone_subtopics("system-design")

print(f"Zone 'backend': {len(backend)} subtopics")
print(f"Zone 'software-engineering': {len(fullstack)} subtopics")
print(f"Zone 'system-design': {len(sysdesign)} subtopics")

if fullstack:
    print("\n--- Full Stack Development Subtopics ---")
    for idx, (s_id, name, slug) in enumerate(fullstack, 1):
        print(f"{idx:2d}. {name} (`{slug}`)")

if backend:
    print("\n--- Backend Subtopics ---")
    for idx, (s_id, name, slug) in enumerate(backend, 1):
        print(f"{idx:2d}. {name} (`{slug}`)")
