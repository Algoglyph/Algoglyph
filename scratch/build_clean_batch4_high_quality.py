import json
import re

print("=== BUILDING HIGH-QUALITY BATCH 4 BLOGS (#31 to #40) WITH FAQS ===")

batch4_blogs = {}

# 31. exploratory-data-analysis-with-seaborn
batch4_blogs["exploratory-data-analysis-with-seaborn"] = {
    "slug": "exploratory-data-analysis-with-seaborn",
    "title": "Exploratory Data Analysis with Seaborn: Statistical Data Visualization & Faceting",
    "tagline": "Distribution plots, categorical analytics, PairGrids, joint distributions, and heatmap correlation matrix visualization.",
    "category": "Exploratory Data Analysis",
    "readTime": "22",
    "lastUpdated": "July 2026",
    "prerequisites": ["exploratory-data-analysis-with-python-and-pandas"],
    "related": ["exploratory-data-analysis-for-machine-learning", "open-machine-learning-course"],
    "practiceProblems": [{"title": "Seaborn EDA Simulation", "difficulty": "Easy", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Exploratory Data Analysis with Seaborn: Statistical Data Visualization & Faceting

Seaborn is a Python data visualization library built on top of Matplotlib that provides a high-level interface for drawing attractive, informative statistical graphics. Integrated tightly with Pandas DataFrames, Seaborn automates aggregation, error bar calculation, and color mapping across multi-variable categorical and numerical datasets.

---

## 1. Core Architecture: High-Level Figure-Level vs. Axes-Level Functions

Seaborn categorizes visual functions into two architectural tiers:
- **Axes-Level Functions** (`sns.scatterplot`, `sns.histplot`, `sns.boxplot`): Draw onto an existing Matplotlib `ax` object and integrate into custom multi-panel subplots.
- **Figure-Level Functions** (`sns.relplot`, `sns.displot`, `sns.catplot`): Manage their own `FacetGrid` container and automatically organize subplots across categorical row/column dimensions.

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd

# Load sample dataset
tips = sns.load_dataset("tips")

# Figure-level relational plot faceted by time
g = sns.relplot(
    data=tips,
    x="total_bill", y="tip",
    hue="smoker", style="time",
    col="sex", row="day",
    kind="scatter", height=3
)
plt.show()
```

---

## 2. Visualizing Continuous Distributions: `histplot`, `kdeplot` & `ecdfplot`

Understanding univariate probability density functions $f(x)$ and Empirical Cumulative Distribution Functions (ECDF) $F_n(x)$:

$$F_n(x) = \frac{1}{n} \sum_{i=1}^n \mathbb{I}(X_i \le x)$$

```python
fig, axes = plt.subplots(1, 3, figsize=(16, 4))

# Histogram with Kernel Density Estimate
sns.histplot(tips, x="total_bill", kde=True, ax=axes[0], color="teal")
axes[0].set_title("Histogram + KDE")

# Bivariate Kernel Density Estimate Contour Plot
sns.kdeplot(data=tips, x="total_bill", y="tip", ax=axes[1], fill=True, cmap="mako")
axes[1].set_title("Bivariate KDE Density Contours")

# Empirical Cumulative Distribution Function
sns.ecdfplot(data=tips, x="total_bill", hue="time", ax=axes[2])
axes[2].set_title("ECDF Comparison")

plt.tight_layout()
plt.show()
```

---

## 3. Categorical Analytics: Boxplots, Violin Plots & Strip/Swarm Overlays

Comparing continuous value distributions across discrete categorical groups:
- **Boxplot**: Displays median $Q_2$, interquartile range $\text{IQR} = Q_3 - Q_1$, and outliers exceeding $1.5 \times \text{IQR}$.
- **Violin Plot**: Combines a boxplot with a symmetrical rotated kernel density estimate.
- **Swarm Plot**: Positions individual data points along the categorical axis without overlap.

```python
plt.figure(figsize=(10, 6))

# Hybrid Violin + Swarm Plot Overlay
sns.violinplot(data=tips, x="day", y="total_bill", hue="sex", split=True, inner="quart", palette="Set2")
sns.stripplot(data=tips, x="day", y="total_bill", color="black", alpha=0.4, jitter=0.2)

plt.title("Day vs Total Bill Distribution by Sex")
plt.show()
```

---

## 4. Multi-Variable Correlation Heatmaps & Custom Color Palettes

Computing Pearson correlation coefficients $r_{xy} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}}$ and rendering annotated heatmaps:

```python
# Compute correlation matrix
corr = tips[['total_bill', 'tip', 'size']].corr()

plt.figure(figsize=(8, 6))
sns.heatmap(
    corr, 
    annot=True, 
    fmt=".3f", 
    cmap="vlag", 
    vmin=-1, vmax=1, 
    linewidths=0.5, 
    cbar_kws={"label": "Pearson Correlation Coefficient"}
)
plt.title("Multivariate Correlation Heatmap")
plt.show()
```

---

## 5. PairGrid Matrix Operations & Custom Subplot Mappings

`sns.PairGrid` provides flexible multi-variable pairwise exploratory plotting:

```python
g = sns.PairGrid(tips, hue="smoker", palette="coolwarm")
g.map_upper(sns.scatterplot)
g.map_diag(sns.kdeplot, fill=True)
g.map_lower(sns.regplot, scatter_kws={'alpha': 0.3})
g.add_legend()
plt.show()
```

---

## 6. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between Seaborn and Matplotlib?
Seaborn provides high-level abstractions specifically designed for statistical data visualization and directly accepts Pandas DataFrames, whereas Matplotlib is a low-level graphics library requiring explicit vector manipulation.

### Q2: When should I use `displot` instead of `histplot`?
Use `displot` when you need figure-level faceting across subplots (using `col` or `row` parameters). Use `histplot` when plotting directly onto a pre-existing Matplotlib `Axes` object.

### Q3: How do I save Seaborn plots to high-resolution vector files?
Call `plt.savefig("plot.png", dpi=300, bbox_inches="tight")` or save directly as PDF/SVG format (`plt.savefig("plot.svg")`) prior to `plt.show()`.

### Q4: How does Seaborn calculate confidence intervals in `lineplot` and `barplot`?
Seaborn uses bootstrapping by default (resampling data 1,000 times) to compute $95\%$ non-parametric confidence intervals around mean estimates.

### Q5: How do I customize Seaborn color palettes?
You can set global palettes using `sns.set_palette("husl")` or pass custom color lists/diverging palettes like `sns.color_palette("rocket", as_cmap=True)`.
"""
}

# 32. open-machine-learning-course
batch4_blogs["open-machine-learning-course"] = {
    "slug": "open-machine-learning-course",
    "title": "Open Machine Learning Course: Comprehensive Data Science & ML Foundations",
    "tagline": "Exploratory analytics, decision trees, ensemble methods, gradient boosting, and validation strategies.",
    "category": "Machine Learning",
    "readTime": "24",
    "lastUpdated": "July 2026",
    "prerequisites": ["exploratory-data-analysis-with-seaborn"],
    "related": ["machine-learning-specialization", "pattern-recognition-ml"],
    "practiceProblems": [{"title": "Open Machine Learning Course Simulation", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
    "markdown": r"""# Open Machine Learning Course: Comprehensive Data Science & ML Foundations

The Open Machine Learning Course (mlcourse.ai by OpenDataScience) is an open-source course covering classical supervised and unsupervised machine learning algorithms, statistical feature engineering, model validation, and competitive Kaggle workflows.

---

## 1. Classical Supervised Learning: Linear Models & Regularization

Linear Regression models continuous targets $y$ by minimizing Mean Squared Error (MSE) loss:

$$\mathcal{L}_{MSE}(\mathbf{w}) = \frac{1}{2N} \sum_{i=1}^N (y_i - \mathbf{w}^T \mathbf{x}_i)^2 + \lambda \|\mathbf{w}\|_2^2$$

```python
import numpy as np
from sklearn.linear_model import Ridge, Lasso
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Generate synthetic dataset
X = np.random.randn(1000, 20)
y = X[:, 0] * 3.5 - X[:, 1] * 2.0 + np.random.randn(1000) * 0.5

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Ridge Regression (L2 Regularization)
ridge = Ridge(alpha=1.0)
ridge.fit(X_train_scaled, y_train)
print(f"Ridge Test Score (R^2): {ridge.score(X_test_scaled, y_test):.4f}")
```

---

## 2. Non-Linear Decision Trees & Information Gain

Decision Trees split nodes to maximize Information Gain based on Shannon Entropy $H(S)$ or Gini Impurity $G(S)$:

$$H(S) = -\sum_{k=1}^K p_k \log_2(p_k), \quad G(S) = 1 - \sum_{k=1}^K p_k^2$$

```python
from sklearn.tree import DecisionTreeClassifier, export_text

X_cls = np.random.randn(500, 4)
y_cls = (X_cls[:, 0] + X_cls[:, 1] > 0).astype(int)

tree = DecisionTreeClassifier(max_depth=3, criterion="entropy")
tree.fit(X_cls, y_cls)

print(export_text(tree, feature_names=["f1", "f2", "f3", "f4"]))
```

---

## 3. Ensemble Methods: Random Forests & Bagging

Bagging (Bootstrap Aggregating) reduces model variance $\text{Var}(\bar{X}) = \frac{\sigma^2}{B}$ by training $B$ independent trees on bootstrapped data subsets and averaging their predictions:

```python
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=100, max_features="sqrt", random_state=42)
rf.fit(X_cls, y_cls)
print(f"Random Forest Accuracy: {rf.score(X_cls, y_cls):.4f}")
```

---

## 4. Gradient Boosting Machines: XGBoost & LightGBM

Gradient Boosting fits subsequent weak learners $h_m(\mathbf{x})$ to negative gradients (pseudo-residuals) of the loss function:

$$r_{im} = -\left[ \frac{\partial \mathcal{L}(y_i, f(\mathbf{x}_i))}{\partial f(\mathbf{x}_i)} \right]_{f=f_{m-1}}$$

```python
from sklearn.ensemble import GradientBoostingClassifier

gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3)
gb.fit(X_cls, y_cls)
print(f"Gradient Boosting Accuracy: {gb.score(X_cls, y_cls):.4f}")
```

---

## 5. Model Validation & Hyperparameter Optimization

Avoiding data leakage using $K$-Fold Cross Validation and Stratified splits:

```python
from sklearn.model_selection import StratifiedKFold, GridSearchCV

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
param_grid = {"n_estimators": [50, 100], "max_depth": [3, 5]}

grid = GridSearchCV(estimator=RandomForestClassifier(), param_grid=param_grid, cv=cv, scoring="roc_auc")
grid.fit(X_cls, y_cls)
print(f"Best CV ROC-AUC Score: {grid.best_score_:.4f}")
```

---

## 6. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between Bagging and Boosting?
Bagging trains multiple trees independently in parallel on bootstrapped subsets to reduce variance. Boosting trains trees sequentially, where each new tree targets the residual errors of prior trees to reduce bias.

### Q2: Why is feature scaling required for Ridge/Lasso but not for Decision Trees?
Distance-based and gradient-based models (Ridge, Lasso, SVM) are sensitive to feature scales. Tree-based algorithms split nodes based on relative ordinal rankings within individual features and are invariant to monotonic scaling.

### Q3: What is the difference between $L_1$ (Lasso) and $L_2$ (Ridge) regularization?
$L_1$ regularization adds an absolute penalty $\|\mathbf{w}\|_1$, driving non-informative feature weights to exact zero for sparse feature selection. $L_2$ regularization adds a squared penalty $\|\mathbf{w}\|_2^2$, shrinking weights towards zero without eliminating features entirely.

### Q4: How does Stratified $K$-Fold Cross Validation work?
Stratified $K$-Fold ensures that each fold maintains the exact same class label proportion as the complete dataset, preventing distribution skew in imbalanced classification tasks.

### Q5: What is Out-Of-Bag (OOB) error in Random Forests?
OOB error is an estimation of model generalization error computed using training samples that were omitted from individual bootstrapped tree datasets ($\sim 36.8\%$ of samples per tree).
"""
}

print("Created #31 and #32")
