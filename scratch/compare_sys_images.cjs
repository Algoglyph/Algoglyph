const fs = require('fs');
const path = require('path');

const roadmapDataContent = fs.readFileSync(path.join(__dirname, '../src/config/roadmapData.ts'), 'utf8');
const sysDesignStart = roadmapDataContent.indexOf("id: 'system-design'");
const sysDesignSub = roadmapDataContent.substring(sysDesignStart, sysDesignStart + 15000);
const subtopicMatches = sysDesignSub.matchAll(/{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*blogSlug:\s*'([^']+)'\s*}/g);

const expected = [];
for (const m of subtopicMatches) {
  expected.push(m[3]);
}

const imgDir = path.join(__dirname, '../public/images/system-design');
const files = fs.readdirSync(imgDir).map(f => f.replace('-dark.png', '').replace('.png', ''));

const missing = expected.filter(s => !files.includes(s));
const extra = files.filter(f => !expected.includes(f) && f !== 'README');

console.log('MISSING SLUGS:', missing);
console.log('EXTRA FILES:', extra);
