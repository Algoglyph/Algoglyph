# -*- coding: utf-8 -*-
import json
import re
import os

all_articles = {}

for batch_num in range(1, 7):
    py_path = f'./scratch/generate_backend_batch{batch_num}.py'
    if not os.path.exists(py_path):
        print(f"File {py_path} does not exist!")
        continue

    with open(py_path, 'r', encoding='utf-8') as f:
        py_content = f.read()

    # Match assignments like: b1_articles['container-lxc'] = r"""...""" or b1_articles['container-lxc'] = """..."""
    matches = re.findall(r"b\d_articles\['([a-zA-Z0-9\-_]+)'\]\s*=\s*r?\"\"\"([\s\S]*?)\"\"\"", py_content)
    
    for slug, md in matches:
        all_articles[slug] = md.strip()

print(f"Extracted {len(all_articles)} full articles from batch Python files!")
for slug, md in all_articles.items():
    print(f" - {slug}: {len(md)} chars")

with open('./scratch/all_42_full_articles.json', 'w', encoding='utf-8') as f:
    json.dump(all_articles, f, ensure_ascii=False)
