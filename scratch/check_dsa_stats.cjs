const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');
const mlBlogDataRaw = fs.readFileSync('./src/config/mlBlogData.ts', 'utf8');

const completedSlugs = new Set();

const blogObjRe = /{\s*["']slug["']:\s*["']([^'"]+)["'][\s\S]*?["']markdown["']:\s*`([\s\S]*?)`/g;
let m;
while ((m = blogObjRe.exec(blogDataRaw)) !== null) completedSlugs.add(m[1]);

const jsonStyleRe = /"slug":\s*"([^"]+)"[\s\S]*?"markdown":\s*"([\s\S]*?)"/g;
while ((m = jsonStyleRe.exec(blogDataRaw)) !== null) completedSlugs.add(m[1]);

const deRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
while ((m = deRe.exec(deBlogDataRaw)) !== null) {
  if (m[2] && m[2].trim().length > 50) completedSlugs.add(m[1]);
}

const mlRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
while ((m = mlRe.exec(mlBlogDataRaw)) !== null) {
  if (m[2] && m[2].trim().length > 50) completedSlugs.add(m[1]);
}

let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

eval(cleanTs + '\n global.ROADMAP_ZONES = ROADMAP_ZONES;');

const dsaZone = global.ROADMAP_ZONES.find(z => z && z.id === 'dsa-foundations');

let totalDsa = 0;
let doneDsa = 0;
let leftDsa = 0;

console.log(`================================================================`);
console.log(`  DATA STRUCTURES & ALGORITHMS (DSA) ZONE STATISTICS (dsa-foundations)`);
console.log(`================================================================\n`);

dsaZone.topics.forEach((t, tIdx) => {
  const tName = t.name || t.title || t.id;
  let topicTotal = 0;
  let topicDone = 0;
  let topicLeft = 0;

  t.concepts.forEach(c => {
    c.subtopics.forEach(s => {
      topicTotal++;
      totalDsa++;
      const isDone = completedSlugs.has(s.blogSlug);
      if (isDone) {
        topicDone++;
        doneDsa++;
      } else {
        topicLeft++;
        leftDsa++;
      }
    });
  });

  console.log(`${tIdx + 1}. **${tName}**: Total: ${topicTotal} | ✅ Done: ${topicDone} | ⏳ Left: ${topicLeft}`);
});

console.log(`\n----------------------------------------------------------------`);
console.log(`📊 TOTAL DSA BLOGS: ${totalDsa}`);
console.log(`✅ Completed (Done): ${doneDsa}`);
console.log(`⏳ Remaining (Left): ${leftDsa}`);
console.log(`----------------------------------------------------------------\n`);
