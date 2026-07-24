const fs = require('fs');

const ilPath = './src/components/RoadmapIllustration.tsx';
let ilContent = fs.readFileSync(ilPath, 'utf8');

const aliasMapStr = `
  const dsaAliasMap: Record<string, string> = {
    'stack': 'lifo-stacks',
    'queue': 'fifo-queues',
    'deque': 'double-ended-deques',
    'linked-list': 'singly-linked-lists',
    'doubly-linked-list': 'doubly-linked-lists',
    'circular-linked-list': 'circular-linked-lists',
    'skip-list': 'skip-lists-complex',
    'dijkstra-algorithm': 'dijkstra',
    'a-search': 'a-star-algorithm',
    'disjoint-set': 'disjoint-set-union',
    'bellman-ford': 'bellman-ford-floyd-warshall',
    'floyd-warshall': 'floyd-warshall-algorithm',
    'k-d-trees': 'kd-tree',
    'tries': 'trie',
    'segment-trees': 'segment-tree',
    'fenwick-trees': 'fenwick-tree',
    'sparse-tables': 'sparse-table',
    'suffix-trees': 'suffix-tree',
    'quadtrees': 'quadtree',
    'splay-trees': 'splay-tree',
    'treaps': 'treap',
    'min-heap': 'min-heaps',
    'max-heap': 'max-heaps',
    'binary-search-tree': 'binary-search-trees',
    'avl-tree': 'avl-trees',
    'b-tree': 'b-trees',
    'arrays': 'static-arrays',
    'heap': 'min-heaps'
  };

  const imageSlug = dsaAliasMap[sLower] || sLower;
`;

if (!ilContent.includes('dsaAliasMap')) {
  const compStart = ilContent.indexOf('export const RoadmapIllustration: React.FC<RoadmapIllustrationProps> = ({ slug }) => {');
  const insertPos = ilContent.indexOf('const sLower = slug.toLowerCase();', compStart) + 'const sLower = slug.toLowerCase();'.length;

  ilContent = ilContent.slice(0, insertPos) + aliasMapStr + ilContent.slice(insertPos);
}

ilContent = ilContent.split('/images/dsa/${sLower}-dark.png').join('/images/dsa/${imageSlug}-dark.png');
ilContent = ilContent.split('/images/dsa/${sLower}-dark.jpg').join('/images/dsa/${imageSlug}-dark.jpg');

fs.writeFileSync(ilPath, ilContent, 'utf8');
console.log("Successfully updated RoadmapIllustration.tsx with alias resolution!");
