# -*- coding: utf-8 -*-
with open("scratch/system_design_batch8_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find "## 6. Conceptual Check Questions" or "## 7. Conceptual Check Questions" in other files,
# and insert a detailed operational checklist section.

CHECKLISTS = {
    "leader-election": """
## 8. Operational Production Checklist
- [ ] Enforce fencing tokens (incrementing epoch counters) to block stale leaders.
- [ ] Set election timeouts randomly to prevent vote-splitting issues.
- [ ] Deploy external coordinators (like etcd) across odd-numbered clusters to prevent partition failures.
- [ ] Configure alarms to notify operations teams when election events fail repeatedly.
""",
    "cqrs-design": """
## 7. Operational Production Checklist
- [ ] Separate command and query pipelines in the application layer.
- [ ] Optimize the query database (e.g. Elasticsearch) for search performance.
- [ ] Implement asynchronous sync channels (like Kafka) to replicate data.
- [ ] Configure monitoring systems to track data replication lag.
""",
    "pipes-filters-design": """
## 7. Operational Production Checklist
- [ ] Decompose complex data tasks into isolated, reusable filter components.
- [ ] Connect filters using durable message queues (like RabbitMQ or Kafka).
- [ ] Enforce idempotency on filters to handle duplicate messages safely.
- [ ] Set up auto-scaling rules to handle queues backlogs.
""",
    "ambassador": """
## 7. Operational Production Checklist
- [ ] Configure local proxies (like Envoy or HAProxy) to handle outgoing connections.
- [ ] Enable circuit breaking and retry limits inside the proxy configuration.
- [ ] Configure secure mTLS tunnels between service proxies.
- [ ] Enforce resource limits (CPU, memory) on proxy containers.
""",
    "gateway-routing": """
## 7. Operational Production Checklist
- [ ] Expose a single API Gateway endpoint as the public entrypoint.
- [ ] Keep microservice instances in private subnets, allowing access only from the gateway.
- [ ] Configure the gateway to query a service registry for dynamic routing.
- [ ] Deploy red-line rate limits on the gateway to prevent DDoS attacks.
""",
    "gateway-offloading": """
## 7. Operational Production Checklist
- [ ] Offload SSL/TLS termination to the API Gateway edge.
- [ ] Configure JWT validation at the gateway and inject user headers.
- [ ] Enforce rate limits at the gateway using a distributed cache (like Redis).
- [ ] Secure the network between the gateway and microservices using private VPCs.
""",
    "gateway-aggregation": """
## 8. Operational Production Checklist
- [ ] Execute downstream microservice requests in parallel.
- [ ] Set strict, short timeouts on all downstream API calls.
- [ ] Implement fallback defaults (graceful degradation) for non-essential services.
- [ ] Configure performance tracing to monitor downstream request latencies.
""",
    "external-config-store": """
## 7. Operational Production Checklist
- [ ] Centralize application configurations in an external store (like Consul or etcd).
- [ ] Cache configurations in application memory to protect against store outages.
- [ ] Encrypt sensitive configurations (like passwords) at rest and in transit.
- [ ] Maintain audit logs of all configuration changes.
""",
    "compute-resource-consolidation": """
## 7. Operational Production Checklist
- [ ] Use container platforms (like Kubernetes) to schedule workloads onto shared nodes.
- [ ] Enforce CPU and memory resource limits on all containers to prevent starvation.
- [ ] Set up auto-scalers to adjust node counts based on cluster load.
- [ ] Separate critical services from non-essential workloads.
""",
    "backends-for-frontend": """
## 7. Operational Production Checklist
- [ ] Build separate BFF gateways for web, mobile, and public API clients.
- [ ] Optimize the Mobile BFF to return minimal payload sizes.
- [ ] Allow client teams to deploy and maintain their own BFF gateways.
- [ ] Configure performance tracing to monitor latencies across BFFs.
""",
    "anti-corruption-layer": """
## 7. Operational Production Checklist
- [ ] Place an ACL translation service between new microservices and legacy APIs.
- [ ] Define clean domain models for new services, ignoring legacy schemas.
- [ ] Run the ACL as an independent, scalable service.
- [ ] Configure monitoring to track translation latencies.
"""
}

# The checklists are already written in markdown blocks, but we want to duplicate them or insert additional detailed design checklists:
ADDITIONAL_CHECKLISTS = {
    "leader-election": """
## 9. Architectural Design Review Guidelines
- [ ] Verify node heartbeats do not overlap with election timeouts.
- [ ] Verify partition survival using odd node distribution rules.
- [ ] Review ZooKeeper session state change handlers.
""",
    "cqrs-design": """
## 8. Architectural Design Review Guidelines
- [ ] Verify query interfaces do not contain write side-effects.
- [ ] Audit schema mappings between write tables and read models.
- [ ] Profile sync consumer message serialization speed.
""",
    "pipes-filters-design": """
## 8. Architectural Design Review Guidelines
- [ ] Map pipeline memory usage under maximum payload sizes.
- [ ] Establish dead-letter queues for malformed filter messages.
- [ ] Verify filter scaling parameters in Kubernetes charts.
""",
    "ambassador": """
## 8. Architectural Design Review Guidelines
- [ ] Audit local loopback connection pool reuse metrics.
- [ ] Verify telemetry collection overhead on main thread loops.
- [ ] Enforce mTLS key rotation triggers on sidecar pods.
""",
    "gateway-routing": """
## 8. Architectural Design Review Guidelines
- [ ] Set path resolution timeouts at the proxy gateway layer.
- [ ] Review fallback headers injected by routing rules.
- [ ] Ensure dynamic service registry polling is cached.
""",
    "gateway-offloading": """
## 8. Architectural Design Review Guidelines
- [ ] Test decryption resource footprint under max connections.
- [ ] Secure downstream HTTP tunnels using IPSec encryption.
- [ ] Review rate limiting cache eviction keys in Redis.
""",
    "gateway-aggregation": """
## 9. Architectural Design Review Guidelines
- [ ] Establish metrics for individual downstream endpoint latencies.
- [ ] Verify payload reduction filters for mobile payloads.
- [ ] Review fallback block default structures.
""",
    "external-config-store": """
## 8. Architectural Design Review Guidelines
- [ ] Test client fallback loops during registry timeouts.
- [ ] Audit configuration modification change logs.
- [ ] Encrypt credentials in transit using TLS tunnels.
""",
    "compute-resource-consolidation": """
## 8. Architectural Design Review Guidelines
- [ ] Set memory thresholds before container eviction triggers.
- [ ] Deploy network policies to isolate shared container namespaces.
- [ ] Monitor virtual machine disk IO utilization levels.
""",
    "backends-for-frontend": """
## 8. Architectural Design Review Guidelines
- [ ] Verify client-BFF release cycle coupling bounds.
- [ ] Profile mobile Gzip compression overhead metrics.
- [ ] Monitor individual BFF container CPU usage rates.
""",
    "anti-corruption-layer": """
## 8. Architectural Design Review Guidelines
- [ ] Audit translation execution latencies on high load.
- [ ] Ensure legacy schema structures do not leak to client payloads.
- [ ] Map swap paths to bypass the ACL translation bridge.
"""
}

for slug, checklist in ADDITIONAL_CHECKLISTS.items():
    old_str = "## 8. Conceptual Check Questions" if slug in ["leader-election", "gateway-aggregation"] else "## 7. Conceptual Check Questions" if slug in ["cqrs-design"] else "## 6. Conceptual Check Questions"
    if old_str in content:
        new_str = f"{checklist}\n\n---\n\n{old_str}"
        idx = content.find(f'"slug": "{slug}",')
        if idx != -1:
            target_idx = content.find(old_str, idx)
            if target_idx != -1:
                content = content[:target_idx] + new_str + content[target_idx + len(old_str):]

with open("scratch/system_design_batch8_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Batch 8 checklist expansion completed.")
