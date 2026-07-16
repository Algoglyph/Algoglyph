import json
import re

with open('batch_m_final.json', 'r') as f:
    text = f.read()

articles = {}
for key in ['de-message-tools', 'de-testing-types', 'de-iac-concepts']:
    key_str = f'"{key}": "'
    start_idx = text.find(key_str)
    if start_idx == -1:
        continue
    start_idx += len(key_str)
    
    end_idx = start_idx
    escaped = False
    while end_idx < len(text):
        c = text[end_idx]
        if escaped:
            escaped = False
        elif c == '\\':
            escaped = True
        elif c == '"':
            break
        end_idx += 1
        
    val = text[start_idx:end_idx]
    val = val.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\').replace('\\t', '\t')
    articles[key] = val

print(f'Extracted {len(articles)} articles.')

blog_data_path = 'src/config/deBlogData.ts'
with open(blog_data_path, 'r') as f:
    content = f.read()

for key, markdown in articles.items():
    escaped_markdown = markdown.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')
    
    start_str = f"'{key}': "
    if start_str + "''," in content:
        content = content.replace(start_str + "'',", f"'{key}': `{escaped_markdown}`,")
    elif start_str + '\"\",' in content:
        content = content.replace(start_str + '\"\",', f"'{key}': `{escaped_markdown}`,")

with open(blog_data_path, 'w') as f:
    f.write(content)

print('Updated 3 articles.')

plan_path = '.agents/plans/data-engineering-article-plan.md'
with open(plan_path, 'r') as f:
    plan_content = f.read()

for key in articles.keys():
    plan_content = plan_content.replace(f'- [ ] {key} (missing)', f'- [x] {key} (real)')

with open(plan_path, 'w') as f:
    f.write(plan_content)

print('Updated plan.')
