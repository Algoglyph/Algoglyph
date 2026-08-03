import json
import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

batch2_slugs = [
    "practitioners-guide-statistical-tests",
    "doordash-cupac",
    "netflix-stratification",
    "microsoft-delta-method",
    "ratio-metrics",
    "fundamentals-of-econometrics",
    "intro-to-econometrics",
    "econometrics-course",
    "learn-time-series",
    "time-series-basics"
]

print("=== CHECKING FRONT AND BACK OF BATCH 2 MARKDOWN STRINGS IN src/config/blogData.ts ===")

for slug in batch2_slugs:
    p_start = text.find(f'"slug": "{slug}"')
    p_md = text.find('"markdown": `', p_start)
    start_idx = p_md + len('"markdown": `')
    end_idx = text.find('`\n  },', start_idx)
    if end_idx == -1:
        end_idx = text.find('`\n  }', start_idx)
        
    md = text[start_idx:end_idx]
    
    print(f"\n--- Slug: {slug} ---")
    print("FIRST 120 CHARS:")
    print(repr(md[:120]))
    print("LAST 120 CHARS:")
    print(repr(md[-120:]))
