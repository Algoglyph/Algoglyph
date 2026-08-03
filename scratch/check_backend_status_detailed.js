const fs = require('fs');

const roadmapRaw = fs.readFileSync('./src/config/roadmapData.ts', 'utf8');
const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');
const mlBlogDataRaw = fs.readFileSync('./src/config/mlBlogData.ts', 'utf8');

// Find all slugs present in blogData.ts
const blogSlugs = new Set();
let m;
const slugRe = /["']?slug["']?\s*:\s*['"]([^'"]+)['"]/g;
while ((m = slugRe.exec(blogDataRaw)) !== null) {
  blogSlugs.add(m[1]);
}

// Find all slugs in deBlogData.ts that have content
const deSlugs = new Set();
const deKeys = Object.keys(eval('({' + deBlogDataRaw.replace(/export const deBlogData: Record<string, string> = /, '').replace(/;$/, '') + '})'));
deKeys.forEach(k => {
  deSlugs.add(k);
});

// Also check raw string matching for deBlogData & mlBlogData slots
const deSlots = new Map();
const slotRe = /'([^']+)'\s*:\s*(`[\s\S]*?`|''|""|``)/g;
let sm;
while ((sm = slotRe.exec(deBlogDataRaw)) !== null) {
  const slug = sm[1];
  const val = sm[2].trim();
  const isDone = val.length > 10 && val !== "''" && val !== '""' && val !== '``';
  deSlots.set(slug, isDone);
}

const mlSlots = new Map();
while ((sm = slotRe.exec(mlBlogDataRaw)) !== null) {
  const slug = sm[1];
  const val = sm[2].trim();
  const isDone = val.length > 10 && val !== "''" && val !== '""' && val !== '``';
  mlSlots.set(slug, isDone);
}

// Now parse roadmap zones
// Let's import/eval or extract ROADMAP_ZONES from roadmapData.ts
const zones = [];

// Parse zones using regular expressions or evaluate module
// Let's parse subtopics across zones
const zoneBlocks = roadmapRaw.split(/id:\s*'/);

console.log('=== SYSTEM DESIGN & BACKEND SYSTEMS / ROADMAP ANALYSIS ===\n');

// Parse subtopics from roadmapData
const subtopicRe = /id:\s*'([^']+)',\s*title:\s*'([^']+)',[\s\S]*?blogSlug:\s*'([^']+)'/g;

const allSubtopics = [];
while ((m = subtopicRe.exec(roadmapRaw)) !== null) {
  allSubtopics.push({
    id: m[1],
    title: m[2],
    blogSlug: m[3]
  });
}

// Filter backend / system design subtopics or check all zones
// Let's identify which zone each belongs to by parsing zone blocks
const zonesData = [];
const zoneRegex = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)'[\s\S]*?topics:\s*\[([\s\S]*?)\]\s*}/g;

let zMatch;
// Let's do a structured parse of ROADMAP_ZONES
console.log(`Total subtopic nodes found in roadmap: ${allSubtopics.length}`);

// Check status of each subtopic
const doneList = [];
const remainingList = [];

for (const sub of allSubtopics) {
  const slug = sub.blogSlug;
  const inBlogData = blogSlugs.has(slug);
  const inDeDone = deSlots.get(slug) === true;
  const inMlDone = mlSlots.get(slug) === true;
  
  if (inBlogData || inDeDone || inMlDone) {
    doneList.push(sub);
  } else {
    remainingList.push(sub);
  }
}

console.log(`\nOVERALL SUMMARY ACROSS ROADMAP:`);
console.log(`Total Blogs: ${allSubtopics.length}`);
console.log(`Completed Blogs: ${doneList.length}`);
console.log(`Remaining Blogs: ${remainingList.length}`);

