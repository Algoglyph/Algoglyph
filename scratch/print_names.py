# -*- coding: utf-8 -*-
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

for b in [6, 7, 8, 9, 10]:
    name = f"system_design_batch{b}_data"
    mod = __import__(name)
    articles = getattr(mod, f"SYSTEM_DESIGN_BATCH{b}_ARTICLES")
    print(f"### Batch {b}")
    for a in articles:
        print(f"- **{a['title']}** (`{a['slug']}`)")
