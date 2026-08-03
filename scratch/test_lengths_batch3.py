with open('scratch/build_full_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

for i in range(21, 31):
    token = f"md_{i} = r\"\"\""
    p1 = text.find(token)
    if p1 != -1:
        p1 += len(token)
        p2 = text.find('"""\n', p1)
        if p2 == -1:
            p2 = text.find('"""', p1)
        sub = text[p1:p2]
        print(f"md_{i} length: {len(sub):,} chars")
