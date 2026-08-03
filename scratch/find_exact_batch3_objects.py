import json
import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find BLOG_POSTS array start
p_posts = text.find('export const BLOG_POSTS: BlogPost[] = [')
print(f"BLOG_POSTS array start: {p_posts}")

# Find all occurrences of '"slug": "' after p_posts
matches = list(re.finditer(r'"slug":\s*"([^"]+)"', text[p_posts:]))
print(f"Total blog objects found in BLOG_POSTS: {len(matches)}")

print("\n=== BLOG OBJECTS 21 TO 30 ===")
for i in range(20, 30):
    m = matches[i]
    slug = m.group(1)
    abs_pos = p_posts + m.start()
    print(f"Object #{i+1}: slug='{slug}' at position {abs_pos}")
