import json
import re

with open('scratch/ai_batch2_heavy_clean.json', 'r', encoding='utf-8') as f:
    blogs = json.load(f)

print("=== CHECKING LATEX EQUATIONS ACROSS ALL 10 BATCH 2 BLOGS ===")

for slug, b in blogs.items():
    md = b['markdown']
    
    # Find inline LaTeX $...$
    inline_math = re.findall(r'\$([^\$\n]+?)\$', md)
    # Find block LaTeX $$...$$
    block_math = re.findall(r'\$\$([\s\S]+?)\$\$', md)
    
    # Check if there are FAQs at the end
    faq_present = "### Q1:" in md or "## Frequently Asked Questions" in md or "### FAQs" in md
    faq_count = len(re.findall(r'### Q\d+:', md))
    
    print(f"\nSlug: '{slug}'")
    print(f"  - Inline Math ($...$): {len(inline_math)} occurrences (e.g. {inline_math[:3]})")
    print(f"  - Display Math ($$...$$): {len(block_math)} occurrences (e.g. {block_math[:2]})")
    print(f"  - FAQs Present: {faq_present} (Count: {faq_count})")
