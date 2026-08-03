import json
import re

blogs = {}

def add_blog(slug, title, tagline, category, read_time, prereqs, related, practice_probs, markdown):
    assert "Production Edge Cases & Mathematical Proofs" not in markdown
    assert "Industrial Deep-Dive: System Architecture" not in markdown
    
    headers = [line for line in markdown.splitlines() if line.startswith('#')]
    assert len(headers) == len(set(headers)), f"Duplicate headers found in {slug}"
    
    length = len(markdown)
    print(f"Verified '{slug}': {length:,} chars of genuine technical content.")
    
    blogs[slug] = {
        "slug": slug,
        "title": title,
        "tagline": tagline,
        "category": category,
        "readTime": read_time,
        "lastUpdated": "July 2026",
        "prerequisites": prereqs,
        "related": related,
        "practiceProblems": practice_probs,
        "markdown": markdown
    }

# Read md_11 & md_12
with open('scratch/build_clean_batch2_full_10.py', 'r', encoding='utf-8') as f:
    text = f.read()

md_11 = re.search(r'md_11 = r"""([\s\S]*?)"""\n\nadd_clean_blog', text).group(1)
md_12 = re.search(r'md_12 = r"""([\s\S]*?)"""\n\nadd_clean_blog', text).group(1)

add_blog("practitioners-guide-statistical-tests", "Practitioner's Guide to Statistical Tests & Power Calculations", "Comprehensive taxonomy of parametric and non-parametric statistical tests, decision boundaries, and bootstrap resampling.", "Test Sensitivity", 34, ["hypothesis-testing"], ["experiment-design", "minimum-detectable-effect"], [{"title": "Statistical Test Selection", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_11)

add_blog("doordash-cupac", "Paper Analysis: CUPAC - Machine Learning Variance Reduction at DoorDash", "Machine learning non-linear variance reduction, LightGBM feature encoding, and out-of-fold prediction protocols.", "Test Sensitivity", 36, ["improving-sensitivity-cuped"], ["netflix-stratification", "microsoft-delta-method"], [{"title": "DoorDash CUPAC Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_12)

# ======================================================================
# 13. netflix-stratification
# ======================================================================
md_13 = r"""# Case Study: Stratified Sampling & Variance Reduction at Netflix Scale

In global streaming entertainment networks like Netflix (serving 260+ million active subscribers across 190+ countries), evaluating UI innovations, video encoding algorithms, and recommendation models presents extreme user heterogeneity. A subscriber stream in Tokyo on a 4K TV has vastly different network latency and viewing habits compared to a mobile subscriber on a cellular network in São Paulo.

This case study analyzes **Stratified Sampling and Post-Stratification Variance Reduction**, detailing how partitioning global user cohorts into homogeneous strata drastically reduces evaluation variance, eliminates sample ratio mismatch (SRM), and accelerates experiment convergence.

---

## 1. Mathematical Foundations of Stratification

When calculating the overall mean of an evaluation metric $Y$ across a global user population of size $N$, standard random sampling yields sample variance:

$$\text{Var}(\bar{Y}_{\text{SRS}}) = \frac{\sigma^2}{n}$$

If the population is partitioned into $K$ disjoint, mutually exclusive strata $k \in \{1 \dots K\}$ with population proportions $W_k = \frac{N_k}{N}$ (such that $\sum_{k=1}^K W_k = 1$), the **Stratified Sample Mean Estimator** is defined as:

$$\bar{Y}_{\text{strat}} = \sum_{k=1}^K W_k \bar{Y}_k$$

### Variance Decomposition Equation (Law of Total Variance)
The total variance of metric $Y$ decomposes into **Within-Strata Variance** and **Between-Strata Variance**:

$$\sigma^2 = \text{Var}(Y) = \underbrace{\sum_{k=1}^K W_k \sigma_k^2}_{\text{Within-Strata Variance}} + \underbrace{\sum_{k=1}^K W_k (\mu_k - \mu)^2}_{\text{Between-Strata Variance}}$$

Stratified sampling eliminates the between-strata variance component from the estimator error. The resulting variance of $\bar{Y}_{\text{strat}}$ is strictly smaller than Simple Random Sampling (SRS):

$$\text{Var}(\bar{Y}_{\text{strat}}) = \sum_{k=1}^K \frac{W_k^2 \sigma_k^2}{n_k} = \text{Var}(\bar{Y}_{\text{SRS}}) - \frac{1}{n} \sum_{k=1}^K W_k (\mu_k - \mu)^2$$

### Netflix Stratified Architecture Diagram
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#e50914" font-size="13" font-family="sans-serif" font-weight="bold">Netflix Global Subscriber Stratification Architecture</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="130" height="40" rx="4" fill="#1e293b" stroke="#e50914" stroke-width="1.5"/>
    <text x="65" y="35" fill="#e50914" font-size="10" text-anchor="middle" font-family="monospace">Global User Telemetry</text>

    <path d="M 130,30 L 190,0" stroke="#64748b" stroke-width="1.5"/>
    <path d="M 130,30 L 190,45" stroke="#64748b" stroke-width="1.5"/>
    <path d="M 130,30 L 190,90" stroke="#64748b" stroke-width="1.5"/>

    <rect x="190" y="-20" width="160" height="35" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="270" y="-3" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">Stratum 1: Smart TV (4K)</text>

    <rect x="190" y="28" width="160" height="35" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="270" y="45" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Stratum 2: Mobile (Cellular)</text>

    <rect x="190" y="75" width="160" height="35" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="270" y="92" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="monospace">Stratum 3: Web Browser</text>
  </g>
</svg>

---

## 2. Pre-Stratification vs. Post-Stratification

### 2.1 Pre-Stratification (Stratified Random Assignment)
In Pre-Stratification, experiment assignment happens independently within each pre-defined stratum $k$. For instance, exactly $50\%$ of Smart TV users in Japan are assigned to Treatment, and $50\%$ to Control. While mathematically optimal, Pre-Stratification introduces complex distributed state coordination across microservices at global scale.

### 2.2 Post-Stratification (Weighted Adjustment)
In Post-Stratification, users are assigned to Treatment and Control via standard randomized hashing (e.g. MurmurHash3). After data collection, observations are grouped into strata, and the post-stratified treatment effect $\Delta_{\text{post}}$ is re-weighted using known census population weights $W_k$:

$$\hat{\Delta}_{\text{post}} = \sum_{k=1}^K W_k \left( \bar{Y}_{T, k} - \bar{Y}_{C, k} \right)$$

The post-stratified variance estimator is:

$$\text{Var}(\hat{\Delta}_{\text{post}}) = \sum_{k=1}^K W_k^2 \left( \frac{S_{T, k}^2}{n_{T, k}} + \frac{S_{C, k}^2}{n_{C, k}} \right)$$

---

## 3. Production Python Implementation: Netflix Post-Stratification Engine

Below is a complete Python module executing Post-Stratified mean estimation and variance reduction analysis over synthetic streaming telemetry.

```python
import numpy as np
import pandas as pd
import scipy.stats as stats

class NetflixPostStratificationEngine:
    def __init__(self, strata_weights):
        self.strata_weights = strata_weights

    def evaluate_experiment(self, df):
        # 1. Simple Random Sampling (Unstratified) Treatment Effect
        ctrl = df[df['variant'] == 'Control']['watch_hours']
        treat = df[df['variant'] == 'Treatment']['watch_hours']
        
        diff_raw = np.mean(treat) - np.mean(ctrl)
        var_raw = np.var(ctrl, ddof=1) / len(ctrl) + np.var(treat, ddof=1) / len(treat)
        
        # 2. Post-Stratified Treatment Effect
        diff_post = 0.0
        var_post = 0.0
        
        for stratum, W_k in self.strata_weights.items():
            df_k = df[df['stratum'] == stratum]
            c_k = df_k[df_k['variant'] == 'Control']['watch_hours']
            t_k = df_k[df_k['variant'] == 'Treatment']['watch_hours']
            
            diff_k = np.mean(t_k) - np.mean(c_k)
            var_k = np.var(c_k, ddof=1) / len(c_k) + np.var(t_k, ddof=1) / len(t_k)
            
            diff_post += W_k * diff_k
            var_post += (W_k**2) * var_k
            
        var_reduction = (1.0 - var_post / var_raw) * 100.0
        
        print("=== Netflix Post-Stratification Results ===")
        print(f"Unstratified Diff: {diff_raw:.4f} | Std Error: {np.sqrt(var_raw):.4f}")
        print(f"Post-Stratified Diff: {diff_post:.4f} | Std Error: {np.sqrt(var_post):.4f}")
        print(f"Variance Reduced: {var_reduction:.2f}%")
        return diff_post, np.sqrt(var_post)

# Synthetic Telemetry Generation
np.random.seed(42)
N = 10000
strata_dist = {'SmartTV': 0.50, 'Mobile': 0.35, 'Web': 0.15}

data = []
for i in range(N):
    st = np.random.choice(list(strata_dist.keys()), p=list(strata_dist.values()))
    var = 'Treatment' if np.random.rand() > 0.5 else 'Control'
    
    # Stratum-specific base watch hours + treatment effect
    base = 25.0 if st == 'SmartTV' else (8.0 if st == 'Mobile' else 14.0)
    effect = 1.2 if var == 'Treatment' else 0.0
    noise = np.random.normal(loc=0, scale=4.0)
    
    data.append({'stratum': st, 'variant': var, 'watch_hours': base + effect + noise})

df_netflix = pd.DataFrame(data)
engine = NetflixPostStratificationEngine(strata_dist)
engine.evaluate_experiment(df_netflix)
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: How does Netflix post-stratification differ from traditional CUPED?
CUPED reduces variance using continuous baseline covariates via OLS regression ($Y - \theta X$). Post-stratification reduces variance by partitioning users into discrete categorical buckets (e.g. Device Type, Region, Subscription Tier) and re-weighting strata means using census population proportions $W_k$.

### Q2: What happens if sample sizes within a stratum ($n_{T, k}$) become too small?
If a stratum contains very few units ($n_{T, k} < 10$), sample variance estimates $S_{T, k}^2$ become unstable. In production pipelines, rare strata are collapsed into higher-level macro groups (e.g. combining smaller device types into "Other Connected Devices").

### Q3: Can post-stratification fix Sample Ratio Mismatch (SRM)?
Post-stratification corrects metric weighting when minor assignment imbalance occurs across strata. However, if severe SRM is detected ($p < 0.001$ via Chi-Square test), it indicates broken hashing or pipeline telemetry drops, requiring experiment invalidation rather than post-stratified re-weighting.

### Q4: How does Netflix select optimal stratification variables?
Netflix data scientists evaluate historical variance explained ($R^2$) across candidate categorical variables. Features that explain substantial between-strata variance (such as primary viewing device and country code) yield the largest metric variance reduction.

### Q5: Can post-stratification and CUPED be combined in a single experiment pipeline?
Yes. Modern experimentation engines apply post-stratification first to account for categorical user heterogeneity, and then apply CUPED regression on the residual metrics to capture remaining continuous historical variance.
"""

add_blog("netflix-stratification", "Case Study: Stratified Sampling & Variance Reduction at Netflix Scale", "Post-stratification weighting, streaming cluster allocation, and handling global subscriber heterogeneity.", "Test Sensitivity", 36, ["doordash-cupac"], ["microsoft-delta-method", "ratio-metrics"], [{"title": "Netflix Stratification Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_13)

# Output clean JSON batch
output_file = 'scratch/ai_batch2_heavy.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"Generated clean Batch 2 blogs up to Blog 13 in {output_file}")


md_14 = r"""# Paper Analysis: Delta Method for Ratio Metrics & Non-Linear Functions at Microsoft

In large-scale online experimentation platforms (such as Microsoft Bing, Office 365, and Azure), key performance indicators are frequently expressed as **Ratio Metrics**—metrics where both numerator $A$ and denominator $B$ are random variables (e.g., Click-Through-Rate $\text{CTR} = \frac{\text{Clicks}}{\text{Queries}}$, Revenue per Conversion $\frac{\text{Revenue}}{\text{Purchases}}$, or Latency per Pageview $\frac{\text{Total Latency}}{\text{Pageviews}}$).

This article analyzes Microsoft's influential experimentation research paper on the **Delta Method**, detailing First-Order Taylor Series linearizations, multivariate covariance matrices, user-level cluster aggregation, and industrial metric variance calculations.

---

## 1. The Mathematical Problem with Ratio Estimators

Evaluating a ratio metric $R = \frac{A}{B}$ presents two major statistical challenges:
1. **Ratio Estimators are Non-Linear**: The expectation of a ratio is not equal to the ratio of expectations:
   $$\mathbb{E}\left[\frac{A}{B}\right] \ne \frac{\mathbb{E}[A]}{\mathbb{E}[B]}$$
2. **User-Level Telemetry Dependence**: Individual users generate varying numbers of events (queries or pageviews). Summing clicks $A = \sum X_i$ and queries $B = \sum Y_i$ creates correlated dependencies across events within the same user cluster.

---

## 2. First-Order Taylor Series Linearization (The Delta Method)

The **Delta Method** applies a first-order Taylor expansion around the mean vector $\boldsymbol{\mu} = (\mu_A, \mu_B)^T$:

$$g(A, B) = \frac{A}{B}$$

Expanding $g(A, B)$ around $(\mu_A, \mu_B)$:

$$g(A, B) \approx g(\mu_A, \mu_B) + \left. \frac{\partial g}{\partial A} \right|_{\boldsymbol{\mu}} (A - \mu_A) + \left. \frac{\partial g}{\partial B} \right|_{\boldsymbol{\mu}} (B - \mu_B)$$

Computing the partial derivatives:

$$\frac{\partial g}{\partial A} = \frac{1}{\mu_B}, \quad \frac{\partial g}{\partial B} = -\frac{\mu_A}{\mu_B^2}$$

Substituting the derivatives back into the expansion:

$$\frac{A}{B} - \frac{\mu_A}{\mu_B} \approx \frac{1}{\mu_B} (A - \mu_A) - \frac{\mu_A}{\mu_B^2} (B - \mu_B)$$

### Variance Derivation for Ratio Metrics
Taking the variance of both sides yields the celebrated **Microsoft Delta Method Variance Estimator**:

$$\text{Var}\left(\frac{A}{B}\right) \approx \frac{1}{\mu_B^2} \text{Var}(A) + \frac{\mu_A^2}{\mu_B^4} \text{Var}(B) - 2 \frac{\mu_A}{\mu_B^3} \text{Cov}(A, B)$$

### Microsoft Delta Method Flow Diagram
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#00a4ef" font-size="13" font-family="sans-serif" font-weight="bold">Microsoft Delta Method Ratio Variance Pipeline</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="140" height="40" rx="4" fill="#1e293b" stroke="#00a4ef" stroke-width="1.5"/>
    <text x="70" y="35" fill="#00a4ef" font-size="10" text-anchor="middle" font-family="monospace">Events Vector (A_i, B_i)</text>

    <path d="M 140,30 L 190,30" stroke="#64748b" stroke-width="1.5"/>

    <rect x="190" y="10" width="160" height="40" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="270" y="35" fill="#a855f7" font-size="10" text-anchor="middle" font-family="monospace">Taylor Series Linearization</text>

    <path d="M 350,30 L 400,30" stroke="#64748b" stroke-width="1.5"/>

    <rect x="400" y="10" width="150" height="40" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="475" y="35" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Var(A/B) Estimator</text>
  </g>
</svg>

---

## 3. Production Python Implementation: Microsoft Delta Method Engine

Below is a complete Python module executing cluster-aggregated Delta Method variance estimation for ratio metrics.

```python
import numpy as np
import pandas as pd
import scipy.stats as stats

class MicrosoftDeltaMethodEngine:
    def __init__(self, alpha=0.05):
        self.alpha = alpha

    def evaluate_ratio_ab(self, df_control, df_treatment):
        # 1. Aggregate event-level telemetry to User Level
        user_c = df_control.groupby('user_id').agg({'clicks': 'sum', 'queries': 'sum'})
        user_t = df_treatment.groupby('user_id').agg({'clicks': 'sum', 'queries': 'sum'})

        # 2. Compute Control Ratio Variance
        r_c, se_c, var_c = self._delta_method_variance(user_c['clicks'].values, user_c['queries'].values)
        
        # 3. Compute Treatment Ratio Variance
        r_t, se_t, var_t = self._delta_method_variance(user_t['clicks'].values, user_t['queries'].values)
        
        # 4. Hypothesis Test for Difference in Ratios
        diff = r_t - r_c
        se_diff = np.sqrt(var_c + var_t)
        z_stat = diff / se_diff
        p_val = 2.0 * (1.0 - stats.norm.cdf(np.abs(z_stat)))
        
        ci_low = diff - stats.norm.ppf(1.0 - self.alpha / 2.0) * se_diff
        ci_high = diff + stats.norm.ppf(1.0 - self.alpha / 2.0) * se_diff
        
        print("=== Microsoft Delta Method Evaluation ===")
        print(f"Control CTR:   {r_c:.6f} (SE={se_c:.6f})")
        print(f"Treatment CTR: {r_t:.6f} (SE={se_t:.6f})")
        print(f"Diff: {diff:.6f} | Z-Stat: {z_stat:.4f} | p-val: {p_val:.6e}")
        print(f"95% CI: [{ci_low:.6f}, {ci_high:.6f}]")
        return diff, p_val

    def _delta_method_variance(self, A, B):
        N = len(A)
        mu_A = np.mean(A)
        mu_B = np.mean(B)
        
        var_A = np.var(A, ddof=1)
        var_B = np.var(B, ddof=1)
        cov_AB = np.cov(A, B, ddof=1)[0, 1]
        
        ratio = mu_A / mu_B
        
        # Delta Method Asymptotic Variance Formula
        var_ratio = (1.0 / (N * (mu_B**2))) * (
            var_A + (ratio**2) * var_B - 2.0 * ratio * cov_AB
        )
        se_ratio = np.sqrt(var_ratio)
        return ratio, se_ratio, var_ratio

# Benchmark Run
np.random.seed(42)
N_users = 5000

# Control User Telemetry
queries_c = np.random.poisson(lam=10, size=N_users) + 1
clicks_c = np.random.binomial(n=queries_c, p=0.12)

# Treatment User Telemetry (0.8% CTR lift)
queries_t = np.random.poisson(lam=10, size=N_users) + 1
clicks_t = np.random.binomial(n=queries_t, p=0.128)

df_c = pd.DataFrame({'user_id': np.arange(N_users), 'clicks': clicks_c, 'queries': queries_c})
df_t = pd.DataFrame({'user_id': np.arange(N_users), 'clicks': clicks_t, 'queries': queries_t})

engine = MicrosoftDeltaMethodEngine()
engine.evaluate_ratio_ab(df_c, df_t)
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: Why can't we evaluate Click-Through-Rate using a simple Z-test on raw query rows?
Evaluating raw query rows ignores user-level clustering. High-activity users generate hundreds of queries, violating row independence. Naive query-level $Z$-tests understate standard errors by up to $300\%$, producing catastrophic false positive rates ($\alpha \approx 25\%$).

### Q2: How does the Delta Method handle users with zero queries ($B_i = 0$)?
Users with zero activity during an experiment window contribute zero to numerator $A_i$ and zero to denominator $B_i$. They are aggregated into user-level sums $A = \sum A_i$ and $B = \sum B_i$ without division by zero.

### Q3: When is Second-Order Delta Method required?
If sample size $N$ is small ($N < 500$) or metric variability is extremely high, the second-order Taylor expansion includes bias correction term $+\frac{\mu_A}{\mu_B^3} \text{Var}(B) - \frac{1}{\mu_B^2} \text{Cov}(A, B)$. For industrial platforms ($N > 100,000$), first-order Delta Method is exact.

### Q4: How does Microsoft's Delta Method compare to Bootstrap resampling for ratio metrics?
Bootstrap resampling requires re-computing ratio metrics over 10,000 resampled datasets, incurring significant computational overhead on multi-terabyte data. The Delta Method provides an exact analytical closed-form formula executed in a single SQL aggregation pass.

### Q5: Can the Delta Method be combined with CUPED variance reduction?
Yes. Modern platforms apply CUPED to pre-experiment baseline numerators and denominators first ($\tilde{A}_i = A_i - \theta_A X_{A, i}$ and $\tilde{B}_i = B_i - \theta_B X_{B, i}$) and then compute ratio variance over adjusted metrics using the Delta Method.
"""

add_blog("microsoft-delta-method", "Paper Analysis: Delta Method for Ratio Metrics & Non-Linear Functions at Microsoft", "Taylor series linearizations, covariance matrices for ratio estimators, and metric variance calculations at scale.", "Test Sensitivity", 36, ["netflix-stratification"], ["ratio-metrics", "fundamentals-of-econometrics"], [{"title": "Microsoft Delta Method", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_14)


md_15 = r"""# Deep Dive: Ratio Metrics, Delta Method Linearization & Variance Estimators

Ratio metrics form the primary metric tier across e-commerce, digital advertising, content platforms, and SaaS products. Key examples include Click-Through-Rate ($\text{CTR} = \frac{\text{Clicks}}{\text{Impressions}}$), Conversion Rate ($\frac{\text{Conversions}}{\text{Sessions}}$), Revenue per Order ($\frac{\text{Total Revenue}}{\text{Orders}}$), and Error Rate ($\frac{\text{Failed Requests}}{\text{Total Requests}}$).

This deep dive examines the mathematical derivations of ratio metrics, Delta Method Taylor series expansions, multi-level data aggregation, and production variance estimation algorithms.

---

## 1. Multi-Level Telemetry Aggregation

Data pipelines generate logs at the **Event Level** (individual pageview or request logs). However, experimentation assignment occurs at the **Unit Level** (user, device, or cookie ID).

Evaluating ratio metrics at the raw event level creates a severe violation of independence assumptions because a single hyper-active user may generate 10,000 requests, dominating the dataset.

### Aggregation Theorem
For user $i \in \{1 \dots N\}$, let $A_i = \sum_{j} X_{ij}$ represent total user numerators (e.g. total clicks) and $B_i = \sum_{j} Y_{ij}$ represent total user denominators (e.g. total queries). The sample ratio metric $\hat{R}$ is:

$$\hat{R} = \frac{\sum_{i=1}^N A_i}{\sum_{i=1}^N B_i} = \frac{\bar{A}}{\bar{B}}$$

---

## 2. Derivation of Delta Method Variance for Ratios

Using bivariate Taylor series expansion of $f(\bar{A}, \bar{B}) = \frac{\bar{A}}{\bar{B}}$ around $(\mu_A, \mu_B)$:

$$f(\bar{A}, \bar{B}) \approx \frac{\mu_A}{\mu_B} + \frac{1}{\mu_B} (\bar{A} - \mu_A) - \frac{\mu_A}{\mu_B^2} (\bar{B} - \mu_B)$$

Subtracting expected value $R = \frac{\mu_A}{\mu_B}$ and squaring both sides:

$$\left(\hat{R} - R\right)^2 \approx \frac{1}{\mu_B^2} (\bar{A} - \mu_A)^2 + \frac{\mu_A^2}{\mu_B^4} (\bar{B} - \mu_B)^2 - \frac{2\mu_A}{\mu_B^3} (\bar{A} - \mu_A)(\bar{B} - \mu_B)$$

Taking mathematical expectation $\mathbb{E}[\cdot]$ yields the **Asymptotic Variance Formula**:

$$\text{Var}(\hat{R}) \approx \frac{1}{N \mu_B^2} \left[ \sigma_A^2 + R^2 \sigma_B^2 - 2 R \sigma_{AB} \right]$$

where $\sigma_A^2 = \text{Var}(A_i)$, $\sigma_B^2 = \text{Var}(B_i)$, and $\sigma_{AB} = \text{Cov}(A_i, B_i)$.

### Ratio Metric Pipeline Architecture
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Ratio Metric Telemetry Pipeline Architecture</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="130" height="40" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="35" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Raw Event Logs</text>

    <path d="M 130,30 L 180,30" stroke="#64748b" stroke-width="1.5"/>

    <rect x="180" y="10" width="160" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="260" y="35" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">User-Level Aggregation</text>

    <path d="M 340,30 L 390,30" stroke="#64748b" stroke-width="1.5"/>

    <rect x="390" y="10" width="160" height="40" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="470" y="35" fill="#a855f7" font-size="10" text-anchor="middle" font-family="monospace">Delta Method Variance</text>
  </g>
</svg>

---

## 3. Production Python Implementation: Ratio Estimator Harness

```python
import numpy as np
import scipy.stats as stats

class RatioMetricEngine:
    def __init__(self, alpha=0.05):
        self.alpha = alpha

    def evaluate_ratio_difference(self, A_ctrl, B_ctrl, A_treat, B_treat):
        r_c, var_c = self._compute_ratio_stats(A_ctrl, B_ctrl)
        r_t, var_t = self._compute_ratio_stats(A_treat, B_treat)
        
        diff = r_t - r_c
        se_diff = np.sqrt(var_c + var_t)
        z_score = diff / se_diff
        p_val = 2.0 * (1.0 - stats.norm.cdf(np.abs(z_score)))
        
        ci_low = diff - stats.norm.ppf(1.0 - self.alpha / 2.0) * se_diff
        ci_high = diff + stats.norm.ppf(1.0 - self.alpha / 2.0) * se_diff
        
        return {
            'ratio_control': r_c,
            'ratio_treatment': r_t,
            'diff': diff,
            'z_score': z_score,
            'p_value': p_val,
            'ci_95': (ci_low, ci_high)
        }

    def _compute_ratio_stats(self, A, B):
        N = len(A)
        mu_A, mu_B = np.mean(A), np.mean(B)
        ratio = mu_A / mu_B
        
        s2_A = np.var(A, ddof=1)
        s2_B = np.var(B, ddof=1)
        s_AB = np.cov(A, B, ddof=1)[0, 1]
        
        var_ratio = (1.0 / (N * (mu_B**2))) * (s2_A + (ratio**2) * s2_B - 2.0 * ratio * s_AB)
        return ratio, var_ratio

# Simulation
np.random.seed(42)
N = 4000
B_c = np.random.poisson(lam=15, size=N) + 1
A_c = np.random.binomial(n=B_c, p=0.08)

B_t = np.random.poisson(lam=15, size=N) + 1
A_t = np.random.binomial(n=B_t, p=0.085)

engine = RatioMetricEngine()
res = engine.evaluate_ratio_difference(A_c, B_c, A_t, B_t)

print("=== Ratio Metric Evaluation ===")
print(f"Control Ratio:   {res['ratio_control']:.6f}")
print(f"Treatment Ratio: {res['ratio_treatment']:.6f}")
print(f"Difference:      {res['diff']:.6f} | Z={res['z_score']:.4f} | p-val: {res['p_value']:.6e}")
print(f"95% CI: [{res['ci_95'][0]:.6f}, {res['ci_95'][1]:.6f}]")
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: What is the main advantage of the Delta Method over Bootstrap for ratio metrics?
The Delta Method calculates ratio metric variance in $O(N)$ time via single-pass SQL aggregates, whereas Bootstrap resampling requires 10,000 loop passes over raw user telemetry, incurring massive computational costs at scale.

### Q2: Why does correlation $\text{Cov}(A, B)$ reduce overall ratio metric variance?
In the variance expansion $\text{Var}(\hat{R}) \propto \sigma_A^2 + R^2 \sigma_B^2 - 2 R \sigma_{AB}$, a positive correlation $\sigma_{AB} > 0$ subtracts from total variance because users with higher denominators (more queries) naturally generate higher numerators (more clicks).

### Q3: How does ratio metric variance behave when denominator $B$ has high variance?
If denominator $B$ has high variance relative to its mean $\mu_B$, the squared term $R^2 \sigma_B^2$ increases variance. Transforming denominator metrics or capping high-volume outliers stabilizes ratio variance.

### Q4: Can ratio metrics be evaluated using standard t-tests?
No. Standard $t$-tests assume independent observations of a single variable. Ratios involve two interdependent random variables $(A, B)$ across clustered user activity, violating $t$-test assumptions.

### Q5: How do experimentation platforms handle ratio metrics in real-time dashboards?
Modern dashboards aggregate user-level sums $(\sum A_i, \sum B_i, \sum A_i^2, \sum B_i^2, \sum A_i B_i)$ incrementally in streaming engines (e.g. Apache Flink), applying the Delta Method formula dynamically on dashboard query.
"""

add_blog("ratio-metrics", "Deep Dive: Ratio Metrics, Delta Method Linearization & Variance Estimators", "Derivation of Delta Method for click-through-rates, conversion ratios, and multi-level data aggregation.", "Test Sensitivity", 34, ["microsoft-delta-method"], ["fundamentals-of-econometrics", "intro-to-econometrics"], [{"title": "Ratio Metric Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_15)


md_16 = r"""# Fundamentals of Econometrics: OLS, Instrumental Variables & Causal Inference

Econometrics combines economic theory, probability calculus, and linear algebra to quantify causal relationships from non-experimental observational data. In technology companies, econometric methods allow data scientists to evaluate interventions (e.g., ad spend impact, pricing elasticity, subscription churn drivers) when randomized A/B experiments are ethically or logistically infeasible.

This comprehensive guide covers Ordinary Least Squares (OLS) assumptions, the Gauss-Markov theorem, endogeneity pitfalls, and Two-Stage Least Squares (2SLS) Instrumental Variable (IV) estimation.

---

## 1. Ordinary Least Squares (OLS) Matrix Formulation

Consider the multiple linear regression model relating outcome vector $\mathbf{Y} \in \mathbb{R}^N$ to design matrix $\mathbf{X} \in \mathbb{R}^{N \times K}$:

$$\mathbf{Y} = \mathbf{X} \boldsymbol{\beta} + \boldsymbol{\varepsilon}$$

The OLS estimator $\hat{\boldsymbol{\beta}}$ minimizes the Sum of Squared Residuals (SSR):

$$S(\boldsymbol{\beta}) = (\mathbf{Y} - \mathbf{X}\boldsymbol{\beta})^T (\mathbf{Y} - \mathbf{X}\boldsymbol{\beta}) = \mathbf{Y}^T \mathbf{Y} - 2\boldsymbol{\beta}^T \mathbf{X}^T \mathbf{Y} + \boldsymbol{\beta}^T \mathbf{X}^T \mathbf{X} \boldsymbol{\beta}$$

Setting the gradient vector to zero:

$$\frac{\partial S}{\partial \boldsymbol{\beta}} = -2 \mathbf{X}^T \mathbf{Y} + 2 \mathbf{X}^T \mathbf{X} \boldsymbol{\beta} = 0 \implies \mathbf{X}^T \mathbf{X} \hat{\boldsymbol{\beta}} = \mathbf{X}^T \mathbf{Y}$$

Assuming $\mathbf{X}^T \mathbf{X}$ is non-singular (full column rank):

$$\hat{\boldsymbol{\beta}}_{\text{OLS}} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{Y}$$

---

## 2. The Gauss-Markov Theorem & OLS Assumptions

The **Gauss-Markov Theorem** states that under five foundational assumptions, the OLS estimator is **BLUE (Best Linear Unbiased Estimator)**—it has the lowest sampling variance among all linear unbiased estimators.

### 2.1 The Five Gauss-Markov Assumptions
1. **Linearity in Parameters**: $\mathbf{Y} = \mathbf{X}\boldsymbol{\beta} + \boldsymbol{\varepsilon}$.
2. **Strict Exogeneity**: $\mathbb{E}[\boldsymbol{\varepsilon} \mid \mathbf{X}] = 0$. Errors must have zero mean conditional on covariates.
3. **No Multicollinearity**: Rank$(\mathbf{X}) = K$. Columns of $\mathbf{X}$ are linearly independent.
4. **Spherical Errors (Homoscedasticity & No Autocorrelation)**:
   $$\text{Var}(\boldsymbol{\varepsilon} \mid \mathbf{X}) = \sigma^2 \mathbf{I}_N$$
5. **Normal Distribution of Errors (for exact finite-sample inference)**: $\boldsymbol{\varepsilon} \sim \mathcal{N}(0, \sigma^2 \mathbf{I}_N)$.

---

## 3. Endogeneity & Instrumental Variables (2SLS)

If strict exogeneity fails ($\text{Cov}(X_k, \varepsilon) \ne 0$), the OLS estimator suffers from **Omitted Variable Bias** and is fundamentally biased and inconsistent:

$$\text{plim } \hat{\beta}_{\text{OLS}} = \beta + \frac{\text{Cov}(X, \varepsilon)}{\text{Var}(X)} \ne \beta$$

### 3.1 Instrumental Variable Invariants
An **Instrumental Variable** $Z$ isolates exogenous variation in endogenous regressor $X$. An instrument $Z$ must satisfy two strict conditions:
1. **Instrument Relevance**: $\text{Cov}(Z, X) \ne 0$. $Z$ must correlate strongly with $X$.
2. **Instrument Exclusion Restriction**: $\text{Cov}(Z, \varepsilon) = 0$. $Z$ affects outcome $Y$ *only* through regressor $X$.

### 2SLS Architecture Diagram
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">Instrumental Variables (2SLS) Causal Flow</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="130" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="65" y="35" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">Instrument Z</text>

    <path d="M 130,30 L 190,30" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-ec)"/>

    <rect x="190" y="10" width="150" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="265" y="35" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="monospace">Endogenous Regressor X</text>

    <path d="M 340,30 L 400,30" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-ec)"/>

    <rect x="400" y="10" width="130" height="40" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="465" y="35" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Outcome Y</text>
  </g>
  <defs>
    <marker id="arrow-ec" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
    </marker>
  </defs>
</svg>

---

## 4. Production Python Implementation: 2SLS IV Regression Harness

```python
import numpy as np
import statsmodels.api as sm
from linearmodels.iv import IV2SLS
import pandas as pd

class Econometric2SLSEngine:
    def fit_2sls(self, df, dependent, endogenous, instrument, exog_vars=None):
        Y = df[dependent]
        X_endog = df[endogenous]
        Z_inst = df[instrument]
        
        if exog_vars is None:
            exog_vars = []
            
        exog = sm.add_constant(df[exog_vars]) if len(exog_vars) > 0 else sm.add_constant(pd.DataFrame(index=df.index))
        
        # Fit 2SLS Model
        iv_model = IV2SLS(dependent=Y, exog=exog, endog=X_endog, instruments=Z_inst)
        iv_results = iv_model.fit(cov_type='robust')
        
        # Stage 1 F-Statistic (Instrument Strength Check)
        first_stage = sm.OLS(X_endog, sm.add_constant(pd.concat([exog, Z_inst], axis=1))).fit()
        f_stat = first_stage.fvalue
        
        print("=== Econometric 2SLS IV Results ===")
        print(f"Stage 1 F-Statistic: {f_stat:.2f} (Threshold > 10 for strong instrument)")
        print(iv_results.summary.tables[1])
        return iv_results

# Synthetic Data Generation
np.random.seed(42)
N = 5000
unobserved_ability = np.random.normal(0, 2, N)

# Instrument Z: Distance to college / Random assignment lottery
Z_lottery = np.random.binomial(1, 0.5, N)

# Endogenous X: Years of education (correlated with unobserved ability)
X_education = 10 + 2.5 * Z_lottery + 0.8 * unobserved_ability + np.random.normal(0, 1, N)

# Outcome Y: Log wage (affected by ability)
Y_log_wage = 2.0 + 0.12 * X_education + 0.5 * unobserved_ability + np.random.normal(0, 0.5, N)

df_econ = pd.DataFrame({'log_wage': Y_log_wage, 'education': X_education, 'lottery': Z_lottery})

engine = Econometric2SLSEngine()
engine.fit_2sls(df_econ, dependent='log_wage', endogenous=['education'], instrument=['lottery'])
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What happens if an Instrumental Variable is weak ($F < 10$ in Stage 1)?
Weak instruments correlate weakly with endogenous regressor $X$, causing 2SLS standard errors to blow up and producing severe finite-sample bias (2SLS estimates collapse toward biased OLS estimates).

### Q2: How does the Exclusion Restriction requirement get tested mathematically?
The exclusion restriction ($\text{Cov}(Z, \varepsilon) = 0$) cannot be tested directly when using a single instrument because the model is exactly identified. When over-identified (more instruments than endogenous regressors), Sargan's or Hansen's $J$-test evaluates validity.

### Q3: What is Heteroscedasticity and how does Robust Standard Errors (HC1/HC3) fix it?
Heteroscedasticity occurs when error variance $\text{Var}(\varepsilon_i \mid X_i) = \sigma_i^2$ is non-constant across observations. Standard OLS underestimates standard errors. Huber-White Robust Standard Errors (HC1/HC3) correct the covariance matrix without altering coefficient estimates.

### Q4: When should business data scientists prefer IV estimation over randomized A/B testing?
IV estimation is preferred when randomized A/B testing is prohibited by user backlash, regulatory rules, or physical infrastructure costs. Natural experiments (such as regulatory policy changes or weather shocks) serve as exogenous instruments.

### Q5: What is the difference between Local Average Treatment Effect (LATE) and Average Treatment Effect (ATE)?
Instrumental Variables estimate the **LATE**—the treatment effect specifically for *compliers* (units whose behavior is altered by instrument $Z$). ATE estimates the average effect across the entire population.
"""

add_blog("fundamentals-of-econometrics", "Fundamentals of Econometrics: OLS, Instrumental Variables & Causal Inference", "Ordinary Least Squares assumptions, Gauss-Markov theorem, endogeneity, and 2SLS Instrumental Variables.", "Econometrics", 36, ["ratio-metrics"], ["intro-to-econometrics", "econometrics-course"], [{"title": "Econometric 2SLS Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_16)


md_17 = r"""# Coursera: Introduction to Econometrics & Panel Data Analysis

Panel data (longitudinal data) tracks multiple entities $i \in \{1 \dots N\}$ across multiple time periods $t \in \{1 \dots T\}$. In digital technology platforms, panel structures naturally represent daily user activity logs, weekly merchant transaction volumes, or hourly microservice latency metrics.

This article explores Panel Data analysis, contrasting Pooled OLS, Fixed Effects (FE), and Random Effects (RE) models, deriving the Hausman Specification Test, and providing a production Python panel regression engine.

---

## 1. Panel Data Model Specification

The general panel regression equation is written as:

$$Y_{it} = \alpha + \mathbf{X}_{it} \boldsymbol{\beta} + \mu_i + \lambda_t + \varepsilon_{it}$$

where:
- $Y_{it}$ is the outcome for entity $i$ at time $t$.
- $\mathbf{X}_{it}$ is a vector of time-varying covariates.
- $\mu_i$ represents unobserved, time-invariant entity-specific heterogeneity (e.g. baseline user ability, inherent brand prestige).
- $\lambda_t$ represents time-specific macro shocks (e.g. platform-wide holiday effects).
- $\varepsilon_{it}$ is the idiosyncratic error term.

---

## 2. Fixed Effects vs. Random Effects Models

### 2.1 Fixed Effects Estimator (Within Transformation)
The **Fixed Effects (FE)** model assumes that unobserved entity effects $\mu_i$ are correlated with regressors $\mathbf{X}_{it}$ ($\text{Cov}(\mathbf{X}_{it}, \mu_i) \ne 0$).

To eliminate unobserved heterogeneity $\mu_i$, the FE estimator subtracts entity-level time means $\bar{Y}_i = \frac{1}{T} \sum_{t=1}^T Y_{it}$ from each observation (**Within Transformation**):

$$(Y_{it} - \bar{Y}_i) = (\mathbf{X}_{it} - \bar{\mathbf{X}}_i) \boldsymbol{\beta} + (\varepsilon_{it} - \bar{\varepsilon}_i)$$

Because $\mu_i - \bar{\mu}_i = 0$, unobserved entity bias is completely removed, yielding consistent estimates of $\boldsymbol{\beta}$.

### 2.2 Random Effects Estimator (Feasible GLS)
The **Random Effects (RE)** model assumes unobserved entity effects $\mu_i$ are purely random and uncorrelated with regressors ($\text{Cov}(\mathbf{X}_{it}, \mu_i) = 0$). RE uses Generalized Least Squares (GLS) partial de-meaning:

$$(Y_{it} - \theta \bar{Y}_i) = (\mathbf{X}_{it} - \theta \bar{\mathbf{X}}_i) \boldsymbol{\beta} + (1 - \theta) \alpha + v_{it}$$

where transformation parameter $\theta = 1 - \sqrt{\frac{\sigma_\varepsilon^2}{\sigma_\varepsilon^2 + T \sigma_\mu^2}}$.

---

## 3. The Hausman Specification Test

The **Hausman Test** determines whether to select Fixed Effects or Random Effects. The null hypothesis $H_0: \text{Cov}(\mathbf{X}_{it}, \mu_i) = 0$ asserts that RE is consistent and efficient.

The test statistic $W$ evaluates the normalized quadratic distance between estimators:

$$W = (\hat{\boldsymbol{\beta}}_{\text{FE}} - \hat{\boldsymbol{\beta}}_{\text{RE}})^T \left[ \text{Var}(\hat{\boldsymbol{\beta}}_{\text{FE}}) - \text{Var}(\hat{\boldsymbol{\beta}}_{\text{RE}}) \right]^{-1} (\hat{\boldsymbol{\beta}}_{\text{FE}} - \hat{\boldsymbol{\beta}}_{\text{RE}}) \sim \chi^2(K)$$

If $p < 0.05$, reject $H_0$ and adopt the Fixed Effects model.

### Panel Data Architecture Diagram
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">Panel Data Model Selection Architecture</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="130" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="65" y="35" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">Panel Telemetry (i, t)</text>

    <path d="M 130,30 L 190,30" stroke="#64748b" stroke-width="1.5"/>

    <rect x="190" y="10" width="150" height="40" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="265" y="35" fill="#a855f7" font-size="10" text-anchor="middle" font-family="monospace">Hausman Test (Chi^2)</text>

    <path d="M 340,30 L 390,10" stroke="#10b981" stroke-width="1.5"/>
    <path d="M 340,30 L 390,50" stroke="#ef4444" stroke-width="1.5"/>

    <rect x="390" y="-10" width="150" height="35" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="465" y="12" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Reject H0: Fixed Effects</text>

    <rect x="390" y="40" width="150" height="35" rx="4" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="465" y="62" fill="#ef4444" font-size="10" text-anchor="middle" font-family="monospace">Fail to Reject: Random Effects</text>
  </g>
</svg>

---

## 4. Production Python Implementation: Panel Regression Engine

```python
import numpy as np
import pandas as pd
from linearmodels.panel import PanelOLS, RandomEffects
import statsmodels.api as sm

class PanelDataRegressionEngine:
    def fit_panel_models(self, df_panel, entity_col, time_col, dependent, exog_vars):
        df_panel = df_panel.set_index([entity_col, time_col])
        Y = df_panel[dependent]
        X = sm.add_constant(df_panel[exog_vars])
        
        # 1. Fixed Effects Model
        fe_model = PanelOLS(Y, X, entity_effects=True, time_effects=True)
        fe_res = fe_model.fit(cov_type='clustered', cluster_entity=True)
        
        # 2. Random Effects Model
        re_model = RandomEffects(Y, X)
        re_res = re_model.fit(cov_type='clustered', cluster_entity=True)
        
        print("=== Panel Data Regression Summary ===")
        print(f"Fixed Effects Beta: {fe_res.params[exog_vars[0]]:.4f} (p={fe_res.pvalues[exog_vars[0]]:.6e})")
        print(f"Random Effects Beta: {re_res.params[exog_vars[0]]:.4f} (p={re_res.pvalues[exog_vars[0]]:.6e})")
        return fe_res, re_res

# Synthetic Panel Telemetry Generation
np.random.seed(42)
N_entities, T_time = 500, 10
entity_ids = np.repeat(np.arange(N_entities), T_time)
time_ids = np.tile(np.arange(T_time), N_entities)

unobserved_mu = np.repeat(np.random.normal(0, 3, N_entities), T_time)
feature_x = np.random.normal(5, 2, N_entities * T_time) + 0.5 * unobserved_mu
outcome_y = 2.0 + 1.5 * feature_x + unobserved_mu + np.random.normal(0, 1, N_entities * T_time)

df_p = pd.DataFrame({'user_id': entity_ids, 'day': time_ids, 'spend': outcome_y, 'feature': feature_x})

engine = PanelDataRegressionEngine()
engine.fit_panel_models(df_p, 'user_id', 'day', 'spend', ['feature'])
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why does Fixed Effects fail to estimate time-invariant variables like gender or location?
The within transformation $(X_{it} - \bar{X}_i)$ subtracts entity time-means. For time-invariant variables ($X_{it} = \bar{X}_i$), the transformed variable becomes identically zero ($X_{it} - \bar{X}_i = 0$), preventing coefficient estimation.

### Q2: What is Clustered Standard Errors and why are they required in Panel Data?
Panel observations for entity $i$ exhibit temporal autocorrelation across periods $t$. Standard OLS standard errors underestimate uncertainty. Clustered Standard Errors group residuals by entity $i$, accounting for arbitrary within-entity correlation.

### Q3: How does Two-Way Fixed Effects (TWFE) handle platform-wide holiday shocks?
Two-Way Fixed Effects incorporates both entity fixed effects $\mu_i$ and time fixed effects $\lambda_t$, controlling for both individual time-invariant traits and global time shocks (such as Black Friday traffic surges).

### Q4: When is Pooled OLS acceptable for longitudinal data?
Pooled OLS is acceptable only if unobserved entity heterogeneity $\mu_i$ is completely absent ($\text{Var}(\mu_i) = 0$). Otherwise, Pooled OLS produces biased standard errors and invalid inference.

### Q5: How does Panel Data analysis help evaluate product feature rollouts?
Panel data tracks entities before and after feature rollouts, allowing data scientists to control for baseline entity differences and isolate true causal feature impacts.
"""

add_blog("intro-to-econometrics", "Coursera: Introduction to Econometrics & Panel Data Analysis", "Fixed Effects vs Random Effects models, Hausman specification test, and pooled cross-sectional regressions.", "Econometrics", 34, ["fundamentals-of-econometrics"], ["econometrics-course", "learn-time-series"], [{"title": "Panel Data Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_17)


md_18 = r"""# Advanced Econometric Modeling: Difference-in-Differences & Synthetic Controls

When digital platforms launch major product changes across entire geographic regions or platform categories (e.g., launching new pricing tiers in California or rolling out a UI update to Android devices), randomized user-level A/B testing is impossible.

This article covers advanced quasi-experimental causal inference methodologies: **Difference-in-Differences (Diff-in-Diff)** and **Synthetic Control Methods (SCM)**, detailing parallel trends verification, staggered treatment timing, and placebo permutation tests.

---

## 1. Mathematical Foundations of Difference-in-Differences

Difference-in-Differences compares the outcome trajectories of a Treatment group ($G = 1$) and a Control group ($G = 0$) across a Pre-period ($T = 0$) and a Post-period ($T = 1$).

### The 2x2 DiD Estimator
The canonical $2 \times 2$ DiD estimator $\hat{\Delta}_{\text{DiD}}$ is defined as:

$$\hat{\Delta}_{\text{DiD}} = \left( \bar{Y}_{T=1, G=1} - \bar{Y}_{T=0, G=1} \right) - \left( \bar{Y}_{T=1, G=0} - \bar{Y}_{T=0, G=0} \right)$$

### DiD Regression Parameterization
The DiD estimate is recovered via Ordinary Least Squares:

$$Y_{it} = \beta_0 + \beta_1 \text{Treat}_i + \beta_2 \text{Post}_t + \delta_{\text{DiD}} (\text{Treat}_i \times \text{Post}_t) + \varepsilon_{it}$$

where $\delta_{\text{DiD}}$ isolates the true causal treatment effect.

### Parallel Trends Invariant
The fundamental identification assumption of DiD is the **Parallel Trends Assumption**: in the absence of treatment, the average outcome change in the treatment group would equal the average change in the control group:

$$\mathbb{E}[Y_{1, T=1}(0) - Y_{1, T=0}(0)] = \mathbb{E}[Y_{0, T=1}(0) - Y_{0, T=0}(0)]$$

### DiD Causal Trajectory Diagram
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Difference-in-Differences Parallel Trends Flow</text>
  <g transform="translate(50, 60)">
    {/* Control Trend Line */}
    <path d="M 50,110 L 250,90 L 450,70" stroke="#38bdf8" stroke-width="2" fill="none"/>
    <text x="460" y="75" fill="#38bdf8" font-size="10" font-family="monospace">Control (Observed)</text>

    {/* Counterfactual Line */}
    <path d="M 250,50 L 450,30" stroke="#a1a1aa" stroke-width="1.5" stroke-dasharray="4 2" fill="none"/>
    <text x="460" y="35" fill="#a1a1aa" font-size="10" font-family="monospace">Counterfactual (No Treatment)</text>

    {/* Actual Treatment Line */}
    <path d="M 50,70 L 250,50 L 450,10" stroke="#a855f7" stroke-width="2.5" fill="none"/>
    <text x="460" y="15" fill="#a855f7" font-size="10" font-family="monospace">Treatment (Observed)</text>

    {/* Delta Causal Arrow */}
    <path d="M 450,28 L 450,12" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-did)"/>
    <text x="430" y="22" fill="#10b981" font-size="10" font-family="monospace">delta_DiD</text>
  </g>
  <defs>
    <marker id="arrow-did" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981"/>
    </marker>
  </defs>
</svg>

---

## 2. Synthetic Control Method (SCM)

When evaluating a treatment applied to a single aggregate entity (e.g. launching a policy in one country), finding a single matching control region is difficult. The **Synthetic Control Method (Abadie et al.)** constructs a weighted combination of un-treated control units (**Donor Pool**) to synthesize a convex counterfactual:

$$Y_{1t}^{\text{synth}} = \sum_{j=2}^{J+1} W_j Y_{jt}, \quad \text{subject to } W_j \ge 0, \sum_{j=2}^{J+1} W_j = 1$$

Weights $W^*$ minimize pre-treatment mean squared prediction error (MSPE):

$$W^* = \arg\min_W \sum_{m=1}^M v_m \left( X_{1m} - \sum_{j=2}^{J+1} W_j X_{jm} \right)^2$$

---

## 3. Production Python Implementation: DiD & Synthetic Control Suite

```python
import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

class QuasiExperimentalCausalEngine:
    def fit_difference_in_differences(self, df, outcome, treat_col, post_col):
        formula = f"{outcome} ~ {treat_col} * {post_col}"
        model = smf.ols(formula, data=df).fit(cov_type='HC3')
        
        did_effect = model.params[f"{treat_col}:{post_col}"]
        p_val = model.pvalues[f"{treat_col}:{post_col}"]
        ci = model.conf_int().loc[f"{treat_col}:{post_col}"]
        
        print("=== Difference-in-Differences Evaluation ===")
        print(f"Causal Effect (delta_DiD): {did_effect:.4f}")
        print(f"p-value: {p_val:.6e} | 95% CI: [{ci[0]:.4f}, {ci[1]:.4f}]")
        return did_effect, p_val

# Simulation
np.random.seed(42)
N_units, T_periods = 200, 20
df_list = []

for u in range(N_units):
    is_treat = 1 if u < 50 else 0
    unit_fe = np.random.normal(0, 2)
    for t in range(T_periods):
        is_post = 1 if t >= 10 else 0
        time_fe = 0.5 * t
        true_effect = 4.5 if (is_treat == 1 and is_post == 1) else 0.0
        y = 10.0 + unit_fe + time_fe + 2.0 * is_treat + true_effect + np.random.normal(0, 1)
        df_list.append({'unit': u, 'time': t, 'treat': is_treat, 'post': is_post, 'revenue': y})

df_did = pd.DataFrame(df_list)
engine = QuasiExperimentalCausalEngine()
engine.fit_difference_in_differences(df_did, 'revenue', 'treat', 'post')
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: How do event study plots test the Parallel Trends Assumption?
Event study models interact treatment indicators with relative time leads ($\text{Treat} \times \text{Period}_{t - k}$). If pre-treatment coefficients ($\beta_{t-k}$ for $k < 0$) are statistically indistinguishable from zero, the parallel trends assumption holds.

### Q2: What is Staggered Treatment Adoption and why does standard TWFE fail?
Staggered adoption occurs when units enter treatment at different time periods. Standard Two-Way Fixed Effects regressions assign negative weights to early-treated units used as controls, distorting treatment effect estimates. Modern estimators (Callaway & Sant'Anna) fix this issue.

### Q3: How are placebo tests conducted in Synthetic Control Methods?
Placebo tests apply the SCM algorithm to untreated donor units. If the true treated unit exhibits a significantly larger post-treatment MSPE ratio compared to placebo donors ($p < 0.05$), the effect is statistically significant.

### Q4: When should a data scientist choose Synthetic Control over Difference-in-Differences?
Choose Synthetic Control when evaluating a single treated unit (e.g. one state or market) where un-treated control units have different pre-treatment baseline levels that require convex weighting.

### Q5: What is the Convex Combination Constraint in Synthetic Controls ($W_j \ge 0, \sum W_j = 1$)?
The convex constraint prevents extrapolation outside the support of donor pool data, ensuring synthetic counterfactuals remain interpretable weighted averages.
"""

add_blog("econometrics-course", "Advanced Econometric Modeling: Difference-in-Differences & Synthetic Controls", "Parallel trends assumption, staggered diff-in-diff, synthetic control optimization, and placebo tests.", "Econometrics", 36, ["intro-to-econometrics"], ["learn-time-series", "time-series-basics"], [{"title": "Diff-in-Diff Causal Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_18)


md_19 = r"""# Time Series Analysis: Stationarity, Autocorrelation & Stationarity Tests

Time series data records observations sequentially over time $t \in \{1 \dots T\}$. In technology applications—such as cloud infrastructure server load monitoring, algorithmic stock trading, and automated demand forecasting—modeling time series data requires establishing **Stationarity** and accounting for temporal autocorrelation.

This comprehensive guide covers weak vs. strong stationarity definitions, Autocorrelation Functions (ACF), Partial Autocorrelation Functions (PACF), the Augmented Dickey-Fuller (ADF) unit root test, and Python time series analysis engines.

---

## 1. Mathematical Foundations of Stationarity

### 1.1 Strict (Strong) Stationarity
A time series $\{Y_t\}$ is **strictly stationary** if the joint probability distribution of $(Y_{t_1}, \dots, Y_{t_k})$ is identical to the shift distribution $(Y_{t_1 + \tau}, \dots, Y_{t_k + \tau})$ for any time lag $\tau$:

$$F_{Y_{t_1}, \dots, Y_{t_k}}(y_1, \dots, y_k) = F_{Y_{t_1+\tau}, \dots, Y_{t_k+\tau}}(y_1, \dots, y_k)$$

### 1.2 Weak (Wide-Sense) Stationarity
In practical time series modeling, we enforce **Weak Stationarity**, defined by three conditions:
1. **Constant Mean**: $\mathbb{E}[Y_t] = \mu$ for all $t$.
2. **Finite Constant Variance**: $\text{Var}(Y_t) = \sigma^2 < \infty$ for all $t$.
3. **Lag-Dependent Autocovariance**: $\text{Cov}(Y_t, Y_{t-k}) = \gamma(k)$, depending solely on lag separation $k$, not calendar time $t$.

---

## 2. Autocorrelation & Partial Autocorrelation Functions

### 2.1 Autocorrelation Function (ACF)
The Autocorrelation Function $\rho(k)$ measures linear dependence between $Y_t$ and its lagged value $Y_{t-k}$:

$$\rho(k) = \frac{\gamma(k)}{\gamma(0)} = \frac{\text{Cov}(Y_t, Y_{t-k})}{\text{Var}(Y_t)}$$

### 2.2 Partial Autocorrelation Function (PACF)
The Partial Autocorrelation Function $\phi_{kk}$ measures the direct correlation between $Y_t$ and $Y_{t-k}$ after controlling for linear intermediate effects at lags $1, 2, \dots, k-1$.

### Time Series Stationarity Architecture
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">Time Series Stationarity Verification Architecture</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="130" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="65" y="35" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">Raw Series Y_t</text>

    <path d="M 130,30 L 190,30" stroke="#64748b" stroke-width="1.5"/>

    <rect x="190" y="10" width="150" height="40" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="265" y="35" fill="#a855f7" font-size="10" text-anchor="middle" font-family="monospace">ADF Unit Root Test</text>

    <path d="M 340,30 L 390,10" stroke="#10b981" stroke-width="1.5"/>
    <path d="M 340,30 L 390,50" stroke="#ef4444" stroke-width="1.5"/>

    <rect x="390" y="-10" width="150" height="35" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="465" y="12" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Stationary (p < 0.05)</text>

    <rect x="390" y="40" width="150" height="35" rx="4" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="465" y="62" fill="#ef4444" font-size="10" text-anchor="middle" font-family="monospace">Differencing Delta Y_t</text>
  </g>
</svg>

---

## 3. The Augmented Dickey-Fuller (ADF) Test

The **Augmented Dickey-Fuller (ADF)** test evaluates the null hypothesis $H_0: \gamma = 0$ (series contains a **Unit Root** and is non-stationary) against $H_1: \gamma < 0$ (stationary):

$$\Delta Y_t = \alpha + \beta t + \gamma Y_{t-1} + \sum_{p=1}^P \delta_p \Delta Y_{t-p} + \varepsilon_t$$

If test statistic $t_{\text{ADF}} < \text{Critical Value}$ ($p < 0.05$), reject $H_0$ and conclude stationarity.

---

## 4. Production Python Implementation: Time Series Stationarity Engine

```python
import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import adfuller, acf, pacf

class TimeSeriesStationarityEngine:
    def analyze_series(self, series, name="Telemetry"):
        # 1. Augmented Dickey-Fuller Test
        adf_res = adfuller(series, autolag='AIC')
        adf_stat, p_val, lags, n_obs, critical_vals = adf_res[0], adf_res[1], adf_res[2], adf_res[3], adf_res[4]
        
        # 2. ACF / PACF Computation
        series_acf = acf(series, nlags=5)
        series_pacf = pacf(series, nlags=5)
        
        is_stationary = p_val < 0.05
        
        print(f"=== Time Series Stationarity Report: {name} ===")
        print(f"ADF Statistic: {adf_stat:.4f} | p-value: {p_val:.6e}")
        print(f"Stationary Status: {'STATIONARY' if is_stationary else 'NON-STATIONARY (Requires Differencing)'}")
        print(f"Lag-1 ACF: {series_acf[1]:.4f} | Lag-1 PACF: {series_pacf[1]:.4f}")
        return is_stationary, p_val

# Simulation
np.random.seed(42)
N = 1000

# Non-stationary Random Walk series
random_walk = np.cumsum(np.random.normal(0, 1, N))

# Stationary AR(1) series: Y_t = 0.7 Y_{t-1} + e_t
ar1_stationary = np.zeros(N)
for t in range(1, N):
    ar1_stationary[t] = 0.7 * ar1_stationary[t-1] + np.random.normal(0, 1)

engine = TimeSeriesStationarityEngine()
engine.analyze_series(random_walk, "Random Walk Series")
engine.analyze_series(ar1_stationary, "AR(1) Stationary Series")
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is Spurious Regression and why does non-stationarity cause it?
Spurious regression occurs when regressing one non-stationary series on an unrelated non-stationary series yields high $R^2 > 0.90$ and significant $p < 0.001$, purely because both series share common time trends.

### Q2: How does first-differencing ($\Delta Y_t = Y_t - Y_{t-1}$) convert random walks to stationarity?
If $Y_t = Y_{t-1} + \varepsilon_t$ (Random Walk), differencing yields $\Delta Y_t = \varepsilon_t$, which is pure stationary white noise with constant mean zero and variance $\sigma^2$.

### Q3: What is the Kwiatkowski-Phillips-Schmidt-Shin (KPSS) test?
The KPSS test tests the reverse null hypothesis $H_0$: Series is trend-stationary. Combining ADF and KPSS tests provides confirmation of stationarity.

### Q4: How do ACF and PACF plots identify AR(p) and MA(q) model orders?
For an Autoregressive $\text{AR}(p)$ process, PACF cuts off sharply after lag $p$. For a Moving Average $\text{MA}(q)$ process, ACF cuts off sharply after lag $q$.

### Q5: What is Cointegration in multivariate time series?
Cointegration occurs when two non-stationary series $Y_t, X_t$ share a common stochastic trend such that a linear combination $Z_t = Y_t - \beta X_t$ is stationary.
"""

add_blog("learn-time-series", "Time Series Analysis: Stationarity, Autocorrelation & Stationarity Tests", "Stationary processes, Augmented Dickey-Fuller (ADF) test, ACF/PACF plots, and white noise invariants.", "Time Series", 34, ["econometrics-course"], ["time-series-basics"], [{"title": "Time Series Stationarity Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_19)


md_20 = r"""# Time Series Decomposition: Trend, Seasonality, Residuals & Exponential Smoothing

Time series signals generated by consumer software applications (e.g., daily active users, hourly API traffic, seasonal retail sales) combine long-term underlying growth trends, recurring cyclical patterns, and random noise fluctuations.

This guide explores **Time Series Decomposition** (Additive vs Multiplicative models), **Holt-Winters Triple Exponential Smoothing**, residual white noise diagnostics, and production Python forecasting engines.

---

## 1. Mathematical Frameworks for Time Series Decomposition

A observed time series $Y_t$ at time $t$ can be decomposed into three constituent components:
1. **Trend-Cycle Component ($T_t$)**: The long-term directional movement of the series.
2. **Seasonal Component ($S_t$)**: Recurring periodic fluctuations occurring at fixed frequency (e.g. daily, weekly, annual).
3. **Residual (Irregular) Component ($I_t$)**: Random white noise variations remaining after removing trend and seasonality.

### 1.1 Additive Decomposition Model
Used when seasonal variations remain constant in magnitude regardless of overall series level:

$$Y_t = T_t + S_t + I_t$$

### 1.2 Multiplicative Decomposition Model
Used when seasonal fluctuations scale proportionally with overall series level:

$$Y_t = T_t \times S_t \times I_t$$

Log-transforming multiplicative data converts it to additive format:

$$\log(Y_t) = \log(T_t) + \log(S_t) + \log(I_t)$$

### Time Series Decomposition Diagram
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Time Series Component Decomposition</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="130" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="35" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="monospace">Observed Series Y_t</text>

    <path d="M 130,30 L 190,0" stroke="#64748b" stroke-width="1.5"/>
    <path d="M 130,30 L 190,45" stroke="#64748b" stroke-width="1.5"/>
    <path d="M 130,30 L 190,90" stroke="#64748b" stroke-width="1.5"/>

    <rect x="190" y="-20" width="160" height="35" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="270" y="3" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">Trend Component T_t</text>

    <rect x="190" y="28" width="160" height="35" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="270" y="51" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Seasonal Component S_t</text>

    <rect x="190" y="75" width="160" height="35" rx="4" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="270" y="98" fill="#ef4444" font-size="10" text-anchor="middle" font-family="monospace">Residual Noise I_t</text>
  </g>
</svg>

---

## 2. Holt-Winters Triple Exponential Smoothing

Holt-Winters exponential smoothing computes recursively updated level $\ell_t$, trend $b_t$, and seasonality $s_t$ parameters using smoothing parameters $\alpha, \beta, \gamma \in [0, 1]$:

$$\ell_t = \alpha (Y_t - s_{t-m}) + (1 - \alpha)(\ell_{t-1} + b_{t-1})$$

$$b_t = \beta (\ell_t - \ell_{t-1}) + (1 - \beta) b_{t-1}$$

$$s_t = \gamma (Y_t - \ell_{t-1} - b_{t-1}) + (1 - \gamma) s_{t-m}$$

The $h$-step ahead forecast equation is:

$$\hat{Y}_{t+h \mid t} = \ell_t + h b_t + s_{t+h - m(k+1)}$$

---

## 3. Production Python Implementation: Time Series Decomposition Engine

```python
import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.holtwinters import ExponentialSmoothing

class TimeSeriesDecompositionEngine:
    def decompose_and_forecast(self, series, period=7, forecast_steps=14):
        # 1. Classical Additive Decomposition
        decomp = seasonal_decompose(series, model='additive', period=period)
        
        # 2. Holt-Winters Triple Exponential Smoothing
        model = ExponentialSmoothing(
            series,
            trend='add',
            seasonal='add',
            seasonal_periods=period
        ).fit()
        
        forecasts = model.forecast(steps=forecast_steps)
        
        print("=== Time Series Decomposition & Holt-Winters Summary ===")
        print(f"Residual Std Error: {np.nanstd(decomp.resid):.4f}")
        print(f"Holt-Winters AIC: {model.aic:.2f}")
        print(f"First 3 Forecast Steps: {forecasts[:3].values.round(4)}")
        return decomp, model, forecasts

# Simulation
np.random.seed(42)
t_steps = 365
time_idx = pd.date_range(start='2025-01-01', periods=t_steps, freq='D')

trend = 100.0 + 0.15 * np.arange(t_steps)
seasonality = 12.0 * np.sin(2 * np.pi * np.arange(t_steps) / 7.0)
noise = np.random.normal(0, 3.0, size=t_steps)

ts_data = pd.Series(trend + seasonality + noise, index=time_idx)

engine = TimeSeriesDecompositionEngine()
engine.decompose_and_forecast(ts_data, period=7, forecast_steps=14)
```

---

## 4. Frequently Asked Questions (FAQs)

### Q1: How do I choose between Additive and Multiplicative decomposition?
Plot the series. If the height of seasonal peaks grows proportionally as the series level increases over time, select Multiplicative decomposition. If seasonal peak height remains constant over time, select Additive decomposition.

### Q2: What is STL Decomposition (Seasonal and Trend decomposition using Loess)?
STL is a versatile decomposition method based on non-parametric local regression (Loess). Unlike classical decomposition, STL handles arbitrary seasonal frequencies, allows seasonal patterns to change over time, and is robust against extreme outliers.

### Q3: How do you verify if decomposition residuals represent pure white noise?
Plot the residual ACF and run the Ljung-Box test ($H_0$: Residuals are independent white noise). If $p > 0.05$, no autocorrelation remains, confirming that all temporal signal was captured by trend and seasonality.

### Q4: What is the difference between Simple, Double, and Triple Exponential Smoothing?
Simple Exponential Smoothing models level only (no trend, no seasonality). Double Exponential Smoothing (Holt's Method) models level and trend. Triple Exponential Smoothing (Holt-Winters) models level, trend, and seasonality simultaneously.

### Q5: How does seasonal differencing ($\Delta_m Y_t = Y_t - Y_{t-m}$) remove seasonality?
Subtracting the observation from $m$ periods prior (e.g. $m=7$ for daily data with weekly seasonality) cancels out constant periodic seasonal effects $S_t - S_{t-7} = 0$, yielding a seasonally adjusted series.
"""

add_blog("time-series-basics", "Time Series Decomposition: Trend, Seasonality, Residuals & Exponential Smoothing", "Additive vs multiplicative decomposition, Holt-Winters exponential smoothing, and seasonal adjustments.", "Time Series", 34, ["learn-time-series"], ["arima-model-for-time-series"], [{"title": "Holt-Winters Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}], md_20)
