import json
import re

print("=== FIXING TRIPLE BACKTICK ESCAPING IN blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix any unescaped backtick sequences outside string boundaries
# Let's find all entries in blogData.ts using regex or JSON reconstruction
# We have all clean generated articles in `scratch/fs_batch1_perfect_7500.json`, `scratch/ai_batch4_clean_quality.json`, `scratch/ai_batch5_clean_quality.json`

# Let's clean line 169426 manually: `\`\` should be ```
text = text.replace("`\\`\\`\nproject-root/", "```\nproject-root/")
text = text.replace("`\\`\\`\n", "```\n")

# Now run proper template literal escaper:
# Inside `markdown: `...``, replace unescaped ` with \`
def fix_all_markdown_template_literals(content):
    # Match markdown: `...` where start is `markdown: ` and end is `\n  }` or `\n    title:`
    pattern = r"(markdown:\s*`)([\s\S]*?)(`\s*,?\s*\n\s*(?:\"?title\"?:|\"?tagline\"?:|\}?))"
    
    def repl(m):
        prefix = m.group(1)
        md_text = m.group(2)
        suffix = m.group(3)
        
        # Unescape first
        md_clean = re.sub(r'\\+`', '`', md_text)
        md_clean = re.sub(r'\\+\${', '${', md_clean)
        
        # Escape backticks and ${
        md_escaped = md_clean.replace('\\', r'\\')
        md_escaped = md_escaped.replace('`', r'\`')
        md_escaped = md_escaped.replace('${', r'\${')
        
        return f"{prefix}{md_escaped}{suffix}"

    return re.sub(pattern, repl, content)

fixed = fix_all_markdown_template_literals(text)

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(fixed)

print("SAVED! TESTING TYPESCRIPT & VITE BUILD...")
