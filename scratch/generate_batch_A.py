import sys
import os
sys.path.append('.')
from scratch.replace_de_blog import replace_de_blog_slug

articles_A = {}

articles_A['nosql-mongodb'] = """# MongoDB: Document Architecture, WiredTiger Engine, and Sharded Clusters

MongoDB is a document-oriented NoSQL database that stores data as semi-structured BSON (Binary JSON) documents. Designed for high schema flexibility, horizontal scalability, and low-latency disk I/O, MongoDB powers modern web applications requiring dynamic schemas and flexible querying capabilities.

---

## 1. Storage Engine Mechanics: WiredTiger

Since version 3.2, MongoDB uses **WiredTiger** as its primary storage engine. WiredTiger manages document memory allocation, eviction queues, write-ahead logging (Journaling), and page-level compression.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wtBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#wtBg)" stroke="#059669" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">MongoDB WiredTiger Storage Engine Architecture</text>

  <!-- In-Memory Cache -->
  <rect x="60" y="90" width="340" height="220" rx="8" fill="#047857" stroke="#34d399" stroke-width="1.5"/>
  <text x="230" y="125" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="16">WiredTiger In-Memory Cache</text>
  <rect x="90" y="150" width="280" height="40" rx="4" fill="#065f46"/>
  <text x="230" y="175" text-anchor="middle" fill="#a7f3d0" font-family="monospace" font-size="12">Uncompressed BSON Pages (B+ Tree Nodes)</text>
  <rect x="90" y="210" width="280" height="40" rx="4" fill="#065f46"/>
  <text x="230" y="235" text-anchor="middle" fill="#a7f3d0" font-family="monospace" font-size="12">Dirty Eviction Queue & Hazard Pointers</text>

  <!-- Arrow -->
  <path d="M 400 200 L 490 200" stroke="#34d399" stroke-width="3" />

  <!-- Disk Storage -->
  <rect x="500" y="90" width="340" height="220" rx="8" fill="#111827" stroke="#4b5563" stroke-width="1.5"/>
  <text x="670" y="125" text-anchor="middle" fill="#f3f4f6" font-weight="700" font-size="16">Disk Subsystem (Snappy / Zstd)</text>
  <rect x="530" y="150" width="280" height="40" rx="4" fill="#1f2937"/>
  <text x="670" y="175" text-anchor="middle" fill="#9ca3af" font-family="monospace" font-size="12">WiredTiger Journal (Write-Ahead Log)</text>
  <rect x="530" y="210" width="280" height="40" rx="4" fill="#1f2937"/>
  <text x="670" y="235" text-anchor="middle" fill="#9ca3af" font-family="monospace" font-size="12">Compressed Data Block Files (.wt)</text>
</svg>

### WiredTiger Features
1. **Document-Level Concurrency:** WiredTiger uses optimistic concurrency control. Unlike older MMAPv1 storage engines that locked the entire database or collection on writes, WiredTiger locks individual documents, maximizing multi-threaded CPU throughput.
2. **Checkpointing:** Every 60 seconds (or 2 GB of journal data), WiredTiger writes a persistent checkpoint to disk, producing a consistent snapshot of all collections.
3. **Journaling:** To guarantee durability across power failures, mutations are appended to an in-memory journal buffer and flushed to disk every 50ms (`j: true`).

---

## 2. Replica Sets and High Availability Mechanics

A MongoDB **Replica Set** consists of a single Primary node and multiple Secondary nodes. The Primary receives all write operations and records them in an internal oplog (`local.oplog.rs`). Secondary nodes replicate the Primary's oplog asynchronously to apply identical operations locally.

### Raft-Like Consensus and Automated Failover
- When the Primary node fails or becomes unreachable, Secondaries initiate an automated election using a modified Raft consensus protocol.
- Secondary nodes vote based on priority and oplog freshness. The node with the most up-to-date oplog is elected as the new Primary within seconds.

---

## 3. Sharded Clusters: Horizontal Scaling

When dataset sizes surpass multi-terabyte limits or throughput demands exceed a single replica set's capabilities, MongoDB deploys **Sharded Clusters**.

```text
+-------------------------------------------------------------------------+
|                              Mongos Router                              |
+-------------------------------------------------------------------------+
                                     |
              +----------------------+----------------------+
              |                                             |
+---------------------------+                 +---------------------------+
|   Config Server Cluster   |                 |       Shard Key Range     |
| (Tracks Chunk Metadata)   |                 |    (Hash or Range-based)  |
+---------------------------+                 +---------------------------+
                                     |
              +----------------------+----------------------+
              |                                             |
+---------------------------+                 +---------------------------+
|    Shard A (Replica Set)  |                 |    Shard B (Replica Set)  |
|  Chunk Range: [0, 5000)   |                 |  Chunk Range: [5000, Max) |
+---------------------------+                 +---------------------------+
```

---

## 4. Complete PyMongo & Aggregation Pipeline Code

```python
from pymongo import MongoClient, ASCENDING, DESCENDING
from typing import Dict, Any, List

class MongoDataService:
    def __init__(self, uri: str = "mongodb://localhost:27017/", db_name: str = "analytics"):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self.orders = self.db["orders"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        self.orders.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
        self.orders.create_index([("status", ASCENDING)])

    def get_user_spending_summary(self, min_spent: float) -> List[Dict[str, Any]]:
        pipeline = [
            {"$match": {"status": "COMPLETED"}},
            {"$group": {
                "_id": "$user_id",
                "total_spent": {"$sum": "$amount"},
                "order_count": {"$sum": 1},
                "avg_order_value": {"$avg": "$amount"}
            }},
            {"$match": {"total_spent": {"$gte": min_spent}}},
            {"$sort": {"total_spent": DESCENDING}}
        ]
        return list(self.orders.aggregate(pipeline))

if __name__ == "__main__":
    service = MongoDataService()
    print("Executing Aggregation Pipeline...")
    results = service.get_user_spending_summary(100.0)
    for res in results:
        print(res)
```

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between BSON and JSON in MongoDB?
BSON is a binary serialization format that extends JSON with specific data types (such as `ObjectId`, `Date`, `BinData`, and 64-bit integers `Int64`). BSON enables fast traversal and parsing because object field lengths and array element offsets are encoded directly in the payload header.

### Q2: What is the role of the `oplog` in MongoDB replication?
The `oplog` (Operations Log) is a capped collection stored on every replica set node (`local.oplog.rs`). It records every write operation applied to the database in an idempotent format, allowing secondary nodes to stream and execute identical mutations asynchronously to stay in sync with the primary node.

### Q3: How does MongoDB select a shard key for horizontal scaling?
A good shard key must have high cardinality (many distinct values), even write distribution (avoiding monotonically increasing keys like timestamps that create hot shards), and match frequent query fields to prevent scatter-gather queries across all cluster shards.

### Q4: What is Read Concern and Write Concern in MongoDB?
Write Concern (`w: 1`, `w: "majority"`) specifies how many replica set nodes must acknowledge a write before returning success to the application. Read Concern (`"local"`, `"majority"`, `"linearizable"`) determines the isolation level and freshness of data returned by query operations.
"""

articles_A['nosql-redis'] = """# Redis Architecture: In-Memory Data Structures, Event Loop, and Persistence

Redis (Remote Dictionary Server) is an open-source, in-memory key-value data store prized for sub-millisecond execution speeds. Operating primarily on a single-threaded reactor event loop, Redis provides rich data structures (Strings, Hashes, Lists, Sets, Sorted Sets, Bitmaps, HyperLogLogs, and Streams) with deterministic time complexities.

---

## 1. Single-Threaded Event Loop Engine

Redis uses an I/O multiplexing event loop (such as `epoll` on Linux or `kqueue` on macOS) to handle tens of thousands of concurrent client connections without thread context switches or locking overheads.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="redisBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#450a0a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#redisBg)" stroke="#dc2626" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fee2e2" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Redis Single-Threaded Reactor Event Loop</text>

  <!-- Network Sockets -->
  <rect x="50" y="90" width="220" height="220" rx="8" fill="#991b1b" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="160" y="125" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="15">Client TCP Sockets</text>
  <rect x="70" y="150" width="180" height="35" rx="4" fill="#7f1d1d"/>
  <text x="160" y="173" text-anchor="middle" fill="#fecaca" font-family="monospace" font-size="11">Socket A: GET user:100</text>
  <rect x="70" y="200" width="180" height="35" rx="4" fill="#7f1d1d"/>
  <text x="160" y="223" text-anchor="middle" fill="#fecaca" font-family="monospace" font-size="11">Socket B: ZADD leaderboard</text>
  <rect x="70" y="250" width="180" height="35" rx="4" fill="#7f1d1d"/>
  <text x="160" y="273" text-anchor="middle" fill="#fecaca" font-family="monospace" font-size="11">Socket C: INCR counter</text>

  <!-- I/O Multiplexer -->
  <path d="M 270 200 L 340 200" stroke="#fca5a5" stroke-width="3" />
  <rect x="340" y="130" width="200" height="140" rx="8" fill="#b91c1c" stroke="#f87171" stroke-width="1.5"/>
  <text x="440" y="165" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="15">I/O Multiplexer (epoll)</text>
  <text x="440" y="195" text-anchor="middle" fill="#fee2e2" font-family="monospace" font-size="11">Non-Blocking Queue</text>
  <text x="440" y="225" text-anchor="middle" fill="#fee2e2" font-family="monospace" font-size="11">Fires Read/Write Events</text>

  <!-- Event Loop Execution -->
  <path d="M 540 200 L 610 200" stroke="#fca5a5" stroke-width="3" />
  <rect x="610" y="90" width="240" height="220" rx="8" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
  <text x="730" y="125" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="15">Redis Main Thread</text>
  <rect x="630" y="150" width="200" height="40" rx="4" fill="#7f1d1d"/>
  <text x="730" y="175" text-anchor="middle" fill="#fca5a5" font-family="monospace" font-size="11">Command Execution Engine</text>
  <rect x="630" y="210" width="200" height="40" rx="4" fill="#7f1d1d"/>
  <text x="730" y="235" text-anchor="middle" fill="#fca5a5" font-family="monospace" font-size="11">In-Memory Hash Dictionary</text>
</svg>

---

## 2. Persistence Engines: RDB Snapshots vs. AOF Logs

Redis provides two independent mechanisms for data persistence to disk:

| Dimension | RDB (Redis Database Snapshot) | AOF (Append-Only File) |
| :--- | :--- | :--- |
| **Mechanic** | Compact point-in-time binary snapshot of entire memory space. | Logs every write command executed by the server sequentially. |
| **Performance Impact** | Minimal during normal operation; forks a child process to write file. | Slightly higher disk I/O overhead depending on `fsync` strategy. |
| **Recovery Speed** | Extremely fast loading into RAM upon startup. | Slower startup time because commands must be replayed one by one. |
| **Data Loss Window** | Up to the snapshot interval (e.g. 5 minutes). | Minimal (typically 1 second with `appendfsync everysec`). |

---

## 3. Redis Code Implementation: Rate Limiter & Leaderboard in Python

```python
import redis
import time
from typing import List, Tuple

class RedisEngine:
    def __init__(self, host: str = 'localhost', port: int = 6379):
        self.r = redis.Redis(host=host, port=port, decode_responses=True)

    def sliding_window_rate_limiter(self, user_id: str, max_requests: int, window_seconds: int) -> bool:
        key = f"rate_limit:{user_id}"
        now = time.time()
        clear_before = now - window_seconds

        pipe = self.r.pipeline()
        pipe.zremrangebyscore(key, 0, clear_before)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window_seconds)
        results = pipe.execute()

        request_count = results[2]
        return request_count <= max_requests

    def update_leaderboard(self, player_id: str, score: float):
        self.r.zadd("game_leaderboard", {player_id: score})

    def get_top_players(self, limit: int = 10) -> List[Tuple[str, float]]:
        return self.r.zrevrange("game_leaderboard", 0, limit - 1, withscores=True)

if __name__ == "__main__":
    engine = RedisEngine()
    allowed = engine.sliding_window_rate_limiter("user_42", max_requests=5, window_seconds=60)
    print(f"Request allowed: {allowed}")
    engine.update_leaderboard("player_1", 1550.5)
    print("Top Players:", engine.get_top_players(5))
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why is Redis single-threaded yet extremely fast?
Redis execution is bounded by RAM bandwidth and network latency rather than CPU core speed. By operating on a single main thread, Redis eliminates mutex locking overhead, thread context switching, and cache line invalidation, executing operations entirely in RAM in $O(1)$ or $O(\log N)$ time.

### Q2: What is the difference between Redis eviction policies?
When RAM memory limits (`maxmemory`) are reached, Redis evicts keys according to configured policies: `noeviction` (returns error on writes), `allkeys-lru` (evicts least recently used keys across all data), `volatile-lru` (evicts LRU keys with an explicit TTL set), and `allkeys-lfu` (evicts least frequently used keys).

### Q3: How does Redis Cluster partition data?
Redis Cluster uses consistent hashing over **16,384 logical hash slots**. When a key is accessed, Redis computes `CRC16(key) % 16384` to determine which cluster node owns that hash slot.
"""

# Apply replaced content for Batch A
with open('src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
for slug, article in articles_A.items():
    content, ok = replace_de_blog_slug(content, slug, article)
    if ok:
        count += 1
        print(f"  OK   Batch A: '{slug}' ({len(article):,} chars)")
    else:
        print(f"  WARN Batch A: slot '{slug}' failed to replace")

with open('src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nBatch A complete. {count} articles updated.")
