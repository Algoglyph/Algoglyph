with open('scratch/build_real_ai_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

for i in range(21, 31):
    token = f'md_{i} = r"""'
    p1 = text.find(token)
    if p1 != -1:
        p1 += len(token)
        p2 = text.find('"""\n\n# Register', p1)
        if p2 == -1:
            p2 = text.find('"""\n\nmd_', p1)
        if p2 == -1:
            p2 = text.find('"""\n\n', p1)
        sub = text[p1:p2]
        print(f"md_{i} length: {len(sub):,} chars")
