const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
let content = fs.readFileSync(blogDataPath, 'utf8');

// To parse without being affected by quotes inside the markdown property,
// let's strip the "markdown": "..." property using a parser or regex.
// Since the markdown values are JSON-stringified string literals, we can replace them.
// Let's use a regex that matches "markdown": "..." where the string is double-quoted and contains escaped quotes.
// A simple way to do this is to replace `"markdown":\s*"([^"\\]|\\.)*",?` with empty string.
content = content.replace(/"markdown":\s*"([^"\\]|\\.)*",?/g, '');

// Now we can match slug, category, and title from the stripped text!
const slugMatches = [...content.matchAll(/"slug":\s*"([^"]+)"/g)];
const categoryMatches = [...content.matchAll(/"category":\s*"([^"]+)"/g)];
const titleMatches = [...content.matchAll(/"title":\s*"([^"]+)"/g)];

console.log(`Slugs count: ${slugMatches.length}`);
console.log(`Categories count: ${categoryMatches.length}`);
console.log(`Titles count: ${titleMatches.length}`);

// Let's do a precise object-based extraction since the properties are in the same object block.
// A block starts with { and ends with } (ignoring nested structures if any).
// Since we stripped markdown, each blog post object is very simple and has no nested structures except practiceProblems.
// Let's find each `{ ... }` block in the array.
// But first let's locate `export const BLOG_POSTS: BlogPost[] = [`
const startArr = content.indexOf('export const BLOG_POSTS');
const arrayContent = content.substring(startArr);

// Split by objects. Each object in BLOG_POSTS has a "slug".
// Let's find all indexes of "slug":
const posts = [];
const slugRegex = /"slug":\s*"([^"]+)"/g;
let match;
while ((match = slugRegex.exec(arrayContent)) !== null) {
  const slug = match[1];
  const startIndex = match.index;
  // find the closing } of this post object. It should be before the next "slug":
  // We can find the next "slug" index or end of string
  const nextSlugMatch = slugRegex.exec(arrayContent);
  const endIndex = nextSlugMatch ? nextSlugMatch.index : arrayContent.length;
  // reset regex index to the correct position so we don't skip
  slugRegex.lastIndex = startIndex + match[0].length;
  
  const block = arrayContent.substring(startIndex, endIndex);
  
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);
  const categoryMatch = block.match(/"category":\s*"([^"]+)"/);
  
  posts.push({
    slug,
    title: titleMatch ? titleMatch[1] : 'Unknown',
    category: categoryMatch ? categoryMatch[1] : 'Unknown'
  });
}

console.log(`\nSuccessfully parsed ${posts.length} posts.`);

// Save to JSON
fs.writeFileSync(path.join(__dirname, 'all_real_posts.json'), JSON.stringify(posts, null, 2));

// Print unique categories and their counts
const catCounts = {};
for (const p of posts) {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
}
console.log('\n=== Real Categories and Counts ===');
console.log(catCounts);
