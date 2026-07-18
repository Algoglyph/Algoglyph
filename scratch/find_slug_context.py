# -*- coding: utf-8 -*-
with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    text = f.read()

slugs = ['a-search', 'a-star-algorithm', 'aho-corasick', 'avl-trees', 'avl-red-black-tree', 'b-trees']
for slug in slugs:
    idx = text.find(f'"slug": "{slug}"')
    if idx == -1:
        idx = text.find(f"slug: '{slug}'")
    if idx != -1:
        print(f"--- {slug} ---")
        print(text[max(0, idx-100):min(len(text), idx+300)])
