# -*- coding: utf-8 -*-
with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    text = f.read()

slugs = ['a-star-algorithm', 'aho-corasick', 'avl-trees', 'b-trees', 'avl-red-black-tree']
for slug in slugs:
    idx = text.find(f'"slug": "{slug}"')
    if idx == -1:
        idx = text.find(f"slug: '{slug}'")
    if idx != -1:
        # find the markdown value for this slug
        md_start = text.find('"markdown": "', idx)
        if md_start == -1:
            md_start = text.find('"markdown": """', idx)
            
        if md_start != -1:
            snippet = text[md_start:md_start+800]
            print(f"=== {slug} markdown start ===")
            print(snippet)
