const fs = require('fs');
const path = require('path');

// Read blogData.ts
const data = fs.readFileSync('./src/data/blogData.ts', 'utf8');

// Extract all game- slugs
const slugs = [];
const re = /slug:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = re.exec(data)) !== null) {
  if (m[1].startsWith('game-')) slugs.push(m[1]);
}

// Read the brain directory for md files
const brainDir = 'C:/Users/varun/.gemini/antigravity-ide/brain/00d9c18f-de5c-4ab4-8cd2-16519de6ce1d';
const mdFiles = fs.readdirSync(brainDir)
  .filter(f => f.endsWith('.md') && f.startsWith('game-'))
  .map(f => f.replace('.md', ''));

// Check which slugs have been expanded
const expanded = new Set(mdFiles);

// Get content length for each slug to judge quality
const missing = [];
const done = [];
const underdone = [];

for (const slug of slugs) {
  if (!expanded.has(slug)) {
    missing.push(slug);
  } else {
    // Check content length
    const mdPath = path.join(brainDir, slug + '.md');
    const stat = fs.statSync(mdPath);
    if (stat.size < 3000) {
      underdone.push({ slug, size: stat.size });
    } else {
      done.push({ slug, size: stat.size });
    }
  }
}

console.log('\n=== MISSING (no .md file) ===');
missing.forEach(s => console.log('  [MISSING] ' + s));
console.log('\n=== UNDERDONE (< 3KB) ===');
underdone.forEach(s => console.log('  [THIN ' + s.size + 'B] ' + s.slug));
console.log('\n=== DONE (>= 3KB) ===');
done.forEach(s => console.log('  [OK ' + Math.round(s.size/1024) + 'KB] ' + s.slug));

console.log('\n--- SUMMARY ---');
console.log('Total game slugs:', slugs.length);
console.log('Missing:', missing.length);
console.log('Underdone:', underdone.length);
console.log('Done:', done.length);
