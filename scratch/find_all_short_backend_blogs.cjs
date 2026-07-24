const fs = require('fs');

// Check blogData.ts
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const shortBlogDataList = [];

for (let i = 1; i < postBlocks.length; i++) {
  const block = postBlocks[i];
  const slugMatch = block.match(/^\s*"([^"]+)"/);
  const catMatch = block.match(/"category":\s*"([^"]+)"/);
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);
  const mdMatch = block.match(/"markdown":\s*"([\s\S]*?)"\s*,\s*"\w+":/);

  if (slugMatch && catMatch) {
    const slug = slugMatch[1];
    const category = catMatch[1];
    const title = titleMatch ? titleMatch[1] : slug;
    const md = mdMatch ? mdMatch[1] : '';

    // Check if markdown is short (< 800 chars)
    if (md.length < 800) {
      shortBlogDataList.push({ slug, title, category, len: md.length });
    }
  }
}

console.log(`Total short articles (< 800 chars) in blogData.ts: ${shortBlogDataList.length}\n`);

shortBlogDataList.forEach((item, idx) => {
  console.log(`${idx + 1}. [${item.category}] ${item.title} (slug: '${item.slug}') - ${item.len} chars`);
});
