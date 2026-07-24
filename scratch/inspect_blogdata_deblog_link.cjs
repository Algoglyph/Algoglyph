const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

const pos = blogDataRaw.indexOf('deBlogData');
if (pos !== -1) {
  console.log("=== deBlogData usage in blogData.ts ===");
  console.log(blogDataRaw.slice(pos - 100, pos + 500));
} else {
  console.log("deBlogData is NOT referenced in blogData.ts!");
}
