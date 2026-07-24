const fs = require('fs');
const path = require('path');

const roadmapDataContent = fs.readFileSync(path.join(__dirname, '../src/config/roadmapData.ts'), 'utf8');

// Extract all subtopics from System Design zone in roadmapData.ts
const sysDesignStart = roadmapDataContent.indexOf("id: 'system-design'");
const sysDesignSub = roadmapDataContent.substring(sysDesignStart, sysDesignStart + 15000);

const subtopicMatches = sysDesignSub.matchAll(/{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*blogSlug:\s*'([^']+)'\s*}/g);

const topics = [];
for (const m of subtopicMatches) {
  topics.push({
    id: m[1],
    name: m[2],
    slug: m[3]
  });
}

console.log(`TOTAL SYSTEM DESIGN SLUGS: ${topics.length}\n`);

let output = `# System Design & Distributed Systems Image Mapping List (${topics.length} Articles)\n\n`;
output += `Directory: \`public/images/system-design/\`\n\n`;
output += `| # | Article Title | Slug | Dark Image Filename | Light Image Filename |\n`;
output += `|---|---|---|---|---|\n`;

topics.forEach((t, idx) => {
  output += `| ${idx + 1} | ${t.name} | \`${t.slug}\` | \`${t.slug}-dark.png\` | \`${t.slug}-light.png\` |\n`;
});

fs.writeFileSync(path.join(__dirname, 'system_design_images_list.md'), output);
console.log('Saved to scratch/system_design_images_list.md');
