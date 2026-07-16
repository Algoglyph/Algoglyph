const fs = require('fs');
const path = require('path');

const roadmapDataPath = path.join(__dirname, '../src/config/roadmapData.ts');
const content = fs.readFileSync(roadmapDataPath, 'utf8');

// Simple parser: find "id: '...', name: '...'" blocks that define zones.
// We can locate them by looking for the objects in ROADMAP_ZONES array.
// Let's print out lines matching 'name:' and 'number:' to see the zones.

const lines = content.split('\n');
let currentZone = null;
let currentTopic = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Check if zone start
  if (line.startsWith('id:') && i > 0 && lines[i-1].trim() === '{' && lines[i+1].trim().startsWith('number:')) {
    const id = line.match(/id:\s*'([^']*)'/)[1];
    const number = lines[i+1].match(/number:\s*'([^']*)'/)[1];
    const name = lines[i+2].match(/name:\s*'([^']*)'/)[1];
    console.log(`\nZone #${number}: ${name} (id: ${id})`);
  }
  // Check if topic start
  if (line.startsWith('id:') && line.includes('topic') || (line.startsWith('name:') && lines[i-1] && lines[i-1].trim().startsWith('id:'))) {
    // If it's inside a topic block
    const prev = lines[i-1].trim();
    if (prev.startsWith('id:')) {
      const idMatch = prev.match(/id:\s*'([^']*)'/);
      const nameMatch = line.match(/name:\s*'([^']*)'/);
      if (idMatch && nameMatch) {
        console.log(`  Topic: ${nameMatch[1]} (id: ${idMatch[1]})`);
      }
    }
  }
}
