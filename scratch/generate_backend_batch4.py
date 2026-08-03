import json
import sys

b4_articles = {}

# 22. MongoDB
b4_articles['nosql-mongodb'] = r"""# MongoDB Architecture: BSON Storage, WiredTiger Engine & Replica Sets

MongoDB is a document-oriented NoSQL database that stores data as flexible, schema-less **BSON** (Binary JSON) documents. It uses the **WiredTiger** storage engine with ticket-based concurrency, MVCC page snapshots, and checkpointing.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mdbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#mdbBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">MongoDB WiredTiger Storage Engine Architecture</text>

  <rect x="100" y="100" width="220" height="180" rx="8" fill="#047857"/>
  <text x="210" y="135" text-anchor="middle" fill="#fff" font-weight="700">In-Memory Cache</text>
  <text x="210" y="165" text-anchor="middle" fill="#a7f3d0" font-size="12">WiredTiger Cache</text>

  <rect x="380" y="100" width="220" height="180" rx="8" fill="#065f46"/>
  <text x="490" y="135" text-anchor="middle" fill="#fff" font-weight="700">Journal (WAL)</text>
  <text x="490" y="165" text-anchor="middle" fill="#a7f3d0" font-size="12">Write-Ahead Logging</text>

  <rect x="660" y="100" width="160" height="180" rx="8" fill="#064e3b"/>
  <text x="740" y="135" text-anchor="middle" fill="#fff" font-weight="700">Disk Data Files</text>
  <text x="740" y="165" text-anchor="middle" fill="#a7f3d0" font-size="12">Checkpoint Files</text>

  <path d="M 320 190 L 380 190" stroke="#34d399" stroke-width="3"/>
  <path d="M 600 190 L 660 190" stroke="#34d399" stroke-width="3"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is BSON in MongoDB?
BSON (Binary JSON) is the binary serialization format MongoDB uses to store documents. It adds data types like `Date`, `ObjectId`, and `BinData` to standard JSON.

### Q2: How does MongoDB Replica Set leader election work?
Replica sets use Raft-like consensus. If the Primary node fails, Secondary nodes hold an automated election to promote a new Primary.

### Q3: What is the WiredTiger Cache limit default?
By default, WiredTiger uses 50% of (RAM - 1 GB), or 256 MB, whichever is greater.

### Q4: What is the maximum size of a single MongoDB document?
The maximum BSON document size limit is **16 Megabytes**. Large files should be stored using GridFS.

### Q5: How do Aggregation Pipelines work in MongoDB?
Aggregation pipelines process documents through sequential stages (`$match`, `$group`, `$project`, `$sort`, `$unwind`) to compute data analytics inside the database engine.
"""

# 23. CouchDB
b4_articles['nosql-couchdb'] = r"""# Apache CouchDB: Multi-Version Concurrency Control (MVCC) & CouchReplication

Apache CouchDB is an open-source document database that uses JSON for documents, JavaScript for MapReduce indexes, and HTTP/REST for APIs. It uses **Multi-Version Concurrency Control (MVCC)** to avoid locking data during concurrent reads and writes.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cdbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#cdbBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">CouchDB Peer-to-Peer Bidirectional Replication</text>

  <rect x="100" y="120" width="200" height="120" rx="8" fill="#b91c1c"/>
  <text x="200" y="185" text-anchor="middle" fill="#fff" font-weight="700">CouchDB Node A</text>

  <rect x="600" y="120" width="200" height="120" rx="8" fill="#b91c1c"/>
  <text x="700" y="185" text-anchor="middle" fill="#fff" font-weight="700">CouchDB Node B</text>

  <path d="M 300 160 L 600 160" stroke="#fca5a5" stroke-width="3"/>
  <path d="M 600 200 L 300 200" stroke="#fca5a5" stroke-width="3"/>
  <text x="450" y="150" text-anchor="middle" fill="#fca5a5" font-size="12">Continuous CouchReplication</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is MVCC in CouchDB?
MVCC (Multi-Version Concurrency Control) assigns a revision ID (`_rev`) to every update, storing old document versions until compacted to ensure non-blocking concurrent reads.

### Q2: How does CouchDB handle write conflicts?
CouchDB detects conflicts when two nodes edit the same revision. It keeps both revisions in a conflict tree and deterministically picks a winner.

### Q3: What is CouchReplication?
CouchReplication is CouchDB's native replication algorithm that syncs databases over standard HTTP REST requests.

### Q4: How are CouchDB view indexes constructed?
View indexes are generated asynchronously using incremental MapReduce JavaScript functions.

### Q5: What database format does PouchDB use?
PouchDB is a browser JavaScript implementation of CouchDB that syncs natively with CouchDB over HTTP.
"""

# 24. Redis
b4_articles['nosql-redis'] = r"""# Redis Architecture: In-Memory Data Structures, Event Loop & Persistence (RDB/AOF)

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, streaming engine, and message broker. It executes commands on a single-threaded non-blocking event loop using I/O multiplexing (`epoll`).

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rdsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#rdsBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Redis Event Loop (epoll multiplexing) & Data Structures</text>

  <rect x="80" y="100" width="340" height="180" rx="8" fill="#dc2626"/>
  <text x="250" y="140" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Single-Threaded Event Loop (epoll)</text>
  <text x="250" y="175" text-anchor="middle" fill="#fee2e2" font-size="13">Processes 100,000+ OPS/sec in RAM</text>

  <rect x="480" y="100" width="340" height="180" rx="8" fill="#991b1b"/>
  <text x="650" y="140" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Persistence Engine</text>
  <text x="650" y="175" text-anchor="middle" fill="#fee2e2" font-size="13">RDB (Snapshots) + AOF (Append-Only File)</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: Why is Redis single-threaded?
Redis commands execute entirely in RAM. CPU is rarely the bottleneck; memory bandwidth and network I/O are. Single-threading avoids locks, context switches, and race conditions.

### Q2: What is the difference between RDB and AOF persistence?
RDB takes periodic point-in-time snapshots of dataset state. AOF logs every write command sequentially to disk.

### Q3: How do Redis Data Structures work (Sorted Sets, Hashes, HyperLogLogs)?
Redis provides native primitives like SkipLists for Sorted Sets (`ZSET`), Hash Tables for Object mappings, and probabilistic HyperLogLogs for cardinal counting in 12KB RAM.

### Q4: What happens when Redis reaches its `maxmemory` limit?
Redis applies configured eviction policies (`allkeys-lru`, `volatile-lru`, `noeviction`).

### Q5: What is Redis Sentinel vs Redis Cluster?
Redis Sentinel provides high availability and failover for primary-replica setups. Redis Cluster provides distributed data sharding across up to 1000 nodes.
"""

# 25. DynamoDB
b4_articles['nosql-dynamodb'] = r"""# AWS DynamoDB: Partition Keys, Global Secondary Indexes & Single-Table Design

AWS DynamoDB is a fully managed, serverless key-value and document NoSQL database designed for single-digit millisecond performance at any scale.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ddbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#ddbBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">DynamoDB Request Router & Storage Partitions</text>

  <rect x="100" y="120" width="180" height="120" rx="8" fill="#d97706"/>
  <text x="190" y="185" text-anchor="middle" fill="#fff" font-weight="700">Request Router</text>

  <rect x="420" y="80" width="380" height="60" rx="6" fill="#b45309"/>
  <text x="610" y="115" text-anchor="middle" fill="#fff">Partition 1 (Hash Range A-M)</text>

  <rect x="420" y="160" width="380" height="60" rx="6" fill="#b45309"/>
  <text x="610" y="195" text-anchor="middle" fill="#fff">Partition 2 (Hash Range N-Z)</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is the difference between a Partition Key and a Sort Key in DynamoDB?
A Partition Key (`PK`) determines which physical storage partition holds the item. A Sort Key (`SK`) orders items within that partition, enabling range queries.

### Q2: What is Single-Table Design in DynamoDB?
Single-Table Design models multiple application entities (Users, Orders, Items) into a single DynamoDB table using overloaded generic `PK` and `SK` patterns.

### Q3: What is the difference between LSI and GSI?
Local Secondary Indexes (LSI) share the main table partition key but specify a different sort key. Global Secondary Indexes (GSI) specify both a new partition key and sort key.

### Q4: How is DynamoDB capacity calculated?
Read Capacity Units (RCUs) and Write Capacity Units (WCUs) measure 4KB reads and 1KB writes respectively per second.

### Q5: How does DynamoDB Streams work?
DynamoDB Streams captures a time-ordered sequence of item-level modifications for trigger execution (via AWS Lambda).
"""

# 26. ClickHouse
b4_articles['nosql-clickhouse'] = r"""# ClickHouse Architecture: Columnar Storage, MergeTree Engine & Vectorized Query Execution

ClickHouse is an open-source, high-performance columnar database management system designed for real-time analytical processing (OLAP).

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#chBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Row-Oriented vs Column-Oriented Data Layout</text>

  <rect x="80" y="100" width="340" height="180" rx="8" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
  <text x="250" y="135" text-anchor="middle" fill="#f87171" font-weight="700">Row-Based (PostgreSQL/MySQL)</text>
  <text x="250" y="170" fill="#fee2e2" font-size="12">Row 1: [ID, Name, Age, Country]</text>
  <text x="250" y="200" fill="#fee2e2" font-size="12">Row 2: [ID, Name, Age, Country]</text>

  <rect x="480" y="100" width="340" height="180" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
  <text x="650" y="135" text-anchor="middle" fill="#34d399" font-weight="700">Columnar (ClickHouse OLAP)</text>
  <text x="650" y="170" fill="#ecfdf5" font-size="12">IDs: [1, 2, 3, 4...]</text>
  <text x="650" y="200" fill="#ecfdf5" font-size="12">Ages: [25, 30, 22, 45...]</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: Why is Columnar Storage significantly faster for analytics queries?
Analytics queries aggregate specific columns over billions of rows (`SELECT AVG(age)`). Columnar storage reads only the requested column data files from disk, avoiding reading unused columns.

### Q2: What is the MergeTree engine family in ClickHouse?
MergeTree is ClickHouse's core engine family. It appends data in parts and periodically merges parts in the background, updating primary sparse indexes.

### Q3: What is Vectorized Query Execution?
Vectorized execution processes data in blocks of SIMD vectors rather than row-by-row, achieving maximum CPU cache throughput.

### Q4: Can ClickHouse handle transactional OLTP workloads?
No. ClickHouse does not support fine-grained single-row UPDATEs/DELETEs or point transactions.

### Q5: How high is ClickHouse data compression?
ClickHouse achieves 5x-10x compression ratios by compressing continuous arrays of identical data types using ZSTD/LZ4.
"""

# 27. Cassandra
b4_articles['nosql-cassandra'] = r"""# Apache Cassandra: Masterless Peer-to-Peer Ring, Memtables, SSTables & LSM Trees

Apache Cassandra is a highly scalable, distributed NoSQL database designed for multi-datacenter write-heavy workloads with zero single points of failure.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="casBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#casBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Cassandra Masterless Peer-to-Peer Ring Topology</text>

  <circle cx="450" cy="200" r="110" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4"/>
  <circle cx="450" cy="90" r="25" fill="#0284c7"/><text x="450" y="95" text-anchor="middle" fill="#fff" font-size="11">Node A</text>
  <circle cx="560" cy="200" r="25" fill="#0284c7"/><text x="560" y="205" text-anchor="middle" fill="#fff" font-size="11">Node B</text>
  <circle cx="450" cy="310" r="25" fill="#0284c7"/><text x="450" y="315" text-anchor="middle" fill="#fff" font-size="11">Node C</text>
  <circle cx="340" cy="200" r="25" fill="#0284c7"/><text x="340" y="205" text-anchor="middle" fill="#fff" font-size="11">Node D</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What makes Cassandra masterless?
Every node in a Cassandra cluster plays an identical role. Any node can accept read or write queries for any key.

### Q2: What is the write path in Cassandra?
Writes are logged sequentially to a CommitLog file on disk, written to an in-memory Memtable, and flushed to immutable SSTable files.

### Q3: What is a Bloom Filter in Cassandra?
A Bloom Filter is a fast in-memory probabilistic data structure that checks if an SSTable file *might* contain a key before reading from disk.

### Q4: How does Compaction work in Cassandra?
Compaction merges multiple immutable SSTable files into a single consolidated SSTable, purging tombstones (deleted rows).

### Q5: What is a Tombstone in Cassandra?
When a row is deleted, Cassandra writes a marker called a Tombstone with a timestamp rather than modifying SSTables in place.
"""

# 28. ScyllaDB
b4_articles['nosql-scylladb'] = r"""# ScyllaDB Architecture: C++ Shared-Nothing Core, Seastar Framework & Auto-Tuning

ScyllaDB is a high-performance NoSQL database fully compatible with Apache Cassandra and Amazon DynamoDB, re-implemented from scratch in **C++17** using the asynchronous **Seastar** framework.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scyBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#scyBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">ScyllaDB Shared-Nothing Core-per-CPU Architecture</text>

  <rect x="80" y="100" width="160" height="180" rx="8" fill="#1e3a8a"/>
  <text x="160" y="140" text-anchor="middle" fill="#fff" font-weight="700">CPU Core 0</text>
  <text x="160" y="180" text-anchor="middle" fill="#93c5fd" font-size="12">Dedicated Memory</text>

  <rect x="370" y="100" width="160" height="180" rx="8" fill="#1e3a8a"/>
  <text x="450" y="140" text-anchor="middle" fill="#fff" font-weight="700">CPU Core 1</text>
  <text x="450" y="180" text-anchor="middle" fill="#93c5fd" font-size="12">Dedicated Memory</text>

  <rect x="660" y="100" width="160" height="180" rx="8" fill="#1e3a8a"/>
  <text x="740" y="140" text-anchor="middle" fill="#fff" font-weight="700">CPU Core 2</text>
  <text x="740" y="180" text-anchor="middle" fill="#93c5fd" font-size="12">Dedicated Memory</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: Why is ScyllaDB significantly faster than Apache Cassandra?
ScyllaDB is written in C++ (eliminating JVM garbage collection pauses) and uses a shared-nothing thread-per-core CPU architecture.

### Q2: What is the Seastar framework?
Seastar is an advanced C++ framework for high-performance server applications that maps memory, NIC queues, and I/O directly to specific CPU cores.

### Q3: Is ScyllaDB API compatible with Cassandra?
Yes. ScyllaDB supports CQL (Cassandra Query Language) drivers and protocols drop-in.

### Q4: Does ScyllaDB support DynamoDB API?
Yes, via ScyllaDB Alternator mode.

### Q5: How does ScyllaDB reduce P99 latencies?
By bypassing JVM GC pauses and lock contention across CPU sockets, achieving consistent low P99 latencies.
"""

# Export Batch 4
output_path = './scratch/batch_4.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(b4_articles, f, indent=2, ensure_ascii=False)

print(f"Saved Batch 4 JSON to {output_path} with {len(b4_articles)} articles.")
