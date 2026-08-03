import json
import re

with open('scratch/build_real_ai_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

md_dict = {}
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
        md_dict[i] = sub

with open('scratch/build_100pct_real_ai_batch3.py', 'r', encoding='utf-8') as f:
    b_text = f.read()

p_add = b_text.find('additions_real = {')
p_end = b_text.find('\ndef clean_markdown_headers', p_add)
additions_code = b_text[p_add:p_end]

scope = {}
exec(additions_code, scope)
additions_real = scope['additions_real']

for i in range(21, 31):
    raw = md_dict[i].strip()
    extra = additions_real.get(i, "").strip()
    tot = len(raw) + len(extra)
    print(f"#{i}: Total chars = {tot:,} (raw: {len(raw):,}, extra: {len(extra):,})")
