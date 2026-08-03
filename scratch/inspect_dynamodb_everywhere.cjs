const fs = require('fs');

const deBlogPath = './src/config/deBlogData.ts';
const deBlogRaw = fs.readFileSync(deBlogPath, 'utf8');

const keyPattern = `'nosql-dynamodb':`;
const pos = deBlogRaw.indexOf(keyPattern);

if (pos !== -1) {
  console.log("=== DynamoDB Entry in deBlogData.ts ===");
  console.log(deBlogRaw.slice(pos, pos + 2500));
} else {
  console.log("nosql-dynamodb key not found in deBlogData.ts!");
}
