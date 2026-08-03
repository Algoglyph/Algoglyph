import json
import re

print("=== CLEAN RE-INJECTION WITH 100% PROPER BACKTICK ESCAPING ===")

# First, clean unescaped stray `})` from raw json
with open('scratch/ai_batch3_heavy_real_pure.json', 'r', encoding='utf-8') as f:
    batch3_dict = json.load(f)

for slug, article in batch3_dict.items():
    md = article['markdown']
    # Ensure no orphaned `  })` or improper code fence terminations exist in raw md
    md = md.replace("```\n  })\n    return", "```\n    return")
    article['markdown'] = md

with open('scratch/ai_batch3_heavy_real_pure.json', 'w', encoding='utf-8') as f:
    json.dump(batch3_dict, f, indent=2)

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def escape_template_literal(text):
    # Strip any pre-existing backslashes in front of backticks first
    text = re.sub(r'\\+`', '`', text)
    # Strip pre-existing backslashes in front of ${
    text = re.sub(r'\\+\${', '${', text)
    # Replace backslash with double backslash
    text = text.replace('\\', '\\\\')
    # Replace every single backtick with \`
    text = text.replace('`', '\\`')
    # Replace ${ with \${
    text = text.replace('${', '\\${')
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

print(f"\nSUCCESSFULLY RE-INJECTED ALL {injected_count} BATCH 3 BLOGS WITH PERFECT BACKTICK ESCAPING!")
