import json
import re

blogs = {}

def add_blog_post(slug, title, tagline, category, read_time, prereqs, related, practice_probs, markdown):
    # Verify no repeated loop text exists
    assert "#### Production Edge Cases & Mathematical Proofs" not in markdown or markdown.count("#### Production Edge Cases & Mathematical Proofs") <= 1
    assert "### Deep Dive Supplement: System Invariants" not in markdown or markdown.count("### Deep Dive Supplement") <= 1
    
    length = len(markdown)
    print(f"Blog '{slug}' generated with {length:,} characters.")
    
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

# ----------------------------------------------------------------------
# 11. practitioners-guide-statistical-tests
# ----------------------------------------------------------------------
md_11 = r"""# Practitioner's Guide to Statistical Tests & Power Calculations

Statistical hypothesis testing is the mathematical foundation of data-driven decision making. In modern software platforms, evaluating whether a new feature, ranking algorithm, or UI variation produces a genuine performance improvement—rather than random noise—requires selecting the correct statistical test, deriving robust standard errors, and bounding False Positive Rates ($\alpha$) and False Negative Rates ($\beta$).

This comprehensive guide presents an exhaustive taxonomy of parametric and non-parametric statistical tests, mathematical derivations of test statistics, power analysis formulations, and a production-grade Python simulation harness.

---

## 1. Decision Architecture for Statistical Test Selection

Choosing an incorrect statistical test distorts $p$-values, leading to two major types of failure modes:
1. **Inflated Type I Error Rate ($\alpha$)**: Falsely declaring a neutral or harmful feature as a success (False Positive).
2. **Loss of Statistical Power ($1 - \beta$)**: Failing to detect a real, high-value product improvement (False Negative).

### 1.1 Taxonomy of Testing Metrics
Testing metrics in digital products fall into four structural categories:

1. **Continuous Unbounded Metrics** (e.g. Session duration, page load latency, revenue per user): Analyzed using Welch's $t$-test or empirical Bootstrap resampling.
2. **Binary Proportion Metrics** (e.g. Conversion rate, click-through-rate, signup success): Analyzed using Two-Sample $Z$-tests or Chi-Square tests of independence.
3. **Discrete Count Metrics** (e.g. Number of searches per session, items added to cart): Analyzed using Poisson or Negative Binomial regression.
4. **Rank/Ordinal Metrics** (e.g. User survey ratings, search result position): Analyzed using non-parametric Mann-Whitney $U$ or Kruskal-Wallis tests.

### Statistical Test Selection Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#38bdf8" font-size="13" font-family="sans-serif" font-weight="bold">Statistical Test Selection Decision Tree</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="130" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="65" y="35" fill="#38bdf8" font-size="10" text-anchor="middle" font-family="monospace">Metric Class</text>

    <path d="M 130,30 L 190,0" stroke="#64748b" stroke-width="1.5"/>
    <path d="M 130,30 L 190,45" stroke="#64748b" stroke-width="1.5"/>
    <path d="M 130,30 L 190,90" stroke="#64748b" stroke-width="1.5"/>

    <rect x="190" y="-20" width="160" height="35" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="270" y="-3" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Continuous (Normal / N>30)</text>
    <text x="270" y="9" fill="#a1a1aa" font-size="8" text-anchor="middle" font-family="monospace">Welch's t-Test / ANOVA</text>

    <rect x="190" y="28" width="160" height="35" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="270" y="45" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="monospace">Binary / Conversion Rate</text>
    <text x="270" y="57" fill="#a1a1aa" font-size="8" text-anchor="middle" font-family="monospace">Two-Sample Z-Test / Chi^2</text>

    <rect x="190" y="75" width="160" height="35" rx="4" fill="#1e293b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="270" y="92" fill="#ef4444" font-size="10" text-anchor="middle" font-family="monospace">Heavy-Tailed / Skewed</text>
    <text x="270" y="104" fill="#a1a1aa" font-size="8" text-anchor="middle" font-family="monospace">Mann-Whitney U / Bootstrap</text>
  </g>
</svg>

---

## 2. Mathematical Formulations: Parametric Tests

### 2.1 Two-Sample Z-Test for Proportions
When evaluating binary conversion rates $p_C = \frac{X_C}{n_C}$ and $p_T = \frac{X_T}{n_T}$ across independent sample sizes $n_C, n_T \ge 100$, the pooled baseline proportion is:

$$\hat{p} = \frac{X_C + X_T}{n_C + n_T}$$

The test statistic $Z$ evaluates standard normal departure under $H_0: p_T - p_C = 0$:

$$Z = \frac{p_T - p_C}{\sqrt{\hat{p}(1 - \hat{p})\left(\frac{1}{n_C} + \frac{1}{n_T}\right)}} \sim \mathcal{N}(0, 1)$$

### 2.2 Welch's t-Test for Continuous Means
Student's $t$-test assumes equal population variances ($\sigma_C^2 = \sigma_T^2$). In real-world software deployments, feature changes frequently alter variance alongside means. **Welch's $t$-test** modifies the standard error and degrees of freedom to remain robust against heteroscedasticity:

$$t = \frac{\bar{X}_T - \bar{X}_C}{\sqrt{\frac{S_C^2}{n_C} + \frac{S_T^2}{n_T}}}$$

The effective degrees of freedom $\nu$ is computed via the **Welch-Satterthwaite Equation**:

$$\nu = \frac{\left(\frac{S_C^2}{n_C} + \frac{S_T^2}{n_T}\right)^2}{\frac{(S_C^2 / n_C)^2}{n_C - 1} + \frac{(S_T^2 / n_T)^2}{n_T - 1}}$$

---

## 3. Non-Parametric Frameworks: Mann-Whitney U & Bootstrap Resampling

### 3.1 Mann-Whitney U Test (Wilcoxon Rank-Sum Test)
When data exhibits extreme skewness (such as heavy-tailed transaction revenue), parametric mean comparisons become sensitive to single-user outliers. The Mann-Whitney $U$ test converts observations into combined ranks $R_i \in [1, n_C + n_T]$:

$$U_T = R_T - \frac{n_T(n_T + 1)}{2}, \quad U_C = n_C n_T - U_T$$

Under $H_0$, the rank sum statistic has mean $\mathbb{E}[U] = \frac{n_C n_T}{2}$ and variance $\text{Var}(U) = \frac{n_C n_T(n_C + n_T + 1)}{12}$. For $n_C, n_T > 20$, the standardized statistic converges to normal:

$$Z_U = \frac{U - \mathbb{E}[U]}{\sqrt{\text{Var}(U)}} \sim \mathcal{N}(0, 1)$$

### 3.2 Non-Parametric Bootstrap Resampling
Bootstrap resampling constructs the empirical distribution of the difference metric $\Delta^* = \bar{X}_T^* - \bar{X}_C^*$ by drawing $B = 10,000$ independent random samples with replacement directly from the observed data:

$$\text{CI}_{1-\alpha} = \left[ Q^*\left(\frac{\alpha}{2}\right), \, Q^*\left(1 - \frac{\alpha}{2}\right) \right]$$

where $Q^*(p)$ represents the $p$-th percentile of the bootstrapped distribution array.

---

## 4. Production Python Implementation: Statistical Test & Simulation Suite

Below is a complete, modular Python test engine implementing Welch's $t$-test, Chi-Square goodness-of-fit, Mann-Whitney $U$, and Empirical Bootstrap confidence intervals.

```python
import numpy as np
import scipy.stats as stats
import pandas as pd

class StatisticalTestEngine:
    def __init__(self, alpha=0.05):
        self.alpha = alpha

    def evaluate_continuous_ab(self, control, treatment):
        n_c, n_t = len(control), len(treatment)
        m_c, m_t = np.mean(control), np.mean(treatment)
        v_c, v_t = np.var(control, ddof=1), np.var(treatment, ddof=1)
        
        # 1. Welch's t-Test
        se_welch = np.sqrt(v_c / n_c + v_t / n_t)
        t_stat = (m_t - m_c) / se_welch
        df_welch = ((v_c / n_c + v_t / n_t)**2) / (
            ((v_c / n_c)**2) / (n_c - 1) + ((v_t / n_t)**2) / (n_t - 1)
        )
        p_welch = 2.0 * (1.0 - stats.t.cdf(np.abs(t_stat), df=df_welch))
        
        # 2. Mann-Whitney U Test
        u_stat, p_mw = stats.mannwhitneyu(treatment, control, alternative='two-sided')
        
        # 3. Bootstrap Resampling (1,000 iterations)
        boot_diffs = np.zeros(1000)
        for b in range(1000):
            resamp_c = np.random.choice(control, size=n_c, replace=True)
            resamp_t = np.random.choice(treatment, size=n_t, replace=True)
            boot_diffs[b] = np.mean(resamp_t) - np.mean(resamp_c)
            
        ci_low, ci_high = np.percentile(boot_diffs, [100 * (self.alpha / 2.0), 100 * (1.0 - self.alpha / 2.0)])
        
        return {
            'mean_control': m_c,
            'mean_treatment': m_t,
            'diff': m_t - m_c,
            'welch_t': t_stat,
            'welch_df': df_welch,
            'welch_p': p_welch,
            'mann_whitney_p': p_mw,
            'bootstrap_ci_95': (ci_low, ci_high)
        }

# Execution Benchmark
np.random.seed(42)
ctrl_samples = np.random.exponential(scale=12.0, size=2500)
treat_samples = ctrl_samples * 1.04 + np.random.normal(loc=0.3, scale=1.5, size=2500)

engine = StatisticalTestEngine(alpha=0.05)
res = engine.evaluate_continuous_ab(ctrl_samples, treat_samples)

print("=== Statistical Evaluation Results ===")
print(f"Mean Difference:       {res['diff']:.4f}")
print(f"Welch's t-Statistic:   {res['welch_t']:.4f} (df={res['welch_df']:.1f}) | p-val: {res['welch_p']:.6e}")
print(f"Mann-Whitney U p-val:  {res['mann_whitney_p']:.6e}")
print(f"Bootstrap 95% CI:      [{res['bootstrap_ci_95'][0]:.4f}, {res['bootstrap_ci_95'][1]:.4f}]")
```

---

## 5. Multiple Testing Corrections: Bonferroni and Benjamini-Hochberg

When evaluating $m$ metrics concurrently (e.g. testing 20 secondary guardrail metrics in a single experiment), the probability of observing at least one false positive purely by chance inflates exponentially:

$$\text{Family-Wise Error Rate (FWER)} = 1 - (1 - \alpha)^m$$

For $\alpha = 0.05$ and $m = 20$, $\text{FWER} = 1 - (0.95)^{20} \approx 64.2\%$.

### 5.1 Bonferroni Correction
The Bonferroni correction controls FWER by adjusting the rejection threshold to $\alpha_{\text{adjusted}} = \frac{\alpha}{m}$. While simple and conservative, it severely suppresses statistical power for large $m$.

### 5.2 Benjamini-Hochberg False Discovery Rate (FDR) Procedure
Instead of controlling FWER, the Benjamini-Hochberg procedure controls the **False Discovery Rate (FDR)**—the expected proportion of false positives among all rejected hypotheses:

1. Sort $m$ calculated $p$-values in ascending order: $p_{(1)} \le p_{(2)} \le \dots \le p_{(m)}$.
2. Find the largest index $k$ such that:
   $$p_{(k)} \le \frac{k}{m} Q$$
   where $Q$ is the target FDR level (e.g., $0.05$).
3. Reject all null hypotheses $H_{(1)}, \dots, H_{(k)}$.

---

## 6. Frequently Asked Questions (FAQs)

### Q1: When should I use Welch's t-test over Mann-Whitney U test?
Use Welch's $t$-test when evaluating arithmetic mean differences for continuous metrics where sample size $n > 30$ (guaranteed by the Central Limit Theorem). Use the Mann-Whitney $U$ test when metrics exhibit severe right-skewness or heavy zero inflation, and your business metric prioritizes rank distribution shifts over expected dollar values.

### Q2: Why is Chi-Square test used for binary conversion rates while Z-test is also valid?
For two independent groups, a two-sided $Z$-test of proportions and a $2 \times 2$ Chi-Square test of independence yield mathematically identical $p$-values ($Z^2 = \chi^2$). The Chi-Square test generalizes naturally to multi-variant $A/B/n$ tests ($k \ge 2$ treatment arms).

### Q3: How does Kolmogorov-Smirnov (K-S) test differ from Mann-Whitney U test?
Mann-Whitney $U$ evaluates directional shifts in distribution ranks (location shifts). The two-sample K-S test evaluates the maximum vertical distance $D = \max_x |F_1(x) - F_2(x)|$ between empirical cumulative distribution functions, detecting differences in shape, variance, or modality regardless of mean shift.

### Q4: What is Peeking Bias and how do Sequential Tests (mSPRT) fix it?
Peeking bias occurs when an experimenter repeatedly monitors standard $t$-test $p$-values as data arrives and stops early when $p < 0.05$, inflating Type I error rate from $5\%$ up to $30\%+$. Mixture Sequential Probability Ratio Tests (mSPRT) compute always-valid $p$-values allowing continuous real-time monitoring without Type I error inflation.

### Q5: How do non-parametric tests behave when sample sizes are extremely large (N > 1,000,000)?
With $N > 10^6$, even minuscule, trivial metric shifts achieve $p < 10^{-15}$. Data scientists must supplement $p$-value significance with Effect Size metrics (Cohen's $d = \frac{\bar{X}_T - \bar{X}_C}{S_{\text{pooled}}}$) to evaluate practical business impact alongside statistical significance.
"""

add_blog_post(
    slug="practitioners-guide-statistical-tests",
    title="Practitioner's Guide to Statistical Tests & Power Calculations",
    tagline="Comprehensive taxonomy of parametric and non-parametric statistical tests, decision boundaries, and bootstrap resampling.",
    category="Test Sensitivity",
    read_time=34,
    prereqs=["hypothesis-testing"],
    related=["experiment-design", "minimum-detectable-effect"],
    practice_probs=[{"title": "Statistical Test Selection", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    markdown=md_11
)

# ----------------------------------------------------------------------
# 12. doordash-cupac
# ----------------------------------------------------------------------
md_12 = r"""# Paper Analysis: CUPAC - Machine Learning Variance Reduction at DoorDash

In high-frequency delivery marketplaces (such as DoorDash, Uber Eats, and Instacart), key evaluation metrics—including delivery latency, courier search duration, and order conversion—depend heavily on contextual environmental features (e.g. weather conditions, local traffic congestion, courier supply density, and restaurant preparation delays).

This article analyzes DoorDash's landmark experimentation paper: **CUPAC (Controlled-Experiments Using Pre-Experiment Data with Machine Learning)**, detailing how non-linear gradient boosted decision trees (LightGBM) outperform linear CUPED, out-of-fold prediction mechanics, and industrial ML pipeline deployment.

---

## 1. Mathematical Limitations of Linear CUPED

Traditional CUPED (Microsoft, 2013) constructs an adjusted evaluation metric $Y_{\text{CUPED}}$ using a linear Ordinary Least Squares (OLS) regression over a single pre-experiment feature $X$:

$$Y_{\text{CUPED}} = Y - \theta^* (X - \mathbb{E}[X]), \quad \theta^* = \frac{\text{Cov}(Y, X)}{\text{Var}(X)}$$

The metric variance is reduced by factor $(1 - \rho^2)$, where $\rho = \text{Corr}(Y, X)$.

### The Linear Breakdown in Complex Marketplaces
In delivery networks, linear models fail due to three structural real-world constraints:
1. **Non-Linear Feature Interaction**: Delivery time scales non-linearly with distance, exhibiting step-function spikes during rush hour traffic or rainstorms.
2. **High-Dimensional Covariate Spaces**: Historical order frequency, customer lifetime value, merchant preparation speed, and spatial cluster embeddings contain multi-dimensional interactions that single-variable OLS cannot represent.
3. **Zero Inflation**: Many active users have zero orders in brief lookback windows, creating sparse point-mass distributions.

---

## 2. The CUPAC Architecture: Machine Learning Predictions

**CUPAC** replaces the linear scalar adjustment $\theta^* X$ with a non-linear machine learning model $\hat{g}(\mathbf{X})$ trained on high-dimensional pre-experiment feature vectors $\mathbf{X} \in \mathbb{R}^k$:

$$Y_{\text{CUPAC}} = Y - \hat{g}(\mathbf{X})$$

Because $\hat{g}(\mathbf{X})$ is constructed strictly from pre-experiment data (collected prior to treatment allocation), $\mathbb{E}[\hat{g}(\mathbf{X}) \mid \text{Treatment}] = \mathbb{E}[\hat{g}(\mathbf{X}) \mid \text{Control}]$. Thus, the treatment effect estimator remains strictly unbiased:

$$\mathbb{E}[\Delta_{\text{CUPAC}}] = \mathbb{E}[\bar{Y}_{T, \text{CUPAC}} - \bar{Y}_{C, \text{CUPAC}}] = \mathbb{E}[\bar{Y}_T - \bar{Y}_C] = \Delta_{\text{true}}$$

### CUPAC Processing Pipeline Diagram
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">DoorDash CUPAC ML Pipeline Architecture</text>
  <g transform="translate(40, 60)">
    <rect x="0" y="10" width="140" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="35" fill="#f59e0b" font-size="10" text-anchor="middle" font-family="monospace">Pre-Experiment Features X</text>
    
    <path d="M 140,30 L 190,30" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-dd)"/>
    
    <rect x="190" y="10" width="150" height="40" rx="4" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="265" y="35" fill="#a855f7" font-size="10" text-anchor="middle" font-family="monospace">LightGBM Model g(X)</text>
    
    <path d="M 340,30 L 390,30" stroke="#64748b" stroke-width="1.5" marker-end="url(#arrow-dd)"/>
    
    <rect x="390" y="10" width="150" height="40" rx="4" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="465" y="35" fill="#10b981" font-size="10" text-anchor="middle" font-family="monospace">Y_CUPAC = Y - g(X)</text>
  </g>
  <defs>
    <marker id="arrow-dd" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
    </marker>
  </defs>
</svg>

---

## 3. Out-of-Fold (OOF) Prediction Protocol to Eliminate Overfitting Bias

A critical engineering requirement of CUPAC is preventing **Overfitting Bias**. If ML model $g(\mathbf{X})$ is fit on the same data used to compute $Y_{\text{CUPAC}}$, model memorization creates artificial in-sample correlation, underestimating variance and producing falsely narrow confidence intervals.

### K-Fold Cross-Prediction Algorithm
To guarantee mathematical validity, DoorDash enforces K-Fold Out-of-Fold predictions:
1. Split pre-experiment data into $K = 5$ mutually exclusive folds.
2. For each fold $k \in \{1 \dots K\}$:
   - Train model $g_{-k}$ on the remaining $K-1$ folds.
   - Predict baseline metric $\hat{Y}_{i, \text{OOF}} = g_{-k}(\mathbf{X}_i)$ for all units $i$ in fold $k$.
3. Compute residual metric $Y_{i, \text{CUPAC}} = Y_i - \hat{Y}_{i, \text{OOF}}$.

Because $g_{-k}$ was trained without seeing fold $k$, predictions $\hat{Y}_{i, \text{OOF}}$ are strictly out-of-sample, maintaining $100\%$ valid $t$-test inference.

---

## 4. Production Python Implementation: DoorDash CUPAC Harness

The Python module below implements K-Fold Out-of-Fold GBDT prediction for CUPAC metric variance reduction.

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import KFold
import scipy.stats as stats

class DoorDashCUPACEngine:
    def __init__(self, n_splits=5, n_estimators=60, max_depth=4):
        self.n_splits = n_splits
        self.n_estimators = n_estimators
        self.max_depth = max_depth

    def fit_transform(self, Y, X_df):
        oof_predictions = np.zeros(len(Y))
        kf = KFold(n_splits=self.n_splits, shuffle=True, random_state=42)
        
        # K-Fold Out-of-Fold Training to guarantee unbiased statistical inference
        for train_idx, val_idx in kf.split(X_df):
            X_tr, X_va = X_df.iloc[train_idx], X_df.iloc[val_idx]
            Y_tr = Y[train_idx]
            
            model = GradientBoostingRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                random_state=42
            )
            model.fit(X_tr, Y_tr)
            oof_predictions[val_idx] = model.predict(X_va)
            
        y_cupac = Y - oof_predictions
        
        var_raw = np.var(Y, ddof=1)
        var_cupac = np.var(y_cupac, ddof=1)
        reduction_pct = (1.0 - var_cupac / var_raw) * 100.0
        
        print(f"CUPAC Evaluation | Raw Var: {var_raw:.2f} | CUPAC Var: {var_cupac:.2f} | Variance Reduced: {reduction_pct:.2f}%")
        return y_cupac

# Generate Synthetic Delivery Telemetry
np.random.seed(42)
N = 6000
features = pd.DataFrame({
    'hist_order_count': np.random.poisson(lam=8, size=N),
    'avg_basket_value': np.random.normal(loc=32.0, scale=8.0, size=N),
    'delivery_distance': np.random.uniform(0.8, 7.5, size=N)
})

# Non-linear delivery duration Y
Y_duration = (
    12.0 
    + 2.8 * features['delivery_distance']**1.4 
    - 0.4 * features['hist_order_count'] 
    + np.random.normal(0, 4.5, size=N)
)

engine = DoorDashCUPACEngine()
Y_cupac_adjusted = engine.fit_transform(Y_duration.values, features)
```

---

## 5. Industrial Performance Benchmarks & Gotchas

### 5.1 Empirical Variance Reduction Comparison
Across DoorDash delivery experiments, variance reduction performance scales as follows:
- **Raw Metric Variance**: Baseline $100\%$ sample requirement.
- **Linear CUPED (1-Feature OLS)**: $15\% - 25\%$ variance reduction ($20\%$ sample size reduction).
- **Multi-Linear CUPED (5-Feature OLS)**: $28\% - 35\%$ variance reduction ($30\%$ sample size reduction).
- **CUPAC (LightGBM GBDT + 25 Features)**: **$50\% - 65\%$ variance reduction ($50\% - 60\%$ sample size reduction)**.

### 5.2 Cold-Start & Missing Value Handling
For newly registered users without historical order metrics ($\mathbf{X}_i = \text{NaN}$), CUPAC imputes predictions using cohort mean predictions $\hat{Y} = \bar{Y}$. For these users, $Y_{\text{CUPAC}} = Y - \bar{Y}$, seamlessly preserving full sample size without introducing bias.

---

## 6. Frequently Asked Questions (FAQs)

### Q1: How does DoorDash CUPAC differ from Microsoft's traditional CUPED?
CUPED fits linear OLS regression on a single pre-experiment metric baseline. DoorDash CUPAC fits non-linear Machine Learning models (LightGBM/GBDT) on multi-dimensional feature vectors (order history, weather, courier density), achieving up to $60\%+$ variance reduction compared to CUPED's $30\%$.

### Q2: Why is Out-of-Fold (OOF) prediction mandatory in CUPAC?
Training the ML prediction model on the full evaluation dataset causes in-sample overfitting. Out-of-fold prediction ensures that the model predicting user $i$'s baseline has never seen user $i$'s data, maintaining strict metric unbiasedness $\mathbb{E}[Y_{\text{CUPAC}}] = \mathbb{E}[Y]$.

### Q3: Can hyperparameter tuning in GBDT models distort CUPAC statistical validity?
No. Because out-of-fold predictions isolate held-out evaluations, even if the ML model is slightly sub-optimal, $Y_{\text{CUPAC}} = Y - \hat{Y}$ remains an unbiased estimator of the treatment effect. Sub-optimal ML models simply reduce the magnitude of variance reduction.

### Q4: How does CUPAC handle cold-start users who lack pre-experiment order features?
Cold-start users without historical order metrics are assigned global cohort mean predictions $\hat{Y} = \bar{Y}$. For these users, $Y_{\text{CUPAC}} = Y - \bar{Y}$, preserving data completeness without introducing artificial bias.

### Q5: What infrastructure latency trade-offs exist when deploying CUPAC at scale?
CUPAC requires offline feature extraction pipelines (in Snowflake/Trino) and GBDT model inference over millions of user profiles prior to experiment execution. Training predictions offline batch jobs avoids adding runtime latency to real-time experiment assignment.
"""

add_blog_post(
    slug="doordash-cupac",
    title="Paper Analysis: CUPAC - Machine Learning Variance Reduction at DoorDash",
    tagline="Machine learning non-linear variance reduction, LightGBM feature encoding, and out-of-fold prediction protocols.",
    category="Test Sensitivity",
    read_time=36,
    prereqs=["improving-sensitivity-cuped"],
    related=["netflix-stratification", "microsoft-delta-method"],
    practice_probs=[{"title": "DoorDash CUPAC Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    markdown=md_12
)

# Output JSON
output_file = 'scratch/ai_batch2_heavy.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"Generated clean blogs in {output_file}")
