import json
import re

print("=== FIXING ALL WEIRD HEADLINE DOTS IN src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def clean_markdown_headers_perfectly(markdown):
    lines = markdown.splitlines()
    seen_h2 = set()
    cleaned_lines = []
    
    h2_counter = 1
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## '):
            header_text = stripped[3:].strip()
            # Strip ALL leading numbers, dots, dashes, and whitespace
            clean_title = re.sub(r'^[0-9\.\-\s]+', '', header_text).strip()
            
            if not clean_title:
                continue
                
            if clean_title in seen_h2:
                continue
            seen_h2.add(clean_title)
            line = f"## {h2_counter}. {clean_title}"
            h2_counter += 1
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)

# Clean all Batch 3 entries in json and re-inject cleanly into blogData.ts
with open('scratch/ai_batch3_heavy_real_pure.json', 'r', encoding='utf-8') as f:
    batch3_dict = json.load(f)

for slug, article in batch3_dict.items():
    article['markdown'] = clean_markdown_headers_perfectly(article['markdown'])

with open('scratch/ai_batch3_heavy_real_pure.json', 'w', encoding='utf-8') as f:
    json.dump(batch3_dict, f, indent=2)

def escape_template_literal(text):
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\', r'\\')
    text = text.replace('`', r'\`')
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
        print(f"Cleaned headers & updated entry for '{slug}'")
        injected_count += 1

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nSUCCESSFULLY CLEANED ALL HEADLINE DOTS FOR {injected_count} BLOGS!")
