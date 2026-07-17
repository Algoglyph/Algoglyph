# -*- coding: utf-8 -*-
# Data file containing System Design Batch 4 articles with EXTREMELY DETAILED textbook content.

SYSTEM_DESIGN_BATCH4_ARTICLES = [
    {
        "slug": "load-balancing-algorithms",
        "title": "Load Balancing Algorithms",
        "tagline": "Configure load balancing algorithms, manage client connections, and assign node weights.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["layer-7-load-balancing", "load-balancer-layer-4-routing"],
        "practiceProblems": [],
        "markdown": """# Load Balancing Algorithms

A **Load Balancer (LB)** sits between clients and server pools, distributing incoming network traffic to ensure no single server becomes overloaded. Load balancers route requests using either **Static** (fixed routing rules) or **Dynamic** (routes based on server health metrics) algorithms. This chapter covers round-robin, least connections, IP hashing, and weighted distributions.

---

## 1. Core Algorithms

* **Round-Robin:** Routes requests sequentially down the list of servers. Best when all servers have identical hardware specifications.
* **Weighted Round-Robin:** Assigns an integer weight to each server based on its capacity. Servers with higher weights receive more traffic.
* **Least Connections:** Routes requests to the server with the fewest active connections. Ideal for long-running connections (e.g. databases, WebSockets).
* **IP Hashing:** Hashes the client's IP address (`hash(IP) % N`) to map it to a specific server, ensuring the client consistently connects to the same node (sticky sessions).

---

## 2. Load Balancing Geometries

Load balancers distribute traffic across server pools based on their configured algorithms:

### IP Hash vs. Round-Robin
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Load Balancing Routing</text>

  {/* Client IP A */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client (10.0.0.5)</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Routes via IP Hash</text>
  </g>

  {/* Load Balancer */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Load Balancer</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">hash("10.0.0.5") % 2 = 0</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Always routes to Server 1</text>
  </g>

  {/* Servers */}
  <g transform="translate(420, 50)">
    <rect width="140" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="70" y="20" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Server 1 (IP Hash Target)</text>
  </g>

  <g transform="translate(420, 140)">
    <rect width="140" height="50" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.2"/>
    <text x="70" y="20" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Server 2 (Idle)</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#lba-arrow)"/>
  <path d="M 380,110 L 420,75" stroke="#10b981" stroke-width="1.5" marker-end="url(#lba-arrow)"/>

  <defs>
    <marker id="lba-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Algorithm | Routing Strategy | Ideal Use Case | Drawbacks |
| :--- | :--- | :--- | :--- |
| **Round-Robin** | Sequential distribution | Uniform hardware pools | Ignores server load differences |
| **Weighted Round-Robin** | Priority capacity routing | Mixed hardware pools | Requires manual weight updates |
| **Least Connections** | Load-sensitive routing | Long-lived TCP connections | Higher computation cost on balancer |
| **IP Hashing** | Client IP hashing | Stateful applications | Adding servers invalidates existing hashes |

---

## 4. Conceptual Check Questions

1. **Why is the Least Connections algorithm preferred over Round-Robin for database connection pools?**
   *Answer:* Database queries vary in execution time. Round-Robin treats all requests equally, which can overload a server if it receives several slow queries in a row. Least Connections routes traffic to servers with fewer active tasks, distributing the computational load more evenly.

2. **What occurs in IP Hashing load balancing when a backend node crashes?**
   *Answer:* The load balancer must recalculate the hashing index (`hash(IP) % (N - 1)`). This redistributes client sessions across the remaining servers, which can invalidate cached session data on those nodes.
""",
        "content": {
            "introduction": "Load balancers distribute network traffic across server pools using static or dynamic routing algorithms.",
            "whyImportant": "Preventing single-server overloads and ensuring high system availability requires load balancers.",
            "realWorldApps": ["Configuring Nginx round-robin routing to distribute web traffic.", "Using least connections load balancing for WebSocket clusters."],
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
        "slug": "layer-7-load-balancing",
        "title": "Layer 7 Load Balancing",
        "tagline": "Configure application-layer routing, parse HTTP headers, and manage sticky sessions.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["load-balancing-algorithms"],
        "related": ["load-balancer-layer-4-routing", "reverse-proxy-caches"],
        "practiceProblems": [],
        "markdown": """# Layer 7 Load Balancing

A **Layer 7 Load Balancer** operates at the **Application Layer** of the OSI model. It inspects incoming HTTP/HTTPS traffic (including headers, cookies, URLs, and JSON payloads) to make routing decisions. This chapter covers path-based routing, header parsing, and sticky sessions.

---

## 1. Application-Layer Routing

Because Layer 7 load balancers inspect HTTP payloads, they can route traffic based on the requested URL path:
* **Path-Based Routing:** Routes `/api/v1/billing` to the Billing Service, and `/api/v1/users` to the User Service.
* **Header-Based Routing:** Routes mobile users (identified by the `User-Agent` header) to mobile-optimized backend pools.
* **Sticky Sessions:** Reads session cookies to route returning users to the same backend server that holds their session data.

---

## 2. Layer 7 Path-Based Routing

The load balancer inspects the HTTP URI path and forwards the request to the corresponding microservice:

### Path Routing Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Layer 7 Path-Based Routing</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Request</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">GET /api/v1/billing</text>
  </g>

  {/* L7 Load Balancer */}
  <g transform="translate(190, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Layer 7 Load Balancer</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Parses HTTP Header</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Matches path /billing</text>
  </g>

  {/* Billing Service */}
  <g transform="translate(420, 50)">
    <rect width="140" height="50" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="70" y="20" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Billing Service</text>
  </g>

  {/* User Service */}
  <g transform="translate(420, 140)">
    <rect width="140" height="50" rx="3" fill="#1c1917" stroke="#ef4444" stroke-width="1.2"/>
    <text x="70" y="20" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">User Service (Idle)</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 190,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#l7-arrow)"/>
  <path d="M 370,110 L 420,75" stroke="#10b981" stroke-width="1.5" marker-end="url(#l7-arrow)"/>

  <defs>
    <marker id="l7-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Layer 4 Load Balancing | Layer 7 Load Balancing |
| :--- | :--- | :--- |
| **OSI Layer** | Layer 4 (Transport - TCP/UDP) | Layer 7 (Application - HTTP/HTTPS) |
| **Routing Decision Data**| IP addresses and TCP/UDP ports | HTTP headers, cookies, URL paths, payloads |
| **Computational Overhead**| Low (no packet decryption needed)| High (requires decrypting SSL/TLS headers) |
| **Security** | Routes traffic blindly | Can inspect payloads to filter out web attacks (WAF) |

---

## 4. Conceptual Check Questions

1. **Why does Layer 7 load balancing incur more CPU overhead than Layer 4 load balancing?**
   *Answer:* Layer 4 load balancers route traffic blindly based on packet headers. Layer 7 load balancers must decrypt SSL/TLS traffic, parse the HTTP headers and payloads, and run routing rules, which consumes more CPU cycles.

2. **How do sticky sessions conflict with horizontal scaling goals?**
   *Answer:* Sticky sessions bind users to specific backend servers. If a server receives a disproportionate amount of traffic from active sessions, it can become overloaded even if other servers in the cluster have idle capacity.
""",
        "content": {
            "introduction": "Layer 7 load balancers route traffic based on HTTP/HTTPS application data, enabling path-based and cookie-based routing.",
            "whyImportant": "Routing traffic to specific microservices based on URL paths requires Layer 7 load balancers.",
            "realWorldApps": ["Configuring AWS Application Load Balancers to route API sub-paths.", "Setting up cookie-based sticky sessions for legacy web applications."],
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
        "slug": "load-balancer-layer-4-routing",
        "title": "Layer 4 Load Balancing",
        "tagline": "Configure transport-layer load balancers, manage NAT translations, and optimize packet routing.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["load-balancing-algorithms"],
        "related": ["layer-7-load-balancing", "reverse-proxy-caches"],
        "practiceProblems": [],
        "markdown": """# Layer 4 Load Balancing

A **Layer 4 Load Balancer** operates at the **Transport Layer** of the OSI model, routing traffic based on network data (IP addresses and TCP/UDP ports) without decrypting or inspecting the application payload. This chapter covers NAT (Network Address Translation) and transport-layer packet forwarding.

---

## 1. Transport-Layer Packet Routing

Because Layer 4 load balancers do not decrypt SSL/TLS connections or inspect HTTP headers, they are highly performant and can handle millions of connections per second:
* **NAT (Network Address Translation):** The load balancer rewrites the destination IP of incoming packets to match a selected backend server, and rewrites the source IP of outgoing packets to match its own IP.
* **DSR (Direct Server Return):** The load balancer rewrites only the destination MAC address of incoming packets. The backend servers respond directly to clients, bypassing the load balancer on the return path to save network bandwidth.

---

## 2. Layer 4 vs. Layer 7 Packet Inspection

### Packet Level Routing
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Layer 4 vs. Layer 7 Packet Scope</text>

  {/* Layer 4 Block */}
  <g transform="translate(60, 60)">
    <rect width="180" height="130" fill="#1e1b4b" rx="2" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="90" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Layer 4 (TCP/IP)</text>
    <rect x="20" y="45" width="140" height="50" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="65" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">IP: 192.168.1.1</text>
    <text x="90" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Port: 80 / 443</text>
    <text x="90" y="115" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Does not read payload</text>
  </g>

  {/* Layer 7 Block */}
  <g transform="translate(360, 60)">
    <rect width="180" height="130" fill="#1c1917" rx="2" stroke="#10b981" stroke-width="1.5"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Layer 7 (Application)</text>
    <rect x="20" y="45" width="140" height="50" fill="#111" rx="2" stroke="#fff" stroke-width="1"/>
    <text x="90" y="65" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">HTTP GET /billing</text>
    <text x="90" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Cookie: session=123</text>
    <text x="90" y="115" fill="#a7f3d0" font-size="6" font-family="monospace" text-anchor="middle">Parses full payload</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Property | Layer 4 Load Balancing | Layer 7 Load Balancing |
| :--- | :--- | :--- |
| **Decryption Need** | None (routes encrypted packets blindly) | Mandatory for HTTPS (requires SSL certs) |
| **Max Throughput** | High (limited only by network interface) | Lower (limited by CPU decryption speed) |
| **Routing Flexibility**| Low (cannot route by path or cookie) | High (supports path, header, and cookie routing) |
| **Typical Tools** | HAProxy (TCP mode), AWS NLB, IPVS | Nginx, HAProxy (HTTP mode), AWS ALB |

---

## 4. Conceptual Check Questions

1. **Why does Direct Server Return (DSR) improve load balancer throughput?**
   *Answer:* In most web applications, response payloads (e.g. images, videos) are much larger than request payloads. DSR routes only the small incoming request packets through the load balancer, while the large response packets bypass it, preventing the balancer's outbound network link from saturating.

2. **Can a Layer 4 load balancer perform path-based routing (e.g. routing `/billing` to a specific service)?**
   *Answer:* No. Layer 4 load balancers operate at the transport layer and do not inspect the application payload. They see only TCP/UDP ports and IP addresses, so they cannot read URL paths.
""",
        "content": {
            "introduction": "Layer 4 load balancers route network traffic at the transport layer (TCP/UDP) without decrypting application data, maximizing throughput.",
            "whyImportant": "Handling millions of concurrent connections with low latency requires Layer 4 load balancers.",
            "realWorldApps": ["Using AWS Network Load Balancers to route TCP traffic.", "Implementing Direct Server Return to scale outbound network bandwidth."],
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
        "slug": "horizontal-scaling",
        "title": "Horizontal Scaling",
        "tagline": "Configure auto-scaling groups, manage stateless service layers, and resolve session persistence.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": ["performance-vs-scalability"],
        "related": ["load-balancing-algorithms", "what-is-system-design"],
        "practiceProblems": [],
        "markdown": """# Horizontal Scaling

**Horizontal Scaling** (scaling out) adds more server instances to your application pool to distribute incoming traffic. Unlike vertical scaling (adding CPU/RAM to a single node), horizontal scaling requires application servers to be stateless and uses load balancers to coordinate traffic. This chapter covers stateless architecture design, session persistence, and auto-scaling rules.

---

## 1. Stateless Architecture Design

To allow a load balancer to route any request to any server instance, the application tier must be **Stateless**. This means servers must not store session data (such as user logins or shopping carts) in local memory. Instead, all state must be stored in a shared external database or cache cluster (e.g., Redis):

### Stateful vs. Stateless Scaling
* **Stateful Scaling:** Servers store session data in memory. The load balancer must use sticky sessions to route each user to the server holding their data. If that server crashes, the user's session is lost.
* **Stateless Scaling:** Servers retrieve session data from a shared cache (Redis) for every request. If a server crashes, the load balancer routes traffic to another instance without interrupting the user's session.

---

## 2. Stateless Session Pipeline

Stateless servers retrieve session data from a shared Redis cluster for every request, allowing any server to handle any query:

### Stateless Session Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Stateless Session Pipeline</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Request</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Cookie: session_id=XYZ</text>
  </g>

  {/* App Server Pool */}
  <g transform="translate(200, 50)">
    <rect width="150" height="50" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="75" y="20" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">App Server 1 (Stateless)</text>
    <text x="75" y="38" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">Queries Redis for session</text>
  </g>

  <g transform="translate(200, 140)">
    <rect width="150" height="50" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="75" y="20" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">App Server 2 (Stateless)</text>
    <text x="75" y="38" fill="#fff" font-size="5" font-family="monospace" text-anchor="middle">Queries Redis for session</text>
  </g>

  {/* Shared Session Store */}
  <g transform="translate(410, 75)">
    <rect width="150" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="75" y="30" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Shared Cache (Redis)</text>
    <text x="75" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Session: XYZ -> User A</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,75 M 150,120 L 200,165" stroke="#71717a" stroke-width="1.2"/>
  <path d="M 350,75 L 410,120 M 350,165 L 410,120" stroke="#10b981" stroke-width="1.2" marker-end="url(#hs-arrow)"/>

  <defs>
    <marker id="hs-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Stateful Architecture | Stateless Architecture |
| :--- | :--- | :--- |
| **Session Location** | Server local RAM | Shared memory cache (Redis) |
| **Node Failover** | User session is lost if server crashes | User session continues uninterrupted |
| **Load Balancing** | Requires sticky sessions | Supports round-robin and random routing |
| **Scaling Complexity** | High | Low |

---

## 4. Auto-Scaling Group Configurations

In cloud environments, **Auto-Scaling Groups (ASGs)** scale instances dynamically based on resource usage metrics:
* **Scale-Out Trigger:** CPU utilization > 80% for 5 consecutive minutes (creates new instances).
* **Scale-In Trigger:** CPU utilization < 30% for 5 consecutive minutes (terminates idle instances to save cost).

---

## 5. Conceptual Check Questions

1. **Why does stateless scaling reduce the impact of server failures on users?**
   *Answer:* Since user session data is stored in a shared external cache rather than the server's local memory, if a server crashes, the load balancer redirects the user to a different server instance that retrieves their session data from the cache without interruption.

2. **What is a major trade-off when using a shared session cache in stateless scaling?**
   *Answer:* It adds network latency. App servers must make a network call to the shared cache to retrieve session data for every request, which is slower than reading from local memory.
""",
        "content": {
            "introduction": "Horizontal scaling adds application instances to handle load, requiring stateless servers and shared session caches.",
            "whyImportant": "Scaling systems to handle millions of concurrent users without downtime requires horizontal scaling.",
            "realWorldApps": ["Configuring auto-scaling groups in AWS EC2.", "Setting up Redis clusters to manage shared user session states."],
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
        "slug": "cache-aside",
        "title": "Cache-Aside Caching",
        "tagline": "Configure cache-aside query paths, manage keys invalidation, and prevent cache stampedes.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["write-through", "write-behind", "refresh-ahead"],
        "practiceProblems": [],
        "markdown": """# Cache-Aside Caching

The **Cache-Aside** (lazy loading) pattern is one of the most common caching strategies. In this pattern, the application coordinates reads and writes between the cache and the database. This chapter covers read/write paths, cache stampedes, and key invalidation.

---

## 1. Caching Paths

* **Read Path:** The application checks the cache first. If the data is found (Cache Hit), it returns it. If it is missing (Cache Miss), the application reads it from the database, writes it to the cache, and returns it.
* **Write Path:** The application updates the database directly and invalidates (deletes) the associated key from the cache, forcing the next read request to fetch the fresh data.

```python
# Conceptual implementation of Cache-Aside read pattern
def get_user_profile(user_id):
    # 1. Query Cache
    cached_profile = cache.get(f"user:{user_id}")
    if cached_profile:
        return cached_profile # Cache Hit
        
    # 2. Query DB on Cache Miss
    profile = db.query("SELECT * FROM users WHERE id = ?", user_id)
    if profile:
        # 3. Write back to Cache with TTL
        cache.set(f"user:{user_id}", profile, ttl=3600)
    return profile
```

---

## 2. Invalidation: Update vs. Delete

When updating database records, deleting the cache key is preferred over updating it to avoid race conditions. If two writes update the database and cache simultaneously, network delays can cause updates to arrive out of order, leaving the cache with stale data. Deleting the key ensures the next read fetches the correct value from the database.

---

## 3. Cache Stampede (Dogpile Effect)

A **Cache Stampede** occurs when a hot cache key (e.g. homepage data) expires under heavy traffic. Thousands of concurrent requests experience a cache miss simultaneously, querying the database at the same time and overloading it.

To prevent this, systems use **Mutex Locking**: only the first request to experience a cache miss acquires a lock to query the database and update the cache. Other requests wait or return stale data until the cache is updated.

---

## 4. Cache-Aside Execution Geometry

The application manages the query path, falling back to the database on cache misses:

### Cache-Aside Sequence
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Cache-Aside Read Flow</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Application</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Coordinates path</text>
  </g>

  {/* Cache */}
  <g transform="translate(210, 50)">
    <rect width="140" height="50" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="20" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Cache (Redis)</text>
    <text x="70" y="38" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Check key</text>
  </g>

  {/* Database */}
  <g transform="translate(410, 75)">
    <rect width="140" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Database (SQL)</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Query on cache miss</text>
  </g>

  {/* Paths */}
  <path d="M 150,110 L 210,75" stroke="#f59e0b" stroke-width="1.2" marker-end="url(#ca-arrow)"/>
  <path d="M 150,135 L 410,120" stroke="#10b981" stroke-width="1.2" marker-end="url(#ca-arrow)"/>

  <defs>
    <marker id="ca-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 5. Conceptual Check Questions

1. **Why is invalidating (deleting) a cache key safer than updating it during database writes?**
   *Answer:* Updating the key is susceptible to race conditions. If two writes occur in quick succession, network delays can cause their cache updates to arrive out of order, leaving the cache with stale data. Deleting the key forces the next read to fetch the correct value from the database.

2. **How does mutex locking resolve cache stampedes?**
   *Answer:* When a hot key expires, only the first request to experience a cache miss acquires the mutex lock to query the database. Other requests wait until the lock is released and read the updated value from the cache, preventing database overload.
""",
        "content": {
            "introduction": "The Cache-Aside pattern manages data access by checking the cache first and falling back to the database on misses.",
            "whyImportant": "Reducing database loads and caching hot assets dynamically requires implementing the Cache-Aside pattern.",
            "realWorldApps": ["Caching query results in Redis to speed up database lookups.", "Using mutex locks to protect databases from cache stampedes."],
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
        "slug": "write-through",
        "title": "Write-Through Caching",
        "tagline": "Configure write-through caching, manage transaction writes, and guarantee durability.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["cache-aside", "write-behind", "refresh-ahead"],
        "practiceProblems": [],
        "markdown": """# Write-Through Caching

In the **Write-Through** caching pattern, the cache acts as the primary data store for writes. When the application writes data, it updates the cache first, and the cache synchronously writes the update to the database. The system returns success only after both writes complete. This chapter covers write paths, transaction management, and durability.

---

## 1. Synchronous Caching Pipeline

The application writes data to the cache, which updates the database synchronously before returning:

```
[Application Write] ──> [Cache Store] ──> (Sync Write) ──> [Database Store]
```

1. **Write Request:** The application sends a write request to the cache.
2. **Synchronous Update:** The cache updates its memory and writes the change to the database synchronously.
3. **Success Return:** Once the database write completes, the cache returns success to the application.

---

## 2. Write-Through Caching Flow

Writes update the cache and database synchronously, ensuring they stay in sync:

### Write-Through Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">Write-Through Caching Pipeline</text>

  {/* App */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Application</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Initiates write</text>
  </g>

  {/* Cache */}
  <g transform="translate(200, 65)">
    <rect width="160" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="80" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">1. Cache Store</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Updates cache memory</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Triggers sync write to DB</text>
  </g>

  {/* DB */}
  <g transform="translate(420, 75)">
    <rect width="140" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Database</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Writes transaction</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#wt-arrow)"/>
  <path d="M 360,120 L 420,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#wt-arrow)"/>

  <defs>
    <marker id="wt-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Cache-Aside (Lazy) | Write-Through (Synchronous) |
| :--- | :--- | :--- |
| **Write Latency** | Low (writes to database directly) | High (waits for database confirmation) |
| **Read Latency (Miss)**| High (requires database lookup) | Low (data is already in the cache) |
| **Data Consistency** | Eventual consistency | Strong consistency |
| **Cache Freshness** | Keys can become stale if not invalidated | Keys are always up-to-date |

---

## 4. Conceptual Check Questions

1. **Why does Write-Through caching eliminate stale cache data?**
   *Answer:* Because every write updates the cache and the database synchronously before returning success. This ensures the cache always contains the latest version of the data.

2. **What is a drawback of using Write-Through caching in write-heavy systems?**
   *Answer:* It increases write latency. Since writes must update both the cache and the database synchronously, the overall write speed is limited by the slower database disk write operations.
""",
        "content": {
            "introduction": "Write-Through caching writes data to the cache and database synchronously, ensuring consistency at the expense of write latency.",
            "whyImportant": "Ensuring cache freshness and preventing stale reads requires using Write-Through caching.",
            "realWorldApps": ["Caching financial ledgers where data correctness is critical.", "Syncing user status updates to caches and databases synchronously."],
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
        "slug": "write-behind",
        "title": "Write-Behind Caching",
        "tagline": "Configure write-behind queue caches, handle write queues, and manage durability risks.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["cache-aside", "write-through", "refresh-ahead"],
        "practiceProblems": [],
        "markdown": """# Write-Behind Caching

In the **Write-Behind** (write-back) caching pattern, the application writes data directly to the cache, which returns success immediately. A background worker periodically flushes these updates to the database in batches. This chapter covers asynchronous pipelines, write queue management, and durability risks.

---

## 1. Asynchronous Database Writes

Write-Behind caching maximizes write performance by converting synchronous database writes into fast in-memory updates:
* **Immediate Response:** Writes update only the in-memory cache, returning success to the client within milliseconds.
* **Batch Coalescing:** The background worker merges multiple updates to the same record before writing to the database, reducing database load.
* **Durability Risk:** If the cache server crashes before flushing the queue to disk, updates are lost.

---

## 2. Write-Behind Queue Pipeline

Writes update the cache instantly. A background thread processes and flushes the write queue in batches:

### Write-Behind Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Write-Behind Caching Pipeline</text>

  {/* App */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Application</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Writes in-memory</text>
  </g>

  {/* Cache with Queue */}
  <g transform="translate(200, 65)">
    <rect width="160" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="80" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Cache (with Queue)</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Returns success instantly</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Queues write tasks</text>
  </g>

  {/* DB */}
  <g transform="translate(420, 75)">
    <rect width="140" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Database</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Asynchronous batch flush</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#wb-arrow)"/>
  <path d="M 360,120 L 420,120" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#wb-arrow)"/>

  <defs>
    <marker id="wb-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Write-Through (Synchronous) | Write-Behind (Asynchronous) |
| :--- | :--- | :--- |
| **Write Latency** | High (waits for database disk write) | Low (returns after in-memory write) |
| **Database Load** | High (every write hits the database) | Low (batching merges updates) |
| **Durability** | Strong (guaranteed on disk) | Weak (unflushed updates can be lost) |
| **Implementation** | Simple | Complex (requires queue management) |

---

## 4. Conceptual Check Questions

1. **How does batch coalescing in Write-Behind caching reduce database write loads?**
   *Answer:* If a record is updated multiple times in quick succession (e.g. video view count), Write-Behind merges these updates in memory. The background worker writes only the final state to the database, replacing multiple writes with a single update.

2. **Why does Write-Behind caching pose a durability risk?**
   *Answer:* Since writes update only the in-memory cache and return success immediately, if the cache server crashes before the background worker flushes the queue to the database, the unflushed data is lost.
""",
        "content": {
            "introduction": "Write-Behind caching writes updates to memory instantly and flushes them to the database asynchronously, maximizing performance.",
            "whyImportant": "Reducing database write loads and optimizing write latency requires using Write-Behind caching.",
            "realWorldApps": ["Logging real-time analytics events to memory before flushing to disk.", "Batching e-commerce page view updates to database stores."],
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
        "slug": "refresh-ahead",
        "title": "Refresh-Ahead Caching",
        "tagline": "Configure refresh-ahead key reload paths, predict read patterns, and manage hot keys.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["cache-aside", "write-through", "write-behind"],
        "practiceProblems": [],
        "markdown": """# Refresh-Ahead Caching

If keys expire before clients request them, the next request will experience a slow cache miss. **Refresh-Ahead** caching prevents this: the cache automatically reloads hot keys in the background before they expire. This chapter covers predicted read patterns, background reloads, and hot key configurations.

---

## 1. Predictive Background Reloads

In a Refresh-Ahead configuration:
* **TTL Threshold:** The system defines a refresh threshold (e.g. 10% remaining TTL).
* **Read Trigger:** If a client requests a key within this threshold, the cache returns the value immediately and triggers an asynchronous task to reload the key from the database.
* **Result:** Subsequent reads receive the fresh value from memory without experiencing a cache miss.

---

## 2. Refresh-Ahead Execution Timeline

A read request within the refresh window triggers an asynchronous background reload, updating the key before it expires:

### Refresh-Ahead Workflow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Refresh-Ahead Caching Timeline</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="30" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Read</text>
    <text x="55" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Queries hot key</text>
  </g>

  {/* Cache Store */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Cache Store (80% TTL)</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Returns value instantly</text>
    <text x="15" y="75" fill="#ef4444" font-size="6" font-family="monospace">Triggers async reload</text>
  </g>

  {/* DB */}
  <g transform="translate(430, 75)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Database</text>
    <text x="65" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Fetches fresh record</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ra-arrow)"/>
  <path d="M 380,120 L 430,120" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#ra-arrow)"/>

  <defs>
    <marker id="ra-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Caching Strategy | How it reloads | Read Latency on Expiry | Database Load Pattern |
| :--- | :--- | :--- | :--- |
| **Cache-Aside** | Synchronously on request | High (cache miss read) | Spiky (heavy load on expiration) |
| **Refresh-Ahead** | Asynchronously in background | Low (key reloaded before expiry) | Smooth (distributed background reads) |

---

## 4. Conceptual Check Questions

1. **Why does Refresh-Ahead caching reduce p99 read latency spikes?**
   *Answer:* In standard caching, the first request after expiration experiences a cache miss and must wait for a database query. Refresh-Ahead reloads hot keys in the background before they expire, ensuring clients almost always read from memory.

2. **When is Refresh-Ahead caching inefficient?**
   *Answer:* In systems with cold, unpredictable read keys. If the system reloads keys that are never read again, it wastes database read bandwidth and memory space on unused data.
""",
        "content": {
            "introduction": "Refresh-Ahead caching reloads hot keys in the background before they expire, minimizing read latency spikes.",
            "whyImportant": "Maintaining low p99 latencies for hot keys requires using Refresh-Ahead caching.",
            "realWorldApps": ["Pre-fetching popular homepage metadata before it expires.", "Automatically updating global settings keys in memory caches."],
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
        "slug": "client-caching",
        "title": "Client Caching",
        "tagline": "Configure client caching directives, write etag validations, and manage local storage.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["cdn-caching", "web-server-caching"],
        "practiceProblems": [],
        "markdown": """# Client Caching

To optimize application performance, you should cache data close to the user: on their device. **Client Caching** uses the client's web browser or mobile app to store static assets and API responses. This chapter covers cache-control headers, ETag validation, and browser storage options.

---

## 1. Browser Storage Mechanics

Browsers store client-side data using three primary mechanisms:

* **HTTP Cache:** Stores static assets (images, scripts, stylesheets). Managed by the browser based on HTTP response headers.
* **localStorage / sessionStorage:** Stores small strings of data (up to 5MB) in the browser. sessionStorage expires when the tab is closed, while localStorage persists until cleared.
* **IndexedDB:** A transactional database in the browser designed for storing large volumes of structured data.

---

## 2. HTTP ETag Conditional Request Flow

An **ETag (Entity Tag)** is a unique hash representing a file version. When a client requests a file, it sends its cached ETag. If the file hasn't changed, the server returns a `304 Not Modified` status, saving bandwidth:

### ETag Validation Workflow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">ETag Validation Flow</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Browser</text>
    <text x="15" y="55" fill="#fff" font-size="5" font-family="monospace">If-None-Match: "v1.2"</text>
  </g>

  {/* Server */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Web Server</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Compares hash value</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Returns 304 Not Modified</text>
  </g>

  {/* Network Save */}
  <g transform="translate(420, 75)">
    <rect width="140" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="70" y="35" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Bandwidth Saved</text>
    <text x="70" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">No file payload sent</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#cc-arrow)"/>
  <path d="M 380,120 L 420,120" stroke="#10b981" stroke-width="1.5" marker-end="url(#cc-arrow)"/>

  <defs>
    <marker id="cc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Directive | Cache Location | Who Can Cache | Typical Usage |
| :--- | :--- | :--- | :--- |
| `Cache-Control: private, max-age=60` | Client Browser only | Users only | User dashboards, account pages |
| `Cache-Control: public, max-age=3600` | Browser and CDN Edge | Anyone | Static assets (CSS, JS) |
| `Cache-Control: no-store` | Forbidden | None | Financial transactions, secrets |

---

## 4. Conceptual Check Questions

1. **How does the `no-cache` directive differ from `no-store`?**
   *Answer:* `no-store` tells the browser and CDNs not to cache the file. `no-cache` allows the browser to cache the file, but forces it to validate it with the server (e.g. using ETags) before serving it.

2. **Why are ETags useful for optimizing mobile network bandwidth?**
   *Answer:* Mobile networks have variable speeds. If a mobile app requests a file and sends its cached ETag, the server returns a lightweight `304 Not Modified` header instead of the full file payload, saving bandwidth.
""",
        "content": {
            "introduction": "Client caching stores resources on user devices, using cache-control headers and ETags to minimize network transfer overheads.",
            "whyImportant": "Reducing server bandwidth usage and minimizing load times for returning users requires client-side caching.",
            "realWorldApps": ["Configuring index files with ETag validators.", "Storing user authorization tokens in localStorage."],
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
        "slug": "cdn-caching",
        "title": "CDN Caching",
        "tagline": "Configure CDN edge caches, optimize global points of presence, and cache dynamic API routes.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["client-caching", "web-server-caching"],
        "practiceProblems": [],
        "markdown": """# CDN Caching

A **Content Delivery Network (CDN)** caches resources on globally distributed edge nodes to reduce latency for users. While CDNs are traditionally used for static files, modern CDNs can also cache dynamic API responses. This chapter covers edge configurations, caching dynamic content, and geo-routing.

---

## 1. Dynamic API Route Caching

Modern CDNs can cache dynamic API responses (e.g. product catalogs or search results) by analyzing query parameters:
* **Cache Key Customization:** The CDN generates unique cache keys based on query parameters (e.g. `GET /api/v1/search?q=shoes&page=2`).
* **Vary Headers:** The `Vary` HTTP header tells the CDN to cache separate versions of a page based on header values (e.g., `Vary: Accept-Language` caches different versions for English and French users).

---

## 2. Global CDN Edge Cache Nodes

CDN edge nodes (Points of Presence, or PoPs) intercept requests globally, serving cached content close to users:

### CDN Global Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">CDN Edge Architecture</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client (Paris)</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Queries page</text>
  </g>

  {/* CDN Edge Node */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Edge PoP (Paris)</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Serves cached asset</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Latency: 12ms</text>
  </g>

  {/* Origin Server */}
  <g transform="translate(430, 75)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Origin Server (US)</text>
    <text x="65" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Bypassed on cache hit</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#cdn-c-arrow)"/>
  <path d="M 380,120 L 430,120" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#cdn-c-arrow)"/>

  <defs>
    <marker id="cdn-c-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Static Content Caching | Dynamic Content Caching |
| :--- | :--- | :--- |
| **TTL Settings** | High (e.g. 1 year) | Low (e.g. 5 minutes or less) |
| **Cache Key** | Simple URL path | URL path + query parameters |
| **Invalidation Need** | Low (uses cache busting hashes) | High (requires programmatic purges) |
| **Examples** | Images, CSS, JS files | Search results, product detail pages |

---

## 4. Conceptual Check Questions

1. **How does the `Vary: Accept-Language` header prevent serving the wrong language page to users?**
   *Answer:* It tells the CDN to include the client's language header in the cache key. This ensures the CDN stores and serves separate cached versions of the page for English and French users.

2. **Why is caching dynamic content on a CDN riskier than static content?**
   *Answer:* Dynamic data changes frequently. If the CDN serves a cached API response with a long TTL, users may see outdated information (e.g., incorrect stock counts or prices). This requires short TTLs and purge rules to prevent displaying stale data.
""",
        "content": {
            "introduction": "CDN caching caches static assets and dynamic API responses on global edge servers, reducing user latency.",
            "whyImportant": "Serving API endpoints and assets globally under 50ms requires using CDN edge caching.",
            "realWorldApps": ["Configuring Cloudflare rules to cache product details.", "Setting up custom CDN cache keys based on query parameters."],
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
        "slug": "web-server-caching",
        "title": "Web Server Caching",
        "tagline": "Configure web proxy caches, manage Nginx fastcgi caches, and optimize memory buffers.",
        "category": "System Design & Distributed Systems",
        "readTime": 15,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["client-caching", "cdn-caching"],
        "practiceProblems": [],
        "markdown": """# Web Server Caching

When a cache miss occurs at the browser and CDN levels, the request hits your web server. **Web Server Caching** caches database responses and page fragments on the web server instance (e.g. Nginx or Apache) before the request reaches the slower application tier. This chapter covers proxy caching, Nginx fastcgi caching, and buffer limits.

---

## 1. Proxy Caching Mechanics

A web server like Nginx sits in front of your application server. When Nginx receives a request, it checks its local disk or memory cache. If it finds the response, Nginx returns it immediately, bypassing the application server entirely:

```nginx
# Nginx Proxy Cache Configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m;

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_cache my_cache;
        proxy_cache_valid 200 302 10m;
        proxy_pass http://app_upstream;
    }
}
```

---

## 2. Nginx Proxy Cache Layout

Nginx checks its local proxy cache. On a cache hit, it returns the response immediately without forwarding the request to the application server:

### Proxy Cache Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Web Server Proxy Cache</text>

  {/* Client */}
  <g transform="translate(40, 75)">
    <rect width="110" height="90" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="55" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Client Request</text>
    <text x="55" y="55" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">GET /pricing</text>
  </g>

  {/* Nginx Web Server */}
  <g transform="translate(200, 65)">
    <rect width="180" height="110" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="90" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Nginx (Proxy Cache)</text>
    <text x="15" y="55" fill="#fff" font-size="6" font-family="monospace">Checks local disk cache</text>
    <text x="15" y="75" fill="#a7f3d0" font-size="6" font-family="monospace">Cache Hit: returns response</text>
  </g>

  {/* Backend App Server */}
  <g transform="translate(430, 75)">
    <rect width="130" height="90" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="30" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">App Server</text>
    <text x="65" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Bypassed on cache hit</text>
  </g>

  {/* Paths */}
  <path d="M 150,120 L 200,120" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#ws-c-arrow)"/>
  <path d="M 380,120 L 430,120" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#ws-c-arrow)"/>

  <defs>
    <marker id="ws-c-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Cache Level | Cache Storage Location | Scope | Latency |
| :--- | :--- | :--- | :--- |
| **Nginx Proxy Cache** | Web server local SSD/disk | Shared across all users | 1-5 ms |
| **Nginx FastCGI Cache**| Web server local disk | Shared across users | 1-5 ms |
| **Application Cache** | App Server RAM (e.g. Node memory) | Shared per server node | < 1 ms |

---

## 4. Conceptual Check Questions

1. **Why is Nginx proxy caching preferred over in-app caching (e.g. caching responses in node server memory)?**
   *Answer:* It is more efficient. In-app caching occupies application server memory and requires the language runtime (Node, Python) to parse the request. Nginx handles caching at the web tier, bypassing the slower application server entirely.

2. **How does Nginx know whether an upstream server response is safe to cache?**
   *Answer:* Nginx inspects the HTTP headers returned by the upstream server. By default, it respects the `Cache-Control`, `Expires`, and `Pragma` headers, and will not cache responses containing a `Set-Cookie` header.
""",
        "content": {
            "introduction": "Web server caching intercepts incoming requests at the reverse proxy tier (Nginx), serving cached responses before requests reach slower application servers.",
            "whyImportant": "Reducing application tier CPU load and protecting APIs from request floods requires web server caching.",
            "realWorldApps": ["Configuring Nginx proxy caching to cache public API endpoints.", "Bypassing app servers using Nginx FastCGI caching for static pages."],
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
