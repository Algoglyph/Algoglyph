import re

print("=== VERIFYING FULL STACK BATCH 1 (#1 to #10) IN src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

fs_batch1_slugs = [
    ("html-semantics", 1),
    ("css-layouts", 2),
    ("checkpoint-static", 3),
    ("javascript-basics", 4),
    ("npm-ecosystem", 5),
    ("checkpoint-interactivity", 6),
    ("git-version-control", 7),
    ("github-collaboration", 8),
    ("checkpoint-collaborative", 9),
    ("checkpoint-external-packages", 10)
]

all_pass = True
for slug, idx in fs_batch1_slugs:
    p1 = content.find(f"slug: '{slug}'")
    if p1 == -1:
        p1 = content.find(f'slug: "{slug}"')
        
    if p1 == -1:
        print(f"FAILED: Slug '{slug}' NOT FOUND in blogData.ts!")
        all_pass = False
        continue

    # Find next entry start or array end
    p_next = content.find("slug: '", p1 + 20)
    if p_next == -1:
        p_next = content.find('slug: "', p1 + 20)
    if p_next == -1:
        p_next = content.rfind("];")

    block = content[p1:p_next]
    
    p_md_start = block.find("markdown: `") + len("markdown: `")
    p_md_end = block.rfind("`")

    md = block[p_md_start:p_md_end]
    md_unescaped = md.replace('\\`', '`').replace('\\${', '${').replace('\\\\', '\\')
    
    length = len(md_unescaped)
    headers = [line.strip() for line in md_unescaped.splitlines() if line.strip().startswith('## ')]
    header_set = set(headers)
    dupes = len(headers) - len(header_set)
    faqs = [line for line in md_unescaped.splitlines() if re.match(r'^###\s+Q\d+:', line.strip())]
    
    status = "PASS"
    errors = []
    
    if length < 7000:
        status = "FAIL"
        errors.append(f"Length under 7,000 chars ({length:,})")
        all_pass = False
    if len(faqs) < 5:
        status = "FAIL"
        errors.append(f"Fewer than 5 FAQs ({len(faqs)})")
        all_pass = False
    if dupes > 0:
        status = "FAIL"
        errors.append(f"Duplicate H2 headers ({dupes})")
        all_pass = False
        
    err_str = f" | ERRORS: {', '.join(errors)}" if errors else ""
    print(f"[{status}] #{idx:2d} '{slug}': {length:,} chars | H2s: {len(headers)} | FAQs: {len(faqs)}{err_str}")

if all_pass:
    print("\nALL 10 FULL STACK BATCH 1 BLOGS (#1 to #10) PERFECTLY PASSED VERIFICATION IN src/config/blogData.ts!")
else:
    print("\nVERIFICATION FAILED FOR SOME BLOGS!")
