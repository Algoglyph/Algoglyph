const fs = require('fs');

// Read blogData.ts
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const blogSlugs = new Set();
const slugRe = /["']?slug["']?\s*:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = slugRe.exec(blogDataRaw)) !== null) {
  blogSlugs.add(m[1]);
}

// Read roadmapData.ts
const roadmapDataRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
const roadmapSlugs = new Set();
const roadmapRe = /blogSlug:\s*['"]([^'"]+)['"]/g;
while ((m = roadmapRe.exec(roadmapDataRaw)) !== null) {
  roadmapSlugs.add(m[1]);
}

// Find slugs in roadmap that are not in blogData
const missingFromBlog = [];
for (const slug of roadmapSlugs) {
  if (!blogSlugs.has(slug)) {
    missingFromBlog.push(slug);
  }
}

console.log('=== SLUGS IN ROADMAP BUT MISSING FROM BLOGDATA ===');
missingFromBlog.sort().forEach(s => console.log('  ' + s));
console.log('Total missing:', missingFromBlog.length);
