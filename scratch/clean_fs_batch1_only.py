import json
import re

print("=== CLEANING FULL STACK BATCH 1 BLOGS ONLY (#1 TO #10) ===")

fs_batch1_slugs = [
    "html-semantics",
    "css-layouts",
    "checkpoint-static",
    "javascript-basics",
    "npm-ecosystem",
    "checkpoint-interactivity",
    "git-version-control",
    "github-collaboration",
    "checkpoint-collaborative",
    "checkpoint-external-packages"
]

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Load clean JSON entries from scratch/fs_batch1_perfect_7500.json
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

# Remove existing entries for these 10 slugs ONLY from blogData.ts
for slug in fs_batch1_slugs:
    pattern = r"\s*\{\s*slug:\s*['\"]" + re.escape(slug) + r"['\"][\s\S]*?\n\s*\}(?:,\s*)?"
    matches = list(re.finditer(pattern, content))
    if matches:
        print(f"Removing {len(matches)} old entry for '{slug}'")
        for m in reversed(matches):
            content = content[:m.start()] + content[m.end():]

# Append clean entries for these 10 Full Stack slugs right before `];`
last_bracket = content.rfind('];')
if last_bracket != -1:
    new_entries = []
    for slug in fs_batch1_slugs:
        article = batch1_dict[slug]
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

        entry = f"""  {{
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
        new_entries.append(entry)

    content = content[:last_bracket].rstrip() + ",\n" + ",\n".join(new_entries) + "\n];\n"

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nSUCCESSFULLY UPDATED ONLY THE 10 FULL STACK BATCH 1 BLOGS!")
