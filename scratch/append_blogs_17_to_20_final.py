import json
import re

with open('scratch/generate_full_10_clean_batch2_articles.py', 'r', encoding='utf-8') as f:
    text = f.read()

# ======================================================================
# 17. intro-to-econometrics
# ======================================================================
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

text += f'\n\nmd_17 = r"""{md_17}"""\n\nadd_blog("intro-to-econometrics", "Coursera: Introduction to Econometrics & Panel Data Analysis", "Fixed Effects vs Random Effects models, Hausman specification test, and pooled cross-sectional regressions.", "Econometrics", 34, ["fundamentals-of-econometrics"], ["econometrics-course", "learn-time-series"], [{{"title": "Panel Data Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}}], md_17)\n'

# ======================================================================
# 18. econometrics-course
# ======================================================================
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

text += f'\n\nmd_18 = r"""{md_18}"""\n\nadd_blog("econometrics-course", "Advanced Econometric Modeling: Difference-in-Differences & Synthetic Controls", "Parallel trends assumption, staggered diff-in-diff, synthetic control optimization, and placebo tests.", "Econometrics", 36, ["intro-to-econometrics"], ["learn-time-series", "time-series-basics"], [{{"title": "Diff-in-Diff Causal Engine", "difficulty": "Hard", "url": "https://leetcode.com/problems/random-pick-with-weight/"}}], md_18)\n'

# ======================================================================
# 19. learn-time-series
# ======================================================================
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

text += f'\n\nmd_19 = r"""{md_19}"""\n\nadd_blog("learn-time-series", "Time Series Analysis: Stationarity, Autocorrelation & Stationarity Tests", "Stationary processes, Augmented Dickey-Fuller (ADF) test, ACF/PACF plots, and white noise invariants.", "Time Series", 34, ["econometrics-course"], ["time-series-basics"], [{{"title": "Time Series Stationarity Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}}], md_19)\n'

# ======================================================================
# 20. time-series-basics
# ======================================================================
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

text += f'\n\nmd_20 = r"""{md_20}"""\n\nadd_blog("time-series-basics", "Time Series Decomposition: Trend, Seasonality, Residuals & Exponential Smoothing", "Additive vs multiplicative decomposition, Holt-Winters exponential smoothing, and seasonal adjustments.", "Time Series", 34, ["learn-time-series"], ["arima-model-for-time-series"], [{{"title": "Holt-Winters Engine", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}}], md_20)\n'

with open('scratch/generate_full_10_clean_batch2_articles.py', 'w', encoding='utf-8') as f_out:
    f_out.write(text)

print("Appended Blogs 17, 18, 19, and 20 successfully! Full Batch 2 complete!")
