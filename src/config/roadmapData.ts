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
            id: 'asymptotic-notations',
            name: 'Asymptotic Notations',
            subtopics: [
              { id: 'big-o-notation', name: 'Big-O Notation', blogSlug: 'searching' },
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
        id: 'trees-heaps',
        name: 'Trees & Heaps',
        description: 'Hierarchical node trees, prefix searches, and range indexes.',
        concepts: [
          {
            id: 'tree-basics',
            name: 'Tree Basics',
            subtopics: [
              { id: 'binary-tree', name: 'Binary Tree', blogSlug: 'binary-tree' },
              { id: 'binary-search-tree', name: 'Binary Search Tree (BST)', blogSlug: 'binary-search-trees' },
              { id: 'tree-traversals', name: 'Tree Traversals', blogSlug: 'tree-traversal' }
            ]
          },
          {
            id: 'balanced-trees',
            name: 'Balanced Trees',
            subtopics: [
              { id: 'avl-tree', name: 'AVL Tree', blogSlug: 'avl-trees' },
              { id: 'red-black-tree', name: 'Red-Black Tree', blogSlug: 'red-black-trees' }
            ]
          },
          {
            id: 'range-queries',
            name: 'Range Query Trees',
            subtopics: [
              { id: 'segment-tree', name: 'Segment Tree', blogSlug: 'segment-tree' },
              { id: 'fenwick-tree', name: 'Fenwick Tree (BIT)', blogSlug: 'fenwick-tree' },
              { id: 'sparse-table', name: 'Sparse Table', blogSlug: 'sparse-table' }
            ]
          },
          {
            id: 'advanced-trees',
            name: 'Advanced Trees',
            subtopics: [
              { id: 'trie-prefix', name: 'Trie (Prefix Tree)', blogSlug: 'trie' },
              { id: 'treap', name: 'Treap', blogSlug: 'treaps' },
              { id: 'b-tree', name: 'B-Tree & B+ Tree', blogSlug: 'b-trees-index-seeks' }
            ]
          },
          {
            id: 'heaps',
            name: 'Heaps & Priorities',
            subtopics: [
              { id: 'min-max-heap', name: 'Min & Max Heaps', blogSlug: 'min-heaps' },
              { id: 'binomial-heap', name: 'Binomial Heap', blogSlug: 'binomial-heaps' },
              { id: 'fibonacci-heap', name: 'Fibonacci Heap', blogSlug: 'fibonacci-heaps' }
            ]
          }
        ]
      },
      {
        id: 'graphs',
        name: 'Graphs & Networks',
        description: 'Adjacency structures, path explorations, shortest paths, and spanning networks.',
        concepts: [
          {
            id: 'graph-foundations',
            name: 'Graph Foundations',
            subtopics: [
              { id: 'graph-representations', name: 'Graph Representations', blogSlug: 'graph-representations' },
              { id: 'bfs-traversal', name: 'BFS Traversal', blogSlug: 'bfs-traversal' },
              { id: 'dfs-traversal', name: 'DFS Traversal', blogSlug: 'dfs-traversal' },
              { id: 'topological-sorting', name: 'Topological Sorting', blogSlug: 'topological-sort' }
            ]
          },
          {
            id: 'shortest-paths',
            name: 'Shortest Paths',
            subtopics: [
              { id: 'dijkstra', name: 'Dijkstra\'s Algorithm', blogSlug: 'dijkstra' },
              { id: 'bellman-ford', name: 'Bellman-Ford Algorithm', blogSlug: 'bellman-ford-floyd-warshall' },
              { id: 'floyd-warshall', name: 'Floyd-Warshall Algorithm', blogSlug: 'floyd-warshall-algorithm' }
            ]
          },
          {
            id: 'spanning-trees',
            name: 'Spanning Trees',
            subtopics: [
              { id: 'kruskal-mst', name: 'Kruskal\'s MST', blogSlug: 'kruskal-mst' },
              { id: 'prim-mst', name: 'Prim\'s MST', blogSlug: 'prim-mst' },
              { id: 'dsu', name: 'Disjoint Set Union (DSU)', blogSlug: 'mst-union-find' }
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
              { id: 'bubble-selection', name: 'Bubble & Selection Sort', blogSlug: 'bubble-sort' },
              { id: 'insertion-sort', name: 'Insertion Sort', blogSlug: 'insertion-sort' },
              { id: 'merge-sort', name: 'Merge Sort', blogSlug: 'merge-sort' },
              { id: 'quick-sort', name: 'Quick Sort', blogSlug: 'quick-sort' },
              { id: 'heap-sort', name: 'Heap Sort', blogSlug: 'heap-sort' },
              { id: 'radix-bucket', name: 'Radix & Bucket Sort', blogSlug: 'radix-sort' }
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
        id: 'algorithmic-paradigms',
        name: 'Algorithmic Paradigms',
        description: 'Optimization architectures and sequence design techniques.',
        concepts: [
          {
            id: 'paradigms',
            name: 'Design Paradigms',
            subtopics: [
              { id: 'divide-conquer', name: 'Divide and Conquer', blogSlug: 'divide-and-conquer' },
              { id: 'greedy', name: 'Greedy Algorithms', blogSlug: 'greedy' },
              { id: 'dp', name: 'Dynamic Programming', blogSlug: 'dynamic-programming' },
              { id: 'backtracking', name: 'Backtracking', blogSlug: 'backtracking' },
              { id: 'branch-bound', name: 'Branch and Bound', blogSlug: 'branch-and-bound' }
            ]
          }
        ]
      },
      {
        id: 'string-algorithms',
        name: 'String Algorithms',
        description: 'Pattern matching and search structures.',
        concepts: [
          {
            id: 'pattern-matching',
            name: 'Pattern Matching',
            subtopics: [
              { id: 'kmp', name: 'KMP Algorithm', blogSlug: 'kmp-algorithm' },
              { id: 'rabin-karp', name: 'Rabin-Karp Algorithm', blogSlug: 'rabin-karp-search' },
              { id: 'z-algo', name: 'Z-Algorithm', blogSlug: 'z-algorithm' }
            ]
          },
          {
            id: 'advanced-strings',
            name: 'Advanced Strings',
            subtopics: [
              { id: 'suffix-structures', name: 'Suffix Array & Tree', blogSlug: 'suffix-arrays' }
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
    name: 'Machine Learning & AI',
    difficulty: 'Hard',
    hours: 50,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Matrix computations, regressions, backpropagation, and self-attention networks.',
    topics: [
      {
        id: 'ml-optimization',
        name: 'ML Computations',
        description: 'Vector products, models, and optimization gradients.',
        concepts: [
          {
            id: 'vectors-optimization',
            name: 'Fitting Logic',
            subtopics: [
              { id: 'linear-reg', name: 'Linear regression models', blogSlug: 'linear-regression-estimation' },
              { id: 'backprop', name: 'Backpropagation Neural networks', blogSlug: 'neural-network-activation-layers' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'software-engineering',
    number: '08',
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
    number: '09',
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
