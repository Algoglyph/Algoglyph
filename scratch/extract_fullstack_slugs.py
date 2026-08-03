import json
import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find Backend Systems & System Design / Full Stack Domain in roadmapData.ts
# Let's search for all subtopics in domain 2 (System Design & Backend Systems / Full Stack)

# Or find all topic blocks in backend section
matches = re.findall(r"id:\s*['\"]([^'\"]+)['\"],\s*title:\s*['\"]([^'\"]+)['\"][\s\S]*?blogSlug:\s*['\"]([^'\"]+)['\"]", text)

print(f"Total topics with blogSlugs found in roadmapData.ts: {len(matches)}")

# Let's inspect domain 2 topics
backend_slugs = []
for topic_id, title, blog_slug in matches:
    # Filter for backend / full-stack / web-dev topics
    backend_slugs.append((topic_id, title, blog_slug))

print(f"Found {len(backend_slugs)} total blog slugs.")
