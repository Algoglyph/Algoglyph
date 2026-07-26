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

# Rich additions for each real AI & Data Scientist blog
additions = {
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

---

## 8. Exponential Smoothing State Space Models (ETS Algorithm)

Exponential smoothing weights past observations with exponentially decreasing weights:

$$\hat{Y}_{t+1\mid t} = \alpha Y_t + (1 - \alpha) \hat{Y}_{t\mid t-1}, \quad \alpha \in (0, 1)$$

### Holt-Winters Seasonal Exponential Smoothing
For trend component $b_t$ and seasonal component $s_t$ with period $m$:

$$\text{Level}: \quad l_t = \alpha (Y_t - s_{t-m}) + (1 - \alpha)(l_{t-1} + b_{t-1})$$

$$\text{Trend}: \quad b_t = \beta (l_t - l_{t-1}) + (1 - \beta) b_{t-1}$$

$$\text{Seasonal}: \quad s_t = \gamma (Y_t - l_{t-1} - b_{t-1}) + (1 - \gamma) s_{t-m}$$

---

## 9. Recurrent Neural Networks (LSTM & GRU) vs ARIMA

Deep learning models like **Long Short-Term Memory (LSTM)** networks capture complex non-linear sequence dynamics via memory cell gates:

$$\mathbf{f}_t = \sigma(\mathbf{W}_f [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_f), \quad \mathbf{i}_t = \sigma(\mathbf{W}_i [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_i)$$

LSTMs excel when cross-series features $K \gg 100$ exist and non-linear interactions dominate classical linear autocorrelation.


---

## 10. Financial Risk & Value at Risk (VaR) Calculation using GARCH

In risk management, **Value at Risk (VaR)** estimates the maximum potential portfolio loss over time horizon $h$ at confidence level $1 - \alpha$:

$$\text{VaR}_{\alpha} = -\mu_t + \sigma_t \cdot \Phi^{-1}(1 - \alpha)$$

Using GARCH conditional volatility estimates $\sigma_t$, dynamic VaR updates daily to prevent extreme market drawdown risks.
""",
    22: r"""

---

## 6. Hierarchical Time Series Forecasting (Reconciliation Methods)

In enterprise demand planning, time series exist at multiple aggregation levels (National $\to$ Regional $\to$ Store $\to$ SKU). Independent forecasts at each level violate structural additivity ($\sum \text{Store Forecasts} \ne \text{National Forecast}$).

**Optimal Reconciliation (MinT - Minimum Trace)** aligns forecasts across the hierarchy using bottom-up, top-down, or covariance-weighted linear projection matrices:

$$\tilde{\mathbf{Y}}_t = \mathbf{S} (\mathbf{S}^T \mathbf{W}^{-1} \mathbf{S})^{-1} \mathbf{S}^T \mathbf{W}^{-1} \hat{\mathbf{Y}}_t$$

where $\mathbf{S}$ is the structural summing matrix and $\mathbf{W}$ is the error covariance matrix.

---

## 7. Intermittent Demand Forecasting via Croston's Method

For slow-moving inventory items with sporadic zero-demand days, Croston's method decomposes the series into two independent components:
1. Demand Size $q_k$ when demand occurs.
2. Inter-arrival time $p_k$ between demand occurrences.

$$\hat{q}_k = \alpha q_k + (1 - \alpha) \hat{q}_{k-1}, \quad \hat{p}_k = \alpha p_k + (1 - \alpha) \hat{p}_{k-1}$$

$$\text{Forecast Rate} = \frac{\hat{q}_k}{\hat{p}_k}$$

---

## 8. Temporal Fusion Transformers (TFT) Architecture

The **Temporal Fusion Transformer** (Google Research, 2021) is a specialized deep learning architecture for multi-horizon forecasting:
- **Variable Selection Networks**: Selects relevant features at each time step.
- **Gated Residual Networks (GRN)**: Applies adaptive non-linear processing.
- **Multi-Head Attention**: Learns long-range temporal dependencies.


---

## 9. Feature Importance & SHAP Interpretability for Demand Forecasting

Tree-based forecasting models (LightGBM) require model interpretability to justify stock allocation decisions to business stakeholders. **SHAP (SHapley Additive exPlanations)** calculates Shapley values from cooperative game theory:

$$\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$$
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

---

## 6. Panel Data Fixed Effects vs Random Effects & Hausman Test

Panel data tracks $N$ entities over $T$ time periods:

$$Y_{it} = \alpha_i + \mathbf{X}_{it} \boldsymbol{\beta} + \varepsilon_{it}$$

- **Fixed Effects (FE)**: Allows entity-specific intercepts $\alpha_i$ to correlate with regressors $\mathbf{X}_{it}$. Uses Within Transformation $(Y_{it} - \bar{Y}_i)$.
- **Random Effects (RE)**: Assumes $\alpha_i$ is uncorrelated with $\mathbf{X}_{it}$. Uses Feasible Generalized Least Squares (FGLS).
- **Hausman Test**: Evaluates null hypothesis $H_0$: Random Effects is consistent and efficient. If $p < 0.05$, reject $H_0$ and use Fixed Effects.


---

## 7. Generalized Method of Moments (GMM) Estimation

When the error variance structure is unknown, **Generalized Method of Moments (GMM)** optimizes population moment conditions $\mathbb{E}[g(Y_i, \mathbf{X}_i, \boldsymbol{\theta})] = \mathbf{0}$, providing a flexible estimation framework encompassing OLS, 2SLS, and Maximum Likelihood.
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

---

## 6. Numba JIT Compilation (`@jit(nopython=True)`)

Numba compiles Python numerical code into machine code using LLVM, achieving C-like performance:

```python
from numba import jit

@jit(nopython=True, fastmath=True)
def numba_monte_carlo_pi(nsamples: int) -> float:
    acc = 0
    for i in range(nsamples):
        x = np.random.random()
        y = np.random.random()
        if (x**2 + y**2) < 1.0:
            acc += 1
    return 4.0 * acc / nsamples
```

---

## 7. SciPy Optimization & Convex Loss Functions

SciPy (`scipy.optimize.minimize`) supplies solvers (BFGS, L-BFGS-B, Nelder-Mead) for non-linear optimization:

```python
from scipy.optimize import minimize

def huber_loss(beta, X, y, delta=1.0):
    errors = y - X @ beta
    is_small = np.abs(errors) <= delta
    squared_loss = 0.5 * errors**2
    linear_loss = delta * (np.abs(errors) - 0.5 * delta)
    return np.sum(np.where(is_small, squared_loss, linear_loss))
```


---

## 8. SciPy Sparse Linear Solvers & Compressed Sensing

SciPy (`scipy.sparse.linalg`) supplies solvers (CG, GMRES, Conjugate Gradient) for high-dimensional sparse matrix systems $A x = b$:

```python
from scipy.sparse.linalg import cg

def solve_sparse_system(A_csr, b_vec):
    x_sol, info = cg(A_csr, b_vec)
    if info == 0:
        print("Conjugate Gradient Converged Successfully!")
    return x_sol
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

---

## 5. Vectorized Sparse Matrix Computations (`scipy.sparse`)

When data matrices contain mostly zeros (e.g. TF-IDF feature matrices or user-item interaction grids), standard dense arrays waste gigabytes of RAM.

Compressed Sparse Row (`csr_matrix`) stores non-zero values in 3 compact arrays: `data`, `indices`, and `indptr`.

```python
from scipy.sparse import csr_matrix

def compute_sparse_cosine_similarity(X_sparse: csr_matrix) -> csr_matrix:
    # Compute dot products of normalized sparse vectors
    from sklearn.preprocessing import normalize
    X_norm = normalize(X_sparse, axis=1)
    return X_norm @ X_norm.T
```

---

## 6. Singular Value Decomposition (SVD) & Low-Rank Matrix Approximation

Truncated SVD decomposes matrix $\mathbf{A} \in \mathbb{R}^{M \times N}$ into $\mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^T$:

$$\mathbf{A}_k = \sum_{i=1}^k \sigma_i \mathbf{u}_i \mathbf{v}_i^T$$

This provides the optimal rank-$k$ approximation minimizing Frobenius norm error $\|\mathbf{A} - \mathbf{A}_k\|_F$, forming the core algorithm behind Latent Semantic Analysis (LSA) and Collaborative Filtering.


---

## 7. Vectorized TF-IDF Matrix Calculation

Given document term frequency matrix $\mathbf{TF} \in \mathbb{R}^{D \times V}$, **Inverse Document Frequency (IDF)** scales rare word importance:

$$\text{IDF}(t) = \ln\left( \frac{1 + N}{1 + \text{DF}(t)} \right) + 1$$

$$\mathbf{TF\text{-}IDF} = \mathbf{TF} \times \text{diag}(\mathbf{IDF})$$
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

---

## 4. Advanced Window Functions (NTH_VALUE, NTILE, CUME_DIST)

- `NTILE(n)`: Divides ordered partition rows into $n$ equal-sized bucket buckets (e.g. quartiles $n=4$ or percentiles $n=100$).
- `CUME_DIST()`: Calculates relative cumulative distribution fraction $\frac{\text{row\_rank}}{\text{total\_rows}}$.
- `FIRST_VALUE(col)` / `LAST_VALUE(col)`: Fetches first or last value within window frame.

---

## 5. Invertible Hash Map Indexing (Subarray Sum Equals K)

Find the total number of continuous subarrays whose sum equals target $K$ in optimal $O(N)$ time:

```python
def subarray_sum_equals_k(nums: list, k: int) -> int:
    prefix_counts = {0: 1}
    curr_sum = 0
    count = 0

    for num in nums:
        curr_sum += num
        if (curr_sum - k) in prefix_counts:
            count += prefix_counts[curr_sum - k]
        prefix_counts[curr_sum] = prefix_counts.get(curr_sum, 0) + 1

    return count
```


---

## 6. Priority Queue Merge $K$ Sorted Streams (Log Aggregation)

In data engineering pipelines, merging $K$ pre-sorted transaction log files executes in $O(N \log K)$ time using a Min-Heap of size $K$:

```python
import heapq

def merge_k_sorted_streams(streams: list) -> list:
    min_heap = []
    for i, stream in enumerate(streams):
        if stream:
            heapq.heappush(min_heap, (stream[0], i, 0))

    result = []
    while min_heap:
        val, stream_idx, element_idx = heapq.heappop(min_heap)
        result.append(val)

        if element_idx + 1 < len(streams[stream_idx]):
            next_val = streams[stream_idx][element_idx + 1]
            heapq.heappush(min_heap, (next_val, stream_idx, element_idx + 1))

    return result
```
""",
    27: r"""

---

## 3. Dynamic Programming Strategy for Sequence Alignment

The **Needleman-Wunsch Algorithm** uses dynamic programming to perform global sequence alignment between two genetic sequences or string tokens:

$$\text{DP}[i][j] = \max \begin{cases} \text{DP}[i-1][j-1] + \text{score}(S_1[i], S_2[j]) & \text{Match / Mismatch} \\ \text{DP}[i-1][j] + \text{gap\_penalty} & \text{Deletion} \\ \text{DP}[i][j-1] + \text{gap\_penalty} & \text{Insertion} \end{cases}$$

---

## 4. Graph Analytics: Minimum Spanning Trees & Spatial Clustering

**Kruskal's Algorithm** with Disjoint Set Union (DSU) builds Minimum Spanning Trees in $O(E \log V)$ time. In spatial clustering (Single-Linkage Hierarchical Clustering), stopping Kruskal's algorithm when $K$ connected components remain creates optimal spatial clusters.

---

## 5. Topological Sorting for Pipeline Dependency DAGs

In data engineering DAG orchestrators (such as Apache Airflow or Prefect), task execution order is determined using **Topological Sorting**:
- Process nodes in order of zero in-degree using Kahn's algorithm (BFS FIFO queue).
- If remaining nodes have in-degree $>0$, a cyclic dependency error exists in the execution graph.


---

## 6. Shortest Path Algorithms in Logistics Analytics

Given road graph $G = (V, E)$ with non-negative travel times, **Dijkstra's Algorithm** computes shortest delivery routes in $O((V + E) \log V)$ time using binary min-heaps.
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

---

## 6. Recursive Common Table Expressions (Recursive CTEs)

Recursive CTEs solve hierarchical tree traversal queries (such as reporting hierarchies, category taxonomies, or bill-of-materials):

```sql
WITH RECURSIVE CategoryHierarchy AS (
    -- Anchor member: Select root categories
    SELECT category_id, category_name, parent_category_id, 1 AS depth
    FROM categories
    WHERE parent_category_id IS NULL
    
    UNION ALL
    
    -- Recursive member: Join child categories to parent CTE
    SELECT c.category_id, c.category_name, c.parent_category_id, ch.depth + 1
    FROM categories c
    INNER JOIN CategoryHierarchy ch ON c.parent_category_id = ch.category_id
)
SELECT * FROM CategoryHierarchy ORDER BY depth, category_id;
```

---

## 7. Data Warehousing Schemas: Star Schema vs Snowflake Schema

- **Star Schema**: Denormalized dimensions connected directly to central Fact table. Maximizes query performance and simplifies analytical SQL joins.
- **Snowflake Schema**: Normalized dimensions with nested sub-dimension tables. Saves disk storage space at the cost of requiring more complex SQL joins.


---

## 8. Index Types & Query Execution Performance

- **B-Tree Index**: Optimal for range queries ($>=$ and $<=$) and equality lookups ($O(\log N)$).
- **Hash Index**: Optimal for exact equality lookups ($O(1)$ expected).
- **GIN (Generalized Inverted Index)**: Used in PostgreSQL for JSONB and full-text search indexing.
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

---

## 6. Time Series Resampling & MultiIndex Unstacking

```python
def resample_and_pivot_sales(df: pd.DataFrame) -> pd.DataFrame:
    # Resample daily transaction records to weekly sums
    data = df.copy()
    data['date'] = pd.to_datetime(data['date'])
    weekly = data.set_index('date').groupby('store_id')['sales'].resample('W').sum().unstack('store_id')
    return weekly
```


---

## 7. Large CSV File Processing via Chunking

When reading a 50GB CSV file exceeding RAM capacity, process data in chunks of 100,000 rows:

```python
def process_large_csv(file_path: str, chunk_size: int = 100000):
    total_sales = 0
    for chunk in pd.read_csv(file_path, chunksize=chunk_size):
        total_sales += chunk['amount'].sum()
    return total_sales
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

---

## 6. Class Imbalance Analytics & Resampling Techniques

When target classes are highly imbalanced (e.g. fraud detection with $< 1\%$ positive cases):
- **SMOTE (Synthetic Minority Over-sampling Technique)**: Generates synthetic minority instances along line segments connecting $k$-nearest neighbors.
- **Evaluation Metric Selection**: Abandon Accuracy. Evaluate models using Precision-Recall AUC (PR-AUC) or F1-Score.


---

## 7. Automated Data Validation with Pandera Schemas

Pandera defines runtime statistical schema validation contracts over Pandas DataFrames:

```python
import pandera as pa

schema = pa.DataFrameSchema({
    "user_id": pa.Column(int, checks=pa.Check.gt(0)),
    "age": pa.Column(int, checks=pa.Check.in_range(18, 120)),
    "income": pa.Column(float, checks=pa.Check.greater_than_or_equal_to(0.0), nullable=True)
})
```
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

print("=== GENERATING 100% HEAVY REAL AI & DATA SCIENTIST BATCH 3 ===")

for idx, slug, title, tagline, cat, rt, prereqs, rel in configs:
    raw_md = md_dict[idx].strip()
    extra = additions.get(idx, "").strip()
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
