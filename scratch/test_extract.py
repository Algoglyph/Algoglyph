with open('scratch/generate_full_10_clean_batch2_articles.py', 'r', encoding='utf-8') as f:
    text = f.read()

p1 = text.find('md_11 = r"""')
print(f"p1 position: {p1}")
if p1 != -1:
    p1 += len('md_11 = r"""')
    p2 = text.find('"""', p1)
    print(f"p2 position: {p2}")
    sub = text[p1:p2]
    print(f"Length of sub: {len(sub)}")
    print(repr(sub[:100]))
