import subprocess
import re

# Get old content from git
result = subprocess.run(
    ['git', 'show', 'c600d83:src/config/blogData.ts'],
    capture_output=True, text=True, encoding='utf-8',
    cwd='.'
)
old_content = result.stdout

# Find tcp-ip-model entry DIRECTLY
idx = old_content.find('"tcp-ip-model"')
print(f"'tcp-ip-model' found at char: {idx}")

# Context around it
print("Context:")
print(repr(old_content[idx-200:idx+400]))
