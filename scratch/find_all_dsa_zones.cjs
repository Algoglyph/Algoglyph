const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');

let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

console.log(`ALL ZONES IN ROADMAP_ZONES (${global.ROADMAP_ZONES.length} total zones):\n`);

let overallSubtopics = 0;

global.ROADMAP_ZONES.forEach((z, i) => {
  let count = 0;
  z.topics.forEach(t => {
    t.concepts.forEach(c => {
      count += c.subtopics.length;
    });
  });
  overallSubtopics += count;
  console.log(`${i + 1}. Zone ID: '${z.id}' | Name: "${z.name}" | Subtopics (Blogs): ${count}`);
});

console.log(`\nOverall Total Subtopics across ALL zones: ${overallSubtopics}`);
