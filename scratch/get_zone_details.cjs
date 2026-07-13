const fs = require('fs');
const path = require('path');

const roadmapDataPath = path.join(__dirname, '../src/config/roadmapData.ts');
const content = fs.readFileSync(roadmapDataPath, 'utf8');

// We want to print all zone definitions in a clean format:
// { id: '...', number: '...', name: '...', topics: [...] }
// Let's run a node eval on it or parse it.
// The easiest way is to parse the file using simple block regex or load it.
// Since it is TypeScript, we can strip types and require it using a temporary file or VM.
// Let's write a quick script that strips type annotations and imports from roadmapData.ts
// so we can require it as JS.

let jsContent = content
  .replace(/import[\s\S]*?;/g, '')
  .replace(/export\s+interface[\s\S]*?}/g, '')
  .replace(/:\s*RoadmapZone\[\]/g, '')
  .replace(/export\s+const\s+ROADMAP_ZONES\s*=/g, 'module.exports =');

fs.writeFileSync(path.join(__dirname, 'roadmapData.cjs'), jsContent);
const ROADMAP_ZONES = require('./roadmapData.cjs');

console.log('Total zones loaded:', ROADMAP_ZONES.length);
ROADMAP_ZONES.forEach(z => {
  console.log(`\nZone #${z.number}: ${z.name} (id: ${z.id})`);
  console.log(`  Topics count: ${z.topics.length}`);
  z.topics.forEach(t => {
    let subtopicsCount = 0;
    t.concepts.forEach(c => {
      subtopicsCount += c.subtopics.length;
    });
    console.log(`    Topic: ${t.name} (id: ${t.id}) — Concepts: ${t.concepts.length}, Subtopics: ${subtopicsCount}`);
  });
});
