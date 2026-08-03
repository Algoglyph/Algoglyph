const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const postBlocks = blogDataRaw.split(/{\s*"slug":/g);

const dsaCsCategories = new Set([
  'Data Structures',
  'Algorithms',
  'DSA Foundations',
  'Theoretical CS',
  'Advanced CP'
]);

const slugMap = new Map();

for (let i = 1; i < postBlocks.length; i++) {
  const block = postBlocks[i];
  const slugMatch = block.match(/^\s*"([^"]+)"/);
  const catMatch = block.match(/"category":\s*"([^"]+)"/);
  const titleMatch = block.match(/"title":\s*"([^"]+)"/);

  if (slugMatch && catMatch) {
    const slug = slugMatch[1];
    const cat = catMatch[1];
    const title = titleMatch ? titleMatch[1] : slug;

    if (dsaCsCategories.has(cat)) {
      if (!slugMap.has(slug)) {
        slugMap.set(slug, { slug, category: cat, title });
      }
    }
  }
}

console.log(`Total unique slugs in blogData.ts: ${slugMap.size}`);

// Group the 171 slugs by Category
const categoriesMap = {};
for (const [slug, item] of slugMap.entries()) {
  if (!categoriesMap[item.category]) categoriesMap[item.category] = [];
  categoriesMap[item.category].push(item);
}

// Construct 11 topics that contain all 171 subtopics
const topicsList = [];

// Helper to format subtopic
const makeSub = (item) => ({
  id: item.slug,
  name: item.title,
  blogSlug: item.slug
});

// 1. DSA Foundations (40 articles)
const dsaFoundations = categoriesMap['DSA Foundations'] || [];
topicsList.push({
  id: 'dsa-foundations-topic',
  name: 'DSA Foundations & Core Mechanics',
  description: 'Master data organization, memory layouts, complexity calculations, and base structures.',
  concepts: [
    {
      id: 'dsa-basics-concept',
      name: 'Introduction & Memory Allocation',
      subtopics: dsaFoundations.slice(0, 14).map(makeSub)
    },
    {
      id: 'dsa-trees-traversals-concept',
      name: 'Trees & Traversals Basics',
      subtopics: dsaFoundations.slice(14, 26).map(makeSub)
    },
    {
      id: 'dsa-indexing-paradigms-concept',
      name: 'Indexing & Algorithmic Paradigms',
      subtopics: dsaFoundations.slice(26).map(makeSub)
    }
  ]
});

// 2. Data Structures (39 articles)
const dataStructures = categoriesMap['Data Structures'] || [];
topicsList.push({
  id: 'data-structures-topic',
  name: 'Linear, Tree & Advanced Data Structures',
  description: 'Arrays, lists, stacks, queues, trees, heaps, and probabilistic structures.',
  concepts: [
    {
      id: 'linear-ds-concept',
      name: 'Linear Structures & Queues',
      subtopics: dataStructures.slice(0, 13).map(makeSub)
    },
    {
      id: 'tree-ds-concept',
      name: 'Balanced Trees & Heaps',
      subtopics: dataStructures.slice(13, 26).map(makeSub)
    },
    {
      id: 'probabilistic-spatial-concept',
      name: 'Probabilistic & Spatial Index Structures',
      subtopics: dataStructures.slice(26).map(makeSub)
    }
  ]
});

// 3. Algorithms (66 articles)
const algorithms = categoriesMap['Algorithms'] || [];
topicsList.push({
  id: 'algorithms-searching-sorting-topic',
  name: 'Searching & Sorting Algorithms',
  description: 'Logarithmic search boundaries and optimal element ordering schemes.',
  concepts: [
    {
      id: 'searching-sorting-concept',
      name: 'Searching & Elementary Sorting',
      subtopics: algorithms.slice(0, 17).map(makeSub)
    },
    {
      id: 'graph-pathfinding-concept',
      name: 'Graph Traversal & Pathfinding',
      subtopics: algorithms.slice(17, 33).map(makeSub)
    },
    {
      id: 'algorithmic-patterns-concept',
      name: 'Algorithmic Patterns & Substring Search',
      subtopics: algorithms.slice(33, 49).map(makeSub)
    },
    {
      id: 'specialized-computational-concept',
      name: 'Specialized Routines & Computational Geometry',
      subtopics: algorithms.slice(49).map(makeSub)
    }
  ]
});

// 4. Theoretical Computer Science (25 articles)
const theoreticalCS = categoriesMap['Theoretical CS'] || [];
topicsList.push({
  id: 'theoretical-cs-topic',
  name: 'Theoretical Computer Science & Automata Theory',
  description: 'Formal language machines, computability limits, P vs NP, and zero-knowledge proofs.',
  concepts: [
    {
      id: 'automata-computability-concept',
      name: 'Automata, Grammars & Turing Computability',
      subtopics: theoreticalCS.slice(0, 13).map(makeSub)
    },
    {
      id: 'complexity-classes-proofs-concept',
      name: 'Complexity Classes, P vs NP & Zero-Knowledge Proofs',
      subtopics: theoreticalCS.slice(13).map(makeSub)
    }
  ]
});

// 5. Advanced Competitive Programming (1 article)
const advCP = categoriesMap['Advanced CP'] || [];
if (advCP.length > 0) {
  topicsList.push({
    id: 'advanced-cp-topic',
    name: 'Advanced Competitive Programming',
    description: 'High-level competitive programming techniques and advanced invariants.',
    concepts: [
      {
        id: 'advanced-cp-concept',
        name: 'Competitive Programming Techniques',
        subtopics: advCP.map(makeSub)
      }
    ]
  });
}

// Verify counts
let totalSub = 0;
let totalCon = 0;
const usedSlugs = new Set();

topicsList.forEach(t => {
  totalCon += t.concepts.length;
  t.concepts.forEach(c => {
    c.subtopics.forEach(s => {
      totalSub++;
      usedSlugs.add(s.blogSlug);
    });
  });
});

console.log(`\n======================================================`);
console.log(`EXACT 171 MATCH SUMMARY:`);
console.log(`- Topics: ${topicsList.length}`);
console.log(`- Concepts: ${totalCon}`);
console.log(`- Subtopics (Articles): ${totalSub}`);
console.log(`- Unique Slugs Covered: ${usedSlugs.size} / 171`);
console.log(`======================================================\n`);

if (usedSlugs.size === 171) {
  console.log(`🎉 PERFECT! 171 UNIQUE SUBTOPICS MAPPED EXACTLY ONCE!`);
  
  // Inject into roadmapData.ts
  const roadmapPath = './src/config/roadmapData.ts';
  const roadmapRaw = fs.readFileSync(roadmapPath, 'utf8');

  const topicsFormatted = JSON.stringify(topicsList, null, 8);

  const dsaStart = roadmapRaw.indexOf("id: 'dsa-foundations'");
  const topicsStart = roadmapRaw.indexOf("topics: [", dsaStart);
  const nextZoneStart = roadmapRaw.indexOf("id: 'game-developer'", dsaStart);
  const topicsEnd = roadmapRaw.lastIndexOf("]", nextZoneStart);

  const updatedRoadmap = roadmapRaw.slice(0, topicsStart) + "topics: " + topicsFormatted + roadmapRaw.slice(topicsEnd + 1);

  fs.writeFileSync(roadmapPath, updatedRoadmap, 'utf8');
  console.log("Successfully updated dsa-foundations topics in roadmapData.ts!");
}
