import json

# Load all 6 batch files
all_articles = {}
for i in range(1, 7):
    with open(f'./scratch/batch_{i}.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        all_articles.update(data)

print(f"Loaded {len(all_articles)} total articles across 6 batches.")

with open('./src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Cut off any container-lxc additions at the end if present
lxc_pos = content.find("'container-lxc':")
if lxc_pos != -1:
    clean_base = content[:lxc_pos].strip()
    # Make sure clean base ends with a comma
    if not clean_base.endswith(','):
        clean_base += ','
    content = clean_base + "\n};\n"
    print("Cleaned base file up to container-lxc entry.")

insert_pos = content.rfind('};')
additions = []
for slug, md in all_articles.items():
    escaped_md = md.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    additions.append(f"  '{slug}': `{escaped_md}`,")

new_code = content[:insert_pos] + "\n" + "\n".join(additions) + "\n};\n"

with open('./src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Re-integrated all 42 articles cleanly with proper commas into deBlogData.ts!")
