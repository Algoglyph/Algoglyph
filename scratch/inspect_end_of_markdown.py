with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

p_start = text.find('"slug": "doordash-cupac"')
p_next = text.find('"slug": "netflix-stratification"')

print("Block between doordash-cupac and netflix-stratification:")
block = text[p_start:p_next]
p_md = block.find('"markdown":')
print("Markdown start:", repr(block[p_md:p_md+40]))
print("Markdown end:", repr(block[-50:]))
