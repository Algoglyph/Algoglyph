import os
import re

scratch_files = [f for f in os.listdir('scratch') if f.endswith('.py') or f.endswith('.json')]

for fname in scratch_files:
    fpath = os.path.join('scratch', fname)
    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    if 'Paper Analysis: CUPAC' in text or '# Paper Analysis: CUPAC' in text:
        p = text.find('# Paper Analysis: CUPAC')
        if p != -1:
            print(f"Found in {fname} at {p}: {repr(text[p:p+100])}")
        else:
            p2 = text.find('CUPAC - Machine Learning')
            print(f"Found title in {fname} at {p2}: {repr(text[p2-20:p2+100])}")
