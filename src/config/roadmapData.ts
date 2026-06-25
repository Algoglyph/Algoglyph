// Spatial Computer Science Roadmap Curriculum Data

export interface SubConcept {
  name: string;
  desc: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hours: number;
  visualizerId?: string; // Links to ALGORITHMS id in src/config/algorithms.ts
  learningStatus: 'Not Started' | 'In Progress' | 'Completed';
  keyPoints: string[];
  codePreview?: string;
  codePreviewPython?: string;
}

export interface RoadmapZone {
  id: string;
  number: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hours: number;
  visualizerAvailable: boolean;
  learningStatus: 'Not Started' | 'In Progress' | 'Completed';
  description: string;
  subConcepts: SubConcept[];
}

export const ROADMAP_ZONES: RoadmapZone[] = [
  {
    id: 'programming-foundations',
    number: '01',
    name: 'Programming Foundations',
    difficulty: 'Easy',
    hours: 20,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Construct a rigorous baseline. Mastery of language grammar, memory addressing structures, procedural rules, and the mechanics of compiling human directives into raw execution frames.',
    subConcepts: [
      {
        name: 'Language Basics & Grammar',
        desc: 'Understand compiler grammar, variable bindings, conditional branching, loops, and scope thresholds.',
        difficulty: 'Easy',
        hours: 6,
        learningStatus: 'Not Started',
        keyPoints: ['Grammar & Parsing', 'Variable Scoping', 'Loop Invariants'],
        codePreview: `// Syntax execution frame\nint main() {\n  double threshold = 0.85;\n  for (int i = 0; i < 10; ++i) {\n    execute_directive(i, threshold);\n  }\n  return 0;\n}`,
        codePreviewPython: `# Syntax execution frame\ndef main():\n    threshold = 0.85\n    for i in range(10):\n        execute_directive(i, threshold)\n\nif __name__ == "__main__":\n    main()`
      },
      {
        name: 'Object-Oriented Programming (OOP)',
        desc: 'Model complex domains via encapsulation, class structures, interface contracts, polymorphism, and inheritance trees.',
        difficulty: 'Easy',
        hours: 8,
        learningStatus: 'Not Started',
        keyPoints: ['Encapsulation', 'Polymorphism', 'Composition'],
        codePreview: `// Class inheritance contract\nclass Polygon {\npublic:\n  virtual double area() const = 0;\n};`,
        codePreviewPython: `# Class inheritance contract\nfrom abc import ABC, abstractmethod\n\nclass Polygon(ABC):\n    @abstractmethod\n    def area(self) -> float:\n        pass`
      },
      {
        name: 'Structured Pseudocode',
        desc: 'Draft algorithmic operations in plain logical grammar, freeing logical verification from language dependencies.',
        difficulty: 'Easy',
        hours: 6,
        learningStatus: 'Not Started',
        keyPoints: ['Logical Flowcharts', 'Step-wise Refinement', 'Pre/Post Conditions']
      },
      {
        name: 'Debugging & Call Stack Analysis',
        desc: 'Learn to read stack traces, inspect local memory frames, trace variable states, and debug logical checkpoints.',
        difficulty: 'Easy',
        hours: 6,
        learningStatus: 'Not Started',
        keyPoints: ['Stack Traces', 'Breakpoint Inspection', 'Dry Run Auditing'],
        codePreview: `// Debugging log trace\n#ifdef DEBUG\n  std::cout << "Local state: val=" << val << " at frame=" << frame_id << std::endl;\n#endif`,
        codePreviewPython: `# Debugging log trace\nimport logging\nlogging.basicConfig(level=logging.DEBUG)\nlogging.debug(f"Local state: val={val} at frame={frame_id}")`
      },
      {
        name: 'Fundamental Search Iterations',
        desc: 'Scan indices sequentially or bisect sorted search intervals to locate element positions in logarithmic limits.',
        difficulty: 'Easy',
        hours: 6,
        visualizerId: 'binary-search',
        learningStatus: 'Not Started',
        keyPoints: ['Sequential Scanning', 'Interval Bisection', 'Target Intersection'],
        codePreview: `// Binary Search offset bisection\nint search(int arr[], int n, int target) {\n  int l = 0, r = n - 1;\n  while (l <= r) {\n    int m = l + (r - l) / 2;\n    if (arr[m] == target) return m;\n    if (arr[m] < target) l = m + 1;\n    else r = m - 1;\n  }\n  return -1;\n}`,
        codePreviewPython: `# Binary Search offset bisection\ndef search(arr, target):\n    l, r = 0, len(arr) - 1\n    while l <= r:\n        m = l + (r - l) // 2\n        if arr[m] == target:\n            return m\n        if arr[m] < target:\n            l = m + 1\n        else:\n            r = m - 1\n    return -1`
      }
    ]
  },
  {
    id: 'memory',
    number: '02',
    name: 'Memory Architecture',
    difficulty: 'Medium',
    hours: 24,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Demystify physical and virtual hardware layers. Study contiguous registers, offset indexing, pointers, heap/stack isolation, and automatic reclamation bounds.',
    subConcepts: [
      {
        name: 'Virtual Memory & Addresses',
        desc: 'Understand virtual address spaces, byte alignments, memory registers, and offset addressing.',
        difficulty: 'Medium',
        hours: 8,
        learningStatus: 'Not Started',
        keyPoints: ['Virtual Address Space', 'Byte Alignment', 'Hexadecimal Mapping'],
        codePreview: `// Memory offset addressing\nuintptr_t base_address = 0x7ffe00;\nuintptr_t offset = 0x04 * 2;\nint* val_ptr = (int*)(base_address + offset);`,
        codePreviewPython: `# Memory simulation & offsets\nimport ctypes\n\nbase_address = 0x7ffe00\noffset = 0x04 * 2\nval_ptr = ctypes.cast(base_address + offset, ctypes.POINTER(ctypes.c_int))`
      },
      {
        name: 'Stack vs Heap Allocation',
        desc: 'Trace stack frames (compile-time, LIFO, execution scopes) and contrast with the dynamic heap workspace.',
        difficulty: 'Medium',
        hours: 8,
        learningStatus: 'Not Started',
        keyPoints: ['Stack Frame Scopes', 'Dynamic Allocation', 'Fragmentation'],
        codePreview: `// Stack vs Heap allocation\nvoid scope() {\n  int local_var = 42; // Stack allocation\n  int* heap_var = new int(42); // Heap allocation\n  delete heap_var;\n}`,
        codePreviewPython: `# Stack vs Heap simulation\ndef scope():\n    local_var = 42 # Name bound in stack frame\n    heap_var = [42] # List allocated on heap\n    del heap_var # Ref count decremented`
      },
      {
        name: 'Automatic Reclamation',
        desc: 'Deconstruct Garbage Collection models (Reference counting, Mark-and-Sweep, Generational) and manual allocations.',
        difficulty: 'Hard',
        hours: 8,
        learningStatus: 'Not Started',
        keyPoints: ['Mark & Sweep', 'Generational GC', 'Memory Leaks']
      },
      {
        name: 'Memory Leak Profiling & Valgrind',
        desc: 'Audit heap resources to eliminate memory leaks, identify double frees, analyze memory access errors, and profile allocations.',
        difficulty: 'Hard',
        hours: 8,
        learningStatus: 'Not Started',
        keyPoints: ['Valgrind Audits', 'Double Frees', 'Heap Profiling']
      }
    ]
  },
  {
    id: 'arrays',
    number: '03',
    name: 'Arrays & Matrices',
    difficulty: 'Easy',
    hours: 32,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Analyse contiguous cache-friendly blocks. Leverage random-access offsets, multi-dimensional grids, pointer convergence, sliding boundaries, and constant-time index mappings.',
    subConcepts: [
      {
        name: 'Contiguous Static & Dynamic Arrays',
        desc: 'O(1) index offsets vs resizing bounds. Understand memory copies when dynamic arrays trigger geometric capacity growth.',
        difficulty: 'Easy',
        hours: 10,
        learningStatus: 'Not Started',
        keyPoints: ['O(1) Random Access', 'Capacity Growth', 'Memory Copies'],
        codePreview: `// Dynamic Array Resizing\nif (size == capacity) {\n  capacity *= 2;\n  int* new_data = new int[capacity];\n  std::copy(data, data + size, new_data);\n  delete[] data;\n  data = new_data;\n}`,
        codePreviewPython: `# Dynamic Array Resizing (Python list emulation)\nif len(data) == capacity:\n    capacity *= 2\n    new_data = [None] * capacity\n    for i in range(len(data)):\n        new_data[i] = data[i]\n    data = new_data`
      },
      {
        name: 'Pointers & Convergence',
        desc: 'Converge two pointers inward to locate target configurations, avoiding quadratic nested iterations.',
        difficulty: 'Medium',
        hours: 12,
        visualizerId: 'two-pointers',
        learningStatus: 'Not Started',
        keyPoints: ['Target Convergence', 'Opposite Direction', 'Fast/Slow Speeds'],
        codePreview: `// Two-Pointer search loop\nwhile (left < right) {\n  int sum = arr[left] + arr[right];\n  if (sum == target) return {left, right};\n  else if (sum < target) left++;\n  else right--;\n}`,
        codePreviewPython: `# Two-Pointer search loop\nwhile left < right:\n    total = arr[left] + arr[right]\n    if total == target:\n        return left, right\n    elif total < target:\n        left += 1\n    else:\n        right -= 1`
      },
      {
        name: 'Sliding Window Constraints',
        desc: 'Slide boundaries to track subsets matching dynamic invariants in linear time.',
        difficulty: 'Medium',
        hours: 10,
        visualizerId: 'sliding-window',
        learningStatus: 'Not Started',
        keyPoints: ['Subarray Windows', 'Linear Traversal', 'Dynamic Resize']
      },
      {
        name: 'Prefix Sums & Range Queries',
        desc: 'Pre-compute prefix arrays to solve range sum query coordinates in O(1) time complexity.',
        difficulty: 'Easy',
        hours: 8,
        learningStatus: 'Not Started',
        keyPoints: ['Prefix Arrays', 'Difference Arrays', 'O(1) Range Sum'],
        codePreview: `// Prefix Sum Pre-computation\nvector<int> pref(n + 1, 0);\nfor(int i = 0; i < n; i++) pref[i+1] = pref[i] + arr[i];\n// Range Query [L, R]\nint sum = pref[R+1] - pref[L];`,
        codePreviewPython: `# Prefix Sum Pre-computation\npref = [0] * (n + 1)\nfor i in range(n):\n    pref[i+1] = pref[i] + arr[i]\n# Range Query [L, R]\ntotal = pref[R+1] - pref[L]`
      }
    ]
  },
  {
    id: 'linked-lists',
    number: '04',
    name: 'Linked Lists',
    difficulty: 'Easy',
    hours: 28,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Decouple contiguity. Connect nodes via directed address references, enabling constant-time mutations by rewriting address pointers.',
    subConcepts: [
      {
        name: 'Singly & Doubly Linked Chains',
        desc: 'Master pointer traversal, node linkages, and backward navigation bounds using forward/backward addresses.',
        difficulty: 'Easy',
        hours: 10,
        learningStatus: 'Not Started',
        keyPoints: ['Forward Pointers', 'Double Links', 'Node Insertion'],
        codePreview: `// Doubly Linked Node Linkage\nstruct Node {\n  int value;\n  Node* next;\n  Node* prev;\n};`,
        codePreviewPython: `# Doubly Linked Node Linkage\nclass Node:\n    def __init__(self, value: int):\n        self.value = value\n        self.next = None\n        self.prev = None`
      },
      {
        name: 'Reference Relinking Invariants',
        desc: 'Avoid address dereference pointer crashes. Reverse lists and remove nodes in constant execution limits.',
        difficulty: 'Medium',
        hours: 10,
        learningStatus: 'Not Started',
        keyPoints: ['Pointer Reversal', 'Edge Condition Checks', 'Dummy Nodes'],
        codePreview: `// Inplace Chain Reversal\nNode* prev = nullptr;\nNode* curr = head;\nwhile (curr) {\n  Node* next = curr->next;\n  curr->next = prev;\n  prev = curr;\n  curr = next;\n}`,
        codePreviewPython: `# Inplace Chain Reversal\nprev = None\ncurr = head\nwhile curr:\n    next_node = curr.next\n    curr.next = prev\n    prev = curr\n    curr = next_node`
      },
      {
        name: 'Fast & Slow Cycle Traversal',
        desc: 'Floyd\'s Cycle detection. Two runners at different speeds prove cyclic connections without hashing.',
        difficulty: 'Medium',
        hours: 8,
        visualizerId: 'fast-slow-pointer',
        learningStatus: 'Not Started',
        keyPoints: ['Runner Traversal', 'Cycle Proving', 'Collision Intersection']
      },
      {
        name: 'Skip Lists & Multi-level Indexing',
        desc: 'Layer multiple parallel express lanes over sorted linked lists to accelerate search operations to logarithmic bounds.',
        difficulty: 'Hard',
        hours: 14,
        learningStatus: 'Not Started',
        keyPoints: ['Express Lane Indexes', 'Probabilistic Balance', 'Fast Lookups'],
        codePreview: `// Skip list node structure\nstruct SkipNode {\n  int key;\n  vector<SkipNode*> forward; // Array of forward pointers\n};`,
        codePreviewPython: `# Skip list node structure\nclass SkipNode:\n    def __init__(self, key: int, level: int):\n        self.key = key\n        self.forward = [None] * level`
      }
    ]
  },
  {
    id: 'stacks-queues',
    number: '05',
    name: 'Stacks & Queues',
    difficulty: 'Medium',
    hours: 30,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Enforce access constraints. Build LIFO call stack simulations, FIFO message streams, double-ended deques, and priority structures.',
    subConcepts: [
      {
        name: 'LIFO Stack Frames',
        desc: 'Call stack simulation. Enforce single-point operations to track nesting and recursive histories.',
        difficulty: 'Easy',
        hours: 8,
        learningStatus: 'Not Started',
        keyPoints: ['Push & Pop', 'Execution Frames', 'Bracket Matching'],
        codePreview: `// Bracket validation stack\nstack<char> s;\nfor (char c : expr) {\n  if (isOpen(c)) s.push(c);\n  else if (s.empty() || !matches(s.top(), c)) return false;\n  else s.pop();\n}`,
        codePreviewPython: `# Bracket validation stack\nstack = []\nfor c in expr:\n    if is_open(c):\n        stack.append(c)\n    elif not stack or not matches(stack[-1], c):\n        return False\n    else:\n        stack.pop()`
      },
      {
        name: 'FIFO Message Queues & Deques',
        desc: 'Buffer handling, round-robin schedulers, sliding window maxima using double-ended index deques.',
        difficulty: 'Medium',
        hours: 10,
        learningStatus: 'Not Started',
        keyPoints: ['Enqueue & Dequeue', 'Circular Buffers', 'Double-Ended Access'],
        codePreview: `// Queue circular implementation\nvoid enqueue(int val) {\n  rear = (rear + 1) % size;\n  data[rear] = val;\n}`,
        codePreviewPython: `# Queue circular implementation\ndef enqueue(self, val: int):\n    self.rear = (self.rear + 1) % self.size\n    self.data[self.rear] = val`
      },
      {
        name: 'Priority Queues & Binary Heaps',
        desc: 'Re-balance complete binary trees on insert/extract to yield constant-time access to extremums.',
        difficulty: 'Medium',
        hours: 12,
        visualizerId: 'heap-sort',
        learningStatus: 'Not Started',
        keyPoints: ['Max/Min Heapify', 'Logarithmic Balance', 'Heap Sort']
      },
      {
        name: 'Monotonic Stacks & Queues',
        desc: 'Maintain elements in strict increasing or decreasing order to solve next-greater-element challenges in linear time.',
        difficulty: 'Hard',
        hours: 10,
        learningStatus: 'Not Started',
        keyPoints: ['Strict Order Invariant', 'Next Greater Element', 'Amortized O(1)'],
        codePreview: `// Next Greater Element Monotonic Stack\nstack<int> st;\nfor (int i = 0; i < n; ++i) {\n  while (!st.empty() && arr[st.top()] < arr[i]) {\n    nge[st.top()] = arr[i];\n    st.pop();\n  }\n  st.push(i);\n}`,
        codePreviewPython: `# Next Greater Element Monotonic Stack\nstack = []\nfor i in range(n):\n    while stack and arr[stack[-1]] < arr[i]:\n        nge[stack.pop()] = arr[i]\n    stack.append(i)`
      }
    ]
  },
  {
    id: 'trees',
    number: '06',
    name: 'Trees & Hierarchical Graphs',
    difficulty: 'Medium',
    hours: 45,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Divide and conquer search spaces. Navigate hierarchical nodes, implement height-balance checks, evaluate range segments, and compress prefix keys.',
    subConcepts: [
      {
        name: 'Binary Trees & Dynamic BST',
        desc: 'Branching search spaces. Pre/In/Post-order recursive traversals, BST validation, and level-order queues.',
        difficulty: 'Medium',
        hours: 12,
        visualizerId: 'dfs-tree',
        learningStatus: 'Not Started',
        keyPoints: ['BST Invariants', 'Recursive DFS', 'Queue-Based BFS'],
        codePreview: `// BST Insertion search\nNode* insert(Node* root, int val) {\n  if (!root) return new Node(val);\n  if (val < root->val) root->left = insert(root->left, val);\n  else root->right = insert(root->right, val);\n  return root;\n}`,
        codePreviewPython: `# BST Insertion search\ndef insert(root: Node, val: int) -> Node:\n    if not root:\n        return Node(val)\n    if val < root.val:\n        root.left = insert(root.left, val)\n    else:\n        root.right = insert(root.right, val)\n    return root`
      },
      {
        name: 'Self-Balancing AVL & B-Trees',
        desc: 'Validate height thresholds. Conduct balance-factor adjustments and rotations to block linear degradation.',
        difficulty: 'Hard',
        hours: 15,
        learningStatus: 'Not Started',
        keyPoints: ['Height Rotations', 'B/B+ Database Indexes', 'Height Balance Factor'],
        codePreview: `// Left Rotation\nNode* rotateLeft(Node* x) {\n  Node* y = x->right;\n  x->right = y->left;\n  y->left = x;\n  return y;\n}`,
        codePreviewPython: `# Left Rotation\ndef rotate_left(x: Node) -> Node:\n    y = x.right\n    x.right = y.left\n    y.left = x\n    return y`
      },
      {
        name: 'Range Segment & Fenwick Trees',
        desc: 'Resolve queries over mutable indices in logarithmic bounds. Pre-process intervals for spatial indexing.',
        difficulty: 'Hard',
        hours: 18,
        visualizerId: 'segment-tree-algo',
        learningStatus: 'Not Started',
        keyPoints: ['Segment Division', 'Binary Index BIT', 'Sparse Tables']
      },
      {
        name: 'Tries & Prefix Compression Trees',
        desc: 'Store dictionary keys along character transition paths to resolve prefix queries and auto-completion in linear key-length bounds.',
        difficulty: 'Medium',
        hours: 12,
        learningStatus: 'Not Started',
        keyPoints: ['Prefix Matching', 'Character Tries', 'Suffix Trees'],
        codePreview: `// Trie Node insertion\nvoid insert(string word) {\n  TrieNode* curr = root;\n  for (char c : word) {\n    if (!curr->children[c - 'a']) curr->children[c - 'a'] = new TrieNode();\n    curr = curr->children[c - 'a'];\n  }\n  curr->isEndOfWord = true;\n}`,
        codePreviewPython: `# Trie Node insertion\ndef insert(self, word: str):\n    curr = self.root\n    for c in word:\n        idx = ord(c) - ord('a')\n        if not curr.children[idx]:\n            curr.children[idx] = TrieNode()\n        curr = curr.children[idx]\n    curr.is_end_of_word = True`
      },
      {
        name: 'Recursive vs. Iterative Traversals',
        desc: 'Deconstruct tree orders (Preorder, Inorder, Postorder) and execute level-by-level BFS queue layouts.',
        difficulty: 'Medium',
        hours: 10,
        visualizerId: 'inorder',
        learningStatus: 'Not Started',
        keyPoints: ['DFS Call Stack', 'BFS Queue Ring', 'Morris Threading'],
        codePreview: `// Inorder traversal helper\nvoid inorder(Node* root) {\n  if (!root) return;\n  inorder(root->left);\n  visit(root);\n  inorder(root->right);\n}`,
        codePreviewPython: `# Inorder traversal helper\ndef inorder(root):\n    if not root:\n        return\n    inorder(root.left)\n    visit(root)\n    inorder(root.right)`
      }
    ]
  },
  {
    id: 'graphs',
    number: '07',
    name: 'Graphs & Relational Meshes',
    difficulty: 'Hard',
    hours: 50,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Unify relations. Construct cyclic mesh topologies, trace routing pathways, extract minimum network frameworks, and verify connectivity in near-constant bounds.',
    subConcepts: [
      {
        name: 'Adjacency Mesh Traversals',
        desc: 'BFS level rings vs DFS recursive path drilling. Track visit checklists to handle cyclical feedback loops.',
        difficulty: 'Medium',
        hours: 12,
        visualizerId: 'bfs-graph',
        learningStatus: 'Not Started',
        keyPoints: ['Adjacency Lists', 'Queue Rings', 'Recursive Stack Traversal'],
        codePreview: `// BFS Graph queue loop\nqueue<int> q; q.push(start); visited[start] = true;\nwhile(!q.empty()) {\n  int u = q.front(); q.pop();\n  for(int v : adj[u]) if(!visited[v]) { q.push(v); visited[v] = true; }\n}`,
        codePreviewPython: `# BFS Graph queue loop\nfrom collections import deque\nq = deque([start])\nvisited[start] = True\nwhile q:\n    u = q.popleft()\n    for v in adj[u]:\n        if not visited[v]:\n            q.append(v)\n            visited[v] = True`
      },
      {
        name: 'Shortest Path Relaxations',
        desc: 'Relax relational edges to compute minimal paths. Dijkstra priority checks vs Bellman-Ford negative loops.',
        difficulty: 'Hard',
        hours: 18,
        visualizerId: 'dijkstra',
        learningStatus: 'Not Started',
        keyPoints: ['Dijkstra Heap Relax', 'Bellman-Ford Cycles', 'Floyd-Warshall DP Grid'],
        codePreview: `// Edge Relaxation\nif (dist[v] > dist[u] + weight) {\n  dist[v] = dist[u] + weight;\n  pq.push({dist[v], v});\n}`,
        codePreviewPython: `# Edge Relaxation\nif dist[v] > dist[u] + weight:\n    dist[v] = dist[u] + weight\n    heapq.heappush(pq, (dist[v], v))`
      },
      {
        name: 'Network Frameworks & Connectivity',
        desc: 'Build Minimum Spanning Trees, compute strongly connected components, and relax sets using Disjoint Set Forest structures.',
        difficulty: 'Hard',
        hours: 20,
        visualizerId: 'union-find',
        learningStatus: 'Not Started',
        keyPoints: ['Kruskal DSU Sort', 'Tarjan Low-Link DFS', 'Path Compression'],
        codePreview: `// DSU Find with Path Compression\nint find(int i) {\n  if (parent[i] == i) return i;\n  return parent[i] = find(parent[i]);\n}`,
        codePreviewPython: `# DSU Find with Path Compression\ndef find(i: int) -> int:\n    if parent[i] == i:\n        return i\n    parent[i] = find(parent[i])\n    return parent[i]`
      },
      {
        name: 'Topological Sorting & DAGs',
        desc: 'Resolve task dependency orders using Kahn\'s indegree queues or post-order DFS traversals on Directed Acyclic Graphs.',
        difficulty: 'Medium',
        hours: 10,
        learningStatus: 'Not Started',
        keyPoints: ['Indegree Queues', 'Dependency Resolution', 'Cycle Detection'],
        codePreview: `// Topological sorting Kahn's loop\nwhile (!q.empty()) {\n  int u = q.front(); q.pop();\n  topo.push_back(u);\n  for (int v : adj[u]) if (--indegree[v] == 0) q.push(v);\n}`,
        codePreviewPython: `# Topological sorting Kahn's loop\nwhile q:\n    u = q.popleft()\n    topo.append(u)\n    for v in adj[u]:\n        indegree[v] -= 1\n        if indegree[v] == 0:\n            q.append(v)`
      },
      {
        name: 'Negative Cycles & Distance Relaxation',
        desc: 'Explore shortest paths over negative weight edges or compute all-pairs distance matrices using Bellman-Ford and Floyd-Warshall.',
        difficulty: 'Hard',
        hours: 15,
        visualizerId: 'bellman-ford',
        learningStatus: 'Not Started',
        keyPoints: ['Negative Cycles', 'All-Pairs DP Matrix', 'Edge Relax Check'],
        codePreview: `// Bellman-Ford edge relaxation cycle\nfor (int i = 1; i <= n - 1; ++i) {\n  for (auto& edge : edges) {\n    if (dist[edge.u] != INF && dist[edge.v] > dist[edge.u] + edge.w) {\n      dist[edge.v] = dist[edge.u] + edge.w;\n    }\n  }\n}`,
        codePreviewPython: `# Bellman-Ford edge relaxation cycle\nfor i in range(n - 1):\n    for u, v, w in edges:\n        if dist[u] != float('inf') and dist[v] > dist[u] + w:\n            dist[v] = dist[u] + w`
      }
    ]
  },
  {
    id: 'algorithms',
    number: '08',
    name: 'Algorithms & Paradigms',
    difficulty: 'Hard',
    hours: 60,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Master formal logical operations. Sort datasets efficiently, backtrack along constraint limits, execute greedy selection metrics, and compute sub-problems.',
    subConcepts: [
      {
        name: 'Dividing & Sorting Datasets',
        desc: 'Decompose arrays to sort elements. Selection, Merge partition, Quick pivot, Heap heapify, Radix buckets.',
        difficulty: 'Medium',
        hours: 18,
        visualizerId: 'merge-sort',
        learningStatus: 'Not Started',
        keyPoints: ['Merge Sorting', 'Partitioning Pivots', 'Linear Sorting Limits'],
        codePreview: `// Quick Partition\nint partition(int l, int h) {\n  int p = arr[h], i = l - 1;\n  for(int j = l; j < h; j++) if(arr[j] < p) swap(arr[++i], arr[j]);\n  swap(arr[i+1], arr[h]); return i + 1;\n}`,
        codePreviewPython: `# Quick Partition\ndef partition(l: int, h: int) -> int:\n    p = arr[h]\n    i = l - 1\n    for j in range(l, h):\n        if arr[j] < p:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i + 1], arr[h] = arr[h], arr[i + 1]\n    return i + 1`
      },
      {
        name: 'Constraint Backtracking Search',
        desc: 'Explore the search tree and discard invalid branches. Permutations, power sets, N-Queens board relaxation.',
        difficulty: 'Hard',
        hours: 18,
        visualizerId: 'n-queens',
        learningStatus: 'Not Started',
        keyPoints: ['Recursive Search Trees', 'State Pruning', 'Combinations'],
        codePreview: `// Backtracking placement\nvoid solve(int col) {\n  if (col == N) { saveConfig(); return; }\n  for(int r = 0; r < N; r++) {\n    if(safe(r, col)) { place(r, col); solve(col + 1); remove(r, col); }\n  }\n}`,
        codePreviewPython: `# Backtracking placement\ndef solve(col: int):\n    if col == N:\n        save_config()\n        return\n    for r in range(N):\n        if safe(r, col):\n            place(r, col)\n            solve(col + 1)\n            remove(r, col)`
      },
      {
        name: 'Dynamic Memoization & Tabulation',
        desc: 'Map subproblems. Watch paths construct recursively from caches (Memoization) or compile iteratively (Tabulation).',
        difficulty: 'Hard',
        hours: 24,
        visualizerId: '2d-dp',
        learningStatus: 'Not Started',
        keyPoints: ['Recursive Cache Grids', 'Iterative Tabulation', '0/1 Knapsack Columns'],
        codePreview: `// 2D Knapsack Tabulation\nfor(int i = 1; i <= n; i++) {\n  for(int w = 1; w <= W; w++) {\n    if(wt[i-1] <= w) dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]);\n    else dp[i][w] = dp[i-1][w];\n  }\n}`,
        codePreviewPython: `# 2D Knapsack Tabulation\nfor i in range(1, n + 1):\n    for w in range(1, W + 1):\n        if wt[i - 1] <= w:\n            dp[i][w] = max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w])\n        else:\n            dp[i][w] = dp[i - 1][w]`
      },
      {
        name: 'Greedy Selection & Fractional Knapsack',
        desc: 'Choose local optimum selections at each step to compute global solutions, evaluated via fractional sorting rules.',
        difficulty: 'Medium',
        hours: 12,
        learningStatus: 'Not Started',
        keyPoints: ['Local Optimum Choice', 'Activity Selection', 'Optimal Substructure'],
        codePreview: `// Fractional Knapsack Greedy sort\nsort(items, items + n, cmp);\ndouble total_value = 0.0;\nfor (auto& item : items) {\n  if (item.weight <= W) { W -= item.weight; total_value += item.value; }\n  else { total_value += item.value * ((double)W / item.weight); break; }\n}`,
        codePreviewPython: `# Fractional Knapsack Greedy sort\nitems.sort(key=lambda x: x.value / x.weight, reverse=True)\ntotal_value = 0.0\nfor item in items:\n    if item.weight <= W:\n        W -= item.weight\n        total_value += item.value\n    else:\n        total_value += item.value * (W / item.weight)\n        break`
      },
      {
        name: 'Recursive Power Sets & Subsets',
        desc: 'Generate all potential subset combinations or sequence orderings of elements using recursion tree branching.',
        difficulty: 'Medium',
        hours: 10,
        visualizerId: 'subsets',
        learningStatus: 'Not Started',
        keyPoints: ['Power Set Generation', 'Branching Trees', 'Recursion Callbacks'],
        codePreview: `// Subsets backtracking list\nvoid backtrack(int index, vector<int>& current) {\n  result.push_back(current);\n  for (int i = index; i < nums.size(); ++i) {\n    current.push_back(nums[i]);\n    backtrack(i + 1, current);\n    current.pop_back();\n  }\n}`,
        codePreviewPython: `# Subsets backtracking list\ndef backtrack(index, current):\n    result.append(list(current))\n    for i in range(index, len(nums)):\n        current.append(nums[i])\n        backtrack(i + 1, current)\n        current.pop()`
      },
      {
        name: 'Optimal Substructure & LCS',
        desc: 'Formulate recurrence rules for matching sequences or increasing trends using DP lookup caches.',
        difficulty: 'Hard',
        hours: 18,
        visualizerId: 'lcs',
        learningStatus: 'Not Started',
        keyPoints: ['Longest Subsequence', 'Recurrence Rules', 'Cache Lookups'],
        codePreview: `// LCS cell transition\nif (s1[i-1] == s2[j-1]) dp[i][j] = 1 + dp[i-1][j-1];\nelse dp[i][j] = max(dp[i-1][j], dp[i][j-1]);`,
        codePreviewPython: `# LCS cell transition\nif s1[i-1] == s2[j-1]:\n    dp[i][j] = 1 + dp[i-1][j-1]\nelse:\n    dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
      }
    ]
  },
  {
    id: 'advanced-topics',
    number: '09',
    name: 'Advanced Topics & CP Invariants',
    difficulty: 'Hard',
    hours: 40,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Solve competitive programming limits. Map string prefix offsets, flatten hierarchies into traversal lists, skip link steps, and sweep coordinates.',
    subConcepts: [
      {
        name: 'String Pattern Matching',
        desc: 'KMP prefix border tables vs Rabin-Karp rolling hashes to locate pattern offsets in linear time.',
        difficulty: 'Hard',
        hours: 15,
        visualizerId: 'kmp',
        learningStatus: 'Not Started',
        keyPoints: ['KMP Border Lookups', 'Rabin-Karp Hashes', 'Manacher Palindromes'],
        codePreview: `// Rabin-Karp Rolling Hash update\nhash_val = (hash_val * d + txt[i]) % q;\nif (hash_val < 0) hash_val += q;`,
        codePreviewPython: `# Rabin-Karp Rolling Hash update\nhash_val = (hash_val * d + ord(txt[i])) % q\nif hash_val < 0:\n    hash_val += q`
      },
      {
        name: 'Competitive Programming Invariants',
        desc: 'Flatten trees with Euler loops, query offline blocks with Mo\'s layout, and compute overlaps via sweeping coordinates.',
        difficulty: 'Hard',
        hours: 25,
        visualizerId: 'sweep-line',
        learningStatus: 'Not Started',
        keyPoints: ['Euler Tree Flattening', 'Coordinate Sweeps', 'Binary Lifting Jumps'],
        codePreview: `// LCA Binary Lifting jump\nfor (int i = LG - 1; i >= 0; --i) {\n  if (up[u][i] != up[v][i]) {\n    u = up[u][i];\n    v = up[v][i];\n  }\n}\nreturn up[u][0];`,
        codePreviewPython: `# LCA Binary Lifting jump\nfor i in range(LG - 1, -1, -1):\n    if up[u][i] != up[v][i]:\n        u = up[u][i]\n        v = up[v][i]\nreturn up[u][0]`
      },
      {
        name: 'Segment Tree Lazy Propagation',
        desc: 'Defer range updates in segment trees by pushing changes to child nodes lazily only when requested.',
        difficulty: 'Hard',
        hours: 15,
        learningStatus: 'Not Started',
        keyPoints: ['Lazy Update Buffers', 'Range Modifications', 'O(log N) Updates'],
        codePreview: `// Segment Tree Lazy Propagation Update\nvoid updateRange(int node, int start, int end, int l, int r, int val) {\n  if (lazy[node] != 0) {\n    tree[node] += (end - start + 1) * lazy[node];\n    if (start != end) { lazy[node*2] += lazy[node]; lazy[node*2+1] += lazy[node]; }\n    lazy[node] = 0;\n  }\n  if (start > end || start > r || end < l) return;\n  if (start >= l && end <= r) {\n    tree[node] += (end - start + 1) * val;\n    if (start != end) { lazy[node*2] += val; lazy[node*2+1] += val; }\n    return;\n  }\n  int mid = (start + end) / 2;\n  updateRange(node*2, start, mid, l, r, val);\n  updateRange(node*2+1, mid+1, end, l, r, val);\n  tree[node] = tree[node*2] + tree[node*2+1];\n}`,
        codePreviewPython: `# Segment Tree Lazy Propagation Update\ndef update_range(node, start, end, l, r, val):\n    if lazy[node] != 0:\n        tree[node] += (end - start + 1) * lazy[node]\n        if start != end:\n            lazy[node*2] += lazy[node]\n            lazy[node*2+1] += lazy[node]\n        lazy[node] = 0\n    if start > end or start > r or end < l:\n        return\n    if start >= l and end <= r:\n        tree[node] += (end - start + 1) * val\n        if start != end:\n            lazy[node*2] += val\n            lazy[node*2+1] += val\n        return\n    mid = (start + end) // 2\n    update_range(node*2, start, mid, l, r, val)\n    update_range(node*2+1, mid+1, end, l, r, val)\n    tree[node] = tree[node*2] + tree[node*2+1]`
      },
      {
        name: 'Palindromic Substrings & Z-Array',
        desc: 'Identify longest palindromic substring offsets or match prefixes via computed Z-arrays in linear bounds.',
        difficulty: 'Hard',
        hours: 15,
        visualizerId: 'manacher',
        learningStatus: 'Not Started',
        keyPoints: ['Palindromic Symmetry', 'Z-Array Prefixes', 'Linear Lookups'],
        codePreview: `// Z-Algorithm character comparisons\nfor (int i = 1; i < n; ++i) {\n  if (i <= r) z[i] = min(r - i + 1, z[i - l]);\n  while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];\n  if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }\n}`,
        codePreviewPython: `# Z-Algorithm character comparisons\nfor i in range(1, n):\n    if i <= r:\n        z[i] = min(r - i + 1, z[i - l])\n    while i + z[i] < n and s[z[i]] == s[i + z[i]]:\n        z[i] += 1\n    if i + z[i] - 1 > r:\n        l = i\n        r = i + z[i] - 1`
      },
      {
        name: 'Offline Queries & Binary Ancestors',
        desc: 'Optimize online tree jumps using binary lifting powers or sort offline query blocks with Mo\'s algorithm.',
        difficulty: 'Hard',
        hours: 20,
        visualizerId: 'binary-lifting',
        learningStatus: 'Not Started',
        keyPoints: ['Binary Lifting Ancestors', 'Mo Block Sorting', 'LCA Range Queries'],
        codePreview: `// LCA Binary Lifting jump\nfor (int i = LG - 1; i >= 0; --i) {\n  if (up[u][i] != up[v][i]) {\n    u = up[u][i];\n    v = up[v][i];\n  }\n}\nreturn up[u][0];`,
        codePreviewPython: `# LCA Binary Lifting jump\nfor i in range(LG - 1, -1, -1):\n    if up[u][i] != up[v][i]:\n        u = up[u][i]\n        v = up[v][i]\nreturn up[u][0]`
      }
    ]
  }
];
