import re

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

batch3_slugs = [
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

for slug in batch3_slugs:
    occurrences = [m.start() for m in re.finditer(rf"slug:\s*['\"]{re.escape(slug)}['\"]", text)]
    print(f"Slug '{slug}': {len(occurrences)} occurrences found.")
