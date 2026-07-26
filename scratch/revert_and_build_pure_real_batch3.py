import json
import re

print("=== REVERTING TEMPLATE PADDING AND BUILDING 100% GENUINE REAL BATCH 3 ===")

# Write 100% genuine, unique, non-padded articles for all 10 Real AI & Data Scientist topics

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

## 5. Vector Autoregression (VAR) for Multivariate Systems

When multiple dynamic time series variables mutually influence each other (e.g. interest rates, inflation, and unemployment), univariate models fail to capture inter-variable feedback.

The **Vector Autoregression** $\text{VAR}(p)$ model tracks an $K \times 1$ vector of endogenous variables $\mathbf{Y}_t = [Y_{1, t}, Y_{2, t}, \dots, Y_{K, t}]^T$:

$$\mathbf{Y}_t = \mathbf{c} + \mathbf{A}_1 \mathbf{Y}_{t-1} + \mathbf{A}_2 \mathbf{Y}_{t-2} + \dots + \mathbf{A}_p \mathbf{Y}_{t-p} + \boldsymbol{\varepsilon}_t$$

---

## 6. Impulse Response Functions (IRF) & Variance Decomposition (FEVD)

In multivariate time series systems using Vector Autoregression (VAR), **Impulse Response Functions (IRF)** trace the structural reaction of system variables to isolated standard deviation shocks:

$$\text{IRF}_{i, j}(h) = \frac{\partial Y_{i, t+h}}{\partial \varepsilon_{j, t}}$$

**Forecast Error Variance Decomposition (FEVD)** calculates the percentage of forecast error variance in $Y_i$ explained by historical shocks from variable $Y_j$:

$$\text{FEVD}_{i, j}(h) = \frac{\sum_{m=0}^{h-1} (\mathbf{\Theta}_m)_{i, j}^2}{\sum_{k=1}^K \sum_{m=0}^{h-1} (\mathbf{\Theta}_m)_{i, k}^2}$$

---

## 7. Exponential Smoothing State Space Models (Holt-Winters)

Exponential smoothing projects time series trends by applying exponentially decaying weights to historical observations:

$$\text{Level}: \quad l_t = \alpha (Y_t - s_{t-m}) + (1 - \alpha)(l_{t-1} + b_{t-1})$$

$$\text{Trend}: \quad b_t = \beta (l_t - l_{t-1}) + (1 - \beta) b_{t-1}$$

$$\text{Seasonal}: \quad s_t = \gamma (Y_t - l_{t-1} - b_{t-1}) + (1 - \gamma) s_{t-m}$$

---

## 8. Deep Recurrent Architectures (LSTM & GRU) vs ARIMA

Deep learning recurrent architectures (LSTM) maintain long-term hidden state vectors $\mathbf{h}_t$, allowing non-linear cross-series feature interactions:

$$\mathbf{f}_t = \sigma(\mathbf{W}_f [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_f), \quad \mathbf{i}_t = \sigma(\mathbf{W}_i [\mathbf{h}_{t-1}, \mathbf{x}_t] + \mathbf{b}_i)$$

---

## 9. Financial Risk & Value at Risk (VaR) Calculation using GARCH

In portfolio quantitative risk management, **Value at Risk (VaR)** estimates the maximum potential portfolio loss over time horizon $h$ at significance level $\alpha$:

$$\text{VaR}_{\alpha} = -\mu_t + \sigma_t \cdot \Phi^{-1}(1 - \alpha)$$

Using GARCH conditional volatility estimates $\sigma_t$, dynamic VaR updates daily to prevent extreme tail-risk market drawdowns.

---

## 10. State Space Models & Kalman Filtering

A **State Space Model** represents dynamic systems via unobserved state vector $\boldsymbol{\alpha}_t$:

$$\text{State Equation}: \quad \boldsymbol{\alpha}_t = \mathbf{T}_t \boldsymbol{\alpha}_{t-1} + \mathbf{R}_t \boldsymbol{\eta}_t, \quad \boldsymbol{\eta}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{Q}_t)$$

$$\text{Observation Equation}: \quad Y_t = \mathbf{Z}_t \boldsymbol{\alpha}_t + \varepsilon_t, \quad \varepsilon_t \sim \mathcal{N}(0, H_t)$$

The **Kalman Filter** computes optimal minimum mean square error (MMSE) state estimates $\hat{\boldsymbol{\alpha}}_{t\mid t}$ in continuous streaming environments via recursive Predict-Update steps.

---

## 11. Production Python Implementation (SARIMAX, GARCH & VAR)

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from arch import arch_model
from statsmodels.tsa.api import VAR

def fit_sarimax_pipeline(df: pd.DataFrame, target_col: str, exog_cols: list) -> sm.tsa.statespace.SARIMAXResults:
    y = df[target_col]
    X = df[exog_cols] if exog_cols else None

    model = sm.tsa.statespace.SARIMAX(
        y, exog=X, order=(1, 1, 1), seasonal_order=(1, 1, 1, 12),
        enforce_stationarity=False, enforce_invertibility=False
    )
    results = model.fit(disp=False)
    return results

def fit_garch_volatility(returns: pd.Series):
    am = arch_model(returns * 100, vol='Garch', p=1, o=0, q=1, dist='Normal')
    res = am.fit(disp='off')
    return res

def fit_var_system(df: pd.DataFrame, maxlags: int = 4):
    model = VAR(df)
    results = model.fit(maxlags=maxlags, ic='aic')
    return results
```

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

### 2.1 Lagged Sales Features
- $Y_{t-7}, Y_{t-14}, Y_{t-28}$: Direct historical values at identical weekly seasonality lags.

### 2.2 Rolling Window Aggregations
- **Rolling Mean**: $\bar{Y}_{t, w} = \frac{1}{w} \sum_{k=1}^w Y_{t-k}$ for $w \in \{7, 14, 28, 56\}$.
- **Rolling Standard Deviation**: $\sigma_{t, w} = \sqrt{\frac{1}{w-1} \sum_{k=1}^w (Y_{t-k} - \bar{Y}_{t, w})^2}$ capturing sales variance volatility.

### 2.3 Calendar & Categorical Embeddings
- Cyclical trigonometric transformations for day of year:

$$\sin\left(\frac{2\pi \cdot \text{day}}{365}\right), \quad \cos\left(\frac{2\pi \cdot \text{day}}{365}\right)$$

---

## 3. Temporal Cross-Validation: Expanding Window Strategy

Standard random $K$-Fold cross-validation leaks future information into past training slices. **Expanding Window Cross-Validation** enforces strict temporal causality.

---

## 4. Hierarchical Time Series Forecasting & MinT Reconciliation

In retail enterprise planning, time series forecasts exist across multi-level hierarchies (Country $\to$ Region $\to$ Store $\to$ Category $\to$ SKU). 

**Minimum Trace (MinT) Optimal Reconciliation** adjusts independent base forecasts $\hat{\mathbf{Y}}_t$ to guarantee structural additivity across all hierarchy levels:

$$\tilde{\mathbf{Y}}_t = \mathbf{S} (\mathbf{S}^T \mathbf{W}^{-1} \mathbf{S})^{-1} \mathbf{S}^T \mathbf{W}^{-1} \hat{\mathbf{Y}}_t$$

---

## 5. Intermittent Demand Forecasting via Croston's Method

For slow-moving spare parts or high-value inventory items with frequent zero-sales days, Croston's method models demand size $q_k$ and inter-arrival time $p_k$ separately:

$$\hat{q}_k = \alpha q_k + (1 - \alpha) \hat{q}_{k-1}, \quad \hat{p}_k = \alpha p_k + (1 - \alpha) \hat{p}_{k-1} \implies \text{Forecast Rate} = \frac{\hat{q}_k}{\hat{p}_k}$$

---

## 6. Temporal Fusion Transformers (TFT) Architecture

The **Temporal Fusion Transformer** (Google, 2021) leverages multi-head attention and gated residual networks to process static metadata, known future inputs, and historical time series concurrently.

---

## 7. Cold-Start SKU Forecasting & Transfer Learning

When launching new items with no sales history, cluster item metadata embeddings to initialize rolling mean sales from category level medians.

---

## 8. Model Interpretability & Feature Attribution via SHAP

Tree-based forecasting models (LightGBM) require model interpretability to justify stock allocation decisions to business stakeholders. **SHAP (SHapley Additive exPlanations)** calculates Shapley values:

$$\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f(S \cup \{i\}) - f(S) \right]$$

---

## 9. Deep Learning Sequence Models: N-BEATS & PatchTST

Modern neural forecasting architectures outperform boosted trees on long-horizon multi-step forecasting:
- **N-BEATS**: Uses stacked fully connected block layers with backward and forward residual connections.
- **PatchTST**: Segments multi-variate time series into token patches and applies Channel-Independent Transformer attention.

---

## 10. Production Python Implementation (LightGBM & Evaluation)

```python
import numpy as np
import pandas as pd
import lightgbm as lgb
from typing import List

def create_forecasting_features(df: pd.DataFrame) -> pd.DataFrame:
    data = df.copy()
    data['date'] = pd.to_datetime(data['date'])
    data = data.sort_values(['store_id', 'item_id', 'date']).reset_index(drop=True)

    data['dayofweek'] = data['date'].dt.dayofweek
    data['month'] = data['date'].dt.month
    data['is_weekend'] = data['dayofweek'].isin([5, 6]).astype(int)

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
        n_estimators=1000, learning_rate=0.03, num_leaves=63,
        subsample=0.8, colsample_bytree=0.8, random_state=42
    )

    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], callbacks=[lgb.early_stopping(50, verbose=False)])

    preds = model.predict(X_val)
    wape = np.sum(np.abs(y_val - preds)) / np.sum(y_val)
    print(f"Validation WAPE: {wape * 100:.2f}%")
    return model
```

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

md_23 = r"""# Applied Linear Regression & Diagnostic Analytics: Gauss-Markov Invariants & OLS Mechanics

Linear regression is the foundational analytical technique connecting empirical econometrics, causal inference, and supervised machine learning. 

Understanding the mathematical foundations of Ordinary Least Squares (OLS), diagnostic tests for assumption violations, and robust estimation methods is mandatory for quantitative analysis.

---

## 1. Mathematical Derivation of Ordinary Least Squares (OLS)

Given response vector $\mathbf{Y} \in \mathbb{R}^N$ and design matrix $\mathbf{X} \in \mathbb{R}^{N \times K}$ containing $K$ explanatory variables across $N$ observations:

$$\mathbf{Y} = \mathbf{X} \boldsymbol{\beta} + \boldsymbol{\varepsilon}$$

OLS finds the parameter vector $\hat{\boldsymbol{\beta}}$ minimizing the Sum of Squared Residuals (SSR):

$$S(\boldsymbol{\beta}) = \sum_{i=1}^N e_i^2 = \boldsymbol{e}^T \boldsymbol{e} = (\mathbf{Y} - \mathbf{X}\boldsymbol{\beta})^T (\mathbf{Y} - \mathbf{X}\boldsymbol{\beta}) = \mathbf{Y}^T \mathbf{Y} - 2\boldsymbol{\beta}^T \mathbf{X}^T \mathbf{Y} + \boldsymbol{\beta}^T \mathbf{X}^T \mathbf{X} \boldsymbol{\beta}$$

Setting the gradient vector equal to zero yields the **Normal Equations**:

$$\mathbf{X}^T \mathbf{X} \hat{\boldsymbol{\beta}} = \mathbf{X}^T \mathbf{Y} \implies \hat{\boldsymbol{\beta}} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{Y}$$

---

## 2. The Gauss-Markov Theorem

**Theorem**: Under Gauss-Markov assumptions 1–5, the OLS estimator $\hat{\boldsymbol{\beta}}$ is the **BLUE** (**Best Linear Unbiased Estimator**).

### The 5 Classical Gauss-Markov Assumptions
1. **Linearity in Parameters**: $\mathbf{Y} = \mathbf{X}\boldsymbol{\beta} + \boldsymbol{\varepsilon}$.
2. **Strict Exogeneity**: $\mathbb{E}[\boldsymbol{\varepsilon} \mid \mathbf{X}] = \mathbf{0}$.
3. **No Perfect Multicollinearity**: $\text{rank}(\mathbf{X}) = K$.
4. **Spherical Errors**: $\text{Var}(\boldsymbol{\varepsilon} \mid \mathbf{X}) = \sigma^2 \mathbf{I}_N$.
5. **Normality of Errors**: $\boldsymbol{\varepsilon} \mid \mathbf{X} \sim \mathcal{N}(\mathbf{0}, \sigma^2 \mathbf{I}_N)$.

---

## 3. Heteroskedasticity: Breusch-Pagan Test & White Standard Errors

When error variance is non-constant ($\text{Var}(\varepsilon_i) = \sigma_i^2$), standard errors are biased downward. Apply **White's Heteroskedasticity-Consistent (HC) Robust Standard Errors**:

$$\widehat{\text{Var}}_{\text{HC}}(\hat{\boldsymbol{\beta}}) = (\mathbf{X}^T \mathbf{X})^{-1} \left( \sum_{i=1}^N e_i^2 \mathbf{x}_i \mathbf{x}_i^T \right) (\mathbf{X}^T \mathbf{X})^{-1}$$

---

## 4. Multicollinearity & Variance Inflation Factor (VIF)

$$\text{VIF}_j = \frac{1}{1 - R_j^2}$$

where $R_j^2$ is the coefficient of determination from regressing $X_j$ on all other explanatory variables. $\text{VIF}_j > 10$ indicates severe multicollinearity.

---

## 5. Instrumental Variables (IV) & Two-Stage Least Squares (2SLS)

When strict exogeneity is violated ($\text{Cov}(X, \varepsilon) \ne 0$) due to omitted variables or simultaneous causality, OLS is inconsistent.

An **Instrumental Variable** $Z$ must satisfy:
1. **Relevance**: $\text{Cov}(Z, X) \ne 0$.
2. **Exclusion Restriction**: $\text{Cov}(Z, \varepsilon) = 0$.

### 2SLS Execution
- **Stage 1**: Regress $X$ on $Z$: $\hat{X} = \gamma_0 + \gamma_1 Z$.
- **Stage 2**: Regress $Y$ on $\hat{X}$: $Y = \beta_0 + \beta_1 \hat{X} + u$.

---

## 6. Panel Data Fixed Effects vs Random Effects

Panel data tracks $N$ entities over $T$ time periods:

$$Y_{it} = \alpha_i + \mathbf{X}_{it} \boldsymbol{\beta} + \varepsilon_{it}$$

- **Fixed Effects (FE)**: Allows entity intercepts $\alpha_i$ to correlate with regressors $\mathbf{X}_{it}$.
- **Random Effects (RE)**: Assumes $\alpha_i$ is uncorrelated with $\mathbf{X}_{it}$.
- **Hausman Test**: Evaluates null hypothesis $H_0$: RE is consistent. If $p < 0.05$, adopt Fixed Effects.

---

## 7. Generalized Least Squares (GLS) & Feasible GLS (FGLS)

When spherical error assumptions fail due to known non-constant variance matrix $\mathbf{\Omega} = \text{Var}(\boldsymbol{\varepsilon} \mid \mathbf{X})$, OLS is inefficient. 

$$\hat{\boldsymbol{\beta}}_{\text{GLS}} = (\mathbf{X}^T \mathbf{{\Omega}}^{-1} \mathbf{X})^{-1} \mathbf{X}^T \mathbf{\Omega}^{-1} \mathbf{Y}$$

---

## 8. Generalized Method of Moments (GMM) Estimation

GMM optimizes empirical population moment conditions $\mathbb{E}[g(Y_i, \mathbf{X}_i, \boldsymbol{\theta})] = \mathbf{0}$, supplying a flexible unified framework encompassing OLS, 2SLS, and MLE.

---

## 9. Regression Discontinuity Design (RDD)

In causal inference, **Regression Discontinuity Design (RDD)** evaluates causal treatment effects when assignment to treatment depends on a continuous running variable $X$ crossing a strict threshold $c$:

$$\tau_{\text{RDD}} = \lim_{x \downarrow c} \mathbb{E}[Y \mid X = x] - \lim_{x \uparrow c} \mathbb{E}[Y \mid X = x]$$

---

## 10. Production Python Implementation (OLS Diagnostics & 2SLS)

```python
import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.stats.diagnostic import het_breuschpagan
from linearmodels.iv import IV2SLS

def run_regression_diagnostics(df: pd.DataFrame, target_col: str, feature_cols: list):
    X = sm.add_constant(df[feature_cols])
    y = df[target_col]

    ols_model = sm.OLS(y, X).fit()
    
    vif_data = pd.DataFrame()
    vif_data["Feature"] = X.columns
    vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]

    bp_test = het_breuschpagan(ols_model.resid, ols_model.model.exog)

    if bp_test[1] < 0.05:
        robust_model = sm.OLS(y, X).fit(cov_type='HC3')
        return robust_model
    return ols_model
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between $R^2$ and Adjusted $R^2$?
$R^2 = 1 - \frac{\text{SSR}}{\text{SST}}$ increases monotonically whenever a new variable is added. Adjusted $R^2 = 1 - \left[ \frac{N-1}{N-K-1} (1 - R^2) \right]$ penalizes model complexity $K$.

### Q2: Why does OLS fail when $\text{rank}(\mathbf{X}) < K$?
If $\mathbf{X}$ has linear dependencies among columns, $\mathbf{X}^T \mathbf{X}$ is singular and non-invertible ($\det(\mathbf{X}^T \mathbf{X}) = 0$), preventing computation of OLS coefficients.

### Q3: What is Omitted Variable Bias (OVB)?
OVB occurs when a relevant variable $Z$ correlated with included regressor $X$ is omitted. The bias formula is $\text{Bias}(\hat{\beta}_X) = \beta_Z \cdot \frac{\text{Cov}(X, Z)}{\text{Var}(X)}$.

### Q4: How does Ridge/Lasso Regression relate to OLS?
Ridge ($L_2$) and Lasso ($L_1$) add penalty terms $\lambda \|\boldsymbol{\beta}\|_2^2$ or $\lambda \|\boldsymbol{\beta}\|_1$ to the OLS SSR loss function. This introduces slight estimation bias to drastically reduce variance under multicollinearity.

### Q5: When should I use Log-Linear or Log-Log functional forms?
Use Log-Linear ($\ln Y = \beta_0 + \beta_1 X$) when $X$ induces relative percentage changes in $Y$ ($\beta_1 \times 100\%$). Use Log-Log ($\ln Y = \beta_0 + \beta_1 \ln X$) when $\beta_1$ represents constant elasticity.
"""

md_24 = r"""# Python for Data Science & Numerical Computing: NumPy Vectorization, SciPy & Memory Optimization

Python is the undisputed primary programming language of modern data science, machine learning, and AI engineering. 

However, pure Python interpreted code executes with significant performance overhead due to dynamic typing and Global Interpreter Lock (GIL) constraints. Numerical computing libraries (NumPy, SciPy, Pandas) bypass Python runtime slowdowns by dispatching vectorized operations directly to underlying compiled C and Fortran linear algebra subroutines (BLAS, LAPACK).

---

## 1. NumPy Array Architecture & Memory Layout

A `numpy.ndarray` is a contiguous block of homogeneous memory coupled with metadata specifying data type (`dtype`), dimensions (`shape`), and byte offset strides (`strides`).

### 1.1 Memory Strides & C-Contiguous vs Fortran-Contiguous Layout
- **C-Contiguous (Row-Major)**: Consecutive elements in a row are placed next to each other in memory.
- **Fortran-Contiguous (Column-Major)**: Consecutive elements in a column are placed next to each other.

Iterating along the contiguous stride dimension maximizes CPU L1/L2 cache hits, running up to **$50 \times$ faster** than strided iteration.

---

## 2. Vectorization Mechanics & SIMD Hardware Acceleration

Vectorization eliminates explicit `for` loops in Python by executing instructions over array blocks using CPU SIMD (Single Instruction, Multiple Data) vector registers.

---

## 3. NumPy Broadcasting Rules

Broadcasting allows arithmetic operations between arrays of different shapes without making redundant memory copies:

### The Broadcasting Invariant
Two dimensions are compatible for broadcasting if:
1. They are equal, OR
2. One of the dimensions is $1$.

---

## 4. Memory Downcasting & Precision Management

Converting default 64-bit numerical types to 32-bit or 16-bit primitives reduces memory footprint by $50\% \dots 75\%$.

---

## 5. Memory-Mapped Arrays via `numpy.memmap`

When processing 100GB+ binary arrays exceeding physical RAM, `np.memmap` accesses array slices directly from disk files via virtual memory mapping without loading the full array into RAM.

---

## 6. Numba JIT Compilation (`@jit(nopython=True)`)

Numba compiles Python numerical loops into machine instructions via LLVM:

```python
from numba import jit

@jit(nopython=True, fastmath=True)
def numba_array_sum(arr: np.ndarray) -> float:
    total = 0.0
    for i in range(arr.shape[0]):
        total += arr[i]
    return total
```

---

## 7. SciPy Convex Optimization & Loss Solvers

SciPy (`scipy.optimize.minimize`) supplies L-BFGS-B and Conjugate Gradient routines for non-linear regression loss functions.

---

## 8. SciPy Sparse Solvers & Linear Systems

SciPy (`scipy.sparse.linalg`) supplies solvers (Conjugate Gradient, GMRES, LSQR) for solving large sparse system equations $\mathbf{A} \mathbf{x} = \mathbf{b}$ in linear $O(E)$ time.

---

## 9. Profiling Execution Bottlenecks via `cProfile` & `line_profiler`

Identify runtime CPU bottlenecks in Python scripts using `cProfile` or line-by-line profiling `@profile` to pinpoint slow loops before attempting vectorization optimizations.

---

## 10. Production Python Implementation (NumPy & Performance)

```python
import numpy as np
import time

def compare_vectorization_performance(size: int = 10_000_000):
    list_a = list(range(size))
    list_b = list(range(size))

    start = time.perf_counter()
    list_res = [list_a[i] + list_b[i] for i in range(size)]
    py_time = time.perf_counter() - start

    arr_a = np.arange(size, dtype=np.int64)
    arr_b = np.arange(size, dtype=np.int64)

    start = time.perf_counter()
    arr_res = arr_a + arr_b
    np_time = time.perf_counter() - start

    print(f"Pure Python Time: {py_time:.4f}s")
    print(f"NumPy SIMD Time:  {np_time:.4f}s")
    print(f"Speedup Factor:   {py_time / np_time:.2f}x faster")
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

md_25 = r"""# Data Science Algorithmic Exercises: High-Performance Array Operations & Matrix Computations

Algorithmic efficiency in data science separates production-grade engineering from slow prototypes. 

This module presents solutions to core data science array manipulation algorithms, sliding window computations, matrix transformations, and numerical optimization primitives.

---

## 1. Matrix Transformations & Sliding Windows

Given image matrix $\mathbf{X} \in \mathbb{R}^{M \times N}$ and kernel $\mathbf{K} \in \mathbb{R}^{k \times k}$, calculate spatial 2D convolution output $\mathbf{Y}$:

$$\mathbf{Y}[i, j] = \sum_{m=0}^{k-1} \sum_{n=0}^{k-1} \mathbf{X}[i+m, j+n] \cdot \mathbf{K}[m, n]$$

---

## 2. Distance Matrix Computations (Pairwise Distances)

Given $N$ samples $\mathbf{X} \in \mathbb{R}^{N \times D}$ and $M$ samples $\mathbf{Y} \in \mathbb{R}^{M \times D}$, calculate pairwise Euclidean distance matrix $\mathbf{D} \in \mathbb{R}^{N \times M}$:

$$D_{ij}^2 = \|\mathbf{x}_i - \mathbf{y}_j\|_2^2 = \|\mathbf{x}_i\|^2 + \|\mathbf{y}_j\|^2 - 2 \mathbf{x}_i \cdot \mathbf{y}_j^T$$

---

## 3. Vectorized K-Means Clustering Core Loop

Computing pairwise distances between $N$ data points and $K$ centroids using expanded vector operations eliminates slow Python loops:

```python
def kmeans_vectorized(X: np.ndarray, k: int, max_iters: int = 100):
    indices = np.random.choice(X.shape[0], k, replace=False)
    centroids = X[indices]

    for _ in range(max_iters):
        dists = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)
        labels = np.argmin(dists, axis=1)
        new_centroids = np.array([X[labels == i].mean(axis=0) for i in range(k)])

        if np.allclose(centroids, new_centroids):
            break
        centroids = new_centroids

    return centroids, labels
```

---

## 4. Compressed Sparse Row Matrix Calculations (`scipy.sparse`)

When features contain high zero sparsity (TF-IDF matrices), `csr_matrix` stores non-zero values in compact `data`, `indices`, and `indptr` arrays.

---

## 5. Singular Value Decomposition (SVD) Matrix Approximations

Truncated SVD decomposes matrix $\mathbf{A} \in \mathbb{R}^{M \times N}$ into $\mathbf{U} \boldsymbol{\Sigma} \mathbf{V}^T$, providing optimal low-rank matrix approximations.

---

## 6. Vectorized TF-IDF Matrix Calculations

Given document term frequency matrix $\mathbf{TF} \in \mathbb{R}^{D \times V}$, **Inverse Document Frequency (IDF)** scales rare word importance:

$$\text{IDF}(t) = \ln\left( \frac{1 + N}{1 + \text{DF}(t)} \right) + 1, \quad \mathbf{TF\text{-}IDF} = \mathbf{TF} \times \text{diag}(\mathbf{IDF})$$

---

## 7. Fast Pairwise Cosine Similarity

Given document feature matrix $\mathbf{A} \in \mathbb{R}^{N \times D}$, compute pairwise cosine similarity matrix $\mathbf{S} \in \mathbb{R}^{N \times N}$ in $O(N^2 D)$ time:

$$S_{ij} = \frac{\mathbf{a}_i \cdot \mathbf{a}_j}{\|\mathbf{a}_i\|_2 \|\mathbf{a}_j\|_2} \implies \mathbf{S} = \mathbf{A}_{\text{norm}} \mathbf{A}_{\text{norm}}^T$$

---

## 8. Production Python Implementation (Pairwise Distances & Stride Tricks)

```python
import numpy as np

def compute_pairwise_distances(X: np.ndarray, Y: np.ndarray) -> np.ndarray:
    X_norms = np.sum(X**2, axis=1, keepdims=True)
    Y_norms = np.sum(Y**2, axis=1, keepdims=True).T
    dot_product = np.dot(X, Y.T)

    dist_sq = X_norms + Y_norms - 2 * dot_product
    dist_sq = np.maximum(dist_sq, 0.0)
    return np.sqrt(dist_sq)
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

md_26 = r"""# LeetCode Study Plans for Data Engineers & Data Scientists: Array Tricks & Priority Queues

Data Science and Data Engineering technical interviews evaluate algorithmic fluency across array manipulations, hashing, two-pointer techniques, sliding windows, and SQL matrix operations.

This study plan catalogs essential algorithmic patterns tested at top tech organizations (Meta, Google, Netflix, Amazon).

---

## 1. Two-Pointer & Sliding Window Techniques

Maintaining left ($L$) and right ($R$) pointers sliding monotonically across an array resolves contiguous subarray queries in optimal linear $O(N)$ time.

---

## 2. Top-$K$ Frequent Elements & Priority Queues

Maintain a Min-Heap of size $K$ to extract top $K$ frequent items from streaming logs in optimal $O(N \log K)$ time and $O(K)$ space.

---

## 3. SQL & Pandas Window Function Conversions

Data Engineering interviews evaluate translating SQL analytical window functions (`DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)`) into Pandas vectorized pipelines (`df.groupby('dept')['salary'].rank(method='dense')`).

---

## 4. Advanced Window Functions (NTILE, CUME_DIST)

- `NTILE(n)`: Divides partition rows into $n$ equal-sized buckets.
- `CUME_DIST()`: Computes relative cumulative distribution position $\frac{\text{rank}}{N}$.

---

## 5. Invertible Prefix Sum Hash Maps

Find the count of contiguous subarrays summing to target $K$ in optimal $O(N)$ time and $O(N)$ space using cumulative prefix sum dictionaries.

---

## 6. Priority Queue Merge $K$ Sorted Streams (Log Aggregation)

In data engineering pipelines, merging $K$ pre-sorted transaction log files executes in $O(N \log K)$ time using a Min-Heap of size $K$.

---

## 7. Graph Breadth-First Search (BFS) for Shortest Path

In unweighted network graphs, BFS computes shortest path node distance from source $s$ to all target nodes in optimal $O(V + E)$ time using a FIFO queue.

---

## 8. Production Python Implementations (Kadane & Priority Queues)

```python
import heapq
from collections import Counter
from typing import List

def top_k_frequent_elements(nums: List[int], k: int) -> List[int]:
    counts = Counter(nums)
    min_heap = []
    for num, freq in counts.items():
        heapq.heappush(min_heap, (freq, num))
        if len(min_heap) > k:
            heapq.heappop(min_heap)
    return [num for freq, num in min_heap]

def max_subarray_sum(nums: List[int]) -> int:
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

md_27 = r"""# Coursera Algorithms Specialization for Data Science: Divide & Conquer, Graphs & DP

Algorithms serve as the engine of modern scalable data processing systems. 

This course review summarizes fundamental algorithmic paradigms covered in Tim Roughgarden's renowned Algorithms Specialization, tailored specifically for data scientists and ML engineers.

---

## 1. Divide-and-Conquer Paradigm & Master Theorem

For recurrences of the form $T(n) = a T(n/b) + O(n^d)$:

$$T(n) = \begin{cases} O(n^d) & \text{if } a < b^d \\ O(n^d \log n) & \text{if } a = b^d \\ O(n^{\log_b a}) & \text{if } a > b^d \end{cases}$$

---

## 2. Counting Inversions in $O(N \log N)$ Time

Counting inverted pairs ($i < j$ and $A[i] > A[j]$) measures ranking preference distance in recommendation engines using a modified MergeSort algorithm.

---

## 3. Needleman-Wunsch Sequence Alignment

Dynamic programming computes optimal global alignment between two sequences:

$$\text{DP}[i][j] = \max \begin{cases} \text{DP}[i-1][j-1] + \text{score}(S_1[i], S_2[j]) \\ \text{DP}[i-1][j] + \text{gap} \\ \text{DP}[i][j-1] + \text{gap} \end{cases}$$

---

## 4. Minimum Spanning Trees (Kruskal, Prim) for Spatial Clustering

Kruskal's algorithm with Disjoint Set Union (DSU) builds Minimum Spanning Trees in $O(E \log V)$ time for spatial clustering analysis.

---

## 5. Topological Sorting for Pipeline Dependency DAGs

Task execution sequence in Airflow DAGs is determined by topological sorting nodes in order of zero in-degree using Kahn's algorithm.

---

## 6. Shortest Path Algorithms: Dijkstra & Bellman-Ford

- **Dijkstra's Algorithm**: Computes single-source shortest path on graphs with non-negative edge weights in $O((V + E) \log V)$ time using binary min-heaps.
- **Bellman-Ford Algorithm**: Computes shortest paths on graphs with negative edge weights and detects negative weight cycles in $O(V \cdot E)$ time.

---

## 7. Strongly Connected Components (Tarjan's & Kosaraju's Algorithms)

In directed graphs, a Strongly Connected Component (SCC) is a maximal subgraph where all vertices are mutually reachable. Tarjan's algorithm isolates SCCs in a single DFS pass using discovery timestamps `tin[u]` and low-link values `low[u]`.

---

## 8. Production Python Implementation (Merge Inversion Counter)

```python
def count_inversions(arr: list) -> tuple:
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

md_28 = r"""# Advanced SQL for Data Scientists: Window Functions, CTEs & Query Plan Optimization

SQL (Structured Query Language) is the universally required querying standard for data warehousing (Snowflake, BigQuery, Redshift, DuckDB) and data engineering pipelines.

Mastering advanced window functions, Common Table Expressions (CTEs), and query execution plan optimization is essential for extracting multi-dimensional business insights from petabyte-scale data lakes.

---

## 1. Advanced SQL Window Functions

Window functions perform calculations across a set of table rows related to the current row without collapsing rows into a single summary output:

$$\text{FUNCTION}() \text{OVER} \left( \text{PARTITION BY } \text{category} \quad \text{ORDER BY } \text{date} \quad \text{ROWS BETWEEN } \dots \right)$$

---

## 2. Common Table Expressions (CTEs) & Modular SQL

CTEs (`WITH cte_name AS (...)`) replace nested subqueries with readable, modular code blocks that can be referenced multiple times within a single main query.

---

## 3. Window Frames & Unbounded Preceding Aggregations

Window frames (`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`) calculate dynamic moving averages and rolling variances over custom time horizons.

---

## 4. Recursive Common Table Expressions (Recursive CTEs)

Recursive CTEs solve hierarchical tree queries across multi-level organizational charts or product category trees.

---

## 5. Star Schema vs Snowflake Schema Architecture

- **Star Schema**: Denormalized dimensions connected directly to central Fact tables for maximum SQL query performance.
- **Snowflake Schema**: Normalized dimensions saving storage space at the cost of requiring more complex SQL joins.

---

## 6. Index Types & Query Execution Performance

- **B-Tree Index**: Optimal for range queries ($>=$ and $<=$) and equality lookups ($O(\log N)$).
- **Hash Index**: Optimal for exact equality lookups ($O(1)$ expected).
- **GIN (Generalized Inverted Index)**: Used in PostgreSQL for JSONB document search and array membership queries.

---

## 7. Partition Pruning & Query Execution Plan Optimization

Filter partitioned table columns (`WHERE transaction_date >= '2026-07-01'`) to instruct the query planner to skip scanning unneeded historical data lake files.

---

## 8. Production Industrial SQL Pipeline Implementation

```sql
WITH DailySales AS (
    SELECT 
        store_id,
        CAST(transaction_timestamp AS DATE) AS sales_date,
        SUM(amount) AS daily_revenue
    FROM sales_transactions
    WHERE transaction_timestamp >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY store_id, CAST(transaction_timestamp AS DATE)
),
SalesWithLags AS (
    SELECT 
        store_id,
        sales_date,
        daily_revenue,
        LAG(daily_revenue, 7) OVER (PARTITION BY store_id ORDER BY sales_date) AS revenue_7d_ago,
        AVG(daily_revenue) OVER (PARTITION BY store_id ORDER BY sales_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7d
    FROM DailySales
)
SELECT 
    store_id, sales_date, daily_revenue, revenue_7d_ago,
    ROUND(moving_avg_7d, 2) AS moving_avg_7d,
    ROUND(((daily_revenue - revenue_7d_ago) / NULLIF(revenue_7d_ago, 0)) * 100, 2) AS wow_growth_pct
FROM SalesWithLags
WHERE revenue_7d_ago IS NOT NULL
ORDER BY store_id, sales_date DESC;
```

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

md_29 = r"""# Exploratory Data Analysis (EDA) with Python & Pandas: Data Profiling & Vectorized Wrangling

Exploratory Data Analysis (EDA) is the foundational first step of any data science project. It encompasses statistical data profiling, auditing missingness patterns, detecting anomalies, and transforming raw transactional tables into clean analytical feature matrices.

---

## 1. Automated Data Profiling & Structural Auditing

Checking shape, dtypes, null ratios, and memory consumption across dataset variables:

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

- **MCAR**: Missingness is completely independent of observed/unobserved data.
- **MAR**: Missingness depends on observed features.
- **MNAR**: Missingness depends on the missing value itself.

---

## 3. High-Performance GroupBy Aggregation Pipelines

Vectorized multi-column aggregations with named output keys.

---

## 4. Categorical Feature Encoding Strategies

- **One-Hot Encoding (OHE)**: Converts low-cardinality categories into binary indicator vectors.
- **Target Encoding**: Replaces category levels with regularized empirical target means $\hat{S}_c = \frac{n_c \bar{y}_c + m \cdot y_{\text{global}}}{n_c + m}$.

---

## 5. Pandas Memory Optimization via Type Downcasting

Convert default 64-bit numerical types to 32-bit or 16-bit primitives to reduce RAM memory consumption by up to **$75\%$**.

---

## 6. Time Series Resampling & MultiIndex Unstacking

Resample daily transactional records to weekly aggregates (`df.set_index('date').resample('W').sum()`) for downstream machine learning features.

---

## 7. Large CSV File Processing via Chunking

When reading a 50GB CSV file exceeding RAM capacity, process data in chunks of 100,000 rows:

```python
def process_large_csv(file_path: str, chunk_size: int = 100000) -> float:
    total_sales = 0.0
    for chunk in pd.read_csv(file_path, chunksize=chunk_size):
        total_sales += chunk['amount'].sum()
    return total_sales
```

---

## 8. Multi-Index Unstacking & Pivot Table Mechanics

Reshaping multi-dimensional Pandas DataFrames using `pivot_table(index='store', columns='month', values='sales', aggfunc='sum')` aligns data matrices for downstream machine learning pipelines.

---

## Frequently Asked Questions (FAQs)

### Q1: When should I use `category` dtype in Pandas?
Convert string columns with low cardinality (unique strings $< 50\%$ of row count) to `category` dtype. This stores strings as integer lookup keys, reducing RAM memory by up to **$80\%$**.

### Q2: What is the difference between `apply()` and vectorized operations in Pandas?
`apply()` iterates row-by-row in pure Python ($O(N)$ Python loop overhead). Vectorized Pandas functions (`df['a'] + df['b']`) execute in compiled C subroutines, running $100\times$ faster.

### Q3: How do I handle duplicate rows in Pandas?
Identify duplicates using `df.duplicated(subset=['id', 'timestamp'])` and remove them using `df.drop_duplicates(subset=['id', 'timestamp'], keep='last')`.

### Q4: Why is `inplace=True` discouraged in modern Pandas?
`inplace=True` often fails to prevent memory copies due to internal block manager array views and is being deprecated in future Pandas 3.0 versions.

### Q5: How do I compute rolling correlations in Pandas?
Use `df['col1'].rolling(window=30).corr(df['col2'])` to track dynamic correlations over rolling time windows.
"""

md_30 = r"""# Exploratory Data Analysis for Machine Learning: Feature Distributions, Outliers & Collinearity

Exploratory Data Analysis for Machine Learning (EDA-ML) goes beyond simple summary statistics. It evaluates feature distributions, skewness transformations, outlier sensitivity, multicollinearity, and target variable relationships to ensure data readiness for model training.

---

## 1. Feature Distribution Analysis & Fisher-Pearson Skewness ($\gamma_1$)

$$\gamma_1 = \frac{\frac{1}{N} \sum_{i=1}^N (X_i - \bar{X})^3}{\left( \frac{1}{N} \sum_{i=1}^N (X_i - \bar{X})^2 \right)^{3/2}}$$

When $\gamma_1 > 1.0$, apply log transform $\ln(X + 1)$ or power transformations.

---

## 2. Outlier Detection Mechanics

- **IQR Method**: Bounds $[Q_1 - 1.5 \times \text{IQR}, \; Q_3 + 1.5 \times \text{IQR}]$.
- **Z-Score Threshold**: $|Z| > 3.0$.

---

## 3. Multicollinearity & Correlation Analysis

High feature correlation ($r > 0.85$) inflates parameter variance in linear models.

---

## 4. Dimensionality Reduction & Variance Profiling (PCA)

Principal Component Analysis (PCA) projects high-dimensional data onto orthogonal components maximizing linear variance $\mathbf{Z} = \mathbf{X} \mathbf{W}$.

---

## 5. Target Variable Leakage Audit Protocols

Target leakage occurs when training features incorporate future information or target derived metadata unavailable at real-time inference model runtime.

---

## 6. Class Imbalance Analytics & SMOTE Resampling

Handle severe class imbalance using SMOTE synthetic oversampling or by evaluating models using Precision-Recall AUC (PR-AUC) rather than accuracy.

---

## 7. Feature Scaling Mechanics: StandardScaler, MinMaxScaler & RobustScaler

- **StandardScaler**: Centers features to mean $\mu = 0$ and standard deviation $\sigma = 1$: $z = \frac{x - \mu}{\sigma}$.
- **MinMaxScaler**: Scales features into interval $[0, 1]$: $x_{\text{scaled}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$.
- **RobustScaler**: Uses median and Interquartile Range (IQR) $x_{\text{scaled}} = \frac{x - Q_2}{Q_3 - Q_1}$, making it robust against extreme outliers.

---

## 8. Automated Data Validation Schemas via Pandera

Pandera defines runtime statistical schema validation contracts over Pandas DataFrames:

```python
import pandera as pa

schema = pa.DataFrameSchema({
    "user_id": pa.Column(int, checks=pa.Check.gt(0)),
    "age": pa.Column(int, checks=pa.Check.in_range(18, 120)),
    "income": pa.Column(float, checks=pa.Check.greater_than_or_equal_to(0.0), nullable=True)
})
```

---

## 9. Production Python ML-EDA Implementation

```python
import pandas as pd
import numpy as np
import scipy.stats as stats

def run_ml_eda_pipeline(df: pd.DataFrame, target_col: str):
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if target_col in num_cols:
        num_cols.remove(target_col)

    skewed = [c for c in num_cols if abs(stats.skew(df[c].dropna())) > 1.0]
    print(f"Skewed Features (|gamma_1| > 1.0): {skewed}")

    corr_matrix = df[num_cols].corr().abs()
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    high_corr = [column for column in upper.columns if any(upper[column] > 0.85)]
    print(f"High Multicollinear Features (> 0.85): {high_corr}")

    return skewed, high_corr
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

for idx, slug, title, tagline, cat, rt, prereqs, rel, raw_md in configs:
    cleaned_md = clean_markdown_headers(raw_md.strip())
    
    headers = [line.strip() for line in cleaned_md.splitlines() if re.match(r'^#{1,6}\s+[A-Za-z0-9]', line.strip())]
    header_counts = {}
    dupes = 0
    for h in headers:
        header_counts[h] = header_counts.get(h, 0) + 1
        if header_counts[h] > 1:
            dupes += 1
            
    has_template_padding = "Technical Deep-Dive Section" in cleaned_md or "Advanced Analytical Frameworks" in cleaned_md
    length = len(cleaned_md)
    
    assert length >= 10100, f"Blog '{slug}' is too short ({length} chars)."
    assert dupes == 0, f"Duplicate headers found in '{slug}' ({dupes})."
    assert not has_template_padding, f"Template padding found in '{slug}'!"
    
    print(f"[PURE PASS] #{idx} '{slug}': {length:,} chars | Dupes: {dupes} | Padding: False | Start: {repr(cleaned_md[:60])}")
    
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

output_json = 'scratch/ai_batch3_heavy_real_pure.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"\nSUCCESSFULLY CREATED ALL 10 PURE REAL AI & DATA SCIENTIST BATCH 3 BLOGS IN {output_json}!")
