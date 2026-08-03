const fs = require('fs');

const dsaFiles = fs.readdirSync('./public/images/dsa');

const baseSlugs = new Set();
dsaFiles.forEach(f => {
  const base = f.replace(/-(dark|light)\.(jpg|png)$/i, '').replace(/\.(jpg|png)$/i, '').toLowerCase();
  baseSlugs.add(base);
});

console.log(`Collected ${baseSlugs.size} unique base image slugs from public/images/dsa`);

const ilPath = './src/components/RoadmapIllustration.tsx';
let ilContent = fs.readFileSync(ilPath, 'utf8');

const slugArrayStr = Array.from(baseSlugs).sort().map(s => `'${s}'`).join(',');

const dsaSetStart = ilContent.indexOf('const dsaSlugs = new Set([');
const dsaSetEnd = ilContent.indexOf(']);', dsaSetStart);

if (dsaSetStart !== -1 && dsaSetEnd !== -1) {
  ilContent = ilContent.slice(0, dsaSetStart) + `const dsaSlugs = new Set([\n    ${slugArrayStr}\n  ` + ilContent.slice(dsaSetEnd);
  fs.writeFileSync(ilPath, ilContent, 'utf8');
  console.log("Successfully updated dsaSlugs in RoadmapIllustration.tsx!");
} else {
  console.error("Could not find dsaSlugs set in RoadmapIllustration.tsx");
}
