import subprocess, re, json

# Get current slugs in blogData.ts
with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()
existing = set(re.findall(r'''["\']?slug["\']?\s*:\s*["\']([^"\']+)["\']''', content))
existing.discard('string')
print(f"Current slugs in blogData.ts: {len(existing)}")

# Check each bc batch json to see what slugs they contain
for i in range(1, 7):
    try:
        with open(f'scratch/bc_batch{i}.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        slugs = list(data.keys()) if isinstance(data, dict) else [a.get('slug','?') for a in data]
        already_in = [s for s in slugs if s in existing]
        missing = [s for s in slugs if s not in existing]
        print(f"\nBatch {i} ({len(slugs)} slugs): {already_in} already in file, {len(missing)} missing")
        for s in missing:
            print(f"   MISSING: {s}")
    except Exception as e:
        print(f"\nBatch {i}: Error reading json - {e}")
