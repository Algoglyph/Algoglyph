const path = require('path');
const fs = require('fs');

const { ROADMAP_ZONES } = require(path.join(__dirname, '../src/config/roadmapData.ts'));
const { deBlogData } = require(path.join(__dirname, '../src/config/deBlogData.ts'));
const { ML_BLOG_DATA } = require(path.join(__dirname, '../src/config/mlBlogData.ts'));
const { BLOG_POSTS } = require(path.join(__dirname, '../src/config/blogData.ts'));
const { SYSTEM_DESIGN_DIAGRAMS } = require(path.join(__dirname, '../src/config/illustrationData.ts'));
const { DE_DIAGRAMS } = require(path.join(__dirname, '../src/config/deIllustrationData.ts'));
const { ML_DIAGRAMS } = require(path.join(__dirname, '../src/config/mlIllustrationData.ts'));
const { getCuratedRoadmapDiagram } = require(path.join(__dirname, '../src/config/topicIllustrationData.ts'));

const blogDataMap = {};
BLOG_POSTS.forEach(b => { blogDataMap[b.slug] = b; });

const netZone = ROADMAP_ZONES.find(z => 
  z.name.toLowerCase().includes('network') || 
  z.id.toLowerCase().includes('network')
);

const results = [];

(netZone.topics || []).forEach(topic => {
  (topic.concepts || []).forEach(concept => {
    (concept.subtopics || []).forEach(sub => {
      const slug = sub.blogSlug;
      if (!slug) return;

      let markdown = '';
      if (deBlogData[slug] !== undefined) {
        markdown = deBlogData[slug];
      } else if (ML_BLOG_DATA[slug] !== undefined) {
        const item = ML_BLOG_DATA[slug];
        markdown = typeof item === 'string' ? item : (item.markdown || item.content || '');
      } else if (blogDataMap[slug] !== undefined) {
        markdown = blogDataMap[slug].markdown || '';
      }

      // Visual checks
      const hasInlineSvg = markdown.includes('<svg') || markdown.includes('```svg');
      const hasMarkdownImg = /!\[.*?\]\(\/images\/.*?\)/.test(markdown) || markdown.includes('<img');
      const hasCuratedDiagram = !!getCuratedRoadmapDiagram(slug);
      const hasSysDiagram = !!SYSTEM_DESIGN_DIAGRAMS[slug];
      const hasDeDiagram = !!DE_DIAGRAMS[slug];
      const hasMlDiagram = !!ML_DIAGRAMS[slug];

      const hasIllustrationBanner = hasCuratedDiagram || hasSysDiagram || hasDeDiagram || hasMlDiagram;
      const hasAnyVisual = hasInlineSvg || hasMarkdownImg || hasIllustrationBanner;

      results.push({
        slug,
        title: sub.name,
        hasInlineSvg,
        hasMarkdownImg,
        hasIllustrationBanner,
        hasAnyVisual
      });
    });
  });
});

console.log('========================================================================');
console.log(`IMAGE & DIAGRAM AUDIT: COMPUTER NETWORKS & PROTOCOLS (${results.length} ARTICLES)`);
console.log('========================================================================');

results.forEach((r, i) => {
  const visualTypes = [];
  if (r.hasIllustrationBanner) visualTypes.push('SVG Banner Diagram');
  if (r.hasInlineSvg) visualTypes.push('Inline Architectural SVG');
  if (r.hasMarkdownImg) visualTypes.push('PNG Banner Image');

  const status = visualTypes.length > 0 ? `✅ YES (${visualTypes.join(' + ')})` : '❌ NO VISUAL';
  console.log(`${(i + 1).toString().padStart(2, ' ')}. [${r.slug}] ${r.title} --> ${status}`);
});

const withVisualCount = results.filter(r => r.hasAnyVisual).length;
const withoutVisualCount = results.filter(r => !r.hasAnyVisual).length;

console.log('\n========================================================================');
console.log(`TOTAL ARTICLES WITH VISUALS / DIAGRAMS / IMAGES: ${withVisualCount} / ${results.length} (${Math.round(withVisualCount/results.length*100)}%)`);
console.log(`TOTAL ARTICLES WITHOUT VISUALS: ${withoutVisualCount}`);
console.log('========================================================================');
