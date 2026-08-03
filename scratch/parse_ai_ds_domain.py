import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start_pos = text.find("id: 'ai-data-scientist'")
end_pos = text.find("id: 'software-engineering'", start_pos)

ai_ds_block = text[start_pos:end_pos]

# Parse concept names and subtopics
concepts = re.findall(r"name:\s*['\"]([^'\"]+)['\"][\s\S]*?subtopics:\s*\[([\s\S]*?)\]\s*}", ai_ds_block)

total = 0
for c_name, sub_raw in concepts:
    subtopics = re.findall(r"name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]", sub_raw)
    if subtopics:
        print(f"### {c_name} ({len(subtopics)} blogs)")
        for name, slug in subtopics:
            total += 1
            print(f"{total}. **{name}** (`{slug}`)")
        print()

print(f"Total AI & Data Scientist domain blogs: {total}")
