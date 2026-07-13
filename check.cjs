const fs = require('fs');
const data = fs.readFileSync('src/config/blogData.ts', 'utf8');

const phase1Slugs = [
  'ai-app-code-reviews', 'ai-app-refactoring', 'ai-app-docs', 'ai-app-streaming',
  'ai-app-structured-outputs', 'prompt-techniques', 'agent-architecture'
];

for (const slug of phase1Slugs) {
  if (data.indexOf('slug: "' + slug + '"') === -1) {
    console.log('MISSING:', slug);
  } else {
    console.log('FOUND:', slug);
  }
}
