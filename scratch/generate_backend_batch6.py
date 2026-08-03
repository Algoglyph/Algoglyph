import json
import sys

b6_articles = {}

# 36. Monitoring
b6_articles['scale-obs-monitoring'] = r"""# Production System Monitoring: SLIs, SLOs, SLAs & Metrics Aggregation

Monitoring is the operational process of collecting, aggregating, and analyzing quantitative metrics to track system availability, performance, and error budgets. This article covers **SLIs** (Service Level Indicators), **SLOs** (Service Level Objectives), and **SLAs** (Service Level Agreements).

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="monBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#monBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">SLI, SLO & SLA Alignment and Error Budgeting</text>

  <rect x="80" y="110" width="220" height="180" rx="8" fill="#0284c7"/>
  <text x="190" y="150" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">SLI (Indicator)</text>
  <text x="190" y="190" text-anchor="middle" fill="#e0f2fe" font-size="12">Measured Latency: 99.2% &lt; 200ms</text>

  <rect x="340" y="110" width="220" height="180" rx="8" fill="#059669"/>
  <text x="450" y="150" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">SLO (Internal Goal)</text>
  <text x="450" y="190" text-anchor="middle" fill="#d1fae5" font-size="12">Target Goal: 99.0% &lt; 200ms</text>

  <rect x="600" y="110" width="220" height="180" rx="8" fill="#d97706"/>
  <text x="710" y="150" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">SLA (Contract)</text>
  <text x="710" y="190" text-anchor="middle" fill="#fef3c7" font-size="12">Legal Penalty: &lt; 95% = Refund</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is an SLI?
A Service Level Indicator (SLI) is a quantifiable metric measuring the performance of a service (e.g. HTTP 200 success rate over total requests).

### Q2: What is an SLO?
A Service Level Objective (SLO) is an internal target reliability goal for an SLI (e.g. 99.9% uptime over a 30-day window).

### Q3: What is an Error Budget?
An Error Budget is the allowable room for system failure calculated as $100\% - \text{SLO}$. (e.g. 99.9% SLO = 0.1% error budget).

### Q4: What happens when an Error Budget is exhausted?
Teams freeze feature deployments and focus exclusively on stability engineering until the budget replenishes.

### Q5: How does an SLA differ from an SLO?
An SLA (Service Level Agreement) is a legally binding contract with customers specifying financial penalties if service availability falls below a defined threshold.
"""

# 37. Telemetry
b6_articles['scale-obs-telemetry'] = r"""# Distributed Telemetry Pipelines: Vector, FluentBit & Data Routing

Telemetry pipelines collect, transform, batch, and route high-volume log streams, system metrics, and trace spans from application nodes to central storage platforms.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="telBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#telBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">High-Performance Telemetry Pipeline Routing (Vector / FluentBit)</text>

  <rect x="80" y="120" width="180" height="130" rx="8" fill="#2563eb"/>
  <text x="170" y="175" text-anchor="middle" fill="#fff" font-weight="700">App Logs / Metrics</text>

  <rect x="350" y="120" width="200" height="130" rx="8" fill="#7c3aed"/>
  <text x="450" y="175" text-anchor="middle" fill="#fff" font-weight="700">Vector Aggregator</text>

  <rect x="640" y="80" width="180" height="70" rx="6" fill="#059669"/>
  <text x="730" y="120" text-anchor="middle" fill="#fff" font-size="13">Elasticsearch (Logs)</text>

  <rect x="640" y="200" width="180" height="70" rx="6" fill="#d97706"/>
  <text x="730" y="240" text-anchor="middle" fill="#fff" font-size="13">Prometheus (Metrics)</text>

  <path d="M 260 185 L 350 185" stroke="#60a5fa" stroke-width="3"/>
  <path d="M 550 160 L 640 115" stroke="#a78bfa" stroke-width="2"/>
  <path d="M 550 210 L 640 235" stroke="#a78bfa" stroke-width="2"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: Why use a telemetry aggregator like Vector or FluentBit?
Aggregators offload log parsing, buffering, enrichment, and multi-destination routing from application processes, saving CPU and RAM.

### Q2: What is the difference between Fluentd and FluentBit?
Fluentd is written in Ruby/C and feature-rich. FluentBit is written in pure C, using 10x less memory, designed for resource-constrained containers and K8s nodes.

### Q3: How do telemetry agents handle backpressure when storage endpoints fail?
Agents use local disk or memory buffering (`disk_buffer`) to queue telemetry events until destination backends recover.

### Q4: What is Log Sampling?
Log sampling drops repetitive info/debug logs while retaining all error logs to reduce storage costs.

### Q5: How does Vector achieve high throughput?
Vector is written in Rust, leveraging memory safety, zero-cost abstractions, and multithreaded async I/O.
"""

# 38. Graceful Degradation
b6_articles['mit-graceful'] = r"""# Graceful Degradation: Fallback Modes, Feature Flags & Shedding Non-Critical Workloads

Graceful Degradation is a resilience design strategy that allows a system to remain partially operational when component failures or severe resource exhaustion occur, serving essential features while disabling non-critical functionality.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gdBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#gdBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Graceful Degradation Primary vs Fallback Execution Path</text>

  <rect x="80" y="120" width="180" height="130" rx="8" fill="#2563eb"/>
  <text x="170" y="175" text-anchor="middle" fill="#fff" font-weight="700">User Request</text>

  <rect x="350" y="80" width="200" height="80" rx="6" fill="#059669"/>
  <text x="450" y="125" text-anchor="middle" fill="#fff" font-weight="600">Personalized AI Recs (Primary)</text>

  <rect x="350" y="200" width="200" height="80" rx="6" fill="#d97706"/>
  <text x="450" y="245" text-anchor="middle" fill="#fff" font-weight="600">Static Popular Cache (Fallback)</text>

  <rect x="640" y="140" width="180" height="80" rx="6" fill="#64748b"/>
  <text x="730" y="185" text-anchor="middle" fill="#fff" font-size="13">UI Page Output</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is the primary objective of Graceful Degradation?
To prevent total application downtime by serving reduced functionality (cached or static data) when backends fail.

### Q2: How do Feature Flags assist in Graceful Degradation?
Feature Flags allow engineers or automated controllers to disable heavy features (like real-time recommendations) instantly without deploying code.

### Q3: What is a Static Fallback?
A static fallback returns pre-calculated default responses or cached snapshots when underlying database services time out.

### Q4: How does Graceful Degradation differ from Circuit Breaking?
Graceful Degradation defines *what alternative data to return* when a failure happens. Circuit Breaking defines *when to stop sending traffic* to a failing dependency.

### Q5: Give a real-world example of Graceful Degradation.
An e-commerce site under peak Black Friday load displays cached product details without personalized recommendations rather than showing an HTTP 500 error.
"""

# 39. Throttling
b6_articles['mit-throttling'] = r"""# Rate Limiting & Throttling: Token Bucket, Leaky Bucket & Sliding Window Log Algorithms

Rate limiting and throttling protect backend APIs from resource exhaustion, abuse, and Denial-of-Service (DoS) attacks by controlling the rate of incoming requests per client.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#tbBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Token Bucket Rate Limiting Algorithm Mechanics</text>

  <rect x="350" y="80" width="200" height="200" rx="10" fill="#1e3a8a" stroke="#60a5fa" stroke-width="2"/>
  <text x="450" y="115" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">Token Bucket (Cap: 10)</text>

  <circle cx="410" cy="160" r="15" fill="#f59e0b"/><circle cx="450" cy="160" r="15" fill="#f59e0b"/><circle cx="490" cy="160" r="15" fill="#f59e0b"/>
  <circle cx="430" cy="200" r="15" fill="#f59e0b"/><circle cx="470" cy="200" r="15" fill="#f59e0b"/>

  <text x="450" y="250" text-anchor="middle" fill="#93c5fd" font-size="12">Refill Rate: 2 Tokens / sec</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: How does the Token Bucket algorithm handle request bursts?
Token Bucket accumulates tokens up to a maximum capacity. A burst of requests can consume all available tokens instantly before rate limiting kicks in.

### Q2: How does Leaky Bucket differ from Token Bucket?
Leaky Bucket processes incoming requests at a smooth, constant output rate regardless of burst size. Token Bucket allows bursts up to bucket capacity.

### Q3: What is the Sliding Window Counter algorithm?
Sliding Window Counter estimates request counts by combining the weighted request count of the previous window with the current window count.

### Q4: Where should Rate Limiting be implemented?
At the API Gateway (Kong, Nginx, Envoy) or middleware layer backed by a fast in-memory store like Redis.

### Q5: What HTTP status code is returned when a client is rate limited?
`HTTP 429 Too Many Requests` along with headers like `Retry-After: 30`.
"""

# 40. Backpressure
b6_articles['mit-backpressure'] = r"""# Backpressure Mechanics: Reactive Streams, Flow Control & Buffer Management

Backpressure is a flow-control mechanism in asynchronous systems that prevents a fast data producer from overwhelming a slower consumer by signaling consumer capacity limits.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bpBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#bpBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Reactive Stream Backpressure Flow Control Signaling</text>

  <rect x="80" y="120" width="180" height="130" rx="8" fill="#dc2626"/>
  <text x="170" y="175" text-anchor="middle" fill="#fff" font-weight="700">Fast Producer</text>

  <rect x="640" y="120" width="180" height="130" rx="8" fill="#059669"/>
  <text x="730" y="175" text-anchor="middle" fill="#fff" font-weight="700">Slow Consumer</text>

  <path d="M 260 160 L 640 160" stroke="#f87171" stroke-width="3"/>
  <text x="450" y="150" text-anchor="middle" fill="#f87171" font-size="12">High-Volume Data Stream</text>

  <path d="M 640 210 L 260 210" stroke="#34d399" stroke-width="3"/>
  <text x="450" y="200" text-anchor="middle" fill="#34d399" font-size="12">Backpressure Signal (request(N) = 5)</text>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What happens if a system lacks backpressure controls?
Without backpressure, unconsumed messages accumulate in memory buffers until the worker application runs out of RAM and crashes with Out-Of-Memory (OOM).

### Q2: What is Pull-Based Flow Control?
In pull-based flow control (such as Reactive Streams `request(n)`), the consumer explicitly requests $N$ items from the producer only when ready to process them.

### Q3: What strategies can be applied when buffers fill up?
1. Drop newest items (Drop Tail). 2. Drop oldest items (Drop Head). 3. Block producer until space is available. 4. Fail fast with an error.

### Q4: How does TCP implement network backpressure?
TCP uses **Sliding Window Flow Control**. The receiver advertises its available buffer size (`Window Size`) in TCP ACK packets, prompting the sender to pause when window reaches 0.

### Q5: What is Reactive Streams specification?
Reactive Streams is an industry standard (implemented by RxJava, Project Reactor, Akka Streams) providing non-blocking backpressure flow control across async boundaries.
"""

# 41. Loadshifting
b6_articles['mit-loadshifting'] = r"""# Global Load Shifting & Traffic Shedding: Geo-DNS, Anycast & Load Shedding

Global Load Shifting and Traffic Shedding are traffic management strategies used to dynamically redirect or drop incoming traffic to maintain infrastructure stability during regional outages or massive spikes.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lsBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#lsBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Geo-DNS Global Traffic Shifting Across Regions</text>

  <rect x="80" y="130" width="160" height="100" rx="8" fill="#6366f1"/>
  <text x="160" y="185" text-anchor="middle" fill="#fff" font-weight="700">Geo-DNS / Anycast</text>

  <rect x="420" y="80" width="200" height="80" rx="6" fill="#dc2626"/>
  <text x="520" y="125" text-anchor="middle" fill="#fff" font-weight="600">US-East (Overloaded)</text>

  <rect x="420" y="200" width="200" height="80" rx="6" fill="#059669"/>
  <text x="520" y="245" text-anchor="middle" fill="#fff" font-weight="600">US-West (Active Shift)</text>

  <path d="M 240 180 L 420 240" stroke="#34d399" stroke-width="3"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What is Load Shedding?
Load Shedding is the intentional dropping of low-priority incoming requests when a system reaches critical CPU/memory saturation to preserve core service stability.

### Q2: What is Geo-DNS Traffic Shifting?
Geo-DNS returns different IP address routing results based on the geographic location or health status of regional datacenters.

### Q3: What is BGP Anycast routing?
Anycast advertises the exact same IP address from multiple geographically distributed datacenters, letting internet routers direct traffic to the nearest healthy node.

### Q4: How does priority-based Load Shedding work?
Requests are assigned priorities (e.g. `Payment` = High, `Analytics` = Low). Under heavy load, the API gateway sheds low-priority traffic first.

### Q5: What is the danger of sudden Global Traffic Shifting?
Shifting 100% of traffic from an outage region to a healthy region can cause a **Cascading Failure** by instantly overwhelming the destination region.
"""

# 42. Circuit Breaker
b6_articles['mit-circuit'] = r"""# Circuit Breaker Pattern: State Machine (Closed, Open, Half-Open) & Resilience4j

The Circuit Breaker pattern prevents an application from repeatedly executing an operation that is guaranteed to fail (such as invoking an unresponsive downstream microservice), allowing the failing service time to recover.

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#cbBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Circuit Breaker State Machine Transition Flow</text>

  <circle cx="200" cy="180" r="50" fill="#059669"/>
  <text x="200" y="185" text-anchor="middle" fill="#fff" font-weight="700" font-size="15">CLOSED</text>

  <circle cx="700" cy="180" r="50" fill="#dc2626"/>
  <text x="700" y="185" text-anchor="middle" fill="#fff" font-weight="700" font-size="15">OPEN</text>

  <circle cx="450" cy="300" r="50" fill="#d97706"/>
  <text x="450" y="305" text-anchor="middle" fill="#fff" font-weight="700" font-size="14">HALF-OPEN</text>

  <path d="M 250 180 L 650 180" stroke="#f87171" stroke-width="3"/>
  <text x="450" y="170" text-anchor="middle" fill="#f87171" font-size="12">Failure Threshold Exceeded</text>

  <path d="M 700 230 L 500 300" stroke="#fbbf24" stroke-width="2"/>
  <path d="M 400 300 L 200 230" stroke="#34d399" stroke-width="2"/>
</svg>

---

## 1. Frequently Asked Questions (FAQs)

### Q1: What are the 3 states of a Circuit Breaker?
1. **CLOSED**: Normal operation; requests pass through. 2. **OPEN**: Failure threshold exceeded; requests fail immediately without calling downstream service. 3. **HALF-OPEN**: Trial state; limited test requests pass to check if service recovered.

### Q2: Why is the OPEN state beneficial for failing microservices?
Failing services often collapse under incoming load. The OPEN state gives the service breathing room to recover without receiving traffic.

### Q3: What triggers the transition from CLOSED to OPEN?
When the error rate (e.g., > 50% failures over a sliding window of 100 requests) exceeds the configured failure rate threshold.

### Q4: What happens during HALF-OPEN state?
A small batch of trial requests is permitted through. If they succeed, the circuit resets to **CLOSED**. If any fail, it trips back to **OPEN**.

### Q5: What Java and Node.js libraries implement Circuit Breakers?
Resilience4j in Java, Cockatiel or Opossum in Node.js/TypeScript, and Go-breaker in Go.
"""

# Export Batch 6
output_path = './scratch/batch_6.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(b6_articles, f, indent=2, ensure_ascii=False)

print(f"Saved Batch 6 JSON to {output_path} with {len(b6_articles)} articles.")
