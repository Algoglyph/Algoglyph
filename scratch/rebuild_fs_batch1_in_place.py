import json
import re

print("=== REBUILDING FULL STACK BATCH 1 IN-PLACE IN blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open('scratch/fs_batch1_perfect_7500.json', 'r', encoding='utf-8') as f:
    batch1_dict = json.load(f)

def clean_markdown_text(md):
    # Remove repetitive checklist blocks
    patterns = [
        r"\n---\s*\n\s*###?\s*Production Maintenance & Monitoring Checklist[\s\S]*?(?=\n\n#|\n\n##|\n\n###|$)",
        r"\n---\s*\n\s*##\s*\d*\.?\s*Technical Architecture Deep-Dive & Engineering Reference[\s\S]*?(?=\n\n#|\n\n##|$)",
        r"\n---\s*\n\s*###?\s*Architectural Best Practices Summary[\s\S]*?(?=\n\n#|\n\n##|$)"
    ]
    for p in patterns:
        md = re.sub(p, "", md)

    # Deduplicate H2 headings
    lines = md.splitlines()
    seen_h2 = set()
    cleaned = []
    h2_counter = 1
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## '):
            title = stripped[3:].strip()
            clean_title = re.sub(r'^[0-9\.\-\s]+', '', title).strip()
            if clean_title in seen_h2:
                continue
            seen_h2.add(clean_title)
            line = f"## {h2_counter}. {clean_title}"
            h2_counter += 1
        cleaned.append(line)
    return "\n".join(cleaned)

def escape_template_literal(text):
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\', r'\\')
    text = text.replace('`', r'\`')
    text = text.replace('${', r'\${')
    return text

for slug, article in batch1_dict.items():
    clean_md = clean_markdown_text(article['markdown'])
    escaped_md = escape_template_literal(clean_md)

    title = json.dumps(article['title'])
    tagline = json.dumps(article['tagline'])
    cat = json.dumps(article['category'])
    rt = article['readTime']
    lu = article['lastUpdated']
    prereqs = json.dumps(article['prerequisites'])
    related = json.dumps(article['related'])
    practice = json.dumps(article['practiceProblems'])

    new_entry = f"""  {{
    slug: '{slug}',
    title: {title},
    tagline: {tagline},
    category: {cat},
    readTime: '{rt}',
    lastUpdated: '{lu}',
    prerequisites: {prereqs},
    related: {related},
    practiceProblems: {practice},
    markdown: `{escaped_md}`
  }}"""

    # Locate entry in content
    p_slug = content.find(f"slug: '{slug}'")
    if p_slug == -1:
        p_slug = content.find(f'slug: "{slug}"')

    if p_slug != -1:
        p_entry_start = content.rfind("\n  {", 0, p_slug)
        p_entry_end = content.find("\n  },", p_slug)
        if p_entry_end == -1:
            p_entry_end = content.find("\n  }", p_slug)

        if p_entry_start != -1 and p_entry_end != -1:
            print(f"Replacing entry in-place for '{slug}'")
            content = content[:p_entry_start] + "\n" + new_entry.strip() + content[p_entry_end:]

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nIN-PLACE REBUILD COMPLETE!")
