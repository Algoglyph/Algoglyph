import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

start_pos = text.find("id: 'ai-data-scientist'")
end_pos = text.find("id: 'software-engineering'", start_pos)

ai_ds_block = text[start_pos:end_pos]

concepts = re.findall(r"name:\s*['\"]([^'\"]+)['\"][\s\S]*?subtopics:\s*\[([\s\S]*?)\]\s*}", ai_ds_block)

output_md = "# AI & Data Scientist - Image Asset Mapping List\n\n"
output_md += "Folder Location: `public/images/ai-data-scientist/`\n\n"
output_md += "| # | Section / Category | Blog Title | Slug | Dark Image Filename | Light Image Filename |\n"
output_md += "|---|---|---|---|---|---|\n"

total = 0
for c_name, sub_raw in concepts:
    subtopics = re.findall(r"name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]", sub_raw)
    for title, slug in subtopics:
        total += 1
        output_md += f"| {total} | **{c_name}** | **{title}** | `{slug}` | `{slug}-dark.png` | `{slug}-light.png` |\n"

artifact_path = r'C:\Users\varun\.gemini\antigravity-ide\brain\b834822d-3c20-48ab-8421-a903c64ca08c\ai_data_scientist_image_list.md'
with open(artifact_path, 'w', encoding='utf-8') as f_out:
    f_out.write(output_md)

print(f"Generated AI & Data Scientist image list for {total} blogs.")
