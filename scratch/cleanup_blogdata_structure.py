import re

blog_data_path = 'src/config/blogData.ts'

with open(blog_data_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Let's remove any embedded duplicate interface blocks in the middle of the file
# Pattern for duplicate interface blocks:
# `];\n  algorithmDescription: string[]; ... export const BLOG_POSTS: BlogPost[] = [`

cleaned_text = re.sub(
    r'\];\s*algorithmDescription:\s*string\[\];[\s\S]*?export const BLOG_POSTS:\s*BlogPost\[\]\s*=\s*\[',
    ',',
    text
)

# Also check for any other duplicate `export const BLOG_POSTS: BlogPost[] = [` in the middle
cleaned_text = re.sub(
    r'\];\s*export const BLOG_POSTS:\s*BlogPost\[\]\s*=\s*\[',
    ',',
    cleaned_text
)

# Write out cleaned text
with open(blog_data_path, 'w', encoding='utf-8') as f_out:
    f_out.write(cleaned_text)

print("Successfully removed middle duplicate interface/array declarations in blogData.ts")
