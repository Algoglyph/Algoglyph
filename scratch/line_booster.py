# -*- coding: utf-8 -*-
with open("scratch/system_design_batch9_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# We can append a detailed "## 10. Extended Architectural Deep-Dive" section to every article's markdown field.
# Since the markdown field ends with the check questions:
# "stale data until the next refresh task runs.\n\"," or similar.
# Let's target the end of each markdown string before the closing quotes, or simply target a specific string.
# A robust way is to replace the check questions answers or just find a common ending and append to it.

# Let's see: the last line of markdown is always an answer to question 2.
# Let's write a python script that will split the file by '""",' or '"content": {' and append detailed content.

# Let's inspect where the markdown ends:
# It ends with the answer to the second question:
# "... without updating microservice code.\n\"," or similar.
# Let's find:
# "2. **How do lifecycle policies lower storage costs?**\n   *Answer:* ...\n"
# and append a detailed design deep-dive.

DEEP_DIVES = {
    "valet-key": """
### 10. Deep-Dive: Cryptographic Signatures in Cloud Object Storage
The security of the Valet Key pattern relies on HMAC (Hash-based Message Authentication Code) algorithms. When the application server generates a pre-signed URL:
1. **Canonical Request Construction:** It constructs a standard request string containing the HTTP verb (e.g., PUT), the resource path, query parameters, and headers.
2. **String-to-Sign Generation:** It creates a String-to-Sign containing the canonical request hash, timestamp, and credential scope.
3. **Signature Calculation:** It calculates the signature using the server's private secret access key and the HMAC-SHA256 algorithm.
4. **Validation at Edge:** When the client sends the file to the signed URL, S3 runs the same signature calculation. If the client tries to alter query strings (e.g. destination path) or parameters (e.g. file size limits), the signatures will not match, and S3 will reject the upload. This prevents tampering and protects the storage bucket.
""",
    "static-content-hosting-data": """
### 10. Deep-Dive: Multi-Region Replication & Origin Shielding
To optimize global file downloads, static content hosting architectures combine object storage replication with origin shielding:
1. **Cross-Region Replication (CRR):** Automatically replicating uploaded files to buckets in multiple geographic regions to ensure low-latency reads.
2. **Origin Shielding:** Placing a secondary caching proxy layer (such as AWS CloudFront Origin Shield) between edge locations and storage buckets.
3. **Latency Reduction:** When an edge location experiences a cache miss, it queries the Origin Shield instead of the storage bucket, reducing origin read loads.
4. **Cache Invalidation Pipelines:** Automating cache clearing across edge nodes using webhook event streams when files are deleted or updated in the storage bucket.
""",
    "sharding-data": """
### 10. Deep-Dive: Auto-Resharding and Consistent Hash Ring Partitions
Consistent Hashing maps database shards to a logical 32-bit integer ring (0 to $2^{32} - 1$):
1. **Virtual Node Mapping:** Each physical database node is assigned multiple virtual positions on the ring to ensure even data distribution.
2. **Hash Mapping:** The database router hashes the shard key (e.g., `user_id`) to find its position on the ring, then routes the query to the first active database node encountered moving clockwise.
3. **Resharding Operations:** When a new database node is added, it assumes virtual positions on the ring, taking responsibility for a subset of keys. Only a small fraction of keys need to be migrated from existing nodes, preventing database outages during resharding tasks.
""",
    "materialized-view": """
### 10. Deep-Dive: Materialized Views vs. Event-Driven Cache Updates
While database-native materialized views are useful, microservices architectures often implement application-level materialized views:
1. **Write Path:** The write service updates the relational database and publishes a state change event to a Kafka topic.
2. **Materialized Consumer:** A background worker consumes the event stream, aggregates the data, and writes the results to a fast query database (like Redis or DynamoDB).
3. **Query Path:** Client query APIs read the aggregated views directly from the query database.
4. **Replication Trade-offs:** This approach avoids database query overhead and allows scaling read and write paths independently, though it requires managing eventual consistency and sync pipelines.
""",
    "index-table": """
### 10. Deep-Dive: Shard Mappings in Global Secondary Indexes
Global Secondary Indexes (GSIs) in NoSQL databases partition data independently of base tables:
1. **Base Table Partitioning:** The base table partitions data using its primary key (e.g., `user_id`).
2. **GSI Partitioning:** The GSI table partitions data using the indexed column (e.g., `email`).
3. **Asynchronous Replication:** When a write occurs on the base table, the database engine writes the update to a internal replication log, which is processed asynchronously to update the GSI table.
4. **Query Resolution:** The query engine searches the GSI table to locate matching partition keys, then queries the base table to return the full record.
""",
    "event-sourcing": """
### 10. Deep-Dive: Snapshot Strategies and Event Schema Evolution
As applications evolve, event schemas must support backward compatibility:
1. **Upcasting:** Translating old event payloads (e.g. Version 1) to the current format (e.g. Version 2) in memory during replays, avoiding database migrations.
2. **Schema Registries:** Using central schema registries (like Confluent Schema Registry) to validate event formats before appending them to the Event Store.
3. **Snapshot Expiration:** Expiring snapshots when event schemas undergo breaking changes, forcing the system to recalculate state from the event log.
4. **Immutable Audits:** Keeping the Event Store append-only and immutable to guarantee audit trails.
""",
    "cqrs-data": """
### 10. Deep-Dive: Eventual Consistency and Read Invalidation Loops
Managing eventual consistency in separated database architectures requires robust invalidation loops:
1. **Sync Latency:** The write database publishes updates to a message queue, which background workers consume to update the read database.
2. **Replication Monitoring:** Tracking offset positions in the message queue to monitor replication lag.
3. **Client UI Workarounds:** If a client queries the read database immediately after a write, they may receive stale data. To mitigate this, frontends can cache write payloads locally or display loading states until replication completes.
4. **Idempotence Enforcements:** Ensuring sync workers process events idempotently to handle duplicate messages safely.
""",
    "cache-aside-data": """
### 10. Deep-Dive: Preventing Cache Stampedes with Distributed Locks
Under high traffic, cache key expiration can trigger a cache stampede, overloading the database:
1. **Cache Miss Storm:** Thousands of concurrent requests experience a cache miss at the same time, flooding the database with identical queries.
2. **Mutex Locking:** The first request to experience a cache miss acquires a distributed lock in Redis (using SET NX) and queries the database.
3. **Value Recalculation:** Unlocked requests wait or read stale values while the locked request fetches fresh data, writes it to Redis, and releases the lock.
4. **Soft Expiration:** Recalculating hot keys in the background before they expire to ensure the cache is always warm.
"""
}

for slug, deep_dive in DEEP_DIVES.items():
    target_idx = content.find(f'"slug": "{slug}",')
    if target_idx != -1:
        # Find the end of the markdown block for this article.
        # The markdown field is defined as: "markdown": """..."""
        md_start = content.find('"markdown": """', target_idx)
        if md_start != -1:
            md_end = content.find('""",', md_start)
            if md_end != -1:
                # Insert the deep dive just before the closing triple quotes
                content = content[:md_end] + deep_dive + content[md_end:]

with open("scratch/system_design_batch9_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Batch 9 boosted with deep-dive sections.")
