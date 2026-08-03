const fs = require('fs');
const path = require('path');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

// Get all files in public/images/backend
const imageDir = path.join(__dirname, '..', 'public', 'images', 'backend');
const backendImageFiles = fs.existsSync(imageDir) ? fs.readdirSync(imageDir) : [];

console.log(`Found ${backendImageFiles.length} image files in public/images/backend/:\n`);
backendImageFiles.forEach((file, i) => {
  console.log(`  ${i + 1}. ${file}`);
});

// Map of slug -> markdown
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

const withJpgImages = [];
const withoutJpgImages = [];

backendZone.topics.forEach(t => {
  const tName = t.name || t.title || t.id;
  t.concepts.forEach(c => {
    const cName = c.name || c.title || c.id;
    c.subtopics.forEach(s => {
      const sName = s.name || s.title || s.id;
      const slug = s.blogSlug;
      const md = blogMap.get(slug);

      if (md) {
        // Check if markdown references an image in /images/ or has an image tag
        const hasImgRef = /\/images\/backend\/[^\s"')]+\.(jpg|jpeg|png|webp|svg)/i.test(md) || 
                          /!\[.*?\]\([^\)]+\)/i.test(md) || 
                          /<img[\s\S]*?>/i.test(md);

        if (hasImgRef) {
          withJpgImages.push({ name: sName, slug, topic: tName, concept: cName });
        } else {
          withoutJpgImages.push({ name: sName, slug, topic: tName, concept: cName });
        }
      }
    });
  });
});

console.log('\n================================================================');
console.log('       COMPLETED BACKEND BLOGS IMAGE AUDIT (public/images/backend)');
console.log('================================================================');
console.log(`Total Completed Backend Blogs:               ${withJpgImages.length + withoutJpgImages.length}`);
console.log(`✅ Completed Blogs WITH Image References:    ${withJpgImages.length}`);
console.log(`❌ Completed Blogs MISSING Image References: ${withoutJpgImages.length}\n`);

console.log(`--- ✅ 15 BLOGS WITH IMAGES (${withJpgImages.length}) ---`);
withJpgImages.forEach((b, i) => {
  console.log(`  ${i + 1}. **${b.name}** (\`${b.slug}\`) — *${b.topic} › ${b.concept}*`);
});

console.log(`\n--- ❌ 79 COMPLETED BACKEND BLOGS MISSING IMAGES (${withoutJpgImages.length}) ---`);
withoutJpgImages.forEach((b, i) => {
  console.log(`  ${i + 1}. **${b.name}** (\`${b.slug}\`) — *${b.topic} › ${b.concept}*`);
});
