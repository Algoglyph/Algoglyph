import re

with open('./src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any unescaped ${ with \${ inside the new additions
# Find lines around 5690 to end and escape ${
new_content = []
in_template = False

lines = content.split('\n')
for line in lines:
    if line.strip().startswith("'") and "': `" in line:
        # Template start
        new_line = line
    else:
        # Escape any unescaped ${ with \${
        new_line = re.sub(r'(?<!\\)\$\{', r'\\${', line)
    new_content.append(new_line)

fixed_code = '\n'.join(new_content)

with open('./src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
    f.write(fixed_code)

print("Escaped unescaped template variables in deBlogData.ts.")
