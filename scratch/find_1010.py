with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find("slug: 'utxo-blockchains'")
if idx != -1:
    md_start = content.find("markdown: `", idx)
    print("Substring around 1010:")
    print(content[md_start + 980 : md_start + 1040].encode('ascii', 'ignore').decode('ascii'))
