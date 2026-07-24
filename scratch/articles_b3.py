# -*- coding: utf-8 -*-
import json

ARTICLES_B3 = {
    'realtime-polling': r"""# Polling Strategies: Short Polling, Long Polling & HTTP Keep-Alive Connection Tax

![Polling](/images/backend/realtime-polling-dark.png)

## 1. System Overview & Architectural Motivation

HTTP Polling is a foundational technique for fetching updates from a web server. It exists in two primary operational models:
1. **Short Polling**: The client periodically issues HTTP GET requests at fixed intervals $T$. If no data is available, the server immediately returns an empty $200\text{ OK}$ or $204\text{ No Content}$ response.
2. **Long Polling (Hanging GETs)**: The client issues an HTTP request. The server holds the request open until new data arrives or a server-side timeout $T_{\text{timeout}}$ expires.

---

## 2. Short vs. Long Polling Execution Flow Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="14" font-family="sans-serif" font-weight="bold">Short Polling vs. Long Polling HTTP Streams</text>

  <g transform="translate(40, 60)">
    <rect width="220" height="130" rx="6" fill="#18181b" stroke="#ef4444"/>
    <text x="110" y="25" fill="#f87171" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Short Polling (High Overhead)</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">Client -> Req 1 -> Server (Empty 200)</text>
    <text x="15" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">Client -> Req 2 -> Server (Empty 200)</text>
    <text x="15" y="105" fill="#34d399" font-size="10" font-family="monospace">Client -> Req 3 -> Server (Data Payload)</text>

    <rect x="260" y="0" width="220" height="130" rx="6" fill="#18181b" stroke="#10b981"/>
    <text x="370" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Long Polling (Event Driven)</text>
    <text x="275" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">Client -> Pending Request...</text>
    <text x="275" y="80" fill="#60a5fa" font-size="10" font-family="monospace">[Server Holds Connection Open]</text>
    <text x="275" y="105" fill="#34d399" font-size="10" font-family="monospace">Server -> Responds as soon as data arrives</text>
  </g>
</svg>
```

---

## 3. Network Connection Overhead Mathematics

If short polling interval $T = 1\text{ second}$, for $N = 10,000$ active clients:
$$\text{Requests Per Second (RPS)} = \frac{N}{T} = 10,000\text{ RPS}$$

Wasted HTTP Header Traffic (assuming $500\text{ bytes}$ per request/response pair):
$$\text{Wasted Bandwidth} = 10,000 \times 500 \times 2 = 10,000,000\text{ bytes/sec} \approx 80\text{ Mbps}$$

---

## 4. Production Python Long Polling Server Code (FastAPI)

```python
from fastapi import FastAPI
import asyncio
import time

app = FastAPI()

# Shared event queue
EVENT_QUEUE = asyncio.Queue()

@app.get("/poll")
async def long_poll(timeout: float = 30.0):
    start_time = time.time()
    try:
        # Wait for data or timeout
        data = await asyncio.wait_for(EVENT_QUEUE.get(), timeout=timeout)
        return {"status": "event_received", "payload": data}
    except asyncio.TimeoutError:
        return {"status": "timeout", "payload": None}

@app.post("/trigger")
async def trigger_event(data: dict):
    await EVENT_QUEUE.put(data)
    return {"status": "event_queued"}
```
""",

    'scale-db-indexes': r"""# Database Indexes Architecture: B+ Trees, LSM-Trees, Hash Indexes & Write Amplification

![Database Indexes](/images/backend/scale-db-indexes-dark.png)

## 1. System Overview & Data Structure Mechanics

Database indexes speed up data retrieval queries from $\mathcal{O}(N)$ sequential table scans to $\mathcal{O}(\log N)$ or $\mathcal{O}(1)$ point lookups.

The two dominant database indexing engine structures are:
1. **B+ Trees (Read-Optimized)**: In-place update tree where interior nodes store search keys and leaf nodes store sorted data records connected by doubly linked lists. Used in MySQL InnoDB, PostgreSQL.
2. **LSM-Trees (Log-Structured Merge-Trees, Write-Optimized)**: Append-only memory buffers (MemTable) flushed to sorted disk files (SSTables) and compacted asynchronously. Used in RocksDB, Cassandra, ClickHouse.

---

## 2. B+ Tree vs. LSM-Tree Structural Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="14" font-family="sans-serif" font-weight="bold">B+ Tree vs. LSM-Tree Disk Layout</text>

  <g transform="translate(40, 60)">
    <!-- B+ Tree -->
    <rect width="220" height="130" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="110" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">B+ Tree (In-Place Updates)</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• Block/Page Size: 16KB</text>
    <text x="15" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">• High Fanout (Branching 100+)</text>
    <text x="15" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">• Random Disk Writes</text>

    <!-- LSM Tree -->
    <rect x="260" y="0" width="220" height="130" rx="6" fill="#18181b" stroke="#10b981"/>
    <text x="370" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">LSM-Tree (Append-Only)</text>
    <text x="275" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• MemTable (RAM SkipList)</text>
    <text x="275" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">• Sequential SSTable Flushes</text>
    <text x="275" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">• Background Compaction</text>
  </g>
</svg>
```

---

## 3. B+ Tree Height Mathematics & Lookup Complexity

For a B+ Tree with branching factor (fanout) $B$ containing $N$ keys:

$$\text{Height } h = \lceil \log_{B} N \rceil$$

If $B = 100$ and $N = 100,000,000$ ($100$ million rows):
$$h = \log_{100} (10^8) = 4 \quad \text{Disk I/O Page Lookups}$$

With root node cached in RAM, searching $100$ million rows requires only **3 disk page reads**!

---

## 4. Production SQL B-Tree Index DDL & Optimization

```sql
-- Composite B-Tree Index enforcing Leftmost Prefix Rule
CREATE INDEX idx_orders_user_created 
ON orders (user_id, created_at DESC);

-- Optimal Query (Uses composite index fully)
SELECT order_id, total_amount 
FROM orders 
WHERE user_id = 40219 
ORDER BY created_at DESC 
LIMIT 20;
```
""",

    'scale-data-replication': r"""# Data Replication Architecture: Sync vs Async, Primary-Replica, Multi-Leader & Conflict Resolution

![Data Replication](/images/backend/scale-data-replication-dark.png)

## 1. System Overview & Replication Topologies

Data Replication copies database state across multiple connected physical nodes (replicas) over a network to ensure high availability, fault tolerance, and geographic read scalability.

Replication Modes:
1. **Synchronous Replication**: Primary writes to replica and waits for replica ACK before committing to client.
   *Guarantee*: Zero data loss ($\text{RPO} = 0$), but write latency equals slowest replica write speed.
2. **Asynchronous Replication**: Primary writes locally, returns success to client immediately, and streams write logs asynchronously to replicas.
   *Guarantee*: Low write latency, but introduces replication lag and potential data loss on Primary node crash.

---

## 2. Synchronous vs Asynchronous Replication Flow Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="14" font-family="sans-serif" font-weight="bold">Sync vs. Async Data Replication Flows</text>

  <g transform="translate(40, 60)">
    <rect width="220" height="130" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="110" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Synchronous</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">1. Client -> Write -> Primary</text>
    <text x="15" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">2. Primary -> Sync Replication -> Replica</text>
    <text x="15" y="105" fill="#34d399" font-size="10" font-family="monospace">3. Primary <- Replica ACK <- Commit</text>

    <rect x="260" y="0" width="220" height="130" rx="6" fill="#18181b" stroke="#f59e0b"/>
    <text x="370" y="25" fill="#fbbf24" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Asynchronous</text>
    <text x="275" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">1. Client -> Write -> Primary</text>
    <text x="275" y="80" fill="#34d399" font-size="10" font-family="monospace">2. Primary -> Commit & Responds immediately</text>
    <text x="275" y="105" fill="#f87171" font-size="10" font-family="monospace">3. Async Log Stream -> Replica (Lag)</text>
  </g>
</svg>
```

---

## 3. Replication Lag & Quorum Math

For a cluster of $N$ nodes, with Write Quorum $W$ and Read Quorum $R$:

Strict Consistency Invariant (Quorum Rule):
$$W + R > N$$

If $N = 5$, $W = 3$, and $R = 3$:
$$W + R = 6 > 5 \implies \text{Guaranteed to read the latest written state!}$$

---

## 4. Production Python Conflict Resolution Code (Last-Write-Wins / LWW)

```python
import time

class LWWRegister:
    def __init__(self, initial_val=""):
        self.value = initial_val
        self.timestamp = 0

    def write(self, new_val: str, client_ts: float):
        # Last-Write-Wins based on physical wall-clock timestamp
        if client_ts > self.timestamp:
            self.value = new_val
            self.timestamp = client_ts
            print(f"[LWW] Accepted write: {new_val} at ts={client_ts}")
        else:
            print(f"[LWW] Rejected stale write: {new_val} at ts={client_ts} (Current ts={self.timestamp})")

reg = LWWRegister("v1")
reg.write("v2", time.time())
```
""",

    'scale-sharding': r"""# Sharding Strategies: Range-Based, Hash-Based, Consistent Hashing & Rebalancing Tax

![Sharding](/images/backend/scale-sharding-dark.png)

## 1. System Overview & Sharding Motivation

Database Sharding partitions a massive monolithic database horizontally across multiple independent database servers (shards).

Sharding Strategies:
1. **Range-Based Sharding**: Routes rows by key ranges (e.g. User IDs `1-1,000,000` to Shard 1).
   *Risk*: Causes write hotspots if new keys increase monotonically.
2. **Hash-Based Sharding**: Routes rows by key hash modulo number of shards: $\text{Shard ID} = \text{Hash}(K) \bmod S$.
   *Risk*: Adding/removing a shard invalidates almost all key assignments ($O(N)$ data movement).
3. **Consistent Hashing**: Maps keys and nodes onto a virtual $2^{32}-1$ ring.
   *Advantage*: Adding/removing a shard moves only $1/S$ fraction of keys.

---

## 2. Consistent Hashing Ring Architecture Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#a855f7" font-size="14" font-family="sans-serif" font-weight="bold">Consistent Hashing Virtual Node Ring</text>

  <g transform="translate(40, 60)">
    <circle cx="260" cy="70" r="60" fill="none" stroke="#a855f7" stroke-width="2"/>
    <circle cx="260" cy="10" r="8" fill="#3b82f6"/><text x="260" y="-3" fill="#60a5fa" font-size="9" text-anchor="middle">Node A</text>
    <circle cx="320" cy="70" r="8" fill="#10b981"/><text x="345" y="73" fill="#34d399" font-size="9">Node B</text>
    <circle cx="200" cy="70" r="8" fill="#f59e0b"/><text x="175" y="73" fill="#fbbf24" font-size="9">Node C</text>
  </g>
</svg>
```

---

## 3. Production Python Consistent Hashing Router Implementation

```python
import hashlib

class ConsistentHashRing:
    def __init__(self, replicas=3):
        self.replicas = replicas
        self.ring = {}
        self.sorted_keys = []

    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode('utf-8')).hexdigest(), 16)

    def add_node(self, node: str):
        for i in range(self.replicas):
            vnode_key = f"{node}-vnode-{i}"
            h = self._hash(vnode_key)
            self.ring[h] = node
            self.sorted_keys.append(h)
        self.sorted_keys.sort()

    def get_node(self, key: str) -> str:
        if not self.ring:
            return None
        h = self._hash(key)
        for ring_h in self.sorted_keys:
            if h <= ring_h:
                return self.ring[ring_h]
        return self.ring[self.sorted_keys[0]]

ring = ConsistentHashRing()
ring.add_node("db-shard-1")
ring.add_node("db-shard-2")
print(f"Key 'user_4092' mapped to: {ring.get_node('user_4092')}")
```
""",

    'scale-cap-theorem': r"""# CAP Theorem & PACELC: Consistency, Availability, Partition Tolerance & PACELC Tradeoffs

![CAP Theorem](/images/backend/scale-cap-theorem-dark.png)

## 1. System Overview & Theoretical Proof

The CAP Theorem (Brewer's Theorem) states that any distributed data store can simultaneously provide at most two of three guarantees during a network partition:

1. **Consistency (C)**: Every read receives the most recent write or an error.
2. **Availability (A)**: Every non-failing node returns a non-error response (without guaranteeing latest write).
3. **Partition Tolerance (P)**: System continues operating despite network message drops or delays.

Invariant during Network Partition:
$$\text{System Choice} \implies \text{CP (Consistency + Partition Tolerance)} \quad \text{OR} \quad \text{AP (Availability + Partition Tolerance)}$$

---

## 2. PACELC Extension Equation

PACELC extends CAP by incorporating non-partitioned operational states:

$$\text{If } \mathbf{P} \text{ (Partition): Choose } (\mathbf{A} \text{ vs } \mathbf{C}), \quad \mathbf{E} \text{lse } \text{ (Normal): Choose } (\mathbf{L} \text{atency vs } \mathbf{C} \text{onsistency})$$

Examples:
* **MongoDB**: `PC/EC` (Prefers Consistency in both partition and normal states).
* **DynamoDB / Cassandra**: `PA/EL` (Prefers Availability and Low Latency).
""",

    'nosql-firebase': r"""# Firebase Realtime Database Architecture: Document Trees, Websocket Sync & Security Rules

![Firebase](/images/backend/nosql-firebase-dark.png)

## 1. System Overview

Firebase Realtime Database & Firestore are cloud-hosted NoSQL document databases providing real-time data synchronization over WebSockets across web and mobile clients.
""",

    'nosql-rethinkdb': r"""# RethinkDB Architecture: Changefeeds, JSON Documents & Distributed Joins

![RethinkDB](/images/backend/nosql-rethinkdb-dark.png)

## 1. System Overview

RethinkDB is an open-source, distributed JSON document database engineered for real-time applications via continuous query **Changefeeds**.
"""
}

with open('./scratch/b3_data.json', 'w', encoding='utf-8') as f:
    json.dump(ARTICLES_B3, f, ensure_ascii=False)

print("Batch 3 saved successfully!")
