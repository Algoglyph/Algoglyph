import fs from 'node:fs';

const errors = [];
const requiredStaticRoutes = ['/', '/about', '/workspace', '/roadmap', '/privacy', '/terms'];
const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const robots = fs.readFileSync('public/robots.txt', 'utf8');
const contentScope = JSON.parse(fs.readFileSync('src/config/contentScope.json', 'utf8'));
const activeRoadmapZoneIds = new Set(contentScope.activeRoadmapZoneIds);
const generatedSource = fs.readFileSync('src/generated/articleContent.ts', 'utf8');
const generatedStart = generatedSource.indexOf('[', generatedSource.indexOf('export const CANONICAL_ARTICLES'));
const generatedEnd = generatedSource.lastIndexOf('];');
const activeArticles = new Function(`return (${generatedSource.slice(generatedStart, generatedEnd + 1)})`)();
const activeArticleBySlug = new Map(activeArticles.map((article) => [article.slug, article]));
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueUrls = new Set(urls);

if (urls.length !== uniqueUrls.size) errors.push('Sitemap contains duplicate URLs.');
const articleUrls = urls.filter((url) => new URL(url).pathname.split('/').filter(Boolean).length === 5);
if (articleUrls.length !== activeArticles.length) {
  errors.push(`Sitemap contains ${articleUrls.length} article URLs for ${activeArticles.length} active articles.`);
}
for (const url of urls) {
  const pathname = new URL(url).pathname;
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'roadmap' && parts[1] && !activeRoadmapZoneIds.has(parts[1])) {
    errors.push(`Sitemap exposes inactive roadmap zone: ${parts[1]}.`);
  }
}
if (!robots.includes('Sitemap: https://algoglyph.com/sitemap.xml')) errors.push('robots.txt does not advertise the canonical sitemap.');
for (const route of requiredStaticRoutes) {
  if (!uniqueUrls.has(`https://algoglyph.com${route}`)) errors.push(`Sitemap is missing ${route}.`);
}
if ([...uniqueUrls].some((url) => /\/$/.test(url) && url !== 'https://algoglyph.com/')) errors.push('Sitemap contains inconsistent trailing slashes.');

if (fs.existsSync('dist')) {
  const builtEntries = ['index.html', 'about/index.html', 'workspace.html', 'roadmap.html', 'privacy/index.html', 'terms/index.html', '404.html'];
  const canonicals = new Map();
  for (const file of builtEntries) {
    const target = `dist/${file}`;
    if (!fs.existsSync(target)) {
      errors.push(`Missing built entry ${file}.`);
      continue;
    }
    const html = fs.readFileSync(target, 'utf8');
  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
    if (file !== '404.html' && !canonical) errors.push(`${file} has no canonical URL.`);
    if (canonical) {
      if (canonicals.has(canonical)) errors.push(`${file} duplicates canonical ${canonical} from ${canonicals.get(canonical)}.`);
      canonicals.set(canonical, file);
    }
    if (file !== '404.html' && !/<meta\s+name="description"/i.test(html)) errors.push(`${file} has no meta description.`);
  }

  const representative = urls.find((url) => url.split('/').length >= 9);
  if (representative) {
    const routePath = new URL(representative).pathname;
    const target = `dist${routePath}/index.html`;
    if (!fs.existsSync(target)) errors.push(`Representative article was not statically generated: ${routePath}`);
    else {
      const html = fs.readFileSync(target, 'utf8');
      if (!html.includes('data-seo-fallback')) errors.push('Static article lacks crawlable fallback content.');
      if (!html.includes('application/ld+json')) errors.push('Static article lacks JSON-LD.');
      if (!html.includes(`href="https://algoglyph.com${routePath}"`)) errors.push('Static article canonical is incorrect.');
    }
  }

  const sitemapCanonicals = new Map();
  for (const url of urls) {
    const routePath = new URL(url).pathname;
    let target;
    if (routePath === '/') target = 'dist/index.html';
    else if (routePath === '/workspace' || routePath === '/roadmap') target = `dist${routePath}.html`;
    else target = `dist${routePath}/index.html`;
    if (!fs.existsSync(target)) {
      errors.push(`Indexable route has no static HTML: ${routePath}`);
      continue;
    }
    const html = fs.readFileSync(target, 'utf8');
    const routeParts = routePath.split('/').filter(Boolean);
    const activeArticle = routeParts.length === 5 ? activeArticleBySlug.get(routeParts[4]) : undefined;
    const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
    if (canonical !== url) errors.push(`${routePath} canonical does not match its sitemap URL.`);
    if (canonical && sitemapCanonicals.has(canonical)) {
      errors.push(`${routePath} duplicates the canonical used by ${sitemapCanonicals.get(canonical)}.`);
    }
    if (canonical) sitemapCanonicals.set(canonical, routePath);
    if (!/<h1(?:\s|>)/i.test(html) && routePath.startsWith('/roadmap/')) errors.push(`${routePath} has no crawlable H1.`);
    if (activeArticle) {
      const requiredMeta = [
        ['description', /<meta\s+name="description"\s+content="[^"]+"/i],
        ['index robots', /<meta\s+name="robots"\s+content="index,[^"]+"/i],
        ['Open Graph title', /<meta\s+property="og:title"\s+content="[^"]+"/i],
        ['Open Graph description', /<meta\s+property="og:description"\s+content="[^"]+"/i],
        ['Open Graph article type', /<meta\s+property="og:type"\s+content="article"/i],
        ['Twitter title', /<meta\s+name="twitter:title"\s+content="[^"]+"/i],
        ['Twitter description', /<meta\s+name="twitter:description"\s+content="[^"]+"/i],
      ];
      for (const [label, pattern] of requiredMeta) {
        if (!pattern.test(html)) errors.push(`${routePath} lacks ${label} metadata.`);
      }
      if (!html.includes(`<meta property="og:url" content="${url}"`)) errors.push(`${routePath} has incorrect Open Graph URL.`);
      if (activeArticle.image) {
        const expectedImage = `https://algoglyph.com${activeArticle.image}`;
        if (!html.includes(`<meta property="og:image" content="${expectedImage}"`)) errors.push(`${routePath} has incorrect Open Graph image.`);
        if (!html.includes(`<meta name="twitter:image" content="${expectedImage}"`)) errors.push(`${routePath} has incorrect Twitter image.`);
      }
    }
    let hasTechArticleSchema = false;
    for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
      try {
        const schemas = JSON.parse(match[1]);
        const entries = Array.isArray(schemas) ? schemas : [schemas];
        if (entries.some((schema) => schema?.['@type'] === 'TechArticle')) hasTechArticleSchema = true;
      } catch {
        errors.push(`${routePath} contains invalid JSON-LD.`);
      }
    }
    if (activeArticle && !hasTechArticleSchema) errors.push(`${routePath} lacks TechArticle structured data.`);
    for (const match of html.matchAll(/<a[^>]+href="(\/[^"]*)"/g)) {
      const internalPath = match[1].split(/[?#]/)[0].replace(/\/$/, '') || '/';
      if (!uniqueUrls.has(`https://algoglyph.com${internalPath}`)) {
        errors.push(`${routePath} links to non-indexable or unknown route ${internalPath}.`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`SEO validation passed for ${urls.length} unique sitemap URLs and all representative built entries.`);
}
