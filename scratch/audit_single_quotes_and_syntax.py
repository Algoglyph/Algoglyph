import json
import re

print("=== AUDITING SINGLE QUOTES IN INJECTED BATCH 3 ===")

with open('scratch/ai_batch3_heavy_real_pure.json', 'r', encoding='utf-8') as f:
    batch3_dict = json.load(f)

for slug, article in batch3_dict.items():
    title = article['title'].replace("'", "\\'")
    tagline = article['tagline'].replace("'", "\\'")
    article['title'] = title
    article['tagline'] = tagline

with open('scratch/ai_batch3_heavy_real_pure.json', 'w', encoding='utf-8') as f:
    json.dump(batch3_dict, f, indent=2)

print("Updated scratch/ai_batch3_heavy_real_pure.json with escaped single quotes in title & tagline!")
