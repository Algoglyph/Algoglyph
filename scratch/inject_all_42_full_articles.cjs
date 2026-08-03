const fs = require('fs');

const deBlogPath = './src/config/deBlogData.ts';
let deContent = fs.readFileSync(deBlogPath, 'utf8');

const articlesData = JSON.parse(fs.readFileSync('./scratch/all_42_full_articles.json', 'utf8'));

function escapeTemplateLiteral(str) {
  // Escape backslash, backtick, and template string interpolation ($) safely for JS/TS template strings
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
}

let updatedCount = 0;
let addedCount = 0;

for (const [slug, rawMarkdown] of Object.entries(articlesData)) {
  const escapedMd = escapeTemplateLiteral(rawMarkdown);
  const keyPattern = `'${slug}':`;

  const keyIndex = deContent.indexOf(keyPattern);
  if (keyIndex !== -1) {
    // Find the starting backtick
    const startBacktick = deContent.indexOf('`', keyIndex);
    
    // Find the unescaped closing backtick
    let endBacktick = -1;
    let isEscaped = false;

    for (let i = startBacktick + 1; i < deContent.length; i++) {
      if (deContent[i] === '\\') {
        isEscaped = !isEscaped;
      } else if (deContent[i] === '`' && !isEscaped) {
        endBacktick = i;
        break;
      } else {
        isEscaped = false;
      }
    }

    if (startBacktick !== -1 && endBacktick !== -1) {
      deContent = deContent.slice(0, startBacktick + 1) + '\n' + escapedMd + '\n' + deContent.slice(endBacktick);
      updatedCount++;
    }
  } else {
    // Key doesn't exist, append before closing brace of deBlogData
    const lastBrace = deContent.lastIndexOf('};');
    if (lastBrace !== -1) {
      const newEntry = `\n  '${slug}': \`${escapedMd}\`,\n`;
      deContent = deContent.slice(0, lastBrace) + newEntry + deContent.slice(lastBrace);
      addedCount++;
    }
  }
}

fs.writeFileSync(deBlogPath, deContent, 'utf8');
console.log(`Successfully injected ALL 42 full articles into deBlogData.ts! (${updatedCount} updated, ${addedCount} added)`);
