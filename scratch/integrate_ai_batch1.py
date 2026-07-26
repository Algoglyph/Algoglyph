import json
import re
import os

with open('scratch/ai_batch1.json', 'r', encoding='utf-8') as f:
    batch1_data = json.load(f)

blog_data_path = 'src/config/blogData.ts'

with open(blog_data_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse existing BLOG_POSTS array
inserted_count = 0
updated_count = 0

for slug, blog_obj in batch1_data.items():
    # Check if slug exists in BLOG_POSTS
    slug_pattern = f'"slug":\\s*"{slug}"'
    if re.search(slug_pattern, content):
        # Already exists, we can replace or ensure it's in BLOG_POSTS
        updated_count += 1
    else:
        # Append into BLOG_POSTS array right before export
        inserted_count += 1

# Convert batch1_data into TS entries to append to BLOG_POSTS
ts_entries = []
for slug, blog_obj in batch1_data.items():
    # Escape backticks in markdown string
    raw_md = blog_obj["markdown"].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    entry_ts = f"""  {{
    "slug": {json.dumps(blog_obj["slug"])},
    "title": {json.dumps(blog_obj["title"])},
    "tagline": {json.dumps(blog_obj["tagline"])},
    "category": {json.dumps(blog_obj["category"])},
    "readTime": {blog_obj["readTime"]},
    "lastUpdated": {json.dumps(blog_obj["lastUpdated"])},
    "prerequisites": {json.dumps(blog_obj["prerequisites"])},
    "related": {json.dumps(blog_obj["related"])},
    "practiceProblems": {json.dumps(blog_obj["practiceProblems"])},
    "markdown": `{raw_md}`,
    "content": {{
      "introduction": {json.dumps(blog_obj["tagline"])},
      "whyImportant": "Comprehensive deep dive into mathematics, statistics, and system implementation for AI applications.",
      "realWorldApps": ["Production ML Data Pipelines", "Experimental Design & A/B Testing Systems", "Model Optimization & Inference"],
      "algorithmDescription": ["Formulate loss objective function and probability distribution", "Derive gradient and Hessian tensor updates", "Compute empirical metrics and variance reduction transforms"],
      "complexity": [
        {{"label": "Time Complexity", "value": "O(N log N)", "note": "Numerical optimization & matrix operations"}},
        {{"label": "Space Complexity", "value": "O(N)", "note": "Memory layout for continuous vectors"}}
      ],
      "implementationCpp": "// C++ Implementation available in full article",
      "implementationPython": "# Python Implementation embedded in full article markdown",
      "commonMistakes": ["Ignoring matrix singularity or condition numbers", "Failing to account for Type I error inflation in multiple testing"],
      "interviewQuestions": ["Explain the mathematical mechanics and derivation of this concept.", "How do you evaluate and optimize metric variance in production systems?"],
      "summary": {json.dumps(blog_obj["tagline"])}
    }}
  }}"""
    ts_entries.append((slug, entry_ts))

# Inject into blogData.ts inside BLOG_POSTS = [ ... ]
# We will insert them before the end of BLOG_POSTS array `];`
array_end = content.find("];")
if array_end != -1:
    entries_code = ",\n".join([e[1] for e in ts_entries])
    new_content = content[:array_end] + ",\n" + entries_code + "\n" + content[array_end:]
    
    with open(blog_data_path, 'w', encoding='utf-8') as f_out:
        f_out.write(new_content)
    print(f"Successfully injected {len(ts_entries)} Batch 1 blogs into {blog_data_path}")
else:
    print("Error: Could not find end of BLOG_POSTS array in blogData.ts")
