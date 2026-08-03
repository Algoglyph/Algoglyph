import re
import sys
import json

def update_markdown_for_slug(file_path: str, slug: str, new_markdown: str):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern matches: "slug": "slug",\n    "markdown": "..." or `...`
    # We find the index of "slug": "slug"
    target = f'"slug": "{slug}"'
    idx = content.find(target)
    if idx == -1:
        # Try single quotes or spaced
        target = f"'slug': '{slug}'"
        idx = content.find(target)
    
    if idx == -1:
        print(f"ERROR: Could not find slug '{slug}' in {file_path}")
        return False

    # Find "markdown": after this idx
    md_start_key = content.find('"markdown":', idx)
    if md_start_key == -1 or md_start_key > idx + 200:
        md_start_key = content.find("'markdown':", idx)

    if md_start_key == -1:
        print(f"ERROR: Could not find markdown key for slug '{slug}'")
        return False

    # Check if value starts with " or `
    val_start = md_start_key + len('"markdown":')
    while content[val_start] in [' ', '\n', '\r', '\t']:
        val_start += 1
    
    quote_char = content[val_start] # could be " or `
    
    if quote_char not in ['"', '`']:
        print(f"ERROR: Unexpected quote character '{quote_char}' at position {val_start}")
        return False

    # Find the matching closing quote
    val_end = -1
    curr = val_start + 1
    while curr < len(content):
        if content[curr] == quote_char and content[curr-1] != '\\':
            val_end = curr
            break
        curr += 1

    if val_end == -1:
        print(f"ERROR: Could not find closing quote for markdown of slug '{slug}'")
        return False

    # Prepare escaped version for json string or template literal
    if quote_char == '"':
        # JSON string representation
        json_str = json.dumps(new_markdown)
        # Replace the entire quote to quote
        new_content = content[:val_start] + json_str + content[val_end+1:]
    else:
        # Backtick template literal
        escaped_md = new_markdown.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
        new_content = content[:val_start] + '`' + escaped_md + '`' + content[val_end+1:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"SUCCESSFULLY UPDATED '{slug}' in {file_path} (Length: {len(new_markdown)} chars)")
    return True

if __name__ == '__main__':
    # Test with lifo-stacks
    from expand_short_dsa_and_de import lifo_stacks_article, fifo_queues_article
    update_markdown_for_slug('src/config/blogData.ts', 'lifo-stacks', lifo_stacks_article)
    update_markdown_for_slug('src/config/blogData.ts', 'fifo-queues', fifo_queues_article)
