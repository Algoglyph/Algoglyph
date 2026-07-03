import fs from 'fs';

const fileContent = fs.readFileSync('src/config/roadmapData.ts', 'utf8');
let jsContent = fileContent.substring(fileContent.indexOf('export const ROADMAP_ZONES'));
jsContent = jsContent.replace(/:\s*RoadmapZone\[\]/g, '');
jsContent = jsContent.replace('export const ROADMAP_ZONES', 'const ROADMAP_ZONES');

const getZones = new Function(`${jsContent}\nreturn ROADMAP_ZONES;`);
const zones = getZones();

const baseUrl = 'https://algoglyph.com';
const lastmod = '2026-07-03';
const seen = new Set();
const urls = [];

const stripTrailingSlash = (path) => (path === '/' ? '/' : path.replace(/\/+$/, ''));
const addUrl = (path, priority, changefreq) => {
  const cleanPath = stripTrailingSlash(path);
  if (seen.has(cleanPath)) return;
  seen.add(cleanPath);
  urls.push({ loc: `${baseUrl}${cleanPath === '/' ? '/' : cleanPath}`, priority, changefreq });
};

addUrl('/', '1.0', 'weekly');
addUrl('/workspace', '0.9', 'weekly');
addUrl('/roadmap', '0.95', 'weekly');
addUrl('/privacy', '0.4', 'yearly');
addUrl('/terms', '0.4', 'yearly');

const canonicalArticleSlug = new Set();

for (const zone of zones) {
  addUrl(`/roadmap/${zone.id}`, '0.85', 'weekly');
  for (const topic of zone.topics) {
    addUrl(`/roadmap/${zone.id}/${topic.id}`, '0.80', 'weekly');
    for (const concept of topic.concepts) {
      addUrl(`/roadmap/${zone.id}/${topic.id}/${concept.id}`, '0.72', 'weekly');
      for (const subtopic of concept.subtopics) {
        if (canonicalArticleSlug.has(subtopic.blogSlug)) continue;
        canonicalArticleSlug.add(subtopic.blogSlug);
        addUrl(`/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`, '0.90', 'weekly');
      }
    }
  }
}

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];

for (const url of urls) {
  xmlLines.push('  <url>');
  xmlLines.push(`    <loc>${escapeXml(url.loc)}</loc>`);
  xmlLines.push(`    <lastmod>${lastmod}</lastmod>`);
  xmlLines.push(`    <changefreq>${url.changefreq}</changefreq>`);
  xmlLines.push(`    <priority>${url.priority}</priority>`);
  xmlLines.push('  </url>');
}

xmlLines.push('</urlset>');

fs.writeFileSync('public/sitemap.xml', `${xmlLines.join('\n')}\n`);
console.log(`Successfully generated public/sitemap.xml containing ${urls.length} canonical crawl routes.`);
