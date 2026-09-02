import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const SOURCE_FILES = {
  roadmap: 'src/config/roadmapData.ts',
  articles: 'src/config/blogData.ts',
  machineLearning: 'src/config/mlBlogData.ts',
  dataEngineering: 'src/config/deBlogData.ts',
  canonicalArticles: 'src/generated/articleContent.ts',
  landing: 'src/components/LandingPage.tsx',
};

const read = (file) => fs.readFileSync(file, 'utf8');
const contentScope = JSON.parse(read('src/config/contentScope.json'));
const activeRoadmapZoneIds = new Set(contentScope.activeRoadmapZoneIds);
const modifiedDateCache = new Map();
const isoModified = (file) => {
  const cached = modifiedDateCache.get(file);
  if (cached) return cached;
  let modifiedDate;
  try {
    const committedDate = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', file],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    if (committedDate) modifiedDate = committedDate;
  } catch {
    // Source archives and package builds may not include Git metadata.
  }
  if (!modifiedDate) modifiedDate = fs.statSync(file).mtime.toISOString().slice(0, 10);
  modifiedDateCache.set(file, modifiedDate);
  return modifiedDate;
};
const latestModified = (...files) => files
  .map(isoModified)
  .sort()
  .at(-1);

const roadmapSource = read(SOURCE_FILES.roadmap);
let evaluableRoadmap = roadmapSource.substring(roadmapSource.indexOf('export const ROADMAP_ZONES'));
evaluableRoadmap = evaluableRoadmap.replace(/:\s*RoadmapZone\[\]/g, '');
evaluableRoadmap = evaluableRoadmap.replace('export const ROADMAP_ZONES', 'const ROADMAP_ZONES');
const allZones = new Function(`${evaluableRoadmap}\nreturn ROADMAP_ZONES;`)();

const articleSource = read(SOURCE_FILES.articles);
const canonicalArticleSource = read(SOURCE_FILES.canonicalArticles);
const machineLearningSource = read(SOURCE_FILES.machineLearning);
const dataEngineeringSource = read(SOURCE_FILES.dataEngineering);

const canonicalArrayStart = canonicalArticleSource.indexOf('[', canonicalArticleSource.indexOf('export const CANONICAL_ARTICLES'));
const canonicalArrayEnd = canonicalArticleSource.lastIndexOf('];');
const canonicalArticles = new Function(`return (${canonicalArticleSource.slice(canonicalArrayStart, canonicalArrayEnd + 1)})`)()
  .filter((article) => contentScope.activeContentTopics.includes(article.topic));
const canonicalBySlug = new Map(canonicalArticles.map((article) => [article.slug, article]));
const zones = allZones
  .filter((zone) => activeRoadmapZoneIds.has(zone.id))
  .map((zone) => ({
    ...zone,
    topics: zone.topics
      .map((topic) => ({
        ...topic,
        concepts: topic.concepts
          .map((concept) => ({
            ...concept,
            subtopics: concept.subtopics.filter((subtopic) => canonicalBySlug.has(subtopic.blogSlug)),
          }))
          .filter((concept) => concept.subtopics.length > 0),
      }))
      .filter((topic) => topic.concepts.length > 0),
  }));

const sourceBySlug = new Map();
const postsStart = articleSource.indexOf('export const BLOG_POSTS');
const postsArrayStart = articleSource.indexOf('[', articleSource.indexOf('=', postsStart));
const postsArrayEnd = articleSource.lastIndexOf('];');
const articlePosts = new Function(`return (${articleSource.slice(postsArrayStart, postsArrayEnd + 1)})`)()
  .map((post) => {
    const canonical = canonicalBySlug.get(post.slug);
    return canonical ? { ...post, markdown: canonical.markdown } : post;
  });
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
  if (isFinishedArticle(post)) {
    sourceBySlug.set(post.slug, canonicalBySlug.get(post.slug)?.sourcePath || SOURCE_FILES.articles);
  }
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
const previousLastmod = new Map();

let previousXml = '';
try {
  previousXml = execFileSync(
    'git',
    ['show', 'HEAD:public/sitemap.xml'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  );
} catch {
  if (fs.existsSync('public/sitemap.xml')) previousXml = read('public/sitemap.xml');
}

if (previousXml) {
  for (const match of previousXml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
    previousLastmod.set(match[1], match[2]);
  }
}

const addUrl = (path, lastmod) => {
  const cleanPath = stripTrailingSlash(path);
  if (seen.has(cleanPath)) return;
  seen.add(cleanPath);
  const loc = `${baseUrl}${cleanPath === '/' ? '/' : cleanPath}`;
  const prior = previousLastmod.get(loc);
  urls.push({ loc, lastmod: prior && prior > lastmod ? prior : lastmod });
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
