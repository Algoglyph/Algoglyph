const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

const lastPos = blogDataRaw.lastIndexOf('export const BLOG_POSTS');
if (lastPos !== -1) {
  console.log("=== End of blogData.ts ===");
  console.log(blogDataRaw.slice(lastPos));
} else {
  console.log("export const BLOG_POSTS not found!");
}
