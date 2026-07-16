const fs = require('fs');

const filePath = './src/config/blogData.ts';
let fileContent = fs.readFileSync(filePath, 'utf8');

const batchPosts = JSON.parse(fs.readFileSync('./batch1_part1.json', 'utf8'));

const closingIndex = fileContent.lastIndexOf('];');
if (closingIndex === -1) {
  console.error("Could not find the closing array marker ]; in blogData.ts!");
  process.exit(1);
}

const postsStr = batchPosts.map(post => {
  return '  ' + JSON.stringify(post, null, 2).replace(/\n/g, '\n  ') + ',';
}).join('\n');

const newContent = fileContent.substring(0, closingIndex) + '\n' + postsStr + '\n' + fileContent.substring(closingIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully appended Batch 1, Part 1 entries to blogData.ts!');
