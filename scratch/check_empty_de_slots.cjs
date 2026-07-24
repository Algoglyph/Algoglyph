const fs = require('fs');

const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

const emptySlots = [];
const emptyRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
let m;
while ((m = emptyRe.exec(deBlogDataRaw)) !== null) {
  const slug = m[1];
  const content = m[2].trim();
  if (content.length < 50 || content.includes('# Coming Soon') || content.includes('Placeholder')) {
    emptySlots.push(slug);
  }
}

console.log(`Found ${emptySlots.length} empty/placeholder slots in deBlogData.ts:\n`);
emptySlots.forEach((slug, i) => {
  console.log(`${i + 1}. ${slug}`);
});
