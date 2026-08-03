import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract domain 08 'ai-data-scientist' block
domain_match = re.search(r"id:\s*'ai-data-scientist'[\s\S]*?topics:\s*\[([\s\S]*?)\]\n\s*\}", text)

if domain_match:
    topics_block = domain_match.group(1)
    slugs = re.findall(r"blogSlug:\s*'([^']+)'", topics_block)
    titles = re.findall(r"title:\s*'([^']+)'", topics_block)
    
    print(f"Total topics in ai-data-scientist domain: {len(slugs)}")
    print("\nBatch 2 Slugs (Blogs 11 to 20):")
    for idx, (s, t) in enumerate(zip(slugs[10:20], titles[10:20]), 11):
        print(f"{idx}. Slug: {s}")
        print(f"    Title: {t}")
else:
    print("Could not find ai-data-scientist domain in roadmapData.ts")
