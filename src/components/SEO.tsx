import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { ROADMAP_ZONES } from '../config/roadmapData';
import {
  DEFAULT_LAST_MODIFIED,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebsiteSchema,
  canonicalPath,
  findPostBySlug,
  getArticleRouteByPath,
} from '../lib/seoRoutes';

interface SEOProps {
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  image?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title: overrideTitle,
  description: overrideDescription,
  type: overrideType,
  image = DEFAULT_OG_IMAGE,
}) => {
  const location = useLocation();
  const pathname = canonicalPath(location.pathname);

  const roadmapSegments = pathname.split('/').filter(Boolean);
  const isRoadmap = roadmapSegments[0] === 'roadmap';
  const activeSlug = isRoadmap && roadmapSegments.length === 5 ? roadmapSegments[4] : null;

  const canonicalUrl = absoluteUrl(pathname);

  let title = 'AlgoGlyph | Visual Computer Science Workspace';
  let description = 'AlgoGlyph combines a visual computer science roadmap, interactive algorithm visualizers, coding sandboxes, notes, and canvas-based study tools.';
  let type: 'website' | 'article' = 'website';
  const jsonLd: unknown[] = [
    buildOrganizationSchema(),
    buildWebsiteSchema(),
    buildBreadcrumbSchema(pathname),
  ];

  if (pathname === '/workspace') {
    title = 'Visual DSA Notes, Coding Sandbox & Algorithm Visualizer | AlgoGlyph';
    description = 'Create interactive DSA notes on an infinite canvas, run code in a sandbox, and use step-by-step algorithm visualizers while studying computer science.';
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AlgoGlyph Workspace',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, Windows, macOS',
      url: canonicalUrl,
      image: `${SITE_URL}/og-image.png`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      publisher: { '@id': `${SITE_URL}/#organization` },
      description,
    });
  } else if (isRoadmap) {
    let dynamicTitle = '';
    const moduleId = roadmapSegments[1];
    const topicId = roadmapSegments[2];
    const conceptId = roadmapSegments[3];

    const moduleObj = ROADMAP_ZONES.find((m) => m.id === moduleId);
    if (moduleObj) {
      dynamicTitle = moduleObj.name;
      if (topicId) {
        const topicObj = moduleObj.topics.find((t) => t.id === topicId);
        if (topicObj) {
          dynamicTitle = topicObj.name;
          if (conceptId) {
            const conceptObj = topicObj.concepts.find((c) => c.id === conceptId);
            if (conceptObj) {
              dynamicTitle = conceptObj.name;
            }
          }
        }
      }
    }

    if (activeSlug) {
      const route = getArticleRouteByPath(pathname);
      const post = route?.post || findPostBySlug(activeSlug);
      if (post) {
        title = `${post.title} | AlgoGlyph Computer Science Roadmap`;
        description = post.tagline || (post as any).excerpt || (post as any).description || post.content?.introduction?.substring(0, 150) || '';
        type = 'article';

        jsonLd.push({
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          '@id': `${canonicalUrl}#article`,
          headline: post.title,
          description,
          url: canonicalUrl,
          mainEntityOfPage: canonicalUrl,
          image: `${SITE_URL}/og-image.png`,
          dateModified: post.lastUpdated || DEFAULT_LAST_MODIFIED,
          datePublished: post.lastUpdated || DEFAULT_LAST_MODIFIED,
          articleSection: post.category,
          keywords: [post.category, post.title, ...(post.prerequisites || []), ...(post.related || [])].filter(Boolean),
          about: route
            ? [
                { '@type': 'Thing', name: route.zone.name },
                { '@type': 'Thing', name: route.topic.name },
                { '@type': 'Thing', name: route.concept.name },
              ]
            : [{ '@type': 'Thing', name: post.category }],
          author: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
          },
          publisher: { '@id': `${SITE_URL}/#organization` },
          isAccessibleForFree: true,
        });

        if (post.content?.interviewQuestions?.length) {
          jsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.content?.interviewQuestions.slice(0, 8).map((question) => ({
              '@type': 'Question',
              name: question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Study the ${post.title} guide on AlgoGlyph for the concept explanation, implementation constraints, complexity trade-offs, and common pitfalls that answer this interview question.`,
              },
            })),
          });
        }
      } else {
        const formattedTitle = activeSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        title = `${formattedTitle} | AlgoGlyph Computer Science Roadmap`;
        description = `Master the theoretical foundations, implementation constraints, examples, and complexity analysis of ${formattedTitle}.`;
        type = 'article';
      }
    } else if (dynamicTitle) {
      title = `${dynamicTitle} | AlgoGlyph Computer Science Roadmap`;
      description = `Study ${dynamicTitle} through a structured visual computer science curriculum with topic maps, subtopics, and connected theory articles.`;
    } else {
      title = 'Computer Science Roadmap | AlgoGlyph';
      description = 'Navigate a visual computer science roadmap covering data structures, algorithms, system design, machine learning, backend engineering, and theory.';
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'AlgoGlyph Computer Science Roadmap',
        url: canonicalUrl,
        itemListElement: ROADMAP_ZONES.map((zone, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: zone.name,
          url: absoluteUrl(`/roadmap/${zone.id}`),
        })),
      });
    }
  } else if (pathname === '/privacy') {
    title = 'Privacy Policy | AlgoGlyph';
    description = 'Read how AlgoGlyph handles privacy, local-first workspace data, analytics, notes, and coding workspace security.';
  } else if (pathname === '/terms') {
    title = 'Terms of Service | AlgoGlyph';
    description = 'Read the terms of service and conditions for using the AlgoGlyph workspace, applications, and learning tools.';
  } else if (pathname !== '/') {
    title = '404 Page Not Found | AlgoGlyph';
    description = 'The requested page was not found on AlgoGlyph.';
  }

  const finalTitle = overrideTitle || title;
  const finalDescription = overrideDescription || description;
  const finalType = overrideType || type;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const shouldIndex = pathname !== '/404' && !pathname.startsWith('/404');

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="robots" content={shouldIndex ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'} />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="theme-color" content="#0a0a0a" />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={finalType} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {type === 'article' && <meta property="article:modified_time" content={DEFAULT_LAST_MODIFIED} />}

      {jsonLd.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
