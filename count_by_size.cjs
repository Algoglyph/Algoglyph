const fs = require('fs');
const path = require('path');

const data = fs.readFileSync('./src/config/blogData.ts', 'utf8');

const slugs = [];
const re = /["']?slug["']?\s*:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = re.exec(data)) !== null) {
  if (m[1].startsWith('game-')) slugs.push(m[1]);
}

const brainDir = 'C:/Users/varun/.gemini/antigravity-ide/brain/00d9c18f-de5c-4ab4-8cd2-16519de6ce1d';

const brackets = {
  under4k: [],
  under5k: [],
  under6k: [],
  over6k: []
};

for (const slug of slugs) {
  const mdPath = path.join(brainDir, slug + '.md');
  if (fs.existsSync(mdPath)) {
    const stat = fs.statSync(mdPath);
    const size = stat.size;
    if (size < 4096) {
      brackets.under4k.push({ slug, size });
    } else if (size < 5120) {
      brackets.under5k.push({ slug, size });
    } else if (size < 6144) {
      brackets.under6k.push({ slug, size });
    } else {
      brackets.over6k.push({ slug, size });
    }
  }
}

console.log('=== UNDER 4 KB (Shortest/Simplest) ===');
brackets.under4k.forEach(s => console.log(`  [${s.size}B] ${s.slug}`));
console.log('Total:', brackets.under4k.length);

console.log('\n=== 4 KB to 5 KB (Medium-Short) ===');
brackets.under5k.forEach(s => console.log(`  [${s.size}B] ${s.slug}`));
console.log('Total:', brackets.under5k.length);

console.log('\n=== 5 KB to 6 KB (Standard-Medium) ===');
brackets.under6k.forEach(s => console.log(`  [${s.size}B] ${s.slug}`));
console.log('Total:', brackets.under6k.length);

console.log('\n=== OVER 6 KB (Deep/Comprehensive) ===');
console.log('Total:', brackets.over6k.length);
