import re
import json

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    roadmap_text = f.read()

# Locate domain 'machine-learning'
ml_domain_match = re.search(r"id:\s*['\"]machine-learning['\"][\s\S]*?topics:\s*\[([\s\S]*?)\n\s*\}\s*,\s*\n\s*\{", roadmap_text)

if ml_domain_match:
    ml_topics_block = ml_domain_match.group(1)
    
    # Parse concepts and subtopics
    concept_blocks = re.findall(r"name:\s*['\"]([^'\"]+)['\"][\s\S]*?subtopics:\s*\[([\s\S]*?)\]\s*\}", ml_topics_block)
    
    total = 0
    print("# Machine Learning & AI Engineering Roadmap Blogs\n")
    for c_name, sub_raw in concept_blocks:
        subtopics = re.findall(r"name:\s*['\"]([^'\"]+)['\"],\s*blogSlug:\s*['\"]([^'\"]+)['\"]", sub_raw)
        if subtopics:
            print(f"### {c_name} ({len(subtopics)} blogs)")
            for name, slug in subtopics:
                total += 1
                print(f"{total}. **{name}** (`{slug}`)")
            print()
    print(f"**Total Blogs:** {total}")
else:
    print("Could not find domain block directly. Checking mlBlogData.ts...")
    with open('src/config/mlBlogData.ts', 'r', encoding='utf-8') as f:
        ml_blog_text = f.read()
    keys = re.findall(r'"([a-z0-9-]+)":\s*\{\s*"title":\s*"([^"]+)"', ml_blog_text)
    print(f"Total in mlBlogData.ts: {len(keys)}")
    for idx, (k, t) in enumerate(keys, 1):
        print(f"{idx}. **{t}** (`{k}`)")
