import json
import re

print("=== ATOMIC REBUILD OF FULL STACK BATCH 1 (#1 to #10) IN src/config/blogData.ts ===")

with open('scratch/fs_batch1_perfect_7500.json', 'r', encoding='utf-8') as f:
    batch1_dict = json.load(f)

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def escape_template_literal(text):
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\', r'\\')
    text = text.replace('`', r'\`')
    text = text.replace('${', r'\${')
    return text

# Clean H2 headers and FAQs cleanly
def sanitize_markdown(md):
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

for slug, article in batch1_dict.items():
    clean_md = sanitize_markdown(article['markdown'])
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

    pattern = r"\{\s*slug:\s*['\"]" + re.escape(slug) + r"['\"][\s\S]*?\n\s*\}"
    match = re.search(pattern, content)
    if match:
        content = content[:match.start()] + new_entry.strip() + content[match.end():]
        print(f"Cleanly replaced entry for '{slug}'")

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nREBUILD COMPLETE!")
