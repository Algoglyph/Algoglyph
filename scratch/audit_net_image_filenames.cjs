const path = require('path');
const fs = require('fs');

const { ROADMAP_ZONES } = require(path.join(__dirname, '../src/config/roadmapData.ts'));

const netZone = ROADMAP_ZONES.find(z => 
  z.name.toLowerCase().includes('network') || 
  z.id.toLowerCase().includes('network')
);

const imgDir = path.join(__dirname, '../public/images/dsa');
const existingFiles = new Set(fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : []);

const rows = [];

(netZone.topics || []).forEach(topic => {
  (topic.concepts || []).forEach(concept => {
    (concept.subtopics || []).forEach(sub => {
      const slug = sub.blogSlug;
      if (!slug) return;

      const darkName = `${slug}-dark.png`;
      const lightName = `${slug}-light.png`;

      const hasDark = existingFiles.has(darkName);
      const hasLight = existingFiles.has(lightName);

      rows.push({
        slug,
        title: sub.name,
        darkName,
        lightName,
        hasDark,
        hasLight,
        status: (hasDark && hasLight) ? '✅ Present' : '❌ Needs Image File'
      });
    });
  });
});

console.log('Total Network Articles:', rows.length);
console.log('Existing Image Files Count:', rows.filter(r => r.hasDark || r.hasLight).length);

// Generate Markdown Table
console.log('\n### Complete Network Engineering Image Mapping Table\n');
console.log('| # | Article Title | Slug | Dark Image Filename | Light Image Filename | Status |');
console.log('|---|---|---|---|---|---|');
rows.forEach((r, i) => {
  console.log(`| ${i + 1} | ${r.title} | \`${r.slug}\` | \`${r.darkName}\` | \`${r.lightName}\` | ${r.status} |`);
});
