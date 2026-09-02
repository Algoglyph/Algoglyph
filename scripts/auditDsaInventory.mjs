import fs from 'node:fs';
import path from 'node:path';

const DSA_ZONE_ID = 'dsa-foundations';
const DSA_CONTENT_DIRECTORY = 'dsa';
const STRICT = process.argv.includes('--strict');
const JSON_ONLY = process.argv.includes('--json');

const EXCLUDED_TOPICS = new Map([
  [
    'theoretical-cs-topic',
    'The roadmap and blog catalog explicitly classify this block as Theoretical Computer Science, not DSA.',
  ],
]);

const EXCLUDED_SLUGS = new Map([
  [
    'functions-basic-i-o',
    'Programming-language fundamentals are not a data-structure or algorithm article identity.',
  ],
  [
    'leetcode-platform',
    'LeetCode is a practice platform, not a DSA concept or algorithm article identity.',
  ],
  [
    'edabit-platform',
    'Edabit is a practice platform, not a DSA concept or algorithm article identity.',
  ],
]);

// Only merge entries that represent the same article identity. Similar-looking
// entries with materially different scope remain independent: tree-bfs/tree-dfs
// are tree traversals, while fenwick-trees and sparse-tables cover 2D variants.
const ARTICLE_ALIASES = new Map([
  ['bfs-traversal', 'bfs'],
  ['dfs-traversal', 'dfs'],
  ['dijkstra-algorithm', 'dijkstra'],
  ['a-search', 'a-star-algorithm'],
  ['floyd-warshall', 'floyd-warshall-algorithm'],
  ['skip-lists-complex', 'skip-lists'],
  ['tries', 'trie'],
  ['segment-trees', 'segment-tree'],
]);

const IMAGE_ALIASES = new Map([
  ['stack', 'lifo-stacks'],
  ['queue', 'fifo-queues'],
  ['linked-list', 'singly-linked-lists'],
  ['dijkstra', 'dijkstra'],
  ['a-star-algorithm', 'a-star-algorithm'],
  ['bellman-ford', 'bellman-ford-floyd-warshall'],
  ['floyd-warshall-algorithm', 'floyd-warshall-algorithm'],
  ['trie', 'trie'],
  ['segment-tree', 'segment-tree'],
  ['fenwick-tree', 'fenwick-tree'],
  ['sparse-table', 'sparse-table'],
  ['arrays', 'static-arrays'],
  ['heap', 'min-heaps'],
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

const collectMarkdownFiles = () => {
  const filesBySlug = new Map();
  const nestedDsaDirectories = [];
  if (!fs.existsSync('content')) return { filesBySlug, nestedDsaDirectories };

  for (const topic of fs.readdirSync('content', { withFileTypes: true })) {
    if (!topic.isDirectory()) continue;
    const topicPath = path.join('content', topic.name);
    for (const entry of fs.readdirSync(topicPath, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (topic.name === DSA_CONTENT_DIRECTORY) {
          nestedDsaDirectories.push(toPosix(path.join(topicPath, entry.name)));
        }
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      const slug = entry.name.slice(0, -3);
      const file = {
        slug,
        topic: topic.name,
        path: toPosix(path.join(topicPath, entry.name)),
      };
      const matches = filesBySlug.get(slug) ?? [];
      matches.push(file);
      filesBySlug.set(slug, matches);
    }
  }

  return { filesBySlug, nestedDsaDirectories };
};

const resolveImage = (slug) => {
  const imageSlug = IMAGE_ALIASES.get(slug) ?? slug;
  for (const extension of ['png', 'jpg', 'jpeg', 'webp']) {
    const candidate = path.join('public', 'images', 'dsa', `${imageSlug}-dark.${extension}`);
    if (fs.existsSync(candidate)) return `/${toPosix(path.relative('public', candidate))}`;
  }
  return null;
};

const zones = parseRoadmapZones();
const posts = parseBlogPosts();
const postBySlug = new Map(posts.map((post) => [post.slug, post]));
const zone = zones.find((candidate) => candidate.id === DSA_ZONE_ID);
if (!zone) throw new Error(`Missing authoritative roadmap zone: ${DSA_ZONE_ID}`);

const rawEntries = [];
for (const topic of zone.topics) {
  for (const concept of topic.concepts) {
    for (const subtopic of concept.subtopics) {
      rawEntries.push({
        title: subtopic.name,
        slug: subtopic.blogSlug,
        roadmapTopic: topic.id,
        roadmapTopicName: topic.name,
        concept: concept.id,
        conceptName: concept.name,
        publicRoute: `/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`,
      });
    }
  }
}

const rawBySlug = new Map(rawEntries.map((entry) => [entry.slug, entry]));
for (const [alias, canonical] of ARTICLE_ALIASES) {
  if (!rawBySlug.has(alias)) throw new Error(`Unknown DSA alias slug: ${alias}`);
  if (!rawBySlug.has(canonical)) throw new Error(`Unknown DSA canonical slug: ${canonical}`);
}
for (const slug of EXCLUDED_SLUGS.keys()) {
  if (!rawBySlug.has(slug)) throw new Error(`Unknown excluded DSA slug: ${slug}`);
}

const { filesBySlug, nestedDsaDirectories } = collectMarkdownFiles();
const excluded = [];
const aliases = [];
const inventoryBySlug = new Map();

for (const entry of rawEntries) {
  const post = postBySlug.get(entry.slug);
  const topicExclusion = EXCLUDED_TOPICS.get(entry.roadmapTopic);
  const slugExclusion = EXCLUDED_SLUGS.get(entry.slug);
  if (topicExclusion || slugExclusion) {
    excluded.push({
      ...entry,
      catalogCategory: post?.category ?? null,
      reason: topicExclusion ?? slugExclusion,
    });
    continue;
  }

  const canonicalSlug = ARTICLE_ALIASES.get(entry.slug) ?? entry.slug;
  if (canonicalSlug !== entry.slug) {
    aliases.push({
      aliasSlug: entry.slug,
      canonicalSlug,
      legacyPublicRoute: entry.publicRoute,
      reason: `Duplicate article identity; canonicalized to ${canonicalSlug}.`,
    });
    continue;
  }

  const currentFiles = filesBySlug.get(entry.slug) ?? [];
  const dsaFile = currentFiles.find((file) => file.topic === DSA_CONTENT_DIRECTORY);
  const aliasEntries = [...ARTICLE_ALIASES.entries()]
    .filter(([, target]) => target === entry.slug)
    .map(([alias]) => rawBySlug.get(alias));

  inventoryBySlug.set(entry.slug, {
    title: post?.title ?? entry.title,
    canonicalSlug: entry.slug,
    primaryTopic: 'DSA',
    publicRoute: entry.publicRoute,
    legacyAliasRoutes: aliasEntries.map((aliasEntry) => aliasEntry.publicRoute),
    currentContentPath: dsaFile?.path ?? currentFiles[0]?.path ?? null,
    canonicalArticleExists: Boolean(dsaFile),
    needsNewCanonicalArticle: !dsaFile,
    intendedImage: resolveImage(entry.slug),
    imageExists: Boolean(resolveImage(entry.slug)),
    sourceOfInventoryEvidence: [
      `roadmap:${zone.id}/${entry.roadmapTopic}/${entry.concept}/${entry.slug}`,
      `catalog-category:${post?.category ?? 'missing'}`,
    ],
  });
}

const inventory = [...inventoryBySlug.values()]
  .sort((left, right) => left.canonicalSlug.localeCompare(right.canonicalSlug));
const expectedSlugs = new Set(inventory.map((item) => item.canonicalSlug));
const dsaFiles = [...filesBySlug.values()]
  .flat()
  .filter((file) => file.topic === DSA_CONTENT_DIRECTORY);
const extraFiles = dsaFiles.filter((file) => !expectedSlugs.has(file.slug));
const duplicateCanonicalFiles = [...filesBySlug.entries()]
  .filter(([slug, files]) => expectedSlugs.has(slug) && files.length > 1)
  .map(([slug, files]) => ({ slug, files: files.map((file) => file.path) }));

const summary = {
  authoritativeRoadmapZone: DSA_ZONE_ID,
  rawRoadmapEntries: rawEntries.length,
  excludedNonDsaEntries: excluded.length,
  duplicateAliasEntries: aliases.length,
  authoritativeDsaArticles: inventory.length,
  canonicalDsaMarkdownFiles: dsaFiles.length,
  missingCanonicalDsaArticles: inventory.filter((item) => item.needsNewCanonicalArticle).length,
  extraCanonicalDsaFiles: extraFiles.length,
  duplicateCanonicalFiles: duplicateCanonicalFiles.length,
  nestedDsaDirectories: nestedDsaDirectories.length,
  articlesWithIntendedImages: inventory.filter((item) => item.imageExists).length,
  articlesWithoutMappedImages: inventory.filter((item) => !item.imageExists).length,
};

const report = { summary, inventory, aliases, excluded, extraFiles, duplicateCanonicalFiles, nestedDsaDirectories };

if (JSON_ONLY) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(JSON.stringify(summary, null, 2));
  console.log('\nCanonical DSA inventory:');
  for (const item of inventory) {
    console.log(`${item.canonicalSlug}\t${item.title}\t${item.publicRoute}\t${item.currentContentPath ?? 'MISSING'}`);
  }
  console.log('\nCanonicalized duplicate aliases:');
  for (const alias of aliases) {
    console.log(`${alias.aliasSlug} -> ${alias.canonicalSlug} (${alias.legacyPublicRoute})`);
  }
  console.log('\nExcluded non-DSA entries:');
  for (const item of excluded) {
    console.log(`${item.slug}\t${item.catalogCategory}\t${item.reason}`);
  }
}

if (STRICT && (
  summary.missingCanonicalDsaArticles > 0 ||
  summary.extraCanonicalDsaFiles > 0 ||
  summary.duplicateCanonicalFiles > 0 ||
  summary.nestedDsaDirectories > 0
)) {
  throw new Error('The canonical DSA Markdown corpus does not exactly match the authoritative DSA inventory.');
}
