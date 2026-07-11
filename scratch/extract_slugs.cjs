const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const data = fs.readFileSync(blogDataPath, 'utf8');

// Extract all slugs
const slugMatches = [...data.matchAll(/"slug": "([^"]+)"/g)];
const slugs = slugMatches.map(m => m[1]);

// Extract all categories alongside their slugs
const categoryMatches = [...data.matchAll(/"category": "([^"]+)"/g)];
const categories = categoryMatches.map(m => m[1]);

// Pair them up - they appear in order
const posts = slugs.map((slug, i) => ({ slug, category: categories[i] || 'Unknown' }));

// Group by category
const grouped = {};
for (const post of posts) {
  if (!grouped[post.category]) grouped[post.category] = [];
  grouped[post.category].push(post.slug);
}

// Print summary
console.log(`\nTotal posts: ${posts.length}\n`);
for (const [cat, slugList] of Object.entries(grouped)) {
  console.log(`[${cat}] — ${slugList.length} articles`);
}

// Write full list
fs.writeFileSync(path.join(__dirname, 'all_slugs_by_category.json'), JSON.stringify(grouped, null, 2));
console.log('\nWritten to all_slugs_by_category.json');
