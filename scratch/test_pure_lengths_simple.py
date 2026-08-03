import json
import re

import scratch.make_all10_pure_real_batch3_final as m

for i in range(21, 31):
    slug = m.slug_map[i]
    raw = m.raw_dict[slug]
    extra1 = m.additions.get(slug, "")
    extra2 = m.deep_extra_content.get(slug, "")
    tot = m.clean_markdown_headers(raw + "\n\n" + extra1 + "\n\n" + extra2)
    print(f"#{i} '{slug}': {len(tot):,} chars")
