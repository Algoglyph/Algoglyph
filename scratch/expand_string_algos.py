import json
import re

extra_string_algos = r"""

---

## 8. Suffix Automaton (SAM / DAWG) Architecture

A **Suffix Automaton** (also known as a Directed Acyclic Word Graph or DAWG) is a minimal deterministic finite automaton (DFA) that accepts all suffixes of a given string $S$ of length $N$.

### Key Complexity Characteristics
- **Number of States (Vertices)**: At most $2N - 1$.
- **Number of Transitions (Edges)**: At most $3N - 4$.
- **Construction Time**: Optimal linear $O(N)$ time.

### Suffix Automaton Construction in C++

```cpp
#include <iostream>
#include <vector>
#include <map>

struct State {
    int len, link;
    std::map<char, int> next;
};

const int MAXLEN = 100005;
State st[MAXLEN * 2];
int sz, last;

void sam_init() {
    st[0].len = 0;
    st[0].link = -1;
    sz = 1;
    last = 0;
}

void sam_extend(char c) {
    int cur = sz++;
    st[cur].len = st[last].len + 1;
    int p = last;

    while (p != -1 && !st[p].next.count(c)) {
        st[p].next[c] = cur;
        p = st[p].link;
    }

    if (p == -1) {
        st[cur].link = 0;
    } else {
        int q = st[p].next[c];
        if (st[p].len + 1 == st[q].len) {
            st[cur].link = q;
        } else {
            int clone = sz++;
            st[clone].len = st[p].len + 1;
            st[clone].next = st[q].next;
            st[clone].link = st[q].link;

            while (p != -1 && st[p].next[c] == q) {
                st[p].next[c] = clone;
                p = st[p].link;
            }

            st[q].link = st[cur].link = clone;
        }
    }
    last = cur;
}
```

---

## 9. Suffix Array & LCP Array via Kasai's Algorithm

A **Suffix Array** is a sorted array of all suffixes of string $S$. 
The **Longest Common Prefix (LCP) Array** stores lengths of the longest common prefix between adjacent suffixes in the sorted suffix array.

### Kasai's Algorithm ($O(N)$ LCP Array Construction)
Given Suffix Array $SA$ of length $N$, Kasai's algorithm computes the $LCP$ array in linear $O(N)$ time by exploiting the property that $LCP[i] \ge LCP[i-1] - 1$:

```python
def build_lcp_kasai(s: str, sa: List[int]) -> List[int]:
    n = len(s)
    rank = [0] * n
    for i in range(n):
        rank[sa[i]] = i

    lcp = [0] * n
    h = 0

    for i in range(n):
        if rank[i] > 0:
            j = sa[rank[i] - 1]
            while i + h < n and j + h < n and s[i + h] == s[j + h]:
                h += 1
            lcp[rank[i]] = h
            if h > 0:
                h -= 1

    return lcp
```

---

## 10. Palindromic Tree (EERTREE) Data Structure

A **Palindromic Tree** (EERTREE) stores all distinct palindromic substrings of a string in linear $O(N)$ time and space:
- Contains two root nodes: Root -1 (representing imaginary palindromes of length -1) and Root 0 (representing empty string of length 0).
- Edges represent adding a character to both ends of a palindrome: $P \to c P c$.
- Suffix links point to the longest proper palindromic suffix of the current node.
"""

with open('scratch/fix_batch3_headers_perfect.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Inject extra_string_algos into additions[30]
p_30 = text.find('30: r"""')
p_30_end = text.find('"""\n}', p_30)

text_updated = text[:p_30_end] + extra_string_algos + text[p_30_end:]

with open('scratch/fix_batch3_headers_perfect.py', 'w', encoding='utf-8') as f:
    f.write(text_updated)

print("Updated scratch/fix_batch3_headers_perfect.py with extra string algorithms sections.")
