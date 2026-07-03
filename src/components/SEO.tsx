import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { BLOG_POSTS } from '../config/blogData';
import { ROADMAP_ZONES } from '../config/roadmapData';

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
  image = '/favicon.png'
}) => {
  const location = useLocation();
  const pathname = location.pathname;

  const roadmapSegments = pathname.split('/').filter(Boolean);
  const isRoadmap = roadmapSegments[0] === 'roadmap';
  const activeSlug = isRoadmap && roadmapSegments.length === 5 ? roadmapSegments[4] : null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://algoglyph.com';
  const canonicalUrl = `${origin}${pathname}`;

  let title = 'AlgoGlyph | Learn Computer Science Visually';
  let description = 'AlgoGlyph is an interactive learning platform that links concept roadmaps, drawing canvases, compilers, and state visualizers.';
  let type: 'website' | 'article' = 'website';
  let jsonLd: any = null;

  if (pathname === '/workspace') {
    title = 'Workspace | AlgoGlyph';
    description = 'Algoglyph interactive split-pane workspace featuring an infinite canvas, compilers, and state visualizers.';
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
      const post = BLOG_POSTS.find((p) => p.slug === activeSlug);
      if (post) {
        title = `${post.title} | Computer Science Roadmap`;
        description = post.tagline || post.content.introduction.substring(0, 150);
        type = 'article';

        // JSON-LD structured data for article
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          'headline': title,
          'description': description,
          'url': `${origin}${pathname}`,
          'image': `${origin}/favicon.png`,
          'dateModified': '2026-07-01',
          'author': {
            '@type': 'Organization',
            'name': 'AlgoGlyph'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'AlgoGlyph',
            'logo': {
              '@type': 'ImageObject',
              'url': `${origin}/favicon.png`
            }
          }
        };
      } else {
        // Dynamic fallback titles
        const formattedTitle = activeSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        title = `${formattedTitle} | Computer Science Roadmap`;
        description = `Master the theoretical foundations, implementation constraints, and complexity analysis of ${formattedTitle}.`;
        type = 'article';
      }
    } else if (dynamicTitle) {
      title = `${dynamicTitle} | Computer Science Roadmap`;
      description = `Master ${dynamicTitle} and follow the structured curriculum to become a professional software engineer.`;
    } else {
      title = 'Computer Science Roadmap | AlgoGlyph';
      description = 'Navigate the visual curriculum roadmap of computer science concepts, data structures, and algorithms.';
    }
  } else if (pathname === '/privacy') {
    title = 'Privacy Policy | AlgoGlyph';
    description = 'Read the privacy policy of AlgoGlyph.';
  } else if (pathname === '/terms') {
    title = 'Terms of Service | AlgoGlyph';
    description = 'Read the terms of service of AlgoGlyph.';
  } else if (pathname !== '/') {
    // 404
    title = '404 Page Not Found | AlgoGlyph';
    description = 'The requested page was not found on AlgoGlyph.';
  }

  // Allow manual overrides if explicitly passed as props
  const finalTitle = overrideTitle || title;
  const finalDescription = overrideDescription || description;
  const finalType = overrideType || type;
  const imageUrl = image.startsWith('http') ? image : `${origin}${image}`;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={finalType} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Dynamic JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}

      {/* Google AdSense Auto Ads (Disabled on Workspace) */}
      {pathname !== '/workspace' && (
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3436896061379895" 
          crossOrigin="anonymous"
        />
      )}
    </Helmet>
  );
};
