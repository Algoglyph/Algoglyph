// Catalog of algorithms shown in the visualizer sidebar. Metadata only — the
// step-by-step frames are produced by src/lib/algorithmFrames.ts, keyed by id.

export type AlgorithmCategory =
  | 'Sorting'
  | 'Searching'
  | 'Graph & Trees'
  | 'Pointers & Arrays'
  | 'Advanced';

export interface AlgorithmDef {
  id: string;
  name: string;
  category: AlgorithmCategory;
  blurb: string;
  /** Big-O shown as a small mono tag on the node header. */
  complexity: string;
}

export const ALGORITHMS: AlgorithmDef[] = [
  // ── Sorting ──────────────────────────────────────────────
  { id: 'bubble-sort', name: 'Bubble Sort', category: 'Sorting', blurb: 'Adjacent swaps bubble the max to the end.', complexity: 'O(n²)' },
  { id: 'merge-sort', name: 'Merge Sort', category: 'Sorting', blurb: 'Divide, then merge sorted halves.', complexity: 'O(n log n)' },
  { id: 'quick-sort', name: 'Quick Sort', category: 'Sorting', blurb: 'Partition around a pivot, recurse.', complexity: 'O(n log n)' },

  // ── Searching ────────────────────────────────────────────
  { id: 'binary-search', name: 'Binary Search', category: 'Searching', blurb: 'Halve the range until the target is found.', complexity: 'O(log n)' },

  // ── Graph & Trees ────────────────────────────────────────
  { id: 'bfs', name: 'BFS', category: 'Graph & Trees', blurb: 'Level-order traversal via a queue.', complexity: 'O(V + E)' },
  { id: 'dfs', name: 'DFS', category: 'Graph & Trees', blurb: 'Depth-first traversal via a stack.', complexity: 'O(V + E)' },
  { id: 'dijkstra', name: "Dijkstra's", category: 'Graph & Trees', blurb: 'Shortest paths from a source by relaxing edges.', complexity: 'O(E log V)' },
  { id: 'topological-sort', name: 'Topological Sort', category: 'Graph & Trees', blurb: "Kahn's algorithm orders a DAG by in-degree.", complexity: 'O(V + E)' },

  // ── Pointers & Arrays ────────────────────────────────────
  { id: 'two-pointers', name: 'Two Pointers', category: 'Pointers & Arrays', blurb: 'Converge inward to find a target pair.', complexity: 'O(n)' },
  { id: 'sliding-window', name: 'Sliding Window', category: 'Pointers & Arrays', blurb: 'Slide a fixed window to track the best sum.', complexity: 'O(n)' },

  // ── Advanced ─────────────────────────────────────────────
  { id: 'knapsack', name: '0/1 Knapsack', category: 'Advanced', blurb: 'Fill a DP table of items × capacity.', complexity: 'O(nW)' },
  { id: 'n-queens', name: 'N-Queens', category: 'Advanced', blurb: 'Backtrack placing non-attacking queens.', complexity: 'O(n!)' },
  { id: 'union-find', name: 'Union-Find', category: 'Advanced', blurb: 'Merge sets and compress the forest.', complexity: 'O(α(n))' },
];

export const ALGORITHM_CATEGORIES: AlgorithmCategory[] = [
  'Sorting',
  'Searching',
  'Graph & Trees',
  'Pointers & Arrays',
  'Advanced',
];

export const getAlgorithm = (id: string): AlgorithmDef | undefined =>
  ALGORITHMS.find((a) => a.id === id);
