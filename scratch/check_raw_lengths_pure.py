with open('scratch/revert_and_build_pure_real_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

slug_map = {
    21: "time-series-models",
    22: "forecasting-task-with-solution",
    23: "linear-regression-econ",
    24: "learn-python-kaggle",
    25: "algorithmic-exercises",
    26: "study-plans-leetcode",
    27: "algorithms-specialization",
    28: "sql-tutorial-course",
    29: "exploratory-data-analysis-with-python-and-pandas",
    30: "exploratory-data-analysis-for-machine-learning"
}

for i in range(21, 31):
    token = f'md_{i} = r"""'
    p1 = text.find(token)
    if p1 != -1:
        p1 += len(token)
        p2 = text.find('"""\n\ndef clean_markdown_headers' if i == 30 else f'md_{i+1} = r"""', p1)
        p2_end = text.rfind('"""', p1, p2)
        sub = text[p1:p2_end].strip()
        print(f"#{i} '{slug_map[i]}': {len(sub):,} raw chars")
