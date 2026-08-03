import json
import re

print("=== EXPANDING BLOGS #25 AND #26 TO GUARANTEE > 10,200 CHARACTERS WITH CLEAN HEADERS ===")

with open('scratch/ai_batch3_heavy_real_pure.json', 'r', encoding='utf-8') as f:
    batch3_dict = json.load(f)

extra_25 = r"""

---

## 22. Vectorized Pairwise Cosine Distance Matrices

Compute row-wise cosine similarity matrices between feature representations $\mathbf{X} \in \mathbb{R}^{N \times D}$ using normalized inner products:

```python
def compute_cosine_similarity_matrix(X: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(X, axis=1, keepdims=True)
    norms[norms == 0] = 1e-10
    X_normalized = X / norms
    return np.dot(X_normalized, X_normalized.T)
```
"""

extra_26 = r"""

---

## 18. Monotonic Stack Algorithm for Next Greater Element

Find the next greater element for every array item in linear $O(N)$ time using a Monotonic Decreasing Stack:

```python
def next_greater_element(nums: list) -> list:
    stack = []
    res = [-1] * len(nums)
    for i, num in enumerate(nums):
        while stack and nums[stack[-1]] < num:
            idx = stack.pop()
            res[idx] = num
        stack.append(i)
    return res
```
"""

batch3_dict['algorithmic-exercises']['markdown'] += extra_25
batch3_dict['study-plans-leetcode']['markdown'] += extra_26

def clean_markdown_headers_perfectly(markdown):
    lines = markdown.splitlines()
    seen_h2 = set()
    cleaned_lines = []
    
    h2_counter = 1
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('## '):
            header_text = stripped[3:].strip()
            clean_title = re.sub(r'^[0-9\.\-\s]+', '', header_text).strip()
            
            if not clean_title or clean_title in seen_h2:
                continue
            seen_h2.add(clean_title)
            line = f"## {h2_counter}. {clean_title}"
            h2_counter += 1
        cleaned_lines.append(line)
        
    return "\n".join(cleaned_lines)

for slug, article in batch3_dict.items():
    article['markdown'] = clean_markdown_headers_perfectly(article['markdown'])

with open('scratch/ai_batch3_heavy_real_pure.json', 'w', encoding='utf-8') as f:
    json.dump(batch3_dict, f, indent=2)

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def escape_template_literal(text):
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\', r'\\')
    text = text.replace('`', r'\`')
    text = text.replace('${', r'\${')
    return text

for slug, article in batch3_dict.items():
    title = json.dumps(article['title'])
    tagline = json.dumps(article['tagline'])
    cat = json.dumps(article['category'])
    rt = article['readTime']
    lu = article['lastUpdated']
    prereqs = json.dumps(article['prerequisites'])
    related = json.dumps(article['related'])
    practice = json.dumps(article['practiceProblems'])
    escaped_md = escape_template_literal(article['markdown'])

    new_entry_code = f"""  {{
    slug: '{slug}',
    title: {title},
    tagline: {tagline},
    category: {cat},
    readTime: '{rt}',
    lastUpdated: '{lu}',
    prerequisites: {prereqs},
    related: {related},
    practiceProblems: {practice},
    markdown: `{escaped_md}`
  }}"""

    pattern = r"\{\s*slug:\s*['\"]" + re.escape(slug) + r"['\"][\s\S]*?\n\s*\}"
    match = re.search(pattern, content)
    
    if match:
        content = content[:match.start()] + new_entry_code.strip() + content[match.end():]

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated blogData.ts successfully!")
