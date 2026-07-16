const fs = require('fs');
const path = require('path');

const roadmapDataPath = path.join(__dirname, '../src/config/roadmapData.ts');
const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');

const roadmapContent = fs.readFileSync(roadmapDataPath, 'utf8');
const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');

// Parse blogData.ts to get all slugs and their categories
const slugMatches = [...blogDataContent.matchAll(/"slug":\s*"([^"]+)"/g)];
const categoryMatches = [...blogDataContent.matchAll(/"category":\s*"([^"]+)"/g)];
const blogPosts = slugMatches.map((m, i) => ({
  slug: m[1],
  category: categoryMatches[i] ? categoryMatches[i][1] : 'Unknown'
}));

const blogPostMap = new Map();
for (const post of blogPosts) {
  blogPostMap.set(post.slug, post.category);
}

// Parse roadmapData.ts to get all blogSlugs
const blogSlugRegex = /blogSlug:\s*'([^']*)'/g;
let match;
const roadmapSlugs = new Set();
while ((match = blogSlugRegex.exec(roadmapContent)) !== null) {
  if (match[1]) {
    roadmapSlugs.add(match[1]);
  }
}

console.log('Total unique blogSlugs found in roadmapData.ts:', roadmapSlugs.size);

// Check mapping
const mapped = [];
const unmapped = [];
for (const slug of roadmapSlugs) {
  if (blogPostMap.has(slug)) {
    mapped.push({ slug, category: blogPostMap.get(slug) });
  } else {
    unmapped.push(slug);
  }
}

console.log(`Mapped: ${mapped.length}`);
console.log(`Unmapped: ${unmapped.length}`);

// Group mapped by category
const grouped = {};
for (const item of mapped) {
  if (!grouped[item.category]) grouped[item.category] = [];
  grouped[item.category].push(item.slug);
}

console.log('\n=== Mapped by Category ===');
for (const [cat, list] of Object.entries(grouped)) {
  console.log(`Category: ${cat} -> ${list.length} mapped slugs`);
}

console.log('\n=== Unmapped Slugs (first 20) ===');
unmapped.slice(0, 20).forEach((s, i) => console.log(`${i+1}. ${s}`));

// Write unmapped to file
fs.writeFileSync(path.join(__dirname, 'unmapped_roadmap_slugs.json'), JSON.stringify(unmapped, null, 2));
