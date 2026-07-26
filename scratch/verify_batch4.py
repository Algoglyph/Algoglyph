import re

print("=== VERIFYING BATCH 4 (#31 to #40) IN src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

batch4_slugs = [
    ("exploratory-data-analysis-with-seaborn", 31),
    ("open-machine-learning-course", 32),
    ("machine-learning-specialization", 33),
    ("pattern-recognition-ml", 34),
    ("pattern-recognition-github", 35),
    ("deep-learning-specialization", 36),
    ("deep-learning-book", 37),
    ("attention-is-all-you-need", 38),
    ("illustrated-transformer", 39),
    ("mlops-specialization", 40)
]

all_pass = True
for slug, idx in batch4_slugs:
    p1 = content.find(f"slug: '{slug}'")
    if p1 == -1:
        p1 = content.find(f'slug: "{slug}"')
        
    if p1 == -1:
        print(f"FAILED: Slug '{slug}' NOT FOUND in blogData.ts!")
        all_pass = False
        continue

    p_md_start = content.find("markdown: `", p1) + len("markdown: `")
    p_end = content.find("\n  }", p_md_start)
    if p_end == -1:
        p_end = content.find("\n}", p_md_start)
    
    p_md_end = content.rfind("`", p_md_start, p_end)

    md = content[p_md_start:p_md_end]
    md_unescaped = md.replace('\\`', '`').replace('\\${', '${').replace('\\\\', '\\')
    
    length = len(md_unescaped)
    headers = [line.strip() for line in md_unescaped.splitlines() if line.strip().startswith('## ')]
    header_set = set(headers)
    dupes = len(headers) - len(header_set)
    faqs = [line for line in md_unescaped.splitlines() if re.match(r'^###\s+Q\d+:', line.strip())]
    has_latex = "$" in md_unescaped
    
    status = "PASS"
    errors = []
    
    if len(faqs) < 5:
        status = "FAIL"
        errors.append(f"Fewer than 5 FAQs ({len(faqs)})")
        all_pass = False
    if dupes > 0:
        status = "FAIL"
        errors.append(f"Duplicate H2 headers ({dupes})")
        all_pass = False
        
    err_str = f" | ERRORS: {', '.join(errors)}" if errors else ""
    print(f"[{status}] #{idx} '{slug}': {length:,} chars | H2s: {len(headers)} | FAQs: {len(faqs)} | LaTeX: {has_latex}{err_str}")

if all_pass:
    print("\nALL 10 BATCH 4 BLOGS (#31 to #40) PERFECTLY PASSED VERIFICATION IN src/config/blogData.ts!")
else:
    print("\nVERIFICATION FAILED FOR SOME BLOGS!")
