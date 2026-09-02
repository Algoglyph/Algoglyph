import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';

const read = (file) => fs.readFileSync(file, 'utf8');
const toPosix = (value) => value.split(path.sep).join('/');
const fail = (message) => { throw new Error(message); };
const contentScope = JSON.parse(read('src/config/contentScope.json'));
const activeContentTopics = new Set(contentScope.activeContentTopics);
const activeRoadmapZoneIds = new Set(contentScope.activeRoadmapZoneIds);

const collectArticleFiles = () => {
  const files = [];
  for (const topicEntry of fs.readdirSync('content', { withFileTypes: true })) {
    if (!topicEntry.isDirectory() || !activeContentTopics.has(topicEntry.name)) continue;
    const topicPath = path.join('content', topicEntry.name);
    for (const entry of fs.readdirSync(topicPath, { withFileTypes: true })) {
      if (entry.isDirectory()) fail(`Nested content directory is not allowed: ${toPosix(path.join(topicPath, entry.name))}`);
      if (entry.isFile() && entry.name.endsWith('.md')) files.push(path.join(topicPath, entry.name));
    }
  }
  return files.sort();
};

const articleFiles = collectArticleFiles();
if (articleFiles.length < 26) fail(`Expected at least the 26 preserved canonical articles, found ${articleFiles.length}`);

const expectedSections = [
  /^1\. Historical Context & Motivation$/,
  /^2\. Core Mathematical Invariants$/,
  /^3\. Step-by-Step Execution Trace$/,
  /^4\. Production-Ready Implementations$/,
  /^5\. Asymptotic Time & Space Complexity$/,
  /^6\. Systems Connections(?:$|:)/,
  /^7\. Practice Checklist$/,
  /^8\. Frequently Asked Questions$/,
];
const supportedFences = new Set(['text', 'cpp', 'python', 'javascript', 'svg']);
const contentTopicZoneAliases = new Map([
  ['dsa', 'dsa-foundations'],
]);
const primaryImageSlugAliases = new Map([
  ['arrays', 'static-arrays'],
  ['bellman-ford', 'bellman-ford-floyd-warshall'],
  ['heap', 'min-heaps'],
  ['linked-list', 'singly-linked-lists'],
  ['queue', 'fifo-queues'],
  ['stack', 'lifo-stacks'],
]);
const slugsWithoutPrimaryVisual = new Set([
  'avl-red-black-tree',
  'binomial-heaps',
  'fenwick-trees',
]);
const draftingArtifacts = /\b(?:let me redo|re-trace carefully|wait, careful|need to recompute|bug:\s*also true|hmm,)\b/i;
const articles = [];
const slugs = new Set();
let inlineSvgCount = 0;
let primaryImageCount = 0;

for (const file of articleFiles) {
  const relativePath = toPosix(file);
  const parts = relativePath.split('/');
  if (parts.length !== 3) fail(`${relativePath} must use content/<topic>/<slug>.md`);
  const topic = parts[1];
  const slug = path.basename(file, '.md');
  if (slugs.has(slug)) fail(`Duplicate article slug: ${slug}`);
  slugs.add(slug);

  const markdown = read(file).replace(/\r\n/g, '\n');
  if (markdown.startsWith('---\n')) fail(`${relativePath} must not introduce frontmatter`);
  const prose = markdown.replace(/```[\s\S]*?```/g, '');
  const h1 = [...prose.matchAll(/^#\s+(.+)$/gm)];
  if (h1.length !== 1) fail(`${relativePath} must contain exactly one source H1`);
  const h2 = [...prose.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
  if (h2.length !== expectedSections.length) fail(`${relativePath} must contain exactly eight H2 sections`);
  h2.forEach((heading, index) => {
    if (!expectedSections[index].test(heading)) fail(`${relativePath} has an invalid section ${index + 1}: ${heading}`);
  });
  if (/^####+\s/m.test(prose)) fail(`${relativePath} contains unsupported H4+ headings`);
  if (/\\\(|\\\)|\\\[|\\\]/.test(prose)) fail(`${relativePath} contains unsupported LaTeX delimiters`);
  if (/\\(?:label|ref|eqref)\b/.test(prose)) fail(`${relativePath} contains unsupported equation cross-references`);
  if (draftingArtifacts.test(markdown)) fail(`${relativePath} contains a drafting/self-correction artifact`);
  if (/<(?:script|foreignObject)\b|\son[a-z]+\s*=/i.test(markdown)) fail(`${relativePath} contains unsafe executable SVG/HTML`);

  for (const fence of markdown.matchAll(/^```([^\r\n]*)/gm)) {
    const language = fence[1].trim();
    if (language && !supportedFences.has(language)) fail(`${relativePath} uses unsupported code fence: ${language}`);
  }

  const svgOpen = (markdown.match(/<svg\b/gi) || []).length;
  const svgClose = (markdown.match(/<\/svg>/gi) || []).length;
  if (svgOpen !== svgClose) fail(`${relativePath} has unbalanced SVG blocks`);
  inlineSvgCount += svgOpen;

  const withoutCodeOrSvg = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '');
  const displayMath = [];
  const withoutDisplay = withoutCodeOrSvg.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    displayMath.push(math);
    return '';
  });
  const inlineMath = [...withoutDisplay.matchAll(/\$([^$\n]+?)\$/g)].map((match) => match[1]);
  for (const math of [...displayMath, ...inlineMath]) {
    try {
      katex.renderToString(math.trim(), { throwOnError: true });
    } catch (error) {
      fail(`${relativePath} contains invalid renderer math: ${error.message}`);
    }
  }

  const imageSlug = primaryImageSlugAliases.get(slug) ?? slug;
  const png = `public/images/dsa/${imageSlug}-dark.png`;
  const jpg = `public/images/dsa/${imageSlug}-dark.jpg`;
  const image = fs.existsSync(png) ? png : (fs.existsSync(jpg) ? jpg : undefined);
  if (!image && !slugsWithoutPrimaryVisual.has(slug)) {
    fail(`${relativePath} has no deterministic primary visual for slug ${slug}`);
  }
  if (image) primaryImageCount += 1;
  articles.push({
    slug,
    topic,
    title: h1[0][1].trim(),
    sourcePath: relativePath,
    markdown,
    image: image?.replace(/^public/, ''),
  });
}

const generatedSource = read('src/generated/articleContent.ts');
const generatedStart = generatedSource.indexOf('[', generatedSource.indexOf('export const CANONICAL_ARTICLES'));
const generatedEnd = generatedSource.lastIndexOf('];');
const generatedArticles = new Function(`return (${generatedSource.slice(generatedStart, generatedEnd + 1)})`)();
if (JSON.stringify(generatedArticles) !== JSON.stringify(articles.sort((a, b) => a.slug.localeCompare(b.slug)))) {
  fail('Generated canonical article index is stale or inconsistent');
}

const blogSource = read('src/config/blogData.ts');
const postsStart = blogSource.indexOf('export const BLOG_POSTS');
const postsArrayStart = blogSource.indexOf('[', blogSource.indexOf('=', postsStart));
const postsArrayEnd = blogSource.lastIndexOf('];');
const rawPosts = new Function(`return (${blogSource.slice(postsArrayStart, postsArrayEnd + 1)})`)();
const postBySlug = new Map(rawPosts.map((post) => [post.slug, post]));
for (const article of articles) {
  const post = postBySlug.get(article.slug);
  if (!post) fail(`Canonical article ${article.slug} has no production metadata`);
  if (!post.title || !post.tagline || !post.category) fail(`Canonical article ${article.slug} has incomplete SEO metadata`);
  if (post.markdown) fail(`Canonical article ${article.slug} is still duplicated inside blogData.ts`);
}

let roadmapSource = read('src/config/roadmapData.ts');
roadmapSource = roadmapSource.slice(roadmapSource.indexOf('export const ROADMAP_ZONES'))
  .replace(/:\s*RoadmapZone\[\]/g, '')
  .replace('export const ROADMAP_ZONES', 'const ROADMAP_ZONES');
const zones = new Function(`${roadmapSource}\nreturn ROADMAP_ZONES;`)()
  .filter((zone) => activeRoadmapZoneIds.has(zone.id));
const roadmapZoneIds = new Set(zones.map((zone) => zone.id));
for (const article of articles) {
  const roadmapZone = contentTopicZoneAliases.get(article.topic) ?? article.topic;
  if (!roadmapZoneIds.has(roadmapZone)) {
    fail(`${article.sourcePath} is not under an authoritative content topic folder`);
  }
}
const routeBySlug = new Map();
for (const zone of zones) {
  for (const topic of zone.topics) {
    for (const concept of topic.concepts) {
      for (const subtopic of concept.subtopics) {
        if (!slugs.has(subtopic.blogSlug) || routeBySlug.has(subtopic.blogSlug)) continue;
        routeBySlug.set(
          subtopic.blogSlug,
          `/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`,
        );
      }
    }
  }
}

const sitemap = read('public/sitemap.xml');
for (const article of articles) {
  const route = routeBySlug.get(article.slug);
  if (!route) fail(`Canonical article ${article.slug} has no production roadmap route`);
  if (!sitemap.includes(`<loc>https://algoglyph.com${route}</loc>`)) {
    fail(`Canonical article ${article.slug} is missing from the sitemap`);
  }
}

console.log(
  `Validated ${articles.length} canonical articles, ${routeBySlug.size} routes, ${primaryImageCount} primary images, and ${inlineSvgCount} inline SVG visuals.`,
);
