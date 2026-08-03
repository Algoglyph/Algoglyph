const path = require('path');

const { ROADMAP_ZONES } = require(path.join(__dirname, '../src/config/roadmapData.ts'));
const { deBlogData } = require(path.join(__dirname, '../src/config/deBlogData.ts'));
const { ML_BLOG_DATA } = require(path.join(__dirname, '../src/config/mlBlogData.ts'));
const { BLOG_POSTS } = require(path.join(__dirname, '../src/config/blogData.ts'));

const blogDataMap = {};
BLOG_POSTS.forEach(b => { blogDataMap[b.slug] = b; });

// Find Android Development Zone
const androidZone = ROADMAP_ZONES.find(z => 
  z.name.toLowerCase().includes('android') || 
  z.id.toLowerCase().includes('android')
);

if (!androidZone) {
  console.log('Android zone not found! Available zones:');
  ROADMAP_ZONES.forEach(z => console.log('-', z.name, '(', z.id, ')'));
  process.exit(1);
}

console.log('========================================================================');
console.log(`ZONE AUDIT: ${androidZone.name} (ID: ${androidZone.id})`);
console.log('========================================================================');

const results = [];

(androidZone.topics || []).forEach(topic => {
  (topic.concepts || []).forEach(concept => {
    (concept.subtopics || []).forEach(sub => {
      const slug = sub.blogSlug;
      if (!slug) return;

      let markdown = '';
      let source = 'None';

      if (deBlogData[slug] !== undefined) {
        markdown = String(deBlogData[slug] || '');
        source = 'deBlogData.ts';
      } else if (ML_BLOG_DATA[slug] !== undefined) {
        const item = ML_BLOG_DATA[slug];
        markdown = String(typeof item === 'string' ? item : (item.markdown || item.content || ''));
        source = 'mlBlogData.ts';
      } else if (blogDataMap[slug] !== undefined) {
        markdown = String(blogDataMap[slug].markdown || '');
        source = 'blogData.ts';
      }

      const len = markdown.length;

      // Generic blueprint boilerplate checks
      const isGenericBoilerplate = 
        markdown.includes('is a fundamental concept in the study of') ||
        markdown.includes('defining how computing architectures handle structural data') ||
        markdown.includes('In standard engineering practices, this concept forms the core of high-throughput pipelines') ||
        markdown.includes('Developing a strong intuition for') ||
        markdown.includes('Unlike simple memory abstractions, implementing') ||
        len < 3000;

      const isFixed = !isGenericBoilerplate && len >= 3500;

      results.push({
        slug,
        title: sub.name,
        topic: topic.name,
        source,
        length: len,
        isGenericBoilerplate,
        status: isFixed ? '✅ FIXED (Custom Deep Content)' : (isGenericBoilerplate ? '❌ GENERIC BLUEPRINT' : '❌ SHORT / INCOMPLETE')
      });
    });
  });
});

console.log(`Total Android Subtopics/Blogs: ${results.length}\n`);

results.forEach((r, i) => {
  console.log(`${(i + 1).toString().padStart(2, ' ')}. [${r.slug}] ${r.title} (${r.length} chars, ${r.source}) --> ${r.status}`);
});

const fixedCount = results.filter(r => r.status.includes('FIXED')).length;
const genericCount = results.filter(r => r.status.includes('GENERIC')).length;
const shortCount = results.filter(r => r.status.includes('SHORT')).length;

console.log('\n========================================================================');
console.log(`ANDROID DEVELOPMENT AUDIT SUMMARY:`);
console.log(`- Total Blogs: ${results.length}`);
console.log(`- ✅ Fixed (Unique & Deep Content): ${fixedCount} (${Math.round(fixedCount/results.length*100)}%)`);
console.log(`- ❌ Generic Blueprint Content: ${genericCount}`);
console.log(`- ❌ Short / Missing Content: ${shortCount}`);
console.log('========================================================================');
