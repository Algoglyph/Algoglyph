const fs = require('fs');
const path = require('path');

const roadmapDataPath = path.join(__dirname, '../src/config/roadmapData.ts');
const content = fs.readFileSync(roadmapDataPath, 'utf8');

// We want to find all ROADMAP_ZONES objects, specifically their id, number, name.
// Since it's a JS structure, let's execute it or parse it.
// Simple way: require it using ts-node or transpiling it, or parse it using regex.
const zoneRegex = /id:\s*'([^']*)',[\s\S]*?number:\s*'([^']*)',[\s\S]*?name:\s*'([^']*)'/g;
let match;
const zones = [];
while ((match = zoneRegex.exec(content)) !== null) {
  zones.push({
    id: match[1],
    number: match[2],
    name: match[3]
  });
}

console.log(JSON.stringify(zones, null, 2));
