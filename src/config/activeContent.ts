import contentScope from './contentScope.json';
import { CANONICAL_ARTICLES } from '../generated/articleContent';
import { BLOG_POSTS } from './blogData';
import { ROADMAP_ZONES } from './roadmapData';

const activeZoneIds = new Set(contentScope.activeRoadmapZoneIds);
const activeContentTopics = new Set(contentScope.activeContentTopics);
const activeArticleSlugs = new Set(
  CANONICAL_ARTICLES
    .filter((article) => activeContentTopics.has(article.topic))
    .map((article) => article.slug),
);

export const ACTIVE_ROADMAP_ZONES = ROADMAP_ZONES
  .filter((zone) => activeZoneIds.has(zone.id))
  .map((zone) => ({
    ...zone,
    topics: zone.topics
      .map((topic) => ({
        ...topic,
        concepts: topic.concepts
          .map((concept) => ({
            ...concept,
            subtopics: concept.subtopics.filter((subtopic) => activeArticleSlugs.has(subtopic.blogSlug)),
          }))
          .filter((concept) => concept.subtopics.length > 0),
      }))
      .filter((topic) => topic.concepts.length > 0),
  }));

const seenArticleSlugs = new Set<string>();
export const ACTIVE_BLOG_POSTS = BLOG_POSTS.filter((post) => {
  if (!activeArticleSlugs.has(post.slug) || seenArticleSlugs.has(post.slug)) return false;
  seenArticleSlugs.add(post.slug);
  return true;
});

export const isActiveRoadmapZone = (zoneId: string) => activeZoneIds.has(zoneId);
export const isActiveArticleSlug = (slug: string) => activeArticleSlugs.has(slug);
export const getActiveArticleImage = (slug: string) => (
  activeArticleSlugs.has(slug)
    ? CANONICAL_ARTICLES.find((article) => article.slug === slug)?.image
    : undefined
);
