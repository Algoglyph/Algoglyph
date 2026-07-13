const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
let content = fs.readFileSync(blogDataPath, 'utf8');

// Replace any occurrence of two commas separated by optional spaces or newlines with a single comma.
// Specifically, let's look for "},\n\n  ,\n  {" or similar sequences.
// Let's replace ",\n\n  ," with ","
const modified = content.replace(/,\s*,/g, ',');

if (modified !== content) {
  fs.writeFileSync(blogDataPath, modified, 'utf8');
  console.log('Successfully fixed double comma in blogData.ts!');
} else {
  console.log('Double comma not found or not replaced.');
}
