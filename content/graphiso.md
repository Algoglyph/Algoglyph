# Graph Isomorphism — The Mystery Problem

> Graph Isomorphism (GI) is one of the few natural problems in NP that is neither known to be in P nor known to be NP-complete. It sits in a strange middle ground — and the recent quasipolynomial algorithm of László Babai (2015) brought it tantalizingly close to P.

---

## 1. Historical Context

The **Graph Isomorphism problem** asks: given two graphs $G_1, G_2$, is there a bijection $\pi: V_1 \to V_2$ such that $(u, v) \in E_1 \iff (\pi(u), \pi(v)) \in E_2$?

GI has resisted classification for decades. In **1979**, Garey and Johnson's seminal book listed it as one of the few problems whose complexity status was open. The problem has a peculiar property: if GI is NP-complete, then the **polynomial hierarchy collapses to its second level** (Schöning 1988). Hence most theorists believe GI is *not* NP-complete.

Progress on upper bounds:
- **Luks (1980)**: polynomial-time algorithm for bounded-degree graphs (using group theory).
- **Babai-Luks (1983)**: polynomial for certain graph classes.
- **Spielman (1996)**: $n^{O(\log n)}$ (quasipolynomial) for strongly regular graphs.
- **Babai (2015)**: $n^{O((\log n)^c)}$ for general graphs — quasipolynomial. The exponent $c$ was later improved to $c = 3$ (Helfgott 2017).

GI has a **complement**, Graph Non-Isomorphism (GNI), which has a famous **interactive proof** (Goldreich-Micali-Wigderson 1986) but is not known to be in NP.

The problem has practical importance: chemistry (matching molecules), computer vision (pattern recognition), social network analysis (de-anonymization), and cryptography (Goldreich-Micali-Wigderson zero-knowledge protocols for GI-hard languages).

---

## 2. Core Mathematical Invariants

### The Problem

$$\text{GI} = \{(G_1, G_2) : G_1 \cong G_2\}$$

A permutation $\pi$ is an **isomorphism** if it preserves adjacency:

$$\forall u, v: (u, v) \in E_1 \iff (\pi(u), \pi(v)) \in E_2$$

### The Automorphism Group

The **automorphism group** $\text{Aut}(G)$ is the set of isomorphisms from $G$ to itself. Computing $|\text{Aut}(G)|$ is polynomial-time equivalent to GI (Mathon 1979).

### Complexity Class Facts

- $\text{GI} \in \text{NP}$: certificate is the permutation $\pi$.
- $\text{GI} \in \text{coAM}$: Goldreich-Sipser (1986) gave a 2-round public-coin interactive proof for GNI.
- $\text{GI} \in \text{SPP}$ (Arvind-Kobler 2001): low counting-complexity class.
- If GI is **NP-complete**, then $\text{PH} = \Sigma_2^P$ (Schöning 1988, Boppana-Hastad-Zachos 1987).

Therefore: GI is in **NP ∩ coAM** — a class believed to strictly exclude NP-complete problems.

```svg
<svg viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="420" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">GI's Position in the Complexity Zoo</text>

  <!-- PH -->
  <rect x="30" y="60" width="620" height="320" fill="none" stroke="#f85149" stroke-width="2"/>
  <text x="50" y="82" font-family="monospace" font-size="13" fill="#f85149">PH — polynomial hierarchy</text>

  <!-- Sigma_2 -->
  <rect x="70" y="110" width="540" height="240" fill="none" stroke="#d2a8ff" stroke-width="2"/>
  <text x="90" y="130" font-family="monospace" font-size="13" fill="#d2a8ff">Σ_2^P (collapses here if GI is NP-complete)</text>

  <!-- AM -->
  <rect x="110" y="160" width="460" height="170" fill="none" stroke="#3fb950" stroke-width="2"/>
  <text x="130" y="180" font-family="monospace" font-size="13" fill="#3fb950">AM (Arthur-Merlin)</text>

  <!-- NP intersect coAM -->
  <rect x="160" y="210" width="360" height="100" fill="none" stroke="#f0883e" stroke-width="2"/>
  <text x="180" y="230" font-family="monospace" font-size="13" fill="#f0883e">NP ∩ coAM (GI lives here)</text>

  <!-- NP -->
  <rect x="200" y="260" width="120" height="40" fill="none" stroke="#58a6ff" stroke-width="2"/>
  <text x="220" y="285" font-family="monospace" font-size="12" fill="#58a6ff">NP</text>

  <!-- P -->
  <circle cx="350" cy="285" r="6" fill="#3fb950"/>

  <text x="340" y="385" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">GI ∈ NP ∩ coAM. If NP-complete, PH collapses. Almost certainly NOT NP-complete.</text>
  <text x="340" y="405" text-anchor="middle" font-family="monospace" font-size="11" fill="#3fb950">Babai 2015: GI in n^(O(log^c n)) — quasi-polynomial.</text>
</svg>
```

### Invariants Used in Practice

When testing isomorphism, compute these **invariants** first (necessary but not sufficient conditions):

| Invariant | Computation | Discriminating power |
|-----------|-------------|---------------------|
| # vertices, # edges | $O(1)$ | very weak |
| Degree sequence | $O(n + m)$ | weak |
| Spectrum (eigenvalues of adjacency) | $O(n^3)$ | medium — strongly regular graphs fool it |
| Walk counts | $O(n^3)$ | medium |
| Weisfeiler-Leman (1-WL) | $O(n^3)$ | surprisingly strong on real graphs |

The **$k$-dimensional Weisfeiler-Leman algorithm** refines vertex coloring: two vertices with different $(k-1)$-tuples of colors get different colors. For each fixed $k$, this runs in poly time but fails on some non-isomorphic graphs.

---

## 3. Step-by-Step Execution Trace

### Two Isomorphic Graphs

$G_1$: triangle $0-1-2-0$ with pendant vertex $3$ attached to $0$.
$G_2$: triangle $4-5-6-4$ with pendant $7$ attached to $5$.

| Step | Action | Result |
|------|--------|--------|
| 1 | Check same # vertices, # edges | 4, 4 — OK |
| 2 | Degree sequences | $G_1: (3, 2, 2, 1)$, $G_2: (3, 2, 2, 1)$ — match |
| 3 | Spectra | both $\{2.17, -1, -1, -0.17\}$ — match |
| 4 | 1-WL coloring | both: the degree-3 vertex gets color A, degree-1 vertex gets color B, others color C |
| 5 | Try mapping | degree-3 vertex in $G_1$ (= 0) ↔ degree-3 in $G_2$ (= 5) |
| 6 | Check adjacency preserved | $0-1, 0-2, 0-3$ ↔ $5-4, 5-6, 5-7$ — adjacency preserved |
| 7 | Output **isomorphic**, witness $\pi = (0 \to 5, 1 \to 4, 2 \to 6, 3 \to 7)$ | |

### Weisfeiler-Leman Refinement

The 1-WL algorithm iteratively refines vertex colors:

```svg
<svg viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="360" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">1-Dimensional Weisfeiler-Leman Color Refinement</text>

  <text x="40" y="80" font-family="monospace" font-size="13" fill="#d2a8ff">Input: graph G. Initialize c(v) = degree(v) for all v.</text>
  <text x="40" y="105" font-family="monospace" font-size="13" fill="#3fb950">Iterate: c'(v) = hash(c(v), multiset({c(u) : u neighbor of v}))</text>
  <text x="40" y="130" font-family="monospace" font-size="13" fill="#f0883e">Stop when partition stabilizes. Compare color multisets of two graphs.</text>

  <text x="40" y="180" font-family="monospace" font-size="12" fill="#8b949e">Example: a path P4 — 0-1-2-3</text>
  <text x="60" y="210" font-family="monospace" font-size="11" fill="#58a6ff">Round 0: c(0)=1, c(1)=2, c(2)=2, c(3)=1</text>
  <text x="60" y="230" font-family="monospace" font-size="11" fill="#58a6ff">Round 1: c(0)=hash(1,{2})=A, c(1)=hash(2,{1,1})=B</text>
  <text x="60" y="250" font-family="monospace" font-size="11" fill="#58a6ff">         c(2)=hash(2,{1,1})=B, c(3)=hash(1,{2})=A</text>
  <text x="60" y="270" font-family="monospace" font-size="11" fill="#58a6ff">Round 2: stable. Colors {A, B, B, A}.</text>

  <text x="40" y="310" font-family="monospace" font-size="12" fill="#3fb950">If two graphs have different stable color multisets, NOT isomorphic.</text>
  <text x="40" y="335" font-family="monospace" font-size="12" fill="#f85149">Caveat: some non-isomorphic graphs (e.g. Cai-Fürer-Immerman) fool k-WL for fixed k.</text>
</svg>
```

---

## 4. Production-Ready Implementations

### C++: Brute-Force GI for Small Graphs

```cpp
#include <bits/stdc++.h>
using namespace std;

// Brute-force GI by trying all permutations. O(n! * n^2) — fine for n ≤ 10.
bool isomorphic_brute(vector<vector<int>>& A, vector<vector<int>>& B) {
    int n = A.size();
    if ((int)B.size() != n) return false;
    vector<int> perm(n);
    iota(perm.begin(), perm.end(), 0);
    do {
        bool ok = true;
        for (int i = 0; i < n && ok; i++) {
            for (int j = 0; j < n && ok; j++) {
                if (A[i][j] != B[perm[i]][perm[j]]) ok = false;
            }
        }
        if (ok) return true;
    } while (next_permutation(perm.begin(), perm.end()));
    return false;
}

// 1-WL color refinement: a fast necessary condition.
vector<int> wl_refine(vector<vector<int>>& adj, int rounds = -1) {
    int n = adj.size();
    vector<int> color(n);
    for (int i = 0; i < n; i++) color[i] = adj[i].size();
    for (int r = 0; rounds == -1 || r < rounds; r++) {
        vector<pair<int, multiset<int>>> sig(n);
        for (int v = 0; v < n; v++) {
            multiset<int> nbr;
            for (int u : adj[v]) nbr.insert(color[u]);
            sig[v] = {color[v], nbr};
        }
        // Hash signatures to new colors
        map<pair<int, multiset<int>>, int> lookup;
        vector<int> new_color(n);
        for (int v = 0; v < n; v++) {
            if (!lookup.count(sig[v])) lookup[sig[v]] = lookup.size();
            new_color[v] = lookup[sig[v]];
        }
        if (new_color == color) break;
        color = new_color;
    }
    return color;
}

int main() {
    // Two isomorphic graphs (both paths P4)
    vector<vector<int>> A = {{1},{0,2},{1,3},{2}};
    vector<vector<int>> B = {{1},{0,2},{1,3},{2}};
    cout << "Brute force: " << (isomorphic_brute_adapter(A, B) ? "ISO" : "NON-ISO") << "\n";

    auto ca = wl_refine(A), cb = wl_refine(B);
    sort(ca.begin(), ca.end());
    sort(cb.begin(), cb.end());
    cout << "1-WL consistent: " << (ca == cb ? "YES" : "NO") << "\n";
}

bool isomorphic_brute_adapter(vector<vector<int>>& A, vector<vector<int>>& B) {
    // Convert adjacency lists to matrices for the brute force function.
    int n = A.size();
    vector<vector<int>> Am(n, vector<int>(n, 0)), Bm(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) for (int j : A[i]) Am[i][j] = 1;
    for (int i = 0; i < n; i++) for (int j : B[i]) Bm[i][j] = 1;
    return isomorphic_brute(Am, Bm);
}
```

### Python: Nauty-Style Canonical Form (Simplified)

```python
"""
Simplified canonical labeling via degree-sequence + WL refinement.
Not as powerful as Nauty but illustrates the approach.
"""
from collections import Counter

def wl_refinement(adj, max_rounds=100):
    """1-dimensional Weisfeiler-Leman refinement."""
    n = len(adj)
    color = [len(adj[v]) for v in range(n)]
    for _ in range(max_rounds):
        new_color = [0] * n
        sigs = []
        for v in range(n):
            nbr_colors = tuple(sorted(color[u] for u in adj[v]))
            sigs.append((color[v], nbr_colors))
        # Map signatures to new color integers
        sig_to_color = {}
        for v in range(n):
            if sigs[v] not in sig_to_color:
                sig_to_color[sigs[v]] = len(sig_to_color)
            new_color[v] = sig_to_color[sigs[v]]
        if new_color == color:
            break
        color = new_color
    return tuple(sorted(color))

def canonical_form(adj):
    """A simple canonical form based on WL colors + degrees."""
    return wl_refinement(adj)

def isomorphic_by_wl(g1, g2):
    """Necessary condition: same canonical form. NOT sufficient."""
    return canonical_form(g1) == canonical_form(g2)

def isomorphic_brute(g1, g2):
    """Definitive but O(n! n^2)."""
    from itertools import permutations
    n = len(g1)
    if len(g2) != n: return False
    adj1 = {(i, j) for i in range(n) for j in g1[i]}
    adj2 = {(i, j) for i in range(n) for j in g2[i]}
    for perm in permutations(range(n)):
        renamed = {(perm[i], perm[j]) for (i, j) in adj1}
        if renamed == adj2:
            return True
    return False

# Test on two C4 vs C3+pendant (non-isomorphic, both 4 vertices)
c4 = [[1,3],[0,2],[1,3],[0,2]]            # 4-cycle
c3p = [[1,2,3],[0,2],[0,1],[0]]            # triangle + pendant
print("C4 vs C3+pendant (WL):", isomorphic_by_wl(c4, c3p))  # False
print("C4 vs C3+pendant (brute):", isomorphic_brute(c4, c3p))  # False

p4a = [[1],[0,2],[1,3],[2]]                # path
p4b = [[1],[0,2],[1,3],[2]]                # same path
print("P4 vs P4 (WL):", isomorphic_by_wl(p4a, p4b))  # True
print("P4 vs P4 (brute):", isomorphic_brute(p4a, p4b))  # True
```

---

## 5. Asymptotic Time & Space Complexity

| Algorithm | Class | Time | Notes |
|-----------|-------|------|-------|
| Brute force | exact | $\Theta(n! \cdot n^2)$ | only for tiny $n$ |
| 1-WL refinement | incomplete | $O((n+m) \log n)$ | fast, fails on some inputs |
| $k$-WL | incomplete | $n^{O(k)}$ | Cai-Fürer-Immerman graphs fool all $k$ |
| Luks (bounded degree $d$) | exact | $n^{O(d)}$ | group-theoretic |
| Babai (general) | exact | $n^{O((\log n)^c)}$, $c \le 4$ | quasipolynomial |
| Nauty / Traces (practical) | exact | typically fast; worst case $n!$ | industry standard |

### Special graph classes

- **Trees**: linear time (AHU algorithm).
- **Planar graphs**: linear time (Hopcroft-Wong 1974).
- **Bounded-genus graphs**: linear time.
- **Bounded-degree graphs**: polynomial (Luks).
- **Interval graphs, permutation graphs**: polynomial via specialized structures.

---

## 6. Systems Connections

### Where Graph Isomorphism matters in practice

- **Chemistry / drug discovery**: Determining whether two molecules (represented as graphs) are the same compound. The Chemical Abstracts Service registry uses graph canonicalization to assign unique identifiers.
- **Computer vision**: Matching 2D/3D shapes (modeled as graphs) for object recognition. Subgraph isomorphism is NP-hard; full isomorphism is in P (or close).
- **Social network de-anonymization**: Narayanan-Shmatikov (2008) de-anonymized Netflix prize datasets by matching graph structure.
- **Constraint satisfaction**: Many CSPs reduce to (colored) graph isomorphism. SAT solvers and CP solvers use isomorphism-aware techniques (symmetry breaking).
- **Database theory**: Subgraph queries on graph databases (Neo4j, RDF stores) use isomorphism algorithms for pattern matching.
- **Cryptographic protocols**: Some candidate post-quantum primitives (e.g., CSIDH, SIKE — broken in 2022) rely on hardness of isogeny problems related to isomorphism.

---

## 7. Practice Checklist

- [ ] **Implement** brute-force GI and verify on $n \le 8$ graphs.
- [ ] **Code** the 1-WL refinement algorithm and test it on C4 vs C3+pendant.
- [ ] **Find** a pair of non-isomorphic graphs that fool 1-WL (e.g., the two Cai-Fürer-Immerman graphs).
- [ ] **Prove** that if GI is NP-complete, then PH collapses to $\Sigma_2^P$.
- [ ] **Sketch** the Goldreich-Sipser interactive proof for GNI.
- [ ] **Read** Babai's 2015 paper (and Helfgott's 2017 simplification).
- [ ] **Try** Nauty or Traces on a moderately large graph dataset.
- [ ] **Explore** the connection between GI and group theory (Luks's algorithm uses permutation group algorithms).

---

## 8. Frequently Asked Questions

**Q1. Why is Graph Isomorphism so much harder to classify than other problems?**
Most NP-complete problems have clear combinatorial structure that allows reductions (3-SAT reduces to Independent Set, etc.). GI sits awkwardly: it's in NP, but if it were NP-complete, the polynomial hierarchy would collapse (Schöning's theorem) — a surprising consequence that theorists view as unlikely. So GI is "almost certainly not NP-complete" but "almost certainly not in P" either (no polynomial algorithm is known despite 50+ years of effort). Babai's quasipolynomial algorithm suggests it's *very close* to P.

**Q2. What did Babai's 2015 breakthrough actually achieve?**
Babai gave an algorithm running in time $2^{O((\log n)^c)}$ for some constant $c$ — this is "quasipolynomial," strictly better than any $n^k$ but not quite polynomial. The original paper had $c \le 7$; Helfgott (2017) brought it down to $c \le 4$ with explicit constants. The result implies GI is *not* NP-complete unless ETH fails — strengthening the case that GI is in its own complexity class.

**Q3. What's the deal with the Weisfeiler-Leman algorithm?**
1-WL is a remarkably fast heuristic: in $O(n^3)$ time, it refines vertex colors based on neighborhood structure. It distinguishes almost all pairs of non-isomorphic graphs in practice, but it provably fails on certain hard instances (Cai-Fürer-Immerman graphs). The $k$-WL generalization does $k$-tuples of vertices at a time; for each fixed $k$, there are still graphs that fool it. Whether some fixed $k$ suffices for all graphs is a major open question (related to the descriptive complexity of GI).

**Q4. Why is GI important for cryptography?**
Some proposed post-quantum cryptosystems rely on hardness of problems similar to GI — e.g., the Supersingular Isogeny Diffie-Hellman (SIDH) scheme. SIKE (the standardized version) was broken in 2022 by Castryck-Decru using algebraic structure. The lesson: problems related to isomorphism are subtle, and "looks hard" is not enough — you need a reduction to a well-studied problem.

**Q5. Is the practical Nauty algorithm polynomial?**
No. Nauty (McKay 1981, updated through 2010s) is the industry-standard tool and is extremely fast on typical graphs — often milliseconds for thousands of vertices. But its worst-case running time is still exponential (e.g., on certain strongly regular graphs). Nauty combines canonical labeling, search-tree pruning, and automorphism detection; it's the closest practical realization of "GI is almost in P." For real-world graphs, Nauty is essentially polynomial.
