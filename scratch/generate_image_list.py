import re
import json

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

ml_domain_pos = text.find("id: 'machine-learning'")
next_domain_pos = text.find("id: 'operating-systems'")

domain_text = text[ml_domain_pos:next_domain_pos]

# Parse subtopic names and slugs
topics = re.findall(r"name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]", domain_text)

blogs_49 = topics[:49]

output_md = "# AI & Data Science Blogs - Image Asset Mapping List\n\n"
output_md += "| # | Blog Title | Slug | Dark Image Filename (`slug-dark.png`) | Light Image Filename (`slug-light.png`) |\n"
output_md += "|---|---|---|---|---|\n"

for idx, (title, slug) in enumerate(blogs_49, 1):
    output_md += f"| {idx} | **{title}** | `{slug}` | `{slug}-dark.png` | `{slug}-light.png` |\n"

with open('../ai_blogs_image_list.md', 'w', encoding='utf-8') as f_out:
    f_out.write(output_md)

print(f"Generated list for {len(blogs_49)} blogs successfully.")
