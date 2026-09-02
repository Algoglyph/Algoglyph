# Dijkstra's Algorithm: Shortest Paths & the Relaxation Invariant

## 1. Historical Context & Motivation

In 1956, a 26-year-old Dutch mathematician named **Edsger W. Dijkstra** was shopping in Amsterdam and wanted to demonstrate the power of the newly-built ARMAC computer. He designed a shortest-path algorithm to compute the optimal route between Dutch cities. He published it formally in 1959 in the paper *"A Note on Two Problems in Connexion with Graphs."*

Dijkstra's algorithm answers a deceptively simple question: **Given a weighted directed graph with non-negative edges and a source vertex $s$, what is the shortest distance from $s$ to every other vertex?**

The algorithm is the backbone of:
*   **GPS navigation** (Google Maps, Waze, TomTom)
*   **Network routing protocols** (OSPF, IS-IS — the protocols that run the internet's backbone)
*   **Game AI pathfinding** (A* is Dijkstra with a heuristic)
*   **Telephone network call routing** (used since the 1970s in circuit-switched networks)

The constraint that edge weights must be **non-negative** is fundamental. Dijkstra fails on negative edges because it relies on a greedy choice — once a node is "settled," its distance never changes. Negative edges break that assumption, and you must use Bellman-Ford instead.

---

## 2. Core Mathematical Invariants

### The Shortest-Path Substructure

For a path $s = v_0 \to v_1 \to v_2 \to \dots \to v_k = t$, the path length is:

$$\text{len}(P) = \sum_{i=0}^{k-1} w(v_i, v_{i+1})$$

We seek $d(s, t) = \min_{P: s \leadsto t} \text{len}(P)$.

### The Optimal Substructure Theorem

> **Theorem (Subpaths of shortest paths are shortest paths).**
> If $P = s \leadsto u \to v$ is a shortest path from $s$ to $v$, then the prefix $s \leadsto u$ must be a shortest path from $s$ to $u$.

**Proof (by contradiction).** Suppose a shorter path $Q$ from $s$ to $u$ existed. Then we could splice $Q$ into $P$ to form $Q \to v$, which would be strictly shorter than $P$. Contradiction. $\blacksquare$

This substructure is *why* Dijkstra works: once we know $d(s, u)$, any future path through $u$ can use that guaranteed-optimal prefix.

### The Relaxation Invariant

Define $d[v]$ as the *tentative* distance to $v$. The fundamental operation is **edge relaxation**:

```
RELAX(u, v, w):
    if d[u] + w(u,v) < d[v]:
        d[v] ← d[u] + w(u,v)
        π[v] ← u      // predecessor
```

The **invariant** Dijkstra maintains: at every point, for every vertex $v$,

$$d[v] \ge d(s, v)$$

Tentative distances are always upper bounds on true distances. They shrink monotonically as we relax more edges.

### The Greedy-Choice Theorem

> **Theorem.** When all edge weights are non-negative, the unvisited vertex with the smallest $d[v]$ has already achieved its final shortest-path distance.

**Proof sketch.** Let $u$ be the unvisited vertex minimizing $d[u]$. Suppose (for contradiction) that some shorter path $P'$ to $u$ existed. $P'$ must pass through some other unvisited vertex $x$ before reaching $u$. But $d[x] \ge d[u]$ (since $u$ was the minimum) and edge weights are $\ge 0$, so any extension of $x$ cannot make $u$ smaller. Contradiction. $\blacksquare$

This theorem justifies the priority-queue extraction step.

<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style="background:#0d1117;border-radius:8px;width:100%;max-width:600px">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="22" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#7d8590"/>
    </marker>
  </defs>
  <circle cx="80" cy="140" r="28" fill="#1f6feb" stroke="#58a6ff" stroke-width="2"/>
  <text x="80" y="146" fill="#fff" font-family="monospace" font-size="16" text-anchor="middle">s (0)</text>
  <circle cx="260" cy="60" r="28" fill="#238636" stroke="#3fb950" stroke-width="2"/>
  <text x="260" y="66" fill="#fff" font-family="monospace" font-size="16" text-anchor="middle">a (2)</text>
  <circle cx="260" cy="220" r="28" fill="#238636" stroke="#3fb950" stroke-width="2"/>
  <text x="260" y="226" fill="#fff" font-family="monospace" font-size="16" text-anchor="middle">b (5)</text>
  <circle cx="440" cy="60" r="28" fill="#238636" stroke="#3fb950" stroke-width="2"/>
  <text x="440" y="66" fill="#fff" font-family="monospace" font-size="16" text-anchor="middle">c (4)</text>
  <circle cx="440" cy="220" r="28" fill="#238636" stroke="#3fb950" stroke-width="2"/>
  <text x="440" y="226" fill="#fff" font-family="monospace" font-size="16" text-anchor="middle">t (7)</text>
  <line x1="105" y1="125" x2="237" y2="72" stroke="#7d8590" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="170" y="92" fill="#c9d1d9" font-family="monospace" font-size="13">2</text>
  <line x1="105" y1="155" x2="237" y2="208" stroke="#7d8590" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="170" y="195" fill="#c9d1d9" font-family="monospace" font-size="13">5</text>
  <line x1="285" y1="65" x2="417" y2="65" stroke="#7d8590" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="350" y="58" fill="#c9d1d9" font-family="monospace" font-size="13">2</text>
  <line x1="285" y1="75" x2="417" y2="208" stroke="#7d8590" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="360" y="135" fill="#c9d1d9" font-family="monospace" font-size="13">6</text>
  <line x1="285" y1="215" x2="417" y2="215" stroke="#7d8590" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="350" y="208" fill="#c9d1d9" font-family="monospace" font-size="13">2</text>
  <line x1="285" y1="205" x2="417" y2="72" stroke="#7d8590" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="360" y="150" fill="#c9d1d9" font-family="monospace" font-size="13">3</text>
  <text x="300" y="265" fill="#8b949e" font-family="monospace" font-size="12" text-anchor="middle">Shortest path s → b → t = 5 + 2 = 7</text>
</svg>

---

## 3. Step-by-Step Execution Trace

Consider the graph above with source $s$. Edges: $s \xrightarrow{2} a$, $s \xrightarrow{5} b$, $a \xrightarrow{2} c$, $a \xrightarrow{6} t$, $b \xrightarrow{2} t$, $b \xrightarrow{3} c$.

**Initial state:** $d[s]=0$, $d[\text{all others}] = +\infty$. Priority queue (PQ) = `[(0, s)]`.

| Step | PQ (min-heap)           | Extract | Relaxations performed                                | Settled distances            |
|------|-------------------------|---------|------------------------------------------------------|------------------------------|
| 1    | `[(0,s)]`               | `s=0`   | $d[a] \leftarrow 0+2=2$; $d[b] \leftarrow 0+5=5$     | $d=\{s:0,a:2,b:5\}$          |
| 2    | `[(2,a),(5,b)]`         | `a=2`   | $d[c] \leftarrow 2+2=4$; $d[t] \leftarrow 2+6=8$     | $d=\{s:0,a:2,b:5,c:4,t:8\}$  |
| 3    | `[(4,c),(5,b),(8,t)]`   | `c=4`   | (no edges from c)                                    | (no change)                  |
| 4    | `[(5,b),(8,t)]`         | `b=5`   | $d[t] \leftarrow \min(8, 5+2)=7$; $d[c]=\min(4,5+3)$ | $d[t]$ improves from 8 to 7  |
| 5    | `[(7,t)]`               | `t=7`   | (no edges)                                           | **done**                     |

**Final shortest path tree:** $s \to a \to c$ (cost 4), $s \to b$ (cost 5), $s \to a \to t$ is *not* used because $s \to b \to t$ (cost 7) beats it, and the path to $t$ goes $s \to b \to t$.

**Key observations:**
1. When we extracted `c=4`, its distance was already final. The greedy theorem guarantees this.
2. Step 4 is the critical one: we *re-discovered* $t$ with a shorter distance. With a binary heap, this requires a **decrease-key** operation or, more commonly, a lazy approach of pushing duplicate entries and skipping stale ones.

---

## 4. Production-Ready Implementations

### C++ (Lazy Deletion + Binary Heap)

```cpp
#include <bits/stdc++.h>
using namespace std;

// Returns shortest distances from source. graph[u] = list of (v, weight).
vector<long long> dijkstra(int n, int source,
                           const vector<vector<pair<int,int>>>& graph) {
    const long long INF = LLONG_MAX;
    vector<long long> dist(n, INF);
    vector<int> pred(n, -1);
    // Min-heap of (distance, vertex). Lazy deletion: stale entries skipped.
    priority_queue<pair<long long,int>, vector<pair<long long,int>>,
                   greater<>> pq;

    dist[source] = 0;
    pq.push({0, source});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        // Skip stale entry — a shorter distance was already settled.
        if (d > dist[u]) continue;
        for (auto [v, w] : graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pred[v] = u;
                pq.push({dist[v], v});  // push duplicate; lazy delete later
            }
        }
    }
    return dist;
}
```

### Python (heapq + Lazy Deletion)

```python
import heapq
from typing import List, Tuple

def dijkstra(n: int, source: int,
             graph: List[List[Tuple[int, int]]]) -> List[float]:
    """
    graph[u] = list of (v, weight). Returns shortest distances from source.
    Uses lazy deletion: stale heap entries are skipped on pop.
    """
    INF = float('inf')
    dist = [INF] * n
    pred = [-1] * n
    dist[source] = 0
    pq = [(0, source)]  # (distance, vertex)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:          # stale entry, skip
            continue
        for v, w in graph[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                pred[v] = u
                heapq.heappush(pq, (nd, v))
    return dist
```

**Engineering notes:**
*   **Lazy deletion** is preferred in production over `decrease_key` because `std::priority_queue` and Python's `heapq` don't support efficient decrease-key. The heap may grow to $O(E)$ entries, but each is processed in $O(\log E)$ and amortized cost stays $O((V+E)\log V)$.
*   For **dense graphs** ($E \approx V^2$), use an $O(V^2)$ array-based version instead — no heap overhead.
*   For **integer weights bounded by $W$**, use a **Dial's algorithm** bucket queue for $O(E + VW)$ time.

---

## 5. Asymptotic Time & Space Complexity

| Implementation            | Time                  | Space  | When to use                          |
|---------------------------|-----------------------|--------|--------------------------------------|
| Binary heap (lazy)        | $O((V+E)\log V)$      | $O(V+E)$ | General purpose, sparse graphs     |
| Fibonacci heap            | $O(E + V\log V)$      | $O(V+E)$ | Theoretical best; rarely practical |
| Array (linear scan)       | $O(V^2)$              | $O(V+E)$ | Dense graphs ($E \approx V^2$)     |
| Dial's (bucket queue)     | $O(E + VW)$           | $O(V+W)$ | Small integer weights              |

**Derivation (binary heap):**
*   Each vertex extracted once: $V$ pop operations × $O(\log V) = O(V \log V)$
*   Each edge causes at most one push: $E$ push operations × $O(\log V) = O(E \log V)$
*   Total: $O((V+E)\log V)$

The Fibonacci heap achieves $O(E + V\log V)$ because `decrease_key` is $O(1)$ amortized — but the constant factor is so large that binary heaps win in practice for all but astronomically large graphs.

---

## 6. Systems Connections: How Google Maps Routes You

Dijkstra's algorithm is the **theoretical foundation** of real-world routing, but production systems layer optimizations on top:

### Bidirectional Dijkstra
Run two Dijkstra searches simultaneously — one forward from $s$, one backward from $t$. When they meet in the middle, terminate. This roughly halves the explored area: $O(V^{1/2})$ instead of $O(V)$.

### Contraction Hierarchies (CH)
Preprocess the graph by computing "shortcut edges" through important vertices. At query time, only the top-level shortcuts are explored. Google Maps uses CH variants to answer continent-scale queries in **microseconds**.

### A* Search
Add a heuristic $h(v) \approx d(v, t)$ (e.g., straight-line distance). A* explores nodes in order of $d[v] + h(v)$, drastically pruning the search. When $h$ is admissible (never overestimates), A* is optimal and dominates Dijkstra.

### OSPF / IS-IS Network Routing
Every router in the internet's backbone runs Dijkstra on the **link-state database** to compute its shortest-path tree. When a link fails, routers flood the update and re-run Dijkstra — this is why convergence time (seconds) matters for internet stability.

---

## 7. Practice Checklist

### Beginner Problems
*   [Network Delay Time (LeetCode 743)](https://leetcode.com/problems/network-delay-time/): Classic single-source shortest path.
    *   *Why this is useful:* Direct Dijkstra application — find the longest shortest-path from source.
*   [Path with Maximum Probability (LeetCode 1514)](https://leetcode.com/problems/path-with-maximum-probability/): Maximize product of probabilities.
    *   *Why this is useful:* Transform products to sums via $-\log$ and run Dijkstra.
*   [Cheapest Flights Within K Stops (LeetCode 787)](https://leetcode.com/problems/cheapest-flights-within-k-stops/): Shortest path with hop limit.
    *   *Why this is useful:* Requires Bellman-Ford or modified BFS — Dijkstra alone fails with the hop constraint.

### Intermediate Problems
*   [Swim in Rising Water (LeetCode 778)](https://leetcode.com/problems/swim-in-rising-water/): Minimize the maximum edge on a path.
    *   *Why this is useful:* Dijkstra variant where the "distance" is the max edge weight, not the sum.
*   [Path With Minimum Effort (LeetCode 1631)](https://leetcode.com/problems/path-with-minimum-effort/): Minimize max absolute difference.
    *   *Why this is useful:* Same minimax variant; clean Dijkstra modification.
*   [Find the City With the Smallest Number of Neighbors (LeetCode 1334)](https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/): All-pairs within threshold.
    *   *Why this is useful:* Run Dijkstra from every vertex (or use Floyd-Warshall).

### Advanced Problems
*   [Number of Ways to Arrive at Destination (LeetCode 1976)](https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/): Count shortest paths.
    *   *Why this is useful:* Augment Dijkstra with a `ways[]` array updated during relaxation.
*   [Second Minimum Time to Reach Destination (LeetCode 2045)](https://leetcode.com/problems/second-minimum-time-to-reach-destination/): Strictly second-shortest.
    *   *Why this is useful:* Track both shortest and second-shortest distance per node.
*   [Modify Graph Edge Weights (LeetCode 2699)](https://leetcode.com/problems/modify-graph-edge-weights/): Assign weights to unknown edges.
    *   *Why this is useful:* Combine Dijkstra with binary search / parameterization.

---

## 8. Frequently Asked Questions

**Q1: Why doesn't Dijkstra work with negative edge weights?**
A: Dijkstra relies on the greedy theorem — once a vertex is extracted from the PQ, its distance is final. With negative edges, a later vertex could relax back to an already-settled vertex via a negative edge, invalidating the settled distance. Bellman-Ford handles negatives by allowing $V-1$ relaxation passes; Dijkstra settles each vertex exactly once.

**Q2: What's the difference between Dijkstra and A\*?**
A: A* adds an admissible heuristic $h(v)$ estimating remaining distance to the target. A* expands nodes in order of $d[v] + h(v)$ instead of $d[v]$ alone. With $h=0$, A* degenerates exactly to Dijkstra. With a good heuristic (e.g., Euclidean distance for GPS), A* explores far fewer nodes — often 10–100× faster in practice.

**Q3: How do I reconstruct the actual path, not just distances?**
A: Maintain a `pred[v]` (predecessor) array, updated whenever a relaxation succeeds (`pred[v] = u`). After Dijkstra finishes, walk backwards from the target: `path = [t]; while pred[path[-1]] != -1: path.append(pred[path[-1]]); path.reverse()`.

**Q4: When should I use Bellman-Ford or Floyd-Warshall instead?**
A: Use **Bellman-Ford** ($O(VE)$) when the graph has negative edges or you need to detect negative cycles. Use **Floyd-Warshall** ($O(V^3)$) when you need *all-pairs* shortest paths and $V$ is small (typically $V \le 500$). Dijkstra is the default for single-source, non-negative-weight graphs.

**Q5: Is Dijkstra guaranteed to find the shortest path even if multiple shortest paths exist?**
A: Yes — Dijkstra always finds the correct shortest *distance*. If multiple equal-length paths exist, the specific path returned depends on tie-breaking in the priority queue. To enumerate *all* shortest paths, augment the relaxation step: when `dist[u] + w == dist[v]`, append $u$ to a `predecessors[v]` list instead of overwriting it.
