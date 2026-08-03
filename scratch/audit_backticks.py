import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

print(f"Total lines in blogData.ts: {len(text.splitlines())}")

# Check for raw backticks inside template literals that might not be escaped
# A template literal in blogData.ts starts with `"markdown": ` or `markdown: `
markdown_blocks = re.findall(r'"markdown":\s*`([\s\S]*?)`,\n', text)
print(f"Found {len(markdown_blocks)} markdown template literal blocks.")

# Check for unescaped template literal interpolations like `${...}` that aren't backslash escaped `\${`
interpolations = re.findall(r'[^\\]\$\{', text)
print(f"Found {len(interpolations)} unescaped ${{...}} interpolations.")

if interpolations:
    print("Warning: Unescaped ${...} interpolations found! Fixing them now...")
    text = re.sub(r'([^\\])\$\{', r'\1\\${', text)
    with open('src/config/blogData.ts', 'w', encoding='utf-8') as f_out:
        f_out.write(text)
    print("Successfully escaped all ${...} interpolations in blogData.ts")
