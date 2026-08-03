import json
import re

blogs = {}

def add_blog(slug, title, tagline, category, read_time, prereqs, related, practice_probs, markdown):
    headers = [line for line in markdown.splitlines() if line.startswith('#') and not line.startswith('# =') and not line.startswith('# -')]
    header_counts = {}
    for h in headers:
        header_counts[h] = header_counts.get(h, 0) + 1
        if header_counts[h] > 1:
            raise ValueError(f"DUPLICATE HEADER IN '{slug}': {h}")
            
    length = len(markdown)
    assert length >= 10100, f"Blog '{slug}' is too short ({length} chars). Needs >= 10,100 chars."
    print(f"Verified '{slug}': {length:,} chars. Start: {repr(markdown[:65])}")
    
    blogs[slug] = {
        "slug": slug,
        "title": title,
        "tagline": tagline,
        "category": category,
        "readTime": read_time,
        "lastUpdated": "July 2026",
        "prerequisites": prereqs,
        "related": related,
        "practiceProblems": practice_probs,
        "markdown": markdown
    }

print("=== GENERATING BATCH 3 (SLUGS 21 TO 30) ===")
