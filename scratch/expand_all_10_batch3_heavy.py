import json
import re

additions_batch3 = {
    21: r"""

---

## 7. Bidirectional Dijkstra Algorithm

In large-scale graph networks (such as road maps with millions of intersections), running standard Dijkstra from source $s$ expands an exploratory search circle of area $\pi r^2$, where $r = \delta(s, t)$.

**Bidirectional Dijkstra** runs two simultaneous searches:
1. **Forward Search**: Explores from source $s$ in graph $G$.
2. **Reverse Search**: Explores from target $t$ in reversed graph $G^R$.

When the search frontiers intersect at some node $u$, the algorithm terminates. The area expanded is reduced to two smaller circles of radius $r/2$:

$$\text{Search Area} = \pi \left(\frac{r}{2}\right)^2 + \pi \left(\frac{r}{2}\right)^2 = \frac{1}{2} \pi r^2$$

This yields a **$50\%$ reduction in explored node states**, accelerating shortest path queries across continental road networks.

---

## 8. Contraction Hierarchies (CH) for Real-Time GPS Navigation

Modern navigation platforms (such as Google Maps and OpenStreetMap) process shortest path requests across graphs with 50,000,000+ vertices in under **1 millisecond**.

**Contraction Hierarchies** preprocess graph $G$ off-line:
1. Vertices are ordered by importance metric (degree, shortcut count).
2. Vertices are iteratively "contracted" (removed). When vertex $v$ is removed, shortcut edges $(u, w)$ with weight $w(u, v) + w(v, w)$ are inserted between its neighbors if $v$ was on the unique shortest path between $u$ and $w$.
3. During online queries, a modified Bidirectional Dijkstra explores only **upward edges** (from lower importance nodes to higher importance nodes), reducing search space from $50,000,000$ nodes to under $500$ nodes per query.
""",
    22: r"""

---

## 6. Digit Dynamic Programming Paradigm

**Digit DP** solves counting problems of the form: "Find the number of integers $X$ in range $[L, R]$ satisfying property $P(X)$" (e.g. numbers whose digits sum to a prime number or numbers without consecutive 1s).

### State Representation
Let `dp[pos][tight][state]` represent:
- `pos`: Current digit index being processed from most significant to least significant.
- `tight`: Boolean flag indicating whether current prefix matches prefix of upper bound $R$.
- `state`: Accumulated problem-specific metrics (e.g. current digit sum or last digit).

```python
def count_valid_numbers(N_str: str) -> int:
    memo = {}

    def dp(pos: int, tight: bool, digit_sum: int) -> int:
        if pos == len(N_str):
            return 1 if is_prime(digit_sum) else 0

        state = (pos, tight, digit_sum)
        if state in memo:
            return memo[state]

        limit = int(N_str[pos]) if tight else 9
        ans = 0

        for d in range(limit + 1):
            next_tight = tight and (d == limit)
            ans += dp(pos + 1, next_tight, digit_sum + d)

        memo[state] = ans
        return ans

    return dp(0, True, 0)
```

---

## 7. Sum Over Subsets (SOS) Bitmask Dynamic Programming

In bitmask DP over subset states, iterating over all submasks of all masks takes $O(3^N)$ time:

```cpp
// O(3^N) Naive Submask Iteration
for (int mask = 0; mask < (1 << N); ++mask) {
    for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
        // Process submask
    }
}
```

**SOS DP (Sum Over Subsets)** computes $F[\text{mask}] = \sum_{\text{sub} \subseteq \text{mask}} A[\text{sub}]$ in optimal $O(N \cdot 2^N)$ time using dynamic programming over bit positions:

$$\text{DP}[i][\text{mask}] = \begin{cases} \text{DP}[i-1][\text{mask}] & \text{if } i\text{-th bit of mask is 0} \\ \text{DP}[i-1][\text{mask}] + \text{DP}[i-1][\text{mask} \setminus \{i\}] & \text{if } i\text{-th bit of mask is 1} \end{cases}$$
""",
    23: r"""

---

## 6. Job Sequencing with Deadlines & Disjoint Set Optimization

Given $N$ jobs where each job $i$ takes unit time, has deadline $d_i$, and yields profit $p_i$, find a schedule maximizing total profit.

### Naive Greedy Choice ($O(N^2)$)
1. Sort jobs by profit $p_i$ in descending order.
2. For each job, schedule it in the latest available time slot $t \le d_i$.

### DSU Optimized Selection ($O(N \log N)$)
Use Disjoint Set Union (DSU) to find the latest available time slot in $O(\alpha(N))$ time:
- Maintain DSU array `parent[t]` representing the latest free slot $\le t$.
- Initially `parent[t] = t`.
- When slot $t$ is occupied, `union(t, t - 1)`.

```cpp
int scheduleJobs(std::vector<Job>& jobs, int maxDeadline) {
    std::sort(jobs.begin(), jobs.end(), [](const Job& a, const Job& b) {
        return a.profit > b.profit;
    });

    DSU dsu(maxDeadline);
    int totalProfit = 0;

    for (const auto& job : jobs) {
        int availableSlot = dsu.find(std::min(maxDeadline, job.deadline));
        if (availableSlot > 0) {
            totalProfit += job.profit;
            dsu.unite(availableSlot, availableSlot - 1);
        }
    }

    return totalProfit;
}
```

---

## 7. Reorganize String Greedy Frequency Matching

Given string $S$, rearrange characters such that no two adjacent characters are identical:
- **Greedy Choice**: Always pick the most frequent character remaining that is different from the last placed character using a Max-Heap.
- If the most frequent character frequency $f_{\max} > \lceil |S| / 2 \rceil$, no valid rearrangement exists.
""",
    24: r"""

---

## 5. Branch-and-Bound for 0/1 Knapsack Optimization

While standard backtracking explores all valid item subsets ($O(2^N)$), **Branch-and-Bound** uses Linear Programming relaxations to calculate upper bounds for partial states.

### Fractional Knapsack Bounding Function
At node $\mathbf{X}_d$ with current weight $W_{curr}$ and current value $V_{curr}$, calculate maximum achievable value $U(\mathbf{X}_d)$ by greedily filling remaining capacity $W - W_{curr}$ using fractional items.

If upper bound $U(\mathbf{X}_d) \le \text{BestValueFound}$, prune the entire subtree immediately.

```cpp
struct Node {
    int level;
    int profit;
    int weight;
    double bound;
};

double calculateBound(Node u, int n, int W, const std::vector<Item>& items) {
    if (u.weight >= W) return 0;
    double profit_bound = u.profit;
    int j = u.level + 1;
    int totweight = u.weight;

    while (j < n && totweight + items[j].weight <= W) {
        totweight += items[j].weight;
        profit_bound += items[j].value;
        j++;
    }

    if (j < n) {
        profit_bound += (W - totweight) * ((double)items[j].value / items[j].weight);
    }

    return profit_bound;
}
```

---

## 6. Crossword & Word Search II via Trie-Integrated Backtracking

Searching for $K$ words of length $L$ on an $M \times N$ grid using naive DFS takes $O(K \cdot M \cdot N \cdot 4^L)$ time.

**Trie-Integrated Backtracking** inserts all $K$ words into a Trie prefix tree:
1. Start DFS from every cell $(r, c)$ on the grid.
2. Advance DFS steps down the grid and Trie simultaneously.
3. If current grid path character sequence is not in Trie children, prune search immediately.
4. Decreases search runtime to $O(M \cdot N \cdot 4^L)$ independent of word count $K$.
""",
    25: r"""

---

## 5. Median of Two Sorted Arrays ($O(\log(\min(M, N)))$)

Given two sorted arrays $A$ of size $M$ and $B$ of size $N$, find the median of the combined sorted sequence in $O(\log(\min(M, N)))$ time.

### Partitioning Invariant
Partition array $A$ at index $i$ and array $B$ at index $j = \frac{M + N + 1}{2} - i$ such that:

$$A[i-1] \le B[j] \quad \text{and} \quad B[j-1] \le A[i]$$

Binary search over partition index $i \in [0, M]$:
- If $A[i-1] > B[j]$, move partition left ($R = i - 1$).
- If $B[j-1] > A[i]$, move partition right ($L = i + 1$).

Once valid partition is found:

$$\text{Median} = \begin{cases} \max(A[i-1], B[j-1]) & \text{if } M+N \text{ is odd} \\ \frac{\max(A[i-1], B[j-1]) + \min(A[i], B[j])}{2.0} & \text{if } M+N \text{ is even} \end{cases}$$

---

## 6. Interpolation Search for Uniformly Distributed Data

When searching sorted arrays with uniformly distributed numerical keys, **Interpolation Search** estimates target position using linear interpolation:

$$\text{mid} = L + \left\lfloor \frac{X - A[L]}{A[R] - A[L]} \times (R - L) \right\rfloor$$

- **Average Time Complexity**: $O(\log \log N)$
- **Worst-Case Time Complexity**: $O(N)$ for exponentially skewed data distributions.
""",
    26: r"""

---

## 5. External Sorting & Multi-Way Merge for Terabyte-Scale Datasets

When dataset size exceeds physical RAM capacity ($N \gg \text{RAM}$), in-memory sorting algorithms fail. **External Sorting** operates in two phases:

### Phase 1: Run Generation
1. Read RAM-sized chunks of data ($B$ bytes) from disk into main memory.
2. Sort chunk in-memory using QuickSort.
3. Write sorted chunk (run) back to temporary disk file.

### Phase 2: $K$-Way Merge
1. Open $K$ sorted run files simultaneously.
2. Load first page of each run file into RAM buffer.
3. Maintain a Min-Heap of size $K$ containing the smallest unwritten element from each buffer.
4. Extract minimum element, write to output stream, and replenish buffer from respective run file.

**I/O Complexity**: $O\left( \frac{N}{B} \log_{K} \frac{N}{B} \right)$ disk block transfers.

---

## 6. Timsort Hybrid Architecture & Stack Invariants

**Timsort** (default sorting algorithm in Python, Java, and Android) combines InsertionSort and MergeSort:
1. Scans data to identify natural monotone runs (ascending or strictly descending sequences).
2. Small runs are extended to length `minrun` (typically 32 to 64) using InsertionSort.
3. Runs are pushed onto a execution stack. To maintain balanced merging, Timsort enforces two stack invariants for run lengths $A, B, C$ (top to bottom):
   - $A > B + C$
   - $B > C$
4. If invariants are violated, adjacent runs are merged using galloping mode.
""",
    27: r"""

---

## 5. Heavy-Light Decomposition (HLD) for Path Queries on Trees

**Heavy-Light Decomposition** partitions tree edges into **Heavy edges** and **Light edges**:
- For node $u$, edge $(u, v)$ is **Heavy** if subtree size $\text{size}(v) > \frac{1}{2} \text{size}(u)$.
- Otherwise, edge $(u, v)$ is **Light**.

### Key Structural Properties
1. Every node has at most **1 Heavy child edge**.
2. Any simple path from root to node $u$ traverses at most $O(\log N)$ Light edges.
3. Heavy edges form contiguous **Heavy Chains**.

### Path Query Processing
By mapping Heavy Chains onto a contiguous 1D Segment Tree via DFS order, path queries (e.g. max node value between $u$ and $v$) execute in $O(\log^2 N)$ time.

```cpp
void hld(int u, int p, int head, const std::vector<int>& heavy_child) {
    chain_head[u] = head;
    pos[u] = ++current_pos;

    if (heavy_child[u] != -1) {
        hld(heavy_child[u], u, head, heavy_child);
    }

    for (int v : adj[u]) {
        if (v != p && v != heavy_child[u]) {
            hld(v, u, v, heavy_child);
        }
    }
}
```

---

## 6. Centroid Decomposition for Tree Distance Queries

A **Centroid** of a tree with $N$ nodes is a vertex whose removal splits the tree into connected components, each having size at most $\lfloor N / 2 \rfloor$.

Centroid Decomposition recursively finds tree centroids, building a **Centroid Tree** of height $O(\log N)$. It solves path counting problems (e.g. count paths of length $K$) in $O(N \log N)$ time.
""",
    28: r"""

---

## 5. Borůvka's Algorithm for Parallel Minimum Spanning Trees

**Borůvka's Algorithm** (1926) is the oldest MST algorithm and excels in parallel computing:

1. Initialize each vertex as an independent component.
2. In each phase, every component concurrently finds its cheapest outbound edge.
3. Add all chosen edges to the MST and contract components.
4. Repeat until a single connected component remains.

**Time Complexity**: $O(E \log V)$ sequential, $O(\log V)$ parallel steps on $E$ processors.

---

## 6. Persistent / Rollback Disjoint Set Union

In dynamic graph offline queries or backtracking algorithms, DSU states must be restored to previous versions.

### Rollback DSU Mechanics
- **Path Compression Disabled**: Path compression mutates parent pointers unpredictably, preventing easy undo operations. Use **Union by Size/Rank ONLY**.
- Maintain a transaction log stack storing updated `(node, old_parent, old_rank)` tuples.
- `rollback()` pops the stack to undo the last `union` operation in $O(1)$ time.

```cpp
struct DSU_Rollback {
    std::vector<int> parent, size;
    std::vector<std::pair<int, int>> history;

    DSU_Rollback(int n) : parent(n + 1), size(n + 1, 1) {
        for (int i = 1; i <= n; ++i) parent[i] = i;
    }

    int find(int i) {
        while (i != parent[i]) i = parent[i];
        return i;
    }

    void unite(int u, int v) {
        int root_u = find(u), root_v = find(v);
        if (root_u == root_v) return;

        if (size[root_u] < size[root_v]) std::swap(root_u, root_v);

        history.push_back({root_v, parent[root_v]});
        parent[root_v] = root_u;
        size[root_u] += size[root_v];
    }

    void rollback() {
        if (history.empty()) return;
        auto [node, old_parent] = history.back();
        history.pop_back();
        size[parent[node]] -= size[node];
        parent[node] = old_parent;
    }
};
```
""",
    29: r"""

---

## 5. 2-Satisfiability (2-SAT) Reduction via Strongly Connected Components

The **2-SAT Problem** determines whether a boolean formula in Conjunctive Normal Form (CNF) with 2 literals per clause can be satisfied:

$$\Phi = (x_1 \lor \neg x_2) \land (\neg x_1 \lor x_3) \land (x_2 \lor x_3)$$

### Implication Graph Construction
Transform each clause $(A \lor B)$ into two logical implications: $(\neg A \implies B)$ and $(\neg B \implies A)$.

Construct a directed Implication Graph $G$ with $2N$ vertices representing variables $x_i$ and their negations $\neg x_i$.

### Satisfiability Theorem
Formula $\Phi$ is **satisfiable** if and only if for every variable $x_i$, $x_i$ and $\neg x_i$ belong to **different Strongly Connected Components (SCCs)**.

If $\text{SCC}(x_i) = \text{SCC}(\neg x_i)$, a logical contradiction exists ($x_i \implies \neg x_i$ and $\neg x_i \implies x_i$), making $\Phi$ unsatisfiable.

---

## 6. Biconnected Components (BCC) & Block-Cut Trees

In undirected graphs, a **Biconnected Component** is a maximal subgraph with no articulation points (remains connected after removing any single vertex).

**Block-Cut Tree** represents graph structure:
- Vertices represent Articulation Points (Cuts) and Biconnected Components (Blocks).
- Edges connect each Cut vertex to the Blocks it belongs to.
""",
    30: r"""

---

## 6. Aho-Corasick Automaton for Multi-Pattern Matching

Searching for $K$ patterns $P_1, P_2, \dots, P_K$ simultaneously in text $T$ (length $N$) using naive KMP takes $O(K \cdot N)$ time.

The **Aho-Corasick Automaton** combines Tries and BFS failure links to perform multi-pattern search in optimal $O(N + \sum |P_i|)$ time:

1. Build Trie of all patterns.
2. Compute **Failure Links** via BFS (similar to KMP prefix function $\pi$).
3. Compute **Dictionary Links** to output matching patterns at current node.
4. Process text $T$ in a single linear pass.

---

## 7. Manacher's Algorithm for Longest Palindromic Substring ($O(N)$ Time)

Finding the longest palindromic substring in text $T$ using expanded centers takes $O(N^2)$ time. **Manacher's Algorithm** achieves linear $O(N)$ time by maintaining palindrome boundaries:

1. Transform $S$ by inserting `#` between characters: `"aba"` $\to$ `"#a#b#a#"`.
2. Maintain rightmost palindrome center $C$ and right boundary $R$.
3. Use mirror index $i' = 2C - i$ to initialize palindrome radius $P[i]$:

$$P[i] = \begin{cases} \min(R - i, P[i']) & \text{if } i < R \\ 0 & \text{if } i \ge R \end{cases}$$

4. Expand palindrome around $i$ and update $C, R$ when $i + P[i] > R$.

```python
def manacher(s: str) -> str:
    T = '#'.join(f'^{s}$')
    n = len(T)
    P = [0] * n
    C = R = 0

    for i in range(1, n - 1):
        i_mirror = 2 * C - i
        if R > i:
            P[i] = min(R - i, P[i_mirror])

        while T[i + 1 + P[i]] == T[i - 1 - P[i]]:
            P[i] += 1

        if i + P[i] > R:
            C, R = i, i + P[i]

    max_len, center_idx = max((val, idx) for idx, val in enumerate(P))
    start = (center_idx - max_len) // 2
    return s[start: start + max_len]
```
"""
}

# Apply additions_batch3 to scratch/build_full_batch3.py generated output
with open('scratch/ai_batch3_heavy.json', 'r', encoding='utf-8') as f:
    blogs_batch3 = json.load(f)

for idx_str, blog in blogs_batch3.items():
    slug = blog['slug']
    idx = int(slug_to_idx_map.get(slug, 0)) if 'slug_to_idx_map' in locals() else None

# Let's map slugs to batch3 additions
slug_additions = {
    "dijkstra": additions_batch3[21],
    "dynamic-programming": additions_batch3[22],
    "greedy": additions_batch3[23],
    "backtracking": additions_batch3[24],
    "searching": additions_batch3[25],
    "sorting": additions_batch3[26],
    "tree-traversal": additions_batch3[27],
    "mst-union-find": additions_batch3[28],
    "scc-bridges": additions_batch3[29],
    "string-algorithms": additions_batch3[30]
}

print("=== EXPANDING ALL BATCH 3 BLOGS TO >= 10,200 CHARACTERS ===")

for slug, blog in blogs_batch3.items():
    extra = slug_additions.get(slug, "")
    full_md = blog['markdown'] + extra
    length = len(full_md)
    assert length >= 10100, f"Blog '{slug}' is still too short ({length} chars)."
    blog['markdown'] = full_md
    print(f"Verified expanded '{slug}': {length:,} chars.")

output_json = 'scratch/ai_batch3_heavy_expanded.json'
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(blogs_batch3, f, indent=2)

print(f"\nSUCCESSFULLY SAVED ALL 10 EXPANDED BATCH 3 BLOGS IN {output_json}!")
