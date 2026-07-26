import json
import re

extra_md_29 = r"""

---

## 4. Categorical Feature Encoding Strategies

Categorical attributes must be converted into numerical matrices prior to fitting machine learning algorithms:

### 4.1 One-Hot Encoding (OHE) vs Target Encoding
- **One-Hot Encoding**: Creates $K$ binary indicator columns. Best for low cardinality ($K \le 15$).
- **Target Encoding**: Replaces category level $c$ with empirical mean target value $\mathbb{E}[Y \mid X = c]$. Requires smoothing regularizer to prevent target leakage:

$$\hat{S}_c = \frac{n_c \bar{y}_c + m \cdot y_{\text{global}}}{n_c + m}$$

```python
def regularized_target_encode(df: pd.DataFrame, cat_col: str, target_col: str, m: float = 10.0) -> pd.Series:
    global_mean = df[target_col].mean()
    stats = df.groupby(cat_col)[target_col].agg(['count', 'mean'])
    smooth = (stats['count'] * stats['mean'] + m * global_mean) / (stats['count'] + m)
    return df[cat_col].map(smooth)
```

---

## 5. Memory Optimization via Downcasting & PyArrow Backend

Large tabular datasets (10M+ rows) can easily exhaust system RAM. Pandas memory downcasting converts default 64-bit numerical types into compact 32-bit or 16-bit primitives:

```python
def optimize_dataframe_memory(df: pd.DataFrame) -> pd.DataFrame:
    data = df.copy()
    for col in data.columns:
        col_type = data[col].dtype

        if col_type != object and col_type != 'category':
            c_min = data[col].min()
            c_max = data[col].max()

            if str(col_type).startswith('int'):
                if c_min > np.iinfo(np.int8).min and c_max < np.iinfo(np.int8).max:
                    data[col] = data[col].astype(np.int8)
                elif c_min > np.iinfo(np.int16).min and c_max < np.iinfo(np.int16).max:
                    data[col] = data[col].astype(np.int16)
                elif c_min > np.iinfo(np.int32).min and c_max < np.iinfo(np.int32).max:
                    data[col] = data[col].astype(np.int32)
            elif str(col_type).startswith('float'):
                if c_min > np.finfo(np.float32).min and c_max < np.finfo(np.float32).max:
                    data[col] = data[col].astype(np.float32)

    return data
```
"""

extra_md_30 = r"""

---

## 4. Dimensionality Reduction & Variance Profiling (PCA)

When working with hundreds of continuous features, **Principal Component Analysis (PCA)** projects high-dimensional data onto orthogonal components maximizing linear variance:

$$\mathbf{Z} = \mathbf{X} \mathbf{W}, \quad \text{where } \mathbf{X}^T \mathbf{X} = \mathbf{V} \boldsymbol{\Lambda} \mathbf{V}^T$$

### Cumulative Explained Variance Ratio
Plot cumulative explained variance ratio $R(k) = \frac{\sum_{i=1}^k \lambda_i}{\sum_{j=1}^D \lambda_j}$ to select the minimal component count $k$ retaining $> 95\%$ dataset information.

```python
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

def analyze_pca_variance(X: np.ndarray, variance_threshold: float = 0.95) -> int:
    pca = PCA().fit(X)
    cum_var = np.cumsum(pca.explained_variance_ratio_)
    k_components = np.argmax(cum_var >= variance_threshold) + 1
    
    print(f"Components required for {variance_threshold*100}% variance: {k_components}")
    return k_components
```

---

## 5. Target Variable Leakage Audit Protocols

Target leakage occurs when training features contain future information or target derived metadata unavailable at inference runtime:
1. **High Feature-Target Correlation**: Features with $|r_{i, Y}| > 0.95$ often represent direct transformations of the target variable.
2. **Temporal Leakage**: Aggregating historical features using lookahead windows overlapping post-event outcomes.
3. **ID Level Leakage**: Using unique transactional IDs or database primary keys containing hidden sequential timestamp information.
"""

with open('scratch/build_real_ai_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

md_dict = {}
for i in range(21, 31):
    token = f'md_{i} = r"""'
    p1 = text.find(token)
    if p1 != -1:
        p1 += len(token)
        # Find ending triple quotes
        p2 = text.find('"""\n\n# ', p1)
        if p2 == -1:
            p2 = text.find('"""\n\nconfigs =', p1)
        md_dict[i] = text[p1:p2]

md_dict[29] = md_dict[29] + extra_md_29
md_dict[30] = md_dict[30] + extra_md_30

def clean_markdown_headers(markdown):
    lines = markdown.splitlines()
    seen_h2 = set()
    cleaned_lines = []
    
    h2_counter = 1
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## '):
            header_text = stripped[3:].strip()
            clean_title = re.sub(r'^\d+(\.\d+)*\s*', '', header_text)
            if clean_title in seen_h2:
                continue
            seen_h2.add(clean_title)
            line = f"## {h2_counter}. {clean_title}"
            h2_counter += 1
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)

blogs = {}

configs = [
    (21, "time-series-models", "Time Series Models: ARMA, ARIMA, SARIMAX & Volatility Modeling (GARCH)", "Autoregressive, moving average, seasonal differencing, and GARCH volatility models.", "Time Series Analytics", 36, ["learn-time-series", "time-series-basics"], ["forecasting-task-with-solution", "linear-regression-econ"]),
    (22, "forecasting-task-with-solution", "Industrial Demand & Sales Forecasting Case Study: End-to-End Pipeline & Solutions", "Retail demand forecasting, feature engineering, LightGBM models, and WAPE evaluation.", "Case Studies", 38, ["time-series-models"], ["linear-regression-econ", "learn-python-kaggle"]),
    (23, "linear-regression-econ", "Applied Linear Regression & Diagnostic Analytics: Gauss-Markov Invariants & OLS Mechanics", "OLS mathematical derivation, Gauss-Markov BLUE theorem, Breusch-Pagan test, and VIF metrics.", "Econometrics", 36, ["fundamentals-of-econometrics"], ["learn-python-kaggle", "algorithmic-exercises"]),
    (24, "learn-python-kaggle", "Python for Data Science & Numerical Computing: NumPy Vectorization, SciPy & Memory Optimization", "NumPy array memory strides, SIMD hardware vectorization, and memory reduction techniques.", "Python & Tooling", 34, ["linear-regression-econ"], ["algorithmic-exercises", "study-plans-leetcode"]),
    (25, "algorithmic-exercises", "Data Science Algorithmic Exercises: High-Performance Array Operations & Matrix Computations", "Pairwise Euclidean distance matrices, 2D sliding windows, and NumPy stride tricks.", "Data Science Algorithms", 36, ["learn-python-kaggle"], ["study-plans-leetcode", "algorithms-specialization"]),
    (26, "study-plans-leetcode", "LeetCode Study Plans for Data Engineers & Data Scientists: Array Tricks & Priority Queues", "Top-K frequent elements, sliding window algorithms, and Kadane's maximum subarray sum.", "Coding Practice", 34, ["algorithmic-exercises"], ["algorithms-specialization", "sql-tutorial-course"]),
    (27, "algorithms-specialization", "Coursera Algorithms Specialization for Data Science: Divide & Conquer, Graphs & DP", "Master theorem for recurrences, counting inversions, and dynamic programming for data scientists.", "Algorithms", 36, ["study-plans-leetcode"], ["sql-tutorial-course", "exploratory-data-analysis-with-python-and-pandas"]),
    (28, "sql-tutorial-course", "Advanced SQL for Data Scientists: Window Functions, CTEs & Query Plan Optimization", "SQL window functions, CTEs, aggregation pipelines, and query execution plan tuning.", "Database Analytics", 36, ["algorithms-specialization"], ["exploratory-data-analysis-with-python-and-pandas", "exploratory-data-analysis-for-machine-learning"]),
    (29, "exploratory-data-analysis-with-python-and-pandas", "Exploratory Data Analysis (EDA) with Python & Pandas: Data Profiling & Vectorized Wrangling", "Automated data profiling, missingness mechanics (MCAR/MAR/MNAR), and GroupBy pipelines.", "Exploratory Data Analysis", 36, ["sql-tutorial-course"], ["exploratory-data-analysis-for-machine-learning", "open-machine-learning-course"]),
    (30, "exploratory-data-analysis-for-machine-learning", "Exploratory Data Analysis for Machine Learning: Feature Distributions, Outliers & Collinearity", "Skewness transformations, IQR outlier detection, multicollinearity, and correlation analysis.", "Exploratory Data Analysis", 36, ["exploratory-data-analysis-with-python-and-pandas"], ["open-machine-learning-course", "machine-learning-specialization"])
]

print("=== GENERATING REAL AI & DATA SCIENTIST BATCH 3 (SLUGS 21 TO 30) ===")

for idx, slug, title, tagline, cat, rt, prereqs, rel in configs:
    raw_md = md_dict[idx].strip()
    cleaned_md = clean_markdown_headers(raw_md)
    
    headers = [line.strip() for line in cleaned_md.splitlines() if re.match(r'^#{1,6}\s+[A-Za-z0-9]', line.strip())]
    header_counts = {}
    dupes = 0
    for h in headers:
        header_counts[h] = header_counts.get(h, 0) + 1
        if header_counts[h] > 1:
            dupes += 1
            
    length = len(cleaned_md)
    assert length >= 10100, f"Blog '{slug}' is too short ({length} chars). Needs >= 10,100 chars."
    print(f"[PASS] #{idx} '{slug}': {length:,} chars. Start: {repr(cleaned_md[:60])}")
    
    blogs[slug] = {
        "slug": slug,
        "title": title,
        "tagline": tagline,
        "category": cat,
        "readTime": rt,
        "lastUpdated": "July 2026",
        "prerequisites": prereqs,
        "related": rel,
        "practiceProblems": [{"title": f"{title} Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
        "markdown": cleaned_md
    }

output_json = 'scratch/ai_batch3_heavy_real.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"\nSUCCESSFULLY CREATED ALL {len(blogs)} REAL AI & DATA SCIENTIST BATCH 3 BLOGS IN {output_json}!")
