const fs = require('fs');
const path = require('path');

const roadmapDataContent = fs.readFileSync(path.join(__dirname, '../src/config/roadmapData.ts'), 'utf8');
const blogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/blogData.ts'), 'utf8');
const deBlogDataContent = fs.readFileSync(path.join(__dirname, '../src/config/deBlogData.ts'), 'utf8');

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

function getMarkdown(slug) {
  // Try matching "slug": "slug" inside blogData.ts
  const idx = blogDataContent.indexOf(`"slug": "${slug}"`);
  if (idx !== -1) {
    const mdIdx = blogDataContent.indexOf('"markdown":', idx);
    if (mdIdx !== -1 && mdIdx - idx < 500) {
      const firstTick = blogDataContent.indexOf('`', mdIdx);
      if (firstTick !== -1) {
        // scan to end tick
        let pos = firstTick + 1;
        while (pos < blogDataContent.length) {
          if (blogDataContent[pos] === '`' && blogDataContent[pos-1] !== '\\') {
            return {
              source: 'blogData.ts',
              markdown: blogDataContent.substring(firstTick + 1, pos)
            };
          }
          pos++;
        }
      }
    }
  }

  // Try matching in deBlogData.ts ('slug': `...`)
  const deKey = `'${slug}':`;
  const deIdx = deBlogDataContent.indexOf(deKey);
  if (deIdx !== -1) {
    const firstTick = deBlogDataContent.indexOf('`', deIdx);
    if (firstTick !== -1) {
      let pos = firstTick + 1;
      while (pos < deBlogDataContent.length) {
        if (deBlogDataContent[pos] === '`' && deBlogDataContent[pos-1] !== '\\') {
          return {
            source: 'deBlogData.ts',
            markdown: deBlogDataContent.substring(firstTick + 1, pos)
          };
        }
        pos++;
      }
    }
  }

  return { source: 'NOT_FOUND', markdown: '' };
}

console.log(`========================================================================`);
console.log(`SYSTEM DESIGN ACCURATE AUDIT (${topics.length} Articles)`);
console.log(`========================================================================\n`);

let fixedCount = 0;
let genericCount = 0;

const fixedList = [];
const genericList = [];

topics.forEach((t, idx) => {
  const result = getMarkdown(t.slug);
  const md = result.markdown;
  const charCount = md.length;

  const isGeneric = charCount < 3000 ||
                    md.includes("This is a placeholder blueprint") ||
                    md.includes("Generic Blueprint") ||
                    md.includes("blueprint slot") ||
                    (md.includes("Mastering the concept of") && md.includes("fundamental cornerstone"));

  if (!isGeneric && charCount > 0) {
    fixedCount++;
    fixedList.push({ idx: idx + 1, name: t.name, slug: t.slug, charCount, source: result.source });
  } else {
    genericCount++;
    genericList.push({ 
      idx: idx + 1, 
      name: t.name, 
      slug: t.slug, 
      charCount, 
      source: result.source, 
      snippet: md ? md.substring(0, 80).replace(/\n/g, ' ') : 'EMPTY / MISSING' 
    });
  }
});

console.log(`✅ FIXED / CUSTOM DEEP BLOGS (${fixedCount}):`);
fixedList.forEach(item => {
  console.log(`${item.idx}. [${item.slug}] ${item.name} (${item.charCount} chars, ${item.source})`);
});

console.log(`\n❌ GENERIC / BLUEPRINT / SHORT BLOGS (${genericCount}):`);
genericList.forEach(item => {
  console.log(`${item.idx}. [${item.slug}] ${item.name} (${item.charCount} chars, ${item.source}) --> ${item.snippet}`);
});

console.log(`\n========================================================================`);
console.log(`SYSTEM DESIGN SUMMARY:`);
console.log(`- Total Blogs: ${topics.length}`);
console.log(`- ✅ Fixed (Custom Deep Content >= 3,000 chars): ${fixedCount} (${Math.round(fixedCount/topics.length*100)}%)`);
console.log(`- ❌ Generic / Template / Short: ${genericCount} (${Math.round(genericCount/topics.length*100)}%)`);
console.log(`========================================================================`);
