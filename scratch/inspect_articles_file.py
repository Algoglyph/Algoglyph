with open('scratch/generate_full_10_clean_batch2_articles.py', 'r', encoding='utf-8') as f:
    text = f.read()

for i in range(11, 21):
    pos = text.find(f'md_{i} = r"""')
    print(f"md_{i} = r\"\"\" position: {pos}")
