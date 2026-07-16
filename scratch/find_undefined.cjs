const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const content = fs.readFileSync(blogDataPath, 'utf8');

// Let's find occurrences of "undefined" in the file
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('undefined')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});

// Also check if there is an empty object or trailing commas leading to undefined elements.
// Let's check if there is a double comma or a comma at the end of the array.
// For example: , , or , \n , or , \n ];
const commaCommaRegex = /,\s*,/g;
let m;
while ((m = commaCommaRegex.exec(content)) !== null) {
  console.log(`Double comma found at index ${m.index}: ${content.substring(m.index - 50, m.index + 50)}`);
}
