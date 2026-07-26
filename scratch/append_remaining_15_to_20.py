import json
import re

with open('scratch/generate_full_10_clean_batch2_articles.py', 'r', encoding='utf-8') as f:
    text = f.read()

# ======================================================================
# 15. ratio-metrics
# ======================================================================
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

text += f'\n\nmd_15 = r"""{md_15}"""\n\nadd_blog("ratio-metrics", "Deep Dive: Ratio Metrics, Delta Method Linearization & Variance Estimators", "Derivation of Delta Method for click-through-rates, conversion ratios, and multi-level data aggregation.", "Test Sensitivity", 34, ["microsoft-delta-method"], ["fundamentals-of-econometrics", "intro-to-econometrics"], [{{"title": "Ratio Metric Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}}], md_15)\n'

# ======================================================================
# 16. fundamentals-of-econometrics
# ======================================================================
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

text += f'\n\nmd_16 = r"""{md_16}"""\n\nadd_blog("fundamentals-of-econometrics", "Fundamentals of Econometrics: OLS, Instrumental Variables & Causal Inference", "Ordinary Least Squares assumptions, Gauss-Markov theorem, endogeneity, and 2SLS Instrumental Variables.", "Econometrics", 36, ["ratio-metrics"], ["intro-to-econometrics", "econometrics-course"], [{{"title": "Econometric 2SLS Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}}], md_16)\n'

with open('scratch/generate_full_10_clean_batch2_articles.py', 'w', encoding='utf-8') as f_out:
    f_out.write(text)

print("Appended Blogs 15 and 16 successfully.")
