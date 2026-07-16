const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
let content = fs.readFileSync(blogDataPath, 'utf8');

// Strip markdown property
content = content.replace(/"markdown":\s*"([^"\\]|\\.)*",?/g, '');

const slugRegex = /"slug":\s*"([^"]+)"/g;
const posts = [];
let match;
while ((match = slugRegex.exec(content)) !== null) {
  const slug = match[1];
  const startIndex = match.index;
  const nextSlugMatch = slugRegex.exec(content);
  const endIndex = nextSlugMatch ? nextSlugMatch.index : content.length;
  slugRegex.lastIndex = startIndex + match[0].length;
  
  const block = content.substring(startIndex, endIndex);
  const categoryMatch = block.match(/"category":\s*"([^"]+)"/);
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);
  
  if (categoryMatch && categoryMatch[1] === 'Backend') {
    posts.push({
      slug,
      title: titleMatch ? titleMatch[1] : 'Unknown'
    });
  }
}

console.log(`Found ${posts.length} entries under category "Backend" (without deduplication):`);
posts.forEach((p, i) => {
  console.log(`${i+1}. ${p.slug} - ${p.title}`);
});
