const fs = require('fs');
const path = require('path');

// Re-extract: get slugs + categories properly by parsing object blocks
const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const data = fs.readFileSync(blogDataPath, 'utf8');

// Extract slug+category pairs together by finding each object block
const blockRegex = /"slug":\s*"([^"]+)"[\s\S]*?"category":\s*"([^"]+)"/g;
let match;
const posts = [];
const seen = new Set();

while ((match = blockRegex.exec(data)) !== null) {
  const slug = match[1];
  const category = match[2];
  if (!seen.has(slug)) {
    seen.add(slug);
    posts.push({ slug, category });
  }
}

// Group unique posts by category
const grouped = {};
for (const post of posts) {
  if (!grouped[post.category]) grouped[post.category] = [];
  grouped[post.category].push(post.slug);
}

// Identify backend posts
const backendSlugs = grouped['Backend'] || [];

const artifactsDir = 'C:\\Users\\varun\\.gemini\\antigravity-ide\\brain\\00d9c18f-de5c-4ab4-8cd2-16519de6ce1d';
const files = fs.readdirSync(artifactsDir);
const writtenMdSlugs = new Set(
  files
    .filter(f => f.endsWith('.md') && !['walkthrough.md','implementation_plan.md','task.md'].includes(f))
    .map(f => path.basename(f, '.md'))
);

const done = backendSlugs.filter(s => writtenMdSlugs.has(s));
const remaining = backendSlugs.filter(s => !writtenMdSlugs.has(s));

console.log(`\n${'='.repeat(60)}`);
console.log(`BACKEND CURRICULUM STATUS REPORT (Unique Slugs)`);
console.log(`${'='.repeat(60)}`);
console.log(`Total unique backend articles planned: ${backendSlugs.length}`);
console.log(`Articles written (md exists):          ${done.length}`);
console.log(`Articles remaining:                    ${remaining.length}`);
console.log(`Completion: ${Math.round(done.length/backendSlugs.length*100)}%`);

console.log(`\n${'─'.repeat(60)}`);
console.log(`✅ DONE (${done.length} articles):`);
done.forEach((s, i) => console.log(`  ${String(i+1).padStart(2)}. ${s}`));

console.log(`\n${'─'.repeat(60)}`);
console.log(`❌ REMAINING (${remaining.length} articles):`);
remaining.forEach((s, i) => console.log(`  ${String(i+1).padStart(2)}. ${s}`));

// Also print all categories with unique counts
console.log(`\n${'─'.repeat(60)}`);
console.log(`ALL CATEGORIES (unique):`);
for (const [cat, slugList] of Object.entries(grouped)) {
  const doneCount = slugList.filter(s => writtenMdSlugs.has(s)).length;
  console.log(`  ${cat}: ${doneCount}/${slugList.length} done`);
}
