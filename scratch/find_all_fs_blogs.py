import re

files_to_check = [
    'src/config/blogData.ts',
    'src/config/deBlogData.ts',
    'src/config/mlBlogData.ts'
]

print("=== SEARCHING FOR FULL STACK BLOGS IN ALL BLOG FILES ===")

for filename in files_to_check:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for instances of "Full Stack" or "Full-Stack"
    # Let's count how many times it shows up in general
    fs_count = len(re.findall(r'full\s*stack', content, re.IGNORECASE))
    print(f"File: {filename} | 'full stack' occurrences: {fs_count}")
