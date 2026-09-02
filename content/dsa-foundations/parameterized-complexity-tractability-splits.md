# Parameterized Complexity — Tractability Beyond Worst Case

> NP-hardness is a worst-case verdict over all inputs. But many hard problems have a hidden "small parameter" — the treewidth, solution size, or number of constraints — that, if fixed, makes the problem tractable. Parameterized complexity carves out this tractable slice.

---

## 1. Historical Context & Motivation

**Parameterized complexity** was founded by **Rod Downey and Mike Fellows** in a series of papers starting in **1989**, culminating in their **1999 monograph** *Parameterized Complexity*. They introduced the central distinction:

- **Fixed-Parameter Tractable (FPT)**: solvable in time $f(k) \cdot n^{O(1)}$, where $k$ is the parameter and $f$ is any computable function.
- **W[1]-hard**: believed not to be FPT (analogous to NP-hard, but for parameterized problems).

The **W-hierarchy** $W[1] \subseteq W[2] \subseteq \dots \subseteq W[P]$ organizes parameterized intractability. The key open question — analogous to P vs NP — is whether **FPT = W[1]**, and most theorists believe not.

Major algorithmic advances followed:
- **Color-Coding** (Alon, Yuster, Zwick 1995): randomized FPT for finding bounded-size patterns.
- **Bounded Search Trees**: simple but powerful — branch on each choice, bound depth by $k$.
- **Kernelization**: Reduce the instance in polynomial time to a kernel of size $g(k)$ before solving.
- **Iterative Compression** (Reed, Smith, Vetta 2004): build a solution incrementally, compressing at each step.

The **Exponential Time Hypothesis (ETH)** and **Strong Exponential Time Hypothesis (SETH)**, both due to **Impagliazzo-Paturi-Zane (2001)**, give quantitative lower bounds: under ETH, 3-SAT requires $2^{\Omega(n)}$ time, ruling out subexponential FPT algorithms for many problems.

---

## 2. Core Mathematical Invariants

### FPT Definition

A parameterized problem $L \subseteq \Sigma^* \times \mathbb{N}$ is **FPT** if there is an algorithm deciding $(x, k) \in L$ in time:

$$f(k) \cdot |x|^{O(1)}$$

for some computable $f$.

The crucial insight: the exponent of $n$ must be independent of $k$. Compare to naïve $O(n^k)$ algorithms (e.g., brute-force $k$-Clique) which are *not* FPT.

### The W-Hierarchy

| Class | Complete problem (representative) |
|-------|----------------------------------|
| FPT | Vertex Cover (parameterized by $k$) |
| W[1] | $k$-Clique |
| W[2] | Dominating Set |
| W[P] | Circuit Satisfiability with $k$ nondeterministic gates |

$$\text{FPT} \subseteq W[1] \subseteq W[2] \subseteq \dots \subseteq W[P] \subseteq \text{XP}$$

**XP** is the class of problems solvable in time $n^{f(k)}$ — strictly weaker than FPT (provable).

### Kernelization

A **kernelization** reduces an instance $(x, k)$ in polynomial time to $(x', k')$ with $|x'| + k' \le g(k)$, such that $(x, k) \in L \iff (x', k') \in L$.

**Theorem (folklore)**: A problem is FPT iff it has a kernelization.

```svg
<svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="420" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Parameterized Tractability Hierarchy</text>

  <!-- XP -->
  <rect x="30" y="60" width="620" height="320" fill="none" stroke="#f85149" stroke-width="2"/>
  <text x="50" y="82" font-family="monospace" font-size="13" fill="#f85149">XP — time n^(f(k)). Sliceable: poly for each fixed k, but exponent grows.</text>

  <!-- W[P] -->
  <rect x="60" y="110" width="560" height="250" fill="none" stroke="#d2a8ff" stroke-width="2"/>
  <text x="80" y="130" font-family="monospace" font-size="13" fill="#d2a8ff">W[P] — CIRCUIT-SAT with k nondet. gates</text>

  <!-- W[2] -->
  <rect x="100" y="160" width="480" height="180" fill="none" stroke="#f0883e" stroke-width="2"/>
  <text x="120" y="180" font-family="monospace" font-size="13" fill="#f0883e">W[2] — DOMINATING SET</text>

  <!-- W[1] -->
  <rect x="140" y="210" width="400" height="110" fill="none" stroke="#3fb950" stroke-width="2"/>
  <text x="160" y="230" font-family="monospace" font-size="13" fill="#3fb950">W[1] — k-CLIQUE (ETH ⟹ not FPT)</text>

  <!-- FPT -->
  <rect x="180" y="260" width="320" height="50" fill="none" stroke="#58a6ff" stroke-width="2"/>
  <text x="200" y="290" font-family="monospace" font-size="13" fill="#58a6ff">FPT — f(k)·n^O(1). VERTEX COVER, k-PATH</text>

  <text x="340" y="400" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">FPT ⊆ W[1] ⊆ W[2] ⊆ ... ⊆ W[P] ⊆ XP. All inclusions believed strict.</text>
</svg>
```

### Bounded Search Tree Pattern

For Vertex Cover: pick any edge $(u, v)$. At least one of $u, v$ must be in the cover. Branch:
- Recurse with $u$ included, $k - 1$.
- Recurse with $v$ included, $k - 1$.

The recursion tree has $\le 2^k$ leaves; each level is $O(m)$. Total: $O(2^k \cdot m)$.

### ETH and SETH

- **ETH**: 3-SAT cannot be solved in $2^{o(n)}$ time.
- **SETH**: For every $\epsilon > 0$, there is a $k$ such that $k$-SAT cannot be solved in $O(2^{(1-\epsilon)n})$ time.

Under ETH, $k$-Clique requires $n^{\Omega(k)}$ time (Chen et al. 2005), so it's W[1]-hard.

---

## 3. Step-by-Step Execution Trace

### Vertex Cover via Bounded Search Tree

Input: A graph $G$ with edges $\{(1,2), (2,3), (3,4), (4,5)\}$, parameter $k = 2$.

| Step | Edge picked | Branch | Recursion depth |
|------|-------------|--------|-----------------|
| 1 | $(1,2)$ | Include 1: $k' = 1$, remove edges incident to 1 | 1 |
| 2 | (in left branch) $(3,4)$ | Include 3: $k' = 0$, remove edges incident to 3 | 2 |
| 3 | Check: any edges left? $(4,5)$ remains | $k' = 0$, FAIL | leaf |
| 4 | (back to step 2) Include 4: $k' = 0$, remove edges | leaf | 2 |
| 5 | Check: any edges left? $(2,3)$ might remain | depends on preprocessing | |
| 6 | (back to step 1) Include 2: $k' = 1$, remove edges incident to 2 | 1 |
| 7 | $(4,5)$ remains | Include 4 or 5: $k' = 0$ | 2 |
| 8 | No edges left → SUCCESS. Cover = $\{2, 4\}$ or $\{2, 5\}$ | leaf |

Recursion tree has $\le 2^2 = 4$ leaves. Each visit is $O(m)$. Total: $O(4m)$.

### Kernelization for Vertex Cover

**Buss's kernel**: If any vertex has degree $> k$, it must be in the cover (otherwise we need $> k$ other vertices). Remove it, decrement $k$. Repeat. Then if more than $k^2$ edges remain, infeasible (each non-cover vertex can be adjacent to at most $k$ cover vertices).

```svg
<svg viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="340" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Vertex Cover: Search Tree of depth k</text>

  <!-- Root -->
  <rect x="280" y="60" width="120" height="40" fill="#21262d" stroke="#58a6ff" stroke-width="2"/>
  <text x="340" y="85" text-anchor="middle" font-family="monospace" font-size="11" fill="#58a6ff">Edge (u,v), k=2</text>

  <!-- Level 1 -->
  <rect x="140" y="140" width="120" height="40" fill="#21262d" stroke="#3fb950" stroke-width="2"/>
  <text x="200" y="165" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">+u, k=1</text>
  <rect x="420" y="140" width="120" height="40" fill="#21262d" stroke="#3fb950" stroke-width="2"/>
  <text x="480" y="165" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">+v, k=1</text>

  <line x1="310" y1="100" x2="220" y2="140" stroke="#30363d"/>
  <line x1="370" y1="100" x2="460" y2="140" stroke="#30363d"/>

  <!-- Level 2 -->
  <rect x="60" y="220" width="120" height="40" fill="#21262d" stroke="#f0883e" stroke-width="2"/>
  <text x="120" y="245" text-anchor="middle" font-family="monospace" font-size="11" fill="#f0883e">+a, k=0</text>
  <rect x="220" y="220" width="120" height="40" fill="#21262d" stroke="#f0883e" stroke-width="2"/>
  <text x="280" y="245" text-anchor="middle" font-family="monospace" font-size="11" fill="#f0883e">+b, k=0</text>
  <rect x="340" y="220" width="120" height="40" fill="#21262d" stroke="#f0883e" stroke-width="2"/>
  <text x="400" y="245" text-anchor="middle" font-family="monospace" font-size="11" fill="#f0883e">+c, k=0</text>
  <rect x="500" y="220" width="120" height="40" fill="#21262d" stroke="#f0883e" stroke-width="2"/>
  <text x="560" y="245" text-anchor="middle" font-family="monospace" font-size="11" fill="#f0883e">+d, k=0</text>

  <line x1="180" y1="180" x2="120" y2="220" stroke="#30363d"/>
  <line x1="220" y1="180" x2="280" y2="220" stroke="#30363d"/>
  <line x1="460" y1="180" x2="400" y2="220" stroke="#30363d"/>
  <line x1="500" y1="180" x2="560" y2="220" stroke="#30363d"/>

  <!-- Leaves -->
  <text x="120" y="290" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">leaf: check</text>
  <text x="280" y="290" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">leaf: check</text>
  <text x="400" y="290" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">leaf: check</text>
  <text x="560" y="290" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">leaf: check</text>

  <text x="340" y="325" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">Tree size 2^k. Each leaf: O(m). Total: O(2^k · m).</text>
</svg>
```

---

## 4. Production-Ready Implementations

### C++: FPT Vertex Cover via Bounded Search Tree

```cpp
#include <bits/stdc++.h>
using namespace std;

// FPT Vertex Cover: O(2^k * (n+m))
// Returns true if G has a vertex cover of size <= k.
// Fills `cover` with such a cover if one exists.

bool vertex_cover_fpt(int n, vector<pair<int,int>>& edges,
                       int k, vector<int>& cover) {
    if (k < 0) return false;
    if (edges.empty()) return true;
    if (k == 0) return false;  // edges remain but no budget

    auto [u, v] = edges[0];

    // Branch 1: include u
    {
        vector<pair<int,int>> rem;
        for (auto [a, b] : edges) {
            if (a != u && b != u) rem.push_back({a, b});
        }
        vector<int> sub;
        if (vertex_cover_fpt(n, rem, k - 1, sub)) {
            cover = sub;
            cover.push_back(u);
            return true;
        }
    }

    // Branch 2: include v
    {
        vector<pair<int,int>> rem;
        for (auto [a, b] : edges) {
            if (a != v && b != v) rem.push_back({a, b});
        }
        vector<int> sub;
        if (vertex_cover_fpt(n, rem, k - 1, sub)) {
            cover = sub;
            cover.push_back(v);
            return true;
        }
    }
    return false;
}

int main() {
    int n = 5;
    vector<pair<int,int>> edges = {{0,1}, {1,2}, {2,3}, {3,4}};
    for (int k = 1; k <= 4; k++) {
        vector<int> cover;
        bool ok = vertex_cover_fpt(n, edges, k, cover);
        cout << "k=" << k << ": " << (ok ? "YES" : "NO");
        if (ok) {
            cout << " cover = {";
            for (size_t i = 0; i < cover.size(); i++) cout << cover[i] << (i+1<cover.size()?",":"");
            cout << "}";
        }
        cout << "\n";
    }
    // k=1: NO, k=2: YES {1,3}, k=3: YES {0,2,3} or similar, k=4: YES
}
```

### Python: k-Path via Color-Coding

```python
"""
Color-coding algorithm for the k-PATH problem:
find a simple path of length k in a graph.

Randomized FPT: O(2^k * n^O(1)) per trial, success prob >= 1/e.
"""
import random

def k_path_color_coding(graph, k, trials=100):
    """
    graph: dict node -> list of neighbors
    Returns: a k-path (list of nodes) or None.
    """
    nodes = list(graph.keys())
    n = len(nodes)

    for _ in range(trials):
        # Random coloring with k colors
        colors = {v: random.randrange(k) for v in nodes}

        # DP: dp[S][v] = True if there's a path using colors S ending at v
        # S is a bitmask of used colors.
        from functools import lru_cache

        @lru_cache(maxsize=None)
        def dp(S, v):
            if S == 0:
                return True  # empty path
            color_v = colors[v]
            if not (S & (1 << color_v)):
                return False  # v's color not in S
            S_without_v = S ^ (1 << color_v)
            if S_without_v == 0:
                return True  # v is the only node
            for u in graph[v]:
                if dp(S_without_v, u):
                    return True
            return False

        # Try every full-color mask and every endpoint
        full_mask = (1 << k) - 1
        for v in nodes:
            if dp(full_mask, v):
                # Reconstruct path (skipped for brevity)
                return True
    return False

# Example: path 0->1->2->3->4 in a graph
graph = {0:[1], 1:[0,2], 2:[1,3], 3:[2,4], 4:[3]}
print("k=4 path:", k_path_color_coding(graph, 4))
print("k=10 path:", k_path_color_coding(graph, 10))
```

---

## 5. Asymptotic Time & Space Complexity

| Problem | Parameter | Best FPT algorithm | Lower bound |
|---------|-----------|-------------------|-------------|
| Vertex Cover | $k$ (solution size) | $O(1.2738^k + k n)$ (Chen-Kanj-Xia 2010) | ETH: $1.199^k$ |
| $k$-Path | $k$ | $O(2^k \cdot n^2)$ (color-coding) | ETH: $2^{o(k)}$ excluded |
| Feedback Vertex Set | $k$ | $O(3^k \cdot n)$ | |
| Treewidth | $w$ | $O(2^{O(w^3)} n)$ (Bodlaender) | ETH: $2^{o(w)}$ excluded |
| Planar $k$-Dominating Set | $k$ | $O(2^{O(\sqrt{k})} n)$ | tight |
| Longest Path | $k$ | $O(2^k \cdot n)$ (color-coding) | |
| Steiner Tree | # terminals $k$ | $O(2^k n + n^2 \log n)$ (Dreyfus-Wagner) | ETH: $2^{o(k)}$ excluded |

### Kernel Sizes

| Problem | Kernel size |
|---------|-------------|
| Vertex Cover | $2k$ vertices (Nemhauser-Trotter theorem + reductions) |
| Feedback Vertex Set | $O(k^2)$ |
| $d$-Hitting Set | $O(k^d)$ |
| Planar Dominating Set | $O(k)$ (linear kernel!) |

---

## 6. Systems Connections

### Where parameterized algorithms shine in production

- **Computational biology**: Multiple sequence alignment (parameterized by alignment length), phylogenetic tree construction (treewidth of compatibility graph).
- **AI planning**: Many planning problems are FPT when parameterized by plan length, treewidth of the causal graph, or number of agents.
- **Verification**: Model checking CTL* is FPT in treewidth of the system; bounded model checking reduces to SAT with parameter $k$ (unrolling depth).
- **Database theory**: Conjunctive query evaluation is FPT when parameterized by treewidth of the query (which is usually small in real workloads).
- **Network analysis**: Community detection, dense subgraph discovery — often parameterized by community size or density threshold.
- **Computational social choice**: Winner determination in many voting rules is FPT in the number of candidates.

---

## 7. Practice Checklist

- [ ] **Prove** Vertex Cover is FPT via bounded search tree ($O(2^k m)$).
- [ ] **Implement** the Nemhauser-Trotter LP-based $2k$-vertex kernel for VC.
- [ ] **Code** color-coding for $k$-Path and verify on small graphs.
- [ ] **Show** $k$-Clique is W[1]-complete (reduction from Short Turing Machine Acceptance).
- [ ] **State** the ETH and derive that $k$-Clique requires $n^{\Omega(k)}$.
- [ ] **Implement** Bodlaender's treewidth algorithm (sketch).
- [ ] **Read** Cygan et al. *Parameterized Algorithms*; Downey-Fellows *Parameterized Complexity*.
- [ ] **Try** [Vertex Cover on Parameterized Algorithms Contest](https://parameterized.algo.win/) problems.

---

## 8. Frequently Asked Questions

**Q1. What's the difference between FPT and XP?**
**FPT** means time $f(k) \cdot n^c$ — the exponent $c$ is a *constant* independent of $k$. **XP** means time $n^{f(k)}$ — the exponent *grows* with $k$. For $k$-Clique, the naïve $O(n^k)$ algorithm is in XP but not known (or believed) to be FPT. The distinction matters: an FPT algorithm with $f(k) = 2^k$ solves $k = 30$ in time $2^{30} \cdot n^2$, while an XP algorithm $n^{30}$ is hopeless for $n = 1000$.

**Q2. Is parameterized complexity just "fast exponential algorithms"?**
Yes and no. Many FPT algorithms are exponential in $k$ — but they're *fixed* exponential. The real power is that for small $k$ (which is often the practical case), FPT algorithms run fast. Moreover, kernelization can give polynomial-time preprocessing that reduces the instance to size $g(k)$ before any exponential search. This "preprocess then solve" pipeline is now standard in industrial solvers.

**Q3. Why do we believe FPT ≠ W[1]?**
The Exponential Time Hypothesis (ETH) implies FPT ≠ W[1] — specifically, $k$-Clique requires $n^{\Omega(k)}$ time. ETH itself asserts 3-SAT cannot be solved in $2^{o(n)}$ time, which is consistent with all known algorithms. If FPT = W[1], then $k$-Clique could be solved in $f(k) \cdot n^c$, contradicting ETH.

**Q4. What makes treewidth such a magical parameter?**
Treewidth measures how "tree-like" a graph is. Many hard graph problems become polynomial (or even linear) when parameterized by treewidth $w$ via dynamic programming on the tree decomposition. Real-world graphs (road networks, circuit layouts, parse trees) often have small treewidth. Courcelle's theorem says any MSO-definable property can be decided in linear time on bounded-treewidth graphs — a remarkable meta-result.

**Q5. How does kernelization relate to FPT?**
They're equivalent: a problem is FPT iff it has a kernel (polynomial-time reduction to size $g(k)$). The forward direction runs the FPT algorithm and outputs a trivial YES/NO instance; the backward direction solves the kernel via brute force. Interesting questions concern *polynomial kernels*: when can $g(k)$ be polynomial in $k$? Many FPT problems have polynomial kernels (Vertex Cover: $2k$ vertices), but some provably don't (under complexity assumptions) — e.g., Longest Path has no polynomial kernel unless NP ⊆ coNP/poly.
