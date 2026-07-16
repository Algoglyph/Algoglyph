const fs = require('fs');
const path = require('path');
const d = require('./all_slugs_by_category.json');

const categories = ['Computer Systems', 'Databases'];
for (const cat of categories) {
  console.log(`\n=== Category: ${cat} (${d[cat] ? d[cat].length : 0} slugs) ===`);
  if (d[cat]) {
    d[cat].forEach((s, i) => console.log(`  ${i+1}. ${s}`));
  }
}
