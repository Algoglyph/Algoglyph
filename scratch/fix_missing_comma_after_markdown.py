import re

print("=== FIXING MISSING COMMAS AFTER MARKDOWN TEMPLATE LITERALS ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Match `\n` followed by `"title":` or `title:` without preceding comma
pattern = r"(`)(\s*\n\s*\"?(?:title|tagline|category|readTime|lastUpdated|visualizerId|prerequisites|related|nextTopic|prevTopic|practiceProblems|content|markdown)\"?:)"

def repl(m):
    return "`," + m.group(2)

new_content = re.sub(pattern, repl, content)

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("COMMAS FIXED SUCCESSFULLY!")
