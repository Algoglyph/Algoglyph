import re

print("=== VERIFYING FINAL BATCH 5 (#41 to #47) IN src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

batch5_slugs = [
    ("google-ai-courses", 41),
    ("hugging-face-nlp", 42),
    ("prompt-engineering-guide", 43),
    ("rag-for-knowledge-intensive-nlp-tasks", 44),
    ("vibe-coding-fundamentals", 45),
    ("claude-code-docs", 46),
    ("agentic-coding-handbook", 47)
]

all_pass = True
for slug, idx in batch5_slugs:
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
    print("\nALL 7 FINAL BATCH 5 BLOGS (#41 to #47) PERFECTLY PASSED VERIFICATION IN src/config/blogData.ts!")
else:
    print("\nVERIFICATION FAILED FOR SOME BLOGS!")
