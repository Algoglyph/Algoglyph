const fs = require('fs');

const dsaDir = './public/images/dsa';
const dsaFiles = fs.readdirSync(dsaDir);

console.log(`Total image files in public/images/dsa: ${dsaFiles.length}`);

// Map base filenames in public/images/dsa
const availableImageBases = new Map();
dsaFiles.forEach(f => {
  const ext = f.endsWith('.png') ? 'png' : f.endsWith('.jpg') ? 'jpg' : null;
  if (!ext) return;
  const isDark = f.includes('-dark');
  const isLight = f.includes('-light');
  const base = f.replace(/-(dark|light)\.(jpg|png)$/i, '').replace(/\.(jpg|png)$/i, '').toLowerCase();

  if (!availableImageBases.has(base)) {
    availableImageBases.set(base, { png: false, jpg: false, darkPng: false, darkJpg: false, raw: f });
  }
  const entry = availableImageBases.get(base);
  if (f.endsWith('.png')) entry.png = true;
  if (f.endsWith('.jpg')) entry.jpg = true;
  if (f.includes('-dark.png')) entry.darkPng = true;
  if (f.includes('-dark.jpg')) entry.darkJpg = true;
});

console.log(`Unique image base names found: ${availableImageBases.size}`);

// Read blogData.ts
const blogPath = './src/config/blogData.ts';
let blogDataRaw = fs.readFileSync(blogPath, 'utf8');

const postBlocks = blogDataRaw.split(/{\s*"slug":/g);
console.log(`Total post blocks in blogData.ts: ${postBlocks.length - 1}`);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

let updatedCount = 0;

for (let i = 1; i < postBlocks.length; i++) {
  const block = postBlocks[i];
  const slugMatch = block.match(/^\s*"([^"]+)"/);
  const catMatch = block.match(/"category":\s*"([^"]+)"/);
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);
  const mdMatch = block.match(/"markdown":\s*"([\s\S]*?)"\s*,\s*"\w+":/);

  if (slugMatch && catMatch) {
    const slug = slugMatch[1];
    const category = catMatch[1];
    const title = titleMatch ? titleMatch[1] : slug;

    if (dsaCsCategories.has(category)) {
      // Find matching image on disk
      let imageBase = null;
      if (availableImageBases.has(slug.toLowerCase())) {
        imageBase = slug.toLowerCase();
      } else {
        // Try aliases
        for (const [baseKey] of availableImageBases.entries()) {
          if (baseKey === slug.toLowerCase() ||
              baseKey === slug.toLowerCase() + 's' ||
              baseKey + 's' === slug.toLowerCase() ||
              baseKey.replace(/-/g, '') === slug.toLowerCase().replace(/-/g, '') ||
              (slug === 'linked-list' && baseKey === 'singly-linked-lists') ||
              (slug === 'stack' && baseKey === 'lifo-stacks') ||
              (slug === 'queue' && baseKey === 'fifo-queues') ||
              (slug === 'deque' && baseKey === 'double-ended-deques') ||
              (slug === 'dijkstra-algorithm' && baseKey === 'dijkstra') ||
              (slug === 'a-search' && baseKey === 'a-star-algorithm') ||
              (slug === 'disjoint-set' && (baseKey === 'disjoint-set-union' || baseKey === 'mst-union-find')) ||
              (slug === 'bellman-ford' && baseKey === 'bellman-ford-floyd-warshall') ||
              (slug === 'floyd-warshall' && (baseKey === 'floyd-warshall-algorithm' || baseKey === 'bellman-ford-floyd-warshall')) ||
              (slug === 'k-d-trees' && baseKey === 'kd-tree')
          ) {
            imageBase = baseKey;
            break;
          }
        }
      }

      if (imageBase) {
        // Check if markdown already contains image tag
        if (!block.includes(`/images/dsa/${imageBase}`) && !block.includes(`/images/dsa/${slug}`)) {
          // Check extension (.png or .jpg)
          const info = availableImageBases.get(imageBase);
          const ext = (info.darkPng || info.png) ? 'png' : 'jpg';
          const imgTag = `![${title.replace(/"/g, '')}](/images/dsa/${imageBase}-dark.${ext}#dark)\\n\\n`;

          // Inject image tag right after # Title
          const titleHeaderRegex = /(#\s+[^\n]+?\\n\\n)/;
          if (titleHeaderRegex.test(block)) {
            postBlocks[i] = block.replace(titleHeaderRegex, `$1${imgTag}`);
            updatedCount++;
          }
        }
      }
    }
  }
}

console.log(`Updated image tags in ${updatedCount} blog posts!`);

if (updatedCount > 0) {
  const newBlogData = postBlocks.join('{\n  "slug":');
  fs.writeFileSync(blogPath, newBlogData, 'utf8');
  console.log("Successfully wrote updated blogData.ts!");
}
