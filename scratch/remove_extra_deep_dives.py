import sys

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

slugs = [
    "html-semantics", "css-layouts", "checkpoint-static", "javascript-basics",
    "npm-ecosystem", "checkpoint-interactivity", "git-version-control",
    "github-collaboration", "checkpoint-collaborative", "checkpoint-external-packages"
]

print("=== REMOVING REPETITIVE DEEP DIVE SECTIONS ===")

new_content = content

for slug in slugs:
    # Find the post containing slug
    # We search for slug: 'slug'
    slug_token = f"slug: '{slug}'"
    slug_idx = new_content.find(slug_token)
    if slug_idx == -1:
        print(f"ERROR: Could not find slug '{slug}'")
        continue
    
    # Within this post, find the markdown block
    md_start = new_content.find("markdown: `", slug_idx)
    if md_start == -1:
        print(f"ERROR: Could not find markdown block for '{slug}'")
        continue
    
    # We find the deep dive heading inside the markdown block
    deep_dive_str = "## Extra Technical Deep-Dive & Advanced Engineering Cases"
    dd_idx = new_content.find(deep_dive_str, md_start)
    if dd_idx == -1:
        print(f"WARNING: '{slug}' already does not have deep dive section.")
        continue
    
    # Next, we find the FAQ heading after dd_idx
    faq_str = "## 5. Frequently Asked Questions (FAQs)"
    faq_idx = new_content.find(faq_str, dd_idx)
    if faq_idx == -1:
        print(f"ERROR: Could not find FAQ section for '{slug}'")
        continue
    
    # We want to replace from dd_idx to faq_idx with just a single newline (or keep formatting clean)
    # Let's inspect the characters around dd_idx and faq_idx to avoid leaving weird spacing.
    # Typically, before dd_idx there is a newline or more, and before faq_idx there is a newline or more.
    # Let's just slice it out:
    part_before = new_content[:dd_idx]
    part_after = new_content[faq_idx:]
    
    # Let's make sure the spacing is clean (e.g. exactly one empty line between section 4 and section 5)
    # If part_before ends with some whitespace, let's strip trailing spaces and leave one clean blank line:
    part_before = part_before.rstrip() + "\n\n"
    
    new_content = part_before + part_after
    print(f"Successfully removed deep dive section from '{slug}'!")

# Save to blogData.ts
with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Modification complete!")
