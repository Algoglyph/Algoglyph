#!/usr/bin/env python3
"""
Integrates articles from scratch JSON files into deBlogData.ts.
Reads batch_B.json, batch_H.json, batch_J.json and replaces empty
string slots in deBlogData.ts with the real content.
"""

import json
import re
import os

DEFILE = "src/config/deBlogData.ts"
SCRATCH_FILES = [
    "scratch/batch_B.json",
    "scratch/batch_H.json",
    "scratch/batch_J.json",
]

def load_scratch(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def escape_for_template_literal(content: str) -> str:
    """
    Escape backticks and ${} expressions inside a template literal string.
    """
    # Escape backticks
    content = content.replace("\\`", "ESCAPED_BACKTICK_PLACEHOLDER")
    content = content.replace("`", "\\`")
    content = content.replace("ESCAPED_BACKTICK_PLACEHOLDER", "\\`")
    # Escape template literal interpolations: ${ -> \${
    content = re.sub(r'\$\{', r'\\${', content)
    return content

def integrate(ts_content: str, slug: str, article_content: str) -> str:
    """
    Replace  'slug': '',  with  'slug': `...content...`,  in the TS file.
    Also handles  'slug': ``,  (empty template literals).
    """
    escaped = escape_for_template_literal(article_content)
    
    # Pattern: 'de-xxx-yyy': '',  or  'de-xxx-yyy': ``,
    # We need to match both quote types
    single_empty_pattern = re.compile(
        r"('{}'\s*:\s*)''\s*,".format(re.escape(slug))
    )
    template_empty_pattern = re.compile(
        r"('{}'\s*:\s*)``\s*,".format(re.escape(slug))
    )
    
    replacement = f"'{slug}': `\n{escaped}\n`,"
    
    new_content, count = single_empty_pattern.subn(replacement, ts_content)
    if count == 0:
        new_content, count = template_empty_pattern.subn(replacement, new_content)
    
    if count == 0:
        print(f"  WARNING: Could not find empty slot for '{slug}'")
    else:
        print(f"  Integrated '{slug}' ({len(article_content):,} chars)")
    
    return new_content


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"Reading {DEFILE}...")
    with open(DEFILE, "r", encoding="utf-8") as f:
        ts_content = f.read()
    
    all_articles = {}
    for scratch_path in SCRATCH_FILES:
        print(f"\nLoading {scratch_path}...")
        data = load_scratch(scratch_path)
        for slug, content in data.items():
            all_articles[slug] = content
            print(f"  Found article: '{slug}' ({len(content):,} chars)")
    
    print(f"\nIntegrating {len(all_articles)} articles into {DEFILE}...")
    for slug, content in all_articles.items():
        ts_content = integrate(ts_content, slug, content)
    
    with open(DEFILE, "w", encoding="utf-8") as f:
        f.write(ts_content)
    
    print(f"\nDone! {DEFILE} updated.")
    
    # Count remaining empty slots
    empty_count = len(re.findall(r"'de-[^']+'\s*:\s*''\s*,", ts_content))
    print(f"Remaining empty article slots: {empty_count}")

if __name__ == "__main__":
    main()
