const fs = require('fs');

let content = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

const extraFaqs = {
  'orch-kubernetes': `

### Q5: How do Taints and Tolerations differ from Node Affinity?
Node Affinity attracts Pods to specific nodes based on node labels. Taints allow a node to repel Pods unless the Pod explicitly defines a matching Toleration (e.g. reserving GPU nodes exclusively for machine learning workloads).`,

  'realtime-sse': `

### Q4: How does automatic reconnection work in SSE?
If the connection drops, the browser EventSource API automatically attempts reconnection after a timeout interval, sending the Last-Event-ID header so the server can resume missed events from the exact point of failure.

### Q5: What browser connection limit affects SSE under HTTP/1.1?
Under HTTP/1.1, web browsers enforce a maximum limit of 6 open SSE connections per domain. Upgrading the web server to HTTP/2 eliminates this bottleneck via multiplexing multiple streams over a single TCP connection.`,

  'scale-db-indexes': `

### Q4: When should you use a GIN (Generalized Inverted Index) in PostgreSQL?
Use GIN indexes for composite data types like JSONB document keys, full-text search vectors, or array columns where a single row contains multiple elements.

### Q5: What is a Covering Index?
A Covering Index is an index that includes all columns requested by a SQL query in the index itself, allowing the database engine to perform an Index-Only Scan without reading the underlying table data pages.`,

  'nosql-mongodb': `

### Q2: How does MongoDB Replica Set leader election work?
MongoDB replica sets use a Raft-like consensus algorithm. If the primary node fails or loses network connectivity, secondary nodes automatically elect a new primary within seconds.

### Q3: What is the default WiredTiger Cache size limit?
By default, WiredTiger allocates 50% of available system RAM minus 1 GB (or 256 MB, whichever is greater) for its in-memory page cache.

### Q4: What is the maximum size limit of a single MongoDB document?
The maximum BSON document size limit is 16 Megabytes. For storing larger files like images or videos, MongoDB provides GridFS to partition files into chunks.

### Q5: How do Aggregation Pipelines work in MongoDB?
Aggregation pipelines process document streams sequentially through pipeline stages ($match, $group, $project, $sort, $unwind), enabling complex analytics directly inside the database engine.`,

  'nosql-redis': `

### Q5: What is the difference between Redis Sentinel and Redis Cluster?
Redis Sentinel provides high-availability monitoring, automatic failover, and master-replica promotion. Redis Cluster provides distributed horizontal data sharding across up to 1000 nodes without a central proxy.`
};

Object.entries(extraFaqs).forEach(([slug, extra]) => {
  const token = `'${slug}': \``;
  const pos = content.indexOf(token);
  if (pos !== -1) {
    const endPos = content.indexOf('`,', pos);
    if (endPos !== -1) {
      content = content.slice(0, endPos) + extra + content.slice(endPos);
      console.log(`Appended extra FAQs to ${slug}`);
    }
  }
});

fs.writeFileSync('./src/config/deBlogData.ts', content, 'utf8');
console.log('Finished updating FAQs.');
