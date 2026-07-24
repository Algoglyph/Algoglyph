# Approximation Algorithms — When Optimal Is Out of Reach

> If you can't find the best solution in polynomial time, how close can you get? Approximation algorithms give provable guarantees on solution quality for NP-hard optimization problems.

---

## 1. Historical Context

The field crystallized in the 1970s with the realization that **thousands of real-world optimization problems are NP-hard**. **David Johnson's** 1974 paper "Approximation algorithms for combinatorial problems" gave the first systematic approximations for problems like bin packing and vertex cover.

The watershed moment was the **PCP Theorem** (Arora, Lund, Motwani, Sudan, Szegedy 1992), which proved that **MAX-3SAT cannot be approximated beyond $\frac{7}{8} + \epsilon$** unless P = NP. This was the first in a flood of **inapproximability results**: Håstad's $\frac{7}{8} - \epsilon$ hardness (1997) for MAX-3SAT, Set Cover's $(1 - o(1)) \ln n$ hardness (Feige 1998), and many others.

**Unique Games Conjecture (UGC)**, posed by **Subhash Khot in 2002**, has become the dominant assumption for tight inapproximability results. Under UGC, Khot-Kindler-Mossel-O'Donnell (2007) proved that MAX-CUT cannot be beaten beyond the **0.878 ratio** achieved by Goemans-Williamson — a remarkable tight result.

**Approximation schemes** (PTAS, FPTAS) are subclasses for problems like Knapsack where arbitrarily close approximation is achievable in polynomial time.

---

## 2. Core Mathematical Invariants

### Approximation Ratio

For a minimization problem with optimal value $\text{OPT}$:

$$\text{Approximation ratio } \alpha = \frac{\text{ALG}(I)}{\text{OPT}(I)}$$

(For maximization, $\alpha = \text{OPT}/\text{ALG} \ge 1$.)

### Approximation Classes

| Class | Definition | Example |
|-------|-----------|---------|
| **FPTAS** | $(1+\epsilon)$-approx in time $\text{poly}(n, 1/\epsilon)$ | Knapsack |
| **PTAS** | $(1+\epsilon)$-approx in time $\text{poly}(n)$ for fixed $\epsilon$ | Euclidean TSP |
| **APX** | Constant-factor approximation | Vertex Cover (factor 2) |
| **log-APX** | $O(\log n)$ factor | Set Cover |
| **poly-APX** | $n^\epsilon$ factor | Maximum Clique |
| **No approximation** | $\Omega(n^{1-\epsilon})$ hardness | General TSP |

### LP Relaxation and Rounding

Many approximations follow the recipe:
1. Write the problem as an **Integer Linear Program (ILP)**.
2. **Relax** to a Linear Program (LP) — solvable in polynomial time.
3. **Round** the fractional LP solution to an integer one, losing a bounded factor.

```svg
<svg viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="400" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">Approximation Hierarchy by Difficulty</text>

  <!-- FPTAS -->
  <rect x="30" y="60" width="620" height="50" fill="none" stroke="#3fb950" stroke-width="2"/>
  <text x="50" y="82" font-family="monospace" font-size="13" fill="#3fb950">FPTAS — (1+ε) factor, time poly(n, 1/ε)</text>
  <text x="50" y="100" font-family="monospace" font-size="11" fill="#8b949e">Knapsack, Subset Sum, #Knapsack counting</text>

  <!-- PTAS -->
  <rect x="30" y="120" width="620" height="50" fill="none" stroke="#58a6ff" stroke-width="2"/>
  <text x="50" y="142" font-family="monospace" font-size="13" fill="#58a6ff">PTAS — (1+ε) factor, time poly(n) for fixed ε</text>
  <text x="50" y="160" font-family="monospace" font-size="11" fill="#8b949e">Euclidean TSP, Planar Graph problems, Max Cut on dense graphs</text>

  <!-- APX -->
  <rect x="30" y="180" width="620" height="50" fill="none" stroke="#f0883e" stroke-width="2"/>
  <text x="50" y="202" font-family="monospace" font-size="13" fill="#f0883e">APX — constant factor (best possible under PCP)</text>
  <text x="50" y="220" font-family="monospace" font-size="11" fill="#8b949e">Vertex Cover (2), MAX-SAT (2), MAX-CUT (0.878 GW)</text>

  <!-- log-APX -->
  <rect x="30" y="240" width="620" height="50" fill="none" stroke="#d2a8ff" stroke-width="2"/>
  <text x="50" y="262" font-family="monospace" font-size="13" fill="#d2a8ff">log-APX — O(log n) factor (tight for Set Cover)</text>
  <text x="50" y="280" font-family="monospace" font-size="11" fill="#8b949e">Set Cover (ln n), Minimum Dominating Set</text>

  <!-- poly-APX / no approx -->
  <rect x="30" y="300" width="620" height="60" fill="none" stroke="#f85149" stroke-width="2"/>
  <text x="50" y="322" font-family="monospace" font-size="13" fill="#f85149">No PTAS — n^ε hardness</text>
  <text x="50" y="340" font-family="monospace" font-size="11" fill="#8b949e">Maximum Clique, Chromatic Number, General Metric TSP</text>

  <text x="340" y="385" text-anchor="middle" font-family="monospace" font-size="11" fill="#8b949e">Each tier corresponds to a proven inapproximability threshold (PCP theorem + reductions).</text>
</svg>
```

### Primal-Dual Schema

A powerful technique: maintain a pair of primal (integer) and dual (LP) solutions, increasing them in lockstep. By **LP weak duality**, the dual cost lower-bounds the optimum; the ratio between primal and dual gives the approximation factor.

---

## 3. Step-by-Step Execution Trace

### 2-Approximation for Vertex Cover via LP Rounding

**Problem**: Find minimum $S \subseteq V$ such that every edge has at least one endpoint in $S$.

**LP relaxation**:
$$\min \sum_v x_v \quad \text{s.t. } x_u + x_v \ge 1 \text{ for every edge } (u,v), \quad x_v \in [0, 1]$$

**Example**: Path $P_4$ with edges $(1,2), (2,3), (3,4)$.

| Step | Action | Result |
|------|--------|--------|
| 1 | Solve LP | $x_1 = 0.5, x_2 = 0.5, x_3 = 0.5, x_4 = 0.5$, LP optimum = 2 |
| 2 | Round: $x_v \ge 0.5 \Rightarrow$ include in cover | Include $\{1, 2, 3, 4\}$, all four |
| 3 | Verify every edge is covered | $(1,2), (2,3), (3,4)$ all hit |
| 4 | Resulting cover | $\{1, 2, 3, 4\}$ — cost 4 |
| 5 | Compare to OPT | OPT = 2 ($\{2, 3\}$ covers all edges); ratio 2 |

**Why is this a 2-approximation?** Each edge $(u, v)$ has $x_u + x_v \ge 1$, so at least one of them is $\ge 0.5$, hence included. The integer cover's cost $\le 2 \sum x_v = 2 \cdot \text{LP}$, and $\text{LP} \le \text{OPT}$, so ALG $\le 2 \cdot \text{OPT}$.

### Goemans-Williamson MAX-CUT (0.878-approx)

For a graph with edge weights, the SDP relaxation places each vertex $v$ as a unit vector $\vec{v}_v \in \mathbb{R}^n$ and maximizes $\sum_{(u,v)} \frac{1 - \vec{v}_u \cdot \vec{v}_v}{2}$.

Rounding: pick a random hyperplane through the origin; cut by which side each vertex falls on. The probability edge $(u, v)$ is cut is $\frac{\arccos(\vec{v}_u \cdot \vec{v}_v)}{\pi}$, which is $\ge 0.878 \cdot \frac{1 - \vec{v}_u \cdot \vec{v}_v}{2}$.

```svg
<svg viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg">
  <rect width="680" height="360" fill="#0d1117"/>
  <text x="340" y="28" text-anchor="middle" font-family="monospace" font-size="15" fill="#58a6ff" font-weight="bold">MAX-CUT via SDP + Hyperplane Rounding (Goemans-Williamson 1995)</text>

  <!-- SDP solution -->
  <text x="40" y="80" font-family="monospace" font-size="13" fill="#d2a8ff">1. Solve SDP: place each vertex as unit vector v_i in R^n.</text>
  <text x="40" y="100" font-family="monospace" font-size="11" fill="#8b949e">   max Σ (1 - v_u · v_v) / 2 over edges (u,v).</text>

  <!-- Vectors -->
  <circle cx="200" cy="170" r="50" fill="none" stroke="#30363d" stroke-dasharray="3 3"/>
  <text x="200" y="160" text-anchor="middle" font-family="monospace" font-size="10" fill="#8b949e">unit sphere</text>
  <line x1="200" y1="170" x2="240" y2="135" stroke="#58a6ff" stroke-width="2.5" marker-end="url(#aarr)"/>
  <text x="248" y="130" font-family="monospace" font-size="11" fill="#58a6ff">v_u</text>
  <line x1="200" y1="170" x2="165" y2="210" stroke="#3fb950" stroke-width="2.5" marker-end="url(#aarr)"/>
  <text x="140" y="225" font-family="monospace" font-size="11" fill="#3fb950">v_v</text>
  <line x1="200" y1="170" x2="200" y2="240" stroke="#f0883e" stroke-width="2.5" marker-end="url(#aarr)"/>
  <text x="210" y="245" font-family="monospace" font-size="11" fill="#f0883e">v_w</text>

  <!-- Hyperplane -->
  <text x="350" y="80" font-family="monospace" font-size="13" fill="#d2a8ff">2. Pick random hyperplane r.</text>
  <line x1="490" y1="120" x2="610" y2="200" stroke="#f85149" stroke-width="2.5" stroke-dasharray="5 3"/>
  <text x="600" y="195" font-family="monospace" font-size="11" fill="#f85149">r</text>
  <circle cx="510" cy="160" r="6" fill="#58a6ff"/>
  <circle cx="580" cy="180" r="6" fill="#3fb950"/>
  <text x="500" y="145" font-family="monospace" font-size="10" fill="#8b949e">side A</text>
  <text x="585" y="200" font-family="monospace" font-size="10" fill="#8b949e">side B</text>

  <text x="40" y="280" font-family="monospace" font-size="13" fill="#3fb950">3. Cut: vertices on different sides = cut edges.</text>
  <text x="40" y="305" font-family="monospace" font-size="13" fill="#f0883e">4. Expected cut ≥ 0.878 · SDP ≥ 0.878 · OPT.</text>
  <text x="40" y="335" font-family="monospace" font-size="11" fill="#8b949e">Under UGC: cannot be improved beyond 0.878.</text>
</svg>
```

---

## 4. Production-Ready Implementations

### C++: 2-Approximation for Vertex Cover

```cpp
#include <bits/stdc++.h>
using namespace std;

// 2-approximation for Vertex Cover via maximal matching.
// Theorem: any maximal matching M gives a vertex cover of size 2|M|,
// and OPT >= |M|. Hence ratio 2.

vector<int> vertex_cover_matching(int n, vector<pair<int,int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto [u, v] : edges) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    vector<bool> covered(n, false);
    vector<int> cover;
    for (auto [u, v] : edges) {
        if (!covered[u] && !covered[v]) {
            cover.push_back(u);
            cover.push_back(v);
            covered[u] = covered[v] = true;
        }
    }
    return cover;
}

// LP-based 2-approximation (uses interior-point LP solver externally).
// Here we sketch the rounding step given a fractional solution.
vector<int> vertex_cover_lp_round(int n, vector<pair<int,int>>& edges,
                                   vector<double>& x_frac) {
    vector<int> cover;
    for (int v = 0; v < n; v++) {
        if (x_frac[v] >= 0.5) cover.push_back(v);
    }
    return cover;
}

int main() {
    int n = 4;
    vector<pair<int,int>> edges = {{0,1}, {1,2}, {2,3}};
    auto cover = vertex_cover_matching(n, edges);
    cout << "Vertex cover (matching heuristic): ";
    for (int v : cover) cout << v << " ";
    cout << "\nSize: " << cover.size() << "\n";
    // OPT = 2 ({1,2}); we return 4 — ratio 2.
}
```

### Python: Greedy Set Cover (ln n approximation)

```python
"""
Greedy Set Cover: H_n-approximation (H_n is the n-th harmonic number,
H_n ≈ ln n + 0.577).
"""
import math

def greedy_set_cover(universe, subsets):
    """
    universe: list of elements to cover
    subsets: list of sets
    Returns: list of indices of chosen subsets, approximate min cover.
    """
    uncovered = set(universe)
    chosen = []
    available = list(enumerate(subsets))
    while uncovered:
        # Pick the subset covering the most uncovered elements per cost.
        best_idx, best_subset, best_gain = -1, set(), 0
        for idx, s in available:
            if idx in chosen: continue
            gain = len(s & uncovered)
            if gain > best_gain:
                best_gain, best_idx, best_subset = gain, idx, s
        if best_gain == 0:
            raise ValueError("Set cover infeasible")
        chosen.append(best_idx)
        uncovered -= best_subset
    return chosen

def approximation_ratio(n):
    """Harmonic number H_n — the greedy bound."""
    return sum(1.0 / k for k in range(1, n + 1))

# Example
universe = list(range(10))
subsets = [
    {0, 1, 2, 3}, {3, 4, 5}, {5, 6, 7}, {7, 8, 9},
    {0, 4, 8}, {2, 6, 9}, {1, 5, 7}, {3, 6, 9}
]
chosen = greedy_set_cover(universe, subsets)
print(f"Greedy cover uses {len(chosen)} sets: {chosen}")
print(f"Theoretical ratio: H_{len(universe)} ≈ {approximation_ratio(len(universe)):.3f}")
```

---

## 5. Asymptotic Time & Space Complexity

| Algorithm | Problem | Approximation | Time | Tight? |
|-----------|---------|---------------|------|--------|
| Greedy matching | Vertex Cover | 2 | $O(|E|)$ | No (UGC: $\approx 2$) |
| LP rounding | Vertex Cover | 2 | poly (LP) | No |
| Goemans-Williamson | MAX-CUT | 0.878 | SDP, $O(n^{3.5})$ | Yes (UGC) |
| Greedy | Set Cover | $H_n \approx \ln n$ | $O(nm)$ | Yes (Feige 1998) |
| MST doubling | Metric TSP | 2 | $O(n^2)$ | No (1.5 known: Christofides) |
| Christofides | Metric TSP | 1.5 | $O(n^3)$ | Open (Karlin-Klein-Oveis Gharan 2020: 1.5 - 10^-36) |
| FPTAS (DP) | Knapsack | $1+\epsilon$ | $O(n^2/\epsilon)$ | Yes |
| Arora PTAS | Euclidean TSP | $1+\epsilon$ | $n^{O(1/\epsilon)}$ | Yes |

---

## 6. Systems Connections

### Where approximation algorithms ship in production

- **Vehicle routing & logistics**: UPS ORION, Amazon delivery routing use Christofides-like TSP heuristics. Saving 1% on route length translates to billions of dollars.
- **Network design**: Telecommunications network topologies, data center topologies (Clos networks) use approximation algorithms for facility location and Steiner tree.
- **Scheduling**: Operating system schedulers, cloud job scheduling (Google Borg), and VLSI design tools use LP relaxations of NP-hard scheduling problems.
- **Machine learning**: $k$-means clustering (Lloyd's algorithm has no approximation guarantee; $k$-means++ gives $O(\log k)$ ratio). Sparse approximation uses LASSO as a convex relaxation.
- **Combinatorial auctions**: Spectrum auctions, ad allocations in Google Ads use approximation algorithms because exact ILP is too slow at scale.
- **Recommendation systems**: Maximum coverage problems (which $k$ items to show) are approximated by greedy algorithms with provable guarantees.

---

## 7. Practice Checklist

- [ ] **Prove** the 2-approximation guarantee for Vertex Cover via maximal matching.
- [ ] **Implement** greedy Set Cover and verify the $H_n$ ratio experimentally.
- [ ] **Derive** the Christofides 1.5-approximation for metric TSP (MST + matching).
- [ ] **Sketch** the Goemans-Williamson SDP rounding analysis.
- [ ] **Prove** Knapsack has an FPTAS via the DP + scaling trick.
- [ ] **Explain** why Set Cover cannot be approximated better than $(1-o(1)) \ln n$ (Feige's reduction from PCP).
- [ ] **State** the PCP theorem and how it implies MAX-3SAT hardness.
- [ ] **Read** Vazirani's *Approximation Algorithms*; Williamson-Shmoys *The Design of Approximation Algorithms*.

---

## 8. Frequently Asked Questions

**Q1. Why can't every NP-hard problem be approximated to within a constant?**
The PCP theorem shows that some NP-hard problems (like MAX-CLIQUE) cannot be approximated within $n^{1-\epsilon}$ for any $\epsilon > 0$ unless P = NP. The intuition: even *verifying* a near-optimal solution is hard, because the gap between YES and NO instances is amplified by the PCP construction.

**Q2. What makes the Goemans-Williamson MAX-CUT algorithm so special?**
It was the first algorithm to use **semidefinite programming (SDP)** for approximation, opening up a whole new toolkit. It achieves 0.878, and the UGC-based hardness result of Khot et al. shows this is optimal. This kind of "matching algorithm + hardness" is rare and beautiful.

**Q3. What's the difference between PTAS and FPTAS?**
A PTAS (Polynomial-Time Approximation Scheme) runs in time polynomial in $n$ for each fixed $\epsilon$, but may be exponential in $1/\epsilon$ — e.g., $n^{O(1/\epsilon)}$. An FPTAS (Fully PTAS) is polynomial in *both* $n$ and $1/\epsilon$. Knapsack has an FPTAS; Bin Packing has only an asymptotic PTAS (and no FPTAS unless P = NP).

**Q4. Is the Christofides algorithm optimal for metric TSP?**
No one knows. Christofides (1976) gives 1.5. For 44 years, no improvement was known. In 2020, Karlin-Klein-Oveis Gharan broke the barrier with an infinitesimal improvement ($1.5 - 10^{-36}$). Closing the gap to the known lower bound of $\frac{4}{3}$ (conjectured tight) is a major open problem.

**Q5. How does the Unique Games Conjecture change approximation theory?**
Before UGC (2002), most hardness results used PCP and gave "there is no PTAS" type bounds. UGC enables *tight* inapproximability — for many problems (MAX-CUT, Vertex Cover, Multiway Cut), UGC implies the best-known approximation ratio is optimal. If UGC is true (most theorists lean yes), approximation theory for APX problems is essentially complete.
