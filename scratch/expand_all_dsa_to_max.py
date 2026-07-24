from generate_dynamodb_and_backend import inject_into_de_blog_data

availability_vs_consistency_md = r"""# Availability vs. Consistency: CAP Theorem, PACELC & Distributed Quorums

In distributed backend systems engineering, the **CAP Theorem** (Brewer's Theorem) states that a distributed data store can simultaneously guarantee at most two out of three guarantees: **Consistency**, **Availability**, and **Partition Tolerance**. Because network partitions (cable cuts, packet loss, hardware faults) are inevitable in real-world infrastructure, a distributed database must explicitly trade off Consistency against Availability during network partition events.

---

## 1. CAP Theorem & PACELC Trade-Off Matrix

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="capBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#capBg)" stroke="#f59e0b" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#fef3c7" font-family="system-ui, sans-serif" font-size="20" font-weight="700">CAP & PACELC Distributed System Trade-Offs</text>

  <!-- CP System (Consistency + Partition Tolerance) -->
  <g transform="translate(100, 100)">
    <rect width="320" height="110" rx="8" fill="#451a03" stroke="#f59e0b" stroke-width="2"/>
    <text x="160" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">CP Systems (e.g., HBase, Spanner)</text>
    <text x="20" y="60" fill="#fde68a" font-family="system-ui" font-size="12">If network splits, reject writes to prevent split-brain.</text>
    <text x="20" y="85" fill="#fbbf24" font-family="monospace" font-size="11">Priority: Linearizable Consistency</text>
  </g>

  <!-- AP System (Availability + Partition Tolerance) -->
  <g transform="translate(480, 100)">
    <rect width="320" height="110" rx="8" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
    <text x="160" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">AP Systems (e.g., Cassandra, Dynamo)</text>
    <text x="20" y="60" fill="#a7f3d0" font-family="system-ui" font-size="12">Accept writes on both sides; reconcile via Vector Clocks.</text>
    <text x="20" y="85" fill="#34d399" font-family="monospace" font-size="11">Priority: High Availability (SLA 99.999%)</text>
  </g>

  <!-- Quorum Math Formula -->
  <g transform="translate(200, 240)">
    <rect width="500" height="100" rx="8" fill="#0f172a" stroke="#64748b" stroke-width="1.5"/>
    <text x="250" y="30" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-weight="700" font-size="14">Distributed Quorum Invariant</text>
    <text x="250" y="60" text-anchor="middle" fill="#f1f5f9" font-family="monospace" font-size="14">R + W > N  ==> Strong Consistency Guaranteed</text>
    <text x="250" y="80" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">N = Replication Factor | R = Read Quorum | W = Write Quorum</text>
  </g>
</svg>

### The PACELC Theorem
The PACELC theorem extends CAP by stating:
If there is a **Partition (P)**, trade off **Availability (A)** vs. **Consistency (C)**; **Else (E)**, trade off **Latency (L)** vs. **Consistency (C)**.

---

## 2. Production Python Quorum Simulation

```python
class QuorumCluster:
    def __init__(self, node_count=5):
        self.nodes = [{} for _ in range(node_count)]
        self.N = node_count

    def write(self, key, value, W):
        if W <= self.N // 2:
            raise ValueError("W must exceed N/2 to prevent split-brain")
        
        written = 0
        for node in self.nodes[:W]:
            node[key] = value
            written += 1
        return written >= W

    def read(self, key, R):
        versions = []
        for node in self.nodes[:R]:
            if key in node:
                versions.append(node[key])
        return versions[0] if versions else None

cluster = QuorumCluster(node_count=5)
cluster.write("balance_usr_102", 500.00, W=3)
print("Quorum Read Result:", cluster.read("balance_usr_102", R=3))
```
"""

sql_tuning_md = r"""# SQL Query Tuning: B-Tree Index Scans, Execution Plans & Join Optimizations

Optimizing relational database performance requires mastering how SQL query planners (PostgreSQL, MySQL InnoDB) construct execution plans. From eliminating full table scans (`seq scan`) to leveraging composite indexes and optimizing nested loops, SQL tuning drastically reduces disk I/O and query latency.

---

## 1. B-Tree Index Search & Execution Plan Nodes

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sqlBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#sqlBg)" stroke="#60a5fa" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#eff6ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">EXPLAIN ANALYZE Execution Node Hierarchy</text>

  <!-- Query Node 1 -->
  <g transform="translate(300, 90)">
    <rect width="300" height="60" rx="6" fill="#1d4ed8" stroke="#93c5fd" stroke-width="1.5"/>
    <text x="150" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Hash Aggregate (GROUP BY user_id)</text>
    <text x="150" y="45" text-anchor="middle" fill="#bfdbfe" font-family="monospace" font-size="10">Cost: 104.20..106.20 | Rows: 200</text>
  </g>

  <!-- Query Node 2 -->
  <g transform="translate(300, 190)">
    <rect width="300" height="60" rx="6" fill="#1e40af" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="150" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Index Scan using idx_orders_user_date</text>
    <text x="150" y="45" text-anchor="middle" fill="#bfdbfe" font-family="monospace" font-size="10">Index Cond: (user_id = 104) AND (created_at >= ...)</text>
  </g>

  <path d="M 450 150 L 450 190" stroke="#93c5fd" stroke-width="2.5" />
</svg>

---

## 2. Essential SQL Tuning Checklist
1. **Avoid `SELECT *`:** Query only explicit required columns to allow **Covering Index Scans** without reading table heap pages.
2. **Left-Most Prefix Rule:** Composite index `(tenant_id, status, created_at)` can only optimize queries filtering by `tenant_id` first.
3. **Avoid Functions on Indexed Columns:** Writing `WHERE UPPER(email) = 'USER@DOMAIN.COM'` breaks index usage; create a functional index `CREATE INDEX idx_upper_email ON users (UPPER(email))` instead.
"""

inject_into_de_blog_data('availability-vs-consistency', availability_vs_consistency_md)
inject_into_de_blog_data('sql-tuning', sql_tuning_md)
