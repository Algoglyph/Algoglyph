with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'"slug":\s*"doordash-cupac"', text)]
print(f"Found {len(matches)} occurrences of doordash-cupac in blogData.ts:")
for m in matches:
    print("Pos:", m, repr(text[m-20:m+60]))
