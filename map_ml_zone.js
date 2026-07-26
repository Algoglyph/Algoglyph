const fs = require('fs');

const tsCode = fs.readFileSync('src/config/roadmapData.ts', 'utf8');

// Strip out imports and types so we can eval the data structure
const cleanCode = tsCode
  .replace(/import .*/g, '')
  .replace(/export interface .*?\{[^}]*\}/gs, '')
  .replace(/export type .*?;/g, '')
  .replace(/export const ROADMAP_ZONES: RoadmapZone\[\] =/, 'const ROADMAP_ZONES =')
  .replace(/: [A-Za-z]+\[\]/g, '') // remove type annotations on arrays
  .replace(/RoadmapZone\[\]/g, '')
  .replace(/<[^>]+>/g, '') // remove generics
  + '\nconsole.log(JSON.stringify(ROADMAP_ZONES.find(z => z.id === "machine-learning"), null, 2));';

try {
    const mlZoneStr = require('child_process').execSync('node -e "' + cleanCode.replace(/"/g, '\\"') + '"', { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
    const mlZone = JSON.parse(mlZoneStr);
    
    let plan = `# ${mlZone.name} article plan\n\n`;
    plan += `Zone id: \`${mlZone.id}\` · Backing file: \`src/config/blogData.ts\` (\`BlogPost[]\`)\n`;
    plan += `Audited: 2026-07-20\n\n`;
    
    let total = 0;
    let body = "";
    
    for (const topic of mlZone.topics) {
        body += `## ${topic.name} (\`${topic.id}\`)\n\n`;
        for (const concept of topic.concepts) {
            body += `### ${concept.name} (\`${concept.id}\`)\n`;
            for (const subtopic of concept.subtopics) {
                total++;
                body += `- [ ] \`${subtopic.blogSlug}\` — ${subtopic.name} — **missing**\n`;
                body += `      /roadmap/${mlZone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}\n`;
            }
            body += "\n";
        }
    }
    
    plan += `**Status counts**: 0 real · 0 thin/templated · ${total} missing (of ${total} total)\n\n`;
    plan += body;
    
    fs.writeFileSync('.agents/plans/machine-learning-article-plan.md', plan);
    console.log("Plan created at .agents/plans/machine-learning-article-plan.md with " + total + " subtopics.");
} catch (e) {
    console.error("Failed to parse", e);
}
