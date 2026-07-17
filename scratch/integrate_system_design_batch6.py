# -*- coding: utf-8 -*-
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from system_design_batch6_data import SYSTEM_DESIGN_BATCH6_ARTICLES

BLOG_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../src/config/blogData.ts'))

def find_block_bounds(content, slug):
    slug_patterns = [
        f'"slug": "{slug}"',
        f"'slug': '{slug}'",
        f'"slug": \'{slug}\'',
        f"'slug': \"{slug}\""
    ]
    
    slug_pos = -1
    for pattern in slug_patterns:
        slug_pos = content.find(pattern)
        if slug_pos != -1:
            break
            
    if slug_pos == -1:
        return None
        
    brace_count = 0
    start_idx = -1
    for i in range(slug_pos, -1, -1):
        if content[i] == '}':
            brace_count += 1
        elif content[i] == '{':
            if brace_count == 0:
                start_idx = i
                break
            else:
                brace_count -= 1
                
    if start_idx == -1:
        return None
        
    brace_count = 1
    end_idx = -1
    for i in range(slug_pos, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
                
    if end_idx == -1:
        return None
        
    return start_idx, end_idx

def main():
    if not os.path.exists(BLOG_DATA_PATH):
        print(f"Error: blogData.ts not found at {BLOG_DATA_PATH}")
        sys.exit(1)

    print(f"Reading {BLOG_DATA_PATH}...")
    with open(BLOG_DATA_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    replaced_count = 0

    for art in SYSTEM_DESIGN_BATCH6_ARTICLES:
        slug = art["slug"]
        bounds = find_block_bounds(content, slug)
        if not bounds:
            print(f"Error: Could not find block for slug '{slug}' in blogData.ts")
            sys.exit(1)
            
        start, end = bounds
        print(f"Replacing article '{slug}' at characters {start}:{end}...")
        
        # Serialize the new article
        art_json = json.dumps(art, indent=2, ensure_ascii=False)
        # Add indentation of 2 spaces
        indented_art = "\n".join("  " + line for line in art_json.split("\n"))
        # Strip leading indentation from first line so it fits cleanly after the prefix
        indented_art = indented_art.lstrip()
        
        # Replace in content string
        content = content[:start] + indented_art + content[end:]
        replaced_count += 1

    print(f"Writing updated content to {BLOG_DATA_PATH}...")
    with open(BLOG_DATA_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Success! Successfully updated {replaced_count} System Design articles in blogData.ts.")

if __name__ == '__main__':
    main()
