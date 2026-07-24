import json
import sys

b5_articles = {}

# 29. Neo4j
b5_articles['nosql-neo4j'] = r"""# Neo4j Architecture: Property Graph Data Model, Cypher & Index-Free Adjacency

Neo4j is an open-source graph database management system designed to store and query highly interconnected graph networks (nodes, relationships, and properties). It achieves millisecond multi-hop graph traversal using **Index-Free Adjacency**.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="neoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#neoBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Neo4j Index-Free Adjacency Pointer Navigation</text>

  <circle cx="200" cy="180" r="45" fill="#0284c7"/><text x="200" y="185" text-anchor="middle" fill="#fff" font-weight="700">(:Person)</text>
  <circle cx="700" cy="180" r="45" fill="#059669"/><text x="700" y="185" text-anchor="middle" fill="#fff" font-weight="700">(:Product)</text>

  <path d="M 245 180 L 655 180" stroke="#38bdf8" stroke-width="3"/>
  <text x="450" y="165" text-anchor="middle" fill="#38bdf8" font-weight="700" font-size="14">-[:PURCHASED {date: '2026'}]-></text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is Index-Free Adjacency in Neo4j?
Index-Free Adjacency means every node holds direct memory pointers to its neighboring nodes and relationships, allowing $O(1)$ relationship traversal without global index lookups.

### Q2: What query language does Neo4j use?
Neo4j uses **Cypher**, a declarative graph query language using pattern matching syntax like `(a:Person)-[:FRIEND_OF]->(b:Person)`.

### Q3: How do graph databases differ from relational databases with foreign keys?
Relational databases calculate graph connections using expensive SQL `JOIN` operations across tables at query time. Graph databases persist direct pointers between nodes.

### Q4: Does Neo4j support ACID transactions?
Yes, Neo4j is fully ACID-compliant for write operations across graph nodes and relationships.

### Q5: What is the difference between Neo4j Community and Enterprise?
Neo4j Enterprise supports distributed clustering, multi-database management, read replicas, and advanced security controls.
"""

# 30. Neptune
b5_articles['nosql-neptune'] = r"""# AWS Neptune: Managed Graph Database, Gremlin & SPARQL

Amazon Neptune is a fully managed graph database service built for high-throughput graph applications. It supports both Property Graph models (using Apache TinkerPop Gremlin) and W3C Resource Description Framework (RDF) models (using SPARQL).

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nepBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#nepBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">AWS Neptune Dual Graph Model Support (Property Graph & RDF)</text>

  <rect x="100" y="110" width="300" height="160" rx="8" fill="#d97706"/>
  <text x="250" y="150" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Property Graph Model</text>
  <text x="250" y="190" text-anchor="middle" fill="#ffedd5" font-size="13">Queried via Apache Gremlin / openCypher</text>

  <rect x="500" y="110" width="300" height="160" rx="8" fill="#2563eb"/>
  <text x="650" y="150" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">W3C RDF Graph Model</text>
  <text x="650" y="190" text-anchor="middle" fill="#dbeafe" font-size="13">Queried via SPARQL Protocol</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What graph models does AWS Neptune support?
AWS Neptune natively supports both Property Graphs (Gremlin and openCypher) and W3C RDF Triples (SPARQL).

### Q2: How does Neptune handle storage scaling?
Neptune uses a shared storage volume that automatically expands up to 128 TiB across 3 Availability Zones without database downtime.

### Q3: What is Apache Gremlin?
Apache Gremlin is a graph traversal language for Property Graphs that expresses graph walks imperatively (`g.V().hasLabel('user').out('follows')`).

### Q4: What is SPARQL?
SPARQL is a W3C standard declarative query language used to query RDF triple stores (`Subject-Predicate-Object`).

### Q5: Does Neptune support read replicas?
Yes, Neptune supports up to 15 read replicas sharing the same underlying storage volume with low replication lag.
"""

# 31. Dgraph
b5_articles['nosql-dgraph'] = r"""# Dgraph: Distributed GraphQL-Native Database, Badger LSM & Raft

Dgraph is an open-source, distributed, GraphQL-native graph database designed for performance, low latency, and ACID transaction guarantees. Built in Go, it uses **Badger** (an LSM-tree key-value store) for disk persistence and Raft for cluster consensus.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dgBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#dgBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Dgraph GraphQL-Native Engine & Badger Storage</text>

  <rect x="100" y="120" width="220" height="130" rx="8" fill="#e11d48"/>
  <text x="210" y="185" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Dgraph Zero (Cluster State)</text>

  <rect x="420" y="120" width="380" height="130" rx="8" fill="#9f1239"/>
  <text x="610" y="165" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Dgraph Alpha (Predicates & Badger Storage)</text>
  <text x="610" y="195" text-anchor="middle" fill="#ffe4e6" font-size="12">Executes DQL / GraphQL Queries</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What makes Dgraph GraphQL-native?
Dgraph accepts standard GraphQL schemas and executes GraphQL queries natively without requiring a separate translation middleware layer.

### Q2: What is Dgraph DQL?
DQL (Dgraph Query Language) is Dgraph's custom graph query language derived from GraphQL with extended support for graph filters, functions, and aggregations.

### Q3: How does Dgraph shard graph data?
Dgraph shards graph data by **predicate** (relationship type/attribute) across alpha nodes in the cluster.

### Q4: What is Badger KV in Dgraph?
Badger is an embeddable, fast Log-Structured Merge (LSM) key-value engine written in pure Go, optimized for SSD performance.

### Q5: How do Dgraph Zero and Alpha nodes differ?
Dgraph Zero manages cluster topology, assigns node IDs, and balances predicate shards. Dgraph Alpha nodes store predicates, indexes, and execute queries.
"""

# 32. InfluxDB
b5_articles['nosql-influxdb'] = r"""# InfluxDB Architecture: Time-Structured Merge (TSM) Tree, WAL & Flux Query Language

InfluxDB is an open-source time-series database optimized for high-throughput timestamped metrics, IoT telemetry, and real-time monitoring events. It uses the **Time-Structured Merge (TSM)** tree storage engine.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="infBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#infBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">InfluxDB TSM Engine Compression & Shard Durations</text>

  <rect x="80" y="100" width="340" height="180" rx="8" fill="#1e3a8a"/>
  <text x="250" y="140" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Line Protocol Ingestion</text>
  <text x="250" y="175" text-anchor="middle" fill="#93c5fd" font-size="12">`cpu,host=server01 usage=84.2 1700000000`</text>

  <rect x="480" y="100" width="340" height="180" rx="8" fill="#1e1b4b"/>
  <text x="650" y="140" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">TSM Storage Engine</text>
  <text x="650" y="175" text-anchor="middle" fill="#c7d2fe" font-size="12">Gorilla Bit-Packing Timestamp Compression</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is a Time Series in InfluxDB?
A time series is a collection of timestamped points sharing the same measurement name, tag set (metadata key-values), and field keys (metrics).

### Q2: What is the TSM (Time-Structured Merge) Tree?
TSM is InfluxDB's storage engine that compresses timestamped float/integer metrics using Gorilla bit-packing algorithms, compressing series up to 90%.

### Q3: What is high cardinality in InfluxDB?
High cardinality occurs when tags contain millions of unique values (e.g. `user_id` or `uuid`), causing the TSI (Time Series Index) to consume excessive RAM.

### Q4: How do Retention Policies and Downsampling work?
Retention policies specify how long raw data is kept. Continuous queries downsample high-frequency telemetry (e.g. 1-second metrics) into long-term rollups (e.g. 1-hour averages).

### Q5: What is InfluxDB 3.0 (IOx)?
InfluxDB 3.0 is a rewritten columnar engine built in Rust and Apache Arrow/DataFusion for handling high cardinality workloads natively.
"""

# 33. TimescaleDB
b5_articles['nosql-timescaledb'] = r"""# TimescaleDB Architecture: PostgreSQL Extension, Hypertables & Continuous Aggregates

TimescaleDB is an open-source time-series database packaged as an extension for **PostgreSQL**. It converts standard PostgreSQL tables into automated, multi-node **Hypertables** split into time-and-space chunks.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#tsBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">TimescaleDB Hypertable & Automated Time-Based Chunks</text>

  <rect x="150" y="80" width="600" height="60" rx="6" fill="#0284c7"/>
  <text x="450" y="115" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Hypertable Abstraction (Exposed to Client SQL)</text>

  <rect x="150" y="180" width="180" height="120" rx="6" fill="#0369a1"/>
  <text x="240" y="245" text-anchor="middle" fill="#fff" font-size="13">Chunk 1 (Week 1)</text>

  <rect x="360" y="180" width="180" height="120" rx="6" fill="#0369a1"/>
  <text x="450" y="245" text-anchor="middle" fill="#fff" font-size="13">Chunk 2 (Week 2)</text>

  <rect x="570" y="180" width="180" height="120" rx="6" fill="#0369a1"/>
  <text x="660" y="245" text-anchor="middle" fill="#fff" font-size="13">Chunk 3 (Week 3)</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is a Hypertable in TimescaleDB?
A Hypertable is a virtual table that automatically partitions data into physical underlying PostgreSQL tables called "chunks" based on time intervals.

### Q2: Why is TimescaleDB preferable over standard PostgreSQL for time-series?
Standard PostgreSQL tables slow down as indexes exceed RAM. TimescaleDB keeps active write chunks small enough to fit inside RAM, preserving fast $O(1)$ write speeds.

### Q3: What are Continuous Aggregates in TimescaleDB?
Continuous Aggregates automatically calculate background rollups (e.g. hourly stats) incrementally as new data arrives without full table scans.

### Q4: Does TimescaleDB support standard SQL JOINs?
Yes! Because TimescaleDB is PostgreSQL, you can JOIN time-series hypertables directly with relational business tables.

### Q5: How high is TimescaleDB columnar compression?
TimescaleDB columnar compression converts older chunks into compressed columnar format, reducing disk usage by up to 90%.
"""

# 34. Observability Core
b5_articles['scale-obs-core'] = r"""# Core Concepts of Observability: Metrics, Logs, Traces (The MELT Framework)

Observability is the degree to which the internal state of a complex distributed software system can be inferred solely from its external outputs. This article covers the **MELT framework**: **Metrics**, **Events**, **Logs**, and **Traces**.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="obsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#obsBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">The Three Pillars of Observability (Metrics, Logs, Traces)</text>

  <rect x="80" y="110" width="220" height="180" rx="8" fill="#2563eb"/>
  <text x="190" y="150" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Metrics</text>
  <text x="190" y="190" text-anchor="middle" fill="#dbeafe" font-size="12">Aggregated Counters & Gauges</text>

  <rect x="340" y="110" width="220" height="180" rx="8" fill="#059669"/>
  <text x="450" y="150" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Logs</text>
  <text x="450" y="190" text-anchor="middle" fill="#d1fae5" font-size="12">Timestamped Discrete Events</text>

  <rect x="600" y="110" width="220" height="180" rx="8" fill="#d97706"/>
  <text x="710" y="150" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Traces</text>
  <text x="710" y="190" text-anchor="middle" fill="#fef3c7" font-size="12">Request Call Graphs & Spans</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is the difference between Monitoring and Observability?
Monitoring tells you *when* a system is failing (e.g. HTTP 500 rate > 5%). Observability allows you to infer *why* a novel, un-anticipated failure state occurred.

### Q2: What are Metrics in the MELT framework?
Metrics are numeric aggregates (Counters, Gauges, Histograms) collected over time intervals to measure system health.

### Q3: What is a Distributed Trace?
A Distributed Trace tracks the lifecycle of a request as it propagates through microservices, recorded as a hierarchy of connected Spans.

### Q4: Why are structured logs (JSON) superior to plain text logs?
Structured logs format log fields as JSON key-value pairs (`{"level":"error","user_id":"9921"}`), enabling automated indexing, filtering, and aggregation in tools like Elasticsearch.

### Q5: What is the Golden Signals of Monitoring (Google SRE)?
Latency, Traffic, Errors, and Saturation.
"""

# 35. Instrumentation
b5_articles['scale-obs-instrumentation'] = r"""# Application Instrumentation: OpenTelemetry SDKs, Span Context Propagation & Collectors

Instrumentation is the process of embedding code into application microservices to capture metrics, logs, and distributed traces. This article covers **OpenTelemetry (OTel)** instrumentation standards.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="insBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#insBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">OpenTelemetry Architecture (SDK -> Collector -> Backends)</text>

  <rect x="80" y="120" width="200" height="130" rx="8" fill="#6366f1"/>
  <text x="180" y="175" text-anchor="middle" fill="#fff" font-weight="700">App (OTel SDK)</text>

  <rect x="350" y="120" width="200" height="130" rx="8" fill="#0284c7"/>
  <text x="450" y="175" text-anchor="middle" fill="#fff" font-weight="700">OTel Collector</text>

  <rect x="620" y="120" width="200" height="130" rx="8" fill="#059669"/>
  <text x="720" y="175" text-anchor="middle" fill="#fff" font-weight="700">Prometheus / Jaeger</text>

  <path d="M 280 185 L 350 185" stroke="#818cf8" stroke-width="3"/>
  <path d="M 550 185 L 620 185" stroke="#38bdf8" stroke-width="3"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is OpenTelemetry (OTel)?
OpenTelemetry is a vendor-neutral CNCF framework providing unified APIs, SDKs, and tooling to generate, collect, and export telemetry data.

### Q2: What is Span Context Propagation?
Span Context Propagation passes trace headers (`traceparent`) across HTTP/gRPC network boundaries so child spans in downstream services link to the parent trace.

### Q3: What is the OpenTelemetry Collector?
The OTel Collector is a proxy component that receives, processes (filters, batches), and exports telemetry data to target backend vendors.

### Q4: How does Auto-Instrumentation differ from Manual Instrumentation?
Auto-instrumentation injects telemetry hooks into frameworks automatically at runtime without code edits. Manual instrumentation uses explicit SDK API calls to record custom spans and metrics.

### Q5: What protocol does OpenTelemetry use for transport?
OTel uses **OTLP** (OpenTelemetry Protocol) over gRPC or HTTP/protobuf.
"""

# Export Batch 5
output_path = './scratch/batch_5.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(b5_articles, f, indent=2, ensure_ascii=False)

print(f"Saved Batch 5 JSON to {output_path} with {len(b5_articles)} articles.")
