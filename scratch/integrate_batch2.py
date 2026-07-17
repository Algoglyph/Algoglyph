# -*- coding: utf-8 -*-
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from articles_data_batch2 import BATCH2_ARTICLES

BLOG_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/config/blogData.ts'))

def main():
    if not os.path.exists(BLOG_DATA_PATH):
        print(f"Error: blogData.ts not found at {BLOG_DATA_PATH}")
        sys.exit(1)

    print(f"Reading {BLOG_DATA_PATH}...")
    with open(BLOG_DATA_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Verify no duplicate slugs
    existing_slugs = []
    for art in BATCH2_ARTICLES:
        slug_check = f'"slug": "{art["slug"]}"'
        slug_check_alt = f"'slug': '{art['slug']}'"
        if slug_check in content or slug_check_alt in content:
            print(f"Warning/Error: Article with slug '{art['slug']}' already exists in blogData.ts!")
            existing_slugs.append(art["slug"])
    
    if existing_slugs:
        print("Integration aborted due to existing slugs.")
        sys.exit(1)

    # Format the new articles
    serialized_articles = []
    for art in BATCH2_ARTICLES:
        art_json = json.dumps(art, indent=2, ensure_ascii=False)
        indented = "\n".join("  " + line for line in art_json.split("\n"))
        serialized_articles.append(indented)

    # Combine them separated by commas
    new_articles_str = ",\n" + ",\n".join(serialized_articles)

    last_bracket_idx = content.rfind("];")
    if last_bracket_idx == -1:
        print("Error: Could not find closing '];' in blogData.ts")
        sys.exit(1)

    # Insert the new articles
    updated_content = content[:last_bracket_idx].rstrip() + new_articles_str + "\n];\n"

    print(f"Writing updated content to {BLOG_DATA_PATH}...")
    with open(BLOG_DATA_PATH, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print("Success! Successfully integrated 11 new articles into blogData.ts.")

if __name__ == '__main__':
    main()
