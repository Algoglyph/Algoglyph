# -*- coding: utf-8 -*-
# Data file containing System Design Batch 3 articles with EXTREMELY DETAILED textbook content.

SYSTEM_DESIGN_BATCH3_ARTICLES = [
    {
        "slug": "document-store",
        "title": "Document Store",
        "tagline": "Configure semi-structured JSON databases, index nested properties, and manage nested document structures.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["sql-vs-nosql"],
        "related": ["wide-column-store", "graph-databases"],
        "practiceProblems": [],
        "markdown": """# Document Store

**Document Stores** are a popular type of NoSQL database. They store data as semi-structured documents, typically in JSON, BSON (Binary JSON), or XML formats. Instead of spreading data across multiple tables using foreign keys, document stores allow you to embed related data inside a single nested document. This chapter covers BSON structures, nested indexing, and schema design.

---

## 1. BSON Schema Design

Unlike SQL databases, Document Stores do not require a predefined schema. Documents in the same collection can have different fields. In databases like MongoDB, data is stored as **BSON (Binary JSON)**, which supports additional data types (such as dates and binary data) and is faster to parse than raw text JSON.

### SQL Normalization vs. Document Nesting
* **SQL (Normalized):** A user record is split across `users`, `user_addresses`, and `user_profiles` tables, requiring SQL JOINs to read.
* **Document Store (Nested):** All address and profile information is embedded directly inside the user document:

```json
{
  "_id": "usr_99283f",
  "username": "johndoe",
  "email": "john@example.com",
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "joined_at": "2026-07-16T18:00:00Z"
  },
  "addresses": [
    {
      "type": "billing",
      "street": "123 Main St",
      "city": "San Francisco",
      "zip": "94105"
    }
  ]
}
```

---

## 2. Document Tree Structure

Document databases store data as hierarchical trees, allowing you to fetch complete object profiles in a single disk read:

### Document Storage Tree
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Document Tree Structure</text>

  {/* Root Document */}
  <g transform="translate(60, 85)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Root Node</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">User Document</text>
  </g>

  {/* Nested Profile */}
  <g transform="translate(240, 50)">
    <rect width="140" height="50" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="70" y="20" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Nested: Profile</text>
    <text x="10" y="38" fill="#fff" font-size="6" font-family="monospace">first_name, last_name</text>
  </g>

  {/* Nested Addresses */}
  <g transform="translate(240, 140)">
    <rect width="140" height="50" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.2"/>
    <text x="70" y="20" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Nested Array: Addresses</text>
    <text x="10" y="38" fill="#fff" font-size="6" font-family="monospace">street, city, zip</text>
  </g>

  {/* Paths */}
  <path d="M 170,120 L 240,75 M 170,140 L 240,165" stroke="#71717a" stroke-width="1"/>
</svg>

---

## 3. Indexing Nested Keys

To ensure fast lookups, document stores support indexing nested fields and array values:
* **Nested Field Index:** Indexing a sub-document field (e.g. `profile.last_name`). This allows fast lookups when searching for users by their last name.
* **Multi-key Index:** Indexing array fields (e.g. `addresses.zip`). The database creates separate index entries for each element in the array.

```javascript
// MongoDB Shell syntax to create a compound index on nested fields
db.users.createIndex({
  "profile.last_name": 1,
  "addresses.zip": 1
});
```

---

## 4. Conceptual Check Questions

1. **Why does document nesting reduce read latency compared to relational databases?**
   *Answer:* It eliminates JOINs. In relational databases, fetching a user and their addresses requires joining tables, which involves reading different parts of the disk. In a document store, all nested data is stored together on disk, allowing it to be retrieved in a single read operation.

2. **When should you reference data rather than embedding it in a document?**
   *Answer:* You should use references when modeling **unbounded one-to-many** relationships (e.g. a product with millions of reviews). Embedding these reviews would cause the document to hit the database's maximum size limit (e.g. MongoDB's 16MB limit).
""",
        "content": {
            "introduction": "Document stores group related data inside nested structures (JSON/BSON), removing the need for relational joins.",
            "whyImportant": "Handling dynamic schemas and optimizing read latency without complex SQL joins requires document databases.",
            "realWorldApps": ["Storing user profiles with varying attributes in MongoDB.", "Managing e-commerce catalogs with dynamic product specs."],
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
        "slug": "wide-column-store",
        "title": "Wide-Column Store",
        "tagline": "Configure Cassandra partitioning, resolve clustering columns, and manage SSTable files.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["sql-vs-nosql"],
        "related": ["document-store", "graph-databases"],
        "practiceProblems": [],
        "markdown": """# Wide-Column Store

**Wide-Column Stores** (also known as tabular databases, like Apache Cassandra, ScyllaDB, and HBase) are designed to handle massive volumes of data across distributed clusters. They store data in rows with dynamic columns, grouping related columns together on disk. This chapter covers Cassandra partitioning, clustering keys, and SSTable layouts.

---

## 1. Cassandra Schema Keys

In wide-column databases like Apache Cassandra, defining primary keys requires understanding how data is distributed and sorted:

* **Partition Key:** Determines which node in the cluster stores the row. The database hashes this key to assign the row to a specific node on the consistent hashing ring.
* **Clustering Key:** Determines the physical sorting order of rows on disk inside the database partition, enabling fast range queries.

```sql
-- Cassandra Query Language (CQL) Schema
CREATE KEYSPACE user_analytics WITH replication = {
  'class': 'SimpleStrategy', 'replication_factor': 3
};

CREATE TABLE user_analytics.clicks (
    user_id uuid,
    click_time timestamp,
    target_url text,
    ip_address text,
    PRIMARY KEY (user_id, click_time) -- (Partition Key, Clustering Key)
) WITH CLUSTERING ORDER BY (click_time DESC);
```

In this schema, `user_id` is the **Partition Key** (all clicks for a user are stored on the same node). `click_time` is the **Clustering Key** (clicks are sorted on disk in descending order of time).

---

## 2. Disk Layout & Write Paths

Wide-column stores use **Log-Structured Merge-Trees (LSM-Trees)** to process writes quickly:
1. **Commit Log:** The write is appended to an on-disk commit log for durability.
2. **MemTable:** The write is written to an in-memory buffer called the MemTable. The database then returns success.
3. **SSTable Flush:** When the MemTable fills, its sorted contents are flushed to disk as an immutable **SSTable (Sorted String Table)**.
4. **Compaction:** Background threads merge SSTables and remove deleted records (tombstones).

---

## 3. Wide-Column Disk Layout

Columns within a partition are stored sequentially on disk, allowing fast range queries:

### SSTable Partition Layout
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">SSTable Row Partition Layout</text>

  {/* Row Key Partition */}
  <g transform="translate(40, 65)">
    <rect width="130" height="120" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Row Key (user_id)</text>
    <text x="65" y="65" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">"usr_1002"</text>
  </g>

  {/* Sorted Columns on disk */}
  <g transform="translate(200, 65)">
    <rect width="360" height="120" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="180" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Sorted Columns (sorted by clustering key click_time)</text>
    
    {/* Columns */}
    <rect x="20" y="45" width="90" height="50" fill="#1c1917" stroke="#fff" rx="2"/>
    <text x="65" y="65" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">click_time: 12:00:05</text>
    <text x="65" y="80" fill="#94a3b8" font-size="5" font-family="monospace" text-anchor="middle">url: /home</text>

    <rect x="135" y="45" width="90" height="50" fill="#1c1917" stroke="#fff" rx="2"/>
    <text x="180" y="65" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">click_time: 12:00:02</text>
    <text x="180" y="80" fill="#94a3b8" font-size="5" font-family="monospace" text-anchor="middle">url: /pricing</text>

    <rect x="250" y="45" width="90" height="50" fill="#1c1917" stroke="#fff" rx="2"/>
    <text x="295" y="65" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">click_time: 12:00:00</text>
    <text x="295" y="80" fill="#94a3b8" font-size="5" font-family="monospace" text-anchor="middle">url: /signup</text>
  </g>

  {/* Connections */}
  <path d="M 170,125 L 200,125" stroke="#3b82f6" stroke-width="1.5"/>
</svg>

---

## 4. Conceptual Check Questions

1. **Why does wide-column storage perform writes faster than relational databases?**
   *Answer:* It uses LSM-Trees instead of B-Trees. Relational databases update B-Tree index pages directly on disk (random write I/O). Wide-column stores write sequentially to an in-memory MemTable, deferring random disk writes to background compaction threads.

2. **What is a "hot spot" in wide-column databases, and how do you avoid it?**
   *Answer:* A hot spot occurs when a disproportionate volume of traffic targets keys assigned to a single partition, overloading that node. To avoid this, choose a high-cardinality partition key that distributes data evenly across nodes (e.g. using `user_id` instead of a low-cardinality key like `country`).
""",
        "content": {
            "introduction": "Wide-column stores organize data into partitioned column families, using clustering keys to sort records on disk for fast range lookups.",
            "whyImportant": "Handling massive write-heavy analytical data across large clusters requires wide-column databases.",
            "realWorldApps": ["Logging time-series IoT data at scale using Cassandra.", "Tracking audit records sorted chronologically on disk."],
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
        "slug": "graph-databases",
        "title": "Graph Databases",
        "tagline": "Configure graph models, analyze index-free adjacencies, and write relationship traversals.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["sql-vs-nosql"],
        "related": ["document-store", "wide-column-store"],
        "practiceProblems": [],
        "markdown": """# Graph Databases

When data is highly connected (e.g., social networks, recommendation engines, or fraud detection systems), relational databases become slow because they require multiple JOIN operations. **Graph Databases** (like Neo4j or Amazon Neptune) model data as **Nodes** (entities), **Edges** (relationships), and **Properties** (attributes), optimizing queries that traverse connections. This chapter covers property graphs and index-free adjacency.

---

## 1. Property Graph Model

* **Nodes (Vertices):** Represent entities (e.g. "User", "Product", "Company").
* **Edges (Relationships):** Represent connections between entities (e.g. "Follows", "Purchased", "Employed By"). Edges have a direction and a type.
* **Properties:** Key-value pairs attached to nodes or edges (e.g., a "User" node has name `Alice`; a "Follows" edge has a `since` date).

```cypher
// Cypher query syntax to find friends-of-friends
MATCH (u:User {name: "Alice"})-[:FRIEND]->(f:User)-[:FRIEND]->(fof:User)
RETURN fof.name
```

---

## 2. Index-Free Adjacency

Traditional databases resolve relationships by looking up keys in global indexes. Graph databases use **Index-Free Adjacency**: each node stores direct memory pointers to its adjacent neighbor nodes. This allows the system to traverse relationships in $O(1)$ time per hop, regardless of the total size of the database.

### Adjacency Traversal
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Index-Free Adjacency (Memory Pointers)</text>

  {/* Node Alice */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Node: Alice</text>
    <rect x="10" y="45" width="90" height="30" fill="#111" stroke="#fff" rx="1"/>
    <text x="55" y="62" fill="#a855f7" font-size="6" font-family="monospace" text-anchor="middle" font-weight="bold">Edge: -> Bob (0x7f03)</text>
  </g>

  {/* Node Bob */}
  <g transform="translate(245, 75)">
    <rect width="110" height="90" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="55" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Node: Bob (0x7f03)</text>
    <rect x="10" y="45" width="90" height="30" fill="#111" stroke="#fff" rx="1"/>
    <text x="55" y="62" fill="#10b981" font-size="6" font-family="monospace" text-anchor="middle" font-weight="bold">Edge: -> Charlie (0x7f09)</text>
  </g>

  {/* Node Charlie */}
  <g transform="translate(450, 75)">
    <rect width="110" height="90" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="55" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Node: Charlie (0x7f09)</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Data: Charlie Profile</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 245,120" stroke="#a855f7" stroke-width="1.5" marker-end="url(#graph-arrow)"/>
  <path d="M 355,120 L 450,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#graph-arrow)"/>

  <defs>
    <marker id="graph-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Relational Databases (SQL) | Graph Databases (NoSQL) |
| :--- | :--- | :--- |
| **Relationship Model** | Foreign keys and Join tables | Direct pointers (Edges) |
| **Query Complexity (Hops)**| Increases exponentially with each JOIN | Constant traversal time (Index-free adjacency) |
| **Schema Flex** | Strict table columns | Schema-less nodes and edges |
| **Use Cases** | Financial bookkeeping, HR databases | Social graphs, recommendation engines, fraud networks |

---

## 4. Conceptual Check Questions

1. **Why do relational database joins become slow as you search deeper relationships (e.g. 4+ levels of friend-of-friend)?**
   *Answer:* Relational databases must scan global indexes for each join table, matching keys across tables. As the depth increases, the index search space grows exponentially, which slows down the query.

2. **How does Index-Free Adjacency avoid global index lookups during traversals?**
   *Answer:* Nodes store the physical memory addresses of their connected neighbors. When traversing a relationship, the database accesses those memory addresses directly, bypassing global index lookups.
""",
        "content": {
            "introduction": "Graph databases model data as nodes and edges, using index-free adjacency to traverse connections without slow index lookups.",
            "whyImportant": "Querying highly connected relationship structures (e.g. social networks, recommendation systems) requires graph databases.",
            "realWorldApps": ["Analyzing social connection loops to suggest friends.", "Detecting credit card fraud rings by tracking shared accounts."],
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
        "slug": "database-replication-lags",
        "title": "Replication Lag Guarantees",
        "tagline": "Configure database replicas, analyze replication lags, and write read-your-writes code.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["replication-master-slave-master-master"],
        "related": ["database-sharding-partitions", "cap-theorem-consistency"],
        "practiceProblems": [],
        "markdown": """# Replication Lag Guarantees

In Master-Slave database configurations, writes go to the Master while reads are distributed across Slave replicas. If replication is asynchronous, a delay occurs before writes reach the slaves. This is called **Replication Lag**. This chapter covers replication lag anomalies and configurations to guarantee data consistency.

---

## 1. Replication Lag Anomalies

Replication lag can cause several anomalies in the user experience:

* **Stale Reads:** Users query a slave replica before the update arrives and receive outdated data.
* **Read-Your-Writes Inconsistency:** A user updates their profile and refreshes the page. If the read request goes to a lagging replica, the user sees their old profile, making it look like their update was lost.
* **Monotonic Read Violations:** A user queries different replicas in sequence. The first read returns the new data, but a subsequent read (routed to a slower replica) returns the old data, making time appear to go backward.

---

## 2. Read-Your-Writes Guarantees

To prevent anomalies, systems use these routing strategies:

* **User-Pinned Master Routing:** When a user writes data, route their reads to the Master node for a set period (e.g., 5 seconds) to allow replicas to catch up. Other users' reads continue routing to slaves.
* **Transaction Log Checking:** The client tracks the transaction ID of their last write. The system only routes reads to replicas that have processed that transaction ID.

### Routing Blueprint
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Read-Your-Writes Routing</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Profile Edit</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Write: Name = "Bob"</text>
    <text x="55" y="70" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Cookie: write_time=12:00</text>
  </g>

  {/* Web Gateway */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">API Gateway Router</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Reads write_time cookie</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Routes read to Master node</text>
  </g>

  {/* Master Node */}
  <g transform="translate(430, 75)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Master DB</text>
    <text x="65" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Value = "Bob"</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#rlg-arrow)"/>
  <path d="M 380,120 L 430,120" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#rlg-arrow)"/>

  <defs>
    <marker id="rlg-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Consistency Guarantee | Implementation Complexity | Latency Penalty | Typical Application |
| :--- | :--- | :--- | :--- |
| **Eventual Consistency** | Low | None | User profile pictures, message feeds |
| **Read-Your-Writes** | Moderate | Low (routes user reads to master temporarily) | User account settings, comments |
| **Monotonic Reads** | Moderate | Low (pins user sessions to specific replicas) | Social feeds, chronologically ordered logs |
| **Strong Consistency** | High | High (synchronous replication across replicas) | Bank transactions, inventory count |

---

## 4. Conceptual Check Questions

1. **How does sticky session load balancing provide monotonic read guarantees?**
   *Answer:* It maps a user's session ID to a specific read replica. Since the user reads from the same replica for all requests, they will not see data revert to an older state, which can happen if requests are routed to different replicas with varying lags.

2. **Why does asynchronous replication cause read-your-writes anomalies?**
   *Answer:* In asynchronous replication, the master node responds to writes immediately before replicating the changes to slaves. If a client reads from a slave before the replication completes, they will receive the old data.
""",
        "content": {
            "introduction": "Replication lag occurs when updates delay reaching read replicas, requiring routing rules to ensure consistency.",
            "whyImportant": "Preventing user confusion caused by reading stale data after updates requires managing replication lag.",
            "realWorldApps": ["Routing user profile edits to the master database to prevent stale reads.", "Pinning user sessions to specific read replicas to guarantee monotonic reads."],
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
        "slug": "database-sharding-partitions",
        "title": "Database Sharding",
        "tagline": "Configure database sharding, design partition keys, and balance database hotspots.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["sql-vs-nosql"],
        "related": ["database-replication-lags", "federation"],
        "practiceProblems": [],
        "markdown": """# Database Sharding

As database storage and query volumes grow, a single database server will eventually reach its hardware limits. **Sharding** (horizontal partitioning) splits a large database table into smaller tables and distributes them across multiple database servers. This chapter covers sharding strategies, key selection, and rebalancing challenges.

---

## 1. Sharding Strategies

To partition data, the system uses a sharding algorithm to assign records to database instances:

* **Range-Based Sharding:** Groups data based on ranges of a value (e.g. usernames A-E go to Shard 1, F-J to Shard 2). This is simple and supports range queries well, but can create hotspots if data is not distributed evenly.
* **Hash-Based Sharding:** Hashes a partition key (e.g. `hash(user_id) % N`) to determine the shard. This distributes writes evenly, but makes range queries slow because data is scattered across shards.
* **Consistent Hashing:** Maps keys to a logical ring structure, reducing the amount of data that must be moved when shards are added or removed.

---

## 2. Range vs. Hash Sharding

### Shard Mapping
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Sharding Strategies</text>

  {/* Range Sharding Column */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Range Sharding (A-Z)</text>
    <rect x="20" y="45" width="140" height="20" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="58" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Shard 1: Usernames A - M</text>
    <rect x="20" y="75" width="140" height="20" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="88" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Shard 2: Usernames N - Z</text>
  </g>

  {/* Hash Sharding Column */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Hash Sharding (Modulo)</text>
    <rect x="20" y="45" width="140" height="20" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="58" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Shard 1: hash(ID) % 2 == 0</text>
    <rect x="20" y="75" width="140" height="20" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="88" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Shard 2: hash(ID) % 2 == 1</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Characteristic | Range-Based Sharding | Hash-Based Sharding | Consistent Hashing |
| :--- | :--- | :--- | :--- |
| **Write Distribution**| Unbalanced (susceptible to hotspots)| Balanced | Highly Balanced |
| **Range Queries** | Fast (data is sorted and grouped) | Slow (requires querying all shards) | Slow |
| **Rebalancing Overhead**| Low | High (modifying $N$ redistributes keys) | Low (only moves keys adjacent to new node) |

---

## 4. Rebalancing Challenges

When data grows, you must add shards to the cluster. If you use standard modulo hashing (`hash(key) % N`), changing the shard count $N$ changes the target shard for almost all keys, requiring you to copy almost all database records to new servers. Using **Consistent Hashing** resolves this by mapping keys and nodes to a logical ring, so adding a node only requires moving a fraction of the keys.

---

## 5. Conceptual Check Questions

1. **Why does range-based sharding often create write hotspots for timestamp data?**
   *Answer:* In range-based sharding, data is grouped by ranges (e.g., day intervals). If your write key is a timestamp, all incoming writes will target the shard representing the current day, overloading that single database instance.

2. **How does consistent hashing minimize data movement during cluster scaling?**
   *Answer:* It maps both keys and nodes to a logical ring. When a new node is added, it only takes over keys that lie between it and its counter-clockwise neighbor, leaving the keys on other nodes unchanged.
""",
        "content": {
            "introduction": "Sharding splits a large database table horizontally across multiple physical servers to scale write performance and storage capacity.",
            "whyImportant": "Scaling databases past single-server storage limits requires implementing sharding.",
            "realWorldApps": ["Sharding transaction records by user ID to balance write loads.", "Distributing time-series records across database nodes using consistent hashing rings."],
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
        "slug": "federation",
        "title": "Database Federation",
        "tagline": "Configure database federation, manage domain boundaries, and write cross-db APIs.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["sql-vs-nosql"],
        "related": ["database-sharding-partitions", "denormalization"],
        "practiceProblems": [],
        "markdown": """# Database Federation

Before sharding a database table, you can scale the storage layer by dividing database instances by domain area. This process is called **Database Federation** (or functional partitioning). Instead of storing all tables (users, orders, products) in one database, you store them in separate databases. This chapter covers domain boundaries, cross-database joins, and data isolation.

---

## 1. Domain Separation

Federation groups tables into databases based on domain boundaries, isolating failures and scaling access patterns:

* **User DB:** Stores authentication and profile data. Handles high read traffic.
* **Order DB:** Stores transaction history. Requires transactional safety (ACID).
* **Product DB:** Stores the product catalog. Can use a document-store NoSQL database to support flexible attributes.

### Federation Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Database Federation Domains</text>

  {/* Client Gateway */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">API Gateway</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Routes requests</text>
  </g>

  {/* Services */}
  <g transform="translate(200, 50)">
    <rect width="140" height="50" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="70" y="20" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">User Service</text>
    <text x="70" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Writes to User DB</text>
  </g>

  <g transform="translate(200, 140)">
    <rect width="140" height="50" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.2"/>
    <text x="70" y="20" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Order Service</text>
    <text x="70" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Writes to Order DB</text>
  </g>

  {/* Databases */}
  <g transform="translate(410, 50)">
    <rect width="150" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">User DB instance</text>
  </g>

  <g transform="translate(410, 140)">
    <rect width="150" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Order DB instance</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,75 M 150,120 L 200,165" stroke="#71717a" stroke-width="1.2"/>
  <path d="M 340,75 L 410,75" stroke="#f59e0b" stroke-width="1.2" marker-end="url(#fed-arrow)"/>
  <path d="M 340,165 L 410,165" stroke="#a855f7" stroke-width="1.2" marker-end="url(#fed-arrow)"/>

  <defs>
    <marker id="fed-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 2. Comparison Matrix

| Property | Single-Instance DB | Federated Databases | Sharded Databases |
| :--- | :--- | :--- | :--- |
| **Write Capacity** | Low (limited by single disk) | Moderate (isolated by domains)| High (writes scale horizontally) |
| **Join Queries** | Simple (SQL Joins) | Complex (requires app Joins)| Complex (requires cross-shard queries) |
| **Failure Domain** | High (full database crashes) | Low (only one domain fails) | Low (only one shard fails) |

---

## 3. The Challenge of Cross-Database Queries

While federation scales write capacity, it complicates queries that need data from multiple domains. For example, if you want to find "the usernames of users who ordered product X", you cannot run a standard SQL JOIN because the tables reside in different databases. Instead, you must fetch the data in two steps:
1. **Query Order DB:** Retrieve the list of `user_id`s who ordered product X.
2. **Query User DB:** Fetch the usernames associated with those `user_id`s.

This **Application-Level Join** requires multiple network queries, which increases latency.

---

## 4. Conceptual Check Questions

1. **How does database federation improve write performance compared to a single-instance database?**
   *Answer:* By splitting tables across different database servers, writes are distributed across different hardware disks. For example, order writes go to the Order DB server, while user registration writes go to the User DB server, reducing disk I/O contention.

2. **Why does database federation make distributed transactions difficult?**
   *Answer:* Transactions cannot use local database locks if they span separate database instances. To guarantee transactional safety across federated databases, you must use complex coordination protocols like Two-Phase Commit (2PC) or Sagas.
""",
        "content": {
            "introduction": "Database federation partitions a database functionally by domain, isolating tables to separate database instances.",
            "whyImportant": "Reducing single-database scaling limits and isolating domain failures requires using database federation.",
            "realWorldApps": ["Moving billing tables to a separate database instance to isolate payment logs.", "Using application-level joins to query data across domain databases."],
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
        "slug": "denormalization",
        "title": "Denormalization Rules",
        "tagline": "Configure database schemas, analyze write overheads, and manage synchronization logic.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["sql-vs-nosql"],
        "related": ["database-sharding-partitions", "federation"],
        "practiceProblems": [],
        "markdown": """# Denormalization Rules

In traditional databases, developers **normalize** schemas to eliminate data redundancy and prevent synchronization anomalies. However, at scale, normalization hurts performance because queries require complex SQL joins. **Denormalization** intentionally duplicates data in the schema to speed up reads, trading write performance and storage space for lower read latency. This chapter covers write overhead, duplicate data, and synchronization logic.

---

## 1. Schema Paradigms

* **Normalized Schema:** A `User` table holds profile data, and a `Post` table reference the user via `user_id`. To display a feed containing the author's username, the system must JOIN these tables.
* **Denormalized Schema:** The `Post` record duplicates the author's `username` directly inside each post record. The system can read the feed in a single query without JOINs.

---

## 2. Syncing Duplicate Data

The primary challenge of denormalization is updating duplicated data when it changes. For example, if a user updates their username, the system must update it in the `User` record and across all of their `Post` records:

### Denormalization Update Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Denormalized Update Loop</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Update</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">New Username: "Alice"</text>
  </g>

  {/* Main DB Update */}
  <g transform="translate(190, 65)">
    <rect width="160" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="80" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">1. Primary Update</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Updates User table</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Sends sync event to workers</text>
  </g>

  {/* Background Sync Worker */}
  <g transform="translate(390, 65)">
    <rect width="170" height="110" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="85" y="25" fill="#ef4444" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">2. Background Sync</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Queries all posts by User</text>
    <text x="15" y="75" fill="#fca5a5" font-size="6" font-family="monospace">Rewrites duplicated fields</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 190,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#den-arrow)"/>
  <path d="M 350,120 L 390,120" stroke="#ef4444" stroke-width="1.5" marker-end="url(#den-arrow)"/>

  <defs>
    <marker id="den-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Metric | Normalized Schema (SQL) | Denormalized Schema (NoSQL) |
| :--- | :--- | :--- |
| **Read Latency** | High (requires JOINs) | Low (data is stored together) |
| **Write Latency** | Low (updates a single record) | High (updates multiple duplicated locations) |
| **Storage Overhead** | Minimal | High (duplicate data increases disk usage) |
| **Consistency** | Strong Consistency (ACID) | Eventual Consistency (BASE) |

---

## 4. Conceptual Check Questions

1. **Why does denormalization increase write latency and complexity?**
   *Answer:* It introduces write overhead. Instead of updating a single user record, the system must locate and update all records that duplicate the user's data (e.g. updating the author's name across all their posts), which requires multiple writes and background sync jobs.

2. **In what scenarios is denormalization preferred?**
   *Answer:* It is preferred in systems with a high read-to-write ratio (e.g. social networks, product catalogs). Since read queries occur much more frequently than writes, optimizing reads at the expense of write speed improves overall performance.
""",
        "content": {
            "introduction": "Denormalization duplicates data in a schema to speed up reads, trading write performance and storage space for lower read latency.",
            "whyImportant": "Avoiding expensive table joins in high-traffic read paths requires using denormalization.",
            "realWorldApps": ["Duplicating user metadata inside posts to speed up social feed reads.", "Using background event listeners to update duplicated username fields."],
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
        "slug": "sql-tuning",
        "title": "SQL Query Tuning",
        "tagline": "Configure database queries, analyze execution plans, and build selective indexes.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["sql-vs-nosql"],
        "related": ["database-sharding-partitions", "federation"],
        "practiceProblems": [],
        "markdown": """# SQL Query Tuning

Relational databases perform well when queries are written and indexed correctly. However, unoptimized queries can cause slow disk scans and lock database threads, degrading system performance. **SQL Query Tuning** analyzes how a database executes queries and modifies indexes and queries to optimize performance. This chapter covers execution plans, indexes, and join algorithms.

---

## 1. Reading EXPLAIN Execution Plans

To optimize a query, prefix it with `EXPLAIN ANALYZE` to inspect how the database engine executes it:

```sql
EXPLAIN ANALYZE 
SELECT email, signup_date 
FROM users 
WHERE country = 'US' AND status = 'active';
```

The database output reveals how it searches the table:
* **Sequential Scan (Seq Scan):** The database reads the entire table from disk. This is slow for large tables ($O(N)$ complexity).
* **Index Scan:** The database searches a sorted index tree, locating records in $O(\\log N)$ time.
* **Filter Cost:** The estimated cost and runtime of the search steps.

---

## 2. SQL Indexing Trees

SQL databases index columns using **B-Tree** structures. When you query indexed columns, the database traverses this tree to locate records quickly:

### B-Tree Execution Tree
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Query Execution Path</text>

  {/* Root Operator */}
  <g transform="translate(225, 50)">
    <rect width="150" height="40" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="75" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Hash Join (Cost: 15.5)</text>
  </g>

  {/* Left Scan */}
  <g transform="translate(60, 140)">
    <rect width="180" height="45" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="90" y="20" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">Index Scan (users_pk)</text>
    <text x="90" y="35" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Fast PK lookup ($O(\\log N)$)</text>
  </g>

  {/* Right Scan */}
  <g transform="translate(360, 140)">
    <rect width="180" height="45" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.2"/>
    <text x="90" y="20" fill="#ef4444" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">Seq Scan (orders)</text>
    <text x="90" y="35" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Slow full table scan ($O(N)$)</text>
  </g>

  {/* Paths */}
  <path d="M 300,90 L 150,140 M 300,90 L 450,140" stroke="#71717a" stroke-width="1"/>
</svg>

---

## 3. Indexing Strategies

* **Composite Index:** An index spanning multiple columns (e.g. `INDEX (country, status)`). The database sorts entries by the first column, then the second.
* **Covering Index:** An index that contains all columns requested by a query. This allows the database to answer the query entirely from the index index tree, bypassing disk reads for the table rows.

```sql
-- Creating a composite index to optimize search filters
CREATE INDEX idx_users_country_status 
ON users (country, status);
```

---

## 4. Conceptual Check Questions

1. **How does the column order in a composite index affect its usefulness?**
   *Answer:* The database sorts composite indexes from left to right. An index on `(country, status)` is useful for queries filtering by `country` or both columns, but it cannot be used for queries filtering only by `status`.

2. **Why can having too many indexes slow down write operations?**
   *Answer:* Every index is an on-disk data structure. When you insert, update, or delete rows, the database must write updates to the tables and rewrite the affected index trees, increasing disk I/O.
""",
        "content": {
            "introduction": "SQL query tuning analyzes query execution plans to identify bottlenecks and optimize indexing strategies.",
            "whyImportant": "Preventing slow queries and database thread locks in relational databases requires query tuning.",
            "realWorldApps": ["Analyzing database query performance using EXPLAIN execution plans.", "Creating composite and covering indexes to optimize read queries."],
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
        "slug": "microservices",
        "title": "Microservices Architecture",
        "tagline": "Configure microservice boundaries, manage database-per-service patterns, and design API communication channels.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["what-is-system-design"],
        "related": ["service-discovery", "reverse-proxy-caches"],
        "practiceProblems": [],
        "markdown": """# Microservices Architecture

In monolithic architectures, all business modules reside in a single codebase and share one database. While simple to deploy initially, monoliths become difficult to scale and maintain as teams and features grow. **Microservices Architecture** decomposes applications into small, independent services that represent specific business domains. This chapter covers service boundaries, communication channels, and the database-per-service pattern.

---

## 1. Domain-Driven Design (DDD)

Microservices organize code around business boundaries rather than technical layers:
* **Database-per-Service:** Each service manages its own private database. Other services cannot query this database directly; they must access the data using public APIs. This prevents tight coupling and allows services to use different database types (polyglot persistence).
* **Decoupled Deployment:** Services can be developed, tested, and deployed independently, improving developer velocity.

---

## 2. API Gateway Routing Geometry

Clients connect to services through an API Gateway, which handles request routing, authorization, and rate limiting:

### Microservices Communication
<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Microservices Architecture Overview</text>

  {/* Client */}
  <g transform="translate(30, 85)">
    <rect width="80" height="110" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="40" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Clients</text>
    <text x="40" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Browsers / Apps</text>
  </g>

  {/* Gateway */}
  <g transform="translate(150, 75)">
    <rect width="100" height="130" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="50" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">API Gateway</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">Auth check</text>
    <text x="10" y="75" fill="#94a3b8" font-size="6" font-family="monospace">Routes traffic</text>
  </g>

  {/* Auth Service */}
  <g transform="translate(290, 50)">
    <rect width="120" height="50" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.2"/>
    <text x="60" y="20" fill="#c084fc" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">Auth Service</text>
    <text x="60" y="38" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">Redis session store</text>
  </g>

  {/* Order Service */}
  <g transform="translate(290, 115)">
    <rect width="120" height="50" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.2"/>
    <text x="60" y="20" fill="#c084fc" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">Order Service</text>
    <text x="60" y="38" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">PostgreSQL DB</text>
  </g>

  {/* Shipping Service */}
  <g transform="translate(290, 180)">
    <rect width="120" height="50" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.2"/>
    <text x="60" y="20" fill="#c084fc" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">Shipping Service</text>
    <text x="60" y="38" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">MongoDB DB</text>
  </g>

  {/* Paths */}
  <path d="M 110,140 L 150,140" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ms-arrow)"/>
  <path d="M 250,110 L 290,75 M 250,140 L 290,140 M 250,170 L 290,205" stroke="#f59e0b" stroke-width="1.2" marker-end="url(#ms-arrow)"/>

  <defs>
    <marker id="ms-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Monolithic Architecture | Microservices Architecture |
| :--- | :--- | :--- |
| **Codebase** | Single codebase | Multiple decoupled repositories |
| **Database** | Shared, single database instance | Database-per-service (isolated schema) |
| **Deployment** | All-or-nothing deployment | Independent service deployments |
| **Fault Isolation** | Low (one bug can crash the entire monolith) | High (one service crashing does not stop others)|
| **Operational Cost** | Low | High (requires container orchestration and monitoring) |

---

## 4. Conceptual Check Questions

1. **Why does the database-per-service pattern prevent tight coupling?**
   *Answer:* It stops services from accessing other domains' databases directly. If services shared a database, changes to one service's tables (e.g. renaming a column) could break other services. Requiring API-only access decouples the internal schema changes from other services.

2. **What is a major challenge when managing distributed transactions across microservices?**
   *Answer:* Since each service has its own database, you cannot use standard database transactions (ACID) to ensure changes commit across multiple services. Instead, you must use application-level patterns like the Saga pattern to handle rollbacks and failures.
""",
        "content": {
            "introduction": "Microservices decompose monoliths into decoupled services organized around business domains, using isolated databases and APIs to communicate.",
            "whyImportant": "Scaling engineering organizations and isolating system faults requires using microservices.",
            "realWorldApps": ["Splitting monolithic e-commerce sites into order, inventory, and billing services.", "Managing isolated user and authentication microservices."],
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
        "slug": "service-discovery",
        "title": "Service Discovery Systems",
        "tagline": "Configure service registries, manage client-side routes, and write health monitors.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["microservices"],
        "related": ["reverse-proxy-caches", "what-is-system-design"],
        "practiceProblems": [],
        "markdown": """# Service Discovery Systems

In microservice clusters, services run on cloud instances that are regularly created, destroyed, or moved. This means their IP addresses and ports change constantly. To allow services to locate and call each other, clusters use a **Service Discovery** system. This chapter covers service registries, health monitoring, and routing configurations.

---

## 1. The Service Registry

A **Service Registry** is a central, highly available database containing the active IP addresses and ports of all services in the cluster (e.g., Consul, Netflix Eureka, or ZooKeeper):
1. **Registration:** When a service instance starts, it registers its IP and port with the registry.
2. **Heartbeats:** The instance sends periodic health checks to the registry. If heartbeats stop, the registry removes the instance.
3. **Lookup:** When Service A wants to call Service B, it queries the registry for Service B's active IPs.

---

## 2. Discovery Paradigms

Systems discover services using one of two patterns:

### Client-Side Discovery
The client (Service A) queries the Service Registry directly, obtains the list of active IPs for Service B, and load balances requests across them locally.

### Server-Side Discovery
The client calls a Load Balancer. The Load Balancer queries the Service Registry and routes the request to an active instance of Service B, simplifying the client's code:

### Server-Side Discovery Layout
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Server-Side Service Discovery</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="100" height="90" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="50" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Service A</text>
    <text x="50" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Calls Service B</text>
  </g>

  {/* Load Balancer */}
  <g transform="translate(190, 65)">
    <rect width="130" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Load Balancer</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">Queries registry</text>
    <text x="10" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Routes to target</text>
  </g>

  {/* Registry */}
  <g transform="translate(360, 50)">
    <rect width="200" height="50" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.2"/>
    <text x="100" y="25" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Service Registry (Consul)</text>
    <text x="100" y="38" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">Active Service IPs: [10.0.1.5, 10.0.1.6]</text>
  </g>

  {/* Target Server B */}
  <g transform="translate(360, 140)">
    <rect width="200" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="100" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Service B (10.0.1.5)</text>
    <text x="100" y="38" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">Active instances</text>
  </g>

  {/* Paths */}
  <path d="M 140,120 L 190,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#sd-sys-arrow)"/>
  <path d="M 255,65 Q 285,45 360,65" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2" marker-end="url(#sd-sys-arrow)"/>
  <path d="M 320,120 L 360,150" stroke="#10b981" stroke-width="1.5" marker-end="url(#sd-sys-arrow)"/>

  <defs>
    <marker id="sd-sys-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Client-Side Discovery | Server-Side Discovery |
| :--- | :--- | :--- |
| **Network Hops** | Low (client calls service directly) | High (request must flow through load balancer) |
| **Client Logic** | Complex (must query registry and load balance) | Simple (calls static load balancer IP) |
| **Load Balancer Single Point**| None | High (load balancer can become a bottleneck) |
| **Examples** | Netflix Eureka, Spring Cloud Discovery | AWS ALB, Kubernetes Service Routing |

---

## 4. Conceptual Check Questions

1. **Why does server-side discovery simplify client application logic?**
   *Answer:* The client does not need to know about the service registry or implement load-balancing algorithms. It simply sends requests to a static load balancer address, which handles the lookup and routing.

2. **How does ZooKeeper maintain a service registry during node crashes?**
   *Answer:* It uses **Ephemeral Nodes**. When a service instance registers, it creates an ephemeral node in ZooKeeper. If the service crashes and its session drops, ZooKeeper automatically deletes the node, removing it from the registry.
""",
        "content": {
            "introduction": "Service discovery dynamically tracks changing service IPs in microservices clusters, using registries to route requests.",
            "whyImportant": "Allowing services to communicate with each other in dynamic cloud environments requires service discovery.",
            "realWorldApps": ["Using Consul to track and route traffic to active microservices.", "Deploying DNS-based service discovery in Kubernetes clusters."],
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
        "slug": "reverse-proxy-caches",
        "title": "LB vs Reverse Proxy",
        "tagline": "Configure reverse proxies, terminate SSL traffic, and implement rate limit limits.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["service-discovery", "what-is-system-design"],
        "practiceProblems": [],
        "markdown": """# LB vs Reverse Proxy

Many developers use **Load Balancers** and **Reverse Proxies** interchangeably. While they share similar architectures, they serve different primary purposes. A **Reverse Proxy** acts as a gateway for a single server, protecting it and caching assets. A **Load Balancer** distributes incoming network traffic across multiple backend servers to ensure availability and performance. This chapter covers Nginx configurations, SSL termination, and caching.

---

## 1. Core Definitions

* **Reverse Proxy:** Intercepts client requests before they reach backend servers. It handles tasks like **SSL Termination** (decrypting HTTPS requests), rate limiting, and static content caching.
* **Load Balancer:** Distributes incoming traffic across a pool of servers, balancing resource usage and routing around crashed servers.

---

## 2. Nginx Reverse Proxy Setup

Nginx is commonly used as a reverse proxy. Here is a configuration snippet showing how it intercepts SSL traffic, decrypts it, and forwards it to backend servers over HTTP:

```nginx
# Nginx Reverse Proxy Configuration
server {
    listen 443 ssl;
    server_name api.example.com;

    # SSL Certificates (SSL Termination)
    ssl_certificate /etc/nginx/ssl/api.crt;
    ssl_certificate_key /etc/nginx/ssl/api.key;

    # Rate Limiting
    limit_req zone=api_limit burst=10 nodelay;

    location / {
        # Forward traffic to internal HTTP backend
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 3. SSL Termination Architecture

By decrypting SSL requests at the reverse proxy tier, you offload encryption tasks from application servers:

### SSL Termination Topology
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">SSL Termination Flow</text>

  {/* Client HTTPS */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Connection</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">HTTPS (Port 443)</text>
    <text x="55" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Encrypted</text>
  </g>

  {/* Reverse Proxy */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Nginx Reverse Proxy</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Decrypts SSL payload</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Forwards raw HTTP internally</text>
  </g>

  {/* App Server */}
  <g transform="translate(430, 75)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">App Server</text>
    <text x="65" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">HTTP (Port 8080)</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ssl-arrow)"/>
  <path d="M 380,120 L 430,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#ssl-arrow)"/>

  <defs>
    <marker id="ssl-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 4. Comparison Matrix

| Property | Reverse Proxy (e.g. Nginx) | Load Balancer (e.g. HAProxy, AWS ALB) |
| :--- | :--- | :--- |
| **Primary Goal** | Web acceleration, security filtering | Distributing network traffic load |
| **SSL Termination** | Supported (standard use case) | Supported (at Layer 7 or Layer 4) |
| **Routing Focus** | URI path mapping, header modifications | Round-robin, least connections distribution |
| **Target Scale** | Often deployed in front of single app nodes | Deployed in front of large, dynamic server pools |

---

## 5. Conceptual Check Questions

1. **Why does offloading SSL termination to a reverse proxy speed up application servers?**
   *Answer:* SSL decryption requires CPU cycles. Handing off decryption tasks to a reverse proxy tier frees application server CPU cores to focus on executing business logic.

2. **When should you deploy both Nginx and HAProxy together in a cluster?**
   *Answer:* You place the load balancer (HAProxy) at the edge to distribute requests across multiple Nginx servers. The Nginx servers act as reverse proxies, handling SSL decryption, caching, and routing requests to internal app nodes.
""",
        "content": {
            "introduction": "Reverse proxies secure application servers and cache static resources, while load balancers distribute traffic across server pools.",
            "whyImportant": "Securing internal app servers and optimizing SSL decryption requires reverse proxies and load balancers.",
            "realWorldApps": ["Setting up Nginx to terminate SSL certificates.", "Deploying HAProxy load balancers to distribute traffic across API nodes."],
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
