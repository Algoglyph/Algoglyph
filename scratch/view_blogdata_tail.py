with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

print("Length of blogData.ts:", len(text))
print("Last 1500 chars of blogData.ts:")
print(text[-1500:])
