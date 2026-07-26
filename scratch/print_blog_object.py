with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

p = text.find('"slug": "doordash-cupac"')
print("Position:", p)
print(repr(text[p:p+300]))
