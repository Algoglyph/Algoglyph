with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('Production Edge Cases')
if pos != -1:
    print("Exact snippet:")
    print(repr(text[pos-100:pos+300]))
else:
    print("Not found")
