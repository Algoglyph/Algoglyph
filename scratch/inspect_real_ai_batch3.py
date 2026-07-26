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

print("=== CHECKING REAL AI & DATA SCIENTIST BATCH 3 SLUGS IN blogData.ts ===")

for idx, slug in enumerate(real_batch3_slugs, 21):
    p_start = text.find(f'"slug": "{slug}"')
    if p_start == -1:
        p_start = text.find(f'slug: "{slug}"')
    if p_start == -1:
        print(f"#{idx}: Slug '{slug}' NOT FOUND in blogData.ts!")
        continue
        
    p_md = text.find('markdown: `', p_start)
    if p_md == -1:
        p_md = text.find('"markdown": `', p_start)
    if p_md == -1:
        print(f"#{idx}: Markdown not found for '{slug}'")
        continue
        
    start_idx = p_md + len('markdown: `')
    end_idx = text.find('`\n  },', start_idx)
    if end_idx == -1:
        end_idx = text.find('`\n  }', start_idx)
    md = text[start_idx:end_idx]
    
    print(f"#{idx}: Slug '{slug}' | Chars: {len(md):,} | Header: {repr(md[:60])}")
