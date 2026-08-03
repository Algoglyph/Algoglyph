with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

p = text.find('doordash-cupac')
print("Position of doordash-cupac:", p)
if p != -1:
    print("Context around doordash-cupac:")
    print(text[p-50:p+250])
