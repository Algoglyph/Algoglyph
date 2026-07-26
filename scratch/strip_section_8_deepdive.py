import re

print("=== REMOVING ALL DEEP-DIVE BOILERPLATE SECTIONS FROM blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Match from `\n---\n\n## \d+\. Technical Architecture Deep-Dive` up to closing backtick `
pattern = r"\n---\s*\n\s*##\s*\d+\.\s*Technical Architecture Deep-Dive[\s\S]*?(?=`)"

matches = list(re.finditer(pattern, content))
print(f"Found {len(matches)} matching blocks.")

content = re.sub(pattern, "", content)

# Clean up any orphan double separators `---` before closing backticks
content = re.sub(r"\n---\s*`", "\n`", content)

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("CLEANUP COMPLETE!")
