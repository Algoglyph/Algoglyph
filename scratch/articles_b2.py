# -*- coding: utf-8 -*-
import json

ARTICLES_B2 = {
    'pattern-serverless': r"""# Serverless Architecture: Event-Driven Triggers, Cold Start Latency & Stateless Functions

![Serverless](/images/backend/pattern-serverless-dark.png)

## 1. System Overview & Architectural Motivation

Serverless Architecture (Function-as-a-Service, FaaS) abstracts server management, provisioning, and OS maintenance. Developers deploy discrete functions (e.g. AWS Lambda, Google Cloud Functions) triggered by system events (S3 uploads, API Gateway requests, DynamoDB streams).

FaaS Billing & Scaling Equation:
$$\text{Cost}_{\text{FaaS}} = \sum (\text{Executions} \times \text{Duration}_{\text{sec}} \times \text{Memory Allocation}_{\text{GB}} \times \text{Price}_{\text{GB-sec}})$$

---

## 2. Serverless Cold Start & Event Execution Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="14" font-family="sans-serif" font-weight="bold">FaaS Cold Start Execution Flow</text>

  <g transform="translate(40, 60)">
    <rect width="140" height="130" rx="6" fill="#18181b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="70" y="25" fill="#f87171" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Cold Start (~500ms)</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">1. Download Code</text>
    <text x="15" y="75" fill="#a1a1aa" font-size="10" font-family="monospace">2. Start MicroVM</text>
    <text x="15" y="95" fill="#a1a1aa" font-size="10" font-family="monospace">3. Init Runtime</text>
    <text x="15" y="115" fill="#a1a1aa" font-size="10" font-family="monospace">4. Load Static Imports</text>

    <rect x="200" y="0" width="140" height="130" rx="6" fill="#18181b" stroke="#10b981" stroke-width="1.5"/>
    <text x="270" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Warm Exec (~5ms)</text>
    <text x="215" y="65" fill="#a1a1aa" font-size="10" font-family="monospace">1. Reuse Instance</text>
    <text x="215" y="85" fill="#a1a1aa" font-size="10" font-family="monospace">2. Execute Handler</text>
    <text x="215" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">3. Return Response</text>
  </g>
</svg>
```

---

## 3. Mathematical Analysis: Provisioned Concurrency vs Cold Start

Latency with Cold Start Probability $P(C)$:
$$\mathbb{E}[\text{Latency}] = P(C) \cdot T_{\text{Cold}} + (1 - P(C)) \cdot T_{\text{Warm}}$$

Where $T_{\text{Cold}} \approx 200 - 1500\text{ ms}$ and $T_{\text{Warm}} \approx 5 - 20\text{ ms}$.

---

## 4. Production AWS Lambda Python Code

```python
import json
import os
import time

# Global scope (Initialized ONCE during cold start)
DB_CONNECTION = None

def init_db():
    global DB_CONNECTION
    if not DB_CONNECTION:
        print("[Cold Start] Initializing database connection pool...")
        DB_CONNECTION = "CONNECTED_POOL"

def lambda_handler(event, context):
    init_db()
    
    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id', 'anonymous')
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'status': 'success',
            'user_id': user_id,
            'message': 'Processed by serverless handler'
        })
    }
```

---

## 5. Conceptual Check Questions & FAQs

1. **How do you eliminate cold starts in production?**
   *Answer:* Using Provisioned Concurrency, keeping microVM worker instances initialized and warm at all times.
""",

    'pattern-service-mesh': r"""# Service Mesh Architecture: Sidecar Proxies, mTLS, Traffic Shifting & Istio / Envoy

![Service Mesh](/images/backend/pattern-service-mesh-dark.png)

## 1. System Overview & Architectural Motivation

A Service Mesh is a dedicated infrastructure layer that handles service-to-service communication transparently using **Sidecar Proxies** (Envoy) deployed alongside application containers.

Capabilities:
1. **Mutual TLS (mTLS)**: Automatic end-to-end encryption and identity authentication between services.
2. **Traffic Management**: Canary deployments, traffic shifting, rate limiting, and fault injection.
3. **Observability**: Distributed tracing (Jaeger, Zipkin) and metric collection without app-code modification.

---

## 2. Sidecar Proxy Mesh Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#a855f7" font-size="14" font-family="sans-serif" font-weight="bold">Service Mesh Sidecar Proxy Architecture</text>

  <g transform="translate(40, 60)">
    <!-- Pod A -->
    <rect width="200" height="130" rx="6" fill="#18181b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="100" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Pod A</text>
    <rect x="15" y="40" width="80" height="60" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="55" y="75" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">App A</text>
    <rect x="105" y="40" width="80" height="60" rx="4" fill="#09090b" stroke="#a855f7"/>
    <text x="145" y="75" fill="#c084fc" font-size="10" text-anchor="middle" font-family="monospace">Envoy</text>

    <!-- Pod B -->
    <rect x="320" y="0" width="200" height="130" rx="6" fill="#18181b" stroke="#10b981" stroke-width="1.5"/>
    <text x="420" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Pod B</text>
    <rect x="335" y="40" width="80" height="60" rx="4" fill="#09090b" stroke="#a855f7"/>
    <text x="375" y="75" fill="#c084fc" font-size="10" text-anchor="middle" font-family="monospace">Envoy</text>
    <rect x="425" y="40" width="80" height="60" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="465" y="75" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">App B</text>
  </g>
</svg>
```

---

## 3. Production Istio VirtualService Canary Routing YAML

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: payment-service-route
spec:
  hosts:
  - payment-service
  http:
  - route:
    - destination:
        host: payment-service
        subset: v1
      weight: 90
    - destination:
        host: payment-service
        subset: v2-canary
      weight: 10
```

---

## 4. Conceptual Check Questions & FAQs

1. **How does Envoy transparently intercept traffic?**
   *Answer:* `iptables` rules configured inside the Pod network namespace redirect all inbound and outbound TCP traffic to the Envoy proxy port ($15001$).
""",

    'pattern-twelve-factor': r"""# Twelve-Factor App Methodology: Cloud-Native Best Practices & Production Standards

![Twelve Factor](/images/backend/pattern-twelve-factor-dark.png)

## 1. System Overview & The 12 Principles

The Twelve-Factor App methodology defines standard operational principles for building modern, cloud-native, scalable software applications.

---

## 2. Core Principles Matrix

| # | Principle | Description & Enforcement |
| :--- | :--- | :--- |
| **I** | **Codebase** | One codebase tracked in revision control, many deploys. |
| **II** | **Dependencies** | Explicitly declare and isolate dependencies (e.g. `package.json`, `go.mod`). |
| **III** | **Config** | Store configuration in environment variables, never hardcode in code. |
| **IV** | **Backing services** | Treat attached resources (Databases, Queues) as addressable network links. |
| **V** | **Build, release, run** | Strictly separate build stages from execution stages. |
| **VI** | **Processes** | Execute app as one or more stateless, share-nothing processes. |
| **VII** | **Port binding** | Export services via direct network port binding. |
| **VIII**| **Concurrency** | Scale out via the process model (horizontal scaling). |
| **IX** | **Disposability** | Fast startup and graceful shutdown (`SIGTERM` handling). |
| **X** | **Dev/prod parity** | Keep development, staging, and production environments identical. |
| **XI** | **Logs** | Treat logs as event streams pushed to `stdout`. |
| **XII**| **Admin processes** | Run admin/management tasks as one-off processes. |

---

## 3. Production Graceful Shutdown Handling Code (Node.js)

```javascript
const express = require('express');
const app = express();

const server = app.listen(8080, () => console.log('App running on port 8080'));

// Factor IX: Disposability - Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed. Cleaning up DB connections...');
    // Close DB pools cleanly
    process.exit(0);
  });
});
```
""",

    'search-elasticsearch': r"""# Elasticsearch Architecture: Inverted Indexes, Lucene Segments, Sharding & BM25 Relevance

![Elasticsearch](/images/backend/search-elasticsearch-dark.png)

## 1. System Overview & Inverted Index Mechanics

Elasticsearch is a distributed, JSON-based search engine powered by Apache Lucene. Unlike relational databases that scan rows sequentially ($O(N)$ text scanning), Elasticsearch indexes text using **Inverted Indexes**.

An Inverted Index maps every unique word (term) to the sorted list of document IDs containing it:

```
Term: "distributed" -> [Doc 1, Doc 4, Doc 9]
Term: "consensus"   -> [Doc 2, Doc 4, Doc 10]
```

---

## 2. Inverted Index Architecture Diagram

```svg
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="14" font-family="sans-serif" font-weight="bold">Inverted Index Term Dictionary & Postings</text>

  <g transform="translate(40, 60)">
    <rect width="180" height="130" rx="6" fill="#18181b" stroke="#f59e0b"/>
    <text x="90" y="25" fill="#fbbf24" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Term Dictionary (FST)</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">"algorithm"</text>
    <text x="15" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">"database"</text>
    <text x="15" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">"distributed"</text>

    <rect x="240" y="0" width="220" height="130" rx="6" fill="#18181b" stroke="#10b981"/>
    <text x="350" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Postings List</text>
    <text x="255" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">-> [Doc 12, Doc 45, Doc 99]</text>
    <text x="255" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">-> [Doc 3, Doc 12, Doc 88]</text>
    <text x="255" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">-> [Doc 1, Doc 4, Doc 12]</text>
  </g>
</svg>
```

---

## 3. Okapi BM25 Ranking Equation

Elasticsearch scores document relevance using Okapi BM25:

$$\text{Score}(D, Q) = \sum_{i=1}^{n} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

Where $f(q_i, D)$ is term frequency, $|D|$ is document length, $\text{avgdl}$ is average document length across index, and $k_1, b$ are tuning constants.

---

## 4. Production Python Elasticsearch Search Query

```python
from elasticsearch import Elasticsearch

es = Elasticsearch(["http://localhost:9200"])

query_body = {
    "query": {
        "bool": {
            "must": [
                {"match": {"title": "distributed systems"}}
            ],
            "filter": [
                {"range": {"published_year": {"gte": 2020}}}
            ]
        }
    }
}

res = es.search(index="tech-articles", body=query_body)
print(f"Total matching docs: {res['hits']['total']['value']}")
```
""",

    'search-solr': r"""# Apache Solr Architecture: Lucene Core, SolrCloud, Zookeeper & Faceted Search

![Solr](/images/backend/search-solr-dark.png)

## 1. System Overview

Apache Solr is an enterprise search platform built on Apache Lucene, featuring distributed indexing, SolrCloud Zookeeper integration, and high-performance faceted search.

---

## 2. Conceptual Check Questions

1. **How does SolrCloud achieve high availability?**
   *Answer:* Apache Zookeeper manages cluster topology, leader election per shard, and automatic failover.
""",

    'realtime-sse': r"""# Server-Sent Events (SSE): HTTP Streaming, Unidirectional Pushes & Reconnection

![SSE](/images/backend/realtime-sse-dark.png)

## 1. System Overview & Protocol Mechanics

Server-Sent Events (SSE) provide a standardized HTTP-based mechanism for servers to push real-time text event streams to web clients over a single persistent HTTP connection.

Unlike WebSockets (which require a custom `ws://` protocol upgrade and full-duplex framing), SSE operates over standard HTTP with `Content-Type: text/event-stream`.

---

## 2. SSE Frame Format Architecture

```
event: order_status
id: 10492
data: {"status": "SHIPPED", "tracking": "TRK-9812"}

```

---

## 3. Production Node.js SSE Express Server Code

```javascript
const express = require('express');
const app = express();

app.get('/events', (req, res) => {
  // Set SSE HTTP Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Push initial event
  res.write(`data: ${JSON.stringify({ message: 'Connected to event stream' })}\n\n`);

  // Push periodic updates
  const timer = setInterval(() => {
    res.write(`id: ${Date.now()}\n`);
    res.write(`event: price_update\n`);
    res.write(`data: ${JSON.stringify({ symbol: 'BTC', price: 65000 + Math.random() * 100 })}\n\n`);
  }, 2000);

  req.on('close', () => {
    clearInterval(timer);
    res.end();
  });
});

app.listen(3000, () => console.log('SSE server running on port 3000'));
```
""",

    'realtime-websockets': r"""# WebSockets Architecture: TCP Handshake, Framing, Duplex Communication & Socket Scaling

![WebSockets](/images/backend/realtime-websockets-dark.png)

## 1. System Overview & Protocol Mechanics

WebSockets (`RFC 6455`) establish persistent, full-duplex, bi-directional communication channels over a single TCP connection.

Communication begins with an HTTP/1.1 Upgrade Handshake:
```http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

---

## 2. WebSocket Framing Topology

```svg
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="14" font-family="sans-serif" font-weight="bold">WebSocket Binary Frame Protocol Header</text>

  <g transform="translate(40, 60)">
    <rect width="520" height="100" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="15" y="30" fill="#60a5fa" font-size="11" font-family="monospace">FIN (1b) | RSV (3b) | Opcode (4b) | MASK (1b) | Payload Length (7b / 16b / 64b)</text>
    <text x="15" y="60" fill="#a1a1aa" font-size="10" font-family="monospace">Masking-Key (32 bits, client-to-server frames)</text>
    <text x="15" y="85" fill="#34d399" font-size="10" font-family="monospace">Payload Data (Transferred raw binary / text)</text>
  </g>
</svg>
```

---

## 3. Production Node.js WebSocket Server Code (`ws`)

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New client connected.');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Broadcast message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Echo: ${message}`);
      }
    });
  });
});
```
"""
}

with open('./scratch/b2_data.json', 'w', encoding='utf-8') as f:
    json.dump(ARTICLES_B2, f, ensure_ascii=False)

print("Batch 2 saved successfully!")
