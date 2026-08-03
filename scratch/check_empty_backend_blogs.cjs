const fs = require('fs');

const deBlogPath = './src/config/deBlogData.ts';
const deBlogRaw = fs.readFileSync(deBlogPath, 'utf8');

// Match entries in deBlogData dictionary: 'slug': `markdown`
const entryRegex = /'([a-zA-Z0-9\-_]+)'\s*:\s*`([\s\S]*?)`/g;

const shortEntries = [];
let totalEntries = 0;

let match;
while ((match = entryRegex.exec(deBlogRaw)) !== null) {
  totalEntries++;
  const slug = match[1];
  const markdown = match[2].trim();

  // If markdown is under 500 characters or contains placeholder text
  if (markdown.length < 500 || markdown.includes('Deep dive into') || markdown.includes('Comprehensive technical analysis')) {
    shortEntries.push({ slug, len: markdown.length, excerpt: markdown.slice(0, 100).replace(/\n/g, ' ') });
  }
}

console.log(`Total entries in deBlogData.ts: ${totalEntries}`);
console.log(`Short/placeholder entries (${shortEntries.length}):\n`);

shortEntries.forEach((item, idx) => {
  console.log(`${idx + 1}. '${item.slug}' (Length: ${item.len} chars) - ${item.excerpt}`);
});
