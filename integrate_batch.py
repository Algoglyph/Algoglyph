#!/usr/bin/env python3
"""
Dynamic integrator: reads a JSON file from scratch/ and integrates articles into deBlogData.ts.
Usage: python3 integrate_batch.py scratch/batch_V.json
"""

import json
import re
import sys
import os

DEFILE = "src/config/deBlogData.ts"

def escape_for_template_literal(content: str) -> str:
    # Escape backticks
    content = content.replace("\\`", "__ESCAPED_BACKTICK__")
    content = content.replace("`", "\\`")
    content = content.replace("__ESCAPED_BACKTICK__", "\\`")
    # Escape ${} template interpolations
    content = re.sub(r'\$\{', r'\\${', content)
    return content

def integrate(ts_content: str, slug: str, article_content: str) -> tuple[str, bool]:
    escaped = escape_for_template_literal(article_content)
    
    # Match empty single-quoted slots: 'de-xxx': '',
    single_empty = re.compile(r"(  '{}'\s*:\s*)''\s*,".format(re.escape(slug)))
    # Match empty template literal slots: 'de-xxx': ``,
    template_empty = re.compile(r"(  '{}'\s*:\s*)``\s*,".format(re.escape(slug)))
    
    replacement = f"  '{slug}': `\n{escaped}\n`,"
    
    new_content, count = single_empty.subn(replacement, ts_content)
    if count == 0:
        new_content, count = template_empty.subn(replacement, ts_content)
    
    return new_content, count > 0

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    if len(sys.argv) < 2:
        print("Usage: python3 integrate_batch.py <path/to/batch.json>")
        sys.exit(1)
    
    batch_file = sys.argv[1]
    print(f"Reading batch file: {batch_file}")
    with open(batch_file, "r", encoding="utf-8") as f:
        articles = json.load(f)
    
    print(f"Reading {DEFILE}...")
    with open(DEFILE, "r", encoding="utf-8") as f:
        ts_content = f.read()
    
    integrated = 0
    failed = 0
    for slug, content in articles.items():
        if not content or not content.strip():
            print(f"  SKIP '{slug}': empty content")
            failed += 1
            continue
        new_content, ok = integrate(ts_content, slug, content)
        if ok:
            ts_content = new_content
            print(f"  OK   '{slug}' ({len(content):,} chars)")
            integrated += 1
        else:
            print(f"  WARN '{slug}': slot not found (may already be filled)")
            failed += 1
    
    with open(DEFILE, "w", encoding="utf-8") as f:
        f.write(ts_content)
    
    # Count remaining empty slots
    empty_count = len(re.findall(r"  'de-[^']+'\s*:\s*''\s*,", ts_content))
    print(f"\nIntegrated: {integrated}, Failed/Skipped: {failed}")
    print(f"Remaining empty slots: {empty_count}")

if __name__ == "__main__":
    main()
