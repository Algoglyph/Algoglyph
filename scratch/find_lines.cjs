const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const content = fs.readFileSync(blogDataPath, 'utf8');

const lines = content.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('"slug": "gitlab-hosting"')) {
    console.log(`Line ${idx + 1}: ${line}`);
    // Print 10 lines after it
    for (let k = 1; k <= 10; k++) {
      console.log(`  + ${k}: ${lines[idx + k]}`);
    }
  }
});
