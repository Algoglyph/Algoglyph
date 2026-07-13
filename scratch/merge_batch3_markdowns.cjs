const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const artifactsDir = 'C:\\Users\\varun\\.gemini\\antigravity-ide\\brain\\8b01e16b-b576-446b-9b61-23ffe4132d99';

if (!fs.existsSync(blogDataPath)) {
  console.error("Could not find blogData.ts at", blogDataPath);
  process.exit(1);
}

let blogDataContent = fs.readFileSync(blogDataPath, 'utf8');

// Read all markdown files in artifactsDir
const files = fs.readdirSync(artifactsDir);
const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'walkthrough.md' && f !== 'implementation_plan.md' && f !== 'task.md');

console.log(`Found ${mdFiles.length} markdown files in artifacts directory.`);

let updatedCount = 0;

for (const file of mdFiles) {
  const slug = path.basename(file, '.md');
  const filePath = path.join(artifactsDir, file);
  const mdContent = fs.readFileSync(filePath, 'utf8');

  // Search for "slug": "slug" or slug: "slug"
  const slugPattern = `"slug": "${slug}"`;
  const slugIndex = blogDataContent.indexOf(slugPattern);

  if (slugIndex === -1) {
    console.log(`- Slug "${slug}" not found in blogData.ts. Skipping...`);
    continue;
  }

  // Find the boundary of the object
  const searchStartIndex = blogDataContent.indexOf(slugPattern);
  
  // We want to insert or replace the "markdown" property inside this object.
  // Let's check if "markdown": ... already exists within the next 200 characters or before the next closing brace.
  const nextBraceIndex = blogDataContent.indexOf('}', searchStartIndex);
  const markdownKey = `"markdown":`;
  const markdownKeyIndex = blogDataContent.indexOf(markdownKey, searchStartIndex);

  const stringifiedMd = JSON.stringify(mdContent);

  if (markdownKeyIndex !== -1 && markdownKeyIndex < nextBraceIndex) {
    // "markdown" property already exists in this object. Let's replace its value.
    const colonIndex = blogDataContent.indexOf(':', markdownKeyIndex);
    const startQuoteIndex = blogDataContent.indexOf('"', colonIndex);
    
    // Scan for the closing unescaped quote
    let endQuoteIndex = -1;
    for (let i = startQuoteIndex + 1; i < blogDataContent.length; i++) {
      if (blogDataContent[i] === '"' && blogDataContent[i - 1] !== '\\') {
        endQuoteIndex = i;
        break;
      }
    }

    if (endQuoteIndex !== -1) {
      // Replace the old string value with the new stringified markdown
      blogDataContent = 
        blogDataContent.substring(0, startQuoteIndex) + 
        stringifiedMd + 
        blogDataContent.substring(endQuoteIndex + 1);
      updatedCount++;
    } else {
      console.error(`Error: Found "markdown" key for "${slug}" but couldn't locate closing quote.`);
    }
  } else {
    // "markdown" property does not exist in this object. Let's insert it right after the slug property.
    const insertIndex = searchStartIndex + slugPattern.length;
    const nextCommaIndex = blogDataContent.indexOf(',', insertIndex);
    
    if (nextCommaIndex !== -1 && nextCommaIndex < nextBraceIndex) {
      const insertionPoint = nextCommaIndex + 1;
      const injectionStr = `\n    "markdown": ${stringifiedMd},`;
      blogDataContent = 
        blogDataContent.substring(0, insertionPoint) + 
        injectionStr + 
        blogDataContent.substring(insertionPoint);
      updatedCount++;
    } else {
      console.error(`Error: Couldn't locate insertion point for "${slug}".`);
    }
  }
}

if (updatedCount > 0) {
  fs.writeFileSync(blogDataPath, blogDataContent, 'utf8');
  console.log(`Successfully merged ${updatedCount} markdown articles into blogData.ts!`);
} else {
  console.log("No articles were updated.");
}
