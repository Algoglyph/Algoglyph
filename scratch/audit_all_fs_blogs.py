import re

fs_slugs = [
    'html-semantics', 'css-layouts', 'checkpoint-static', 'javascript-basics', 'npm-ecosystem',
    'checkpoint-interactivity', 'git-version-control', 'github-collaboration', 'checkpoint-collaborative',
    'checkpoint-external-packages', 'react-components', 'tailwind-css', 'checkpoint-frontend-apps',
    'node-js-runtime', 'checkpoint-cli-apps', 'postgresql-databases', 'checkpoint-crud-apps',
    'restful-api-design', 'jwt-authentication', 'redis-caching', 'checkpoint-complete-app',
    'linux-cli-basics', 'basic-aws-services', 'checkpoint-deployment', 'mesh-like-structures',
    'ansible-configuration', 'terraform-iac', 'checkpoint-automation', 'checkpoint-infrastructure',
    'github-actions-cicd', 'monit-monitoring', 'checkpoint-cicd', 'checkpoint-monitoring'
]

print("=== AUDITING ALL 33 FULL STACK DEVELOPMENT BLOGS IN blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

for i, slug in enumerate(fs_slugs, 1):
    # Find entry in blogData.ts
    pos = content.find(f"slug: '{slug}'")
    if pos == -1:
        pos = content.find(f'slug: "{slug}"')
        
    if pos == -1:
        print(f"#{i:02d} '{slug}': [MISSING] Not present in blogData.ts")
        continue

    # Extract block
    p_next = content.find("slug: '", pos + 20)
    if p_next == -1:
        p_next = content.find('slug: "', pos + 20)
    if p_next == -1:
        p_next = content.rfind("];")

    block = content[pos:p_next]
    p_md_start = block.find("markdown: `")
    if p_md_start == -1:
        p_md_start = block.find('markdown: "')
        
    if p_md_start == -1:
        print(f"#{i:02d} '{slug}': [NO MARKDOWN] Markdown property is missing or wrong format")
        continue

    # Find the markdown content length
    p_close = block.rfind("`")
    if p_close == -1:
        p_close = block.rfind('"')
        
    md_content = block[p_md_start + 11:p_close]
    length = len(md_content)
    
    # Check if content has blueprint/placeholder traits
    is_blueprint = "Insert detailed step-by-step description here" in md_content or "Lorem Ipsum" in md_content or length < 1000
    
    status = "BLUEPRINT / PLACEHOLDER" if is_blueprint else "FIXED / UNIQUE CONTENT"
    print(f"#{i:02d} '{slug}': [{status}] | Length: {length:,} chars")
