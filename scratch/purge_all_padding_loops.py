import re

blog_data_path = 'src/config/blogData.ts'

with open(blog_data_path, 'r', encoding='utf-8') as f:
    text = f.read()

print(f"Original file length: {len(text):,} chars")

# Remove repeated padding headers: "#### Production Edge Cases & Mathematical Proofs..."
padding_pattern = r'(\\n)*#### Production Edge Cases & Mathematical Proofs\\nEvaluating high-dimensional telemetry requires robust matrix algebra and distribution checks\. Handling near-singular matrices via singular value truncation \$\\sigma_i > \\epsilon\$ prevents floating-point instability, maintaining exact confidence interval boundaries across continuous A/B experimentation systems\.'

cleaned_text = re.sub(padding_pattern, '', text)

# Also remove any "### Industrial Deep-Dive: System Architecture & Invariants for..." if it was appended as generic fallback
padding_pattern_2 = r'(\\n)*### Industrial Deep-Dive: System Architecture & Invariants for [^\\n]+\\nIn production data science and AI experimentation pipelines, implementing [^\\n]+ requires rigorous telemetry monitoring and mathematical verification\. When metrics undergo non-linear transformations or streaming aggregation, tracking condition numbers, variance scaling factors, and estimator bias ensures reliable inference\. Distributed execution engines \(e\.g\. Apache Spark, Trino, Ray\) execute these calculations over multi-terabyte datasets, maintaining sub-second query latencies while preserving statistical validity\.'

cleaned_text = re.sub(padding_pattern_2, '', cleaned_text)

print(f"Cleaned file length: {len(cleaned_text):,} chars")

with open(blog_data_path, 'w', encoding='utf-8') as f_out:
    f_out.write(cleaned_text)

print("Purged all repeated padding loops from blogData.ts")
