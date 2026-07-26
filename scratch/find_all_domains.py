import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

domains = re.findall(r"id:\s*['\"]([^'\"]+)['\"],\s*number:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"]", text)

print("Domains in roadmapData.ts:")
for did, dnum, dname in domains:
    print(f"- ID: '{did}' | Number: {dnum} | Name: '{dname}'")

