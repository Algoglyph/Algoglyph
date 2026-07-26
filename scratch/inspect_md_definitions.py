with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

for i in range(11, 21):
    p = text.find(f'md_{i} = `')
    if p == -1:
        p = text.find(f'md_{i} =')
    print(f"md_{i} pos: {p}")
    if p != -1:
        print(repr(text[p:p+60]))
