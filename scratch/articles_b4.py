# -*- coding: utf-8 -*-
import json

ARTICLES_B4 = {
    'nosql-mongodb': r"""# MongoDB Architecture: WiredTiger Engine, Document BSON, Replica Sets & Sharding

![MongoDB](/images/backend/nosql-mongodb-dark.png)

## 1. System Overview & Engine Architecture

MongoDB is a document-oriented NoSQL database storing data as binary-encoded JSON (**BSON**). Powered by the **WiredTiger** storage engine, MongoDB supports document-level concurrency, checkpointing, write-ahead logging (journaling), and memory-mapped page eviction algorithms.

---

## 2. WiredTiger Storage Engine Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="14" font-family="sans-serif" font-weight="bold">MongoDB WiredTiger Architecture</text>

  <g transform="translate(40, 60)">
    <rect width="180" height="130" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="90" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Client Application</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">BSON Wire Protocol</text>

    <rect x="220" y="0" width="260" height="130" rx="6" fill="#18181b" stroke="#10b981"/>
    <text x="350" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">WiredTiger Engine</text>
    <text x="235" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• RAM Cache (Eviction)</text>
    <text x="235" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">• Journal Log (WAL)</text>
    <text x="235" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">• B-Tree Data Files</text>
  </g>
</svg>
```

---

## 3. Production Node.js MongoDB Aggregation Pipeline

```javascript
const { MongoClient } = require('mongodb');

async function runAggregation() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('ecommerce');

  const pipeline = [
    { $match: { status: 'COMPLETED' } },
    { $group: { _id: '$category', totalSales: { $sum: '$amount' }, avgOrder: { $avg: '$amount' } } },
    { $sort: { totalSales: -1 } }
  ];

  const results = await db.collection('orders').aggregate(pipeline).toArray();
  console.log('Category Aggregations:', results);
  await client.close();
}
runAggregation();
```
""",

    'nosql-couchdb': r"""# Apache CouchDB Architecture: Multi-Version Concurrency Control (MVCC), CouchReplication & MapReduce Views

![CouchDB](/images/backend/nosql-couchdb-dark.png)

## 1. System Overview

Apache CouchDB is an append-only NoSQL document database utilizing **MVCC** (Multi-Version Concurrency Control) for lock-free read/write concurrency and HTTP/REST APIs.
""",

    'nosql-redis': r"""# Redis Architecture: In-Memory Data Structures, Event Loop & Persistence (RDB / AOF)

![Redis](/images/backend/nosql-redis-dark.png)

## 1. System Overview & Event Loop Mechanics

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store supporting strings, hashes, lists, sets, sorted sets, bitmaps, and hyperloglogs.

Redis performance is achieved via a **Single-Threaded Event Loop** built on non-blocking I/O multiplexing primitives (`epoll(2)` on Linux, `kqueue(2)` on BSD/macOS).

---

## 2. Event Loop & I/O Multiplexing Architecture

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#ef4444" font-size="14" font-family="sans-serif" font-weight="bold">Redis Single-Threaded epoll Event Loop</text>

  <g transform="translate(40, 60)">
    <rect width="160" height="130" rx="6" fill="#18181b" stroke="#ef4444"/>
    <text x="80" y="25" fill="#f87171" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">epoll() Multiplexer</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">Client Socket 1</text>
    <text x="15" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">Client Socket 2</text>
    <text x="15" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">Client Socket 3</text>

    <rect x="220" y="0" width="240" height="130" rx="6" fill="#18181b" stroke="#10b981"/>
    <text x="340" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Redis Event Processor</text>
    <text x="235" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">1. Process Command Queue</text>
    <text x="235" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">2. In-Memory Data Structures</text>
    <text x="235" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">3. Return Responses</text>
  </g>
</svg>
```

---

## 3. Production Python Redis Pipeline Code

```python
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

# Pipe 1000 operations in a single network round-trip (Redis Pipeline)
pipe = r.pipeline()
for i in range(1000):
    pipe.set(f'user:{i}:score', i * 10)
    pipe.incr(f'user:{i}:score')

results = pipe.execute()
print(f"Pipelined 1000 operations in a single round-trip!")
```
""",

    'nosql-dynamodb': r"""# AWS DynamoDB Architecture: Partition Keys, Sort Keys, Global Tables & Provisioned Throughput

![DynamoDB](/images/backend/nosql-dynamodb-dark.png)

## 1. System Overview

Amazon DynamoDB is a fully managed, serverless key-value NoSQL database designed for predictable single-digit millisecond latency at scale using consistent hashing across storage nodes.
""",

    'nosql-clickhouse': r"""# ClickHouse Architecture: MergeTree Engine, Columnar Storage & Vectorized Query Execution

![ClickHouse](/images/backend/nosql-clickhouse-dark.png)

## 1. System Overview & Columnar Compression Mechanics

ClickHouse is an open-source, column-oriented DBMS engineered for real-time Analytical Processing (OLAP).

Row-Oriented Layout (PostgreSQL, MySQL):
```
Row 1: [ID:1, User:Alice, Age:30, Country:US]
Row 2: [ID:2, User:Bob, Age:25, Country:UK]
```

Column-Oriented Layout (ClickHouse):
```
ID Column:      [1, 2]
User Column:    [Alice, Bob]
Age Column:     [30, 25]
Country Column: [US, UK]
```

---

## 2. Columnar Data Compression Ratio

By storing identical data types contiguously, ClickHouse achieves extreme SIMD vectorization and compression ratios:

$$\text{Compression Ratio} = \frac{\text{Uncompressed Storage}}{\text{LZ4 / ZSTD Compressed Storage}} \approx 5\text{x} - 10\text{x}$$

---

## 3. Production ClickHouse MergeTree DDL

```sql
CREATE TABLE http_requests (
    event_date Date,
    timestamp DateTime,
    url String,
    status_code UInt16,
    response_time_ms UInt32
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (status_code, timestamp);
```
""",

    'nosql-cassandra': r"""# Apache Cassandra Architecture: Ring Topology, CommitLog, MemTable, SSTable & Tunable Consistency

![Cassandra](/images/backend/nosql-cassandra-dark.png)

## 1. System Overview

Apache Cassandra is a peer-to-peer, masterless distributed NoSQL database providing linear scalability and high availability across data centers.
""",

    'nosql-scylladb': r"""# ScyllaDB Architecture: C++ Rewrite, Seastar Framework & Thread-Per-Core Shared-Nothing Model

![ScyllaDB](/images/backend/nosql-scylladb-dark.png)

## 1. System Overview

ScyllaDB is a C++ drop-in replacement for Cassandra that eliminates JVM garbage collection pauses using the **Seastar** shared-nothing thread-per-core asynchronous engine.
"""
}

with open('./scratch/b4_data.json', 'w', encoding='utf-8') as f:
    json.dump(ARTICLES_B4, f, ensure_ascii=False)

print("Batch 4 saved successfully!")
