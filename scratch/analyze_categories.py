import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's extract slug, title, and category using regex or simple parsing
# A post starts with { and contains fields: slug, title, category, etc.
# Since it's typescript, let's look for objects in the BLOG_POSTS array.

# Let's find matches for:
# slug: '...',
# title: '...',
# category: '...'

posts = []
pattern = r'\{\s*slug:\s*[\'"]([^\'"]+)[\'"],\s*title:\s*[\'"]([^\'"]+)[\'"],\s*tagline:[\s\S]*?category:\s*[\'"]([^\'"]+)[\'"]'
matches = re.findall(pattern, content)

print(f"Found {len(matches)} matches via regex pattern.")
categories = {}
for slug, title, category in matches:
    categories[category] = categories.get(category, []) + [slug]

for cat, slugs in categories.items():
    print(f"\nCategory: {cat} (Count: {len(slugs)})")
    print(", ".join(slugs))
