const fs = require('fs');
const path = require('path');

const roadmapDataContent = fs.readFileSync(path.join(__dirname, '../src/config/roadmapData.ts'), 'utf8');
const blogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/blogData.ts'), 'utf8');
const deBlogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/deBlogData.ts'), 'utf8');

// Parse BLOG_POSTS from blogData.ts
const blogDataSlugs = {};
const blogPostMatches = blogDataContent.matchAll(/slug:\s*'([^']+)'[\s\S]*?markdown:\s*`([\s\S]*?)`/g);
for (const match of blogPostMatches) {
  blogDataSlugs[match[1]] = match[2];
}

// Parse deBlogData dictionary keys
const deBlogDataSlugs = {};
const deMatches = deBlogDataContent.matchAll(/'([^']+)'\s*:\s*`([\s\S]*?)`/g);
for (const match of deMatches) {
  deBlogDataSlugs[match[1]] = match[2];
}

// Extract System Design zone from roadmapData.ts
const sysDesignStart = roadmapDataContent.indexOf("id: 'system-design'");
// System design zone ends before the next zone or array end
const sysDesignSub = roadmapDataContent.substring(sysDesignStart, sysDesignStart + 15000);

const subtopicMatches = sysDesignSub.matchAll(/{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*blogSlug:\s*'([^']+)'\s*}/g);

const topics = [];
for (const m of subtopicMatches) {
  topics.push({
    id: m[1],
    name: m[2],
    slug: m[3]
  });
}

console.log(`========================================================================`);
console.log(`SYSTEM DESIGN ROADMAP BLOGS AUDIT (${topics.length} Subtopics Found)`);
console.log(`========================================================================\n`);

let fixedCount = 0;
let genericCount = 0;

const fixedList = [];
const genericList = [];

topics.forEach((t, idx) => {
  const mdInBlogData = blogDataSlugs[t.slug];
  const mdInDeBlogData = deBlogDataSlugs[t.slug];
  const content = mdInBlogData || mdInDeBlogData || '';
  const source = mdInBlogData ? 'blogData.ts' : (mdInDeBlogData ? 'deBlogData.ts' : 'MISSING');
  const charCount = content.length;

  const isGeneric = charCount === 0 ||
                    content.includes("This is a placeholder blueprint") ||
                    content.includes("Generic Blueprint") ||
                    content.includes("blueprint slot") ||
                    (charCount < 3500 && !content.includes("## 1."));

  if (!isGeneric) {
    fixedCount++;
    fixedList.push({ idx: idx + 1, name: t.name, slug: t.slug, charCount, source });
  } else {
    genericCount++;
    genericList.push({ idx: idx + 1, name: t.name, slug: t.slug, charCount, source });
  }
});

console.log(`✅ FIXED BLOGS (${fixedCount}):`);
fixedList.forEach(item => {
  console.log(`${item.idx}. [${item.slug}] ${item.name} (${item.charCount} chars, ${item.source})`);
});

console.log(`\n❌ GENERIC / BLUEPRINT BLOGS (${genericCount}):`);
genericList.forEach(item => {
  console.log(`${item.idx}. [${item.slug}] ${item.name} (${item.charCount} chars, ${item.source})`);
});

console.log(`\n========================================================================`);
console.log(`SYSTEM DESIGN SUMMARY:`);
console.log(`- Total Blogs: ${topics.length}`);
console.log(`- ✅ Fixed (Custom Content): ${fixedCount} (${Math.round(fixedCount/topics.length*100)}%)`);
console.log(`- ❌ Generic Template / Missing: ${genericCount} (${Math.round(genericCount/topics.length*100)}%)`);
console.log(`========================================================================`);
