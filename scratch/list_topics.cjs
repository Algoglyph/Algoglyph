const fs = require('fs');
const path = require('path');

const roadmapDataPath = path.join(__dirname, '../src/config/roadmapData.ts');
const content = fs.readFileSync(roadmapDataPath, 'utf8');

// We want to find the zones and their topics/concepts.
// Let's write a parser that parses the typescript.
// Or we can just print the exact zone index in the array by regex matching the whole array structure.
// Let's search for "Network Engineering" in roadmapData.ts and print the zone object.

const zoneIdx = content.indexOf('Network Engineering');
if (zoneIdx === -1) {
  console.log('Network Engineering zone not found');
  process.exit(1);
}

// Print lines around the zone
const startPos = content.lastIndexOf('{', zoneIdx);
// Let's read the next 5000 characters from startPos
const sub = content.substring(startPos, startPos + 10000);
console.log(sub);
