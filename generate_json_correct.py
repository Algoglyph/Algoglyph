import json
import sys

data = {
    "de-message-why": """# What are Message Queues and Why Use Them?

In a monolithic application, components communicate through direct function calls. As architectures scale into distributed microservices and data pipelines, direct synchronous communication becomes a bottleneck. Message brokers (like RabbitMQ, Apache ActiveMQ, or Amazon SQS) introduce an asynchronous layer of indirection that fundamentally changes how systems scale and fail.

At its core, a message queue is a data structure that temporarily holds messages (events, commands, or payloads) from a producer until a consumer is ready to process them.

## The Problem: Tight Coupling and Spikes

Consider an e-commerce checkout flow: an order service directly calls a payment gateway, an inventory service, and an email service. 

If the email service is down or slow, the entire checkout process blocks. If a flash sale generates 10,000 orders per second, the inventory service might crash under the load because it is forced to process requests at the rate they arrive.

## The Solution: Decoupling and Backpressure

A message queue sits between these components to absorb the shock. This buffer provides **backpressure** — the ability for a downstream system to pull work at its own maximum capacity rather than being pushed past its breaking point.

<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Synchronous vs. Decoupled Architecture</text>
  
  <!-- Synchronous (Top) -->
  <rect x="50" y="60" width="100" height="40" rx="4" fill="#1f2937" stroke="#52525b" />
  <text x="100" y="85" fill="#e4e4e7" font-size="12" font-family="sans-serif" text-anchor="middle">Producer</text>
  
  <path d="M 150 80 L 400 80" stroke="#ef4444" stroke-width="2" />
  <text x="275" y="72" fill="#ef4444" font-size="11" font-family="sans-serif" text-anchor="middle">Blocks until done (10k req/s)</text>
  
  <rect x="400" y="60" width="100" height="40" rx="4" fill="#7f1d1d" stroke="#ef4444" />
  <text x="450" y="85" fill="#fca5a5" font-size="12" font-family="sans-serif" text-anchor="middle">Consumer (Crashes)</text>

  <!-- Decoupled (Bottom) -->
  <rect x="50" y="150" width="100" height="40" rx="4" fill="#1f2937" stroke="#52525b" />
  <text x="100" y="175" fill="#e4e4e7" font-size="12" font-family="sans-serif" text-anchor="middle">Producer</text>

  <path d="M 150 170 L 250 170" stroke="#10b981" stroke-width="2" />
  
  <rect x="250" y="155" width="100" height="30" rx="0" fill="#064e3b" stroke="#10b981" />
  <text x="300" y="175" fill="#a7f3d0" font-size="12" font-family="sans-serif" text-anchor="middle">Message Queue</text>

  <path d="M 350 170 L 450 170" stroke="#10b981" stroke-width="2" stroke-dasharray="4" />
  <text x="400" y="162" fill="#10b981" font-size="11" font-family="sans-serif" text-anchor="middle">Pulls (500 req/s)</text>

  <rect x="450" y="150" width="100" height="40" rx="4" fill="#1f2937" stroke="#52525b" />
  <text x="500" y="175" fill="#e4e4e7" font-size="12" font-family="sans-serif" text-anchor="middle">Consumer</text>
</svg>

By introducing a queue, the producer writes messages and immediately returns success to the user. The consumer reads from the queue at a sustainable rate. The queue stores the pending 9,500 messages safely on disk or in memory.

## Architectural Tradeoffs

Introducing a message broker is not a silver bullet. It adds a completely new piece of stateful infrastructure to maintain.

| Property | Direct Synchronous Call (REST/gRPC) | Message Queue (RabbitMQ/SQS) |
| :--- | :--- | :--- |
| **Coupling** | High. Both services must be online simultaneously. | Low. Producers and consumers operate independently. |
| **Throughput Control** | None. Downstream service must handle upstream spikes. | Excellent. Downstream service pulls at its own pace. |
| **Latency** | Low. Direct network hop. | Higher. Extra hop to the broker, plus disk I/O. |
| **Operational Complexity** | Simple. Standard HTTP load balancers suffice. | High. Requires deploying and monitoring broker clusters. |

## Implementation Example: Python with RabbitMQ

To understand how simple this abstraction is for the application code, here is a standard implementation using the `pika` library to publish an order event.

```python
import pika
import json

def publish_order(order_data):
    # 1. Establish connection to the broker
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    # 2. Ensure the queue exists before publishing
    channel.queue_declare(queue='order_queue', durable=True)

    # 3. Publish the message
    channel.basic_publish(
        exchange='',
        routing_key='order_queue',
        body=json.dumps(order_data),
        properties=pika.BasicProperties(
            delivery_mode=2, # Make message persistent
        )
    )
    print(f"Published order: {order_data['id']}")
    connection.close()

# The producer does not know or care who consumes this order.
publish_order({"id": "ORD-1234", "amount": 150.00})
```

Because `delivery_mode=2` is set, RabbitMQ will flush this message to disk. Even if the entire broker server loses power immediately after acknowledging the publish, the message will survive and be processed when the server reboots. This durability guarantee is why modern data pipelines rely heavily on messaging as the glue between fragile microservices.
""",
    "de-message-async": """# Async vs. Sync Communication in Distributed Systems

When designing data pipelines and distributed architectures, the choice between synchronous and asynchronous communication defines the performance ceiling and fault tolerance of the entire system.

## Synchronous Communication: The Request-Response Model

In a synchronous system, a caller sends a request and the thread **blocks** (waits) until the receiver processes the work and returns a response. The most common example is a REST API call over HTTP.

This model is conceptually simple and easy to debug because the execution flow is linear. However, it scales poorly. If Service A calls Service B, and Service B takes 5 seconds to query a database, the thread in Service A is frozen for 5 seconds doing absolutely nothing except waiting on a network socket.

If Service A has 100 worker threads, 100 concurrent slow requests to Service B will exhaust Service A's thread pool, causing it to reject new requests. This is called **resource exhaustion**, and it causes cascading failures where a slowdown in one service takes down everything that depends on it.

## Asynchronous Communication: The Event-Driven Model

In an asynchronous system, the caller dispatches work and immediately moves on to other tasks. It does not block waiting for a response.

This is typically implemented using a Message Broker or an Event Stream. The producer emits an "event" (e.g., "UserCreated") to a topic. Any number of consumer services subscribe to that topic and process the event independently, on their own timelines.

<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Execution Timeline: Sync vs Async</text>
  
  <g transform="translate(30, 60)">
    <!-- Sync Timeline -->
    <text x="0" y="15" fill="#e4e4e7" font-size="12" font-family="sans-serif">Synchronous</text>
    <rect x="90" y="0" width="30" height="20" fill="#3b82f6" />
    <text x="105" y="14" fill="#fff" font-size="10" font-family="sans-serif" text-anchor="middle">CPU</text>
    <rect x="120" y="5" width="200" height="10" fill="#3f3f46" />
    <text x="220" y="14" fill="#a1a1aa" font-size="10" font-family="sans-serif" text-anchor="middle">Thread Blocked (Waiting)</text>
    <rect x="320" y="0" width="30" height="20" fill="#3b82f6" />
    
    <!-- Async Timeline -->
    <text x="0" y="65" fill="#e4e4e7" font-size="12" font-family="sans-serif">Asynchronous</text>
    <rect x="90" y="50" width="30" height="20" fill="#10b981" />
    <text x="105" y="64" fill="#fff" font-size="10" font-family="sans-serif" text-anchor="middle">CPU</text>
    
    <!-- Network fire and forget -->
    <path d="M 120 60 L 150 90" stroke="#a1a1aa" stroke-width="2" stroke-dasharray="4" />
    
    <rect x="130" y="50" width="30" height="20" fill="#10b981" />
    <text x="145" y="64" fill="#fff" font-size="10" font-family="sans-serif" text-anchor="middle">CPU</text>
    
    <rect x="170" y="50" width="30" height="20" fill="#10b981" />
    <text x="185" y="64" fill="#fff" font-size="10" font-family="sans-serif" text-anchor="middle">CPU</text>
    
    <!-- Async callback -->
    <path d="M 320 90 L 350 70" stroke="#a1a1aa" stroke-width="2" stroke-dasharray="4" />
    <rect x="350" y="50" width="30" height="20" fill="#10b981" />
  </g>
</svg>

In the asynchronous model, the CPU never waits. It dispatches a network request and immediately starts processing the next user. When the downstream service finishes, it places a response message on a "Reply Queue", which the original service consumes to finalize the transaction.

## Comparing the Paradigms

| Feature | Synchronous (REST/gRPC) | Asynchronous (Events/Messaging) |
| :--- | :--- | :--- |
| **Client Experience** | Gets an immediate, definitive success or failure. | Often gets an "Accepted" status, requiring polling or WebSockets for the final result. |
| **Failure Handling** | Caller must implement retries and circuit breakers explicitly. | Broker handles retries automatically by requeuing failed messages. |
| **Scalability** | Limited by maximum concurrent threads/connections. | Extremely high. Producers are never blocked by slow consumers. |
| **Debugging** | Easy. A single trace ID spans the entire sequential request. | Difficult. Work is split across time and multiple distinct log streams. |

## Implementation Detail: The Outbox Pattern

A major challenge in asynchronous design is ensuring data consistency. If your code saves a user to a SQL database and then publishes a "UserCreated" event to Kafka, what happens if the database commit succeeds but the network call to Kafka fails? You now have a ghost user in the database that downstream systems don't know about.

```python
# BAD: Dual Write Problem
def create_user(user_data):
    db.execute("INSERT INTO users ...") # Succeeds
    # --> NETWORK CRASH HAPPENS HERE <--
    kafka.publish("UserCreated", user_data) # Fails
```

To solve this, data engineers use the **Transactional Outbox Pattern**:

```python
# GOOD: Transactional Outbox
def create_user_safe(user_data):
    db.begin_transaction()
    
    # Write the state and the event in the SAME transaction
    db.execute("INSERT INTO users ...")
    db.execute("INSERT INTO outbox_events (type, payload) VALUES ('UserCreated', user_data)")
    
    db.commit()
    # A separate background worker reads the 'outbox_events' table and publishes to Kafka.
```

By leveraging the ACID properties of the relational database, we guarantee that the business state and the outbound event are always perfectly synchronized. The async background worker can retry publishing to Kafka indefinitely without risking data loss.
""",
    "de-message-practices": """# Messaging Best Practices: Idempotency and DLQs

When building robust data pipelines using message brokers, engineers must design for failure. Network partitions occur, databases time out, and bad code gets deployed. Two critical patterns separate fragile queues from enterprise-grade systems: Idempotency and Dead Letter Queues (DLQs).

## The Reality of Delivery Guarantees

Distributed systems theoretically offer three delivery guarantees:
1. **At-most-once**: A message is delivered 0 or 1 times. It might be dropped, but it will never be duplicated. (Fastest, least reliable).
2. **Exactly-once**: A message is delivered exactly 1 time. (Mathematically impossible without extreme performance overhead and tight coupling to the consumer's database).
3. **At-least-once**: A message is guaranteed to arrive, but in failure scenarios, it might arrive multiple times.

Modern messaging systems (Kafka, RabbitMQ, SQS) default to **At-least-once** delivery. This implies your consumers **will** receive duplicate messages. A network blip might prevent the consumer from sending the acknowledgement (ACK) back to the broker, causing the broker to safely assume the message failed and re-deliver it.

## Best Practice 1: Idempotent Consumers

An operation is **idempotent** if executing it multiple times yields the same result as executing it once. Since brokers guarantee at-least-once delivery, your consumers must be idempotent.

If your consumer processes a payment, receiving the same message twice must not charge the user twice. This is typically solved using an Idempotency Key (often a UUID attached to the message by the producer).

```python
def process_payment(message):
    payment_id = message.headers.get('idempotency_key')
    
    # 1. Check if we have already successfully processed this key
    if db.execute("SELECT 1 FROM processed_payments WHERE id = ?", payment_id):
        print(f"Skipping duplicate payment {payment_id}")
        return acknowledge_message()
        
    # 2. Process the actual business logic
    charge_credit_card(message.amount)
    
    # 3. Record the idempotency key atomically
    db.execute("INSERT INTO processed_payments (id) VALUES (?)", payment_id)
    
    return acknowledge_message()
```

## Best Practice 2: Dead Letter Queues (DLQ)

When a consumer encounters an error, it rejects (NACKs) the message. The broker then requeues it for another attempt. 

However, some messages are "poison pills" — they contain malformed JSON or trigger a null pointer exception in the consumer code. If a poison pill is requeued infinitely, it will clog the queue and block valid messages from being processed.

<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Dead Letter Queue (DLQ) Routing</text>
  
  <g transform="translate(40, 70)">
    <!-- Main Queue -->
    <rect x="0" y="10" width="100" height="40" fill="#1e40af" stroke="#3b82f6" />
    <text x="50" y="35" fill="#bfdbfe" font-size="12" font-family="sans-serif" text-anchor="middle">Main Queue</text>
    
    <!-- Consumer -->
    <rect x="180" y="10" width="100" height="40" fill="#1f2937" stroke="#52525b" />
    <text x="230" y="35" fill="#e4e4e7" font-size="12" font-family="sans-serif" text-anchor="middle">Consumer</text>
    
    <path d="M 100 30 L 180 30" stroke="#3b82f6" stroke-width="2" />
    
    <!-- Requeue Loop -->
    <path d="M 230 10 C 230 -30, 50 -30, 50 10" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4" />
    <text x="140" y="-10" fill="#ef4444" font-size="11" font-family="sans-serif" text-anchor="middle">NACK (Retry up to 3x)</text>
    
    <!-- DLQ Route -->
    <path d="M 280 30 L 360 30" stroke="#f59e0b" stroke-width="2" />
    
    <!-- DLQ -->
    <rect x="360" y="10" width="140" height="40" fill="#78350f" stroke="#f59e0b" />
    <text x="430" y="35" fill="#fde68a" font-size="12" font-family="sans-serif" text-anchor="middle">Dead Letter Queue</text>
  </g>
</svg>

To solve this, queues support a retry limit (e.g., 3 attempts). If a message is rejected 3 times, the broker automatically routes it to a designated Dead Letter Queue.

| Queue Type | Purpose | Monitoring Strategy |
| :--- | :--- | :--- |
| **Main Queue** | Real-time processing of standard workloads. | Alert on high queue depth (consumers are too slow). |
| **Retry Queue** | Holding messages for exponential backoff before requeuing. | Alert if retry rate spikes (indicates downstream outage). |
| **Dead Letter Queue** | Holding permanently failed messages for human inspection. | Alert on ANY message arriving. DLQ size should be zero. |

Once a poison message is isolated in the DLQ, the main pipeline remains healthy. An engineer can then inspect the payload in the DLQ, deploy a bug fix to the consumer code, and manually replay the messages from the DLQ back into the main queue for successful processing.
"""
}

with open('output_correct.json', 'w') as f:
    json.dump(data, f, indent=2)
