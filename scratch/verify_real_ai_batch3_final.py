import re

print("=== VERIFYING BATCH 3 (BLOGS #21 to #30) IN src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

batch3_slugs = [
    ("time-series-models", 21),
    ("forecasting-task-with-solution", 22),
    ("linear-regression-econ", 23),
    ("learn-python-kaggle", 24),
    ("algorithmic-exercises", 25),
    ("study-plans-leetcode", 26),
    ("algorithms-specialization", 27),
    ("sql-tutorial-course", 28),
    ("exploratory-data-analysis-with-python-and-pandas", 29),
    ("exploratory-data-analysis-for-machine-learning", 30)
]

all_pass = True
for slug, idx in batch3_slugs:
    p1 = content.find(f"slug: '{slug}'")
    if p1 == -1:
        p1 = content.find(f'slug: "{slug}"')
        
    if p1 == -1:
        print(f"FAILED: Slug '{slug}' NOT FOUND in blogData.ts!")
        all_pass = False
        continue

    p_md_start = content.find("markdown: `", p1) + len("markdown: `")
    
    # The markdown literal ends at the next unescaped backtick before \n  }
    # Find `\n  }` or `\n}` following markdown: `
    p_end = content.find("\n  }", p_md_start)
    if p_end == -1:
        p_end = content.find("\n}", p_md_start)
    
    p_md_end = content.rfind("`", p_md_start, p_end)

    md = content[p_md_start:p_md_end]
    
    # Unescape template literal escaping for checking
    md_unescaped = md.replace('\\`', '`').replace('\\${', '${').replace('\\\\', '\\')
    
    length = len(md_unescaped)
    
    # Check headers
    headers = [line.strip() for line in md_unescaped.splitlines() if line.strip().startswith('## ')]
    header_set = set(headers)
    dupes = len(headers) - len(header_set)
    
    # Check FAQs
    faqs = [line for line in md_unescaped.splitlines() if re.match(r'^###\s+Q\d+:', line.strip())]
    
    # Check LaTeX
    has_latex = "$" in md_unescaped
    
    # Check template padding
    has_template_padding = any(line.strip().startswith('## ') and 'Technical Deep-Dive Section' in line for line in md_unescaped.splitlines())
    
    status = "PURE PASS"
    errors = []
    
    if length < 10100:
        status = "FAIL"
        errors.append(f"Too short ({length} chars)")
        all_pass = False
    if dupes > 0:
        status = "FAIL"
        errors.append(f"Duplicate H2 headers ({dupes})")
        all_pass = False
    if len(faqs) < 5:
        status = "FAIL"
        errors.append(f"Fewer than 5 FAQs ({len(faqs)})")
        all_pass = False
    if not has_latex:
        status = "FAIL"
        errors.append("Missing LaTeX formatting")
        all_pass = False
    if has_template_padding:
        status = "FAIL"
        errors.append("Template padding detected!")
        all_pass = False
        
    err_str = f" | ERRORS: {', '.join(errors)}" if errors else ""
    print(f"[{status}] #{idx} '{slug}': {length:,} chars | H2s: {len(headers)} | Dupes: {dupes} | FAQs: {len(faqs)} | LaTeX: {has_latex}{err_str}")

if all_pass:
    print("\nALL 10 BATCH 3 BLOGS (#21 to #30) PERFECTLY PASSED VERIFICATION IN src/config/blogData.ts!")
else:
    print("\nVERIFICATION FAILED FOR SOME BLOGS!")
