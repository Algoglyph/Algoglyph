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
  // Check blogData.ts
  const slugStr = `"slug": "${slug}"`;
  const idx = blogDataContent.indexOf(slugStr);
  if (idx !== -1) {
    const mdTag = '"markdown":';
    const mdIdx = blogDataContent.indexOf(mdTag, idx);
    if (mdIdx !== -1 && mdIdx - idx < 1500) {
      let quotePos = mdIdx + mdTag.length;
      while (quotePos < blogDataContent.length && blogDataContent[quotePos] !== '"' && blogDataContent[quotePos] !== '`') {
        quotePos++;
      }
      const quoteType = blogDataContent[quotePos];
      let endPos = quotePos + 1;
      while (endPos < blogDataContent.length) {
        if (blogDataContent[endPos] === quoteType && blogDataContent[endPos - 1] !== '\\') {
          return { source: 'blogData.ts', markdown: blogDataContent.substring(quotePos + 1, endPos) };
        }
        endPos++;
      }
    }
  }

  // Check deBlogData.ts
  const deKey = `'${slug}':`;
  const deIdx = deBlogDataContent.indexOf(deKey);
  if (deIdx !== -1) {
    const firstTick = deBlogDataContent.indexOf('`', deIdx);
    if (firstTick !== -1) {
      let pos = firstTick + 1;
      while (pos < deBlogDataContent.length) {
        if (deBlogDataContent[pos] === '`' && deBlogDataContent[pos - 1] !== '\\') {
          return { source: 'deBlogData.ts', markdown: deBlogDataContent.substring(firstTick + 1, pos) };
        }
        pos++;
      }
    }
  }

  return { source: 'NOT_FOUND', markdown: '' };
}

console.log(`========================================================================`);
console.log(`SYSTEM DESIGN ACCURATE AUDIT RESULT (${topics.length} Total Blogs)`);
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
      snippet: md ? md.substring(0, 70).replace(/\n/g, ' ') : 'EMPTY / MISSING' 
    });
  }
});

console.log(`✅ FIXED / CUSTOM DEEP BLOGS (${fixedCount}):`);
fixedList.forEach(item => {
  console.log(`${item.idx}. [${item.slug}] ${item.name} (${item.charCount} chars, ${item.source})`);
});

console.log(`\n❌ GENERIC / BLUEPRINT / BASIC BLOGS (${genericCount}):`);
genericList.forEach(item => {
  console.log(`${item.idx}. [${item.slug}] ${item.name} (${item.charCount} chars, ${item.source}) --> ${item.snippet}`);
});

console.log(`\n========================================================================`);
console.log(`SYSTEM DESIGN FINAL SUMMARY:`);
console.log(`- Total System Design Blogs: ${topics.length}`);
console.log(`- ✅ Fixed (Custom Deep Content >= 3,000 chars): ${fixedCount} (${Math.round(fixedCount/topics.length*100)}%)`);
console.log(`- ❌ Generic Blueprint / Basic Code: ${genericCount} (${Math.round(genericCount/topics.length*100)}%)`);
console.log(`========================================================================`);
