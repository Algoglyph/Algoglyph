import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://algoglyph.com';
const roadmapShellPath = 'dist/roadmap.html';
if (!fs.existsSync(roadmapShellPath)) throw new Error('Build dist/roadmap.html before generating static SEO pages.');

const read = (file) => fs.readFileSync(file, 'utf8');
const roadmapSource = read('src/config/roadmapData.ts');
let evaluableRoadmap = roadmapSource.substring(roadmapSource.indexOf('export const ROADMAP_ZONES'));
evaluableRoadmap = evaluableRoadmap.replace(/:\s*RoadmapZone\[\]/g, '');
evaluableRoadmap = evaluableRoadmap.replace('export const ROADMAP_ZONES', 'const ROADMAP_ZONES');
const zones = new Function(`${evaluableRoadmap}\nreturn ROADMAP_ZONES;`)();

const evaluateAssignedValue = (source, marker) => {
  const start = source.indexOf(marker);
  if (start < 0) return undefined;
  const equals = source.indexOf('=', start);
  const end = source.lastIndexOf(';');
  return new Function(`return (${source.slice(equals + 1, end)})`)();
};

const posts = evaluateAssignedValue(read('src/config/blogData.ts'), 'export const BLOG_POSTS') || [];
const mlOverrides = evaluateAssignedValue(read('src/config/mlBlogData.ts'), 'export const ML_BLOG_DATA') || {};
const deMarkdown = evaluateAssignedValue(read('src/config/deBlogData.ts'), 'export const deBlogData') || {};
const postsBySlug = new Map();
for (const post of posts) {
  if (!postsBySlug.has(post.slug)) postsBySlug.set(post.slug, post);
}
const isFinishedArticle = (post) => {
  if (!post) return false;
  if (post.markdown) return true;
  const introduction = post.content?.introduction || '';
  return !introduction.includes('This comprehensive guide covers the core technical structures')
    && !introduction.includes('is a fundamental concept in the study of')
    && !introduction.includes('See the markdown content for the full article.');
};
const sitemap = read('public/sitemap.xml');
const indexablePaths = new Set(
  [...sitemap.matchAll(/<loc>https:\/\/algoglyph\.com([^<]*)<\/loc>/g)]
    .map((match) => match[1] || '/'),
);
const shell = read(roadmapShellPath);

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const plainText = (value) => String(value ?? '')
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[#*_`>[\](){}|]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const firstMarkdownParagraph = (markdown) => {
  const blocks = String(markdown || '').split(/\n\s*\n/);
  return plainText(blocks.find((block) => !/^\s*(#|---|<svg|```)/.test(block)) || '');
};

const replaceOrInsert = (html, pattern, replacement) => (
  pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`)
);

const renderLinks = (items) => items.length
  ? `<h2>Explore related topics</h2><ul>${items.map((item) => `<li><a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a></li>`).join('')}</ul>`
  : '';

const makePage = ({ routePath, canonicalPath = routePath, title, description, breadcrumbs, children = [], article = false, intro = '', index = true }) => {
  const canonical = `${SITE_URL}${canonicalPath}`;
  const fullTitle = article ? `${title} | AlgoGlyph Computer Science Roadmap` : `${title} | AlgoGlyph Computer Science Roadmap`;
  const cleanDescription = plainText(description).slice(0, 220);
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: `${SITE_URL}${item.path}`,
    })),
  };
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': article ? 'TechArticle' : 'CollectionPage',
    '@id': `${canonical}#${article ? 'article' : 'webpage'}`,
    url: canonical,
    name: fullTitle,
    headline: article ? title : undefined,
    description: cleanDescription,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    author: article ? { '@id': `${SITE_URL}/#organization` } : undefined,
    publisher: article ? { '@id': `${SITE_URL}/#organization` } : undefined,
  };
  const schemas = JSON.stringify([breadcrumbSchema, pageSchema]).replace(/</g, '\\u003c');
  const crumbHtml = breadcrumbs.map((item, index) => (
    `${index ? '<span aria-hidden="true"> / </span>' : ''}<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`
  )).join('');
  const fallback = `<main data-seo-fallback style="max-width:760px;margin:0 auto;padding:48px 24px;font:16px/1.65 system-ui,sans-serif;color:#e5e7eb;background:#050708"><nav aria-label="Breadcrumb">${crumbHtml}</nav><article><h1>${escapeHtml(title)}</h1><p>${escapeHtml(intro || cleanDescription)}</p>${renderLinks(children)}<p><a href="/workspace">Open the AlgoGlyph workspace</a></p></article></main>`;

  let html = shell.replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  html = replaceOrInsert(html, /<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  html = replaceOrInsert(html, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(cleanDescription)}" />`);
  html = replaceOrInsert(
    html,
    /<meta\s+name="robots"[^>]*>/i,
    `<meta name="robots" content="${index ? 'index' : 'noindex'}, follow, max-image-preview:large" />`,
  );
  html = replaceOrInsert(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+(?:data-rh="true"\s+)?property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsert(html, /<meta\s+(?:data-rh="true"\s+)?property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`);
  html = replaceOrInsert(html, /<meta\s+(?:data-rh="true"\s+)?property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(cleanDescription)}" />`);
  html = replaceOrInsert(html, /<meta\s+(?:data-rh="true"\s+)?name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`);
  html = replaceOrInsert(html, /<meta\s+(?:data-rh="true"\s+)?name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(cleanDescription)}" />`);
  html = html.replace('</head>', `    <script type="application/ld+json">${schemas}</script>\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  return html;
};

const writeRoute = (routePath, html) => {
  const target = path.join('dist', ...routePath.split('/').filter(Boolean), 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
};

let generated = 0;
const canonicalArticlePaths = new Map();
for (const zone of zones) {
  const zonePath = `/roadmap/${zone.id}`;
  if (indexablePaths.has(zonePath)) {
    writeRoute(zonePath, makePage({
      routePath: zonePath,
      title: zone.name,
      description: zone.description,
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Roadmap', path: '/roadmap' }, { name: zone.name, path: zonePath }],
      children: zone.topics.map((topic) => ({ name: topic.name, path: `${zonePath}/${topic.id}` })),
    }));
    generated += 1;
  }
  for (const topic of zone.topics) {
    const topicPath = `${zonePath}/${topic.id}`;
    if (indexablePaths.has(topicPath)) {
      writeRoute(topicPath, makePage({
        routePath: topicPath,
        title: topic.name,
        description: topic.description,
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Roadmap', path: '/roadmap' }, { name: zone.name, path: zonePath }, { name: topic.name, path: topicPath }],
        children: topic.concepts.map((concept) => ({ name: concept.name, path: `${topicPath}/${concept.id}` })),
      }));
      generated += 1;
    }
    for (const concept of topic.concepts) {
      const conceptPath = `${topicPath}/${concept.id}`;
      if (indexablePaths.has(conceptPath)) {
        writeRoute(conceptPath, makePage({
          routePath: conceptPath,
          title: concept.name,
          description: `Study ${concept.name} in the context of ${topic.name}. This chapter connects the concept to its component topics and related learning path.`,
          breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Roadmap', path: '/roadmap' }, { name: zone.name, path: zonePath }, { name: topic.name, path: topicPath }, { name: concept.name, path: conceptPath }],
          children: concept.subtopics.filter((item) => indexablePaths.has(`${conceptPath}/${item.blogSlug}`)).map((item) => ({ name: item.name, path: `${conceptPath}/${item.blogSlug}` })),
        }));
        generated += 1;
      }
      for (const subtopic of concept.subtopics) {
        const articlePath = `${conceptPath}/${subtopic.blogSlug}`;
        const canonicalArticlePath = canonicalArticlePaths.get(subtopic.blogSlug) || articlePath;
        const isDuplicatePath = canonicalArticlePaths.has(subtopic.blogSlug);
        if (!isDuplicatePath) canonicalArticlePaths.set(subtopic.blogSlug, articlePath);
        const isIndexable = indexablePaths.has(articlePath) && !isDuplicatePath;
        const candidatePost = postsBySlug.get(subtopic.blogSlug);
        const post = isFinishedArticle(candidatePost) ? candidatePost : undefined;
        const override = mlOverrides[subtopic.blogSlug];
        const markdown = deMarkdown[subtopic.blogSlug];
        const title = post?.title || override?.title || subtopic.name;
        const description = post?.tagline || override?.tagline || firstMarkdownParagraph(markdown) || `Learn ${subtopic.name} with definitions, mechanics, and connected computer science context.`;
        const intro = firstMarkdownParagraph(post?.markdown)
          || post?.content?.introduction
          || override?.content?.introduction
          || firstMarkdownParagraph(markdown)
          || description;
        writeRoute(articlePath, makePage({
          routePath: articlePath,
          canonicalPath: canonicalArticlePath,
          title,
          description,
          intro,
          article: true,
          index: isIndexable,
          breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Roadmap', path: '/roadmap' }, { name: zone.name, path: zonePath }, { name: topic.name, path: topicPath }, { name: concept.name, path: conceptPath }, { name: title, path: articlePath }],
          children: [{ name: concept.name, path: conceptPath }, { name: topic.name, path: topicPath }],
        }));
        generated += 1;
      }
    }
  }
}

console.log(`Generated ${generated} route-specific static roadmap HTML pages in dist/.`);
