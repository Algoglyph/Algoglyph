with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

slugs = [
    "html-semantics", "css-layouts", "checkpoint-static", "javascript-basics",
    "npm-ecosystem", "checkpoint-interactivity", "git-version-control",
    "github-collaboration", "checkpoint-collaborative", "checkpoint-external-packages"
]

blogs_md = {}
for slug in slugs:
    idx = content.find(f"slug: '{slug}'")
    if idx == -1:
        continue
    md_start = content.find("markdown: `", idx)
    if md_start == -1:
        continue
    md_content_start = md_start + len("markdown: `")
    
    md_content = ""
    esc = False
    for i in range(md_content_start, len(content)):
        char = content[i]
        if esc:
            esc = False
            md_content += char
        elif char == '\\':
            esc = True
            md_content += char
        elif char == '`':
            next_chars = content[i+1:i+20].strip()
            if not next_chars or next_chars.startswith(',') or next_chars.startswith('}') or next_chars.startswith('category'):
                break
            else:
                md_content += char
        else:
            md_content += char
    blogs_md[slug] = md_content

for slug in slugs:
    md = blogs_md[slug]
    div_idx = md.find("## Extra Technical Deep-Dive")
    faq_idx = md.find("## 5. Frequently Asked Questions (FAQs)")
    if div_idx != -1 and faq_idx != -1:
        section_to_remove = md[div_idx:faq_idx]
        print(f"\n==========================================")
        print(f"SLUG: {slug}")
        print(f"Section to remove length: {len(section_to_remove)} chars")
        # Print first 200 and last 200 of section to remove
        print("START:")
        print(section_to_remove[:200])
        print("END:")
        print(section_to_remove[-200:])
