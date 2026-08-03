import json
import re
import sys

def integrate_batch(json_path, target_file='./src/config/deBlogData.ts'):
    with open(json_path, 'r', encoding='utf-8') as f:
        articles = json.load(f)

    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    for slug, md in articles.items():
        # Escape backticks and template string interpolations in markdown
        escaped_md = md.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
        
        # Check if slug exists in deBlogData.ts
        pattern = rf"'{re.escape(slug)}'\s*:\s*`[\s\S]*?`,"
        replacement = f"'{slug}': `{escaped_md}`,"

        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            print(f"Updated existing slot: {slug}")
        else:
            # Append before the last closing brace
            insert_pos = content.rfind('};')
            if insert_pos != -1:
                content = content[:insert_pos] + f"  '{slug}': `{escaped_md}`,\n" + content[insert_pos:]
                print(f"Appended new slot: {slug}")
            else:
                print(f"ERROR: Could not find closing brace in {target_file}")

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully integrated {len(articles)} articles into {target_file}!")

if __name__ == '__main__':
    json_path = sys.argv[1] if len(sys.argv) > 1 else './scratch/batch_1.json'
    integrate_batch(json_path)
