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

print("=== CURRENT STATE OF BATCH 3 BLOGS IN src/config/blogData.ts ===")

for slug in batch3_slugs:
    p_start = text.find(f'"slug": "{slug}"')
    if p_start == -1:
        print(f"Slug '{slug}' NOT FOUND!")
        continue
    p_md = text.find('"markdown": `', p_start)
    if p_md == -1:
        print(f"Markdown not found for '{slug}'")
        continue
    start_idx = p_md + len('"markdown": `')
    end_idx = text.find('`\n  },', start_idx)
    if end_idx == -1:
        end_idx = text.find('`\n  }', start_idx)
    md = text[start_idx:end_idx]
    
    print(f"Slug: '{slug}' | Chars: {len(md):,} | Header Start: {repr(md[:60])}")
