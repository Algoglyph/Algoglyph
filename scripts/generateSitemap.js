import fs from 'node:fs';

const SOURCE_FILES = {
  roadmap: 'src/config/roadmapData.ts',
  articles: 'src/config/blogData.ts',
  machineLearning: 'src/config/mlBlogData.ts',
  dataEngineering: 'src/config/deBlogData.ts',
  landing: 'src/components/LandingPage.tsx',
};

const read = (file) => fs.readFileSync(file, 'utf8');
const isoModified = (file) => fs.statSync(file).mtime.toISOString().slice(0, 10);
const latestModified = (...files) => files
  .map(isoModified)
  .sort()
  .at(-1);

const roadmapSource = read(SOURCE_FILES.roadmap);
let evaluableRoadmap = roadmapSource.substring(roadmapSource.indexOf('export const ROADMAP_ZONES'));
evaluableRoadmap = evaluableRoadmap.replace(/:\s*RoadmapZone\[\]/g, '');
evaluableRoadmap = evaluableRoadmap.replace('export const ROADMAP_ZONES', 'const ROADMAP_ZONES');
const zones = new Function(`${evaluableRoadmap}\nreturn ROADMAP_ZONES;`)();

const articleSource = read(SOURCE_FILES.articles);
const machineLearningSource = read(SOURCE_FILES.machineLearning);
const dataEngineeringSource = read(SOURCE_FILES.dataEngineering);

const sourceBySlug = new Map();
const postsStart = articleSource.indexOf('export const BLOG_POSTS');
const postsArrayStart = articleSource.indexOf('[', articleSource.indexOf('=', postsStart));
const postsArrayEnd = articleSource.lastIndexOf('];');
const articlePosts = new Function(`return (${articleSource.slice(postsArrayStart, postsArrayEnd + 1)})`)();
const isFinishedArticle = (post) => {
  if (post.markdown) return true;
  const introduction = post.content?.introduction || '';
  return !introduction.includes('This comprehensive guide covers the core technical structures')
    && !introduction.includes('is a fundamental concept in the study of')
    && !introduction.includes('See the markdown content for the full article.');
};
const firstPostBySlug = new Map();
for (const post of articlePosts) {
  if (!firstPostBySlug.has(post.slug)) firstPostBySlug.set(post.slug, post);
}
for (const post of firstPostBySlug.values()) {
  if (isFinishedArticle(post)) sourceBySlug.set(post.slug, SOURCE_FILES.articles);
}
for (const match of machineLearningSource.matchAll(/^\s{2}"([a-z0-9-]+)"\s*:\s*\{/gm)) {
  sourceBySlug.set(match[1], SOURCE_FILES.machineLearning);
}
for (const match of dataEngineeringSource.matchAll(/^\s{2}'([a-z0-9-]+)'\s*:\s*`/gm)) {
  sourceBySlug.set(match[1], SOURCE_FILES.dataEngineering);
}

const baseUrl = 'https://algoglyph.com';
const seen = new Set();
const urls = [];
const stripTrailingSlash = (path) => (path === '/' ? '/' : path.replace(/\/+$/, ''));

const addUrl = (path, lastmod) => {
  const cleanPath = stripTrailingSlash(path);
  if (seen.has(cleanPath)) return;
  seen.add(cleanPath);
  urls.push({ loc: `${baseUrl}${cleanPath === '/' ? '/' : cleanPath}`, lastmod });
};

const siteModified = latestModified(SOURCE_FILES.landing, 'src/config/siteIdentity.ts');
const roadmapModified = isoModified(SOURCE_FILES.roadmap);
addUrl('/', siteModified);
addUrl('/about', latestModified('src/components/AboutPage.tsx', 'src/config/siteIdentity.ts'));
addUrl('/workspace', latestModified('src/App.tsx', 'src/components/Toolbar.tsx'));
addUrl('/roadmap', roadmapModified);
addUrl('/privacy', isoModified('src/components/PrivacyPage.tsx'));
addUrl('/terms', isoModified('src/components/TermsPage.tsx'));

const canonicalArticleSlug = new Set();
let excludedFallbackArticles = 0;

for (const zone of zones) {
  addUrl(`/roadmap/${zone.id}`, roadmapModified);
  for (const topic of zone.topics) {
    addUrl(`/roadmap/${zone.id}/${topic.id}`, roadmapModified);
    for (const concept of topic.concepts) {
      addUrl(`/roadmap/${zone.id}/${topic.id}/${concept.id}`, roadmapModified);
      for (const subtopic of concept.subtopics) {
        if (canonicalArticleSlug.has(subtopic.blogSlug)) continue;
        canonicalArticleSlug.add(subtopic.blogSlug);
        const contentSource = sourceBySlug.get(subtopic.blogSlug);
        if (!contentSource) {
          excludedFallbackArticles += 1;
          continue;
        }
        addUrl(
          `/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`,
          latestModified(SOURCE_FILES.roadmap, contentSource),
        );
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
  xmlLines.push(`    <lastmod>${url.lastmod}</lastmod>`);
  xmlLines.push('  </url>');
}
xmlLines.push('</urlset>');

const sitemapOutput = `${xmlLines.join('\n')}\n`;
if (!fs.existsSync('public/sitemap.xml') || fs.readFileSync('public/sitemap.xml', 'utf8') !== sitemapOutput) {
  fs.writeFileSync('public/sitemap.xml', sitemapOutput);
}
console.log(
  `Generated public/sitemap.xml with ${urls.length} canonical, indexable routes; excluded ${excludedFallbackArticles} generic fallback articles.`,
);
