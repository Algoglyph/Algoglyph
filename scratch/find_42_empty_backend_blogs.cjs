const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');

// Parse deBlogData dictionary keys
const deBlogMap = new Map();
const deMatches = deBlogRaw.matchAll(/'([a-zA-Z0-9\-_]+)'\s*:\s*`([\s\S]*?)`/g);
for (const m of deMatches) {
  deBlogMap.set(m[1], m[2].trim());
}

// Parse blogData.ts objects
const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const emptyOrShortBackendBlogs = [];

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
    let md = mdMatch ? mdMatch[1] : '';

    // Check if resolved from deBlogMap
    if (!md && deBlogMap.has(slug)) {
      md = deBlogMap.get(slug);
    }

    // Filter for Backend, System Design, Data Engineering, Software Engineering, Databases, Networks, OS
    const backendCategories = new Set([
      'Backend',
      'System Design',
      'Databases',
      'Networks',
      'Operating Systems',
      'Software Engineering',
      'Data Engineering',
      'Systems'
    ]);

    if (backendCategories.has(category)) {
      if (md.length < 500) {
        emptyOrShortBackendBlogs.push({
          slug,
          title,
          category,
          len: md.length,
          markdown: md
        });
      }
    }
  }
}

console.log(`Total empty or short backend blogs (< 500 chars): ${emptyOrShortBackendBlogs.length}\n`);

emptyOrShortBackendBlogs.forEach((b, idx) => {
  console.log(`${idx + 1}. [${b.category}] ${b.title} (slug: '${b.slug}') - ${b.len} chars`);
});
