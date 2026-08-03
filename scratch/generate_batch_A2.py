import sys
import os
sys.path.append('.')
from scratch.replace_de_blog import replace_de_blog_slug

articles_A2 = {}

articles_A2['nosql-cassandra'] = r"""# Apache Cassandra: Distributed Ring Topology, LSM-Trees, and Quorum Consistency

Apache Cassandra is an open-source, distributed Wide-Column NoSQL database designed to handle massive volumes of data across commodity server nodes without a single point of failure. Originally developed at Facebook based on Amazon's Dynamo paper and Google's Bigtable architecture, Cassandra offers linear scalability, high write availability, and tunable consistency guarantees.

---

## 1. Masterless Ring Topology & Consistent Hashing

Cassandra operates on a peer-to-peer masterless ring architecture. Every node in the cluster plays an identical role; there are no Primary/Master nodes or Replica/Worker hierarchies.

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="casBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#casBg)" stroke="#4338ca" stroke-width="2"/>
  <text x="450" y="38" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Apache Cassandra Distributed Ring & Murmur3 Hashing</text>

  <!-- Ring Circle -->
  <circle cx="450" cy="210" r="120" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="6 6"/>

  <!-- Ring Nodes -->
  <!-- Node A (Top) -->
  <circle cx="450" cy="90" r="28" fill="#4338ca" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="95" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="12">Node A</text>
  <text x="450" y="52" text-anchor="middle" fill="#a5b4fc" font-family="monospace" font-size="10">Token: -9223372036854775808</text>

  <!-- Node B (Right) -->
  <circle cx="570" cy="210" r="28" fill="#4338ca" stroke="#818cf8" stroke-width="2"/>
  <text x="570" y="215" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="12">Node B</text>
  <text x="660" y="215" text-anchor="middle" fill="#a5b4fc" font-family="monospace" font-size="10">Token: -4611686018427387904</text>

  <!-- Node C (Bottom) -->
  <circle cx="450" cy="330" r="28" fill="#4338ca" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="335" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="12">Node C</text>
  <text x="450" y="370" text-anchor="middle" fill="#a5b4fc" font-family="monospace" font-size="10">Token: 0</text>

  <!-- Node D (Left) -->
  <circle cx="330" cy="210" r="28" fill="#4338ca" stroke="#818cf8" stroke-width="2"/>
  <text x="330" y="215" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="12">Node D</text>
  <text x="240" y="215" text-anchor="middle" fill="#a5b4fc" font-family="monospace" font-size="10">Token: 4611686018427387904</text>
</svg>

### Murmur3Partitioner
Data placement is determined by hashing the row's partition key using the `Murmur3Partitioner` algorithm into a 64-bit integer range from $-2^{63}$ to $+2^{63}-1$. The coordinator node computes the hash and routes write requests to the target node whose token range owns that hash value.

---

## 2. Storage Engine: LSM-Tree Architecture

Cassandra achieves ultra-high write throughput because writes are append-only.

1. **CommitLog:** When a write request arrives, it is appended to an on-disk sequential log file (`CommitLog`) for crash recovery durability.
2. **Memtable:** Simultaneously, the row is stored in an in-memory write buffer called a `Memtable` sorted by partition key and clustering key.
3. **SSTable Flush:** When the Memtable fills up or reaches memory limits, its sorted contents are flushed sequentially to an immutable file on disk called an **SSTable** (Sorted String Table).
4. **Compaction:** Background processes merge multiple immutable SSTables into larger consolidated SSTables, discarding tombstoned (deleted) records and outdated cell versions.

---

## 3. Tunable Quorum Consistency

Cassandra lets client applications balance Latency vs Consistency per query operation:

$$R + W > N$$

Where:
- $N$ = Replication Factor (e.g. 3 copies across nodes)
- $W$ = Write Consistency Level (e.g. `QUORUM` = $\lfloor N/2 \rfloor + 1 = 2$)
- $R$ = Read Consistency Level (e.g. `QUORUM` = 2)

If $R + W > N$, the system guarantees **Strong Consistency** (reading your own writes), because the set of nodes read from is guaranteed to overlap with the set of nodes written to.

---

## 4. Cassandra CQL Python Driver Implementation

```python
from cassandra.cluster import Cluster
from cassandra.query import SimpleStatement, ConsistencyLevel
from typing import List, Dict, Any

class CassandraClient:
    def __init__(self, contact_points: List[str] = ['127.0.0.1'], keyspace: str = 'sensor_data'):
        self.cluster = Cluster(contact_points)
        self.session = self.cluster.connect()
        self.keyspace = keyspace
        self._setup_schema()

    def _setup_schema(self):
        query = (
            "CREATE KEYSPACE IF NOT EXISTS " + self.keyspace + " "
            "WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3}"
        )
        self.session.execute(query)
        self.session.set_keyspace(self.keyspace)
        self.session.execute('''
            CREATE TABLE IF NOT EXISTS device_readings (
                device_id uuid,
                date text,
                timestamp timestamp,
                temperature double,
                humidity double,
                PRIMARY KEY ((device_id, date), timestamp)
            ) WITH CLUSTERING ORDER BY (timestamp DESC)
        ''')

    def insert_reading(self, device_id, date_str: str, ts, temp: float, humidity: float):
        query = SimpleStatement('''
            INSERT INTO device_readings (device_id, date, timestamp, temperature, humidity)
            VALUES (%s, %s, %s, %s, %s)
        ''', consistency_level=ConsistencyLevel.QUORUM)
        self.session.execute(query, (device_id, date_str, ts, temp, humidity))

if __name__ == "__main__":
    print("Cassandra CQL client initialized successfully.")
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between Partition Key and Clustering Key in CQL?
In Cassandra, the `PRIMARY KEY` is composed of Partition Keys and optional Clustering Keys. The Partition Key determines which node in the ring stores the row. The Clustering Key determines the physical sorting order of rows inside that partition's SSTable on disk.

### Q2: How does Cassandra handle node failures without data loss?
Cassandra uses a Gossip protocol for node health detection. When a target replica node is down, the coordinator node writes a temporary record called a **Hint** to its local disk. Once the target node comes back online, the coordinator delivers the hints (**Hinted Handoff**), restoring consistency without full anti-entropy repairs.

### Q3: What are Tombstones in Cassandra?
When a row or cell is deleted in Cassandra, it is not immediately erased from disk because SSTables are immutable. Instead, Cassandra writes a marker called a **Tombstone** containing a deletion timestamp. During SSTable compaction, old tombstones past `gc_grace_seconds` are purged from disk.
"""

articles_A2['nosql-clickhouse'] = r"""# ClickHouse: Column-Oriented Storage, MergeTree Engine, and Vectorized Query Execution

ClickHouse is an open-source, column-oriented OLAP (Online Analytical Processing) database management system designed to execute complex analytical queries across billions of rows in real-time. By storing data by columns rather than by rows, ClickHouse leverages vectorized CPU execution and hardware SIMD (Single Instruction, Multiple Data) instructions to achieve processing throughput of tens of gigabytes per second per server node.

---

## 1. Row-Oriented vs. Column-Oriented Layout

Traditional OLTP databases (like PostgreSQL or MySQL) store full row tuples sequentially on disk. Analytical databases (ClickHouse) store each column in its own contiguous file block.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#311042"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#chBg)" stroke="#a855f7" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f3e8ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Row-Store vs. Column-Store Disk Layout</text>

  <!-- Row Store -->
  <g transform="translate(60, 90)">
    <rect width="360" height="220" rx="8" fill="#2e1065" stroke="#c084fc" stroke-width="1.5"/>
    <text x="180" y="30" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="15">Row-Oriented Layout (OLTP)</text>
    <rect x="20" y="55" width="320" height="35" rx="4" fill="#3b0764"/>
    <text x="180" y="78" text-anchor="middle" fill="#e9d5ff" font-family="monospace" font-size="11">Row 1: [ID=1, Name="Alice", Age=30, Sales=150.0]</text>
    <rect x="20" y="100" width="320" height="35" rx="4" fill="#3b0764"/>
    <text x="180" y="123" text-anchor="middle" fill="#e9d5ff" font-family="monospace" font-size="11">Row 2: [ID=2, Name="Bob", Age=25, Sales=200.0]</text>
    <text x="180" y="175" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="11">SELECT SUM(Sales): Reads entire unneeded text/name data from disk.</text>
  </g>

  <!-- Column Store -->
  <g transform="translate(480, 90)">
    <rect width="360" height="220" rx="8" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="180" y="30" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="15">Column-Oriented Layout (ClickHouse OLAP)</text>
    <rect x="20" y="55" width="320" height="35" rx="4" fill="#0f172a"/>
    <text x="180" y="78" text-anchor="middle" fill="#7dd3fc" font-family="monospace" font-size="11">Sales Column File: [150.0, 200.0, 450.0, 89.50...]</text>
    <rect x="20" y="100" width="320" height="35" rx="4" fill="#0f172a"/>
    <text x="180" y="123" text-anchor="middle" fill="#7dd3fc" font-family="monospace" font-size="11">Age Column File:   [30, 25, 42, 19...]</text>
    <text x="180" y="175" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11">SELECT SUM(Sales): Reads ONLY the 8-byte float array directly into CPU SIMD registers.</text>
  </g>
</svg>

### Vectorized Execution
In row-oriented databases, computing `SUM(sales)` invokes a virtual method call for every row in the dataset. In ClickHouse, column data is stored in contiguous C++ vector primitives (`std::vector<float>`). ClickHouse passes contiguous memory blocks directly to CPU vector registers (AVX-512 / ARM Neon), executing arithmetic operations on 64 numbers simultaneously per instruction cycle.

---

## 2. The MergeTree Engine Family

`MergeTree` is the core table engine in ClickHouse.

```text
Table Data Directory:
  ├── 202607_1_1_0/             # Data Part 1 (First Batch)
  │   ├── primary.idx           # Sparse Primary Index (Every 8192 rows)
  │   ├── timestamp.bin         # Compressed Timestamp column data
  │   ├── timestamp.mrk2        # Primary Index Mark Offsets
  │   ├── user_id.bin           # Compressed User ID column data
  │   └── user_id.mrk2
  ├── 202607_2_2_0/             # Data Part 2 (Second Batch)
  └── 202607_1_2_1/             # Merged Consolidated Part
```

---

## 3. Python ClickHouse Driver Code

```python
from clickhouse_driver import Client
import datetime

class AnalyticsStore:
    def __init__(self, host: str = 'localhost'):
        self.client = Client(host=host)
        self._init_db()

    def _init_db(self):
        self.client.execute('''
            CREATE TABLE IF NOT EXISTS user_events (
                event_date Date,
                event_time DateTime,
                user_id UInt64,
                event_type String,
                revenue Float64
            ) ENGINE = MergeTree()
            PARTITION BY toYYYYMM(event_date)
            ORDER BY (event_type, user_id, event_time)
        ''')

    def insert_batch(self, events):
        self.client.execute(
            'INSERT INTO user_events (event_date, event_time, user_id, event_type, revenue) VALUES',
            events
        )

    def query_monthly_revenue(self, event_type: str):
        return self.client.execute('''
            SELECT 
                toStartOfMonth(event_date) AS month,
                count() AS total_events,
                sum(revenue) AS total_revenue
            FROM user_events
            WHERE event_type = %(event_type)s
            GROUP BY month
            ORDER BY month ASC
        ''', {'event_type': event_type})

if __name__ == "__main__":
    store = AnalyticsStore()
    print("ClickHouse connection verified.")
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why does ClickHouse use a Sparse Primary Index instead of a Dense B-Tree Index?
In OLAP workloads querying billions of rows, a dense B+ Tree index would consume hundreds of gigabytes of RAM. ClickHouse uses a **Sparse Primary Index** that stores one index entry for every **8,192 rows** (index granularity). This allows the entire index to fit inside RAM (a few megabytes), enabling ClickHouse to perform fast binary searches to locate the exact 8,192-row mark block on disk.

### Q2: Why are mutations (`UPDATE` and `DELETE`) slow or asynchronous in ClickHouse?
ClickHouse is optimized for high-volume immutable inserts (`INSERT INTO`). Modifying or deleting individual rows breaks contiguous column block compression. ClickHouse implements updates and deletes using asynchronous background mutations (`ALTER TABLE ... UPDATE/DELETE`) that rewrite entire data parts during MergeTree compaction.
"""

# Apply Batch A2 replacements
with open('src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
for slug, article in articles_A2.items():
    content, ok = replace_de_blog_slug(content, slug, article)
    if ok:
        count += 1
        print(f"  OK   Batch A2: '{slug}' ({len(article):,} chars)")
    else:
        print(f"  WARN Batch A2: slot '{slug}' failed to replace")

with open('src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nBatch A2 complete. {count} articles updated.")
