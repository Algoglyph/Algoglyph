const fs = require('fs');

const imagesDir = './public/images/dsa';
const dsaImageFiles = fs.readdirSync(imagesDir);

const availableImages = new Set();
dsaImageFiles.forEach(f => {
  availableImages.add(f.toLowerCase());
});

function hasImageOnDisk(slug, title) {
  const normSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const imgFile of availableImages) {
    const normFile = imgFile.replace(/-(dark|light)\.(jpg|png)$/i, '').replace(/\.(jpg|png)$/i, '').replace(/[^a-z0-9]/g, '');
    
    if (normFile === normSlug) return true;

    // Check partial containment
    if (normSlug.length > 4 && normFile.length > 4) {
      if (normFile.includes(normSlug) || normSlug.includes(normFile)) return true;
    }
  }

  // Alias dictionary
  const aliases = {
    'bfs': ['bfs-traversal'],
    'dfs': ['dfs-traversal'],
    'linked-list': ['singly-linked-lists'],
    'tree-traversal': ['in-order-traversal', 'pre-order-traversal', 'post-order-traversal'],
    'avl-red-black-tree': ['avl-trees', 'red-black-trees'],
    'scc-bridges': ['bridges-cuts'],
    'string-algorithms': ['boyer-moore-search', 'rabin-karp-search', 'z-algorithm'],
    'dijkstra-algorithm': ['dijkstra'],
    'a-search': ['a-star-algorithm'],
    'disjoint-set': ['disjoint-set-union', 'mst-union-find'],
    'bellman-ford': ['bellman-ford-floyd-warshall'],
    'floyd-warshall': ['floyd-warshall-algorithm']
  };

  if (aliases[slug]) {
    for (const alt of aliases[slug]) {
      for (const ext of ['-dark.jpg', '-dark.png', '-light.jpg', '-light.png', '.jpg', '.png']) {
        if (availableImages.has(`${alt}${ext}`.toLowerCase())) return true;
      }
    }
  }

  return false;
}

// Analyze all 171 DSA/CS blogs
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

const missingList = [];
const foundList = [];

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
      if (!hasImageOnDisk(slug, title)) {
        missingList.push({ slug, title, category });
      } else {
        foundList.push({ slug, title, category });
      }
    }
  }
}

console.log(`\n========================================================`);
console.log(`STRICT IMAGE ACCURACY CHECK ACROSS 171 DSA & CS BLOGS:`);
console.log(`- Blogs WITH images in public/images/dsa: ${foundList.length}`);
console.log(`- Blogs WITHOUT images in public/images/dsa: ${missingList.length}`);
console.log(`========================================================\n`);

console.log(`COMPLETE LIST OF ${missingList.length} DSA & CS BLOGS LACKING IMAGES:\n`);

let catHead = '';
missingList.forEach((b, idx) => {
  if (b.category !== catHead) {
    catHead = b.category;
    console.log(`\n=== ${catHead.toUpperCase()} ===`);
  }
  console.log(`${idx + 1}. ${b.title} (slug: '${b.slug}')`);
});
