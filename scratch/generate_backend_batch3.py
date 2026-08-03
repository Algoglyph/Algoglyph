import json
import sys

b3_articles = {}

# 15. Polling
b3_articles['realtime-polling'] = r"""# Short Polling vs Long Polling: Network Overhead, Timeout Dynamics & Resource Utilization

Polling is an HTTP client-server interaction pattern used to retrieve state updates from a backend server. This article compares **Short Polling** (periodic HTTP GET requests) with **Long Polling** (server-held HTTP requests), analyzing network socket overhead, latency, and server worker scalability.

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pollBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#pollBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Short Polling vs Long Polling Request Flow Comparison</text>

  <!-- Short Polling -->
  <rect x="60" y="80" width="360" height="250" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
  <text x="240" y="115" text-anchor="middle" fill="#60a5fa" font-weight="700" font-size="16">Short Polling (Frequent Empty 200/304)</text>
  <path d="M 100 150 L 380 150" stroke="#93c5fd" stroke-width="2"/><text x="240" y="145" text-anchor="middle" fill="#e0f2fe" font-size="11">1. GET /status -> 200 OK (empty)</text>
  <path d="M 100 190 L 380 190" stroke="#93c5fd" stroke-width="2"/><text x="240" y="185" text-anchor="middle" fill="#e0f2fe" font-size="11">2. GET /status -> 200 OK (empty)</text>
  <path d="M 100 230 L 380 230" stroke="#93c5fd" stroke-width="2"/><text x="240" y="225" text-anchor="middle" fill="#e0f2fe" font-size="11">3. GET /status -> 200 OK (data!)</text>

  <!-- Long Polling -->
  <rect x="480" y="80" width="360" height="250" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="660" y="115" text-anchor="middle" fill="#34d399" font-weight="700" font-size="16">Long Polling (Server Holds Connection)</text>
  <path d="M 520 150 L 800 150" stroke="#a7f3d0" stroke-width="2"/><text x="660" y="145" text-anchor="middle" fill="#ecfdf5" font-size="11">1. GET /status (Held open...)</text>
  <path d="M 800 230 L 520 230" stroke="#a7f3d0" stroke-width="2"/><text x="660" y="225" text-anchor="middle" fill="#ecfdf5" font-size="11">2. Data available! -> Return 200 OK</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between Short Polling and Long Polling?
Short polling sends HTTP requests at fixed intervals regardless of whether data has changed. Long polling holds the HTTP connection open on the server until new data is available or a timeout occurs.

### Q2: Why can Short Polling cause high server CPU load?
If thousands of clients poll every 1-2 seconds, the server wastes massive CPU resources parsing HTTP headers and performing empty database lookups.

### Q3: What is the main drawback of Long Polling?
Long polling holds open HTTP connections, consuming worker threads (in thread-per-request models) and requiring careful timeout handling for reverse proxies.

### Q4: When should Long Polling be used over WebSockets?
Use Long Polling when firewall rules block non-HTTP protocols, or when building simple notification triggers for systems where establishing full-duplex WebSockets is unnecessary.

### Q5: What happens when a Long Polling request times out?
The server returns a standard HTTP timeout response (e.g. `204 No Content` or `304 Not Modified`), and the client immediately issues a new long polling request.
"""

# 16. DB Indexes
b3_articles['scale-db-indexes'] = r"""# Database Indexing Mechanics: B-Tree, Hash, GIN, BRIN & Index Maintenance

Database indexing is the primary technique for optimizing SQL query performance. This article explains how B-Trees, B+Trees, Hash Indexes, GIN, and BRIN indexes work under the hood.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="idxBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#idxBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">B+Tree Index Search Traversal (Logarithmic O(log N) Lookup)</text>

  <!-- Root -->
  <rect x="400" y="70" width="100%" height="45" max-width="100" fill="#2563eb" rx="6"/>
  <text x="450" y="98" text-anchor="middle" fill="#fff" font-weight="700">Root Node: [50]</text>

  <!-- Level 1 -->
  <rect x="200" y="160" width="150" height="45" fill="#1d4ed8" rx="6"/>
  <text x="275" y="188" text-anchor="middle" fill="#fff" font-size="13">[20, 35]</text>

  <rect x="550" y="160" width="150" height="45" fill="#1d4ed8" rx="6"/>
  <text x="625" y="188" text-anchor="middle" fill="#fff" font-size="13">[65, 80]</text>

  <!-- Leaf Level -->
  <rect x="100" y="260" width="120" height="45" fill="#059669" rx="6"/>
  <text x="160" y="288" text-anchor="middle" fill="#fff" font-size="12">Leaf [5, 12, 18]</text>

  <rect x="260" y="260" width="120" height="45" fill="#059669" rx="6"/>
  <text x="320" y="288" text-anchor="middle" fill="#fff" font-size="12">Leaf [22, 30, 45]</text>

  <rect x="520" y="260" width="120" height="45" fill="#059669" rx="6"/>
  <text x="580" y="288" text-anchor="middle" fill="#fff" font-size="12">Leaf [55, 60, 62]</text>

  <rect x="680" y="260" width="120" height="45" fill="#059669" rx="6"/>
  <text x="740" y="288" text-anchor="middle" fill="#fff" font-size="12">Leaf [70, 85, 99]</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is the main structural difference between a B-Tree and a B+Tree?
In a B-Tree, data pointers are stored in both internal and leaf nodes. In a B+Tree, internal nodes store only key routing data, and all actual data pointers land in linked leaf nodes, optimizing range scans.

### Q2: What is a Composite Index and how does the Leftmost Prefix Rule work?
A Composite Index indexes multiple columns (e.g. `(last_name, first_name, age)`). Queries can only use the index if they filter on the leftmost column (`last_name`) first.

### Q3: Why do indexes slow down write operations (`INSERT`, `UPDATE`, `DELETE`)?
Every write requires the database engine to update the target table data page AND re-balance all associated index B+Trees.

### Q4: When should you use a GIN (Generalized Inverted Index) in PostgreSQL?
Use GIN indexes for composite data types like `JSONB` document keys, full-text search vectors, or array columns where a single row contains multiple elements.

### Q5: What is a Cover Index?
A Cover Index contains all the columns requested by a SQL query in the index itself, avoiding table page lookups (Index-Only Scan).
"""

# 17. Replication
b3_articles['scale-data-replication'] = r"""# Database Replication Topologies: Single-Leader, Multi-Leader & Leaderless Systems

Data Replication copies database state across multiple physical nodes to ensure high availability, fault tolerance, and low-latency read access.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="repBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#repBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Single-Leader Asynchronous Replication Topology</text>

  <!-- Leader -->
  <rect x="100" y="140" width="180" height="100" rx="8" fill="#2563eb"/>
  <text x="190" y="195" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Leader Node (R/W)</text>

  <!-- Followers -->
  <rect x="520" y="80" width="180" height="80" rx="8" fill="#059669"/>
  <text x="610" y="125" text-anchor="middle" fill="#fff" font-weight="600">Follower 1 (RO)</text>

  <rect x="520" y="200" width="180" height="80" rx="8" fill="#059669"/>
  <text x="610" y="245" text-anchor="middle" fill="#fff" font-weight="600">Follower 2 (RO)</text>

  <path d="M 280 160 L 520 120" stroke="#93c5fd" stroke-width="3"/>
  <path d="M 280 220 L 520 240" stroke="#93c5fd" stroke-width="3"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is the difference between Synchronous and Asynchronous replication?
In Synchronous replication, the leader waits for followers to confirm data writes before acknowledging success to the client. In Asynchronous replication, the leader acknowledges immediately after writing locally.

### Q2: What is Replication Lag?
Replication lag is the delay between a write occurring on the primary leader node and being applied to follower nodes.

### Q3: How does Leaderless (Dynamo-style) Replication handle data conflicts?
Leaderless systems use Quorum writes/reads ($W + R > N$) combined with Last-Write-Wins (LWW) or Vector Clocks to resolve conflicting updates.

### Q4: What is Split-Brain scenario during failover?
Split-Brain occurs when a network partition causes two nodes to both believe they are the active Leader, causing data divergence.

### Q5: What is Read-Your-Writes consistency?
Read-Your-Writes consistency guarantees that a user will always see updates they submitted themselves, even if served from a follower node.
"""

# 18. Sharding
b3_articles['scale-sharding'] = r"""# Database Sharding: Horizontal Partitioning, Shard Keys & Consistent Hashing

Database Sharding is a horizontal partitioning technique that splits a large database across multiple independent database nodes (shards).

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shdBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#shdBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Database Sharding Router & Horizontal Partitioning</text>

  <!-- Router -->
  <rect x="80" y="130" width="180" height="100" rx="8" fill="#6366f1"/>
  <text x="170" y="185" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Shard Router</text>

  <!-- Shards -->
  <rect x="420" y="70" width="180" height="70" rx="6" fill="#0284c7"/>
  <text x="510" y="110" text-anchor="middle" fill="#fff" font-size="14">Shard 0 (Users A-H)</text>

  <rect x="420" y="160" width="180" height="70" rx="6" fill="#0284c7"/>
  <text x="510" y="200" text-anchor="middle" fill="#fff" font-size="14">Shard 1 (Users I-P)</text>

  <rect x="420" y="250" width="180" height="70" rx="6" fill="#0284c7"/>
  <text x="510" y="290" text-anchor="middle" fill="#fff" font-size="14">Shard 2 (Users Q-Z)</text>

  <path d="M 260 160 L 420 105" stroke="#818cf8" stroke-width="2"/>
  <path d="M 260 180 L 420 195" stroke="#818cf8" stroke-width="2"/>
  <path d="M 260 200 L 420 285" stroke="#818cf8" stroke-width="2"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is a Shard Key?
A Shard Key is the field (e.g. `user_id`) used by the router hash algorithm to determine which physical database node stores a given row.

### Q2: What is the main danger of a poor Shard Key choice?
A poor key causes **Hotspotting**, where a single shard receives most read/write traffic while other shards remain underutilized.

### Q3: How does Consistent Hashing prevent massive data re-sharding?
Consistent Hashing maps both nodes and keys to a virtual ring. Adding or removing a node re-assigns only $K/N$ keys on average.

### Q4: Why are cross-shard JOIN queries problematic?
Cross-shard JOINs require fetching data over network links from multiple database nodes, causing high latency.

### Q5: How does database partitioning differ from sharding?
Partitioning divides tables within a single database engine instance. Sharding divides data across multiple separate server hardware nodes.
"""

# 19. CAP Theorem
b3_articles['scale-cap-theorem'] = r"""# CAP Theorem & PACELC: Consistency, Availability & Partition Tolerance Trade-Offs

The CAP Theorem states that a distributed data store can simultaneously provide at most two out of three guarantees: **Consistency (C)**, **Availability (A)**, and **Partition Tolerance (P)**.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="capBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#capBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">CAP Theorem Triangle & Distributed Trade-Offs</text>

  <polygon points="450,70 200,300 700,300" fill="none" stroke="#60a5fa" stroke-width="3"/>
  <circle cx="450" cy="70" r="30" fill="#2563eb"/><text x="450" y="75" text-anchor="middle" fill="#fff" font-weight="700">C</text>
  <circle cx="200" cy="300" r="30" fill="#059669"/><text x="200" y="305" text-anchor="middle" fill="#fff" font-weight="700">A</text>
  <circle cx="700" cy="300" r="30" fill="#d97706"/><text x="700" y="305" text-anchor="middle" fill="#fff" font-weight="700">P</text>

  <text x="325" y="170" fill="#93c5fd" font-weight="600">CP: HBase / MongoDB</text>
  <text x="575" y="170" fill="#fde68a" font-weight="600">AP: Cassandra / Dynamo</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: Why is Partition Tolerance (P) mandatory in distributed systems?
Network cables break and packets get dropped. In any multi-node network, network partitions *will* happen, forcing systems to choose between Consistency (CP) or Availability (AP).

### Q2: What does Consistency mean in the context of CAP Theorem?
CAP Consistency refers to **Linearizability**: every read receives the most recent write or an error.

### Q3: What is the PACELC theorem?
PACELC extends CAP: **If there is a Partition (P)**, trade off Availability (A) vs Consistency (C); **Else (E)**, trade off Latency (L) vs Consistency (C).

### Q4: Which category does Cassandra belong to?
Cassandra is an **AP** system optimized for high availability and eventual consistency.

### Q5: Which category does PostgreSQL with synchronous replication belong to?
It behaves as a **CP** system, prioritizing data consistency over availability during network partitions.
"""

# 20. Firebase
b3_articles['nosql-firebase'] = r"""# Firebase Realtime Database & Cloud Firestore: Architecture & Security Rules

Firebase Realtime Database and Cloud Firestore are NoSQL cloud-hosted document databases providing real-time data synchronization across web and mobile clients.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#fbBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Cloud Firestore Document-Collection Hierarchy</text>

  <rect x="100" y="100" width="220" height="180" rx="8" fill="#1e3a8a"/>
  <text x="210" y="135" text-anchor="middle" fill="#fff" font-weight="700">Collection: 'users'</text>

  <rect x="400" y="100" width="220" height="180" rx="8" fill="#0284c7"/>
  <text x="510" y="135" text-anchor="middle" fill="#fff" font-weight="700">Document: 'usr_99'</text>

  <rect x="670" y="100" width="180" height="180" rx="8" fill="#059669"/>
  <text x="760" y="135" text-anchor="middle" fill="#fff" font-weight="700">Sub-Collection</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: How does Cloud Firestore differ from Firebase Realtime Database?
Firestore scales better automatically, uses collection/document structures, and supports complex multi-field queries. Realtime DB stores data as a single monolithic JSON tree.

### Q2: How does real-time synchronization work in Firebase?
Clients listen to document references via WebSockets/gRPC streams. When data changes, Firestore pushes delta patches to connected listeners.

### Q3: What are Firestore Security Rules?
Declarative rules deployed to Google Cloud that evaluate every read/write against client authentication tokens (`request.auth`).

### Q4: How are Firestore reads billed?
Firestore bills per document read, write, and delete operation.

### Q5: Does Firestore support ACID transactions?
Yes, Firestore supports atomic transactions across multiple documents.
"""

# 21. RethinkDB
b3_articles['nosql-rethinkdb'] = r"""# RethinkDB: Realtime Changefeeds, ReQL & JSON Document Storage

RethinkDB is an open-source NoSQL database built to push real-time query updates to applications using **Changefeeds**.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rdbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#rdbBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">RethinkDB Push-Based Changefeed Streams</text>

  <rect x="100" y="120" width="200" height="120" rx="8" fill="#3b82f6"/>
  <text x="200" y="185" text-anchor="middle" fill="#fff" font-weight="700">App Server</text>

  <rect x="600" y="120" width="200" height="120" rx="8" fill="#059669"/>
  <text x="700" y="185" text-anchor="middle" fill="#fff" font-weight="700">RethinkDB Engine</text>

  <path d="M 600 180 L 300 180" stroke="#34d399" stroke-width="3"/>
  <text x="450" y="170" text-anchor="middle" fill="#a7f3d0" font-size="13">Continuous Changefeed (r.table('orders').changes())</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is a RethinkDB Changefeed?
A Changefeed allows applications to subscribe to live query feeds. When rows matching the query change, RethinkDB pushes `old_val` and `new_val` diffs in real time.

### Q2: What query language does RethinkDB use?
It uses **ReQL**, an elegant functional query language embedded directly in Python, JS, Java, or Ruby.

### Q3: Does RethinkDB support distributed sharding?
Yes, RethinkDB supports table sharding and replication via its web admin UI or ReQL commands.

### Q4: How does RethinkDB handle joins?
ReQL supports native `eq_join` operations across JSON document tables.

### Q5: Is RethinkDB active today?
While the original commercial company shut down, RethinkDB continues as an open-source project maintained by the Linux Foundation community.
"""

# Export Batch 3
output_path = './scratch/batch_3.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(b3_articles, f, indent=2, ensure_ascii=False)

print(f"Saved Batch 3 JSON to {output_path} with {len(b3_articles)} articles.")
