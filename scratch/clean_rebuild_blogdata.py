import json
import re

print("=== REBUILDING blogData.ts WITH ABSOLUTELY CLEAN TEMPLATE LITERAL ESCAPING ===")

# Restore src/config/blogData.ts from git to get clean base file
import subprocess
subprocess.run(['git', 'restore', 'src/config/blogData.ts'], check=True)

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open('scratch/ai_batch3_heavy_real_pure.json', 'r', encoding='utf-8') as f:
    batch3_dict = json.load(f)

def escape_template_literal(text):
    # 1. Unescape any previous double escapes
    text = text.replace('\\\\', '\\')
    text = text.replace('\\`', '`')
    text = text.replace('\\${', '${')
    
    # 2. Escape backslashes first
    text = text.replace('\\', r'\\')
    
    # 3. Escape every backtick
    text = text.replace('`', r'\`')
    
    # 4. Escape ${
    text = text.replace('${', r'\${')
    return text

injected_count = 0
for slug, article in batch3_dict.items():
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

print(f"\nSUCCESSFULLY CLEAN REBUILT blogData.ts FOR ALL {injected_count} BLOGS!")
