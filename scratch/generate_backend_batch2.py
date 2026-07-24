import json
import sys

b2_articles = {}

# 8. Serverless
b2_articles['pattern-serverless'] = r"""# Serverless Architecture (FaaS): Event-Driven Execution, Cold Starts & Stateless Scaling

Serverless Architecture, often implemented via Function-as-a-Service (FaaS) platforms like AWS Lambda, Azure Functions, and Google Cloud Functions, is a cloud-native execution model where cloud providers dynamically manage host provisioning, auto-scaling, and OS maintenance. Developers deploy event-driven stateless functions that execute in response to events (HTTP requests, database changes, queue events).

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="slsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#slsBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Serverless Event-Driven Invocation & On-Demand Worker Lifecycle</text>

  <!-- Event Source -->
  <rect x="60" y="140" width="160" height="120" rx="8" fill="#f59e0b" opacity="0.9" stroke="#fbbf24" stroke-width="2"/>
  <text x="140" y="185" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="16">Event Trigger</text>
  <text x="140" y="210" text-anchor="middle" fill="#fef3c7" font-size="12">API Gateway / S3 / SQS</text>

  <!-- FaaS Platform -->
  <rect x="300" y="80" width="300" height="240" rx="10" fill="#6366f1" opacity="0.9" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="115" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="18">FaaS Platform (AWS Lambda)</text>

  <rect x="330" y="140" width="240" height="50" rx="6" fill="#4338ca"/>
  <text x="450" y="170" text-anchor="middle" fill="#e0e7ff" font-size="13">Worker Container 1 (Warm)</text>

  <rect x="330" y="210" width="240" height="50" rx="6" fill="#4338ca" stroke="#c7d2fe" stroke-dasharray="4,4"/>
  <text x="450" y="240" text-anchor="middle" fill="#e0e7ff" font-size="13">Worker Container 2 (Cold Start Init)</text>

  <!-- Database -->
  <rect x="680" y="140" width="160" height="120" rx="8" fill="#10b981" opacity="0.9" stroke="#34d399" stroke-width="2"/>
  <text x="760" y="185" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="16">Managed DB</text>
  <text x="760" y="210" text-anchor="middle" fill="#ecfdf5" font-size="12">DynamoDB / Aurora</text>

  <path d="M 220 200 L 300 200" stroke="#fbbf24" stroke-width="3"/>
  <path d="M 600 200 L 680 200" stroke="#34d399" stroke-width="3"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is a "Cold Start" in Serverless computing and how can it be mitigated?
A Cold Start occurs when an incoming event triggers a function execution, but no warm worker container exists. The cloud platform must download the function package, boot a microVM (Firecracker), start the runtime environment, and execute initialization code. Mitigate using Provisioned Concurrency, keeping payload sizes small, or using lightweight runtimes (Go, Rust, Node.js over Java).

### Q2: Why is relational database connection pooling challenging in Serverless architectures?
Serverless functions scale horizontally by spawning hundreds of independent concurrent worker instances. If every function instance opens a direct connection to a relational database like PostgreSQL, the database exceeds its connection limit (`max_connections`). Use connection proxies such as AWS RDS Proxy or PgBouncer.

### Q3: What is the maximum execution duration for AWS Lambda?
AWS Lambda functions have a maximum execution timeout limit of 15 minutes (900 seconds). For long-running batch workloads, containerized batch engines (AWS Fargate, AWS Batch, or Kubernetes Jobs) should be used instead.

### Q4: How does pricing work in Serverless FaaS?
Serverless FaaS platforms bill based on the exact number of requests and **GB-seconds** consumed (calculated as allocated memory in MB multiplied by execution duration in milliseconds rounded up to 1ms increments), with zero cost when idle.

### Q5: How do stateless functions maintain persistent session state across calls?
Serverless functions do not maintain in-memory state across invocation boundaries. Persistent state must be offloaded to external state stores like Redis (ElastiCache), DynamoDB, or JWT tokens stored on the client side.
"""

# 9. Service Mesh
b2_articles['pattern-service-mesh'] = r"""# Service Mesh Architecture: Envoy Sidecar Proxies, mTLS & Traffic Management

A Service Mesh is a dedicated infrastructure layer built directly into a cloud-native cluster to handle inter-service communication securely and reliably. It operates by injecting high-performance sidecar network proxies (such as **Envoy**) alongside application containers in every Pod, abstracting networking logic (mutual TLS, retries, rate limiting, circuit breaking) away from application code.

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="smBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#smBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Service Mesh Envoy Sidecar Proxy Communication</text>

  <!-- Pod 1 -->
  <rect x="80" y="90" width="320" height="220" rx="10" fill="#1e3a8a" opacity="0.9" stroke="#60a5fa" stroke-width="2"/>
  <text x="240" y="125" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Pod A (Service A)</text>
  <rect x="105" y="150" width="120" height="130" rx="6" fill="#3b82f6"/><text x="165" y="220" text-anchor="middle" fill="#fff" font-size="13">App Container</text>
  <rect x="255" y="150" width="120" height="130" rx="6" fill="#0284c7" stroke="#93c5fd" stroke-width="2"/><text x="315" y="220" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">Envoy Sidecar</text>

  <!-- Pod 2 -->
  <rect x="500" y="90" width="320" height="220" rx="10" fill="#064e3b" opacity="0.9" stroke="#34d399" stroke-width="2"/>
  <text x="660" y="125" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Pod B (Service B)</text>
  <rect x="525" y="150" width="120" height="130" rx="6" fill="#059669" stroke="#a7f3d0" stroke-width="2"/><text x="585" y="220" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">Envoy Sidecar</text>
  <rect x="675" y="150" width="120" height="130" rx="6" fill="#10b981"/><text x="735" y="220" text-anchor="middle" fill="#fff" font-size="13">App Container</text>

  <path d="M 375 215 L 525 215" stroke="#38bdf8" stroke-width="4" stroke-dasharray="6,4"/>
  <text x="450" y="200" text-anchor="middle" fill="#38bdf8" font-weight="700" font-size="13">Encrypted mTLS Tunnel</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is the main architectural benefit of a Service Mesh over application libraries (Hystrix, Resilience4j)?
A Service Mesh enforces networking policies, security protocols (mTLS), and telemetry collection uniformly across all microservices regardless of programming language, eliminating the need to re-implement resilience libraries for Python, Go, Node.js, and Java separately.

### Q2: How does mutual TLS (mTLS) work in a Service Mesh?
The control plane (e.g. Istiod) acts as an internal Certificate Authority (CA), issuing short-lived X.509 certificates to Envoy sidecars. Sidecars handle handshake, SPIFFE identity verification, and TLS encryption transparently without application modifications.

### Q3: What is the latency impact of using a Service Mesh?
Injecting Envoy sidecars introduces two extra hop network traversals (loopback `localhost` -> Envoy proxy -> network wire -> destination Envoy proxy -> destination `localhost`). Envoy adds sub-millisecond (typically ~0.5ms - 1.5ms) latency per hop.

### Q4: How does a Service Mesh enable Canary Deployments?
The control plane configures Envoy proxies to split incoming HTTP traffic dynamically based on weight percentages (e.g. 95% traffic to `v1` Pods, 5% traffic to `v2` canary Pods) or header rules (`X-Canary-User: true`).

### Q5: How does Istio control plane differ from data plane proxies?
The **Data Plane** consists of Envoy sidecar proxies deployed alongside applications that inspect and forward network traffic. The **Control Plane** (Istiod) manages configuration, translates High-Level CRDs into Envoy xDS API updates, and issues security credentials.
"""

# 10. Twelve Factor Apps
b2_articles['pattern-twelve-factor'] = r"""# The Twelve-Factor App Methodology: Cloud-Native Best Practices for Scalable Software

The **Twelve-Factor App** methodology is a methodology for building software-as-a-service applications that are optimized for cloud deployments, declarative automation, stateless execution, and continuous delivery.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tfBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#tfBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">The 12-Factor App Cloud Architecture Framework</text>

  <rect x="60" y="70" width="230" height="70" rx="6" fill="#2563eb"/><text x="175" y="110" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">I. Codebase</text>
  <rect x="335" y="70" width="230" height="70" rx="6" fill="#2563eb"/><text x="450" y="110" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">II. Dependencies</text>
  <rect x="610" y="70" width="230" height="70" rx="6" fill="#2563eb"/><text x="725" y="110" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">III. Config</text>

  <rect x="60" y="160" width="230" height="70" rx="6" fill="#0d9488"/><text x="175" y="200" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">IV. Backing Services</text>
  <rect x="335" y="160" width="230" height="70" rx="6" fill="#0d9488"/><text x="450" y="200" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">V. Build, Release, Run</text>
  <rect x="610" y="160" width="230" height="70" rx="6" fill="#0d9488"/><text x="725" y="200" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">VI. Processes (Stateless)</text>

  <rect x="60" y="250" width="230" height="70" rx="6" fill="#7c3aed"/><text x="175" y="290" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">VII. Port Binding</text>
  <rect x="335" y="250" width="230" height="70" rx="6" fill="#7c3aed"/><text x="450" y="290" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">VIII. Concurrency</text>
  <rect x="610" y="250" width="230" height="70" rx="6" fill="#7c3aed"/><text x="725" y="290" text-anchor="middle" fill="#fff" font-weight="700" font-size="13">IX. Disposability</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: How does Factor III (Config) state environment configuration should be managed?
Factor III dictates that configuration that varies across deployments (database credentials, API keys, backing service URLs) must be strictly separated from code and injected via environment variables (`ENV`), never committed to git repos.

### Q2: Why does Factor VI (Processes) require applications to be stateless?
Twelve-Factor processes are completely stateless and share nothing. Any data that must persist across requests must be stored in a stateful backing service (e.g. PostgreSQL or Redis). This allows orchestrators to kill and replace instances instantly.

### Q3: What is the difference between Build, Release, and Run stages (Factor V)?
The **Build** stage converts code repo into an executable bundle (e.g. Docker image). The **Release** stage combines the build bundle with environment configuration. The **Run** stage launches process instances in the target environment.

### Q4: What does Factor IX (Disposability) mean for application shutdown?
Disposability means processes can be started or stopped at a moment's notice. Applications must handle `SIGTERM` signals gracefully by ceasing to accept new requests, finishing current work, and closing database connections cleanly.

### Q5: How does Factor XI (Logs) view log management?
Factor XI states that an application should never concern itself with writing or routing log files. It simply emits unbuffered log streams to `stdout` and `stderr`, leaving log collection and aggregation to infrastructure tools (FluentBit, Vector).
"""

# 11. Elasticsearch
b2_articles['search-elasticsearch'] = r"""# Elasticsearch Architecture: Inverted Index, Shards, Lucene & Distributed Search

Elasticsearch is a distributed, JSON-native full-text search engine built on **Apache Lucene**. It provides real-time search, analytics, and structured data indexing using an **Inverted Index** data structure.

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="esBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#esBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Elasticsearch Inverted Index Data Structure Mechanics</text>

  <rect x="80" y="90" width="320" height="230" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="240" y="125" text-anchor="middle" fill="#38bdf8" font-weight="700" font-size="16">Input Documents</text>
  <text x="100" y="160" fill="#f8fafc" font-size="13">Doc 1: "Distributed system search"</text>
  <text x="100" y="190" fill="#f8fafc" font-size="13">Doc 2: "Search in elasticsearch"</text>
  <text x="100" y="220" fill="#f8fafc" font-size="13">Doc 3: "Distributed database index"</text>

  <rect x="480" y="90" width="340" height="230" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <text x="650" y="125" text-anchor="middle" fill="#34d399" font-weight="700" font-size="16">Inverted Index Dictionary</text>
  <text x="500" y="160" fill="#a7f3d0" font-size="13">"distributed"  => [Doc 1, Doc 3]</text>
  <text x="500" y="190" fill="#a7f3d0" font-size="13">"elasticsearch"=> [Doc 2]</text>
  <text x="500" y="220" fill="#a7f3d0" font-size="13">"index"        => [Doc 3]</text>
  <text x="500" y="250" fill="#a7f3d0" font-size="13">"search"       => [Doc 1, Doc 2]</text>

  <path d="M 400 205 L 480 205" stroke="#f59e0b" stroke-width="3"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is an Inverted Index in Elasticsearch?
An Inverted Index maps every unique word (term) extracted from indexed documents to a sorted list of Document IDs containing that word (posting list). This allows sub-millisecond full-text searches regardless of collection size.

### Q2: What is the difference between Primary Shards and Replica Shards?
Primary Shards are the write targets where incoming JSON documents are indexed. Replica Shards are read-only exact copies of primary shards located on separate cluster nodes to provide high-availability failover and scale search read throughput.

### Q3: Why should you avoid mapping explosions in Elasticsearch?
A mapping explosion happens when dynamic mapping generates thousands of fields in an index schema. This causes the cluster state metadata to balloon in RAM, slowing down cluster state updates across master nodes.

### Q4: How does the Refresh Interval impact search visibility?
Elasticsearch writes new documents to an in-memory buffer before flushing to Lucene segment files during a `refresh` operation (default: every 1 second). Documents are only searchable after a refresh occurs.

### Q5: What is the difference between `text` and `keyword` mapping field types?
`text` fields undergo full text analysis (tokenization, stemming, lowercasing) for full-text search. `keyword` fields are stored un-analyzed for exact matching, sorting, aggregations, and filtering.
"""

# 12. Solr
b2_articles['search-solr'] = r"""# Apache Solr Architecture: SolrCloud, Zookeeper & Enterprise Search

Apache Solr is an enterprise search platform built on top of **Apache Lucene**. Operating in **SolrCloud** mode, it uses Apache ZooKeeper for cluster coordination, automated leader election, fault tolerance, and dynamic query routing.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="solrBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#solrBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">SolrCloud Architecture & ZooKeeper Coordination</text>

  <rect x="250" y="70" width="400" height="60" rx="6" fill="#d97706"/>
  <text x="450" y="105" text-anchor="middle" fill="#ffffff" font-weight="700" font-size="16">ZooKeeper Ensemble (State & Leader Election)</text>

  <rect x="100" y="180" width="300" height="130" rx="8" fill="#0284c7"/>
  <text x="250" y="215" text-anchor="middle" fill="#fff" font-weight="700" font-size="15">Solr Node 1 (Shard 1 Leader)</text>

  <rect x="500" y="180" width="300" height="130" rx="8" fill="#0284c7"/>
  <text x="650" y="215" text-anchor="middle" fill="#fff" font-weight="700" font-size="15">Solr Node 2 (Shard 1 Replica)</text>

  <path d="M 450 130 L 250 180" stroke="#fbbf24" stroke-width="2"/>
  <path d="M 450 130 L 650 180" stroke="#fbbf24" stroke-width="2"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is SolrCloud?
SolrCloud is Solr's distributed mode that provides high availability, fault-tolerant indexing, automatic leader election, and distributed query routing managed via Apache ZooKeeper.

### Q2: How does Solr handle field schema configuration?
Solr supports both explicit schema definition via `managed-schema` (or `schema.xml`) and schematic-less auto-detection. Explicit schemas define exact field types, tokenizers, and filter chains.

### Q3: What is the role of ZooKeeper in SolrCloud?
ZooKeeper maintains cluster configuration files, tracks node membership, manages shard leader elections, and routes queries to active shard replicas.

### Q4: How does Solr compare to Elasticsearch?
Solr offers granular XML/JSON schema tuning, deep facets, and legacy enterprise search capabilities. Elasticsearch is JSON-native, easier to operationalize for log analytics, and features dynamic mapping.

### Q5: What are Solr Cores?
A Solr Core is an individual running instance of a Lucene index on a single node with its own configuration and schema files.
"""

# 13. SSE
b2_articles['realtime-sse'] = r"""# Server-Sent Events (SSE): HTTP Streaming, Unidirectional Pushes & Reconnection

Server-Sent Events (SSE) is a lightweight W3C standard protocol that enables a server to push real-time event streams to clients over a persistent HTTP connection using the `text/event-stream` MIME content type.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sseBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#sseBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Server-Sent Events (SSE) Unidirectional HTTP Streaming</text>

  <rect x="80" y="120" width="160" height="140" rx="8" fill="#3b82f6"/>
  <text x="160" y="195" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Browser Client</text>

  <rect x="660" y="120" width="160" height="140" rx="8" fill="#10b981"/>
  <text x="740" y="195" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Server</text>

  <path d="M 240 160 L 660 160" stroke="#60a5fa" stroke-width="3"/>
  <text x="450" y="150" text-anchor="middle" fill="#93c5fd" font-size="12">1. Initial GET Request (Accept: text/event-stream)</text>

  <path d="M 660 210 L 240 210" stroke="#34d399" stroke-width="3"/>
  <text x="450" y="200" text-anchor="middle" fill="#a7f3d0" font-size="12">2. Continuous HTTP Event Pushes (data: {...})</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is the main advantage of SSE over WebSockets?
SSE runs over standard HTTP/1.1 or HTTP/2 without needing custom protocol handshakes. It includes built-in browser reconnection mechanisms (`EventSource`) and automatic `Last-Event-ID` tracking out of the box.

### Q2: Is SSE bidirectional or unidirectional?
SSE is strictly **unidirectional** (server-to-client). If the client needs to send data back to the server, it uses standard HTTP POST/PUT API calls.

### Q3: What HTTP headers are required for an SSE response?
`Content-Type: text/event-stream`, `Cache-Control: no-cache`, and `Connection: keep-alive`.

### Q4: How does automatic reconnection work in SSE?
If the connection drops, the browser `EventSource` automatically attempts reconnection after a timeout, sending the `Last-Event-ID` header so the server can resume missed events.

### Q5: What browser connection limit affects SSE under HTTP/1.1?
Under HTTP/1.1, browsers limit open SSE connections to 6 per domain. Upgrading to HTTP/2 eliminates this limit via multiplexing.
"""

# 14. WebSockets
b2_articles['realtime-websockets'] = r"""# WebSockets Protocol: Full-Duplex TCP Communication & Framing

The WebSocket protocol (RFC 6455) provides full-duplex, bidirectional communication channels over a single persistent TCP connection. Started via an HTTP Upgrade handshake, WebSockets switch to framing protocol for low-latency real-time applications.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#wsBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">WebSocket Full-Duplex Bi-Directional Protocol</text>

  <rect x="80" y="120" width="160" height="140" rx="8" fill="#3b82f6"/>
  <text x="160" y="195" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">WebSocket Client</text>

  <rect x="660" y="120" width="160" height="140" rx="8" fill="#10b981"/>
  <text x="740" y="195" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">WebSocket Server</text>

  <path d="M 240 160 L 660 160" stroke="#60a5fa" stroke-width="3"/>
  <text x="450" y="150" text-anchor="middle" fill="#93c5fd" font-size="12">Client Messages (Masked Frames)</text>

  <path d="M 660 210 L 240 210" stroke="#34d399" stroke-width="3"/>
  <text x="450" y="200" text-anchor="middle" fill="#a7f3d0" font-size="12">Server Messages (Unmasked Frames)</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: How does a WebSocket connection initialize?
A WebSocket connection begins as a standard HTTP/1.1 request containing headers: `Upgrade: websocket` and `Connection: Upgrade`. The server responds with `101 Switching Protocols`.

### Q2: Why are client-to-server WebSocket frames masked?
Client-to-server frames are XOR-masked to prevent malicious proxy servers from caching or misinterpreting framed data packets.

### Q3: How do you scale WebSockets across multiple server nodes?
Use a pub/sub backend such as Redis Pub/Sub or NATS to broadcast messages across WebSocket nodes, ensuring messages reach clients connected to different server instances.

### Q4: What is the difference between WebSockets and WebRTC?
WebSockets provide reliable TCP-based client-server communication. WebRTC provides peer-to-peer (P2P) UDP-based streaming for ultra-low latency audio/video.

### Q5: How do WebSocket Ping/Pong frames work?
WebSocket Ping/Pong control frames detect dead connections and keep intermediate load balancers from closing idle TCP sockets.
"""

# Export Batch 2
output_path = './scratch/batch_2.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(b2_articles, f, indent=2, ensure_ascii=False)

print(f"Saved Batch 2 JSON to {output_path} with {len(b2_articles)} articles.")
