import json
import re

blog_data_path = '/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/config/deBlogData.ts'
extracted_path = '/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/extracted_articles.json'

with open(extracted_path, 'r') as f:
    extracted_articles = json.load(f)

with open(blog_data_path, 'r') as f:
    content = f.read()

# Replace empty strings for keys that we have extracted
# The format in deBlogData.ts is typically: 'de-something': '',
# We need to replace it with: 'de-something': `\n# Content\n`,

updated_count = 0
for key, value in extracted_articles.items():
    # Make sure we escape backticks in the value to avoid breaking the template string
    safe_value = value.replace('`', '\\`')
    
    # regex to find the key with empty string
    pattern = r"'" + re.escape(key) + r"':\s*'',?"
    
    # Check if this key is currently empty in the file
    if re.search(pattern, content):
        replacement = f"'{key}': `\n{safe_value}\n`,"
        content = re.sub(pattern, replacement, content)
        updated_count += 1
    else:
        # It might be defined with double quotes or without comma
        pattern2 = r"'" + re.escape(key) + r"':\s*\"\",?"
        if re.search(pattern2, content):
            replacement = f"'{key}': `\n{safe_value}\n`,"
            content = re.sub(pattern2, replacement, content)
            updated_count += 1

with open(blog_data_path, 'w') as f:
    f.write(content)

print(f"Successfully updated {updated_count} articles in deBlogData.ts")

# Now let's find which ones are STILL empty
empty_keys = []
matches = re.finditer(r"'([^']+)':\s*(?:''|\"\"),", content)
for match in matches:
    key = match.group(1)
    if key.startswith('de-'):
        empty_keys.append(key)

print(f"Still empty {len(empty_keys)} articles: {empty_keys}")
