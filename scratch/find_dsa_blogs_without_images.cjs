const fs = require('fs');
const path = require('path');

// 1. Read all files in public/images/dsa
const imagesDir = './public/images/dsa';
const dsaImageFiles = fs.readdirSync(imagesDir);

console.log(`Total image files in public/images/dsa: ${dsaImageFiles.length}`);

// Get base names of images (removing -dark.jpg, -dark.png, -light.jpg, -light.png, .jpg, .png)
const availableImageSlugs = new Set();
dsaImageFiles.forEach(f => {
  const base = f
    .replace(/-dark\.(jpg|png)$/i, '')
    .replace(/-light\.(jpg|png)$/i, '')
    .replace(/\.(jpg|png)$/i, '');
  availableImageSlugs.add(base);
});

// 2. Collect all 171 DSA/CS blogs from blogData.ts and deBlogData.ts
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

const dsaBlogs = [];

for (let i = 1; i < postBlocks.length; i++) {
  const block = postBlocks[i];
  const slugMatch = block.match(/^\s*"([^"]+)"/);
  const catMatch = block.match(/"category":\s*"([^"]+)"/);
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);

  if (slugMatch && catMatch) {
    const slug = slugMatch[1];
    const category = catMatch[1];
    const title = titleMatch ? titleMatch[1] : slug;

    if (dsaCsCategories.has(category)) {
      // Check if markdown contains an image tag
      const hasMarkdownImageTag = /!\[.*?\]\(\/images\/dsa\/.*?\)/i.test(block);

      // Check if image file exists in public/images/dsa
      const hasImageFile = availableImageSlugs.has(slug);

      dsaBlogs.push({
        slug,
        title,
        category,
        hasMarkdownImageTag,
        hasImageFile
      });
    }
  }
}

console.log(`Total DSA & CS Blogs analyzed: ${dsaBlogs.length}`);

const blogsWithoutImageTag = dsaBlogs.filter(b => !b.hasMarkdownImageTag);
const blogsWithoutImageFile = dsaBlogs.filter(b => !b.hasImageFile);
const blogsWithoutAnyImage = dsaBlogs.filter(b => !b.hasMarkdownImageTag && !b.hasImageFile);

console.log(`\n========================================================`);
console.log(`1. Blogs WITHOUT an image tag in Markdown (${blogsWithoutImageTag.length}):`);
blogsWithoutImageTag.forEach((b, idx) => {
  console.log(`${idx + 1}. [${b.category}] ${b.title} (slug: '${b.slug}') - File on disk? ${b.hasImageFile ? 'YES' : 'NO'}`);
});

console.log(`\n========================================================`);
console.log(`2. Blogs WITHOUT an image file in public/images/dsa (${blogsWithoutImageFile.length}):`);
blogsWithoutImageFile.forEach((b, idx) => {
  console.log(`${idx + 1}. [${b.category}] ${b.title} (slug: '${b.slug}')`);
});
