const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

const dsaSlugs = new Map();

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
      if (!dsaSlugs.has(slug)) {
        dsaSlugs.set(slug, { slug, category: cat, title });
      }
    }
  }
}

console.log(`Target 171 Unique DSA & CS Slugs: ${dsaSlugs.size}`);

// Read current roadmapData.ts
const roadmapPath = './src/config/roadmapData.ts';
const roadmapRaw = fs.readFileSync(roadmapPath, 'utf8');

let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

const dsaZone = global.ROADMAP_ZONES.find(z => z && z.id === 'dsa-foundations');

const seenSlugs = new Set();
const dedupedTopics = [];

dsaZone.topics.forEach(topic => {
  const newConcepts = [];
  topic.concepts.forEach(concept => {
    const newSubtopics = [];
    concept.subtopics.forEach(sub => {
      if (dsaSlugs.has(sub.blogSlug) && !seenSlugs.has(sub.blogSlug)) {
        seenSlugs.add(sub.blogSlug);
        newSubtopics.push(sub);
      }
    });
    if (newSubtopics.length > 0) {
      newConcepts.push({ ...concept, subtopics: newSubtopics });
    }
  });
  if (newConcepts.length > 0) {
    dedupedTopics.push({ ...topic, concepts: newConcepts });
  }
});

// Check if any of the 171 slugs are missing
dsaSlugs.forEach((val, slug) => {
  if (!seenSlugs.has(slug)) {
    console.log(`Missing slug from deduped list: ${slug}`);
  }
});

let totalSub = 0;
let totalCon = 0;
dedupedTopics.forEach(t => {
  totalCon += t.concepts.length;
  t.concepts.forEach(c => totalSub += c.subtopics.length);
});

console.log(`\nDEDUPED RESULTS:`);
console.log(`- Topics: ${dedupedTopics.length}`);
console.log(`- Concepts: ${totalCon}`);
console.log(`- Subtopics: ${totalSub}`);
console.log(`- Unique Slugs Covered: ${seenSlugs.size} / 171`);

// Update roadmapData.ts with dedupedTopics
const topicsFormatted = JSON.stringify(dedupedTopics, null, 8);

const dsaStart = roadmapRaw.indexOf("id: 'dsa-foundations'");
const topicsStart = roadmapRaw.indexOf("topics: [", dsaStart);
const nextZoneStart = roadmapRaw.indexOf("id: 'game-developer'", dsaStart);
const topicsEnd = roadmapRaw.lastIndexOf("]", nextZoneStart);

const updatedRoadmap = roadmapRaw.slice(0, topicsStart) + "topics: " + topicsFormatted + roadmapRaw.slice(topicsEnd + 1);

fs.writeFileSync(roadmapPath, updatedRoadmap, 'utf8');
console.log("Successfully written deduped 171 topics into roadmapData.ts!");
