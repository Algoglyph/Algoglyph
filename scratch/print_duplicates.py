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

# Let's inspect the sections: "## Extra Technical Deep-Dive & Advanced Engineering Cases"
# for each slug, find that heading and print the text after it up to the next heading or end.
for slug in slugs:
    md = blogs_md[slug]
    heading = "## Extra Technical Deep-Dive & Advanced Engineering Cases"
    h_idx = md.find(heading)
    if h_idx != -1:
        print(f"\n==========================================")
        print(f"SLUG: {slug}")
        # Print next 500 characters
        print(md[h_idx:h_idx+1000])
