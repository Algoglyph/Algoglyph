import json
import re
import subprocess

print("=== ABSOLUTELY PERFECT CLEAN REBUILD OF blogData.ts ===")

# 1. Restore blogData.ts clean from git
subprocess.run(['git', 'restore', 'src/config/blogData.ts'], check=True)

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open('scratch/ai_batch3_heavy_real_pure.json', 'r', encoding='utf-8') as f:
    batch3_dict = json.load(f)

# 2. Add extra sections to #25 and #26 in python memory (raw text with standard backticks)
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

if "Vectorized Pairwise Cosine Distance" not in batch3_dict['algorithmic-exercises']['markdown']:
    batch3_dict['algorithmic-exercises']['markdown'] += extra_25

if "Monotonic Stack Algorithm for Next Greater Element" not in batch3_dict['study-plans-leetcode']['markdown']:
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

# 3. Clean headers and fix stray `})` in raw python string
for slug, article in batch3_dict.items():
    md = article['markdown']
    md = md.replace("```\n  })\n    return", "```\n    return")
    md = clean_markdown_headers_perfectly(md)
    article['markdown'] = md

def escape_template_literal(text):
    # Strip any existing escaping backslashes first
    text = re.sub(r'\\+`', '`', text)
    text = re.sub(r'\\+\${', '${', text)
    text = text.replace('\\\\', '\\')
    
    # Escape backslashes first
    text = text.replace('\\', r'\\')
    # Escape every backtick
    text = text.replace('`', r'\`')
    # Escape ${
    text = text.replace('${', r'\${')
    return text

# 4. Inject into content
injected_count = 0
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
        print(f"Updated existing entry for '{slug}'")
        injected_count += 1
    else:
        last_bracket = content.rfind('];')
        if last_bracket != -1:
            content = content[:last_bracket].rstrip() + ",\n" + new_entry_code + "\n];\n"
            print(f"Appended new entry for '{slug}'")
            injected_count += 1

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nPERFECTLY REBUILT blogData.ts FOR ALL {injected_count} BLOGS!")
