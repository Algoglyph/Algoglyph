const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

// Parse all post objects from blogData.ts
const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

const all171Posts = [];

for (let i = 1; i < postBlocks.length; i++) {
  const block = postBlocks[i];
  const slugMatch = block.match(/^\s*"([^"]+)"/);
  const catMatch = block.match(/"category":\s*"([^"]+)"/);
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);
  
  // Check if markdown exists and is non-empty
  const mdMatch = block.match(/"markdown":\s*`([\s\S]*?)`/);
  const hasMarkdown = mdMatch && mdMatch[1].trim().length > 100;

  if (slugMatch && catMatch) {
    const slug = slugMatch[1];
    const cat = catMatch[1];
    const title = titleMatch ? titleMatch[1] : slug;

    if (dsaCsCategories.has(cat)) {
      all171Posts.push({
        slug,
        category: cat,
        title,
        hasMarkdown
      });
    }
  }
}

console.log(`Found Total ${all171Posts.length} blogs in the 5 DSA/CS categories!\n`);

// Group by category
const catGroups = {};
let totalDone = 0;
let totalLeft = 0;

all171Posts.forEach(p => {
  if (!catGroups[p.category]) catGroups[p.category] = [];
  catGroups[p.category].push(p);
  if (p.hasMarkdown) totalDone++;
  else totalLeft++;
});

Object.entries(catGroups).forEach(([cat, posts]) => {
  const done = posts.filter(p => p.hasMarkdown).length;
  const left = posts.length - done;
  console.log(`• **${cat}**: ${posts.length} total | ✅ Done: ${done} | ⏳ Left: ${left}`);
});

console.log(`\n======================================================`);
console.log(`TOTAL 171 DSA & THEORETICAL CS BLOGS SUMMARY`);
console.log(`======================================================`);
console.log(`📊 Total Blogs: ${all171Posts.length}`);
console.log(`✅ Written/Complete (Done): ${totalDone}`);
console.log(`⏳ Unwritten/Empty (Left):   ${totalLeft}`);
console.log(`======================================================\n`);

if (totalLeft > 0) {
  console.log("LIST OF UNWRITTEN / EMPTY SLUGS:");
  all171Posts.filter(p => !p.hasMarkdown).forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.category}] ${p.title} (slug: '${p.slug}')`);
  });
}
