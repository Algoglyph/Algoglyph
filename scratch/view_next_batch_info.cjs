const fs = require('fs');
const path = require('path');

const posts = require('./all_real_posts.json');
const artifactsDir = 'C:\\Users\\varun\\.gemini\\antigravity-ide\\brain\\00d9c18f-de5c-4ab4-8cd2-16519de6ce1d';
const files = fs.readdirSync(artifactsDir);
const writtenMdSlugs = new Set(
  files
    .filter(f => f.endsWith('.md') && !['walkthrough.md','implementation_plan.md','task.md'].includes(f))
    .map(f => path.basename(f, '.md'))
);

const categories = [
  'Data Structures',
  'Algorithms',
  'Advanced CP',
  'Computer Systems',
  'Databases',
  'System Design',
  'Computer Networks',
  'Operating Systems',
  'Machine Learning',
  'Software Engineering',
  'Theoretical CS',
  'DSA Foundations',
  'Game Developer',
  'Backend'
];

console.log('=== Category Writing Status ===');
for (const cat of categories) {
  const catPosts = posts.filter(p => p.category === cat);
  const uniqueSlugs = [...new Set(catPosts.map(p => p.slug))];
  const done = uniqueSlugs.filter(s => writtenMdSlugs.has(s));
  console.log(`${cat.padEnd(25)}: ${done.length}/${uniqueSlugs.length} done`);
}

// Let's print the slugs for "Computer Systems"
console.log('\n=== Computer Systems Slugs ===');
const compSysSlugs = [...new Set(posts.filter(p => p.category === 'Computer Systems').map(p => p.slug))];
compSysSlugs.forEach((s, i) => {
  const p = posts.find(post => post.slug === s);
  console.log(`  ${i+1}. ${s} - ${p.title}`);
});

// Let's print the slugs for "Databases" (if category is "Databases")
console.log('\n=== Databases (standalone) Slugs ===');
const dbSlugs = [...new Set(posts.filter(p => p.category === 'Databases').map(p => p.slug))];
dbSlugs.forEach((s, i) => {
  const p = posts.find(post => post.slug === s);
  console.log(`  ${i+1}. ${s} - ${p.title}`);
});
