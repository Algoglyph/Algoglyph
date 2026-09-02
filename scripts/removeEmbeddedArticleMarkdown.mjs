import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const rootDir = process.cwd();
const blogDataPath = path.join(rootDir, 'src', 'config', 'blogData.ts');
const requestedSlugs = new Set(process.argv.slice(2));

if (requestedSlugs.size === 0) {
  console.error('Usage: node scripts/removeEmbeddedArticleMarkdown.mjs <slug> [...]');
  process.exit(1);
}

const source = fs.readFileSync(blogDataPath, 'utf8');
const sourceFile = ts.createSourceFile(
  blogDataPath,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);

function propertyName(property) {
  const name = property.name;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return null;
}

function stringValue(initializer) {
  if (
    ts.isStringLiteral(initializer) ||
    ts.isNoSubstitutionTemplateLiteral(initializer)
  ) {
    return initializer.text;
  }
  return null;
}

let postsArray = null;

function findPostsArray(node) {
  if (
    ts.isVariableDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    node.name.text === 'BLOG_POSTS' &&
    node.initializer &&
    ts.isArrayLiteralExpression(node.initializer)
  ) {
    postsArray = node.initializer;
    return;
  }
  ts.forEachChild(node, findPostsArray);
}

findPostsArray(sourceFile);

if (!postsArray) {
  console.error('Could not locate the BLOG_POSTS array in src/config/blogData.ts');
  process.exit(1);
}

const removals = [];
const found = new Set();

for (const element of postsArray.elements) {
  if (!ts.isObjectLiteralExpression(element)) continue;

  const slugProperty = element.properties.find(
    (property) => ts.isPropertyAssignment(property) && propertyName(property) === 'slug',
  );
  if (!slugProperty || !ts.isPropertyAssignment(slugProperty)) continue;

  const slug = stringValue(slugProperty.initializer);
  if (!slug || !requestedSlugs.has(slug)) continue;

  found.add(slug);
  const markdownProperty = element.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) && propertyName(property) === 'markdown',
  );

  if (!markdownProperty) continue;

  let end = markdownProperty.getEnd();
  while (end < source.length && /[ \t]/.test(source[end])) end += 1;
  if (source[end] === ',') end += 1;

  removals.push({
    start: markdownProperty.getFullStart(),
    end,
    slug,
  });
}

const missing = [...requestedSlugs].filter((slug) => !found.has(slug));
if (missing.length > 0) {
  console.error(`Unknown BLOG_POSTS slug(s): ${missing.join(', ')}`);
  process.exit(1);
}

if (removals.length === 0) {
  console.log('The requested article bodies were already absent from blogData.ts.');
  process.exit(0);
}

let updated = source;
for (const removal of removals.sort((a, b) => b.start - a.start)) {
  updated = updated.slice(0, removal.start) + updated.slice(removal.end);
}

fs.writeFileSync(blogDataPath, updated);
console.log(
  `Removed ${removals.length} embedded article body/bodies: ${removals
    .map(({ slug }) => slug)
    .sort()
    .join(', ')}`,
);
