const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

const blogMap = new Map();

const blogObjRe = /{\s*["']slug["']:\s*["']([^'"]+)["'][\s\S]*?["']markdown["']:\s*`([\s\S]*?)`/g;
let m;
while ((m = blogObjRe.exec(blogDataRaw)) !== null) blogMap.set(m[1], m[2]);

const jsonStyleRe = /"slug":\s*"([^"]+)"[\s\S]*?"markdown":\s*"([\s\S]*?)"/g;
while ((m = jsonStyleRe.exec(blogDataRaw)) !== null) {
  if (!blogMap.has(m[1])) blogMap.set(m[1], m[2].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
}

const deRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
while ((m = deRe.exec(deBlogDataRaw)) !== null) {
  if (m[2] && m[2].trim().length > 50) blogMap.set(m[1], m[2]);
}

let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

const backendZone = global.ROADMAP_ZONES.find(z => z && z.id === 'backend');

const unwritten = [];
backendZone.topics.forEach(t => {
  const tName = t.name || t.title || t.id;
  t.concepts.forEach(c => {
    const cName = c.name || c.title || c.id;
    c.subtopics.forEach(s => {
      const sName = s.name || s.title || s.id;
      const slug = s.blogSlug;
      const md = blogMap.get(slug);
      if (!md) {
        unwritten.push({ name: sName, slug: slug, topic: tName, concept: cName });
      }
    });
  });
});

console.log(`Total 42 Unwritten Backend Slugs:\n`);
unwritten.forEach((b, i) => {
  console.log(`${i + 1}. **${b.name}** (\`${b.slug}\`) — *${b.topic} › ${b.concept}*`);
});
