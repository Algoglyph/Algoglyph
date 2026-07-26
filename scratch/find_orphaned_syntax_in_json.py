import json

with open('scratch/ai_batch3_heavy_real_pure.json', 'r', encoding='utf-8') as f:
    batch3_dict = json.load(f)

for slug, article in batch3_dict.items():
    md = article['markdown']
    lines = md.splitlines()
    for idx, line in enumerate(lines):
        if line.strip() == '})':
            print(f"Slug '{slug}' line {idx}: {repr(line)}")
            print("  Context around line:")
            for j in range(max(0, idx-3), min(len(lines), idx+4)):
                print(f"    {j}: {repr(lines[j])}")
