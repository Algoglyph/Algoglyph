import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find each post block in the array BLOG_POSTS:
# We know the slugs are:
slugs = [
    "html-semantics", "css-layouts", "checkpoint-static", "javascript-basics",
    "npm-ecosystem", "checkpoint-interactivity", "git-version-control",
    "github-collaboration", "checkpoint-collaborative", "checkpoint-external-packages"
]

# Let's print details about each slug
for slug in slugs:
    # Match the post block starting with slug: 'slug' and ending with markdown: `...`
    # Let's locate the index of the slug: 'slug'
    idx = content.find(f"slug: '{slug}'")
    if idx == -1:
        print(f"Slug not found: {slug}")
        continue
    
    # Let's find where the markdown template literal starts:
    md_start = content.find("markdown: `", idx)
    if md_start == -1:
        print(f"Markdown start not found for slug: {slug}")
        continue
    
    md_content_start = md_start + len("markdown: `")
    # Let's find the closing backtick: we need to handle escaped backticks if any.
    # But since it's just a simple scan, let's find the closing backtick of the template literal.
    # To do that, we scan characters from md_content_start. If we see a backtick that is not escaped by \, and it's followed by a comma or closing curly bracket/newline.
    md_content = ""
    esc = False
    for i in range(md_content_start, len(content)):
        char = content[i]
        if esc:
            esc = False
            md_content += char
        elif char == '\\':
            esc = True
            md_content += char
        elif char == '`':
            # Check if this is the end of the markdown property (e.g. followed by a comma, newline, or whitespace)
            # Typically, in our files, markdown is followed by: `,\n
            # Let's verify if content[i+1] is ',' or '\n' or '}'
            # Let's check next few non-whitespace characters:
            next_chars = content[i+1:i+20].strip()
            if not next_chars or next_chars.startswith(',') or next_chars.startswith('}') or next_chars.startswith('category') or next_chars.startswith('readTime') or next_chars.startswith('prerequisites') or next_chars.startswith('related') or next_chars.startswith('nextTopic') or next_chars.startswith('prevTopic') or next_chars.startswith('practiceProblems'):
                break
            else:
                md_content += char
        else:
            md_content += char
            
    print(f"\n==========================================")
    print(f"SLUG: {slug}")
    print(f"LENGTH: {len(md_content)} characters")
    print(f"PREVIEW (First 300 chars):")
    print(md_content[:300].strip())
    print(f"PREVIEW (Last 300 chars):")
    print(md_content[-300:].strip())
