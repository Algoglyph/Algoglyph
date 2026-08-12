# AlgoGlyph organic discovery audit

Last reviewed: 2026-08-13

## Scope

This audit covers the public homepage, About page, workspace entry, roadmap hierarchy, finished educational articles, privacy and terms pages, legacy blog routes, 404 behavior, metadata, JSON-LD, static HTML, sitemap generation, robots rules, internal linking, social previews, visual assets, and route-level bundle loading. Private workspace content is intentionally excluded from every crawl surface.

## Implemented findings

- Centralized the canonical AlgoGlyph name, URL, product description, logo, repository identity, locale, and share image metadata.
- Added a crawlable About page that explicitly answers what AlgoGlyph is, who it is for, what it covers, and how it differs.
- Replaced route inference inside the metadata component with explicit page-owned metadata and reusable schemas.
- Added stable Organization, WebSite, WebPage or TechArticle, BreadcrumbList, AboutPage, SoftwareApplication, ItemList, and visible-content-backed FAQ schema where applicable.
- Removed the inaccurate WebSite SearchAction because the roadmap query parameter did not expose a public server-side search result.
- Added visible breadcrumbs to roadmap pages and semantic prerequisite, related-concept, chapter, module, roadmap, About, and workspace links.
- Added direct question headings to structured articles and direct answers to the homepage FAQ.
- Made homepage CTAs and navigation real links while retaining the existing client navigation experience.
- Added useful static fallback HTML for the homepage, About page, roadmap, workspace, and every nested roadmap route.
- Generated route-specific title, description, canonical, Open Graph, Twitter, H1, introductory copy, internal links, and JSON-LD for deep roadmap URLs.
- Preserved unfinished syllabus pages for product navigation but marked their static route shells `noindex`; they are not submitted in the sitemap.
- Removed the catch-all roadmap rewrite so route-specific static HTML is served on a direct request.
- Changed `/blog` to a permanent redirect to the canonical `/roadmap` surface; legacy article slugs still resolve through the existing client redirect map.
- Rebuilt the sitemap from the curriculum and actual article sources, with source-derived `lastmod`, canonical de-duplication, and no priority/changefreq guesses.
- Added OAI-SearchBot access, kept the sitemap declared in robots.txt, and expanded `llms.txt` with the same factual product identity and public/private boundary.
- Added explicit image dimensions and descriptive alternative text for meaningful landing illustrations and social images.
- Moved roadmap data and workspace-only controls behind lazy route boundaries. The shared entry bundle fell from roughly 10.3 MB to roughly 97 KB in the production build; the large curriculum payload now loads only on roadmap routes.
- Added an automated SEO contract that validates every sitemap URL, corresponding static HTML, canonical uniqueness, crawlable H1s, internal route links, JSON-LD parsing, robots discovery, and representative public entries.

## Content quality findings

The roadmap contains a mixture of substantial Markdown articles, structured educational articles, customized machine-learning/data-engineering guides, and generic syllabus fallbacks. Generic fallbacks remain useful as an in-product curriculum outline, but they do not meet the standalone-value threshold for organic landing pages. The build now separates those two roles: finished resources are indexable; unfinished fallbacks are crawlable for navigation but `noindex` and absent from the sitemap.

Some older structured articles still use repetitive introductions even when their main Markdown body is useful. Static previews prefer the first meaningful Markdown paragraph, preventing that boilerplate from becoming the crawlable answer excerpt. Editorial improvement of the visible full article remains a content task, not something that should be mass-rewritten automatically.

## Remaining technical risks

- The roadmap route still carries a large curriculum/article payload after a visitor enters that route. It no longer affects homepage startup, but route-level data partitioning by module would further improve roadmap interaction and parse time.
- Vite emits large-chunk warnings for the roadmap, editor, visualization, and canvas feature bundles. These are product-performance concerns rather than homepage discovery blockers.
- The repository-wide lint command has pre-existing errors in generated/scratch content and unrelated application modules. The SEO-scoped lint run has no errors.
- Status-code and redirect behavior ultimately depends on the deployed Cloudflare Pages configuration. The generated files and `_redirects` rules are correct locally, but production should be checked after deployment.
- Search engines and answer systems decide when and whether to crawl, index, quote, or rank a page. These changes improve eligibility and clarity; they do not guarantee visibility.

## Manual work after deployment

1. Verify the domain properties in Google Search Console and Bing Webmaster Tools, submit `https://algoglyph.com/sitemap.xml`, and monitor excluded/duplicate/crawled-not-indexed reports.
2. Test representative live URLs with Google URL Inspection, Rich Results Test, Bing URL Inspection, and social-card debuggers. Confirm direct deep URLs return `200`, invalid routes return `404`, `/blog` returns `301`, and `algoglyph.pages.dev` retains `X-Robots-Tag: noindex`.
3. Configure Cloudflare bot/WAF rules so verified search crawlers and OAI-SearchBot can fetch public pages without challenges. Robots permission alone cannot override a WAF block.
4. Add verified official social profiles to `sameAs` only when those profiles exist and are controlled by AlgoGlyph.
5. Create a purpose-designed 1200×630 social image if a landscape share card is preferred. The current 1024×1024 image is accurately declared and valid, but not optimized for every feed crop.
6. Use Search Console, Bing Webmaster Tools, and privacy-respecting analytics to choose the next editorial upgrades. Prioritize pages with impressions and weak engagement instead of mass-generating new URLs.
7. Consider IndexNow after a deployment workflow exists; it should notify only changed canonical URLs and must not run from local builds.

