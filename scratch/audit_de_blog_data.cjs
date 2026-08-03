const fs = require('fs');
const path = require('path');

const { deBlogData } = require('../src/config/deBlogData.ts');

const keys = Object.keys(deBlogData);
console.log(`Total keys in deBlogData: ${keys.length}`);

const shortKeys = keys.filter(k => deBlogData[k].length < 4000);
console.log(`Short keys (< 4000 chars) in deBlogData: ${shortKeys.length}`);

console.log('\nList of Short Keys in deBlogData:');
shortKeys.forEach(k => {
  console.log(`- ${k}: ${deBlogData[k].length} chars`);
});
