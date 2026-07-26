import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

real_batch3_slugs = [
    "time-series-models",
    "forecasting-task-with-solution",
    "linear-regression-econ",
    "learn-python-kaggle",
    "algorithmic-exercises",
    "study-plans-leetcode",
    "algorithms-specialization",
    "sql-tutorial-course",
    "exploratory-data-analysis-with-python-and-pandas",
    "exploratory-data-analysis-for-machine-learning"
]

print("=== CHECKING FOR TEMPLATE PADDING IN REAL BATCH 3 BLOGS ===")

for slug in real_batch3_slugs:
    pattern = r'slug:\s*"' + re.escape(slug) + r'"[\s\S]*?markdown:\s*`([\s\S]*?)`\s*\}'
    match = re.search(pattern, text)
    if not match:
        print(f"Slug '{slug}' NOT FOUND!")
        continue
    md = match.group(1)
    
    has_template_padding = "Technical Deep-Dive Section" in md or "Advanced Analytical Frameworks" in md
    count_padding = md.count("Advanced Analytical Frameworks")
    print(f"Slug: '{slug}' | Has Template Padding: {has_template_padding} (Count: {count_padding}) | Total Chars: {len(md):,}")
