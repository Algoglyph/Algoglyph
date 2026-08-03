import json
import re

with open('scratch/build_real_ai_batch3.py', 'r', encoding='utf-8') as f:
    text = f.read()

md_dict = {}
for i in range(21, 31):
    token = f'md_{i} = r"""'
    p1 = text.find(token)
    if p1 != -1:
        p1 += len(token)
        if i < 30:
            next_token = f'md_{i+1} = r"""'
            p2 = text.find(next_token, p1)
            p2_end = text.rfind('"""', p1, p2)
        else:
            p2_end = text.find('"""\n\n# Register', p1)
        sub = text[p1:p2_end].strip()
        md_dict[i] = sub

# Deep, genuine additions for real AI & Data Scientist Batch 3
additions_real = {
    21: r"""

---

## 7. Impulse Response Functions (IRF) & Forecast Error Variance Decomposition (FEVD)

In multivariate time series analysis using Vector Autoregression (VAR), **Impulse Response Functions (IRF)** trace the structural impact of a one-standard-deviation shock to error term $\varepsilon_{j, t}$ on future values of all system variables over $H$ forecast horizons:

$$\text{IRF}_{i, j}(h) = \frac{\partial Y_{i, t+h}}{\partial \varepsilon_{j, t}}$$

**Forecast Error Variance Decomposition (FEVD)** measures the proportion of forecast error variance of variable $Y_i$ attributable to shocks from variable $Y_j$:

$$\text{FEVD}_{i, j}(h) = \frac{\sum_{m=0}^{h-1} (\mathbf{\Theta}_m)_{i, j}^2}{\sum_{j=1}^K \sum_{m=0}^{h-1} (\mathbf{\Theta}_m)_{i, j}^2}$$

### Python VAR IRF Implementation

```python
from statsmodels.tsa.api import VAR

def fit_var_irf_fevd(data: pd.DataFrame, maxlags: int = 4):
    model = VAR(data)
    results = model.fit(maxlags=maxlags, ic='aic')
    
    # Compute Impulse Response Functions over 10 horizons
    irf = results.irf(10)
    irf.plot(orth=True)
    
    # Forecast Error Variance Decomposition
    fevd = results.fevd(10)
    print("FEVD at Horizon 10:")
    print(fevd.summary())
```
""",
    22: r"""

---

## 6. Hierarchical Time Series Forecasting (Reconciliation Methods)

In enterprise demand planning, time series exist at multiple aggregation levels (National $\to$ Regional $\to$ Store $\to$ SKU). Independent forecasts at each level violate structural additivity ($\sum \text{Store Forecasts} \ne \text{National Forecast}$).

**Optimal Reconciliation (MinT - Minimum Trace)** aligns forecasts across the hierarchy using bottom-up, top-down, or covariance-weighted linear projection matrices:

$$\tilde{\mathbf{Y}}_t = \mathbf{S} (\mathbf{S}^T \mathbf{W}^{-1} \mathbf{S})^{-1} \mathbf{S}^T \mathbf{W}^{-1} \hat{\mathbf{Y}}_t$$

where $\mathbf{S}$ is the structural summing matrix and $\mathbf{W}$ is the error covariance matrix.
""",
    23: r"""

---

## 5. Instrumental Variables (IV) & Two-Stage Least Squares (2SLS)

When strict exogeneity is violated ($\text{Cov}(X, \varepsilon) \ne 0$) due to omitted variables, measurement error, or simultaneous causality, OLS is inconsistent.

An **Instrumental Variable** $Z$ satisfies two conditions:
1. **Instrument Relevance**: $\text{Cov}(Z, X) \ne 0$.
2. **Instrument Exogeneity (Exclusion Restriction)**: $\text{Cov}(Z, \varepsilon) = 0$.

### Two-Stage Least Squares (2SLS) Execution
1. **Stage 1**: Regress $X$ on instrument $Z$ using OLS to isolate exogenous variation: $\hat{X} = \gamma_0 + \gamma_1 Z$.
2. **Stage 2**: Regress target $Y$ on fitted values $\hat{X}$: $Y = \beta_0 + \beta_1 \hat{X} + u$.

```python
from linearmodels.iv import IV2SLS

def fit_2sls_model(df: pd.DataFrame, dependent: str, exog: list, endog: list, instruments: list):
    # Fit 2SLS Instrumental Variables model
    model = IV2SLS(
        dependent=df[dependent],
        exog=df[exog] if exog else None,
        endog=df[endog],
        instruments=df[instruments]
    ).fit(cov_type='robust')
    print(model.summary)
```
""",
    24: r"""

---

## 5. Profiling Memory Usage & Cython Acceleration

When processing multi-gigabyte NumPy matrices in memory-constrained environments, dynamic allocation overhead can trigger memory swapping.

### Memory Layout Optimization via Strided Views
Use `np.lib.stride_tricks.as_strided` to create zero-copy overlapping sliding windows:

```python
def fast_sliding_window_strides(arr: np.ndarray, window_size: int):
    shape = (arr.shape[0] - window_size + 1, window_size)
    strides = (arr.strides[0], arr.strides[0])
    return np.lib.stride_tricks.as_strided(arr, shape=shape, strides=strides)
```
""",
    25: r"""

---

## 4. Accelerated K-Means Clustering Core Loop

K-Means clustering relies on computing distance vectors between data points $\mathbf{X} \in \mathbb{R}^{N \times D}$ and cluster centroids $\mathbf{C} \in \mathbb{R}^{K \times D}$.

```python
def kmeans_vectorized(X: np.ndarray, k: int, max_iters: int = 100):
    # Initialize random centroids
    indices = np.random.choice(X.shape[0], k, replace=False)
    centroids = X[indices]

    for _ in range(max_iters):
        # 1. Compute pairwise distance matrix (N, K)
        dists = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)

        # 2. Assign cluster labels
        labels = np.argmin(dists, axis=1)

        # 3. Update centroids
        new_centroids = np.array([X[labels == i].mean(axis=0) for i in range(k)])

        if np.allclose(centroids, new_centroids):
            break
        centroids = new_centroids

    return centroids, labels
```
""",
    26: r"""

---

## 3. SQL & Pandas Window Function Conversions

Data Engineering interviews evaluate fluently translating complex SQL analytical queries into Pandas data wrangling pipelines:

### SQL Query
```sql
SELECT 
    department_id,
    employee_id,
    salary,
    DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rk
FROM employees;
```

### Equivalent Pandas Vectorized Pipeline
```python
def rank_salaries_pandas(df: pd.DataFrame) -> pd.DataFrame:
    data = df.copy()
    data['rk'] = data.groupby('department_id')['salary'].rank(
        method='dense', 
        ascending=False
    ).astype(int)
    return data.sort_values(['department_id', 'rk'])
```
""",
    27: r"""

---

## 3. Dynamic Programming Strategy for Sequence Alignment

The **Needleman-Wunsch Algorithm** uses dynamic programming to perform global sequence alignment between two genetic sequences or string tokens:

$$\text{DP}[i][j] = \max \begin{cases} \text{DP}[i-1][j-1] + \text{score}(S_1[i], S_2[j]) & \text{Match / Mismatch} \\ \text{DP}[i-1][j] + \text{gap\_penalty} & \text{Deletion} \\ \text{DP}[i][j-1] + \text{gap\_penalty} & \text{Insertion} \end{cases}$$
""",
    28: r"""

---

## 5. SQL Window Frames & Unbounded Preceding Aggregations

Window frames fine-tune analytical computations over sliding row subsets (`ROWS BETWEEN 3 PRECEDING AND CURRENT ROW`).

### Running Cumulative Maximum & Moving Variance
```sql
SELECT 
    date,
    product_id,
    units_sold,
    MAX(units_sold) OVER (
        PARTITION BY product_id 
        ORDER BY date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as cumulative_max_sales,
    VARIANCE(units_sold) OVER (
        PARTITION BY product_id 
        ORDER BY date 
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) as rolling_variance_30d
FROM daily_product_metrics;
```
""",
    29: r"""

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
""",
    30: r"""

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
}

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

print("=== GENERATING 100% REAL AI & DATA SCIENTIST BATCH 3 ===")

for idx, slug, title, tagline, cat, rt, prereqs, rel in configs:
    raw_md = md_dict[idx].strip()
    extra = additions_real.get(idx, "").strip()
    combined = raw_md + "\n\n" + extra
    cleaned_md = clean_markdown_headers(combined)
    
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
