const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

// Extract all slugs and categories from blogData.ts
const blogPosts = [];

// Regular expression to match each object in BLOG_POSTS array
const regex = /"slug":\s*"([^"]+)"[\s\S]*?"category":\s*"([^"]+)"/g;
let m;
while ((m = regex.exec(blogDataRaw)) !== null) {
  blogPosts.push({ slug: m[1], category: m[2] });
}

console.log(`Total posts found in blogData.ts: ${blogPosts.length}\n`);

// Group by category
const catMap = {};
blogPosts.forEach(p => {
  catMap[p.category] = (catMap[p.category] || 0) + 1;
});

console.log("Categories in blogData.ts:");
Object.entries(catMap).forEach(([cat, count]) => {
  console.log(`  - "${cat}": ${count} blogs`);
});

// Check roadmapData.ts zones
const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

console.log("\nROADMAP ZONES:");
global.ROADMAP_ZONES.forEach(z => {
  let count = 0;
  z.topics.forEach(t => t.concepts.forEach(c => count += c.subtopics.length));
  console.log(`  - Zone '${z.id}' ("${z.name}"): ${count} subtopics/blogs`);
});
