const fs = require('fs');
const path = require('path');

const deBlogDataPath = path.join(__dirname, '../src/config/deBlogData.ts');
const deContent = fs.readFileSync(deBlogDataPath, 'utf8');

// Extract the nosql-dynamodb property value
const keyPos = deContent.indexOf("'nosql-dynamodb':");
if (keyPos !== -1) {
  const snippet = deContent.substring(keyPos, keyPos + 3000);
  console.log("Length from keyPos:", deContent.length - keyPos);
  console.log("--- SNIPPET OF nosql-dynamodb ---");
  console.log(snippet.slice(0, 1500));
} else {
  console.log("Key 'nosql-dynamodb' not found with single quotes");
}
