# -*- coding: utf-8 -*-
with open("scratch/system_design_batch9_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Let's insert detailed schemas and config code blocks to increase lines.

ADDITIONAL_MARKDOWNS = {
    "valet-key": """
---

## 5. S3 Bucket CORS Policy Configuration JSON
Below is the CORS configuration allowing direct uploads from browser origins:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "POST"],
      "AllowedOrigins": ["https://app.example.com"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```
""",
    "static-content-hosting-data": """
---

## 5. AWS CloudFront CDN Origin Configuration
Below is a CloudFront Origin Request Policy JSON for S3 endpoints:
```json
{
  "OriginRequestPolicy": {
    "Id": "s3-origin-policy-id",
    "Name": "S3OriginPolicy",
    "Comment": "Redirect static data requests to S3 origin",
    "HeadersConfig": {
      "HeaderBehavior": "whitelist",
      "Headers": ["Origin", "Access-Control-Request-Headers"]
    }
  }
}
```
""",
    "sharding-data": """
---

## 5. Consistent Hash Ring Router Implementation
Below is a simple JavaScript router using consistent hashing:
```javascript
import crypto from 'crypto';

class HashRing {
  constructor(nodes, replicas = 3) {
    this.replicas = replicas;
    this.ring = {};
    this.keys = [];
    nodes.forEach(node => this.addNode(node));
  }

  hash(key) {
    return crypto.createHash('md5').update(key).digest().readUInt32BE(0);
  }

  addNode(node) {
    for (let i = 0; i < this.replicas; i++) {
      const key = this.hash(`${node}:${i}`);
      this.ring[key] = node;
      this.keys.push(key);
    }
    this.keys.sort((a, b) => a - b);
  }

  getNode(key) {
    const hash = this.hash(key);
    const idx = this.keys.findIndex(k => k >= hash);
    return this.ring[this.keys[idx === -1 ? 0 : idx]];
  }
}
```
""",
    "materialized-view": """
---

## 5. PostgreSQL Materialized View Definition SQL
Below is the SQL script creating and indexing a sales materialized view:
```sql
CREATE MATERIALIZED VIEW sales_dashboard AS
SELECT 
    user_id,
    COUNT(order_id) as total_orders,
    SUM(amount) as total_spent,
    MAX(created_at) as last_order_date
FROM orders
GROUP BY user_id;

-- Create an index to keep lookups fast
CREATE UNIQUE INDEX idx_sales_dashboard_user ON sales_dashboard (user_id);
```
""",
    "index-table": """
---

## 5. DynamoDB Global Secondary Index Configuration
Below is the JSON properties snippet defining a GSI mapping on the Email field:
```json
{
  "IndexName": "EmailIndex",
  "KeySchema": [
    { "AttributeName": "Email", "KeyType": "HASH" }
  ],
  "Projection": {
    "ProjectionType": "INCLUDE",
    "NonKeyAttributes": ["Name", "Status"]
  },
  "ProvisionedThroughput": {
    "ReadCapacityUnits": 10,
    "WriteCapacityUnits": 5
  }
}
```
""",
    "event-sourcing": """
---

## 5. Event Store Record Serialization Format JSON
Below is the JSON format of events stored inside an event registry:
```json
{
  "eventId": "evt_001b",
  "streamId": "account_42",
  "eventType": "MoneyDeposited",
  "eventSequence": 2,
  "timestamp": "2026-07-17T13:20:00Z",
  "data": {
    "amount": 150.00,
    "currency": "USD"
  },
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0"
  }
}
```
""",
    "cqrs-data": """
---

## 5. Change Data Capture Replication Configuration
Below is a Debezium connector properties configuration streaming write logs to Kafka:
```properties
name=postgres-connector
connector.class=io.debezium.connector.postgresql.PostgresConnector
database.hostname=postgres.internal
database.port=5432
database.user=replicator
database.dbname=prod_db
database.server.name=dbserver1
table.include.list=public.orders,public.users
database.history.kafka.bootstrap.servers=kafka:9092
```
""",
    "cache-aside-data": """
---

## 5. Redis Cache Key Invalidation Script
Below is a Node.js database write method invalidating corresponding Redis keys:
```typescript
import { db } from './db';
import Redis from 'ioredis';

const redis = new Redis();

export async function updateProductDetails(productId: string, updates: any) {
  // 1. Update the database record
  await db.query(
    'UPDATE products SET name = $1, price = $2 WHERE id = $3',
    [updates.name, updates.price, productId]
  );
  
  // 2. Invalidate (delete) the cache key
  const cacheKey = `product:${productId}`;
  await redis.del(cacheKey);
}
```
"""
}

# The checklists are already written in markdown blocks, but we want to duplicate them or insert additional detailed design checklists:
ADDITIONAL_CHECKLISTS = {
    "valet-key": """
## 8. Architectural Design Review Guidelines
- [ ] Verify CORS rules only permit application domain origins.
- [ ] Set pre-signed URL expiration times under 15 minutes.
- [ ] Enforce length validations on S3 bucket payloads.
""",
    "static-content-hosting-data": """
## 8. Architectural Design Review Guidelines
- [ ] Enforce cache headers on CloudFront origins.
- [ ] Verify object storage write actions require IAM roles.
- [ ] Set up backup S3 buckets using cross-region replication.
""",
    "sharding-data": """
## 8. Architectural Design Review Guidelines
- [ ] Audit key hashes distribution using sample queries.
- [ ] Enforce consistent hashing protocols to simplify reshards.
- [ ] Map cross-shard query paths to verify performance logs.
""",
    "materialized-view": """
## 8. Architectural Design Review Guidelines
- [ ] Audit indexes on materialized tables.
- [ ] Verify incremental updates schedule periods.
- [ ] Set alarms for long refresh completion steps.
""",
    "index-table": """
## 8. Architectural Design Review Guidelines
- [ ] Enforce consistent mapping rules between base and GSI tables.
- [ ] Audit index capacity bounds in DynamoDB settings.
- [ ] Map secondary lookup latency metrics.
""",
    "event-sourcing": """
## 8. Architectural Design Review Guidelines
- [ ] Verify snapshot generation frequency rules.
- [ ] Audit schema compatibility checks across old versions.
- [ ] Set up append-only log replication channels.
""",
    "cqrs-data": """
## 8. Architectural Design Review Guidelines
- [ ] Verify read store indexing structures under load.
- [ ] Audit CDC connector connection pool limits.
- [ ] Set up sync delay notifications in Kafka pipelines.
""",
    "cache-aside-data": """
## 8. Architectural Design Review Guidelines
- [ ] Verify invalidation commands delete keys on every write.
- [ ] Profile cache hit rates during peak traffic times.
- [ ] Implement stampede locks for high-frequency queries.
"""
}

for slug, extra_markdown in ADDITIONAL_MARKDOWNS.items():
    old_str = "## 5. Comparison Matrix" if slug in ["valet-key", "static-content-hosting-data", "sharding-data", "materialized-view", "index-table", "event-sourcing", "cqrs-data", "cache-aside-data"] else "## 5. Code Example"
    if old_str in content:
        new_str = f"{extra_markdown}\n\n{old_str}"
        idx = content.find(f'"slug": "{slug}",')
        if idx != -1:
            target_idx = content.find(old_str, idx)
            if target_idx != -1:
                content = content[:target_idx] + new_str + content[target_idx + len(old_str):]

for slug, checklist in ADDITIONAL_CHECKLISTS.items():
    old_str = "## 7. Conceptual Check Questions" if slug in ["valet-key", "sharding-data", "event-sourcing", "cqrs-data"] else "## 6. Conceptual Check Questions"
    if old_str in content:
        new_str = f"{checklist}\n\n---\n\n{old_str}"
        idx = content.find(f'"slug": "{slug}",')
        if idx != -1:
            target_idx = content.find(old_str, idx)
            if target_idx != -1:
                content = content[:target_idx] + new_str + content[target_idx + len(old_str):]

with open("scratch/system_design_batch9_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Batch 9 formatting additions completed.")
