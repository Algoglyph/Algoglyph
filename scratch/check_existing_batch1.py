import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

slugs_in_blogdata = re.findall(r'"slug":\s*"([^"]+)"', text)
print(f"Total slugs in blogData.ts: {len(slugs_in_blogdata)}")

# Let's list the 49 slugs from Zone 08 and check which ones are in blogData.ts
with open('scratch/parse_zone8_proper.py', 'r', encoding='utf-8') as f:
    zone8_script = f.read()

# Let's import the slugs list from Zone 08
import subprocess
out = subprocess.check_output(['python', 'scratch/parse_zone8_proper.py'], text=True)
zone8_slugs = []
for line in out.splitlines():
    match = re.match(r'^\s*\d+\.\s*([a-z0-9-]+)', line)
    if match and not line.startswith('===') and not line.startswith('Total'):
        zone8_slugs.append(match.group(1))

print(f"\nExtracted {len(zone8_slugs)} Zone 08 slugs.")

print("\nZone 08 Slugs Status in blogData.ts:")
for idx, slug in enumerate(zone8_slugs, 1):
    status = "PRESENT" if slug in slugs_in_blogdata else "MISSING"
    print(f"{idx:2d}. [{status}] {slug}")
