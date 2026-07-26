import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

batch3_slugs = [
    "dijkstra",
    "dynamic-programming",
    "greedy",
    "backtracking",
    "searching",
    "sorting",
    "tree-traversal",
    "mst-union-find",
    "scc-bridges",
    "string-algorithms"
]

print("=== VERIFYING BATCH 3 BLOGS IN src/config/blogData.ts ===")

for slug in batch3_slugs:
    pattern = r'slug:\s*"' + re.escape(slug) + r'"[\s\S]*?markdown:\s*`([\s\S]*?)`\s*\}'
    match = re.search(pattern, text)
    if not match:
        print(f"[FAIL] Slug '{slug}' NOT FOUND in blogData.ts!")
        continue
        
    md = match.group(1)
    # Unescape double backslashes for analysis
    md_clean = md.replace('\\\\', '\\').replace('\\`', '`').replace('\\${', '${')
    length = len(md_clean)
    
    # Check headers
    headers = [line.strip() for line in md_clean.splitlines() if re.match(r'^#{1,6}\s+[A-Za-z0-9]', line.strip())]
    header_counts = {}
    dupes = 0
    for h in headers:
        header_counts[h] = header_counts.get(h, 0) + 1
        if header_counts[h] > 1:
            dupes += 1
            
    inline_math = len(re.findall(r'\$([^\$\n]+?)\$', md_clean))
    block_math = len(re.findall(r'\$\$([\s\S]+?)\$\$', md_clean))
    faq_count = len(re.findall(r'### Q\d+:', md_clean))
    
    first_60 = repr(md_clean[:60])
    status = "PASS" if (length >= 10100 and dupes == 0 and faq_count >= 5) else "FAIL"
    
    print(f"[{status}] Slug: '{slug}' | Chars: {length:,} | Dupes: {dupes} | Inline LaTeX: {inline_math} | Block LaTeX: {block_math} | FAQs: {faq_count}")
    print(f"       Header Start: {first_60}")
