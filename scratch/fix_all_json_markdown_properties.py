import re

print("=== CONVERTING ALL DOUBLE-QUOTED MARKDOWN STRINGS TO TEMPLATE LITERALS IN blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def escape_template_literal(text):
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\', r'\\')
    text = text.replace('`', r'\`')
    text = text.replace('${', r'\${')
    return text

# Match any `"markdown": "..."` or `'markdown': "..."` where value is double quoted
# Using regex to find `"markdown": "` or `markdown: "` followed by non-backtick string
def fix_markdown_double_quotes(text):
    # Regex to find `markdown: "` or `"markdown": "` up to `",\n` or `" \n`
    pattern = r'("?markdown"?:\s*")([\s\S]*?)(",?\s*\n\s*"?(?:title|tagline|category|readTime|lastUpdated|visualizerId|prerequisites|related|nextTopic|prevTopic|practiceProblems|content|markdown)"?:)'
    
    def repl(m):
        prefix = "markdown: `"
        val = m.group(2)
        suffix = "`,\n  " + m.group(3).lstrip('", \n')
        # Clean unescaped newlines and escape backticks
        val_clean = val.replace('\\n', '\n').replace('\\"', '"')
        val_escaped = escape_template_literal(val_clean)
        return f"{prefix}{val_escaped}{suffix}"

    return re.sub(pattern, repl, text)

# Let's also do a pass on all entries in blogData.ts using object parsing
# Convert every entry in blogData.ts to ensure markdown property is template literal `markdown: \`...\``
def convert_all_entries_to_template_literals(text):
    # Find all `{ slug: ... }` blocks
    entry_pattern = r"(\{\s*[\s\S]*?markdown:\s*)([\s\S]*?)(\n\s*\}\s*,?)"
    
    # Simple regex to fix double-quoted markdown: "..."
    # Replace `"markdown": "` with `markdown: \`` and find matching `"` before `\n  }`
    lines = text.splitlines()
    in_double_quote_md = False
    new_lines = []
    md_buf = []

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not in_double_quote_md:
            if stripped.startswith('"markdown": "') or stripped.startswith('markdown: "'):
                in_double_quote_md = True
                # Extract text after `markdown": "`
                p_quote = line.find('": "')
                if p_quote == -1:
                    p_quote = line.find(': "') + 1
                md_buf = [line[p_quote + 3:]]
            else:
                new_lines.append(line)
        else:
            # Check if line ends the double-quoted markdown: `"`, `",`, `"`
            if stripped == '"' or stripped == '",' or stripped == '"}' or stripped.endswith('",'):
                in_double_quote_md = False
                end_text = line.rstrip('",}')
                md_buf.append(end_text)
                full_md = "\n".join(md_buf)
                # Unescape \n if literal
                full_md = full_md.replace('\\n', '\n').replace('\\"', '"')
                escaped_md = escape_template_literal(full_md)
                new_lines.append(f"    markdown: `{escaped_md}`")
                if stripped.endswith('}'):
                    new_lines.append("  }")
                elif stripped.endswith(','):
                    pass
            else:
                md_buf.append(line)
        i += 1

    return "\n".join(new_lines)

fixed_content = convert_all_entries_to_template_literals(content)

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print("CONVERSION OF ALL MARKDOWN STRINGS COMPLETE!")
