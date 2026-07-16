const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const content = fs.readFileSync(blogDataPath, 'utf8');

// Parse the file. We want to find objects inside the array:
// {
//   "slug": "...",
//   "title": "...",
//   ...
//   "category": "..."
// }
// Let's write a parser that scans for matches.
// We can use a simple regex for the whole object or just find slug and category line by line.

// Let's print the first 2000 characters of the BLOG_POSTS array starting from line 43.
console.log(content.substring(0, 3000));
