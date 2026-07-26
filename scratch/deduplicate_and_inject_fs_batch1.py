import json
import re

print("=== REMOVING DUPLICATE OBJECTS & ATOMICALLY INJECTING FULL STACK BATCH 1 ===")

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

# First, remove ALL existing occurrences of the 10 Batch 1 slugs from blogData.ts
for slug in batch1_dict.keys():
    pattern = r"\s*\{\s*slug:\s*['\"]" + re.escape(slug) + r"['\"][\s\S]*?\n\s*\}(?:,\s*)?"
    matches = list(re.finditer(pattern, content))
    if matches:
        print(f"Removing {len(matches)} duplicate entries for '{slug}'")
        for m in reversed(matches):
            content = content[:m.start()] + content[m.end():]

# Now append each slug exactly ONCE before the ending `];`
last_bracket = content.rfind('];')
if last_bracket != -1:
    new_entries_code = []
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
        new_entries_code.append(entry)

    content = content[:last_bracket].rstrip() + ",\n" + ",\n".join(new_entries_code) + "\n];\n"

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDEDUPLICATION & CLEAN INJECTION COMPLETE!")
