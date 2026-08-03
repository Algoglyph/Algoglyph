const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');

let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

const backendZone = global.ROADMAP_ZONES.find(z => z && z.id === 'backend');

const newSlugs = new Set([
  'container-lxc','orch-kubernetes','broker-kafka','broker-rabbitmq','pattern-monolith',
  'pattern-microservices','pattern-soa','pattern-serverless','pattern-service-mesh',
  'pattern-twelve-factor','search-elasticsearch','search-solr','realtime-sse','realtime-websockets',
  'realtime-polling','scale-db-indexes','scale-data-replication','scale-sharding','scale-cap-theorem',
  'nosql-firebase','nosql-rethinkdb','nosql-mongodb','nosql-couchdb','nosql-redis','nosql-dynamodb',
  'nosql-clickhouse','nosql-cassandra','nosql-scylladb','nosql-neo4j','nosql-neptune','nosql-dgraph',
  'nosql-influxdb','nosql-timescaledb','scale-obs-core','scale-obs-instrumentation',
  'scale-obs-monitoring','scale-obs-telemetry','mit-graceful','mit-throttling','mit-backpressure',
  'mit-loadshifting','mit-circuit'
]);

let idx = 1;
backendZone.topics.forEach(t => {
  const tName = t.name || t.title || t.id;
  t.concepts.forEach(c => {
    const cName = c.name || c.title || c.id;
    c.subtopics.forEach(s => {
      const sName = s.name || s.title || s.id;
      const slug = s.blogSlug;
      if (newSlugs.has(slug)) {
        console.log(`${idx++}. **${sName}** | Slug: \`${slug}\` | Target File: \`${slug}-dark.jpg\` | *${tName} › ${cName}*`);
      }
    });
  });
});
