const fs = require('fs');
const data = fs.readFileSync('src/config/blogData.ts', 'utf8');

function findBlog(slug) {
  const re = new RegExp(`slug:\\s*['"]${slug}['"]`);
  const match = data.match(re);
  if (match) {
    const idx = match.index;
    console.log('FOUND:', slug);
    console.log(data.substring(idx - 50, idx + 200));
  } else {
    console.log('MISSING:', slug);
  }
}

findBlog('ai-app-code-reviews');
findBlog('ai-app-refactoring');
findBlog('ai-app-docs');
