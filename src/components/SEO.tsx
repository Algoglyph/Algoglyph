import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_IDENTITY } from '../config/siteIdentity';

export interface SeoBreadcrumb {
  name: string;
  path: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  index?: boolean;
  breadcrumbs?: SeoBreadcrumb[];
  schemas?: Record<string, unknown>[];
  datePublished?: string;
  dateModified?: string;
}

const cleanPath = (path: string) => {
  const withoutQuery = path.split(/[?#]/)[0] || '/';
  return withoutQuery === '/' ? '/' : withoutQuery.replace(/\/+$/, '');
};

const absoluteUrl = (path: string) => {
  const normalized = cleanPath(path);
  return `${SITE_IDENTITY.url}${normalized === '/' ? '/' : normalized}`;
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_IDENTITY.url}/#organization`,
  name: SITE_IDENTITY.name,
  url: `${SITE_IDENTITY.url}/`,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE_IDENTITY.url}/#logo`,
    url: `${SITE_IDENTITY.url}${SITE_IDENTITY.logoPath}`,
  },
  sameAs: [SITE_IDENTITY.githubUrl],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_IDENTITY.url}/#website`,
  name: SITE_IDENTITY.name,
  url: `${SITE_IDENTITY.url}/`,
  description: SITE_IDENTITY.description,
  inLanguage: SITE_IDENTITY.language,
  publisher: { '@id': `${SITE_IDENTITY.url}/#organization` },
};

export const SEO: React.FC<SEOProps> = ({
  title = 'AlgoGlyph | Visual Computer Science Workspace',
  description = SITE_IDENTITY.description,
  type = 'website',
  image = SITE_IDENTITY.defaultImagePath,
  imageAlt = 'AlgoGlyph visual computer science workspace',
  index = true,
  breadcrumbs = [{ name: 'Home', path: '/' }],
  schemas = [],
  datePublished,
  dateModified,
}) => {
  const location = useLocation();
  const pathname = cleanPath(location.pathname);
  const canonicalUrl = absoluteUrl(pathname);
  const imageUrl = image.startsWith('http') ? image : `${SITE_IDENTITY.url}${image}`;

  const pageSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'TechArticle' : 'WebPage',
    '@id': `${canonicalUrl}#${type === 'article' ? 'article' : 'webpage'}`,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: SITE_IDENTITY.language,
    isPartOf: { '@id': `${SITE_IDENTITY.url}/#website` },
    about: type === 'article' ? undefined : { '@id': `${SITE_IDENTITY.url}/#organization` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: SITE_IDENTITY.defaultImageWidth,
      height: SITE_IDENTITY.defaultImageHeight,
      caption: imageAlt,
    },
  };

  if (type === 'article') {
    pageSchema.headline = title.replace(/ \| AlgoGlyph.*$/, '');
    pageSchema.mainEntityOfPage = canonicalUrl;
    pageSchema.author = { '@id': `${SITE_IDENTITY.url}/#organization` };
    pageSchema.publisher = { '@id': `${SITE_IDENTITY.url}/#organization` };
    pageSchema.isAccessibleForFree = true;
    if (datePublished) pageSchema.datePublished = datePublished;
    if (dateModified) pageSchema.dateModified = dateModified;
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: breadcrumbs.map((item, indexValue) => ({
      '@type': 'ListItem',
      position: indexValue + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  const jsonLd = [organizationSchema, websiteSchema, pageSchema, breadcrumbSchema, ...schemas];

  return (
    <Helmet>
      <html lang={SITE_IDENTITY.language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={index ? 'index, follow, max-image-preview:large' : 'noindex, follow, max-image-preview:large'}
      />
      <meta name="author" content={SITE_IDENTITY.name} />
      <meta name="application-name" content={SITE_IDENTITY.name} />
      <meta name="theme-color" content="#0a0a0a" />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:width" content={String(SITE_IDENTITY.defaultImageWidth)} />
      <meta property="og:image:height" content={String(SITE_IDENTITY.defaultImageHeight)} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content={SITE_IDENTITY.name} />
      <meta property="og:locale" content={SITE_IDENTITY.locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {type === 'article' && datePublished && <meta property="article:published_time" content={datePublished} />}
      {type === 'article' && dateModified && <meta property="article:modified_time" content={dateModified} />}

      {jsonLd.map((schema, indexValue) => (
        <script key={`${pathname}-${indexValue}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
