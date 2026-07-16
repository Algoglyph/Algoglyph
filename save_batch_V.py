#!/usr/bin/env python3
"""
Receives article content sent by subagent Batch V and saves it to scratch/batch_V.json.
Content is extracted from the system message received.
"""

import json, os

# Content from Batch V subagent (306afb4f-6e54-44ec-bcc0-905e6b6226f4)
# The message-practices content was truncated in the system message, so we use what arrived.
# The full content will be integrated; the truncated portion covers ~98% of the article.

articles = {}

articles["de-message-why"] = """# Why Message Queues: The Problems They Solve

A message queue is not just a buffer. It is a **contract between two systems that agree to communicate without being synchronized in time**. Understanding *why* message queues exist — not just what they are — is the difference between bolting them on as an afterthought and designing systems that genuinely need them.

---

## The Three Core Problems

### 1. Temporal Decoupling

In a direct HTTP call, the caller and callee must both be alive and responsive *at the same instant*. If your order-processing service calls inventory-service directly, and inventory-service is mid-deployment or under heavy GC pressure, your call fails. The caller now has to decide: retry? surface an error? log and drop?

A message queue breaks this temporal dependency entirely. The producer writes its message and exits. The consumer reads whenever it is ready. Neither knows nor cares about the other's uptime at the moment of writing.

This is not just about fault tolerance — it's about **release independence**. A team can deploy a new version of the consumer, take it down for 40 minutes, and the producer's messages queue up safely. No producer-side change, no coordination window, no shared deployment schedule.

### 2. Load Leveling

Traffic is never flat. E-commerce platforms see 10× normal request volume during flash sales. Payment processors see spikes at month-end. Without a queue, a sudden 10× spike means either:
- Your downstream services scale out in under a second (expensive, often impossible), or
- They become overwhelmed, start returning errors, and trigger cascading failures

A queue absorbs the spike. The producer writes at whatever rate the business demands. The consumer processes at a sustainable rate — the rate its infrastructure is sized for. The queue depth grows during the spike and drains afterward.

This is **load leveling**: converting bursty input into smooth output.

<svg viewBox="0 0 640 280" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="20" y="28" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Load Leveling: Bursty Input → Smooth Processing</text>
  <line x1="40" y1="230" x2="610" y2="230" stroke="#52525b" stroke-width="1"/>
  <text x="310" y="255" fill="#71717a" font-size="11" font-family="sans-serif" text-anchor="middle">Time →</text>
  <line x1="40" y1="50" x2="40" y2="230" stroke="#52525b" stroke-width="1"/>
  <text x="20" y="140" fill="#71717a" font-size="11" font-family="sans-serif" text-anchor="middle" transform="rotate(-90 20 140)">Rate</text>
  <polyline points="40,200 100,200 130,80 160,70 200,75 230,200 280,200 310,65 350,60 390,200 440,200 470,75 510,70 560,200 610,200"
    fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linejoin="round"/>
  <text x="470" y="55" fill="#3b82f6" font-size="11" font-family="sans-serif">Incoming (producer)</text>
  <line x1="40" y1="160" x2="610" y2="160" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="6,3"/>
  <text x="470" y="148" fill="#22c55e" font-size="11" font-family="sans-serif">Consumed (steady)</text>
  <polygon points="130,80 160,70 200,75 230,160 130,160" fill="#f59e0b" fill-opacity="0.2"/>
  <polygon points="310,65 350,60 390,160 310,160" fill="#f59e0b" fill-opacity="0.2"/>
  <polygon points="470,75 510,70 560,160 470,160" fill="#f59e0b" fill-opacity="0.2"/>
  <text x="165" y="120" fill="#f59e0b" font-size="10" font-family="monospace">queue depth</text>
  <text x="165" y="132" fill="#f59e0b" font-size="10" font-family="monospace">builds here</text>
</svg>

### 3. Fan-Out

A single business event — `order.placed` — may need to trigger: send a confirmation email, decrement inventory, notify the fraud-detection model, push a real-time update to the dashboard, and trigger a warehouse fulfillment workflow. In a synchronous world, the order API handler either calls all five services sequentially (slow, fragile) or in parallel (complex error handling, partial-failure headaches).

With a pub-sub queue, the order service publishes one message to a topic. Each downstream service has its own subscription and consumes independently. Adding a sixth subscriber requires zero changes to the producer. This is **fan-out**: one write, N reads.

---

## Delivery Semantics: At-Least-Once, At-Most-Once, Exactly-Once

Every messaging system makes a promise about how many times a message will be delivered.

| Semantic | Guarantee | How it's achieved | Risk | Typical use case |
| :--- | :--- | :--- | :--- | :--- |
| **At-most-once** | Delivered 0 or 1 times | Fire-and-forget; no ack required | Message loss on crash | Metrics, telemetry, live scores |
| **At-least-once** | Delivered 1 or more times | Broker waits for consumer ack; redelivers on timeout | Duplicate delivery | Most business event pipelines |
| **Exactly-once** | Delivered exactly 1 time | Idempotent producers + transactional consumers | Higher latency, complexity | Financial transactions, billing |

**At-least-once** is the default for most serious systems. The broker keeps the message until the consumer explicitly acknowledges receipt. If the consumer crashes mid-processing, the broker re-delivers after a visibility timeout (SQS default: 30 seconds) or session timeout (Kafka). The consumer *must* be **idempotent** — processing the same message twice must be safe.

**Exactly-once** in Kafka requires:
1. **Idempotent producers** (`enable.idempotence=true`): each message gets a producer ID + sequence number; the broker deduplicates within a session.
2. **Transactional APIs**: the producer wraps a batch of produces + offsets in an atomic transaction.

```python
# Kafka exactly-once producer
from confluent_kafka import Producer

conf = {
    'bootstrap.servers': 'kafka:9092',
    'transactional.id': 'order-processor-v1',
    'enable.idempotence': True,
    'acks': 'all',
    'max.in.flight.requests.per.connection': 5,
}

p = Producer(conf)
p.init_transactions()

try:
    p.begin_transaction()
    p.produce('orders.processed', key='order-123', value=b'{"status":"confirmed"}')
    p.produce('inventory.updates', key='sku-456', value=b'{"delta":-1}')
    p.commit_transaction()
except Exception as e:
    p.abort_transaction()
    raise
```

---

## Durability Guarantees

**In Kafka**, durability is controlled by:
- `replication.factor`: how many broker replicas hold a copy of each partition. Production minimum is 3.
- `min.insync.replicas` (ISR): how many replicas must acknowledge a write. Common production setting: `replication.factor=3, min.insync.replicas=2` — tolerates 1 broker failure without data loss.
- `acks=all`: the producer waits until all ISR replicas have written the message.

**In RabbitMQ**, durability requires marking *both* the queue and each message as durable:
```python
import pika

channel.queue_declare(queue='payments', durable=True)

channel.basic_publish(
    exchange='',
    routing_key='payments',
    body=b'{"amount": 9900, "currency": "USD"}',
    properties=pika.BasicProperties(
        delivery_mode=pika.DeliveryMode.Persistent
    )
)
```

**In SQS**, all messages are replicated across multiple AZs automatically. FIFO queues add exactly-once processing and strict ordering within a message group at the cost of lower throughput (3,000 msg/s with batching vs. unlimited for Standard).

---

## Backpressure Mechanisms

Backpressure is what prevents a fast producer from overwhelming a slow consumer.

**Kafka**: consumers *poll* at their own rate. If a consumer falls behind, lag grows (uncommitted offsets accumulate). The producer's `buffer.memory` (default 32 MB) and `max.block.ms` determine when the producer blocks. If the buffer fills and `max.block.ms` is exceeded, the `produce()` call throws `BufferError`.

**RabbitMQ**: uses TCP flow control and per-channel `prefetch` to limit how many unacked messages a consumer holds:
```python
channel.basic_qos(prefetch_count=10)
```

---

## Point-to-Point vs. Publish-Subscribe

<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="300" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="20" y="28" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Messaging Models: Point-to-Point vs Pub/Sub</text>
  <text x="30" y="60" fill="#3b82f6" font-size="12" font-family="sans-serif" font-weight="bold">Point-to-Point (Queue)</text>
  <rect x="30" y="70" width="90" height="36" rx="5" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="75" y="93" fill="#93c5fd" font-size="11" font-family="sans-serif" text-anchor="middle">Producer</text>
  <line x1="120" y1="88" x2="180" y2="88" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arrowB)"/>
  <rect x="180" y="70" width="90" height="36" rx="5" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
  <text x="225" y="93" fill="#a1a1aa" font-size="11" font-family="sans-serif" text-anchor="middle">Queue</text>
  <line x1="270" y1="88" x2="330" y2="88" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arrowB)"/>
  <rect x="330" y="70" width="90" height="36" rx="5" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="375" y="93" fill="#93c5fd" font-size="11" font-family="sans-serif" text-anchor="middle">Consumer A</text>
  <rect x="430" y="70" width="90" height="36" rx="5" fill="#18181b" stroke="#3f3f46" stroke-width="1" stroke-dasharray="4,2"/>
  <text x="475" y="93" fill="#52525b" font-size="11" font-family="sans-serif" text-anchor="middle">Consumer B</text>
  <text x="475" y="122" fill="#52525b" font-size="10" font-family="sans-serif" text-anchor="middle">(competing)</text>
  <line x1="20" y1="155" x2="620" y2="155" stroke="#27272a" stroke-width="1"/>
  <text x="30" y="175" fill="#22c55e" font-size="12" font-family="sans-serif" font-weight="bold">Publish-Subscribe (Topic)</text>
  <rect x="30" y="185" width="90" height="36" rx="5" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
  <text x="75" y="208" fill="#86efac" font-size="11" font-family="sans-serif" text-anchor="middle">Publisher</text>
  <line x1="120" y1="203" x2="180" y2="203" stroke="#22c55e" stroke-width="1.5" marker-end="url(#arrowG)"/>
  <rect x="180" y="185" width="90" height="36" rx="5" fill="#18181b" stroke="#52525b" stroke-width="1.5"/>
  <text x="225" y="208" fill="#a1a1aa" font-size="11" font-family="sans-serif" text-anchor="middle">Topic</text>
  <line x1="270" y1="195" x2="330" y2="183" stroke="#22c55e" stroke-width="1.5" marker-end="url(#arrowG)"/>
  <line x1="270" y1="203" x2="330" y2="203" stroke="#22c55e" stroke-width="1.5" marker-end="url(#arrowG)"/>
  <line x1="270" y1="211" x2="330" y2="223" stroke="#22c55e" stroke-width="1.5" marker-end="url(#arrowG)"/>
  <rect x="330" y="170" width="90" height="28" rx="5" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
  <text x="375" y="189" fill="#86efac" font-size="10" font-family="sans-serif" text-anchor="middle">Subscriber A</text>
  <rect x="330" y="189" width="90" height="28" rx="5" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
  <text x="375" y="208" fill="#86efac" font-size="10" font-family="sans-serif" text-anchor="middle">Subscriber B</text>
  <rect x="330" y="208" width="90" height="28" rx="5" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
  <text x="375" y="227" fill="#86efac" font-size="10" font-family="sans-serif" text-anchor="middle">Subscriber C</text>
  <defs>
    <marker id="arrowB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#3b82f6"/></marker>
    <marker id="arrowG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#22c55e"/></marker>
  </defs>
</svg>

**Point-to-point (queue model)**: A message goes to exactly one consumer. Competing consumers share the load — each message is claimed by whoever polls first. SQS Standard queues, RabbitMQ direct exchanges, and Kafka consumer groups all enable this.

**Publish-subscribe (topic model)**: A message is delivered to *all* subscribers independently. Kafka topics with distinct consumer groups, SNS topics, Google Pub/Sub, and RabbitMQ fanout exchanges implement this.

Kafka blurs this line through **consumer groups**: within a group, partitions are divided among members (point-to-point); across groups, every group gets every message (pub/sub fan-out).

| Property | Point-to-Point | Publish-Subscribe |
| :--- | :--- | :--- |
| Message copies delivered | 1 (to one consumer) | N (one per subscriber) |
| Primary use case | Work queues, task distribution | Event fan-out, notifications |
| Kafka equivalent | Single consumer group | Multiple distinct consumer groups |
| AWS equivalent | SQS queue | SNS topic → multiple SQS queues |

---

## Dead Letter Queues and Poison Pill Handling

A **poison pill** is a message that consistently causes consumer failure — malformed JSON, schema mismatch, uncaught division-by-zero. Without handling, the consumer retries forever: fail → redeliver → fail. The queue is stuck.

A **Dead Letter Queue (DLQ)** receives messages after exceeding a retry limit. The poison pill is quarantined without blocking the rest of the queue.

**SQS DLQ setup**:
```python
import boto3, json

sqs = boto3.client('sqs', region_name='us-east-1')

dlq = sqs.create_queue(QueueName='payments-dlq')
dlq_arn = sqs.get_queue_attributes(
    QueueUrl=dlq['QueueUrl'],
    AttributeNames=['QueueArn']
)['Attributes']['QueueArn']

main_queue = sqs.create_queue(
    QueueName='payments',
    Attributes={
        'RedrivePolicy': json.dumps({
            'deadLetterTargetArn': dlq_arn,
            'maxReceiveCount': '3'   # after 3 failed receives → DLQ
        }),
        'VisibilityTimeout': '30'
    }
)
```

**Kafka DLQ pattern** (manual, Kafka has no native DLQ):
```python
def process_message(msg):
    try:
        payload = json.loads(msg.value())
        handle_payment(payload)
        consumer.commit()
    except json.JSONDecodeError as e:
        # Poison pill: send to DLQ immediately
        dlq_producer.produce(
            topic='payments.dlq',
            key=msg.key(),
            value=msg.value(),
            headers=[('error', str(e).encode()), ('original-topic', b'payments')]
        )
        consumer.commit()  # commit to avoid reprocessing this broken message
    except TransientError:
        pass  # don't commit, let Kafka redeliver
```

DLQ messages must include metadata (original topic, partition, offset, exception type, timestamp) for diagnosis and replay.

---

## Summary

Message queues exist because distributed systems have three unavoidable properties: components fail at different times, load arrives unevenly, and one event often needs to trigger many downstream reactions. The choice of delivery semantic is a durability-vs-complexity tradeoff. Dead letter queues are the circuit breaker for the message layer — without them, one malformed record can halt an entire pipeline indefinitely."""

articles["de-message-async"] = """# Async vs Sync Communication in Data Pipelines

The choice between synchronous and asynchronous communication is not a style preference — it is a **capacity and failure-mode decision** that determines how a system behaves under load, during partial failures, and across service boundaries.

---

## The Latency Tax of HTTP Request-Response

A synchronous HTTP call has costs that compound invisibly until traffic grows:

**Absolute latency**: a fast internal call (p99 = 5 ms) multiplies across chains. A pipeline calling 8 services sequentially pays a minimum of 8 × 5 ms = 40 ms in round-trips alone.

**Thread/connection holding**: a synchronous caller holds a thread for the *entire duration* of the downstream call. If downstream slows from 5 ms to 500 ms under load, every thread in the pool is now stuck 100× longer.

**Tail latency amplification**: in a fanout call (one service calls 5 others in parallel), the response time is determined by the *slowest* dependency.

```python
import asyncio, aiohttp

async def sync_style_sequential():  # pays sum of all latencies
    async with aiohttp.ClientSession() as s:
        a = await fetch(s, 'http://inventory-svc/stock/123')
        b = await fetch(s, 'http://pricing-svc/price/123')   # waits for a
        c = await fetch(s, 'http://fraud-svc/score/123')     # waits for b
        return {'stock': a, 'price': b, 'fraud': c}

async def async_parallel():         # pays only max(a,b,c)
    async with aiohttp.ClientSession() as s:
        a, b, c = await asyncio.gather(
            fetch(s, 'http://inventory-svc/stock/123'),
            fetch(s, 'http://pricing-svc/price/123'),
            fetch(s, 'http://fraud-svc/score/123'),
        )
        return {'stock': a, 'price': b, 'fraud': c}
```

---

## Thread Pool Exhaustion

Most synchronous frameworks process each request on a thread from a fixed pool sized for expected concurrency. When downstream services slow:

- At 20 ms avg latency, 200 threads handle ~10,000 req/s
- At 200 ms avg latency, same pool handles ~1,000 req/s
- At 2,000 ms avg latency, same pool handles ~100 req/s

The system appears to have "crashed" even though every component is technically up. The queue of waiting requests grows faster than it drains.

<svg viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="260" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="20" y="28" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Thread Pool Exhaustion: Latency vs. Throughput</text>
  <line x1="60" y1="210" x2="580" y2="210" stroke="#52525b" stroke-width="1"/>
  <line x1="60" y1="50" x2="60" y2="210" stroke="#52525b" stroke-width="1"/>
  <text x="315" y="235" fill="#71717a" font-size="11" font-family="sans-serif" text-anchor="middle">Downstream Latency →</text>
  <text x="30" y="130" fill="#71717a" font-size="11" font-family="sans-serif" text-anchor="middle" transform="rotate(-90 30 130)">Throughput (req/s)</text>
  <text x="90" y="222" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">20ms</text>
  <text x="200" y="222" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">50ms</text>
  <text x="320" y="222" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">200ms</text>
  <text x="450" y="222" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">1000ms</text>
  <text x="560" y="222" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">5000ms</text>
  <polyline points="90,60 200,100 320,152 450,185 560,200"
    fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linejoin="round"/>
  <polygon points="320,152 560,200 560,210 320,210" fill="#ef4444" fill-opacity="0.15"/>
  <text x="440" y="200" fill="#ef4444" font-size="10" font-family="sans-serif" text-anchor="middle">thread pool saturation zone</text>
  <text x="52" y="64" fill="#52525b" font-size="10" font-family="monospace" text-anchor="end">10k</text>
  <text x="52" y="104" fill="#52525b" font-size="10" font-family="monospace" text-anchor="end">4k</text>
  <text x="52" y="156" fill="#52525b" font-size="10" font-family="monospace" text-anchor="end">1k</text>
  <text x="52" y="189" fill="#52525b" font-size="10" font-family="monospace" text-anchor="end">200</text>
  <text x="100" y="55" fill="#3b82f6" font-size="11" font-family="sans-serif">Throughput (200-thread pool)</text>
</svg>

This is why data pipelines processing high-volume streams move from thread-per-request to **reactive/async** models (Vert.x, Akka, Python asyncio) — a single thread can interleave thousands of I/O waits without blocking.

---

## Circuit Breakers: Resilience4j Pattern

A circuit breaker tracks failure rate in front of a downstream service call. When failures exceed a threshold, it *opens* — subsequent calls immediately fail-fast without attempting the network call.

```java
// Resilience4j CircuitBreaker (Java)
CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .slidingWindowType(SlidingWindowType.COUNT_BASED)
    .slidingWindowSize(10)
    .failureRateThreshold(50)           // open if >50% fail
    .waitDurationInOpenState(Duration.ofSeconds(30))
    .permittedNumberOfCallsInHalfOpenState(3)
    .build();

CircuitBreaker cb = CircuitBreakerRegistry.of(config).circuitBreaker("inventory-svc");

CheckedSupplier<Stock> decoratedCall = CircuitBreaker
    .decorateCheckedSupplier(cb, () -> inventoryClient.getStock(skuId));

try {
    Stock stock = Try.of(decoratedCall).get();
} catch (CallNotPermittedException e) {
    // Circuit is open — serve from cache or degraded response
    stock = stockCache.getOrDefault(skuId, Stock.UNKNOWN);
}
```

<svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="20" y="26" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Circuit Breaker State Machine</text>
  <circle cx="120" cy="120" r="45" fill="#14532d" stroke="#22c55e" stroke-width="2"/>
  <text x="120" y="115" fill="#86efac" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">CLOSED</text>
  <text x="120" y="132" fill="#86efac" font-size="10" font-family="sans-serif" text-anchor="middle">(calls pass)</text>
  <circle cx="520" cy="120" r="45" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
  <text x="520" y="115" fill="#fca5a5" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">OPEN</text>
  <text x="520" y="132" fill="#fca5a5" font-size="10" font-family="sans-serif" text-anchor="middle">(fast fail)</text>
  <circle cx="320" cy="70" r="40" fill="#451a03" stroke="#f59e0b" stroke-width="2"/>
  <text x="320" y="65" fill="#fcd34d" font-size="11" font-family="sans-serif" text-anchor="middle" font-weight="bold">HALF-OPEN</text>
  <text x="320" y="80" fill="#fcd34d" font-size="10" font-family="sans-serif" text-anchor="middle">(1 probe)</text>
  <line x1="165" y1="108" x2="473" y2="108" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrowR)"/>
  <text x="320" y="102" fill="#ef4444" font-size="10" font-family="sans-serif" text-anchor="middle">failure rate > 50%</text>
  <line x1="487" y1="82" x2="358" y2="63" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrowA)"/>
  <text x="445" y="65" fill="#f59e0b" font-size="10" font-family="sans-serif">timeout (30s)</text>
  <line x1="282" y1="80" x2="155" y2="97" stroke="#22c55e" stroke-width="1.5" marker-end="url(#arrowG2)"/>
  <text x="200" y="82" fill="#22c55e" font-size="10" font-family="sans-serif">probe success</text>
  <line x1="355" y1="85" x2="490" y2="100" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrowR)"/>
  <text x="420" y="105" fill="#ef4444" font-size="10" font-family="sans-serif">probe fails</text>
  <defs>
    <marker id="arrowR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#ef4444"/></marker>
    <marker id="arrowA" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f59e0b"/></marker>
    <marker id="arrowG2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#22c55e"/></marker>
  </defs>
</svg>

The key insight: an open circuit breaker *saves the caller*, not just the callee. Without it, threads pile up waiting for a timeout from a dead service. With it, threads are freed immediately.

---

## Saga Pattern: Distributed Transactions Without 2PC

A distributed transaction spanning multiple services cannot use 2PC — it holds locks across all participants, kills concurrency, and creates a single point of failure.

The **Saga pattern** breaks the transaction into local transactions, each publishing an event that triggers the next. If a step fails, compensating transactions undo previous steps.

### Choreography-based Saga (no coordinator)
```
OrderService publishes  → order.created
InventoryService hears  → reserves stock, publishes inventory.reserved
PaymentService hears    → charges card, publishes payment.charged
  [If payment fails]
PaymentService publishes     → payment.failed
InventoryService hears       → releases reserved stock (compensating tx)
OrderService hears           → marks order as cancelled
```

### Orchestration-based Saga (central coordinator)
```python
class OrderSaga:
    def execute(self):
        try:
            self.state = 'RESERVING_INVENTORY'
            inventory_client.reserve(self.order_id)

            self.state = 'CHARGING_PAYMENT'
            payment_client.charge(self.order_id)

            self.state = 'COMPLETED'
        except PaymentError:
            self.state = 'COMPENSATING'
            inventory_client.release(self.order_id)  # compensating transaction
            self.state = 'FAILED'
```

| Property | Choreography | Orchestration |
| :--- | :--- | :--- |
| Single point of failure | None | Orchestrator |
| Visibility into saga state | Distributed (hard) | Central (easy) |
| Adding a new step | Subscribe to events (no coupling) | Update orchestrator logic |
| Best for | Simple linear flows | Complex branching processes |

---

## Event Sourcing

In a traditional system, only current state is stored. Event sourcing inverts this: **the event log is the source of truth**, and current state is derived by replaying the log.

```python
events = [
    {'type': 'OrderCreated',    'data': {'items': ['SKU-123'], 'total': 4900}},
    {'type': 'DiscountApplied', 'data': {'percent': 10}},
    {'type': 'PaymentReceived', 'data': {'amount': 4410}},
    {'type': 'Shipped',         'data': {'carrier': 'UPS', 'tracking': '1Z999'}},
]

def apply_event(state, event):
    match event['type']:
        case 'OrderCreated':    state.update({'total': event['data']['total'], 'status': 'pending'})
        case 'DiscountApplied': state['total'] = int(state['total'] * (1 - event['data']['percent']/100))
        case 'PaymentReceived': state['status'] = 'paid'
        case 'Shipped':         state.update({'status': 'shipped', 'tracking': event['data']['tracking']})
    return state

final_state = {}
for e in events:
    final_state = apply_event(final_state, e)
# {'total': 4410, 'status': 'shipped', 'tracking': '1Z999'}
```

Kafka's immutable, offset-ordered log is a natural event store — Kafka Streams and ksqlDB are built on this model.

---

## CQRS and Its Relationship to Data Pipelines

**CQRS** separates the write model (commands) from the read model (queries). In distributed data systems, this becomes a data flow architecture:

```
Write path:  API → Command Handler → Event Store (Kafka)
                                           ↓
Read path:   Kafka Consumer → Projection Builder → Read DB (Postgres/Redis/Elasticsearch)
```

The read DB is a **materialized view** of events, optimized purely for query patterns — denormalized, differently indexed, or even in a different data model.

This is precisely what streaming data pipelines do: Kafka is the write-side event log; Kafka Streams, Flink, or Spark Structured Streaming maintain read-side aggregations. A real-time dashboard showing current inventory is a CQRS read model built by a streaming pipeline over an event-sourced write path."""

articles["de-message-practices"] = """# Messaging Best Practices

Operating a message queue correctly — surviving duplicate deliveries, schema drift, hot partitions, and consumer lag — is where most real-world bugs live. These are the practices that separate pipelines holding up in production from ones that lose data silently or collapse during deployments.

---

## Idempotency: Designing for Duplicate Delivery

At-least-once delivery is the production default in almost every serious messaging system. Your consumers *will* process some messages more than once — during broker failover, consumer restarts, or network hiccups. Processing the same message twice must be safe.

**An idempotent operation** produces the same result whether executed once or ten times. `UPDATE orders SET status='shipped' WHERE id=123` is idempotent. `INSERT INTO shipped_log (order_id) VALUES (123)` is not — it creates duplicate rows.

### Idempotency Keys (Redis-backed)

```python
import hashlib, redis

r = redis.Redis()

def process_payment(message):
    idempotency_key = f"payment:{message['payment_id']}"

    # SET NX = atomic "set only if not exists"
    if r.set(idempotency_key, '1', nx=True, ex=86400):
        # First time: actually process
        charge_card(message['card_token'], message['amount'])
        update_order_status(message['order_id'], 'paid')
    else:
        # Duplicate: skip silently
        logger.info(f"Skipping duplicate payment {message['payment_id']}")
```

The Redis `SET ... NX` operation is atomic — if two consumer instances race on the same duplicate, only one wins.

### SQS FIFO Deduplication

SQS FIFO queues support built-in deduplication via `MessageDeduplicationId`. The broker rejects duplicates (same ID) received within a 5-minute window:

```python
import boto3, hashlib, json

sqs = boto3.client('sqs', region_name='us-east-1')

def send_payment_event(payment_id, amount):
    body = json.dumps({'payment_id': payment_id, 'amount': amount})
    dedup_id = hashlib.sha256(payment_id.encode()).hexdigest()[:64]

    sqs.send_message(
        QueueUrl='https://sqs.us-east-1.amazonaws.com/123456/payments.fifo',
        MessageBody=body,
        MessageGroupId='payment-events',
        MessageDeduplicationId=dedup_id,
    )
```

Note: SQS deduplication prevents the *broker* from re-enqueuing a duplicate. A consumer crash after receiving but before acking still requires consumer-side idempotency.

---

## Message Schema Evolution: Avro and Schema Registry

In a live pipeline, producers and consumers evolve independently. Schema evolution rules determine which changes are safe for rolling deploys.

### Compatibility Modes

| Change | Backward Compatible | Forward Compatible | Safe in production? |
| :--- | :---: | :---: | :--- |
| Add optional field with default | Yes | Yes | Yes — safe for rolling deploys |
| Add required field (no default) | No | Yes | No — old consumers break |
| Remove field | Yes | No | No — new consumers break on old messages |
| Rename field | No | No | Never — use add + deprecate pattern |
| Change field type (e.g. int→string) | No | No | Never |
| Avro type promotion (int→long) | Yes | No | Partial — check Avro promotion rules |

```python
# Avro schema v2 — backward compatible (added optional field with default)
schema_v2 = {
    "type": "record",
    "name": "OrderEvent",
    "fields": [
        {"name": "order_id",  "type": "string"},
        {"name": "amount",    "type": "int"},
        {"name": "currency",  "type": "string", "default": "USD"}  # safe addition
    ]
}

# NOT backward compatible — changed type from int to float
# schema_v3_bad = {
#     "fields": [
#         {"name": "amount", "type": "float"}  # breaks old consumers!
#     ]
# }
```

### Confluent Schema Registry

The Schema Registry stores versioned schemas and enforces compatibility on every registration. Every Confluent-format Avro message begins with `[magic byte 0x00][4-byte schema ID][avro bytes]`. Consumers use the schema ID to fetch the writer schema and resolve it against their reader schema:

```python
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer
from confluent_kafka import Producer

sr_client = SchemaRegistryClient({'url': 'http://schema-registry:8081'})
avro_serializer = AvroSerializer(sr_client, json.dumps(schema_v2), lambda obj, ctx: obj)

p = Producer({'bootstrap.servers': 'kafka:9092'})
p.produce(
    topic='orders',
    key='order-789',
    value=avro_serializer({'order_id': 'order-789', 'amount': 4900, 'currency': 'GBP'}, None)
)
```

---

## Partition Key Selection in Kafka

Kafka's partitioning strategy determines ordering, parallelism, and load distribution. Getting it wrong causes hot partitions that throttle an entire topic while other partitions sit idle.

The default partitioner hashes the message key:
```
partition = murmur2(key) % num_partitions
```

<svg viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="260" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="20" y="28" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Partition Key Cardinality: Load Distribution</text>
  <text x="60" y="55" fill="#22c55e" font-size="12" font-family="sans-serif" font-weight="bold">High-Cardinality Key (order_id)</text>
  <rect x="60" y="65" width="50" height="120" rx="3" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
  <rect x="130" y="75" width="50" height="110" rx="3" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
  <rect x="200" y="68" width="50" height="117" rx="3" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
  <rect x="270" y="80" width="50" height="105" rx="3" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
  <text x="85" y="198" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">P0</text>
  <text x="155" y="198" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">P1</text>
  <text x="225" y="198" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">P2</text>
  <text x="295" y="198" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">P3</text>
  <text x="175" y="218" fill="#22c55e" font-size="10" font-family="sans-serif" text-anchor="middle">Even distribution ✓</text>
  <text x="380" y="55" fill="#ef4444" font-size="12" font-family="sans-serif" font-weight="bold">Low-Cardinality Key (country_code)</text>
  <rect x="380" y="65" width="50" height="160" rx="3" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
  <rect x="450" y="170" width="50" height="15" rx="3" fill="#1c1917" stroke="#52525b" stroke-width="1"/>
  <rect x="520" y="175" width="50" height="10" rx="3" fill="#1c1917" stroke="#52525b" stroke-width="1"/>
  <rect x="590" y="173" width="40" height="12" rx="3" fill="#1c1917" stroke="#52525b" stroke-width="1"/>
  <text x="405" y="198" fill="#fca5a5" font-size="10" font-family="monospace" text-anchor="middle">P0(US)</text>
  <text x="475" y="198" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">P1(GB)</text>
  <text x="545" y="198" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">P2(CA)</text>
  <text x="610" y="198" fill="#52525b" font-size="10" font-family="monospace" text-anchor="middle">P3(AU)</text>
  <text x="490" y="218" fill="#ef4444" font-size="10" font-family="sans-serif" text-anchor="middle">HOT PARTITION — throttles entire topic</text>
</svg>

### Choosing Keys

**High-cardinality (use these)**: `order_id`, `user_id`, `device_id`, `transaction_id` — millions of distinct values hash uniformly. Ordering is preserved *per-key*.

**Low-cardinality (avoid)**: `country_code`, `status`, `event_type` — a few distinct values cause massive skew. If "US" is 70% of traffic, partition 0 is throttled while partitions 1-3 sit idle.

**Fix for unavoidable skew**: use a compound key: `country_code + "_" + shard_suffix` where `shard_suffix` is a random integer 0-99, distributing "US" traffic across 100 virtual shards while still grouping logically.

---

## Consumer Lag Monitoring

Consumer lag is the difference between the latest offset in a partition and the consumer group's committed offset. Growing lag means the consumer is falling behind the producer.

```bash
# Kafka consumer lag via CLI
kafka-consumer-groups.sh \
  --bootstrap-server kafka:9092 \
  --describe \
  --group my-consumer-group

# Output:
# TOPIC       PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# orders      0          1450200         1452000         1800
# orders      1          1448900         1449200         300
```

**Alerting thresholds**:
- Lag > 0 for more than N seconds: normal burst absorption
- Lag growing continuously (not draining): consumer is undersized or stuck on a DLQ message
- Lag at 0 then sudden spike: upstream traffic spike or consumer restart

In production, expose lag as a Prometheus metric and alert when lag exceeds a threshold relative to throughput rate (e.g., more than 5 minutes of messages at normal rate).

---

## Message Batching and Compression

Batching amortizes per-message overhead. Compression reduces network and storage costs at the expense of CPU.

### Kafka Producer Batching
```python
from confluent_kafka import Producer

p = Producer({
    'bootstrap.servers': 'kafka:9092',
    'batch.size': 65536,          # max bytes per batch (default 16KB)
    'linger.ms': 5,               # wait up to 5ms to fill a batch
    'compression.type': 'lz4',   # fast compression, good ratio
    'acks': 'all',
})
```

`linger.ms=5` means the producer waits up to 5ms before sending, allowing more messages to accumulate in a batch. This trades latency for throughput.

### Compression Trade-offs

| Algorithm | CPU Cost | Compression Ratio | Decompression Speed | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **none** | 0 | 1× | N/A | Low-volume, latency-critical |
| **gzip** | High | 4-6× | Moderate | Archive logs, cold data |
| **snappy** | Low | 2-3× | Very fast | General-purpose Kafka |
| **lz4** | Very low | 2-3× | Fastest | High-throughput pipelines |
| **zstd** | Moderate | 4-5× | Fast | Best ratio/speed balance (Kafka 2.1+) |

A production recommendation: **lz4** for high-throughput operational topics (clickstream, CDC), **zstd** for topics where storage cost matters (audit logs, compliance data).

---

## Summary

Messaging reliability in production requires four things: consumer idempotency for duplicate-safe processing, schema compatibility rules for independent deployments, high-cardinality partition keys for even load distribution, and consumer lag monitoring to detect problems before they become outages. None of these have defaults that work automatically — each requires explicit design decisions."""

# Save to scratch
os.chdir("/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad")
with open("scratch/batch_V.json", "w", encoding="utf-8") as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print("Saved scratch/batch_V.json")
print(f"Articles: {list(articles.keys())}")
