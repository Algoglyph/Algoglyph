with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Find markdown images in the file with full-stack or blockchain
images_fs = re.findall(r'!\[[^\]]*\]\(/images/full-stack/[^)]+\)', content)
images_bc = re.findall(r'!\[[^\]]*\]\(/images/blockchain/[^)]+\)', content)

print("=== FULL STACK IMAGES ===")
for img in images_fs[:5]:
    print(img)

print("=== BLOCKCHAIN IMAGES ===")
for img in images_bc[:5]:
    print(img)
