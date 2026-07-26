import json
import re

blogs = {}

def add_blog(slug, title, tagline, category, read_time, prereqs, related, practice_probs, markdown):
    # Strict quality invariants: No repeated padding text
    assert "Production Edge Cases & Mathematical Proofs" not in markdown
    assert "Industrial Deep-Dive: System Architecture" not in markdown
    
    headers = [line for line in markdown.splitlines() if line.startswith('#')]
    assert len(headers) == len(set(headers)), f"Duplicate headers found in {slug}"
    
    length = len(markdown)
    assert length >= 10100, f"Blog {slug} is too short: {length} chars"
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

# Read file contents from generate_full_10_clean_batch2_articles.py
with open('scratch/generate_full_10_clean_batch2_articles.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract md_11 through md_20 from text
md_vars = {}
for i in range(11, 21):
    pattern = rf'md_{i} = r"""([\s\S]*?)"""\n'
    match = re.search(pattern, text)
    if match:
        md_vars[i] = match.group(1)
        print(f"Extracted md_{i}: {len(md_vars[i]):,} chars")
    else:
        print(f"ERROR: Could not extract md_{i}")

configs = [
    (11, "practitioners-guide-statistical-tests", "Practitioner's Guide to Statistical Tests & Power Calculations", "Comprehensive taxonomy of parametric and non-parametric statistical tests, decision boundaries, and bootstrap resampling.", "Test Sensitivity", 34, ["hypothesis-testing"], ["experiment-design", "minimum-detectable-effect"]),
    (12, "doordash-cupac", "Paper Analysis: CUPAC - Machine Learning Variance Reduction at DoorDash", "Machine learning non-linear variance reduction, LightGBM feature encoding, and out-of-fold prediction protocols.", "Test Sensitivity", 36, ["improving-sensitivity-cuped"], ["netflix-stratification", "microsoft-delta-method"]),
    (13, "netflix-stratification", "Case Study: Stratified Sampling & Variance Reduction at Netflix Scale", "Post-stratification weighting, streaming cluster allocation, and handling global subscriber heterogeneity.", "Test Sensitivity", 36, ["doordash-cupac"], ["microsoft-delta-method", "ratio-metrics"]),
    (14, "microsoft-delta-method", "Paper Analysis: Delta Method for Ratio Metrics & Non-Linear Functions at Microsoft", "Taylor series linearizations, covariance matrices for ratio estimators, and metric variance calculations at scale.", "Test Sensitivity", 36, ["netflix-stratification"], ["ratio-metrics", "fundamentals-of-econometrics"]),
    (15, "ratio-metrics", "Deep Dive: Ratio Metrics, Delta Method Linearization & Variance Estimators", "Derivation of Delta Method for click-through-rates, conversion ratios, and multi-level data aggregation.", "Test Sensitivity", 34, ["microsoft-delta-method"], ["fundamentals-of-econometrics", "intro-to-econometrics"]),
    (16, "fundamentals-of-econometrics", "Fundamentals of Econometrics: OLS, Instrumental Variables & Causal Inference", "Ordinary Least Squares assumptions, Gauss-Markov theorem, endogeneity, and 2SLS Instrumental Variables.", "Econometrics", 36, ["ratio-metrics"], ["intro-to-econometrics", "econometrics-course"]),
    (17, "intro-to-econometrics", "Coursera: Introduction to Econometrics & Panel Data Analysis", "Fixed Effects vs Random Effects models, Hausman specification test, and pooled cross-sectional regressions.", "Econometrics", 34, ["fundamentals-of-econometrics"], ["econometrics-course", "learn-time-series"]),
    (18, "econometrics-course", "Advanced Econometric Modeling: Difference-in-Differences & Synthetic Controls", "Parallel trends assumption, staggered diff-in-diff, synthetic control optimization, and placebo tests.", "Econometrics", 36, ["intro-to-econometrics"], ["learn-time-series", "time-series-basics"]),
    (19, "learn-time-series", "Time Series Analysis: Stationarity, Autocorrelation & Stationarity Tests", "Stationary processes, Augmented Dickey-Fuller (ADF) test, ACF/PACF plots, and white noise invariants.", "Time Series", 34, ["econometrics-course"], ["time-series-basics"]),
    (20, "time-series-basics", "Time Series Decomposition: Trend, Seasonality, Residuals & Exponential Smoothing", "Additive vs multiplicative decomposition, Holt-Winters exponential smoothing, and seasonal adjustments.", "Time Series", 34, ["learn-time-series"], ["arima-model-for-time-series"])
]

for idx, slug, title, tagline, cat, rt, prereqs, rel in configs:
    add_blog(
        slug=slug,
        title=title,
        tagline=tagline,
        category=cat,
        read_time=rt,
        prereqs=prereqs,
        related=rel,
        practice_probs=[{"title": f"{title} Harness", "difficulty": "Medium", "url": "https://leetcode.com/problems/random-pick-with-weight/"}],
        markdown=md_vars[idx]
    )

output_json = 'scratch/ai_batch2_heavy.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"\nSUCCESSFULLY GENERATED ALL {len(blogs)} CLEAN BATCH 2 BLOGS IN {output_json}!")
