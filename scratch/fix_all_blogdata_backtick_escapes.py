import json
import re

print("=== FIXING UNESCAPED BACKTICKS & PARSE ERRORS IN src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

batch_files = [
    'scratch/ai_batch4_clean_quality.json',
    'scratch/ai_batch5_clean_quality.json',
    'scratch/fs_batch1_perfect_7500.json'
]

all_batch_articles = {}
for bf in batch_files:
    try:
        with open(bf, 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_batch_articles.update(data)
    except Exception as e:
        print(f"Error loading {bf}: {e}")

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

# Remove all occurrences of the slugs in all_batch_articles from blogData.ts
for slug in all_batch_articles.keys():
    pattern = r"\s*\{\s*slug:\s*['\"]" + re.escape(slug) + r"['\"][\s\S]*?\n\s*\}(?:,\s*)?"
    matches = list(re.finditer(pattern, content))
    if matches:
        print(f"Removing {len(matches)} occurrences of '{slug}'")
        for m in reversed(matches):
            content = content[:m.start()] + content[m.end():]

# Clean any leftover orphaned css code snippets or broken strings around line 46758
orphan_pattern = r"\n/\* Demonstrating box-sizing behavior \*/[\s\S]*?---"
content = re.sub(orphan_pattern, "", content)

# Now safely append all articles to the end of BLOG_POSTS before `];`
last_bracket = content.rfind('];')
if last_bracket != -1:
    new_entries_code = []
    for slug, article in all_batch_articles.items():
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

print("\nSUCCESSFULLY REPAIRED blogData.ts!")
