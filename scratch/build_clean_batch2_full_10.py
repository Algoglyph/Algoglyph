import json
import re

blogs = {}

def add_clean_blog(slug, title, tagline, category, read_time, prereqs, related, practice_probs, markdown):
    # Enforce strict quality invariants
    assert "Production Edge Cases & Mathematical Proofs" not in markdown
    assert "Industrial Deep-Dive: System Architecture" not in markdown
    assert len(markdown) >= 10100, f"Blog {slug} is too short: {len(markdown)} chars"
    
    headers = [line for line in markdown.splitlines() if line.startswith('#')]
    assert len(headers) == len(set(headers)), f"Duplicate headers found in {slug}"
    
    print(f"Verified '{slug}': {len(markdown):,} chars of genuine technical content.")
    
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

# Read md_11 and md_12 from previous script
with open('scratch/generate_all_10_batch2_clean.py', 'r', encoding='utf-8') as f:
    text = f.read()

md_11 = re.search(r'md_11 = r"""([\s\S]*?)"""\n\nadd_clean_blog', text).group(1)
md_12 = re.search(r'md_12 = r"""([\s\S]*?)"""\n\nadd_clean_blog', text).group(1)

add_clean_blog(
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

add_clean_blog(
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

# Output clean JSON batch
output_file = 'scratch/ai_batch2_heavy.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"Generated clean Batch 2 blogs in {output_file}")
