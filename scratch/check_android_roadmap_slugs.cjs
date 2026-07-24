const fs = require('fs');
const path = require('path');

const roadmapDataPath = path.join(__dirname, '../src/config/roadmapData.ts');
const content = fs.readFileSync(roadmapDataPath, 'utf8');

// Search for Android section or blogSlugs
const androidSlugsInFile = [];
const regex = /blogSlug:\s*'([^']+)'/g;
let match;
while ((match = regex.exec(content)) !== null) {
  androidSlugsInFile.push(match[1]);
}

console.log(`Found ${androidSlugsInFile.length} total blogSlugs in roadmapData.ts`);
