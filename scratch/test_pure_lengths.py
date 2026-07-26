import json
import re

with open('scratch/make_all10_pure_real_batch3_final.py', 'r', encoding='utf-8') as f:
    text = f.read()

p_add = text.find('additions = {')
p_end = text.find('\ndef clean_markdown_headers', p_add)
additions_code = text[p_add:p_end]

scope = {}
exec(additions_code, scope)
additions = scope['additions']

p_add2 = text.find('deep_extra_content = {')
p_end2 = text.find('\ndef clean_markdown_headers', p_add2)
deep_code = text[p_add2:p_end2]

scope2 = {}
exec(deep_code, scope2)
deep_extra_content = scope2['deep_extra_content']

with open('scratch/revert_and_build_pure_real_batch3.py', 'r', encoding='utf-8') as f:
    r_text = f.read()

raw_dict = {}
slug_map = {
    21: "time-series-models",
    22: "forecasting-task-with-solution",
    23: "linear-regression-econ",
    24: "learn-python-kaggle",
    25: "algorithmic-exercises",
    26: "study-plans-leetcode",
    27: "algorithms-specialization",
    28: "sql-tutorial-course",
    29: "exploratory-data-analysis-with-python-and-pandas",
    30: "exploratory-data-analysis-for-machine-learning"
}

for i in range(21, 31):
    token = f'md_{i} = r"""'
    p1 = r_text.find(token)
    if p1 != -1:
        p1 += len(token)
        p2 = r_text.find('"""\n\ndef clean_markdown_headers' if i == 30 else f'md_{i+1} = r"""', p1)
        p2_end = r_text.rfind('"""', p1, p2)
        raw_dict[slug_map[i]] = r_text[p1:p2_end].strip()

def clean_markdown_headers(markdown):
    lines = markdown.splitlines()
    seen_h2 = set()
    cleaned_lines = []
    
    h2_counter = 1
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## '):
            header_text = stripped[3:].strip()
            clean_title = re.sub(r'^\d+(\.\d+)*\s*', '', header_text)
            if clean_title in seen_h2:
                continue
            seen_h2.add(clean_title)
            line = f"## {h2_counter}. {clean_title}"
            h2_counter += 1
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)

for i in range(21, 31):
    slug = slug_map[i]
    raw_md = raw_dict[slug]
    extra1 = additions.get(slug, "")
    extra2 = deep_extra_content.get(slug, "")
    tot = clean_markdown_headers(raw_md + "\n\n" + extra1 + "\n\n" + extra2)
    print(f"#{i} '{slug}': {len(tot):,} chars")
