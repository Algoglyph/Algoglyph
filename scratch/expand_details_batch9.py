# -*- coding: utf-8 -*-
with open("scratch/system_design_batch9_data.py", "r", encoding="utf-8") as f:
    content = f.read()

EXPANSIONS = {
    "valet-key": """
---

## 9. System Design Interview Case Study: Secure Video Hosting
* **Scenario:** The client requests to design a secure video sharing platform where users can upload private video files up to 2GB.
* **Problem:** Routing 2GB file uploads through backend application servers saturates connections, triggers socket timeouts, and consumes disk space.
* **Solution:** 
  1. The client sends metadata (file size, type, checksum) to the API Gateway.
  2. The Gateway routes this to a Token Service, which checks permissions and requests a pre-signed upload URL from AWS S3.
  3. The S3 URL is returned to the client with a 15-minute expiration limit.
  4. The client performs a multi-part upload directly to S3.
  5. S3 triggers an event to a Lambda function upon completion, which updates the database and schedules a transcoding worker.
""",
    "static-content-hosting-data": """
---

## 9. System Design Interview Case Study: Image Resizing at the Edge
* **Scenario:** Design a profile image hosting system that supports different dimensions (thumbnail, mobile avatar, desktop banner).
* **Problem:** Generating and storing every possible resolution in advance consumes significant storage space and requires complex image processing pipelines.
* **Solution:**
  1. Store only the raw, high-resolution source images in a secure S3 object storage bucket.
  2. Configure an Amazon CloudFront CDN distribution in front of the bucket.
  3. Configure a CDN Serverless Function (e.g. CloudFront Functions or Lambda@Edge) to intercept requests for dimensions (e.g. `/images/user42.jpg?w=150&h=150`).
  4. If the requested resolution exists in the CDN cache, return it instantly.
  5. On a cache miss, the edge function fetches the source image from S3, resizes it dynamically in memory, caches the result, and returns it.
""",
    "sharding-data": """
---

## 9. System Design Interview Case Study: Scaling User Databases
* **Scenario:** Design a database architecture for a social network with 500 million active users.
* **Problem:** A single relational database instance cannot handle the query volume and index size, resulting in database lockouts.
* **Solution:**
  1. Shard the database horizontally using a consistent hashing ring on the `user_id` partition key.
  2. Map virtual shards to physical nodes to distribute workloads.
  3. Queries containing the `user_id` are routed directly to the target shard node.
  4. For queries that do not contain the shard key (e.g. search by email), query a secondary index table to resolve the user ID, avoiding full-table scans.
""",
    "materialized-view": """
---

## 9. System Design Interview Case Study: Real-Time Leaderboards
* **Scenario:** Design a leaderboard system for a gaming application with millions of daily players.
* **Problem:** Calculating scores, ranks, and player statistics on every request requires scanning millions of match record rows, saturating database CPU cores.
* **Solution:**
  1. Store match results in transactional database tables.
  2. Create a materialized view that aggregates player scores and ranks.
  3. Configure the database to perform incremental refreshes of the materialized view table every 5 minutes.
  4. Route client leaderboard requests to the pre-calculated materialized table, keeping latency below 5ms.
""",
    "index-table": """
---

## 9. System Design Interview Case Study: E-Commerce Product Searches
* **Scenario:** Design a product catalog search engine using a NoSQL key-value database (like DynamoDB).
* **Problem:** Storing catalog details by `product_id` is fast, but filtering products by `category`, `price`, or `brand` requires slow full-table scans.
* **Solution:**
  1. Create Global Secondary Indexes (GSIs) for `category` and `brand` keys.
  2. DynamoDB automatically replicates changes from the product catalog table to the GSI tables asynchronously.
  3. Route search queries to the GSIs to retrieve matching product IDs.
  4. Fetch the full catalog details from the primary table using the product IDs.
""",
    "event-sourcing": """
---

## 9. System Design Interview Case Study: Order Management Systems
* **Scenario:** Design a resilient order tracking system for an e-commerce platform.
* **Problem:** Overwriting database rows makes tracing issues and debugging state errors difficult during payment failures.
* **Solution:**
  1. Record every step of the order lifecycle (e.g., `OrderPlaced`, `PaymentReceived`, `OrderShipped`) as an immutable event.
  2. Append these events sequentially to an Event Store database.
  3. Replay the event logs to calculate the current order state.
  4. Generate snapshots after every 50 events to optimize state loading during traffic surges.
""",
    "cqrs-data": """
---

## 9. System Design Interview Case Study: Scaling Ride-Sharing Telemetry
* **Scenario:** Design a telemetry tracking system for a ride-sharing application (like Uber) that handles millions of active drivers.
* **Problem:** Driver location updates flood the database, saturating write pools and slowing down rider search queries.
* **Solution:**
  1. Separate the write and read pipelines.
  2. Route driver location writes to a fast in-memory database (like Redis).
  3. Stream location updates to a Kafka queue using Change Data Capture.
  4. Consolidate locations in a read-optimized geospatial database (like ClickHouse) to serve rider searches.
""",
    "cache-aside-data": """
---

## 9. System Design Interview Case Study: Caching Product Details
* **Scenario:** Design a product catalog search engine for an e-commerce platform with a high read-to-write ratio.
* **Problem:** Fetching product details from the database on every request saturates resources, increasing page load times.
* **Solution:**
  1. Implement a Cache-Aside pattern.
  2. Configure the application to query a Redis cache first.
  3. On a cache miss, fetch product details from the primary database, write the result to Redis, and return it.
  4. Delete corresponding cache keys during product updates to prevent stale data.
"""
}

for slug, expansion in EXPANSIONS.items():
    old_str = "## 8. Architectural Design Review Guidelines"
    if old_str in content:
        new_str = f"{old_str}\n{expansion}"
        idx = content.find(f'"slug": "{slug}",')
        if idx != -1:
            target_idx = content.find(old_str, idx)
            if target_idx != -1:
                content = content[:target_idx] + new_str + content[target_idx + len(old_str):]

with open("scratch/system_design_batch9_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Batch 9 expansions complete.")
