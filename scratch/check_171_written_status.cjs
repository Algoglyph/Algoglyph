const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

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
  
  // In blogData.ts, markdown can be double-quoted or backtick-quoted
  const mdMatchDouble = block.match(/"markdown":\s*"([\s\S]*?)"\s*,\s*"\w+":/);
  const mdMatchBacktick = block.match(/"markdown":\s*`([\s\S]*?)`/);
  
  const hasMarkdown = (mdMatchDouble && mdMatchDouble[1].trim().length > 50) || 
                      (mdMatchBacktick && mdMatchBacktick[1].trim().length > 50);

  if (slugMatch && catMatch) {
    const slug = slugMatch[1];
    const cat = catMatch[1];
    const title = titleMatch ? titleMatch[1] : slug;

    if (dsaCsCategories.has(cat)) {
      all171Posts.push({
        slug,
        category: cat,
        title,
        hasMarkdown: Boolean(hasMarkdown)
      });
    }
  }
}

const catDone = {};
const catLeft = {};
const unwrittenList = [];

all171Posts.forEach(p => {
  if (!catDone[p.category]) {
    catDone[p.category] = 0;
    catLeft[p.category] = 0;
  }
  if (p.hasMarkdown) {
    catDone[p.category]++;
  } else {
    catLeft[p.category]++;
    unwrittenList.push(p);
  }
});

console.log(`================================================================`);
console.log(`       171 DSA & THEORETICAL CS BLOGS BREAKDOWN BY CATEGORY     `);
console.log(`================================================================\n`);

let totalDone = 0;
let totalLeft = 0;

Object.keys(catDone).forEach(cat => {
  const done = catDone[cat];
  const left = catLeft[cat];
  const total = done + left;
  totalDone += done;
  totalLeft += left;
  console.log(`• **${cat}**: Total ${total} | ✅ Done: ${done} | ⏳ Left: ${left}`);
});

console.log(`\n----------------------------------------------------------------`);
console.log(`📊 TOTAL BLOGS: ${all171Posts.length}`);
console.log(`✅ Written & Complete (Done): ${totalDone}`);
console.log(`⏳ Unwritten & Remaining (Left): ${totalLeft}`);
console.log(`----------------------------------------------------------------\n`);

if (unwrittenList.length > 0) {
  console.log(`UNWRITTEN / EMPTY BLOGS (${unwrittenList.length} total):\n`);
  unwrittenList.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.category}] ${p.title} (slug: '${p.slug}')`);
  });
} else {
  console.log(`🎉 ALL 171 BLOGS ARE FULLY WRITTEN WITH MARKDOWN CONTENT!`);
}
