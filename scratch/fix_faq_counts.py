import re

with open('./src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. orch-kubernetes: add Q5
q_k8s = r"""### Q5: How do Taints and Tolerations differ from Node Affinity?
Node Affinity attracts Pods to specific nodes based on node labels. Taints allow a node to repel Pods unless the Pod explicitly defines a matching Toleration (e.g. reserving GPU nodes exclusively for machine learning workloads)."""

# 2. realtime-sse: add Q4 and Q5
q_sse = r"""### Q4: How does automatic reconnection work in SSE?
If the connection drops, the browser `EventSource` API automatically attempts reconnection after a timeout interval, sending the `Last-Event-ID` header so the server can resume missed events from the exact point of failure.

### Q5: What browser connection limit affects SSE under HTTP/1.1?
Under HTTP/1.1, web browsers enforce a maximum limit of 6 open SSE connections per domain. Upgrading the web server to HTTP/2 eliminates this bottleneck via multiplexing multiple streams over a single TCP connection."""

# 3. scale-db-indexes: add Q4 and Q5
q_idx = r"""### Q4: When should you use a GIN (Generalized Inverted Index) in PostgreSQL?
Use GIN indexes for composite data types like `JSONB` document keys, full-text search vectors, or array columns where a single row contains multiple elements.

### Q5: What is a Covering Index?
A Covering Index is an index that includes all columns requested by a SQL query in the index itself, allowing the database engine to perform an Index-Only Scan without reading the underlying table data pages."""

# 4. nosql-mongodb: add Q2, Q3, Q4, Q5
q_mongo = r"""### Q2: How does MongoDB Replica Set leader election work?
MongoDB replica sets use a Raft-like consensus algorithm. If the primary node fails or loses network connectivity, secondary nodes automatically elect a new primary within seconds.

### Q3: What is the default WiredTiger Cache size limit?
By default, WiredTiger allocates 50% of available system RAM minus 1 GB (or 256 MB, whichever is greater) for its in-memory page cache.

### Q4: What is the maximum size limit of a single MongoDB document?
The maximum BSON document size limit is **16 Megabytes**. For storing larger files like images or videos, MongoDB provides GridFS to partition files into chunks.

### Q5: How do Aggregation Pipelines work in MongoDB?
Aggregation pipelines process document streams sequentially through pipeline stages (`$match`, `$group`, `$project`, `$sort`, `$unwind`), enabling complex analytics directly inside the database engine."""

# 5. nosql-redis: add Q5
q_redis = r"""### Q5: What is the difference between Redis Sentinel and Redis Cluster?
Redis Sentinel provides high-availability monitoring, automatic failover, and master-replica promotion. Redis Cluster provides distributed horizontal data sharding across up to 1000 nodes without a central proxy."""

# Fix orch-kubernetes
if '### Q5: How do Taints and Tolerations differ' not in content:
    content = content.replace("### Q4: What happens during a Pod OOMKilled error?\nWhen a container exceeds its defined `limits.memory`, the Linux kernel OOM killer terminates the container process. `kubelet` detects the termination and triggers the Pod's `restartPolicy`.\n\"\"\"", f"### Q4: What happens during a Pod OOMKilled error?\nWhen a container exceeds its defined `limits.memory`, the Linux kernel OOM killer terminates the container process. `kubelet` detects the termination and triggers the Pod's `restartPolicy`.\n\n{q_k8s}\n\"\"\"")

# Fix realtime-sse
if '### Q4: How does automatic reconnection work' not in content:
    content = content.replace("### Q3: What HTTP headers are required for an SSE response?\n`Content-Type: text/event-stream`, `Cache-Control: no-cache`, and `Connection: keep-alive`.", f"### Q3: What HTTP headers are required for an SSE response?\n`Content-Type: text/event-stream`, `Cache-Control: no-cache`, and `Connection: keep-alive`.\n\n{q_sse}")

# Fix scale-db-indexes
if '### Q4: When should you use a GIN' not in content:
    content = content.replace("### Q3: Why do indexes slow down write operations (`INSERT`, `UPDATE`, `DELETE`)?\nEvery write requires the database engine to update the target table data page AND re-balance all associated index B+Trees.", f"### Q3: Why do indexes slow down write operations (`INSERT`, `UPDATE`, `DELETE`)?\nEvery write requires the database engine to update the target table data page AND re-balance all associated index B+Trees.\n\n{q_idx}")

# Fix nosql-mongodb
if '### Q2: How does MongoDB Replica Set' not in content:
    content = content.replace("### Q1: What is BSON in MongoDB?\nBSON (Binary JSON) is the binary serialization format MongoDB uses to store documents. It adds data types like `Date`, `ObjectId`, and `BinData` to standard JSON.", f"### Q1: What is BSON in MongoDB?\nBSON (Binary JSON) is the binary serialization format MongoDB uses to store documents. It adds data types like `Date`, `ObjectId`, and `BinData` to standard JSON.\n\n{q_mongo}")

# Fix nosql-redis
if '### Q5: What is the difference between Redis Sentinel' not in content:
    content = content.replace("### Q4: What happens when Redis reaches its `maxmemory` limit?\nRedis applies configured eviction policies (`allkeys-lru`, `volatile-lru`, `noeviction`).", f"### Q4: What happens when Redis reaches its `maxmemory` limit?\nRedis applies configured eviction policies (`allkeys-lru`, `volatile-lru`, `noeviction`).\n\n{q_redis}")

with open('./src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("FAQ counts updated.")
