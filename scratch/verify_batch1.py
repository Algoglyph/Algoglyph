import json
import re

with open('scratch/ai_batch1.json', 'r', encoding='utf-8') as f:
    batch1_data = json.load(f)

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    blog_data = f.read()

print("=== Batch 1 Verification Audit ===")
all_passed = True

for slug, blog_obj in batch1_data.items():
    # 1. Existence check in blogData.ts
    slug_present = f'"slug": "{slug}"' in blog_data or f'"slug": \'{slug}\'' in blog_data
    
    # 2. Length check >= 10,000 chars
    md_len = len(blog_obj["markdown"])
    len_ok = md_len >= 10000
    
    # 3. FAQ check (Q1 through Q5 present)
    faq_count = blog_obj["markdown"].count("### Q")
    faq_ok = faq_count >= 5
    
    # 4. Code block fence balance
    fence_count = blog_obj["markdown"].count("```")
    fence_ok = fence_count % 2 == 0
    
    status = "OK" if (slug_present and len_ok and faq_ok and fence_ok) else "FAILED"
    if status == "FAILED":
        all_passed = False
        
    print(f"[{status}] Slug: {slug}")
    print(f"       In blogData.ts: {slug_present} | Length: {md_len} chars (>=10k: {len_ok}) | FAQs: {faq_count} | Fences balanced: {fence_ok}")

if all_passed:
    print("\nALL 10 BLOGS IN BATCH 1 PASSED AUDIT VERIFICATION PERFECTLY!")
else:
    print("\nSome blogs failed verification.")
