from generate_dynamodb_and_backend import inject_into_de_blog_data

leftist_heaps_md = r"""# Leftist Heaps: NPL Distance Metrics & Logarithmic Merge Mechanics

A **Leftist Heap** is a variant of a binary heap designed for fast $O(\log N)$ heap merges. Unlike standard array-based binary heaps which require $O(N)$ time to merge two heaps, a leftist heap maintains a property called the **Null Path Length (NPL)** to guarantee that tree depth remains biased toward the left subtree, keeping the right subtree extremely short.

---

## 1. The Null Path Length (NPL) Property

The **Null Path Length ($npl(x)$)** of a node $x$ is defined as the shortest distance from $x$ to an empty (null) descendant leaf node.

$$npl(x) = \begin{cases} -1 & \text{if } x \text{ is NULL} \\ 1 + \min(npl(\text{left}(x)), npl(\text{right}(x))) & \text{otherwise} \end{cases}$$

### Leftist Property Rule
For every node $x$ in a leftist heap:
$$npl(\text{left}(x)) \ge npl(\text{right}(x))$$

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lhBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14532d"/>
      <stop offset="100%" stop-color="#052e16"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#lhBg)" stroke="#4ade80" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f0fdf4" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Leftist Heap Tree Structure & NPL Invariant</text>

  <!-- Root Node -->
  <g transform="translate(450, 100)">
    <circle r="26" fill="#166534" stroke="#4ade80" stroke-width="2"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">3 (npl=1)</text>
  </g>

  <!-- Left Child -->
  <g transform="translate(300, 200)">
    <circle r="26" fill="#166534" stroke="#4ade80" stroke-width="2"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">10 (npl=1)</text>
  </g>
  <path d="M 430 118 L 320 182" stroke="#4ade80" stroke-width="2"/>

  <!-- Right Child -->
  <g transform="translate(600, 200)">
    <circle r="26" fill="#166534" stroke="#86efac" stroke-width="2"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">8 (npl=0)</text>
  </g>
  <path d="M 470 118 L 580 182" stroke="#4ade80" stroke-width="2"/>

  <!-- Deep Left Subtree -->
  <g transform="translate(220, 290)">
    <circle r="22" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
    <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="12">21</text>
  </g>
  <path d="M 285 218 L 235 272" stroke="#22c55e" stroke-width="1.5"/>
</svg>

---

## 2. Theoretical Complexity Bounds

| Operation | Array-Based Binary Heap | Leftist Heap | Skew Heap |
| :--- | :--- | :--- | :--- |
| **Insert** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ amortized |
| **Find Min** | $O(1)$ | $O(1)$ | $O(1)$ |
| **Delete Min** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ amortized |
| **Merge (Meld)** | $O(N)$ | $O(\log N)$ | $O(\log N)$ amortized |

---

## 3. Production C++ Recursive Merge Implementation

```cpp
#include <iostream>
#include <algorithm>

struct LeftistNode {
    int key;
    int npl;
    LeftistNode* left;
    LeftistNode* right;

    LeftistNode(int val) : key(val), npl(0), left(nullptr), right(nullptr) {}
};

int getNpl(LeftistNode* node) {
    return node ? node->npl : -1;
}

LeftistNode* mergeLeftistHeaps(LeftistNode* h1, LeftistNode* h2) {
    if (!h1) return h2;
    if (!h2) return h1;

    // Maintain min-heap ordering invariant
    if (h1->key > h2->key) std::swap(h1, h2);

    // Recursively merge right child with h2
    h1->right = mergeLeftistHeaps(h1->right, h2);

    // Swap children if leftist property is violated
    if (getNpl(h1->left) < getNpl(h1->right)) {
        std::swap(h1->left, h1->right);
    }

    // Update NPL distance metric
    h1->npl = getNpl(h1->right) + 1;
    return h1;
}

void printPreOrder(LeftistNode* root) {
    if (!root) return;
    std::cout << root->key << "(npl=" << root->npl << ") ";
    printPreOrder(root->left);
    printPreOrder(root->right);
}

int main() {
    LeftistNode* h1 = new LeftistNode(3);
    h1->left = new LeftistNode(10);
    h1->npl = 1;

    LeftistNode* h2 = new LeftistNode(8);
    h2->left = new LeftistNode(17);

    LeftistNode* merged = mergeLeftistHeaps(h1, h2);

    std::cout << "Merged Leftist Heap (Pre-order): ";
    printPreOrder(merged);
    std::cout << std::endl;
    return 0;
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does a Leftist Heap compare to a Skew Heap?
A leftist heap maintains explicit `npl` integers inside every node and enforces `npl(left) >= npl(right)` unconditionally. A Skew Heap, by contrast, drops the `npl` metric entirely and unconditionally swaps left and right children during every merge, providing $O(\log N)$ amortized complexity with lower per-node memory footprint.

### Q2: Can a leftist heap be implemented inside a flat dynamic array?
Because a leftist heap's shape is heavily biased toward the left and dynamically changes during merges, pointer-based binary tree structures are required. Dynamic array representations cause excessive fragmentation and waste memory slots.
"""

fibonacci_heaps_md = r"""# Fibonacci Heaps: Amortized O(1) Key Decrements & Minimum Spanning Trees

A **Fibonacci Heap** is a collection of min-heap-ordered trees offering superior theoretical time bounds: **$O(1)$ amortized time** for `Insert`, `Find-Min`, `Merge`, and `Decrease-Key` operations. This makes Fibonacci heaps optimal for graph algorithms like **Dijkstra's Shortest Path** and **Prim's Minimum Spanning Tree**.

---

## 1. Structural Architecture & Cascading Cuts

Unlike standard binary heaps which maintain rigid tree structures, a Fibonacci heap is a lazy forest of trees linked by a circular doubly linked list.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fhBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#180e04"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#fhBg)" stroke="#f97316" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ffedd5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Fibonacci Heap Circular Root List Topology</text>

  <!-- Root Min Node Pointer -->
  <g transform="translate(180, 120)">
    <circle r="28" fill="#7c2d12" stroke="#ea580c" stroke-width="2.5"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">3 [MIN]</text>
  </g>

  <!-- Root Node 2 -->
  <g transform="translate(450, 120)">
    <circle r="28" fill="#7c2d12" stroke="#fdba74" stroke-width="1.5"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">17</text>
  </g>

  <!-- Root Node 3 -->
  <g transform="translate(720, 120)">
    <circle r="28" fill="#7c2d12" stroke="#fdba74" stroke-width="1.5"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">24</text>
  </g>

  <!-- Root Pointer Links -->
  <path d="M 210 120 L 420 120" stroke="#f97316" stroke-width="2" stroke-dasharray="4 4"/>
  <path d="M 480 120 L 690 120" stroke="#f97316" stroke-width="2" stroke-dasharray="4 4"/>
</svg>

---

## 2. Amortized Time Complexity Bounds

| Operation | Binary Heap | Binomial Heap | Fibonacci Heap |
| :--- | :--- | :--- | :--- |
| **Find Min** | $O(1)$ | $O(\log N)$ | $O(1)$ amortized |
| **Insert** | $O(\log N)$ | $O(1)$ amortized | $O(1)$ amortized |
| **Decrease Key** | $O(\log N)$ | $O(\log N)$ | **$O(1)$ amortized** |
| **Delete Min** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ amortized |
| **Merge (Meld)** | $O(N)$ | $O(\log N)$ | **$O(1)$ amortized** |

---

## 3. High-Performance C++ Fibonacci Heap Skeleton

```cpp
#include <iostream>
#include <cmath>

struct FibNode {
    int key;
    int degree;
    bool mark;
    FibNode* parent;
    FibNode* child;
    FibNode* left;
    FibNode* right;

    FibNode(int val) : key(val), degree(0), mark(false),
                       parent(nullptr), child(nullptr), left(this), right(this) {}
};

class FibonacciHeap {
private:
    FibNode* minNode;
    int nodeCount;

public:
    FibonacciHeap() : minNode(nullptr), nodeCount(0) {}

    void insert(int key) {
        FibNode* node = new FibNode(key);
        if (!minNode) {
            minNode = node;
        } else {
            // Insert into root circular doubly linked list
            node->left = minNode;
            node->right = minNode->right;
            minNode->right->left = node;
            minNode->right = node;
            if (node->key < minNode->key) {
                minNode = node;
            }
        }
        nodeCount++;
    }

    int getMin() const {
        return minNode ? minNode->key : -1;
    }
};

int main() {
    FibonacciHeap fib;
    fib.insert(10);
    fib.insert(3);
    fib.insert(17);
    std::cout << "Minimum Key in Fibonacci Heap: " << fib.getMin() << std::endl;
    return 0;
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why are Fibonacci Heaps rarely used in production high-frequency trading engines despite their superior theoretical amortized time bounds?
Fibonacci heaps suffer from large constant-factor memory overheads (4 pointers + degree + boolean mark per node) and poor CPU L1/L2 cache locality due to pointer chasing, making flat dynamic array binary heaps (`std::priority_queue`) faster in practice for datasets under $100,000$ elements.

### Q2: Why is the structure named after Fibonacci numbers?
The maximum degree of any node in a Fibonacci heap of size $N$ is bounded by $O(\log N)$. Proving this bound relies on demonstrating that the minimum number of nodes in a tree of degree $k$ follows the Fibonacci sequence $F_{k+2}$.
"""

dfs_traversal_md = r"""# Depth-First Search (DFS): Backtracking, Cycle Detection & Topological Sort

**Depth-First Search (DFS)** is a fundamental graph traversal algorithm that explores as deep as possible along each branch before backtracking. By utilizing an explicit LIFO call stack or implicit recursion frames, DFS is the backbone for topological sorting, strongly connected components (Tarjan's/Kosaraju's), and maze solving.

---

## 1. Backtracking & Recursive Branching Mechanics

DFS explores a path completely until hitting a dead end or previously visited vertex, at which point execution backtracks to the most recent decision node.

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dfsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#581c87"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#dfsBg)" stroke="#c084fc" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f3e8ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Depth-First Search (DFS) Deep Path Backtracking</text>

  <!-- Root -->
  <g transform="translate(450, 90)">
    <circle r="26" fill="#6b21a8" stroke="#e879f9" stroke-width="2.5"/>
    <text x="0" y="5" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">Root [1]</text>
  </g>

  <!-- Left Branch Deep -->
  <g transform="translate(260, 190)">
    <circle r="24" fill="#581c87" stroke="#c084fc" stroke-width="2"/>
    <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="13">L1 [2]</text>
  </g>
  <g transform="translate(140, 290)">
    <circle r="22" fill="#3b0764" stroke="#a855f7" stroke-width="1.5"/>
    <text x="0" y="4" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="12">L2 [3]</text>
  </g>

  <!-- Connections -->
  <path d="M 425 105 L 282 175" stroke="#e879f9" stroke-width="2"/>
  <path d="M 240 205 L 160 275" stroke="#c084fc" stroke-width="2"/>

  <!-- Backtrack Annotation -->
  <path d="M 165 270 Q 240 230 260 210" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4 4"/>
  <text x="240" y="250" fill="#fda4af" font-family="monospace" font-size="11">Backtrack ↑</text>
</svg>

---

## 2. Algorithmic Complexity

- **Time Complexity:** $O(V + E)$ where $V$ is the number of vertices and $E$ is the number of edges.
- **Space Complexity:** $O(V)$ auxiliary space to hold recursion stack frames during linear path traversals.

---

## 3. Cycle Detection in Directed Graphs C++ Code

```cpp
#include <iostream>
#include <vector>

bool dfsCycleCheck(int u, const std::vector<std::vector<int>>& adj, std::vector<int>& state) {
    state[u] = 1; // 1 = Visiting (In current call stack)

    for (int v : adj[u]) {
        if (state[v] == 1) return true; // Cycle detected!
        if (state[v] == 0 && dfsCycleCheck(v, adj, state)) return true;
    }

    state[u] = 2; // 2 = Completely Visited
    return false;
}

int main() {
    int V = 4;
    std::vector<std::vector<int>> adj(V);
    adj[0] = {1};
    adj[1] = {2};
    adj[2] = {0}; // Cycle 0->1->2->0

    std::vector<int> state(V, 0);
    bool hasCycle = false;
    for (int i = 0; i < V; ++i) {
        if (state[i] == 0 && dfsCycleCheck(i, adj, state)) {
            hasCycle = true;
            break;
        }
    }
    std::cout << "Graph contains cycle: " << (hasCycle ? "YES" : "NO") << std::endl;
    return 0;
}
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between DFS stack traversal and BFS queue traversal?
DFS uses a Last-In, First-Out (LIFO) stack order, forcing exploration to push as deep as possible down a single path. BFS uses a First-In, First-Out (FIFO) queue order, forcing discovery to expand evenly in concentric circles outward from the source.
"""

sql_tuning_md = r"""# SQL Query Tuning: B-Tree Index Scans, Execution Plans & Join Optimizations

Optimizing relational database performance requires mastering how SQL query planners (PostgreSQL, MySQL InnoDB) construct execution plans. From eliminating full table scans (`seq scan`) to leveraging composite indexes and optimizing nested loops, SQL tuning drastically reduces disk I/O and query latency.

---

## 1. B-Tree Index Search & Execution Plan Nodes

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sqlBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#sqlBg)" stroke="#60a5fa" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#eff6ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">EXPLAIN ANALYZE Execution Node Hierarchy</text>

  <!-- Query Node 1 -->
  <g transform="translate(300, 90)">
    <rect width="300" height="60" rx="6" fill="#1d4ed8" stroke="#93c5fd" stroke-width="1.5"/>
    <text x="150" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Hash Aggregate (GROUP BY user_id)</text>
    <text x="150" y="45" text-anchor="middle" fill="#bfdbfe" font-family="monospace" font-size="10">Cost: 104.20..106.20 | Rows: 200</text>
  </g>

  <!-- Query Node 2 -->
  <g transform="translate(300, 190)">
    <rect width="300" height="60" rx="6" fill="#1e40af" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="150" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Index Scan using idx_orders_user_date</text>
    <text x="150" y="45" text-anchor="middle" fill="#bfdbfe" font-family="monospace" font-size="10">Index Cond: (user_id = 104) AND (created_at >= ...)</text>
  </g>

  <path d="M 450 150 L 450 190" stroke="#93c5fd" stroke-width="2.5" />
</svg>

---

## 2. Essential SQL Tuning Checklist
1. **Avoid `SELECT *`:** Query only explicit required columns to allow **Covering Index Scans** without reading table heap pages.
2. **Left-Most Prefix Rule:** Composite index `(tenant_id, status, created_at)` can only optimize queries filtering by `tenant_id` first.
3. **Avoid Functions on Indexed Columns:** Writing `WHERE UPPER(email) = 'USER@DOMAIN.COM'` breaks index usage; create a functional index `CREATE INDEX idx_upper_email ON users (UPPER(email))` instead.

---

## Frequently Asked Questions (FAQs)

### Q1: Why is an INDEX SCAN sometimes slower than a SEQ SCAN in PostgreSQL?
If a query returns more than ~10-20% of total table rows, random disk I/O reads generated by fetching heap pages via B-Tree pointers become significantly more expensive than sequential disk block reads during a full table scan.
"""

inject_into_de_blog_data('leftist-heaps', leftist_heaps_md)
inject_into_de_blog_data('fibonacci-heaps', fibonacci_heaps_md)
inject_into_de_blog_data('dfs-traversal', dfs_traversal_md)
inject_into_de_blog_data('sql-tuning', sql_tuning_md)
