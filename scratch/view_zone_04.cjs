const fs = require('fs');
const path = require('path');

const roadmapDataPath = path.join(__dirname, '../src/config/roadmapData.ts');
const content = fs.readFileSync(roadmapDataPath, 'utf8');

// Print the block of ROADMAP_ZONES[3] (index 3) which is Zone 04
// Let's search for "Network Engineering" and extract the next 500 lines.
const idx = content.indexOf('Network Engineering');
if (idx !== -1) {
  console.log(content.substring(idx - 100, idx + 4000));
} else {
  console.log('Not found');
}
