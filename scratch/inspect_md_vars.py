with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

p = text.find('add_blog("doordash-cupac"')
print("Snippet around add_blog(doordash-cupac):")
print(text[p-500:p+300])
