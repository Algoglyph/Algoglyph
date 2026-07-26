import re

with open('src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's write a parser to extract key and its exact content
# A key starts at 'key': ` and ends with `, or similar.
# Since JavaScript object literal structure can be parsed:
pattern = r"['\"]([^'\"]+)['\"]\s*:\s*`([\s\S]*?)`"
matches = re.findall(pattern, content)

key_contents = {}
for key, val in matches:
    if key not in key_contents:
        key_contents[key] = []
    key_contents[key].append(val)

print("Inspection of some duplicate keys:")
for key in ['async-coroutines', 'async-threads', 'di-dagger']:
    if key in key_contents:
        occurrences = key_contents[key]
        print(f"Key: '{key}' has {len(occurrences)} occurrences.")
        for idx, val in enumerate(occurrences, 1):
            print(f"  Occurrence {idx} length: {len(val)} chars")
            print(f"  First 100 chars: {val[:100].strip()}...")
            print(f"  Last 100 chars: {val[-100:].strip()}...")
