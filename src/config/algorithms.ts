// Catalog of algorithms shown in the visualizer sidebar. Metadata only — the
// step-by-step frames are produced by src/lib/algorithmFrames.ts, keyed by id.

export type AlgorithmCategory =
  | 'Searching'
  | 'Sorting'
  | 'Pointers & Sliding Window'
  | 'Recursion & Backtracking'
  | 'Tree Traversals'
  | 'Graph Algorithms'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'String Algorithms'
  | 'Range Query & Trees'
  | 'Advanced CP';

export interface AlgorithmDef {
  id: string;
  name: string;
  category: AlgorithmCategory;
  blurb: string;
  /** Big-O shown as a small mono tag on the node header. */
  complexity: string;
}

export const ALGORITHMS: AlgorithmDef[] = [
  // ── Searching ────────────────────────────────────────────
  { id: 'linear-search', name: 'Linear Search', category: 'Searching', blurb: 'Scan each element sequentially.', complexity: 'O(n)' },
  { id: 'binary-search', name: 'Binary Search', category: 'Searching', blurb: 'Halve the range of a sorted array.', complexity: 'O(log n)' },
  { id: 'ternary-search', name: 'Ternary Search', category: 'Searching', blurb: 'Divide search space into three parts for unimodal functions.', complexity: 'O(log₃ n)' },
  { id: 'lower-bound', name: 'Lower Bound', category: 'Searching', blurb: 'Find first element >= target in a sorted range.', complexity: 'O(log n)' },
  { id: 'upper-bound', name: 'Upper Bound', category: 'Searching', blurb: 'Find first element > target in a sorted range.', complexity: 'O(log n)' },

  // ── Sorting ──────────────────────────────────────────────
  { id: 'bubble-sort', name: 'Bubble Sort', category: 'Sorting', blurb: 'Adjacent swaps bubble the max to the end.', complexity: 'O(n²)' },
  { id: 'selection-sort', name: 'Selection Sort', category: 'Sorting', blurb: 'Repeatedly select the minimum element and swap to start.', complexity: 'O(n²)' },
  { id: 'insertion-sort', name: 'Insertion Sort', category: 'Sorting', blurb: 'Insert elements sequentially into their sorted place.', complexity: 'O(n²)' },
  { id: 'merge-sort', name: 'Merge Sort', category: 'Sorting', blurb: 'Divide, then merge sorted halves.', complexity: 'O(n log n)' },
  { id: 'quick-sort', name: 'Quick Sort', category: 'Sorting', blurb: 'Partition around a pivot, recurse.', complexity: 'O(n log n)' },
  { id: 'heap-sort', name: 'Heap Sort', category: 'Sorting', blurb: 'Build a binary heap and extract root elements.', complexity: 'O(n log n)' },
  { id: 'counting-sort', name: 'Counting Sort', category: 'Sorting', blurb: 'Sorts keys using key counts in a fixed range.', complexity: 'O(n + k)' },
  { id: 'radix-sort', name: 'Radix Sort', category: 'Sorting', blurb: 'Sort integers digit by digit using stable sorting.', complexity: 'O(nk)' },

  // ── Pointers & Sliding Window ───────────────────────────
  { id: 'two-pointers', name: 'Two Pointers', category: 'Pointers & Sliding Window', blurb: 'Converge inward or move parallel to find target pair.', complexity: 'O(n)' },
  { id: 'fast-slow-pointer', name: 'Fast & Slow Pointer', category: 'Pointers & Sliding Window', blurb: "Floyd's cycle detection using two pointer speeds.", complexity: 'O(n)' },
  { id: 'sliding-window', name: 'Sliding Window', category: 'Pointers & Sliding Window', blurb: 'Slide a window to maintain subset invariants.', complexity: 'O(n)' },

  // ── Recursion & Backtracking ────────────────────────────
  { id: 'recursion', name: 'Recursion', category: 'Recursion & Backtracking', blurb: 'Trace factorial calls and returns through the call stack.', complexity: 'O(n)' },
  { id: 'recursion-tree', name: 'Recursion Tree', category: 'Recursion & Backtracking', blurb: 'Visualize call hierarchy and stack branching.', complexity: 'O(bᵈ)' },
  { id: 'backtracking', name: 'Backtracking', category: 'Recursion & Backtracking', blurb: 'Recursively search and discard paths that violate constraints.', complexity: 'O(n!)' },
  { id: 'subsets', name: 'Subsets', category: 'Recursion & Backtracking', blurb: 'Generate the power set of a set.', complexity: 'O(2ⁿ)' },
  { id: 'permutations', name: 'Permutations', category: 'Recursion & Backtracking', blurb: 'Generate all distinct orderings of a sequence.', complexity: 'O(n!)' },
  { id: 'combination-sum', name: 'Combination Sum', category: 'Recursion & Backtracking', blurb: 'Find combinations that sum to target.', complexity: 'O(2ⁿ)' },
  { id: 'n-queens', name: 'N-Queens', category: 'Recursion & Backtracking', blurb: 'Backtrack placing non-attacking queens on a chessboard.', complexity: 'O(n!)' },

  // ── Tree Traversals ──────────────────────────────────────
  { id: 'dfs-tree', name: 'DFS Tree', category: 'Tree Traversals', blurb: 'Recursive depth-first traversal of a tree structure.', complexity: 'O(V)' },
  { id: 'bfs-tree', name: 'BFS Tree', category: 'Tree Traversals', blurb: 'Level-order traversal of a tree using a queue.', complexity: 'O(V)' },
  { id: 'preorder', name: 'Preorder Traversal', category: 'Tree Traversals', blurb: 'Preorder tree traversal (Root, Left, Right).', complexity: 'O(V)' },
  { id: 'inorder', name: 'Inorder Traversal', category: 'Tree Traversals', blurb: 'Inorder tree traversal (Left, Root, Right).', complexity: 'O(V)' },
  { id: 'postorder', name: 'Postorder Traversal', category: 'Tree Traversals', blurb: 'Postorder tree traversal (Left, Right, Root).', complexity: 'O(V)' },
  { id: 'level-order', name: 'Level Order Traversal', category: 'Tree Traversals', blurb: 'Traverse tree nodes level by level.', complexity: 'O(V)' },
  { id: 'morris-traversal', name: 'Morris Traversal', category: 'Tree Traversals', blurb: 'Inorder traversal without stack/recursion using threading.', complexity: 'O(V)' },

  // ── Graph Algorithms ────────────────────────────────────
  { id: 'bfs-graph', name: 'BFS Graph', category: 'Graph Algorithms', blurb: 'Level-order graph traversal using a queue.', complexity: 'O(V + E)' },
  { id: 'dfs-graph', name: 'DFS Graph', category: 'Graph Algorithms', blurb: 'Depth-first graph traversal using a stack/recursion.', complexity: 'O(V + E)' },
  { id: 'topological-sort', name: 'Topological Sort', category: 'Graph Algorithms', blurb: "Kahn's algorithm orders DAG nodes by dependency.", complexity: 'O(V + E)' },
  { id: 'dijkstra', name: "Dijkstra's Shortest Path", category: 'Graph Algorithms', blurb: 'Single-source shortest path using a priority queue.', complexity: 'O(E log V)' },
  { id: 'bellman-ford', name: 'Bellman Ford', category: 'Graph Algorithms', blurb: 'Shortest paths with negative weights and cycle checks.', complexity: 'O(VE)' },
  { id: 'floyd-warshall', name: 'Floyd Warshall', category: 'Graph Algorithms', blurb: 'All-pairs shortest paths using DP dynamic programming.', complexity: 'O(V³)' },
  { id: 'kruskal', name: 'Kruskal MST', category: 'Graph Algorithms', blurb: 'Find Minimum Spanning Tree using sorted edges and DSU.', complexity: 'O(E log E)' },
  { id: 'prim', name: 'Prim MST', category: 'Graph Algorithms', blurb: 'Find Minimum Spanning Tree by growing connected tree.', complexity: 'O(E log V)' },
  { id: 'kosaraju', name: 'Kosaraju SCC', category: 'Graph Algorithms', blurb: 'Identify strongly connected components with 2 DFS passes.', complexity: 'O(V + E)' },
  { id: 'tarjan', name: 'Tarjan SCC', category: 'Graph Algorithms', blurb: 'Find SCCs using low-link values and a single DFS.', complexity: 'O(V + E)' },
  { id: 'bridges', name: 'Bridges & Articulation Points', category: 'Graph Algorithms', blurb: 'Identify critical edges and vertices in a graph.', complexity: 'O(V + E)' },
  { id: 'union-find', name: 'Union Find / DSU', category: 'Graph Algorithms', blurb: 'Merge disjoint sets and check connectivity in near-constant time.', complexity: 'O(α(n))' },

  // ── Dynamic Programming ──────────────────────────────────
  { id: '1d-dp', name: '1D DP', category: 'Dynamic Programming', blurb: 'Subproblem mapping along a linear array.', complexity: 'O(n)' },
  { id: '2d-dp', name: '2D DP', category: 'Dynamic Programming', blurb: 'Solve subproblems using a 2D cache grid.', complexity: 'O(nm)' },
  { id: 'knapsack', name: '0/1 Knapsack', category: 'Dynamic Programming', blurb: 'Maximize values in a weight limit table.', complexity: 'O(nW)' },
  { id: 'lis', name: 'LIS (Longest Increasing Subsequence)', category: 'Dynamic Programming', blurb: 'Compute LIS using dynamic programming and binary search.', complexity: 'O(n log n)' },
  { id: 'lcs', name: 'LCS (Longest Common Subsequence)', category: 'Dynamic Programming', blurb: 'Compute LCS of two strings using a grid.', complexity: 'O(nm)' },
  { id: 'dp-on-trees', name: 'DP on Trees', category: 'Dynamic Programming', blurb: 'DP subproblems structured along tree paths.', complexity: 'O(V)' },
  { id: 'digit-dp', name: 'Digit DP', category: 'Dynamic Programming', blurb: 'Count integers matching rules up to N using digit states.', complexity: 'O(log N * base)' },
  { id: 'bitmask-dp', name: 'Bitmask DP', category: 'Dynamic Programming', blurb: 'DP state tracking using integer bits to represent sets.', complexity: 'O(n² 2ⁿ)' },

  // ── Greedy ───────────────────────────────────────────────
  { id: 'activity-selection', name: 'Activity Selection', category: 'Greedy', blurb: 'Select max non-overlapping activities sorted by end time.', complexity: 'O(n log n)' },
  { id: 'interval-scheduling', name: 'Interval Scheduling', category: 'Greedy', blurb: 'Minimize resources needed to schedule active intervals.', complexity: 'O(n log n)' },
  { id: 'huffman-coding', name: 'Huffman Coding', category: 'Greedy', blurb: 'Build prefix codes via frequency-based merge tree.', complexity: 'O(n log n)' },

  // ── String Algorithms ────────────────────────────────────
  { id: 'kmp', name: 'KMP (Knuth-Morris-Pratt)', category: 'String Algorithms', blurb: 'Pattern search matching using prefix lookup table.', complexity: 'O(n + m)' },
  { id: 'rabin-karp', name: 'Rabin Karp', category: 'String Algorithms', blurb: 'Rolling hash-based pattern matching.', complexity: 'O(n + m)' },
  { id: 'z-algorithm', name: 'Z Algorithm', category: 'String Algorithms', blurb: 'Match substrings via computed Z-array prefix lengths.', complexity: 'O(n + m)' },
  { id: 'manacher', name: 'Manacher\'s Algorithm', category: 'String Algorithms', blurb: 'Find longest palindromic substring in linear time.', complexity: 'O(n)' },

  // ── Range Query & Trees ──────────────────────────────────
  { id: 'segment-tree-algo', name: 'Segment Tree', category: 'Range Query & Trees', blurb: 'Interval-based segment node updates and range queries.', complexity: 'O(log n)' },
  { id: 'lazy-propagation', name: 'Lazy Propagation', category: 'Range Query & Trees', blurb: 'Defer node updates in range queries for O(log n) batch ops.', complexity: 'O(log n)' },
  { id: 'fenwick-tree-algo', name: 'Fenwick Tree (BIT)', category: 'Range Query & Trees', blurb: 'Binary Indexed Tree for prefix sums and updates.', complexity: 'O(log n)' },
  { id: 'sparse-table-algo', name: 'Sparse Table', category: 'Range Query & Trees', blurb: 'Preprocessing for static range queries in O(1).', complexity: 'O(1)' },

  // ── Advanced CP ──────────────────────────────────────────
  { id: 'binary-lifting', name: 'Binary Lifting', category: 'Advanced CP', blurb: 'Tree ancestor jumps in O(log n) using binary powers.', complexity: 'O(log n)' },
  { id: 'euler-tour', name: 'Euler Tour', category: 'Advanced CP', blurb: 'Flatten a tree traversal route into array bounds.', complexity: 'O(V)' },
  { id: 'mos-algorithm', name: 'Mo\'s Algorithm', category: 'Advanced CP', blurb: 'Offline block-based range query sorting.', complexity: 'O((n+q)√n)' },
  { id: 'sweep-line', name: 'Sweep Line', category: 'Advanced CP', blurb: 'Track state changes along a sweeping coordinates line.', complexity: 'O(n log n)' },
  { id: 'coordinate-compression', name: 'Coordinate Compression', category: 'Advanced CP', blurb: 'Map large sparse values onto dense ranked indices.', complexity: 'O(n log n)' },
];

export const ALGORITHM_CATEGORIES: AlgorithmCategory[] = [
  'Searching',
  'Sorting',
  'Pointers & Sliding Window',
  'Recursion & Backtracking',
  'Tree Traversals',
  'Graph Algorithms',
  'Dynamic Programming',
  'Greedy',
  'String Algorithms',
  'Range Query & Trees',
  'Advanced CP',
];

export const getAlgorithm = (id: string): AlgorithmDef | undefined =>
  ALGORITHMS.find((a) => a.id === id);
