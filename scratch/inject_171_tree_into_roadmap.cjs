const fs = require('fs');

const roadmapPath = './src/config/roadmapData.ts';
let roadmapContent = fs.readFileSync(roadmapPath, 'utf8');

// The clean 171 subtopics tree
const newTopics = [
  {
    id: 'basics-memory',
    name: 'Language Basics & Memory',
    description: 'Variables, allocations, stack, and heap mechanics.',
    concepts: [
      {
        id: 'intro-dsa',
        name: 'Introduction to DSA',
        subtopics: [
          { id: 'what-is-dsa', name: 'What are Data Structures?', blogSlug: 'what-is-dsa' },
          { id: 'importance-dsa', name: 'Why are Data Structures Important?', blogSlug: 'importance-dsa' }
        ]
      },
      {
        id: 'programming-basics',
        name: 'Programming Basics',
        subtopics: [
          { id: 'static-arrays', name: 'Static Arrays & Memory Layout', blogSlug: 'static-arrays' },
          { id: 'procedural-state-pipelines', name: 'Operators & Control Structures', blogSlug: 'procedural-state-pipelines' },
          { id: 'functions-basic-i-o', name: 'Functions & Basic I/O', blogSlug: 'functions-basic-i-o' }
        ]
      },
      {
        id: 'memory-allocation',
        name: 'Memory Allocation',
        subtopics: [
          { id: 'stack-allocation', name: 'Stack Allocation', blogSlug: 'stack-allocation' },
          { id: 'heap-allocation', name: 'Heap Allocation', blogSlug: 'heap-allocation' }
        ]
      }
    ]
  },
  {
    id: 'complexity-analysis',
    name: 'Complexity Analysis',
    description: 'Measuring algorithm performance metrics and scale limits.',
    concepts: [
      {
        id: 'complexity-basics',
        name: 'Complexity Basics',
        subtopics: [
          { id: 'time-vs-space', name: 'Time vs Space Complexity', blogSlug: 'time-vs-space' },
          { id: 'calculate-complexity', name: 'How to Calculate Complexity?', blogSlug: 'calculate-complexity' },
          { id: 'common-runtimes', name: 'Common Runtimes', blogSlug: 'common-runtimes' }
        ]
      },
      {
        id: 'asymptotic-notations',
        name: 'Asymptotic Notations',
        subtopics: [
          { id: 'searching-complexity', name: 'Big-O Notation & Search Analysis', blogSlug: 'searching' },
          { id: 'big-theta-notation', name: 'Big-Theta Notation', blogSlug: 'big-theta-notation' },
          { id: 'big-omega-notation', name: 'Big-Omega Notation', blogSlug: 'big-omega-notation' },
          { id: 'time-complexity-analysis', name: 'Time Complexity Analysis', blogSlug: 'time-complexity-analysis' },
          { id: 'space-complexity-analysis', name: 'Space Complexity Analysis', blogSlug: 'space-complexity-analysis' }
        ]
      }
    ]
  },
  {
    id: 'linear-structures',
    name: 'Linear Data Structures',
    description: 'Contiguous arrays, list nodes, buffers, and collision tables.',
    concepts: [
      {
        id: 'arrays-concept',
        name: 'Arrays & Vectors',
        subtopics: [
          { id: 'arrays', name: 'Contiguous Memory Arrays & Grid Matrices', blogSlug: 'arrays' },
          { id: 'dynamic-vectors', name: 'Dynamic Capacity Scaling', blogSlug: 'dynamic-vectors' }
        ]
      },
      {
        id: 'linked-lists-concept',
        name: 'Linked Lists',
        subtopics: [
          { id: 'linked-list', name: 'Reference-Linked Node Chains', blogSlug: 'linked-list' },
          { id: 'doubly-linked-list', name: 'Doubly Linked Lists', blogSlug: 'doubly-linked-list' },
          { id: 'circular-linked-list', name: 'Circular Linked Lists', blogSlug: 'circular-linked-list' },
          { id: 'skip-list', name: 'Skip List Data Structure', blogSlug: 'skip-list' },
          { id: 'skip-lists-complex', name: 'Skip List Architecture', blogSlug: 'skip-lists-complex' }
        ]
      },
      {
        id: 'stacks-queues-concept',
        name: 'Stacks & Queues',
        subtopics: [
          { id: 'stack', name: 'LIFO Call Stacks', blogSlug: 'stack' },
          { id: 'queue', name: 'FIFO Message Queues', blogSlug: 'queue' },
          { id: 'circular-queue', name: 'Circular Queue', blogSlug: 'circular-queue' },
          { id: 'priority-queue', name: 'Priority Queue', blogSlug: 'priority-queue' },
          { id: 'deque', name: 'Double-Ended Queue (Deque)', blogSlug: 'deque' },
          { id: 'monotonic-queue', name: 'Monotonic Queue', blogSlug: 'monotonic-queue' }
        ]
      },
      {
        id: 'hash-tables-concept',
        name: 'Hash Tables & Sets',
        subtopics: [
          { id: 'hash-table', name: 'Hash Table Invariants', blogSlug: 'hash-table' },
          { id: 'hash-map', name: 'Hash Map Implementation', blogSlug: 'hash-map' },
          { id: 'hash-set', name: 'Hash Set Uniqueness', blogSlug: 'hash-set' },
          { id: 'collision-resolution', name: 'Collision Resolution Strategies', blogSlug: 'collision-resolution' },
          { id: 'load-factor-scaling', name: 'Load Factor & Resizing', blogSlug: 'load-factor-scaling' }
        ]
      }
    ]
  },
  {
    id: 'sorting-searching-topic',
    name: 'Sorting & Searching Algorithms',
    description: 'Order invariants, partition schemes, and logarithmic search boundaries.',
    concepts: [
      {
        id: 'searching-algorithms',
        name: 'Searching Algorithms',
        subtopics: [
          { id: 'binary-search', name: 'Binary Search', blogSlug: 'binary-search' },
          { id: 'linear-search', name: 'Linear Search', blogSlug: 'linear-search' },
          { id: 'ternary-search', name: 'Ternary Search', blogSlug: 'ternary-search' },
          { id: 'exponential-search', name: 'Exponential Search', blogSlug: 'exponential-search' },
          { id: 'interpolation-search', name: 'Interpolation Search', blogSlug: 'interpolation-search' },
          { id: 'jump-search', name: 'Jump Search', blogSlug: 'jump-search' },
          { id: 'fibonacci-search', name: 'Fibonacci Search', blogSlug: 'fibonacci-search' }
        ]
      },
      {
        id: 'sorting-algorithms',
        name: 'Sorting Algorithms',
        subtopics: [
          { id: 'sorting', name: 'Divide-and-Conquer Sorting Paradigms', blogSlug: 'sorting' },
          { id: 'bubble-sort', name: 'Bubble Sort', blogSlug: 'bubble-sort' },
          { id: 'selection-sort', name: 'Selection Sort', blogSlug: 'selection-sort' },
          { id: 'insertion-sort', name: 'Insertion Sort', blogSlug: 'insertion-sort' },
          { id: 'merge-sort', name: 'Merge Sort', blogSlug: 'merge-sort' },
          { id: 'quick-sort', name: 'Quick Sort', blogSlug: 'quick-sort' },
          { id: 'heap-sort', name: 'Heap Sort', blogSlug: 'heap-sort' },
          { id: 'counting-sort', name: 'Counting Sort', blogSlug: 'counting-sort' },
          { id: 'radix-sort', name: 'Radix Sort', blogSlug: 'radix-sort' },
          { id: 'bucket-sort', name: 'Bucket Sort', blogSlug: 'bucket-sort' },
          { id: 'shell-sort', name: 'Shell Sort', blogSlug: 'shell-sort' }
        ]
      }
    ]
  },
  {
    id: 'tree-structures-topic',
    name: 'Tree Data Structures',
    description: 'Hierarchical node trees, balanced search trees, and heap properties.',
    concepts: [
      {
        id: 'binary-trees-concept',
        name: 'Binary Trees & Traversals',
        subtopics: [
          { id: 'binary-tree', name: 'Binary Tree Structural Properties', blogSlug: 'binary-tree' },
          { id: 'binary-search-tree', name: 'Binary Search Tree (BST)', blogSlug: 'binary-search-tree' },
          { id: 'tree-traversal', name: 'Hierarchical Tree Traversals', blogSlug: 'tree-traversal' },
          { id: 'in-order-traversal', name: 'In-Order Traversal', blogSlug: 'in-order-traversal' },
          { id: 'pre-order-traversal', name: 'Pre-Order Traversal', blogSlug: 'pre-order-traversal' },
          { id: 'post-order-traversal', name: 'Post-Order Traversal', blogSlug: 'post-order-traversal' },
          { id: 'tree-bfs', name: 'Breadth-First Search (Tree BFS)', blogSlug: 'tree-bfs' },
          { id: 'tree-dfs', name: 'Depth-First Search (Tree DFS)', blogSlug: 'tree-dfs' }
        ]
      },
      {
        id: 'balanced-trees-concept',
        name: 'Balanced & Multi-way Trees',
        subtopics: [
          { id: 'avl-tree', name: 'AVL Tree Self-Balancing', blogSlug: 'avl-tree' },
          { id: 'red-black-tree', name: 'Red-Black Tree Invariants', blogSlug: 'red-black-tree' },
          { id: 'avl-red-black-tree', name: 'Balanced Search Trees Comparison', blogSlug: 'avl-red-black-tree' },
          { id: 'b-tree', name: 'B-Tree Storage Engine Nodes', blogSlug: 'b-tree' },
          { id: 'b-plus-tree', name: 'B+ Tree Indexing Architecture', blogSlug: 'b-plus-tree' },
          { id: 'two-three-trees', name: '2-3 Trees', blogSlug: 'two-three-trees' },
          { id: 'splay-tree', name: 'Splay Tree', blogSlug: 'splay-tree' },
          { id: 'treap', name: 'Treap (Randomized BST)', blogSlug: 'treap' }
        ]
      },
      {
        id: 'heaps-trie-concept',
        name: 'Heaps & String Trees',
        subtopics: [
          { id: 'heap', name: 'Binary Heaps & Priority Queues', blogSlug: 'heap' },
          { id: 'min-heap', name: 'Min Heap Structure', blogSlug: 'min-heap' },
          { id: 'max-heap', name: 'Max Heap Structure', blogSlug: 'max-heap' },
          { id: 'binomial-heap', name: 'Binomial Heap', blogSlug: 'binomial-heap' },
          { id: 'fibonacci-heap', name: 'Fibonacci Heap', blogSlug: 'fibonacci-heap' },
          { id: 'trie', name: 'Trie Prefix Trees', blogSlug: 'trie' }
        ]
      }
    ]
  },
  {
    id: 'graph-structures-topic',
    name: 'Graph Data Structures & Algorithms',
    description: 'Vertices, edges, shortest paths, spanning trees, and flow networks.',
    concepts: [
      {
        id: 'graph-representations-concept',
        name: 'Graph Representations & Traversals',
        subtopics: [
          { id: 'directed-graphs', name: 'Directed Graphs', blogSlug: 'directed-graphs' },
          { id: 'undirected-graphs', name: 'Undirected Graphs', blogSlug: 'undirected-graphs' },
          { id: 'graph-representations', name: 'Graph Storage Representations', blogSlug: 'graph-representations' },
          { id: 'adjacency-matrix', name: 'Adjacency Matrix Representation', blogSlug: 'adjacency-matrix' },
          { id: 'adjacency-list', name: 'Adjacency List Representation', blogSlug: 'adjacency-list' },
          { id: 'bfs-traversal', name: 'Breadth-First Search (BFS)', blogSlug: 'bfs-traversal' },
          { id: 'dfs-traversal', name: 'Depth-First Search (DFS)', blogSlug: 'dfs-traversal' },
          { id: 'bfs', name: 'Breadth-First Search Invariants', blogSlug: 'bfs' },
          { id: 'dfs', name: 'Depth-First Search Invariants', blogSlug: 'dfs' }
        ]
      },
      {
        id: 'shortest-paths-concept',
        name: 'Shortest Path & Connectivity',
        subtopics: [
          { id: 'dijkstra-algorithm', name: 'Dijkstra Algorithm', blogSlug: 'dijkstra-algorithm' },
          { id: 'bellman-ford', name: 'Bellman-Ford Algorithm', blogSlug: 'bellman-ford' },
          { id: 'floyd-warshall', name: 'Floyd-Warshall All-Pairs Shortest Path', blogSlug: 'floyd-warshall' },
          { id: 'a-search', name: 'A* Heuristic Search', blogSlug: 'a-search' },
          { id: 'topological-sort', name: 'Topological Sorting', blogSlug: 'topological-sort' }
        ]
      },
      {
        id: 'mst-components-concept',
        name: 'Spanning Trees & Components',
        subtopics: [
          { id: 'kruskal-mst', name: 'Kruskal Minimum Spanning Tree', blogSlug: 'kruskal-mst' },
          { id: 'prim-mst', name: 'Prim Minimum Spanning Tree', blogSlug: 'prim-mst' },
          { id: 'disjoint-set', name: 'Disjoint Set Union (DSU)', blogSlug: 'disjoint-set' },
          { id: 'tarjan-scc', name: 'Tarjan Strongly Connected Components', blogSlug: 'tarjan-scc' },
          { id: 'kosaraju-scc', name: 'Kosaraju Strongly Connected Components', blogSlug: 'kosaraju-scc' },
          { id: 'scc-bridges', name: 'Strongly Connected Components & Bridges', blogSlug: 'scc-bridges' },
          { id: 'bridges-cuts', name: 'Bridges & Cut Vertices', blogSlug: 'bridges-cuts' },
          { id: 'euler-tour', name: 'Euler Tour Traversal', blogSlug: 'euler-tour' }
        ]
      }
    ]
  },
  {
    id: 'advanced-complex-structures',
    name: 'Advanced Data Structures & Indexing',
    description: 'Probabilistic filters, spatial trees, suffix arrays, and indexing engines.',
    concepts: [
      {
        id: 'probabilistic-structures',
        name: 'Probabilistic Data Structures',
        subtopics: [
          { id: 'bloom-filter', name: 'Bloom Filter Uniqueness', blogSlug: 'bloom-filter' },
          { id: 'count-min-sketch', name: 'Count-Min Sketch Frequency', blogSlug: 'count-min-sketch' },
          { id: 'hyperloglog', name: 'HyperLogLog Cardinality', blogSlug: 'hyperloglog' }
        ]
      },
      {
        id: 'suffix-string-structures',
        name: 'Suffix & String Structures',
        subtopics: [
          { id: 'suffix-tree', name: 'Suffix Tree Architecture', blogSlug: 'suffix-tree' },
          { id: 'suffix-array', name: 'Suffix Array Construction', blogSlug: 'suffix-array' },
          { id: 'suffix-automaton', name: 'Suffix Automaton', blogSlug: 'suffix-automaton' }
        ]
      },
      {
        id: 'spatial-indexing-concept',
        name: 'Spatial & Range Structures',
        subtopics: [
          { id: 'spatial-indexing', name: 'Spatial Indexing Invariants', blogSlug: 'spatial-indexing' },
          { id: 'r-tree', name: 'R-Tree Spatial Index', blogSlug: 'r-tree' },
          { id: 'kd-tree', name: 'K-D Tree Point Partitioning', blogSlug: 'kd-tree' },
          { id: 'quadtree', name: 'Quadtree Spatial Bounds', blogSlug: 'quadtree' },
          { id: 'octree', name: 'Octree 3D Bounds', blogSlug: 'octree' },
          { id: 'segment-tree', name: 'Segment Tree Range Queries', blogSlug: 'segment-tree' },
          { id: 'fenwick-tree', name: 'Fenwick Tree (Binary Indexed Tree)', blogSlug: 'fenwick-tree' },
          { id: 'sparse-table', name: 'Sparse Table Range Queries', blogSlug: 'sparse-table' }
        ]
      },
      {
        id: 'db-indexing-concept',
        name: 'Database & Disk Indexing',
        subtopics: [
          { id: 'isam-indexing', name: 'ISAM Indexing', blogSlug: 'isam-indexing' },
          { id: 'linear-indexing', name: 'Linear Indexing', blogSlug: 'linear-indexing' },
          { id: 'tree-indexing', name: 'Tree-Based Indexing', blogSlug: 'tree-indexing' }
        ]
      }
    ]
  },
  {
    id: 'problem-solving-patterns-topic',
    name: 'Problem Solving Techniques & Algorithmic Patterns',
    description: 'Two pointers, sliding window, dynamic programming, and greedy invariants.',
    concepts: [
      {
        id: 'pointer-window-patterns',
        name: 'Two Pointers & Sliding Window',
        subtopics: [
          { id: 'two-pointer-technique', name: 'Two Pointer Technique', blogSlug: 'two-pointer-technique' },
          { id: 'sliding-window-technique', name: 'Sliding Window Technique', blogSlug: 'sliding-window-technique' },
          { id: 'fast-slow-pointers', name: 'Fast & Slow Pointers (Floyd Cycle Detection)', blogSlug: 'fast-slow-pointers' },
          { id: 'cyclic-sort', name: 'Cyclic Sort Pattern', blogSlug: 'cyclic-sort' },
          { id: 'merge-intervals', name: 'Merge Intervals Pattern', blogSlug: 'merge-intervals' },
          { id: 'two-heaps-pattern', name: 'Two Heaps Pattern', blogSlug: 'two-heaps-pattern' }
        ]
      },
      {
        id: 'core-paradigms',
        name: 'Core Design Paradigms',
        subtopics: [
          { id: 'brute-force', name: 'Brute Force Search', blogSlug: 'brute-force' },
          { id: 'divide-and-conquer', name: 'Divide and Conquer Pattern', blogSlug: 'divide-and-conquer' },
          { id: 'recursion', name: 'Recursion Invariants', blogSlug: 'recursion' },
          { id: 'backtracking', name: 'Backtracking Search State Space', blogSlug: 'backtracking' },
          { id: 'dynamic-programming', name: 'Dynamic Programming (DP)', blogSlug: 'dynamic-programming' },
          { id: 'greedy-algorithms', name: 'Greedy Choice Property', blogSlug: 'greedy-algorithms' },
          { id: 'bit-manipulation', name: 'Bit Manipulation Invariants', blogSlug: 'bit-manipulation' },
          { id: 'randomized-algorithms', name: 'Randomized Algorithms', blogSlug: 'randomized-algorithms' }
        ]
      },
      {
        id: 'specialized-patterns',
        name: 'Specialized Problem Patterns',
        subtopics: [
          { id: 'kth-element', name: 'Kth Element Quickselect', blogSlug: 'kth-element' },
          { id: 'island-traversal', name: 'Island Matrix Traversal', blogSlug: 'island-traversal' },
          { id: 'multi-threaded', name: 'Multi-threaded Concurrency', blogSlug: 'multi-threaded' },
          { id: 'kadanes-algorithm', name: 'Kadane\'s Algorithm (Max Subarray)', blogSlug: 'kadanes-algorithm' },
          { id: 'boyer-moore-majority', name: 'Boyer-Moore Majority Vote Algorithm', blogSlug: 'boyer-moore-majority' }
        ]
      }
    ]
  },
  {
    id: 'string-geometric-algorithms',
    name: 'String, Geometric & Advanced Algorithms',
    description: 'String matching automatas, computational geometry, and specialized routines.',
    concepts: [
      {
        id: 'string-matching-concept',
        name: 'String Matching Algorithms',
        subtopics: [
          { id: 'string-algorithms', name: 'Pattern Matching & String Invariants', blogSlug: 'string-algorithms' },
          { id: 'kmp-algorithm', name: 'Knuth-Morris-Pratt (KMP) Algorithm', blogSlug: 'kmp-algorithm' },
          { id: 'boyer-moore-search', name: 'Boyer-Moore String Search', blogSlug: 'boyer-moore-search' },
          { id: 'rabin-karp-search', name: 'Rabin-Karp Rolling Hash Search', blogSlug: 'rabin-karp-search' },
          { id: 'z-algorithm', name: 'Z-Algorithm Linear String Matching', blogSlug: 'z-algorithm' },
          { id: 'manacher-substrings', name: 'Manacher\'s Longest Palindromic Substring', blogSlug: 'manacher-substrings' },
          { id: 'aho-corasick', name: 'Aho-Corasick Multi-Pattern Automaton', blogSlug: 'aho-corasick' }
        ]
      },
      {
        id: 'computational-geometry-concept',
        name: 'Computational Geometry',
        subtopics: [
          { id: 'graham-scan', name: 'Graham Scan Convex Hull', blogSlug: 'graham-scan' },
          { id: 'jarvis-march', name: 'Jarvis March (Gift Wrapping)', blogSlug: 'jarvis-march' },
          { id: 'chans-algorithm', name: 'Chan\'s Optimal Convex Hull', blogSlug: 'chans-algorithm' },
          { id: 'kirkpatrick-seidel', name: 'Kirkpatrick-Seidel Algorithm', blogSlug: 'kirkpatrick-seidel' },
          { id: 'bresenhams-line', name: 'Bresenham\'s Raster Line Algorithm', blogSlug: 'bresenhams-line' }
        ]
      },
      {
        id: 'specialized-algorithms-concept',
        name: 'Specialized Mathematical Routines',
        subtopics: [
          { id: 'brents-algorithm', name: 'Brent\'s Cycle Finding Algorithm', blogSlug: 'brents-algorithm' },
          { id: 'lee-algorithm', name: 'Lee Algorithm Breadth-First Grid Routing', blogSlug: 'lee-algorithm' },
          { id: 'mos-algorithm', name: 'Mo\'s Algorithm Offline Range Queries', blogSlug: 'mos-algorithm' },
          { id: 'gale-shapley', name: 'Gale-Shapley Stable Matching', blogSlug: 'gale-shapley' },
          { id: 'johnsons-algorithm', name: 'Johnson\'s All-Pairs Shortest Path', blogSlug: 'johnsons-algorithm' },
          { id: 'kargers-algorithm', name: 'Karger\'s Min-Cut Randomized Algorithm', blogSlug: 'kargers-algorithm' },
          { id: 'viterbi-algorithm', name: 'Viterbi Hidden Markov Model Decoding', blogSlug: 'viterbi-algorithm' },
          { id: 'cooley-tukey-fft', name: 'Cooley-Tukey Fast Fourier Transform (FFT)', blogSlug: 'cooley-tukey-fft' },
          { id: 'heavy-light-decomposition', name: 'Heavy-Light Tree Decomposition', blogSlug: 'heavy-light-decomposition' },
          { id: 'centroid-decomposition', name: 'Centroid Tree Decomposition', blogSlug: 'centroid-decomposition' },
          { id: 'advanced-cp', name: 'Competitive Programming Invariants', blogSlug: 'advanced-cp' }
        ]
      }
    ]
  },
  {
    id: 'theoretical-cs-topic',
    name: 'Theoretical Computer Science & Automata Theory',
    description: 'Formal language machines, computability limits, and complexity class reductions.',
    concepts: [
      {
        id: 'automata-formal-languages',
        name: 'Automata & Formal Languages',
        subtopics: [
          { id: 'dfa-state-transitions-automatas', name: 'Deterministic Finite Automata (DFA)', blogSlug: 'dfa-state-transitions-automatas' },
          { id: 'cfg-production-grammars-bounds', name: 'Context-Free Grammars (CFG)', blogSlug: 'cfg-production-grammars-bounds' },
          { id: 'regular-language-matches-expressions', name: 'Regular Expressions & Languages', blogSlug: 'regular-language-matches-expressions' },
          { id: 'pushdown-automata-stack-transitions', name: 'Pushdown Automata & Stack Machines', blogSlug: 'pushdown-automata-stack-transitions' },
          { id: 'chomsky-grammar-hierarchies', name: 'Chomsky Grammar Hierarchy', blogSlug: 'chomsky-grammar-hierarchies' }
        ]
      },
      {
        id: 'computability-undecidability',
        name: 'Computability & Undecidability',
        subtopics: [
          { id: 'turing-tape-state-transitions', name: 'Turing Machines & Tape Transitions', blogSlug: 'turing-tape-state-transitions' },
          { id: 'halting-problem-undecidability-contradiction', name: 'Halting Problem & Undecidability', blogSlug: 'halting-problem-undecidability-contradiction' },
          { id: 'g-del-incompleteness-logic-limits', name: 'Gödel\'s Incompleteness & Formal Logic', blogSlug: 'g-del-incompleteness-logic-limits' },
          { id: 'church-turing-computability-lambda-calculus', name: 'Church-Turing Thesis & Lambda Calculus', blogSlug: 'church-turing-computability-lambda-calculus' }
        ]
      },
      {
        id: 'complexity-classes-reductions',
        name: 'Complexity Classes & Reductions',
        subtopics: [
          { id: 'p-vs-np-class-limits', name: 'P vs NP Complexity Limits', blogSlug: 'p-vs-np-class-limits' },
          { id: 'np-complete-polynomial-reductions', name: 'NP-Completeness & Reductions', blogSlug: 'np-complete-polynomial-reductions' },
          { id: 'polynomial-time-verification-runs', name: 'Polynomial-Time Verification', blogSlug: 'polynomial-time-verification-runs' },
          { id: 'cook-levin-theorem-sat-formulas', name: 'Cook-Levin Theorem & SAT', blogSlug: 'cook-levin-theorem-sat-formulas' },
          { id: 'deterministic-vs-non-deterministic-complexity', name: 'Deterministic vs Non-Deterministic Complexity', blogSlug: 'deterministic-vs-non-deterministic-complexity' },
          { id: 'space-complexity-class-pspace', name: 'Space Complexity & PSPACE', blogSlug: 'space-complexity-class-pspace' },
          { id: 'time-hierarchy-theorem-bounds', name: 'Time Hierarchy Theorem Bounds', blogSlug: 'time-hierarchy-theorem-bounds' },
          { id: 'circuit-complexity-gates-bounds', name: 'Circuit Complexity & Logic Gates', blogSlug: 'circuit-complexity-gates-bounds' }
        ]
      },
      {
        id: 'advanced-theoretical-concepts',
        name: 'Advanced Theoretical Complexity',
        subtopics: [
          { id: 'interactive-proofs-ip-classes', name: 'Interactive Proof Systems & IP', blogSlug: 'interactive-proofs-ip-classes' },
          { id: 'zero-knowledge-proof-protocols-verification', name: 'Zero-Knowledge Proof Verification', blogSlug: 'zero-knowledge-proof-protocols-verification' },
          { id: 'approximation-algorithm-bounds-bounds', name: 'Approximation Algorithm Hardness Bounds', blogSlug: 'approximation-algorithm-bounds-bounds' },
          { id: 'randomized-algorithm-probability-checks', name: 'Randomized Algorithm Probability Checks', blogSlug: 'randomized-algorithm-probability-checks' },
          { id: 'parameterized-complexity-tractability-splits', name: 'Parameterized Complexity & Fixed-Parameter Tractability', blogSlug: 'parameterized-complexity-tractability-splits' },
          { id: 'quantum-complexity-bqp-bounds', name: 'Quantum Complexity & BQP Class Bounds', blogSlug: 'quantum-complexity-bqp-bounds' },
          { id: 'graph-isomorphism-classification', name: 'Graph Isomorphism Complexity', blogSlug: 'graph-isomorphism-classification' },
          { id: 'boolean-satisfiability-solvers-algorithms', name: 'Boolean Satisfiability (SAT) Solvers', blogSlug: 'boolean-satisfiability-solvers-algorithms' }
        ]
      }
    ]
  },
  {
    id: 'practice-platforms-topic',
    name: 'Practice Platforms',
    description: 'Interactive coding environments and algorithmic practice platforms.',
    concepts: [
      {
        id: 'practice-hubs',
        name: 'Practice Hubs',
        subtopics: [
          { id: 'leetcode-platform', name: 'LeetCode Platform', blogSlug: 'leetcode-platform' },
          { id: 'edabit-platform', name: 'Edabit Platform', blogSlug: 'edabit-platform' }
        ]
      }
    ]
  }
];

// Replace the topics array of dsa-foundations zone in roadmapData.ts
const topicsFormatted = JSON.stringify(newTopics, null, 8);

// Find zone dsa-foundations start and topics:
const dsaStart = roadmapContent.indexOf("id: 'dsa-foundations'");
const topicsStart = roadmapContent.indexOf("topics: [", dsaStart);
const nextZoneStart = roadmapContent.indexOf("id: 'game-developer'", dsaStart);

// Find closing ] of topics array before nextZoneStart
const topicsEnd = roadmapContent.lastIndexOf("]", nextZoneStart);

roadmapContent = roadmapContent.slice(0, topicsStart) + "topics: " + topicsFormatted + roadmapContent.slice(topicsEnd + 1);

fs.writeFileSync(roadmapPath, roadmapContent, 'utf8');
console.log("Successfully updated dsa-foundations topics in roadmapData.ts!");
