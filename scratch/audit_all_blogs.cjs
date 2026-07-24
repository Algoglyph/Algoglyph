const fs = require('fs');
const path = require('path');

const blogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/blogData.ts'), 'utf8');
const deBlogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/deBlogData.ts'), 'utf8');
const mlBlogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/mlBlogData.ts'), 'utf8');
const roadmapDataContent = fs.readFileSync(path.join(__dirname, '../src/config/roadmapData.ts'), 'utf8');

// Parse all blogSlugs from roadmapData.ts
const slugRegex = /blogSlug:\s*['"]([^'"]+)['"]/g;
let match;
const allRoadmapSlugs = new Set();
while ((match = slugRegex.exec(roadmapDataContent)) !== null) {
  allRoadmapSlugs.add(match[1]);
}

console.log(`Total unique blogSlugs found in roadmapData.ts: ${allRoadmapSlugs.size}`);

// Import/eval deBlogData and ML_BLOG_DATA
const { deBlogData } = require('../src/config/deBlogData.ts');
const { ML_BLOG_DATA } = require('../src/config/mlBlogData.ts');
const { BLOG_POSTS } = require('../src/config/blogData.ts');

const blogPostsMap = new Map();
BLOG_POSTS.forEach(post => {
  blogPostsMap.set(post.slug, post);
});

const results = [];
let shortCount = 0;
let missingCount = 0;

allRoadmapSlugs.forEach(slug => {
  let len = 0;
  let source = 'none';

  if (blogPostsMap.has(slug)) {
    const post = blogPostsMap.get(slug);
    len = post.markdown ? post.markdown.length : (JSON.stringify(post.content).length);
    source = 'blogData';
  } else if (deBlogData[slug]) {
    len = deBlogData[slug].length;
    source = 'deBlogData';
  } else if (ML_BLOG_DATA[slug]) {
    const post = ML_BLOG_DATA[slug];
    len = post.markdown ? post.markdown.length : (JSON.stringify(post.content).length);
    source = 'mlBlogData';
  }

  if (source === 'none' || len === 0) {
    missingCount++;
    results.push({ slug, len: 0, source: 'MISSING', status: 'MISSING' });
  } else if (len < 4000) {
    shortCount++;
    results.push({ slug, len, source, status: 'SHORT' });
  } else {
    results.push({ slug, len, source, status: 'OK' });
  }
});

console.log(`\nAudit Summary:`);
console.log(`- OK (> 4000 chars): ${results.filter(r => r.status === 'OK').length}`);
console.log(`- SHORT (< 4000 chars): ${shortCount}`);
console.log(`- MISSING: ${missingCount}`);

console.log(`\n--- SHORT OR MISSING BLOGS ---`);
results.filter(r => r.status !== 'OK').forEach(r => {
  console.log(`[${r.status}] ${r.slug} (${r.len} chars, source: ${r.source})`);
});
