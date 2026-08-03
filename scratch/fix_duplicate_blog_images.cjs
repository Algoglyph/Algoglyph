const fs = require('fs');

const blogPath = './src/config/blogData.ts';
let blogDataRaw = fs.readFileSync(blogPath, 'utf8');

// Regex to match image tags right after # Title at the start of markdown
// e.g. "markdown": "# Title\n\n![...](/images/...)\n\n
const dupImageRegex = /("markdown":\s*"#\s+[^\n]+?\\n\\n)!\[.*?\]\(\/images\/[^\)]+\\n\\n/g;

let count = 0;
const cleanBlogData = blogDataRaw.replace(dupImageRegex, (match, titleGroup) => {
  count++;
  return titleGroup;
});

console.log(`Removed duplicate top image tags from ${count} markdown posts in blogData.ts!`);

fs.writeFileSync(blogPath, cleanBlogData, 'utf8');
