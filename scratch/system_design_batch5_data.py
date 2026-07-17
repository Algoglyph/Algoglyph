# -*- coding: utf-8 -*-
# Data file containing System Design Batch 5 articles with EXTREMELY DETAILED textbook content.

SYSTEM_DESIGN_BATCH5_ARTICLES = [
    {
        "slug": "database-caching",
        "title": "Database Caching",
        "tagline": "Configure database buffer pools, manage shared memory blocks, and compile materialized views.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["application-caching", "web-server-caching"],
        "practiceProblems": [],
        "markdown": """# Database Caching

**Database Caching** optimizes query execution by storing frequently accessed data pages in memory, reducing slow disk I/O operations. This caching occurs either within the database engine's internal memory buffers or externally via specialized cache layers. This chapter covers buffer pools, shared memory blocks, and materialized views.

---

## 1. Buffer Pool Architecture

Most database engines (e.g. MySQL InnoDB, PostgreSQL) allocate a portion of system RAM to a **Buffer Pool** (or shared buffers).
* **Page Caching:** Databases read and write data in fixed-size blocks called **pages** (usually 8KB or 16KB). When a query requests a row, the database loads the entire page containing that row into the buffer pool.
* **Eviction Policies:** When the buffer pool fills up, the database evicts clean pages using **LRU (Least Recently Used)** or **Clock-sweep** algorithms. Modified pages (dirty pages) are flushed to disk before eviction.

---

## 2. Buffer Pool Read Pipeline

The database engine checks the buffer pool memory block first, falling back to disk read on buffer misses:

### Buffer Pool Execution Flow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Database Buffer Pool Read Flow</text>

  {/* Client Query */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">SQL Query</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">SELECT * FROM users</text>
  </g>

  {/* Buffer Pool RAM */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Buffer Pool RAM</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Checks for cached pages</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Hit: returns immediately</text>
  </g>

  {/* Disk Storage */}
  <g transform="translate(420, 75)">
    <rect width="140" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Disk Storage (SSD)</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Miss: loads pages into RAM</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#db-c-arrow)"/>
  <path d="M 380,120 L 420,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#db-c-arrow)"/>

  <defs>
    <marker id="db-c-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Materialized Views

A **Materialized View** pre-computes and stores the results of complex queries (such as aggregate reports or multi-table joins) directly on disk.
* **Standard View:** Run as a macro, executing the underlying query every time the view is referenced.
* **Materialized View:** Stores the actual data on disk. Queries read the pre-computed table directly, avoiding runtime joins and calculations. However, the data can become stale and must be refreshed periodically (either manually, via cron jobs, or through triggers on write operations).

---

## 4. Comparison Matrix

| Property | Buffer Pool Caching | Materialized Views |
| :--- | :--- | :--- |
| **Data Scope** | Low-level raw database pages | High-level SQL query result tables |
| **Storage Location** | System RAM | Disk Storage |
| **Refresh Mechanics** | Automatic page swapping | Manual or scheduled refreshes |
| **Performance Impact** | Reduces overall page read latencies | Optimizes complex reporting queries |

---

## 5. Conceptual Check Questions

1. **Why does database performance degrade significantly when the active dataset exceeds the buffer pool size?**
   *Answer:* When the active dataset (working set) is larger than the buffer pool, the database must continuously swap pages in and out of memory. This leads to frequent disk reads, causing high I/O latency (known as thrashing).

2. **What is a major limitation of using materialized views in write-heavy systems?**
   *Answer:* Keeping the view updated incurs a performance cost. If the database updates the materialized view with every write, write latency increases. If it refreshes the view on a schedule, reads can return stale data.
""",
        "content": {
            "introduction": "Database caching loads frequently accessed database pages into memory buffers, reducing disk reads.",
            "whyImportant": "Avoiding high disk read latency and scaling database lookups requires database buffer pools.",
            "realWorldApps": ["Configuring MySQL InnoDB buffer pool size.", "Creating PostgreSQL materialized views to store aggregate report data."],
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
        "slug": "application-caching",
        "title": "Application Caching",
        "tagline": "Configure application-level memory caches, evaluate distributed caches, and manage serialization costs.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["database-caching", "web-server-caching"],
        "practiceProblems": [],
        "markdown": """# Application Caching

**Application Caching** stores computational results, user sessions, or configuration data within the application layer. This can be implemented either locally in the application process memory (In-Memory) or externally in a shared distributed cache cluster. This chapter covers local memory caching, distributed clusters, and serialization overheads.

---

## 1. Caching Topologies

* **In-Memory Caching (Local):** Data is stored directly in the application's RAM (e.g. a local object or variable).
  * *Pros:* Extremely fast (microsecond latency) since it avoids network hops.
  * *Cons:* Data is duplicated across server instances, consumes application memory, and is lost when the process restarts.
* **Distributed Caching (External):** Data is stored in a dedicated cache cluster (e.g. Redis, Memcached).
  * *Pros:* Shared across all application nodes, persists through process restarts, and scales independently of the application servers.
  * *Cons:* Incurs network round-trip overhead and data serialization/deserialization costs.

---

## 2. In-Memory vs. Distributed Topologies

### Caching Architecture Topologies
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Caching Topologies</text>

  {/* Local RAM Topology */}
  <g transform="translate(40, 60)">
    <rect width="230" height="140" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="115" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Local In-Memory Cache</text>
    <rect x="20" y="45" width="190" height="70" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="115" y="70" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">App Instance RAM</text>
    <text x="115" y="90" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Latency: < 0.1ms (No network)</text>
  </g>

  {/* Distributed Cache Topology */}
  <g transform="translate(330, 60)">
    <rect width="230" height="140" fill="#1c1917" rx="2" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="115" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Distributed Cache Cluster</text>
    <rect x="20" y="45" width="190" height="70" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <text x="115" y="70" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">Shared Redis Cluster</text>
    <text x="115" y="90" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Latency: 1-3ms (TCP Network)</text>
  </g>
</svg>

---

## 3. Serialization and Deserialization Costs

Because distributed caches transfer data over TCP, data structures must be serialized (e.g. to JSON or binary formats) during writes and deserialized during reads.
* **JSON Serialization:** Simple and human-readable, but has high CPU and memory overhead for large payloads.
* **Binary Serialization:** Formats like MessagePack or Protocol Buffers generate smaller payloads and parse faster, reducing CPU usage at scale.

---

## 4. Comparison Matrix

| Property | In-Memory Cache (Local) | Distributed Cache (Shared) |
| :--- | :--- | :--- |
| **Access Speed** | Microseconds | Milliseconds (over TCP) |
| **Network Hop** | None | Yes |
| **Cluster Consistency**| Weak (duplicate keys can drift) | Strong (single source of truth) |
| **Process Crash** | Data is lost | Data persists |

---

## 5. Conceptual Check Questions

1. **Why do applications using local in-memory caches experience consistency drift in scaled deployments?**
   *Answer:* Local caches are isolated to each server instance. If a user updates their profile details on Server A, Server B's local memory cache will continue serving the old cached data until its TTL expires, leading to inconsistent user experiences.

2. **How does serialization overhead impact application server CPU usage?**
   *Answer:* Distributed cache reads and writes require converting data structures to and from transfer formats (like JSON). For high-throughput applications, this continuous serialization processes consume significant CPU cycles.
""",
        "content": {
            "introduction": "Application caching stores data close to application code, balancing fast local memory with shared distributed caches.",
            "whyImportant": "Speeding up computation and sharing session data across server instances requires application caching.",
            "realWorldApps": ["Caching localized static data keys in Node process memories.", "Deploying shared Redis clusters to cache database queries across server pools."],
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
        "slug": "backpressure-queues-sizing",
        "title": "Backpressure & Queue Sizing",
        "tagline": "Configure queue sizes, prevent bufferbloat, and implement backpressure controls.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["task-queues", "message-queues"],
        "practiceProblems": [],
        "markdown": """# Backpressure & Queue Sizing

**Backpressure** is a flow-control mechanism that prevents downstream components from being overwhelmed by traffic. In distributed systems, this is managed by sizing buffer queues correctly and sending signals upstream to slow down request rates. This chapter covers queue sizing trade-offs, bufferbloat, and backpressure signals.

---

## 1. Queue Sizing Trade-offs

A queue (or buffer) smooths out traffic spikes, but sizing it correctly is a balancing act:
* **Small Queues:** Keep latency low, but drop packets or reject requests frequently under sudden traffic spikes.
* **Large Queues:** Handle spikes without dropping requests, but introduce high latency as requests wait in line. This is known as **Bufferbloat**.

---

## 2. Queue Buffer Overflow & Backpressure

When downstream processing rates drop, the queue fills up, triggering a backpressure signal to slow down upstream producers:

### Backpressure Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Queue Backpressure Flow</text>

  {/* Client Producer */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Upstream Producer</text>
    <text x="55" y="60" fill="#ef4444" font-size="6" font-family="monospace" text-anchor="middle">Slowing writes</text>
  </g>

  {/* Queue Buffer */}
  <g transform="translate(190, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Queue Buffer (Saturated)</text>
    <rect x="20" y="45" width="140" height="20" fill="#ef4444" rx="2"/>
    <text x="90" y="58" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Queue Full (100%)</text>
    <text x="90" y="85" fill="#ef4444" font-size="6" font-family="monospace" text-anchor="middle">Backpressure Signal Sent</text>
  </g>

  {/* Consumer */}
  <g transform="translate(420, 75)">
    <rect width="140" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Downstream Worker</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Processing slowly</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 190,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#bp-arrow)"/>
  <path d="M 370,120 L 420,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#bp-arrow)"/>

  {/* Backpressure Path */}
  <path d="M 190,140 L 150,140" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#bp-arrow)"/>

  <defs>
    <marker id="bp-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Backpressure Signaling Mechanics

When downstream services are overwhelmed, they can manage traffic using three primary strategies:
* **TCP Window Size:** The receiver reduces its TCP window advertisement to 0, forcing the sender to pause data transmission.
* **HTTP Status 429:** The API server rejects requests with an `HTTP 429 Too Many Requests` status, prompting clients to back off.
* **Reactive Streams:** Software libraries (e.g. RxJava, Akka Streams) use pull-based signaling, where consumers explicitly request a specific number of items from producers.

---

## 4. Comparison Matrix

| Property | Small Queue Buffers | Large Queue Buffers |
| :--- | :--- | :--- |
| **Max Throughput** | Low (drops requests under spikes) | High (absorbs spikes) |
| **Average Latency** | Low | High (bufferbloat queue delay) |
| **Data Drop Risk** | High | Low |
| **Sizing Use Case** | Real-time interactive APIs | Asynchronous background workers |

---

## 5. Conceptual Check Questions

1. **How does bufferbloat impact user experience in interactive applications?**
   *Answer:* Large queues prevent packet loss, but force packets to wait in memory buffers before processing. This introduces long queueing delays, causing high end-to-end latency that makes interactive apps feel slow and unresponsive.

2. **Why is dropping requests (returning HTTP 429) sometimes preferred over queuing them?**
   *Answer:* It prevents resource saturation. Rejecting excess traffic immediately preserves server memory and CPU, allowing the system to continue serving existing requests reliably rather than slowing down or crashing.
""",
        "content": {
            "introduction": "Backpressure protects downstream services by sizing queue buffers correctly and signaling upstream producers to slow down.",
            "whyImportant": "Preventing service crashes and managing queue delays under heavy traffic requires backpressure.",
            "realWorldApps": ["Configuring TCP sliding windows to manage data flow rates.", "Returning HTTP 429 status codes to rate-limit upstream API clients."],
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
        "slug": "task-queues",
        "title": "Task Queues",
        "tagline": "Configure worker task queues, manage retry limits, and handle delayed tasks execution.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["backpressure-queues-sizing", "message-queues"],
        "practiceProblems": [],
        "markdown": """# Task Queues

A **Task Queue** distributes asynchronous tasks across worker processes. Instead of processing intensive tasks (e.g. generating PDFs, encoding video) during the request-response cycle, the application places tasks in a queue and returns success immediately, decoupling the web tier from the execution tier. This chapter covers worker distribution, retry patterns, and delayed execution.

---

## 1. Asynchronous Task Worker Pipeline

The application places a task payload in the queue, and background workers pull and process tasks asynchronously:

```
[Web App Write] ──> [Task Queue Buffer] ──> (Pull Task) ──> [Worker Processes]
```

1. **Enqueue Task:** The web application writes a task description (e.g., JSON payload) to the queue (typically backed by Redis or RabbitMQ).
2. **Worker Pull:** A pool of background worker processes polls the queue for new tasks.
3. **Execution & Acknowledgment:** A worker processes the task and sends an acknowledgment (ACK) to remove the task from the queue. If execution fails, the task is retried.

---

## 2. Task Queue Architecture

Producers push tasks to a queue, where worker instances pull and process them concurrently:

### Worker Execution Geometry
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Task Queue Architecture</text>

  {/* Web App */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Web Server</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Enqueue: task_1</text>
  </g>

  {/* Queue Buffer */}
  <g transform="translate(190, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">FIFO Task Queue</text>
    <rect x="20" y="55" width="40" height="25" fill="#1e293b" stroke="#fff" stroke-width="0.8"/>
    <text x="40" y="70" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">task_3</text>
    <rect x="70" y="55" width="40" height="25" fill="#1e293b" stroke="#fff" stroke-width="0.8"/>
    <text x="90" y="70" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">task_2</text>
    <rect x="120" y="55" width="40" height="25" fill="#1e293b" stroke="#fff" stroke-width="0.8"/>
    <text x="140" y="70" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">task_1</text>
  </g>

  {/* Workers */}
  <g transform="translate(420, 50)">
    <rect width="140" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="70" y="20" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Worker 1 (Processes task_1)</text>
  </g>

  <g transform="translate(420, 140)">
    <rect width="140" height="50" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.2"/>
    <text x="70" y="20" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Worker 2 (Idle)</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 190,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#tq-arrow)"/>
  <path d="M 370,110 L 420,75" stroke="#10b981" stroke-width="1.5" marker-end="url(#tq-arrow)"/>

  <defs>
    <marker id="tq-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Retry and Delayed Execution Patterns

Task queues must handle failures and schedule future tasks:
* **Dead Letter Queue (DLQ):** If a task fails repeatedly after the maximum number of retries, it is moved to a DLQ for debugging instead of blocking the main queue.
* **Exponential Backoff:** Retrying failed tasks with increasing delays (e.g. 2s, 4s, 8s...) to avoid overwhelming downstream services.
* **Delayed Execution:** Scheduling tasks to run after a specific delay (e.g. sending a reminder email 24 hours after sign-up).

---

## 4. Comparison Matrix

| Property | Web Request Execution | Task Queue Execution |
| :--- | :--- | :--- |
| **Coupling** | Synchronous (client blocks) | Asynchronous (client continues) |
| **Max Timeout** | Low (typically < 30 seconds) | High (hours or days) |
| **Failure Handling**| Hard fail returned to user | Automatic retries, DLQ |
| **Typical Tools** | Nginx, Node Express, Django | Celery, BullMQ, Sidekiq |

---

## 5. Conceptual Check Questions

1. **Why do task queues use acknowledgments (ACKs) instead of deleting tasks immediately upon delivery to a worker?**
   *Answer:* If a worker crashes midway through a task, the task would be lost without ACKs. With ACKs, the queue waits for the worker to confirm successful completion. If the worker crashes, the queue detects the closed connection and redelivers the task.

2. **How does exponential backoff protect downstream services during system outages?**
   *Answer:* If a downstream service goes offline, retrying failed tasks immediately can overload it when it comes back online. Exponential backoff increases the delay between retries, giving the downstream service time to recover.
""",
        "content": {
            "introduction": "Task queues distribute computing tasks across background workers asynchronously, decoupling requests from execution.",
            "whyImportant": "Optimizing web response times and handling long-running background tasks requires task queues.",
            "realWorldApps": ["Using BullMQ to queue and process video transcodings.", "Configuring Celery workers to generate PDF reports in background pools."],
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
        "slug": "message-queues",
        "title": "Message Queues",
        "tagline": "Configure message broker routing, decouple pub-sub layers, and manage routing exchanges.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["backpressure-queues-sizing", "task-queues"],
        "practiceProblems": [],
        "markdown": """# Message Queues

A **Message Queue** enables asynchronous communication between services in a microservices architecture. It decouples the sending service (publisher) from the receiving service (consumer), allowing them to scale independently. This chapter covers pub-sub patterns, broker routing, and routing exchanges.

---

## 1. Publish-Subscribe (Pub-Sub) Pattern

Unlike task queues (where each task is processed by a single worker), message queues often support the **Pub-Sub** pattern:
* **Publishers:** Send messages to a central topic or exchange without knowing who will consume them.
* **Subscribers:** Listen to specific topics or exchanges. When a message is published, the broker duplicates and delivers it to all services subscribed to that topic (e.g. Billing, Notification, and Analytics services all receive the "Order Placed" message).

---

## 2. Message Broker Routing Exchange

The publisher sends a message to the exchange, which routes it to queues based on routing keys:

### Message Routing Flow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Message Broker Routing Exchange</text>

  {/* Publisher */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Publisher Service</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Publishes event</text>
  </g>

  {/* Exchange */}
  <g transform="translate(190, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Routing Exchange</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Reads routing key</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Duplicates to queues</text>
  </g>

  {/* Queues */}
  <g transform="translate(420, 50)">
    <rect width="140" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="70" y="20" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Queue A (Billing)</text>
  </g>

  <g transform="translate(420, 140)">
    <rect width="140" height="50" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.2"/>
    <text x="70" y="20" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Queue B (Notifications)</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 190,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#mq-arrow)"/>
  <path d="M 370,110 L 420,75 M 370,130 L 420,165" stroke="#10b981" stroke-width="1.5" marker-end="url(#mq-arrow)"/>

  <defs>
    <marker id="mq-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Task Queues (e.g. Celery) | Message Queues (e.g. RabbitMQ) |
| :--- | :--- | :--- |
| **Model** | Direct Worker Distribution | Publish-Subscribe / Fanout |
| **Message Routing** | Simple FIFO queues | Complex exchanges (Direct, Topic, Fanout) |
| **Consumer Pool** | One consumer per task | Multiple services get copies |
| **Typical Usage** | CPU-intensive background tasks | Inter-service event communication |

---

## 4. Conceptual Check Questions

1. **How does pub-sub messaging simplify adding new features to microservices?**
   *Answer:* It decouples the publisher. When a user buys an item, the Order service publishes an "order-placed" event. If you want to add an email receipt service later, you simply subscribe it to the event. The Order service doesn't need to change its code or make direct API calls to the new service.

2. **What occurs when a consumer is offline in a message queue system?**
   *Answer:* The message broker stores messages in the consumer's queue. When the consumer service comes back online, it pulls and processes the queued messages, preventing data loss.
""",
        "content": {
            "introduction": "Message queues enable asynchronous communication between microservices, decoupling publishers from consumers.",
            "whyImportant": "Decoupling microservices and enabling event-driven scaling requires using message queues.",
            "realWorldApps": ["Configuring RabbitMQ exchanges to route user events.", "Deploying Apache Kafka to stream high-volume telemetry events across services."],
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
        "slug": "http",
        "title": "HTTP Protocol",
        "tagline": "Configure HTTP protocols, manage keep-alive connections, and evaluate ssl-tls handshakes.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["tcp", "udp", "rest"],
        "practiceProblems": [],
        "markdown": """# HTTP Protocol

**HTTP (Hypertext Transfer Protocol)** is the foundation of data exchange on the web. It has evolved through several versions to improve network performance: HTTP/1.1, HTTP/2, and HTTP/3. This chapter covers protocol levels, keep-alive connections, and SSL/TLS handshakes.

---

## 1. Evolution: HTTP/1.1 to HTTP/3

* **HTTP/1.1:** Reused TCP connections via **Keep-Alive**. However, it suffers from **Head-of-Line (HoL) Blocking** at the application level: the browser can request multiple assets over one connection, but must wait for each response to finish before sending the next request.
* **HTTP/2:** Introduced **Binary Framing** and **Multiplexing**, allowing the client to send and receive multiple requests and responses concurrently over a single TCP connection, eliminating application-level HoL blocking.
* **HTTP/3:** Replaces TCP with **QUIC** (a protocol built on UDP). It moves multiplexing down to the transport layer, eliminating TCP-level Head-of-Line blocking (where a single dropped packet stalls all active streams).

---

## 2. Connection Pipelines: HTTP/1.1 vs. HTTP/2

HTTP/1.1 processes requests sequentially, while HTTP/2 multiplexes streams over a single connection:

### HTTP Multiplexing Comparison
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">HTTP Connection Protocols</text>

  {/* HTTP 1.1 Block */}
  <g transform="translate(40, 60)">
    <rect width="230" height="140" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="115" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">HTTP/1.1 (Sequential)</text>
    <rect x="20" y="45" width="190" height="20" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="115" y="58" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Request 1 (Blocks Queue)</text>
    <rect x="20" y="80" width="190" height="20" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="115" y="93" fill="#71717a" font-size="7" font-family="monospace" text-anchor="middle">Request 2 (Waiting...)</text>
  </g>

  {/* HTTP 2 Block */}
  <g transform="translate(330, 60)">
    <rect width="230" height="140" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="115" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">HTTP/2 (Multiplexed)</text>
    <rect x="20" y="45" width="190" height="70" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="115" y="65" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">Stream A (Request 1)</text>
    <text x="115" y="80" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Stream B (Request 2)</text>
    <text x="115" y="95" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Concurrent transfers over 1 TCP socket</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 |
| :--- | :--- | :--- | :--- |
| **Transport Layer** | TCP | TCP | UDP (QUIC) |
| **Format** | Text | Binary Framing | Binary Framing |
| **Multiplexing** | No (Sequential) | Yes (Application-level) | Yes (Transport-level) |
| **Handshake Latency**| High (TCP + TLS) | High (TCP + TLS) | Low (QUIC combines connection & TLS)|

---

## 4. Conceptual Check Questions

1. **Why does HTTP/2 still suffer from Head-of-Line (HoL) blocking at the TCP level?**
   *Answer:* HTTP/2 sends multiple streams over a single TCP connection. However, TCP is a reliable protocol that guarantees packet order. If a packet for Stream A is lost in transit, TCP halts all data delivery—including intact packets for Stream B—until the lost packet is retransmitted.

2. **How does HTTP/3 resolve TCP-level Head-of-Line blocking?**
   *Answer:* HTTP/3 runs on QUIC (built on UDP). QUIC manages streams independently at the transport layer. If a packet containing data for Stream A is lost, it does not block the delivery of packets for Stream B, ensuring smoother performance on unstable networks.
""",
        "content": {
            "introduction": "HTTP defines data transport semantics on the web, evolving from HTTP/1.1 sequential connections to HTTP/2 and HTTP/3 multiplexing.",
            "whyImportant": "Optimizing web asset loading speeds and reducing protocol overheads requires using modern HTTP versions.",
            "realWorldApps": ["Configuring Nginx HTTP/2 support.", "Implementing ALPN headers to negotiate HTTP versions during TLS handshakes."],
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
        "slug": "tcp",
        "title": "TCP Protocol",
        "tagline": "Configure transmission control protocol features, manage sliding windows, and handle three-way handshakes.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["http", "udp"],
        "practiceProblems": [],
        "markdown": """# TCP Protocol

**TCP (Transmission Control Protocol)** is a connection-oriented, reliable transport protocol that guarantees ordered, error-checked delivery of packets. This chapter covers the TCP three-way handshake, sliding windows, and congestion control.

---

## 1. TCP Three-Way Handshake

Before TCP can send application data, the client and server must establish a connection via a **Three-Way Handshake**:
1. **SYN:** The client sends a packet with the `SYN` (Synchronize) flag set and an initial sequence number ($ISN_c$).
2. **SYN-ACK:** The server responds with a packet containing both the `SYN` and `ACK` (Acknowledge) flags, acknowledging the client's sequence number ($ISN_c + 1$) and sending its own sequence number ($ISN_s$).
3. **ACK:** The client sends an `ACK` packet back to the server, acknowledging the server's sequence number ($ISN_s + 1$). Connection is now established.

---

## 2. TCP Three-Way Handshake Sequence

The connection setup lifecycle involves exchanging flags to negotiate sequence numbers:

### Handshake Sequence
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">TCP Three-Way Handshake</text>

  {/* Columns */}
  <text x="120" y="60" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Client</text>
  <text x="480" y="60" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Server</text>
  <line x1="120" y1="75" x2="120" y2="200" stroke="#71717a" stroke-width="1.2" stroke-dasharray="3,3"/>
  <line x1="480" y1="75" x2="480" y2="200" stroke="#71717a" stroke-width="1.2" stroke-dasharray="3,3"/>

  {/* Handshake Lines */}
  <path d="M 120,90 L 480,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#tcp-arrow)"/>
  <text x="300" y="100" fill="#3b82f6" font-size="7" font-family="monospace" text-anchor="middle">1. SYN (seq=X)</text>

  <path d="M 480,130 L 120,160" stroke="#10b981" stroke-width="1.5" marker-end="url(#tcp-arrow)"/>
  <text x="300" y="140" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">2. SYN-ACK (seq=Y, ack=X+1)</text>

  <path d="M 120,170 L 480,200" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#tcp-arrow)"/>
  <text x="300" y="180" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">3. ACK (seq=X+1, ack=Y+1)</text>

  <defs>
    <marker id="tcp-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Flow and Congestion Control

* **Sliding Window:** Prevents the sender from overwhelming the receiver's buffer. The receiver advertises its available buffer space (window size) in the TCP header, and the sender limits unacknowledged data to this size.
* **Congestion Window ($cwnd$):** Prevents the sender from overwhelming the network. TCP uses algorithms like **Slow Start** (doubling packet rates until packet loss is detected) and **Congestion Avoidance** (adjusting rates linearly) to dynamic adjust throughput based on network conditions.

---

## 4. Comparison Matrix

| Property | TCP Protocol | UDP Protocol |
| :--- | :--- | :--- |
| **Connection State** | Connection-oriented (Handshake required)| Connectionless (Fire-and-forget) |
| **Reliability** | Guaranteed delivery and order | Best-effort (packets can be lost/swapped)|
| **Overhead** | High (20-byte header minimum) | Low (8-byte header) |
| **Typical Usage** | HTTP/1.1, HTTP/2, SSH, SMTP | HTTP/3 (QUIC), DNS, gaming, video calls |

---

## 5. Conceptual Check Questions

1. **Why does TCP require a three-way handshake instead of a two-way handshake?**
   *Answer:* A two-way handshake only confirms that the server received the client's connection request. The three-way handshake ensures that both client and server have verified each other's sequence numbers and established bidirectional communication before sending data.

2. **How does the TCP sliding window prevent buffer overflows on receiver nodes?**
   *Answer:* The receiver includes its available buffer space (Window Size) in the ACK packet headers. The sender limits the amount of unacknowledged data it transmits to this size, preventing the receiver's incoming buffer from overflowing.
""",
        "content": {
            "introduction": "TCP is a transport protocol that establishes reliable, ordered, bidirectional connections using handshakes, flow control, and sliding windows.",
            "whyImportant": "Ensuring reliable data delivery and managing network congestion requires TCP.",
            "realWorldApps": ["Implementing TCP handshake verification in firewalls.", "Configuring TCP sliding windows on operating systems to optimize file transfer speeds."],
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
        "slug": "udp",
        "title": "UDP Protocol",
        "tagline": "Configure user datagram protocol streams, optimize packet structures, and prevent network blockings.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["http", "tcp"],
        "practiceProblems": [],
        "markdown": """# UDP Protocol

**UDP (User Datagram Protocol)** is a connectionless, lightweight transport protocol that prioritizes speed over reliability. Unlike TCP, UDP sends packets (datagrams) without establishing a connection or checking if they arrive. This chapter covers datagram structures, fire-and-forget streams, and Head-of-Line blocking avoidance.

---

## 1. Connectionless Transport

Because UDP has no handshake overhead, packet ordering, or retransmission delays:
* **No Handshake:** Datagrams are sent immediately, saving network round-trips.
* **No Head-of-Line Blocking:** If a packet is lost, the sender does not stop to retransmit it. The receiver simply processes subsequent packets, which is ideal for real-time streams where old data is useless.
* **Lightweight Header:** UDP has an 8-byte header (compared to TCP's 20-byte header), reducing network overhead.

---

## 2. UDP Connectionless Stream Flow

The sender transmits packets immediately without a handshake, and the receiver processes them as they arrive:

### UDP Stream Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">UDP Transport Stream</text>

  {/* Client Source */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">UDP Sender</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Fire-and-forget</text>
  </g>

  {/* Stream Pipes */}
  <g transform="translate(190, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Network Datagrams</text>
    <rect x="20" y="45" width="30" height="20" fill="#ef4444" rx="2"/>
    <text x="35" y="57" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Pkt 3</text>
    <rect x="70" y="45" width="30" height="20" fill="#71717a" rx="2" stroke-dasharray="2,2"/>
    <text x="85" y="57" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">Pkt 2 (Lost)</text>
    <rect x="120" y="45" width="30" height="20" fill="#10b981" rx="2"/>
    <text x="135" y="57" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Pkt 1</text>
    <text x="90" y="90" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">No retransmission delay</text>
  </g>

  {/* Receiver */}
  <g transform="translate(420, 75)">
    <rect width="140" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">UDP Receiver</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Processes Pkt 1, then Pkt 3</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 190,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#udp-arrow)"/>
  <path d="M 370,120 L 420,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#udp-arrow)"/>

  <defs>
    <marker id="udp-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | TCP Transport | UDP Transport |
| :--- | :--- | :--- |
| **Header Size** | 20 Bytes minimum | 8 Bytes |
| **Speed** | Lower (connection overhead) | Extremely fast (low overhead) |
| **Error Handling** | Automatic packet recovery | Handled by application layer if needed|
| **Streaming Style** | Continuous byte stream | Discrete datagram packets |

---

## 4. Conceptual Check Questions

1. **Why is UDP preferred over TCP for real-time multiplayer gaming?**
   *Answer:* In real-time gaming, state updates (like player positions) become obsolete quickly. If a player position update packet is lost, TCP pauses delivery to wait for a retransmission, causing latency spikes (lag). UDP continues delivering the latest packets immediately, avoiding delay.

2. **Can application developers build reliability on top of UDP?**
   *Answer:* Yes. You can implement custom reliability features (such as packet sequence checking and selective retransmission) in the application layer. This is how modern protocols like QUIC (which powers HTTP/3) provide reliable transport over UDP.
""",
        "content": {
            "introduction": "UDP is a lightweight, connectionless transport protocol that prioritizes low latency and speed over guaranteed delivery.",
            "whyImportant": "Real-time communication, DNS queries, and media streaming require low-overhead transport.",
            "realWorldApps": ["Using UDP for DNS resolution queries.", "Implementing real-time WebRTC media streams for video calls."],
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
        "slug": "rpc",
        "title": "Remote Procedure Calls",
        "tagline": "Configure RPC interface definitions, generate client stubs, and parse payload serialization.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["grpc", "rest"],
        "practiceProblems": [],
        "markdown": """# Remote Procedure Calls

**RPC (Remote Procedure Call)** is a protocol that allows a program to execute a function on a remote server as if it were a local function call. The complexity of the network request is handled by generated client and server stubs. This chapter covers stub generation, payload marshalling, and serialization.

---

## 1. Stub and Marshalling Mechanics

To make remote calls look like local function calls, RPC systems use stubs:
* **Client Stub:** Acts as a local proxy for the remote function. It serializes (marshals) the function name and arguments into a byte stream and sends it over the network.
* **Server Stub:** Receives the network packet, deserializes (unmarshals) the arguments, executes the local function, and sends the serialized result back to the client.

```
[Client App] ──> [Client Stub] ──> (Marshall Payload) ──> [Network Socket]
                                                                  │
[Server App] <── [Server Stub] <── (Unmarshal Payload) <──────────┘
```

---

## 2. RPC Execution Pipeline

The client stub marshals parameters, and the server stub unmarshals and executes the target procedure:

### RPC Communication Geometry
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">RPC Execution Flow</text>

  {/* Client Host */}
  <g transform="translate(40, 60)">
    <rect width="180" height="130" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Client Host</text>
    <rect x="15" y="45" width="150" height="30" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="65" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">1. Call: getUser(id)</text>
    <rect x="15" y="85" width="150" height="30" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="105" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">2. Client Stub (Marshal)</text>
  </g>

  {/* Server Host */}
  <g transform="translate(380, 60)">
    <rect width="180" height="130" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Server Host</text>
    <rect x="15" y="45" width="150" height="30" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="65" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">4. Server Stub (Unmarshal)</text>
    <rect x="15" y="85" width="150" height="30" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="105" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">5. Run local: getUser(id)</text>
  </g>

  {/* Network Pipeline */}
  <path d="M 220,125 L 380,125" stroke="#a855f7" stroke-width="2" marker-end="url(#rpc-arrow)"/>
  <text x="300" y="115" fill="#a855f7" font-size="7" font-family="monospace" text-anchor="middle">3. TCP Network Packet</text>

  <defs>
    <marker id="rpc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | RPC (Procedure Call) | REST (Resource Interface) |
| :--- | :--- | :--- |
| **Core Concept** | Invoking remote actions/verbs | Manipulating resource states (nouns) |
| **Coupling** | High (stubs must match exactly) | Low (standard HTTP interfaces) |
| **Payload Format** | Often binary (Avro, ProtoBuf) | Text-based JSON or XML |
| **Ease of Use** | Simple code-level integration | Requires defining HTTP endpoints |

---

## 4. Conceptual Check Questions

1. **Why does changes to an RPC server definition require updates to client code?**
   *Answer:* RPC client stubs are generated from the server's interface definition. If you change a function signature (e.g. adding parameters) on the server, the client's local stub will be out of sync and fail to marshal the request correctly.

2. **How does marshalling differ from serialization?**
   *Answer:* Serialization converts an object into a byte stream. Marshalling goes further, packaging the serialized data along with execution metadata (like method signatures and routing details) required to invoke the function on the remote server.
""",
        "content": {
            "introduction": "RPC allows executing code on remote servers like local function calls, using stubs to handle network serialization.",
            "whyImportant": "Simplifying inter-service communication in microservices architectures requires RPC.",
            "realWorldApps": ["Using gRPC to build microservice communication pipelines.", "Generating client SDK stubs from central schema files."],
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
        "slug": "grpc",
        "title": "gRPC Protocol",
        "tagline": "Configure grpc client-servers, define protobuf schemas, and optimize http-2 streams.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["rpc"],
        "related": ["http", "rest"],
        "practiceProblems": [],
        "markdown": """# gRPC Protocol

**gRPC** is a high-performance, open-source Remote Procedure Call framework developed by Google. It modernizes traditional RPC by using HTTP/2 for transport and Protocol Buffers (ProtoBuf) for interface definition and serialization. This chapter covers ProtoBuf schemas, HTTP/2 multiplexing streams, and client-server pipelines.

---

## 1. Protocol Buffers (ProtoBuf)

gRPC defines service contracts and message schemas using **Protocol Buffers**:
* **IDL (Interface Definition Language):** Developers define data structures and service methods in `.proto` files.
* **Binary Serialization:** ProtoBuf serializes data into a compact binary format, which is smaller and faster to parse than JSON or XML.
* **Code Generation:** Toolchains compile `.proto` files into native client stubs and server templates in languages like C++, Java, and Go.

```proto
// Example ProtoBuf definition
syntax = "proto3";

message UserRequest {
  int32 user_id = 1;
}

message UserResponse {
  string name = 1;
  string email = 2;
}

service UserService {
  rpc GetUserProfile (UserRequest) returns (UserResponse);
}
```

---

## 2. HTTP/2 Transport Layer

gRPC runs on HTTP/2, inheriting its performance features:
* **Multiplexed Streams:** Multiple RPC calls can share a single TCP connection concurrently.
* **Bidirectional Streaming:** Supports client streaming, server streaming, and full bidirectional streaming (where both sides send streams of messages over a single call).

---

## 3. gRPC Client-Server Pipeline

Clients communicate with servers via generated stubs over HTTP/2, exchanging binary ProtoBuf payloads:

### gRPC Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">gRPC ProtoBuf Pipeline</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">gRPC Client</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Generated Stub</text>
  </g>

  {/* HTTP/2 Tunnel */}
  <g transform="translate(190, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">HTTP/2 Connection</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Binary framing layer</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Multiplexed ProtoBuf streams</text>
  </g>

  {/* Server */}
  <g transform="translate(420, 75)">
    <rect width="140" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">gRPC Server</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Unpacks ProtoBuf payload</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 190,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#grpc-arrow)"/>
  <path d="M 370,120 L 420,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#grpc-arrow)"/>

  <defs>
    <marker id="grpc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 4. Comparison Matrix

| Property | REST API (JSON) | gRPC (ProtoBuf) |
| :--- | :--- | :--- |
| **Payload Protocol** | Text JSON | Binary Protocol Buffers |
| **Transport Layer** | HTTP/1.1 or HTTP/2 | HTTP/2 (Mandatory) |
| **Streaming Support**| Request-Response only | Bidirectional streaming |
| **Contract Type** | OpenApi/Swagger (Optional)| Proto File (Strict IDL) |

---

## 5. Conceptual Check Questions

1. **Why are ProtoBuf payloads smaller and faster to parse than JSON payloads?**
   *Answer:* JSON is text-based and includes keys (e.g. `"name": "Alice"`) in every payload, along with whitespace. ProtoBuf is binary-serialized and strips key names entirely, representing fields as field tags (integers). This reduces payload size and avoids text-parsing CPU overhead.

2. **How does gRPC utilize HTTP/2 multiplexing to optimize server resource usage?**
   *Answer:* Under HTTP/1.1, servers must open a separate TCP connection for each concurrent request, consuming network sockets and file descriptors. gRPC routes multiple concurrent RPC streams over a single TCP connection, reducing socket overhead.
""",
        "content": {
            "introduction": "gRPC is a high-performance RPC framework built on HTTP/2 transport and Protocol Buffers serialization.",
            "whyImportant": "Achieving low-latency, type-safe communication between microservices requires gRPC.",
            "realWorldApps": ["Building internal microservice APIs in Kubernetes clusters.", "Streaming real-time server telemetry to monitoring agents."],
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
        "slug": "rest",
        "title": "REST APIs",
        "tagline": "Configure REST endpoints, manage stateless resource states, and implement HATEOAS navigations.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["rpc", "grpc"],
        "practiceProblems": [],
        "markdown": """# REST APIs

**REST (Representational State Transfer)** is an architectural style for designing networked applications. It defines constraints for building stateless, resource-oriented web APIs. This chapter covers REST constraints, resource URIs, HTTP verbs, and HATEOAS.

---

## 1. REST Constraints

To be considered a true RESTful API, a system must follow these six architectural constraints:
1. **Client-Server Separation:** Decouples client and server development.
2. **Statelessness:** Each request from a client must contain all the information needed to understand and process it. The server does not store client session state.
3. **Cacheability:** Server responses must define themselves as cacheable or not to improve scalability.
4. **Layered System:** The client cannot tell whether it is connected directly to the end server or an intermediate proxy (e.g. load balancer, CDN).
5. **Code on Demand (Optional):** Servers can extend client functionality by sending executable code (e.g., JavaScript).
6. **Uniform Interface:** Simplifies architecture through standard resource naming, HTTP verbs, and self-describing messages.

---

## 2. Resource Naming and HTTP Verbs

REST APIs identify entities (resources) using nouns in the URI and manipulate them using standard HTTP verbs:
* **GET `/users`:** Retrieve a list of users.
* **GET `/users/123`:** Retrieve details for a specific user.
* **POST `/users`:** Create a new user resource.
* **PUT `/users/123`:** Update or replace a user resource.
* **DELETE `/users/123`:** Terminate a user resource.

---

## 3. REST Resource Tree Relationships

Resources are nested hierarchically to represent structural relationships:

### REST API Resource Tree
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">REST Resource URI Structure</text>

  {/* Root Node */}
  <g transform="translate(240, 50)">
    <rect width="120" height="40" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="60" y="24" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">/api/v1</text>
  </g>

  {/* Users Collection */}
  <g transform="translate(100, 140)">
    <rect width="160" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="80" y="22" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">/users/{user_id}</text>
    <text x="80" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Manipulates User Entity</text>
  </g>

  {/* Orders Collection */}
  <g transform="translate(340, 140)">
    <rect width="160" height="50" rx="3" fill="#1c1917" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="80" y="22" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">/orders/{order_id}</text>
    <text x="80" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Manipulates Order Entity</text>
  </g>

  {/* Paths */}
  <path d="M 240,70 L 180,140 M 360,70 L 420,140" stroke="#71717a" stroke-width="1.2" marker-end="url(#rest-arrow)"/>

  <defs>
    <marker id="rest-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 4. HATEOAS (Hypermedia As The Engine Of Application State)

**HATEOAS** is a REST constraint where the server response includes navigation links. This allows the client to discover related API actions dynamically without hardcoding URLs:

```json
{
  "id": 123,
  "name": "Alice",
  "links": [
    { "rel": "self", "href": "/users/123" },
    { "rel": "orders", "href": "/users/123/orders" },
    { "rel": "delete", "href": "/users/123", "method": "DELETE" }
  ]
}
```

---

## 5. Conceptual Check Questions

1. **Why does REST's statelessness constraint improve API scalability?**
   *Answer:* Since the server does not store client session data, any server instance can handle any incoming request. This allows you to scale the API horizontally by simply adding servers behind a load balancer.

2. **What problem does HATEOAS solve in client-server integration?**
   *Answer:* It decouples the client from specific URL paths. If the server changes its routing hierarchy, it updates the returned hypermedia links. The client follows these links dynamically, preventing hardcoded URLs from breaking.
""",
        "content": {
            "introduction": "REST is an architectural style for designing stateless, resource-oriented APIs using standard HTTP verbs.",
            "whyImportant": "Building scalable, decouple web APIs requires REST principles.",
            "realWorldApps": ["Designing resource-based routes for e-commerce catalog APIs.", "Implementing HATEOAS navigation links in public API responses."],
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
