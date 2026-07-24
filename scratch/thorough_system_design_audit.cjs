const fs = require('fs');
const path = require('path');

const roadmapDataContent = fs.readFileSync(path.join(__dirname, '../src/config/roadmapData.ts'), 'utf8');
const blogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/blogData.ts'), 'utf8');
const deBlogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/deBlogData.ts'), 'utf8');
const mlBlogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/mlBlogData.ts'), 'utf8');

// Helper to extract markdown for any slug across all data sources
function getMarkdownForSlug(slug) {
  // Check blogData.ts (object format: "slug": "slug", ... "markdown": `...`)
  const slugPattern = new RegExp(`["']slug["']\\s*:\\s*["']${slug}["']`);
  const slugIdx = blogDataContent.search(slugPattern);
  
  if (slugIdx !== -1) {
    // Find markdown field after slug
    const mdIdx = blogDataContent.indexOf('"markdown":', slugIdx);
    if (mdIdx !== -1 && mdIdx - slugIdx < 1000) {
      // Find backtick start
      const tickStart = blogDataContent.indexOf('`', mdIdx);
      if (tickStart !== -1) {
        // Find closing backtick (ignoring escaped backticks)
        let curr = tickStart + 1;
        while (curr < blogDataContent.length) {
          if (blogDataContent[curr] === '`' && blogDataContent[curr-1] !== '\\') {
            return {
              source: 'blogData.ts',
              markdown: blogDataContent.substring(tickStart + 1, curr)
            };
          }
          curr++;
        }
      }
    }
  }

  // Check deBlogData.ts
  const deKey = `'${slug}':`;
  const deIdx = deBlogDataContent.indexOf(deKey);
  if (deIdx !== -1) {
    const tickStart = deBlogDataContent.indexOf('`', deIdx);
    if (tickStart !== -1) {
      let curr = tickStart + 1;
      while (curr < deBlogDataContent.length) {
        if (deBlogDataContent[curr] === '`' && deBlogDataContent[curr-1] !== '\\') {
          return {
            source: 'deBlogData.ts',
            markdown: deBlogDataContent.substring(tickStart + 1, curr)
          };
        }
        curr++;
      }
    }
  }

  // Check mlBlogData.ts
  const mlKey = `"${slug}":`;
  const mlIdx = mlBlogDataContent.indexOf(mlKey);
  if (mlIdx !== -1) {
    const tickStart = mlBlogDataContent.indexOf('`', mlIdx);
    if (tickStart !== -1) {
      let curr = tickStart + 1;
      while (curr < mlBlogDataContent.length) {
        if (mlBlogDataContent[curr] === '`' && mlBlogDataContent[curr-1] !== '\\') {
          return {
            source: 'mlBlogData.ts',
            markdown: mlBlogDataContent.substring(tickStart + 1, curr)
          };
        }
        curr++;
      }
    }
  }

  return { source: 'NOT_FOUND', markdown: '' };
}

// Extract all subtopics from System Design zone in roadmapData.ts
const sysDesignStart = roadmapDataContent.indexOf("id: 'system-design'");
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
console.log(`SYSTEM DESIGN BLOGS COMPREHENSIVE AUDIT (${topics.length} Articles)`);
console.log(`========================================================================\n`);

let fixedCount = 0;
let genericCount = 0;

const fixedList = [];
const genericList = [];

topics.forEach((t, idx) => {
  const result = getMarkdownForSlug(t.slug);
  const md = result.markdown;
  const charCount = md.length;

  const isGeneric = charCount === 0 ||
                    md.includes("This is a placeholder blueprint") ||
                    md.includes("Generic Blueprint") ||
                    md.includes("blueprint slot") ||
                    md.includes("Mastering the concept of") && md.includes("fundamental cornerstone") ||
                    (charCount < 3500 && !md.includes("## 1."));

  if (!isGeneric && charCount > 0) {
    fixedCount++;
    fixedList.push({ idx: idx + 1, name: t.name, slug: t.slug, charCount, source: result.source });
  } else {
    genericCount++;
    genericList.push({ idx: idx + 1, name: t.name, slug: t.slug, charCount, source: result.source, sample: md.substring(0, 100).replace(/\n/g, ' ') });
  }
});

console.log(`✅ FIXED / CUSTOM DEEP BLOGS (${fixedCount}):`);
fixedList.forEach(item => {
  console.log(`${item.idx}. [${item.slug}] ${item.name} (${item.charCount} chars, ${item.source})`);
});

console.log(`\n❌ GENERIC / BLUEPRINT / MISSING BLOGS (${genericCount}):`);
genericList.forEach(item => {
  console.log(`${item.idx}. [${item.slug}] ${item.name} (${item.charCount} chars, ${item.source}) ${item.sample ? `--> "${item.sample}..."` : ''}`);
});

console.log(`\n========================================================================`);
console.log(`SYSTEM DESIGN SUMMARY:`);
console.log(`- Total System Design Blogs: ${topics.length}`);
console.log(`- ✅ Fixed (Custom Deep Content): ${fixedCount} (${Math.round(fixedCount/topics.length*100)}%)`);
console.log(`- ❌ Generic Blueprint / Missing: ${genericCount} (${Math.round(genericCount/topics.length*100)}%)`);
console.log(`========================================================================`);
