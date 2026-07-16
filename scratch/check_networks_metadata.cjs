const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const content = fs.readFileSync(blogDataPath, 'utf8');

// We want to extract the BlogPost structures that have category "Computer Networks".
// Let's write a script that parses blogData.ts and extracts the posts with category "Computer Networks".
// Since BLOG_POSTS is a large array, we can use a script that searches for category "Computer Networks"
// and prints the slug, title and category of those posts.

const slugMatches = [...content.matchAll(/"slug":\s*"([^"]+)"/g)];
const categoryMatches = [...content.matchAll(/"category":\s*"([^"]+)"/g)];
const titleMatches = [...content.matchAll(/"title":\s*"([^"]+)"/g)];

const posts = slugMatches.map((m, i) => ({
  slug: m[1],
  category: categoryMatches[i] ? categoryMatches[i][1] : 'Unknown',
  title: titleMatches[i] ? titleMatches[i][1] : 'Unknown'
}));

const filtered = posts.filter(p => p.category === 'Computer Networks');
console.log(`Found ${filtered.length} posts under category "Computer Networks":`);
filtered.forEach((p, i) => {
  console.log(`${i+1}. ${p.slug} - ${p.title}`);
});
