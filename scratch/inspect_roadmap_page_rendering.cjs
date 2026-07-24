const fs = require('fs');

const pageContent = fs.readFileSync('./src/components/RoadmapPage.tsx', 'utf8');

// Find activePost resolution and rendering
const startPos = pageContent.indexOf('activePost =');
console.log("=== Active Post Resolution in RoadmapPage.tsx ===");
console.log(pageContent.slice(startPos, startPos + 1500));
