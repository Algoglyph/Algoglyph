import re

print("=== STRIPPING Technical Architecture Deep-Dive & Engineering Reference FROM blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"## Technical Architecture Deep-Dive & Engineering Reference[\s\S]*?(?=\n\n#|\n\n##|`\s*\n\s*\})"
content = re.sub(pattern, "", content)

# Also remove any leftover trailing dashed dividers `---` before closing template literals
content = re.sub(r"---\s*\n\s*`", "`", content)

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("CLEANUP COMPLETE!")
