import json
import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract all slugs in BLOG_POSTS in order
slugs = re.findall(r'"slug":\s*"([^"]+)"', text)
print(f"Total slugs in blogData.ts: {len(slugs)}")

print("\n=== SLUGS 21 TO 30 (BATCH 3) ===")
batch3_slugs = slugs[20:30]
for idx, s in enumerate(batch3_slugs, 21):
    # Find title for this slug
    p_slug = text.find(f'"slug": "{s}"')
    p_title = text.find('"title": "', p_slug)
    p_title_end = text.find('",', p_title + len('"title": "'))
    title = text[p_title + len('"title": "'):p_title_end]
    print(f"#{idx}: slug='{s}' | title='{title}'")
