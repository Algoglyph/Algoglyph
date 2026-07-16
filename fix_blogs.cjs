const fs = require('fs');
let data = fs.readFileSync('src/config/blogData.ts', 'utf8');

const slugsToFix = [
  'ai-app-docs', 'ai-app-streaming', 'ai-app-structured-outputs', 'prompt-techniques', 'agent-architecture',
  'mcp-protocol', 'agent-skills', 'agent-roadmap', 'provider-gemini', 'provider-openai', 'provider-anthropic'
];

let changedCount = 0;
for (const slug of slugsToFix) {
  const idx = data.indexOf('slug: "' + slug + '"');
  if (idx !== -1) {
    const nextContentIdx = data.indexOf('content: `', idx);
    if (nextContentIdx !== -1 && nextContentIdx < idx + 500) {
      data = data.substring(0, nextContentIdx) + 'markdown: `' + data.substring(nextContentIdx + 10);
      changedCount++;
    }
  }
}

fs.writeFileSync('src/config/blogData.ts', data, 'utf8');
console.log('Fixed ' + changedCount + ' entries in blogData.ts');
