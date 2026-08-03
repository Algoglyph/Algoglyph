const fs = require('fs');

const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

const newSlugs = [
  'container-lxc','orch-kubernetes','broker-kafka','broker-rabbitmq','pattern-monolith',
  'pattern-microservices','pattern-soa','pattern-serverless','pattern-service-mesh',
  'pattern-twelve-factor','search-elasticsearch','search-solr','realtime-sse','realtime-websockets',
  'realtime-polling','scale-db-indexes','scale-data-replication','scale-sharding','scale-cap-theorem',
  'nosql-firebase','nosql-rethinkdb','nosql-mongodb','nosql-couchdb','nosql-redis','nosql-dynamodb',
  'nosql-clickhouse','nosql-cassandra','nosql-scylladb','nosql-neo4j','nosql-neptune','nosql-dgraph',
  'nosql-influxdb','nosql-timescaledb','scale-obs-core','scale-obs-instrumentation',
  'scale-obs-monitoring','scale-obs-telemetry','mit-graceful','mit-throttling','mit-backpressure',
  'mit-loadshifting','mit-circuit'
];

let faqPass = 0;
let svgPass = 0;

newSlugs.forEach((slug, idx) => {
  const token = `'${slug}': \``;
  const start = deBlogDataRaw.indexOf(token);
  if (start !== -1) {
    // Find next slug key start or end of object
    const nextSlug = newSlugs[idx + 1];
    let end = nextSlug ? deBlogDataRaw.indexOf(`'${nextSlug}': \``, start) : deBlogDataRaw.lastIndexOf('};');
    if (end === -1) end = deBlogDataRaw.length;

    const md = deBlogDataRaw.substring(start, end);
    const faqCount = (md.match(/### Q\d+:/g) || []).length;
    const hasSvg = md.includes('<svg') && md.includes('</svg>');

    if (faqCount >= 5) {
      faqPass++;
    } else {
      console.log(`Slug ${slug} has only ${faqCount} FAQs!`);
    }

    if (hasSvg) {
      svgPass++;
    } else {
      console.log(`Slug ${slug} is missing <svg> diagram!`);
    }
  } else {
    console.log(`Slug ${slug} NOT FOUND in deBlogData.ts!`);
  }
});

console.log(`\n=================================================`);
console.log(` AUDIT RESULTS FOR ALL 42 NEWLY WRITTEN BACKEND BLOGS`);
console.log(`=================================================`);
console.log(`✅ Articles with 5+ FAQs:   ${faqPass} / 42`);
console.log(`✅ Articles with SVG:       ${svgPass} / 42`);
