const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

// Match slug, title, category in BLOG_POSTS
const posts = [];
const postBlocks = blogDataRaw.split(/{\s*slug:/g);

for (let i = 1; i < postBlocks.length; i++) {
  const block = postBlocks[i];
  const slugMatch = block.match(/^\s*['"]([^'"]+)['"]/);
  const catMatch = block.match(/category:\s*['"]([^'"]+)['"]/);
  const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);

  if (slugMatch) {
    posts.push({
      slug: slugMatch[1],
      category: catMatch ? catMatch[1] : 'Unknown',
      title: titleMatch ? titleMatch[1] : 'Unknown'
    });
  }
}

console.log(`Total parsed posts in blogData.ts: ${posts.length}\n`);

const categoryCounts = {};
posts.forEach(p => {
  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
});

console.log('Categories in blogData.ts:');
Object.entries(categoryCounts).forEach(([cat, count]) => {
  console.log(`- "${cat}": ${count}`);
});
