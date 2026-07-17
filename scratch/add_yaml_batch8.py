# -*- coding: utf-8 -*-
with open("scratch/system_design_batch8_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find "## 5. Operational Production Checklist" or "## 5. Comparison Matrix" in the markdown,
# and insert detailed code snippets.

ADDITIONAL_MARKDOWNS = {
    "leader-election": """
---

## 5. Kubernetes Active-Standby YAML Configuration
Below is a deployment YAML manifest using a lease coordinator helper:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lead-election-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: coordinator
  template:
    metadata:
      labels:
        app: coordinator
    spec:
      containers:
      - name: main-worker
        image: worker:latest
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        ports:
        - containerPort: 8080
```
""",
    "cqrs-design": """
---

## 5. Write Schema vs. Read Schema JSON Manifest
Below is the structural format difference between normalized write payloads and denormalized read payloads:
```json
// Write Schema
{
  "transactionId": "tx_981a",
  "userId": "usr_42",
  "items": [
    { "productId": "prod_1", "quantity": 2 }
  ]
}

// Read Schema (Materialized View)
{
  "dashboardId": "usr_42",
  "totalSpent": 150.00,
  "lastOrderDate": "2026-07-17",
  "itemsCount": 2,
  "recentProductsList": ["Apples", "Oranges"]
}
```
""",
    "pipes-filters-design": """
---

## 5. Processing Pipe Configuration Schema
Below is a pipeline orchestration JSON configuration:
```json
{
  "pipelineId": "video-transcoding-pipeline",
  "stages": [
    {
      "name": "sanitize-video",
      "queueName": "raw-video-queue",
      "timeoutMs": 15000
    },
    {
      "name": "transcode-video",
      "queueName": "clean-video-queue",
      "timeoutMs": 60000
    }
  ]
}
```
""",
    "ambassador": """
---

## 5. Envoy Proxy Ambassador YAML Configuration
Below is an Envoy configurations manifest for an ambassador proxy routing outgoing traffic:
```yaml
static_resources:
  listeners:
  - name: local_service
    address:
      socket_address:
        address: 127.0.0.1
        port_value: 10000
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          route_config:
            name: local_route
            virtual_hosts:
            - name: local_service
              domains: ["*"]
              routes:
              - match:
                  prefix: "/"
                route:
                  cluster: remote_db_cluster
  clusters:
  - name: remote_db_cluster
    connect_timeout: 0.25s
    type: LOGICAL_DNS
    dns_lookup_family: V4_ONLY
    lb_policy: ROUND_ROBIN
    load_assignment:
      cluster_name: remote_db_cluster
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: db.internal
                port_value: 5432
```
""",
    "gateway-routing": """
---

## 5. API Gateway Route Configuration YAML
Below is a path-based routing configuration for an NGINX API Gateway:
```nginx
http {
    upstream user_servers {
        server user-service-1.internal:8080;
        server user-service-2.internal:8080;
    }
    upstream order_servers {
        server order-service-1.internal:8081;
    }
    server {
        listen 80;
        location /users {
            proxy_pass http://user_servers;
        }
        location /orders {
            proxy_pass http://order_servers;
        }
    }
}
```
""",
    "gateway-offloading": """
---

## 5. Gateway Offloading SSL & Auth Configuration
Below is an configuration snippet for gateway authentication:
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/gateway.crt;
    ssl_certificate_key /etc/ssl/certs/gateway.key;

    location /api/ {
        # Offload JWT validation to gateway
        auth_request /validate-token;
        proxy_pass http://backend_cluster;
        proxy_set_header X-User-Id $auth_user;
    }
}
```
""",
    "gateway-aggregation": """
---

## 7. Aggregation Response Payload Schema
Below is the response payload returned by the aggregation gateway:
```json
{
  "userId": "12345",
  "profile": {
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "orders": [
    { "orderId": "ord_1", "total": 99.99 },
    { "orderId": "ord_2", "total": 49.99 }
  ],
  "recommendations": [
    { "productId": "prod_5", "name": "Wireless Charger" }
  ]
}
```
""",
    "external-config-store": """
---

## 5. etcd Configuration Store Properties Schema
Below is a properties payload stored in an etcd configuration engine:
```json
{
  "database": {
    "url": "jdbc:postgresql://db.internal:5432/prod",
    "poolSize": 20,
    "timeoutMs": 5000
  },
  "features": {
    "betaEnrollment": true,
    "darkModeDefault": false
  }
}
```
""",
    "compute-resource-consolidation": """
---

## 5. Kubernetes Consolidated Pod Resource Schema
Below is a Kubernetes Deployment manifest consolidating containers:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: consolidated-service-pod
spec:
  containers:
  - name: web-app
    image: web-app:latest
    resources:
      limits:
        memory: "512Mi"
        cpu: "500m"
  - name: background-worker
    image: worker:latest
    resources:
      limits:
        memory: "256Mi"
        cpu: "250m"
```
""",
    "backends-for-frontend": """
---

## 5. Mobile BFF payload vs Web BFF Payload
Below is the comparison between Mobile and Web BFF payloads:
```json
// Mobile BFF (Minimal payload)
{
  "id": "123",
  "title": "Song Title",
  "duration": 180
}

// Web BFF (Detailed payload)
{
  "id": "123",
  "title": "Song Title",
  "duration": 180,
  "artist": {
    "name": "Artist Name",
    "bio": "Detailed bio here...",
    "albumsCount": 15
  },
  "relatedTracks": [
    { "id": "124", "title": "Other Song" }
  ]
}
```
""",
    "anti-corruption-layer": """
---

## 5. ACL Adapter Payload Mapping Configuration
Below is the mapper schema translating modern JSON to legacy format:
```javascript
function translateToLegacy(modernUser) {
  return {
    LGCY_USR_ID: modernUser.id,
    USR_NM_VAL: modernUser.username,
    CRT_TS: new Date(modernUser.createdAt).toISOString()
  };
}
```
"""
}

for slug, extra_markdown in ADDITIONAL_MARKDOWNS.items():
    old_str = "## 5. Comparison Matrix" if slug in ["leader-election", "cqrs-design", "pipes-filters-design", "ambassador", "gateway-routing", "gateway-offloading", "external-config-store", "compute-resource-consolidation", "backends-for-frontend", "anti-corruption-layer"] else "## 5. Code Example"
    if old_str in content:
        new_str = f"{extra_markdown}\n\n{old_str}"
        idx = content.find(f'"slug": "{slug}",')
        if idx != -1:
            target_idx = content.find(old_str, idx)
            if target_idx != -1:
                content = content[:target_idx] + new_str + content[target_idx + len(old_str):]

with open("scratch/system_design_batch8_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Batch 8 config blocks added.")
