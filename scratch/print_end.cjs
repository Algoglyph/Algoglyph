const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const content = fs.readFileSync(blogDataPath, 'utf8');

const lines = content.split('\n');
console.log('Last 100 lines:');
for (let i = lines.length - 100; i < lines.length; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
