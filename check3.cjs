const fs = require('fs');
const data = fs.readFileSync('src/config/blogData.ts', 'utf8');
const idx = data.indexOf('slug: "ai-app-code-reviews"');
console.log(data.substring(idx-100, idx+200));
