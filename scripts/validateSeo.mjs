import fs from 'node:fs';

const errors = [];
const requiredStaticRoutes = ['/', '/about', '/workspace', '/roadmap', '/privacy', '/terms'];
const sitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
const robots = fs.readFileSync('public/robots.txt', 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const uniqueUrls = new Set(urls);

if (urls.length !== uniqueUrls.size) errors.push('Sitemap contains duplicate URLs.');
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
    const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];
    if (canonical !== url) errors.push(`${routePath} canonical does not match its sitemap URL.`);
    if (canonical && sitemapCanonicals.has(canonical)) {
      errors.push(`${routePath} duplicates the canonical used by ${sitemapCanonicals.get(canonical)}.`);
    }
    if (canonical) sitemapCanonicals.set(canonical, routePath);
    if (!/<h1(?:\s|>)/i.test(html) && routePath.startsWith('/roadmap/')) errors.push(`${routePath} has no crawlable H1.`);
    for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
      try {
        JSON.parse(match[1]);
      } catch {
        errors.push(`${routePath} contains invalid JSON-LD.`);
      }
    }
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
