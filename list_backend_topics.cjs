const fs = require('fs');

const data = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');

// Find the backend section
const backendSecStart = data.indexOf("id: 'backend',");
const nextSecStart = data.indexOf("id: 'network-engineering',");
const backendData = data.substring(backendSecStart, nextSecStart);

// Regex to capture { id: '...', name: '...', blogSlug: '...' }
const re = /\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*blogSlug:\s*['"]([^'"]+)['"]\s*\}/g;
let m;
const subtopics = [];
const seen = new Set();
while ((m = re.exec(backendData)) !== null) {
  const id = m[1];
  const name = m[2];
  const slug = m[3];
  if (!seen.has(slug)) {
    seen.add(slug);
    subtopics.push({ id, name, slug });
  }
}

console.log('Total Backend Subtopics:', subtopics.length);
subtopics.forEach((t, i) => {
  console.log(`${i + 1}. ${t.name} (slug: \`${t.slug}\`)`);
});
