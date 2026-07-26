with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

slugs = [
    "html-semantics", "css-layouts", "checkpoint-static", "javascript-basics",
    "npm-ecosystem", "checkpoint-interactivity", "git-version-control",
    "github-collaboration", "checkpoint-collaborative", "checkpoint-external-packages"
]

print("=== CHECKING FOR BLUEPRINT/PLACEHOLDER WORDS IN FULL STACK BLOGS ===")

keywords = [
    "blueprint", "placeholder", "lorem ipsum", "tbd", "to be detailed",
    "insert here", "generic", "standard template", "duplicate", "todo", "write here"
]

for slug in slugs:
    idx = content.find(f"slug: '{slug}'")
    if idx == -1:
        print(f"Slug not found: {slug}")
        continue
    
    # Extract markdown property
    md_start = content.find("markdown: `", idx)
    if md_start == -1:
        continue
    md_content_start = md_start + len("markdown: `")
    
    # Extract md content
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
            
    found_keywords = [kw for kw in keywords if kw in md_content.lower()]
    print(f"Slug: {slug} | Keywords found: {found_keywords}")
