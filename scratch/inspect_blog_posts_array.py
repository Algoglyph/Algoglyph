with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

batch2_slugs = [
    "practitioners-guide-statistical-tests",
    "doordash-cupac",
    "netflix-stratification",
    "microsoft-delta-method",
    "ratio-metrics",
    "fundamentals-of-econometrics",
    "intro-to-econometrics",
    "econometrics-course",
    "learn-time-series",
    "time-series-basics"
]

for slug in batch2_slugs:
    p = text.find(f'"slug": "{slug}"')
    if p == -1:
        p = text.find(f"'slug': '{slug}'")
    print(f"Slug '{slug}' position in blogData.ts: {p}")
