const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const deBlogDataPath = path.join(__dirname, '../src/config/deBlogData.ts');
const mlBlogDataPath = path.join(__dirname, '../src/config/mlBlogData.ts');

const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');
const deBlogDataContent = fs.readFileSync(deBlogDataPath, 'utf8');
const mlBlogDataContent = fs.readFileSync(mlBlogDataPath, 'utf8');

console.log('--- Searching for nosql-dynamodb ---');

// 1. Check in blogData.ts
const inBlogData = blogDataContent.includes('nosql-dynamodb');
console.log('In blogData.ts:', inBlogData);
if (inBlogData) {
  // Find line number and snippet
  const lines = blogDataContent.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('nosql-dynamodb')) {
      console.log(`blogData.ts Line ${idx + 1}: ${line.slice(0, 100)}`);
    }
  });
}

// 2. Check in deBlogData.ts
const inDeBlogData = deBlogDataContent.includes('nosql-dynamodb');
console.log('In deBlogData.ts:', inDeBlogData);
if (inDeBlogData) {
  const lines = deBlogDataContent.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('nosql-dynamodb')) {
      console.log(`deBlogData.ts Line ${idx + 1}: ${line.slice(0, 100)}`);
    }
  });
}

// 3. Check in mlBlogData.ts
const inMlBlogData = mlBlogDataContent.includes('nosql-dynamodb');
console.log('In mlBlogData.ts:', inMlBlogData);
if (inMlBlogData) {
  const lines = mlBlogDataContent.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('nosql-dynamodb')) {
      console.log(`mlBlogData.ts Line ${idx + 1}: ${line.slice(0, 100)}`);
    }
  });
}
