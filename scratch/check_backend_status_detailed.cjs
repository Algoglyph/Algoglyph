const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');
const mlBlogDataRaw = fs.readFileSync('./src/config/mlBlogData.ts', 'utf8');

// Find all slugs present in blogData.ts
const blogSlugs = new Set();
let m;
const slugRe = /["']?slug["']?\s*:\s*['"]([^'"]+)['"]/g;
while ((m = slugRe.exec(blogDataRaw)) !== null) {
  blogSlugs.add(m[1]);
}

// Find all non-empty slugs in deBlogData.ts
const deDoneSlugs = new Set();
const deSlotRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
while ((m = deSlotRe.exec(deBlogDataRaw)) !== null) {
  if (m[2] && m[2].trim().length > 50) {
    deDoneSlugs.add(m[1]);
  }
}

// Find all non-empty slugs in mlBlogData.ts
const mlDoneSlugs = new Set();
const mlSlotRe = /'([^']+)'\s*:\s*`([\s\S]*?)`/g;
while ((m = mlSlotRe.exec(mlBlogDataRaw)) !== null) {
  if (m[2] && m[2].trim().length > 50) {
    mlDoneSlugs.add(m[1]);
  }
}

// Convert roadmapData TS code to JS by stripping TS annotations
let cleanTs = roadmapRaw
  .replace(/export interface [\s\S]*?}/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/export const ROADMAP_ZONES =/, 'const ROADMAP_ZONES =');

let ROADMAP_ZONES;
try {
  eval(cleanTs + '\n module.exports = ROADMAP_ZONES;');
  ROADMAP_ZONES = module.exports;
} catch (e) {
  console.log('Eval error:', e.message);
}

console.log('======================================================================');
console.log('                  ALL ROADMAP ZONES BLOG STATUS                       ');
console.log('======================================================================\n');

if (ROADMAP_ZONES) {
  ROADMAP_ZONES.forEach((zone, zIdx) => {
    let zoneTotal = 0;
    let zoneDoneCount = 0;
    let zoneRemainingCount = 0;
    const doneList = [];
    const remainingList = [];

    zone.topics.forEach(topic => {
      topic.concepts.forEach(concept => {
        concept.subtopics.forEach(subtopic => {
          zoneTotal++;
          const slug = subtopic.blogSlug;
          const isDone = blogSlugs.has(slug) || deDoneSlugs.has(slug) || mlDoneSlugs.has(slug);
          const item = {
            topic: topic.title,
            concept: concept.title,
            title: subtopic.title,
            slug: slug
          };
          if (isDone) {
            zoneDoneCount++;
            doneList.push(item);
          } else {
            zoneRemainingCount++;
            remainingList.push(item);
          }
        });
      });
    });

    console.log(`ZONE ${zIdx + 1}: ${zone.title} (ID: '${zone.id}')`);
    console.log(`├── Total Blogs:     ${zoneTotal}`);
    console.log(`├── Completed (Done): ${zoneDoneCount}`);
    console.log(`└── Remaining (Left): ${zoneRemainingCount}`);

    if (remainingList.length > 0) {
      console.log(`\n    REMAINING BLOGS (${remainingList.length}):`);
      remainingList.forEach((r, idx) => {
        console.log(`      ${idx + 1}. [${r.topic} -> ${r.concept}] ${r.title} (slug: '${r.slug}')`);
      });
    } else {
      console.log(`    🎉 100% COMPLETE! All ${zoneTotal} blogs are written and active.`);
    }
    console.log('----------------------------------------------------------------------\n');
  });
}
