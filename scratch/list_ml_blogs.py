import re

with open('src/config/roadmapData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find domain titles / IDs
domains = re.findall(r'id:\s*[\'"]([^\'"]+)[\'"],\s*title:\s*[\'"]([^\'"]+)[\'"]', text)
print("Domains found:", domains)

# Find all occurrences of blogSlug in Machine Learning section
ml_idx = text.find("Machine Learning")
if ml_idx != -1:
    print("Found Machine Learning at char", ml_idx)
    # slice text from Machine Learning to next major domain or end
    sub = text[ml_idx:ml_idx+50000]
    # extract topics and blogSlugs
    items = re.findall(r'title:\s*[\'"]([^\'"]+)[\'"][\s\S]*?blogSlug:\s*[\'"]([^\'"]+)[\'"]', sub)
    print(f"Total topics with blogSlug under Machine Learning: {len(items)}")
    for i, (t, s) in enumerate(items[:60], 1):
        print(f"{i}. {t} -> {s}")
