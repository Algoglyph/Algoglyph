const fs = require('fs');

const deBlogPath = './src/config/deBlogData.ts';
let deContent = fs.readFileSync(deBlogPath, 'utf8');

function escapeTemplateLiteral(str) {
  // Escape backticks and template string interpolations (${...}) safely for JS/TS
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
}

let totalUpdated = 0;

for (let batchNum = 1; batchNum <= 6; batchNum++) {
  const batchData = JSON.parse(fs.readFileSync(`./scratch/b${batchNum}_data.json`, 'utf8'));

  for (const [slug, rawMarkdown] of Object.entries(batchData)) {
    const escapedMd = escapeTemplateLiteral(rawMarkdown);
    const keyPattern = `'${slug}':`;

    const keyIndex = deContent.indexOf(keyPattern);
    if (keyIndex !== -1) {
      // Find the start backtick
      const startBacktick = deContent.indexOf('`', keyIndex);
      // Find the closing backtick
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
        totalUpdated++;
      }
    } else {
      // Key doesn't exist, insert before closing brace of deBlogData
      const lastBrace = deContent.rfind ? deContent.rfind('};') : deContent.lastIndexOf('};');
      const newEntry = `\n  '${slug}': \`${escapedMd}\`,\n`;
      deContent = deContent.slice(0, lastBrace) + newEntry + deContent.slice(lastBrace);
      totalUpdated++;
    }
  }
}

fs.writeFileSync(deBlogPath, deContent, 'utf8');
console.log(`Successfully injected ${totalUpdated} backend articles into deBlogData.ts cleanly!`);
