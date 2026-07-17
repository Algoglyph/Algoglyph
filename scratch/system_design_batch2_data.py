# -*- coding: utf-8 -*-
# Data file containing System Design Batch 2 articles with EXTREMELY DETAILED textbook content.

SYSTEM_DESIGN_BATCH2_ARTICLES = [
    {
        "slug": "availability-in-numbers",
        "title": "Availability in Numbers",
        "tagline": "Configure SLA metrics, calculate compound system uptimes, and balance downtime budgets.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["availability-vs-consistency"],
        "related": ["failover-replication-dns-updates", "what-is-system-design"],
        "practiceProblems": [],
        "markdown": """# Availability in Numbers

In system design, **High Availability (HA)** measures the percentage of time a system remains operational and accessible to process requests. Uptime goals are outlined in **Service Level Agreements (SLAs)**. Calculating HA requires analyzing system dependencies and applying compound probability formulas. This chapter covers availability metrics, downtime budgets, and compound calculations.

---

## 1. SLA Downtime Budgets

Uptime goals are expressed in "nines". Each additional nine reduces the allowed downtime budget:

| Uptime SLA (%) | Allowed Downtime (Yearly) | Allowed Downtime (Monthly) | Allowed Downtime (Daily) | Typical Profile |
| :--- | :--- | :--- | :--- | :--- |
| **99% ("Two Nines")** | 3.65 days | 7.31 hours | 14.4 minutes | Standard web apps |
| **99.9% ("Three Nines")** | 8.77 hours | 43.8 minutes | 1.44 minutes | Enterprise SaaS |
| **99.99% ("Four Nines")** | 52.6 minutes | 4.38 minutes | 8.64 seconds | Banking services |
| **99.999% ("Five Nines")** | 5.26 minutes | 25.9 seconds | 0.86 seconds | Telecommunications |

---

## 2. Compound System Availability

Distributed systems contain multiple components connected in **Series** or **Parallel**. Their compound availability is calculated as follows:

### Series Configurations
If a system relies on $N$ critical components in series (meaning all must function for the system to work), the total availability is the product of their individual availabilities:

$$A_{\\text{series}} = \\prod_{i=1}^{N} A_i = A_1 \\times A_2 \\times \\dots \\times A_N$$

*Example:* If a web server ($99.9\\%$) connects to a database ($99.9\\%$), the combined availability is:
$$0.999 \\times 0.999 = 0.998 \\ (99.8\\%)$$
Adding critical series dependencies *reduces* availability.

### Parallel Configurations (Redundancy)
If a system uses redundant components in parallel (meaning only one node needs to function), the combined availability is:

$$A_{\\text{parallel}} = 1 - \\prod_{i=1}^{N} (1 - A_i) = 1 - (1 - A_1) \\times (1 - A_2) \\times \\dots \\times (1 - A_N)$$

*Example:* If you use two database servers ($99.9\\%$) in parallel, the combined availability is:
$$1 - (0.001 \\times 0.001) = 0.999999 \\ (99.9999\\%)$$
Adding parallel redundancy *increases* availability.

### Compound Topologies
<svg viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="260" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">System Availability Configurations</text>

  {/* Series System */}
  <g transform="translate(40, 70)">
    <rect width="230" height="150" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="115" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Series (All Must Run)</text>
    
    <rect x="20" y="60" width="70" height="40" fill="#111" stroke="#fff" rx="2"/>
    <text x="55" y="85" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Server A (99%)</text>
    
    <rect x="140" y="60" width="70" height="40" fill="#111" stroke="#fff" rx="2"/>
    <text x="175" y="85" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">DB B (99%)</text>
    
    <line x1="90" y1="80" x2="140" y2="80" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="115" y="130" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">Total: 99% * 99% = 98.01%</text>
  </g>

  {/* Parallel System */}
  <g transform="translate(330, 70)">
    <rect width="230" height="150" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.2"/>
    <text x="115" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Parallel (Redundant)</text>
    
    <rect x="80" y="45" width="70" height="35" fill="#111" stroke="#fff" rx="2"/>
    <text x="115" y="67" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Server 1 (99%)</text>
    
    <rect x="80" y="95" width="70" height="35" fill="#111" stroke="#fff" rx="2"/>
    <text x="115" y="117" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Server 2 (99%)</text>
    
    <path d="M 30,80 L 80,62 M 30,80 L 80,112" stroke="#10b981" stroke-width="1"/>
    <path d="M 150,62 L 200,80 M 150,112 L 200,80" stroke="#10b981" stroke-width="1"/>
    <text x="115" y="142" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">Total: 1 - (1% * 1%) = 99.99%</text>
  </g>
</svg>

---

## 3. MTBF and MTTR

Availability calculations rely on two main metrics:
* **MTBF (Mean Time Between Failures):** The average time a system runs continuously before failing.
* **MTTR (Mean Time To Repair):** The average time required to recover the system after a failure occurs.

$$\\text{Availability} = \\frac{\\text{MTBF}}{\\text{MTBF} + \\text{MTTR}}$$

To improve availability, you must either increase MTBF (make components more reliable) or reduce MTTR (automate recovery using health checks and active failovers).

---

## 4. Conceptual Check Questions

1. **Why does adding a third-party payment API in series decrease your application's availability?**
   *Answer:* Since the payment API is a series dependency, if it goes down, your payment flow goes down too. Its availability acts as a multiplier: if your app is $99.9\\%$, and the API is $99.0\\%$, the combined availability drops to $98.9\\%$.

2. **How does automated failover reduce MTTR?**
   *Answer:* MTTR measures the time required to repair a failure. Manual recovery requires alerting engineers, diagnosing the crash, and redirecting traffic, which can take hours. Automated failover uses heartbeats and scripts to detect failures and redirect traffic within seconds.
""",
        "content": {
            "introduction": "Availability in Numbers measures system uptime SLAs and compound dependencies to estimate and optimize operational reliability.",
            "whyImportant": "Meeting contractual SLAs and avoiding downtime requires modeling system availability.",
            "realWorldApps": ["Configuring multi-zone load balancing to meet four-nines SLAs.", "Sizing warm standby servers to minimize MTTR recovery windows."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "background-jobs",
        "title": "Background Jobs",
        "tagline": "Configure asynchronous workers, manage execution queues, and handle job failures.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["what-is-system-design"],
        "related": ["event-driven-jobs", "schedule-driven-jobs"],
        "practiceProblems": [],
        "markdown": """# Background Jobs

In modern web applications, web servers must respond to client requests quickly. If an operation takes longer than 50-100ms (e.g., generating PDFs, sending emails, or processing video uploads), it should not run synchronously on the web thread. Instead, the server offloads these tasks to **Background Jobs**. This chapter covers worker pool patterns, queue structures, and failure handling.

---

## 1. Asynchronous Execution Pipeline

A background job system decouples API requests from slow tasks using a message queue:

### Background Job Workers
<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Background Worker Architecture</text>

  {/* Client */}
  <g transform="translate(30, 85)">
    <rect width="80" height="110" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="40" y="35" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client</text>
    <text x="40" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Sends request</text>
  </g>

  {/* Web Server */}
  <g transform="translate(150, 75)">
    <rect width="90" height="130" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="45" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Web Server</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">Pushes job to queue</text>
    <text x="10" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Returns 202 Accepted</text>
  </g>

  {/* Job Queue */}
  <g transform="translate(280, 85)">
    <rect width="100" height="110" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="50" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Job Queue</text>
    <text x="50" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">RabbitMQ / Redis</text>
    <text x="50" y="75" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">FIFO Queue</text>
  </g>

  {/* Workers */}
  <g transform="translate(420, 85)">
    <rect width="150" height="110" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="20" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Worker Pool</text>
    <rect x="15" y="40" width="120" height="18" fill="#111" stroke="#fff" rx="2"/>
    <text x="75" y="52" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Worker Thread 1 (Idle)</text>
    <rect x="15" y="65" width="120" height="18" fill="#111" stroke="#fff" rx="2"/>
    <text x="75" y="77" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Worker Thread 2 (Active)</text>
  </g>

  {/* Connections */}
  <path d="M 110,140 L 150,140" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#bgj-arrow)"/>
  <path d="M 240,140 L 280,140" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#bgj-arrow)"/>
  <path d="M 380,140 L 420,140" stroke="#a855f7" stroke-width="1.5" marker-end="url(#bgj-arrow)"/>

  <defs>
    <marker id="bgj-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

1. **Request Reception:** Client posts a slow request (e.g. video upload).
2. **Job Enqueueing:** The web server writes the job parameters to a message queue and returns an HTTP `202 Accepted` status, freeing the connection.
3. **Worker Processing:** Background worker processes poll the queue, fetch the job parameters, and run the task.

---

## 2. Queue Mechanics & Failure Management

Background workers can fail due to database drops, memory limits, or network timeouts. Systems implement these three strategies to handle errors:

* **Dead-Letter Queue (DLQ):** If a job fails repeatedly, the system isolates it in a DLQ so it doesn't block the main queue. Engineers can analyze and debug it later.
* **Exponential Backoff:** The system retries failed jobs, increasing the delay between retries to avoid overwhelming target services.
* **Idempotency:** A job must be safe to run multiple times without causing duplicate side effects (e.g., charging a card twice).

```python
# Conceptual worker loop with backoff and DLQ handling
import time

def process_job_with_backoff(job, max_retries=3):
    retries = 0
    while retries < max_retries:
        try:
            # Perform actual job task
            run_job_logic(job)
            return True
        except Exception as e:
            retries += 1
            delay = 2 ** retries
            print(f"Job failed: {e}. Retrying in {delay}s...")
            time.sleep(delay)
            
    # Move to DLQ after reaching limit
    move_to_dead_letter_queue(job)
    return False
```

---

## 3. Comparison Matrix

| Property | Synchronous Execution | Asynchronous Job Workers |
| :--- | :--- | :--- |
| **Response Time** | High (client waits for job completion) | Low (returns immediately after enqueue) |
| **Connection Limits** | High risk of port exhaustion under load | Low risk (connections are freed quickly) |
| **Failure Scope** | Crashes the web request | isolated to the worker node |

---

## 4. Conceptual Check Questions

1. **Why does synchronous execution increase the risk of connection pool exhaustion under load?**
   *Answer:* Synchronous execution keeps the network connection open while the task runs. If tasks take seconds to complete, incoming requests will occupy all web server ports, causing new clients to be rejected.

2. **What is the purpose of a Dead-Letter Queue (DLQ)?**
   *Answer:* It isolates failing or corrupt jobs. Without a DLQ, a corrupt job would be repeatedly picked up, fail, and go back to the queue, wasting worker CPU cycles and blocking other valid jobs.
""",
        "content": {
            "introduction": "Background jobs run slow tasks asynchronously, freeing web servers to handle incoming client requests quickly.",
            "whyImportant": "Keeping APIs responsive and preventing port exhaustion under load requires background workers.",
            "realWorldApps": ["Encoding uploaded video files into multiple stream formats.", "Generating PDF invoices and emailing them to users."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "event-driven-jobs",
        "title": "Event-Driven Jobs",
        "tagline": "Configure event brokers, route publish-subscribe messages, and scale execution loops.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["background-jobs"],
        "related": ["schedule-driven-jobs", "returning-job-results"],
        "practiceProblems": [],
        "markdown": """# Event-Driven Jobs

In monolithic systems, services call other services directly. This tight coupling makes the system fragile. **Event-Driven Architectures (EDA)** decouple services by communicating through events. Services publish events to a central broker (e.g. Apache Kafka or RabbitMQ), and interested services subscribe to and process those events. This chapter covers pub/sub routing, event brokers, and scale configurations.

---

## 1. Pub/Sub Fan-Out Architecture

Instead of the User Service calling both the Email Service and the Analytics Service directly, it publishes a single event. The broker routes this event to all subscribers:

### Event Broker Routing
<svg viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="260" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Event Broker Fan-Out</text>

  {/* Publisher */}
  <g transform="translate(40, 85)">
    <rect width="110" height="90" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">User Service</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Publishes event</text>
    <text x="55" y="70" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">"UserRegistered"</text>
  </g>

  {/* Broker */}
  <g transform="translate(210, 75)">
    <rect width="150" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="75" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Event Broker (Topic)</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Routes messages</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Copies payload to groups</text>
  </g>

  {/* Subscribers */}
  <g transform="translate(410, 50)">
    <rect width="150" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="20" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Email Service</text>
    <text x="75" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Sends welcome email</text>
  </g>

  <g transform="translate(410, 140)">
    <rect width="150" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="20" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Analytics Service</text>
    <text x="75" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Updates metrics</text>
  </g>

  {/* Paths */}
  <path d="M 150,130 L 210,130" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ed-j-arrow)"/>
  <path d="M 360,110 L 410,75 M 360,150 L 410,165" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#ed-j-arrow)"/>

  <defs>
    <marker id="ed-j-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 2. Event Log Brokers vs. Message Queues

Event brokers route messages using different delivery models:

| Property | Traditional Message Queues (e.g. RabbitMQ) | Log-Based Event Brokers (e.g. Kafka) |
| :--- | :--- | :--- |
| **Message Durability** | Deleted immediately after consumer acknowledges | Retained on disk for a set period (e.g., 7 days) |
| **Consumer Scaling** | Competing consumers read from the same queue | Partitioned log allows multiple consumer groups |
| **Replay Capacity** | Impossible (messages are consumed and deleted) | Re-reads historic events by modifying the log offset |

---

## 3. Consumer Group Offsets in Log-Based Brokers

Log-based brokers organize events sequentially in partitioned logs. Consumers track their progress using **Offsets** (index points in the log):

```
Partition Log:  [Event 0] ──> [Event 1] ──> [Event 2] ──> [Event 3] ──> [Event 4]
                                               ▲
                                        Current Offset (2)
```

If the Email Service crashes and restarts, it reads its saved offset (`2`) from the broker and resumes processing from Event 3 without missing or duplicating messages.

---

## 4. Conceptual Check Questions

1. **Why does log-based message retention allow for easier historical audits?**
   *Answer:* Traditional queues delete messages after delivery. Log-based brokers retain all messages on disk for a retention window. This allows you to replay the entire event history to rebuild data states or debug past failures.

2. **What is backpressure in event-driven systems?**
   *Answer:* It is a signal sent when subscribers cannot process events as fast as publishers are sending them. It prevents consumers from running out of memory by telling the publisher to slow down or queue messages on disk.
""",
        "content": {
            "introduction": "Event-driven jobs decouple applications by publishing events to brokers, enabling asynchronous fan-out processing.",
            "whyImportant": "Building decoupled, reliable, and scalable microservices architectures requires event-driven workflows.",
            "realWorldApps": ["Routing user events to notification and analytics microservices.", "Replaying transaction logs to restore database state after an outage."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "schedule-driven-jobs",
        "title": "Schedule-Driven Jobs",
        "tagline": "Configure distributed cron schedulers, manage clock drifts, and use locking models.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["background-jobs"],
        "related": ["event-driven-jobs", "returning-job-results"],
        "practiceProblems": [],
        "markdown": """# Schedule-Driven Jobs

Distributed applications often need to run tasks at specific times or intervals (e.g. daily billing, weekly analytics emails, or hourly cache cleanups). These are **Schedule-Driven Jobs** (often called **Cron Jobs**). Running these scheduled tasks in a distributed environment requires coordination to ensure jobs run on time and never run twice simultaneously. This chapter covers cron configurations, clock drift, and distributed locking.

---

## 1. Standard Cron Syntax

Cron schedules are defined using five fields representing time parameters:

```
*   *   *   *   *
│   │   │   │   │
│   │   │   │   └── Day of the week (0 - 6) (0 is Sunday)
│   │   │   └───── Month (1 - 12)
│   │   └────────── Day of the month (1 - 31)
│   └─────────────── Hour (0 - 23)
└──────────────────── Minute (0 - 59)
```

*Example:* `0 2 * * *` runs the job daily at 2:00 AM. `*/10 * * * *` runs the job every 10 minutes.

---

## 2. The Distributed Cron Challenge

In a distributed system with multiple application nodes, setting up a local cron on each server causes problems. If the schedule triggers, all nodes will run the same job simultaneously, leading to race conditions and duplicate operations.

To prevent this, systems use a **Distributed Lock** (typically managed via Redis or ZooKeeper) to ensure only one node executes the job:

### Distributed Cron Lock
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Distributed Cron Locks</text>

  {/* Node 1 */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="3" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Node 1</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Attempts to lock</text>
    <text x="55" y="70" fill="#ef4444" font-size="6" font-family="monospace" text-anchor="middle">Lock Denied</text>
  </g>

  {/* Redis Lock Store */}
  <g transform="translate(225, 65)">
    <rect width="150" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="75" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Shared Redis Lock</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Key: "lock:daily_billing"</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Owner: Node 2</text>
  </g>

  {/* Node 2 */}
  <g transform="translate(450, 75)">
    <rect width="110" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="55" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Node 2</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Acquires lock</text>
    <text x="55" y="70" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Executes billing</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 225,120" stroke="#ef4444" stroke-width="1.5" marker-end="url(#sc-cron-arrow)"/>
  <path d="M 450,120 L 375,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#sc-cron-arrow)"/>

  <defs>
    <marker id="sc-cron-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Approach | Architecture | Advantages | Drawbacks |
| :--- | :--- | :--- | :--- |
| **Local OS Schedulers (Linux Cron)**| Local cron daemon on each node | Simple to configure | Single point of failure, coordinates poorly across nodes |
| **Distributed Locks (Redis/Redlock)**| App nodes query Redis before running jobs | Simple setup | Clock drift between servers can cause lock failures |
| **Dedicated Schedulers (Quartz/K8s Cron)**| Central scheduler directs worker pools | High reliability, handles failovers | Complex infrastructure overhead |

---

## 4. Clock Drift and Distributed Locking

In a distributed cluster, system clocks will drift slightly over time. If you use a distributed lock with a 5-second lease time, a server whose clock is 10 seconds fast might release the lock early, allowing another node to acquire it and run the job again. Schedulers must use logical times (or NTP synchronization boundaries) to avoid clock-drift bugs.

---

## 5. Conceptual Check Questions

1. **Why does distributed lock design require a Lease Time (TTL)?**
   *Answer:* If a node acquires a lock and crashes before completing the job, the lock would remain open forever, blocking all future runs. A TTL (Time-To-Live) ensures the lock eventually expires and is released even if the node crashes.

2. **How does NTP (Network Time Protocol) clock synchronization help distributed schedulers?**
   *Answer:* NTP regularly syncs server clocks to a reference time source. While it doesn't eliminate drift completely, it keeps differences to a few milliseconds, reducing the risk of overlap errors in scheduled jobs.
""",
        "content": {
            "introduction": "Schedule-driven jobs run tasks at specific times, using distributed locks to coordinate execution across multiple nodes.",
            "whyImportant": "Preventing duplicate billing transactions and coordinating tasks across clusters requires scheduled job management.",
            "realWorldApps": ["Running midnight database cleanups without locking production tables.", "Triggering monthly user billing tasks using distributed cron locks."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "returning-job-results",
        "title": "Returning Job Results",
        "tagline": "Configure result retrieval patterns, compare polling and sockets, and manage callback pipelines.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["background-jobs"],
        "related": ["event-driven-jobs", "dns-root-authority-resolution"],
        "practiceProblems": [],
        "markdown": """# Returning Job Results

When a client offloads a slow task to a background job, the server returns an immediate confirmation (e.g. `202 Accepted`). However, the client still needs to know when the job finishes and get the results. This chapter covers the three primary design patterns for returning job results: **Short Polling (with Exponential Backoff)**, **WebSockets (Server Push)**, and **Webhooks (HTTP Callbacks)**.

---

## 1. Result Retrieval Patterns

* **Short Polling:** The client periodically sends HTTP requests to check the job status (e.g., `GET /api/v1/jobs/123/status`). This is simple but wastes server resources if done too frequently. To reduce load, clients implement **Exponential Backoff** (increasing the delay between checks).
* **WebSockets:** The client opens a persistent, bi-directional TCP connection. When the worker completes the job, the server pushes the result directly to the client over this open connection.
* **Webhooks (Callbacks):** When starting the job, the client provides a callback URL. Once the job completes, the server sends an HTTP POST request containing the results back to the client's URL. This is ideal for server-to-server integrations.

---

## 2. Retrieval Geometries

### Polling vs. WebSockets vs. Webhooks
<svg viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="260" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Result Retrieval Pipelines</text>

  {/* Polling */}
  <g transform="translate(30, 60)">
    <rect width="160" height="170" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="80" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">1. Client Polling</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">Client repeatedly asks:</text>
    <text x="10" y="75" fill="#ef4444" font-size="6" font-family="monospace">"Is it done?" -> "No"</text>
    <text x="10" y="95" fill="#ef4444" font-size="6" font-family="monospace">"Is it done?" -> "No"</text>
    <text x="10" y="115" fill="#10b981" font-size="6" font-family="monospace">"Is it done?" -> "Yes"</text>
  </g>

  {/* WebSockets */}
  <g transform="translate(220, 60)">
    <rect width="160" height="170" fill="#111" rx="2" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="80" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">2. WebSockets Push</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">TCP Connection remains open</text>
    <text x="10" y="85" fill="#a7f3d0" font-size="6" font-family="monospace">Server pushes result</text>
    <text x="10" y="105" fill="#a7f3d0" font-size="6" font-family="monospace">instantly when ready</text>
  </g>

  {/* Webhooks */}
  <g transform="translate(410, 60)">
    <rect width="160" height="170" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1.2"/>
    <text x="80" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">3. Webhooks Callback</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">Client registers URL</text>
    <text x="10" y="85" fill="#a7f3d0" font-size="6" font-family="monospace">Server POSTs back</text>
    <text x="10" y="105" fill="#a7f3d0" font-size="6" font-family="monospace">to Client API</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Pattern | Network Connection | Server Load | Real-world Use Case |
| :--- | :--- | :--- | :--- |
| **Short Polling** | Short-lived HTTP requests | High (many empty check requests) | Simple status checks |
| **WebSockets** | Persistent TCP connection | Moderate (memory footprint for open connections) | Real-time chat apps, live document editing |
| **Webhooks** | Server-to-server POST | Low | Payment gateway confirmations (e.g. Stripe) |

---

## 4. Conceptual Check Questions

1. **Why do WebSockets increase server memory consumption compared to polling?**
   *Answer:* Polling uses short-lived HTTP connections that close immediately after the response is sent. WebSockets require the server to keep a TCP connection open in memory for every active client, which can exhaust server RAM if there are millions of concurrent users.

2. **How does exponential backoff protect servers from polling storms?**
   *Answer:* It increases the time between client requests after each failed attempt (e.g., waiting 1s, then 2s, 4s, 8s). This prevents clients from overwhelming the server with requests when a background job takes longer than expected.
""",
        "content": {
            "introduction": "Returning job results requires selecting the right communication pattern, balancing polling, WebSockets, and webhooks based on application needs.",
            "whyImportant": "Avoiding server overload and providing real-time feedback requires designing efficient result retrieval flows.",
            "realWorldApps": ["Configuring Stripe webhook listeners to update order status.", "Using WebSockets to update client progress during video conversions."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "dns-root-authority-resolution",
        "title": "Domain Name System (DNS)",
        "tagline": "Configure name resolution, analyze recursive lookups, and design DNS caching layers.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["cdn-edge-caching-strategies", "what-is-system-design"],
        "practiceProblems": [],
        "markdown": """# Domain Name System (DNS)

Computers communicate over networks using IP addresses (e.g. `192.0.2.1`). Because humans cannot easily remember these numbers, we use domain names (e.g. `example.com`). The **Domain Name System (DNS)** is the distributed system that translates human-readable domain names into machine-readable IP addresses. This chapter covers recursive lookup steps, DNS hierarchies, and caching.

---

## 1. The DNS Hierarchy

DNS organizes domain names in a hierarchical tree:

```
                          [Root Zone (.)]
                                 │
                 ┌───────────────┴───────────────┐
            [TLD (.com)]                   [TLD (.org)]
                 │
       ┌─────────┴─────────┐
[domain (example.com)]  [domain (google.com)]
```

1. **Root Nameservers (`.`):** The top of the hierarchy. They point to Top-Level Domain (TLD) nameservers.
2. **Top-Level Domain (TLD) Nameservers:** Manage domains based on their suffix (e.g. `.com`, `.org`, `.edu`).
3. **Authoritative Nameservers:** Manage the actual records for a specific domain. They return the final IP address.

---

## 2. DNS Recursive Lookup Flow

When a client queries a domain name, the request flows through these steps:

### Resolution Protocol
<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">DNS Recursive Lookup Steps</text>

  {/* Client */}
  <g transform="translate(30, 85)">
    <rect width="80" height="110" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="40" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client</text>
    <text x="40" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Query: target.com</text>
  </g>

  {/* Local DNS Resolver */}
  <g transform="translate(150, 75)">
    <rect width="100" height="130" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="50" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">DNS Resolver</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">ISP / 8.8.8.8</text>
    <text x="10" y="75" fill="#94a3b8" font-size="6" font-family="monospace">Checks cache first</text>
  </g>

  {/* Nameservers */}
  <g transform="translate(320, 50)">
    <rect width="250" height="40" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.2"/>
    <text x="125" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Root Nameserver (.)</text>
  </g>

  <g transform="translate(320, 115)">
    <rect width="250" height="40" rx="3" fill="#1e1b4b" stroke="#a855f7" stroke-width="1.2"/>
    <text x="125" y="25" fill="#c084fc" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. TLD Nameserver (.com)</text>
  </g>

  <g transform="translate(320, 180)">
    <rect width="250" height="40" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="125" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">3. Authoritative Nameserver</text>
  </g>

  {/* Paths */}
  <path d="M 110,140 L 150,140" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#dns-arrow)"/>
  <path d="M 250,110 L 320,70" stroke="#f59e0b" stroke-width="1.2" marker-end="url(#dns-arrow)"/>
  <path d="M 250,140 L 320,135" stroke="#f59e0b" stroke-width="1.2" marker-end="url(#dns-arrow)"/>
  <path d="M 250,170 L 320,200" stroke="#f59e0b" stroke-width="1.2" marker-end="url(#dns-arrow)"/>

  <defs>
    <marker id="dns-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

1. **Client to Resolver:** Client requests the IP for `target.com` from the local DNS resolver.
2. **Resolver to Root:** The resolver queries the Root Nameserver. The Root returns the TLD Nameserver address for `.com`.
3. **Resolver to TLD:** The resolver queries the TLD Nameserver. The TLD returns the Authoritative Nameserver address for `target.com`.
4. **Resolver to Authoritative:** The resolver queries the Authoritative Nameserver, which returns the IP address. The resolver returns the IP to the client and caches it locally.

---

## 3. Comparison Matrix

| Record Type | Name | Purpose | Example Value |
| :--- | :--- | :--- | :--- |
| **A Record** | Address | Maps domain to IPv4 address | `192.0.2.1` |
| **AAAA Record** | IPv6 Address | Maps domain to IPv6 address | `2001:db8::1` |
| **CNAME** | Canonical Name | Maps domain to another domain | `web.example.com` -> `example.com` |
| **MX Record** | Mail Exchanger | Identifies mail servers for the domain | `mail.example.com` |

---

## 4. DNS Caching and TTL

To avoid repeating the 8-step resolution path for every request, DNS results are cached at multiple levels (Browser cache, OS cache, Router cache, and ISP Resolver cache). The duration a record remains in cache is defined by its **TTL (Time-To-Live)** in seconds.
* **Low TTL (e.g. 60 seconds):** Allows fast updates when server IPs change, but increases DNS query traffic.
* **High TTL (e.g. 86400 seconds / 1 day):** Reduces DNS query latency, but delays updates when IP configurations change.

---

## 5. Conceptual Check Questions

1. **What is the difference between a recursive and an iterative DNS query?**
   *Answer:* In a recursive query, the client demands the final resolution, forcing the resolver to coordinate the entire lookup. In an iterative query, the server immediately returns the address of the next nameserver, requiring the requester to query it directly.

2. **Why can CNAME records increase DNS lookup latency?**
   *Answer:* CNAME records point a domain name to another domain name instead of an IP address. The resolver must resolve the target domain name as a separate lookup step before it can return the IP address.
""",
        "content": {
            "introduction": "DNS resolves domain names into IP addresses, using a hierarchical, cached name resolution pipeline.",
            "whyImportant": "Connecting clients to distributed system instances and managing global traffic routes requires understanding DNS.",
            "realWorldApps": ["Configuring DNS A/CNAME records to route traffic to load balancers.", "Setting up low-TTL records to enable fast IP failovers."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "cdn-edge-caching-strategies",
        "title": "Content Delivery Networks (CDN)",
        "tagline": "Configure edge cache strategies, manage TTL assets, and write purge rules.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["dns-root-authority-resolution"],
        "related": ["pull-cdns", "push-cdns"],
        "practiceProblems": [],
        "markdown": """# Content Delivery Networks (CDN)

A **Content Delivery Network (CDN)** is a distributed network of proxy servers deployed globally in datacenters (Points of Presence, or **PoPs**). CDNs cache static assets (images, stylesheets, JavaScript files, and videos) close to users, reducing page load times and saving origin server bandwidth. This chapter covers edge geometries, cache-control headers, and purge strategies.

---

## 1. CDN Edge Architecture

Rather than all users routing back to a single origin server in one location, requests are intercepted by the nearest CDN edge node:

### Edge Server Routing
<svg viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="260" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Global Edge Delivery (CDN)</text>

  {/* Client Europe */}
  <g transform="translate(30, 60)">
    <rect width="110" height="50" rx="2" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="20" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">User (London)</text>
    <text x="55" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Low Latency Lookup</text>
  </g>

  {/* CDN Europe */}
  <g transform="translate(180, 60)">
    <rect width="120" height="50" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="60" y="20" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Edge PoP (London)</text>
    <text x="60" y="38" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Cache Hit (10ms)</text>
  </g>

  {/* Origin Server */}
  <g transform="translate(420, 100)">
    <rect width="140" height="80" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Origin Server (US)</text>
    <text x="70" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Houses master copy</text>
  </g>

  {/* Client US */}
  <g transform="translate(30, 150)">
    <rect width="110" height="50" rx="2" fill="#1c1917" stroke="#ef4444" stroke-width="1.2"/>
    <text x="55" y="20" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">User (NY)</text>
    <text x="55" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Direct check route</text>
  </g>

  {/* Paths */}
  <path d="M 140,85 L 180,85" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#cdn-arrow)"/>
  <path d="M 140,175 L 420,150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#cdn-arrow)"/>

  <defs>
    <marker id="cdn-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 2. Cache-Control Headers & Cache Invalidation

CDNs read HTTP headers sent by the origin server to decide how to cache resources:
* `Cache-Control: public, max-age=31536000` tells the CDN and browser to cache the resource for up to 1 year.
* `Cache-Control: no-store` prevents the CDN from caching the response, forcing it to fetch a fresh copy from the origin server every time.

### Invalidation Strategies
If a cached file changes on the origin server before its TTL expires, the CDN must invalidate the old version:
* **Purge by Path:** Explicitly instructs the CDN to delete a specific cached file (e.g. `/assets/logo.png`).
* **Cache Busting (Versioning):** Changes the filename using a hash of its contents (e.g. `main.a8f23b.js`). This avoids purge delays because the new filename automatically forces a cache miss.

---

## 3. Comparison Matrix

| Caching Strategy | How it Works | Advantages | Drawbacks |
| :--- | :--- | :--- | :--- |
| **Purge by Path** | Sends API command to CDN to clear URL | Clears the cache instantly | Purging thousands of files can take minutes to complete |
| **Cache Busting** | Changes asset name via hashes | Safe, reliable, and instantaneous | Requires updates to HTML references on build |
| **Soft Purge** | Marks resource as stale in background | Returns stale asset quickly while fetching new one | Client temporarily receives old content |

---

## 4. Conceptual Check Questions

1. **Why does using unique file hashes (Cache Busting) scale better than sending CDN purges?**
   *Answer:* CDN purges require sending API calls to edge nodes globally, which takes time to propagate. Cache busting bypasses this: by changing the filename (e.g., `app.v2.js`), the CDN treats it as a new file and fetches it from the origin immediately.

2. **What does the `stale-while-revalidate` HTTP header do?**
   *Answer:* It tells the CDN to serve the cached (but stale) asset immediately to keep response times low, while fetching the updated version from the origin in the background to update the cache.
""",
        "content": {
            "introduction": "CDNs cache static assets on globally distributed edge servers, reducing user latency and saving origin bandwidth.",
            "whyImportant": "Serving static resources globally under 100ms requires implementing CDN edge caching.",
            "realWorldApps": ["Caching images and scripts at edge locations using Cloudflare.", "Deploying video streaming assets via AWS CloudFront."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "pull-cdns",
        "title": "Pull CDNs",
        "tagline": "Configure request-driven pull CDNs, minimize origin load, and manage cache misses.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["cdn-edge-caching-strategies"],
        "related": ["push-cdns", "dns-root-authority-resolution"],
        "practiceProblems": [],
        "markdown": """# Pull CDNs

CDNs retrieve static files from the origin server using one of two models: **Pull CDNs** or **Push CDNs**. A **Pull CDN** uses a request-driven model: the CDN only caches files when a user requests them. This chapter covers pull workflows, origin loads, and cache miss performance costs.

---

## 1. Pull CDN Execution Flow

When a user requests a file from a Pull CDN edge server:

```
[User Request] ──> [Edge Server] ─┬─ (Cache Hit) ──> [Return File]
                                  └─ (Cache Miss) ─> [Pull from Origin] ──> [Save to Cache] ──> [Return File]
```

1. **Client Query:** A user requests `https://cdn.example.com/logo.png`.
2. **Edge Check:** The edge server checks its cache. If it finds the file (Cache Hit), it returns it immediately.
3. **Origin Pull (Cache Miss):** If the file is missing, the edge server pulls `logo.png` from the origin server (`https://example.com/logo.png`), stores it in its cache for future requests, and returns it to the user.

---

## 2. Pull CDN Architecture

The CDN pulls assets from the origin only when a cache miss occurs:

### Pull CDN Workflow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Pull CDN Workflow</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="100" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="50" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Client Request</text>
    <text x="50" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Queries logo.png</text>
  </g>

  {/* CDN Edge */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">CDN Edge Node</text>
    <text x="15" y="55" fill="#ef4444" font-size="6" font-family="monospace">2. Cache Miss!</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">3. Pulls and caches</text>
  </g>

  {/* Origin */}
  <g transform="translate(440, 75)">
    <rect width="120" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Origin Server</text>
    <text x="60" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Serves file</text>
  </g>

  {/* Paths */}
  <path d="M 140,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#pcdn-arrow)"/>
  <path d="M 380,120 L 440,120" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#pcdn-arrow)"/>

  <defs>
    <marker id="pcdn-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Pull CDN (Request-Driven) | Push CDN (Pre-Loaded) |
| :--- | :--- | :--- |
| **Initial Request Cost**| High (cache misses require pulling from origin) | Low (files are pre-cached before user requests) |
| **Storage Cost** | Low (only active files are cached) | High (all files are uploaded to CDN storage) |
| **Configuration** | Simple (point CDN DNS to origin domain) | Complex (requires deployment script integration) |
| **Best Used For** | Large sites with unpredictable traffic | Releasing new software versions, static app bundles |

---

## 4. Conceptual Check Questions

1. **Why does a Pull CDN reduce storage costs compared to a Push CDN?**
   *Answer:* Pull CDNs only cache files that users actually request. Unused or low-traffic files are never pulled, saving storage space. Push CDNs upload all files to CDN storage, incurring costs for files that might never be read.

2. **What is origin shielding in Pull CDNs?**
   *Answer:* It places a secondary caching layer (shield) between CDN edge nodes and the origin server. If multiple edge nodes experience a cache miss for the same file, they query the shield instead of querying the origin server, preventing origin overload.
""",
        "content": {
            "introduction": "Pull CDNs cache assets on demand, pulling resources from the origin server only when a cache miss occurs.",
            "whyImportant": "Minimizing storage overhead and automating cache updates requires using pull CDNs.",
            "realWorldApps": ["Configuring Cloudflare proxies to pull static assets from backend servers.", "Reducing origin load using CDN edge shielding layers."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "push-cdns",
        "title": "Push CDNs",
        "tagline": "Configure upload-driven push CDNs, manage pre-loaded caches, and resolve write syncs.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["cdn-edge-caching-strategies"],
        "related": ["pull-cdns", "dns-root-authority-resolution"],
        "practiceProblems": [],
        "markdown": """# Push CDNs

In a **Push CDN** model, developers upload (push) static content directly to the CDN's storage nodes. The CDN then distributes these files globally. This differs from a Pull CDN, which pulls files only after a cache miss. This chapter covers push workflows, storage synchronization, and cache-hit optimization.

---

## 1. Push CDN Execution Flow

In a Push CDN, files are pre-loaded to edge servers during deployment, ensuring 100% cache-hit rates when users request them:

```
[Developer Deploy CLI] ──> [CDN Master Storage] ──> [Global PoP Sync] ──> [User Get (100% Hit)]
```

1. **Pre-loading Assets:** During deployment, a CI/CD script uploads assets (e.g., HTML, JS, CSS, images) directly to the CDN storage buckets.
2. **Global Sync:** The CDN replicates these files to all Edge Points of Presence (PoPs) globally.
3. **Immediate Cache Hits:** When users request a file, the edge server already has it, ensuring fast response times without querying the origin.

---

## 2. Push CDN Architecture

Developers upload files directly to CDN storage, bypassing the origin server entirely during client lookups:

### Push CDN Deployment Workflow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Push CDN Workflow</text>

  {/* CLI Upload */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. CI/CD Push</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Uploads assets</text>
  </g>

  {/* CDN Master Storage */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">CDN Master Storage</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Stores all assets</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Syncs to edge PoPs</text>
  </g>

  {/* Client */}
  <g transform="translate(440, 75)">
    <rect width="120" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Client Request</text>
    <text x="60" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">100% Cache Hit</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#pscdn-arrow)"/>
  <path d="M 380,120 L 440,120" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#pscdn-arrow)"/>

  <defs>
    <marker id="pscdn-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Pull CDN (Request-Driven) | Push CDN (Pre-Loaded) |
| :--- | :--- | :--- |
| **Initial Request Cost**| High (cache misses require pulling from origin) | Low (files are pre-cached before user requests) |
| **Storage Cost** | Low (only active files are cached) | High (all files are uploaded to CDN storage) |
| **Configuration** | Simple (point CDN DNS to origin domain) | Complex (requires deployment script integration) |
| **File Deletion Control**| Slow (must wait for TTL or send purge commands) | Fast (updating the source bucket replaces the file) |

---

## 4. Conceptual Check Questions

1. **Why are Push CDNs preferred for distributing software updates or game installers?**
   *Answer:* Game installers and software updates are large files. If a Pull CDN is used, the first users who request a new version will experience slow downloads while the CDN pulls the file from the origin. Pre-loading the files into a Push CDN ensures all users get fast download speeds immediately.

2. **What is a major challenge when managing a Push CDN during regular site updates?**
   *Answer:* You must integrate file uploads into your deployment pipeline. If the upload script fails to push updated files to the CDN, users will receive outdated assets even though the origin server has been updated.
""",
        "content": {
            "introduction": "Push CDNs require developers to upload assets to CDN storage, pre-loading them globally to ensure immediate cache hits.",
            "whyImportant": "Ensuring immediate cache hits for large files and avoiding origin pulls requires using push CDNs.",
            "realWorldApps": ["Pre-loading new game releases across regional CDN nodes.", "Uploading single-page app bundles directly to AWS S3 and CloudFront."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "sql-vs-nosql",
        "title": "SQL vs NoSQL",
        "tagline": "Configure ACID constraints, analyze horizontal scaling models, and model database schemas.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["what-is-system-design"],
        "related": ["key-value-store", "replication-master-slave-master-master"],
        "practiceProblems": [],
        "markdown": """# SQL vs NoSQL

When designing a database layer, you must choose between **SQL (Relational)** and **NoSQL (Non-Relational)** databases. This decision affects how you model data, write queries, and scale the system as traffic grows. This chapter covers ACID vs. BASE constraints, data modeling structures, and indexing designs.

---

## 1. Core Paradigm Comparison

* **SQL (Relational Databases):** Store data in structured tables with fixed columns. They use **SQL** for queries and enforce **ACID** properties (Atomicity, Consistency, Isolation, Durability) to ensure transaction safety.
* **NoSQL (Non-Relational Databases):** Store data in flexible formats (documents, key-value pairs, wide-column tables, or graphs). They prioritize horizontal scaling and availability, often adhering to **BASE** properties (Basically Available, Soft-state, Eventual consistency).

---

## 2. Index Structures (B-Trees vs. LSM-Trees)

The performance of SQL and NoSQL databases is directly shaped by their underlying physical storage engines:

### B-Tree Index (Typical in Relational SQL)
B-Trees keep data sorted on disk, allowing fast read lookups ($O(\\log N)$). However, write operations are slow because they require updating indexes on disk and maintaining page structures.

### Log-Structured Merge-Tree (LSM-Tree) (Typical in NoSQL engines)
LSM-Trees append writes to a memory buffer (**MemTable**) instantly. When the buffer fills, the database flushes it to disk as an immutable **SSTable (Sorted String Table)**. Background threads regularly compact these tables. This structure makes writes fast, but reads are slower because the database must check multiple SSTables to find the latest version of a record.

### B-Tree vs. LSM-Tree
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">B-Trees vs. LSM-Trees</text>

  {/* B-Tree Column */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">B-Tree (SQL Reads)</text>
    <rect x="25" y="45" width="130" height="60" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="70" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">In-place Updates</text>
    <text x="90" y="90" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Fast Reads, Slow Writes</text>
  </g>

  {/* LSM-Tree Column */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">LSM-Tree (NoSQL Writes)</text>
    <rect x="25" y="45" width="130" height="60" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="70" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">MemTable + SSTables</text>
    <text x="90" y="90" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Fast Writes, Slow Reads</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | SQL (Relational Databases) | NoSQL (Non-Relational Databases) |
| :--- | :--- | :--- |
| **Data Schema** | Strict, predefined schemas | Flexible, dynamic schemas |
| **Scalability** | Vertical (Scale Up) | Horizontal (Scale Out) |
| **Transactions** | Strict ACID compliance | Eventual consistency (BASE) |
| **Joins** | Supported out-of-the-box | Denormalized data / Application-level joins |
| **Examples** | PostgreSQL, MySQL, Oracle | Cassandra, MongoDB, Redis, Neo4j |

---

## 4. Conceptual Check Questions

1. **Why is denormalization preferred in NoSQL databases?**
   *Answer:* NoSQL databases do not support relational joins. To avoid performance hits from application-level joins, data is denormalized (duplicated and stored together) so queries can read everything they need in a single request.

2. **How does an LSM-Tree make NoSQL writes faster?**
   *Answer:* It converts random writes to sequential writes. Instead of modifying index pages on disk (which requires random I/O), writes append sequentially to an in-memory MemTable and write-ahead log, which is fast.
""",
        "content": {
            "introduction": "Choosing between SQL and NoSQL requires evaluating transaction safety constraints (ACID) against horizontal scaling needs (BASE).",
            "whyImportant": "Selecting the right database engine and schema design for your application requires understanding SQL and NoSQL trade-offs.",
            "realWorldApps": ["Using relational SQL for transactional ledgers.", "Deploying NoSQL document stores to handle dynamic catalogs."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "key-value-store",
        "title": "Key-Value Store",
        "tagline": "Configure in-memory storage, analyze Redis loops, and manage hash partitions.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["sql-vs-nosql"],
        "related": ["cdn-edge-caching-strategies", "what-is-system-design"],
        "practiceProblems": [],
        "markdown": """# Key-Value Store

A **Key-Value Store** is a NoSQL database that stores data as a collection of key-value pairs. It is the simplest and fastest database model: given a key, it returns the associated value in $O(1)$ time. This chapter covers in-memory hashing, distributed hash partitions, and the Redis event loop.

---

## 1. Single-Threaded Event Loop (Redis)

Many high-performance key-value stores (such as Redis) run on a single-threaded event loop. This design achieves high throughput by executing all commands in memory, avoiding CPU context-switching and locking overheads:

### Redis Event Loop
<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Single-Threaded Event Loop</text>

  {/* Client TCP channels */}
  <g transform="translate(30, 85)">
    <rect width="100" height="110" rx="2" fill="#1e1b4b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="50" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Clients</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">Client A (GET)</text>
    <text x="10" y="75" fill="#fff" font-size="6" font-family="monospace">Client B (SET)</text>
  </g>

  {/* I/O Multiplexer */}
  <g transform="translate(170, 75)">
    <rect width="130" height="130" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">I/O Multiplexer</text>
    <text x="10" y="55" fill="#fff" font-size="6" font-family="monospace">epoll / kqueue</text>
    <text x="10" y="75" fill="#94a3b8" font-size="6" font-family="monospace">Queues network events</text>
  </g>

  {/* Event Loop */}
  <g transform="translate(340, 85)">
    <rect width="100" height="110" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.5"/>
    <text x="50" y="25" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Event Loop</text>
    <text x="50" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Executes commands</text>
    <text x="50" y="70" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Sequentially</text>
  </g>

  {/* In Memory Data */}
  <g transform="translate(480, 85)">
    <rect width="90" height="110" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="45" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Memory DB</text>
    <text x="45" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Hash Table</text>
  </g>

  {/* Connections */}
  <path d="M 130,140 L 170,140" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#kv-arrow)"/>
  <path d="M 300,140 L 340,140" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#kv-arrow)"/>
  <path d="M 440,140 L 480,140" stroke="#ef4444" stroke-width="1.5" marker-end="url(#kv-arrow)"/>

  <defs>
    <marker id="kv-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

1. **Multiplexing:** The I/O multiplexer collects incoming client requests (e.g. using `epoll` or `kqueue`) and queues them as events.
2. **Sequential execution:** The event loop takes events from the queue one by one and executes them in memory.
3. **Low Latency Response:** Because all operations occur in memory without locking threads, latency remains under 1ms.

---

## 2. In-Memory Hashing vs. Distributed Partitioning

Key-value stores use two main memory layouts to scale capacity:

| Property | In-Memory Key-Value (e.g. Redis/Memcached) | Distributed Hash Partition (e.g. DynamoDB/Riak) |
| :--- | :--- | :--- |
| **Data Location** | RAM (Fast, limited by system memory) | Disk + Memory cache (Scales to petabytes) |
| **Execution Threading** | Single-threaded event loop | Multi-threaded coordinator nodes |
| **Scale Mechanism** | Master-slave clustering, memory replication | Consistent Hashing ring, automatic sharding |

---

## 3. Consistent Hashing Mechanics

To scale a key-value store across multiple nodes, systems use **Consistent Hashing**. This maps keys and database servers to a logical ring. When a server node is added or removed, it minimizes the number of keys that must be moved to different nodes.

---

## 4. Conceptual Check Questions

1. **Why does Redis execute commands sequentially on a single thread instead of using multiple threads?**
   *Answer:* It eliminates locking overhead. Multi-threaded databases spend CPU cycles managing lock contention (mutexes) to prevent race conditions on shared memory. A single thread running in-memory avoids context-switching, making it faster.

2. **How does consistent hashing prevent global cache invalidation when a server node crashes?**
   *Answer:* In normal hashing ($key \\% N$), changing the server count $N$ changes the destination node for almost all keys, invalidating the cache. Consistent hashing maps keys and nodes to a logical ring, so adding or removing a node only redistributes keys adjacent to that node.
""",
        "content": {
            "introduction": "Key-value stores provide fast key lookups, using in-memory caches and consistent hashing to scale capacity.",
            "whyImportant": "Implementing high-performance caching layers and distributed session managers requires key-value engines.",
            "realWorldApps": ["Caching page metadata in Redis to bypass slow SQL lookups.", "Managing user sessions globally across clustered key-value instances."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    }
]
