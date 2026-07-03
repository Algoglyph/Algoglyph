// Spatial Computer Science Roadmap Curriculum Data

export interface Subtopic {
  id: string;
  name: string;
  blogSlug: string;
}

export interface Concept {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  concepts: Concept[];
}

export interface RoadmapZone {
  id: string;
  number: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hours: number;
  visualizerAvailable: boolean;
  learningStatus: 'Not Started' | 'In Progress' | 'Completed';
  description: string;
  topics: Topic[];
}

export const ROADMAP_ZONES: RoadmapZone[] = [
  {
    id: 'dsa-foundations',
    number: '01',
    name: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    hours: 88,
    visualizerAvailable: true,
    learningStatus: 'Not Started',
    description: 'Master data organization and computational routines.',
    topics: [
      {
        id: 'basics-memory',
        name: 'Language Basics & Memory',
        description: 'Variables, allocations, stack, and heap mechanics.',
        concepts: [
          {
            id: 'intro-dsa',
            name: 'Introduction to DSA',
            subtopics: [
              { id: 'what-is-dsa', name: 'What are Data Structures?', blogSlug: 'what-is-dsa' },
              { id: 'importance-dsa', name: 'Why are Data Structures Important?', blogSlug: 'importance-dsa' }
            ]
          },
          {
            id: 'programming-basics',
            name: 'Programming Basics',
            subtopics: [
              { id: 'variables-data-types', name: 'Variables & Data Types', blogSlug: 'static-arrays' },
              { id: 'operators-control-structures', name: 'Operators & Control Structures', blogSlug: 'procedural-state-pipelines' },
              { id: 'functions-basic-io', name: 'Functions & Basic I/O', blogSlug: 'functions-basic-i-o' }
            ]
          },
          {
            id: 'memory-allocation',
            name: 'Memory Allocation',
            subtopics: [
              { id: 'stack-allocation', name: 'Stack Allocation', blogSlug: 'stack-allocation' },
              { id: 'heap-allocation', name: 'Heap Allocation', blogSlug: 'heap-allocation' }
            ]
          }
        ]
      },
      {
        id: 'complexity-analysis',
        name: 'Complexity Analysis',
        description: 'Measuring algorithm performance metrics and scale limits.',
        concepts: [
          {
            id: 'complexity-basics',
            name: 'Complexity Basics',
            subtopics: [
              { id: 'time-vs-space', name: 'Time vs Space Complexity', blogSlug: 'time-vs-space' },
              { id: 'calculate-complexity', name: 'How to Calculate Complexity?', blogSlug: 'calculate-complexity' },
              { id: 'common-runtimes', name: 'Common Runtimes', blogSlug: 'common-runtimes' }
            ]
          },
          {
            id: 'asymptotic-notations',
            name: 'Asymptotic Notations',
            subtopics: [
              { id: 'big-o-notation', name: 'Big-O Notation', blogSlug: 'searching' },
              { id: 'big-theta-notation', name: 'Big-Theta Notation', blogSlug: 'big-theta-notation' },
              { id: 'big-omega-notation', name: 'Big-Omega Notation', blogSlug: 'big-omega-notation' },
              { id: 'time-complexity', name: 'Time Complexity', blogSlug: 'time-complexity-analysis' },
              { id: 'space-complexity', name: 'Space Complexity', blogSlug: 'space-complexity-analysis' }
            ]
          }
        ]
      },
      {
        id: 'linear-structures',
        name: 'Linear Data Structures',
        description: 'Contiguous arrays, list nodes, buffers, and collision tables.',
        concepts: [
          {
            id: 'arrays',
            name: 'Arrays',
            subtopics: [
              { id: 'static-arrays', name: 'Static Arrays', blogSlug: 'static-arrays' },
              { id: 'dynamic-arrays', name: 'Dynamic Arrays', blogSlug: 'dynamic-vectors' }
            ]
          },
          {
            id: 'linked-lists',
            name: 'Linked Lists',
            subtopics: [
              { id: 'singly-linked-list', name: 'Singly Linked List', blogSlug: 'singly-linked-lists' },
              { id: 'doubly-linked-list', name: 'Doubly Linked List', blogSlug: 'doubly-linked-lists' },
              { id: 'circular-linked-list', name: 'Circular Linked List', blogSlug: 'circular-linked-lists' },
              { id: 'skip-list', name: 'Skip List', blogSlug: 'skip-lists' }
            ]
          },
          {
            id: 'stacks-queues',
            name: 'Stacks & Queues',
            subtopics: [
              { id: 'lifo-stack', name: 'LIFO Stack', blogSlug: 'lifo-stacks' },
              { id: 'fifo-queue', name: 'FIFO Queue', blogSlug: 'fifo-queues' },
              { id: 'circular-queue', name: 'Circular Queue', blogSlug: 'circular-buffers' },
              { id: 'deque', name: 'Double Ended Deque (Deque)', blogSlug: 'double-ended-deques' }
            ]
          },
          {
            id: 'hash-tables',
            name: 'Hash Tables',
            subtopics: [
              { id: 'hash-functions', name: 'Hash Functions', blogSlug: 'hash-indexes' },
              { id: 'collision-resolution', name: 'Collision Resolution', blogSlug: 'collision-resolution' },
              { id: 'load-factor', name: 'Load Factor & Resizing', blogSlug: 'load-factor-scaling' }
            ]
          }
        ]
      },
      {
        id: 'sorting-searching',
        name: 'Sorting & Searching',
        description: 'Array re-order routines and value locations.',
        concepts: [
          {
            id: 'sorting',
            name: 'Sorting Algorithms',
            subtopics: [
              { id: 'bubble-sort', name: 'Bubble Sort', blogSlug: 'bubble-sort' },
              { id: 'selection-sort', name: 'Selection Sort', blogSlug: 'selection-sort' },
              { id: 'insertion-sort', name: 'Insertion Sort', blogSlug: 'insertion-sort' },
              { id: 'merge-sort', name: 'Merge Sort', blogSlug: 'merge-sort' },
              { id: 'quick-sort', name: 'Quick Sort', blogSlug: 'quick-sort' },
              { id: 'heap-sort', name: 'Heap Sort', blogSlug: 'heap-sort' },
              { id: 'radix-sort', name: 'Radix & Bucket Sort', blogSlug: 'radix-sort' }
            ]
          },
          {
            id: 'searching',
            name: 'Searching Algorithms',
            subtopics: [
              { id: 'linear-search', name: 'Linear Search', blogSlug: 'linear-search' },
              { id: 'binary-search', name: 'Binary Search', blogSlug: 'binary-search' },
              { id: 'ternary-search', name: 'Ternary Search', blogSlug: 'ternary-search' }
            ]
          }
        ]
      },
      {
        id: 'tree-structures',
        name: 'Tree Data Structures',
        description: 'Hierarchical node trees, prefix searches, and range indexes.',
        concepts: [
          {
            id: 'tree-basics',
            name: 'Tree Basics',
            subtopics: [
              { id: 'binary-tree', name: 'Binary Tree', blogSlug: 'binary-tree' },
              { id: 'binary-search-tree', name: 'Binary Search Tree (BST)', blogSlug: 'binary-search-trees' },
              { id: 'avl-tree', name: 'AVL Tree', blogSlug: 'avl-trees' },
              { id: 'b-tree', name: 'B-Tree', blogSlug: 'b-trees' },
              { id: 'heaps', name: 'Heap', blogSlug: 'min-heaps' }
            ]
          },
          {
            id: 'tree-traversal',
            name: 'Tree Traversal',
            subtopics: [
              { id: 'in-order', name: 'In-Order Traversal', blogSlug: 'in-order-traversal' },
              { id: 'pre-order', name: 'Pre-Order Traversal', blogSlug: 'pre-order-traversal' },
              { id: 'post-order', name: 'Post-Order Traversal', blogSlug: 'post-order-traversal' }
            ]
          },
          {
            id: 'tree-search',
            name: 'Search Algorithms',
            subtopics: [
              { id: 'tree-bfs', name: 'Breadth First Search (BFS)', blogSlug: 'tree-bfs' },
              { id: 'tree-dfs', name: 'Depth First Search (DFS)', blogSlug: 'tree-dfs' }
            ]
          }
        ]
      },
      {
        id: 'graph-structures',
        name: 'Graph Data Structures',
        description: 'Adjacency structures, path explorations, shortest paths, and spanning networks.',
        concepts: [
          {
            id: 'graph-foundations',
            name: 'Graph Foundations',
            subtopics: [
              { id: 'directed-graph', name: 'Directed Graph', blogSlug: 'directed-graphs' },
              { id: 'undirected-graph', name: 'Undirected Graph', blogSlug: 'undirected-graphs' },
              { id: 'graph-representations', name: 'Graph Representations', blogSlug: 'graph-representations' }
            ]
          },
          {
            id: 'graph-search',
            name: 'Search Algorithms',
            subtopics: [
              { id: 'graph-bfs', name: 'Breadth First Search (BFS)', blogSlug: 'bfs-traversal' },
              { id: 'graph-dfs', name: 'Depth First Search (DFS)', blogSlug: 'dfs-traversal' }
            ]
          },
          {
            id: 'shortest-path-algorithms',
            name: 'Shortest Path Algorithms',
            subtopics: [
              { id: 'dijkstra', name: "Dijkstra's Algorithm", blogSlug: 'dijkstra' },
              { id: 'bellman-ford', name: 'Bellman-Ford Algorithm', blogSlug: 'bellman-ford-floyd-warshall' },
              { id: 'a-star', name: 'A* Algorithm', blogSlug: 'a-star-algorithm' },
              { id: 'floyd-warshall', name: 'Floyd-Warshall Algorithm', blogSlug: 'floyd-warshall-algorithm' }
            ]
          },
          {
            id: 'minimum-spanning-tree',
            name: 'Minimum Spanning Tree',
            subtopics: [
              { id: 'prim-mst', name: "Prim's Algorithm", blogSlug: 'prim-mst' },
              { id: 'kruskal-mst', name: "Kruskal's Algorithm", blogSlug: 'kruskal-mst' },
              { id: 'dsu', name: 'Disjoint Set (Union-Find)', blogSlug: 'mst-union-find' }
            ]
          }
        ]
      },
      {
        id: 'advanced-structures',
        name: 'Advanced Data Structures',
        description: 'Range query logs and topological indexes.',
        concepts: [
          {
            id: 'advanced-nodes',
            name: 'Advanced Data Structures',
            subtopics: [
              { id: 'trie', name: 'Trie', blogSlug: 'trie' },
              { id: 'segment-tree', name: 'Segment Trees', blogSlug: 'segment-tree' },
              { id: 'fenwick-tree', name: 'Fenwick Trees', blogSlug: 'fenwick-tree' },
              { id: 'disjoint-set-union-find', name: 'Disjoint Set (Union-Find)', blogSlug: 'disjoint-set-union' },
              { id: 'suffix-structures', name: 'Suffix Trees and Arrays', blogSlug: 'suffix-arrays' }
            ]
          }
        ]
      },
      {
        id: 'complex-structures',
        name: 'Complex Data Structures & Indexing',
        description: 'Advanced storage indexing and B-tree derivations.',
        concepts: [
          {
            id: 'complex-nodes',
            name: 'Complex Data Structures',
            subtopics: [
              { id: '2-3-tree', name: '2-3 Trees', blogSlug: 'two-three-trees' },
              { id: 'bb-plus-tree', name: 'B/B+ Trees', blogSlug: 'b-trees-index-seeks' },
              { id: 'skip-list-complex', name: 'Skip List', blogSlug: 'skip-lists-complex' },
              { id: 'isam', name: 'ISAM', blogSlug: 'isam-indexing' }
            ]
          },
          {
            id: 'indexing',
            name: 'Indexing',
            subtopics: [
              { id: 'linear-indexing', name: 'Linear Indexing', blogSlug: 'linear-indexing' },
              { id: 'tree-based-indexing', name: 'Tree-Based Indexing', blogSlug: 'tree-indexing' }
            ]
          }
        ]
      },
      {
        id: 'problem-solving-techniques',
        name: 'Problem Solving Techniques',
        description: 'Common algorithmic paradigms and patterns.',
        concepts: [
          {
            id: 'algorithmic-patterns-1',
            name: 'Algorithmic Patterns I',
            subtopics: [
              { id: 'brute-force', name: 'Brute Force', blogSlug: 'brute-force' },
              { id: 'backtracking', name: 'Backtracking', blogSlug: 'backtracking' },
              { id: 'greedy-algorithms', name: 'Greedy Algorithms', blogSlug: 'greedy' },
              { id: 'randomized-algorithms', name: 'Randomized Algorithms', blogSlug: 'randomized-algorithms' },
              { id: 'divide-and-conquer', name: 'Divide and Conquer', blogSlug: 'divide-and-conquer' },
              { id: 'recursion', name: 'Recursion', blogSlug: 'recursion' },
              { id: 'dynamic-programming', name: 'Dynamic Programming', blogSlug: 'dynamic-programming' }
            ]
          },
          {
            id: 'algorithmic-patterns-2',
            name: 'Algorithmic Patterns II',
            subtopics: [
              { id: 'two-pointer', name: 'Two Pointer Technique', blogSlug: 'two-pointer-technique' },
              { id: 'sliding-window', name: 'Sliding Window Technique', blogSlug: 'sliding-window-technique' },
              { id: 'fast-slow-pointers', name: 'Fast and Slow Pointers', blogSlug: 'fast-slow-pointers' },
              { id: 'cyclic-sort', name: 'Cyclic Sort', blogSlug: 'cyclic-sort' },
              { id: 'merge-intervals', name: 'Merge Intervals', blogSlug: 'merge-intervals' },
              { id: 'two-heaps', name: 'Two Heaps', blogSlug: 'two-heaps-pattern' },
              { id: 'kth-element', name: 'Kth Element', blogSlug: 'kth-element' },
              { id: 'island-traversal', name: 'Island Traversal', blogSlug: 'island-traversal' },
              { id: 'multi-threaded', name: 'Multi-threaded Algorithms', blogSlug: 'multi-threaded' }
            ]
          }
        ]
      },
      {
        id: 'practice-platforms',
        name: 'Platforms to Practice',
        description: 'Coding practice hubs.',
        concepts: [
          {
            id: 'platforms',
            name: 'Practice Platforms',
            subtopics: [
              { id: 'leetcode', name: 'Leetcode', blogSlug: 'leetcode-platform' },
              { id: 'edabit', name: 'Edabit', blogSlug: 'edabit-platform' }
            ]
          }
        ]
      }
    ]
  },
    {
    id: 'game-developer',
    number: '02',
    name: 'Game Developer',
    difficulty: 'Medium',
    hours: 122,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Master Game Mathematics, Physics Engine, Programming Languages, Game Engines, Computer Graphics, Lighting, Visibility, Game AI, APIs, and Advanced physically-based rendering.',
    topics: [
      {
        id: 'game-math-languages',
        name: 'Game Mathematics & Programming Core',
        description: "Linear algebra calculations, transformation operations, splines, and engine languages.",
        concepts: [
          {
            id: 'linear-algebra-geo',
            name: 'Linear Algebra & Geometry',
            subtopics: [
              { id: 'game-math-vector', name: 'Vector', blogSlug: 'game-math-vector' },
              { id: 'game-math-matrix', name: 'Matrix', blogSlug: 'game-math-matrix' },
              { id: 'game-math-lin-trans', name: 'Linear Transformation', blogSlug: 'game-math-lin-trans' },
              { id: 'game-math-geometry', name: 'Geometry', blogSlug: 'game-math-geometry' },
              { id: 'game-math-affine-space', name: 'Affine Space', blogSlug: 'game-math-affine-space' },
              { id: 'game-math-affine-trans', name: 'Affine Transformation', blogSlug: 'game-math-affine-trans' },
              { id: 'game-math-projection', name: 'Projection', blogSlug: 'game-math-projection' },
              { id: 'game-math-orientation', name: 'Orientation', blogSlug: 'game-math-orientation' },
              { id: 'game-math-perspective', name: 'Perspective', blogSlug: 'game-math-perspective' },
              { id: 'game-math-quaternion', name: 'Quaternion', blogSlug: 'game-math-quaternion' },
              { id: 'game-math-orthogonal', name: 'Orthogonal', blogSlug: 'game-math-orthogonal' },
              { id: 'game-math-euler', name: 'Euler Angle', blogSlug: 'game-math-euler' }
            ]
          },
          {
            id: 'curves-splines',
            name: 'Curves & Splines',
            subtopics: [
              { id: 'game-math-spline', name: 'Spline', blogSlug: 'game-math-spline' },
              { id: 'game-math-hermite', name: 'Hermite', blogSlug: 'game-math-hermite' },
              { id: 'game-math-bezier', name: 'Bezier', blogSlug: 'game-math-bezier' },
              { id: 'game-math-catmull', name: 'Catmull-Rom', blogSlug: 'game-math-catmull' }
            ]
          },
          {
            id: 'game-languages-picking',
            name: 'Programming Languages',
            subtopics: [
              { id: 'game-lang-csharp', name: 'C#', blogSlug: 'game-lang-csharp' },
              { id: 'game-lang-cpp', name: 'C/C++', blogSlug: 'game-lang-cpp' },
              { id: 'game-lang-rust', name: 'Rust', blogSlug: 'game-lang-rust' },
              { id: 'game-lang-python', name: 'Python', blogSlug: 'game-lang-python' },
              { id: 'game-lang-gdscript', name: 'GDScript', blogSlug: 'game-lang-gdscript' }
            ]
          },
          {
            id: 'game-engine-selections',
            name: 'Game Engines',
            subtopics: [
              { id: 'game-engine-unity', name: 'Unity 3D', blogSlug: 'game-engine-unity' },
              { id: 'game-engine-unreal', name: 'Unreal Engine', blogSlug: 'game-engine-unreal' },
              { id: 'game-engine-native', name: 'Native', blogSlug: 'game-engine-native' },
              { id: 'game-engine-godot', name: 'Godot', blogSlug: 'game-engine-godot' }
            ]
          }
        ]
      },
      {
        id: 'game-physics-dynamics-col',
        name: 'Game Physics',
        description: "Newtonian force models, inertia tensor calculations, constraint joints, and collision detection phases.",
        concepts: [
          {
            id: 'physics-dynamics-forces',
            name: 'Rigid Body Dynamics',
            subtopics: [
              { id: 'game-phys-mass-center', name: 'Center of Mass', blogSlug: 'game-phys-mass-center' },
              { id: 'game-phys-inertia', name: 'Moment of Inertia', blogSlug: 'game-phys-inertia' },
              { id: 'game-phys-acceleration', name: 'Acceleration', blogSlug: 'game-phys-acceleration' },
              { id: 'game-phys-joints', name: 'Joints', blogSlug: 'game-phys-joints' },
              { id: 'game-phys-restitution', name: 'Restitution', blogSlug: 'game-phys-restitution' },
              { id: 'game-phys-force', name: 'Force', blogSlug: 'game-phys-force' },
              { id: 'game-phys-angular-vel', name: 'Angular Velocity', blogSlug: 'game-phys-angular-vel' },
              { id: 'game-phys-buoyancy', name: 'Buoyancy', blogSlug: 'game-phys-buoyancy' },
              { id: 'game-phys-friction', name: 'Friction', blogSlug: 'game-phys-friction' },
              { id: 'game-phys-linear-vel', name: 'Linear Velocity', blogSlug: 'game-phys-linear-vel' },
              { id: 'game-phys-dynamics', name: 'Dynamics', blogSlug: 'game-phys-dynamics' }
            ]
          },
          {
            id: 'collision-phases-detection',
            name: 'Collision Detection',
            subtopics: [
              { id: 'game-phys-ccd', name: 'CCD', blogSlug: 'game-phys-ccd' },
              { id: 'game-phys-narrow-phase', name: 'Narrow Phase', blogSlug: 'game-phys-narrow-phase' },
              { id: 'game-phys-broad-phase', name: 'Broad Phase', blogSlug: 'game-phys-broad-phase' }
            ]
          },
          {
            id: 'bounding-volumes-obb',
            name: 'Bounding Volume',
            subtopics: [
              { id: 'game-phys-obb', name: 'OBB', blogSlug: 'game-phys-obb' },
              { id: 'game-phys-aabb', name: 'AABB', blogSlug: 'game-phys-aabb' }
            ]
          },
          {
            id: 'intersection-convexity-sat',
            name: 'Intersection & Convexity',
            subtopics: [
              { id: 'game-phys-sat', name: 'SAT', blogSlug: 'game-phys-sat' },
              { id: 'game-phys-gjk', name: 'GJK', blogSlug: 'game-phys-gjk' },
              { id: 'game-phys-epa', name: 'EPA', blogSlug: 'game-phys-epa' },
              { id: 'game-phys-intersection', name: 'Intersection', blogSlug: 'game-phys-intersection' },
              { id: 'game-phys-convexity', name: 'Convexity', blogSlug: 'game-phys-convexity' },
              { id: 'game-phys-convex', name: 'Convex', blogSlug: 'game-phys-convex' },
              { id: 'game-phys-concave', name: 'Concave', blogSlug: 'game-phys-concave' },
              { id: 'game-phys-convex-hull', name: 'Convex Hull', blogSlug: 'game-phys-convex-hull' },
              { id: 'game-phys-convex-dec', name: 'Convex Decomposition', blogSlug: 'game-phys-convex-dec' }
            ]
          },
          {
            id: 'spatial-partitioning-bvh',
            name: 'Spatial Partitioning',
            subtopics: [
              { id: 'game-phys-sweep', name: 'Sort & Sweep', blogSlug: 'game-phys-sweep' },
              { id: 'game-phys-dbvt', name: 'DBVT', blogSlug: 'game-phys-dbvt' },
              { id: 'game-phys-bvh', name: 'BVH', blogSlug: 'game-phys-bvh' }
            ]
          }
        ]
      },
      {
        id: 'game-graphics-shading',
        name: 'Computer Graphics',
        description: "Raytracing, rasterization math, graphic shading equations, textures, and perception frames.",
        concepts: [
          {
            id: 'graphics-fundamentals-ray',
            name: 'Graphics Fundamentals',
            subtopics: [
              { id: 'game-gfx-ray-tracing', name: 'Ray Tracing', blogSlug: 'game-gfx-ray-tracing' },
              { id: 'game-gfx-rasterization', name: 'Rasterization', blogSlug: 'game-gfx-rasterization' },
              { id: 'game-gfx-pipeline', name: 'Graphics Pipeline', blogSlug: 'game-gfx-pipeline' },
              { id: 'game-gfx-sampling', name: 'Sampling', blogSlug: 'game-gfx-sampling' },
              { id: 'game-gfx-shader', name: 'Shader', blogSlug: 'game-gfx-shader' },
              { id: 'game-gfx-rendering-eq', name: 'Rendering Equation', blogSlug: 'game-gfx-rendering-eq' },
              { id: 'game-gfx-mapping', name: 'Mapping', blogSlug: 'game-gfx-mapping' },
              { id: 'game-gfx-reflection', name: 'Reflection', blogSlug: 'game-gfx-reflection' },
              { id: 'game-gfx-texture', name: 'Texture', blogSlug: 'game-gfx-texture' },
              { id: 'game-gfx-diffuse', name: 'Diffuse', blogSlug: 'game-gfx-diffuse' },
              { id: 'game-gfx-bump', name: 'Bump', blogSlug: 'game-gfx-bump' },
              { id: 'game-gfx-specular', name: 'Specular', blogSlug: 'game-gfx-specular' },
              { id: 'game-gfx-parallax', name: 'Parallax', blogSlug: 'game-gfx-parallax' },
              { id: 'game-gfx-horizon', name: 'Horizon', blogSlug: 'game-gfx-horizon' }
            ]
          },
          {
            id: 'animation-perception-color',
            name: 'Animation & Perception',
            subtopics: [
              { id: 'game-gfx-animation', name: 'Computer Animation', blogSlug: 'game-gfx-animation' },
              { id: 'game-gfx-color', name: 'Color', blogSlug: 'game-gfx-color' },
              { id: 'game-gfx-perception', name: 'Visual Perception', blogSlug: 'game-gfx-perception' },
              { id: 'game-gfx-tone', name: 'Tone Reproduction', blogSlug: 'game-gfx-tone' }
            ]
          }
        ]
      },
      {
        id: 'lighting-shadow-visibility',
        name: 'Lighting and Shadow',
        description: "Directional lights, light probes, shadow map buffers, occluders, and frustum culling checks.",
        concepts: [
          {
            id: 'lighting-shadow-sources',
            name: 'Lighting and Shadow',
            subtopics: [
              { id: 'game-light-shadow-map', name: 'Shadow Map', blogSlug: 'game-light-shadow-map' },
              { id: 'game-light-source', name: 'Light Source', blogSlug: 'game-light-source' },
              { id: 'game-light-2d', name: '2D', blogSlug: 'game-light-2d' },
              { id: 'game-light-cube', name: 'Cube', blogSlug: 'game-light-cube' },
              { id: 'game-light-directional', name: 'Directional', blogSlug: 'game-light-directional' },
              { id: 'game-light-spot', name: 'Spot', blogSlug: 'game-light-spot' },
              { id: 'game-light-cascaded', name: 'Cascaded', blogSlug: 'game-light-cascaded' },
              { id: 'game-light-infinite', name: 'Infinite', blogSlug: 'game-light-infinite' },
              { id: 'game-light-point', name: 'Point', blogSlug: 'game-light-point' },
              { id: 'game-light-stencil-shadow', name: 'Stencil Shadow', blogSlug: 'game-light-stencil-shadow' }
            ]
          },
          {
            id: 'visibility-occlusion-cull',
            name: 'Visibility and Occlusion',
            subtopics: [
              { id: 'game-vis-occluder', name: 'Occluder', blogSlug: 'game-vis-occluder' },
              { id: 'game-vis-culling', name: 'Culling', blogSlug: 'game-vis-culling' },
              { id: 'game-vis-clipping', name: 'Clipping', blogSlug: 'game-vis-clipping' },
              { id: 'game-vis-fog', name: 'Fog', blogSlug: 'game-vis-fog' },
              { id: 'game-vis-frustum', name: 'Frustum', blogSlug: 'game-vis-frustum' },
              { id: 'game-vis-polygon', name: 'Polygon', blogSlug: 'game-vis-polygon' },
              { id: 'game-vis-light', name: 'Light', blogSlug: 'game-vis-light' },
              { id: 'game-vis-polyhedron', name: 'Polyhedron', blogSlug: 'game-vis-polyhedron' },
              { id: 'game-vis-shadow', name: 'Shadow', blogSlug: 'game-vis-shadow' }
            ]
          }
        ]
      },
      {
        id: 'game-graphics-apis',
        name: 'Graphics API',
        description: "Vulkan, OpenGL ES, Metal runtime binds, and HLSL/GLSL shaders pipelines.",
        concepts: [
          {
            id: 'apis-shading-languages',
            name: 'Graphics API Core',
            subtopics: [
              { id: 'game-api-hlsl', name: 'HLSL', blogSlug: 'game-api-hlsl' },
              { id: 'game-api-glsl', name: 'GLSL', blogSlug: 'game-api-glsl' },
              { id: 'game-api-spirv', name: 'SPIR-V', blogSlug: 'game-api-spirv' },
              { id: 'game-api-directx', name: 'DirectX', blogSlug: 'game-api-directx' },
              { id: 'game-api-opengl', name: 'OpenGL', blogSlug: 'game-api-opengl' },
              { id: 'game-api-vulkan', name: 'Vulkan', blogSlug: 'game-api-vulkan' }
            ]
          },
          {
            id: 'mobile-web-apis',
            name: 'Mobile & Web APIs',
            subtopics: [
              { id: 'game-api-opengles', name: 'OpenGL ES', blogSlug: 'game-api-opengles' },
              { id: 'game-api-metal', name: 'Metal', blogSlug: 'game-api-metal' },
              { id: 'game-api-webgl', name: 'WebGL', blogSlug: 'game-api-webgl' }
            ]
          }
        ]
      },
      {
        id: 'game-ai-behavior',
        name: 'Game AI',
        description: "State machines, behavior tree nodes, pathfinding heuristic rules, and deep learning network brains.",
        concepts: [
          {
            id: 'ai-decision-making-bts',
            name: 'Decision Making',
            subtopics: [
              { id: 'game-ai-decision-tree', name: 'Decision Tree', blogSlug: 'game-ai-decision-tree' },
              { id: 'game-ai-state-machine', name: 'State Machine', blogSlug: 'game-ai-state-machine' },
              { id: 'game-ai-behavior-tree', name: 'Behavior Tree', blogSlug: 'game-ai-behavior-tree' },
              { id: 'game-ai-fuzzy', name: 'Fuzzy Logic', blogSlug: 'game-ai-fuzzy' },
              { id: 'game-ai-markov', name: 'Markov System', blogSlug: 'game-ai-markov' },
              { id: 'game-ai-goal-oriented', name: 'Goal Oriented Behavior', blogSlug: 'game-ai-goal-oriented' }
            ]
          },
          {
            id: 'ai-movement-board-minimax',
            name: 'Movement & Board Games',
            subtopics: [
              { id: 'game-ai-board-game', name: 'Board Game', blogSlug: 'game-ai-board-game' },
              { id: 'game-ai-minimax', name: 'Minimax', blogSlug: 'game-ai-minimax' },
              { id: 'game-ai-ab-pruning', name: 'AB Pruning', blogSlug: 'game-ai-ab-pruning' },
              { id: 'game-ai-mcts', name: 'MCTS', blogSlug: 'game-ai-mcts' }
            ]
          },
          {
            id: 'ai-machine-learning-nets',
            name: 'Learning',
            subtopics: [
              { id: 'game-ai-naive-bayes', name: 'Naive Bayes Classifier', blogSlug: 'game-ai-naive-bayes' },
              { id: 'game-ai-decision-learning', name: 'Decision Learning', blogSlug: 'game-ai-decision-learning' },
              { id: 'game-ai-reinforcement', name: 'Reinforcements Learning', blogSlug: 'game-ai-reinforcement' },
              { id: 'game-ai-dt-learning', name: 'Decision Tree Learning', blogSlug: 'game-ai-dt-learning' },
              { id: 'game-ai-deep-learning', name: 'Deep Learning', blogSlug: 'game-ai-deep-learning' },
              { id: 'game-ai-neural-net', name: 'Artificial Neural Network', blogSlug: 'game-ai-neural-net' }
            ]
          }
        ]
      },
      {
        id: 'advanced-rendering-tech',
        name: 'Advanced Rendering',
        description: "Microfacet BRDF distributions, translucency buffers, energy conservation checks, and hardware RT pipelines.",
        concepts: [
          {
            id: 'pbr-rendering-math',
            name: 'Physically-Based Rendering',
            subtopics: [
              { id: 'game-adv-microsurface', name: 'Microsurface Scattering', blogSlug: 'game-adv-microsurface' },
              { id: 'game-adv-translucency', name: 'Translucency & Transparency', blogSlug: 'game-adv-translucency' },
              { id: 'game-adv-energy-cons', name: 'Conservation of Energy', blogSlug: 'game-adv-energy-cons' },
              { id: 'game-adv-metallicity', name: 'Metallicity', blogSlug: 'game-adv-metallicity' }
            ]
          },
          {
            id: 'realtime-raytracing-pipelines',
            name: 'Real-time Ray Tracing',
            subtopics: [
              { id: 'game-adv-dx-rt', name: 'DirectX Ray Tracing', blogSlug: 'game-adv-dx-rt' },
              { id: 'game-adv-vulkan-rt', name: 'Vulkan Ray Tracing', blogSlug: 'game-adv-vulkan-rt' },
              { id: 'game-adv-optix', name: 'OptiX', blogSlug: 'game-adv-optix' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'backend',
    number: '03',
    name: 'Backend',
    difficulty: 'Medium',
    hours: 137,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Learn languages, internet foundations, relational/NoSQL databases, APIs, security, caching, containerization, scaling, and AI in development.',
    topics: [
      {
        id: 'backend-languages-intro',
        name: 'Backend Languages & Internet Basics',
        description: 'VCS, languages, and network operations.',
        concepts: [
          {
            id: 'pick-language',
            name: 'Pick a Backend Language',
            subtopics: [
              { id: 'lang-javascript', name: 'JavaScript', blogSlug: 'lang-javascript' },
              { id: 'lang-go', name: 'Go', blogSlug: 'lang-go' },
              { id: 'lang-python', name: 'Python', blogSlug: 'lang-python' },
              { id: 'lang-ruby', name: 'Ruby', blogSlug: 'lang-ruby' },
              { id: 'lang-java', name: 'Java', blogSlug: 'lang-java' },
              { id: 'lang-csharp', name: 'C#', blogSlug: 'lang-csharp' },
              { id: 'lang-php', name: 'PHP', blogSlug: 'lang-php' },
              { id: 'lang-rust', name: 'Rust', blogSlug: 'lang-rust' },
              { id: 'checkpoint-beginner-projects', name: 'Checkpoint - Beginner Project Ideas', blogSlug: 'checkpoint-beginner-projects' }
            ]
          },
          {
            id: 'internet-foundations',
            name: 'Internet Foundations',
            subtopics: [
              { id: 'internet-how-works-sub', name: 'How does the internet work?', blogSlug: 'internet-how-works-sub' },
              { id: 'what-is-http', name: 'What is HTTP?', blogSlug: 'what-is-http' },
              { id: 'what-is-domain-name', name: 'What is Domain Name?', blogSlug: 'what-is-domain-name' },
              { id: 'what-is-hosting', name: 'What is hosting?', blogSlug: 'what-is-hosting' },
              { id: 'dns-how-works', name: 'DNS and how it works?', blogSlug: 'dns-how-works' },
              { id: 'browsers-how-works', name: 'Browsers and how they work?', blogSlug: 'browsers-how-works' }
            ]
          },
          {
            id: 'frontend-basics',
            name: 'Frontend Basics',
            subtopics: [
              { id: 'frontend-html', name: 'HTML Basics', blogSlug: 'frontend-html' },
              { id: 'frontend-css', name: 'CSS Basics', blogSlug: 'frontend-css' },
              { id: 'frontend-javascript', name: 'JavaScript Basics', blogSlug: 'frontend-javascript' }
            ]
          }
        ]
      },
      {
        id: 'collaboration-databases',
        name: 'VCS, Hosting & Relational DBs',
        description: 'VCS services, schemas, and relational migrations.',
        concepts: [
          {
            id: 'vcs-concepts',
            name: 'Version Control Systems',
            subtopics: [
              { id: 'git-vcs', name: 'Git VCS', blogSlug: 'git-vcs' }
            ]
          },
          {
            id: 'repo-hosting',
            name: 'Repository Hosting Services',
            subtopics: [
              { id: 'github-hosting', name: 'GitHub', blogSlug: 'github-hosting' },
              { id: 'gitlab-hosting', name: 'GitLab', blogSlug: 'gitlab-hosting' }
            ]
          },
          {
            id: 'relational-db-concepts',
            name: 'Relational Databases',
            subtopics: [
              { id: 'db-mysql', name: 'MySQL', blogSlug: 'db-mysql' },
              { id: 'db-postgresql', name: 'PostgreSQL', blogSlug: 'db-postgresql' },
              { id: 'db-mariadb', name: 'MariaDB', blogSlug: 'db-mariadb' },
              { id: 'db-sqlite', name: 'SQLite', blogSlug: 'db-sqlite' },
              { id: 'db-mssql', name: 'MS SQL', blogSlug: 'db-mssql' },
              { id: 'db-oracle', name: 'Oracle', blogSlug: 'db-oracle' },
              { id: 'db-migrations', name: 'Database Migrations', blogSlug: 'db-migrations' },
              { id: 'n-plus-one-problem', name: 'N+1 Query Problem', blogSlug: 'n-plus-one-problem' }
            ]
          }
        ]
      },
      {
        id: 'apis-security',
        name: 'APIs, Security & Authentication',
        description: 'Routing patterns, security specs, and hashing methods.',
        concepts: [
          {
            id: 'api-designs',
            name: 'API Styles & Specs',
            subtopics: [
              { id: 'api-style-rest', name: 'REST APIs', blogSlug: 'api-style-rest' },
              { id: 'api-style-json', name: 'JSON APIs', blogSlug: 'api-style-json' },
              { id: 'api-style-soap', name: 'SOAP APIs', blogSlug: 'api-style-soap' },
              { id: 'api-style-grpc', name: 'gRPC', blogSlug: 'api-style-grpc' },
              { id: 'api-style-graphql', name: 'GraphQL', blogSlug: 'api-style-graphql' },
              { id: 'openapi-specs', name: 'OpenAPI Specifications', blogSlug: 'openapi-specs' }
            ]
          },
          {
            id: 'backend-auth',
            name: 'Authentication & Credentials',
            subtopics: [
              { id: 'auth-jwt', name: 'JWT', blogSlug: 'auth-jwt' },
              { id: 'auth-oauth', name: 'OAuth', blogSlug: 'auth-oauth' },
              { id: 'auth-basic', name: 'Basic Authentication', blogSlug: 'auth-basic' },
              { id: 'auth-token', name: 'Token Authentication', blogSlug: 'auth-token' },
              { id: 'auth-cookie', name: 'Cookie Based Auth', blogSlug: 'auth-cookie' },
              { id: 'auth-openid', name: 'OpenID Connect', blogSlug: 'auth-openid' },
              { id: 'auth-saml', name: 'SAML', blogSlug: 'auth-saml' },
              { id: 'checkpoint-intermediate-projects', name: 'Checkpoint - Intermediate Project Ideas', blogSlug: 'checkpoint-intermediate-projects' }
            ]
          },
          {
            id: 'web-security-hashing',
            name: 'Web Security & Hashing',
            subtopics: [
              { id: 'sec-https', name: 'HTTPS/TLS', blogSlug: 'sec-https' },
              { id: 'sec-owasp', name: 'OWASP Risks', blogSlug: 'sec-owasp' },
              { id: 'sec-cors', name: 'CORS', blogSlug: 'sec-cors' },
              { id: 'sec-ssl-tls', name: 'SSL/TLS', blogSlug: 'sec-ssl-tls' },
              { id: 'sec-csp', name: 'CSP', blogSlug: 'sec-csp' },
              { id: 'sec-server-security', name: 'Server Security', blogSlug: 'sec-server-security' },
              { id: 'sec-api-best-practices', name: 'API Security Best Practices', blogSlug: 'sec-api-best-practices' }
            ]
          },
          {
            id: 'cryptography-hashing',
            name: 'Cryptographic Hashing',
            subtopics: [
              { id: 'hash-md5', name: 'MD5', blogSlug: 'hash-md5' },
              { id: 'hash-sha', name: 'SHA-256', blogSlug: 'hash-sha' },
              { id: 'hash-scrypt', name: 'scrypt', blogSlug: 'hash-scrypt' },
              { id: 'hash-bcrypt', name: 'bcrypt', blogSlug: 'hash-bcrypt' }
            ]
          }
        ]
      },
      {
        id: 'caching-servers',
        name: 'Caching & Web Servers',
        description: 'Memory tiers, web hosts, and reverse proxies.',
        concepts: [
          {
            id: 'cache-servers',
            name: 'Caching Tier',
            subtopics: [
              { id: 'cache-redis', name: 'Redis', blogSlug: 'cache-redis' },
              { id: 'cache-memcached', name: 'Memcached', blogSlug: 'cache-memcached' },
              { id: 'cache-http', name: 'HTTP Caching', blogSlug: 'cache-http' }
            ]
          },
          {
            id: 'servers-web',
            name: 'Web Servers',
            subtopics: [
              { id: 'server-nginx', name: 'Nginx', blogSlug: 'server-nginx' },
              { id: 'server-apache', name: 'Apache', blogSlug: 'server-apache' },
              { id: 'server-caddy', name: 'Caddy', blogSlug: 'server-caddy' },
              { id: 'server-iis', name: 'MS IIS', blogSlug: 'server-iis' }
            ]
          }
        ]
      },
      {
        id: 'ai-in-dev',
        name: 'AI in Development & Assisted Coding',
        description: 'LLM engines, vectors, and AI coding interfaces.',
        concepts: [
          {
            id: 'ai-foundations',
            name: 'AI Basics in Dev',
            subtopics: [
              { id: 'ai-llm-workings', name: 'How LLMs work', blogSlug: 'ai-llm-workings' },
              { id: 'ai-vs-traditional', name: 'AI vs Traditional Coding', blogSlug: 'ai-vs-traditional' },
              { id: 'ai-embeddings', name: 'Embeddings', blogSlug: 'ai-embeddings' },
              { id: 'ai-vectors', name: 'Vectors', blogSlug: 'ai-vectors' },
              { id: 'ai-rags', name: 'RAGs', blogSlug: 'ai-rags' }
            ]
          },
          {
            id: 'ai-coding-tools',
            name: 'AI Assisted Coding Tools',
            subtopics: [
              { id: 'tool-claude-code', name: 'Claude Code', blogSlug: 'tool-claude-code' },
              { id: 'tool-cursor', name: 'Cursor', blogSlug: 'tool-cursor' },
              { id: 'tool-copilot', name: 'Copilot', blogSlug: 'tool-copilot' },
              { id: 'tool-antigravity', name: 'Antigravity', blogSlug: 'tool-antigravity' }
            ]
          },
          {
            id: 'ai-dev-apps',
            name: 'AI Development Applications',
            subtopics: [
              { id: 'ai-app-code-reviews', name: 'Code Reviews', blogSlug: 'ai-app-code-reviews' },
              { id: 'ai-app-refactoring', name: 'Refactoring', blogSlug: 'ai-app-refactoring' },
              { id: 'ai-app-docs', name: 'Documentation Generation', blogSlug: 'ai-app-docs' },
              { id: 'ai-app-streaming', name: 'Streaming', blogSlug: 'ai-app-streaming' },
              { id: 'ai-app-structured-outputs', name: 'Structured Outputs', blogSlug: 'ai-app-structured-outputs' }
            ]
          },
          {
            id: 'prompting-agents',
            name: 'Prompting & Agents',
            subtopics: [
              { id: 'prompt-techniques', name: 'Prompting Techniques', blogSlug: 'prompt-techniques' },
              { id: 'agent-architecture', name: 'Agents', blogSlug: 'agent-architecture' },
              { id: 'mcp-protocol', name: 'MCP', blogSlug: 'mcp-protocol' },
              { id: 'agent-skills', name: 'Skills', blogSlug: 'agent-skills' },
              { id: 'agent-roadmap', name: 'AI Agents Roadmap', blogSlug: 'agent-roadmap' }
            ]
          },
          {
            id: 'ai-vendors',
            name: 'AI Providers',
            subtopics: [
              { id: 'provider-gemini', name: 'Gemini', blogSlug: 'provider-gemini' },
              { id: 'provider-openai', name: 'OpenAI', blogSlug: 'provider-openai' },
              { id: 'provider-anthropic', name: 'Anthropic', blogSlug: 'provider-anthropic' }
            ]
          }
        ]
      },
      {
        id: 'advanced-backend-testing',
        name: 'CI/CD, Databases & Testing',
        description: 'Deployment scripts, database internals, and testing.',
        concepts: [
          {
            id: 'advanced-ci-cd',
            name: 'Continuous Integration & Delivery',
            subtopics: [
              { id: 'cicd-integration', name: 'Continuous Integration', blogSlug: 'cicd-integration' },
              { id: 'cicd-deployment', name: 'Continuous Deployment', blogSlug: 'cicd-deployment' }
            ]
          },
          {
            id: 'testing-types',
            name: 'Testing Methodologies',
            subtopics: [
              { id: 'test-integration', name: 'Integration Testing', blogSlug: 'test-integration' },
              { id: 'test-unit', name: 'Unit Testing', blogSlug: 'test-unit' },
              { id: 'test-functional', name: 'Functional Testing', blogSlug: 'test-functional' }
            ]
          },
          {
            id: 'advanced-db',
            name: 'Advanced Relational Databases',
            subtopics: [
              { id: 'db-transactions', name: 'Database Transactions', blogSlug: 'db-transactions' },
              { id: 'db-orms', name: 'ORMs', blogSlug: 'db-orms' },
              { id: 'db-acid', name: 'ACID Properties', blogSlug: 'db-acid' },
              { id: 'db-normalization-advanced', name: 'Database Normalization', blogSlug: 'db-normalization-advanced' },
              { id: 'db-failure-modes', name: 'Failure Modes', blogSlug: 'db-failure-modes' },
              { id: 'db-performance-profiling', name: 'Profiling Performance', blogSlug: 'db-performance-profiling' }
            ]
          }
        ]
      },
      {
        id: 'containers-brokers',
        name: 'Containers & Messaging',
        description: 'Docker clusters and message queue networks.',
        concepts: [
          {
            id: 'containers-orch',
            name: 'Containerization & Orchestration',
            subtopics: [
              { id: 'container-docker', name: 'Docker', blogSlug: 'container-docker' },
              { id: 'container-lxc', name: 'LXC', blogSlug: 'container-lxc' },
              { id: 'orch-kubernetes', name: 'Kubernetes', blogSlug: 'orch-kubernetes' }
            ]
          },
          {
            id: 'messaging-systems',
            name: 'Message Brokers',
            subtopics: [
              { id: 'broker-kafka', name: 'Kafka', blogSlug: 'broker-kafka' },
              { id: 'broker-rabbitmq', name: 'RabbitMQ', blogSlug: 'broker-rabbitmq' }
            ]
          }
        ]
      },
      {
        id: 'architecture-search-realtime',
        name: 'Architecture & Real-Time Data',
        description: 'Systems topologies, searching, and web feeds.',
        concepts: [
          {
            id: 'architecture-patterns-concepts',
            name: 'Architectural Patterns',
            subtopics: [
              { id: 'pattern-monolith', name: 'Monolith', blogSlug: 'pattern-monolith' },
              { id: 'pattern-microservices', name: 'Microservices', blogSlug: 'pattern-microservices' },
              { id: 'pattern-soa', name: 'SOA', blogSlug: 'pattern-soa' },
              { id: 'pattern-serverless', name: 'Serverless', blogSlug: 'pattern-serverless' },
              { id: 'pattern-service-mesh', name: 'Service Mesh', blogSlug: 'pattern-service-mesh' },
              { id: 'pattern-twelve-factor', name: 'Twelve Factor Apps', blogSlug: 'pattern-twelve-factor' }
            ]
          },
          {
            id: 'search-engines-concepts',
            name: 'Search Engines',
            subtopics: [
              { id: 'search-elasticsearch', name: 'Elasticsearch', blogSlug: 'search-elasticsearch' },
              { id: 'search-solr', name: 'Solr', blogSlug: 'search-solr' }
            ]
          },
          {
            id: 'real-time-protocols',
            name: 'Real-Time Communication',
            subtopics: [
              { id: 'realtime-sse', name: 'Server Sent Events', blogSlug: 'realtime-sse' },
              { id: 'realtime-websockets', name: 'WebSockets', blogSlug: 'realtime-websockets' },
              { id: 'realtime-polling', name: 'Long / Short Polling', blogSlug: 'realtime-polling' }
            ]
          }
        ]
      },
      {
        id: 'scaling-nosql',
        name: 'Scaling Databases & NoSQL Systems',
        description: 'Load shielding, NoSQL types, and failover bounds.',
        concepts: [
          {
            id: 'scaling-relational',
            name: 'Scaling Databases',
            subtopics: [
              { id: 'scale-db-indexes', name: 'Database Indexes', blogSlug: 'scale-db-indexes' },
              { id: 'scale-data-replication', name: 'Data Replication', blogSlug: 'scale-data-replication' },
              { id: 'scale-sharding', name: 'Sharding Strategies', blogSlug: 'scale-sharding' },
              { id: 'scale-cap-theorem', name: 'CAP Theorem', blogSlug: 'scale-cap-theorem' }
            ]
          },
          {
            id: 'nosql-db-systems',
            name: 'NoSQL Databases',
            subtopics: [
              { id: 'nosql-firebase', name: 'Firebase', blogSlug: 'nosql-firebase' },
              { id: 'nosql-rethinkdb', name: 'RethinkDB', blogSlug: 'nosql-rethinkdb' },
              { id: 'nosql-mongodb', name: 'MongoDB', blogSlug: 'nosql-mongodb' },
              { id: 'nosql-couchdb', name: 'CouchDB', blogSlug: 'nosql-couchdb' },
              { id: 'nosql-redis', name: 'Redis', blogSlug: 'nosql-redis' },
              { id: 'nosql-dynamodb', name: 'DynamoDB', blogSlug: 'nosql-dynamodb' },
              { id: 'nosql-clickhouse', name: 'ClickHouse', blogSlug: 'nosql-clickhouse' },
              { id: 'nosql-cassandra', name: 'Cassandra', blogSlug: 'nosql-cassandra' },
              { id: 'nosql-scylladb', name: 'ScyllaDB', blogSlug: 'nosql-scylladb' },
              { id: 'nosql-neo4j', name: 'Neo4j', blogSlug: 'nosql-neo4j' },
              { id: 'nosql-neptune', name: 'AWS Neptune', blogSlug: 'nosql-neptune' },
              { id: 'nosql-dgraph', name: 'DGraph', blogSlug: 'nosql-dgraph' },
              { id: 'nosql-influxdb', name: 'Influx DB', blogSlug: 'nosql-influxdb' },
              { id: 'nosql-timescaledb', name: 'TimescaleDB', blogSlug: 'nosql-timescaledb' }
            ]
          },
          {
            id: 'scaling-mitigation',
            name: 'Building for Scale & Mitigation',
            subtopics: [
              { id: 'scale-obs-core', name: 'Observability Core Concepts', blogSlug: 'scale-obs-core' },
              { id: 'scale-obs-instrumentation', name: 'Instrumentation', blogSlug: 'scale-obs-instrumentation' },
              { id: 'scale-obs-monitoring', name: 'Monitoring', blogSlug: 'scale-obs-monitoring' },
              { id: 'scale-obs-telemetry', name: 'Telemetry', blogSlug: 'scale-obs-telemetry' },
              { id: 'mit-graceful', name: 'Graceful Degradation', blogSlug: 'mit-graceful' },
              { id: 'mit-throttling', name: 'Throttling', blogSlug: 'mit-throttling' },
              { id: 'mit-backpressure', name: 'Backpressure', blogSlug: 'mit-backpressure' },
              { id: 'mit-loadshifting', name: 'Loadshifting', blogSlug: 'mit-loadshifting' },
              { id: 'mit-circuit', name: 'Circuit Breaker', blogSlug: 'mit-circuit' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'network-engineering',
    number: '04',
    name: 'Network Engineering',
    difficulty: 'Medium',
    hours: 80,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'OSI layers, routing protocols, subnetting, VPNs, firewalls, and cloud networking automation.',
    topics: [
      {
        id: 'intro-basics',
        name: 'Introduction & Basics',
        description: 'Basic terminology and network classifications.',
        concepts: [
          {
            id: 'terminology',
            name: 'Terminology',
            subtopics: [
              { id: 'client-server-host', name: 'Client, Server, Host', blogSlug: 'client-server-host' },
              { id: 'packets-frames', name: 'Packets & Frames', blogSlug: 'packets-frames' },
              { id: 'bandwidth-latency', name: 'Bandwidth & Latency', blogSlug: 'bandwidth-latency' },
              { id: 'ports-sockets', name: 'Ports & Sockets', blogSlug: 'ports-sockets' },
              { id: 'mac-arp', name: 'MAC Address & ARP', blogSlug: 'mac-arp' }
            ]
          },
          {
            id: 'network-types',
            name: 'Network Types',
            subtopics: [
              { id: 'lan-wan', name: 'LAN & WAN', blogSlug: 'lan-wan' },
              { id: 'vpn-cloud', name: 'VPN & Cloud', blogSlug: 'vpn-cloud' },
              { id: 'p2p-client-server', name: 'P2P vs Client-Server', blogSlug: 'p2p-client-server' }
            ]
          }
        ]
      },
      {
        id: 'architectures',
        name: 'Network Architectures',
        description: 'Reference models and design principles.',
        concepts: [
          {
            id: 'models',
            name: 'Models',
            subtopics: [
              { id: 'osi-model', name: 'OSI 7 Layers', blogSlug: 'osi-model' },
              { id: 'tcp-ip-model', name: 'TCP/IP Model', blogSlug: 'tcp-ip-model' }
            ]
          },
          {
            id: 'design-principles',
            name: 'Design Principles',
            subtopics: [
              { id: 'two-three-tier', name: 'Two-Tier & Three-Tier', blogSlug: 'two-three-tier' },
              { id: 'spine-leaf', name: 'Spine-Leaf', blogSlug: 'spine-leaf' }
            ]
          }
        ]
      },
      {
        id: 'devices-simulators',
        name: 'Devices & Simulators',
        description: 'Physical hardware and virtual testing.',
        concepts: [
          {
            id: 'hardware',
            name: 'Hardware',
            subtopics: [
              { id: 'routers-switches', name: 'Routers & Switches', blogSlug: 'routers-switches' },
              { id: 'hubs-modems', name: 'Hubs & Modems', blogSlug: 'hubs-modems' },
              { id: 'access-points', name: 'Access Points', blogSlug: 'access-points' }
            ]
          },
          {
            id: 'simulators',
            name: 'Simulators',
            subtopics: [
              { id: 'packet-tracer', name: 'Cisco Packet Tracer', blogSlug: 'packet-tracer' },
              { id: 'gns3-eve', name: 'GNS3 & EVE-NG', blogSlug: 'gns3-eve' }
            ]
          }
        ]
      },
      {
        id: 'protocols-dns',
        name: 'Protocols & DNS',
        description: 'Core application layer protocols and resolution.',
        concepts: [
          {
            id: 'core-protocols',
            name: 'Core Protocols',
            subtopics: [
              { id: 'http-https', name: 'HTTP / HTTPS', blogSlug: 'http-https' },
              { id: 'ssh-ssl-tls', name: 'SSH & SSL/TLS', blogSlug: 'ssh-ssl-tls' },
              { id: 'ftp-smtp-dhcp', name: 'FTP, SMTP, DHCP', blogSlug: 'ftp-smtp-dhcp' }
            ]
          },
          {
            id: 'dns',
            name: 'DNS',
            subtopics: [
              { id: 'dns-resolution', name: 'DNS Resolution', blogSlug: 'dns-resolution' },
              { id: 'dns-servers', name: 'Cloudflare & Google DNS', blogSlug: 'dns-servers' }
            ]
          }
        ]
      },
      {
        id: 'ip-subnetting',
        name: 'IP Addressing & Subnetting',
        description: 'IPv4, IPv6, NAT, and Subnet math.',
        concepts: [
          {
            id: 'addressing',
            name: 'Addressing',
            subtopics: [
              { id: 'ipv4-ipv6', name: 'IPv4 vs IPv6', blogSlug: 'ipv4-ipv6' },
              { id: 'public-private', name: 'Public vs Private', blogSlug: 'public-private' },
              { id: 'nat-pat', name: 'Static/Dynamic NAT & PAT', blogSlug: 'nat-pat' }
            ]
          },
          {
            id: 'subnetting',
            name: 'Subnetting',
            subtopics: [
              { id: 'subnet-masks', name: 'Subnet Masks', blogSlug: 'subnet-masks' },
              { id: 'cidr-vlsm', name: 'CIDR & VLSM', blogSlug: 'cidr-vlsm' },
              { id: 'supernetting', name: 'Supernetting', blogSlug: 'supernetting' }
            ]
          }
        ]
      },
      {
        id: 'routing-switching',
        name: 'Routing & Switching',
        description: 'Routing protocols, VLANs, and secure tunneling.',
        concepts: [
          {
            id: 'routing',
            name: 'Routing',
            subtopics: [
              { id: 'bgp-ospf', name: 'BGP & OSPF', blogSlug: 'bgp-ospf' },
              { id: 'rip-eigrp-mpls', name: 'RIP, EIGRP, MPLS', blogSlug: 'rip-eigrp-mpls' },
              { id: 'static-dynamic', name: 'Static vs Dynamic', blogSlug: 'static-dynamic' }
            ]
          },
          {
            id: 'switching',
            name: 'Switching',
            subtopics: [
              { id: 'vlans-vxlan', name: 'VLANs & VXLAN', blogSlug: 'vlans-vxlan' },
              { id: 'stp-mac', name: 'STP & MAC Tables', blogSlug: 'stp-mac' }
            ]
          },
          {
            id: 'tunneling-vpns',
            name: 'Tunneling & VPNs',
            subtopics: [
              { id: 'ipsec-ssl-vpn', name: 'IPSec vs SSL VPN', blogSlug: 'ipsec-ssl-vpn' },
              { id: 'site-to-remote', name: 'Site-to-Site vs Remote', blogSlug: 'site-to-remote' },
              { id: 'mpls-gre', name: 'MPLS VPN & GRE', blogSlug: 'mpls-gre' }
            ]
          }
        ]
      },
      {
        id: 'wireless-tech',
        name: 'Wireless Technologies',
        description: 'WiFi standards, security, and mobile networks.',
        concepts: [
          {
            id: 'standards',
            name: 'Standards',
            subtopics: [
              { id: 'wifi-bluetooth', name: 'WiFi & Bluetooth', blogSlug: 'wifi-bluetooth' },
              { id: 'nfc-mobile', name: 'NFC & Mobile Networks', blogSlug: 'nfc-mobile' }
            ]
          },
          {
            id: 'management',
            name: 'Management',
            subtopics: [
              { id: 'ap-placement', name: 'AP Placement & Coverage', blogSlug: 'ap-placement' },
              { id: 'channel-planning', name: 'Channel Planning & Roaming', blogSlug: 'channel-planning' },
              { id: 'wireless-security', name: 'WPA vs WPS', blogSlug: 'wireless-security' }
            ]
          }
        ]
      },
      {
        id: 'ha-traffic',
        name: 'High Availability & Traffic',
        description: 'Redundancy and shaping traffic for performance.',
        concepts: [
          {
            id: 'redundancy',
            name: 'Redundancy',
            subtopics: [
              { id: 'hsrp-vrrp', name: 'HSRP & VRRP', blogSlug: 'hsrp-vrrp' },
              { id: 'glbp', name: 'GLBP', blogSlug: 'glbp' }
            ]
          },
          {
            id: 'traffic-management',
            name: 'Traffic Management',
            subtopics: [
              { id: 'qos-shaping', name: 'QoS & Traffic Shaping', blogSlug: 'qos-shaping' },
              { id: 'load-balancing-algos', name: 'Round Robin & Least Conn', blogSlug: 'load-balancing-algos' },
              { id: 'failover', name: 'Failover', blogSlug: 'failover' }
            ]
          }
        ]
      },
      {
        id: 'security-troubleshooting',
        name: 'Network Security & Troubleshooting',
        description: 'Firewalls, attack mitigation, and diagnostic tools.',
        concepts: [
          {
            id: 'firewalls',
            name: 'Firewalls',
            subtopics: [
              { id: 'packet-filtering', name: 'Packet Filtering', blogSlug: 'packet-filtering' },
              { id: 'stateful-proxy', name: 'Stateful & Proxy', blogSlug: 'stateful-proxy' },
              { id: 'next-gen-waf', name: 'Next-Gen & WAF', blogSlug: 'next-gen-waf' }
            ]
          },
          {
            id: 'protection',
            name: 'Protection',
            subtopics: [
              { id: 'ids-ips', name: 'IDS / IPS & ACLs', blogSlug: 'ids-ips' },
              { id: 'zero-trust', name: 'Zero Trust Architecture', blogSlug: 'zero-trust' },
              { id: 'dos-ddos', name: 'DoS & DDoS Mitigation', blogSlug: 'dos-ddos' }
            ]
          },
          {
            id: 'troubleshooting',
            name: 'Troubleshooting',
            subtopics: [
              { id: 'ping-traceroute', name: 'Ping & Traceroute', blogSlug: 'ping-traceroute' },
              { id: 'netstat-wireshark', name: 'Netstat & Wireshark', blogSlug: 'netstat-wireshark' }
            ]
          }
        ]
      },
      {
        id: 'cloud-networking',
        name: 'Cloud Networking',
        description: 'VPCs, Cloud VPNs, and provider architectures.',
        concepts: [
          {
            id: 'cloud-providers',
            name: 'Cloud Providers',
            subtopics: [
              { id: 'aws-vpc', name: 'AWS VPCs', blogSlug: 'aws-vpc' },
              { id: 'azure-vnet', name: 'Azure & GCP', blogSlug: 'azure-vnet' }
            ]
          },
          {
            id: 'cloud-architecture',
            name: 'Cloud Architecture',
            subtopics: [
              { id: 'cloud-routing', name: 'Cloud Routing & LB', blogSlug: 'cloud-routing' },
              { id: 'security-groups', name: 'Security Groups', blogSlug: 'security-groups' },
              { id: 'cloud-vpn', name: 'Cloud VPN', blogSlug: 'cloud-vpn' }
            ]
          }
        ]
      },
      {
        id: 'automation-observability',
        name: 'Automation & Observability',
        description: 'IaC, Python networking, and monitoring tools.',
        concepts: [
          {
            id: 'automation-iac',
            name: 'Automation & IaC',
            subtopics: [
              { id: 'python-networking', name: 'Python for Networking', blogSlug: 'python-networking' },
              { id: 'netconf-restconf', name: 'NETCONF & RESTCONF', blogSlug: 'netconf-restconf' },
              { id: 'ansible-terraform', name: 'Ansible & Terraform', blogSlug: 'ansible-terraform' }
            ]
          },
          {
            id: 'monitoring',
            name: 'Monitoring',
            subtopics: [
              { id: 'snmp-netflow', name: 'SNMP & NetFlow', blogSlug: 'snmp-netflow' },
              { id: 'prometheus-grafana', name: 'Prometheus & Grafana', blogSlug: 'prometheus-grafana' },
              { id: 'datadog', name: 'Datadog & Dynatrace', blogSlug: 'datadog' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'android-development',
    number: '05',
    name: 'Android Development',
    difficulty: 'Medium',
    hours: 97,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Learn Kotlin, Java, core App Components, Jetpack Compose layouts, legacy XML views, storage options, networking APIs, debugging, and distribution frameworks.',
    topics: [
      {
        id: 'android-languages-intro',
        name: 'Pick a Language & VCS',
        description: 'VCS services, languages, and version control.',
        concepts: [
          {
            id: 'pick-android-language',
            name: 'Pick a Language',
            subtopics: [
              { id: 'android-lang-kotlin', name: 'Kotlin', blogSlug: 'android-lang-kotlin' },
              { id: 'android-lang-java', name: 'Java', blogSlug: 'android-lang-java' }
            ]
          },
          {
            id: 'android-vcs-concepts',
            name: 'Version Control Systems',
            subtopics: [
              { id: 'android-git', name: 'Git', blogSlug: 'android-git' }
            ]
          },
          {
            id: 'android-vcs-hosting',
            name: 'VCS Hosting',
            subtopics: [
              { id: 'android-github', name: 'GitHub', blogSlug: 'android-github' },
              { id: 'android-bitbucket', name: 'Bitbucket', blogSlug: 'android-bitbucket' },
              { id: 'android-gitlab', name: 'GitLab', blogSlug: 'android-gitlab' }
            ]
          }
        ]
      },
      {
        id: 'android-fundamentals-gradle',
        name: 'The Fundamentals & Core Components',
        description: 'Development environment, Gradle configuration, lifecycle states, and intents.',
        concepts: [
          {
            id: 'android-basics',
            name: 'Android Core Fundamentals',
            subtopics: [
              { id: 'android-ide', name: 'Development IDE', blogSlug: 'android-ide' },
              { id: 'android-kotlin-basics', name: 'Basics of Kotlin', blogSlug: 'android-kotlin-basics' },
              { id: 'android-oop-basics', name: 'Basics of OOP', blogSlug: 'android-oop-basics' },
              { id: 'android-dsa-basics', name: 'Data Structures and Algorithms', blogSlug: 'android-dsa-basics' },
              { id: 'android-gradle', name: 'What is and how to use Gradle?', blogSlug: 'android-gradle' },
              { id: 'android-hello-world', name: 'Create a Basic Hello World App', blogSlug: 'android-hello-world' }
            ]
          },
          {
            id: 'android-components',
            name: 'Core Components',
            subtopics: [
              { id: 'android-activity-lifecycle', name: 'Activity LifeCycle', blogSlug: 'android-activity-lifecycle' },
              { id: 'android-state-changes', name: 'State Changes', blogSlug: 'android-state-changes' },
              { id: 'android-tasks-backstack', name: 'Tasks & Backstack', blogSlug: 'android-tasks-backstack' },
              { id: 'android-implicit-intents', name: 'Implicit Intents', blogSlug: 'android-implicit-intents' },
              { id: 'android-explicit-intents', name: 'Explicit Intents', blogSlug: 'android-explicit-intents' },
              { id: 'android-intent-filters', name: 'Intent Filters', blogSlug: 'android-intent-filters' },
              { id: 'android-content-provider', name: 'Content Provider', blogSlug: 'android-content-provider' },
              { id: 'android-broadcast-receiver', name: 'Broadcast Receiver', blogSlug: 'android-broadcast-receiver' }
            ]
          }
        ]
      },
      {
        id: 'android-layouts-compose',
        name: 'Interface & Navigation',
        description: 'Jetpack Compose components, states, side effects, and legacy XML layout structures.',
        concepts: [
          {
            id: 'android-jetpack-compose',
            name: 'Jetpack Compose UI',
            subtopics: [
              { id: 'compose-column-row', name: 'Column / Row', blogSlug: 'compose-column-row' },
              { id: 'compose-lazy-column-row', name: 'Lazy Column / Row', blogSlug: 'compose-lazy-column-row' },
              { id: 'compose-box', name: 'Box', blogSlug: 'compose-box' },
              { id: 'compose-scaffold', name: 'Scaffold', blogSlug: 'compose-scaffold' },
              { id: 'compose-constraint-layout', name: 'ConstraintLayout', blogSlug: 'compose-constraint-layout' },
              { id: 'compose-text', name: 'Text Element', blogSlug: 'compose-text' },
              { id: 'compose-button', name: 'Button Element', blogSlug: 'compose-button' },
              { id: 'compose-icon', name: 'Icon Element', blogSlug: 'compose-icon' },
              { id: 'compose-image', name: 'Image Element', blogSlug: 'compose-image' },
              { id: 'compose-textfield', name: 'TextField Element', blogSlug: 'compose-textfield' },
              { id: 'compose-card', name: 'Card Element', blogSlug: 'compose-card' },
              { id: 'compose-bottomsheet', name: 'BottomSheet', blogSlug: 'compose-bottomsheet' },
              { id: 'compose-tabrow', name: 'TabRow', blogSlug: 'compose-tabrow' },
              { id: 'compose-dialog', name: 'Dialog', blogSlug: 'compose-dialog' },
              { id: 'compose-animations', name: 'Animations', blogSlug: 'compose-animations' },
              { id: 'compose-drawer', name: 'Drawer', blogSlug: 'compose-drawer' }
            ]
          },
          {
            id: 'android-compose-state',
            name: 'Compose State & Navigation',
            subtopics: [
              { id: 'compose-navhost', name: 'NavHost', blogSlug: 'compose-navhost' },
              { id: 'compose-remember-state', name: 'remember / State', blogSlug: 'compose-remember-state' },
              { id: 'compose-viewmodel-state', name: 'ViewModel state', blogSlug: 'compose-viewmodel-state' },
              { id: 'compose-side-effects', name: 'Side effects', blogSlug: 'compose-side-effects' }
            ]
          },
          {
            id: 'android-legacy-views',
            name: 'Legacy XML Views',
            subtopics: [
              { id: 'xml-textview', name: 'TextView', blogSlug: 'xml-textview' },
              { id: 'xml-imageview', name: 'ImageView', blogSlug: 'xml-imageview' },
              { id: 'xml-fragments', name: 'Fragments', blogSlug: 'xml-fragments' },
              { id: 'xml-recyclerview', name: 'RecyclerView', blogSlug: 'xml-recyclerview' },
              { id: 'xml-constraint', name: 'ConstraintLayout XML', blogSlug: 'xml-constraint' }
            ]
          },
          {
            id: 'android-navigation-components',
            name: 'Navigation Components',
            subtopics: [
              { id: 'android-jetpack-compose-core', name: 'Jetpack Compose Layout', blogSlug: 'android-jetpack-compose-core' },
              { id: 'android-app-shortcuts', name: 'App Shortcuts', blogSlug: 'android-app-shortcuts' },
              { id: 'android-navigation-core', name: 'Navigation Components', blogSlug: 'android-navigation-core' }
            ]
          }
        ]
      },
      {
        id: 'android-design-architecture',
        name: 'Design & Architecture',
        description: 'Architectural patterns, code design patterns, and dependency injections.',
        concepts: [
          {
            id: 'android-arch-patterns',
            name: 'Architectural Patterns',
            subtopics: [
              { id: 'arch-mvi', name: 'MVI', blogSlug: 'arch-mvi' },
              { id: 'arch-mvvm', name: 'MVVM', blogSlug: 'arch-mvvm' },
              { id: 'arch-mvp', name: 'MVP', blogSlug: 'arch-mvp' },
              { id: 'arch-mvc', name: 'MVC', blogSlug: 'arch-mvc' }
            ]
          },
          {
            id: 'android-design-patterns',
            name: 'Design Patterns',
            subtopics: [
              { id: 'pattern-android-repository', name: 'Repository Pattern', blogSlug: 'pattern-android-repository' },
              { id: 'pattern-android-builder', name: 'Builder Pattern', blogSlug: 'pattern-android-builder' },
              { id: 'pattern-android-factory', name: 'Factory Pattern', blogSlug: 'pattern-android-factory' },
              { id: 'pattern-android-observer', name: 'Observer Pattern', blogSlug: 'pattern-android-observer' },
              { id: 'pattern-android-flow', name: 'Flow', blogSlug: 'pattern-android-flow' },
              { id: 'pattern-android-rxkotlin', name: 'RxKotlin', blogSlug: 'pattern-android-rxkotlin' },
              { id: 'pattern-android-rxjava', name: 'RxJava', blogSlug: 'pattern-android-rxjava' },
              { id: 'pattern-android-livedata', name: 'LiveData', blogSlug: 'pattern-android-livedata' }
            ]
          },
          {
            id: 'android-di',
            name: 'Dependency Injection',
            subtopics: [
              { id: 'di-dagger', name: 'Dagger', blogSlug: 'di-dagger' },
              { id: 'di-hilt', name: 'Hilt', blogSlug: 'di-hilt' },
              { id: 'di-koin', name: 'Koin', blogSlug: 'di-koin' }
            ]
          }
        ]
      },
      {
        id: 'android-data-network',
        name: 'Storage, Network & Asynchronism',
        description: 'Room persistence database, Retrofit network requests, threads, and coroutine execution.',
        concepts: [
          {
            id: 'android-storage',
            name: 'Storage Options',
            subtopics: [
              { id: 'storage-shared-preferences', name: 'Shared Preferences', blogSlug: 'storage-shared-preferences' },
              { id: 'storage-datastore', name: 'DataStore', blogSlug: 'storage-datastore' },
              { id: 'storage-room', name: 'Room Database', blogSlug: 'storage-room' },
              { id: 'storage-filesystem', name: 'File System', blogSlug: 'storage-filesystem' }
            ]
          },
          {
            id: 'android-security',
            name: 'Security',
            subtopics: [
              { id: 'android-security-keystore', name: 'Cryptography / Keystore', blogSlug: 'android-security-keystore' }
            ]
          },
          {
            id: 'android-network',
            name: 'Network Tier',
            subtopics: [
              { id: 'network-retrofit', name: 'Retrofit', blogSlug: 'network-retrofit' },
              { id: 'network-okhttp', name: 'OkHttp', blogSlug: 'network-okhttp' },
              { id: 'network-apollo', name: 'Apollo-Android', blogSlug: 'network-apollo' },
              { id: 'android-logger-timber', name: 'Timber', blogSlug: 'android-logger-timber' },
              { id: 'android-leakcanary', name: 'Leak Canary', blogSlug: 'android-leakcanary' },
              { id: 'android-chucker', name: 'Chucker', blogSlug: 'android-chucker' },
              { id: 'android-benchmark', name: 'Jetpack Benchmark', blogSlug: 'android-benchmark' }
            ]
          },
          {
            id: 'android-async',
            name: 'Asynchronism',
            subtopics: [
              { id: 'async-coroutines', name: 'Coroutines', blogSlug: 'async-coroutines' },
              { id: 'async-threads', name: 'Threads', blogSlug: 'async-threads' },
              { id: 'async-rxjava', name: 'RxJava Async', blogSlug: 'async-rxjava' },
              { id: 'async-rxkotlin', name: 'RxKotlin Async', blogSlug: 'async-rxkotlin' },
              { id: 'async-workmanager', name: 'WorkManager', blogSlug: 'async-workmanager' }
            ]
          }
        ]
      },
      {
        id: 'android-testing-debugging',
        name: 'Testing & Debugging',
        description: 'Espresso unit checks, static lint configurations, and ADB debugging services.',
        concepts: [
          {
            id: 'android-testing',
            name: 'Testing Frameworks',
            subtopics: [
              { id: 'test-espresso', name: 'Espresso', blogSlug: 'test-espresso' },
              { id: 'test-junit', name: 'JUnit', blogSlug: 'test-junit' }
            ]
          },
          {
            id: 'android-linting',
            name: 'Linting & Checking',
            subtopics: [
              { id: 'lint-ktlint', name: 'Ktlint', blogSlug: 'lint-ktlint' },
              { id: 'lint-detekt', name: 'Detekt', blogSlug: 'lint-detekt' }
            ]
          },
          {
            id: 'android-debugging',
            name: 'Debugging Tools',
            subtopics: [
              { id: 'android-adb-debugging', name: 'Android Debug Bridge / Profiler', blogSlug: 'android-adb-debugging' }
            ]
          }
        ]
      },
      {
        id: 'android-distribution-services',
        name: 'Common Services & Distribution',
        description: 'Firebase cloud settings, Google play configurations, and app releases.',
        concepts: [
          {
            id: 'android-common-services',
            name: 'Common Services',
            subtopics: [
              { id: 'service-firebase-auth', name: 'Authentication', blogSlug: 'service-firebase-auth' },
              { id: 'service-crashlytics', name: 'Crashlytics', blogSlug: 'service-crashlytics' },
              { id: 'service-remote-config', name: 'Remote Config', blogSlug: 'service-remote-config' },
              { id: 'service-cloud-messaging', name: 'Cloud Messaging', blogSlug: 'service-cloud-messaging' },
              { id: 'service-firestore', name: 'FireStore', blogSlug: 'service-firestore' },
              { id: 'service-firebase-core', name: 'Firebase SDK', blogSlug: 'service-firebase-core' },
              { id: 'service-admob', name: 'Google Admob', blogSlug: 'service-admob' },
              { id: 'service-play-services', name: 'Google Play Services', blogSlug: 'service-play-services' },
              { id: 'service-maps', name: 'Google Maps', blogSlug: 'service-maps' }
            ]
          },
          {
            id: 'android-distribution',
            name: 'App Distribution',
            subtopics: [
              { id: 'dist-signed-apk', name: 'Signed APK', blogSlug: 'dist-signed-apk' },
              { id: 'dist-firebase', name: 'Firebase Distribution', blogSlug: 'dist-firebase' },
              { id: 'dist-playstore', name: 'Google Playstore', blogSlug: 'dist-playstore' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'system-design',
    number: '06',
    name: 'System Design & Distributed Systems',
    difficulty: 'Hard',
    hours: 106,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Load balancers, LRU caches, Kafka event streaming, and Raft consensus.',
    topics: [
      {
        id: 'foundational-tradeoffs',
        name: 'Foundational Trade-offs',
        description: 'The core tensions every system design decision balances: speed vs scale, latency vs volume, consistency vs availability.',
        concepts: [
          {
            id: 'core-concepts',
            name: 'Core Concepts',
            subtopics: [
              { id: 'what-is-system-design', name: 'What is System Design?', blogSlug: 'what-is-system-design' },
              { id: 'how-to-approach-system-design', name: 'How to Approach System Design?', blogSlug: 'how-to-approach-system-design' },
              { id: 'performance-vs-scalability', name: 'Performance vs Scalability', blogSlug: 'performance-vs-scalability' },
              { id: 'latency-vs-throughput', name: 'Latency vs Throughput', blogSlug: 'latency-vs-throughput' },
            ]
          },
          {
            id: 'consistency-availability',
            name: 'Consistency & Availability',
            subtopics: [
              { id: 'availability-vs-consistency', name: 'Availability vs Consistency', blogSlug: 'availability-vs-consistency' },
              { id: 'cap-theorem', name: 'CAP Theorem', blogSlug: 'cap-theorem-consistency' },
              { id: 'weak-consistency', name: 'Weak Consistency', blogSlug: 'weak-consistency' },
              { id: 'eventual-consistency', name: 'Eventual Consistency', blogSlug: 'eventual-consistency' },
              { id: 'strong-consistency', name: 'Strong Consistency', blogSlug: 'strong-consistency' },
            ]
          },
          {
            id: 'availability-patterns',
            name: 'Availability Patterns',
            subtopics: [
              { id: 'fail-over-active-active-active-passive', name: 'Fail-Over (Active-Active / Active-Passive)', blogSlug: 'failover-replication-dns-updates' },
              { id: 'replication-master-slave-master-master', name: 'Replication (Master-Slave / Master-Master)', blogSlug: 'replication-master-slave-master-master' },
              { id: 'availability-in-numbers', name: 'Availability in Numbers', blogSlug: 'availability-in-numbers' },
            ]
          },
        ]
      },
      {
        id: 'background-delivery',
        name: 'Background Work & Delivery',
        description: 'Deferred processing off the request path, plus how content finds its way to users quickly.',
        concepts: [
          {
            id: 'background-jobs-concept',
            name: 'Background Jobs',
            subtopics: [
              { id: 'background-jobs', name: 'Background Jobs', blogSlug: 'background-jobs' },
              { id: 'event-driven-jobs', name: 'Event-Driven Jobs', blogSlug: 'event-driven-jobs' },
              { id: 'schedule-driven-jobs', name: 'Schedule-Driven Jobs', blogSlug: 'schedule-driven-jobs' },
              { id: 'returning-job-results', name: 'Returning Job Results', blogSlug: 'returning-job-results' },
            ]
          },
          {
            id: 'naming-delivery',
            name: 'Naming & Content Delivery',
            subtopics: [
              { id: 'domain-name-system-dns', name: 'Domain Name System (DNS)', blogSlug: 'dns-root-authority-resolution' },
              { id: 'content-delivery-networks-cdn', name: 'Content Delivery Networks (CDN)', blogSlug: 'cdn-edge-caching-strategies' },
              { id: 'pull-cdns', name: 'Pull CDNs', blogSlug: 'pull-cdns' },
              { id: 'push-cdns', name: 'Push CDNs', blogSlug: 'push-cdns' },
            ]
          },
        ]
      },
      {
        id: 'sd-databases',
        name: 'Databases',
        description: 'Relational and non-relational storage engines, and how each scales.',
        concepts: [
          {
            id: 'sql-vs-nosql-concept',
            name: 'SQL vs NoSQL',
            subtopics: [
              { id: 'sql-vs-nosql', name: 'SQL vs NoSQL', blogSlug: 'sql-vs-nosql' },
            ]
          },
          {
            id: 'nosql-stores',
            name: 'NoSQL Data Stores',
            subtopics: [
              { id: 'key-value-store', name: 'Key-Value Store', blogSlug: 'key-value-store' },
              { id: 'document-store', name: 'Document Store', blogSlug: 'document-store' },
              { id: 'wide-column-store', name: 'Wide-Column Store', blogSlug: 'wide-column-store' },
              { id: 'graph-databases', name: 'Graph Databases', blogSlug: 'graph-databases' },
            ]
          },
          {
            id: 'rdbms-scaling',
            name: 'RDBMS Scaling',
            subtopics: [
              { id: 'replication-rdbms', name: 'Replication', blogSlug: 'database-replication-lags' },
              { id: 'sharding-rdbms', name: 'Sharding', blogSlug: 'database-sharding-partitions' },
              { id: 'federation', name: 'Federation', blogSlug: 'federation' },
              { id: 'denormalization', name: 'Denormalization', blogSlug: 'denormalization' },
              { id: 'sql-tuning', name: 'SQL Tuning', blogSlug: 'sql-tuning' },
            ]
          },
        ]
      },
      {
        id: 'traffic-scaling',
        name: 'Traffic, Scaling & Delivery Layer',
        description: 'Distributing requests across a fleet, and the services that route them.',
        concepts: [
          {
            id: 'application-layer',
            name: 'Application Layer',
            subtopics: [
              { id: 'microservices', name: 'Microservices', blogSlug: 'microservices' },
              { id: 'service-discovery', name: 'Service Discovery', blogSlug: 'service-discovery' },
            ]
          },
          {
            id: 'load-balancers-concept',
            name: 'Load Balancers',
            subtopics: [
              { id: 'lb-vs-reverse-proxy', name: 'LB vs Reverse Proxy', blogSlug: 'reverse-proxy-caches' },
              { id: 'load-balancing-algorithms', name: 'Load Balancing Algorithms', blogSlug: 'load-balancing-algorithms' },
              { id: 'layer-7-load-balancing', name: 'Layer 7 Load Balancing', blogSlug: 'layer-7-load-balancing' },
              { id: 'layer-4-load-balancing', name: 'Layer 4 Load Balancing', blogSlug: 'load-balancer-layer-4-routing' },
              { id: 'horizontal-scaling', name: 'Horizontal Scaling', blogSlug: 'horizontal-scaling' },
            ]
          },
        ]
      },
      {
        id: 'sd-caching',
        name: 'Caching',
        description: 'Write/read strategies for cache coherence, and where each caching layer sits.',
        concepts: [
          {
            id: 'caching-strategies',
            name: 'Caching Strategies',
            subtopics: [
              { id: 'cache-aside', name: 'Cache-Aside', blogSlug: 'cache-aside' },
              { id: 'write-through', name: 'Write-Through', blogSlug: 'write-through' },
              { id: 'write-behind', name: 'Write-Behind', blogSlug: 'write-behind' },
              { id: 'refresh-ahead', name: 'Refresh-Ahead', blogSlug: 'refresh-ahead' },
            ]
          },
          {
            id: 'caching-types',
            name: 'Types of Caching',
            subtopics: [
              { id: 'client-caching', name: 'Client Caching', blogSlug: 'client-caching' },
              { id: 'cdn-caching', name: 'CDN Caching', blogSlug: 'cdn-caching' },
              { id: 'web-server-caching', name: 'Web Server Caching', blogSlug: 'web-server-caching' },
              { id: 'database-caching', name: 'Database Caching', blogSlug: 'database-caching' },
              { id: 'application-caching', name: 'Application Caching', blogSlug: 'application-caching' },
            ]
          },
        ]
      },
      {
        id: 'async-communication',
        name: 'Async & Communication',
        description: 'Decoupling producers from consumers, and the protocols services speak to each other.',
        concepts: [
          {
            id: 'asynchronism',
            name: 'Asynchronism',
            subtopics: [
              { id: 'back-pressure', name: 'Back Pressure', blogSlug: 'backpressure-queues-sizing' },
              { id: 'task-queues', name: 'Task Queues', blogSlug: 'task-queues' },
              { id: 'message-queues', name: 'Message Queues', blogSlug: 'message-queues' },
            ]
          },
          {
            id: 'communication-protocols',
            name: 'Communication Protocols',
            subtopics: [
              { id: 'http', name: 'HTTP', blogSlug: 'http' },
              { id: 'tcp', name: 'TCP', blogSlug: 'tcp' },
              { id: 'udp', name: 'UDP', blogSlug: 'udp' },
              { id: 'rpc', name: 'RPC', blogSlug: 'rpc' },
              { id: 'grpc', name: 'gRPC', blogSlug: 'grpc' },
              { id: 'rest', name: 'REST', blogSlug: 'rest' },
              { id: 'graphql', name: 'GraphQL', blogSlug: 'graphql' },
            ]
          },
          {
            id: 'idempotency',
            name: 'Idempotency',
            subtopics: [
              { id: 'idempotent-operations', name: 'Idempotent Operations', blogSlug: 'idempotent-operations' },
            ]
          },
        ]
      },
      {
        id: 'performance-reliability',
        name: 'Performance & Reliability',
        description: 'Anti-patterns that quietly wreck throughput, and how to see them coming.',
        concepts: [
          {
            id: 'performance-antipatterns',
            name: 'Performance Antipatterns',
            subtopics: [
              { id: 'improper-instantiation', name: 'Improper Instantiation', blogSlug: 'improper-instantiation' },
              { id: 'monolithic-persistence', name: 'Monolithic Persistence', blogSlug: 'monolithic-persistence' },
              { id: 'noisy-neighbor', name: 'Noisy Neighbor', blogSlug: 'noisy-neighbor' },
              { id: 'synchronous-io', name: 'Synchronous I/O', blogSlug: 'synchronous-io' },
              { id: 'extraneous-fetching', name: 'Extraneous Fetching', blogSlug: 'extraneous-fetching' },
              { id: 'busy-database', name: 'Busy Database', blogSlug: 'busy-database' },
              { id: 'busy-frontend', name: 'Busy Frontend', blogSlug: 'busy-frontend' },
              { id: 'chatty-io', name: 'Chatty I/O', blogSlug: 'chatty-io' },
              { id: 'retry-storm', name: 'Retry Storm', blogSlug: 'retry-storm' },
              { id: 'no-caching', name: 'No Caching', blogSlug: 'no-caching' },
            ]
          },
          {
            id: 'monitoring',
            name: 'Monitoring',
            subtopics: [
              { id: 'health-monitoring', name: 'Health Monitoring', blogSlug: 'health-monitoring' },
              { id: 'availability-monitoring', name: 'Availability Monitoring', blogSlug: 'availability-monitoring' },
              { id: 'performance-monitoring', name: 'Performance Monitoring', blogSlug: 'performance-monitoring' },
              { id: 'security-monitoring', name: 'Security Monitoring', blogSlug: 'security-monitoring' },
              { id: 'usage-monitoring', name: 'Usage Monitoring', blogSlug: 'usage-monitoring' },
              { id: 'instrumentation', name: 'Instrumentation', blogSlug: 'instrumentation' },
              { id: 'visualization-alerts', name: 'Visualization & Alerts', blogSlug: 'visualization-alerts' },
            ]
          },
        ]
      },
      {
        id: 'cloud-design-patterns',
        name: 'Cloud Design Patterns',
        description: 'Reusable structures for composing, managing data in, and messaging between cloud services.',
        concepts: [
          {
            id: 'design-implementation',
            name: 'Design & Implementation',
            subtopics: [
              { id: 'strangler-fig', name: 'Strangler Fig', blogSlug: 'strangler-fig' },
              { id: 'sidecar', name: 'Sidecar', blogSlug: 'sidecar' },
              { id: 'static-content-hosting-design', name: 'Static Content Hosting', blogSlug: 'static-content-hosting-design' },
              { id: 'leader-election', name: 'Leader Election', blogSlug: 'leader-election' },
              { id: 'cqrs-design', name: 'CQRS', blogSlug: 'cqrs-design' },
              { id: 'pipes-filters-design', name: 'Pipes & Filters', blogSlug: 'pipes-filters-design' },
              { id: 'ambassador', name: 'Ambassador', blogSlug: 'ambassador' },
              { id: 'gateway-routing', name: 'Gateway Routing', blogSlug: 'gateway-routing' },
              { id: 'gateway-offloading', name: 'Gateway Offloading', blogSlug: 'gateway-offloading' },
              { id: 'gateway-aggregation', name: 'Gateway Aggregation', blogSlug: 'gateway-aggregation' },
              { id: 'external-config-store', name: 'External Config Store', blogSlug: 'external-config-store' },
              { id: 'compute-resource-consolidation', name: 'Compute Resource Consolidation', blogSlug: 'compute-resource-consolidation' },
              { id: 'backends-for-frontend', name: 'Backends for Frontend', blogSlug: 'backends-for-frontend' },
              { id: 'anti-corruption-layer', name: 'Anti-Corruption Layer', blogSlug: 'anti-corruption-layer' },
            ]
          },
          {
            id: 'data-management',
            name: 'Data Management',
            subtopics: [
              { id: 'valet-key', name: 'Valet Key', blogSlug: 'valet-key' },
              { id: 'static-content-hosting-data', name: 'Static Content Hosting', blogSlug: 'static-content-hosting-data' },
              { id: 'sharding-data', name: 'Sharding', blogSlug: 'sharding-data' },
              { id: 'materialized-view', name: 'Materialized View', blogSlug: 'materialized-view' },
              { id: 'index-table', name: 'Index Table', blogSlug: 'index-table' },
              { id: 'event-sourcing', name: 'Event Sourcing', blogSlug: 'event-sourcing' },
              { id: 'cqrs-data', name: 'CQRS', blogSlug: 'cqrs-data' },
              { id: 'cache-aside-data', name: 'Cache-Aside', blogSlug: 'cache-aside-data' },
            ]
          },
          {
            id: 'messaging-patterns',
            name: 'Messaging Patterns',
            subtopics: [
              { id: 'sequential-convoy', name: 'Sequential Convoy', blogSlug: 'sequential-convoy' },
              { id: 'scheduling-agent-supervisor', name: 'Scheduling Agent Supervisor', blogSlug: 'scheduling-agent-supervisor' },
              { id: 'queue-based-load-leveling', name: 'Queue-Based Load Leveling', blogSlug: 'queue-based-load-leveling' },
              { id: 'publishersubscriber', name: 'Publisher/Subscriber', blogSlug: 'publishersubscriber' },
              { id: 'priority-queue', name: 'Priority Queue', blogSlug: 'priority-queue' },
              { id: 'pipes-and-filters-messaging', name: 'Pipes and Filters', blogSlug: 'pipes-and-filters-messaging' },
              { id: 'competing-consumers', name: 'Competing Consumers', blogSlug: 'competing-consumers' },
              { id: 'choreography', name: 'Choreography', blogSlug: 'choreography' },
              { id: 'claim-check', name: 'Claim Check', blogSlug: 'claim-check' },
              { id: 'async-request-reply', name: 'Async Request-Reply', blogSlug: 'async-request-reply' },
            ]
          },
        ]
      },
    ]
  },
  {
    id: 'machine-learning',
    number: '07',
    name: 'Machine Learning',
    difficulty: 'Hard',
    hours: 86,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Matrix algebra, probability, data processing, and supervised/unsupervised algorithms.',
    topics: [
      {
        id: 'ml-intro',
        name: 'Introduction to ML',
        description: 'Understand the role of ML Engineers, AI Engineers, and basic skills.',
        concepts: [
          {
            id: 'ml-roles',
            name: 'ML Engineer Roles',
            subtopics: [
              { id: 'what-is-ml-engineer', name: 'What is an ML Engineer?', blogSlug: 'what-is-ml-engineer' },
              { id: 'ml-vs-ai-engineer', name: 'ML Engineer vs AI Engineer', blogSlug: 'ml-vs-ai-engineer' },
              { id: 'ml-skills', name: 'Skills and Responsibilities', blogSlug: 'ml-skills' }
            ]
          }
        ]
      },
      {
        id: 'math-foundations',
        name: 'Mathematical Foundations',
        description: 'Multivariate calculus, matrix operations, probability basics, and statistical inference.',
        concepts: [
          {
            id: 'calculus',
            name: 'Calculus',
            subtopics: [
              { id: 'derivatives', name: 'Derivatives & Partial Derivatives', blogSlug: 'partial-derivative-slopes' },
              { id: 'chain-rule', name: 'Chain rule of derivation', blogSlug: 'chain-rule-derivation' },
              { id: 'gradient-jacobian-hessian', name: 'Gradient, Jacobian & Hessian', blogSlug: 'gradient-jacobian-hessian' }
            ]
          },
          {
            id: 'discrete-math',
            name: 'Discrete Mathematics',
            subtopics: [
              { id: 'discrete-math-basics', name: 'Discrete Mathematics Basics', blogSlug: 'discrete-mathematics-basics' }
            ]
          },
          {
            id: 'linear-algebra',
            name: 'Linear Algebra',
            subtopics: [
              { id: 'matrix-ops', name: 'Matrix & Matrix Operations', blogSlug: 'matrix-multiplication-gradients' },
              { id: 'scalars-vectors-tensors', name: 'Scalars, Vectors & Tensors', blogSlug: 'scalars-vectors-tensors' },
              { id: 'svd', name: 'Singular Value Decomposition', blogSlug: 'singular-value-decomposition' },
              { id: 'determinants-inverse', name: 'Determinants & Inverse of Matrix', blogSlug: 'determinants-matrix-inverse' },
              { id: 'eigenvalues', name: 'Eigenvalues & Diagonalization', blogSlug: 'eigenvalues-diagonalization' }
            ]
          },
          {
            id: 'probability',
            name: 'Probability',
            subtopics: [
              { id: 'probability-basics', name: 'Basics of Probability', blogSlug: 'probability-basics' },
              { id: 'bayes-theorem', name: 'Bayes Theorem', blogSlug: 'bayesian-probability-tables' },
              { id: 'random-variances-pdfs', name: 'Random Variances & PDFs', blogSlug: 'random-variances-pdfs' },
              { id: 'distribution-types', name: 'Types of Distribution', blogSlug: 'distribution-types' }
            ]
          },
          {
            id: 'statistics',
            name: 'Statistics',
            subtopics: [
              { id: 'stats-basics', name: 'Basic Concepts of Statistics', blogSlug: 'stats-basics' },
              { id: 'descriptive-stats', name: 'Descriptive Statistics', blogSlug: 'descriptive-statistics' },
              { id: 'graphs-charts', name: 'Graphs & Charts', blogSlug: 'graphs-charts' },
              { id: 'inferential-stats', name: 'Inferential Statistics', blogSlug: 'inferential-statistics' }
            ]
          }
        ]
      },
      {
        id: 'programming-fundamentals',
        name: 'Programming Fundamentals',
        description: 'Python core syntax, object-oriented concepts, and numerical/visualization libraries.',
        concepts: [
          {
            id: 'python-programming',
            name: 'Python Syntax',
            subtopics: [
              { id: 'python-syntax', name: 'Basic Syntax & Structure', blogSlug: 'python-basic-syntax' },
              { id: 'python-variables', name: 'Variables and Data Types', blogSlug: 'python-variables-types' },
              { id: 'python-ds', name: 'Data Structures', blogSlug: 'python-data-structures' },
              { id: 'python-loops', name: 'Loops', blogSlug: 'python-loops' },
              { id: 'python-conditionals', name: 'Conditionals', blogSlug: 'python-conditionals' },
              { id: 'python-exceptions', name: 'Exceptions', blogSlug: 'python-exceptions' },
              { id: 'python-functions', name: 'Functions & Built-ins', blogSlug: 'python-functions' }
            ]
          },
          {
            id: 'oop',
            name: 'Object Oriented Programming',
            subtopics: [
              { id: 'oop-basics', name: 'OOP Class Design', blogSlug: 'oop-class-inheritance-stubs' }
            ]
          },
          {
            id: 'essential-libraries',
            name: 'Essential Libraries',
            subtopics: [
              { id: 'numpy', name: 'Numpy', blogSlug: 'numpy-arrays' },
              { id: 'pandas', name: 'Pandas', blogSlug: 'pandas-dataframes' },
              { id: 'matplotlib', name: 'Matplotlib', blogSlug: 'matplotlib-plots' },
              { id: 'seaborn', name: 'Seaborn', blogSlug: 'seaborn-visualization' }
            ]
          }
        ]
      },
      {
        id: 'data-prep',
        name: 'Data Collection & Cleaning',
        description: 'Integrate data sources, clean formats, and apply scaling/normalization preprocessing.',
        concepts: [
          {
            id: 'data-sources',
            name: 'Data Sources',
            subtopics: [
              { id: 'databases', name: 'Databases (SQL & NoSQL)', blogSlug: 'databases-sql-nosql' },
              { id: 'internet', name: 'Internet Data Source', blogSlug: 'internet-data-source' },
              { id: 'apis', name: 'APIs & Data Extraction', blogSlug: 'apis-data-extraction' },
              { id: 'mobile-apps', name: 'Mobile Apps Data', blogSlug: 'mobile-apps-data' },
              { id: 'iot', name: 'IoT Devices Data', blogSlug: 'iot-devices-data' }
            ]
          },
          {
            id: 'data-formats',
            name: 'Data Formats',
            subtopics: [
              { id: 'csv', name: 'CSV Format', blogSlug: 'csv-format' },
              { id: 'excel', name: 'Excel Format', blogSlug: 'excel-format' },
              { id: 'json', name: 'JSON Format', blogSlug: 'json-format' },
              { id: 'parquet', name: 'Parquet Format', blogSlug: 'parquet-format' },
              { id: 'other-formats', name: 'Other Data Formats', blogSlug: 'other-data-formats' }
            ]
          },
          {
            id: 'preprocessing-techniques',
            name: 'Preprocessing Techniques',
            subtopics: [
              { id: 'data-cleaning', name: 'Data Cleaning', blogSlug: 'data-cleaning' },
              { id: 'feature-engineering', name: 'Feature Engineering', blogSlug: 'feature-engineering' },
              { id: 'feature-scaling', name: 'Feature Scaling & Normalization', blogSlug: 'feature-scaling' },
              { id: 'dim-reduction', name: 'Dimensionality Reduction', blogSlug: 'pca-dimension-projection-matrices' },
              { id: 'feature-selection', name: 'Feature Selection', blogSlug: 'feature-selection' }
            ]
          }
        ]
      },
      {
        id: 'classical-ml',
        name: 'Classical Machine Learning',
        description: 'Supervised regression/classification paradigms, unsupervised clustering, and evaluation workflows.',
        concepts: [
          {
            id: 'ml-paradigms',
            name: 'ML Paradigms',
            subtopics: [
              { id: 'what-is-ml', name: 'What is Machine Learning?', blogSlug: 'what-is-machine-learning' },
              { id: 'ml-supervised', name: 'Supervised Learning Paradigm', blogSlug: 'supervised-learning-paradigm' },
              { id: 'ml-unsupervised', name: 'Unsupervised Learning Paradigm', blogSlug: 'unsupervised-learning-paradigm' },
              { id: 'ml-semi-supervised', name: 'Semi-supervised Learning Paradigm', blogSlug: 'semi-supervised-learning-paradigm' },
              { id: 'ml-self-supervised', name: 'Self-supervised Learning Paradigm', blogSlug: 'self-supervised-learning-paradigm' },
              { id: 'ml-reinforcement', name: 'Reinforcement Learning Paradigm', blogSlug: 'reinforcement-learning-paradigm' }
            ]
          },
          {
            id: 'scikit-learn',
            name: 'Scikit-Learn Workflow',
            subtopics: [
              { id: 'data-loading', name: 'Data Loading', blogSlug: 'scikit-learn-data-loading' },
              { id: 'train-test-data', name: 'Train - Test Data Split', blogSlug: 'train-test-split' },
              { id: 'data-preparation', name: 'Data Preparation', blogSlug: 'scikit-learn-data-preparation' },
              { id: 'model-selection', name: 'Model Selection', blogSlug: 'scikit-learn-model-selection' },
              { id: 'tuning', name: 'Hyperparameter Tuning', blogSlug: 'scikit-learn-hyperparameter-tuning' },
              { id: 'prediction', name: 'Model Prediction', blogSlug: 'scikit-learn-prediction' }
            ]
          },
          {
            id: 'supervised-foundations',
            name: 'Supervised Foundations',
            subtopics: [
              { id: 'what-is-supervised', name: 'What is Supervised Learning?', blogSlug: 'what-is-supervised-learning' }
            ]
          },
          {
            id: 'classification-models',
            name: 'Classification Models',
            subtopics: [
              { id: 'knn', name: 'K-Nearest Neighbors (KNN)', blogSlug: 'k-nearest-neighbors' },
              { id: 'logistic-regression', name: 'Logistic Regression', blogSlug: 'logistic-regression-sigmoids' },
              { id: 'svm', name: 'Support Vector Machines', blogSlug: 'svm-hyper-plane-margin-offsets' },
              { id: 'decision-trees', name: 'Decision Trees & Random Forest', blogSlug: 'decision-trees-entropy-splits' },
              { id: 'gradient-boosting', name: 'Gradient Boosting Machines', blogSlug: 'gradient-boosting-tree-iterations' }
            ]
          },
          {
            id: 'regression-models',
            name: 'Regression Models',
            subtopics: [
              { id: 'linear-regression', name: 'Linear Regression', blogSlug: 'linear-regression-estimation' },
              { id: 'polynomial-regression', name: 'Polynomial Regression', blogSlug: 'polynomial-regression' },
              { id: 'lasso', name: 'Lasso Regression', blogSlug: 'lasso-regularization' },
              { id: 'ridge', name: 'Ridge Regression', blogSlug: 'ridge-regularization' },
              { id: 'elasticnet', name: 'ElasticNet Regularization', blogSlug: 'elasticnet-regularization' }
            ]
          },
          {
            id: 'unsupervised-foundations',
            name: 'Unsupervised Foundations',
            subtopics: [
              { id: 'what-is-unsupervised', name: 'What is Unsupervised Learning?', blogSlug: 'what-is-unsupervised-learning' }
            ]
          },
          {
            id: 'clustering-methods',
            name: 'Clustering Methods',
            subtopics: [
              { id: 'kmeans', name: 'K-Means Clustering', blogSlug: 'k-means-clustering-centers' },
              { id: 'exclusive', name: 'Exclusive Clustering', blogSlug: 'exclusive-clustering' },
              { id: 'overlapping', name: 'Overlapping Clustering', blogSlug: 'overlapping-clustering' },
              { id: 'hierarchical', name: 'Hierarchical Clustering', blogSlug: 'hierarchical-clustering' },
              { id: 'probabilistic', name: 'Probabilistic Clustering', blogSlug: 'probabilistic-clustering' }
            ]
          },
          {
            id: 'dim-reduction-classical',
            name: 'Dimensionality Reduction',
            subtopics: [
              { id: 'pca', name: 'Principal Component Analysis', blogSlug: 'pca-dimension-projection-matrices' },
              { id: 'autoencoders-classical', name: 'Autoencoders', blogSlug: 'autoencoders-dimension-compression' }
            ]
          },
          {
            id: 'model-evaluation',
            name: 'Model Evaluation & Validation',
            subtopics: [
              { id: 'what-is-model-eval', name: 'What is Model Evaluation?', blogSlug: 'what-is-model-evaluation' },
              { id: 'why-eval-important', name: 'Why is it important?', blogSlug: 'why-evaluation-important' },
              { id: 'accuracy-metric', name: 'Accuracy', blogSlug: 'accuracy-metric' },
              { id: 'precision-metric', name: 'Precision', blogSlug: 'precision-metric' },
              { id: 'recall-metric', name: 'Recall', blogSlug: 'recall-metric' },
              { id: 'f1-score-metric', name: 'F1-Score', blogSlug: 'f1-score-metric' },
              { id: 'roc-auc-metric', name: 'ROC-AUC', blogSlug: 'roc-auc-metric' },
              { id: 'log-loss-metric', name: 'Log Loss', blogSlug: 'log-loss-metric' },
              { id: 'confusion-matrix', name: 'Confusion Matrix', blogSlug: 'confusion-matrix' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ai-data-scientist',
    number: '08',
    name: 'AI & Data Scientist',
    difficulty: 'Hard',
    hours: 49,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Advanced mathematics, statistics, econometrics, exploratory data analysis, machine learning, deep learning, MLOps, prompt engineering, and vibe coding.',
    topics: [
      {
        id: 'ai-math',
        name: 'Mathematics',
        description: 'Linear algebra, multi-dimensional calculus, and mathematical analysis fundamentals.',
        concepts: [
          {
            id: 'ai-math-analysis',
            name: 'Linear Algebra, Calculus, Mathematical Analysis',
            subtopics: [
              { id: 'math-for-ml', name: 'Mathematics for Machine Learning', blogSlug: 'mathematics-for-machine-learning' }
            ]
          },
          {
            id: 'ai-diff-calculus',
            name: 'Differential Calculus',
            subtopics: [
              { id: 'algebra-diff-calculus', name: 'Coursera: Algebra and Differential Calculus', blogSlug: 'algebra-differential-calculus' }
            ]
          }
        ]
      },
      {
        id: 'ai-stats',
        name: 'Statistics',
        description: 'Probability, hypothesis testing, experiment design, A/B testing frameworks, and metric analytics.',
        concepts: [
          {
            id: 'ai-stats-clt',
            name: 'Statistics, CLT',
            subtopics: [
              { id: 'intro-to-stats', name: 'Coursera: Introduction to Statistics', blogSlug: 'introduction-to-statistics' }
            ]
          },
          {
            id: 'ai-hypothesis',
            name: 'Hypothesis Testing',
            subtopics: [
              { id: 'hypothesis-testing-detail', name: 'Coursera: Hypothesis Testing', blogSlug: 'hypothesis-testing' }
            ]
          },
          {
            id: 'ai-prob-sampling',
            name: 'Probability and Sampling',
            subtopics: [
              { id: 'prob-stats-course', name: 'Coursera: Probability and Statistics', blogSlug: 'probability-and-statistics' }
            ]
          },
          {
            id: 'ai-ab-testing',
            name: 'AB Testing',
            subtopics: [
              { id: 'practitioners-guide-stats', name: 'Practitioner\'s Guide to Statistical Tests', blogSlug: 'practitioners-guide-statistical-tests' },
              { id: 'experiment-design-detail', name: 'Experiment Design Article', blogSlug: 'experiment-design' }
            ]
          },
          {
            id: 'ai-test-sensitivity',
            name: 'Increasing Test Sensitivity',
            subtopics: [
              { id: 'min-detectable-effect', name: 'Minimum Detectable Effect', blogSlug: 'minimum-detectable-effect' },
              { id: 'improving-test-sensitivity', name: 'Paper: Improving Test Sensitivity', blogSlug: 'improving-test-sensitivity' },
              { id: 'improving-sensitivity-cuped', name: 'Paper: Improving Sensitivity (CUPED)', blogSlug: 'improving-sensitivity-cuped' },
              { id: 'cuped-booking', name: 'CUPED at Booking.com', blogSlug: 'cuped-at-booking' },
              { id: 'doordash-cupac', name: 'Doordash: CUPAC', blogSlug: 'doordash-cupac' },
              { id: 'netflix-stratification', name: 'Netflix: Stratification', blogSlug: 'netflix-stratification' }
            ]
          },
          {
            id: 'ai-ratio-metrics',
            name: 'Ratio Metrics',
            subtopics: [
              { id: 'microsoft-delta-method', name: 'Microsoft: Delta Method in Metric Analytics', blogSlug: 'microsoft-delta-method' },
              { id: 'ratio-metrics-detail', name: 'Paper: Ratio Metrics', blogSlug: 'ratio-metrics' }
            ]
          }
        ]
      },
      {
        id: 'ai-econometrics',
        name: 'Econometrics',
        description: 'Regression analysis, time series modeling, forecasting tasks, and fitting distributions.',
        concepts: [
          {
            id: 'ai-econ-prereqs',
            name: 'Pre-requisites of Econometrics',
            subtopics: [
              { id: 'fundamentals-econometrics', name: 'Fundamentals of Econometrics', blogSlug: 'fundamentals-of-econometrics' }
            ]
          },
          {
            id: 'ai-econ-regression',
            name: 'Regression, Timeseries, Fitting Distributions',
            subtopics: [
              { id: 'intro-econometrics', name: 'Intro to Econometrics', blogSlug: 'intro-to-econometrics' },
              { id: 'econometrics-course', name: 'Coursera: Econometrics', blogSlug: 'econometrics-course' },
              { id: 'learn-time-series', name: 'Kaggle: Learn Time Series', blogSlug: 'learn-time-series' },
              { id: 'time-series-basics', name: 'Kaggle: Time Series Basics', blogSlug: 'time-series-basics' },
              { id: 'arima-time-series', name: 'ARIMA model for Time Series', blogSlug: 'arima-model-for-time-series' },
              { id: 'time-series-models', name: 'Time Series Models', blogSlug: 'time-series-models' },
              { id: 'forecasting-task', name: 'Forecasting Task with Solution', blogSlug: 'forecasting-task-with-solution' },
              { id: 'linear-regression-econ', name: 'Coursera: Linear Regression', blogSlug: 'linear-regression-econ' }
            ]
          }
        ]
      },
      {
        id: 'ai-coding',
        name: 'Coding',
        description: 'Python fundamentals, data structures, algorithmic paradigms, and SQL querying.',
        concepts: [
          {
            id: 'ai-learn-python',
            name: 'Learn Python Programming Language',
            subtopics: [
              { id: 'learn-python-kaggle', name: 'Learn Python: Kaggle', blogSlug: 'learn-python-kaggle' },
              { id: 'google-python-class', name: 'Google\'s Python Class', blogSlug: 'googles-python-class' }
            ]
          },
          {
            id: 'ai-dsa-python',
            name: 'Data Structures and Algorithms (Python)',
            subtopics: [
              { id: 'algorithmic-exercises', name: 'Algorithmic Exercises', blogSlug: 'algorithmic-exercises' },
              { id: 'leetcode-study-plans', name: 'Study Plans - Leetcode', blogSlug: 'study-plans-leetcode' },
              { id: 'algorithms-specialization-course', name: 'Algorithms Specialization', blogSlug: 'algorithms-specialization' }
            ]
          },
          {
            id: 'ai-learn-sql',
            name: 'Learn SQL',
            subtopics: [
              { id: 'sql-tutorial-course', name: 'SQL Tutorial', blogSlug: 'sql-tutorial-course' }
            ]
          }
        ]
      },
      {
        id: 'ai-eda',
        name: 'Exploratory Data Analysis',
        description: 'Data analysis pipelines, pandas aggregations, and seaborn statistical plotting.',
        concepts: [
          {
            id: 'ai-eda-viz',
            name: 'Data understanding, Data Analysis and Visualization',
            subtopics: [
              { id: 'eda-python-pandas', name: 'Exploratory Data Analysis with Python and Pandas', blogSlug: 'exploratory-data-analysis-with-python-and-pandas' },
              { id: 'eda-ml', name: 'Exploratory Data Analysis for Machine Learning', blogSlug: 'exploratory-data-analysis-for-machine-learning' },
              { id: 'eda-seaborn', name: 'Exploratory Data Analysis with Seaborn', blogSlug: 'exploratory-data-analysis-with-seaborn' }
            ]
          }
        ]
      },
      {
        id: 'ai-ml-classic',
        name: 'Machine Learning',
        description: 'Classic supervised and unsupervised paradigms, ensemble methods, and textbook references.',
        concepts: [
          {
            id: 'ai-ml-classic-advanced',
            name: 'Classic ML (Sup., Unsup.), Advanced ML (Ensembles, NNs)',
            subtopics: [
              { id: 'open-ml-course', name: 'Open Machine Learning Course - Open Data Science', blogSlug: 'open-machine-learning-course' },
              { id: 'ml-specialization-course', name: 'Machine Learning Specialization', blogSlug: 'machine-learning-specialization' },
              { id: 'pattern-recognition-ml', name: 'Pattern Recognition & ML by Christopher m. Bishop', blogSlug: 'pattern-recognition-ml' },
              { id: 'pattern-recognition-github', name: 'GitHub repository with notes & code from the eBook above', blogSlug: 'pattern-recognition-github' }
            ]
          }
        ]
      },
      {
        id: 'ai-dl',
        name: 'Deep Learning',
        description: 'Feed-forward nets, backpropagation, CNNs, RNNs, and self-attention transformers.',
        concepts: [
          {
            id: 'ai-dl-architecture',
            name: 'Fully Connected, CNN, RNN, LSTM, Transformers, TL',
            subtopics: [
              { id: 'dl-specialization-courses', name: 'Deep Learning Specialization', blogSlug: 'deep-learning-specialization' },
              { id: 'dl-book-ebook', name: 'Deep Learning Book', blogSlug: 'deep-learning-book' },
              { id: 'attention-is-all-you-need', name: 'Attention is all you need', blogSlug: 'attention-is-all-you-need' },
              { id: 'illustrated-transformer', name: 'The Illustrated Transformer', blogSlug: 'illustrated-transformer' }
            ]
          }
        ]
      },
      {
        id: 'ai-mlops',
        name: 'MLOps',
        description: 'Deployment models, inference engines, model drift monitoring, and CI/CD pipelines.',
        concepts: [
          {
            id: 'ai-mlops-deployment',
            name: 'Deployment Models, CI/CD',
            subtopics: [
              { id: 'mlops-specialization-courses', name: 'MLOps Specialization', blogSlug: 'mlops-specialization' }
            ]
          }
        ]
      },
      {
        id: 'ai-engineering-new',
        name: 'AI Engineering',
        description: 'Prompt engineering, large language model integrations, RAG architectures, and agentic reasoning.',
        concepts: [
          {
            id: 'ai-eng-prompt',
            name: 'Prompt Engineering, LLMs, RAG, Agents, Fine-tuning',
            subtopics: [
              { id: 'google-ai-courses', name: 'Google AI Courses', blogSlug: 'google-ai-courses' },
              { id: 'huggingface-nlp', name: 'Hugging Face NLP', blogSlug: 'hugging-face-nlp' },
              { id: 'prompt-engineering-guide-detail', name: 'Prompt Engineering Guide', blogSlug: 'prompt-engineering-guide' },
              { id: 'rag-nlp-paper', name: 'RAG for Knowledge - Intensive NLP Tasks', blogSlug: 'rag-for-knowledge-intensive-nlp-tasks' }
            ]
          }
        ]
      },
      {
        id: 'ai-vibe-coding',
        name: 'Vibe Coding',
        description: 'Leveraging AI coding assistants, code synthesis models, and agentic workflows.',
        concepts: [
          {
            id: 'ai-vibe-coding-assistants',
            name: 'AI Coding Assitants, AI App Builders',
            subtopics: [
              { id: 'vibe-coding-fundamentals', name: 'Vibe Coding Fundamentals', blogSlug: 'vibe-coding-fundamentals' },
              { id: 'claude-code-docs', name: 'Claude Code', blogSlug: 'claude-code-docs' },
              { id: 'agentic-coding-handbook', name: 'Agentic Coding Handbook', blogSlug: 'agentic-coding-handbook' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'software-engineering',
    number: '09',
    name: 'Full Stack Development',
    difficulty: 'Medium',
    hours: 33,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Master frontend markup, styling, React components, Node.js servers, databases, caching, and CI/CD operations.',
    topics: [
      {
        id: 'frontend-foundations-git',
        name: 'Frontend Core & Collaboration',
        description: 'HTML, CSS, JS, package managers, and version control structures.',
        concepts: [
          {
            id: 'html-css',
            name: 'HTML & CSS Foundations',
            subtopics: [
              { id: 'html-semantics', name: 'HTML Structure & Semantics', blogSlug: 'html-semantics' },
              { id: 'css-layouts', name: 'CSS Layouts & Responsive Design', blogSlug: 'css-layouts' },
              { id: 'checkpoint-static', name: 'Checkpoint - Static Webpages', blogSlug: 'checkpoint-static' }
            ]
          },
          {
            id: 'js-npm',
            name: 'JavaScript & Packages',
            subtopics: [
              { id: 'javascript-basics', name: 'JavaScript Syntax & DOM', blogSlug: 'javascript-basics' },
              { id: 'npm-ecosystem', name: 'npm & Package Ecosystem', blogSlug: 'npm-ecosystem' },
              { id: 'checkpoint-interactivity', name: 'Checkpoint - Interactivity', blogSlug: 'checkpoint-interactivity' }
            ]
          },
          {
            id: 'version-control',
            name: 'Git & Collaboration',
            subtopics: [
              { id: 'git-version-control', name: 'Git Version Control', blogSlug: 'git-version-control' },
              { id: 'github-collaboration', name: 'GitHub Collaboration', blogSlug: 'github-collaboration' },
              { id: 'checkpoint-collaborative', name: 'Checkpoint - Collaborative Work', blogSlug: 'checkpoint-collaborative' },
              { id: 'checkpoint-external-packages', name: 'Checkpoint - External Packages', blogSlug: 'checkpoint-external-packages' }
            ]
          }
        ]
      },
      {
        id: 'frontend-frameworks',
        name: 'UI Libraries & Frontend Apps',
        description: 'React core components, state hooks, utility styling, and deployment targets.',
        concepts: [
          {
            id: 'react-tailwind',
            name: 'React & Tailwind CSS',
            subtopics: [
              { id: 'react-components', name: 'React Components & Hooks', blogSlug: 'react-components' },
              { id: 'tailwind-css', name: 'Tailwind CSS Utility Styling', blogSlug: 'tailwind-css' },
              { id: 'checkpoint-frontend-apps', name: 'Checkpoint - Frontend Apps', blogSlug: 'checkpoint-frontend-apps' }
            ]
          }
        ]
      },
      {
        id: 'backend-runtime-databases',
        name: 'Backend Dev & Persistence',
        description: 'Node.js server code, SQL relational engines, and CRUD databases.',
        concepts: [
          {
            id: 'node-js',
            name: 'Node.js Server Environment',
            subtopics: [
              { id: 'node-js-runtime', name: 'Node.js Runtime Engine', blogSlug: 'node-js-runtime' },
              { id: 'checkpoint-cli-apps', name: 'Checkpoint - CLI Apps', blogSlug: 'checkpoint-cli-apps' }
            ]
          },
          {
            id: 'databases-sql',
            name: 'Relational Databases & SQL',
            subtopics: [
              { id: 'postgresql-databases', name: 'PostgreSQL Relational DB', blogSlug: 'postgresql-databases' },
              { id: 'checkpoint-crud-apps', name: 'Checkpoint - Simple CRUD Apps', blogSlug: 'checkpoint-crud-apps' }
            ]
          }
        ]
      },
      {
        id: 'api-auth-cache',
        name: 'REST APIs, JWT & Cache Tiers',
        description: 'Stateless server services, cryptographic access controls, and cache memories.',
        concepts: [
          {
            id: 'apis-auth',
            name: 'APIs & JWT Authentication',
            subtopics: [
              { id: 'restful-api-design', name: 'RESTful API Patterns', blogSlug: 'restful-api-design' },
              { id: 'jwt-authentication', name: 'JWT Secure Authentication', blogSlug: 'jwt-authentication' }
            ]
          },
          {
            id: 'caching-tier',
            name: 'Caching & Integration',
            subtopics: [
              { id: 'redis-caching', name: 'Redis Distributed Cache', blogSlug: 'redis-caching' },
              { id: 'checkpoint-complete-app', name: 'Checkpoint - Complete App', blogSlug: 'checkpoint-complete-app' }
            ]
          }
        ]
      },
      {
        id: 'devops-cloud-topologies',
        name: 'DevOps, Cloud Services & Mesh',
        description: 'Linux systems, AWS resources, and distributed mesh structures.',
        concepts: [
          {
            id: 'linux-aws',
            name: 'Linux & Cloud Basics',
            subtopics: [
              { id: 'linux-cli-basics', name: 'Linux Command Line Basics', blogSlug: 'linux-cli-basics' },
              { id: 'basic-aws-services', name: 'Basic AWS Services (EC2, S3, VPC)', blogSlug: 'basic-aws-services' },
              { id: 'checkpoint-deployment', name: 'Checkpoint - Deployment', blogSlug: 'checkpoint-deployment' }
            ]
          },
          {
            id: 'mesh-topologies',
            name: 'Mesh Topologies & Services',
            subtopics: [
              { id: 'mesh-like-structures', name: 'Mesh-like Structures & Topologies', blogSlug: 'mesh-like-structures' }
            ]
          }
        ]
      },
      {
        id: 'automation-cicd-monitoring',
        name: 'Automation, CI/CD & Monitoring',
        description: 'Ansible playbooks, Terraform config blueprints, Actions deployment workflows, and monit triggers.',
        concepts: [
          {
            id: 'automation-iac',
            name: 'Automation & Infrastructure',
            subtopics: [
              { id: 'ansible-configuration', name: 'Ansible Automations', blogSlug: 'ansible-configuration' },
              { id: 'terraform-iac', name: 'Terraform IaC Provisions', blogSlug: 'terraform-iac' },
              { id: 'checkpoint-automation', name: 'Checkpoint - Automation', blogSlug: 'checkpoint-automation' },
              { id: 'checkpoint-infrastructure', name: 'Checkpoint - Infrastructure', blogSlug: 'checkpoint-infrastructure' }
            ]
          },
          {
            id: 'delivery-monitoring',
            name: 'Delivery Pipeline & Health',
            subtopics: [
              { id: 'github-actions-cicd', name: 'GitHub Actions CI/CD', blogSlug: 'github-actions-cicd' },
              { id: 'monit-monitoring', name: 'Monit Health Monitoring', blogSlug: 'monit-monitoring' },
              { id: 'checkpoint-cicd', name: 'Checkpoint - CI/CD', blogSlug: 'checkpoint-cicd' },
              { id: 'checkpoint-monitoring', name: 'Checkpoint - Monitoring', blogSlug: 'checkpoint-monitoring' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'blockchain',
    number: '10',
    name: 'Blockchain',
    difficulty: 'Hard',
    hours: 45,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Decentralization, smart contracts, dApps, and web3 ecosystem.',
    topics: [
      {
        id: 'blockchain-introduction',
        name: 'Introduction',
        description: 'Core concepts and applications of blockchain technology.',
        concepts: [
          {
            id: 'intro-basics',
            name: 'Blockchain Fundamentals',
            subtopics: [
              { id: 'what-is-blockchain', name: 'What is Blockchain', blogSlug: 'what-is-blockchain' },
              { id: 'why-it-matters', name: 'Why it matters?', blogSlug: 'why-blockchain-matters' },
              { id: 'applications-and-uses', name: 'Applications and Uses', blogSlug: 'blockchain-applications' }
            ]
          }
        ]
      },
      {
        id: 'understanding-blockchain',
        name: 'Understanding Blockchain',
        description: 'Deep dive into how blockchains operate internally.',
        concepts: [
          {
            id: 'core-mechanics',
            name: 'Core Mechanics',
            subtopics: [
              { id: 'blockchain-structure', name: 'Blockchain Structure', blogSlug: 'blockchain-structure' },
              { id: 'cryptography-and-hashing', name: 'Cryptography & Hashing', blogSlug: 'cryptography-hashing-blockchain' },
              { id: 'decentralization', name: 'Decentralization', blogSlug: 'blockchain-decentralization' },
              { id: 'decentralization-vs-trust', name: 'Decentralization vs Trust', blogSlug: 'decentralization-vs-trust' },
              { id: 'blockchain-networks', name: 'Blockchain Networks', blogSlug: 'blockchain-networks' }
            ]
          },
          {
            id: 'consensus-protocols',
            name: 'Consensus Protocols',
            subtopics: [
              { id: 'pow', name: 'PoW', blogSlug: 'proof-of-work' },
              { id: 'pos', name: 'PoS', blogSlug: 'proof-of-stake' },
              { id: 'poh', name: 'PoH', blogSlug: 'proof-of-history' },
              { id: 'bft', name: 'BFT', blogSlug: 'byzantine-fault-tolerance' }
            ]
          },
          {
            id: 'operations-and-ecosystem',
            name: 'Operations & Ecosystem',
            subtopics: [
              { id: 'basic-blockchain-operations', name: 'Basic Blockchain Operations', blogSlug: 'blockchain-operations' },
              { id: 'blockchain-interoperability', name: 'Blockchain Interoperability', blogSlug: 'blockchain-interoperability' },
              { id: 'storage', name: 'Storage', blogSlug: 'blockchain-storage' },
              { id: 'blockchain-forking', name: 'Blockchain Forking', blogSlug: 'blockchain-forking' },
              { id: 'cryptocurrencies', name: 'Cryptocurrencies', blogSlug: 'cryptocurrencies-intro' },
              { id: 'cryptowallets', name: 'Cryptowallets', blogSlug: 'crypto-wallets' },
              { id: 'mining-incentive-models', name: 'Mining & Incentive Models', blogSlug: 'mining-incentives' },
              { id: 'environmental-considerations', name: 'Environmental Considerations', blogSlug: 'blockchain-environmental-impact' }
            ]
          }
        ]
      },
      {
        id: 'types-of-blockchains',
        name: 'Types of Blockchains',
        description: 'Different blockchain architectures and networks.',
        concepts: [
          {
            id: 'evm-based',
            name: 'EVM-Based',
            subtopics: [
              { id: 'ethereum', name: 'Ethereum', blogSlug: 'ethereum-network' },
              { id: 'polygon', name: 'Polygon', blogSlug: 'polygon-network' },
              { id: 'bnb-chain', name: 'BNB Chain', blogSlug: 'bnb-chain' },
              { id: 'gnosis-chain', name: 'Gnosis Chain', blogSlug: 'gnosis-chain' },
              { id: 'avalanche', name: 'Avalanche', blogSlug: 'avalanche-network' },
              { id: 'fantom', name: 'Fantom', blogSlug: 'fantom-network' },
              { id: 'moonbeam-moonriver', name: 'Moonbeam / Moonriver', blogSlug: 'moonbeam-moonriver' }
            ]
          },
          {
            id: 'other-architectures',
            name: 'Other Architectures',
            subtopics: [
              { id: 'utxo-based', name: 'UTXO-Based', blogSlug: 'utxo-blockchains' },
              { id: 'tvm-based', name: 'TVM-Based', blogSlug: 'tvm-blockchains' },
              { id: 'l2-blockchains', name: 'L2 Blockchains', blogSlug: 'l2-blockchains' },
              { id: 'solana', name: 'Solana', blogSlug: 'solana-network' }
            ]
          }
        ]
      },
      {
        id: 'smart-contracts',
        name: 'Smart Contracts',
        description: 'Developing, testing, and deploying smart contracts.',
        concepts: [
          {
            id: 'languages-and-tools',
            name: 'Languages & Tools',
            subtopics: [
              { id: 'programming-languages', name: 'Programming Languages', blogSlug: 'smart-contract-languages' },
              { id: 'ides', name: 'IDEs', blogSlug: 'smart-contract-ides' },
              { id: 'frameworks-and-vcs', name: 'Frameworks & Version Control', blogSlug: 'smart-contract-frameworks' }
            ]
          },
          {
            id: 'lifecycle-and-security',
            name: 'Lifecycle & Ecosystem',
            subtopics: [
              { id: 'testing', name: 'Testing', blogSlug: 'smart-contract-testing' },
              { id: 'deployment', name: 'Deployment', blogSlug: 'smart-contract-deployment' },
              { id: 'monitoring-and-upgrades', name: 'Monitoring & Upgrades', blogSlug: 'smart-contract-monitoring' },
              { id: 'erc-tokens', name: 'ERC Tokens', blogSlug: 'erc-tokens' },
              { id: 'crypto-wallets-integration', name: 'Crypto Wallets Integration', blogSlug: 'wallet-integration' },
              { id: 'crypto-faucets', name: 'Crypto Faucets', blogSlug: 'crypto-faucets' },
              { id: 'decentralized-storage', name: 'Decentralized Storage', blogSlug: 'decentralized-storage' }
            ]
          }
        ]
      },
      {
        id: 'security-and-oracles',
        name: 'Security & Oracles',
        description: 'Securing dApps and connecting them to real-world data.',
        concepts: [
          {
            id: 'blockchain-security',
            name: 'Security Practices',
            subtopics: [
              { id: 'security-tooling', name: 'Security Tooling', blogSlug: 'smart-contract-security-tools' },
              { id: 'fuzz-testing-static-analysis', name: 'Fuzz Testing & Static Analysis', blogSlug: 'fuzzing-static-analysis' },
              { id: 'common-threat-vectors', name: 'Common Threat Vectors', blogSlug: 'blockchain-threat-vectors' },
              { id: 'source-of-randomness-attacks', name: 'Source of Randomness Attacks', blogSlug: 'randomness-attacks' }
            ]
          },
          {
            id: 'oracles',
            name: 'Oracles',
            subtopics: [
              { id: 'hybrid-smart-contracts', name: 'Hybrid Smart Contracts', blogSlug: 'hybrid-smart-contracts' },
              { id: 'chainlink', name: 'Chainlink', blogSlug: 'chainlink-oracles' },
              { id: 'oracle-networks', name: 'Oracle Networks', blogSlug: 'oracle-networks' }
            ]
          }
        ]
      },
      {
        id: 'decentralized-applications',
        name: 'Decentralized Applications',
        description: 'Building and scaling full-stack dApps.',
        concepts: [
          {
            id: 'dapp-development',
            name: 'dApp Development',
            subtopics: [
              { id: 'dapp-testing-deployment', name: 'Testing & Deployment', blogSlug: 'dapp-testing' },
              { id: 'dapp-architecture-security', name: 'Architecture & Security', blogSlug: 'dapp-architecture' },
              { id: 'frontend-frameworks', name: 'Frontend Frameworks', blogSlug: 'dapp-frontend' },
              { id: 'client-libraries', name: 'Client Libraries', blogSlug: 'web3-client-libraries' },
              { id: 'supporting-languages', name: 'Supporting Languages', blogSlug: 'dapp-supporting-languages' }
            ]
          },
          {
            id: 'building-for-scale',
            name: 'Building for Scale',
            subtopics: [
              { id: 'state-payment-channels', name: 'State & Payment Channels', blogSlug: 'state-channels' },
              { id: 'optimistic-rollups-fraud-proofs', name: 'Optimistic Rollups & Fraud Proofs', blogSlug: 'optimistic-rollups' },
              { id: 'zk-rollups-zkp', name: 'Zk Rollups & ZKP', blogSlug: 'zk-rollups' },
              { id: 'ethereum-2-0', name: 'Ethereum 2.0', blogSlug: 'ethereum-2-0' },
              { id: 'on-chain-scaling', name: 'On-Chain Scaling', blogSlug: 'on-chain-scaling' }
            ]
          },
          {
            id: 'nodes-and-applicability',
            name: 'Nodes & Ecosystem',
            subtopics: [
              { id: 'client-nodes', name: 'Client Nodes', blogSlug: 'client-nodes' },
              { id: 'node-as-a-service', name: 'Node as a Service', blogSlug: 'node-as-a-service' },
              { id: 'applicability', name: 'Applicability', blogSlug: 'blockchain-applicability' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cyber-security',
    number: '11',
    name: 'Cyber Security',
    difficulty: 'Hard',
    hours: 50,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Fundamental IT skills, networking, security practices, tooling, and cloud security.',
    topics: [
      {
        id: 'fundamental-it-skills',
        name: 'Fundamental IT Skills & OS',
        description: 'Core hardware, suites, and operating systems knowledge.',
        concepts: [
          {
            id: 'hardware-and-suites',
            name: 'Hardware & Suites',
            subtopics: [
              { id: 'hardware-components', name: 'Computer Hardware Components', blogSlug: 'computer-hardware' },
              { id: 'connection-types', name: 'Connection Types', blogSlug: 'connection-types' },
              { id: 'troubleshooting', name: 'OS-Independent Troubleshooting', blogSlug: 'os-troubleshooting' },
              { id: 'popular-suites', name: 'Popular Suites', blogSlug: 'popular-suites' }
            ]
          },
          {
            id: 'operating-systems',
            name: 'Operating Systems',
            subtopics: [
              { id: 'windows-linux-macos', name: 'Windows, Linux, MacOS', blogSlug: 'operating-systems-overview' },
              { id: 'installation-config', name: 'Installation & Configuration', blogSlug: 'os-installation-config' },
              { id: 'gui-cli-navigation', name: 'GUI & CLI Navigation', blogSlug: 'gui-cli-navigation' },
              { id: 'permissions', name: 'Understand Permissions', blogSlug: 'os-permissions' },
              { id: 'file-crud-commands', name: 'File CRUD & Commands', blogSlug: 'file-crud-commands' }
            ]
          },
          {
            id: 'virtualization',
            name: 'Virtualization',
            subtopics: [
              { id: 'virtualization-tech', name: 'VMWare & VirtualBox', blogSlug: 'virtualization-tech' },
              { id: 'hypervisor-vms', name: 'Hypervisor, HostOS, GuestOS, VM', blogSlug: 'hypervisor-vms' }
            ]
          }
        ]
      },
      {
        id: 'networking-knowledge',
        name: 'Networking Knowledge',
        description: 'Protocols, models, topologies, and networking tools.',
        concepts: [
          {
            id: 'networking-fundamentals',
            name: 'Fundamentals',
            subtopics: [
              { id: 'osi-model', name: 'OSI Model', blogSlug: 'osi-model' },
              { id: 'subnetting', name: 'Subnetting', blogSlug: 'subnetting-basics' },
              { id: 'ip-addresses', name: 'Public vs Private IP Addresses', blogSlug: 'ip-addresses' },
              { id: 'ip-terminology', name: 'IP Terminology', blogSlug: 'ip-terminology' }
            ]
          },
          {
            id: 'topologies-protocols',
            name: 'Topologies & Protocols',
            subtopics: [
              { id: 'network-topologies', name: 'Network Topologies', blogSlug: 'network-topologies' },
              { id: 'network-protocols', name: 'Network Protocols', blogSlug: 'network-protocols' },
              { id: 'common-ports', name: 'Common Ports', blogSlug: 'common-ports' },
              { id: 'nas-san', name: 'NAS & SAN', blogSlug: 'nas-san' }
            ]
          },
          {
            id: 'terminology-and-tools',
            name: 'Terminology & Tools',
            subtopics: [
              { id: 'networking-terms', name: 'Networking Terms', blogSlug: 'networking-terminology' },
              { id: 'dhcp-dns-ntp-ipam', name: 'DHCP, DNS, NTP, IPAM', blogSlug: 'dhcp-dns-ntp-ipam' },
              { id: 'networking-commands', name: 'Networking Commands', blogSlug: 'networking-commands' },
              { id: 'sniffers-scanners', name: 'Packet Sniffers & Port Scanners', blogSlug: 'sniffers-scanners' }
            ]
          }
        ]
      },
      {
        id: 'security-skills-knowledge',
        name: 'Security Skills & Knowledge',
        description: 'Practices, frameworks, hardening, cryptography, and attacks.',
        concepts: [
          {
            id: 'core-security-concepts',
            name: 'Core Concepts',
            subtopics: [
              { id: 'defense-in-depth', name: 'Defense in Depth', blogSlug: 'defense-in-depth' },
              { id: 'zero-trust', name: 'Zero Trust', blogSlug: 'zero-trust' },
              { id: 'cia-triad', name: 'CIA Triad', blogSlug: 'cia-triad' },
              { id: 'auth-vs-auth', name: 'Authentication vs Authorization', blogSlug: 'auth-vs-auth' },
              { id: 'risk-and-compliance', name: 'Risk, Compliance, Auditors', blogSlug: 'risk-compliance' }
            ]
          },
          {
            id: 'frameworks-and-operations',
            name: 'Frameworks & Operations',
            subtopics: [
              { id: 'cyber-kill-chain', name: 'Cyber Kill Chain & ATT&CK', blogSlug: 'cyber-kill-chain-attack' },
              { id: 'security-standards', name: 'ISO, NIST, CIS, RMF, CSF', blogSlug: 'security-standards' },
              { id: 'incident-response', name: 'Incident Response Process', blogSlug: 'incident-response' },
              { id: 'threat-hunting', name: 'Threat Hunting & Intel (OSINT)', blogSlug: 'threat-hunting' },
              { id: 'vuln-management', name: 'Vulnerability Management', blogSlug: 'vuln-management' },
              { id: 'red-blue-purple-teams', name: 'Red / Blue / Purple Teams', blogSlug: 'security-teams' }
            ]
          },
          {
            id: 'hardening-and-defenses',
            name: 'Hardening & Defenses',
            subtopics: [
              { id: 'os-hardening', name: 'OS Hardening & Isolation', blogSlug: 'os-hardening' },
              { id: 'ids-ips', name: 'IDS & IPS', blogSlug: 'ids-ips' },
              { id: 'firewalls-and-edr', name: 'Firewalls, EDR, Antivirus', blogSlug: 'firewalls-edr' },
              { id: 'sandboxing', name: 'Sandboxing & Honeypots', blogSlug: 'sandboxing-honeypots' },
              { id: 'network-hardening', name: 'ACLs, Port Blocking, Jump Servers', blogSlug: 'network-hardening' }
            ]
          },
          {
            id: 'cryptography-and-attacks',
            name: 'Cryptography & Attacks',
            subtopics: [
              { id: 'crypto-basics', name: 'Salting, Hashing, PKI', blogSlug: 'crypto-basics' },
              { id: 'auth-methodologies', name: 'Kerberos, RADIUS, LDAP, SSO', blogSlug: 'auth-methodologies' },
              { id: 'malware-and-web-attacks', name: 'Malware & Web Attacks (OWASP10)', blogSlug: 'malware-web-attacks' },
              { id: 'social-engineering', name: 'Social Engineering (Phishing)', blogSlug: 'social-engineering' },
              { id: 'network-attacks', name: 'DoS/DDoS, MITM, SQLi, XSS', blogSlug: 'network-attacks' }
            ]
          }
        ]
      },
      {
        id: 'offensive-security-tooling',
        name: 'Offensive Security & Tooling',
        description: 'Tools, frameworks, and practice platforms for hacking.',
        concepts: [
          {
            id: 'hacking-tools-frameworks',
            name: 'Tools & Frameworks',
            subtopics: [
              { id: 'exploit-frameworks', name: 'Exploit Frameworks', blogSlug: 'exploit-frameworks' },
              { id: 'incident-response-tools', name: 'IR Tools (Wireshark, FTK Imager)', blogSlug: 'ir-tools' },
              { id: 'hacking-distros', name: 'Hacking Distros (Kali, ParrotOS)', blogSlug: 'hacking-distros' },
              { id: 'lolbas-gtfobins', name: 'LOLBAS, GTFOBINS', blogSlug: 'lolbas-gtfobins' },
              { id: 'common-security-tools', name: 'VirusTotal, urlscan, WHOIS', blogSlug: 'common-security-tools' }
            ]
          },
          {
            id: 'practice-and-certifications',
            name: 'Practice & Certifications',
            subtopics: [
              { id: 'ctfs', name: 'CTFs (HackTheBox, TryHackMe)', blogSlug: 'ctfs-platforms' },
              { id: 'beginner-certs', name: 'Beginner Certs (CompTIA, CCNA)', blogSlug: 'beginner-certs' },
              { id: 'advanced-certs', name: 'Advanced Certs (CEH, OSCP, CISSP)', blogSlug: 'advanced-certs' }
            ]
          }
        ]
      },
      {
        id: 'cloud-security',
        name: 'Cloud Security',
        description: 'Securing cloud environments and infrastructure as code.',
        concepts: [
          {
            id: 'cloud-concepts',
            name: 'Cloud Concepts',
            subtopics: [
              { id: 'security-in-cloud', name: 'Security in the Cloud', blogSlug: 'security-in-cloud' },
              { id: 'cloud-vs-on-prem', name: 'Cloud vs On-Premises', blogSlug: 'cloud-vs-on-prem' },
              { id: 'iac-and-serverless', name: 'Infrastructure as Code & Serverless', blogSlug: 'iac-serverless' },
              { id: 'cloud-deploying-flow', name: 'Deploying in the Cloud', blogSlug: 'cloud-deploying-flow' }
            ]
          },
          {
            id: 'cloud-environments-services',
            name: 'Environments & Services',
            subtopics: [
              { id: 'cloud-services', name: 'Cloud Services (SaaS, PaaS, IaaS)', blogSlug: 'cloud-services' },
              { id: 'cloud-models', name: 'Cloud Models (Public, Private, Hybrid)', blogSlug: 'cloud-models' },
              { id: 'common-environments', name: 'AWS, GCP, Azure', blogSlug: 'common-cloud-environments' },
              { id: 'cloud-storage', name: 'Common Cloud Storage', blogSlug: 'common-cloud-storage' }
            ]
          }
        ]
      },
      {
        id: 'programming-skills',
        name: 'Programming Skills',
        description: 'Languages commonly used in cyber security scripting and tools.',
        concepts: [
          {
            id: 'security-languages',
            name: 'Security Languages',
            subtopics: [
              { id: 'python', name: 'Python', blogSlug: 'python-for-security' },
              { id: 'go', name: 'Go', blogSlug: 'go-for-security' },
              { id: 'javascript', name: 'JavaScript', blogSlug: 'javascript-for-security' },
              { id: 'cpp', name: 'C++', blogSlug: 'cpp-for-security' },
              { id: 'bash', name: 'Bash', blogSlug: 'bash-for-security' },
              { id: 'powershell', name: 'PowerShell', blogSlug: 'powershell-for-security' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'product-manager',
    number: '12',
    name: 'Product Manager',
    difficulty: 'Medium',
    hours: 40,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Everything you need to know to become a Product Manager, from ideation to launch.',
    topics: [
      {
        id: 'pm-introduction',
        name: 'Introduction to PM',
        description: 'Basics of Product Management and the product lifecycle.',
        concepts: [
          {
            id: 'pm-basics',
            name: 'PM Basics',
            subtopics: [
              { id: 'what-is-pm', name: 'What is Product Management?', blogSlug: 'what-is-product-management' },
              { id: 'product-vs-project', name: 'Product vs Project Management', blogSlug: 'product-vs-project' },
              { id: 'roles-responsibilities', name: 'Roles and Responsibilities', blogSlug: 'pm-roles-responsibilities' },
              { id: 'key-skills', name: 'Key Skills', blogSlug: 'pm-key-skills' }
            ]
          },
          {
            id: 'product-lifecycle',
            name: 'Product Lifecycle',
            subtopics: [
              { id: 'development', name: 'Development', blogSlug: 'pm-development' },
              { id: 'introduction', name: 'Introduction', blogSlug: 'pm-introduction-phase' },
              { id: 'growth', name: 'Growth', blogSlug: 'pm-growth' },
              { id: 'maturity', name: 'Maturity', blogSlug: 'pm-maturity' },
              { id: 'decline', name: 'Decline', blogSlug: 'pm-decline' }
            ]
          }
        ]
      },
      {
        id: 'idea-generation-research',
        name: 'Idea Generation & Research',
        description: 'Ideation techniques, problem framing, and market analysis.',
        concepts: [
          {
            id: 'ideation',
            name: 'Ideation Techniques',
            subtopics: [
              { id: 'mind-mapping', name: 'Mind Mapping', blogSlug: 'pm-mind-mapping' },
              { id: 'brainwriting', name: 'Brainwriting', blogSlug: 'pm-brainwriting' },
              { id: 'scamper', name: 'SCAMPER', blogSlug: 'pm-scamper' }
            ]
          },
          {
            id: 'product-identification',
            name: 'Product Identification',
            subtopics: [
              { id: 'iterative-process', name: 'Discovery, Validation, Execution', blogSlug: 'pm-iterative-process' },
              { id: 'blue-ocean-strategy', name: 'Blue Ocean Strategy', blogSlug: 'blue-ocean-strategy' },
              { id: 'triz', name: 'TRIZ', blogSlug: 'pm-triz' },
              { id: 'problem-framing', name: 'Problem Framing', blogSlug: 'problem-framing' }
            ]
          },
          {
            id: 'market-user-research',
            name: 'Market & User Research',
            subtopics: [
              { id: 'user-personas-interviews', name: 'Personas & Interviews', blogSlug: 'user-personas-interviews' },
              { id: 'surveys-ethnographic', name: 'Surveys & Ethnographic Research', blogSlug: 'surveys-ethnographic' },
              { id: 'market-needs-trends', name: 'Identifying Needs & Trends', blogSlug: 'market-needs-trends' },
              { id: 'competitive-analysis', name: 'Competitive Analysis', blogSlug: 'pm-competitive-analysis' }
            ]
          }
        ]
      },
      {
        id: 'product-strategy',
        name: 'Product Strategy',
        description: 'Positioning, goals, and competitive strategies.',
        concepts: [
          {
            id: 'positioning-vision',
            name: 'Positioning & Vision',
            subtopics: [
              { id: 'positioning-usp', name: 'USP & Market Segmentation', blogSlug: 'positioning-usp' },
              { id: 'vision-mission-narrative', name: 'Vision, Mission & Narrative', blogSlug: 'vision-mission' },
              { id: 'value-proposition', name: 'Value Proposition Canvas', blogSlug: 'value-proposition' }
            ]
          },
          {
            id: 'goals-competitive-strategy',
            name: 'Goals & Competitive Strategy',
            subtopics: [
              { id: 'defining-goals', name: 'Target, Baseline, Trend, Timeframe', blogSlug: 'defining-pm-goals' },
              { id: 'five-forces', name: 'Five Forces Analysis', blogSlug: 'five-forces' },
              { id: 'competitive-advantage', name: 'Competitive Advantage', blogSlug: 'competitive-advantage' },
              { id: 'strategic-partners', name: 'Strategic Partnerships', blogSlug: 'strategic-partners' }
            ]
          }
        ]
      },
      {
        id: 'product-planning-design',
        name: 'Product Planning & Design',
        description: 'Roadmaps, backlog management, and UX design principles.',
        concepts: [
          {
            id: 'requirements-backlog',
            name: 'Requirements & Backlog',
            subtopics: [
              { id: 'prds-user-stories', name: 'Writing PRDs & User Stories', blogSlug: 'prds-user-stories' },
              { id: 'prioritization-techniques', name: 'Prioritization Techniques', blogSlug: 'pm-prioritization' },
              { id: 'grooming-story-mapping', name: 'Grooming & Story Mapping', blogSlug: 'grooming-story-mapping' }
            ]
          },
          {
            id: 'product-roadmap',
            name: 'Product Roadmap',
            subtopics: [
              { id: 'creating-roadmap', name: 'Creating & Prioritising', blogSlug: 'creating-roadmap' },
              { id: 'continuous-outcome-based', name: 'Continuous & Outcome-Based', blogSlug: 'outcome-roadmaps' },
              { id: 'communicating-roadmap', name: 'Communicating the Roadmap', blogSlug: 'communicating-roadmap' }
            ]
          },
          {
            id: 'ux-ui-testing',
            name: 'UX/UI & User Testing',
            subtopics: [
              { id: 'design-principles', name: 'Design Principles & Prototyping', blogSlug: 'pm-design-principles' },
              { id: 'service-interaction-design', name: 'Service & Interaction Design', blogSlug: 'interaction-design' },
              { id: 'usability-ab-testing', name: 'Usability & A/B Testing', blogSlug: 'usability-ab-testing' }
            ]
          }
        ]
      },
      {
        id: 'development-launch-metrics',
        name: 'Development, Launch & Metrics',
        description: 'Working with engineering, go-to-market strategies, and analytics.',
        concepts: [
          {
            id: 'agile-engineering',
            name: 'Agile & Engineering',
            subtopics: [
              { id: 'scrum-kanban', name: 'Scrum & Kanban Basics', blogSlug: 'scrum-kanban' },
              { id: 'sprint-planning-mvp', name: 'Sprint Planning & MVP', blogSlug: 'sprint-planning-mvp' },
              { id: 'retrospectives-standups', name: 'Standups & Retrospectives', blogSlug: 'agile-ceremonies' }
            ]
          },
          {
            id: 'gtm-release',
            name: 'Go-to-Market & Release',
            subtopics: [
              { id: 'launch-growth', name: 'Launch Planning & Growth Hacking', blogSlug: 'launch-growth' },
              { id: 'release-strategies', name: 'Feature Toggles & Rollouts', blogSlug: 'release-strategies' }
            ]
          },
          {
            id: 'product-metrics',
            name: 'Metrics & Data Decisions',
            subtopics: [
              { id: 'key-metrics', name: 'DAU/MAU, Retention, LTV, CAC', blogSlug: 'key-product-metrics' },
              { id: 'data-driven', name: 'Cohort Analysis & Predictive Analytics', blogSlug: 'cohort-analysis' },
              { id: 'feedback-loops', name: 'Feedback Loops', blogSlug: 'feedback-loops' }
            ]
          }
        ]
      },
      {
        id: 'stakeholder-risk-management',
        name: 'Stakeholder & Risk Mgmt',
        description: 'Communication, managing expectations, and identifying risks.',
        concepts: [
          {
            id: 'communication-skills',
            name: 'Communication Skills',
            subtopics: [
              { id: 'interpersonal', name: 'Active Listening & Conflict Res', blogSlug: 'interpersonal-skills' },
              { id: 'business-alignment', name: 'Alignment, Buy-In, Showing Impact', blogSlug: 'business-alignment' }
            ]
          },
          {
            id: 'managing-stakeholders',
            name: 'Managing Stakeholders',
            subtopics: [
              { id: 'stakeholder-mapping', name: 'Identifying & Mapping', blogSlug: 'stakeholder-mapping' },
              { id: 'stakeholder-engagement', name: 'Engagement & Remote Stakeholders', blogSlug: 'stakeholder-engagement' }
            ]
          },
          {
            id: 'risk-management',
            name: 'Risk Management',
            subtopics: [
              { id: 'identifying-assessing', name: 'Identifying & Assessing Risks', blogSlug: 'assessing-risks' },
              { id: 'mitigation-monitoring', name: 'Mitigation Strategies & Monitoring', blogSlug: 'risk-mitigation' }
            ]
          }
        ]
      },
      {
        id: 'tools-advanced-topics',
        name: 'Tools & Advanced Topics',
        description: 'PM tools, scaling strategies, and leadership.',
        concepts: [
          {
            id: 'pm-tools',
            name: 'PM Tools',
            subtopics: [
              { id: 'roadmapping-project-tools', name: 'Jira, Notion, Product Board', blogSlug: 'pm-software-tools' },
              { id: 'analytics-communication', name: 'Amplitude, Slack, Teams', blogSlug: 'pm-analytics-tools' }
            ]
          },
          {
            id: 'advanced-analysis-scaling',
            name: 'Analysis & Scaling',
            subtopics: [
              { id: 'ai-ml-in-pm', name: 'AI & ML in Product Management', blogSlug: 'ai-ml-in-pm' },
              { id: 'growth-strategies', name: 'Growth & Internationalization', blogSlug: 'scaling-products' },
              { id: 'portfolio-management', name: 'Portfolio Management', blogSlug: 'portfolio-management' }
            ]
          },
          {
            id: 'leadership',
            name: 'Leadership & Influence',
            subtopics: [
              { id: 'building-teams', name: 'Building & Leading Teams', blogSlug: 'building-teams' },
              { id: 'influencing-without-authority', name: 'Influencing without Authority', blogSlug: 'influencing-without-authority' }
            ]
          }
        ]
      }
    ]
  }
,
  {
    id: 'data-engineering',
    number: '13',
    name: 'Data Engineer',
    difficulty: 'Hard',
    hours: 58,
    visualizerAvailable: false,
    learningStatus: 'Not Started',
    description: 'Learn the foundational and advanced concepts of Data Engineering, from data generation to data serving.',
    topics: [
      {
        id: 'de-intro',
        name: 'Introduction',
        description: 'What is data engineering and its lifecycle.',
        concepts: [
          {
            id: 'de-intro-concept',
            name: 'Introduction to DE',
            subtopics: [
              { id: 'de-intro-what-is', name: 'What is Data Engineering?', blogSlug: 'de-intro-what-is' },
              { id: 'de-intro-vs-ds', name: 'Data Engineering vs Data Science', blogSlug: 'de-intro-vs-ds' },
              { id: 'de-intro-skills', name: 'Skills and Responsibilities', blogSlug: 'de-intro-skills' },
              { id: 'de-intro-lifecycle', name: 'Data Engineering Lifecycle', blogSlug: 'de-intro-lifecycle' },
              { id: 'de-intro-tech', name: 'Choosing the Right Technologies', blogSlug: 'de-intro-tech' }
            ]
          }
        ]
      },
      {
        id: 'de-basics',
        name: 'Learn the Basics',
        description: 'Programming skills and core fundamentals.',
        concepts: [
          {
            id: 'de-basics-prog',
            name: 'Programming Skills',
            subtopics: [
              { id: 'de-basics-programming', name: 'Python, Java, Scala, Go', blogSlug: 'de-basics-programming' }
            ]
          },
          {
            id: 'de-basics-fundamentals',
            name: 'Fundamentals',
            subtopics: [
              { id: 'de-basics-dsa', name: 'Data Structures and Algorithms', blogSlug: 'de-basics-dsa' },
              { id: 'de-basics-git', name: 'Git and GitHub', blogSlug: 'de-basics-git' },
              { id: 'de-basics-linux', name: 'Linux Basics', blogSlug: 'de-basics-linux' },
              { id: 'de-basics-network', name: 'Networking Fundamentals', blogSlug: 'de-basics-network' },
              { id: 'de-basics-distributed', name: 'Distributed Systems Basics', blogSlug: 'de-basics-distributed' }
            ]
          }
        ]
      },
      {
        id: 'de-lifecycle',
        name: 'Data Engineering Lifecycle',
        description: 'Understand Different Steps.',
        concepts: [
          {
            id: 'de-lifecycle-steps',
            name: 'Understand Different Steps',
            subtopics: [
              { id: 'de-lifecycle-generation', name: 'Data Generation', blogSlug: 'de-lifecycle-generation' },
              { id: 'de-lifecycle-storage', name: 'Data Storage', blogSlug: 'de-lifecycle-storage' },
              { id: 'de-lifecycle-ingestion', name: 'Data Ingestion', blogSlug: 'de-lifecycle-ingestion' },
              { id: 'de-lifecycle-serving', name: 'Data Serving', blogSlug: 'de-lifecycle-serving' }
            ]
          }
        ]
      },
      {
        id: 'de-gen',
        name: 'Data Generation',
        description: 'Sources of Data and Considerations.',
        concepts: [
          {
            id: 'de-gen-sources',
            name: 'Sources of Data',
            subtopics: [
              { id: 'de-gen-sources-all', name: 'Database, APIs, Logs, Mobile Apps, IoT', blogSlug: 'de-gen-sources' }
            ]
          },
          {
            id: 'de-gen-cons',
            name: 'Data Collection Considerations',
            subtopics: [
              { id: 'de-gen-considerations', name: 'Collection Considerations', blogSlug: 'de-gen-considerations' }
            ]
          }
        ]
      },
      {
        id: 'de-db',
        name: 'Database Fundamentals',
        description: 'Database design and scaling concepts.',
        concepts: [
          {
            id: 'de-db-fundamentals',
            name: 'Core Concepts',
            subtopics: [
              { id: 'de-db-normalization', name: 'Data Normalization', blogSlug: 'de-db-normalization' },
              { id: 'de-db-modelling', name: 'Data Modelling Techniques', blogSlug: 'de-db-modelling' },
              { id: 'de-db-cap', name: 'CAP Theorem', blogSlug: 'de-db-cap' },
              { id: 'de-db-oltp-olap', name: 'OLTP vs OLAP', blogSlug: 'de-db-oltp-olap' }
            ]
          },
          {
            id: 'de-model-concepts',
            name: 'Data Modeling Concepts',
            subtopics: [
              { id: 'de-model-scd', name: 'Slowly Changing Dimension - SCD', blogSlug: 'de-model-scd' },
              { id: 'de-model-scaling', name: 'Horizontal vs Vertical Scaling', blogSlug: 'de-model-scaling' },
              { id: 'de-model-star-snowflake', name: 'Star vs Snowflake Schema', blogSlug: 'de-model-star-snowflake' }
            ]
          }
        ]
      },
      {
        id: 'de-storage',
        name: 'Data Storage',
        description: 'Where to store your data.',
        concepts: [
          {
            id: 'de-storage-relational',
            name: 'Relational Databases',
            subtopics: [
              { id: 'de-storage-relational-all', name: 'MySQL, PostgreSQL, MariaDB, Aurora DB, Oracle, MS SQL', blogSlug: 'de-storage-relational' }
            ]
          },
          {
            id: 'de-storage-nosql',
            name: 'NoSQL Databases',
            subtopics: [
              { id: 'de-storage-nosql-all', name: 'Document, Column, Graph, Key-Value', blogSlug: 'de-storage-nosql' }
            ]
          },
          {
            id: 'de-storage-warehouse',
            name: 'Data Warehousing',
            subtopics: [
              { id: 'de-storage-warehouse-all', name: 'BigQuery, Snowflake, Redshift, Architectures', blogSlug: 'de-storage-warehouse' }
            ]
          },
          {
            id: 'de-storage-datalake',
            name: 'Data Lake',
            subtopics: [
              { id: 'de-storage-datalake-all', name: 'Databricks, Snowflake, Onehouse', blogSlug: 'de-storage-datalake' }
            ]
          }
        ]
      },
      {
        id: 'de-ingest',
        name: 'Data Ingestion',
        description: 'How to move data.',
        concepts: [
          {
            id: 'de-ingest-types',
            name: 'Types of Data Ingestion',
            subtopics: [
              { id: 'de-ingest-types-all', name: 'Batch, Hybrid, Realtime', blogSlug: 'de-ingest-types' }
            ]
          },
          {
            id: 'de-ingest-pipelines',
            name: 'Data Pipelines',
            subtopics: [
              { id: 'de-ingest-etl', name: 'ETL Process', blogSlug: 'de-ingest-etl' },
              { id: 'de-ingest-tools', name: 'Data Pipeline Tools (Airflow, dbt, etc.)', blogSlug: 'de-ingest-tools' }
            ]
          }
        ]
      },
      {
        id: 'de-cloud',
        name: 'Cloud Computing',
        description: 'Cloud architectures and providers.',
        concepts: [
          {
            id: 'de-cloud-all',
            name: 'Cloud Foundations',
            subtopics: [
              { id: 'de-cloud-architectures', name: 'Cloud Architectures', blogSlug: 'de-cloud-architectures' },
              { id: 'de-cloud-providers', name: 'Cloud Providers (AWS, Azure, GCP)', blogSlug: 'de-cloud-providers' }
            ]
          }
        ]
      },
      {
        id: 'de-cluster',
        name: 'Cluster Computing Basics',
        description: 'Cluster fundamentals.',
        concepts: [
          {
            id: 'de-cluster-concepts',
            name: 'Cluster Concepts',
            subtopics: [
              { id: 'de-cluster-what-is', name: 'What is Cluster Computing', blogSlug: 'de-cluster-what-is' },
              { id: 'de-cluster-hdfs', name: 'Distributed File Systems (HDFS)', blogSlug: 'de-cluster-hdfs' },
              { id: 'de-cluster-jobs', name: 'Job Scheduling', blogSlug: 'de-cluster-jobs' },
              { id: 'de-cluster-management', name: 'Cluster Management Tools (K8s, YARN)', blogSlug: 'de-cluster-management' }
            ]
          }
        ]
      },
      {
        id: 'de-bigdata',
        name: 'Big Data Tools',
        description: 'Spark and Hadoop ecosystem.',
        concepts: [
          {
            id: 'de-bigdata-concepts',
            name: 'Tools & Ecosystems',
            subtopics: [
              { id: 'de-bigdata-spark', name: 'Apache Spark', blogSlug: 'de-bigdata-spark' },
              { id: 'de-bigdata-hadoop', name: 'Hadoop Ecosystem', blogSlug: 'de-bigdata-hadoop' }
            ]
          }
        ]
      },
      {
        id: 'de-containers',
        name: 'Containers & Orchestration',
        description: 'Docker and Kubernetes.',
        concepts: [
          {
            id: 'de-containers-tools',
            name: 'Containerization Tools',
            subtopics: [
              { id: 'de-containers-all', name: 'Docker, Kubernetes, GKE, EKS', blogSlug: 'de-containers' }
            ]
          }
        ]
      },
      {
        id: 'de-cicd',
        name: 'CI/CD & Monitoring',
        description: 'Deployment and observability.',
        concepts: [
          {
            id: 'de-cicd-concepts',
            name: 'Pipelines & Observation',
            subtopics: [
              { id: 'de-cicd-tools', name: 'GitHub Actions, Circle CI, GitLab CI, ArgoCD', blogSlug: 'de-cicd' },
              { id: 'de-monitoring-tools', name: 'Prometheus, Datadog, Sentry, New Relic', blogSlug: 'de-monitoring' }
            ]
          }
        ]
      },
      {
        id: 'de-message',
        name: 'Messaging Systems',
        description: 'Async queues and streams.',
        concepts: [
          {
            id: 'de-message-concepts',
            name: 'Messaging Fundamentals',
            subtopics: [
              { id: 'de-message-why', name: 'What and why use them?', blogSlug: 'de-message-why' },
              { id: 'de-message-async', name: 'Async vs Sync Communication', blogSlug: 'de-message-async' },
              { id: 'de-message-streams', name: 'Messages vs Streams', blogSlug: 'de-message-streams' },
              { id: 'de-message-practices', name: 'Best Practices', blogSlug: 'de-message-practices' },
              { id: 'de-message-tools', name: 'Common Tools (Kafka, RabbitMQ, etc.)', blogSlug: 'de-message-tools' }
            ]
          }
        ]
      },
      {
        id: 'de-testing',
        name: 'Testing & IaC',
        description: 'Ensuring code and infrastructure quality.',
        concepts: [
          {
            id: 'de-testing-concepts',
            name: 'Testing Types',
            subtopics: [
              { id: 'de-testing-types', name: 'Unit, Integration, E2E, Load Testing...', blogSlug: 'de-testing-types' }
            ]
          },
          {
            id: 'de-iac-concepts',
            name: 'Infrastructure as Code',
            subtopics: [
              { id: 'de-iac-fundamentals', name: 'Declarative vs Imperative, Idempotency', blogSlug: 'de-iac-concepts' },
              { id: 'de-iac-tools-list', name: 'Common Tools (Terraform, CDK)', blogSlug: 'de-iac-tools' }
            ]
          }
        ]
      },
      {
        id: 'de-security',
        name: 'Security & Governance',
        description: 'Data protection and compliance.',
        concepts: [
          {
            id: 'de-security-concepts',
            name: 'Security Principles',
            subtopics: [
              { id: 'de-security-all', name: 'Auth, Encryption, Masking', blogSlug: 'de-security-concepts' }
            ]
          },
          {
            id: 'de-gov-concepts',
            name: 'Data Governance & Privacy',
            subtopics: [
              { id: 'de-gov-all', name: 'Data Quality, Lineage, Metadata', blogSlug: 'de-gov-concepts' },
              { id: 'de-privacy-all', name: 'GDPR, ECPA, EU AI Act', blogSlug: 'de-privacy-regulations' }
            ]
          }
        ]
      },
      {
        id: 'de-serving',
        name: 'Data Serving',
        description: 'Analytics, BI, and ML.',
        concepts: [
          {
            id: 'de-serving-concepts',
            name: 'Serving Layer',
            subtopics: [
              { id: 'de-serving-analytics', name: 'Data Analytics', blogSlug: 'de-serving-analytics' },
              { id: 'de-serving-bi', name: 'Business Intelligence & BI Tools', blogSlug: 'de-serving-bi' },
              { id: 'de-serving-reverse-etl', name: 'Reverse ETL', blogSlug: 'de-serving-reverse-etl' }
            ]
          },
          {
            id: 'de-ml-concepts',
            name: 'Machine Learning',
            subtopics: [
              { id: 'de-ml-basics', name: 'Machine Learning Basics', blogSlug: 'de-ml' },
              { id: 'de-mlops', name: 'MLOps', blogSlug: 'de-mlops' }
            ]
          }
        ]
      }
    ]
  }
];

