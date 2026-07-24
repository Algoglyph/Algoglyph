# -*- coding: utf-8 -*-
import json

ARTICLES_B5 = {
    'nosql-neo4j': r"""# Neo4j Architecture: Property Graphs, Cypher Query Language & Index-Free Adjacency

![Neo4j](/images/backend/nosql-neo4j-dark.png)

## 1. System Overview & Graph Mechanics

Neo4j is a native graph database designed to store, manage, and query highly connected data nodes and relationships.

Key Foundation: **Index-Free Adjacency**. Unlike relational databases that perform expensive $O(\log N)$ or $O(N)$ index JOINs during runtime, every node in Neo4j stores physical memory pointers directly to its adjacent neighbor nodes.

Graph Traversal Time:
$$\text{Traversal Complexity} \approx \mathcal{O}(k) \quad (\text{Proportional to number of adjacent relationships } k \text{ traversed, independent of total database size } N!)$$

---

## 2. Index-Free Adjacency Pointer Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="14" font-family="sans-serif" font-weight="bold">Neo4j Index-Free Adjacency Memory Pointers</text>

  <g transform="translate(40, 60)">
    <rect width="150" height="120" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="75" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Node: User (Alice)</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• Next Rel Pointer ➔</text>

    <rect x="200" y="20" width="160" height="80" rx="4" fill="#18181b" stroke="#10b981"/>
    <text x="280" y="45" fill="#34d399" font-size="11" text-anchor="middle" font-family="monospace">Rel: FRIENDS_WITH</text>
    <text x="215" y="70" fill="#a1a1aa" font-size="9" font-family="monospace">Direct Memory Address</text>

    <rect x="400" y="0" width="150" height="120" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="475" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Node: User (Bob)</text>
  </g>
</svg>
```

---

## 3. Production Cypher Query Language Code

```cypher
// Find 2nd-degree connections (Friends of Friends) with purchasing recommendations
MATCH (u:User {id: "USR-9021"})-[:FRIENDS_WITH]->(f:User)-[:PURCHASED]->(p:Product)
WHERE NOT (u)-[:PURCHASED]->(p)
RETURN p.title AS RecommendedProduct, COUNT(p) AS Score
ORDER BY Score DESC
LIMIT 10;
```
""",

    'nosql-neptune': r"""# AWS Neptune Architecture: Property Graphs, RDF / SPARQL & Serverless Storage Replication

![AWS Neptune](/images/backend/nosql-neptune-dark.png)

## 1. System Overview

AWS Neptune is a fully managed graph database engine supporting both Property Graph (Apache TinkerPop Gremlin) and W3C Resource Description Framework (RDF / SPARQL) models.
""",

    'nosql-dgraph': r"""# Dgraph Architecture: GraphQL-Native, Distributed Raft Consensus & BadgerDB Storage

![Dgraph](/images/backend/nosql-dgraph-dark.png)

## 1. System Overview

Dgraph is an open-source, distributed, GraphQL-native graph database written in Go, powered by BadgerDB key-value engine and Raft consensus.
""",

    'nosql-influxdb': r"""# InfluxDB Architecture: Time-Series Engine, TSM (Time-Structured Merge) Files & Flux Querying

![InfluxDB](/images/backend/nosql-influxdb-dark.png)

## 1. System Overview & Time-Series Mechanics

InfluxDB is a custom-built time-series database designed to handle high write volume of timestamped data metrics (IoT, monitoring, financial tick streams).

Powered by the **Time-Structured Merge (TSM)** engine, InfluxDB compresses timestamped floating-point values using Gorilla floating-point XOR compression.

---

## 2. Gorilla XOR Compression Mathematics

For a sequence of timestamp values $(t_1, v_1), (t_2, v_2), \dots$:

$$\Delta t_i = t_i - t_{i-1}, \quad \Delta^2 t_i = \Delta t_i - \Delta t_{i-1}$$
$$\text{XOR Value} = v_i \oplus v_{i-1}$$

Compression Ratio:
$$\text{Gorilla Compression} \implies 1.37\text{ bytes per value} \quad (\sim 10\text{x reduction over 64-bit raw floats!})$$

---

## 3. Production Python InfluxDB Write Code

```python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

client = InfluxDBClient(url="http://localhost:8086", token="my-token", org="my-org")
write_api = client.write_api(write_options=SYNCHRONOUS)

point = Point("cpu_usage") \
    .tag("host", "server-01") \
    .field("usage_percent", 78.4)

write_api.write(bucket="metrics", record=point)
print("Metric successfully written to InfluxDB TSM engine.")
```
""",

    'nosql-timescaledb': r"""# TimescaleDB Architecture: PostgreSQL Hypertables, Automatic Chunking & Columnar Compression

![TimescaleDB](/images/backend/nosql-timescaledb-dark.png)

## 1. System Overview

TimescaleDB is an open-source time-series database packaged as a PostgreSQL extension. It presents data as unified **Hypertables** while transparently partitioning data into underlying time/space chunks.
""",

    'scale-obs-core': r"""# Observability Core Concepts: Metrics, Logs, Traces (The Three Pillars) & Cardinality Explosion

![Observability Core](/images/backend/scale-obs-core-dark.png)

## 1. System Overview & The Three Pillars

Observability measures how well the internal state of a distributed system can be inferred solely from its external outputs.

The Three Pillars of Observability:
1. **Metrics**: Aggregatable numerical measurements over time intervals (Counter, Gauge, Histogram).
2. **Logs**: Timestamped text records of discrete software events.
3. **Traces**: End-to-end execution paths of requests across distributed microservice boundaries (Trace ID, Span ID).

---

## 2. The Three Pillars Topology

```svg
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="14" font-family="sans-serif" font-weight="bold">The Three Pillars of Observability</text>

  <g transform="translate(40, 60)">
    <rect width="150" height="120" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="75" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Metrics</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• Prometheus / OpenTelemetry</text>

    <rect x="185" y="0" width="150" height="120" rx="6" fill="#18181b" stroke="#10b981"/>
    <text x="260" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Logs</text>
    <text x="200" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• Fluentd / ELK / Vector</text>

    <rect x="370" y="0" width="150" height="120" rx="6" fill="#18181b" stroke="#a855f7"/>
    <text x="445" y="25" fill="#c084fc" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Traces</text>
    <text x="385" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• Jaeger / Zipkin / OTEL</text>
  </g>
</svg>
```

---

## 3. Metric Cardinality Explosion Mathematics

Metric Time-Series Series Count $S$:

$$S = \prod_{i=1}^{k} |\text{Label}_i|$$

If a metric has 3 labels: `http_status` (5 values), `region` (4 values), and `user_id` ($1,000,000$ values):
$$S = 5 \times 4 \times 1,000,000 = 20,000,000 \quad \text{Time Series}$$

High cardinality causes memory exhaustion in TSDB storage engines! Avoid raw user IDs in metric labels.
""",

    'scale-obs-instrumentation': r"""# OpenTelemetry Instrumentation: Auto-Instrumentation, OTLP Protocol & Collector Architecture

![Instrumentation](/images/backend/scale-obs-instrumentation-dark.png)

## 1. System Overview

OpenTelemetry (OTel) is a vendor-neutral, CNCF observability framework providing a single set of APIs, SDKs, and tooling to generate, collect, and export telemetry data (metrics, logs, traces).
"""
}

with open('./scratch/b5_data.json', 'w', encoding='utf-8') as f:
    json.dump(ARTICLES_B5, f, ensure_ascii=False)

print("Batch 5 saved successfully!")
