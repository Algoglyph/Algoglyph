import json
import re

blogs = {}

def add_blog(slug, title, tagline, category, read_time, prerequisites, related, practice_probs, markdown):
    headers = [line for line in markdown.splitlines() if line.startswith('#') and not line.startswith('# =') and not line.startswith('# -')]
    header_counts = {}
    for h in headers:
        header_counts[h] = header_counts.get(h, 0) + 1
        if header_counts[h] > 1:
            raise ValueError(f"DUPLICATE HEADER IN '{slug}': {h}")
            
    length = len(markdown)
    assert length >= 10100, f"Blog '{slug}' is too short ({length} chars). Needs >= 10,100 chars."
    print(f"Verified '{slug}': {length:,} chars. H1: {repr(markdown[:60])}")
    
    blogs[slug] = {
        "slug": slug,
        "title": title,
        "tagline": tagline,
        "category": category,
        "readTime": read_time,
        "lastUpdated": "July 2026",
        "prerequisites": prereqs,
        "related": related,
        "practiceProblems": practice_probs,
        "markdown": markdown
    }

# ----------------------------------------------------------------------
# 21. dijkstra
# ----------------------------------------------------------------------
md_21 = r"""# Dijkstra's Shortest Path Algorithm: Mathematical Proofs, Heap Structures & Network Protocols

Shortest path computation over weighted graphs forms the foundational substrate for modern digital networks, spatial navigation engines (GPS, Google Maps, Apple Maps), packet routing protocols (OSPF, IS-IS), and game AI pathfinding.

Given a directed or undirected graph $G = (V, E)$ with non-negative edge weight function $w: E \to \mathbb{R}_{\ge 0}$ and a designated source vertex $s \in V$, **Dijkstra's Algorithm** computes the shortest path distance $\delta(s, v)$ from $s$ to every vertex $v \in V$.

---

## 1. Mathematical Formalism & Invariants

### 1.1 Optimal Substructure & Triangle Inequality
For any shortest path $P = \langle v_0, v_1, \dots, v_k \rangle$ from $v_0$ to $v_k$, any subpath $P_{ij} = \langle v_i, \dots, v_j \rangle$ ($0 \le i \le j \le k$) is also a shortest path between $v_i$ and $v_j$.

Furthermore, edge weights satisfy the **Triangle Inequality**:

$$\forall u, v, w \in V: \quad \delta(u, w) \le \delta(u, v) + w(v, w)$$

### 1.2 Edge Relaxation
Dijkstra's algorithm maintains a distance estimate array $d[u]$ representing the current upper bound on $\delta(s, u)$. Initially:

$$d[s] = 0, \quad \forall u \in V \setminus \{s\}: \, d[u] = \infty$$

The core primitive operation is **Edge Relaxation** $\text{Relax}(u, v, w)$:

$$\text{Relax}(u, v, w): \quad \text{if } d[u] + w(u, v) < d[v] \implies d[v] = d[u] + w(u, v), \; \pi[v] = u$$

where $\pi[v]$ tracks the predecessor pointer of vertex $v$ for path reconstruction.

---

## 2. Theoretical Mechanics & Correctness Proof

### 2.1 Greedy Property & Monotonicity Invariant
Let $S \subseteq V$ denote the set of settled vertices whose final shortest path distances have been permanently established. At each iteration, the algorithm selects an unsettled vertex $u \in V \setminus S$ minimizing $d[u]$:

$$u = \arg\min_{v \in V \setminus S} d[v]$$

### 2.2 Proof of Correctness (Induction on Set $S$)
**Theorem**: Upon adding vertex $u$ to set $S$, $d[u] = \delta(s, u)$.

**Proof**:
Assume for contradiction that $u$ is the first vertex added to $S$ for which $d[u] > \delta(s, u)$. 
Because $s \in S$ initially with $d[s] = 0 = \delta(s, s)$, $u \ne s$, so $S \ne \emptyset$.

Let $P$ be a true shortest path from $s$ to $u$. Path $P$ starts in $S$ and ends in $V \setminus S$. Let $(y, x)$ be the first edge on $P$ such that $y \in S$ and $x \in V \setminus S$.

Since $y \in S$ was added before $u$, by inductive hypothesis $d[y] = \delta(s, y)$. When $y$ was added to $S$, edge $(y, x)$ was relaxed, yielding:

$$d[x] \le d[y] + w(y, x) = \delta(s, y) + w(y, x) = \delta(s, x)$$

Because subpaths of shortest paths are shortest paths and edge weights are non-negative ($w \ge 0$), $\delta(s, x) \le \delta(s, u)$. Therefore:

$$d[x] \le \delta(s, x) \le \delta(s, u) \le d[u]$$

However, since Dijkstra selected $u$ over $x$ from $V \setminus S$, $d[u] \le d[x]$. Combining inequalities yields:

$$d[x] = \delta(s, x) = \delta(s, u) = d[u]$$

This contradicts $d[u] > \delta(s, u)$, proving that $d[u] = \delta(s, u)$ holds for all $u \in S$. $\blacksquare$

---

## 3. Failure Mode: Negative Edge Weights

Dijkstra's greedy choice assumes that extracting the minimum $d[u]$ from $V \setminus S$ guarantees no subsequent path can reach $u$ with a smaller cost. 

When negative edge weights exist ($w(a, b) < 0$), traversing an additional edge can strictly decrease total path cost. 

```
   (S) ---- 5 ----> (A)
    |                |
    2               -10
    v                v
   (B) ------------> (C)
```

In the graph above:
1. $d[S] = 0, d[B] = 2, d[A] = 5$.
2. Dijkstra extracts $B$ ($d[B] = 2$) into $S$.
3. Dijkstra extracts $A$ ($d[A] = 5$) into $S$ and relaxes edge $(A, C)$, setting $d[C] = 5 - 10 = -5$.
4. However, if an edge $(B, A)$ with weight $-4$ existed, $d[A]$ should have been $2 - 4 = -2$. Because $B$ was already finalized, Dijkstra fails to re-evaluate $B$'s outbound edges.

For graphs with negative edge weights, the **Bellman-Ford Algorithm** ($O(V \cdot E)$) or **SPFA (Shortest Path Faster Algorithm)** must be used instead.

---

## 4. Priority Queue Data Structure Implementations & Time Complexity

The overall time complexity of Dijkstra's algorithm depends directly on the underlying Priority Queue data structure:

$$T = O(V \cdot T_{\text{ExtractMin}} + E \cdot T_{\text{DecreaseKey}})$$

| Priority Queue Structure | $T_{\text{ExtractMin}}$ | $T_{\text{DecreaseKey}}$ | Total Time Complexity | Best Suited Graph Topology |
|---|---|---|---|---|
| **Flat Array / Matrix** | $O(V)$ | $O(1)$ | $O(V^2 + E) = O(V^2)$ | Dense Graphs ($E \approx V^2$) |
| **Binary Min-Heap** | $O(\log V)$ | $O(\log V)$ | $O((V + E) \log V)$ | Sparse Graphs ($E \ll V^2$) |
| **$d$-ary Heap ($d = E/V$)** | $O(d \log_d V)$ | $O(\log_d V)$ | $O(E \log_{E/V} V)$ | Moderately Dense Graphs |
| **Fibonacci Heap** | $O(\log V)$ | $O(1)$ (amortized) | $O(E + V \log V)$ | Theoretical Benchmark |

---

## 5. Production C++ & Python Implementations

### 5.1 C++ High-Performance Binary Min-Heap Implementation

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <limits>

constexpr long long INF = std::numeric_limits<long long>::max();

struct Edge {
    int to;
    long long weight;
};

using Graph = std::vector<std::vector<Edge>>;

std::pair<std::vector<long long>, std::vector<int>> dijkstra(int source, int n, const Graph& adj) {
    std::vector<long long> dist(n + 1, INF);
    std::vector<int> parent(n + 1, -1);
    
    // Min-heap storing pair<distance, vertex>
    using PII = std::pair<long long, int>;
    std::priority_queue<PII, std::vector<PII>, std::greater<PII>> pq;

    dist[source] = 0;
    pq.push({0, source});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        // Stale entry check (handles lack of decrease-key in std::priority_queue)
        if (d > dist[u]) continue;

        for (const auto& edge : adj[u]) {
            int v = edge.to;
            long long w = edge.weight;

            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    return {dist, parent};
}
```

### 5.2 Python Production Implementation (`heapq`)

```python
import heapq
from typing import List, Tuple, Dict

def dijkstra_python(source: int, n: int, adj: Dict[int, List[Tuple[int, int]]]) -> Tuple[List[float], List[int]]:
    dist = [float('inf')] * (n + 1)
    parent = [-1] * (n + 1)
    
    dist[source] = 0.0
    pq: List[Tuple[float, int]] = [(0.0, source)]
    
    while pq:
        d, u = heapq.heappop(pq)
        
        if d > dist[u]:
            continue
            
        for v, w in adj.get(u, []):
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent[v] = u
                heapq.heappush(pq, (dist[v], v))
                
    return dist, parent
```

---

## 6. Industrial Applications & System Architecture

### 6.1 Network Routing Protocols (OSPF & IS-IS)
In IP telecommunications, **Open Shortest Path First (OSPF)** uses Dijkstra's algorithm to compute shortest paths across autonomous system routers:
- Each router broadcasts Link-State Advertisements (LSAs) detailing connected links and link costs (bandwidth metrics).
- Every router constructs an identical Link-State Database (LSDB) representing topology graph $G$.
- Every router runs Dijkstra locally with itself as source $s$, building the IP routing table forwarding matrix.

### 6.2 Spatial Navigation & A* Search Extension
In GPS routing, standard Dijkstra explores nodes isotropically in all directions. **A* Search** accelerates Dijkstra by incorporating a admissible heuristic $h(u)$ estimating distance from node $u$ to target $t$:

$$f(u) = g(u) + h(u)$$

where $g(u) = d[u]$ and $h(u)$ is the Euclidean or Manhattan distance. When $h(u) \le \delta(u, t)$, A* maintains exact shortest path guarantees while expanding up to $90\%$ fewer map nodes.

---

## Frequently Asked Questions (FAQs)

### Q1: Why does Dijkstra's algorithm require non-negative edge weights?
Dijkstra relies on the greedy invariant that once a node $u$ is extracted from the priority queue, its current distance estimate $d[u]$ is finalized. Negative edge weights violate this assumption because a longer path in node count could yield a smaller total sum if a negative edge is encountered later.

### Q2: How does `std::priority_queue` in C++ handle `decrease-key` without explicit support?
Instead of modifying existing keys in $O(\log N)$ time, C++ implementations push a new `(new_dist, v)` pair into the min-heap. When popping, if `d > dist[u]`, the entry is discarded as stale. This increases heap size to $O(E)$, but retains $O(E \log V)$ time complexity.

### Q3: What is the spatial complexity of Dijkstra's algorithm?
The spatial complexity is $O(V + E)$ to store the adjacency list representation of graph $G$, plus $O(V)$ for the distance array `dist`, predecessor array `parent`, and min-heap.

### Q4: When should I use Dijkstra over Breadth-First Search (BFS)?
Use BFS when all edge weights are unweighted or uniform ($w(e) = 1$), running in optimal $O(V + E)$ time. Use Dijkstra when edges have varying non-negative weights ($w(e) \ge 0$).

### Q5: How can shortest paths be reconstructed after running Dijkstra?
By following the predecessor array `parent` backward from target node $t$ to source node $s$ ($\pi[t], \pi[\pi[t]], \dots, s$) and reversing the resulting list.
"""

# ----------------------------------------------------------------------
# 22. dynamic-programming
# ----------------------------------------------------------------------
md_22 = r"""# Dynamic Programming (DP): Overlapping Subproblems, State Transitions & Space Optimization

**Dynamic Programming (DP)** is a powerful algorithmic paradigm designed to solve complex optimization and counting problems by breaking them down into simpler, overlapping subproblems. 

Coined by Richard Bellman in 1957, Dynamic Programming transforms exponential-time recursive search algorithms ($O(2^N)$ or $O(N!)$) into polynomial-time operations ($O(N^2)$, $O(N^3)$, or $O(N \cdot K)$) by storing intermediate subproblem solutions.

---

## 1. Core Principles: Necessary & Sufficient Conditions

A problem is solvable via Dynamic Programming if and only if it exhibits two fundamental properties:

### 1.1 Optimal Substructure
An optimal solution to the problem of size $N$ contains within it optimal solutions to subproblems of smaller sizes.

Mathematically, if $S^*$ is an optimal solution for state $x$, then for any sub-state $y$ contained within $x$, the restricted solution $S^*|_y$ must be an optimal solution for sub-state $y$.

### 1.2 Overlapping Subproblems
The recursive space of the problem evaluates the exact same smaller subproblems repeatedly.

Unlike **Divide-and-Conquer** (e.g., MergeSort) where subproblems are completely independent and disjoint, DP reuses computed subproblem states from a lookup table (Memoization / Tabulation).

```
          Fib(5)
         /      \
     Fib(4)    Fib(3)  <-- Overlapping Subproblem
     /   \     /   \
  Fib(3) Fib(2) Fib(2) Fib(1)
```

---

## 2. Implementation Paradigms: Top-Down vs Bottom-Up

| Attribute | Top-Down (Memoization) | Bottom-Up (Tabulation) |
|---|---|---|
| **Execution Flow** | Recursive evaluation starting from target $N$ down to base cases. | Iterative loop evaluation starting from base cases up to $N$. |
| **State Space Evaluation** | Evaluates *only* the reachable states required for target answer. | Evaluates *all* states in the DP table grid sequentially. |
| **Overhead** | Call-stack recursion overhead; potential stack overflow for deep recursion. | Zero call-stack overhead; tight CPU loop execution and cache locality. |
| **Space Optimization** | Difficult to optimize memory space beyond full memoization table. | Easy to optimize memory (e.g., keeping only previous 1 or 2 rows). |

---

## 3. Canonical DP Problem Taxonomy

### 3.1 0/1 Knapsack Problem
Given $N$ items with weights $w_i$ and values $v_i$, maximize total value in a knapsack of capacity $W$:

$$\text{DP}[i][w] = \max\left( \text{DP}[i-1][w], \; \text{DP}[i-1][w - w_i] + v_i \right) \quad \text{if } w \ge w_i$$

**Time Complexity**: $O(N \cdot W)$  
**Space Complexity**: $O(W)$ using 1D backwards array traversal.

### 3.2 Longest Common Subsequence (LCS)
Find the length of the longest subsequence common to strings $S_1$ (length $M$) and $S_2$ (length $N$):

$$\text{DP}[i][j] = \begin{cases} \text{DP}[i-1][j-1] + 1 & \text{if } S_1[i] = S_2[j] \\ \max(\text{DP}[i-1][j], \; \text{DP}[i][j-1]) & \text{if } S_1[i] \ne S_2[j] \end{cases}$$

### 3.3 Edit Distance (Levenshtein Distance)
Compute minimum operations (insert, delete, replace) to transform $S_1$ into $S_2$:

$$\text{DP}[i][j] = \min \begin{cases} \text{DP}[i-1][j] + 1 & \text{Delete} \\ \text{DP}[i][j-1] + 1 & \text{Insert} \\ \text{DP}[i-1][j-1] + \mathbb{I}(S_1[i] \ne S_2[j]) & \text{Replace} \end{cases}$$

---

## 4. Advanced DP State Optimizations

### 4.1 Memory Compression (Rolling Arrays)
When state transitions for $\text{DP}[i][j]$ depend only on the immediate previous row $\text{DP}[i-1][*]$, memory space can be reduced from $O(N \cdot M)$ to $O(M)$ by keeping two rows (`dp_prev` and `dp_curr`) or using parity indexing `dp[i % 2][j]`.

### 4.2 Convex Hull Trick & Divide-and-Conquer Optimization
For recurrence relations of the form:

$$\text{DP}[i] = \min_{j < i} \left( \text{DP}[j] + b[j] \cdot a[i] \right)$$

where slopes $b[j]$ are monotonic, the **Convex Hull Trick** reduces transition time from $O(N)$ to $O(\log N)$ or $O(1)$ per state using a deque of upper/lower hull line segments, improving total runtime from $O(N^2)$ to $O(N \log N)$.

---

## 5. Production Implementations in C++ and Python

### 5.1 C++ 0/1 Knapsack with Space Optimization

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int knapsack01(int W, const std::vector<int>& weights, const std::vector<int>& values) {
    int n = weights.size();
    // 1D DP table initialized to 0
    std::vector<int> dp(W + 1, 0);

    for (int i = 0; i < n; ++i) {
        // Iterate backwards to enforce 0/1 selection (prevent item reuse)
        for (int w = W; w >= weights[i]; --w) {
            dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }

    return dp[W];
}
```

### 5.2 Python Edit Distance Implementation

```python
def min_edit_distance(s1: str, s2: str) -> int:
    m, n = len(s1), len(s2)
    # 2D DP matrix
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],    # Deletion
                    dp[i][j - 1],    # Insertion
                    dp[i - 1][j - 1]  # Replacement
                )

    return dp[m][n]
```

---

## Frequently Asked Questions (FAQs)

### Q1: How do I distinguish between Dynamic Programming and Greedy choice?
Dynamic Programming evaluates all candidate transitions at state $i$ and picks the optimal outcome after considering subproblem results. Greedy algorithms make an irreversible, locally optimal choice without evaluating future subproblem outcomes.

### Q2: What is Pseudo-Polynomial Time Complexity?
An algorithm runs in pseudo-polynomial time if its runtime is polynomial in the *numeric value* of the input (e.g., capacity $W$ in $O(N \cdot W)$ Knapsack), rather than polynomial in the length of the binary input representation ($\log W$).

### Q3: How do I identify the State Space for a new DP problem?
Identify the minimum set of variables required to uniquely specify the configuration of the system such that future decisions depend *only* on the current state, not on the sequence of past decisions (Markov Property).

### Q4: When should I iterate backwards in a 1D DP array?
Iterate backwards when solving 0/1 Knapsack variants where each item can be used at most once. Iterating forward would use updated values from the current item, turning the problem into Unbounded Knapsack.

### Q5: How can DP problems on trees be solved?
Tree DP uses Depth-First Search (DFS) post-order traversal, computing child subtree states before combining them into parent node states ($\text{DP}[\text{parent}]$).
"""

# ----------------------------------------------------------------------
# 23. greedy
# ----------------------------------------------------------------------
md_23 = r"""# Greedy Algorithms: Local Optimality, Exchange Arguments & Matroid Theory

A **Greedy Algorithm** builds a solution step-by-step by making the locally optimal choice at each stage, under the expectation that these local choices lead to a globally optimal solution.

Unlike Dynamic Programming, which systematically explores and memoizes subproblems, greedy algorithms commit irrevocably to choices without backtracking or re-evaluating alternative branches.

---

## 1. Core Mathematical Axioms

A problem can be solved optimally via a greedy strategy if and only if it satisfies two theoretical properties:

### 1.1 Greedy-Choice Property
A globally optimal solution can be arrived at by making locally optimal (greedy) choices.

Mathematically, there exists an optimal solution $S^*$ that contains the greedy choice $x_1 \in S^*$.

### 1.2 Optimal Substructure
After making the greedy choice, the remaining subproblem retains the exact same structure as the original problem.

---

## 2. Proof Techniques for Greedy Algorithms

Proving that a greedy choice guarantees global optimality is mandatory, as intuitive greedy heuristics frequently fail on subtle edge cases.

### 2.1 The Exchange Argument (Greedy Stays Ahead)
1. Let $G = \langle g_1, g_2, \dots, g_k \rangle$ be the greedy solution sequence.
2. Let $O = \langle o_1, o_2, \dots, o_m \rangle$ be an arbitrary optimal solution sequence.
3. Show by induction that $O$ can be transformed into $G$ through step-by-step item exchanges without reducing solution value or violating feasibility.
4. Conclude that $G$ is globally optimal.

---

## 3. Matroid Theory: Theoretical Foundation of Greedy Solvability

A **Matroid** is a finite combinatorial structure $\mathcal{M} = (E, \mathcal{I})$ consisting of a finite ground set $E$ and a family $\mathcal{I}$ of independent subsets of $E$ satisfying three axioms:

1. **Non-emptiness**: $\emptyset \in \mathcal{I}$.
2. **Hereditary Property**: If $B \in \mathcal{I}$ and $A \subseteq B$, then $A \in \mathcal{I}$.
3. **Exchange Property**: If $A, B \in \mathcal{I}$ and $|A| < |B|$, then $\exists x \in B \setminus A$ such that $A \cup \{x\} \in \mathcal{I}$.

### Rado-Edmonds Theorem
If $\mathcal{M} = (E, \mathcal{I})$ is a matroid and each element $e \in E$ has a non-negative weight $w(e) \ge 0$, then the Greedy Algorithm finds a maximum-weight independent set in $\mathcal{M}$.

---

## 4. Canonical Greedy Algorithms

### 4.1 Fractional Knapsack
Given items with weights $w_i$ and values $v_i$, items can be divided into arbitrary fractions.
- **Greedy Choice**: Sort items by value-to-weight ratio $v_i / w_i$ in descending order. Take maximum possible fraction of the highest ratio item.
- **Time Complexity**: $O(N \log N)$ sorting time.

### 4.2 Huffman Coding (Optimal Prefix Codes)
Given characters with frequency distribution $f(c)$, construct a binary prefix code minimizing total weighted string length:

$$L(T) = \sum_{c \in C} f(c) \cdot d_T(c)$$

- **Greedy Choice**: Iteratively merge the two lowest-frequency trees into a new parent tree with combined frequency $f(u) + f(v)$ using a min-heap.

---

## 5. Production Implementations in C++ and Python

### 5.1 C++ Huffman Coding Tree Generation

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <memory>

struct Node {
    char ch;
    int freq;
    std::shared_ptr<Node> left, right;

    Node(char c, int f) : ch(c), freq(f), left(nullptr), right(nullptr) {}
    Node(int f, std::shared_ptr<Node> l, std::shared_ptr<Node> r)
        : ch('\0'), freq(f), left(l), right(r) {}
};

struct Compare {
    bool operator()(const std::shared_ptr<Node>& a, const std::shared_ptr<Node>& b) {
        return a->freq > b->freq;
    }
};

std::shared_ptr<Node> buildHuffmanTree(const std::vector<std::pair<char, int>>& freqs) {
    std::priority_queue<std::shared_ptr<Node>, std::vector<std::shared_ptr<Node>>, Compare> pq;

    for (const auto& [ch, f] : freqs) {
        pq.push(std::make_shared<Node>(ch, f));
    }

    while (pq.size() > 1) {
        auto left = pq.top(); pq.pop();
        auto right = pq.top(); pq.pop();

        auto parent = std::make_shared<Node>(left->freq + right->freq, left, right);
        pq.push(parent);
    }

    return pq.top();
}
```

### 5.2 Python Fractional Knapsack Implementation

```python
from typing import List, Tuple

def fractional_knapsack(capacity: float, items: List[Tuple[float, float]]) -> float:
    # items: list of (weight, value)
    # Sort items by value-to-weight ratio in descending order
    sorted_items = sorted(items, key=lambda x: x[1] / x[0], reverse=True)
    
    total_value = 0.0
    current_capacity = capacity
    
    for weight, value in sorted_items:
        if current_capacity <= 0:
            break
            
        if weight <= current_capacity:
            total_value += value
            current_capacity -= weight
        else:
            fraction = current_capacity / weight
            total_value += value * fraction
            current_capacity = 0
            
    return total_value
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why does Greedy fail on the 0/1 Knapsack problem?
In 0/1 Knapsack, items cannot be split. Choosing an item with high value-per-pound might leave empty unfillable capacity in the knapsack, whereas taking two slightly lower-ratio items might fill capacity perfectly and achieve higher total value.

### Q2: What is the main difference between Greedy and Dynamic Programming?
Greedy algorithms make a single locally optimal choice at each step without looking back. Dynamic Programming evaluates multiple candidate subproblem choices and stores solutions to overlapping subproblems in a table.

### Q3: How do Exchange Arguments prove correctness?
By assuming an optimal solution exists, and showing that swapping its elements with the choices made by the greedy algorithm never decreases total quality, demonstrating that the greedy solution matches optimal quality.

### Q4: Are Minimum Spanning Tree algorithms (Kruskal and Prim) Greedy?
Yes. Both algorithms make locally optimal edge selections (selecting the smallest weight edge that does not form a cycle) and are mathematically proven optimal via Matroid theory.

### Q5: When should I suspect a problem is NOT solvable via Greedy?
If local decisions constrain future choices in non-uniform ways or if optimal subproblems conflict with initial local choices (such as finding shortest paths in graphs with negative edges).
"""

# ----------------------------------------------------------------------
# 24. backtracking
# ----------------------------------------------------------------------
md_24 = r"""# Constraint Backtracking: State-Space Search Trees, Pruning & CSP Solvers

**Backtracking** is a systematic algorithmic technique for solving Constraint Satisfaction Problems (CSP) by incrementally constructing candidate solutions and abandoning ("backtracking" from) partial solutions as soon as it determines they cannot lead to a valid final solution.

Unlike brute-force exhaustive search which evaluates $O(K^N)$ candidate configurations, backtracking prunes vast subtrees of the state-space tree early, reducing execution time by orders of magnitude.

---

## 1. State-Space Search Tree Mechanics

A state-space search tree represents all possible partial assignment sequences:
- **Root**: Empty solution assignment $\emptyset$.
- **Nodes at Depth $d$**: Partial assignment vector $\mathbf{X}_d = (x_1, x_2, \dots, x_d)$.
- **Leaves**: Complete assignment vectors $\mathbf{X}_N = (x_1, x_2, \dots, x_N)$.

```
                     Root ()
                  /     |     \
             x1=1     x1=2     x1=3
            /    \
        x2=1      x2=2 (Invalid -> Prune & Backtrack)
```

---

## 2. Pruning Strategies & Heuristics

### 2.1 Bounding Functions & Feasibility Checks
Before extending partial solution $\mathbf{X}_d$ to $\mathbf{X}_{d+1}$, a boolean feasibility predicate $P(\mathbf{X}_{d+1})$ evaluates constraint validity. If $P(\mathbf{X}_{d+1}) = \text{False}$, the entire subtree rooted at node $\mathbf{X}_{d+1}$ is pruned immediately.

### 2.2 Minimum Remaining Values (MRV) Heuristic
In Constraint Satisfaction Problems (Sudoku, Map Coloring), choose the unassigned variable with the **fewest legal values** remaining in its domain. This maximizes early pruning of invalid branches.

### 2.3 Symmetry Breaking
In problems with structural symmetries (such as N-Queens or Graph Isomorphism), enforcing order constraints (e.g. $x_1 < x_N$) eliminates redundant rotated or reflected search branches.

---

## 3. Canonical Backtracking Problems

### 3.1 The $N$-Queens Problem
Place $N$ chess queens on an $N \times N$ chessboard such that no two queens attack each other (no two queens share a row, column, or diagonal).

**Diagonal Constraints**:
- Main Diagonal index: $row - col = \text{const} \implies (row - col + N)$
- Anti Diagonal index: $row + col = \text{const}$

### 3.2 Sudoku Solver ($9 \times 9$ Grid)
Fill an incomplete grid with digits $1 \dots 9$ such that each row, column, and $3 \times 3$ subgrid contains unique numbers.

---

## 4. Production Implementations in C++ and Python

### 4.1 C++ $N$-Queens Optimized Solver (Bitmask Tracking)

```cpp
#include <iostream>
#include <vector>
#include <string>

class NQueensSolver {
private:
    int n;
    std::vector<std::vector<std::string>> solutions;
    std::vector<int> queens; // queens[row] = col

    void backtrack(int row, int cols, int diag1, int diag2) {
        if (row == n) {
            std::vector<std::string> board(n, std::string(n, '.'));
            for (int r = 0; r < n; ++r) {
                board[r][queens[r]] = 'Q';
            }
            solutions.push_back(board);
            return;
        }

        // Available bit positions in current row
        int availablePositions = ((1 << n) - 1) & ~(cols | diag1 | diag2);

        while (availablePositions > 0) {
            // Extract lowest set bit
            int bit = availablePositions & -availablePositions;
            availablePositions -= bit;

            int col = __builtin_ctz(bit);
            queens[row] = col;

            backtrack(row + 1, 
                      cols | bit, 
                      (diag1 | bit) << 1, 
                      (diag2 | bit) >> 1);
        }
    }

public:
    std::vector<std::vector<std::string>> solveNQueens(int boardSize) {
        n = boardSize;
        queens.resize(n);
        solutions.clear();
        backtrack(0, 0, 0, 0);
        return solutions;
    }
};
```

### 4.2 Python Sudoku Backtracking Solver

```python
from typing import List

class SudokuSolver:
    def solveSudoku(self, board: List[List[str]]) -> None:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]

        for r in range(9):
            for c in range(9):
                if board[r][c] != '.':
                    val = int(board[r][c])
                    rows[r].add(val)
                    cols[c].add(val)
                    boxes[(r // 3) * 3 + (c // 3)].add(val)

        def backtrack(r: int, c: int) -> bool:
            if r == 9:
                return True
            if c == 9:
                return backtrack(r + 1, 0)
            if board[r][c] != '.':
                return backtrack(r, c + 1)

            box_idx = (r // 3) * 3 + (c // 3)
            for val in range(1, 10):
                if val not in rows[r] and val not in cols[c] and val not in boxes[box_idx]:
                    board[r][c] = str(val)
                    rows[r].add(val)
                    cols[c].add(val)
                    boxes[box_idx].add(val)

                    if backtrack(r, c + 1):
                        return True

                    # Backtrack
                    board[r][c] = '.'
                    rows[r].remove(val)
                    cols[c].remove(val)
                    boxes[box_idx].remove(val)

            return False

        backtrack(0, 0)
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between Backtracking and Depth-First Search (DFS)?
DFS explores an explicit or implicit graph to arbitrary depth without constraint evaluations. Backtracking is a DFS variant applied to state-space trees where explicit constraint pruning functions abort invalid subtrees before expanding them.

### Q2: How does Bitmask tracking accelerate N-Queens?
Bitmasks represent column and diagonal constraints as integer bit vectors (`cols`, `diag1`, `diag2`). Bitwise operations (`AND`, `OR`, `SHIFT`) perform feasibility checks across all columns in constant $O(1)$ time.

### Q3: What is the worst-case time complexity of Backtracking algorithms?
Without effective pruning, backtracking degrades to brute-force exponential bounds such as $O(N!)$ for N-Queens or $O(9^{N^2})$ for Sudoku. With tight pruning, real-world execution takes milliseconds.

### Q4: What is the Difference Engine between Backtracking and Branch-and-Bound?
Backtracking uses DFS state-space search for decision/enumeration problems. Branch-and-Bound uses BFS/Best-First search combined with cost bounding functions for global optimization problems.

### Q5: How do I prevent Stack Overflow during deep backtracking recursion?
Increase thread stack size, convert recursion to an iterative loop using an explicit std::vector stack, or pass state arrays by reference/bitmasks.
"""

# ----------------------------------------------------------------------
# 25. searching
# ----------------------------------------------------------------------
md_25 = r"""# Searching Paradigms: Binary Search Invariants, Ternary Optimization & Predicate Search

Searching is the fundamental operation of retrieving target elements or optimal parameters from structured or continuous search spaces. 

While **Linear Search** runs in $O(N)$ time on unstructured data, **Binary Search** reduces search spaces exponentially to $O(\log N)$ by leveraging monotonicity invariants.

---

## 1. Binary Search Invariants & Boundary Mechanics

Binary Search maintains a search interval $[L, R]$ containing candidate solutions.

### 1.1 Discrete Loop Invariant
At every iteration:
- The target value $X$ is guaranteed to lie within $[L, R]$.
- $M = L + \lfloor (R - L) / 2 \rfloor$ prevents integer overflow compared to $(L + R) / 2$.

```
Interval:  [ L . . . . . M . . . . . R ]
Condition:   f(M) == True -> Shrink R = M
Condition:   f(M) == False -> Shrink L = M + 1
```

### 1.2 Lower Bound vs Upper Bound (`std::lower_bound`)
- `lower_bound`: Finds the first position $i$ where $A[i] \ge X$.
- `upper_bound`: Finds the first position $i$ where $A[i] > X$.

---

## 2. Binary Search on Answer Space (Monotonic Predicates)

Binary search is not restricted to pre-sorted arrays. It applies to any problem possessing a **Monotonic Decision Predicate** $P(x) \in \{0, 1\}$:

$$\forall x_1 < x_2: \quad P(x_1) \le P(x_2)$$

If $P(x)$ is monotonic, binary search finds the minimum value $x^*$ satisfying $P(x^*) = 1$ in $O(\log(\text{Range}) \cdot T_{\text{Check}})$.

---

## 3. Ternary Search for Unimodal Functions

When function $f(x)$ is **Unimodal** (strictly increasing to a unique local maximum, then strictly decreasing over $[L, R]$), Binary Search fails because derivatives change signs.

**Ternary Search** evaluates two midpoints $m_1$ and $m_2$:

$$m_1 = L + \frac{R - L}{3}, \quad m_2 = R - \frac{R - L}{3}$$

- If $f(m_1) < f(m_2)$, max lies in $[m_1, R] \implies L = m_1$.
- If $f(m_1) > f(m_2)$, max lies in $[L, m_2] \implies R = m_2$.

**Time Complexity**: $O(\log_{1.5} N)$.

---

## 4. Production Implementations in C++ and Python

### 4.1 C++ Robust Binary Search & Predicate Search

```cpp
#include <iostream>
#include <vector>
#include <numeric>

// Predicate: Is it possible to allocate books such that max pages <= maxPages?
bool isFeasible(const std::vector<int>& books, int k, long long maxPages) {
    int count = 1;
    long long currentPages = 0;

    for (int pages : books) {
        if (pages > maxPages) return false;
        if (currentPages + pages > maxPages) {
            count++;
            currentPages = pages;
        } else {
            currentPages += pages;
        }
    }
    return count <= k;
}

long long findPages(const std::vector<int>& books, int k) {
    long long low = *std::max_element(books.begin(), books.end());
    long long high = std::accumulate(books.begin(), books.end(), 0LL);
    long long ans = high;

    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (isFeasible(books, k, mid)) {
            ans = mid;
            high = mid - 1; // Try finding smaller max page limit
        } else {
            low = mid + 1;  // Increase page limit
        }
    }
    return ans;
}
```

### 4.2 Python Continuous Ternary Search

```python
from typing import Callable

def ternary_search_max(f: Callable[[float], float], left: float, right: float, eps: float = 1e-9) -> float:
    while right - left > eps:
        m1 = left + (right - left) / 3.0
        m2 = right - (right - left) / 3.0
        
        if f(m1) < f(m2):
            left = m1
        else:
            right = m2
            
    return (left + right) / 2.0
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why should I write `mid = low + (high - low) / 2` instead of `mid = (low + high) / 2`?
In 32-bit signed integer arithmetic, if `low + high` exceeds $2^{31} - 1$ ($2,147,483,647$), integer overflow occurs, resulting in negative midpoint values and segmentation faults.

### Q2: What is Exponential Search and when is it preferred over Binary Search?
Exponential Search finds range $[2^{k-1}, 2^k]$ containing target $X$ in $O(\log i)$ time, where $i$ is target index position. It excels when searching unbounded or infinite streams.

### Q3: How do I handle floating-point Binary Search termination?
Instead of `while (low <= high)`, run fixed iteration loops (e.g. `for (int i = 0; i < 100; ++i)`), guaranteeing precision to $2^{-100} \approx 10^{-30}$ without infinite loop risks.

### Q4: When does Binary Search fail on sorted arrays?
Binary Search fails when duplicate elements exist in rotated sorted arrays (e.g. `[1, 1, 1, 0, 1]`), degrading worst-case search time to linear $O(N)$.

### Q5: What is the optimal number of iterations for continuous Ternary Search?
Running 100 iterations reduces search interval size by $(2/3)^{100} \approx 2.4 \times 10^{-18}$, achieving maximum double-precision floating-point bounds.
"""

# ----------------------------------------------------------------------
# 26. sorting
# ----------------------------------------------------------------------
md_26 = r"""# Sorting Paradigms: Comparison Lower Bounds, QuickSort, MergeSort & Non-Comparison Sorts

Sorting re-orders elements of a sequence according to a total order relation $\le$. It serves as a foundational component for binary search, database index materialization, and computational geometry algorithms.

---

## 1. The Decision Tree Comparison Lower Bound

**Theorem**: Any comparison-based sorting algorithm requires $\Omega(N \log N)$ operations in the worst case.

**Proof**:
A comparison-based sorting algorithm on $N$ distinct elements can be modeled as a binary decision tree where each internal node represents a comparison $A[i] \le A[j]$ and each leaf represents one of $N!$ possible output permutations.

To distinguish among all $N!$ permutations, the decision tree must have at least $N!$ leaves. A binary tree of height $h$ has at most $2^h$ leaves:

$$2^h \ge N! \implies h \ge \log_2(N!)$$

Using **Stirling's Approximation** $\log_2(N!) = \sum_{k=1}^N \log_2 k \ge \int_1^N \log_2 x \, dx$:

$$h \ge N \log_2 N - N \log_2 e = \Omega(N \log N) \quad \blacksquare$$

---

## 2. Taxonomy of Comparison Sorting Algorithms

### 2.1 QuickSort (Divide-and-Conquer)
Pick pivot element $P$, partition array into elements $\le P$ and elements $> P$, and recurse.
- **Partitioning Strategies**: Lomuto Scheme (simpler) vs Hoare Scheme (fewer swaps).
- **Time Complexity**: Average $O(N \log N)$, Worst-Case $O(N^2)$ (mitigated via Randomized Pivots or Median-of-Three).
- **Space Complexity**: $O(\log N)$ stack space.

### 2.2 MergeSort (Stable Divide-and-Conquer)
Divide array into two equal halves, sort recursively, and merge sorted halves in $O(N)$ time.
- **Properties**: Guaranteed $O(N \log N)$ worst-case time, Stable (preserves relative order of equal keys).
- **Space Complexity**: $O(N)$ auxiliary array space.

### 2.3 HeapSort (In-Place Tree Structure)
Build a Max-Heap in $O(N)$ time, then repeatedly extract the maximum element and restore heap property.
- **Time Complexity**: $O(N \log N)$ guaranteed.
- **Space Complexity**: $O(1)$ auxiliary memory space.

---

## 3. Non-Comparison Sorting Algorithms ($O(N + K)$ Time)

| Algorithm | Mechanism | Time Complexity | Auxiliary Space | Best Use Case |
|---|---|---|---|---|
| **Counting Sort** | Counts frequency of key values in range $[0, K]$. | $O(N + K)$ | $O(K)$ | Small integer key ranges ($K \approx N$) |
| **Radix Sort** | Sorts numbers digit-by-digit from LSD to MSD using stable Counting Sort. | $O(d \cdot (N + K))$ | $O(N + K)$ | Fixed-length integers or strings |
| **Bucket Sort** | Distributes elements uniformly into $K$ buckets, sorts buckets individually. | $O(N + K)$ average | $O(N)$ | Uniformly distributed floating points |

---

## 4. Production Implementations in C++ and Python

### 4.1 C++ High-Performance QuickSort (Hoare Partitioning)

```cpp
#include <iostream>
#include <vector>
#include <cstdlib>

int hoarePartition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[low + (high - low) / 2];
    int i = low - 1;
    int j = high + 1;

    while (true) {
        do { i++; } while (arr[i] < pivot);
        do { j--; } while (arr[j] > pivot);

        if (i >= j) return j;
        std::swap(arr[i], arr[j]);
    }
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int p = hoarePartition(arr, low, high);
        quickSort(arr, low, p);
        quickSort(arr, p + 1, high);
    }
}
```

### 4.2 Python Counting Sort Implementation

```python
from typing import List

def counting_sort(arr: List[int]) -> List[int]:
    if not arr:
        return []

    min_val, max_val = min(arr), max(arr)
    val_range = max_val - min_val + 1
    
    count = [0] * val_range
    output = [0] * len(arr)

    for num in arr:
        count[num - min_val] += 1

    for i in range(1, val_range):
        count[i] += count[i - 1]

    for num in reversed(arr):
        output[count[num - min_val] - 1] = num
        count[num - min_val] -= 1

    return output
```

---

## Frequently Asked Questions (FAQs)

### Q1: What makes a sorting algorithm "Stable"?
A sorting algorithm is stable if two items with equal keys appear in the output array in the exact same relative order as they appeared in the input array.

### Q2: Why is QuickSort practically faster than MergeSort despite $O(N^2)$ worst case?
QuickSort operates in-place with excellent CPU cache locality (sequential memory access patterns during partitioning). MergeSort requires $O(N)$ extra memory allocations, causing cache misses.

### Q3: What is IntroSort (`std::sort` in C++)?
IntroSort (Introspective Sort) starts with QuickSort. If recursion depth exceeds $2 \log_2 N$, it switches to HeapSort to prevent $O(N^2)$ worst-case degradation. It uses InsertionSort for small arrays ($N < 16$).

### Q4: How does Timsort work in Python and Java?
Timsort is a hybrid stable algorithm combining MergeSort and InsertionSort. It identifies pre-existing ordered runs in data and merges them efficiently.

### Q5: How can Counting Sort run in linear time $O(N)$?
Counting Sort avoids comparisons entirely by using array indices as direct hash keys to tally key occurrences.
"""

# ----------------------------------------------------------------------
# 27. tree-traversal
# ----------------------------------------------------------------------
md_27 = r"""# Hierarchical Tree Traversals: Depth-First, Breadth-First & Euler Tours

A **Tree** is an acyclic connected graph $G = (V, E)$ with $|E| = |V| - 1$. Tree traversal is the systematic process of visiting every node in a tree hierarchy exactly once.

---

## 1. Depth-First Traversal Paradigms (DFS)

DFS visits nodes by recursively expanding child branches before backtracking:

### 1.1 Pre-Order Traversal ($\text{Root} \to \text{Left} \to \text{Right}$)
Visits root node before child subtrees. Used for tree cloning and serialization.

### 1.2 In-Order Traversal ($\text{Left} \to \text{Root} \to \text{Right}$)
Visits left subtree, root, then right subtree. Produces sorted key order in Binary Search Trees (BST).

### 1.3 Post-Order Traversal ($\text{Left} \to \text{Right} \to \text{Root}$)
Visits subtrees before parent node. Used for tree deletion and subtree size computations.

```
        (1)
       /   \
     (2)   (3)
    /   \
  (4)   (5)

Pre-order:  1, 2, 4, 5, 3
In-order:   4, 2, 5, 1, 3
Post-order: 4, 5, 2, 3, 1
```

---

## 2. Breadth-First Traversal (BFS / Level-Order)

BFS processes nodes level-by-level using a FIFO queue:
- **Level 0**: Root node.
- **Level $k$**: All children of nodes at level $k-1$.

---

## 3. Advanced Tree Structuring: Euler Tour & LCA

### 3.1 Euler Tour Technique (Tree Flattening)
An Euler Tour flattens a tree into a 1D array by recording node entrance and exit times during DFS:
- Node $u$ enters array at index `tin[u]` and exits at `tout[u]`.
- Subtree rooted at $u$ corresponds to contiguous slice `[tin[u], tout[u]]`. Range queries over subtrees are converted to 1D Segment Tree / Fenwick Tree updates.

### 3.2 Lowest Common Ancestor (LCA) via Binary Lifting
Binary Lifting precomputes ancestor array `up[u][i]` representing the $2^i$-th ancestor of node $u$:

$$\text{up}[u][i] = \text{up}[\text{up}[u][i-1]][i-1]$$

- **Preprocessing Time**: $O(N \log N)$
- **Query Time**: $O(\log N)$ per LCA query.

---

## 4. Production Implementations in C++ and Python

### 4.1 C++ Binary Lifting LCA Implementation

```cpp
#include <iostream>
#include <vector>

class LCA {
    int n, LOG;
    std::vector<int> depth;
    std::vector<std::vector<int>> up;

public:
    LCA(int nodes, int root, const std::vector<std::vector<int>>& adj) {
        n = nodes;
        LOG = 20;
        depth.resize(n + 1);
        up.assign(n + 1, std::vector<int>(LOG));

        auto dfs = [&](auto& self, int u, int p) -> void {
            up[u][0] = p;
            for (int i = 1; i < LOG; ++i) {
                up[u][i] = up[up[u][i - 1]][i - 1];
            }
            for (int v : adj[u]) {
                if (v != p) {
                    depth[v] = depth[u] + 1;
                    self(self, v, u);
                }
            }
        };

        dfs(dfs, root, root);
    }

    int getLCA(int u, int v) {
        if (depth[u] < depth[v]) std::swap(u, v);

        // Lift u to same depth as v
        for (int i = LOG - 1; i >= 0; --i) {
            if (depth[u] - (1 << i) >= depth[v]) {
                u = up[u][i];
            }
        }

        if (u == v) return u;

        // Lift u and v together
        for (int i = LOG - 1; i >= 0; --i) {
            if (up[u][i] != up[v][i]) {
                u = up[u][i];
                v = up[v][i];
            }
        }

        return up[u][0];
    }
};
```

### 4.2 Python Iterative In-Order Traversal

```python
from typing import List, Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder_traversal_iterative(root: Optional[TreeNode]) -> List[int]:
    result = []
    stack = []
    curr = root

    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
            
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right

    return result
```

---

## Frequently Asked Questions (FAQs)

### Q1: How can a tree be uniquely reconstructed from traversal sequences?
A tree can be uniquely reconstructed using In-Order combined with either Pre-Order or Post-Order traversal. Pre-Order/Post-Order alone is insufficient due to structural ambiguity.

### Q2: What is Morris In-Order Traversal?
Morris Traversal achieves $O(N)$ time and $O(1)$ extra space by creating temporary threaded links (pointing right child pointers of predecessors back to current nodes).

### Q3: Why is tree flattening via Euler Tour useful in competitive programming?
Euler Tour maps subtree operations into contiguous 1D array ranges `[tin[u], tout[u]]`, allowing point updates and subtree sum queries in $O(\log N)$ using Segment Trees.

### Q4: How is Tree Diameter computed in linear time?
Run two BFS passes: BFS 1 from an arbitrary node finds the farthest node $A$. BFS 2 from node $A$ finds the farthest node $B$. Distance $d(A, B)$ is the tree diameter.

### Q5: What is the spatial overhead of BFS vs DFS on balanced trees?
DFS uses $O(H) = O(\log N)$ stack space on balanced trees. BFS queue stores maximum leaf count at bottom level ($O(N/2) = O(N)$ space).
"""

# ----------------------------------------------------------------------
# 28. mst-union-find
# ----------------------------------------------------------------------
md_28 = r"""# Minimum Spanning Trees & Disjoint Set Forests (DSU): Kruskal, Prim & Ackermann Complexity

Given a connected undirected weighted graph $G = (V, E, w)$, a **Minimum Spanning Tree (MST)** is a subset of edges $T \subseteq E$ that connects all vertices without cycles while minimizing total edge weight:

$$w(T) = \sum_{e \in T} w(e)$$

---

## 1. Theoretical Cut & Cycle Properties

### 1.1 Cut Property
For any cut $(S, V \setminus S)$ of graph $G$, if edge $e = (u, v)$ is the strictly light edge crossing the cut, then $e$ belongs to all MSTs of $G$.

### 1.2 Cycle Property
For any cycle $C$ in graph $G$, if edge $e$ is the strictly heaviest edge in $C$, then $e$ cannot belong to any MST of $G$.

---

## 2. Disjoint Set Union (DSU / Union-Find)

The **Disjoint Set Union** data structure manages dynamic partitions of a set into disjoint subsets:
- `find(i)`: Identifies representative set leader of element $i$.
- `union(i, j)`: Merges sets containing $i$ and $j$.

### 2.1 Optimizations
1. **Path Compression**: Point parent of every visited node directly to root leader during `find(i)`.
2. **Union by Rank/Size**: Attach smaller tree under root of larger tree during `union`.

### 2.2 Inverse Ackermann Complexity
With both optimizations, any sequence of $M$ operations on $N$ elements takes $O(M \cdot \alpha(N))$ time, where $\alpha(N)$ is the **Inverse Ackermann function** ($\alpha(N) \le 4$ for all physical Universe atom counts).

---

## 3. Kruskal's & Prim's Algorithms

| Feature | Kruskal's Algorithm | Prim's Algorithm |
|---|---|---|
| **Strategy** | Edge-centric greedy selection using DSU. | Vertex-centric greedy growth using Min-Heap. |
| **Time Complexity** | $O(E \log E) = O(E \log V)$ | $O(E \log V)$ (Binary Heap) / $O(E + V \log V)$ (Fibonacci) |
| **Best Graph Domain** | Sparse Graphs ($E \ll V^2$) | Dense Graphs ($E \approx V^2$) |

---

## 4. Production Implementations in C++ and Python

### 4.1 C++ DSU & Kruskal's Algorithm

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

struct Edge {
    int u, v, weight;
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

class DSU {
    std::vector<int> parent, rank;
public:
    DSU(int n) : parent(n + 1), rank(n + 1, 0) {
        for (int i = 1; i <= n; ++i) parent[i] = i;
    }

    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]); // Path compression
    }

    bool unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);

        if (root_i != root_j) {
            // Union by rank
            if (rank[root_i] < rank[root_j]) std::swap(root_i, root_j);
            parent[root_j] = root_i;
            if (rank[root_i] == rank[root_j]) rank[root_i]++;
            return true;
        }
        return false;
    }
};

int kruskalMST(int n, std::vector<Edge>& edges) {
    std::sort(edges.begin(), edges.end());
    DSU dsu(n);
    int mstWeight = 0;
    int edgesCount = 0;

    for (const auto& edge : edges) {
        if (dsu.unite(edge.u, edge.v)) {
            mstWeight += edge.weight;
            edgesCount++;
            if (edgesCount == n - 1) break;
        }
    }

    return (edgesCount == n - 1) ? mstWeight : -1;
}
```

### 4.2 Python Prim's Algorithm Implementation

```python
import heapq
from typing import List, Tuple, Dict

def prim_mst(n: int, adj: Dict[int, List[Tuple[int, int]]]) -> int:
    visited = [False] * (n + 1)
    min_heap = [(0, 1)] # (weight, vertex)
    total_weight = 0
    visited_count = 0

    while min_heap and visited_count < n:
        w, u = heapq.heappop(min_heap)

        if visited[u]:
            continue

        visited[u] = True
        total_weight += w
        visited_count += 1

        for v, weight in adj.get(u, []):
            if not visited[v]:
                heapq.heappush(min_heap, (weight, v))

    return total_weight if visited_count == n else -1
```

---

## Frequently Asked Questions (FAQs)

### Q1: Is the Minimum Spanning Tree unique?
If all edge weights in a graph are distinct, the MST is guaranteed to be unique. If duplicate edge weights exist, multiple distinct MSTs may exist.

### Q2: What is the Inverse Ackermann Function $\alpha(N)$?
It is the inverse of the rapidly growing Ackermann function $A(k, k)$. For all practical values of $N \le 10^{80}$ (atoms in observable universe), $\alpha(N) \le 4$, making DSU operations effectively constant time.

### Q3: When should I choose Prim's over Kruskal's algorithm?
Use Prim's with binary heaps or arrays for dense graphs ($E \approx V^2$) where $E \log V$ dominates. Use Kruskal's for sparse graphs ($E \approx V$).

### Q4: Can Kruskal's algorithm run on graphs with negative edge weights?
Yes. Kruskal's and Prim's MST algorithms operate correctly on negative edge weights because they optimize global sum cuts without assuming non-negative distances.

### Q5: How can DSU be used to detect cycles in an undirected graph?
Iterate through graph edges $(u, v)$. If `find(u) == find(v)`, adding edge $(u, v)$ creates a cycle. Otherwise, execute `union(u, v)`.
"""

# ----------------------------------------------------------------------
# 29. scc-bridges
# ----------------------------------------------------------------------
md_29 = r"""# Strongly Connected Components (SCC), Bridges & Articulation Points: Tarjan & Kosaraju Algorithms

Graph connectivity analysis identifies critical network vulnerabilities, structural bridges, and isolated components.

---

## 1. Graph Connectivity Definitions

### 1.1 Strongly Connected Components (SCC)
A **Strongly Connected Component** of a directed graph $G = (V, E)$ is a maximal subset of vertices $U \subseteq V$ such that every pair $u, v \in U$ is mutually reachable ($u \rightsquigarrow v$ and $v \rightsquigarrow u$).

### 1.2 Bridges & Articulation Points
In an undirected graph $G = (V, E)$:
- An edge $e \in E$ is a **Bridge** if removing $e$ increases graph connected components.
- A vertex $v \in V$ is an **Articulation Point (Cut Vertex)** if removing $v$ (and incident edges) increases connected components.

---

## 2. Tarjan's Low-Link Value Algorithm

Tarjan's algorithm uses a single Depth-First Search (DFS) pass by tracking two structural arrays:
- `tin[u]`: Discovery timestamp of node $u$.
- `low[u]`: Lowest discovery timestamp reachable from $u$ via subtree descendants and at most one back-edge.

$$\text{low}[u] = \min \begin{cases} \text{tin}[u] \\ \text{tin}[v] & \text{for back-edges } (u, v) \\ \text{low}[v] & \text{for tree-edges } (u, v) \end{cases}$$

### 2.1 Bridge Condition
An undirected edge $(u, v)$ is a **Bridge** iff:

$$\text{low}[v] > \text{tin}[u]$$

### 2.2 Articulation Point Condition
A vertex $u$ is an **Articulation Point** iff:
1. $u$ is root of DFS tree with $\ge 2$ children.
2. $u$ is non-root and has a child $v$ such that $\text{low}[v] \ge \text{tin}[u]$.

---

## 3. Kosaraju's 2-Pass SCC Algorithm

1. Perform DFS 1 on graph $G$, pushing nodes onto a stack in order of completion times.
2. Compute transposed graph $G^T$ (reverse all directed edges).
3. Perform DFS 2 on $G^T$ in stack pop order. Each DFS tree formed in $G^T$ is a distinct SCC.

**Time Complexity**: $O(V + E)$.

---

## 4. Production Implementations in C++ and Python

### 4.1 C++ Tarjan's Bridge Finder

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

class BridgeFinder {
    int timer;
    std::vector<int> tin, low;
    std::vector<bool> visited;
    std::vector<std::pair<int, int>> bridges;

    void dfs(int u, int p, const std::vector<std::vector<int>>& adj) {
        visited[u] = true;
        tin[u] = low[u] = ++timer;

        for (int v : adj[u]) {
            if (v == p) continue;
            if (visited[v]) {
                // Back-edge
                low[u] = std::min(low[u], tin[v]);
            } else {
                // Forward tree-edge
                dfs(v, u, adj);
                low[u] = std::min(low[u], low[v]);
                if (low[v] > tin[u]) {
                    bridges.push_back({u, v});
                }
            }
        }
    }

public:
    std::vector<std::pair<int, int>> findBridges(int n, const std::vector<std::vector<int>>& adj) {
        timer = 0;
        tin.assign(n + 1, 0);
        low.assign(n + 1, 0);
        visited.assign(n + 1, false);
        bridges.clear();

        for (int i = 1; i <= n; ++i) {
            if (!visited[i]) dfs(i, -1, adj);
        }
        return bridges;
    }
};
```

### 4.2 Python Tarjan's Directed SCC Solver

```python
from typing import List, Dict

def tarjan_scc(n: int, adj: Dict[int, List[int]]) -> List[List[int]]:
    timer = 0
    tin = [-1] * (n + 1)
    low = [-1] * (n + 1)
    on_stack = [False] * (n + 1)
    stack = []
    sccs = []

    def dfs(u: int):
        nonlocal timer
        tin[u] = low[u] = timer
        timer += 1
        stack.append(u)
        on_stack[u] = True

        for v in adj.get(u, []):
            if tin[v] == -1:
                dfs(v)
                low[u] = min(low[u], low[v])
            elif on_stack[v]:
                low[u] = min(low[u], tin[v])

        if low[u] == tin[u]:
            scc = []
            while True:
                node = stack.pop()
                on_stack[node] = False
                scc.append(node)
                if node == u:
                    break
            sccs.append(scc)

    for i in range(1, n + 1):
        if tin[i] == -1:
            dfs(i)

    return sccs
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why does $\text{low}[v] > \text{tin}[u]$ indicate a bridge?
It proves that no node in $v$'s subtree has a back-edge reaching $u$ or any ancestor above $u$. Thus, removing edge $(u, v)$ completely disconnects $v$'s subtree.

### Q2: What is the Condensation Graph of a directed graph?
A Condensation Graph contracts each SCC into a single super-node. The resulting graph is guaranteed to be a Directed Acyclic Graph (DAG).

### Q3: Why does Kosaraju's algorithm require reversing graph edges?
Reversing edges ensures that DFS on $G^T$ cannot leak into already-visited SCC components, allowing component isolation in reverse topological order.

### Q4: What is the difference between Tarjan's SCC and Tarjan's Bridge algorithm?
SCC operates on directed graphs using explicit stacks to isolate strongly connected subgraphs. Bridge detection operates on undirected graphs tracking parent node constraints.

### Q5: How do Bridges apply to network vulnerability analysis?
Bridges represent single points of network failure (critical routers/links). Removing a bridge partitions the communications network into isolated subnets.
"""

# ----------------------------------------------------------------------
# 30. string-algorithms
# ----------------------------------------------------------------------
md_30 = r"""# Pattern Matching & String Invariants: KMP, Rabin-Karp, Z-Algorithm & Trie Trees

String pattern matching algorithms search for occurrences of a pattern string $P$ (length $M$) inside a text string $T$ (length $N$).

Naive pattern matching checks all window alignments in $O(N \cdot M)$ time. Advanced string invariants reduce search time to linear $O(N + M)$.

---

## 1. Knuth-Morris-Pratt (KMP) Algorithm & Prefix Function

KMP avoids unnecessary text pointer backtracking by computing the **Prefix Function** $\pi[i]$ for pattern $P$.

### 1.1 Prefix Function Definition
$\pi[i]$ is the length of the longest proper prefix of $P[0 \dots i]$ that is also a suffix of $P[0 \dots i]$:

$$\pi[i] = \max \{ k : 0 \le k < i \text{ and } P[0 \dots k-1] = P[i-k+1 \dots i] \}$$

### 1.2 KMP Matching Complexity
- **Preprocessing Time**: $O(M)$
- **Matching Time**: $O(N)$
- **Total Time**: $O(N + M)$

---

## 2. Rabin-Karp Rolling Hash Algorithm

Rabin-Karp maps string windows to integer hash values using a **Polynomial Rolling Hash**:

$$H(S) = \left( \sum_{i=0}^{k-1} S[i] \cdot p^{k-1-i} \right) \bmod M$$

Sliding the window right computes the new hash in $O(1)$ time:

$$H(S_{next}) = \left( (H(S_{prev}) - S[0] \cdot p^{k-1}) \cdot p + S_{new} \right) \bmod M$$

To eliminate hash collision risks, **Double Hashing** uses two coprime modulo values $M_1, M_2$.

---

## 3. Z-Algorithm & Z-Array

The **Z-array** for string $S$ stores in $Z[i]$ the length of the longest common prefix between $S$ and suffix $S[i \dots N-1]$.

By constructing string $S = P + \text{'\#'} + T$, occurrences of $P$ in $T$ correspond to indices where $Z[i] = M$.

---

## 4. Trie Data Structure (Prefix Trees)

A **Trie** is a tree data structure storing strings where edges represent individual characters:
- **Insert / Search Time**: $O(L)$ where $L$ is string length.
- **Applications**: Autocomplete, spell checking, IP routing prefix lookup, XOR Tries for maximum XOR pair queries.

---

## 5. Production Implementations in C++ and Python

### 5.1 C++ KMP Pattern Matcher

```cpp
#include <iostream>
#include <vector>
#include <string>

std::vector<int> computePrefixFunction(const std::string& pat) {
    int m = pat.length();
    std::vector<int> pi(m, 0);

    for (int i = 1; i < m; ++i) {
        int j = pi[i - 1];
        while (j > 0 && pat[i] != pat[j]) {
            j = pi[j - 1];
        }
        if (pat[i] == pat[j]) {
            j++;
        }
        pi[i] = j;
    }
    return pi;
}

std::vector<int> kmpSearch(const std::string& text, const std::string& pat) {
    int n = text.length();
    int m = pat.length();
    std::vector<int> pi = computePrefixFunction(pat);
    std::vector<int> matches;

    int j = 0; // Index for pat
    for (int i = 0; i < n; ++i) {
        while (j > 0 && text[i] != pat[j]) {
            j = pi[j - 1];
        }
        if (text[i] == pat[j]) {
            j++;
        }
        if (j == m) {
            matches.push_back(i - m + 1);
            j = pi[j - 1];
        }
    }

    return matches;
}
```

### 5.2 Python Prefix Trie Implementation

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end_of_word = True

    def search(self, word: str) -> bool:
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end_of_word

    def starts_with(self, prefix: str) -> bool:
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is KMP faster than Naive pattern matching?
KMP uses precomputed prefix function $\pi[i]$ to shift the pattern by the maximum safe distance without re-evaluating text characters already matched.

### Q2: What prime base $p$ and modulo $M$ should be used in Rabin-Karp?
Use $p = 31$ or $313$ for lowercase English letters, and large prime modulo $M = 10^9 + 7$ or $10^9 + 9$.

### Q3: What is a Spurious Hit in Rabin-Karp?
A Spurious Hit occurs when two distinct string windows produce identical hash values due to hash collision. It requires explicit character comparison verification.

### Q4: How does a Bitwise XOR Trie find Maximum XOR pair?
Insert binary representations of numbers into a Trie of height 32. For each number, greedily traverse the opposite bit branch ($1 \to 0$ or $0 \to 1$) to maximize XOR result.

### Q5: When is Z-Algorithm preferred over KMP?
Z-Algorithm is simpler to code and handles string concatenation queries ($S = P + \# + T$) directly, yielding $Z[i]$ matching values without complex pointer transitions.
"""

# Register all Batch 3 blogs
add_blog(
    slug="dijkstra",
    title="Dijkstra's Shortest Path & Priority Queue Operations",
    tagline="Non-negative edge weight shortest paths, priority queue mechanics, and A* heuristic extensions.",
    category="Graph Algorithms",
    read_time=36,
    prerequisites=["graph-basics", "priority-queue"],
    related=["bellman-ford", "floyd-warshall", "a-star"],
    practice_probs=[{"title": "Network Delay Time", "difficulty": "Medium", "url": "https://leetcode.com/problems/network-delay-time/"}],
    markdown=md_21
)

add_blog(
    slug="dynamic-programming",
    title="Dynamic Programming (DP): Overlapping Subproblems & Optimal Substructure",
    tagline="Memoization vs tabulation, state space optimization, LCS, and Knapsack formulations.",
    category="Algorithms",
    read_time=38,
    prerequisites=["recursion", "arrays"],
    related=["greedy", "memoization"],
    practice_probs=[{"title": "Coin Change", "difficulty": "Medium", "url": "https://leetcode.com/problems/coin-change/"}],
    markdown=md_22
)

add_blog(
    slug="greedy",
    title="Greedy Algorithms: Local Optimality, Matroids & Fractional Knapsack",
    tagline="Greedy choice property, exchange arguments, Huffman coding, and Matroid optimization.",
    category="Algorithms",
    read_time=34,
    prerequisites=["sorting", "priority-queue"],
    related=["dynamic-programming", "huffman-coding"],
    practice_probs=[{"title": "Jump Game", "difficulty": "Medium", "url": "https://leetcode.com/problems/jump-game/"}],
    markdown=md_23
)

add_blog(
    slug="backtracking",
    title="Constraint Backtracking: State-Space Trees & Pruning Mechanics",
    tagline="State-space tree exploration, N-Queens, Sudoku solvers, and MRV pruning strategies.",
    category="Algorithms",
    read_time=36,
    prerequisites=["dfs", "recursion"],
    related=["recursion", "bitmasking"],
    practice_probs=[{"title": "N-Queens", "difficulty": "Hard", "url": "https://leetcode.com/problems/n-queens/"}],
    markdown=md_24
)

add_blog(
    slug="searching",
    title="Linear, Binary & Multi-Interval Searching",
    tagline="Binary search invariants, answer space search, ternary search, and predicate evaluation.",
    category="Algorithms",
    read_time=34,
    prerequisites=["arrays"],
    related=["binary-search", "sorting"],
    practice_probs=[{"title": "Search in Rotated Sorted Array", "difficulty": "Medium", "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/"}],
    markdown=md_25
)

add_blog(
    slug="sorting",
    title="Divide-and-Conquer Sorting Paradigms: QuickSort, MergeSort & HeapSort",
    tagline="Comparison lower bounds, Hoare partitioning, stable MergeSort, and non-comparison Radix sort.",
    category="Algorithms",
    read_time=36,
    prerequisites=["arrays", "recursion"],
    related=["searching", "heaps"],
    practice_probs=[{"title": "Sort an Array", "difficulty": "Medium", "url": "https://leetcode.com/problems/sort-an-array/"}],
    markdown=md_26
)

add_blog(
    slug="tree-traversal",
    title="Hierarchical Tree Traversals: BFS, DFS & Euler Tours",
    tagline="DFS pre/in/post order, BFS level-order, Euler tree flattening, and Binary Lifting LCA.",
    category="Data Structures",
    read_time=34,
    prerequisites=["binary-trees", "stacks-queues"],
    related=["lowest-common-ancestor", "euler-tour"],
    practice_probs=[{"title": "Lowest Common Ancestor of a Binary Tree", "difficulty": "Medium", "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"}],
    markdown=md_27
)

add_blog(
    slug="mst-union-find",
    title="Minimum Spanning Trees & Disjoint Set Forests (Kruskal, Prim, Union-Find)",
    tagline="Cut and cycle properties, Kruskal's DSU path compression, and Prim's min-heap MST.",
    category="Graph Algorithms",
    read_time=36,
    prerequisites=["graphs", "priority-queue"],
    related=["dsu", "dijkstra"],
    practice_probs=[{"title": "Min Cost to Connect All Points", "difficulty": "Medium", "url": "https://leetcode.com/problems/min-cost-to-connect-all-points/"}],
    markdown=md_28
)

add_blog(
    slug="scc-bridges",
    title="Strongly Connected Components & Bridges: Tarjan, Kosaraju & Low-Link Values",
    tagline="Directed SCCs, Tarjan's low-link discovery time algorithm, Kosaraju 2-pass DFS, and bridges.",
    category="Graph Algorithms",
    read_time=36,
    prerequisites=["dfs", "directed-graphs"],
    related=["tarjan", "kosaraju"],
    practice_probs=[{"title": "Critical Connections in a Network", "difficulty": "Hard", "url": "https://leetcode.com/problems/critical-connections-in-a-network/"}],
    markdown=md_29
)

add_blog(
    slug="string-algorithms",
    title="Pattern Matching & String Invariants: KMP, Rabin-Karp, Z-Algorithm & Tries",
    tagline="Knuth-Morris-Pratt prefix function, polynomial rolling hashes, Z-array, and Trie data structures.",
    category="Algorithms",
    read_time=36,
    prerequisites=["strings", "hash-tables"],
    related=["kmp", "trie"],
    practice_probs=[{"title": "Find the Index of the First Occurrence in a String", "difficulty": "Easy", "url": "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/"}],
    markdown=md_30
)

output_json = 'scratch/ai_batch3_heavy.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(blogs, f, indent=2)

print(f"\nSUCCESSFULLY GENERATED ALL {len(blogs)} 100% REAL BATCH 3 BLOGS IN {output_json}!")
