const path = require('path');
const { ROADMAP_ZONES } = require(path.join(__dirname, '../src/config/roadmapData.ts'));
const { deBlogData } = require(path.join(__dirname, '../src/config/deBlogData.ts'));
const { ML_BLOG_DATA } = require(path.join(__dirname, '../src/config/mlBlogData.ts'));
const { BLOG_POSTS } = require(path.join(__dirname, '../src/config/blogData.ts'));

const blogDataMap = {};
BLOG_POSTS.forEach(b => { blogDataMap[b.slug] = b; });

// Find Computer Networks / Network Engineering Zone
const netZone = ROADMAP_ZONES.find(z => 
  z.name.toLowerCase().includes('network') || 
  z.id.toLowerCase().includes('network')
);

if (!netZone) {
  console.log('Networks zone not found! Available zones:');
  ROADMAP_ZONES.forEach(z => console.log('-', z.name, '(', z.id, ')'));
  process.exit(1);
}

console.log('====================================================');
console.log(`ZONE AUDIT: ${netZone.name} (ID: ${netZone.id})`);
console.log('====================================================');

const results = [];

(netZone.topics || []).forEach(topic => {
  (topic.concepts || []).forEach(concept => {
    (concept.subtopics || []).forEach(sub => {
      const slug = sub.blogSlug;
      if (!slug) return;

      let len = 0;
      let source = 'None';

      if (deBlogData[slug] !== undefined) {
        len = deBlogData[slug].length;
        source = 'deBlogData.ts';
      } else if (ML_BLOG_DATA[slug] !== undefined) {
        const item = ML_BLOG_DATA[slug];
        const md = typeof item === 'string' ? item : (item.markdown || item.content || '');
        len = md.length;
        source = 'mlBlogData.ts';
      } else if (blogDataMap[slug] !== undefined) {
        len = (blogDataMap[slug].markdown || '').length;
        source = 'blogData.ts';
      }

      const isFixed = len >= 4000;

      results.push({
        slug,
        title: sub.name,
        topic: topic.name,
        source,
        length: len,
        status: isFixed ? '✅ FIXED (Deep/Detailed)' : '❌ SHORT / NOT FIXED'
      });
    });
  });
});

console.table(results);

const fixedCount = results.filter(r => r.status.includes('FIXED')).length;
const notFixedCount = results.filter(r => !r.status.includes('FIXED')).length;

console.log(`\nSUMMARY FOR ${netZone.name}:`);
console.log(`- Total Articles: ${results.length}`);
console.log(`- Fixed (>= 4000 chars): ${fixedCount}`);
console.log(`- Not Fixed (< 4000 chars): ${notFixedCount}`);
