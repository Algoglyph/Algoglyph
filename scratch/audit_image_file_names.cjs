const fs = require('fs');

const dsaFiles = fs.readdirSync('./public/images/dsa');
console.log(`Total image files in public/images/dsa: ${dsaFiles.length}`);

const imageBases = new Set();
dsaFiles.forEach(f => {
  const base = f.replace(/-(dark|light)\.(jpg|png)$/i, '').replace(/\.(jpg|png)$/i, '');
  imageBases.add(base);
});

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

const missing = [];
const mapped = [];

for (let i = 1; i < postBlocks.length; i++) {
  const block = postBlocks[i];
  const slugMatch = block.match(/^\s*"([^"]+)"/);
  const catMatch = block.match(/"category":\s*"([^"]+)"/);
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);

  if (slugMatch && catMatch) {
    const slug = slugMatch[1];
    const category = catMatch[1];
    const title = titleMatch ? titleMatch[1] : slug;

    if (dsaCsCategories.has(category)) {
      // Direct match or singular/plural/hyphen match
      let foundFile = null;

      for (const base of imageBases) {
        if (base === slug ||
            base === slug + 's' ||
            base + 's' === slug ||
            base.replace(/-/g, '') === slug.replace(/-/g, '') ||
            (slug === 'linked-list' && base === 'singly-linked-lists') ||
            (slug === 'stack' && base === 'lifo-stacks') ||
            (slug === 'queue' && base === 'fifo-queues') ||
            (slug === 'deque' && base === 'double-ended-deques') ||
            (slug === 'dijkstra-algorithm' && base === 'dijkstra') ||
            (slug === 'a-search' && base === 'a-star-algorithm') ||
            (slug === 'disjoint-set' && (base === 'disjoint-set-union' || base === 'mst-union-find')) ||
            (slug === 'bellman-ford' && base === 'bellman-ford-floyd-warshall') ||
            (slug === 'floyd-warshall' && (base === 'floyd-warshall-algorithm' || base === 'bellman-ford-floyd-warshall')) ||
            (slug === 'k-d-trees' && base === 'kd-tree')
        ) {
          foundFile = base;
          break;
        }
      }

      if (foundFile) {
        mapped.push({ slug, title, category, foundFile });
      } else {
        missing.push({ slug, title, category });
      }
    }
  }
}

console.log(`\nMapped (has image on disk): ${mapped.length}`);
console.log(`Missing (no image on disk): ${missing.length}`);

console.log(`\n========================================================`);
console.log(`LIST OF ${missing.length} DSA & THEORETICAL CS BLOGS WITHOUT IMAGES:`);
console.log(`========================================================\n`);

let curCat = '';
missing.forEach((m, idx) => {
  if (m.category !== curCat) {
    curCat = m.category;
    console.log(`\n### ${curCat.toUpperCase()}`);
  }
  console.log(`${idx + 1}. ${m.title} (slug: '${m.slug}')`);
});
