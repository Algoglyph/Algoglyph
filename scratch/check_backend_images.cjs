const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

const blogMap = new Map();

const blogObjRe = /{\s*["']slug["']:\s*["']([^'"]+)["'][\s\S]*?["']markdown["']:\s*`([\s\S]*?)`/g;
let m;
while ((m = blogObjRe.exec(blogDataRaw)) !== null) {
  blogMap.set(m[1], m[2]);
}

const jsonStyleRe = /"slug":\s*"([^"]+)"[\s\S]*?"markdown":\s*"([\s\S]*?)"/g;
while ((m = jsonStyleRe.exec(blogDataRaw)) !== null) {
  if (!blogMap.has(m[1])) {
    blogMap.set(m[1], m[2].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
  }
}

const deRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
while ((m = deRe.exec(deBlogDataRaw)) !== null) {
  if (m[2] && m[2].trim().length > 50) {
    blogMap.set(m[1], m[2]);
  }
}

let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

const backendZone = global.ROADMAP_ZONES.find(z => z && z.id === 'backend');
const systemDesignZone = global.ROADMAP_ZONES.find(z => z && z.id === 'system-design');

function getMissingList(zone) {
  const missing = [];
  zone.topics.forEach(t => {
    const tName = t.name || t.title || t.id;
    t.concepts.forEach(c => {
      const cName = c.name || c.title || c.id;
      c.subtopics.forEach(s => {
        const sName = s.name || s.title || s.id;
        const slug = s.blogSlug;
        const md = blogMap.get(slug);

        if (md) {
          const hasSvg = /<svg[\s\S]*?<\/svg>/i.test(md) || /```svg[\s\S]*?```/i.test(md);
          const hasImg = /!\[.*?\]\(.*?\)/i.test(md) || /<img[\s\S]*?>/i.test(md);
          if (!hasSvg && !hasImg) {
            missing.push({ name: sName, slug, topic: tName, concept: cName });
          }
        }
      });
    });
  });
  return missing;
}

const missingSd = getMissingList(systemDesignZone);
const missingBe = getMissingList(backendZone);

console.log(`Backend Development Zone Missing Images: ${missingBe.length}`);
console.log(`System Design Systems Zone Missing Images: ${missingSd.length}\n`);

console.log(`=== SYSTEM DESIGN BLOGS MISSING IMAGES/SVGS (${missingSd.length}) ===`);
missingSd.forEach((b, idx) => {
  console.log(`${idx + 1}. **${b.name}** (\`${b.slug}\`) — *${b.topic} › ${b.concept}*`);
});
