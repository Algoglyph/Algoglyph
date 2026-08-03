const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../public/images/system-design');

// Check for typo renaming sql-vs-nosql-dar.png -> sql-vs-nosql-dark.png
const typoFile = path.join(imgDir, 'sql-vs-nosql-dar.png');
const correctFile = path.join(imgDir, 'sql-vs-nosql-dark.png');
if (fs.existsSync(typoFile)) {
  fs.renameSync(typoFile, correctFile);
  console.log('Renamed sql-vs-nosql-dar.png to sql-vs-nosql-dark.png');
}

const roadmapDataContent = fs.readFileSync(path.join(__dirname, '../src/config/roadmapData.ts'), 'utf8');
const sysDesignStart = roadmapDataContent.indexOf("id: 'system-design'");
const sysDesignSub = roadmapDataContent.substring(sysDesignStart, sysDesignStart + 15000);
const subtopicMatches = sysDesignSub.matchAll(/{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*blogSlug:\s*'([^']+)'\s*}/g);

const topics = [];
for (const m of subtopicMatches) {
  topics.push(m[3]);
}

const existingFiles = fs.readdirSync(imgDir);

console.log(`Auditing System Design Images (${existingFiles.length} files found)...`);

let missingCount = 0;
let foundCount = 0;

topics.forEach(slug => {
  const darkImg = `${slug}-dark.png`;
  const plainImg = `${slug}.png`;
  if (existingFiles.includes(darkImg) || existingFiles.includes(plainImg)) {
    foundCount++;
  } else {
    console.log(`❌ MISSING IMAGE FOR SLUG: ${slug}`);
    missingCount++;
  }
});

console.log(`\nRESULTS:`);
console.log(`- Total System Design Slugs: ${topics.length}`);
console.log(`- Images Found: ${foundCount}`);
console.log(`- Images Missing: ${missingCount}`);
