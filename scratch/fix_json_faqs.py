import json

# 1. Fix batch_1.json (orch-kubernetes)
with open('./scratch/batch_1.json', 'r', encoding='utf-8') as f:
    b1 = json.load(f)

if '### Q5:' not in b1['orch-kubernetes']:
    b1['orch-kubernetes'] += """\n\n### Q5: How do Taints and Tolerations differ from Node Affinity?
Node Affinity attracts Pods to specific nodes based on node labels. Taints allow a node to repel Pods unless the Pod explicitly defines a matching Toleration (e.g. reserving GPU nodes exclusively for machine learning workloads)."""

with open('./scratch/batch_1.json', 'w', encoding='utf-8') as f:
    json.dump(b1, f, indent=2, ensure_ascii=False)


# 2. Fix batch_2.json (realtime-sse)
with open('./scratch/batch_2.json', 'r', encoding='utf-8') as f:
    b2 = json.load(f)

if '### Q4:' not in b2['realtime-sse']:
    b2['realtime-sse'] += """\n\n### Q4: How does automatic reconnection work in SSE?
If the connection drops, the browser EventSource API automatically attempts reconnection after a timeout interval, sending the Last-Event-ID header so the server can resume missed events from the exact point of failure.

### Q5: What browser connection limit affects SSE under HTTP/1.1?
Under HTTP/1.1, web browsers enforce a maximum limit of 6 open SSE connections per domain. Upgrading the web server to HTTP/2 eliminates this bottleneck via multiplexing multiple streams over a single TCP connection."""

with open('./scratch/batch_2.json', 'w', encoding='utf-8') as f:
    json.dump(b2, f, indent=2, ensure_ascii=False)


# 3. Fix batch_3.json (scale-db-indexes)
with open('./scratch/batch_3.json', 'r', encoding='utf-8') as f:
    b3 = json.load(f)

if '### Q4:' not in b3['scale-db-indexes']:
    b3['scale-db-indexes'] += """\n\n### Q4: When should you use a GIN (Generalized Inverted Index) in PostgreSQL?
Use GIN indexes for composite data types like JSONB document keys, full-text search vectors, or array columns where a single row contains multiple elements.

### Q5: What is a Covering Index?
A Covering Index is an index that includes all columns requested by a SQL query in the index itself, allowing the database engine to perform an Index-Only Scan without reading the underlying table data pages."""

with open('./scratch/batch_3.json', 'w', encoding='utf-8') as f:
    json.dump(b3, f, indent=2, ensure_ascii=False)


# 4. Fix batch_4.json (nosql-mongodb, nosql-redis)
with open('./scratch/batch_4.json', 'r', encoding='utf-8') as f:
    b4 = json.load(f)

if '### Q2:' not in b4['nosql-mongodb']:
    b4['nosql-mongodb'] += """\n\n### Q2: How does MongoDB Replica Set leader election work?
MongoDB replica sets use a Raft-like consensus algorithm. If the primary node fails or loses network connectivity, secondary nodes automatically elect a new primary within seconds.

### Q3: What is the default WiredTiger Cache size limit?
By default, WiredTiger allocates 50% of available system RAM minus 1 GB (or 256 MB, whichever is greater) for its in-memory page cache.

### Q4: What is the maximum size limit of a single MongoDB document?
The maximum BSON document size limit is 16 Megabytes. For storing larger files like images or videos, MongoDB provides GridFS to partition files into chunks.

### Q5: How do Aggregation Pipelines work in MongoDB?
Aggregation pipelines process document streams sequentially through pipeline stages ($match, $group, $project, $sort, $unwind), enabling complex analytics directly inside the database engine."""

if '### Q5:' not in b4['nosql-redis']:
    b4['nosql-redis'] += """\n\n### Q5: What is the difference between Redis Sentinel and Redis Cluster?
Redis Sentinel provides high-availability monitoring, automatic failover, and master-replica promotion. Redis Cluster provides distributed horizontal data sharding across up to 1000 nodes without a central proxy."""

with open('./scratch/batch_4.json', 'w', encoding='utf-8') as f:
    json.dump(b4, f, indent=2, ensure_ascii=False)

print("Batch JSON files updated with 5 FAQs each.")
