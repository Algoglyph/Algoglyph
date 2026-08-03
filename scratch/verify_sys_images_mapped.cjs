const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../public/images/system-design');
const existingFiles = fs.readdirSync(imgDir);

const roadmapDataContent = fs.readFileSync(path.join(__dirname, '../src/config/roadmapData.ts'), 'utf8');
const sysDesignStart = roadmapDataContent.indexOf("id: 'system-design'");
const sysDesignSub = roadmapDataContent.substring(sysDesignStart, sysDesignStart + 15000);
const subtopicMatches = sysDesignSub.matchAll(/{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*blogSlug:\s*'([^']+)'\s*}/g);

const topics = [];
for (const m of subtopicMatches) {
  topics.push(m[3]);
}

console.log("=================================================");
console.log("VERIFYING SYSTEM DESIGN IMAGE MAPPINGS");
console.log("=================================================");

let valid = 0;
topics.forEach(slug => {
  const darkImg = `${slug}-dark.png`;
  if (existingFiles.includes(darkImg)) {
    valid++;
  } else {
    console.log(`NOTE: ${darkImg} not found on disk yet.`);
  }
});

console.log(`\nRESULTS: ${valid} / ${topics.length} System Design images verified & mapped in public/images/system-design/`);
