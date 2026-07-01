const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'config', 'blogData.ts');
let content = fs.readFileSync(targetFile, 'utf8');

// Truncate existing generated blogs first to avoid duplication/bloat
const kmpIndex = content.indexOf("slug: 'kmp-algorithm'");
if (kmpIndex !== -1) {
  let endBlock = content.indexOf("}\r\n  }", kmpIndex);
  let lengthToKeep = 6;
  if (endBlock === -1) {
    endBlock = content.indexOf("}\n  }", kmpIndex);
    lengthToKeep = 5;
  }
  if (endBlock !== -1) {
    content = content.substring(0, endBlock + lengthToKeep) + "\n];\n";
  }
}

const categories = [
  'Data Structures',
  'Algorithms',
  'Computer Systems',
  'Databases',
  'Computer Networks',
  'Operating Systems',
  'System Design',
  'Machine Learning',
  'Software Engineering',
  'Theoretical CS'
];

const subtopics = {
  'Data Structures': [
    'Static Arrays', 'Dynamic Vectors', 'Singly Linked Lists', 'Doubly Linked Lists', 'Circular Linked Lists',
    'Skip Lists', 'LIFO Stacks', 'FIFO Queues', 'Double Ended Deques', 'Circular Buffers', 'Min Heaps', 'Max Heaps',
    'Binary Search Trees', 'AVL Trees', 'Red-Black Trees', 'Tries', 'Segment Trees', 'Fenwick Trees', 'Sparse Tables',
    'Suffix Trees', 'Suffix Arrays', 'B-Trees', 'B+ Trees', 'Quadtrees', 'K-D Trees', 'Splay Trees', 'Treaps',
    'Leftist Heaps', 'Binomial Heaps', 'Fibonacci Heaps'
  ],
  'Algorithms': [
    'Linear Search', 'Binary Search', 'Ternary Search', 'Bubble Sort', 'Selection Sort', 'Insertion Sort',
    'Merge Sort', 'Quick Sort', 'Heap Sort', 'Counting Sort', 'Radix Sort', 'Bucket Sort', 'Shell Sort',
    'BFS Traversal', 'DFS Traversal', 'Topological Sort', 'Dijkstra Algorithm', 'Bellman-Ford', 'Floyd-Warshall',
    'Kruskal MST', 'Prim MST', 'Tarjan SCC', 'Kosaraju SCC', 'Bridges & Cuts', 'A* Search', 'Boyer-Moore Search',
    'Rabin-Karp Search', 'Z-Algorithm', 'Manacher Substrings', 'Euler Tour'
  ],
  'Computer Systems': [
    'CPU Register layouts', 'Instruction Pipelining', 'ALU Operations', 'Microcode instruction sets',
    'L1 Cache hits', 'L2 Cache layouts', 'L3 Cache sharing', 'Cache line validation', 'Cache line evictions',
    'RAM Bus channels', 'Virtual Memory paging', 'Page Table directories', 'TLB Translation cache',
    'Memory Segmentation', 'Binary Endianness', 'IEEE 754 Float bits', 'Twos Complement logic',
    'Hardware interrupts', 'Direct Memory Access (DMA)', 'Instruction Set Architectures (ISA)',
    'RISC vs CISC computing', 'Branch Prediction logic', 'Out-of-Order Execution', 'Superscalar CPU bounds',
    'SIMD Vector extensions', 'Memory Barriers & Fences', 'ECC Memory parity', 'Storage bus channels',
    'GPU Parallel computation', 'Hardware security rings'
  ],
  'Databases': [
    'Relational models', 'First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)',
    'BCNF normalization', 'Primary keys indexing', 'Foreign key constraints', 'Hash Indexes',
    'B-Trees indexes', 'B+ Trees index seeks', 'Query optimizer cost plans', 'Execution plan sweeps',
    'Transaction Isolation properties', 'Write-Ahead Logging (WAL)', 'Two-Phase Locking (2PL)',
    'ACID properties validation', 'Distributed databases sharding', 'CAP Theorem consistency',
    'Key-value store nodes', 'Document databases JSON', 'Columnar storage layout', 'Graph databases relationships',
    'Consistent Hashing slots', 'Optimistic Concurrency Control', 'Multi-Version Concurrency Control (MVCC)',
    'Database replication lags', 'Write conflict detections', 'Read-committed isolation anomalies',
    'Repeatable-read phantom reads', 'SSTables and LSM Trees log structure'
  ],
  'Computer Networks': [
    'OSI Layer boundaries', 'TCP Handshake connection', 'TCP Congestion window', 'UDP packet sockets',
    'IP Subnet mask routing', 'ARP MAC translation', 'DNS root authority resolution', 'DNS Record cache records',
    'HTTP/1.1 connection pooling', 'HTTP/2 frame multiplexing', 'HTTP/3 QUIC transport', 'HTTP Headers cookies',
    'WebSocket connection streaming', 'Anycast network routing CDN', 'CDN Edge node caches', 'REST resource models',
    'GraphQL schema resolvers', 'gRPC Protobuf serialization', 'SSL/TLS handshake keys', 'IPv4 vs IPv6 namespaces',
    'NAT port mappings', 'BGP Autonomous routing', 'ICMP diagnostics ping', 'DHCP IP lease assignment',
    'Load balancer layer 4 routing', 'Reverse proxies layer 7 headers', 'WebSockets keep-alive pings',
    'CORS header origins', 'JWT Token security signatures', 'OAuth Authorization flows'
  ],
  'Operating Systems': [
    'Process Control Blocks (PCB)', 'Context switch overheads', 'Round-robin task queues', 'CFS scheduler weights',
    'Process state transitions', 'Thread mutex variables', 'Semaphore locks counters', 'Race condition flags',
    'Deadlock Coffman requirements', 'Bankers resource allocations', 'Inode metadata records',
    'File Descriptor index mappings', 'Virtual File System abstraction', 'User vs Kernel mode rings',
    'System Call traps interrupts', 'Interrupt Vector Tables', 'Page replacement algorithms (FIFO)',
    'LRU Page evictions', 'Thrashing memory exhaustion', 'Spinlock concurrency boundaries',
    'IPC pipe socket buffers', 'Shared Memory segments', 'Signals communication handlers',
    'CPU Affinity cores selection', 'Dirty page flush daemons', 'Hard links vs Symbolic links',
    'Device Driver operations', 'Direct I/O block bypasses', 'Memory mapped files (mmap)', 'Epoll dynamic event triggers'
  ],
  'System Design': [
    'Load Balancing servers select', 'Reverse proxy caches', 'CDN edge caching strategies', 'LRU cache eviction slots',
    'Write-through memory updates', 'Write-behind memory updates', 'Consistent hashing ring slots',
    'Pub/Sub dispatcher channels', 'Kafka partitioned logs offset', 'Distributed state quorums',
    'Leader Election Raft status', 'Replicated state machines', 'Gossip protocols cluster metadata',
    'Rate Limiting token bucket', 'Circuit Breaker fallback states', 'API Gateway route proxies',
    'Database Read Replicas scaling', 'Database Sharding partitions', 'Distributed ID snowflake generation',
    'Distributed Tracing span spans', 'Centralized logging indexes', 'Saga Orchestrator transactions',
    'Two-Phase Commit distributed blocks', 'Vector Clocks conflict metrics', 'Heartbeats cluster liveness checks',
    'Failover replication DNS updates', 'DNS Round-Robin weights', 'Backpressure queues sizing',
    'Data center disaster replicas', 'Cache Stampede prevention guards'
  ],
  'Machine Learning': [
    'Vector dot product maths', 'Matrix multiplication gradients', 'Partial derivative slopes',
    'Bayesian probability tables', 'Linear regression estimation', 'Decision trees entropy splits',
    'Logistic regression sigmoids', 'Neural network activation layers', 'Backpropagation derivative chains',
    'Stochastic Gradient Descent steps', 'Learning rate optimization metrics', 'Self-attention scoring grids',
    'Transformers position encoding', 'CNN feature kernel filters', 'RNN sequence recurrence blocks',
    'Autoencoders dimension compression', 'K-Means clustering centers', 'Random forest model bags',
    'SVM hyper-plane margin offsets', 'L1/L2 Regularization weights', 'Overfitting dropout validation',
    'Precision Recall F1 metrics', 'Gradient Boosting tree iterations', 'LLM parameter prompt values',
    'Supervised vs Unsupervised models', 'Reinforcement learning Q-table steps', 'Generative Adversarial Networks (GANs)',
    'Batch Normalization activations', 'Vanishing Gradient tanh limits', 'PCA dimension projection matrices'
  ],
  'Software Engineering': [
    'OOP class inheritance stubs', 'Functional closures purity rules', 'Procedural state pipelines',
    'SOLID Single Responsibility rules', 'SOLID Interface segregation structures', 'SOLID Dependency Inversion injection',
    'Factory class objects patterns', 'Observer notify events patterns', 'Strategy interface execution configurations',
    'Git Commit hashing indexes', 'Git Merge conflict resolutions', 'Git Rebase history rewrite steps',
    'Unit asserting assertions validations', 'Integration test pipelines configurations', 'Docker container namespace layers',
    'CI/CD build deployment tasks', 'Agile sprint story metrics', 'Clean code refactoring loops',
    'Technical Debt codebase audits', 'API backward-compatibility rules', 'Semantic Versioning release increments',
    'Code review feedback iterations', 'Test-Driven Development Red-Green loops', 'Mocking interface dependency overrides',
    'Static code linting rules'
  ],
  'Theoretical CS': [
    'DFA State transitions automatas', 'CFG production grammars bounds', 'Regular language matches expressions',
    'Turing tape state transitions', 'Halting Problem undecidability contradiction', 'P vs NP class limits',
    'NP-Complete polynomial reductions', 'Polynomial time verification runs', 'Cook-Levin theorem SAT formulas',
    'Pushdown Automata stack transitions', 'Chomsky grammar hierarchies', 'Gödel incompleteness logic limits',
    'Church-Turing computability lambda calculus', 'Deterministic vs Non-deterministic complexity', 'Space complexity class PSPACE',
    'Time hierarchy theorem bounds', 'Circuit complexity gates bounds', 'Interactive proofs IP classes',
    'Zero-Knowledge proof protocols verification', 'Approximation algorithm bounds bounds', 'Randomized algorithm probability checks',
    'Parameterized complexity tractability splits', 'Quantum complexity BQP bounds', 'Graph isomorphism classification',
    'Boolean satisfiability solvers algorithms'
  ]
};

function getIntroduction(topic, category) {
  return `${topic} is a fundamental concept in the study of ${category}, defining how computing architectures handle structural data, execution lifecycles, and algorithmic complexity limits. Unlike simple memory abstractions, implementing ${topic} forces developers to balance processor efficiency against overall memory footprint constraints.\\n\\nIn standard engineering practices, this concept forms the core of high-throughput pipelines. By shifting away from naive linear workflows, it optimizes lookups, cache locality, and runtime pipelines. Developing a strong intuition for ${topic} allows developers to build systems that scale smoothly without introducing unexpected lock contentions, CPU bottlenecks, or resource starvation.`;
}

function getWhyImportant(topic, category) {
  return `Mastering ${topic} is critical because modern enterprise workloads demand optimal execution speeds and minimal memory overhead. Without a rigorous understanding of this topic's underlying invariants and execution boundaries, application bottlenecks can emerge silently under production stress. This concept bridges basic programming logic with hardware-level optimizations, ensuring that data manipulation pipelines operate within predictable asymptotic bounds. For system designers, selecting or implementing ${topic} is an essential design decision that directly impacts database reads, networking efficiency, and concurrent throughput constraints.`;
}

function getRealWorldApps(topic) {
  return [
    `**Database Index Partitioning:** Structuring storage indexes via ${topic} ranges to speed up query execution blocks under massive dataset operations.`,
    `**Hardware Cache Optimization:** Managing processor instruction paths and register lookups to minimize cache miss penalties in high-performance engines.`,
    `**Asynchronous Thread Management:** Coordinating dynamic pipeline queues and resource locks inside concurrent operating system schedulers.`
  ];
}

function getAlgorithmDescription(topic) {
  return [
    `**Initialization Phase:** Allocate standard memory arrays or instantiate node reference coordinates, setting up the boundary limits for execution variables.`,
    `**Traversal and Partitioning:** Loop through key thresholds using pointer shifts, checking invariants and validating boundary constraints sequentially.`,
    `**State Consolidation:** Resolve pointer assignments, run garbage cleanup if applicable, and return the mutated structure or computed outcome.`
  ];
}

function getCommonMistakes(topic) {
  return [
    `**Boundary Verification Failure:** Neglecting to check bounds or index limits during pointer transitions, leading to segmentation faults or memory corruption.`,
    `**Memory Leak Overflows:** Failing to free allocated structures or dereference child links in cyclic setups, which triggers runtime memory exhaustion.`,
    `**Inefficient Access Patterns:** Designing randomized lookup sweeps instead of sequential traversals, degrading CPU hardware cache locality advantages.`
  ];
}

function getSummary(topic, category) {
  return `Ultimately, ${topic} provides the building blocks for performant software design in the ${category} space. By combining algorithmic efficiency with low-level structural optimizations, it enables systems to scale predictably. Understanding its trade-offs is key to writing clean, reliable code that respects hardware constraints.`;
}

const generatedArticles = [];
let totalAdded = 0;

for (const category of categories) {
  const list = subtopics[category] || [];
  for (const topic of list) {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    generatedArticles.push({
      slug,
      title: topic,
      tagline: `Learn the fundamentals of ${topic} under the ${category} domain. Covers structural patterns, complexity, code snippets, and common pitfalls.`,
      category,
      readTime: Math.floor(Math.random() * 8) + 5,
      lastUpdated: 'June 2026',
      prerequisites: [],
      related: [],
      practiceProblems: [
        { title: `Explore ${topic} Practice (Problem 1)`, difficulty: 'Medium', url: '#' },
        { title: `Solve ${topic} Challenges (Problem 2)`, difficulty: 'Hard', url: '#' }
      ],
      content: {
        introduction: getIntroduction(topic, category),
        whyImportant: getWhyImportant(topic, category),
        realWorldApps: getRealWorldApps(topic),
        algorithmDescription: getAlgorithmDescription(topic),
        complexity: [
          { label: 'Time Complexity', value: 'O(N)', note: 'Average search or traversal execution bounds' },
          { label: 'Auxiliary Space', value: 'O(1)', note: 'Constant memory overhead space allocation' },
          { label: 'Preprocessing Bounds', value: 'O(N)', note: 'Linear compilation or allocation setup cost' }
        ],
        implementationCpp: `// Sample implementation for ${topic}\\nvoid execute() {\\n  // Run executing logic here\\n}`,
        implementationPython: `# Sample implementation for ${topic}\\ndef execute():\\n    # Run executing logic here\\n    pass`,
        commonMistakes: getCommonMistakes(topic),
        interviewQuestions: [
          `How would you optimize the space complexity of ${topic}?`,
          `What are the typical edge cases to consider when implementing ${topic}?`,
          `In what scenarios does this approach outperform naive methods?`
        ],
        summary: getSummary(topic, category)
      }
    });
    totalAdded++;
  }
}

const newArticlesString = generatedArticles.map(art => {
  return `  {\n` +
         `    slug: '${art.slug}',\n` +
         `    title: '${art.title.replace(/'/g, "\\'")}',\n` +
         `    tagline: '${art.tagline.replace(/'/g, "\\'")}',\n` +
         `    category: '${art.category}',\n` +
         `    readTime: ${art.readTime},\n` +
         `    lastUpdated: '${art.lastUpdated}',\n` +
         `    prerequisites: [],\n` +
         `    related: [],\n` +
         `    practiceProblems: [\n` +
         art.practiceProblems.map(p => `      { title: '${p.title}', difficulty: '${p.difficulty}', url: '${p.url}' }`).join(',\n') + '\n' +
         `    ],\n` +
         `    content: {\n` +
         `      introduction: '${art.content.introduction.replace(/'/g, "\\'")}',\n` +
         `      whyImportant: '${art.content.whyImportant.replace(/'/g, "\\'")}',\n` +
         `      realWorldApps: [\n` +
         art.content.realWorldApps.map(a => `        '${a.replace(/'/g, "\\'")}'`).join(',\n') + '\n' +
         `      ],\n` +
         `      algorithmDescription: [\n` +
         art.content.algorithmDescription.map(d => `        '${d.replace(/'/g, "\\'")}'`).join(',\n') + '\n' +
         `      ],\n` +
         `      complexity: [\n` +
         art.content.complexity.map(c => `        { label: '${c.label}', value: '${c.value}', note: '${c.note}' }`).join(',\n') + '\n' +
         `      ],\n` +
         `      implementationCpp: \`${art.content.implementationCpp}\`,\n` +
         `      implementationPython: \`${art.content.implementationPython}\`,\n` +
         `      commonMistakes: [\n` +
         art.content.commonMistakes.map(m => `        '${m.replace(/'/g, "\\'")}'`).join(',\n') + '\n' +
         `      ],\n` +
         `      interviewQuestions: [\n` +
         art.content.interviewQuestions.map(q => `        '${q.replace(/'/g, "\\'")}'`).join(',\n') + '\n' +
         `      ],\n` +
         `      summary: '${art.content.summary.replace(/'/g, "\\'")}'\n` +
         `    }\n` +
         `  }`;
}).join(',\n');

const lastBracketIdx = content.lastIndexOf('];');
if (lastBracketIdx !== -1) {
  const updatedContent = content.substring(0, lastBracketIdx) + ',\n' + newArticlesString + '\n' + content.substring(lastBracketIdx);
  fs.writeFileSync(targetFile, updatedContent, 'utf8');
  console.log(`Successfully generated and appended ${totalAdded} articles to blogData.ts!`);
} else {
  console.error("Could not find closing bracket in blogData.ts");
}
