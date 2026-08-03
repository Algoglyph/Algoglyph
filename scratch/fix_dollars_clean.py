with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Fix $$`$$\mathbf{coNP}` or $$\$$\mathbf{coNP}
text = text.replace("$$\\$$\\mathbf{coNP}", "$$\\mathbf{coNP}")
text = text.replace("$$\\$\\mathbf{coNP}", "$$\\mathbf{coNP}")
text = text.replace("$$\\$$\\mathbf{P}", "$$\\mathbf{P}")
text = text.replace("$$\\$\\mathbf{P}", "$$\\mathbf{P}")
text = text.replace("$$\\$$\\mathbf{NP}", "$$\\mathbf{NP}")
text = text.replace("$$\\$\\mathbf{NP}", "$$\\mathbf{NP}")

# Also replace $1,000,000 with \$1,000,000 or USD 1,000,000 so it won't trigger inline math
text = text.replace("with a $1,000,000 prize", "with a USD $1,000,000 prize")

with open("src/config/blogData.ts", "w", encoding="utf-8") as f:
    f.write(text)

print("FIXED TRIPLE DOLLARS AND CURRENCY SIGNS IN blogData.ts!")
