import re

print("=== FIXING CODE FENCES AND UNESCAPED BACKTICKS IN ALL BLOGS ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# First replace any corrupted `\`` or `\`\` or `\`\`\` outside proper boundaries
# Normalize all code fences: `\`\` or `\`\`\` or ``` -> \`\`\`
# Let's write a robust parser for blogData.ts entries

def clean_blog_entry(match):
    prefix = match.group(1) # `{ slug: '...', ... markdown: `
    md_content = match.group(2)
    suffix = match.group(3) # `, ... }`

    # Unescape all backticks back to raw `
    raw_md = re.sub(r'\\+`', '`', md_content)
    raw_md = re.sub(r'\\+\${', '${', raw_md)

    # Now escape all ` to \` cleanly
    escaped_md = raw_md.replace('\\', r'\\')
    escaped_md = escaped_md.replace('`', r'\`')
    escaped_md = escaped_md.replace('${', r'\${')

    return f"{prefix}{escaped_md}{suffix}"

# Entry pattern matching `{ slug: ..., markdown: `...` }`
entry_pattern = r"(slug:\s*['\"][^'\"]+['\"][\s\S]*?markdown:\s*`)([\s\S]*?)(`\s*,?\s*\n\s*(?:\"?title\"?:|\"?tagline\"?:|practiceProblems|category|readTime|lastUpdated|visualizerId|prerequisites|related|\}))"

new_text = re.sub(entry_pattern, clean_blog_entry, text)

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(new_text)

print("ENTRIES SUCCESSFULLY CLEANED AND ESCAPED!")
