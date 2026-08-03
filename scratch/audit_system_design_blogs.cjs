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

// Find System Design section in roadmapData.ts
const sysDesignSectionMatch = roadmapDataContent.match(/id:\s*['"]system-design['"][\s\S]*?topics:\s*\[([\s\S]*?)\]\n\s*\}\n\s*\]/);

// Alternative: let's extract all subtopics under system-design
console.log("Analyzing System Design Roadmap Topics...");

// Let's parse all topic objects in roadmapData
const topicMatches = roadmapDataContent.matchAll(/id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?blogSlug:\s*'([^']+)'/g);

const systemDesignSlugs = [];

// Let's inspect System Design zone in roadmapData.ts specifically
const sysDesignStart = roadmapDataContent.indexOf("id: 'system-design'");
let sysDesignEnd = roadmapDataContent.indexOf("id: 'machine-learning'", sysDesignStart);
if (sysDesignEnd === -1) sysDesignEnd = roadmapDataContent.indexOf("id: 'devops'", sysDesignStart);
if (sysDesignEnd === -1) sysDesignEnd = roadmapDataContent.length;

const sysDesignSub = roadmapDataContent.substring(sysDesignStart, sysDesignEnd);

const slugMatches = sysDesignSub.matchAll(/id:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?blogSlug:\s*'([^']+)'/g);

const systemDesignTopics = [];
for (const m of slugMatches) {
  systemDesignTopics.push({
    id: m[1],
    title: m[2],
    slug: m[3]
  });
}

console.log(`Found ${systemDesignTopics.length} System Design topics in roadmapData.ts:\n`);

let fixedCount = 0;
let genericCount = 0;
const results = [];

systemDesignTopics.forEach((t, index) => {
  let content = blogDataSlugs[t.slug] || deBlogDataSlugs[t.slug] || '';
  const charCount = content.length;
  
  // Generic template check
  const isGeneric = charCount === 0 || 
                    content.includes("This is a placeholder blueprint") || 
                    content.includes("Generic Blueprint") ||
                    (charCount < 3000 && !content.includes("## 1."));

  const status = !isGeneric ? "✅ FIXED (Custom Deep Content)" : "❌ GENERIC BLUEPRINT";
  if (!isGeneric) fixedCount++; else genericCount++;

  results.push({
    num: index + 1,
    title: t.title,
    slug: t.slug,
    charCount,
    isGeneric,
    status
  });
});

console.log(JSON.stringify(results, null, 2));

console.log("\n========================================================================");
console.log("SYSTEM DESIGN BLOGS AUDIT SUMMARY:");
console.log(`- Total Topics: ${systemDesignTopics.length}`);
console.log(`- ✅ Fixed (Custom Deep Content): ${fixedCount} (${Math.round(fixedCount/systemDesignTopics.length*100)}%)`);
console.log(`- ❌ Generic Blueprint / Placeholder: ${genericCount} (${Math.round(genericCount/systemDesignTopics.length*100)}%)`);
console.log("========================================================================");
