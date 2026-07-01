import fs from 'fs';
import path from 'path';

// Read the typescript syllabus definition
const fileContent = fs.readFileSync('src/config/roadmapData.ts', 'utf8');

// Strip TypeScript definitions cleanly by capturing everything from ROADMAP_ZONES definition
let jsContent = fileContent.substring(fileContent.indexOf('export const ROADMAP_ZONES'));
jsContent = jsContent.replace(/:\s*RoadmapZone\[\]/g, '');
jsContent = jsContent.replace('export const ROADMAP_ZONES', 'const ROADMAP_ZONES');

// Evaluate the javascript string to extract active routes
const getZones = new Function(jsContent + '\nreturn ROADMAP_ZONES;');
const zones = getZones();

const baseUrl = 'https://algoglyph.com';
const urls = [
  { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${baseUrl}/workspace/`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${baseUrl}/roadmap/`, priority: '0.95', changefreq: 'weekly' },
  { loc: `${baseUrl}/privacy/`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${baseUrl}/terms/`, priority: '0.5', changefreq: 'monthly' }
];

// Map all nested levels for crawler indexing
for (const zone of zones) {
  urls.push({ loc: `${baseUrl}/roadmap/${zone.id}`, priority: '0.85', changefreq: 'weekly' });
  for (const topic of zone.topics) {
    urls.push({ loc: `${baseUrl}/roadmap/${zone.id}/${topic.id}`, priority: '0.80', changefreq: 'weekly' });
    for (const concept of topic.concepts) {
      urls.push({ loc: `${baseUrl}/roadmap/${zone.id}/${topic.id}/${concept.id}`, priority: '0.75', changefreq: 'weekly' });
      for (const subtopic of concept.subtopics) {
        urls.push({
          loc: `${baseUrl}/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`,
          priority: '0.90', // High priority for actual textbook article content!
          changefreq: 'weekly'
        });
      }
    }
  }
}

// Construct XML output
const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
];

for (const u of urls) {
  xmlLines.push('  <url>');
  xmlLines.push(`    <loc>${u.loc}</loc>`);
  xmlLines.push('    <lastmod>2026-07-01</lastmod>');
  xmlLines.push(`    <changefreq>${u.changefreq}</changefreq>`);
  xmlLines.push(`    <priority>${u.priority}</priority>`);
  xmlLines.push('  </url>');
}

xmlLines.push('</urlset>');

fs.writeFileSync('public/sitemap.xml', xmlLines.join('\n'));
console.log(`Successfully generated public/sitemap.xml containing ${urls.length} active crawl routes.`);
