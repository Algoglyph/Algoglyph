import re

print("=== CHECKING FOR ANY REMAINING BOILERPLATE OR DUPLICATE HEADINGS IN blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Check for keywords
keywords = [
    "Production Maintenance & Monitoring Checklist",
    "Technical Architecture Deep-Dive & Engineering Reference",
    "Architectural Best Practices Summary",
    "Technical Deep-Dive Section",
    "Advanced Analytical Frameworks"
]

found_count = 0
for kw in keywords:
    count = content.count(kw)
    if count > 0:
        print(f"WARNING: Found {count} occurrences of '{kw}'")
        found_count += count
    else:
        print(f"[CLEAN] 0 occurrences of '{kw}'")

# Check all entries in blogData.ts for duplicate H2 or H3 headers
entries = re.findall(r"slug:\s*['\"]([^'\"]+)['\"][\s\S]*?markdown:\s*`([\s\S]*?)`\s*\n\s*\}", content)

print(f"\nAuditing {len(entries)} articles in blogData.ts for duplicate headers:")
dupe_articles = 0
for slug, md in entries:
    lines = md.splitlines()
    h2s = [l.strip() for l in lines if l.strip().startswith('## ')]
    h2_set = set(h2s)
    if len(h2s) != len(h2_set):
        print(f" - Duplicate H2 in '{slug}': {len(h2s) - len(h2_set)} dupes")
        dupe_articles += 1

if found_count == 0 and dupe_articles == 0:
    print("\nPERFECT PASS! 0 BOILERPLATE CHECKLISTS & 0 DUPLICATE HEADERS REMAINING IN blogData.ts!")
else:
    print(f"\nFOUND {found_count} BOILERPLATE AND {dupe_articles} DUPLICATE HEADER ARTICLES.")
