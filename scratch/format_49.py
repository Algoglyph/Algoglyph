import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

ml_domain_pos = text.find("id: 'machine-learning'")
next_domain_pos = text.find("id: 'operating-systems'")

domain_text = text[ml_domain_pos:next_domain_pos]

# Extract concepts and their subtopics
concept_matches = re.finditer(r"id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],[\s\S]*?subtopics:\s*\[([\s\S]*?)\]", domain_text)

total_count = 0
for match in concept_matches:
    concept_id = match.group(1)
    concept_name = match.group(2)
    subtopics_raw = match.group(3)
    
    subtopics = re.findall(r"name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]", subtopics_raw)
    
    if not subtopics:
        continue
        
    print(f"### {concept_name}")
    for name, slug in subtopics:
        total_count += 1
        print(f"{total_count}. **{name}** (`{slug}`)")
        if total_count == 49:
            break
    print()
    if total_count >= 49:
        break
