import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    blog_content = f.read()

# All 33 slugs
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

# Find existing slugs in blogData.ts
existing_slugs = set(re.findall(r"slug:\s*'([^']+)'", blog_content))

fixed_count = 0
not_fixed_count = 0
missing_count = 0

print("=== STATUS OF ALL 33 FULL STACK BLOGS ===")

for idx, slug in enumerate(slugs, 1):
    if slug in existing_slugs:
        # Extract markdown content to verify if it contains boilerplate deep dives or repetitive elements
        slug_idx = blog_content.find(f"slug: '{slug}'")
        md_start = blog_content.find("markdown: `", slug_idx)
        md_content_start = md_start + len("markdown: `")
        md_content = ""
        esc = False
        for i in range(md_content_start, len(blog_content)):
            char = blog_content[i]
            if esc:
                esc = False
                md_content += char
            elif char == '\\':
                esc = True
                md_content += char
            elif char == '`':
                next_chars = blog_content[i+1:i+20].strip()
                if not next_chars or next_chars.startswith(',') or next_chars.startswith('}') or next_chars.startswith('category'):
                    break
                else:
                    md_content += char
            else:
                md_content += char
        
        has_deep_dive = "## Extra Technical Deep-Dive" in md_content
        is_empty = len(md_content.strip()) == 0
        
        status = "Fixed"
        if has_deep_dive and ("Advanced Engineering Metric Point" in md_content or "blueprint" in md_content.lower()):
            status = "Blueprint/Not Fixed"
            not_fixed_count += 1
        elif is_empty:
            status = "Empty"
            not_fixed_count += 1
        else:
            fixed_count += 1
            
        print(f"{idx:02d}. Slug: {slug:<30} | Status: {status:<20} (Length: {len(md_content)} chars)")
    else:
        status = "Missing (Not in blogData.ts)"
        missing_count += 1
        print(f"{idx:02d}. Slug: {slug:<30} | Status: {status:<20}")

print("\n=== SUMMARY ===")
print(f"Total: 33")
print(f"Fixed: {fixed_count}")
print(f"Not Fixed/Empty: {not_fixed_count}")
print(f"Missing/Not Created: {missing_count}")
