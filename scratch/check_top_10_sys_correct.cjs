const fs = require('fs');
const path = require('path');

const blogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/blogData.ts'), 'utf8');
const deBlogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/deBlogData.ts'), 'utf8');

// Parse blogData objects reliably
function getBlogDataMarkdown(slug) {
  const slugStr = `"slug": "${slug}"`;
  const idx = blogDataContent.indexOf(slugStr);
  if (idx === -1) return null;

  const mdTag = '"markdown":';
  const mdIdx = blogDataContent.indexOf(mdTag, idx);
  if (mdIdx === -1 || mdIdx - idx > 1500) return null;

  const startQuoteChar = blogDataContent[mdIdx + mdTag.length];
  // find first quote or backtick
  let quotePos = mdIdx + mdTag.length;
  while (quotePos < blogDataContent.length && blogDataContent[quotePos] !== '"' && blogDataContent[quotePos] !== '`') {
    quotePos++;
  }

  const quoteType = blogDataContent[quotePos];
  let endPos = quotePos + 1;
  while (endPos < blogDataContent.length) {
    if (blogDataContent[endPos] === quoteType && blogDataContent[endPos - 1] !== '\\') {
      break;
    }
    endPos++;
  }

  return blogDataContent.substring(quotePos + 1, endPos);
}

function getDeBlogDataMarkdown(slug) {
  const deKey = `'${slug}':`;
  const deIdx = deBlogDataContent.indexOf(deKey);
  if (deIdx === -1) return null;

  const firstTick = deBlogDataContent.indexOf('`', deIdx);
  if (firstTick === -1) return null;

  let pos = firstTick + 1;
  while (pos < deBlogDataContent.length) {
    if (deBlogDataContent[pos] === '`' && deBlogDataContent[pos - 1] !== '\\') {
      return deBlogDataContent.substring(firstTick + 1, pos);
    }
    pos++;
  }
  return null;
}

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

console.log("TESTING REFINED PARSER:");
targetSlugs.forEach(slug => {
  let md = getBlogDataMarkdown(slug) || getDeBlogDataMarkdown(slug) || '';
  let charLen = md.length;
  const isGeneric = charLen < 3000 || md.includes("This is a placeholder blueprint") || md.includes("Generic Blueprint");
  console.log(`[${slug}] -> ${charLen} chars | Status: ${!isGeneric ? "✅ FIXED (Custom Deep Content)" : "❌ GENERIC BLUEPRINT / SHORT"}`);
});
