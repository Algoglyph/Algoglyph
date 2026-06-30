export interface ComplexityRow {
  label: string;
  value: string;
  note: string;
}

export interface PracticeProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  url: string;
}

export interface ArticleContent {
  introduction: string;
  whyImportant: string;
  realWorldApps: string[];
  algorithmDescription: string[];
  complexity: ComplexityRow[];
  implementationCpp: string;
  implementationPython: string;
  commonMistakes: string[];
  interviewQuestions: string[];
  summary: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  readTime: number;
  lastUpdated: string;
  visualizerId?: string;
  prerequisites: string[];
  related: string[];
  nextTopic?: string;
  prevTopic?: string;
  practiceProblems: PracticeProblem[];
  content: ArticleContent;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'arrays',
    title: 'Contiguous Memory Arrays & Grid Matrices',
    tagline: 'Unlock O(1) random access operations by mastering contiguous layouts, capacity scaling bounds, and cache locality invariants.',
    category: 'Data Structures',
    readTime: 12,
    lastUpdated: 'June 2026',
    visualizerId: 'two-pointers',
    prerequisites: [],
    related: ['linked-list', 'stack', 'queue', 'binary-search'],
    nextTopic: 'linked-list',
    practiceProblems: [
      { title: 'Two Sum (LeetCode 1)', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Container With Most Water (LeetCode 11)', difficulty: 'Medium', url: 'https://leetcode.com/problems/container-with-most-water/' },
      { title: 'Spiral Matrix (LeetCode 54)', difficulty: 'Medium', url: 'https://leetcode.com/problems/spiral-matrix/' }
    ],
    content: {
      introduction: 'An array represents a contiguous sequence of elements of the same type stored sequentially in virtual address spaces. In hardware, accessing an index involves computing a simple base offset `address = base + index * size`, which maps to a single CPU instruction. This layout is extremely cache-friendly, leveraging spatial locality to preload adjacent items into CPU cache lines.',
      whyImportant: 'Arrays are the bedrock of memory mapping. They are critical for implementing buffers, lookup hashes, dynamic vectors, matrices, heap trees, and adjacent graph arrays. Because offset arithmetic operates in constant time, arrays remain the most performant data structures for sequential reads.',
      realWorldApps: [
        'Relational database pages containing rows stored contiguously on disk drives.',
        'Digital image manipulation storing pixels inside 2D grid matrix buffers.',
        'High-frequency trading tickers buffering incoming order books in linear array rings.'
      ],
      algorithmDescription: [
        'Compute base-offset address calculations using memory pointer offsets.',
        'Initialize dynamic resizing arrays by allocating a new block with geometric capacity expansion (usually 2x) and executing linear elements copying.',
        'Slide boundaries or converge two pointer thresholds to traverse configurations in linear bounds, avoiding quadratic iterations.'
      ],
      complexity: [
        { label: 'Access', value: 'O(1)', note: 'Base-offset calculation' },
        { label: 'Search', value: 'O(n)', note: 'Unsorted sequential scan' },
        { label: 'Insertion', value: 'O(n)', note: 'Requires shifting elements downstream' },
        { label: 'Deletion', value: 'O(n)', note: 'Requires shifting elements upstream' }
      ],
      implementationCpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\n// Emulate custom geometric dynamic array resizing\nclass DynamicArray {\n  int* data;\n  int capacity;\n  int size;\n\npublic:\n  DynamicArray() {\n    capacity = 2;\n    size = 0;\n    data = new int[capacity];\n  }\n\n  void push_back(int val) {\n    if (size == capacity) {\n      capacity *= 2;\n      int* new_data = new int[capacity];\n      for (int i = 0; i < size; ++i) new_data[i] = data[i];\n      delete[] data;\n      data = new_data;\n    }\n    data[size++] = val;\n  }\n\n  int get(int idx) {\n    if (idx >= 0 && idx < size) return data[idx];\n    return -1;\n  }\n};`,
      implementationPython: `class DynamicArray:\n    # Emulate custom geometric dynamic array resizing\n    def __init__(self):\n        self.capacity = 2\n        self.size = 0\n        self.data = [None] * self.capacity\n\n    def push_back(self, val: int):\n        if self.size == self.capacity:\n            self.capacity *= 2\n            new_data = [None] * self.capacity\n            for i in range(self.size):\n                new_data[i] = self.data[i]\n            self.data = new_data\n        self.data[self.size] = val\n        self.size += 1\n\n    def get(self, idx: int) -> int:\n        if 0 <= idx < self.size:\n            return self.data[idx]\n        return -1`,
      commonMistakes: [
        'Out-of-bounds index exceptions due to off-by-one loops.',
        'Copying large arrays in functions by value instead of reference, triggering unnecessary allocations.',
        'Not reclaiming custom-allocated heap buffers, causing memory leaks.'
      ],
      interviewQuestions: [
        'How does a dynamic array guarantee amortized O(1) inserts despite O(n) reallocations?',
        'Describe the Difference Array technique to compute range updates on arrays in O(1).',
        'How does row-major layout contrast with column-major layouts regarding CPU cache lines?'
      ],
      summary: 'Arrays provide instant O(1) lookups by matching index offsets directly to hardware address registers. While resizing and insertions trigger element shifts, their cache locality makes them unmatched in raw speed for sequential memory workloads.'
    }
  },
  {
    slug: 'linked-list',
    title: 'Reference-Linked Node Chains',
    tagline: 'Bypass contiguous allocation blocks using pointer nodes, enabling constant-time structural mutation and address linking.',
    category: 'Data Structures',
    readTime: 10,
    lastUpdated: 'June 2026',
    visualizerId: 'fast-slow-pointer',
    prerequisites: ['arrays'],
    related: ['arrays', 'stack', 'queue', 'bfs'],
    nextTopic: 'stack',
    prevTopic: 'arrays',
    practiceProblems: [
      { title: 'Reverse Linked List (LeetCode 206)', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { title: 'Linked List Cycle (LeetCode 141)', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { title: 'Merge k Sorted Lists (LeetCode 23)', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' }
    ],
    content: {
      introduction: 'A Linked List is a dynamic relational structure composed of nodes scattered arbitrarily across the heap. Each node contains a data payload and one or more address references (pointers) linking to its adjacent nodes. By decoupling logical sequence from physical layout, lists can grow dynamically without triggering full memory block copies.',
      whyImportant: 'Linked Lists excel in applications requiring frequent insertions and deletions, such as task scheduling queues or cache lists (e.g., LRU cache). Because link reassignments operate in O(1) time, nodes can be spliced and merged efficiently without reallocation.',
      realWorldApps: [
        'Forward/Backward navigation paths in browser browsing history logs.',
        'Low-level kernel process lists holding active runtime threads.',
        'Dynamic music play tracks linking sequential audio track pointers.'
      ],
      algorithmDescription: [
        'Traverse node addresses sequentially by dereferencing next-pointer references.',
        'Execute insertions and deletions by rewriting boundary link variables.',
        'Apply slow and fast pointer variables to isolate cyclic paths or locate midpoint elements.'
      ],
      complexity: [
        { label: 'Access', value: 'O(n)', note: 'Requires linear link traversal' },
        { label: 'Search', value: 'O(n)', note: 'Requires sequential node scans' },
        { label: 'Insertion', value: 'O(1)', note: 'Requires pointer rewrites once target is located' },
        { label: 'Deletion', value: 'O(1)', note: 'Requires pointer rewrites once target is located' }
      ],
      implementationCpp: `struct Node {\n  int val;\n  Node* next;\n  Node(int x) : val(x), next(nullptr) {}\n};\n\n// Reverses a singly-linked list in place\nNode* reverseList(Node* head) {\n  Node* prev = nullptr;\n  Node* curr = head;\n  while (curr != nullptr) {\n    Node* nextNode = curr->next;\n    curr->next = prev;\n    prev = curr;\n    curr = nextNode;\n  }\n  return prev;\n}`,
      implementationPython: `class Node:\n    def __init__(self, val: int = 0):\n        self.val = val\n        self.next = None\n\n# Reverses a singly-linked list in place\ndef reverse_list(head: Node) -> Node:\n    prev = None\n    curr = head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev`,
      commonMistakes: [
        'Dereferencing null pointer values during tail checks.',
        'Losing reference pointers when link updates are completed in the incorrect sequence.',
        'Failing to clean deleted heap nodes in manual memory environments (C++).'
      ],
      interviewQuestions: [
        'Explain Floyd\'s Cycle Detection (Tortoise and Hare) and how it detects loops in O(n) time.',
        'How does a skip list achieve O(log n) searches on linked listings?',
        'Describe how to reverse a linked list using recursion.'
      ],
      summary: 'Linked lists allow nodes to be scattered dynamically across heap spaces, mapping connections via addresses. They excel in structural splicing but sacrifice random access, requiring linear traversals to locate index values.'
    }
  },
  {
    slug: 'stack',
    title: 'LIFO Call Stacks',
    tagline: 'Track execution history and resolve deep brackets by enforcing Last-In-Free-Out access constraints.',
    category: 'Data Structures',
    readTime: 8,
    lastUpdated: 'June 2026',
    prerequisites: ['linked-list'],
    related: ['arrays', 'linked-list', 'queue', 'backtracking'],
    nextTopic: 'queue',
    prevTopic: 'linked-list',
    practiceProblems: [
      { title: 'Valid Parentheses (LeetCode 20)', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-parentheses/' },
      { title: 'Min Stack (LeetCode 155)', difficulty: 'Medium', url: 'https://leetcode.com/problems/min-stack/' },
      { title: 'Largest Rectangle in Histogram (LeetCode 84)', difficulty: 'Hard', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' }
    ],
    content: {
      introduction: 'A Stack is a linear container that restricts interactions to a single boundary position, known as the top. It operates under the Last-In-First-Out (LIFO) protocol. Stacks can be backed by contiguous arrays or linked chains, ensuring that push, pop, and peek operations run in constant O(1) time.',
      whyImportant: 'Stacks are essential for tracking state and history. The CPU call stack models programmatic recursion, allocating stack frames for local scoping. Evaluating equations, parsing HTML tags, and implementing backtrack paths all rely on stack structures.',
      realWorldApps: [
        'Undo-redo states inside modern text editing applications.',
        'Backtracking tracks in maze solving and graph path solvers.',
        'Low-level expression parsers converting infix equations to postfix.'
      ],
      algorithmDescription: [
        'Push elements onto the top index, resizing if backed by a dynamic array.',
        'Pop elements from the top index, updating the top boundaries.',
        'Evaluate nested symbols using monotonic stacks to locate nearest bounds in linear time.'
      ],
      complexity: [
        { label: 'Push', value: 'O(1)', note: 'Adds to the top' },
        { label: 'Pop', value: 'O(1)', note: 'Removes from the top' },
        { label: 'Peek', value: 'O(1)', note: 'Reads the top element' },
        { label: 'Search', value: 'O(n)', note: 'Requires scanning all elements' }
      ],
      implementationCpp: `#include <vector>\n#include <stdexcept>\nusing namespace std;\n\nclass Stack {\n  vector<int> data;\npublic:\n  void push(int val) { data.push_back(val); }\n  void pop() {\n    if (data.empty()) throw runtime_error("Stack empty");\n    data.pop_back();\n  }\n  int top() {\n    if (data.empty()) throw runtime_error("Stack empty");\n    return data.back();\n  }\n  bool empty() { return data.empty(); }\n};`,
      implementationPython: `class Stack:\n    def __init__(self):\n        self.data = []\n    def push(self, val: int):\n        self.data.append(val)\n    def pop(self):\n        if not self.data: raise IndexError("Stack empty")\n        self.data.pop()\n    def top(self) -> int:\n        if not self.data: raise IndexError("Stack empty")\n        return self.data[-1]\n    def empty(self) -> bool:\n        return len(self.data) == 0`,
      commonMistakes: [
        'Popping elements from empty stacks, causing null errors.',
        'Stack overflows due to unbounded recursion tree frames.',
        'Using linear array scans when a monotonic stack could reduce complexity to O(n).'
      ],
      interviewQuestions: [
        'How do you design a stack that supports push, pop, and retrieving the minimum element in O(1) time?',
        'Describe how to implement a queue using two stacks.',
        'How does a monotonic stack help locate the "next greater element" in an array?'
      ],
      summary: 'Stacks restrict interactions to the top node, modeling recursion and evaluation histories. Their LIFO protocol is perfect for managing nested scopes, brackets, and backtracking configurations.'
    }
  },
  {
    slug: 'queue',
    title: 'FIFO Message Queues',
    tagline: 'Coordinate asynchronous task schedules and traverse graph trees layer by layer using First-In-First-Out pipelines.',
    category: 'Data Structures',
    readTime: 8,
    lastUpdated: 'June 2026',
    prerequisites: ['linked-list'],
    related: ['arrays', 'linked-list', 'stack', 'bfs'],
    nextTopic: 'binary-search',
    prevTopic: 'stack',
    practiceProblems: [
      { title: 'Implement Queue using Stacks (LeetCode 232)', difficulty: 'Easy', url: 'https://leetcode.com/problems/implement-queue-using-stacks/' },
      { title: 'Design Circular Queue (LeetCode 622)', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-circular-queue/' },
      { title: 'Sliding Window Maximum (LeetCode 239)', difficulty: 'Hard', url: 'https://leetcode.com/problems/sliding-window-maximum/' }
    ],
    content: {
      introduction: 'A Queue is a linear container that operates under the First-In-First-Out (FIFO) protocol. Elements are inserted at the back (enqueue) and removed from the front (dequeue). Queues are often implemented using circular arrays or linked lists to prevent index drift, maintaining constant O(1) runtimes for operations.',
      whyImportant: 'Queues synchronize asynchronous events. They manage task lists, throttle server networks, and handle printer queues. In algorithms, queues are the core structure behind Breadth-First Search (BFS) graph traversals.',
      realWorldApps: [
        'CPU scheduler queues distributing processing time across active threads.',
        'Message brokers buffering events between microservices.',
        'Level-order BFS traversal queues tracking structural graph rings.'
      ],
      algorithmDescription: [
        'Enqueue items at the back, shifting pointers or adjusting wrapping arrays.',
        'Dequeue items from the front, advancing front markers.',
        'Manage double-ended queues (deques) to insert or delete from both ends.'
      ],
      complexity: [
        { label: 'Enqueue', value: 'O(1)', note: 'Adds to the back' },
        { label: 'Dequeue', value: 'O(1)', note: 'Removes from the front' },
        { label: 'Front/Rear', value: 'O(1)', note: 'Constant time peek' },
        { label: 'Search', value: 'O(n)', note: 'Requires scanning all elements' }
      ],
      implementationCpp: `#include <vector>\n#include <stdexcept>\nusing namespace std;\n\nclass CircularQueue {\n  vector<int> data;\n  int front, rear, size, capacity;\npublic:\n  CircularQueue(int c) : capacity(c), front(0), rear(-1), size(0) {\n    data.resize(c);\n  }\n  void enqueue(int val) {\n    if (size == capacity) throw runtime_error("Queue full");\n    rear = (rear + 1) % capacity;\n    data[rear] = val;\n    size++;\n  }\n  void dequeue() {\n    if (size == 0) throw runtime_error("Queue empty");\n    front = (front + 1) % capacity;\n    size--;\n  }\n  int getFront() {\n    if (size == 0) throw runtime_error("Queue empty");\n    return data[front];\n  }\n};`,
      implementationPython: `class CircularQueue:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.data = [None] * capacity\n        self.front = 0\n        self.rear = -1\n        self.size = 0\n\n    def enqueue(self, val: int):\n        if self.size == self.capacity: raise IndexError("Queue full")\n        self.rear = (self.rear + 1) % self.capacity\n        self.data[self.rear] = val\n        self.size += 1\n\n    def dequeue(self):\n        if self.size == 0: raise IndexError("Queue empty")\n        self.front = (self.front + 1) % self.capacity\n        self.size -= 1\n\n    def get_front(self) -> int:\n        if self.size == 0: raise IndexError("Queue empty")\n        return self.data[self.front]`,
      commonMistakes: [
        'Dequeuing elements from empty queues, causing null reference errors.',
        'Naively shifting elements in a standard array on dequeue, which turns a constant-time operation into O(n).',
        'Failing to handle modulo boundaries in circular queue structures.'
      ],
      interviewQuestions: [
        'How does a double-ended queue (deque) support O(1) pushes and pops at both ends?',
        'Describe how to implement BFS on a graph using a queue.',
        'How do you design a queue using circular array offsets?'
      ],
      summary: 'Queues preserve temporal order through FIFO queuing. They are vital for task buffering and level-order graph explorations.'
    }
  },
  {
    slug: 'binary-search',
    title: 'Interval Bisection (Binary Search)',
    tagline: 'Halve the search space at each step, locating target configurations in sorted arrays with logarithmic speed.',
    category: 'Algorithms',
    readTime: 10,
    lastUpdated: 'June 2026',
    visualizerId: 'binary-search',
    prerequisites: ['arrays'],
    related: ['arrays', 'segment-tree', 'dynamic-programming', 'greedy'],
    nextTopic: 'bfs',
    prevTopic: 'queue',
    practiceProblems: [
      { title: 'Binary Search (LeetCode 704)', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/' },
      { title: 'Find First and Last Position of Element in Sorted Array (LeetCode 34)', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/' },
      { title: 'Split Array Largest Sum (LeetCode 410)', difficulty: 'Hard', url: 'https://leetcode.com/problems/split-array-largest-sum/' }
    ],
    content: {
      introduction: 'Binary Search is a divide-and-conquer algorithm designed to locate a target in a sorted collection. It works by checking the middle element of a range. If the target is not found, we discard the half that cannot contain it. This bisection reduces the search space logarithmically, running in O(log n) time.',
      whyImportant: 'Binary search is highly efficient. For an array of 1 million elements, it finds the target in at most 20 checks. It is also used in "binary search on answer" techniques, which solve optimization problems by testing value boundaries.',
      realWorldApps: [
        'Database indexing queries finding key offsets in sorted page files.',
        'Version control engines locating compiler bugs via bisect logs.',
        'Network systems mapping packet intervals to locate bottlenecks.'
      ],
      algorithmDescription: [
        'Set `lo` and `hi` boundaries to cover the entire sorted array range.',
        'Compute `mid = lo + (hi - lo) / 2` to prevent integer overflow.',
        'Adjust boundaries based on the comparison of the target and the middle element: `lo = mid + 1` or `hi = mid - 1`.',
        'Terminate when `lo > hi`, indicating the target is absent.'
      ],
      complexity: [
        { label: 'Best', value: 'O(1)', note: 'Target matches the midpoint on the first check' },
        { label: 'Average', value: 'O(log n)', note: 'Halves the range at each step' },
        { label: 'Worst', value: 'O(log n)', note: 'Halves the range at each step' },
        { label: 'Space', value: 'O(1)', note: 'Iterative in-place search' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& arr, int target) {\n  int lo = 0, hi = (int)arr.size() - 1;\n  while (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (arr[mid] == target) return mid;\n    if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1; // absent\n}`,
      implementationPython: `def binary_search(arr: list, target: int) -> int:\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = lo + (hi - lo) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1 # absent`,
      commonMistakes: [
        'Running binary search on unsorted arrays, which yields garbage results.',
        'Writing `(lo + hi) / 2`, which can cause integer overflow in languages with fixed-size types.',
        'Off-by-one errors in boundary updates, leading to infinite loops.'
      ],
      interviewQuestions: [
        'Explain how to find the lower bound (first element >= target) using binary search.',
        'How do you search for a target in a rotated sorted array in O(log n)?',
        'Describe the "Binary Search on Answer" technique and how to write its decision predicate.'
      ],
      summary: 'Binary search is a logarithmic search algorithm that halves the search space at each step. It is highly efficient and serves as a core tool for optimization problems on sorted data.'
    }
  },
  {
    slug: 'bfs',
    title: 'Breadth-First Search (BFS)',
    tagline: 'Explore graph topologies level by level, locating shortest pathways in unweighted networks.',
    category: 'Algorithms',
    readTime: 10,
    lastUpdated: 'June 2026',
    visualizerId: 'bfs-graph',
    prerequisites: ['queue'],
    related: ['queue', 'dfs', 'dijkstra', 'linked-list'],
    nextTopic: 'dfs',
    prevTopic: 'binary-search',
    practiceProblems: [
      { title: 'Binary Tree Level Order Traversal (LeetCode 102)', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { title: 'Rotting Oranges (LeetCode 994)', difficulty: 'Medium', url: 'https://leetcode.com/problems/rotting-oranges/' },
      { title: 'Word Ladder (LeetCode 127)', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-ladder/' }
    ],
    content: {
      introduction: 'Breadth-First Search (BFS) is a graph traversal algorithm that starts at a source node and explores all of its neighbors before moving to the next level. By using a queue to track the frontier of nodes, BFS visits nodes in order of their distance from the source, making it ideal for finding shortest paths in unweighted graphs.',
      whyImportant: 'BFS is standard for finding shortest paths in networks where all edges have the same weight. It is also used to find connected components, test bipartite status, and model propagation (like flooding or epidemics) in social and network graphs.',
      realWorldApps: [
        'Social networks finding degree-of-separation boundaries between users.',
        'GPS routing engines locating paths with the fewest stops in transit networks.',
        'Garbage collection engines identifying live heap pointer allocations.'
      ],
      algorithmDescription: [
        'Enqueue the starting source node and mark it as visited.',
        'While the queue is not empty, dequeue the current node.',
        'Inspect all unvisited neighbors, mark them as visited, and enqueue them.',
        'Repeat until the queue is empty, visiting nodes level by level.'
      ],
      complexity: [
        { label: 'Time', value: 'O(V + E)', note: 'Visits all vertices and edge routes' },
        { label: 'Space', value: 'O(V)', note: 'Queue buffers worst-case level nodes' }
      ],
      implementationCpp: `#include <vector>\n#include <queue>\nusing namespace std;\n\nvoid bfs(int start, const vector<vector<int>>& adj) {\n  int n = adj.size();\n  vector<bool> visited(n, false);\n  queue<int> q;\n\n  visited[start] = true;\n  q.push(start);\n\n  while (!q.empty()) {\n    int u = q.front(); q.pop();\n    // Process node u\n    for (int v : adj[u]) {\n      if (!visited[v]) {\n        visited[v] = true;\n        q.push(v);\n      }\n    }\n  }\n}`,
      implementationPython: `from collections import deque\n\ndef bfs(start: int, adj: list):\n    n = len(adj)\n    visited = [False] * n\n    q = deque([start])\n    visited[start] = True\n\n    while q:\n      u = q.popleft()\n      # Process node u\n      for v in adj[u]:\n          if not visited[v]:\n              visited[v] = True\n              q.append(v)`,
      commonMistakes: [
        'Forgetting to mark a node as visited when enqueuing it, which can cause nodes to be added multiple times and lead to infinite loops.',
        'Using BFS to find shortest paths in graphs with negative weights or general weights (use Dijkstra or Bellman-Ford instead).',
        'Confusing recursive traversal patterns with the queue-based implementation of BFS.'
      ],
      interviewQuestions: [
        'Explain how to find the shortest path in an unweighted grid maze using BFS.',
        'How do you write a multi-source BFS solver for propagation problems?',
        'Describe how to test if a graph is bipartite (2-colorable) using BFS.'
      ],
      summary: 'BFS explores graphs level by level using a queue. It is the go-to algorithm for finding shortest paths in unweighted graphs and modeling network propagation.'
    }
  },
  {
    slug: 'dfs',
    title: 'Depth-First Search (DFS)',
    tagline: 'Drill deep into graph pathways using recursion, identifying cycles and task dependency orders.',
    category: 'Algorithms',
    readTime: 10,
    lastUpdated: 'June 2026',
    visualizerId: 'dfs-graph',
    prerequisites: ['stack'],
    related: ['stack', 'bfs', 'dijkstra', 'backtracking'],
    nextTopic: 'heap',
    prevTopic: 'bfs',
    practiceProblems: [
      { title: 'Number of Islands (LeetCode 200)', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { title: 'Course Schedule (LeetCode 207)', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' },
      { title: 'Critical Connections in a Network (LeetCode 1192)', difficulty: 'Hard', url: 'https://leetcode.com/problems/critical-connections-in-a-network/' }
    ],
    content: {
      introduction: 'Depth-First Search (DFS) is a graph traversal algorithm that explores as deep as possible along each branch before backtracking. Typically implemented using recursion (which uses the call stack) or an explicit stack, DFS is ideal for tasks that require visiting every node, detecting cycles, or resolving task dependencies.',
      whyImportant: 'DFS is the basis for many advanced graph algorithms. It is used to find topological orders (DAG sorting), identify connected components, detect cycles, find articulation points/bridges, and solve puzzles like mazes where you explore paths to their end.',
      realWorldApps: [
        'Build compilers resolving task dependencies in software builds.',
        'Automated solvers exploring maze paths and decision trees.',
        'Topology scanners detecting feedback loops in computer networks.'
      ],
      algorithmDescription: [
        'Start at a source node and mark it as visited.',
        'For each unvisited neighbor, recursively call DFS to explore its path.',
        'Backtrack once a node has no unvisited neighbors, returning up the call stack.',
        'Repeat until all reachable nodes have been visited.'
      ],
      complexity: [
        { label: 'Time', value: 'O(V + E)', note: 'Visits all vertices and edge routes' },
        { label: 'Space', value: 'O(V)', note: 'Stack space tracks recursive call stack depth' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\n\nvoid dfsHelper(int u, const vector<vector<int>>& adj, vector<bool>& visited) {\n  visited[u] = true;\n  // Process node u\n  for (int v : adj[u]) {\n    if (!visited[v]) {\n      dfsHelper(v, adj, visited);\n    }\n  }\n}\n\nvoid dfs(int start, const vector<vector<int>>& adj) {\n  vector<bool> visited(adj.size(), false);\n  dfsHelper(start, adj, visited);\n}`,
      implementationPython: `def dfs(start: int, adj: list):\n    visited = [False] * len(adj)\n    \n    def dfs_helper(u):\n        visited[u] = True\n        # Process node u\n        for v in adj[u]:\n            if not visited[v]:\n                dfs_helper(v)\n                \n    dfs_helper(start)`,
      commonMistakes: [
        'Failing to use a visited checklist on graphs, which leads to infinite recursion loops.',
        'Exceeding the recursion stack limit on deep, linear graphs (consider an iterative stack instead).',
        'Assuming DFS paths represent shortest paths (DFS can find paths, but not necessarily the shortest ones).'
      ],
      interviewQuestions: [
        'How do you detect a cycle in a directed graph using DFS and color markers?',
        'Describe how to implement topological sort using post-order DFS.',
        'How does Tarjan\'s SCC algorithm use low-link values computed during DFS?'
      ],
      summary: 'DFS drills deep into graph branches using recursion. It is the foundation for cycle detection, topological sorting, and resolving structural network properties.'
    }
  },
  {
    slug: 'heap',
    title: 'Binary Heaps & Priority Queues',
    tagline: 'Balance complete trees dynamically, securing constant-time access to maximum/minimum elements.',
    category: 'Data Structures',
    readTime: 10,
    lastUpdated: 'June 2026',
    visualizerId: 'heap-sort',
    prerequisites: ['arrays'],
    related: ['arrays', 'trie', 'segment-tree', 'greedy'],
    nextTopic: 'trie',
    prevTopic: 'dfs',
    practiceProblems: [
      { title: 'Kth Largest Element in an Array (LeetCode 215)', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { title: 'Merge k Sorted Lists (LeetCode 23)', difficulty: 'Hard', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { title: 'Find Median from Data Stream (LeetCode 295)', difficulty: 'Hard', url: 'https://leetcode.com/problems/find-median-from-data-stream/' }
    ],
    content: {
      introduction: 'A Binary Heap is a complete binary tree that maintains the "heap property": in a min-heap, each node\'s value is less than or equal to its children\'s values; in a max-heap, it is greater than or equal. Because it is a complete tree, a heap can be represented compactly as a single array, avoiding pointer overhead.',
      whyImportant: 'Heaps are the core structure behind priority queues. They support constant-time O(1) lookups of the minimum or maximum element, and logarithmic O(log n) insertions and extractions. They are vital for algorithms like Dijkstra\'s shortest path and heapsort.',
      realWorldApps: [
        'Network bandwidth routers prioritizing packet transmissions.',
        'Heap tables sorting threads dynamically in Operating System kernels.',
        'Stream processing engines dynamically calculating running medians.'
      ],
      algorithmDescription: [
        'Represent the tree in a linear array: node `i` has children at `2i + 1` and `2i + 2`.',
        'Bubble up (sift-up) newly inserted nodes at the end of the array to restore the heap property.',
        'Bubble down (sift-down) the replacement root node after an extraction to restore balance.',
        'Build a heap from an array in O(n) time by calling sift-down on all non-leaf nodes.'
      ],
      complexity: [
        { label: 'Peek', value: 'O(1)', note: 'Root is always at index 0' },
        { label: 'Insert', value: 'O(log n)', note: 'Requires bubbling up' },
        { label: 'Extract Min/Max', value: 'O(log n)', note: 'Requires bubbling down replacement node' },
        { label: 'Heapify', value: 'O(n)', note: 'Builds heap bottom-up' }
      ],
      implementationCpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass MinHeap {\n  vector<int> heap;\n  void siftUp(int i) {\n    while (i > 0 && heap[(i - 1) / 2] > heap[i]) {\n      swap(heap[i], heap[(i - 1) / 2]);\n      i = (i - 1) / 2;\n    }\n  }\npublic:\n  void insert(int val) {\n    heap.push_back(val);\n    siftUp(heap.size() - 1);\n  }\n  int getMin() { return heap.empty() ? -1 : heap[0]; }\n};`,
      implementationPython: `class MinHeap:\n    def __init__(self):\n        self.heap = []\n\n    def insert(self, val: int):\n        self.heap.append(val)\n        self._sift_up(len(self.heap) - 1)\n\n    def _sift_up(self, i: int):\n        while i > 0 and self.heap[(i - 1) // 2] > self.heap[i]:\n            p = (i - 1) // 2\n            self.heap[i], self.heap[p] = self.heap[p], self.heap[i]\n            i = p\n\n    def get_min(self) -> int:\n        return self.heap[0] if self.heap else -1`,
      commonMistakes: [
        'Assuming a binary heap is fully sorted (it only maintains parent-child relationships, not sorting across levels).',
        'Writing parent/child index formulas without checking bounds, leading to index errors.',
        'Using sorting algorithms to repeatedly find the minimum element instead of maintaining a heap.'
      ],
      interviewQuestions: [
        'Explain how heapsort works and why it runs in O(n log n) time and O(1) auxiliary space.',
        'How do you design a system that dynamically calculates the running median of a stream using two heaps?',
        'Prove why the bottom-up heapify algorithm runs in linear O(n) time.'
      ],
      summary: 'Binary heaps maintain min/max elements at the root of a complete binary tree. Their array-backed layout provides constant-time peeks and logarithmic updates, making them ideal for priority queuing.'
    }
  },
  {
    slug: 'trie',
    title: 'Tries & Prefix Trees',
    tagline: 'Resolve string prefix queries and auto-completions in linear time relative to key length.',
    category: 'Data Structures',
    readTime: 10,
    lastUpdated: 'June 2026',
    prerequisites: ['linked-list'],
    related: ['linked-list', 'segment-tree', 'string-algorithms', 'heap'],
    nextTopic: 'segment-tree',
    prevTopic: 'heap',
    practiceProblems: [
      { title: 'Implement Trie (Prefix Tree) (LeetCode 208)', difficulty: 'Medium', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
      { title: 'Word Search II (LeetCode 212)', difficulty: 'Hard', url: 'https://leetcode.com/problems/word-search-ii/' },
      { title: 'Design Add and Search Words Data Structure (LeetCode 211)', difficulty: 'Medium', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' }
    ],
    content: {
      introduction: 'A Trie (Prefix Tree) is an ordered tree structure where nodes represent characters along string keys. Instead of storing whole strings in individual nodes, strings are mapped as paths from the root. This character path sharing makes Tries ideal for dictionary searches, prefix matches, and auto-completion queries.',
      whyImportant: 'Tries resolve prefix matching queries in time proportional to the length of the query string `O(L)`, independent of dictionary size. While they can consume significant memory, they are faster than hash tables for prefix lookups and avoid hash collision overhead.',
      realWorldApps: [
        'Auto-completion engines suggesting search terms in real time.',
        'Spell checkers scanning dictionaries for spelling errors.',
        'IP routing tables matching network addresses to routing prefixes.'
      ],
      algorithmDescription: [
        'Start at the root node; each child pointer maps to a character slot.',
        'Insert words by following character transitions, creating new nodes as needed.',
        'Mark the final character node with an end-of-word flag.',
        'Search for prefixes by tracing character links, returning false if a node is missing.'
      ],
      complexity: [
        { label: 'Insert', value: 'O(L)', note: 'L is the word length' },
        { label: 'Search Word', value: 'O(L)', note: 'Traces L character nodes' },
        { label: 'Search Prefix', value: 'O(L)', note: 'Traces L character nodes' },
        { label: 'Space', value: 'O(A * L * N)', note: 'A is alphabet size, N is number of words' }
      ],
      implementationCpp: `#include <string>\nusing namespace std;\n\nstruct TrieNode {\n  TrieNode* children[26];\n  bool isWord;\n  TrieNode() {\n    isWord = false;\n    for (int i = 0; i < 26; ++i) children[i] = nullptr;\n  }\n};\n\nclass Trie {\n  TrieNode* root;\npublic:\n  Trie() { root = new TrieNode(); }\n  void insert(const string& word) {\n    TrieNode* curr = root;\n    for (char c : word) {\n      int idx = c - 'a';\n      if (!curr->children[idx]) curr->children[idx] = new TrieNode();\n      curr = curr->children[idx];\n    }\n    curr->isWord = true;\n  }\n};`,
      implementationPython: `class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word: str):\n        curr = self.root\n        for c in word:\n            if c not in curr.children:\n                curr.children[c] = TrieNode()\n            curr = curr.children[c]\n        curr.is_word = True`,
      commonMistakes: [
        'Creating children arrays of fixed sizes (like 26) when string keys contain unicode or special characters (consider maps/hashes instead).',
        'Failing to clean up allocated nodes when deleting words from a Trie, causing memory leaks.',
        'Naively using a Trie for small dictionaries where simple hash sets would consume less memory.'
      ],
      interviewQuestions: [
        'How do you implement search autocomplete that returns all words matching a prefix using a Trie?',
        'Describe how a Bitwise Trie is used to find the maximum XOR of two numbers in an array.',
        'How do you delete a word from a Trie recursively while cleaning up unused nodes?'
      ],
      summary: 'Tries store string keys along character paths. They support O(L) lookups for prefixes and words, making them essential for spell checkers and autocomplete engines.'
    }
  },
  {
    slug: 'segment-tree',
    title: 'Segment Trees & Lazy Propagation',
    tagline: 'Resolve range query sums and batch modifications on mutable arrays in logarithmic time.',
    category: 'Advanced CP',
    readTime: 12,
    lastUpdated: 'June 2026',
    visualizerId: 'segment-tree-algo',
    prerequisites: ['arrays'],
    related: ['arrays', 'binary-search', 'trie', 'dynamic-programming'],
    nextTopic: 'dijkstra',
    prevTopic: 'trie',
    practiceProblems: [
      { title: 'Range Sum Query - Mutable (LeetCode 307)', difficulty: 'Medium', url: 'https://leetcode.com/problems/range-sum-query-mutable/' },
      { title: 'Online Majority Element in Subarray (LeetCode 1157)', difficulty: 'Hard', url: 'https://leetcode.com/problems/online-majority-element-in-subarray/' },
      { title: 'Rectangle Area II (LeetCode 850)', difficulty: 'Hard', url: 'https://leetcode.com/problems/rectangle-area-ii/' }
    ],
    content: {
      introduction: 'A Segment Tree is a binary tree used for storing intervals or segments. It allows querying range values (like sum, minimum, or maximum) and updating elements in an array in logarithmic `O(log n)` time. By deferring node updates via Lazy Propagation, it can modify ranges of elements in O(log n) time.',
      whyImportant: 'Segment trees are critical for competitive programming and database indexing. While simple arrays take O(n) for range queries and O(1) for updates, segment trees balance both operations to run in O(log n) time.',
      realWorldApps: [
        'Geospatial databases querying elements inside coordinate bounds.',
        'Graphics engines tracking visible intervals along rendering sweeps.',
        'Analytics databases calculating aggregate statistics over time series intervals.'
      ],
      algorithmDescription: [
        'Divide intervals in half, building segment tree nodes from child sums.',
        'Resolve range queries by combining results from overlapping segment nodes.',
        'Update elements by updating the corresponding leaf node and propagating changes back to the root.',
        'Apply Lazy Propagation: defer node updates, storing changes in a lazy array and applying them only when children are accessed.'
      ],
      complexity: [
        { label: 'Build', value: 'O(n)', note: 'Constructs segment tree nodes bottom-up' },
        { label: 'Query Range', value: 'O(log n)', note: 'Visits at most 4 nodes per tree level' },
        { label: 'Update Element', value: 'O(log n)', note: 'Traverses path from leaf to root' },
        { label: 'Update Range', value: 'O(log n)', note: 'Runs in O(log n) with Lazy Propagation' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\n\nclass SegmentTree {\n  vector<int> tree;\n  int n;\n  void build(const vector<int>& arr, int node, int start, int end) {\n    if (start == end) { tree[node] = arr[start]; return; }\n    int mid = (start + end) / 2;\n    build(arr, 2 * node, start, mid);\n    build(arr, 2 * node + 1, mid + 1, end);\n    tree[node] = tree[2 * node] + tree[2 * node + 1];\n  }\npublic:\n  SegmentTree(const vector<int>& arr) {\n    n = arr.size();\n    tree.resize(4 * n);\n    build(arr, 1, 0, n - 1);\n  }\n};`,
      implementationPython: `class SegmentTree:\n    def __init__(self, arr: list):\n        self.n = len(arr)\n        self.tree = [0] * (4 * self.n)\n        self._build(arr, 1, 0, self.n - 1)\n\n    def _build(self, arr: list, node: int, start: int, end: int):\n        if start == end:\n            self.tree[node] = arr[start]\n            return\n        mid = (start + end) // 2\n        self._build(arr, 2 * node, start, mid)\n        self._build(arr, 2 * node + 1, mid + 1, end)\n        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]`,
      commonMistakes: [
        'Allocating insufficient space for the segment tree array (always allocate 4 * n elements).',
        'Off-by-one boundary checks in range queries, leading to incorrect calculations.',
        'Forgetting to update and clear lazy buffer arrays when querying ranges.'
      ],
      interviewQuestions: [
        'Explain how Lazy Propagation optimizes range updates from O(n) to O(log n).',
        'How does a Fenwick Tree (BIT) compare to a Segment Tree regarding features and memory usage?',
        'Describe how to find the first element in a range that is >= a target value using a segment tree.'
      ],
      summary: 'Segment trees partition array intervals recursively. They balance both range queries and node updates to run in O(log n) time, utilizing lazy propagation to manage range updates efficiently.'
    }
  },
  {
    slug: 'dijkstra',
    title: "Dijkstra's Shortest Path",
    tagline: 'Relax relational graph edges sequentially, computing single-source shortest paths in weighted networks.',
    category: 'Algorithms',
    readTime: 12,
    lastUpdated: 'June 2026',
    visualizerId: 'dijkstra',
    prerequisites: ['dfs', 'heap'],
    related: ['dfs', 'bfs', 'heap', 'dynamic-programming'],
    nextTopic: 'dynamic-programming',
    prevTopic: 'segment-tree',
    practiceProblems: [
      { title: 'Network Delay Time (LeetCode 743)', difficulty: 'Medium', url: 'https://leetcode.com/problems/network-delay-time/' },
      { title: 'Path with Maximum Probability (LeetCode 1514)', difficulty: 'Medium', url: 'https://leetcode.com/problems/path-with-maximum-probability/' },
      { title: 'Swim in Rising Water (LeetCode 778)', difficulty: 'Hard', url: 'https://leetcode.com/problems/swim-in-rising-water/' }
    ],
    content: {
      introduction: "Dijkstra's algorithm is a greedy search algorithm that finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights. By repeatedly visiting the unvisited node with the smallest tentative distance (using a priority queue), it relaxes edge weights in O(E log V) time.",
      whyImportant: "Dijkstra's algorithm is standard for network routing. It computes shortest paths efficiently and is the core engine behind routing protocols like OSPF and GPS mapping services.",
      realWorldApps: [
        'GPS routing engines calculating shortest travel routes between junctions.',
        'Network routing algorithms routing packet data through servers.',
        'Game AI engines pathfinding across grid navigation meshes.'
      ],
      algorithmDescription: [
        'Initialize all node distances to infinity, setting the source distance to 0.',
        'Push the source node into a min-priority queue (sorted by distance).',
        'Extract the node with the smallest distance and relax all of its adjacent edges.',
        'If a shorter path to a neighbor is found, update its distance and push it into the queue.',
        'Repeat until the priority queue is empty, resolving shortest paths.'
      ],
      complexity: [
        { label: 'Time', value: 'O(E log V)', note: 'E is edge count, V is vertex count, uses priority queue updates' },
        { label: 'Space', value: 'O(V)', note: 'Stores tentative distance arrays and node keys' }
      ],
      implementationCpp: `#include <vector>\n#include <queue>\nusing namespace std;\n\nstruct Edge { int to, weight; };\n\nvector<int> dijkstra(int n, int src, const vector<vector<Edge>>& adj) {\n  vector<int> dist(n, 1e9);\n  priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n\n  dist[src] = 0;\n  pq.push({0, src});\n\n  while (!pq.empty()) {\n    auto [d, u] = pq.top(); pq.pop();\n    if (d > dist[u]) continue;\n    for (auto& edge : adj[u]) {\n      if (dist[edge.to] > dist[u] + edge.weight) {\n        dist[edge.to] = dist[u] + edge.weight;\n        pq.push({dist[edge.to], edge.to});\n      }\n    }\n  }\n  return dist;\n}`,
      implementationPython: `import heapq\n\ndef dijkstra(n: int, src: int, adj: list) -> list:\n    dist = [float('inf')] * n\n    pq = [(0, src)]\n    dist[src] = 0\n\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, weight in adj[u]:\n            if dist[v] > dist[u] + weight:\n                dist[v] = dist[u] + weight\n                heapq.heappush(pq, (dist[v], v))\n    return dist`,
      commonMistakes: [
        "Calling Dijkstra's algorithm on graphs with negative edge weights, which can lead to incorrect results or infinite loops (use Bellman-Ford instead).",
        'Forgetting to check `d > dist[u]` inside the queue loop, which can cause redundant edge processing and degrade performance.',
        'Using a linear array scan to find the minimum distance node instead of a priority queue, which increases complexity to O(V²).'
      ],
      interviewQuestions: [
        "Explain how Dijkstra's algorithm differs from Prim's MST algorithm.",
        'How does Bellman-Ford resolve shortest paths in graphs with negative weights?',
        'Describe how to reconstruct the shortest path route after running the distance relaxations.'
      ],
      summary: "Dijkstra's algorithm finds shortest paths in weighted graphs using a priority queue. It relaxes edge weights greedily to compute optimal routes in O(E log V) time."
    }
  },
  {
    slug: 'dynamic-programming',
    title: 'Dynamic Programming (DP)',
    tagline: 'Decompose complex problems recursively, caching optimal subproblem solutions to prevent redundant work.',
    category: 'Algorithms',
    readTime: 15,
    lastUpdated: 'June 2026',
    visualizerId: '2d-dp',
    prerequisites: ['arrays'],
    related: ['arrays', 'binary-search', 'dijkstra', 'greedy'],
    nextTopic: 'greedy',
    prevTopic: 'dijkstra',
    practiceProblems: [
      { title: 'Climbing Stairs (LeetCode 70)', difficulty: 'Easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { title: 'Coin Change (LeetCode 322)', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/' },
      { title: 'Longest Common Subsequence (LeetCode 1143)', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-common-subsequence/' }
    ],
    content: {
      introduction: 'Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler subproblems. It is applicable when subproblems overlap and show "optimal substructure" (the global solution can be built from optimal subproblem solutions). DP avoids redundant work by storing subproblem results in a lookup cache.',
      whyImportant: 'DP is a powerful tool for optimization. It replaces exponential-time recursive algorithms with polynomial-time solutions by using memoization (top-down caching) or tabulation (bottom-up table compilation). It is key for problems like string alignment, knapsack optimization, and shortest paths.',
      realWorldApps: [
        'Diff engines comparing code files using Longest Common Subsequence (LCS).',
        'Text editors aligning word wraps dynamically to fit margins.',
        'Financial planners optimizing investment portfolios across risk limits.'
      ],
      algorithmDescription: [
        'Identify the recursive recurrence relation that links subproblem configurations.',
        'Define base cases for the smallest subproblem instances.',
        'Memoize (top-down): cache recursive function calls in a hash table or array.',
        'Tabulate (bottom-up): compile subproblem results iteratively, filling a table from bottom to top.'
      ],
      complexity: [
        { label: 'Time', value: 'O(State count * State transition time)', note: 'Often reduces exponential runtimes to linear or quadratic' },
        { label: 'Space', value: 'O(State count)', note: 'Lookup cache tables. Can often be optimized to use less space' }
      ],
      implementationCpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\n// 0/1 Knapsack tabulation\nint knapsack(int W, const vector<int>& wt, const vector<int>& val, int n) {\n  vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));\n  for (int i = 1; i <= n; i++) {\n    for (int w = 1; w <= W; w++) {\n      if (wt[i - 1] <= w) {\n        dp[i][w] = max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);\n      } else {\n        dp[i][w] = dp[i - 1][w];\n      }\n    }\n  }\n  return dp[n][W];\n}`,
      implementationPython: `def knapsack(W: int, wt: list, val: list, n: int) -> int:\n    dp = [[0] * (W + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for w in range(1, W + 1):\n            if wt[i - 1] <= w:\n                dp[i][w] = max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w])\n            else:\n                dp[i][w] = dp[i - 1][w]\n    return dp[n][W]`,
      commonMistakes: [
        'Attempting to apply DP to problems that do not show optimal substructure or overlapping subproblems.',
        'Failing to define base cases correctly, which can cause infinite recursion or off-by-one errors.',
        'Using too much memory for lookup tables when space could be optimized (e.g., using only the previous row in a matrix).'
      ],
      interviewQuestions: [
        'Explain the difference between Memoization (top-down) and Tabulation (bottom-up).',
        'How do you optimize the space complexity of a 2D DP matrix to O(cols)?',
        'Describe how to find the Longest Increasing Subsequence (LIS) in O(n log n) time.'
      ],
      summary: 'Dynamic programming optimizes recursive algorithms by caching overlapping subproblem results. Using memoization or tabulation, DP reduces exponential runtimes to polynomial time.'
    }
  },
  {
    slug: 'greedy',
    title: 'Greedy Algorithms',
    tagline: 'Select the local optimum at each step, building global solutions with minimal overhead.',
    category: 'Algorithms',
    readTime: 10,
    lastUpdated: 'June 2026',
    prerequisites: ['arrays'],
    related: ['arrays', 'binary-search', 'dijkstra', 'dynamic-programming'],
    nextTopic: 'backtracking',
    prevTopic: 'dynamic-programming',
    practiceProblems: [
      { title: 'Assign Cookies (LeetCode 455)', difficulty: 'Easy', url: 'https://leetcode.com/problems/assign-cookies/' },
      { title: 'Gas Station (LeetCode 134)', difficulty: 'Medium', url: 'https://leetcode.com/problems/gas-station/' },
      { title: 'Candy (LeetCode 135)', difficulty: 'Hard', url: 'https://leetcode.com/problems/candy/' }
    ],
    content: {
      introduction: 'A Greedy algorithm makes the locally optimal choice at each step with the goal of finding a global optimum. Greedy algorithms do not backtrack: once a choice is made, it is permanent. They are highly efficient but only work when the problem shows the "greedy choice property" (local choices lead to a global solution).',
      whyImportant: 'Greedy algorithms are simple and fast. While dynamic programming evaluates all options, greedy algorithms pick the best option at each step and move on. They are key for problems like Huffman coding, Prim\'s MST, and interval scheduling.',
      realWorldApps: [
        'Huffman coding tree builders compressing file sizes.',
        'E-commerce systems calculating minimal coins needed for transaction changes.',
        'Resource managers scheduling non-overlapping tasks on a CPU.'
      ],
      algorithmDescription: [
        'Define the greedy metric used to rank choices (like value density or deadline urgency).',
        'Sort choices or maintain them in a priority queue.',
        'Loop through the sorted options, greedily picking valid choices.',
        'Verify that picked choices build toward the global solution.'
      ],
      complexity: [
        { label: 'Time', value: 'O(n log n)', note: 'Often dominated by sorting the input elements' },
        { label: 'Space', value: 'O(1)', note: 'Usually operates in-place with minimal tracking' }
      ],
      implementationCpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nstruct Item { int weight, value; };\nbool compare(Item a, Item b) {\n  return (double)a.value / a.weight > (double)b.value / b.weight;\n}\n\n// Fractional Knapsack Greedy solver\ndouble fractionalKnapsack(int W, vector<Item>& items) {\n  sort(items.begin(), items.end(), compare);\n  double valSum = 0.0;\n  for (auto& item : items) {\n    if (item.weight <= W) {\n      W -= item.weight;\n      valSum += item.value;\n    } else {\n      valSum += item.value * ((double)W / item.weight);\n      break;\n    }\n  }\n  return valSum;\n}`,
      implementationPython: `class Item:\n    def __init__(self, weight: int, value: int):\n        self.weight = weight\n        self.value = value\n\n# Fractional Knapsack Greedy solver\ndef fractional_knapsack(W: int, items: list) -> float:\n    items.sort(key=lambda x: x.value / x.weight, reverse=True)\n    val_sum = 0.0\n    for item in items:\n        if item.weight <= W:\n            W -= item.weight\n            val_sum += item.value\n        else:\n            val_sum += item.value * (W / item.weight)\n            break\n    return val_sum`,
      commonMistakes: [
        'Applying a greedy approach to problems that require evaluating all options (like 0/1 Knapsack, which requires DP).',
        'Failing to sort input elements before applying the greedy choice rule.',
        'Picking an incorrect greedy metric that does not lead to a global optimum.'
      ],
      interviewQuestions: [
        'Explain when you would reach for Greedy vs Dynamic Programming.',
        'How does the Fractional Knapsack greedy sort compare to the 0/1 Knapsack DP solution?',
        'Describe how to schedule the maximum number of non-overlapping intervals.'
      ],
      summary: 'Greedy algorithms build global solutions by picking the best local option at each step. They are highly efficient but require a proof of correctness to ensure local choices yield global optimums.'
    }
  },
  {
    slug: 'backtracking',
    title: 'Constraint Backtracking',
    tagline: 'Explore search trees recursively, pruning branches that violate constraints to solve combinatorial puzzles.',
    category: 'Algorithms',
    readTime: 12,
    lastUpdated: 'June 2026',
    visualizerId: 'n-queens',
    prerequisites: ['dfs'],
    related: ['dfs', 'stack', 'dynamic-programming', 'greedy'],
    prevTopic: 'greedy',
    practiceProblems: [
      { title: 'Subsets (LeetCode 78)', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets/' },
      { title: 'Permutations (LeetCode 46)', difficulty: 'Medium', url: 'https://leetcode.com/problems/permutations/' },
      { title: 'N-Queens (LeetCode 51)', difficulty: 'Hard', url: 'https://leetcode.com/problems/n-queens/' }
    ],
    content: {
      introduction: 'Backtracking is a systematic method for searching a solution space. It builds candidate solutions recursively, discarding candidates ("backtracking") as soon as it determines they cannot lead to a valid solution. By pruning branches early, backtracking avoids checking all solutions.',
      whyImportant: 'Backtracking solves combinatorial problems (like subsets, permutations, and partitions) and constraint satisfaction puzzles (like Sudoku, N-Queens, and graph coloring). Its recursive pruning handles complex constraint structures.',
      realWorldApps: [
        'Sudoku and crossword puzzle generators evaluating cell constraints.',
        'Logic programming engines resolving variable assignments.',
        'Physical layouts placing components on circuit boards to avoid crossings.'
      ],
      algorithmDescription: [
        'Define a recursive helper function that accepts a partial candidate solution.',
        'At each step, loop through all available choices that can extend the candidate.',
        'Check constraints: if a choice is valid, apply it and recurse.',
        'Revert (backtrack): undo the choice before returning to explore other branches.'
      ],
      complexity: [
        { label: 'Time', value: 'O(b^d)', note: 'b is branching factor, d is depth. Pruning keeps actual runtime far lower' },
        { label: 'Space', value: 'O(d)', note: 'Tracks recursive call stack depth' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\n\nclass NQueens {\n  int N;\n  vector<vector<int>> solutions;\n  bool isSafe(const vector<int>& board, int row, int col) {\n    for (int i = 0; i < col; ++i) {\n      if (board[i] == row || abs(board[i] - row) == abs(i - col)) return false;\n    }\n    return true;\n  }\n  void solve(vector<int>& board, int col) {\n    if (col == N) { solutions.push_back(board); return; }\n    for (int r = 0; r < N; ++r) {\n      if (isSafe(board, r, col)) {\n        board[col] = r;\n        solve(board, col + 1);\n        // Backtrack implicitly occurs by overwriting board[col] next iteration\n      }\n    }\n  }\n};`,       implementationPython: `class NQueens:\n    def __init__(self, N: int):\n        self.N = N\n        self.solutions = []\n\n    def solve(self):\n        board = [-1] * self.N\n        self._backtrack(board, 0)\n        return self.solutions\n\n    def _backtrack(self, board: list, col: int):\n        if col == self.N:\n            self.solutions.append(list(board))\n            return\n        for r in range(self.N):\n            if self._is_safe(board, r, col):\n                board[col] = r\n                self._backtrack(board, col + 1)\n                board[col] = -1 # Backtrack\n\n    def _is_safe(self, board: list, row: int, col: int) -> bool:\n        for i in range(col):\n            if board[i] == row or abs(board[i] - row) == abs(i - col):\n                return False\n        return True`,
      commonMistakes: [
        'Failing to undo state changes (backtrack) before returning from recursive calls, which leaks state to adjacent branches.',
        'Omitting pruning checks, which turns backtracking into a slow brute-force search.',
        'Not establishing clear base cases, leading to infinite recursion loops.'
      ],
      interviewQuestions: [
        'Explain how constraint pruning distinguishes backtracking from simple depth-first searches.',
        'How does the N-Queens solver prune search paths using diagonal arrays?',
        'Describe how to find all subset permutations of a set in O(n * 2^n) time.'
      ],
      summary: 'Backtracking recursively searches for solutions and discards paths that violate constraints. Pruning branches early, it efficiently solves combinatorial problems and constraint satisfaction puzzles.'
    }
  },
  {
    slug: 'searching',
    title: 'Linear, Binary & Multi-Interval Searching',
    tagline: 'Optimize key matching across discrete sorted indices, unimodal functions, and custom bounds using bisection, bounds checks, and ternary splits.',
    category: 'Algorithms',
    readTime: 12,
    lastUpdated: 'June 2026',
    visualizerId: 'binary-search',
    prerequisites: ['arrays'],
    related: ['sorting', 'segment-tree', 'advanced-cp'],
    practiceProblems: [
      { title: 'Binary Search (LeetCode 704)', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/' },
      { title: 'Find First and Last Position (LeetCode 34)', difficulty: 'Medium', url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/' },
      { title: 'Peak Index in a Mountain Array (LeetCode 852)', difficulty: 'Medium', url: 'https://leetcode.com/problems/peak-index-in-a-mountain-array/' }
    ],
    content: {
      introduction: 'Searching is the foundational process of locating specific elements or boundaries in structured datasets. While unsorted bounds mandate O(n) linear scans, sorted properties permit logarithmic O(log n) bisections. Beyond simple equality lookups, searching includes finding transition boundaries (Lower/Upper bounds) and locating optimal values in unimodal shapes via ternary searches.',
      whyImportant: 'Lookup speed is a primary bottleneck in databases, networks, and routers. Optimizing target identification from linear to logarithmic limits allows applications to scale to millions of elements. Standard library utilities like std::lower_bound in C++ or bisect in Python form the core of high-performance range systems.',
      realWorldApps: [
        'Database indexing locating records matching a primary key range.',
        'Version control utilities (git bisect) pinpointing regression commits.',
        'High-precision numeric solvers approximating roots of complex mathematical functions.'
      ],
      algorithmDescription: [
        'Linear Search scans each memory offset sequentially until a match or end is encountered.',
        'Binary Search bisects a sorted array interval recursively, adjusting boundaries left or right by checking the middle element.',
        'Lower Bound locates the first index containing a value greater than or equal to target, while Upper Bound finds the first value strictly greater.',
        'Ternary Search splits the interval into three sections to optimize unimodal function peak points.'
      ],
      complexity: [
        { label: 'Linear Search', value: 'O(n)', note: 'Required on unsorted data' },
        { label: 'Binary Search', value: 'O(log n)', note: 'Bisects range by half each step' },
        { label: 'Ternary Search', value: 'O(log3 n)', note: 'Trisects range to prune unimodal slopes' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& arr, int target) {\n  int low = 0, high = arr.size() - 1;\n  while (low <= high) {\n    int mid = low + (high - low) / 2;\n    if (arr[mid] == target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}`,
      implementationPython: `def binary_search(arr: list, target: int) -> int:\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
      commonMistakes: [
        'Integer overflow when computing middle index using (low + high) / 2 instead of low + (high - low) / 2.',
        'Loop termination crashes due to incorrect boundary update logic like setting low = mid instead of low = mid + 1.',
        'Attempting binary lookup operations on unsorted arrays, yielding incorrect match positions.'
      ],
      interviewQuestions: [
        'Explain the difference between std::lower_bound and std::upper_bound in C++.',
        'How does ternary search optimize peak location in mountain-shaped functions?',
        'Describe how to use binary search on the answer space to solve constraint optimization problems.'
      ],
      summary: 'Sorted datasets allow lookup speeds to improve from linear O(n) scans to O(log n) bisections. By dividing the active interval recursively, binary search and its variants find values and boundaries in logarithmic time.'
    }
  },
  {
    slug: 'sorting',
    title: 'Divide-and-Conquer Sorting Paradigms',
    tagline: 'Deconstruct disorder: Master quadratic comparisons, linear-logarithmic dividers, and linear-time bucket-based distribution sorting.',
    category: 'Algorithms',
    readTime: 15,
    lastUpdated: 'June 2026',
    visualizerId: 'merge-sort',
    prerequisites: ['arrays'],
    related: ['searching', 'heap', 'segment-tree'],
    practiceProblems: [
      { title: 'Sort an Array (LeetCode 912)', difficulty: 'Medium', url: 'https://leetcode.com/problems/sort-an-array/' },
      { title: 'Kth Largest Element (LeetCode 215)', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { title: 'Merge Sorted Array (LeetCode 88)', difficulty: 'Easy', url: 'https://leetcode.com/problems/merge-sorted-array/' }
    ],
    content: {
      introduction: 'Sorting rearranges element arrays into a specified order (numerical or lexicographical). Algorithms split into comparison-based methods, bounded by O(n log n) limits, and non-comparison distribution methods that achieve linear O(n) limits under fixed range assumptions. Understanding their memory, stability, and recursive branching properties is crucial.',
      whyImportant: 'Sorting is the precursor to many optimized tasks, including binary search, duplicate detection, range queries, and graphics rendering. Selecting between in-place algorithms like Quick Sort and stable options like Merge Sort changes application memory footprint and reliability.',
      realWorldApps: [
        'File manager systems rendering folders sorted by file type or timestamp.',
        'Query engines ordering database result rows (ORDER BY clauses).',
        'Graphics engines sorting translucent polygons by camera distance for correct blending.'
      ],
      algorithmDescription: [
        'Bubble, Selection, and Insertion sorts perform quadratic scans, suitable for tiny or near-sorted arrays.',
        'Merge Sort recursively divides the array in half, sorts each part, and merges them using extra buffer space.',
        'Quick Sort partitions elements around a pivot, sorting segments in-place recursively.',
        'Heap Sort builds a binary heap to extract extremums in O(n log n) bounds.',
        'Counting & Radix sorts distribute keys into buckets using digit keys, bypassing comparison limits.'
      ],
      complexity: [
        { label: 'Merge / Heap Sort', value: 'O(n log n)', note: 'Guaranteed time limits' },
        { label: 'Quick Sort', value: 'O(n log n)', note: 'Average case. Worst-case is O(n²) with bad pivots' },
        { label: 'Radix Sort', value: 'O(d * (n + k))', note: 'Linear sorting for d-digit keys in k-base range' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\n\nvoid merge(vector<int>& arr, int l, int m, int r) {\n  vector<int> left(arr.begin() + l, arr.begin() + m + 1);\n  vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);\n  int i = 0, j = 0, k = l;\n  while (i < left.size() && j < right.size()) {\n    if (left[i] <= right[j]) arr[k++] = left[i++];\n    else arr[k++] = right[j++];\n  }\n  while (i < left.size()) arr[k++] = left[i++];\n  while (j < right.size()) arr[k++] = right[j++];\n}\n\nvoid mergeSort(vector<int>& arr, int l, int r) {\n  if (l >= r) return;\n  int m = l + (r - l) / 2;\n  mergeSort(arr, l, m);\n  mergeSort(arr, m + 1, r);\n  merge(arr, l, m, r);\n}`,
      implementationPython: `def merge_sort(arr: list):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(left: list, right: list) -> list:\n    res = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            res.append(left[i]); i += 1\n        else:\n            res.append(right[j]); j += 1\n    res.extend(left[i:])\n    res.extend(right[j:])\n    return res`,
      commonMistakes: [
        'Choosing Quick Sort on sorted inputs without random pivots, degrading time complexity to O(n²).',
        'Unstable sorting overrides sorting history when ordering structures on multiple fields.',
        'Excessive stack allocations during recursive merge divisions, causing stack memory leaks.'
      ],
      interviewQuestions: [
        'Explain the concept of sorting stability and identify which algorithms are stable.',
        'How does dual-pivot quicksort (used in Java/V8) improve cache performance?',
        'Describe how Counting Sort bypasses the O(n log n) comparison limit.'
      ],
      summary: 'Sorting organizes messy arrays using comparison divisions or bucket distributions. Choosing the correct algorithm balances time complexity guarantees, in-place memory limits, and sorting stability.'
    }
  },
  {
    slug: 'tree-traversal',
    title: 'Hierarchical Tree Traversals',
    tagline: 'Navigate tree networks: Master depth-first recursion stack paths, level-by-level breadth queues, and constant-space Morris threading.',
    category: 'Data Structures',
    readTime: 12,
    lastUpdated: 'June 2026',
    visualizerId: 'dfs-tree',
    prerequisites: ['stack', 'queue'],
    related: ['trie', 'segment-tree', 'bfs', 'dfs'],
    practiceProblems: [
      { title: 'Binary Tree Inorder (LeetCode 94)', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
      { title: 'Level Order Traversal (LeetCode 102)', difficulty: 'Medium', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { title: 'Validate BST (LeetCode 98)', difficulty: 'Medium', url: 'https://leetcode.com/problems/validate-binary-search-tree/' }
    ],
    content: {
      introduction: 'Unlike linear data arrays, tree structures branch hierarchically from a single root node. Traversal visits all nodes exactly once, categorizing into Depth-First Search (DFS) variants—Preorder, Inorder, and Postorder—and Breadth-First Search (BFS) level-order. Morris traversal threads unused leaf references to traverse trees in constant space.',
      whyImportant: 'Tree traversals form the engine for rendering interfaces, executing compiler syntax parses, validating search invariants, and evaluating directory path networks. Eliminating stack frames via Morris threads prevents stack crash events on extremely deep layouts.',
      realWorldApps: [
        'Document Object Model (DOM) rendering inside modern web browsers.',
        'File explorers summing disk space by post-order directory size calculation.',
        'Compiler syntax parsers building and traversing Abstract Syntax Trees (AST).'
      ],
      algorithmDescription: [
        'Preorder Traversal visits Root first, then Left and Right subtrees (useful for copying trees).',
        'Inorder Traversal visits Left, Root, then Right (yields sorted keys on binary search trees).',
        'Postorder Traversal visits Left, Right, then Root (useful for bottom-up node deletions).',
        'Level-Order Traversal scans nodes horizontal row by row using a queue FIFO buffer.',
        'Morris Traversal establishes temporary threads from rightmost nodes to parents, allowing stack-free traversals.'
      ],
      complexity: [
        { label: 'Time Complexity', value: 'O(V)', note: 'V is number of tree nodes' },
        { label: 'Recursive Space', value: 'O(H)', note: 'H is tree height. Call stack size' },
        { label: 'Morris Space', value: 'O(1)', note: 'Bypasses stack memory frames completely' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\nstruct Node {\n  int val;\n  Node* left; Node* right;\n};\n\nvoid morrisInorder(Node* root, vector<int>& res) {\n  Node* curr = root;\n  while (curr) {\n    if (!curr->left) {\n      res.push_back(curr->val);\n      curr = curr->right;\n    } else {\n      Node* pred = curr->left;\n      while (pred->right && pred->right != curr) pred = pred->right;\n      if (!pred->right) {\n        pred->right = curr;\n        curr = curr->left;\n      } else {\n        pred->right = nullptr;\n        res.push_back(curr->val);\n        curr = curr->right;\n      }\n    }\n  }\n}`,
      implementationPython: `class Node:\n    def __init__(self, val=0):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef inorder_traversal(root: Node) -> list:\n    res = []\n    def dfs(node):\n        if not node: return\n        dfs(node.left)\n        res.append(node.val)\n        dfs(node.right)\n    dfs(root)\n    return res`,
      commonMistakes: [
        'Stack overflows on highly unbalanced linear trees (skewed chains) using simple recursion.',
        'Forgetting to break temporary Morris threads, leaving cyclic memory references.',
        'Mixing up stack LIFO order during iterative traversals, misaligning node output order.'
      ],
      interviewQuestions: [
        'How does Morris Traversal restore the original tree structures during traversal?',
        'Why does Postorder traversal suit binary tree node deletion best?',
        'Describe how to reconstruct a unique binary tree given its Preorder and Inorder traversal lists.'
      ],
      summary: 'Tree traversals extract nodes sequentially using recursion stacks, queue buffers, or constant-space thread links. Matching the traversal order to the hierarchical rules resolves tree validations, directory walks, and sorted searches.'
    }
  },
  {
    slug: 'mst-union-find',
    title: 'Minimum Spanning Trees & Disjoint Set Forests',
    tagline: 'Connect networks with minimal edges: Master path compression, union by rank, Kruskal sorted spans, and Prim expansion trees.',
    category: 'Algorithms',
    readTime: 15,
    lastUpdated: 'June 2026',
    visualizerId: 'union-find',
    prerequisites: ['linked-list', 'heap'],
    related: ['dijkstra', 'scc-bridges', 'advanced-cp'],
    practiceProblems: [
      { title: 'Number of Provinces (LeetCode 547)', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-provinces/' },
      { title: 'Min Cost to Connect Points (LeetCode 1584)', difficulty: 'Medium', url: 'https://leetcode.com/problems/min-cost-to-connect-all-points/' },
      { title: 'Redundant Connection (LeetCode 684)', difficulty: 'Medium', url: 'https://leetcode.com/problems/redundant-connection/' }
    ],
    content: {
      introduction: 'A Minimum Spanning Tree (MST) links all graph vertices without cycles using minimal edge weights. Finding MSTs relies on greedy selection, executed via Kruskal sorted edge insertion or Prim adjacent node growth. Disjoint Set Union (DSU) manages dynamic sets in near-constant bounds using path compression.',
      whyImportant: 'DSU is critical for checking graph connectivity, parsing networks, and identifying loops. MST optimizations minimize costs in network grids (cabling, pipes, roads) by selecting the most efficient connections.',
      realWorldApps: [
        'Telecommunication grid layout laying fiber cables to link cities with minimum length.',
        'Cluster grouping analysis in machine learning using edge connection weights.',
        'Game graphics rendering partitioning spatial nodes using tree frameworks.'
      ],
      algorithmDescription: [
        'Kruskal\'s Algorithm sorts all edges, inserting them sequentially if they connect disjoint sets (managed via DSU).',
        'Prim\'s Algorithm expands from a root, adding the cheapest adjacent edge using a priority queue.',
        'Disjoint Set Union (DSU) clusters elements. Path Compression flattens parent pointers to root, and Union by Rank balances set merges.'
      ],
      complexity: [
        { label: 'Kruskal Time', value: 'O(E log E)', note: 'E is edge count. Dominant sorting step' },
        { label: 'Prim Time', value: 'O(E log V)', note: 'V is node count. Heap extraction operations' },
        { label: 'DSU Query', value: 'O(α(n))', note: 'Inverse Ackermann growth rate. Near-constant lookup limits' }
      ],
      implementationCpp: `#include <vector>\n#include <numeric>\nusing namespace std;\n\nclass DSU {\n  vector<int> parent, rank;\npublic:\n  DSU(int n) {\n    parent.resize(n);\n    iota(parent.begin(), parent.end(), 0);\n    rank.assign(n, 0);\n  }\n  int find(int i) {\n    if (parent[i] == i) return i;\n    return parent[i] = find(parent[i]); // Path compression\n  }\n  bool unite(int i, int j) {\n    int root_i = find(i);\n    int root_j = find(j);\n    if (root_i != root_j) {\n      if (rank[root_i] < rank[root_j]) swap(root_i, root_j);\n      parent[root_j] = root_i;\n      if (rank[root_i] == rank[root_j]) rank[root_i]++;\n      return true;\n    }\n    return false;\n  }\n};`,
      implementationPython: `class DSU:\n    def __init__(self, n: int):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n\n    def find(self, i: int) -> int:\n        if self.parent[i] == i:\n            return i\n        self.parent[i] = self.find(self.parent[i]) # Path compression\n        return self.parent[i]\n\n    def unite(self, i: int, j: int) -> bool:\n        root_i = self.find(i)\n        root_j = self.find(j)\n        if root_i != root_j:\n            if self.rank[root_i] < self.rank[root_j]:\n                root_i, root_j = root_j, root_i\n            self.parent[root_j] = root_i\n            if self.rank[root_i] == self.rank[root_j]:\n                self.rank[root_i] += 1\n            return True\n        return False`,
      commonMistakes: [
        'Omitting path compression, causing find operations to degrade to linear O(V) chains.',
        'Running Kruskal without sorting edges first, producing incorrect spanning graphs.',
        'Not adjusting node count offsets (e.g. 0-based vs 1-based indexing) when initializing sets.'
      ],
      interviewQuestions: [
        'Contrast Kruskal\'s and Prim\'s algorithms. When is one preferred over the other?',
        'Why does path compression combined with union by rank yield near-constant amortized bounds?',
        'How do you identify cycles in an undirected graph using DSU?'
      ],
      summary: 'MSTs minimize edge weights to connect graph elements without cycles. Using Kruskal sorted checks and DSU forests with path compression, connectivity updates in near-constant bounds.'
    }
  },
  {
    slug: 'scc-bridges',
    title: 'Strongly Connected Components & Bridges',
    tagline: 'Expose connectivity vulnerabilities: Find strongly connected component loops, bridge bottlenecks, and articulation vertices.',
    category: 'Algorithms',
    readTime: 15,
    lastUpdated: 'June 2026',
    visualizerId: 'dfs-graph',
    prerequisites: ['dfs-tree'],
    related: ['bfs', 'dfs', 'dijkstra', 'mst-union-find'],
    practiceProblems: [
      { title: 'Critical Connections (LeetCode 1192)', difficulty: 'Hard', url: 'https://leetcode.com/problems/critical-connections-in-a-network/' },
      { title: 'SCC Kosaraju (GeeksforGeeks)', difficulty: 'Medium', url: 'https://practice.geeksforgeeks.org/problems/strongly-connected-components-kosaraju-s-algo1587115621/1' },
      { title: 'Articulation Points (GeeksforGeeks)', difficulty: 'Hard', url: 'https://practice.geeksforgeeks.org/problems/articulation-points-11587115602/1' }
    ],
    content: {
      introduction: 'Strongly Connected Components (SCC) form subgraphs in directed graphs where every vertex is reachable from any other. Critical edges in undirected networks are Bridges (if removal disconnects graph segments) and Articulation Points (vertices whose removal breaks connectivity). Locating them relies on low-link calculations via Tarjan\'s and Kosaraju\'s algorithms.',
      whyImportant: 'Connectivity auditing identifies grid dependencies. If a router node acts as an Articulation Point, its failure breaks network connectivity. Tarjan\'s low-link logic extracts components in a single linear DFS sweep.',
      realWorldApps: [
        'Social networks detecting highly integrated user interest circles.',
        'Traffic routing finding highway bridges that would split cities if closed.',
        'Software packaging analyzing import networks to prevent cyclical dependencies.'
      ],
      algorithmDescription: [
        'Kosaraju\'s Algorithm uses two DFS passes: one on the original graph to order nodes by finish times, and another on the transposed graph to isolate components.',
        'Tarjan\'s Algorithm tracks low-link DFS discovery times. If a sub-node cannot reach ancestors, its parent forms an SCC boundary.',
        'Bridges are found by checking if a sub-node low-link discovery time strictly exceeds its parent discovery timestamp.'
      ],
      complexity: [
        { label: 'Kosaraju Time', value: 'O(V + E)', note: 'Requires transposing graph and running 2 DFS passes' },
        { label: 'Tarjan Time', value: 'O(V + E)', note: 'Resolves SCCs, bridges, and articulation points in a single pass' },
        { label: 'Space Complexity', value: 'O(V)', note: 'Call stack and indexing arrays' }
      ],
      implementationCpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass TarjanBridges {\n  int timer;\n  vector<vector<int>> bridges;\n  void dfs(int u, int p, const vector<vector<int>>& adj, vector<int>& disc, vector<int>& low) {\n    disc[u] = low[u] = ++timer;\n    for (int v : adj[u]) {\n      if (v == p) continue;\n      if (disc[v]) {\n        low[u] = min(low[u], disc[v]);\n      } else {\n        dfs(v, u, adj, disc, low);\n        low[u] = min(low[u], low[v]);\n        if (low[v] > disc[u]) bridges.push_back({u, v});\n      }\n    }\n  }\n};`,
      implementationPython: `class TarjanBridges:\n    def __init__(self, V: int):\n        self.timer = 0\n        self.disc = [0] * V\n        self.low = [0] * V\n        self.bridges = []\n\n    def find_bridges(self, adj: list):\n        for i in range(len(adj)):\n            if not self.disc[i]:\n                self._dfs(i, -1, adj)\n        return self.bridges\n\n    def _dfs(self, u: int, p: int, adj: list):\n        self.timer += 1\n        self.disc[u] = self.low[u] = self.timer\n        for v in adj[u]:\n            if v == p: continue\n            if self.disc[v]:\n                self.low[u] = min(self.low[u], self.disc[v])\n            else:\n                self._dfs(v, u, adj)\n                self.low[u] = min(self.low[u], self.low[v])\n                if self.low[v] > self.disc[u]:\n                    self.bridges.append((u, v))`,
      commonMistakes: [
        'Including parent node links back in the low-link evaluation, which breaks bridge logic.',
        'Confusing transpose logic in Kosaraju, which loops traversal checks.',
        'Not checking root node conditions separately when tracking Articulation Points.'
      ],
      interviewQuestions: [
        'How does Tarjan\'s low-link value determine if a node is part of a dynamic cycle?',
        'Explain why Kosaraju\'s transpose pass isolates strongly connected components.',
        'Describe Tarjan\'s articulation point check for root nodes vs internal nodes.'
      ],
      summary: 'SCC loops, bridges, and articulation vertices locate structural dependencies in relational meshes. Using DFS low-link tracking, Tarjan\'s algorithm pinpoints bottlenecks in linear time.'
    }
  },
  {
    slug: 'string-algorithms',
    title: 'Pattern Matching & String Invariants',
    tagline: 'Resolve text queries: Master KMP prefix tables, Rabin-Karp rolling hashes, prefix Z-arrays, and linear Manacher palindromes.',
    category: 'Algorithms',
    readTime: 15,
    lastUpdated: 'June 2026',
    visualizerId: 'kmp',
    prerequisites: ['arrays'],
    related: ['trie', 'advanced-cp', 'searching'],
    practiceProblems: [
      { title: 'Implement strStr() (LeetCode 28)', difficulty: 'Easy', url: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/' },
      { title: 'Repeated Substring Pattern (LeetCode 459)', difficulty: 'Easy', url: 'https://leetcode.com/problems/repeated-substring-pattern/' },
      { title: 'Longest Palindromic Substring (LeetCode 5)', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-palindromic-substring/' }
    ],
    content: {
      introduction: 'Text processing is key to databases, compilers, and bio-informatics. While naive matching runs in O(n * m) time, prefix lookups compress patterns to avoid redundant alignments. KMP precomputes borders, Rabin-Karp uses rolling hashes, the Z-algorithm builds matching prefixes, and Manacher\'s algorithm finds palindromes in linear time.',
      whyImportant: 'Naive matching runs slowly on long files with repeating segments. Precomputing prefixes ensures text search engines operate in linear bounds independent of sub-matches. Rabin-Karp hashes expand to detect plagiarism across multiple patterns simultaneously.',
      realWorldApps: [
        'Text search engines matching keyword queries in massive documents.',
        'Bioinformatics scanning genome sequence structures for matching gene chains.',
        'Plagiarism checkers comparing code strings to database repositories.'
      ],
      algorithmDescription: [
        'KMP Algorithm precomputes a Longest Prefix Suffix (LPS) table, shifting the pattern to avoid backtracking.',
        'Rabin-Karp computes rolling hashes of sliding text segments, matching patterns on hash collisions.',
        'Z-Algorithm builds an array where Z[i] is the length of the longest common prefix between string suffix starting at i and string root.',
        'Manacher\'s Algorithm uses mirror symmetry in palindromes to eliminate redundant character scans.'
      ],
      complexity: [
        { label: 'KMP Search', value: 'O(n + m)', note: 'm is pattern length, n is text size. Linear lookup bounds' },
        { label: 'Rabin-Karp', value: 'O(n + m)', note: 'Average case. Worst-case is O(nm) on hash collisions' },
        { label: 'Manacher\'s', value: 'O(n)', note: 'Finds all palindromic substrings in linear time' }
      ],
      implementationCpp: `#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> computeLPS(const string& pat) {\n  int m = pat.length(), len = 0, i = 1;\n  vector<int> lps(m, 0);\n  while (i < m) {\n    if (pat[i] == pat[len]) {\n      lps[i++] = ++len;\n    } else {\n      if (len) len = lps[len - 1];\n      else lps[i++] = 0;\n    }\n  }\n  return lps;\n}`,
      implementationPython: `def compute_z(s: str) -> list:\n    n = len(s)\n    z = [0] * n\n    l = r = 0\n    for i in range(1, n):\n        if i <= r:\n            z[i] = min(r - i + 1, z[i - l])\n        while i + z[i] < n and s[z[i]] == s[i + z[i]]:\n            z[i] += 1\n        if i + z[i] - 1 > r:\n            l = i\n            r = i + z[i] - 1\n    return z`,
      commonMistakes: [
        'Rolling hash overflows under large multipliers, causing hash collisions.',
        'Off-by-one errors when managing KMP LPS indices during mismatch states.',
        'Forgetting string padding (inserting buffer delimiters like #) in Manacher\'s algorithm, causing it to skip even-length palindromes.'
      ],
      interviewQuestions: [
        'How does the KMP LPS array prevent text pointer backtracking?',
        'Describe rolling hash calculation in Rabin-Karp and how to handle collisions.',
        'Explain Z-array properties and how it simplifies pattern searching.'
      ],
      summary: 'String pattern matching avoids redundant comparisons using border lookups, rolling hashes, and palindromic symmetries. Precomputing prefix boundaries keeps text query matching in linear time.'
    }
  },
  {
    slug: 'advanced-cp',
    title: 'Competitive Programming Invariants',
    tagline: 'Master advanced optimizations: Flat tree traversals, binary lifting ancestors, sweep line grids, and Mo\'s query sorting.',
    category: 'Algorithms',
    readTime: 18,
    lastUpdated: 'June 2026',
    visualizerId: 'sweep-line',
    prerequisites: ['segment-tree', 'mst-union-find'],
    related: ['searching', 'sorting', 'dijkstra'],
    practiceProblems: [
      { title: 'Lowest Common Ancestor (LeetCode 236)', difficulty: 'Medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
      { title: 'Range Sum Query Mutable (LeetCode 307)', difficulty: 'Hard', url: 'https://leetcode.com/problems/range-sum-query-2d-mutable/' },
      { title: 'Merge Intervals (LeetCode 56)', difficulty: 'Medium', url: 'https://leetcode.com/problems/merge-intervals/' }
    ],
    content: {
      introduction: 'Advanced competitive programming uses clever data transformations to optimize queries. Tree operations scale using binary power lookup jumps (Binary Lifting) and tree flattening (Euler Tour). Range queries are grouped and sorted offline using Mo\'s algorithm, and geometric configurations are solved via coordinate sweep lines.',
      whyImportant: 'Standard query engines run slowly on millions of range updates. Pre-calculating binary jumps reduces ancestor search to O(log n) limits, and coordinate compression fits large sparse ranges onto dense memory indexes.',
      realWorldApps: [
        'GIS routing locating the nearest shared intersection (LCA) in road maps.',
        'Interval scheduling tools finding scheduling overlaps via coordinate events.',
        'Large-scale offline analytics engines sorting range query batches.'
      ],
      algorithmDescription: [
        'Binary Lifting precomputes 2^k parents for each node, enabling O(log n) jumps to find Lowest Common Ancestors.',
        'Euler Tour flattens tree structure traversal pathways into arrays, converting tree queries to range queries.',
        'Mo\'s Algorithm groups offline queries by coordinate blocks, minimizing range edits.',
        'Sweep Line sweeps a coordinate axis to process interval crossings at discrete events.'
      ],
      complexity: [
        { label: 'Binary Lifting LCA', value: 'O(log V)', note: 'V is tree size. Precomputing takes O(V log V) time' },
        { label: 'Mo\'s Sorting', value: 'O((N + Q) * sqrt(N))', note: 'Sorts offline queries by block offsets' },
        { label: 'Sweep Line Interval', value: 'O(N log N)', note: 'Sorts coordinate events before processing' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\n\n// Binary Lifting parent mapping\nclass TreeLCA {\n  int N, LG;\n  vector<vector<int>> up;\n  vector<int> depth;\npublic:\n  int getLCA(int u, int v) {\n    if (depth[u] < depth[v]) swap(u, v);\n    for (int i = LG - 1; i >= 0; --i) {\n      if (depth[u] - (1 << i) >= depth[v]) u = up[u][i];\n    }\n    if (u == v) return u;\n    for (int i = LG - 1; i >= 0; --i) {\n      if (up[u][i] != up[v][i]) {\n        u = up[u][i]; v = up[v][i];\n      }\n    }\n    return up[u][0];\n  }\n};`,
      implementationPython: `class TreeLCA:\n    def __init__(self, depth: list, up: list, LG: int):\n        self.depth = depth\n        self.up = up\n        self.LG = LG\n\n    def get_lca(self, u: int, v: int) -> int:\n        if self.depth[u] < self.depth[v]:\n            u, v = v, u\n        for i in range(self.LG - 1, -1, -1):\n            if self.depth[u] - (1 << i) >= self.depth[v]:\n                u = self.up[u][i]\n        if u == v:\n            return u\n        for i in range(self.LG - 1, -1, -1):\n            if self.up[u][i] != self.up[v][i]:\n                u = self.up[u][i]\n                v = self.up[v][i]\n        return self.up[u][0]`,
      commonMistakes: [
        'Incorrect parent bitwise checks causing LCA queries to return invalid root paths.',
        'Not sorting Mo\'s queries by correct block indices, degrading runtime to O(NQ).',
        'Failing to handle duplicate coordinate timestamps in sweep line event arrays.'
      ],
      interviewQuestions: [
        'Explain how binary lifting accelerates ancestor search to logarithmic limits.',
        'How does Euler Tour map tree subtrees to contiguous range segments?',
        'Describe how to use coordinate compression to fit large ranges onto compact arrays.'
      ],
      summary: 'Tree ancestors, query groupings, and sweep line events convert complex configurations into solvable range queries. Transforming coordinates using binary lifting and compression keeps tree and interval queries in logarithmic limits.'
    }
  },
  {
    slug: 'bellman-ford-floyd-warshall',
    title: 'Bellman-Ford & Floyd-Warshall: Negative Cycles & All-Pairs Paths',
    tagline: 'Find optimal paths in complex graphs: Master Bellman-Ford relaxations, negative cycle detection, and Floyd-Warshall dynamic-programming grids.',
    category: 'Algorithms',
    readTime: 14,
    lastUpdated: 'June 2026',
    visualizerId: 'dfs-graph',
    prerequisites: ['dijkstra'],
    related: ['dfs', 'bfs', 'mst-union-find'],
    practiceProblems: [
      { title: 'Cheapest Flights Within K Stops (LeetCode 787)', difficulty: 'Medium', url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/' },
      { title: 'Network Delay Time (LeetCode 743)', difficulty: 'Medium', url: 'https://leetcode.com/problems/network-delay-time/' },
      { title: 'Greg and Graph (CodeForces 295B)', difficulty: 'Hard', url: 'https://codeforces.com/problemset/problem/295/B' }
    ],
    content: {
      introduction: 'Shortest path routing in graphs with positive edge weights is solved by Dijkstra. However, when edges have negative weights, Dijkstra fails. Bellman-Ford resolves single-source shortest paths on any graph by relaxing all edges V-1 times, while Floyd-Warshall computes all-pairs shortest paths using a dynamic programming state transition in O(V^3) time.',
      whyImportant: 'Negative edge weights occur in financial models (arbitrage cycles) or chemistry networks. Bellman-Ford detects infinite negative cycles, preventing infinite loops. Floyd-Warshall is ideal for small graphs because of its constant factor efficiency.',
      realWorldApps: [
        'Currency arbitrage detection finding cycles of trade rates where product is > 1.',
        'Router path configuration updating routing tables dynamically.',
        'Logistics planning finding cheapest shipping lanes with discounts (negative costs).'
      ],
      algorithmDescription: [
        'Bellman-Ford: Initialize distances to infinity (source = 0). Loop V-1 times, relaxing every edge (u, v) if dist[v] > dist[u] + weight.',
        'Negative Cycle Check: Run a V-th pass; if dist[v] can still be reduced, an infinite negative cycle exists.',
        'Floyd-Warshall: Initialize a V x V matrix with edge weights. Loop k from 0 to V-1, updating grid[i][j] = min(grid[i][j], grid[i][k] + grid[k][j]).'
      ],
      complexity: [
        { label: 'Bellman-Ford Time', value: 'O(V * E)', note: 'V is node count, E is edge count. Relaxations check all edges' },
        { label: 'Floyd-Warshall Time', value: 'O(V^3)', note: 'Dynamic programming state grid updates' },
        { label: 'Space Complexity', value: 'O(V^2)', note: 'Required for Floyd-Warshall distance matrix' }
      ],
      implementationCpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nstruct Edge { int u, v, w; };\n\nbool bellmanFord(int V, int src, const vector<Edge>& edges, vector<int>& dist) {\n    dist.assign(V, 1e9);\n    dist[src] = 0;\n    for (int i = 0; i < V - 1; ++i) {\n        for (const auto& e : edges) {\n            if (dist[e.u] != 1e9 && dist[e.u] + e.w < dist[e.v]) {\n                dist[e.v] = dist[e.u] + e.w;\n            }\n        }\n    }\n    for (const auto& e : edges) {\n        if (dist[e.u] != 1e9 && dist[e.u] + e.w < dist[e.v]) return false; // Negative cycle\n    }\n    return true;\n}`,
      implementationPython: `def bellman_ford(V: int, src: int, edges: list) -> tuple:\n    dist = [float('inf')] * V\n    dist[src] = 0\n    for _ in range(V - 1):\n        for u, v, w in edges:\n            if dist[u] != float('inf') and dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    for u, v, w in edges:\n        if dist[u] != float('inf') and dist[u] + w < dist[v]:\n            return False, []\n    return True, dist`,
      commonMistakes: [
        'Failing to run the V-th check pass for negative cycles, returning stale and inaccurate weights.',
        'Placing the k pivot loop inside Floyd-Warshall as the innermost loop instead of the outermost loop, breaking state propagation.'
      ],
      interviewQuestions: [
        'Why does Dijkstra fail on negative edge weights?',
        'How does Bellman-Ford detect a negative cycle?',
        'Prove why k must be the outermost loop in Floyd-Warshall.'
      ],
      summary: 'Bellman-Ford relaxes edges sequentially to discover negative cycles, while Floyd-Warshall uses a dynamic programming triple loop to find all-pairs shortest paths.'
    }
  },
  {
    slug: 'topological-sort',
    title: 'Topological Sort & Kahn\'s Algorithm',
    tagline: 'Order dependencies linearly: Master post-order DFS traversals, Kahn\'s indegree queues, and cycle detection in Directed Acyclic Graphs.',
    category: 'Algorithms',
    readTime: 10,
    lastUpdated: 'June 2026',
    visualizerId: 'bfs-graph',
    prerequisites: ['dfs'],
    related: ['bfs', 'dijkstra', 'scc-bridges'],
    practiceProblems: [
      { title: 'Course Schedule (LeetCode 207)', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' },
      { title: 'Course Schedule II (LeetCode 210)', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule-ii/' },
      { title: 'Fox And Names (CodeForces 510C)', difficulty: 'Medium', url: 'https://codeforces.com/problemset/problem/510/C' }
    ],
    content: {
      introduction: 'Topological sorting is a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge u -> v, vertex u comes before v. If a graph contains cycles, topological sorting is impossible.',
      whyImportant: 'Dependency scheduling is core to compilers, package managers, and workflow orchestrators. Kahn\'s algorithm uses indegrees to resolve orderings and detect cycles simultaneously.',
      realWorldApps: [
        'Task schedule systems determining execution ordering of dependent builds.',
        'Compiler link resolution finding file compilation sequences.',
        'Spreadsheet cell recalculations resolving formulas.'
      ],
      algorithmDescription: [
        'Indegree Counting: Calculate the indegree for each vertex.',
        'Kahn\'s Queue: Push vertices with indegree 0 into a queue.',
        'Propagation: Pop u, add to ordering, decrement neighbor indegrees. If a neighbor reaches 0, push it onto the queue. Repeat until empty.'
      ],
      complexity: [
        { label: 'Time Complexity', value: 'O(V + E)', note: 'Processes each vertex and edge exactly once' },
        { label: 'Space Complexity', value: 'O(V)', note: 'Auxiliary storage for indegrees and the queue' }
      ],
      implementationCpp: `#include <vector>\n#include <queue>\nusing namespace std;\n\nvector<int> topoSort(int V, const vector<vector<int>>& adj) {\n    vector<int> indegree(V, 0), order;\n    for (int i = 0; i < V; ++i) {\n        for (int v : adj[i]) indegree[v]++;\n    }\n    queue<int> q;\n    for (int i = 0; i < V; ++i) {\n        if (indegree[i] == 0) q.push(i);\n    }\n    while (!q.empty()) {\n        int u = q.front(); q.pop();\n        order.push_back(u);\n        for (int v : adj[u]) {\n            if (--indegree[v] == 0) q.push(v);\n        }\n    }\n    if (order.size() != V) return {}; // Cycle detected\n    return order;\n}`,
      implementationPython: `from collections import deque\n\ndef topo_sort(V: int, adj: list) -> list:\n    indegree = [0] * V\n    for u in range(V):\n        for v in adj[u]:\n            indegree[v] += 1\n    q = deque([i for i in range(V) if indegree[i] == 0])\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in adj[u]:\n            indegree[v] -= 1\n            if indegree[v] == 0:\n                q.append(v)\n    return order if len(order) == V else []`,
      commonMistakes: [
        'Attempting to perform a topological sort on a graph containing directed cycles, yielding incomplete vertices lists.',
        'Not checking if the sorted order length equals V, which is the main way to identify cycle defects.'
      ],
      interviewQuestions: [
        'How do you detect cycles in a directed graph using Kahn\'s algorithm?',
        'Compare DFS post-order vs Kahn\'s queue approach.',
        'What criteria makes a graph topologically sortable?'
      ],
      summary: 'Topological sorting arranges vertices of a DAG linearly to resolve dependency constraints in linear time.'
    }
  },
  {
    slug: 'fenwick-tree',
    title: 'Fenwick Tree (Binary Indexed Tree)',
    tagline: 'Perform fast cumulative queries: Master lowest-set bit masking, dynamic point updates, prefix sum extractions, and range query structures.',
    category: 'Data Structures',
    readTime: 12,
    lastUpdated: 'June 2026',
    visualizerId: 'segment-tree',
    prerequisites: ['arrays'],
    related: ['segment-tree', 'advanced-cp', 'searching'],
    practiceProblems: [
      { title: 'Range Sum Query - Mutable (LeetCode 307)', difficulty: 'Hard', url: 'https://leetcode.com/problems/range-sum-query-mutable/' },
      { title: 'Count of Smaller Numbers After Self (LeetCode 315)', difficulty: 'Hard', url: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/' },
      { title: 'DQuery (CodeForces / Spoj)', difficulty: 'Hard', url: 'https://spoj.com/problems/DQUERY/' }
    ],
    content: {
      introduction: 'A Fenwick Tree (or Binary Indexed Tree) is a compact, array-based structure that maintains prefix sums over a dynamic array. Unlike segment trees, it takes exactly the same space as the input array and can be implemented in a few lines of code.',
      whyImportant: 'Binary Indexed Trees run query and update operations in O(log n) using bitwise masks. They are easy to code and have small constant factors, making them highly efficient in competitive programming.',
      realWorldApps: [
        'Frequency tracking tools calculating dynamic indices in databases.',
        'Compression algorithms counting symbol distributions.',
        'Cumulative probability calculations in modeling.'
      ],
      algorithmDescription: [
        'Structure: Build an array of size N+1. Index 0 is dummy.',
        'Point Update: Add value at index i. Propagate the change to parents by adding the lowest set bit of i: i += (i & -i).',
        'Prefix Query: Get the cumulative sum from 1 to i by subtracting the lowest set bit of i: i -= (i & -i).'
      ],
      complexity: [
        { label: 'Point Update Time', value: 'O(log N)', note: 'Propagates values up the bit branches' },
        { label: 'Prefix Query Time', value: 'O(log N)', note: 'Aggregates values down the bit branches' },
        { label: 'Space Complexity', value: 'O(N)', note: 'Flat array allocation' }
      ],
      implementationCpp: `#include <vector>\nusing namespace std;\n\nclass FenwickTree {\n    vector<int> tree;\npublic:\n    FenwickTree(int n) { tree.assign(n + 1, 0); }\n    void update(int idx, int val) {\n        for (; idx < tree.size(); idx += idx & -idx) tree[idx] += val;\n    }\n    int query(int idx) {\n        int sum = 0;\n        for (; idx > 0; idx -= idx & -idx) sum += tree[idx];\n        return sum;\n    }\n};`,
      implementationPython: `class FenwickTree:\n    def __init__(self, n: int):\n        self.tree = [0] * (n + 1)\n\n    def update(self, idx: int, val: int):\n        while idx < len(self.tree):\n            self.tree[idx] += val\n            idx += idx & -idx\n\n    def query(self, idx: int) -> int:\n        s = 0\n        while idx > 0:\n            s += self.tree[idx]\n            idx -= idx & -idx\n        return s`,
      commonMistakes: [
        'Using 0-based indexing directly inside the update/query loops, causing infinite loops during bitwise operations.',
        'Forgetting that a range query [L, R] is calculated by subtractive prefixes: query(R) - query(L - 1).'
      ],
      interviewQuestions: [
        'How does i & -i isolate the lowest set bit of an integer?',
        'Compare Fenwick Trees and Segment Trees in terms of memory and implementation complexity.',
        'Can a Fenwick Tree handle range updates and range queries simultaneously?'
      ],
      summary: 'Fenwick Trees utilize bitwise lowest-set-bit masking to enable prefix sum queries and point updates in logarithmic time.'
    }
  },
  {
    slug: 'sparse-table',
    title: 'Sparse Table: Constant Time Range Queries',
    tagline: 'Static query optimizations: Master binary power lookup grids, overlap-friendly range minimums, and O(1) range query evaluations.',
    category: 'Data Structures',
    readTime: 11,
    lastUpdated: 'June 2026',
    visualizerId: 'segment-tree',
    prerequisites: ['arrays'],
    related: ['segment-tree', 'fenwick-tree', 'advanced-cp'],
    practiceProblems: [
      { title: 'Longest Continuous Subarray (LeetCode 1438)', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/' },
      { title: 'Sparse Table RMQ (GeeksforGeeks)', difficulty: 'Medium', url: 'https://practice.geeksforgeeks.org/problems/range-minimum-query/1' },
      { title: 'Array Queries (CodeForces / Spoj)', difficulty: 'Medium', url: 'https://spoj.com/problems/RMQSQ/' }
    ],
    content: {
      introduction: 'A Sparse Table is a data structure that answers range queries on a static array. It performs query execution in O(1) constant time for idempotent functions (like Range Minimum/Maximum Queries and Range Greatest Common Divisor).',
      whyImportant: 'Segment trees take O(log n) time to query. When the array is static and there are millions of queries, Sparse Tables achieve O(1) query time by precomputing range answers for powers of two.',
      realWorldApps: [
        'Database indexing resolving minimum values inside key intervals.',
        'GIS navigation finding lowest point path grids.',
        'Computational geometry resolving nearest segments.'
      ],
      algorithmDescription: [
        'Precomputation: Construct a 2D table st[N][log N] where st[i][j] stores the result of the query on the subarray of length 2^j starting at index i.',
        'Table Construction: Populate the grid by combining two halves of length 2^(j-1).',
        'Overlap Query: For range [L, R], calculate length length (R - L + 1). Find k = log2(length). Return the minimum of the two overlapping blocks: min(st[L][k], st[R - 2^k + 1][k]).'
      ],
      complexity: [
        { label: 'Precomputation Time', value: 'O(N log N)', note: 'Builds power of two segments' },
        { label: 'Query Time', value: 'O(1)', note: 'Constant time for idempotent operations' },
        { label: 'Space Complexity', value: 'O(N log N)', note: 'Auxiliary grid allocations' }
      ],
      implementationCpp: `#include <vector>\n#include <cmath>\n#include <algorithm>\nusing namespace std;\n\nclass SparseTable {\n    vector<vector<int>> st;\npublic:\n    void build(const vector<int>& arr) {\n        int n = arr.size(), k = log2(n) + 1;\n        st.assign(n, vector<int>(k));\n        for (int i = 0; i < n; ++i) st[i][0] = arr[i];\n        for (int j = 1; j < k; ++j) {\n            for (int i = 0; i + (1 << j) <= n; ++i) {\n                st[i][j] = min(st[i][j-1], st[i + (1 << (j-1))][j-1]);\n            }\n        }\n    }\n    int query(int L, int R) {\n        int len = R - L + 1;\n        int k = log2(len);\n        return min(st[L][k], st[R - (1 << k) + 1][k]);\n    }\n};`,
      implementationPython: `import math\n\nclass SparseTable:\n    def build(self, arr: list):\n        n = len(arr)\n        k = int(math.log2(n)) + 1\n        self.st = [[0] * k for _ in range(n)]\n        for i in range(n):\n            self.st[i][0] = arr[i]\n        for j in range(1, k):\n            for i in range(n - (1 << j) + 1):\n                self.st[i][j] = min(self.st[i][j-1], self.st[i + (1 << (j-1))][j-1])\n\n    def query(self, L: int, R: int) -> int:\n        length = R - L + 1\n        k = int(math.log2(length))\n        return min(self.st[L][k], self.st[R - (1 << k) + 1][k])`,
      commonMistakes: [
        'Attempting to query non-idempotent functions (such as Range Sum Queries) in O(1) time using overlapping intervals.',
        'Not allocating enough bits in the logarithm calculations, resulting in indexing overflows.'
      ],
      interviewQuestions: [
        'What is an idempotent function, and why does it allow O(1) queries in a Sparse Table?',
        'How do you construct a Sparse Table for Range Minimum Queries?',
        'Can a Sparse Table be modified to support updates?'
      ],
      summary: 'Sparse Tables use power-of-two intervals to enable O(1) range queries on static arrays.'
    }
  },
  {
    slug: 'avl-red-black-tree',
    title: 'Balanced Search Trees: AVL & Red-Black Trees',
    tagline: 'Ensure search guarantees: Master AVL tree balance factors, Red-Black color flags, node rotations, and O(log n) dynamic operations.',
    category: 'Data Structures',
    readTime: 15,
    lastUpdated: 'June 2026',
    visualizerId: 'tree-traversal',
    prerequisites: ['tree-traversal'],
    related: ['heap', 'trie', 'segment-tree'],
    practiceProblems: [
      { title: 'Convert Sorted Array to BST (LeetCode 108)', difficulty: 'Easy', url: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/' },
      { title: 'Contains Duplicate III (LeetCode 220)', difficulty: 'Hard', url: 'https://leetcode.com/problems/contains-duplicate-iii/' },
      { title: 'Tree Balancing (CodeForces)', difficulty: 'Hard', url: 'https://codeforces.com/problemset/problem/12/D' }
    ],
    content: {
      introduction: 'Standard Binary Search Trees (BST) run in O(log n) average time, but degrade to O(n) linear chains if nodes are inserted in sorted order. Self-balancing trees (AVL and Red-Black Trees) solve this by rotating nodes to guarantee logarithmic height.',
      whyImportant: 'AVL trees are strictly balanced, making them faster for lookups. Red-Black trees are slightly less balanced but perform fewer rotations, making them highly efficient for databases and memory allocators.',
      realWorldApps: [
        'Database indexes storing relational structures.',
        'C++ STL std::map and std::set using Red-Black trees.',
        'Virtual memory managers matching free allocations.'
      ],
      algorithmDescription: [
        'Height Constraints: AVL trees track height differences. Balance factor = height(left) - height(right). Node rotations occur if |BF| > 1.',
        'Node Rotations: Pointer operations (Left, Right, Left-Right, Right-Left) swap parental node placements while preserving sorting properties.',
        'Red-Black Rules: Assign coloring flags (Red/Black). recoloring and rotations occur during insertions to avoid double-red branches.'
      ],
      complexity: [
        { label: 'Search Time', value: 'O(log N)', note: 'Strict balanced tree heights' },
        { label: 'Insertion Time', value: 'O(log N)', note: 'Resolves balancing heights with at most 2 rotations' },
        { label: 'Space Complexity', value: 'O(N)', note: 'Stores color or height properties in nodes' }
      ],
      implementationCpp: `#include <algorithm>\nusing namespace std;\n\nstruct Node {\n    int key, height;\n    Node *left, *right;\n    Node(int k) : key(k), height(1), left(nullptr), right(nullptr) {}\n};\n\nint getHeight(Node* n) { return n ? n->height : 0; }\nint getBalance(Node* n) { return n ? getHeight(n->left) - getHeight(n->right) : 0; }\n\nNode* rotateRight(Node* y) {\n    Node* x = y->left;\n    Node* T2 = x->right;\n    x->right = y;\n    y->left = T2;\n    y->height = max(getHeight(y->left), getHeight(y->right)) + 1;\n    x->height = max(getHeight(x->left), getHeight(x->right)) + 1;\n    return x;\n}`,
      implementationPython: `class Node:\n    def __init__(self, key: int):\n        self.key = key\n        self.height = 1\n        self.left = None\n        self.right = None\n\ndef get_height(n) -> int:\n    return n.height if n else 0\n\ndef rotate_right(y):\n    x = y.left\n    T2 = x.right\n    x.right = y\n    y.left = T2\n    y.height = max(get_height(y.left), get_height(y.right)) + 1\n    x.height = max(get_height(x.left), get_height(x.right)) + 1\n    return x`,
      commonMistakes: [
        'Neglecting to update node heights during rotations in AVL trees, leading to balance factor evaluation failures.',
        'Allowing adjacent red nodes in Red-Black trees, violating the double-red balance rule.'
      ],
      interviewQuestions: [
        'Why is AVL preferred for lookup-heavy applications compared to Red-Black trees?',
        'Describe the left-right double rotation case in AVL trees.',
        'Prove that the height of a Red-Black tree with N nodes is at most 2 * log2(N + 1).'
      ],
      summary: 'AVL and Red-Black trees guarantee logarithmic height through node rotations and color rules, ensuring consistent search boundaries.'
    }
  },
  {
    slug: 'kmp-algorithm',
    title: 'Knuth-Morris-Pratt (KMP) Pattern Matching',
    tagline: 'Perform linear text searches: Master longest prefix-suffix tables, pattern shifting, and back-reference lookups.',
    category: 'Algorithms',
    readTime: 12,
    lastUpdated: 'June 2026',
    visualizerId: 'kmp',
    prerequisites: ['arrays'],
    related: ['string-algorithms', 'trie', 'searching'],
    practiceProblems: [
      { title: 'Find the Index of the First Occurrence (LeetCode 28)', difficulty: 'Easy', url: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/' },
      { title: 'Shortest Palindrome (LeetCode 214)', difficulty: 'Hard', url: 'https://leetcode.com/problems/shortest-palindrome/' },
      { title: 'Prefixes and Suffixes (CodeForces 432D)', difficulty: 'Hard', url: 'https://codeforces.com/problemset/problem/432/D' }
    ],
    content: {
      introduction: 'The Knuth-Morris-Pratt (KMP) algorithm is a linear pattern-matching algorithm. While a naive search runs in O(n * m) by resetting the text pointer on mismatch, KMP uses a precomputed table to skip redundant character scans.',
      whyImportant: 'Text searches in massive corpuses or log streams require linear bounds. KMP achieves O(n + m) time complexity by precomputing the structure of the pattern string.',
      realWorldApps: [
        'Text editor find actions highlighting strings.',
        'Log parsing engines scanning file contents.',
        'DNA sequencing searches isolating gene segments.'
      ],
      algorithmDescription: [
        'LPS Precomputation: Build a Longest Prefix Suffix (LPS) array for the pattern pat of size M.',
        'Border Search: Loop i through text and j through pattern. If characters match, increment both indexes.',
        'Mismatch Back-tracking: If pat[j] != text[i], check if j > 0. If yes, jump to pat[LPS[j-1]]. If j == 0, increment i.'
      ],
      complexity: [
        { label: 'Time Complexity', value: 'O(N + M)', note: 'N is text length, M is pattern length. Never backtracks text pointer' },
        { label: 'Space Complexity', value: 'O(M)', note: 'Auxiliary storage for pattern LPS array' }
      ],
      implementationCpp: `#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> kmpSearch(const string& text, const string& pat) {\n    int n = text.length(), m = pat.length();\n    vector<int> lps(m, 0), matches;\n    int len = 0, i = 1;\n    while (i < m) {\n        if (pat[i] == pat[len]) { lps[i++] = ++len; }\n        else {\n            if (len) len = lps[len-1];\n            else lps[i++] = 0;\n        }\n    }\n    int tIdx = 0, pIdx = 0;\n    while (tIdx < n) {\n        if (pat[pIdx] == text[tIdx]) { tIdx++; pIdx++; }\n        if (pIdx == m) {\n            matches.push_back(tIdx - pIdx);\n            pIdx = lps[pIdx - 1];\n        } else if (tIdx < n && pat[pIdx] != text[tIdx]) {\n            if (pIdx) pIdx = lps[pIdx - 1];\n            else tIdx++;\n        }\n    }\n    return matches;\n}`,
      implementationPython: `def kmp_search(text: str, pat: str) -> list:\n    n, m = len(text), len(pat)\n    lps = [0] * m\n    matches = []\n    length = 0\n    i = 1\n    while i < m:\n        if pat[i] == pat[length]:\n            length += 1\n            lps[i] = length\n            i += 1\n        else:\n            if length != 0:\n                length = lps[length - 1]\n            else:\n                lps[i] = 0\n                i += 1\n    t_idx = p_idx = 0\n    while t_idx < n:\n        if pat[p_idx] == text[t_idx]:\n            t_idx += 1\n            p_idx += 1\n        if p_idx == m:\n            matches.append(t_idx - p_idx)\n            p_idx = lps[p_idx - 1]\n        elif t_idx < n and pat[p_idx] != text[t_idx]:\n            if p_idx != 0:\n                p_idx = lps[p_idx - 1]\n            else:\n                t_idx += 1\n    return matches`,
      commonMistakes: [
        'Not handling patterns containing only single repeating elements properly, which triggers off-by-one pointer jumps.',
        'Resetting the text index pointer i on mismatch, which degrades KMP to naive O(NM) bounds.'
      ],
      interviewQuestions: [
        'Trace the KMP LPS array construction for the pattern "abacaba".',
        'Explain how KMP avoids backtracking the text cursor.',
        'How can you adapt KMP to count the occurrences of all prefixes of a string?'
      ],
      summary: 'Knuth-Morris-Pratt precomputes a prefix-suffix table to enable linear text pattern matching without redundant scans.'
    }
  }
];
