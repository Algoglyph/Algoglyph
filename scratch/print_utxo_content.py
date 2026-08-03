with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find("slug: 'utxo-blockchains'")
if idx != -1:
    print(content[idx:idx+1500].encode('ascii', 'ignore').decode('ascii'))
