with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

print("File length:", len(content))
print("Last 200 characters of blogData.ts:")
print(content[-200:])
