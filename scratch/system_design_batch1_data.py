# -*- coding: utf-8 -*-
# Data file containing System Design Batch 1 articles with EXTREMELY DETAILED textbook content.

SYSTEM_DESIGN_BATCH1_ARTICLES = [
    {
        "slug": "what-is-system-design",
        "title": "What is System Design?",
        "tagline": "Deconstruct complex end-to-end architectures, establish scale limits, and balance tradeoffs.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["how-to-approach-system-design", "performance-vs-scalability"],
        "practiceProblems": [],
        "markdown": """# What is System Design?

**System Design** is the engineering process of defining the architecture, components, modules, interfaces, and data layouts for a software system to satisfy specified operational requirements. At scale, system design transitions from simple code construction to distributed systems engineering, where performance is limited by network latency, physical disk speeds, and memory allocation overheads.

---

## 1. Modular System Decomposition

Modern scalable applications discard monolithic pipelines in favor of decoupled, modular tiers. This limits fault zones (isolation) and allows individual components to scale independently:

### Modular Architecture
<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">System Decomposition Pipeline</text>

  {/* Clients */}
  <g transform="translate(30, 85)">
    <rect width="80" height="110" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="40" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Tier</text>
    <text x="40" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Browser / Mobile</text>
    <text x="40" y="80" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Sends HTTP/WS</text>
  </g>

  {/* Load Balancer */}
  <g transform="translate(150, 75)">
    <rect width="100" height="130" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="50" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Load Balancer</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">Nginx / AWS ALB</text>
    <text x="10" y="75" fill="#94a3b8" font-size="6" font-family="monospace">Terminates SSL</text>
    <text x="10" y="95" fill="#a7f3d0" font-size="6" font-family="monospace">Round-Robin API</text>
  </g>

  {/* Web Services */}
  <g transform="translate(290, 85)">
    <rect width="100" height="110" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="50" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">App Servers</text>
    <text x="50" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Stateless APIs</text>
    <text x="50" y="75" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Processes logic</text>
  </g>

  {/* Database */}
  <g transform="translate(430, 85)">
    <rect width="140" height="110" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Storage Engine</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">PostgreSQL / Shards</text>
    <text x="70" y="80" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Cache: Redis cluster</text>
  </g>

  {/* Connections */}
  <path d="M 110,140 L 150,140" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#sd-dec-arrow)"/>
  <path d="M 250,140 L 290,140" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#sd-dec-arrow)"/>
  <path d="M 390,140 L 430,140" stroke="#a855f7" stroke-width="1.5" marker-end="url(#sd-dec-arrow)"/>

  <defs>
    <marker id="sd-dec-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 2. Real-World Scaling Constraints

Designing an architecture requires evaluating **latency numbers every programmer should know** (originally compiled by Jeff Dean). These metrics dictate which caching, networking, and database layers are required:

| Operation | Latency (ns) | Latency (Humanized) | Metric Class |
| :--- | :--- | :--- | :--- |
| **L1 Cache reference** | 0.5 ns | - | Hardware registers |
| **Branch mispredict** | 5 ns | - | CPU core pipeline |
| **L2 Cache reference** | 7 ns | - | CPU core cache |
| **Main Memory reference** | 100 ns | - | RAM access |
| **Compress 1KB with ZSTD** | 3,000 ns | 3 μs | CPU computational limit |
| **Read 1MB sequentially from SSD** | 1,000,000 ns | 1 ms | Non-volatile storage read |
| **Round trip within same Datacenter** | 500,000 ns | 0.5 ms | High-speed fiber network |
| **Send packet CA to Netherlands** | 150,000,000 ns | 150 ms | Cross-continental WAN speed |

---

## 3. High-Level System Architecture Design Phases

An industry-standard system design project is built in five sequential phases:

```
[Phase 1: Requirements Gathering]
               │
               ▼
[Phase 2: Capacity Estimation]
               │
               ▼
[Phase 3: System API Contracts]
               │
               ▼
[Phase 4: Database Schema Design]
               │
               ▼
[Phase 5: Bottleneck Analysis & Scale]
```

### Phase 1: Requirements Scoping
Identify functional goals (e.g., "users can upload photos") and non-functional bounds (e.g., "99.9% availability, average latency < 200ms, write capacity of 5,000 QPS").

### Phase 2: Capacity Estimation (Back-of-the-envelope)
Evaluate computing needs. If your app expects 100 million Daily Active Users (DAU), and each user uploads 1 photo of 2MB per day:
* **Storage requirements:**
  $$\\text{Total Storage} = 100,000,000 \\times 2\\text{MB} = 200\\text{TB per day}$$
* **Network bandwidth capacity:**
  $$\\text{Total Bandwidth} = \\frac{200\\text{TB}}{86,400\\text{s}} \\approx 2.31\\text{GB/s} = 18.5\\text{Gbps bandwidth stream}$$

### Phase 3: System API Contracts
Define how clients interact with servers using clean contracts (typically REST, gRPC, or GraphQL endpoints):
```http
POST /api/v1/photos
Content-Type: application/json
Authorization: Bearer <token>

{
  "image_url": "https://s3.amazonaws.com/uploads/p123.jpg",
  "caption": "Summertime landscape",
  "coordinates": {"lat": 37.77, "lng": -122.41}
}
```

### Phase 4: Database Schema Design
Map read/write shapes to physical database architectures. High-frequency relational systems require normalization to prevent anomalies, while high-volume write engines use denormalized NoSQL wide-column structures.

### Phase 5: Scale & Bottleneck Analysis
Identify single points of failure (SPOFs), configure load balancing, set up caching layers (Redis/CDNs), and implement circuit breakers to prevent cascading outages under load spikes.

---

## 4. Conceptual Check Questions

1. **Why does cross-datacenter replication increase transaction latency in strongly consistent databases?**
   *Answer:* A round-trip packet between datacenters (e.g., CA to the Netherlands) takes roughly 150ms due to the speed of light in fiber. If a database requires synchronous consensus (e.g. Paxos/Raft) across these regions before committing a transaction, the write latency will be at least 150ms.

2. **How does calculating read-to-write ratios early affect database selection?**
   *Answer:* Read-heavy systems (e.g. 100:1 ratio) can scale reads using memory caches (Redis) and read replicas. Write-heavy systems (e.g., IoT loggers with 1:1 ratios) require LSM-tree databases (Cassandra) to capture incoming write logs quickly, bypassing slow B-tree writes.
""",
        "content": {
            "introduction": "System Design defines the architecture and data structures of distributed applications, scaling resources to handle massive query volumes.",
            "whyImportant": "Building resilient global services and avoiding outages under heavy traffic requires system design principles.",
            "realWorldApps": ["Sizing network capacity and storage buckets for video platforms.", "Decomposing legacy software into scalable microservices."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "how-to-approach-system-design",
        "title": "How to Approach System Design?",
        "tagline": "Formulate requirements, design high-level layouts, and resolve scale bottlenecks.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["what-is-system-design"],
        "related": ["performance-vs-scalability", "latency-vs-throughput"],
        "practiceProblems": [],
        "markdown": """# How to Approach System Design?

Approaching a complex system design problem (such as designing YouTube, Twitter, or Uber) requires a structured framework. Jumping directly to drawing servers or databases without gathering requirements can lead to an incorrect architecture. This chapter details a comprehensive 4-step framework to approach system design interviews or production architecture proposals.

---

## 1. The Four-Step Architectural Blueprint

A standard system design process follows four steps:

```
[Step 1: Scopes & Requirements]
               │
               ▼
[Step 2: High-Level System Architecture]
               │
               ▼
[Step 3: Component Deep-Dive Design]
               │
               ▼
[Step 4: Scale, Bottlenecks & Optimization]
```

### Step 1: Scopes & Requirements (Functional & Non-Functional)
Never make assumptions. Ask questions to scope the problem:
* **Functional Requirements:** What features must we build? (e.g., "Users can upload videos, view videos, and search for videos").
* **Non-Functional Requirements:** What are the system limits? (e.g., "99.99% availability, cold video start under 500ms, eventual consistency is acceptable for video view counts").
* **Scale Constraints:** What is the Daily Active User (DAU) count? What is the read-to-write ratio?

### Step 2: High-Level System Architecture
Draw a diagram containing the core components:
* **Edge Layers:** DNS servers, CDNs, API Gateways, and Load Balancers.
* **Service Tier:** Stateless application servers handling API requests.
* **Storage Tier:** Primary databases, file caches, and metadata caches.

### Step 3: Component Deep-Dive Design
Analyze the core bottlenecks of your design:
* **Database selection:** SQL vs. NoSQL, partitioning schemes, indexing.
* **Video delivery:** Object storage (AWS S3) vs. CDN networks for video segments.
* **Data structures:** How are notifications queued or timelines generated?

### Step 4: Scale, Bottlenecks & Optimization
Resolve system limitations:
* **Single Points of Failure (SPOFs):** Add replica servers and active-passive failover rules.
* **Database bottlenecks:** Introduce read replicas, Redis caches, or database sharding.
* **Network issues:** Deploy CDNs to cache static resources close to users.

---

## 2. Requirements Scoping Cycle

Before drawing components, you must establish the system boundaries:

### Scoping Process
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">System Design Blueprint Cycle</text>

  {/* Functional Requirements */}
  <g transform="translate(40, 70)">
    <rect width="150" height="90" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="75" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Functional Scopes</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Define user actions</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">e.g. Upload files, follow users</text>
  </g>

  {/* Non-Functional Requirements */}
  <g transform="translate(225, 70)">
    <rect width="150" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="75" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Non-Functional Scopes</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Evaluate CAP requirements</text>
    <text x="15" y="70" fill="#fff" font-size="6" font-family="monospace">Establish latency targets</text>
  </g>

  {/* Estimates */}
  <g transform="translate(410, 70)">
    <rect width="150" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">3. Capacity Estimates</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Calculate QPS demands</text>
    <text x="15" y="70" fill="#a7f3d0" font-size="6" font-family="monospace">Calculate disk storage growth</text>
  </g>

  {/* Connections */}
  <path d="M 190,115 L 225,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#sd-ap-arrow)"/>
  <path d="M 375,115 L 410,115" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#sd-ap-arrow)"/>

  <defs>
    <marker id="sd-ap-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Phase | Core Objective | Primary Deliverable | Common Mistakes |
| :--- | :--- | :--- | :--- |
| **Requirements** | Establishes scope | List of constraints | Making assumptions about scale |
| **High-Level Layout** | Identifies primary components | Global block diagram | Getting bogged down in minor database details |
| **Component Design** | Optimizes key bottlenecks | API signatures, database schemas | Over-engineering parts that aren't bottlenecks |
| **Bottleneck Analysis** | Ensures fault tolerance | HA configuration configurations | Failing to plan for network partitions |

---

## 4. Conceptual Check Questions

1. **Why is it important to design the API contract (Phase 3) before writing database schemas (Phase 4)?**
   *Answer:* API design defines how clients interact with the system. Establishing endpoints and payloads first ensures that the database schema is optimized to support the read and write patterns required by the API.

2. **How does read-to-write ratio calculations guide database partitioning choices?**
   *Answer:* A high-frequency write system (e.g. IoT telemetry) requires partition keys that distribute writes evenly across shards to avoid "hotspots". A read-heavy system (e.g. user profiles) needs partitioning that groups related data together, allowing queries to be answered from a single shard.
""",
        "content": {
            "introduction": "Approaching system design systematically helps you gather requirements, estimate capacity, design APIs, and resolve bottlenecks before writing code.",
            "whyImportant": "Designing large-scale systems without architectural gaps requires using a structured approach.",
            "realWorldApps": ["Structuring architecture proposals for production systems.", "Evaluating system trade-offs during architectural reviews."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "performance-vs-scalability",
        "title": "Performance vs Scalability",
        "tagline": "Configure scaling boundaries, compare horizontal/vertical scaling, and manage resources.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["what-is-system-design"],
        "related": ["latency-vs-throughput", "availability-vs-consistency"],
        "practiceProblems": [],
        "markdown": """# Performance vs Scalability

A common point of confusion in system design is the difference between **Performance** and **Scalability**. While related, they focus on different aspects of a system. A system can be high-performing but not scalable, or highly scalable but run slowly under low load. This chapter covers scaling out vs scaling up, resource limits, and performance metrics.

---

## 1. Core Definitions

* **Performance:** Measures how fast a system performs a single unit of work (e.g., handling one request) under load (e.g., response time is 50ms).
* **Scalability:** Measures the system's ability to handle *increased* load by adding hardware resources (e.g. doubling throughput by doubling the server count).

---

## 2. Universal Scalability Law (USL)

System scaling limits are described by the **Universal Scalability Law**, which models how concurrency, serialization overhead, and crosstalk overhead affect throughput:

$$X(N) = \\frac{\\gamma N}{1 + \\alpha(N - 1) + \\beta N(N - 1)}$$

Where:
* $X(N)$ is the system throughput with $N$ nodes.
* $\\gamma$ is the throughput of a single node.
* $\\alpha$ is the **serialization penalty** (sequential code parts that cannot be parallelized, modeled by Amdahl's law).
* $\\beta$ is the **crosstalk penalty** (nodes communicating with each other to keep data in sync).

If $\\beta > 0$, adding more nodes eventually *reduces* total throughput due to network crosstalk overhead:

### Scalability Limits
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Throughput vs. Node Count (USL)</text>

  {/* Axis Lines */}
  <line x1="60" y1="200" x2="540" y2="200" stroke="#71717a" stroke-width="1.5"/>
  <line x1="60" y1="50" x2="60" y2="200" stroke="#71717a" stroke-width="1.5"/>
  <text x="300" y="220" fill="#71717a" font-size="8" font-family="monospace" text-anchor="middle">Number of Nodes (N)</text>
  <text x="35" y="125" fill="#71717a" font-size="8" font-family="monospace" text-anchor="middle" transform="rotate(-90 35 125)">Throughput</text>

  {/* Linear Scale (Ideal) */}
  <path d="M 60,200 L 400,60" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="360" y="55" fill="#10b981" font-size="7" font-family="monospace">Ideal Linear Scale</text>

  {/* Real Scale Curve */}
  <path d="M 60,200 Q 250,100 350,110 T 520,180" stroke="#ef4444" stroke-width="2" fill="none"/>
  <text x="380" y="100" fill="#ef4444" font-size="7" font-family="monospace">Real Scale (Crosstalk Decline)</text>
</svg>

---

## 3. Comparison Matrix

| Characteristic | Vertical Scaling (Scale Up) | Horizontal Scaling (Scale Out) |
| :--- | :--- | :--- |
| **Max Limit** | Hard hardware limits (CPU/RAM slot capacity) | Practically infinite (limited only by network/cost) |
| **Single Point of Failure** | High (if the server crashes, the app goes down) | Low (load balancers route around crashed servers) |
| **Architecture Change** | None | High (requires load balancers and stateless services) |
| **Relative Cost** | Expensive (large server costs scale non-linearly)| Affordable (standard instance costs scale linearly) |
| **Data Consistency** | Simple (single disk/memory space) | Complex (requires syncing data across nodes) |

---

## 4. Scaling Topologies

### Vertical Scaling (Scale Up)
Adding more CPU, RAM, or storage to a single server. This is simple but has physical limits and introduces a single point of failure (SPOF).

### Horizontal Scaling (Scale Out)
Adding more standard servers to the cluster. This requires a load balancer but allows you to scale indefinitely.

---

## 5. Conceptual Check Questions

1. **Why does horizontal scaling require stateless application servers?**
   *Answer:* If application servers store user session data locally in memory, subsequent requests routed to a different server will fail to find the session. Stateless servers store sessions in a shared database or cache (like Redis), allowing any server to handle any request.

2. **According to the Universal Scalability Law, what causes throughput to decrease as you add nodes?**
   *Answer:* Crosstalk penalty (represented by $\\beta$). As the number of nodes grows, the network communication required to coordinate and sync data between them grows quadratically, eventually consuming more resources than the nodes add to processing capacity.
""",
        "content": {
            "introduction": "Performance measures task speed under load, while scalability measures a system's ability to handle growing workloads by adding hardware resources.",
            "whyImportant": "Designing systems that scale horizontally without performance degradation requires understanding scaling models.",
            "realWorldApps": ["Scaling web application tiers horizontally using load balancers.", "Sizing database instances to avoid resource saturation bottlenecks."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "latency-vs-throughput",
        "title": "Latency vs Throughput",
        "tagline": "Configure latency metrics, analyze throughput limits, and manage request queues.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["what-is-system-design"],
        "related": ["performance-vs-scalability", "availability-vs-consistency"],
        "practiceProblems": [],
        "markdown": """# Latency vs Throughput

In system design, measuring performance relies on two key metrics: **Latency** and **Throughput**. While you want high throughput and low latency, optimizing one can sometimes degrade the other. This chapter covers latency metrics, throughput limits, and request queuing.

---

## 1. Core Definitions

* **Latency:** The time taken to complete a single operation (e.g. a database read takes **20ms**).
* **Throughput:** The volume of operations completed within a set period (e.g. the system processes **5,000 requests per second**).

---

## 2. Queuing Theory & Little's Law

Queuing delays occur when a system's throughput reaches its capacity limit. This relationship is modeled by **Little's Law**:

$$L = \\lambda \\times W$$

Where:
* $L$ is the average number of requests waiting inside the system queue.
* $\\lambda$ is the average arrival rate of incoming requests (throughput).
* $W$ is the average time a request spends in the system (latency).

If arrival rate $\\lambda$ exceeds the processing rate, the queue length $L$ grows, which increases the average processing time $W$ and causes latency spikes:

### Latency vs Throughput
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Latency vs. Throughput Pipeline</text>

  {/* Latency: Travel Time */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Latency (Travel Time)</text>
    
    <path d="M 20,75 L 160,75" stroke="#fff" stroke-dasharray="4,4" stroke-width="2"/>
    <circle cx="90" cy="75" r="8" fill="#3b82f6"/>
    <text x="90" y="115" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Single request speed (ms)</text>
  </g>

  {/* Throughput: Pipeline Volume */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Throughput (Volume)</text>
    
    {/* Pipe with multiple packets */}
    <rect x="25" y="65" width="130" height="20" fill="#111" stroke="#fff" stroke-width="1"/>
    <circle cx="45" cy="75" r="5" fill="#10b981"/>
    <circle cx="75" cy="75" r="5" fill="#10b981"/>
    <circle cx="105" cy="75" r="5" fill="#10b981"/>
    <circle cx="135" cy="75" r="5" fill="#10b981"/>
    <text x="90" y="115" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Requests per second (QPS)</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| System Profile | Latency | Throughput | Real-World Example |
| :--- | :--- | :--- | :--- |
| **High Latency, High Throughput**| Slow (e.g. 5 seconds) | High (e.g. 100,000 files/sec) | Batch video encoding pipelines, data warehouse ETL loops |
| **Low Latency, Low Throughput** | Fast (e.g. 1ms) | Low (e.g. 10 requests/sec) | Single-threaded in-memory caches, local file readers |
| **Low Latency, High Throughput**| Fast (e.g. 15ms) | High (e.g. 1,000,000 QPS) | Distributed in-memory databases (ideal configuration) |

---

## 4. Latency Percentiles (p50, p95, p99)

When measuring latency, looking at the average (mean) response time is often misleading because it hides outliers. Instead, developers monitor **Percentiles**:
* **p50 (Median):** 50% of requests are faster than this value. Shows the typical user experience.
* **p95:** 95% of requests are faster than this value.
* **p99:** 99% of requests are faster than this value. Shows the worst-case user experience, often caused by garbage collection pauses or database locks.

---

## 5. Conceptual Check Questions

1. **Why does high throughput sometimes cause latency spikes?**
   *Answer:* When throughput approaches the system's capacity, hardware resources saturate. Incoming requests are forced to wait in queues before being processed, which increases their overall response times (latency).

2. **How does batching database writes affect latency and throughput?**
   *Answer:* Batching improves throughput by reducing disk write operations, but it increases latency because individual updates must wait in memory until the batch is full before being written.
""",
        "content": {
            "introduction": "Latency measures the delay of a single operation, while throughput measures the volume of operations processed over time.",
            "whyImportant": "Balancing user experience (latency) and system capacity (throughput) requires managing bottlenecks.",
            "realWorldApps": ["Optimizing HTTP response times for mobile users.", "Designing database batching rules to maximize transaction throughput."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "availability-vs-consistency",
        "title": "Availability vs Consistency",
        "tagline": "Configure distributed systems, evaluate replication lags, and review PACELC trade-offs.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["what-is-system-design"],
        "related": ["cap-theorem-consistency", "weak-consistency"],
        "practiceProblems": [],
        "markdown": """# Availability vs Consistency

When designing distributed systems, you store data across multiple servers (replicas) to ensure reliability. However, keeping these replicas in sync requires trade-offs. You must balance **Availability** (keeping the system online) and **Consistency** (ensuring all replicas have the same data). This chapter covers replication delays, consistency limits, and the PACELC theorem.

---

## 1. The Distributed Dilemma

* **Strict Consistency:** Every read request returns the most recent write, regardless of which replica handles the request.
* **High Availability:** Every non-failing node returns a successful response, even if some replicas are out of sync or unreachable.
* **The Conflict:** If a network partition occurs (replicas cannot communicate), you must choose: either reject writes to ensure consistency, or allow writes to ensure availability (leading to out-of-sync replicas).

---

## 2. PACELC Theorem Extension

The **PACELC theorem** extends the CAP theorem by describing trade-offs during normal operation (when there are no network partitions):

```
                       ┌── If Partition (P) ──> Choose Consistency (C) or Availability (A)
PACELC Trade-off Tree ─┤
                       └── Else (E) ──────────> Choose Latency (L) or Consistency (C)
```

If there is a **Partition (P)**, trade off **Availability (A)** vs **Consistency (C)**. **Else (E)**, trade off **Latency (L)** vs **Consistency (C)** (syncing replicas adds delay).

---

## 3. Comparison Matrix

| System Profile | Priority | Partition Behavior | Normal Operation Behavior | Typical Databases |
| :--- | :--- | :--- | :--- | :--- |
| **PC/EC** | Consistency | Rejects writes (Consistency) | Waits for sync (Consistency over Latency) | PostgreSQL, Spanner, Etcd |
| **PA/EL** | Availability/Latency | Accepts writes (Availability) | Syncs in background (Latency over Consistency)| Cassandra, DynamoDB |

---

## 4. Real-world Consistency Anomalies

Under weak consistency models, readers can experience several anomalies:

* **Stale Reads:** Reading a value from a slow replica that hasn't received the latest update yet.
* **Read-Your-Writes Inconsistency:** A user updates their profile and refreshes the page, but the read request is routed to a slow replica, showing their old profile details.
* **Monotonic Read Violations:** A user reads a value repeatedly. The first read returns the new value, but the second read (routed to a slow replica) returns the old value, making time appear to go backward.

---

## 5. Conceptual Check Questions

1. **Why does choosing consistency over latency slow down database writes under normal conditions?**
   *Answer:* To ensure consistency, the database must write the update to a majority of replicas and wait for confirmation before responding to the client, which adds network round-trip delays (latency).

2. **What occurs in a system configured for high availability (PA/EL) during a network partition?**
   *Answer:* Replicas will accept reads and writes independently. While the system remains online, clients reading from different replicas may receive out-of-date or conflicting data until the partition is resolved.
""",
        "content": {
            "introduction": "Distributed systems must choose between consistency and availability during network partitions, and between consistency and latency during normal operations.",
            "whyImportant": "Choosing the right database and replication model for your application requires understanding consistency trade-offs.",
            "realWorldApps": ["Configuring payment processors to reject transactions during connection drops.", "Using eventual consistency for social media feeds to minimize load times."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "cap-theorem-consistency",
        "title": "CAP Theorem",
        "tagline": "Configure CAP boundaries, evaluate network partitions, and study consistency models.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["availability-vs-consistency"],
        "related": ["weak-consistency", "eventual-consistency", "strong-consistency"],
        "practiceProblems": [],
        "markdown": """# CAP Theorem

The **CAP Theorem** (conjectured by Eric Brewer and proved by Seth Gilbert and Nancy Lynch) is a foundational principle in distributed systems. It states that a distributed data store can simultaneously provide at most two of three guarantees: **Consistency**, **Availability**, and **Partition Tolerance**. This chapter covers CAP properties and network partition proofs.

---

## 1. Core Guarantees

* **Consistency (C):** Every read returns the most recent write or an error.
* **Availability (A):** Every non-failing node returns a successful response (without guaranteeing it contains the most recent write).
* **Partition Tolerance (P):** The system continues to operate despite arbitrary message loss or delays between nodes.

---

## 2. Network Partition Proof

In a distributed system, network partitions (P) are inevitable because hardware and network links can fail. Therefore, you cannot choose "CA". You must choose between **CP** and **AP**:

### Partition Split
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">CAP Network Partition Split</text>

  {/* Node A */}
  <g transform="translate(60, 65)">
    <rect width="150" height="120" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="75" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Node A</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Write: Value = "X"</text>
  </g>

  {/* Network Split */}
  <g transform="translate(240, 65)">
    <line x1="60" y1="10" x2="60" y2="110" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4"/>
    <text x="60" y="60" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Network Cut</text>
  </g>

  {/* Node B */}
  <g transform="translate(390, 65)">
    <rect width="150" height="120" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="75" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Node B</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Read: Value = "Old"</text>
  </g>
</svg>

If a client writes `Value = "X"` to **Node A**, but the network link to **Node B** is cut:
* **CP Choice (Consistency):** Node B must reject read requests or return an error, sacrificing Availability.
* **AP Choice (Availability):** Node B responds with its outdated value (`"Old"`), sacrificing Consistency.

---

## 3. Comparison Matrix

| Configuration | System Behavior | Best Used For | Typical Databases |
| :--- | :--- | :--- | :--- |
| **CP (Consistent/Partition Tolerant)** | Blocks writes if nodes cannot sync | Banking balances, user credentials | PostgreSQL (Synchronous), Etcd, Spanner |
| **AP (Available/Partition Tolerant)**  | Accepts writes, allowing replicas to diverge | Social media feeds, analytics counters | Apache Cassandra, CouchDB, DynamoDB |

---

## 4. Practical Database Tradeoffs

When picking a database, you select based on how it behaves during network splits:

### CP Database Example (e.g. Raft-based Consensus)
During a partition, the minority partition stops accepting writes because it cannot reach a quorum (majority). The system remains consistent but becomes unavailable in that partition.

### AP Database Example (e.g. Cassandra Wide-Column)
Nodes accept writes locally even if they are partitioned from the rest of the cluster. Replicas diverge during the partition, and they synchronize and merge values once the link is restored.

---

## 5. Conceptual Check Questions

1. **Why is a "CA" (Consistent + Available) system impossible in practice?**
   *Answer:* Networks will eventually experience failures or partitions. If a partition occurs, a CA system would have to be both consistent (which requires blocking writes because nodes cannot sync) and available (which requires accepting writes), which is a contradiction.

2. **How does the CAP theorem apply to single-instance databases (like local SQLite)?**
   *Answer:* It does not. The CAP theorem applies only to distributed systems where data is replicated across multiple nodes over a network. Single-instance databases do not experience network partitions between nodes.
""",
        "content": {
            "introduction": "The CAP theorem states that distributed databases must choose between Consistency and Availability when network partitions occur.",
            "whyImportant": "Selecting and configuring databases for distributed systems requires understanding the CAP theorem.",
            "realWorldApps": ["Designing consistency rules for global financial systems.", "Deploying high-availability databases for web applications."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "weak-consistency",
        "title": "Weak Consistency",
        "tagline": "Configure memory buffers, manage dirty reads, and review weak consistency trade-offs.",
        "category": "System Design & Distributed Systems",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["cap-theorem-consistency"],
        "related": ["eventual-consistency", "strong-consistency"],
        "practiceProblems": [],
        "markdown": """# Weak Consistency

In distributed systems, the fastest way to respond to client requests is to write data to a single node and respond immediately, without waiting for replicas to sync. This approach is called **Weak Consistency**. While it offers low latency, it does not guarantee that other clients will read the updated data. This chapter covers memory buffers, dirty reads, and performance trade-offs.

---

## 1. Execution Model and Read Lag

Under weak consistency, update propagation is not guaranteed:
* **Dirty Reads:** A reader querying a replica immediately after a write may receive stale data because the update is still in transit.
* **Write Buffers:** Applications cache writes in local memory buffers before flushing them to the database, prioritizing speed over durability.

---

## 2. Weak Consistency Data Pipeline

A client writes `Value = 5` to the primary node. The reader queries Node B before replication completes and receives the outdated value (`0`):

### Replication Delay
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Weak Consistency Lag</text>

  {/* Writer */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Client Write</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Write Value = 5</text>
  </g>

  {/* Node A (Primary) */}
  <g transform="translate(200, 75)">
    <rect width="180" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Node A (Primary)</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Saves value 5 instantly</text>
    <text x="15" y="70" fill="#ef4444" font-size="6" font-family="monospace">Does not wait for sync</text>
  </g>

  {/* Node B (Replica) */}
  <g transform="translate(440, 75)">
    <rect width="120" height="90" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="60" y="30" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Node B (Replica)</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Stale Value = 0</text>
  </g>

  {/* Connections */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#wc-arrow)"/>
  <path d="M 380,120 L 440,120" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2" marker-end="url(#wc-arrow)"/>

  <defs>
    <marker id="wc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Weak Consistency | Strong Consistency |
| :--- | :--- | :--- |
| **Write Latency** | Low (responds immediately) | High (waits for replica consensus) |
| **Read Accuracy** | Low (frequent stale reads) | High (always reads latest write) |
| **Use Cases** | VoIP audio streams, live video frames | Bank ledger updates, password resets |
| **Replication Strategy** | Asynchronous / Best Effort | Synchronous Consensus (Quorum) |

---

## 4. Practical Real-Time Architectures

Weak consistency is commonly used in high-frequency data pipelines:

### VoIP Audio Streams
In voice-over-IP (VoIP), if an audio packet is delayed or dropped, the system does not retransmit it because doing so would introduce lag. Instead, it drops the packet and moves to the next one, sacrificing consistency for low latency.

### Multiplayer Game Sync
In online games, player coordinates are sent continuously. If a coordinate update is lost, the system waits for the next update rather than resending the old one.

---

## 5. Conceptual Check Questions

1. **Why is weak consistency used in video streaming protocols?**
   *Answer:* Video streaming prioritizes low latency over data accuracy. Dropping or delaying a single frame to ensure consistency would cause stuttering, so the system displays the latest available frame even if some data is lost.

2. **Does weak consistency guarantee that replicas will eventually sync?**
   *Answer:* No. Weak consistency guarantees only that writes are accepted quickly. Replicas might stay out of sync indefinitely unless the system implements a separate synchronization protocol.
""",
        "content": {
            "introduction": "Weak consistency prioritizes write speeds and low latency, accepting updates immediately without waiting for replicas to sync.",
            "whyImportant": "Designing high-throughput streaming systems that can tolerate minor data loss requires understanding weak consistency.",
            "realWorldApps": ["Streaming real-time coordinates in multiplayer games.", "Logging high-volume metrics data where minor drops are acceptable."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "eventual-consistency",
        "title": "Eventual Consistency",
        "tagline": "Configure database replicas, resolve conflict vectors, and implement convergent states.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["weak-consistency"],
        "related": ["strong-consistency", "replication-master-slave-master-master"],
        "practiceProblems": [],
        "markdown": """# Eventual Consistency

**Eventual Consistency** is a specific form of weak consistency. It guarantees that if no new writes are made to the database, all replicas will eventually converge to show the same data. This model is popular because it allows systems to be highly available and performant while ensuring data matches over time. This chapter covers replica convergence, conflict resolution, and vector clocks.

---

## 1. Convergence and Gossip Protocols

Replicas run background synchronization loops to resolve data differences:
* **Gossip Protocol:** Nodes periodically exchange data states in the background to detect and update out-of-date records.
* **Conflict Resolution:** If different clients write conflicting data to different replicas, the system resolves the conflict using rules like **Last-Write-Wins (LWW)** or **Vector Clocks**.

---

## 2. Eventual Convergence Loop

Replicas synchronize in the background, resolving differences until all nodes have the same data state:

### Synchronization Process
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Eventual Convergence Loop</text>

  {/* Node A */}
  <g transform="translate(60, 65)">
    <rect width="150" height="120" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="75" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Node A (Value = 5)</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Write accepted locally</text>
  </g>

  {/* Sync Loop */}
  <g transform="translate(230, 95)">
    <path d="M 10,25 Q 70,5 130,25" stroke="#f59e0b" stroke-width="1.5" fill="none" marker-end="url(#ec-arrow)"/>
    <path d="M 130,55 Q 70,75 10,55" stroke="#f59e0b" stroke-width="1.5" fill="none" marker-end="url(#ec-arrow)"/>
    <text x="70" y="45" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Gossip Sync</text>
  </g>

  {/* Node B */}
  <g transform="translate(390, 65)">
    <rect width="150" height="120" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Node B (Value = 5)</text>
    <text x="75" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Updates eventually</text>
  </g>

  <defs>
    <marker id="ec-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Conflict Resolution Strategies

When nodes accept writes independently, they will eventually conflict. Databases use several mathematical models to resolve conflicts:

| Strategy | Mechanism | Real-world Use Case |
| :--- | :--- | :--- |
| **Last-Write-Wins (LWW)** | Keeps the write with the latest timestamp. | Simple cache synchronization, Cassandra updates |
| **Vector Clocks** | Tracks update histories using logical clocks. | Distributed key-value stores (Riak, DynamoDB) |
| **CRDTs (Conflict-free Replicated Data Types)** | Merges conflicting states automatically using math structures. | Collaborative documents (Figma, Google Docs) |

### Vector Clocks Mechanics
A Vector Clock is an array of logical clocks, with one clock for each node in the cluster. When a node updates a value, it increments its own logical clock in the vector:

```kotlin
// Conceptual Vector Clock definition
data class VectorClock(
    val clocks: MutableMap<String, Int> = mutableMapOf()
) {
    fun increment(nodeId: String) {
        clocks[nodeId] = (clocks[nodeId] ?: 0) + 1
    }

    fun isConcurrentWith(other: VectorClock): Boolean {
        // True if neither vector clock dominates the other
        val thisDominates = clocks.any { (k, v) -> v > (other.clocks[k] ?: 0) }
        val otherDominates = other.clocks.any { (k, v) -> v > (clocks[k] ?: 0) }
        return thisDominates && otherDominates
    }
}
```

---

## 4. Conceptual Check Questions

1. **How do vector clocks resolve conflicting writes?**
   *Answer:* Vector clocks track logical version numbers across nodes. If two writes have different version histories, the database uses these histories to detect conflicts and let the application or user resolve them.

2. **Why is eventual consistency popular in e-commerce shopping carts?**
   *Answer:* It ensures the checkout flow remains online and available. If connection drops prevent immediate synchronization, clients can still add items to their carts. The conflicts are resolved and merged once the connection is restored.
""",
        "content": {
            "introduction": "Eventual consistency guarantees that all replicas will eventually show the same data, resolving conflicts using gossip protocols and logical clocks.",
            "whyImportant": "Designing highly available distributed databases requires implementing eventual consistency models.",
            "realWorldApps": ["Syncing DNS records globally across caching servers.", "Merging offline client edits in collaborative document editors."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "strong-consistency",
        "title": "Strong Consistency",
        "tagline": "Configure linearizable consensus, build paxos/raft locks, and review latency costs.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["eventual-consistency"],
        "related": ["cap-theorem-consistency", "replication-master-slave-master-master"],
        "practiceProblems": [],
        "markdown": """# Strong Consistency

Some applications (like financial ledgers or coordination services) cannot tolerate out-of-date or conflicting data. These systems require **Strong Consistency** (often called **Linearizability**). Strong consistency guarantees that once a write completes, every subsequent read request will return that updated value. This chapter covers consensus protocols, locks, and latency trade-offs.

---

## 1. Consensus and Coordination

To ensure strong consistency, database nodes must agree on the order of writes before responding to clients:
* **Two-Phase Commit (2PC):** A coordinator node asks all replicas to prepare to write. Once all replicas confirm they are ready, the coordinator commands them to commit.
* **Consensus Algorithms (Raft/Paxos):** Replicas elect a leader node. All writes flow through the leader, which replicates the updates to a majority (quorum) of nodes before committing the write.

---

## 2. Strong Consistency Write Lock

A client write is held until a majority of replicas confirm and commit the update. This guarantees all subsequent reads return the same value:

### Write Consensus Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">Strong Consistency Consensus</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Write Request</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Write Value = X</text>
  </g>

  {/* Leader Node */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#ef4444" stroke-width="1.5"/>
    <text x="90" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Leader Node (Locked)</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Acquires consensus lock</text>
    <text x="15" y="75" fill="#fca5a5" font-size="6" font-family="monospace">Waits for quorum confirm</text>
  </g>

  {/* Quorum Nodes */}
  <g transform="translate(440, 75)">
    <rect width="120" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Quorum nodes</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Replicates & commits</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#sc-c-arrow)"/>
  <path d="M 380,120 L 440,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#sc-c-arrow)"/>

  <defs>
    <marker id="sc-c-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Eventual Consistency | Strong Consistency |
| :--- | :--- | :--- |
| **Write Speed** | Fast (writes to one node and returns) | Slow (waits for consensus confirmation) |
| **Read Speed** | Fast (reads from any local replica) | Slow (reads must query leader/quorum) |
| **Data Integrity** | Temporary anomalies/conflicting data | Zero anomalies (strict linearizability) |
| **Consensus Mechanics** | Gossip Protocols, Vector Clocks | Paxos, Raft, 2PC (Two-Phase Commit) |
| **Fault Tolerance** | High (any single node can process writes) | Limited (requires a majority quorum to write) |

---

## 4. The Mechanics of Raft Consensus

Consensus algorithms enforce a single, ordered log of updates across nodes. The cluster elects a leader to manage writes:
1. **Client Write:** The client sends an update to the leader node.
2. **Log Replication:** The leader appends the update to its log and replicates it to all follower nodes.
3. **Commit & Respond:** Once a majority of followers acknowledge writing the log entry, the leader commits the change and responds to the client.

---

## 5. Conceptual Check Questions

1. **How does a consensus protocol define a write quorum?**
   *Answer:* A write quorum requires confirmation from a majority of nodes in the cluster. For a cluster with $N$ nodes, the quorum size must be at least $\lfloor N/2 \rfloor + 1$ nodes to ensure consensus.

2. **Why does strong consistency reduce system availability?**
   *Answer:* It requires node coordination. If network partitions prevent nodes from reaching a quorum, the cluster must reject write requests, making the database unavailable.
""",
        "content": {
            "introduction": "Strong consistency guarantees that reads always return the latest write, coordinating updates using consensus protocols like Raft.",
            "whyImportant": "Preventing data anomalies in financial or inventory systems requires implementing strong consistency.",
            "realWorldApps": ["Managing transaction balances in distributed banking databases.", "Coordinating system locks using consensus engines like Etcd."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "availability-vs-consistency",
        "title": "Availability vs Consistency",
        "tagline": "Configure distributed systems, evaluate replication lags, and review PACELC trade-offs.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["what-is-system-design"],
        "related": ["cap-theorem-consistency", "weak-consistency"],
        "practiceProblems": [],
        "markdown": """# Availability vs Consistency

When designing distributed systems, you store data across multiple servers (replicas) to ensure reliability. However, keeping these replicas in sync requires trade-offs. You must balance **Availability** (keeping the system online) and **Consistency** (ensuring all replicas have the same data). This chapter covers replication delays, consistency limits, and the PACELC theorem.

---

## 1. The Distributed Dilemma

* **Strict Consistency:** Every read request returns the most recent write, regardless of which replica handles the request.
* **High Availability:** Every non-failing node returns a successful response, even if some replicas are out of sync or unreachable.
* **The Conflict:** If a network partition occurs (replicas cannot communicate), you must choose: either reject writes to ensure consistency, or allow writes to ensure availability (leading to out-of-sync replicas).

---

## 2. PACELC Theorem Extension

The **PACELC theorem** extends the CAP theorem by describing trade-offs during normal operation (when there are no network partitions):

```
                       ┌── If Partition (P) ──> Choose Consistency (C) or Availability (A)
PACELC Trade-off Tree ─┤
                       └── Else (E) ──────────> Choose Latency (L) or Consistency (C)
```

If there is a **Partition (P)**, trade off **Availability (A)** vs **Consistency (C)**. **Else (E)**, trade off **Latency (L)** vs **Consistency (C)** (syncing replicas adds delay).

---

## 3. Comparison Matrix

| System Profile | Priority | Partition Behavior | Normal Operation Behavior | Typical Databases |
| :--- | :--- | :--- | :--- | :--- |
| **PC/EC** | Consistency | Rejects writes (Consistency) | Waits for sync (Consistency over Latency) | PostgreSQL, Spanner, Etcd |
| **PA/EL** | Availability/Latency | Accepts writes (Availability) | Syncs in background (Latency over Consistency)| Cassandra, DynamoDB |

---

## 4. Real-world Consistency Anomalies

Under weak consistency models, readers can experience several anomalies:

* **Stale Reads:** Reading a value from a slow replica that hasn't received the latest update yet.
* **Read-Your-Writes Inconsistency:** A user updates their profile and refreshes the page, but the read request is routed to a slow replica, showing their old profile details.
* **Monotonic Read Violations:** A user reads a value repeatedly. The first read returns the new value, but the second read (routed to a slow replica) returns the old value, making time appear to go backward.

---

## 5. Conceptual Check Questions

1. **Why does choosing consistency over latency slow down database writes under normal conditions?**
   *Answer:* To ensure consistency, the database must write the update to a majority of replicas and wait for confirmation before responding to the client, which adds network round-trip delays (latency).

2. **What occurs in a system configured for high availability (PA/EL) during a network partition?**
   *Answer:* Replicas will accept reads and writes independently. While the system remains online, clients reading from different replicas may receive out-of-date or conflicting data until the partition is resolved.
""",
        "content": {
            "introduction": "Distributed systems must choose between consistency and availability during network partitions, and between consistency and latency during normal operations.",
            "whyImportant": "Choosing the right database and replication model for your application requires understanding consistency trade-offs.",
            "realWorldApps": ["Configuring payment processors to reject transactions during connection drops.", "Using eventual consistency for social media feeds to minimize load times."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "failover-replication-dns-updates",
        "title": "Failover Systems",
        "tagline": "Configure active-passive failovers, implement heartbeat monitoring, and automate IP takeovers.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["replication-master-slave-master-master", "cap-theorem-consistency"],
        "practiceProblems": [],
        "markdown": """# Failover Systems

To design a high-availability system, you must plan for hardware and server failures. If a primary server crashes, the system must automatically detect the failure and redirect traffic to a backup server. This process is called **Failover**. This chapter covers active-passive failover, heartbeat monitoring, and virtual IP takeovers.

---

## 1. Failover Topologies

Systems implement failover using one of two topologies:
* **Active-Passive (Warm Standby):** The primary (active) server handles all traffic, while the passive server acts as a backup. The passive server continually replicates data from the active server. If the active server fails, the passive server takes over.
* **Active-Active:** Both servers handle traffic simultaneously. A load balancer distributes requests across both nodes. If one node fails, the load balancer stops routing traffic to it.

---

## 2. Active-Passive Heartbeat Failover

The passive server monitors the active server using periodic heartbeats. If heartbeats stop, the backup server initiates a virtual IP takeover:

### Failover Process
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Active-Passive Failover Pipeline</text>

  {/* Active Server (Crashed) */}
  <g transform="translate(60, 65)">
    <rect width="160" height="120" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="80" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Primary Active</text>
    <text x="80" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Server Crashes!</text>
    <text x="80" y="80" fill="#fca5a5" font-size="6" font-family="monospace" text-anchor="middle">Heartbeat stops</text>
  </g>

  {/* Heartbeat Monitoring */}
  <g transform="translate(230, 95)">
    <line x1="10" y1="25" x2="130" y2="25" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2"/>
    <text x="70" y="15" fill="#ef4444" font-size="7" font-family="monospace" text-anchor="middle">No Heartbeat</text>
  </g>

  {/* Passive Server (Takeover) */}
  <g transform="translate(380, 65)">
    <rect width="160" height="120" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="80" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Backup Passive</text>
    <text x="80" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Detects failure</text>
    <text x="80" y="80" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Takes over Virtual IP</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | Active-Passive Topology | Active-Active Topology |
| :--- | :--- | :--- |
| **Resource Utilization** | Low (backup server sits idle) | High (both servers handle traffic) |
| **Failover Delay** | Delayed (requires detection and IP takeover) | None (load balancer immediately routes around dead node) |
| **Data Synchronization**| Simple (one-way replication) | Complex (requires two-way replication/conflict resolution) |
| **Load Balancing Need** | Optional | Mandatory |

---

## 4. Virtual IP Address Takeover Mechanics

Active-passive failover systems often use tools like **Keepalived** to manage a shared **Virtual IP (VIP)** address:
1. **Virtual IP Mapping:** The VIP is mapped to the active server's network interface.
2. **Heartbeat Broadcast:** The backup server listens for VRRP (Virtual Router Redundancy Protocol) heartbeat packets broadcast by the active server.
3. **Gratuitous ARP:** If heartbeats stop, the backup server assumes the active role and broadcasts a Gratuitous ARP request to update the local network switch, mapping the VIP to its own MAC address.

---

## 5. Conceptual Check Questions

1. **What is split-brain scenario in active-passive failovers?**
   *Answer:* It occurs if network connectivity between the servers drops but both remain running. The passive server assumes the active server has crashed and takes over, resulting in two active servers writing conflicting data to storage.

2. **How do virtual IP address takeovers work?**
   *Answer:* In a failover cluster, a single virtual IP is mapped to the active server. If the active server crashes, the backup server sends an ARP message to the network switch, mapping the virtual IP to its own MAC address to redirect traffic.
""",
        "content": {
            "introduction": "Failover systems ensure high availability by automatically detecting server crashes and redirecting traffic to backup nodes.",
            "whyImportant": "Preventing application downtime during server failures requires designing failover topologies.",
            "realWorldApps": ["Configuring database failover clusters with virtual IP takeovers.", "Setting up load balancers to route around failed web nodes."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "replication-master-slave-master-master",
        "title": "Replication Topologies",
        "tagline": "Configure database replication, analyze master-slave writes, and resolve master-master conflicts.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["failover-replication-dns-updates", "eventual-consistency"],
        "practiceProblems": [],
        "markdown": """# Replication Topologies

To protect databases from data loss and scale read capacity, you replicate data across multiple nodes. The two primary database replication topologies are **Master-Slave (Leader-Follower)** and **Master-Master (Multi-Leader)**. This chapter covers read-write roles, replication lag, and conflict resolution.

---

## 1. Master-Slave Topology

In a Master-Slave configuration:
* **The Master (Leader):** Handles all database write operations, updates its local logs, and replicates the changes to the slave nodes.
* **The Slaves (Followers):** Read the master's replication logs and update their local databases. Slaves only accept read queries, helping to scale read capacity.
* **Replication Lag:** Because syncing slaves takes time, reads from a slave node may temporarily return stale data.

---

## 2. Master-Master Topology

In a Master-Master configuration:
* **Multiple Masters:** Multiple nodes can accept both read and write queries. Nodes replicate updates to each other in the background.
* **Conflict Resolution:** If different clients write conflicting data to different master nodes simultaneously, the system must resolve the conflict (e.g. using vector clocks or custom merge rules).

---

## 3. Comparison Matrix

### Replication Topologies
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Database Replication Topologies</text>

  {/* Master-Slave */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Master-Slave</text>
    <rect x="25" y="45" width="130" height="25" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Writes -> Master node only</text>
    <rect x="25" y="80" width="130" height="25" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="95" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Reads -> Scale across Slaves</text>
  </g>

  {/* Master-Master */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Master-Master</text>
    <rect x="25" y="45" width="130" height="25" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Writes -> Any Master node</text>
    <rect x="25" y="80" width="130" height="25" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="95" fill="#ef4444" font-size="7" font-family="monospace" text-anchor="middle">Requires conflict resolution</text>
  </g>
</svg>

---

## 4. Sync vs. Async Replication Performance

Replication lag is directly affected by your replication configuration choice:

### Synchronous Replication
The Master waits for all slave nodes to write the transaction to disk and confirm receipt before returning success. This guarantees zero replication lag but increases write latency significantly.

### Asynchronous Replication
The Master writes to disk locally and responds to the client immediately. A background thread replicates updates to slaves later. This provides low write latency but carries a risk of data loss if the Master crashes before logs are replicated.

---

## 5. Conceptual Check Questions

1. **Why does Master-Slave replication scale read performance but not write performance?**
   *Answer:* All writes must still flow through the single Master node to update the primary log. To scale write performance, you must use sharding (partitioning data across multiple masters).

2. **What is the difference between synchronous and asynchronous replication?**
   *Answer:* In synchronous replication, the master waits for all slaves to confirm they wrote the update before responding to the client. In asynchronous replication, the master writes the update locally and responds immediately, syncing slaves in the background to minimize latency.
""",
        "content": {
            "introduction": "Database replication replicates data across multiple nodes, utilizing Master-Slave and Master-Master topologies to scale capacity and ensure reliability.",
            "whyImportant": "Scaling database throughput and protecting data from server crashes requires using replication topologies.",
            "realWorldApps": ["Configuring read replicas in AWS RDS to handle high read volumes.", "Deploying multi-region multi-master databases to minimize global latencies."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    }
]
