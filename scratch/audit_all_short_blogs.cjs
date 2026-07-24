const { ROADMAP_ZONES } = require('../src/config/roadmapData.ts');
const { deBlogData } = require('../src/config/deBlogData.ts');
const { ML_BLOG_DATA } = require('../src/config/mlBlogData.ts');
const { BLOG_POSTS } = require('../src/config/blogData.ts');

const blogDataMap = {};
BLOG_POSTS.forEach(b => { blogDataMap[b.slug] = b; });

const shortArticles = [];

ROADMAP_ZONES.forEach(zone => {
  // Filter for key technical zones
  const isTargetZone = zone.name.includes('Data Structures') || 
                       zone.name.includes('System Design') || 
                       zone.name.includes('Data Engineer') || 
                       zone.name.includes('Machine Learning');
                       
  if (!isTargetZone) return;

  (zone.topics || []).forEach(topic => {
    (topic.concepts || []).forEach(concept => {
      (concept.subtopics || []).forEach(sub => {
        const slug = sub.blogSlug;
        if (!slug) return;
        
        let source = 'NONE';
        let len = 0;
        
        if (deBlogData[slug] !== undefined) {
          source = 'deBlogData.ts';
          len = deBlogData[slug].length;
        } else if (ML_BLOG_DATA[slug] !== undefined) {
          source = 'mlBlogData.ts';
          const item = ML_BLOG_DATA[slug];
          len = typeof item === 'string' ? item.length : (item.markdown ? item.markdown.length : JSON.stringify(item).length);
        } else if (blogDataMap[slug] !== undefined) {
          source = 'blogData.ts';
          len = (blogDataMap[slug].markdown || '').length;
        }
        
        if (len < 4000) {
          shortArticles.push({ slug, source, len, title: sub.name, zone: zone.name });
        }
      });
    });
  });
});

console.log('TOTAL TECHNICAL SHORT ARTICLES (< 4000 chars):', shortArticles.length);
console.table(shortArticles);
