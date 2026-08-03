import re
import sys

def replace_de_blog_slug(ts_content: str, slug: str, new_markdown: str) -> tuple[str, bool]:
    # 1. Escape backticks and template string interpolation in new_markdown safely
    # First normalize backticks so we don't double escape
    clean_md = new_markdown.replace("\\`", "`").replace("\\${", "${")
    escaped_markdown = clean_md.replace("`", "\\`").replace("${", "\\${")
    
    # 2. Match from 'slug': until the comma right before the next key or closing brace
    # Pattern explanation:
    # (  'slug':\s*) -> group 1 (prefix key declaration)
    # (?:`[\s\S]*?`|''|\"\") or anything up to (\s*,\n(?=\s*['}]|\s*$)) -> group 2 (suffix comma & newline)
    pattern = re.compile(
        r"(  '" + re.escape(slug) + r"'\s*:\s*)[\s\S]*?(,\s*\n(?=\s*['}]|\s*$))",
        re.MULTILINE
    )
    
    def sub_func(m):
        return f"{m.group(1)}`\n{escaped_markdown}\n`{m.group(2)}"

    new_content, count = pattern.subn(sub_func, ts_content)
    return new_content, count > 0

if __name__ == '__main__':
    with open('src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Test helper loaded. Total chars in deBlogData.ts:", len(content))
