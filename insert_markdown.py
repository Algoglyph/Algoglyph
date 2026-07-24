#!/usr/bin/env python3
"""
Insert markdown field into blog objects in blogData.ts.
Usage: python insert_markdown.py <slug> <markdown_file>
  or:  python insert_markdown.py --validate
"""
import sys
import json

FILE = 'src/config/blogData.ts'

def load_file():
    with open(FILE, 'r', encoding='utf-8') as f:
        return f.read()

def save_file(content):
    with open(FILE, 'w', encoding='utf-8') as f:
        f.write(content)

def validate():
    data = load_file()
    count = data.count('{\n    "slug":')
    print(f"Blog entries found: {count}")
    # Quick bracket check
    opens = data.count('[') + data.count('{')
    closes = data.count(']') + data.count('}')
    print(f"Brackets: {opens} open, {closes} close")
    if opens == closes:
        print("✓ Bracket balance OK")
    else:
        print("✗ BRACKET MISMATCH!")
    # Check it parses as valid TS array
    try:
        import subprocess
        result = subprocess.run(
            ['node', '-e', f'const d = {data}; console.log(d.length + " entries")'],
            capture_output=True, text=True, timeout=30, cwd='C:/Users/varun/Documents/stuff/Coding/Antigravity-Github/ScratchPad'
        )
        if result.returncode == 0:
            print(f"✓ TypeScript parses OK: {result.stdout.strip()}")
        else:
            print(f"✗ Parse error: {result.stderr[:500]}")
    except Exception as e:
        print(f"✗ Validation failed: {e}")

def insert_markdown(slug, markdown_text):
    data = load_file()
    lines = data.split('\n')

    # Find the slug line
    target_idx = None
    for i, line in enumerate(lines):
        if f'"slug": "{slug}"' in line:
            target_idx = i
            break

    if target_idx is None:
        print(f"ERROR: Slug '{slug}' not found")
        sys.exit(1)

    # Find the "title" line after slug (should be next or 1-2 lines later)
    title_idx = None
    for i in range(target_idx + 1, min(target_idx + 5, len(lines))):
        if '"title":' in lines[i]:
            title_idx = i
            break

    if title_idx is None:
        print(f"ERROR: Could not find 'title' field after slug")
        sys.exit(1)

    # Check if markdown already exists between slug and title
    for i in range(target_idx, title_idx):
        if '"markdown":' in lines[i]:
            print(f"ERROR: Markdown field already exists for slug '{slug}'")
            sys.exit(1)

    # Build the markdown line
    # markdown_text is already JSON-escaped (backslashes -> \\, newlines -> \n)
    # so we just need to escape any remaining double quotes
    escaped_md = markdown_text.replace('"', '\\"')
    md_line = f'    "markdown": "{escaped_md}",\n'

    # Insert before title line
    indent = len(lines[title_idx]) - len(lines[title_idx].lstrip())
    lines.insert(title_idx, md_line.rstrip('\n'))

    new_data = '\n'.join(lines)
    save_file(new_data)
    print(f"✓ Inserted markdown for '{slug}' ({len(markdown_text)} chars)")

def main():
    if len(sys.argv) < 2:
        print("Usage: python insert_markdown.py <slug> <markdown_file>")
        print("       python insert_markdown.py --validate")
        sys.exit(1)

    if sys.argv[1] == '--validate':
        validate()
        return

    slug = sys.argv[1]
    md_file = sys.argv[2]

    with open(md_file, 'r', encoding='utf-8') as f:
        markdown_text = f.read()

    # The markdown file has real newlines and LaTeX like \log, $$, etc.
    # In the TS file (which is valid JSON):
    #   - Real newlines become \n (JSON escape)
    #   - Backslashes (LaTeX) become \\ (JSON escape)
    # Order: first replace backslashes, then newlines
    markdown_text = markdown_text.replace('\r\n', '\n')
    markdown_text = markdown_text.replace('\\', '\\\\')  # \ -> \\
    markdown_text = markdown_text.replace('\n', '\\n')   # real newline -> \n

    insert_markdown(slug, markdown_text)

if __name__ == '__main__':
    main()