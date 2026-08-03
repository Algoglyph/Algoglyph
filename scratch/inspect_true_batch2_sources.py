with open('scratch/generate_real_batch2_full.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Find md_11 and md_12 in generate_real_batch2_full.py
p11 = text.find('md_11 = r"""')
print("md_11 pos in generate_real_batch2_full.py:", p11)
if p11 != -1:
    p11_end = text.find('"""\n', p11 + len('md_11 = r"""'))
    sub11 = text[p11 + len('md_11 = r"""'):p11_end]
    print("md_11 length:", len(sub11))
    print("md_11 start:", repr(sub11[:150]))

p12 = text.find('md_12 = r"""')
print("md_12 pos in generate_real_batch2_full.py:", p12)
if p12 != -1:
    p12_end = text.find('"""\n', p12 + len('md_12 = r"""'))
    sub12 = text[p12 + len('md_12 = r"""'):p12_end]
    print("md_12 length:", len(sub12))
    print("md_12 start:", repr(sub12[:150]))
