const fs = require('fs');

const deBlogPath = './src/config/deBlogData.ts';
const deBlogRaw = fs.readFileSync(deBlogPath, 'utf8');

const entryRegex = /'([a-zA-Z0-9\-_]+)'\s*:\s*`([\s\S]*?)`/g;

const shortEntries = [];
let match;

while ((match = entryRegex.exec(deBlogRaw)) !== null) {
  const slug = match[1];
  const md = match[2].trim();

  // If markdown is under 1500 characters, it needs full expansion!
  if (md.length < 1500) {
    shortEntries.push({ slug, len: md.length, excerpt: md.slice(0, 120).replace(/\n/g, ' ') });
  }
}

console.log(`Total short or truncated entries (< 1500 chars) in deBlogData.ts: ${shortEntries.length}\n`);

shortEntries.forEach((item, idx) => {
  console.log(`${idx + 1}. '${item.slug}' (Length: ${item.len} chars) - ${item.excerpt}`);
});
