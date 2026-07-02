// Spatial Computer Science Roadmap Curriculum Data

export interface Subtopic {
  id: string;
  name: string;
  blogSlug: string;
}

export interface Concept {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  concepts: Concept[];
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
  topics: Topic[];
}

export const ROADMAP_ZONES: RoadmapZone[] = [
  {
    id: 'dsa-foundations',
    number: '01',
    name: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    hours: 45,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Master data organization and computational routines.',
    topics: [
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
              { id: 'variables-data-types', name: 'Variables & Data Types', blogSlug: 'static-arrays' },
              { id: 'operators-control-structures', name: 'Operators & Control Structures', blogSlug: 'procedural-state-pipelines' },
              { id: 'functions-basic-io', name: 'Functions & Basic I/O', blogSlug: 'functions-basic-i-o' }
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
              { id: 'big-o-notation', name: 'Big-O Notation', blogSlug: 'searching' },
              { id: 'big-theta-notation', name: 'Big-Theta Notation', blogSlug: 'big-theta-notation' },
              { id: 'big-omega-notation', name: 'Big-Omega Notation', blogSlug: 'big-omega-notation' },
              { id: 'time-complexity', name: 'Time Complexity', blogSlug: 'time-complexity-analysis' },
              { id: 'space-complexity', name: 'Space Complexity', blogSlug: 'space-complexity-analysis' }
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
            id: 'arrays',
            name: 'Arrays',
            subtopics: [
              { id: 'static-arrays', name: 'Static Arrays', blogSlug: 'static-arrays' },
              { id: 'dynamic-arrays', name: 'Dynamic Arrays', blogSlug: 'dynamic-vectors' }
            ]
          },
          {
            id: 'linked-lists',
            name: 'Linked Lists',
            subtopics: [
              { id: 'singly-linked-list', name: 'Singly Linked List', blogSlug: 'singly-linked-lists' },
              { id: 'doubly-linked-list', name: 'Doubly Linked List', blogSlug: 'doubly-linked-lists' },
              { id: 'circular-linked-list', name: 'Circular Linked List', blogSlug: 'circular-linked-lists' },
              { id: 'skip-list', name: 'Skip List', blogSlug: 'skip-lists' }
            ]
          },
          {
            id: 'stacks-queues',
            name: 'Stacks & Queues',
            subtopics: [
              { id: 'lifo-stack', name: 'LIFO Stack', blogSlug: 'lifo-stacks' },
              { id: 'fifo-queue', name: 'FIFO Queue', blogSlug: 'fifo-queues' },
              { id: 'circular-queue', name: 'Circular Queue', blogSlug: 'circular-buffers' },
              { id: 'deque', name: 'Double Ended Deque (Deque)', blogSlug: 'double-ended-deques' }
            ]
          },
          {
            id: 'hash-tables',
            name: 'Hash Tables',
            subtopics: [
              { id: 'hash-functions', name: 'Hash Functions', blogSlug: 'hash-indexes' },
              { id: 'collision-resolution', name: 'Collision Resolution', blogSlug: 'collision-resolution' },
              { id: 'load-factor', name: 'Load Factor & Resizing', blogSlug: 'load-factor-scaling' }
            ]
          }
        ]
      },
      {
        id: 'sorting-searching',
        name: 'Sorting & Searching',
        description: 'Array re-order routines and value locations.',
        concepts: [
          {
            id: 'sorting',
            name: 'Sorting Algorithms',
            subtopics: [
              { id: 'bubble-sort', name: 'Bubble Sort', blogSlug: 'bubble-sort' },
              { id: 'selection-sort', name: 'Selection Sort', blogSlug: 'selection-sort' },
              { id: 'insertion-sort', name: 'Insertion Sort', blogSlug: 'insertion-sort' },
              { id: 'merge-sort', name: 'Merge Sort', blogSlug: 'merge-sort' },
              { id: 'quick-sort', name: 'Quick Sort', blogSlug: 'quick-sort' },
              { id: 'heap-sort', name: 'Heap Sort', blogSlug: 'heap-sort' },
              { id: 'radix-sort', name: 'Radix & Bucket Sort', blogSlug: 'radix-sort' }
            ]
          },
          {
            id: 'searching',
            name: 'Searching Algorithms',
            subtopics: [
              { id: 'linear-search', name: 'Linear Search', blogSlug: 'linear-search' },
              { id: 'binary-search', name: 'Binary Search', blogSlug: 'binary-search' },
              { id: 'ternary-search', name: 'Ternary Search', blogSlug: 'ternary-search' }
            ]
          }
        ]
      },
      {
        id: 'tree-structures',
        name: 'Tree Data Structures',
        description: 'Hierarchical node trees, prefix searches, and range indexes.',
        concepts: [
          {
            id: 'tree-basics',
            name: 'Tree Basics',
            subtopics: [
              { id: 'binary-tree', name: 'Binary Tree', blogSlug: 'binary-tree' },
              { id: 'binary-search-tree', name: 'Binary Search Tree (BST)', blogSlug: 'binary-search-trees' },
              { id: 'avl-tree', name: 'AVL Tree', blogSlug: 'avl-trees' },
              { id: 'b-tree', name: 'B-Tree', blogSlug: 'b-trees' },
              { id: 'heaps', name: 'Heap', blogSlug: 'min-heaps' }
            ]
          },
          {
            id: 'tree-traversal',
            name: 'Tree Traversal',
            subtopics: [
              { id: 'in-order', name: 'In-Order Traversal', blogSlug: 'in-order-traversal' },
              { id: 'pre-order', name: 'Pre-Order Traversal', blogSlug: 'pre-order-traversal' },
              { id: 'post-order', name: 'Post-Order Traversal', blogSlug: 'post-order-traversal' }
            ]
          },
          {
            id: 'tree-search',
            name: 'Search Algorithms',
            subtopics: [
              { id: 'tree-bfs', name: 'Breadth First Search (BFS)', blogSlug: 'tree-bfs' },
              { id: 'tree-dfs', name: 'Depth First Search (DFS)', blogSlug: 'tree-dfs' }
            ]
          }
        ]
      },
      {
        id: 'graph-structures',
        name: 'Graph Data Structures',
        description: 'Adjacency structures, path explorations, shortest paths, and spanning networks.',
        concepts: [
          {
            id: 'graph-foundations',
            name: 'Graph Foundations',
            subtopics: [
              { id: 'directed-graph', name: 'Directed Graph', blogSlug: 'directed-graphs' },
              { id: 'undirected-graph', name: 'Undirected Graph', blogSlug: 'undirected-graphs' },
              { id: 'graph-representations', name: 'Graph Representations', blogSlug: 'graph-representations' }
            ]
          },
          {
            id: 'graph-search',
            name: 'Search Algorithms',
            subtopics: [
              { id: 'graph-bfs', name: 'Breadth First Search (BFS)', blogSlug: 'bfs-traversal' },
              { id: 'graph-dfs', name: 'Depth First Search (DFS)', blogSlug: 'dfs-traversal' }
            ]
          },
          {
            id: 'shortest-path-algorithms',
            name: 'Shortest Path Algorithms',
            subtopics: [
              { id: 'dijkstra', name: "Dijkstra's Algorithm", blogSlug: 'dijkstra' },
              { id: 'bellman-ford', name: 'Bellman-Ford Algorithm', blogSlug: 'bellman-ford-floyd-warshall' },
              { id: 'a-star', name: 'A* Algorithm', blogSlug: 'a-star-algorithm' },
              { id: 'floyd-warshall', name: 'Floyd-Warshall Algorithm', blogSlug: 'floyd-warshall-algorithm' }
            ]
          },
          {
            id: 'minimum-spanning-tree',
            name: 'Minimum Spanning Tree',
            subtopics: [
              { id: 'prim-mst', name: "Prim's Algorithm", blogSlug: 'prim-mst' },
              { id: 'kruskal-mst', name: "Kruskal's Algorithm", blogSlug: 'kruskal-mst' },
              { id: 'dsu', name: 'Disjoint Set (Union-Find)', blogSlug: 'mst-union-find' }
            ]
          }
        ]
      },
      {
        id: 'advanced-structures',
        name: 'Advanced Data Structures',
        description: 'Range query logs and topological indexes.',
        concepts: [
          {
            id: 'advanced-nodes',
            name: 'Advanced Data Structures',
            subtopics: [
              { id: 'trie', name: 'Trie', blogSlug: 'trie' },
              { id: 'segment-tree', name: 'Segment Trees', blogSlug: 'segment-tree' },
              { id: 'fenwick-tree', name: 'Fenwick Trees', blogSlug: 'fenwick-tree' },
              { id: 'disjoint-set-union-find', name: 'Disjoint Set (Union-Find)', blogSlug: 'disjoint-set-union' },
              { id: 'suffix-structures', name: 'Suffix Trees and Arrays', blogSlug: 'suffix-arrays' }
            ]
          }
        ]
      },
      {
        id: 'complex-structures',
        name: 'Complex Data Structures & Indexing',
        description: 'Advanced storage indexing and B-tree derivations.',
        concepts: [
          {
            id: 'complex-nodes',
            name: 'Complex Data Structures',
            subtopics: [
              { id: '2-3-tree', name: '2-3 Trees', blogSlug: 'two-three-trees' },
              { id: 'bb-plus-tree', name: 'B/B+ Trees', blogSlug: 'b-trees-index-seeks' },
              { id: 'skip-list-complex', name: 'Skip List', blogSlug: 'skip-lists-complex' },
              { id: 'isam', name: 'ISAM', blogSlug: 'isam-indexing' }
            ]
          },
          {
            id: 'indexing',
            name: 'Indexing',
            subtopics: [
              { id: 'linear-indexing', name: 'Linear Indexing', blogSlug: 'linear-indexing' },
              { id: 'tree-based-indexing', name: 'Tree-Based Indexing', blogSlug: 'tree-indexing' }
            ]
          }
        ]
      },
      {
        id: 'problem-solving-techniques',
        name: 'Problem Solving Techniques',
        description: 'Common algorithmic paradigms and patterns.',
        concepts: [
          {
            id: 'algorithmic-patterns-1',
            name: 'Algorithmic Patterns I',
            subtopics: [
              { id: 'brute-force', name: 'Brute Force', blogSlug: 'brute-force' },
              { id: 'backtracking', name: 'Backtracking', blogSlug: 'backtracking' },
              { id: 'greedy-algorithms', name: 'Greedy Algorithms', blogSlug: 'greedy' },
              { id: 'randomized-algorithms', name: 'Randomized Algorithms', blogSlug: 'randomized-algorithms' },
              { id: 'divide-and-conquer', name: 'Divide and Conquer', blogSlug: 'divide-and-conquer' },
              { id: 'recursion', name: 'Recursion', blogSlug: 'recursion' },
              { id: 'dynamic-programming', name: 'Dynamic Programming', blogSlug: 'dynamic-programming' }
            ]
          },
          {
            id: 'algorithmic-patterns-2',
            name: 'Algorithmic Patterns II',
            subtopics: [
              { id: 'two-pointer', name: 'Two Pointer Technique', blogSlug: 'two-pointer-technique' },
              { id: 'sliding-window', name: 'Sliding Window Technique', blogSlug: 'sliding-window-technique' },
              { id: 'fast-slow-pointers', name: 'Fast and Slow Pointers', blogSlug: 'fast-slow-pointers' },
              { id: 'cyclic-sort', name: 'Cyclic Sort', blogSlug: 'cyclic-sort' },
              { id: 'merge-intervals', name: 'Merge Intervals', blogSlug: 'merge-intervals' },
              { id: 'two-heaps', name: 'Two Heaps', blogSlug: 'two-heaps-pattern' },
              { id: 'kth-element', name: 'Kth Element', blogSlug: 'kth-element' },
              { id: 'island-traversal', name: 'Island Traversal', blogSlug: 'island-traversal' },
              { id: 'multi-threaded', name: 'Multi-threaded Algorithms', blogSlug: 'multi-threaded' }
            ]
          }
        ]
      },
      {
        id: 'practice-platforms',
        name: 'Platforms to Practice',
        description: 'Coding practice hubs.',
        concepts: [
          {
            id: 'platforms',
            name: 'Practice Platforms',
            subtopics: [
              { id: 'leetcode', name: 'Leetcode', blogSlug: 'leetcode-platform' },
              { id: 'edabit', name: 'Edabit', blogSlug: 'edabit-platform' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'computer-architecture',
    number: '02',
    name: 'Computer Systems & Architecture',
    difficulty: 'Medium',
    hours: 32,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Hardware registers, L1/L2/L3 caches, page tables, and pipelining.',
    topics: [
      {
        id: 'hardware-logic',
        name: 'CPU & Caching',
        description: 'Hardware pipelines and cash layouts.',
        concepts: [
          {
            id: 'cpu-cache',
            name: 'Hardware Operations',
            subtopics: [
              { id: 'cpu-registers', name: 'CPU Register layouts', blogSlug: 'cpu-register-layouts' },
              { id: 'caching-levels', name: 'L1/L2/L3 Cache lines', blogSlug: 'l1-cache-hits' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'database-systems',
    number: '03',
    name: 'Database Systems',
    difficulty: 'Medium',
    hours: 36,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Normal forms, index cost query maps, and distributed NoSQL nodes.',
    topics: [
      {
        id: 'data-index',
        name: 'Normalization & Indexing',
        description: 'Relational logic and B+ index seeks.',
        concepts: [
          {
            id: 'relational-index',
            name: 'Database Storage',
            subtopics: [
              { id: 'normalization-db', name: 'Relational Normalization', blogSlug: 'relational-models' },
              { id: 'b-trees-indexes', name: 'B+ Tree Indexing', blogSlug: 'b-trees-indexes' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'networks-web',
    number: '04',
    name: 'Computer Networks & Web Tech',
    difficulty: 'Medium',
    hours: 38,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'TCP handshakes, DNS caches, edge CDNs, and API serialization.',
    topics: [
      {
        id: 'protocols',
        name: 'Networks Stack',
        description: 'OSI routing layers and socket handlers.',
        concepts: [
          {
            id: 'osi-sockets',
            name: 'Transmission Protocols',
            subtopics: [
              { id: 'sockets-stack', name: 'OSI TCP/IP Sockets', blogSlug: 'osi-layer-boundaries' },
              { id: 'dns-cdn', name: 'DNS & CDN resolution', blogSlug: 'dns-root-authority-resolution' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'operating-systems',
    number: '05',
    name: 'Operating Systems',
    difficulty: 'Hard',
    hours: 38,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Process schedulers, context switching, semaphore locks, and inodes.',
    topics: [
      {
        id: 'scheduler-locks',
        name: 'OS Kernels',
        description: 'Context queues scheduling and locks.',
        concepts: [
          {
            id: 'processes-concurrency',
            name: 'Processes & Concurrency',
            subtopics: [
              { id: 'pcb-scheduler', name: 'PCB & CPU Scheduler', blogSlug: 'process-control-blocks-pcb' },
              { id: 'mutex-locks', name: 'Mutex locks & Semaphores', blogSlug: 'thread-mutex-variables' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'system-design',
    number: '06',
    name: 'System Design & Distributed Systems',
    difficulty: 'Hard',
    hours: 44,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Load balancers, LRU caches, Kafka event streaming, and Raft consensus.',
    topics: [
      {
        id: 'foundational-tradeoffs',
        name: 'Foundational Trade-offs',
        description: 'The core tensions every system design decision balances: speed vs scale, latency vs volume, consistency vs availability.',
        concepts: [
          {
            id: 'core-concepts',
            name: 'Core Concepts',
            subtopics: [
              { id: 'what-is-system-design', name: 'What is System Design?', blogSlug: 'what-is-system-design' },
              { id: 'how-to-approach-system-design', name: 'How to Approach System Design?', blogSlug: 'how-to-approach-system-design' },
              { id: 'performance-vs-scalability', name: 'Performance vs Scalability', blogSlug: 'performance-vs-scalability' },
              { id: 'latency-vs-throughput', name: 'Latency vs Throughput', blogSlug: 'latency-vs-throughput' },
            ]
          },
          {
            id: 'consistency-availability',
            name: 'Consistency & Availability',
            subtopics: [
              { id: 'availability-vs-consistency', name: 'Availability vs Consistency', blogSlug: 'availability-vs-consistency' },
              { id: 'cap-theorem', name: 'CAP Theorem', blogSlug: 'cap-theorem-consistency' },
              { id: 'weak-consistency', name: 'Weak Consistency', blogSlug: 'weak-consistency' },
              { id: 'eventual-consistency', name: 'Eventual Consistency', blogSlug: 'eventual-consistency' },
              { id: 'strong-consistency', name: 'Strong Consistency', blogSlug: 'strong-consistency' },
            ]
          },
          {
            id: 'availability-patterns',
            name: 'Availability Patterns',
            subtopics: [
              { id: 'fail-over-active-active-active-passive', name: 'Fail-Over (Active-Active / Active-Passive)', blogSlug: 'failover-replication-dns-updates' },
              { id: 'replication-master-slave-master-master', name: 'Replication (Master-Slave / Master-Master)', blogSlug: 'replication-master-slave-master-master' },
              { id: 'availability-in-numbers', name: 'Availability in Numbers', blogSlug: 'availability-in-numbers' },
            ]
          },
        ]
      },
      {
        id: 'background-delivery',
        name: 'Background Work & Delivery',
        description: 'Deferred processing off the request path, plus how content finds its way to users quickly.',
        concepts: [
          {
            id: 'background-jobs-concept',
            name: 'Background Jobs',
            subtopics: [
              { id: 'background-jobs', name: 'Background Jobs', blogSlug: 'background-jobs' },
              { id: 'event-driven-jobs', name: 'Event-Driven Jobs', blogSlug: 'event-driven-jobs' },
              { id: 'schedule-driven-jobs', name: 'Schedule-Driven Jobs', blogSlug: 'schedule-driven-jobs' },
              { id: 'returning-job-results', name: 'Returning Job Results', blogSlug: 'returning-job-results' },
            ]
          },
          {
            id: 'naming-delivery',
            name: 'Naming & Content Delivery',
            subtopics: [
              { id: 'domain-name-system-dns', name: 'Domain Name System (DNS)', blogSlug: 'dns-root-authority-resolution' },
              { id: 'content-delivery-networks-cdn', name: 'Content Delivery Networks (CDN)', blogSlug: 'cdn-edge-caching-strategies' },
              { id: 'pull-cdns', name: 'Pull CDNs', blogSlug: 'pull-cdns' },
              { id: 'push-cdns', name: 'Push CDNs', blogSlug: 'push-cdns' },
            ]
          },
        ]
      },
      {
        id: 'sd-databases',
        name: 'Databases',
        description: 'Relational and non-relational storage engines, and how each scales.',
        concepts: [
          {
            id: 'sql-vs-nosql-concept',
            name: 'SQL vs NoSQL',
            subtopics: [
              { id: 'sql-vs-nosql', name: 'SQL vs NoSQL', blogSlug: 'sql-vs-nosql' },
            ]
          },
          {
            id: 'nosql-stores',
            name: 'NoSQL Data Stores',
            subtopics: [
              { id: 'key-value-store', name: 'Key-Value Store', blogSlug: 'key-value-store' },
              { id: 'document-store', name: 'Document Store', blogSlug: 'document-store' },
              { id: 'wide-column-store', name: 'Wide-Column Store', blogSlug: 'wide-column-store' },
              { id: 'graph-databases', name: 'Graph Databases', blogSlug: 'graph-databases' },
            ]
          },
          {
            id: 'rdbms-scaling',
            name: 'RDBMS Scaling',
            subtopics: [
              { id: 'replication-rdbms', name: 'Replication', blogSlug: 'database-replication-lags' },
              { id: 'sharding-rdbms', name: 'Sharding', blogSlug: 'database-sharding-partitions' },
              { id: 'federation', name: 'Federation', blogSlug: 'federation' },
              { id: 'denormalization', name: 'Denormalization', blogSlug: 'denormalization' },
              { id: 'sql-tuning', name: 'SQL Tuning', blogSlug: 'sql-tuning' },
            ]
          },
        ]
      },
      {
        id: 'traffic-scaling',
        name: 'Traffic, Scaling & Delivery Layer',
        description: 'Distributing requests across a fleet, and the services that route them.',
        concepts: [
          {
            id: 'application-layer',
            name: 'Application Layer',
            subtopics: [
              { id: 'microservices', name: 'Microservices', blogSlug: 'microservices' },
              { id: 'service-discovery', name: 'Service Discovery', blogSlug: 'service-discovery' },
            ]
          },
          {
            id: 'load-balancers-concept',
            name: 'Load Balancers',
            subtopics: [
              { id: 'lb-vs-reverse-proxy', name: 'LB vs Reverse Proxy', blogSlug: 'reverse-proxy-caches' },
              { id: 'load-balancing-algorithms', name: 'Load Balancing Algorithms', blogSlug: 'load-balancing-algorithms' },
              { id: 'layer-7-load-balancing', name: 'Layer 7 Load Balancing', blogSlug: 'layer-7-load-balancing' },
              { id: 'layer-4-load-balancing', name: 'Layer 4 Load Balancing', blogSlug: 'load-balancer-layer-4-routing' },
              { id: 'horizontal-scaling', name: 'Horizontal Scaling', blogSlug: 'horizontal-scaling' },
            ]
          },
        ]
      },
      {
        id: 'sd-caching',
        name: 'Caching',
        description: 'Write/read strategies for cache coherence, and where each caching layer sits.',
        concepts: [
          {
            id: 'caching-strategies',
            name: 'Caching Strategies',
            subtopics: [
              { id: 'cache-aside', name: 'Cache-Aside', blogSlug: 'cache-aside' },
              { id: 'write-through', name: 'Write-Through', blogSlug: 'write-through' },
              { id: 'write-behind', name: 'Write-Behind', blogSlug: 'write-behind' },
              { id: 'refresh-ahead', name: 'Refresh-Ahead', blogSlug: 'refresh-ahead' },
            ]
          },
          {
            id: 'caching-types',
            name: 'Types of Caching',
            subtopics: [
              { id: 'client-caching', name: 'Client Caching', blogSlug: 'client-caching' },
              { id: 'cdn-caching', name: 'CDN Caching', blogSlug: 'cdn-caching' },
              { id: 'web-server-caching', name: 'Web Server Caching', blogSlug: 'web-server-caching' },
              { id: 'database-caching', name: 'Database Caching', blogSlug: 'database-caching' },
              { id: 'application-caching', name: 'Application Caching', blogSlug: 'application-caching' },
            ]
          },
        ]
      },
      {
        id: 'async-communication',
        name: 'Async & Communication',
        description: 'Decoupling producers from consumers, and the protocols services speak to each other.',
        concepts: [
          {
            id: 'asynchronism',
            name: 'Asynchronism',
            subtopics: [
              { id: 'back-pressure', name: 'Back Pressure', blogSlug: 'backpressure-queues-sizing' },
              { id: 'task-queues', name: 'Task Queues', blogSlug: 'task-queues' },
              { id: 'message-queues', name: 'Message Queues', blogSlug: 'message-queues' },
            ]
          },
          {
            id: 'communication-protocols',
            name: 'Communication Protocols',
            subtopics: [
              { id: 'http', name: 'HTTP', blogSlug: 'http' },
              { id: 'tcp', name: 'TCP', blogSlug: 'tcp' },
              { id: 'udp', name: 'UDP', blogSlug: 'udp' },
              { id: 'rpc', name: 'RPC', blogSlug: 'rpc' },
              { id: 'grpc', name: 'gRPC', blogSlug: 'grpc' },
              { id: 'rest', name: 'REST', blogSlug: 'rest' },
              { id: 'graphql', name: 'GraphQL', blogSlug: 'graphql' },
            ]
          },
          {
            id: 'idempotency',
            name: 'Idempotency',
            subtopics: [
              { id: 'idempotent-operations', name: 'Idempotent Operations', blogSlug: 'idempotent-operations' },
            ]
          },
        ]
      },
      {
        id: 'performance-reliability',
        name: 'Performance & Reliability',
        description: 'Anti-patterns that quietly wreck throughput, and how to see them coming.',
        concepts: [
          {
            id: 'performance-antipatterns',
            name: 'Performance Antipatterns',
            subtopics: [
              { id: 'improper-instantiation', name: 'Improper Instantiation', blogSlug: 'improper-instantiation' },
              { id: 'monolithic-persistence', name: 'Monolithic Persistence', blogSlug: 'monolithic-persistence' },
              { id: 'noisy-neighbor', name: 'Noisy Neighbor', blogSlug: 'noisy-neighbor' },
              { id: 'synchronous-io', name: 'Synchronous I/O', blogSlug: 'synchronous-io' },
              { id: 'extraneous-fetching', name: 'Extraneous Fetching', blogSlug: 'extraneous-fetching' },
              { id: 'busy-database', name: 'Busy Database', blogSlug: 'busy-database' },
              { id: 'busy-frontend', name: 'Busy Frontend', blogSlug: 'busy-frontend' },
              { id: 'chatty-io', name: 'Chatty I/O', blogSlug: 'chatty-io' },
              { id: 'retry-storm', name: 'Retry Storm', blogSlug: 'retry-storm' },
              { id: 'no-caching', name: 'No Caching', blogSlug: 'no-caching' },
            ]
          },
          {
            id: 'monitoring',
            name: 'Monitoring',
            subtopics: [
              { id: 'health-monitoring', name: 'Health Monitoring', blogSlug: 'health-monitoring' },
              { id: 'availability-monitoring', name: 'Availability Monitoring', blogSlug: 'availability-monitoring' },
              { id: 'performance-monitoring', name: 'Performance Monitoring', blogSlug: 'performance-monitoring' },
              { id: 'security-monitoring', name: 'Security Monitoring', blogSlug: 'security-monitoring' },
              { id: 'usage-monitoring', name: 'Usage Monitoring', blogSlug: 'usage-monitoring' },
              { id: 'instrumentation', name: 'Instrumentation', blogSlug: 'instrumentation' },
              { id: 'visualization-alerts', name: 'Visualization & Alerts', blogSlug: 'visualization-alerts' },
            ]
          },
        ]
      },
      {
        id: 'cloud-design-patterns',
        name: 'Cloud Design Patterns',
        description: 'Reusable structures for composing, managing data in, and messaging between cloud services.',
        concepts: [
          {
            id: 'design-implementation',
            name: 'Design & Implementation',
            subtopics: [
              { id: 'strangler-fig', name: 'Strangler Fig', blogSlug: 'strangler-fig' },
              { id: 'sidecar', name: 'Sidecar', blogSlug: 'sidecar' },
              { id: 'static-content-hosting-design', name: 'Static Content Hosting', blogSlug: 'static-content-hosting-design' },
              { id: 'leader-election', name: 'Leader Election', blogSlug: 'leader-election' },
              { id: 'cqrs-design', name: 'CQRS', blogSlug: 'cqrs-design' },
              { id: 'pipes-filters-design', name: 'Pipes & Filters', blogSlug: 'pipes-filters-design' },
              { id: 'ambassador', name: 'Ambassador', blogSlug: 'ambassador' },
              { id: 'gateway-routing', name: 'Gateway Routing', blogSlug: 'gateway-routing' },
              { id: 'gateway-offloading', name: 'Gateway Offloading', blogSlug: 'gateway-offloading' },
              { id: 'gateway-aggregation', name: 'Gateway Aggregation', blogSlug: 'gateway-aggregation' },
              { id: 'external-config-store', name: 'External Config Store', blogSlug: 'external-config-store' },
              { id: 'compute-resource-consolidation', name: 'Compute Resource Consolidation', blogSlug: 'compute-resource-consolidation' },
              { id: 'backends-for-frontend', name: 'Backends for Frontend', blogSlug: 'backends-for-frontend' },
              { id: 'anti-corruption-layer', name: 'Anti-Corruption Layer', blogSlug: 'anti-corruption-layer' },
            ]
          },
          {
            id: 'data-management',
            name: 'Data Management',
            subtopics: [
              { id: 'valet-key', name: 'Valet Key', blogSlug: 'valet-key' },
              { id: 'static-content-hosting-data', name: 'Static Content Hosting', blogSlug: 'static-content-hosting-data' },
              { id: 'sharding-data', name: 'Sharding', blogSlug: 'sharding-data' },
              { id: 'materialized-view', name: 'Materialized View', blogSlug: 'materialized-view' },
              { id: 'index-table', name: 'Index Table', blogSlug: 'index-table' },
              { id: 'event-sourcing', name: 'Event Sourcing', blogSlug: 'event-sourcing' },
              { id: 'cqrs-data', name: 'CQRS', blogSlug: 'cqrs-data' },
              { id: 'cache-aside-data', name: 'Cache-Aside', blogSlug: 'cache-aside-data' },
            ]
          },
          {
            id: 'messaging-patterns',
            name: 'Messaging Patterns',
            subtopics: [
              { id: 'sequential-convoy', name: 'Sequential Convoy', blogSlug: 'sequential-convoy' },
              { id: 'scheduling-agent-supervisor', name: 'Scheduling Agent Supervisor', blogSlug: 'scheduling-agent-supervisor' },
              { id: 'queue-based-load-leveling', name: 'Queue-Based Load Leveling', blogSlug: 'queue-based-load-leveling' },
              { id: 'publishersubscriber', name: 'Publisher/Subscriber', blogSlug: 'publishersubscriber' },
              { id: 'priority-queue', name: 'Priority Queue', blogSlug: 'priority-queue' },
              { id: 'pipes-and-filters-messaging', name: 'Pipes and Filters', blogSlug: 'pipes-and-filters-messaging' },
              { id: 'competing-consumers', name: 'Competing Consumers', blogSlug: 'competing-consumers' },
              { id: 'choreography', name: 'Choreography', blogSlug: 'choreography' },
              { id: 'claim-check', name: 'Claim Check', blogSlug: 'claim-check' },
              { id: 'async-request-reply', name: 'Async Request-Reply', blogSlug: 'async-request-reply' },
            ]
          },
        ]
      },
    ]
  },
  {
    id: 'machine-learning',
    number: '07',
    name: 'Machine Learning',
    difficulty: 'Hard',
    hours: 45,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Matrix algebra, probability, data processing, and supervised/unsupervised algorithms.',
    topics: [
      {
        id: 'ml-intro',
        name: 'Introduction to ML',
        description: 'Understand the role of ML Engineers, AI Engineers, and basic skills.',
        concepts: [
          {
            id: 'ml-roles',
            name: 'ML Engineer Roles',
            subtopics: [
              { id: 'what-is-ml-engineer', name: 'What is an ML Engineer?', blogSlug: 'what-is-ml-engineer' },
              { id: 'ml-vs-ai-engineer', name: 'ML Engineer vs AI Engineer', blogSlug: 'ml-vs-ai-engineer' },
              { id: 'ml-skills', name: 'Skills and Responsibilities', blogSlug: 'ml-skills' }
            ]
          }
        ]
      },
      {
        id: 'math-foundations',
        name: 'Mathematical Foundations',
        description: 'Multivariate calculus, matrix operations, probability basics, and statistical inference.',
        concepts: [
          {
            id: 'calculus',
            name: 'Calculus',
            subtopics: [
              { id: 'derivatives', name: 'Derivatives & Partial Derivatives', blogSlug: 'partial-derivative-slopes' },
              { id: 'chain-rule', name: 'Chain rule of derivation', blogSlug: 'chain-rule-derivation' },
              { id: 'gradient-jacobian-hessian', name: 'Gradient, Jacobian & Hessian', blogSlug: 'gradient-jacobian-hessian' }
            ]
          },
          {
            id: 'discrete-math',
            name: 'Discrete Mathematics',
            subtopics: [
              { id: 'discrete-math-basics', name: 'Discrete Mathematics Basics', blogSlug: 'discrete-mathematics-basics' }
            ]
          },
          {
            id: 'linear-algebra',
            name: 'Linear Algebra',
            subtopics: [
              { id: 'matrix-ops', name: 'Matrix & Matrix Operations', blogSlug: 'matrix-multiplication-gradients' },
              { id: 'scalars-vectors-tensors', name: 'Scalars, Vectors & Tensors', blogSlug: 'scalars-vectors-tensors' },
              { id: 'svd', name: 'Singular Value Decomposition', blogSlug: 'singular-value-decomposition' },
              { id: 'determinants-inverse', name: 'Determinants & Inverse of Matrix', blogSlug: 'determinants-matrix-inverse' },
              { id: 'eigenvalues', name: 'Eigenvalues & Diagonalization', blogSlug: 'eigenvalues-diagonalization' }
            ]
          },
          {
            id: 'probability',
            name: 'Probability',
            subtopics: [
              { id: 'probability-basics', name: 'Basics of Probability', blogSlug: 'probability-basics' },
              { id: 'bayes-theorem', name: 'Bayes Theorem', blogSlug: 'bayesian-probability-tables' },
              { id: 'random-variances-pdfs', name: 'Random Variances & PDFs', blogSlug: 'random-variances-pdfs' },
              { id: 'distribution-types', name: 'Types of Distribution', blogSlug: 'distribution-types' }
            ]
          },
          {
            id: 'statistics',
            name: 'Statistics',
            subtopics: [
              { id: 'stats-basics', name: 'Basic Concepts of Statistics', blogSlug: 'stats-basics' },
              { id: 'descriptive-stats', name: 'Descriptive Statistics', blogSlug: 'descriptive-statistics' },
              { id: 'graphs-charts', name: 'Graphs & Charts', blogSlug: 'graphs-charts' },
              { id: 'inferential-stats', name: 'Inferential Statistics', blogSlug: 'inferential-statistics' }
            ]
          }
        ]
      },
      {
        id: 'programming-fundamentals',
        name: 'Programming Fundamentals',
        description: 'Python core syntax, object-oriented concepts, and numerical/visualization libraries.',
        concepts: [
          {
            id: 'python-programming',
            name: 'Python Syntax',
            subtopics: [
              { id: 'python-syntax', name: 'Basic Syntax & Structure', blogSlug: 'python-basic-syntax' },
              { id: 'python-variables', name: 'Variables and Data Types', blogSlug: 'python-variables-types' },
              { id: 'python-ds', name: 'Data Structures', blogSlug: 'python-data-structures' },
              { id: 'python-loops', name: 'Loops', blogSlug: 'python-loops' },
              { id: 'python-conditionals', name: 'Conditionals', blogSlug: 'python-conditionals' },
              { id: 'python-exceptions', name: 'Exceptions', blogSlug: 'python-exceptions' },
              { id: 'python-functions', name: 'Functions & Built-ins', blogSlug: 'python-functions' }
            ]
          },
          {
            id: 'oop',
            name: 'Object Oriented Programming',
            subtopics: [
              { id: 'oop-basics', name: 'OOP Class Design', blogSlug: 'oop-class-inheritance-stubs' }
            ]
          },
          {
            id: 'essential-libraries',
            name: 'Essential Libraries',
            subtopics: [
              { id: 'numpy', name: 'Numpy', blogSlug: 'numpy-arrays' },
              { id: 'pandas', name: 'Pandas', blogSlug: 'pandas-dataframes' },
              { id: 'matplotlib', name: 'Matplotlib', blogSlug: 'matplotlib-plots' },
              { id: 'seaborn', name: 'Seaborn', blogSlug: 'seaborn-visualization' }
            ]
          }
        ]
      },
      {
        id: 'data-prep',
        name: 'Data Collection & Cleaning',
        description: 'Integrate data sources, clean formats, and apply scaling/normalization preprocessing.',
        concepts: [
          {
            id: 'data-sources',
            name: 'Data Sources',
            subtopics: [
              { id: 'databases', name: 'Databases (SQL & NoSQL)', blogSlug: 'databases-sql-nosql' },
              { id: 'internet', name: 'Internet Data Source', blogSlug: 'internet-data-source' },
              { id: 'apis', name: 'APIs & Data Extraction', blogSlug: 'apis-data-extraction' },
              { id: 'mobile-apps', name: 'Mobile Apps Data', blogSlug: 'mobile-apps-data' },
              { id: 'iot', name: 'IoT Devices Data', blogSlug: 'iot-devices-data' }
            ]
          },
          {
            id: 'data-formats',
            name: 'Data Formats',
            subtopics: [
              { id: 'csv', name: 'CSV Format', blogSlug: 'csv-format' },
              { id: 'excel', name: 'Excel Format', blogSlug: 'excel-format' },
              { id: 'json', name: 'JSON Format', blogSlug: 'json-format' },
              { id: 'parquet', name: 'Parquet Format', blogSlug: 'parquet-format' },
              { id: 'other-formats', name: 'Other Data Formats', blogSlug: 'other-data-formats' }
            ]
          },
          {
            id: 'preprocessing-techniques',
            name: 'Preprocessing Techniques',
            subtopics: [
              { id: 'data-cleaning', name: 'Data Cleaning', blogSlug: 'data-cleaning' },
              { id: 'feature-engineering', name: 'Feature Engineering', blogSlug: 'feature-engineering' },
              { id: 'feature-scaling', name: 'Feature Scaling & Normalization', blogSlug: 'feature-scaling' },
              { id: 'dim-reduction', name: 'Dimensionality Reduction', blogSlug: 'pca-dimension-projection-matrices' },
              { id: 'feature-selection', name: 'Feature Selection', blogSlug: 'feature-selection' }
            ]
          }
        ]
      },
      {
        id: 'classical-ml',
        name: 'Classical Machine Learning',
        description: 'Supervised regression/classification paradigms, unsupervised clustering, and evaluation workflows.',
        concepts: [
          {
            id: 'ml-paradigms',
            name: 'ML Paradigms',
            subtopics: [
              { id: 'what-is-ml', name: 'What is Machine Learning?', blogSlug: 'what-is-machine-learning' },
              { id: 'ml-supervised', name: 'Supervised Learning Paradigm', blogSlug: 'supervised-learning-paradigm' },
              { id: 'ml-unsupervised', name: 'Unsupervised Learning Paradigm', blogSlug: 'unsupervised-learning-paradigm' },
              { id: 'ml-semi-supervised', name: 'Semi-supervised Learning Paradigm', blogSlug: 'semi-supervised-learning-paradigm' },
              { id: 'ml-self-supervised', name: 'Self-supervised Learning Paradigm', blogSlug: 'self-supervised-learning-paradigm' },
              { id: 'ml-reinforcement', name: 'Reinforcement Learning Paradigm', blogSlug: 'reinforcement-learning-paradigm' }
            ]
          },
          {
            id: 'scikit-learn',
            name: 'Scikit-Learn Workflow',
            subtopics: [
              { id: 'data-loading', name: 'Data Loading', blogSlug: 'scikit-learn-data-loading' },
              { id: 'train-test-data', name: 'Train - Test Data Split', blogSlug: 'train-test-split' },
              { id: 'data-preparation', name: 'Data Preparation', blogSlug: 'scikit-learn-data-preparation' },
              { id: 'model-selection', name: 'Model Selection', blogSlug: 'scikit-learn-model-selection' },
              { id: 'tuning', name: 'Hyperparameter Tuning', blogSlug: 'scikit-learn-hyperparameter-tuning' },
              { id: 'prediction', name: 'Model Prediction', blogSlug: 'scikit-learn-prediction' }
            ]
          },
          {
            id: 'supervised-foundations',
            name: 'Supervised Foundations',
            subtopics: [
              { id: 'what-is-supervised', name: 'What is Supervised Learning?', blogSlug: 'what-is-supervised-learning' }
            ]
          },
          {
            id: 'classification-models',
            name: 'Classification Models',
            subtopics: [
              { id: 'knn', name: 'K-Nearest Neighbors (KNN)', blogSlug: 'k-nearest-neighbors' },
              { id: 'logistic-regression', name: 'Logistic Regression', blogSlug: 'logistic-regression-sigmoids' },
              { id: 'svm', name: 'Support Vector Machines', blogSlug: 'svm-hyper-plane-margin-offsets' },
              { id: 'decision-trees', name: 'Decision Trees & Random Forest', blogSlug: 'decision-trees-entropy-splits' },
              { id: 'gradient-boosting', name: 'Gradient Boosting Machines', blogSlug: 'gradient-boosting-tree-iterations' }
            ]
          },
          {
            id: 'regression-models',
            name: 'Regression Models',
            subtopics: [
              { id: 'linear-regression', name: 'Linear Regression', blogSlug: 'linear-regression-estimation' },
              { id: 'polynomial-regression', name: 'Polynomial Regression', blogSlug: 'polynomial-regression' },
              { id: 'lasso', name: 'Lasso Regression', blogSlug: 'lasso-regularization' },
              { id: 'ridge', name: 'Ridge Regression', blogSlug: 'ridge-regularization' },
              { id: 'elasticnet', name: 'ElasticNet Regularization', blogSlug: 'elasticnet-regularization' }
            ]
          },
          {
            id: 'unsupervised-foundations',
            name: 'Unsupervised Foundations',
            subtopics: [
              { id: 'what-is-unsupervised', name: 'What is Unsupervised Learning?', blogSlug: 'what-is-unsupervised-learning' }
            ]
          },
          {
            id: 'clustering-methods',
            name: 'Clustering Methods',
            subtopics: [
              { id: 'kmeans', name: 'K-Means Clustering', blogSlug: 'k-means-clustering-centers' },
              { id: 'exclusive', name: 'Exclusive Clustering', blogSlug: 'exclusive-clustering' },
              { id: 'overlapping', name: 'Overlapping Clustering', blogSlug: 'overlapping-clustering' },
              { id: 'hierarchical', name: 'Hierarchical Clustering', blogSlug: 'hierarchical-clustering' },
              { id: 'probabilistic', name: 'Probabilistic Clustering', blogSlug: 'probabilistic-clustering' }
            ]
          },
          {
            id: 'dim-reduction-classical',
            name: 'Dimensionality Reduction',
            subtopics: [
              { id: 'pca', name: 'Principal Component Analysis', blogSlug: 'pca-dimension-projection-matrices' },
              { id: 'autoencoders-classical', name: 'Autoencoders', blogSlug: 'autoencoders-dimension-compression' }
            ]
          },
          {
            id: 'model-evaluation',
            name: 'Model Evaluation & Validation',
            subtopics: [
              { id: 'what-is-model-eval', name: 'What is Model Evaluation?', blogSlug: 'what-is-model-evaluation' },
              { id: 'why-eval-important', name: 'Why is it important?', blogSlug: 'why-evaluation-important' },
              { id: 'accuracy-metric', name: 'Accuracy', blogSlug: 'accuracy-metric' },
              { id: 'precision-metric', name: 'Precision', blogSlug: 'precision-metric' },
              { id: 'recall-metric', name: 'Recall', blogSlug: 'recall-metric' },
              { id: 'f1-score-metric', name: 'F1-Score', blogSlug: 'f1-score-metric' },
              { id: 'roc-auc-metric', name: 'ROC-AUC', blogSlug: 'roc-auc-metric' },
              { id: 'log-loss-metric', name: 'Log Loss', blogSlug: 'log-loss-metric' },
              { id: 'confusion-matrix', name: 'Confusion Matrix', blogSlug: 'confusion-matrix' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ai-data-scientist',
    number: '08',
    name: 'AI & Data Scientist',
    difficulty: 'Hard',
    hours: 40,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Advanced mathematics, statistics, econometrics, exploratory data analysis, machine learning, deep learning, MLOps, prompt engineering, and vibe coding.',
    topics: [
      {
        id: 'ai-math',
        name: 'Mathematics',
        description: 'Linear algebra, multi-dimensional calculus, and mathematical analysis fundamentals.',
        concepts: [
          {
            id: 'ai-math-analysis',
            name: 'Linear Algebra, Calculus, Mathematical Analysis',
            subtopics: [
              { id: 'math-for-ml', name: 'Mathematics for Machine Learning', blogSlug: 'mathematics-for-machine-learning' }
            ]
          },
          {
            id: 'ai-diff-calculus',
            name: 'Differential Calculus',
            subtopics: [
              { id: 'algebra-diff-calculus', name: 'Coursera: Algebra and Differential Calculus', blogSlug: 'algebra-differential-calculus' }
            ]
          }
        ]
      },
      {
        id: 'ai-stats',
        name: 'Statistics',
        description: 'Probability, hypothesis testing, experiment design, A/B testing frameworks, and metric analytics.',
        concepts: [
          {
            id: 'ai-stats-clt',
            name: 'Statistics, CLT',
            subtopics: [
              { id: 'intro-to-stats', name: 'Coursera: Introduction to Statistics', blogSlug: 'introduction-to-statistics' }
            ]
          },
          {
            id: 'ai-hypothesis',
            name: 'Hypothesis Testing',
            subtopics: [
              { id: 'hypothesis-testing-detail', name: 'Coursera: Hypothesis Testing', blogSlug: 'hypothesis-testing' }
            ]
          },
          {
            id: 'ai-prob-sampling',
            name: 'Probability and Sampling',
            subtopics: [
              { id: 'prob-stats-course', name: 'Coursera: Probability and Statistics', blogSlug: 'probability-and-statistics' }
            ]
          },
          {
            id: 'ai-ab-testing',
            name: 'AB Testing',
            subtopics: [
              { id: 'practitioners-guide-stats', name: 'Practitioner\'s Guide to Statistical Tests', blogSlug: 'practitioners-guide-statistical-tests' },
              { id: 'experiment-design-detail', name: 'Experiment Design Article', blogSlug: 'experiment-design' }
            ]
          },
          {
            id: 'ai-test-sensitivity',
            name: 'Increasing Test Sensitivity',
            subtopics: [
              { id: 'min-detectable-effect', name: 'Minimum Detectable Effect', blogSlug: 'minimum-detectable-effect' },
              { id: 'improving-test-sensitivity', name: 'Paper: Improving Test Sensitivity', blogSlug: 'improving-test-sensitivity' },
              { id: 'improving-sensitivity-cuped', name: 'Paper: Improving Sensitivity (CUPED)', blogSlug: 'improving-sensitivity-cuped' },
              { id: 'cuped-booking', name: 'CUPED at Booking.com', blogSlug: 'cuped-at-booking' },
              { id: 'doordash-cupac', name: 'Doordash: CUPAC', blogSlug: 'doordash-cupac' },
              { id: 'netflix-stratification', name: 'Netflix: Stratification', blogSlug: 'netflix-stratification' }
            ]
          },
          {
            id: 'ai-ratio-metrics',
            name: 'Ratio Metrics',
            subtopics: [
              { id: 'microsoft-delta-method', name: 'Microsoft: Delta Method in Metric Analytics', blogSlug: 'microsoft-delta-method' },
              { id: 'ratio-metrics-detail', name: 'Paper: Ratio Metrics', blogSlug: 'ratio-metrics' }
            ]
          }
        ]
      },
      {
        id: 'ai-econometrics',
        name: 'Econometrics',
        description: 'Regression analysis, time series modeling, forecasting tasks, and fitting distributions.',
        concepts: [
          {
            id: 'ai-econ-prereqs',
            name: 'Pre-requisites of Econometrics',
            subtopics: [
              { id: 'fundamentals-econometrics', name: 'Fundamentals of Econometrics', blogSlug: 'fundamentals-of-econometrics' }
            ]
          },
          {
            id: 'ai-econ-regression',
            name: 'Regression, Timeseries, Fitting Distributions',
            subtopics: [
              { id: 'intro-econometrics', name: 'Intro to Econometrics', blogSlug: 'intro-to-econometrics' },
              { id: 'econometrics-course', name: 'Coursera: Econometrics', blogSlug: 'econometrics-course' },
              { id: 'learn-time-series', name: 'Kaggle: Learn Time Series', blogSlug: 'learn-time-series' },
              { id: 'time-series-basics', name: 'Kaggle: Time Series Basics', blogSlug: 'time-series-basics' },
              { id: 'arima-time-series', name: 'ARIMA model for Time Series', blogSlug: 'arima-model-for-time-series' },
              { id: 'time-series-models', name: 'Time Series Models', blogSlug: 'time-series-models' },
              { id: 'forecasting-task', name: 'Forecasting Task with Solution', blogSlug: 'forecasting-task-with-solution' },
              { id: 'linear-regression-econ', name: 'Coursera: Linear Regression', blogSlug: 'linear-regression-econ' }
            ]
          }
        ]
      },
      {
        id: 'ai-coding',
        name: 'Coding',
        description: 'Python fundamentals, data structures, algorithmic paradigms, and SQL querying.',
        concepts: [
          {
            id: 'ai-learn-python',
            name: 'Learn Python Programming Language',
            subtopics: [
              { id: 'learn-python-kaggle', name: 'Learn Python: Kaggle', blogSlug: 'learn-python-kaggle' },
              { id: 'google-python-class', name: 'Google\'s Python Class', blogSlug: 'googles-python-class' }
            ]
          },
          {
            id: 'ai-dsa-python',
            name: 'Data Structures and Algorithms (Python)',
            subtopics: [
              { id: 'algorithmic-exercises', name: 'Algorithmic Exercises', blogSlug: 'algorithmic-exercises' },
              { id: 'leetcode-study-plans', name: 'Study Plans - Leetcode', blogSlug: 'study-plans-leetcode' },
              { id: 'algorithms-specialization-course', name: 'Algorithms Specialization', blogSlug: 'algorithms-specialization' }
            ]
          },
          {
            id: 'ai-learn-sql',
            name: 'Learn SQL',
            subtopics: [
              { id: 'sql-tutorial-course', name: 'SQL Tutorial', blogSlug: 'sql-tutorial-course' }
            ]
          }
        ]
      },
      {
        id: 'ai-eda',
        name: 'Exploratory Data Analysis',
        description: 'Data analysis pipelines, pandas aggregations, and seaborn statistical plotting.',
        concepts: [
          {
            id: 'ai-eda-viz',
            name: 'Data understanding, Data Analysis and Visualization',
            subtopics: [
              { id: 'eda-python-pandas', name: 'Exploratory Data Analysis with Python and Pandas', blogSlug: 'exploratory-data-analysis-with-python-and-pandas' },
              { id: 'eda-ml', name: 'Exploratory Data Analysis for Machine Learning', blogSlug: 'exploratory-data-analysis-for-machine-learning' },
              { id: 'eda-seaborn', name: 'Exploratory Data Analysis with Seaborn', blogSlug: 'exploratory-data-analysis-with-seaborn' }
            ]
          }
        ]
      },
      {
        id: 'ai-ml-classic',
        name: 'Machine Learning',
        description: 'Classic supervised and unsupervised paradigms, ensemble methods, and textbook references.',
        concepts: [
          {
            id: 'ai-ml-classic-advanced',
            name: 'Classic ML (Sup., Unsup.), Advanced ML (Ensembles, NNs)',
            subtopics: [
              { id: 'open-ml-course', name: 'Open Machine Learning Course - Open Data Science', blogSlug: 'open-machine-learning-course' },
              { id: 'ml-specialization-course', name: 'Machine Learning Specialization', blogSlug: 'machine-learning-specialization' },
              { id: 'pattern-recognition-ml', name: 'Pattern Recognition & ML by Christopher m. Bishop', blogSlug: 'pattern-recognition-ml' },
              { id: 'pattern-recognition-github', name: 'GitHub repository with notes & code from the eBook above', blogSlug: 'pattern-recognition-github' }
            ]
          }
        ]
      },
      {
        id: 'ai-dl',
        name: 'Deep Learning',
        description: 'Feed-forward nets, backpropagation, CNNs, RNNs, and self-attention transformers.',
        concepts: [
          {
            id: 'ai-dl-architecture',
            name: 'Fully Connected, CNN, RNN, LSTM, Transformers, TL',
            subtopics: [
              { id: 'dl-specialization-courses', name: 'Deep Learning Specialization', blogSlug: 'deep-learning-specialization' },
              { id: 'dl-book-ebook', name: 'Deep Learning Book', blogSlug: 'deep-learning-book' },
              { id: 'attention-is-all-you-need', name: 'Attention is all you need', blogSlug: 'attention-is-all-you-need' },
              { id: 'illustrated-transformer', name: 'The Illustrated Transformer', blogSlug: 'illustrated-transformer' }
            ]
          }
        ]
      },
      {
        id: 'ai-mlops',
        name: 'MLOps',
        description: 'Deployment models, inference engines, model drift monitoring, and CI/CD pipelines.',
        concepts: [
          {
            id: 'ai-mlops-deployment',
            name: 'Deployment Models, CI/CD',
            subtopics: [
              { id: 'mlops-specialization-courses', name: 'MLOps Specialization', blogSlug: 'mlops-specialization' }
            ]
          }
        ]
      },
      {
        id: 'ai-engineering-new',
        name: 'AI Engineering',
        description: 'Prompt engineering, large language model integrations, RAG architectures, and agentic reasoning.',
        concepts: [
          {
            id: 'ai-eng-prompt',
            name: 'Prompt Engineering, LLMs, RAG, Agents, Fine-tuning',
            subtopics: [
              { id: 'google-ai-courses', name: 'Google AI Courses', blogSlug: 'google-ai-courses' },
              { id: 'huggingface-nlp', name: 'Hugging Face NLP', blogSlug: 'hugging-face-nlp' },
              { id: 'prompt-engineering-guide-detail', name: 'Prompt Engineering Guide', blogSlug: 'prompt-engineering-guide' },
              { id: 'rag-nlp-paper', name: 'RAG for Knowledge - Intensive NLP Tasks', blogSlug: 'rag-for-knowledge-intensive-nlp-tasks' }
            ]
          }
        ]
      },
      {
        id: 'ai-vibe-coding',
        name: 'Vibe Coding',
        description: 'Leveraging AI coding assistants, code synthesis models, and agentic workflows.',
        concepts: [
          {
            id: 'ai-vibe-coding-assistants',
            name: 'AI Coding Assitants, AI App Builders',
            subtopics: [
              { id: 'vibe-coding-fundamentals', name: 'Vibe Coding Fundamentals', blogSlug: 'vibe-coding-fundamentals' },
              { id: 'claude-code-docs', name: 'Claude Code', blogSlug: 'claude-code-docs' },
              { id: 'agentic-coding-handbook', name: 'Agentic Coding Handbook', blogSlug: 'agentic-coding-handbook' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'software-engineering',
    number: '09',
    name: 'Software Engineering Practices',
    difficulty: 'Medium',
    hours: 28,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'OOP vs Functional, SOLID patterns, Git version trees, and testing.',
    topics: [
      {
        id: 'paradigms-git',
        name: 'Engineering Practices',
        description: 'Design paradigms and version controllers.',
        concepts: [
          {
            id: 'coding-paradigms',
            name: 'System Coding',
            subtopics: [
              { id: 'oop-functional', name: 'OOP & Functional stubs', blogSlug: 'oop-class-inheritance-stubs' },
              { id: 'solid-rules', name: 'SOLID rules design', blogSlug: 'solid-single-responsibility-rules' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'theoretical-cs',
    number: '10',
    name: 'Theoretical Computer Science',
    difficulty: 'Hard',
    hours: 36,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'DFAs, grammars, Turing tapes, halting proofs, and NP-completeness reductions.',
    topics: [
      {
        id: 'limits-hardness',
        name: 'Limits of Computability',
        description: 'Grammars, automatas, and hardness classes.',
        concepts: [
          {
            id: 'automatas-complexity',
            name: 'Computation Bounds',
            subtopics: [
              { id: 'dfa-grammars', name: 'DFA State transitions', blogSlug: 'dfa-state-transitions-automatas' },
              { id: 'p-np-limits', name: 'P vs NP hardness bounds', blogSlug: 'p-vs-np-class-limits' }
            ]
          }
        ]
      }
    ]
  }
];
