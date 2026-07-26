import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's search for "Data Scientist" or "AI" or count topics in domains
domain_blocks = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"][\s\S]*?name:\s*['\"]([^'\"]+)['\"][\s\S]*?topics:\s*\[([\s\S]*?)\n\s*\}\s*,\s*\n\s*\{", text)

print("Domains found with topics:")
for did, dname, topics_text in domain_blocks:
    subtopics = re.findall(r"blogSlug:\s*['\"]([^'\"]+)['\"]", topics_text)
    print(f"Domain ID: {did} | Name: {dname} | Blogs count: {len(subtopics)}")

