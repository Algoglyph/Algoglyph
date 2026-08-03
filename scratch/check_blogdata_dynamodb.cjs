const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');

const pos = blogDataRaw.indexOf('"slug": "nosql-dynamodb"');
if (pos !== -1) {
  console.log("=== DynamoDB Entry in blogData.ts ===");
  console.log(blogDataRaw.slice(pos - 20, pos + 1000));
} else {
  console.log("nosql-dynamodb NOT in blogData.ts!");
}
