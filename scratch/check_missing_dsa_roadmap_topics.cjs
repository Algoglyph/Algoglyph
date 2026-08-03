const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');

let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

const dsaZone = global.ROADMAP_ZONES.find(z => z && z.id === 'dsa-foundations');

const roadmapSlugsInDsa = new Set();
dsaZone.topics.forEach(t => {
  t.concepts.forEach(c => {
    c.subtopics.forEach(s => {
      roadmapSlugsInDsa.add(s.blogSlug);
    });
  });
});

console.log(`Subtopics (blogs) currently in dsa-foundations zone in roadmapData.ts: ${roadmapSlugsInDsa.size}`);

// Get all 171 slugs from blogData.ts
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

const missingFromRoadmap = [];

for (let i = 1; i < postBlocks.length; i++) {
  const block = postBlocks[i];
  const slugMatch = block.match(/^\s*"([^"]+)"/);
  const catMatch = block.match(/"category":\s*"([^"]+)"/);
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);

  if (slugMatch && catMatch) {
    const slug = slugMatch[1];
    const cat = catMatch[1];
    const title = titleMatch ? titleMatch[1] : slug;

    if (dsaCsCategories.has(cat)) {
      if (!roadmapSlugsInDsa.has(slug)) {
        missingFromRoadmap.push({ slug, category: cat, title });
      }
    }
  }
}

console.log(`\nBlogs missing from dsa-foundations in roadmapData.ts (${missingFromRoadmap.length} missing):\n`);
missingFromRoadmap.forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.category}] ${m.title} (slug: '${m.slug}')`);
});
