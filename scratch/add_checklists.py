# -*- coding: utf-8 -*-
with open("scratch/system_design_batch6_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find "## 7. Conceptual Check Questions" in graphql, and "## 6. Conceptual Check Questions" or "## 5. Conceptual Check Questions" in other files,
# and insert a detailed operational checklist section.

CHECKLISTS = {
    "graphql": """
## 8. Operational Production Checklist
- [ ] Enforce max query depth limits (typically 5 levels max) in the gateway validation layer.
- [ ] Integrate DataLoader batching across all database/API nested resolver queries.
- [ ] Enable query complexity analysis with a ceiling of 1000 complexity points.
- [ ] Disable GraphQL introspection in public-facing production environments.
""",
    "idempotent-operations": """
## 7. Operational Production Checklist
- [ ] Clients must generate unique UUIDv4 tokens for each mutating action attempt.
- [ ] Middleware should store idempotency key results in a distributed Redis cluster.
- [ ] Implement short distributed locks to protect against concurrent duplicate execution.
- [ ] Define deterministic payload hash verification to ensure retries carry matching parameters.
""",
    "improper-instantiation": """
## 6. Operational Production Checklist
- [ ] Instantiate database clients outside request lifecycles to utilize connection pools.
- [ ] Configure pool capacity bounds based on database engine capacity limits.
- [ ] Ensure sockets are returned to connection pools in error-handling blocks.
- [ ] Optimize TCP connection timeout configurations at the operating system level.
""",
    "monolithic-persistence": """
## 6. Operational Production Checklist
- [ ] Extract databases into separate logical or physical instances per domain.
- [ ] Expose microservice APIs to retrieve domain data instead of querying databases.
- [ ] Coordinate updates across domain databases using Saga transaction orchestrators.
- [ ] Set up asynchronous database replication pipelines using message queues.
""",
    "noisy-neighbor": """
## 6. Operational Production Checklist
- [ ] Track API usage frequency and enforce rate limit rules per client ID.
- [ ] Enforce container CPU and memory limit parameters in Kubernetes clusters.
- [ ] Set up separate connection pools for standard vs enterprise client database tiers.
- [ ] Automatically route high-volume tenants to dedicated hardware nodes.
""",
    "synchronous-io": """
## 6. Operational Production Checklist
- [ ] Replace synchronous blocking methods with promise-based async functions.
- [ ] Run CPU-heavy tasks in background processes or thread pools.
- [ ] Monitor main event loop blockages using performance monitoring tools.
- [ ] Configure asynchronous handlers to catch and resolve all rejected promise states.
""",
    "extraneous-fetching": """
## 6. Operational Production Checklist
- [ ] Design index structures that cover all query select projection fields.
- [ ] Use cursor-based pagination instead of offset pagination for large tables.
- [ ] Refactor SQL statements to select explicit column fields rather than using SELECT *.
- [ ] Profile database queries to detect and eliminate table scans.
""",
    "busy-database": """
## 6. Operational Production Checklist
- [ ] Move business logic from database triggers and stored procedures to app code.
- [ ] Scale app servers horizontally behind load balancers to distribute logic.
- [ ] Profile SQL execution times to identify and remove calculation blocks.
- [ ] Keep database tasks focused on data persistence and transaction safety.
""",
    "busy-frontend": """
## 6. Operational Production Checklist
- [ ] Offload long-running calculations to background Web Worker threads.
- [ ] Enforce view virtualization for list structures exceeding 100 rows.
- [ ] Profile frontend execution paths to identify tasks blocking the main thread.
- [ ] Limit layout recalculation triggers by styling components dynamically.
""",
    "chatty-io": """
## 6. Operational Production Checklist
- [ ] Group sequential database statements into single batched transaction requests.
- [ ] Implement API gateway layers to consolidate mobile client requests.
- [ ] Combine dynamic SQL queries using bulk command parameters.
- [ ] Use SQL joins to retrieve related resources in a single database round-trip.
""",
    "retry-storm": """
## 8. Operational Production Checklist
- [ ] Require clients to use exponential backoff and jitter for retry delays.
- [ ] Deploy circuit breakers to fail requests immediately during outages.
- [ ] Set up load shedding to reject low-priority traffic during surges.
- [ ] Optimize server capacity limits to handle recovery traffic spikes.
"""
}

for slug, checklist in CHECKLISTS.items():
    old_str = "## 8. Conceptual Check Questions" if slug == "graphql" else "## 7. Conceptual Check Questions" if slug in ["idempotent-operations", "retry-storm"] else "## 6. Conceptual Check Questions"
    if old_str in content:
        new_str = f"{checklist}\n\n---\n\n{old_str}"
        idx = content.find(f'"slug": "{slug}",')
        if idx != -1:
            target_idx = content.find(old_str, idx)
            if target_idx != -1:
                content = content[:target_idx] + new_str + content[target_idx + len(old_str):]

with open("scratch/system_design_batch6_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Checklist expansion completed.")
