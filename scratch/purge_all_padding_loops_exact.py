import re

blog_data_path = 'src/config/blogData.ts'

with open(blog_data_path, 'r', encoding='utf-8') as f:
    text = f.read()

print(f"Original file length: {len(text):,} chars")

# Remove any occurrence of "#### Production Edge Cases & Mathematical Proofs..."
# and "### Industrial Deep-Dive: System Architecture & Invariants for..."
target_sub_1 = "#### Production Edge Cases & Mathematical Proofs\nEvaluating high-dimensional telemetry requires robust matrix algebra and distribution checks. Handling near-singular matrices via singular value truncation $\\sigma_i > \\epsilon$ prevents floating-point instability, maintaining exact confidence interval boundaries across continuous A/B experimentation systems."
target_sub_2 = "#### Production Edge Cases & Mathematical Proofs\nEvaluating high-dimensional telemetry requires robust matrix algebra and distribution checks. Handling near-singular matrices via singular value truncation \\\\sigma_i > \\\\epsilon prevents floating-point instability, maintaining exact confidence interval boundaries across continuous A/B experimentation systems."

# Regex to match any block starting from `### Industrial Deep-Dive` down to the repeated `#### Production Edge Cases`
cleaned_text = re.sub(r'\n\n### Industrial Deep-Dive: System Architecture & Invariants for [\s\S]*?(?=\n\n## Frequently Asked Questions|\n\n"|\n  \})', '', text)

cleaned_text = re.sub(r'\n\n#### Production Edge Cases & Mathematical Proofs[\s\S]*?(?=\n\n## Frequently Asked Questions|\n\n"|\n  \})', '', cleaned_text)

print(f"Cleaned file length: {len(cleaned_text):,} chars")

with open(blog_data_path, 'w', encoding='utf-8') as f_out:
    f_out.write(cleaned_text)

print("Purged all repeated padding loops from blogData.ts successfully.")
