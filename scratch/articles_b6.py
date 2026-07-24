# -*- coding: utf-8 -*-
import json

ARTICLES_B6 = {
    'scale-obs-monitoring': r"""# Monitoring & Data Observability: SLA, SLO, SLI & Prometheus Alerting

![Monitoring](/images/backend/scale-obs-monitoring-dark.png)

## 1. System Overview & The Four Golden Signals

System Monitoring continuously tracks system health, availability, performance, and resource utilization.

The Four Golden Signals of Monitoring (Google SRE):
1. **Latency**: Time taken to service a request (distinguishing success vs failure latency).
2. **Traffic**: Demand placed on the system (RPS, transactions/sec).
3. **Errors**: Rate of requests that fail (HTTP 5xx, uncaught exceptions).
4. **Saturation**: Utilization of most constrained system resources (CPU %, Memory %, Disk I/O).

---

## 2. Service Level Terms (SLI, SLO, SLA) Matrix

| Term | Definition | Formula / Representation |
| :--- | :--- | :--- |
| **SLI (Indicator)** | Quantifiable metric of service performance. | $\text{SLI} = \frac{\text{Good Events}}{\text{Total Events}} \times 100\%$ |
| **SLO (Objective)** | Internal target set by engineering team. | $\text{SLO} = 99.9\% \quad (\text{Three Nines})$ |
| **SLA (Agreement)** | Legal contract with customers with financial penalties. | $\text{SLA} = 99.5\%$ |

---

## 3. Error Budget Calculation Mathematics

Error Budget $E_{\text{budget}}$ for target SLO $= 99.9\%$ over a 30-day window ($43,200\text{ minutes}$):

$$E_{\text{budget}} = 100\% - 99.9\% = 0.1\%$$
$$\text{Allowed Downtime} = 43,200 \times 0.001 = 43.2\text{ minutes / month}$$

---

## 4. Production Prometheus Alerting Rules YAML

```yaml
groups:
- name: APIAlerts
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "HTTP 5xx Error rate exceeds 5% over 5-minute window"
```
""",

    'scale-obs-telemetry': r"""# Telemetry & Distributed Tracing: Context Propagation, W3C TraceContext & Span Graphs

![Telemetry](/images/backend/scale-obs-telemetry-dark.png)

## 1. System Overview

Distributed Tracing tracks requests as they travel across multi-tier microservices, message queues, and database engines.

Tracing metadata travels across network calls using the **W3C TraceContext** header:
```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```
""",

    'mit-graceful': r"""# Graceful Degradation Architecture: Fallbacks, Feature Toggles & Static Render Reserves

![Graceful Degradation](/images/backend/mit-graceful-dark.png)

## 1. System Overview & Resilience Patterns

Graceful Degradation ensures that under heavy load, partial infrastructure outages, or database failures, an application degrades functionality gracefully rather than suffering total systemic collapse.

Techniques:
1. **Fallback Caches**: Serving stale read cache data when backend databases fail.
2. **Feature Toggles**: Dynamically disabling non-essential features (e.g. recommendation algorithms) to preserve core checkout flows.
3. **Static Render Reserves**: Returning static HTML pages when microservices timeout.

---

## 2. Production Python Graceful Fallback Code

```python
import redis
import time

r = redis.Redis(host='localhost', port=6379)

def get_user_recommendations(user_id: str):
    try:
        # Attempt primary ML recommendation call (Timeout 500ms)
        recommendations = fetch_ml_recommendations_rpc(user_id, timeout=0.5)
        # Store successful output in fallback cache
        r.set(f"rec_fallback:{user_id}", json.dumps(recommendations), ex=86400)
        return recommendations
    except Exception as e:
        print(f"[Degradation Triggered] ML service failed: {e}. Falling back to cached recommendations...")
        cached = r.get(f"rec_fallback:{user_id}")
        if cached:
            return json.loads(cached)
        # Final static fallback
        return ["Popular Product 1", "Popular Product 2"]
```
""",

    'mit-throttling': r"""# Throttling & Rate Limiting: Token Bucket, Leaky Bucket, Sliding Window & Distributed Redis Limits

![Throttling](/images/backend/mit-throttling-dark.png)

## 1. System Overview & Algorithm Mechanics

Rate Limiting and Throttling control the rate of incoming traffic to protect APIs and database infrastructure from denial-of-service, abusive bots, or unexpected traffic spikes.

Core Algorithms:
1. **Token Bucket**: Refills tokens into a bucket at rate $r$. Allows burst throughput up to capacity $B$.
2. **Leaky Bucket**: Queues incoming requests and processes them at a smooth, constant rate $out$.
3. **Sliding Window Log**: Tracks exact request timestamps in a sliding temporal window $[t - W, t]$.

---

## 2. Token Bucket vs Leaky Bucket Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="14" font-family="sans-serif" font-weight="bold">Token Bucket vs Leaky Bucket Rate Limiters</text>

  <g transform="translate(40, 60)">
    <rect width="220" height="130" rx="6" fill="#18181b" stroke="#10b981"/>
    <text x="110" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Token Bucket (Allows Bursts)</text>
    <text x="15" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• Refill Rate: r tokens/sec</text>
    <text x="15" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">• Bucket Capacity: B</text>
    <text x="15" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">• Take 1 token per request</text>

    <rect x="260" y="0" width="220" height="130" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="370" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Leaky Bucket (Smooth Flow)</text>
    <text x="275" y="55" fill="#a1a1aa" font-size="10" font-family="monospace">• Inflow: Variable burst</text>
    <text x="275" y="80" fill="#a1a1aa" font-size="10" font-family="monospace">• Outflow: Fixed constant rate</text>
    <text x="275" y="105" fill="#a1a1aa" font-size="10" font-family="monospace">• Overflow: Dropped requests</text>
  </g>
</svg>
```

---

## 3. Production Redis Lua Script Token Bucket Limiter

```lua
-- KEYS[1]: Rate limit key (e.g. ratelimit:user_409)
-- ARGV[1]: Capacity B
-- ARGV[2]: Refill rate per sec
-- ARGV[3]: Current timestamp
-- ARGV[4]: Requested tokens (1)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local info = redis.call("HMGET", key, "tokens", "last_update")
local tokens = tonumber(info[1])
local last_update = tonumber(info[2])

if not tokens then
    tokens = capacity
    last_update = now
else
    local delta = math.max(0, now - last_update)
    tokens = math.min(capacity, tokens + delta * refill_rate)
    last_update = now
end

if tokens >= requested then
    tokens = tokens - requested
    redis.call("HMSET", key, "tokens", tokens, "last_update", last_update)
    return 1 -- Allowed
else
    return 0 -- Denied (Throttled)
end
```
""",

    'mit-backpressure': r"""# Backpressure & Flow Control: Reactive Streams, Producer Rate Regulation & Queue Boundaries

![Backpressure](/images/backend/mit-backpressure-dark.png)

## 1. System Overview & Flow Control Dynamics

Backpressure is an essential feedback mechanism in distributed data pipelines where a slow consumer explicitly signals a fast producer to slow down or halt data transmission.

Without backpressure:
$$\text{Rate}_{\text{Producer}} > \text{Rate}_{\text{Consumer}} \implies \text{Buffer Growth} \to \text{Memory Exhaustion / Crash}$$

---

## 2. Production Node.js Stream Backpressure Code

```javascript
const fs = require('fs');

const readStream = fs.createReadStream('large_dataset.log');
const writeStream = fs.createWriteStream('processed_dataset.log');

readStream.on('data', (chunk) => {
  // Push data to writeStream. If buffer full, pause reading!
  const bufferOk = writeStream.write(chunk);
  if (!bufferOk) {
    console.log('[Backpressure Triggered] Consumer buffer full! Pausing producer stream...');
    readStream.pause();
  }
});

// Resume producer when writeStream drains
writeStream.on('drain', () => {
  console.log('[Backpressure Released] Consumer buffer drained! Resuming producer stream...');
  readStream.resume();
});
```
""",

    'mit-loadshifting': r"""# Load Shifting & Shedding: Priority Queues, Shedding Under Load & Active Traffic Steering

![Load Shifting](/images/backend/mit-loadshifting-dark.png)

## 1. System Overview

Load Shedding deliberately rejects low-priority non-critical requests when a system approaches CPU or memory saturation to protect high-priority transaction traffic.
""",

    'mit-circuit': r"""# Circuit Breaker Architecture: Closed, Open & Half-Open State Transitions (Resilience4j / Hystrix)

![Circuit Breaker](/images/backend/mit-circuit-dark.png)

## 1. System Overview & State Machine Mechanics

A Circuit Breaker wraps network calls to remote services. When downstream failures cross a defined threshold, the Circuit Breaker trips to prevent application threads from hanging on unresponsive services.

The 3 Circuit States:
1. **Closed (Normal)**: Requests pass through to remote service. Failure counter monitored.
2. **Open (Tripped)**: Requests fail immediately locally without making network calls.
3. **Half-Open (Testing)**: Allows a trial subset of requests through to check if remote service has recovered.

---

## 2. State Machine Transition Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#a855f7" font-size="14" font-family="sans-serif" font-weight="bold">Circuit Breaker State Machine</text>

  <g transform="translate(40, 60)">
    <rect width="130" height="110" rx="6" fill="#18181b" stroke="#10b981"/>
    <text x="65" y="45" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">CLOSED</text>
    <text x="65" y="70" fill="#a1a1aa" font-size="9" text-anchor="middle" font-family="monospace">Normal Operation</text>

    <rect x="195" y="0" width="130" height="110" rx="6" fill="#18181b" stroke="#ef4444"/>
    <text x="260" y="45" fill="#f87171" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">OPEN</text>
    <text x="260" y="70" fill="#a1a1aa" font-size="9" text-anchor="middle" font-family="monospace">Fast Failure</text>

    <rect x="390" y="0" width="130" height="110" rx="6" fill="#18181b" stroke="#f59e0b"/>
    <text x="455" y="45" fill="#fbbf24" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">HALF-OPEN</text>
    <text x="455" y="70" fill="#a1a1aa" font-size="9" text-anchor="middle" font-family="monospace">Trial Recovery</text>
  </g>
</svg>
```

---

## 3. Production Python Circuit Breaker Implementation

```python
import time

class CircuitBreakerOpenException(Exception): pass

class CircuitBreaker:
    def __init__(self, failure_threshold=3, recovery_time=10):
        self.failure_threshold = failure_threshold
        self.recovery_time = recovery_time
        self.state = "CLOSED"
        self.failure_count = 0
        self.last_state_change = time.time()

    def call(self, func, *args, **kwargs):
        now = time.time()
        
        if self.state == "OPEN":
            if now - self.last_state_change > self.recovery_time:
                self.state = "HALF-OPEN"
                print("[Circuit Breaker] Transitioning to HALF-OPEN state...")
            else:
                raise CircuitBreakerOpenException("Circuit Breaker is OPEN. Call rejected immediately.")

        try:
            result = func(*args, **kwargs)
            if self.state == "HALF-OPEN":
                self.state = "CLOSED"
                self.failure_count = 0
                print("[Circuit Breaker] Service recovered! Transitioning to CLOSED state.")
            return result
        except Exception as e:
            self.failure_count += 1
            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"
                self.last_state_change = now
                print(f"[Circuit Breaker] Threshold reached! Tripping to OPEN state.")
            raise e
```
"""
}

with open('./scratch/b6_data.json', 'w', encoding='utf-8') as f:
    json.dump(ARTICLES_B6, f, ensure_ascii=False)

print("Batch 6 saved successfully!")
