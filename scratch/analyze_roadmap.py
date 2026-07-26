import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the 'Full Stack Development' domain block
# The domains are elements in an array. Let's find the start of the Full Stack Development block.
fs_idx = content.find("name: 'Full Stack Development'")
if fs_idx == -1:
    print("Full Stack Development domain not found.")
    exit(1)

# Let's find the next domain block or the end of the file.
# The domains have ids like id: '...'. The next domain might be id: 'something' or name: 'something' or similar.
# Let's search for the end of the topics/domain block.
# We can find the topics/concepts list by matching matching braces or scanning.
# To be simple and robust, let's scan characters after fs_idx.
# We scan until we hit the next main domain in the array, e.g. `{` followed by `id: 'some-other-domain'`
# Let's look at the structure of roadmapData.ts. It probably has a list of domain objects.
# Let's print out domain names to see what follows 'Full Stack Development'.
domain_matches = list(re.finditer(r"id:\s*'([^']+)',\s*(?:number:\s*'[^']+',\s*)?name:\s*'([^']+)'", content))
for i, m in enumerate(domain_matches):
    print(f"Domain {i}: ID={m.group(1)}, Name={m.group(2)} at index {m.start()}")

# Let's find where the Full Stack Development domain ends.
fs_domain_match = None
next_domain_match = None
for i, m in enumerate(domain_matches):
    if m.group(2) == 'Full Stack Development':
        fs_domain_match = m
        if i + 1 < len(domain_matches):
            next_domain_match = domain_matches[i+1]
        break

start_pos = fs_domain_match.start()
end_pos = next_domain_match.start() if next_domain_match else len(content)

fs_section = content[start_pos:end_pos]

# Now, let's find all blogSlugs defined inside this section:
slugs_in_roadmap = re.findall(r"blogSlug:\s*'([^']+)'", fs_section)
print(f"\nFound {len(slugs_in_roadmap)} blogSlugs in Full Stack Development roadmap section:")
print(slugs_in_roadmap)

# Let's read blogData.ts to see which slugs actually exist
with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    blog_content = f.read()

# Let's extract all existing slugs in blogData.ts
existing_slugs = set(re.findall(r"slug:\s*'([^']+)'", blog_content))

print("\n=== STATUS OF EACH SLUG ===")
existing_in_blog = []
missing_in_blog = []

for slug in slugs_in_roadmap:
    if slug in existing_slugs:
        # Check if the blog is "fixed" (has unique content and doesn't contain repetitive metrics)
        # Let's search for "## Extra Technical Deep-Dive" or similar inside this blog
        idx = blog_content.find(f"slug: '{slug}'")
        md_start = blog_content.find("markdown: `", idx)
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
        elif is_empty:
            status = "Empty"
            
        print(f"Slug: {slug:<40} | In blogData.ts: Yes | Status: {status} (Length: {len(md_content)} chars)")
        existing_in_blog.append((slug, status))
    else:
        print(f"Slug: {slug:<40} | In blogData.ts: No  | Status: Missing")
        missing_in_blog.append(slug)

print(f"\nSummary:")
print(f"Total Slugs in Roadmap: {len(slugs_in_roadmap)}")
print(f"Existing in blogData.ts: {len(existing_in_blog)}")
print(f"Missing from blogData.ts: {len(missing_in_blog)}")
