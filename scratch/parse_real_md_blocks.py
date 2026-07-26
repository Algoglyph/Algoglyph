with open('scratch/build_real_ai_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

for i in range(21, 31):
    token = f'md_{i} = r"""'
    p1 = text.find(token)
    if p1 != -1:
        p1 += len(token)
        if i < 30:
            next_token = f'md_{i+1} = r"""'
            p2 = text.find(next_token, p1)
            p2_end = text.rfind('"""', p1, p2)
        else:
            p2_end = text.find('"""\n\n# Register', p1)
        sub = text[p1:p2_end].strip()
        print(f"md_{i} extracted length: {len(sub):,} chars | Start: {repr(sub[:50])}")
