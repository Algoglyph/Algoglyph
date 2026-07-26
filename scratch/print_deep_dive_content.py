with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find("slug: 'html-semantics'")
md_start = content.find("markdown: `", idx)
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

h_idx = md_content.find("## Extra Technical Deep-Dive & Advanced Engineering Cases")
if h_idx != -1:
    print(md_content[h_idx:])
