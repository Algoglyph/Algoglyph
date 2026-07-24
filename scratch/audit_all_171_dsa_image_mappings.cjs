const fs = require('fs');

const dsaDir = './public/images/dsa';
const dsaFiles = fs.readdirSync(dsaDir);

const availableFiles = new Set(dsaFiles.map(f => f.toLowerCase()));

// Collect all 171 DSA/CS blogs from blogData.ts
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

// Slug alias dictionary to map blog slug -> actual image filename in public/images/dsa
const slugToImageMap = {
  'stack': 'lifo-stacks',
  'queue': 'fifo-queues',
  'deque': 'double-ended-deques',
  'linked-list': 'singly-linked-lists',
  'doubly-linked-list': 'doubly-linked-lists',
  'circular-linked-list': 'circular-linked-lists',
  'skip-list': 'skip-lists-complex',
  'dijkstra-algorithm': 'dijkstra',
  'a-search': 'a-star-algorithm',
  'disjoint-set': 'disjoint-set-union',
  'bellman-ford': 'bellman-ford-floyd-warshall',
  'floyd-warshall': 'floyd-warshall-algorithm',
  'k-d-trees': 'kd-tree',
  'tries': 'trie',
  'segment-trees': 'segment-tree',
  'fenwick-trees': 'fenwick-tree',
  'sparse-tables': 'sparse-table',
  'suffix-trees': 'suffix-tree',
  'quadtrees': 'quadtree',
  'splay-trees': 'splay-tree',
  'treaps': 'treap',
  'min-heap': 'min-heaps',
  'max-heap': 'max-heaps',
  'binary-search-tree': 'binary-search-trees',
  'avl-tree': 'avl-trees',
  'b-tree': 'b-trees',
  'arrays': 'static-arrays',
  'heap': 'min-heaps'
};

function resolveImageFile(slug) {
  const normSlug = slug.toLowerCase();
  
  // 1. Direct check
  for (const ext of ['-dark.jpg', '-dark.png', '-light.jpg', '-light.png', '.jpg', '.png']) {
    if (availableFiles.has(`${normSlug}${ext}`)) return `${normSlug}${ext}`;
  }

  // 2. Check alias map
  if (slugToImageMap[normSlug]) {
    const alias = slugToImageMap[normSlug];
    for (const ext of ['-dark.jpg', '-dark.png', '-light.jpg', '-light.png', '.jpg', '.png']) {
      if (availableFiles.has(`${alias}${ext}`)) return `${alias}${ext}`;
    }
  }

  // 3. Normalized string match
  const cleanSlug = normSlug.replace(/[^a-z0-9]/g, '');
  for (const file of availableFiles) {
    const cleanFile = file.replace(/-(dark|light)\.(jpg|png)$/i, '').replace(/\.(jpg|png)$/i, '').replace(/[^a-z0-9]/g, '');
    if (cleanFile === cleanSlug) return file;
  }

  return null;
}

const missingImages = [];
const workingImages = [];

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
      const resolvedFile = resolveImageFile(slug);
      if (resolvedFile) {
        workingImages.push({ slug, title, category, file: resolvedFile });
      } else {
        missingImages.push({ slug, title, category });
      }
    }
  }
}

console.log(`\n========================================================`);
console.log(`FULL AUDIT OF ALL 171 DSA & CS BLOG IMAGES:`);
console.log(`- Blogs WITH working images: ${workingImages.length}`);
console.log(`- Blogs TRULY MISSING images: ${missingImages.length}`);
console.log(`========================================================\n`);

if (missingImages.length > 0) {
  console.log(`LIST OF ${missingImages.length} BLOGS THAT NEED IMAGES:\n`);
  let curCat = '';
  missingImages.forEach((b, idx) => {
    if (b.category !== curCat) {
      curCat = b.category;
      console.log(`\n--- ${curCat.toUpperCase()} ---`);
    }
    console.log(`${idx + 1}. ${b.title} (slug: '${b.slug}' -> expected image: '${b.slug}-dark.png')`);
  });
}
