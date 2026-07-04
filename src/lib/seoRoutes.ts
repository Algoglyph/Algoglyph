import { BLOG_POSTS } from '../config/blogData';
import type { BlogPost } from '../config/blogData';
import { ROADMAP_ZONES } from '../config/roadmapData';
import type { Concept, RoadmapZone, Subtopic, Topic } from '../config/roadmapData';

export const SITE_URL = 'https://algoglyph.com';
export const SITE_NAME = 'AlgoGlyph';
export const DEFAULT_OG_IMAGE = '/og-image.png';
export const DEFAULT_LAST_MODIFIED = '2026-07-03';

export interface RoadmapArticleRoute {
  zone: RoadmapZone;
  topic: Topic;
  concept: Concept;
  subtopic: Subtopic;
  post?: BlogPost;
  path: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export const stripTrailingSlash = (path: string) => {
  if (!path || path === '/') return '/';
  return path.replace(/\/+$/, '');
};

export const canonicalPath = (path: string) => {
  const cleanPath = stripTrailingSlash(path.split(/[?#]/)[0] || '/');
  if (cleanPath === '/blog') return '/roadmap';
  if (cleanPath.startsWith('/blog/')) {
    const slug = cleanPath.slice('/blog/'.length);
    return getArticleRouteBySlug(slug)?.path || '/roadmap';
  }
  const parts = cleanPath.split('/').filter(Boolean);
  if (parts[0] === 'roadmap' && parts.length === 5) {
    return getArticleRouteBySlug(parts[4])?.path || cleanPath;
  }
  return cleanPath;
};

export const absoluteUrl = (path: string) => `${SITE_URL}${canonicalPath(path) === '/' ? '/' : canonicalPath(path)}`;

export const getAllArticleRoutes = (): RoadmapArticleRoute[] => {
  const postsBySlug = new Map(BLOG_POSTS.map((post) => [post.slug, post]));
  return ROADMAP_ZONES.flatMap((zone) =>
    zone.topics.flatMap((topic) =>
      topic.concepts.flatMap((concept) =>
        concept.subtopics.map((subtopic) => ({
          zone,
          topic,
          concept,
          subtopic,
          post: postsBySlug.get(subtopic.blogSlug),
          path: `/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`,
        }))
      )
    )
  );
};

export const getArticleRouteBySlug = (slug: string) =>
  getAllArticleRoutes().find((route) => route.subtopic.blogSlug === slug || route.post?.slug === slug);

export const getArticleRouteByPath = (path: string) => {
  const cleanPath = canonicalPath(path);
  return getAllArticleRoutes().find((route) => route.path === cleanPath);
};

export const findPostBySlug = (slug: string) => {
  const cleanSlug = slug.toLowerCase();
  return BLOG_POSTS.find(
    (post) =>
      post.slug === cleanSlug ||
      post.slug === `${cleanSlug}s` ||
      post.slug === cleanSlug.slice(0, -1) ||
      post.slug.replace(/-/g, '') === cleanSlug.replace(/-/g, '')
  );
};

export const getRelatedArticleRoutes = (post: BlogPost, currentPath: string, limit = 6) => {
  const allRoutes = getAllArticleRoutes();
  const bySlug = new Map(allRoutes.map((route) => [route.subtopic.blogSlug, route]));
  const related = [
    ...(post.prerequisites || []),
    ...(post.related || []),
    post.prevTopic,
    post.nextTopic,
  ]
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => bySlug.get(slug) || getArticleRouteBySlug(slug))
    .filter((route): route is RoadmapArticleRoute => Boolean(route))
    .filter((route) => route.path !== currentPath);

  const seen = new Set<string>();
  return related.filter((route) => {
    if (seen.has(route.path)) return false;
    seen.add(route.path);
    return true;
  }).slice(0, limit);
};

export const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
  const cleanPath = canonicalPath(path);
  const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
  if (cleanPath === '/') return breadcrumbs;

  if (cleanPath === '/workspace') {
    return [...breadcrumbs, { name: 'Workspace', path: '/workspace' }];
  }

  if (cleanPath === '/privacy') return [...breadcrumbs, { name: 'Privacy Policy', path: '/privacy' }];
  if (cleanPath === '/terms') return [...breadcrumbs, { name: 'Terms of Service', path: '/terms' }];

  if (cleanPath.startsWith('/roadmap')) {
    breadcrumbs.push({ name: 'Computer Science Roadmap', path: '/roadmap' });
    const route = getArticleRouteByPath(cleanPath);
    if (route) {
      breadcrumbs.push(
        { name: route.zone.name, path: `/roadmap/${route.zone.id}` },
        { name: route.topic.name, path: `/roadmap/${route.zone.id}/${route.topic.id}` },
        { name: route.concept.name, path: `/roadmap/${route.zone.id}/${route.topic.id}/${route.concept.id}` },
        { name: route.post?.title || route.subtopic.name, path: route.path }
      );
      return breadcrumbs;
    }

    const parts = cleanPath.split('/').filter(Boolean);
    const zone = ROADMAP_ZONES.find((item) => item.id === parts[1]);
    if (!zone) return breadcrumbs;
    breadcrumbs.push({ name: zone.name, path: `/roadmap/${zone.id}` });
    const topic = zone.topics.find((item) => item.id === parts[2]);
    if (!topic) return breadcrumbs;
    breadcrumbs.push({ name: topic.name, path: `/roadmap/${zone.id}/${topic.id}` });
    const concept = topic.concepts.find((item) => item.id === parts[3]);
    if (concept) {
      breadcrumbs.push({ name: concept.name, path: `/roadmap/${zone.id}/${topic.id}/${concept.id}` });
    }
    return breadcrumbs;
  }

  return [...breadcrumbs, { name: 'Page Not Found', path: cleanPath }];
};

export const buildBreadcrumbSchema = (path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: getBreadcrumbs(path).map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const buildOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  sameAs: [SITE_URL],
});

export const buildWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/roadmap?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

