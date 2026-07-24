const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

const blogSlugs = new Set();
let m;
const slugRe = /["']?slug["']?\s*:\s*['"]([^'"]+)['"]/g;
while ((m = slugRe.exec(blogDataRaw)) !== null) blogSlugs.add(m[1]);

const deDoneSlugs = new Set();
const deSlotRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
while ((m = deSlotRe.exec(deBlogDataRaw)) !== null) {
  if (m[2] && m[2].trim().length > 50) deDoneSlugs.add(m[1]);
}

let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

const backendZone = global.ROADMAP_ZONES.find(z => z && z.id === 'backend');

let idx = 1;
backendZone.topics.forEach(t => {
  const tName = t.name || t.title || t.id;
  t.concepts.forEach(c => {
    const cName = c.name || c.title || c.id;
    c.subtopics.forEach(s => {
      const sName = s.name || s.title || s.id;
      const isDone = blogSlugs.has(s.blogSlug) || deDoneSlugs.has(s.blogSlug);
      if (!isDone) {
        console.log(`${idx++}. **${sName}** (\`${s.blogSlug}\`) — *${tName} › ${cName}*`);
      }
    });
  });
});
