import fs from 'node:fs';
import path from 'node:path';

const STRICT = process.argv.includes('--strict');
const CONTENT_ROOT = path.resolve('content');
const CONTENT_TOPIC_ZONE_ALIASES = new Map([
  ['dsa', 'dsa-foundations'],
]);

const read = (file) => fs.readFileSync(file, 'utf8');
const toPosix = (value) => value.split(path.sep).join('/');

const parseRoadmapZones = () => {
  let source = read('src/config/roadmapData.ts');
  source = source.slice(source.indexOf('export const ROADMAP_ZONES'))
    .replace(/:\s*RoadmapZone\[\]/g, '')
    .replace('export const ROADMAP_ZONES', 'const ROADMAP_ZONES');
  return new Function(`${source}\nreturn ROADMAP_ZONES;`)();
};

const parseBlogPosts = () => {
  const source = read('src/config/blogData.ts');
  const postsStart = source.indexOf('export const BLOG_POSTS');
  const arrayStart = source.indexOf('[', source.indexOf('=', postsStart));
  const arrayEnd = source.lastIndexOf('];');
  return new Function(`return (${source.slice(arrayStart, arrayEnd + 1)})`)();
};

const collectCanonicalFiles = () => {
  const files = [];
  const nestedDirectories = [];
  const topicDirectories = fs.existsSync(CONTENT_ROOT)
    ? fs.readdirSync(CONTENT_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  for (const topic of topicDirectories) {
    const topicPath = path.join(CONTENT_ROOT, topic.name);
    for (const entry of fs.readdirSync(topicPath, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        nestedDirectories.push(toPosix(path.join('content', topic.name, entry.name)));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push({
          slug: entry.name.slice(0, -3),
          topic: topic.name,
          path: toPosix(path.join('content', topic.name, entry.name)),
        });
      }
    }
  }

  return {
    topicDirectories: topicDirectories.map((entry) => entry.name),
    nestedDirectories,
    files: files.sort((a, b) => a.slug.localeCompare(b.slug)),
  };
};

const zones = parseRoadmapZones();
const posts = parseBlogPosts();
const postBySlug = new Map(posts.map((post) => [post.slug, post]));
const inventoryBySlug = new Map();
const duplicateRoutes = [];

for (const zone of zones) {
  for (const topic of zone.topics) {
    for (const concept of topic.concepts) {
      for (const subtopic of concept.subtopics) {
        if (!subtopic.blogSlug) continue;
        const route = `/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`;
        const item = {
          slug: subtopic.blogSlug,
          title: subtopic.name,
          topic: zone.id,
          roadmapTopic: topic.id,
          concept: concept.id,
          route,
          hasBlogMetadata: postBySlug.has(subtopic.blogSlug),
          hasExistingBlogBody: Boolean(postBySlug.get(subtopic.blogSlug)?.markdown?.trim()),
        };
        if (inventoryBySlug.has(subtopic.blogSlug)) {
          duplicateRoutes.push({ slug: subtopic.blogSlug, route });
        } else {
          inventoryBySlug.set(subtopic.blogSlug, item);
        }
      }
    }
  }
}

const canonical = collectCanonicalFiles();
const canonicalBySlug = new Map(canonical.files.map((file) => [file.slug, file]));
const zoneIds = new Set(zones.map((zone) => zone.id));
const missing = [...inventoryBySlug.values()]
  .filter((item) => !canonicalBySlug.has(item.slug))
  .sort((a, b) => a.slug.localeCompare(b.slug));
const extra = canonical.files
  .filter((file) => !inventoryBySlug.has(file.slug))
  .sort((a, b) => a.slug.localeCompare(b.slug));
const wrongTopic = canonical.files
  .filter((file) => !zoneIds.has(CONTENT_TOPIC_ZONE_ALIASES.get(file.topic) ?? file.topic))
  .sort((a, b) => a.slug.localeCompare(b.slug));
const topicCounts = new Map(zones.map((zone) => [zone.id, 0]));
for (const item of inventoryBySlug.values()) {
  topicCounts.set(item.topic, (topicCounts.get(item.topic) ?? 0) + 1);
}

const summary = {
  roadmapZones: zones.length,
  uniqueRoadmapArticleSlugs: inventoryBySlug.size,
  duplicateRoadmapRoutes: duplicateRoutes.length,
  blogPostRecords: posts.length,
  blogPostRecordsWithMarkdown: posts.filter((post) => post.markdown?.trim()).length,
  canonicalMarkdownFiles: canonical.files.length,
  canonicalTopicsPresent: canonical.topicDirectories,
  nestedContentDirectories: canonical.nestedDirectories.length,
  missingCanonicalFiles: missing.length,
  extraCanonicalFiles: extra.length,
  filesOutsideRoadmapZoneFolders: wrongTopic.length,
  roadmapTopicCounts: Object.fromEntries([...topicCounts.entries()]),
};

console.log(JSON.stringify(summary, null, 2));

if (missing.length > 0) {
  console.log('\nMissing canonical article files (first 50):');
  for (const item of missing.slice(0, 50)) {
    console.log(`${item.topic}/${item.slug}.md -> ${item.route}`);
  }
}

if (extra.length > 0) {
  console.log('\nCanonical files with no roadmap article entry:');
  for (const file of extra) console.log(file.path);
}

if (wrongTopic.length > 0) {
  console.log('\nCanonical files outside authoritative content topic folders:');
  for (const file of wrongTopic) console.log(file.path);
}

if (canonical.nestedDirectories.length > 0) {
  console.log('\nNested content directories:');
  for (const directory of canonical.nestedDirectories) console.log(directory);
}

if (STRICT && (
  missing.length > 0 ||
  extra.length > 0 ||
  wrongTopic.length > 0 ||
  canonical.nestedDirectories.length > 0
)) {
  throw new Error('Article inventory is incomplete or structurally invalid.');
}
