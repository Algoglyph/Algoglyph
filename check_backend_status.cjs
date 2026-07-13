const fs = require('fs');
const data = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');

const backendSecStart = data.indexOf(`id: 'backend',`);
const nextSecStart = data.indexOf(`id: 'network-engineering',`);
const backendData = data.substring(backendSecStart, nextSecStart);

const re = /\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*blogSlug:\s*['"]([^'"]+)['"]\s*\}/g;
let m;
const backendTopics = new Map();
while ((m = re.exec(backendData)) !== null) {
  backendTopics.set(m[3], m[2]);
}

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const blogSlugs = new Set();
// Allow optional quotes around slug
const slugRe = /["']?slug["']?\s*:\s*['"]([^'"]+)['"]/g;
while ((m = slugRe.exec(blogDataRaw)) !== null) {
  blogSlugs.add(m[1]);
}

const done = [];
const remaining = [];
for (const [slug, name] of backendTopics.entries()) {
  if (blogSlugs.has(slug)) {
    done.push({slug, name});
  } else {
    remaining.push({slug, name});
  }
}

console.log('=== 1) ALL BACKEND BLOGS ===');
let i = 1;
for (const [slug, name] of backendTopics.entries()) {
  console.log(`${i++}. ${name} (Slug: ${slug})`);
}

console.log('\n=== 2) DONE BLOGS ===');
console.log('Count:', done.length);
done.forEach(t => console.log(`- ${t.name} (Slug: ${t.slug})`));

console.log('\n=== 3) REMAINING BLOGS ===');
console.log('Count:', remaining.length);
remaining.forEach(t => console.log(`- ${t.name} (Slug: ${t.slug})`));
