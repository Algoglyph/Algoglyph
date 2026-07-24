const path = require('path');

const { ROADMAP_ZONES } = require(path.join(__dirname, '../src/config/roadmapData.ts'));
const { deBlogData } = require(path.join(__dirname, '../src/config/deBlogData.ts'));
const { ML_BLOG_DATA } = require(path.join(__dirname, '../src/config/mlBlogData.ts'));
const { BLOG_POSTS } = require(path.join(__dirname, '../src/config/blogData.ts'));

const blogDataMap = {};
BLOG_POSTS.forEach(b => { blogDataMap[b.slug] = b; });

const androidZone = ROADMAP_ZONES.find(z => z.id === 'android-development');

if (!androidZone) {
  console.log('Android zone not found!');
  process.exit(1);
}

console.log('========================================================================');
console.log(`CORRECTED RUNTIME AUDIT: ${androidZone.name} (${androidZone.id})`);
console.log('========================================================================');

const results = [];

(androidZone.topics || []).forEach(topic => {
  (topic.concepts || []).forEach(concept => {
    (concept.subtopics || []).forEach(sub => {
      const slug = sub.blogSlug;
      if (!slug) return;

      let markdown = '';
      let source = 'None';

      // 1. Check BLOG_POSTS first (runtime priority 1)
      if (blogDataMap[slug] !== undefined) {
        markdown = String(blogDataMap[slug].markdown || '');
        source = 'blogData.ts';
      }
      // 2. Check deBlogData next
      else if (deBlogData[slug] !== undefined) {
        markdown = String(deBlogData[slug] || '');
        source = 'deBlogData.ts';
      }
      // 3. Check ML_BLOG_DATA next
      else if (ML_BLOG_DATA[slug] !== undefined) {
        const item = ML_BLOG_DATA[slug];
        const md = typeof item === 'string' ? item : (item.markdown || item.content || '');
        if (md && md !== 'ML_BLOG_DATA' && md.length > 50) {
          markdown = String(md);
          source = 'mlBlogData.ts';
        }
      }

      const len = markdown.length;

      // Check if it contains generic boilerplate phrases
      const isGenericBoilerplate = 
        !markdown ||
        markdown.includes('is a fundamental concept in the study of') ||
        markdown.includes('defining how computing architectures handle structural data') ||
        markdown.includes('In standard engineering practices, this concept forms the core of high-throughput pipelines') ||
        markdown.includes('Developing a strong intuition for') ||
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

console.log(`Total Android Articles: ${results.length}\n`);

results.forEach((r, i) => {
  console.log(`${(i + 1).toString().padStart(2, ' ')}. [${r.slug}] ${r.title} (${r.length} chars, ${r.source}) --> ${r.status}`);
});

const fixedCount = results.filter(r => r.status.includes('FIXED')).length;
const genericCount = results.filter(r => r.status.includes('GENERIC')).length;
const shortCount = results.filter(r => r.status.includes('SHORT')).length;

console.log('\n========================================================================');
console.log(`ANDROID DEVELOPMENT FINAL SUMMARY:`);
console.log(`- Total Articles: ${results.length}`);
console.log(`- ✅ Fixed (Custom Deep Technical Content >= 3,500 chars): ${fixedCount} (${Math.round(fixedCount/results.length*100)}%)`);
console.log(`- ❌ Generic Blueprint / Placeholder Content: ${genericCount} (${Math.round(genericCount/results.length*100)}%)`);
console.log('========================================================================');
