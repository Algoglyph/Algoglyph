import json
import re

print("=== INJECTING PERFECT FULL STACK BATCH 1 (#1 to #10) INTO src/config/blogData.ts ===")

with open('scratch/fs_batch1_perfect_7500.json', 'r', encoding='utf-8') as f:
    fs_batch1_dict = json.load(f)

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def escape_template_literal(text):
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\', r'\\')
    text = text.replace('`', r'\`')
    text = text.replace('${', r'\${')
    return text

injected_count = 0
for slug, article in fs_batch1_dict.items():
    title = json.dumps(article['title'])
    tagline = json.dumps(article['tagline'])
    cat = json.dumps(article['category'])
    rt = article['readTime']
    lu = article['lastUpdated']
    prereqs = json.dumps(article['prerequisites'])
    related = json.dumps(article['related'])
    practice = json.dumps(article['practiceProblems'])
    escaped_md = escape_template_literal(article['markdown'])

    new_entry_code = f"""  {{
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
        content = content[:match.start()] + new_entry_code.strip() + content[match.end():]
        print(f"Updated existing entry for '{slug}'")
        injected_count += 1
    else:
        last_bracket = content.rfind('];')
        if last_bracket != -1:
            content = content[:last_bracket].rstrip() + ",\n" + new_entry_code + "\n];\n"
            print(f"Appended new entry for '{slug}'")
            injected_count += 1

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nSUCCESSFULLY INJECTED ALL {injected_count} PERFECT FULL STACK BATCH 1 BLOGS INTO src/config/blogData.ts!")
