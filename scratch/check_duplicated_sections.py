with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's verify all 33 blogs
slugs = [
    "html-semantics", "css-layouts", "checkpoint-static", "javascript-basics",
    "npm-ecosystem", "checkpoint-interactivity", "git-version-control",
    "github-collaboration", "checkpoint-collaborative", "checkpoint-external-packages",
    "react-components", "tailwind-css", "checkpoint-frontend-apps",
    "node-js-runtime", "checkpoint-cli-apps", "postgresql-databases",
    "checkpoint-crud-apps", "restful-api-design", "jwt-authentication",
    "redis-caching", "checkpoint-complete-app", "linux-cli-basics",
    "basic-aws-services", "checkpoint-deployment", "mesh-like-structures",
    "ansible-configuration", "terraform-iac", "checkpoint-automation",
    "checkpoint-infrastructure", "github-actions-cicd", "monit-monitoring",
    "checkpoint-cicd", "checkpoint-monitoring"
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

# Check similarity or exact duplicate sentences/paragraphs across different blogs
print("=== DUPLICATE SECTION ANALYSIS (33 BLOGS) ===")
import collections

# Let's count paragraph frequencies
paragraphs = collections.defaultdict(list)
for slug, md in blogs_md.items():
    # Split by double newline to get paragraphs/sections
    parts = [p.strip() for p in md.split('\n\n') if len(p.strip()) > 35]
    for p in parts:
        paragraphs[p].append(slug)

duplicates = {p: s for p, s in paragraphs.items() if len(s) > 1}
print(f"Found {len(duplicates)} duplicate paragraphs across different blogs.")
for p, s in list(duplicates.items())[:5]:
    print(f"Paragraph duplicated in: {s}")
    print(f"Content: {p[:150]}...")
    print("-" * 50)
