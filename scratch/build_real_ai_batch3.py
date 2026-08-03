import json
import re

blogs = {}

def add_blog(slug, title, tagline, category, read_time, prereqs, related, practice_probs, markdown):
    headers = [line.strip() for line in markdown.splitlines() if re.match(r'^#{1,6}\s+[A-Za-z0-9]', line.strip())]
    header_counts = {}
    for h in headers:
        header_counts[h] = header_counts.get(h, 0) + 1
        if header_counts[h] > 1:
            raise ValueError(f"DUPLICATE HEADER IN '{slug}': {h}")
            
    length = len(markdown)
    assert length >= 10100, f"Blog '{slug}' is too short ({length} chars). Needs >= 10,100 chars."
    print(f"Verified '{slug}': {length:,} chars. Start: {repr(markdown[:65])}")
    
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
# 21. time-series-models
# ----------------------------------------------------------------------
md_21 = r"""# Time Series Models: ARMA, ARIMA, SARIMAX & Volatility Modeling (GARCH)

Time series modeling underpins financial engineering, demand forecasting, macroeconomic policy formulation, and real-time infrastructure telemetry analytics.

A sequential stochastic process $\{Y_t\}_{t \in \mathbb{Z}}$ maps temporal observations into structured mathematical frameworks capable of isolating trend, seasonality, autoregressive dependence, and conditional variance dynamics.

---

## 1. Classical Stationary Time Series Models

### 1.1 Autoregressive Models (AR($p$))
An Autoregressive process of order $p$, denoted $\text{AR}(p)$, models current observation $Y_t$ as a linear combination of its previous $p$ historical values plus white noise error term $\varepsilon_t \sim \mathcal{N}(0, \sigma^2)$:

$$Y_t = c + \sum_{i=1}^p \phi_i Y_{t-i} + \varepsilon_t$$

Using the **Lag Operator** $L^k Y_t = Y_{t-k}$, the $\text{AR}(p)$ model is expressed concisely as $\Phi(L) Y_t = c + \varepsilon_t$, where polynomial $\Phi(L) = 1 - \sum_{i=1}^p \phi_i L^i$.

**Stationarity Invariant**: An $\text{AR}(p)$ process is wide-sense stationary if and only if all roots of the characteristic polynomial equation $\Phi(z) = 0$ lie strictly outside the complex unit circle ($|z| > 1$).

### 1.2 Moving Average Models (MA($q$))
A Moving Average process of order $q$, denoted $\text{MA}(q)$, models $Y_t$ as a linear combination of current and $q$ previous unobserved white noise shocks:

$$Y_t = \mu + \varepsilon_t + \sum_{j=1}^q \theta_j \varepsilon_{t-j} = \mu + \Theta(L) \varepsilon_t$$

Unlike $\text{AR}(p)$ processes, all finite $\text{MA}(q)$ processes are unconditionally stationary regardless of parameter values.

### 1.3 Combined ARMA($p, q$) Models
Combining autoregressive memory and moving average noise terms yields the general $\text{ARMA}(p, q)$ model:

$$Y_t = c + \sum_{i=1}^p \phi_i Y_{t-i} + \varepsilon_t + \sum_{j=1}^q \theta_j \varepsilon_{t-j}$$

---

## 2. Non-Stationary Processes & Differencing (ARIMA)

Real-world physical and economic data exhibit stochastic trends (unit roots) violating stationarity. The **Autoregressive Integrated Moving Average** model $\text{ARIMA}(p, d, q)$ applies $d$-th order differencing $\Delta^d Y_t = (1 - L)^d Y_t$ to achieve stationarity:

$$\Phi(L) (1 - L)^d Y_t = c + \Theta(L) \varepsilon_t$$

```
Raw Series Y_t (Non-Stationary Trend)
         |
    [1st Order Difference ΔY_t = Y_t - Y_{t-1}]
         v
Stationary Series (Constant Mean & Variance)
         |
    [Fit ARMA(p, q) Model]
```

---

## 3. Seasonal ARIMA with Exogenous Regressors (SARIMAX)

When time series signals exhibit periodic seasonal cycles (periodicity $m$, e.g., $m=12$ for monthly or $m=7$ for daily data) alongside external explanatory covariates $\mathbf{X}_t$, the **SARIMAX**$(p, d, q) \times (P, D, Q)_m$ model is applied:

$$\Phi_p(L) \tilde{\Phi}_P(L^m) (1 - L)^d (1 - L^m)^D Y_t = \boldsymbol{\beta}^T \mathbf{X}_t + \Theta_q(L) \tilde{\Theta}_Q(L^m) \varepsilon_t$$

where $\tilde{\Phi}_P(L^m)$ and $\tilde{\Theta}_Q(L^m)$ denote seasonal autoregressive and moving average polynomials of order $P$ and $Q$.

---

## 4. Heteroskedasticity & Volatility Modeling (GARCH)

Financial asset returns exhibit **Volatility Clustering** (periods of low volatility followed by bursts of high volatility), violating constant variance assumptions $\text{Var}(\varepsilon_t) = \sigma^2$.

The **Generalized Autoregressive Conditional Heteroskedasticity** $\text{GARCH}(p, q)$ model explicitly formulates time-varying conditional variance $\sigma_t^2 = \text{Var}(\varepsilon_t \mid \mathcal{F}_{t-1})$:

$$\varepsilon_t = \sigma_t z_t, \quad z_t \sim \mathcal{i.i.d.} \, \mathcal{N}(0, 1)$$

$$\sigma_t^2 = \omega + \sum_{i=1}^q \alpha_i \varepsilon_{t-i}^2 + \sum_{j=1}^p \beta_j \sigma_{t-j}^2$$

- $\alpha_i$ measures reaction to recent volatility shocks (ARCH effect).
- $\beta_j$ measures persistence of conditional volatility (GARCH effect).
- **Stability Invariant**: $\sum_{i=1}^q \alpha_i + \sum_{j=1}^p \beta_j < 1$.

---

## 5. Production Python Implementation (SARIMAX & GARCH)

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from arch import arch_model
import matplotlib.pyplot as plt

def fit_sarimax_pipeline(df: pd.DataFrame, target_col: str, exog_cols: list) -> sm.tsa.statespace.SARIMAXResults:
    # 1. Extract target series and exogenous regressors
    y = df[target_col]
    X = df[exog_cols] if exog_cols else None

    # 2. Fit SARIMAX(1, 1, 1)x(1, 1, 1)_12 model
    model = sm.tsa.statespace.SARIMAX(
        y,
        exog=X,
        order=(1, 1, 1),
        seasonal_order=(1, 1, 1, 12),
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    
    results = model.fit(disp=False)
    print("SARIMAX Model Summary:")
    print(results.summary())
    return results

def fit_garch_volatility(returns: pd.Series) -> None:
    # Fit GARCH(1, 1) model to asset log-returns
    am = arch_model(returns * 100, vol='Garch', p=1, o=0, q=1, dist='Normal')
    res = am.fit(disp='off')
    print("GARCH(1, 1) Volatility Model Summary:")
    print(res.summary())
```

---

## 6. Vector Autoregression (VAR) for Multivariate Systems

When multiple dynamic time series variables mutually influence each other (e.g. interest rates, inflation, and unemployment), univariate models fail to capture inter-variable feedback.

The **Vector Autoregression** $\text{VAR}(p)$ model tracks an $K \times 1$ vector of endogenous variables $\mathbf{Y}_t = [Y_{1, t}, Y_{2, t}, \dots, Y_{K, t}]^T$:

$$\mathbf{Y}_t = \mathbf{c} + \mathbf{A}_1 \mathbf{Y}_{t-1} + \mathbf{A}_2 \mathbf{Y}_{t-2} + \dots + \mathbf{A}_p \mathbf{Y}_{t-p} + \boldsymbol{\varepsilon}_t$$

where $\mathbf{A}_i$ are $K \times K$ coefficient matrices and $\boldsymbol{\varepsilon}_t \sim \mathcal{N}(\mathbf{0}, \boldsymbol{\Sigma})$.

---

## Frequently Asked Questions (FAQs)

### Q1: How do I select optimal orders $(p, d, q)$ for ARIMA models?
Inspect the sample Autocorrelation Function (ACF) and Partial Autocorrelation Function (PACF) plots. Exponential decay in ACF with sharp cutoff at lag $p$ in PACF suggests $\text{AR}(p)$. Sharp cutoff at lag $q$ in ACF suggests $\text{MA}(q)$. Use grid-search optimization minimizing Akaike Information Criterion (AIC).

### Q2: What is the Augmented Dickey-Fuller (ADF) test?
The ADF test evaluates the null hypothesis $H_0: \gamma = 0$ (unit root exists $\implies$ series is non-stationary) against alternative $H_1: \gamma < 0$. Rejecting $H_0$ ($p < 0.05$) confirms stationarity.

### Q3: What is the difference between ARCH and GARCH?
$\text{ARCH}(q)$ models conditional variance strictly as a weighted sum of past squared residual shocks $\varepsilon_{t-i}^2$. $\text{GARCH}(p, q)$ adds lagged conditional variance terms $\sigma_{t-j}^2$, achieving parsimonious parameterization with fewer total terms.

### Q4: Why is strict stationarity critical for linear time series models?
Without stationarity, statistical properties (mean, variance, auto-covariance) vary over time, causing OLS estimators to produce spurious regressions ($R^2 \approx 1$ with invalid $t$-statistics).

### Q5: How do exogenous regressors improve forecasting accuracy in SARIMAX?
Exogenous variables $\mathbf{X}_t$ supply real-time external signal context (e.g. promotional spend or holiday indicators) that cannot be inferred purely from past target series values.
"""

# ----------------------------------------------------------------------
# 22. forecasting-task-with-solution
# ----------------------------------------------------------------------
md_22 = r"""# Industrial Demand & Sales Forecasting Case Study: End-to-End Pipeline & Solutions

Demand forecasting is a mission-critical machine learning pipeline in retail, e-commerce, logistics, and supply chain management. Accurate forecasts minimize stockouts, reduce inventory holding costs, and optimize workforce scheduling.

This case study details the construction of an industrial-grade end-to-end sales forecasting system for a multi-store retail enterprise processing 10,000+ SKU time series.

---

## 1. Problem Formulation & Data Architecture

Given historical daily sales records across $S$ stores and $I$ items, forecast daily sales volume $Y_{s, i, t+h}$ for horizon $h \in [1, 28]$ days ahead.

### Evaluation Metrics
1. **Root Mean Squared Error (RMSE)**: Penalizes large magnitude forecast errors heavily.
2. **Mean Absolute Percentage Error (MAPE)**: Scale-independent percentage metric.
3. **Weighted Absolute Percentage Error (WAPE)**: Robust against zero-sales days:

$$\text{WAPE} = \frac{\sum_{t} |Y_t - \hat{Y}_t|}{\sum_{t} Y_t}$$

---

## 2. Temporal Feature Engineering Pipeline

Creating predictive tabular features from raw timestamped signals is essential for boosted decision tree models (LightGBM / XGBoost).

```
Raw Sales History (Timestamp, Store, Item, Sales)
                   |
     +-------------+-------------+
     |                           |
[Lag Features]           [Rolling Statistics]
Y_{t-1}, Y_{t-7}, Y_{t-28}   Mean, Std, Min, Max over 7/14/28 days
     |                           |
     +-------------+-------------+
                   |
      [Categorical Calendar Encodings]
      DayOfWeek, Month, IsHoliday, PromoFlag
                   |
                   v
         LightGBM Regressor Matrix
```

### 2.1 Lagged Sales Features
- $Y_{t-7}, Y_{t-14}, Y_{t-28}$: Direct historical values at identical weekly seasonality lags.

### 2.2 Rolling Window Aggregations
- **Rolling Mean**: $\bar{Y}_{t, w} = \frac{1}{w} \sum_{k=1}^w Y_{t-k}$ for $w \in \{7, 14, 28, 56\}$.
- **Rolling Standard Deviation**: $\sigma_{t, w} = \sqrt{\frac{1}{w-1} \sum_{k=1}^w (Y_{t-k} - \bar{Y}_{t, w})^2}$ capturing sales variance volatility.

### 2.3 Calendar & Categorical Embeddings
- Cyclical trigonometric transformations for day of year:

$$\sin\left(\frac{2\pi \cdot \text{day}}{365}\right), \quad \cos\left(\frac{2\pi \cdot \text{day}}{365}\right)$$

---

## 3. Backtesting Strategy: Rolling Window Cross-Validation

Standard random $K$-Fold cross-validation leaks future information into past training slices. **Expanding Window Cross-Validation** enforces strict temporal causality:

```
Fold 1: [ Train: Month 1-6 ] -> [ Validation: Month 7 ]
Fold 2: [ Train: Month 1-7 ] -> [ Validation: Month 8 ]
Fold 3: [ Train: Month 1-8 ] -> [ Validation: Month 9 ]
```

---

## 4. Production Python Implementation (LightGBM & Evaluation)

```python
import numpy as np
import pandas as pd
import lightgbm as lgb
from typing import List, Tuple

def create_forecasting_features(df: pd.DataFrame) -> pd.DataFrame:
    data = df.copy()
    data['date'] = pd.to_datetime(data['date'])
    data = data.sort_values(['store_id', 'item_id', 'date']).reset_index(drop=True)

    # Calendar features
    data['dayofweek'] = data['date'].dt.dayofweek
    data['month'] = data['date'].dt.month
    data['is_weekend'] = data['dayofweek'].isin([5, 6]).astype(int)

    # Grouped lag & rolling features
    grp = data.groupby(['store_id', 'item_id'])['sales']

    for lag in [7, 14, 28]:
        data[f'sales_lag_{lag}'] = grp.shift(lag)

    for win in [7, 28]:
        data[f'sales_roll_mean_{win}'] = grp.shift(1).transform(lambda x: x.rolling(win).mean())
        data[f'sales_roll_std_{win}'] = grp.shift(1).transform(lambda x: x.rolling(win).std())

    return data.dropna().reset_index(drop=True)

def train_lightgbm_forecaster(train_df: pd.DataFrame, val_df: pd.DataFrame, feature_cols: List[str], target_col: str):
    X_train, y_train = train_df[feature_cols], train_df[target_col]
    X_val, y_val = val_df[feature_cols], val_df[target_col]

    model = lgb.LGBMRegressor(
        n_estimators=1000,
        learning_rate=0.03,
        num_leaves=63,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        callbacks=[lgb.early_stopping(50, verbose=False)]
    )

    preds = model.predict(X_val)
    wape = np.sum(np.abs(y_val - preds)) / np.sum(y_val)
    print(f"Validation WAPE: {wape * 100:.2f}%")
    return model
```

---

## 5. Industrial Deployment Considerations

1. **Cold-Start Handling**: For newly launched items with no sales history, substitute item-level rolling statistics with category-level average sales.
2. **Recursive vs Direct Forecasting**: Direct forecasting trains separate models for each horizon step $h \in [1, 28]$. Recursive forecasting uses step $t+1$ prediction to update lag features for step $t+2$. Direct forecasting avoids error accumulation.

---

## Frequently Asked Questions (FAQs)

### Q1: Why use LightGBM instead of ARIMA for large retail datasets?
LightGBM processes millions of store-item-date rows concurrently, learns cross-series global patterns, natively handles non-linear promo interactions, and evaluates in seconds compared to fitting 10,000 independent ARIMA models.

### Q2: What is the main cause of data leakage in time series feature engineering?
Calculating rolling statistics or mean encodings without shifting target values (e.g. using `sales` at time $t$ to calculate rolling mean for time $t$) leaks target answers into training input vectors.

### Q3: How do I handle intermittent or sparse zero sales data?
For sparse items (where $>80\%$ of days have zero sales), use Croston's Method or specialized zero-inflated Poisson regression models rather than standard MSE regression.

### Q4: How is forecast uncertainty measured in tree-based models?
Use Quantile Loss Regression (`objective='quantile'`) with LightGBM to estimate $10\text{th}$, $50\text{th}$, and $90\text{th}$ prediction intervals.

### Q5: How often should forecasting models be retrained in production?
Retrain quarterly or monthly on full historical windows, while executing daily incremental updates for lag features and rolling aggregations.
"""

# ----------------------------------------------------------------------
# 23. linear-regression-econ
# ----------------------------------------------------------------------
md_23 = r"""# Applied Linear Regression & Diagnostic Analytics: Gauss-Markov Invariants & OLS Mechanics

Linear regression is the foundational analytical technique connecting empirical econometrics, causal inference, and supervised machine learning. 

Understanding the mathematical foundations of Ordinary Least Squares (OLS), diagnostic tests for assumption violations, and robust estimation methods is mandatory for quantitative analysis.

---

## 1. Mathematical Derivation of Ordinary Least Squares (OLS)

Given response vector $\mathbf{Y} \in \mathbb{R}^N$ and design matrix $\mathbf{X} \in \mathbb{R}^{N \times K}$ containing $K$ explanatory variables across $N$ observations:

$$\mathbf{Y} = \mathbf{X} \boldsymbol{\beta} + \boldsymbol{\varepsilon}$$

OLS finds the parameter vector $\hat{\boldsymbol{\beta}}$ minimizing the Sum of Squared Residuals (SSR):

$$S(\boldsymbol{\beta}) = \sum_{i=1}^N e_i^2 = \boldsymbol{e}^T \boldsymbol{e} = (\mathbf{Y} - \mathbf{X}\boldsymbol{\beta})^T (\mathbf{Y} - \mathbf{X}\boldsymbol{\beta}) = \mathbf{Y}^T \mathbf{Y} - 2\boldsymbol{\beta}^T \mathbf{X}^T \mathbf{Y} + \boldsymbol{\beta}^T \mathbf{X}^T \mathbf{X} \boldsymbol{\beta}$$

Setting the gradient vector with respect to $\boldsymbol{\beta}$ equal to zero yields the **Normal Equations**:

$$\frac{\partial S}{\partial \boldsymbol{\beta}} = -2 \mathbf{X}^T \mathbf{Y} + 2 \mathbf{X}^T \mathbf{X} \boldsymbol{\beta} = \mathbf{0} \implies \mathbf{X}^T \mathbf{X} \hat{\boldsymbol{\beta}} = \mathbf{X}^T \mathbf{Y}$$

Assuming matrix $\mathbf{X}^T \mathbf{X}$ is non-singular (full column rank $\text{rank}(\mathbf{X}) = K$):

$$\hat{\boldsymbol{\beta}} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{Y}$$

---

## 2. The Gauss-Markov Theorem

**Theorem**: Under Gauss-Markov assumptions 1–5, the OLS estimator $\hat{\boldsymbol{\beta}}$ is the **BLUE** (**Best Linear Unbiased Estimator**) possessing the minimum sampling variance among all linear unbiased estimators.

### The 5 Classical Gauss-Markov Assumptions
1. **Linearity in Parameters**: $\mathbf{Y} = \mathbf{X}\boldsymbol{\beta} + \boldsymbol{\varepsilon}$.
2. **Strict Exogeneity**: $\mathbb{E}[\boldsymbol{\varepsilon} \mid \mathbf{X}] = \mathbf{0}$.
3. **No Perfect Multicollinearity**: $\text{rank}(\mathbf{X}) = K \implies \det(\mathbf{X}^T \mathbf{X}) \ne 0$.
4. **Spherical Errors (Spherical Variance)**:
   - **No Heteroskedasticity**: $\text{Var}(\varepsilon_i \mid \mathbf{X}) = \sigma^2$.
   - **No Autocorrelation**: $\text{Cov}(\varepsilon_i, \varepsilon_j \mid \mathbf{X}) = 0$ for $i \ne j$.
   - Combined: $\text{Var}(\boldsymbol{\varepsilon} \mid \mathbf{X}) = \sigma^2 \mathbf{I}_N$.
5. **Normality of Errors** (Optional for small samples): $\boldsymbol{\varepsilon} \mid \mathbf{X} \sim \mathcal{N}(\mathbf{0}, \sigma^2 \mathbf{I}_N)$.

---

## 3. Regression Diagnostics & Assumption Violations

### 3.1 Heteroskedasticity: Breusch-Pagan Test & White Standard Errors
When error variance is non-constant ($\text{Var}(\varepsilon_i) = \sigma_i^2$), OLS point estimates remain unbiased but standard errors are biased downward, causing artificially small $p$-values and invalid hypothesis testing.

**Remedy**: Apply **White's Heteroskedasticity-Consistent (HC) Robust Standard Errors**:

$$\widehat{\text{Var}}_{\text{HC}}(\hat{\boldsymbol{\beta}}) = (\mathbf{X}^T \mathbf{X})^{-1} \left( \sum_{i=1}^N e_i^2 \mathbf{x}_i \mathbf{x}_i^T \right) (\mathbf{X}^T \mathbf{X})^{-1}$$

### 3.2 Multicollinearity: Variance Inflation Factor (VIF)
Multicollinearity occurs when explanatory variables are highly correlated. This inflates parameter sampling variance $\text{Var}(\hat{\beta}_j) = \frac{\sigma^2}{\sum (X_{ij} - \bar{X}_j)^2 (1 - R_j^2)}$.

**Metric**: **Variance Inflation Factor**:

$$\text{VIF}_j = \frac{1}{1 - R_j^2}$$

where $R_j^2$ is the coefficient of determination from regressing $X_j$ on all other explanatory variables. $\text{VIF}_j > 10$ indicates severe multicollinearity.

---

## 4. Production Python Diagnostic Implementation

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.stats.diagnostic import het_breuschpagan

def run_regression_diagnostics(df: pd.DataFrame, target_col: str, feature_cols: list):
    X = sm.add_constant(df[feature_cols])
    y = df[target_col]

    # 1. Fit OLS model
    ols_model = sm.OLS(y, X).fit()
    print(ols_model.summary())

    # 2. Check Variance Inflation Factors (VIF)
    vif_data = pd.DataFrame()
    vif_data["Feature"] = X.columns
    vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
    print("\nVariance Inflation Factors (VIF):")
    print(vif_data)

    # 3. Breusch-Pagan Test for Heteroskedasticity
    bp_test = het_breuschpagan(ols_model.resid, ols_model.model.exog)
    labels = ['LM Statistic', 'LM-Test p-value', 'F-Statistic', 'F-Test p-value']
    print("\nBreusch-Pagan Test Results:")
    print(dict(zip(labels, bp_test)))

    # 4. If heteroskedasticity present (p < 0.05), compute HC3 robust standard errors
    if bp_test[1] < 0.05:
        print("\nHeteroskedasticity detected! Computing HC3 Robust Standard Errors:")
        robust_model = sm.OLS(y, X).fit(cov_type='HC3')
        print(robust_model.summary())
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between $R^2$ and Adjusted $R^2$?
$R^2 = 1 - \frac{\text{SSR}}{\text{SST}}$ increases monotonically whenever a new variable is added. Adjusted $R^2 = 1 - \left[ \frac{N-1}{N-K-1} (1 - R^2) \right]$ penalizes model complexity $K$, decreasing if new variables fail to reduce SSR sufficiently.

### Q2: Why does OLS fail when $\text{rank}(\mathbf{X}) < K$?
If $\mathbf{X}$ has linear dependencies among columns, $\mathbf{X}^T \mathbf{X}$ is singular and non-invertible ($\det(\mathbf{X}^T \mathbf{X}) = 0$), preventing computation of OLS coefficients.

### Q3: What is Omitted Variable Bias (OVB)?
OVB occurs when a relevant variable $Z$ correlated with included regressor $X$ is omitted. The bias formula is $\text{Bias}(\hat{\beta}_X) = \beta_Z \cdot \frac{\text{Cov}(X, Z)}{\text{Var}(X)}$.

### Q4: How does Ridge/Lasso Regression relate to OLS?
Ridge ($L_2$) and Lasso ($L_1$) add penalty terms $\lambda \|\boldsymbol{\beta}\|_2^2$ or $\lambda \|\boldsymbol{\beta}\|_1$ to the OLS SSR loss function. This introduces slight estimation bias to drastically reduce variance under multicollinearity.

### Q5: When should I use Log-Linear or Log-Log functional forms?
Use Log-Linear ($\ln Y = \beta_0 + \beta_1 X$) when $X$ induces relative percentage changes in $Y$ ($\beta_1 \times 100\%$). Use Log-Log ($\ln Y = \beta_0 + \beta_1 \ln X$) when $\beta_1$ represents constant elasticity.
"""

# ----------------------------------------------------------------------
# 24. learn-python-kaggle
# ----------------------------------------------------------------------
md_24 = r"""# Python for Data Science & Numerical Computing: NumPy Vectorization, SciPy & Memory Optimization

Python is the undisputed primary programming language of modern data science, machine learning, and AI engineering. 

However, pure Python interpreted code executes with significant performance overhead due to dynamic typing and Global Interpreter Lock (GIL) constraints. Numerical computing libraries (NumPy, SciPy, Pandas) bypass Python runtime slowdowns by dispatching vectorized operations directly to underlying compiled C and Fortran linear algebra subroutines (BLAS, LAPACK).

---

## 1. NumPy Array Architecture & Memory Layout

A `numpy.ndarray` is a contiguous block of homogeneous memory coupled with metadata specifying data type (`dtype`), dimensions (`shape`), and byte offset strides (`strides`).

### 1.1 Memory Strides & C-Contiguous vs Fortran-Contiguous Layout
- **C-Contiguous (Row-Major)**: Consecutive elements in a row are placed next to each other in memory.
- **Fortran-Contiguous (Column-Major)**: Consecutive elements in a column are placed next to each other.

```
Row-Major (C Layout):    [ (0,0), (0,1), (0,2), (1,0), (1,1), (1,2) ]
Col-Major (F Layout):    [ (0,0), (1,0), (0,1), (1,1), (0,2), (1,2) ]
```

Iterating along the contiguous stride dimension maximizes CPU L1/L2 cache hits, running up to **$50 \times$ faster** than strided iteration.

---

## 2. Vectorization Mechanics & SIMD Hardware Acceleration

Vectorization eliminates explicit `for` loops in Python by executing instructions over array blocks using CPU SIMD (Single Instruction, Multiple Data) vector registers (AVX-512, ARM NEON).

$$\text{Vector Addition}: \quad \mathbf{C} = \mathbf{A} + \mathbf{B} \implies \text{SIMD Parallel Hardware Addition}$$

---

## 3. NumPy Broadcasting Rules

Broadcasting allows arithmetic operations between arrays of different shapes without making redundant memory copies:

### The Broadcasting Invariant
Two dimensions are compatible for broadcasting if:
1. They are equal, OR
2. One of the dimensions is $1$.

```
Array A (2D):   5 x 4
Array B (1D):       4
Result (2D):    5 x 4  (Array B is broadcast across 5 rows)
```

---

## 4. Production Python Implementation (NumPy & Memory Tuning)

```python
import numpy as np
import time

def compare_vectorization_performance(size: int = 10_000_000):
    # 1. Pure Python Loop
    list_a = list(range(size))
    list_b = list(range(size))

    start = time.perf_counter()
    list_res = [list_a[i] + list_b[i] for i in range(size)]
    py_time = time.perf_counter() - start

    # 2. NumPy Vectorized SIMD Operation
    arr_a = np.arange(size, dtype=np.int64)
    arr_b = np.arange(size, dtype=np.int64)

    start = time.perf_counter()
    arr_res = arr_a + arr_b
    np_time = time.perf_counter() - start

    print(f"Pure Python Time: {py_time:.4f}s")
    print(f"NumPy SIMD Time:  {np_time:.4f}s")
    print(f"Speedup Factor:   {py_time / np_time:.2f}x faster")

def optimize_array_memory(arr: np.ndarray) -> np.ndarray:
    # Convert float64 to float32 if precision bounds allow (reduces RAM by 50%)
    if arr.dtype == np.float64:
        return arr.astype(np.float32)
    return arr
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between `np.reshape` and `np.ravel` / `.flatten()`?
`flatten()` always returns a new copy of the array in memory. `ravel()` and `reshape()` return a memory view of the original array whenever possible without allocating new memory.

### Q2: Why does `np.matrix` exist and should I use it?
`np.matrix` is a legacy 2D matrix class deprecated in favor of standard multi-dimensional `np.ndarray` objects using the `@` matrix multiplication operator (`A @ B`).

### Q3: What is a memory view in NumPy?
A view shares the exact underlying data buffer with the original array. Modifying elements in a view mutates the original array.

### Q4: How does memory alignment affect performance in NumPy?
Arrays whose memory addresses align with 64-byte CPU cache line boundaries execute SIMD instructions significantly faster without split-cache penalty hits.

### Q5: What is the role of SciPy in numerical computing?
SciPy builds on NumPy array buffers to provide high-performance routines for optimization (`scipy.optimize`), linear algebra (`scipy.linalg`), signal processing (`scipy.signal`), and spatial tree indices (`scipy.spatial`).
"""

# ----------------------------------------------------------------------
# 25. algorithmic-exercises
# ----------------------------------------------------------------------
md_25 = r"""# Data Science Algorithmic Exercises: High-Performance Array Operations & Matrix Computations

Algorithmic efficiency in data science separates production-grade engineering from slow prototypes. 

This module presents solutions to core data science array manipulation algorithms, sliding window computations, matrix transformations, and numerical optimization primitives.

---

## 1. Matrix Transformations & Sliding Windows

### 1.1 2D Convolution via Sliding Window
Given image matrix $\mathbf{X} \in \mathbb{R}^{M \times N}$ and kernel $\mathbf{K} \in \mathbb{R}^{k \times k}$, calculate spatial 2D convolution output $\mathbf{Y}$:

$$\mathbf{Y}[i, j] = \sum_{m=0}^{k-1} \sum_{n=0}^{k-1} \mathbf{X}[i+m, j+n] \cdot \mathbf{K}[m, n]$$

Using NumPy `stride_tricks`, 2D sliding windows are extracted as zero-copy 4D views, accelerating convolution operations.

---

## 2. Distance Matrix Computations (Pairwise Distances)

Given $N$ samples $\mathbf{X} \in \mathbb{R}^{N \times D}$ and $M$ samples $\mathbf{Y} \in \mathbb{R}^{M \times D}$, calculate pairwise Euclidean distance matrix $\mathbf{D} \in \mathbb{R}^{N \times M}$ where:

$$D_{ij}^2 = \|\mathbf{x}_i - \mathbf{y}_j\|_2^2 = \|\mathbf{x}_i\|^2 + \|\mathbf{y}_j\|^2 - 2 \mathbf{x}_i \cdot \mathbf{y}_j^T$$

---

## 3. Production Python Implementation (Algorithmic Exercises)

```python
import numpy as np

def compute_pairwise_distances(X: np.ndarray, Y: np.ndarray) -> np.ndarray:
    # X: (N, D), Y: (M, D)
    # Uses expanded norm identity to avoid memory loops
    X_norms = np.sum(X**2, axis=1, keepdims=True)  # (N, 1)
    Y_norms = np.sum(Y**2, axis=1, keepdims=True).T # (1, M)

    # Matrix multiplication for dot products
    dot_product = np.dot(X, Y.T) # (N, M)

    # D^2 = ||X||^2 + ||Y||^2 - 2 * X @ Y.T
    dist_sq = X_norms + Y_norms - 2 * dot_product
    dist_sq = np.maximum(dist_sq, 0.0) # Clip numerical precision errors
    return np.sqrt(dist_sq)

def sliding_window_2d(arr: np.ndarray, window_shape: tuple) -> np.ndarray:
    # Extracts zero-copy sliding windows from 2D array
    from numpy.lib.stride_tricks import sliding_window_view
    return sliding_window_view(arr, window_shape)
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is matrix expansion faster than computing `np.linalg.norm(X[i] - Y[j])` in a loop?
The expanded vector identity replaces $N \times M$ individual vector loops with a single C-BLAS GEMM matrix multiplication (`np.dot`), exploiting multi-threaded CPU matrix hardware.

### Q2: What is `numpy.lib.stride_tricks.sliding_window_view`?
It generates a multi-dimensional array view over sliding windows without allocating extra RAM memory, executing window operations in $O(1)$ memory allocation time.

### Q3: How do numerical precision errors produce negative distance values?
Floating-point rounding errors in $X^2 + Y^2 - 2XY$ can yield small negative results (e.g. $-10^{-16}$) for identical vectors. `np.maximum(dist_sq, 0.0)` prevents NaN errors during square root operations.

### Q4: How can Memory Error crashes be avoided when computing large distance matrices?
Chunk input dataset into mini-batches of size $B = 1000$, computing block distance matrices iteratively to cap peak memory allocation.

### Q5: What is the time complexity of pairwise Euclidean distance calculation?
For $N$ vectors of dimension $D$, the computational complexity is $O(N \cdot M \cdot D)$ arithmetic operations.
"""

# ----------------------------------------------------------------------
# 26. study-plans-leetcode
# ----------------------------------------------------------------------
md_26 = r"""# LeetCode Study Plans for Data Engineers & Data Scientists: Array Tricks & Priority Queues

Data Science and Data Engineering technical interviews evaluate algorithmic fluency across array manipulations, hashing, two-pointer techniques, sliding windows, and SQL matrix operations.

This study plan catalogs essential algorithmic patterns tested at top tech organizations (Meta, Google, Netflix, Amazon).

---

## 1. Essential Algorithmic Patterns

### 1.1 Two Pointers & Sliding Window
- **Use Case**: Finding contiguous subarrays or string windows satisfying specific constraints in $O(N)$ time.
- **Pattern**: Maintain left ($L$) and right ($R$) pointers sliding monotonically across the array.

### 1.2 Top-$K$ Frequent Elements & Priority Queues
- **Use Case**: Retrieving top $K$ frequent items from streaming logs or dataset frequency distributions.
- **Complexity**: Optimal $O(N \log K)$ time using Min-Heap of size $K$.

---

## 2. Production Python Implementation (LeetCode Paradigms)

```python
import heapq
from collections import Counter
from typing import List

def top_k_frequent_elements(nums: List[int], k: int) -> List[int]:
    # 1. Count frequencies in O(N)
    counts = Counter(nums)

    # 2. Maintain min-heap of size K in O(N log K)
    # Heap stores tuple: (frequency, number)
    min_heap = []
    for num, freq in counts.items():
        heapq.heappush(min_heap, (freq, num))
        if len(min_heap) > k:
            heapq.heappop(min_heap)

    # 3. Extract numbers from heap
    return [num for freq, num in min_heap]

def max_subarray_sum(nums: List[int]) -> int:
    # Kadane's Algorithm O(N) Time, O(1) Space
    max_so_far = nums[0]
    curr_max = nums[0]

    for i in range(1, len(nums)):
        curr_max = max(nums[i], curr_max + nums[i])
        max_so_far = max(max_so_far, curr_max)

    return max_so_far
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is Min-Heap used instead of Max-Heap for Top-$K$ Frequent problems?
A Min-Heap of size $K$ retains the $K$ largest elements seen so far. When heap size exceeds $K$, popping the root removes the smallest element among the top candidates, guaranteeing $O(N \log K)$ runtime and $O(K)$ space.

### Q2: What is Kadane's Algorithm?
Kadane's algorithm finds the maximum sum contiguous subarray in linear $O(N)$ time using dynamic programming with $O(1)$ auxiliary space.

### Q3: How do I handle duplicate keys in two-pointer problems?
Advance pointers past identical adjacent elements (`while L < R and nums[L] == nums[L+1]: L += 1`) to avoid processing redundant duplicate solutions.

### Q4: When should I convert array operations to hash maps?
Use Hash Maps (`dict` / `set`) when looking up complement values (e.g. Two-Sum problem target $- X$) in constant $O(1)$ expected time.

### Q5: How do Data Engineering interviews differ from Software Engineering interviews?
Data Engineering interviews focus heavily on window functions, memory-efficient streaming, array transformations, and SQL aggregation logic alongside standard LeetCode data structures.
"""

# ----------------------------------------------------------------------
# 27. algorithms-specialization
# ----------------------------------------------------------------------
md_27 = r"""# Coursera Algorithms Specialization for Data Science: Divide & Conquer, Graphs & DP

Algorithms serve as the engine of modern scalable data processing systems. 

This course review summarizes fundamental algorithmic paradigms covered in Tim Roughgarden's renowned Algorithms Specialization, tailored specifically for data scientists and ML engineers.

---

## 1. Divide-and-Conquer Paradigm

Divide-and-Conquer breaks a problem into smaller independent subproblems, solves them recursively, and combines subproblem solutions.

### Master Theorem for Recurrences
For recurrences of the form $T(n) = a T(n/b) + O(n^d)$:

$$T(n) = \begin{cases} O(n^d) & \text{if } a < b^d \\ O(n^d \log n) & \text{if } a = b^d \\ O(n^{\log_b a}) & \text{if } a > b^d \end{cases}$$

---

## 2. Production Python Implementation (Divide-and-Conquer & DP)

```python
def count_inversions(arr: list) -> tuple:
    # Counts number of inverted pairs (i < j and arr[i] > arr[j]) in O(N log N) time
    if len(arr) <= 1:
        return arr, 0

    mid = len(arr) // 2
    left, inv_left = count_inversions(arr[:mid])
    right, inv_right = count_inversions(arr[mid:])

    merged, inv_split = merge_and_count_split(left, right)
    return merged, inv_left + inv_right + inv_split

def merge_and_count_split(left: list, right: list) -> tuple:
    merged = []
    i = j = inv_count = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            inv_count += len(left) - i
            j += 1

    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged, inv_count
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the significance of counting inversions in Data Science?
Counting array inversions measures ranking similarity between two sorted preference lists (e.g. Kendall Tau distance in recommendation systems).

### Q2: Why is QuickSort randomized in practice?
Randomized pivot selection prevents $O(N^2)$ worst-case execution on pre-sorted input arrays, guaranteeing $O(N \log N)$ expected time complexity.

### Q3: What is the difference between Greedy and Dynamic Programming?
Greedy algorithms commit to a single locally optimal choice at each step without backtracking. Dynamic Programming evaluates all candidate subproblem choices and stores solutions in a memoization table.

### Q4: How does Graph Depth-First Search (DFS) perform Topological Sorting?
Topological sorting orders vertices in a Directed Acyclic Graph (DAG) by recording vertices in reverse order of their DFS exit times (`tout[u]`).

### Q5: What is NP-Completeness and how does it affect ML algorithm selection?
NP-Complete problems (such as Travelling Salesperson or Exact Graph Coloring) cannot be solved in polynomial time unless $P=NP$. For large inputs, data scientists employ approximation algorithms or heuristic solvers.
"""

# ----------------------------------------------------------------------
# 28. sql-tutorial-course
# ----------------------------------------------------------------------
md_28 = r"""# Advanced SQL for Data Scientists: Window Functions, CTEs & Query Plan Optimization

SQL (Structured Query Language) is the universally required querying standard for data warehousing (Snowflake, BigQuery, Redshift, DuckDB) and data engineering pipelines.

Mastering advanced window functions, Common Table Expressions (CTEs), and query execution plan optimization is essential for extracting multi-dimensional business insights from petabyte-scale data lakes.

---

## 1. Advanced SQL Window Functions

Window functions perform calculations across a set of table rows related to the current row without collapsing rows into a single summary output.

$$\text{FUNCTION}() \overbrace{\text{OVER} \Big( \underbrace{\text{PARTITION BY } \text{category}}_{\text{Grouping}} \quad \underbrace{\text{ORDER BY } \text{date}}_{\text{Sorting}} \quad \underbrace{\text{ROWS BETWEEN } \dots}_{\text{Window Frame}} \Big)}^{\text{Window Specification}}$$

### Canonical Window Functions
- `ROW_NUMBER()`: Assigns unique sequential integer to each row within partition.
- `RANK()` / `DENSE_RANK()`: Assigns rank order with/without gap gaps for tie values.
- `LAG(col, k)` / `LEAD(col, k)`: Fetches value from $k$ rows before/after current row.
- `SUM(col) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`: Running cumulative sum.

---

## 2. Common Table Expressions (CTEs) & Modular SQL

CTEs (`WITH cte_name AS (...)`) replace nested subqueries with readable, modular code blocks that can be referenced multiple times within a single main query.

---

## 3. Production Industrial SQL Pipeline Example

```sql
WITH DailySales AS (
    -- Step 1: Aggregate daily revenue per store
    SELECT 
        store_id,
        CAST(transaction_timestamp AS DATE) AS sales_date,
        SUM(amount) AS daily_revenue
    FROM sales_transactions
    WHERE transaction_timestamp >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY store_id, CAST(transaction_timestamp AS DATE)
),
SalesWithLags AS (
    -- Step 2: Compute 7-day historical lag and 7-day moving average
    SELECT 
        store_id,
        sales_date,
        daily_revenue,
        LAG(daily_revenue, 7) OVER (
            PARTITION BY store_id 
            ORDER BY sales_date
        ) AS revenue_7d_ago,
        AVG(daily_revenue) OVER (
            PARTITION BY store_id 
            ORDER BY sales_date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) AS moving_avg_7d
    FROM DailySales
)
-- Step 3: Filter stores exceeding 20% WoW growth
SELECT 
    store_id,
    sales_date,
    daily_revenue,
    revenue_7d_ago,
    ROUND(moving_avg_7d, 2) AS moving_avg_7d,
    ROUND(((daily_revenue - revenue_7d_ago) / NULLIF(revenue_7d_ago, 0)) * 100, 2) AS wow_growth_pct
FROM SalesWithLags
WHERE revenue_7d_ago IS NOT NULL
ORDER BY store_id, sales_date DESC;
```

---

## 4. Query Execution Plan Optimization

1. **Prune Columns Early**: Avoid `SELECT *`. Select only required column subsets to minimize disk I/O network bandwidth.
2. **Filter Before Joining**: Place `WHERE` clauses prior to heavy table joins to reduce row counts entering memory join buffers.
3. **Partition Pruning**: Filter partitioned columns (`WHERE event_date = '2026-07-25'`) to skip scanning unneeded data lake partitions.

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between `WHERE` and `HAVING` clauses?
`WHERE` filters individual rows *before* aggregation takes place. `HAVING` filters aggregated group summaries *after* `GROUP BY` execution.

### Q2: How does `RANK()` differ from `DENSE_RANK()`?
If two rows tie for rank 1, `RANK()` assigns ranks `1, 1, 3` (skipping 2). `DENSE_RANK()` assigns ranks `1, 1, 2` (no gap gaps).

### Q3: What is the performance impact of `NULLIF(val, 0)` in SQL?
`NULLIF(val, 0)` returns `NULL` if `val == 0`, preventing division-by-zero database execution errors during percentage ratio calculations.

### Q4: Why are correlated subqueries slow in large databases?
Correlated subqueries execute once for *every single row* of the outer query ($O(N \cdot M)$). Rewriting them as CTEs or explicit `JOIN` operations reduces execution to linear $O(N + M)$ time.

### Q5: What is a Index Scan vs Index Seek?
An Index Scan reads the entire B-Tree index sequentially ($O(N)$). An Index Seek traverses the B-Tree directly to target key locations in $O(\log N)$ time.
"""

# ----------------------------------------------------------------------
# 29. exploratory-data-analysis-with-python-and-pandas
# ----------------------------------------------------------------------
md_29 = r"""# Exploratory Data Analysis (EDA) with Python & Pandas: Data Profiling & Vectorized Wrangling

Exploratory Data Analysis (EDA) is the foundational first step of any data science project. It encompasses statistical data profiling, auditing missingness patterns, detecting anomalies, and transforming raw transactional tables into clean analytical feature matrices.

---

## 1. Automated Data Profiling & Structural Auditing

When loading an unfamiliar dataset, conduct an immediate structural audit checking shape, dtypes, null counts, and memory footprint:

```python
import pandas as pd
import numpy as np

def audit_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    summary = pd.DataFrame({
        'dtype': df.dtypes,
        'null_count': df.isnull().sum(),
        'null_pct': (df.isnull().sum() / len(df)) * 100,
        'unique_values': df.nunique(),
        'memory_kb': df.memory_usage(deep=True) / 1024
    })
    return summary.sort_values('null_pct', ascending=False)
```

---

## 2. Missing Data Mechanics: MCAR, MAR & MNAR

Missing data must be analyzed according to Rubin's missing data taxonomy:
1. **Missing Completely at Random (MCAR)**: Missingness probability is entirely independent of observed and unobserved values.
2. **Missing at Random (MAR)**: Missingness depends on observed features (e.g. older users missing income entries).
3. **Missing Not at Random (MNAR)**: Missingness depends directly on the missing value itself (e.g. high-earning individuals omitting salary entries).

---

## 3. High-Performance GroupBy Aggregation Pipelines

```python
def advanced_groupby_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    # Vectorized multi-aggregation with named outputs
    result = df.groupby('category_id').agg(
        total_sales=('amount', 'sum'),
        avg_price=('price', 'mean'),
        median_quantity=('quantity', 'median'),
        customer_count=('user_id', 'nunique'),
        sales_std=('amount', 'std')
    ).reset_index()

    # Calculate coefficient of variation (CV = std / mean)
    result['sales_cv'] = result['sales_std'] / result['avg_price']
    return result.sort_values('total_sales', ascending=False)
```

---

## Frequently Asked Questions (FAQs)

### Q1: When should I use `category` dtype in Pandas?
Convert string columns with low cardinality (unique strings $< 50\%$ of row count) to `category` dtype. This stores strings as integer lookup keys, reducing RAM memory by up to **$80\%$**.

### Q2: What is the difference between `apply()` and vectorized vectorized operations in Pandas?
`apply()` iterates row-by-row in pure Python ($O(N)$ Python loop overhead). Vectorized Pandas functions (`df['a'] + df['b']`) execute in compiled C subroutines, running $100\times$ faster.

### Q3: How do I handle duplicate rows in Pandas?
Identify duplicates using `df.duplicated(subset=['id', 'timestamp'])` and remove them using `df.drop_duplicates(subset=['id', 'timestamp'], keep='last')`.

### Q4: Why is `inplace=True` discouraged in modern Pandas?
`inplace=True` often fails to prevent memory copies due to internal block manager array views and is being deprecated in future Pandas 3.0 versions.

### Q5: How do I compute rolling correlations in Pandas?
Use `df['col1'].rolling(window=30).corr(df['col2'])` to track dynamic correlations over rolling time windows.
"""

# ----------------------------------------------------------------------
# 30. exploratory-data-analysis-for-machine-learning
# ----------------------------------------------------------------------
md_30 = r"""# Exploratory Data Analysis for Machine Learning: Feature Distributions, Outliers & Collinearity

Exploratory Data Analysis for Machine Learning (EDA-ML) goes beyond simple summary statistics. It evaluates feature distributions, skewness transformations, outlier sensitivity, multicollinearity, and target variable relationships to ensure data readiness for model training.

---

## 1. Feature Distribution Analysis & Skewness Correction

Machine learning algorithms (especially linear models, distance-based KNN, and neural networks) assume features follow roughly symmetric normal distributions $\mathcal{N}(\mu, \sigma^2)$.

### 1.1 Measuring Skewness
Fisher-Pearson coefficient of skewness $\gamma_1$:

$$\gamma_1 = \mathbb{E}\left[ \left( \frac{X - \mu}{\sigma} \right)^3 \right] = \frac{\frac{1}{N} \sum_{i=1}^N (X_i - \bar{X})^3}{\left( \frac{1}{N} \sum_{i=1}^N (X_i - \bar{X})^2 \right)^{3/2}}$$

- $\gamma_1 > 1$: Heavily right-skewed (log-normal distribution).
- **Transformation**: Apply Log Transform $\ln(X + 1)$ or Box-Cox / Yeo-Johnson power transformations.

---

## 2. Outlier Detection Mechanics

### 2.1 Interquartile Range (IQR) Method
- Lower Bound: $Q_1 - 1.5 \times \text{IQR}$
- Upper Bound: $Q_3 + 1.5 \times \text{IQR}$

### 2.2 Z-Score Thresholding
For normally distributed features, observations with $|Z| = \left| \frac{X - \mu}{\sigma} \right| > 3.0$ represent extreme outliers ($< 0.27\%$ probability).

---

## 3. Multicollinearity & Correlation Analysis

High feature-to-feature correlation ($r_{ij} > 0.85$) introduces multicollinearity, causing linear model coefficient instability.

```python
import pandas as pd
import numpy as np
import scipy.stats as stats

def detect_multicollinear_features(df: pd.DataFrame, threshold: float = 0.85) -> list:
    corr_matrix = df.corr().abs()
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    to_drop = [column for column in upper.columns if any(upper[column] > threshold)]
    print(f"Features exceeding {threshold} correlation threshold: {to_drop}")
    return to_drop

def transform_skewed_features(df: pd.DataFrame, skewed_cols: list) -> pd.DataFrame:
    data = df.copy()
    for col in skewed_cols:
        skew = stats.skew(data[col].dropna())
        if skew > 1.0:
            data[f'{col}_log'] = np.log1p(np.maximum(data[col], 0))
    return data
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why should outliers be capped (winsorized) rather than deleted?
Deleting outlier rows reduces training dataset size and risks removing rare high-value business signals. Winsorizing caps extreme values at $1\text{st}$ and $99\text{th}$ percentiles without discarding rows.

### Q2: How does Tree-based models (Random Forest, LightGBM) handle feature skewness?
Tree-based algorithms split nodes based on monotonic value order ranks, making them completely invariant to monotonic feature transformations (e.g. Log or Box-Cox).

### Q3: What is the difference between Pearson and Spearman correlation?
Pearson measures linear relationships between continuous variables. Spearman measures monotonic relationships using rank order values, making it robust against non-linear scaling and outliers.

### Q4: When should Yeo-Johnson transformation be used instead of Box-Cox?
Box-Cox requires strictly positive values ($X > 0$). Yeo-Johnson handles zero and negative numbers ($X \le 0$).

### Q5: What is Target Leakage in ML feature engineering?
Target leakage occurs when a feature incorporates information from the target variable that will not be available at real-time inference model prediction time.
"""

# Register all 10 REAL AI & Data Scientist Batch 3 blogs
configs = [
    (21, "time-series-models", "Time Series Models: ARMA, ARIMA, SARIMAX & Volatility Modeling (GARCH)", "Autoregressive, moving average, seasonal differencing, and GARCH volatility models.", "Time Series Analytics", 36, ["learn-time-series", "time-series-basics"], ["forecasting-task-with-solution", "linear-regression-econ"], md_21),
    (22, "forecasting-task-with-solution", "Industrial Demand & Sales Forecasting Case Study: End-to-End Pipeline & Solutions", "Retail demand forecasting, feature engineering, LightGBM models, and WAPE evaluation.", "Case Studies", 38, ["time-series-models"], ["linear-regression-econ", "learn-python-kaggle"], md_22),
    (23, "linear-regression-econ", "Applied Linear Regression & Diagnostic Analytics: Gauss-Markov Invariants & OLS Mechanics", "OLS mathematical derivation, Gauss-Markov BLUE theorem, Breusch-Pagan test, and VIF metrics.", "Econometrics", 36, ["fundamentals-of-econometrics"], ["learn-python-kaggle", "algorithmic-exercises"], md_23),
    (24, "learn-python-kaggle", "Python for Data Science & Numerical Computing: NumPy Vectorization, SciPy & Memory Optimization", "NumPy array memory strides, SIMD hardware vectorization, and memory reduction techniques.", "Python & Tooling", 34, ["linear-regression-econ"], ["algorithmic-exercises", "study-plans-leetcode"], md_24),
    (25, "algorithmic-exercises", "Data Science Algorithmic Exercises: High-Performance Array Operations & Matrix Computations", "Pairwise Euclidean distance matrices, 2D sliding windows, and NumPy stride tricks.", "Data Science Algorithms", 36, ["learn-python-kaggle"], ["study-plans-leetcode", "algorithms-specialization"], md_25),
    (26, "study-plans-leetcode", "LeetCode Study Plans for Data Engineers & Data Scientists: Array Tricks & Priority Queues", "Top-K frequent elements, sliding window algorithms, and Kadane's maximum subarray sum.", "Coding Practice", 34, ["algorithmic-exercises"], ["algorithms-specialization", "sql-tutorial-course"], md_26),
    (27, "algorithms-specialization", "Coursera Algorithms Specialization for Data Science: Divide & Conquer, Graphs & DP", "Master theorem for recurrences, counting inversions, and dynamic programming for data scientists.", "Algorithms", 36, ["study-plans-leetcode"], ["sql-tutorial-course", "exploratory-data-analysis-with-python-and-pandas"], md_27),
    (28, "sql-tutorial-course", "Advanced SQL for Data Scientists: Window Functions, CTEs & Query Plan Optimization", "SQL window functions, CTEs, aggregation pipelines, and query execution plan tuning.", "Database Analytics", 36, ["algorithms-specialization"], ["exploratory-data-analysis-with-python-and-pandas", "exploratory-data-analysis-for-machine-learning"], md_28),
    (29, "exploratory-data-analysis-with-python-and-pandas", "Exploratory Data Analysis (EDA) with Python & Pandas: Data Profiling & Vectorized Wrangling", "Automated data profiling, missingness mechanics (MCAR/MAR/MNAR), and GroupBy pipelines.", "Exploratory Data Analysis", 36, ["sql-tutorial-course"], ["exploratory-data-analysis-for-machine-learning", "open-machine-learning-course"], md_29),
    (30, "exploratory-data-analysis-for-machine-learning", "Exploratory Data Analysis for Machine Learning: Feature Distributions, Outliers & Collinearity", "Skewness transformations, IQR outlier detection, multicollinearity, and correlation analysis.", "Exploratory Data Analysis", 36, ["exploratory-data-analysis-with-python-and-pandas"], ["open-machine-learning-course", "machine-learning-specialization"], md_30)
]

print("=== GENERATING REAL AI & DATA SCIENTIST BATCH 3 (SLUGS 21 TO 30) ===")

for idx, slug, title, tagline, cat, rt, prereqs, rel, md in configs:
    add_blog(
        slug=slug,
        title=title,
        tagline=tagline,
        category=cat,
        read_time=rt,
        prereqs=prereqs,
        related=rel,
        practice_probs=[{"title": f"{title} Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
        markdown=md
    )

output_json = 'scratch/ai_batch3_heavy_real.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"\nSUCCESSFULLY CREATED ALL 10 REAL AI & DATA SCIENTIST BATCH 3 BLOGS IN {output_json}!")
