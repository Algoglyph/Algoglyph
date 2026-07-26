import re

print("=== VERIFYING & FIXING ALL CLOSING BACKTICKS FOR FULL STACK BATCH 1 ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

fs_batch1_slugs = [
    "html-semantics",
    "css-layouts",
    "checkpoint-static",
    "javascript-basics",
    "npm-ecosystem",
    "checkpoint-interactivity",
    "git-version-control",
    "github-collaboration",
    "checkpoint-collaborative",
    "checkpoint-external-packages"
]

for slug in fs_batch1_slugs:
    p_slug = content.find(f"slug: '{slug}'")
    if p_slug == -1:
        p_slug = content.find(f'slug: "{slug}"')
        
    if p_slug == -1:
        print(f"Slug '{slug}' not found!")
        continue

    p_next = content.find("slug: '", p_slug + 20)
    if p_next == -1:
        p_next = content.find('slug: "', p_slug + 20)
    if p_next == -1:
        p_next = content.rfind("];")

    block = content[p_slug:p_next]
    
    # Check if block ends with ``, \n  }`
    p_md = block.find("markdown: `")
    if p_md != -1:
        # Look for closing backtick
        p_close = block.rfind("`", p_md + 11)
        p_entry_end = block.rfind("  },")
        if p_entry_end == -1:
            p_entry_end = block.rfind("}")
            
        if p_close == -1 or p_close < (p_slug + p_md + 15):
            print(f"Fixing missing closing backtick for '{slug}'")
            # Insert closing backtick right before p_entry_end
            new_block = block[:p_entry_end].rstrip() + "`\n  },\n"
            content = content[:p_slug] + new_block + content[p_next:]

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("CLOSING BACKTICKS AUDIT COMPLETE!")
