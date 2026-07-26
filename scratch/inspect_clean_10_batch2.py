with open('scratch/generate_all_10_batch2_clean.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re

for i in range(11, 21):
    pos = text.find(f'md_{i} = r"""')
    if pos != -1:
        pos_end = text.find('"""', pos + len(f'md_{i} = r"""'))
        sub = text[pos + len(f'md_{i} = r"""'):pos_end]
        print(f"md_{i} length: {len(sub):,} | Start: {repr(sub[:80])}")
    else:
        print(f"md_{i} NOT FOUND!")
