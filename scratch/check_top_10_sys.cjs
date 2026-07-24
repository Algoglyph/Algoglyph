const fs = require('fs');
const path = require('path');

const blogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/blogData.ts'), 'utf8');
const deBlogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/deBlogData.ts'), 'utf8');

const targetSlugs = [
  "what-is-system-design",
  "how-to-approach-system-design",
  "performance-vs-scalability",
  "latency-vs-throughput",
  "availability-vs-consistency",
  "cap-theorem-consistency",
  "weak-consistency",
  "eventual-consistency",
  "strong-consistency",
  "failover-replication-dns-updates"
];

targetSlugs.forEach(slug => {
  let md = "";
  let source = "NOT_FOUND";

  // Check blogData.ts
  const idx = blogDataContent.indexOf(`"slug": "${slug}"`);
  if (idx !== -1) {
    const mdIdx = blogDataContent.indexOf('"markdown":', idx);
    if (mdIdx !== -1) {
      const firstTick = blogDataContent.indexOf('`', mdIdx);
      if (firstTick !== -1) {
        let pos = firstTick + 1;
        while (pos < blogDataContent.length) {
          if (blogDataContent[pos] === '`' && blogDataContent[pos-1] !== '\\') {
            md = blogDataContent.substring(firstTick + 1, pos);
            source = "blogData.ts";
            break;
          }
          pos++;
        }
      }
    }
  }

  // Check deBlogData.ts
  if (!md) {
    const deKey = `'${slug}':`;
    const deIdx = deBlogDataContent.indexOf(deKey);
    if (deIdx !== -1) {
      const firstTick = deBlogDataContent.indexOf('`', deIdx);
      if (firstTick !== -1) {
        let pos = firstTick + 1;
        while (pos < deBlogDataContent.length) {
          if (deBlogDataContent[pos] === '`' && deBlogDataContent[pos-1] !== '\\') {
            md = deBlogDataContent.substring(firstTick + 1, pos);
            source = "deBlogData.ts";
            break;
          }
          pos++;
        }
      }
    }
  }

  const isGeneric = md.length < 3000 || md.includes("This is a placeholder blueprint") || md.includes("Generic Blueprint");
  console.log(`[${slug}] -> ${md.length} chars (${source}) | Status: ${!isGeneric ? "✅ FIXED (Custom Deep Content)" : "❌ GENERIC BLUEPRINT / SHORT"}`);
});
