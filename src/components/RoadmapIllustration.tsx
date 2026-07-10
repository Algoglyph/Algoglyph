import { SYSTEM_DESIGN_DIAGRAMS } from '../config/illustrationData';
import { ML_DIAGRAMS } from '../config/mlIllustrationData';
import { DE_DIAGRAMS } from '../config/deIllustrationData';
import { getCuratedRoadmapDiagram } from '../config/topicIllustrationData';
import React from 'react';

interface RoadmapIllustrationProps {
  slug: string;
}

export const RoadmapIllustration: React.FC<RoadmapIllustrationProps> = ({ slug }) => {
  const sLower = slug.toLowerCase();
  const customConfig = getCuratedRoadmapDiagram(sLower) || SYSTEM_DESIGN_DIAGRAMS[sLower] || ML_DIAGRAMS[sLower] || DE_DIAGRAMS[sLower];

  if (customConfig) {
    return (
      <div className="w-full h-[400px] md:h-[480px] bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center p-6 select-none relative">
        {/* Chalkboard Grid Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }} 
        />
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          {customConfig.elements.map((el, idx) => {
            if (el.type === 'circle') {
              return <circle key={idx} cx={el.cx} cy={el.cy} r={el.r} fill={el.fill || 'none'} stroke={el.stroke || '#71717a'} strokeWidth={el.strokeWidth || 1} strokeDasharray={el.strokeDasharray} />;
            }
            if (el.type === 'rect') {
              return <rect key={idx} x={el.x} y={el.y} width={el.width} height={el.height} rx={el.rx || 0} fill={el.fill || 'none'} stroke={el.stroke || '#71717a'} strokeWidth={el.strokeWidth || 1} strokeDasharray={el.strokeDasharray} />;
            }
            if (el.type === 'line') {
              return <line key={idx} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={el.stroke || '#71717a'} strokeWidth={el.strokeWidth || 1} strokeDasharray={el.strokeDasharray} />;
            }
            if (el.type === 'path') {
              return <path key={idx} d={el.d} fill={el.fill || 'none'} stroke={el.stroke || '#71717a'} strokeWidth={el.strokeWidth || 1} strokeDasharray={el.strokeDasharray} markerEnd={el.markerEnd} />;
            }
            if (el.type === 'polygon') {
              return <polygon key={idx} points={el.points} fill={el.fill || 'none'} stroke={el.stroke || '#71717a'} strokeWidth={el.strokeWidth || 1} strokeDasharray={el.strokeDasharray} />;
            }
            if (el.type === 'text') {
              return (
                <text 
                  key={idx} 
                  x={el.x} 
                  y={el.y} 
                  fill={el.fill || '#e4e4e7'} 
                  fontSize={el.fontSize || 9} 
                  textAnchor={el.textAnchor} 
                  fontWeight={el.fontWeight} 
                  fontFamily={el.fontFamily || 'monospace'}
                  transform={el.transform}
                >
                  {el.textContent}
                </text>
              );
            }
            return null;
          })}
          
          <defs>
            <marker id="arrow-copy" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#a1a1aa" />
            </marker>
          </defs>
        </svg>
      </div>
    );
  }

  const getIllustrationType = ():
    | 'static-array'
    | 'dynamic-array'
    | 'singly-linked-list'
    | 'doubly-linked-list'
    | 'circular-linked-list'
    | 'skip-list'
    | 'lifo-stack'
    | 'fifo-queue'
    | 'circular-buffer'
    | 'deque'
    | 'hash-function'
    | 'collision-resolution'
    | 'load-factor'
    | 'binary-tree'
    | 'binary-search-tree'
    | 'tree-traversal'
    | 'avl-tree'
    | 'red-black-tree'
    | 'segment-tree'
    | 'fenwick-tree'
    | 'sparse-table'
    | 'trie'
    | 'treap'
    | 'b-tree'
    | 'min-heap'
    | 'binomial-heap'
    | 'fibonacci-heap'
    | 'graph-representations'
    | 'bfs-traversal'
    | 'dfs-traversal'
    | 'topological-sort'
    | 'dijkstra'
    | 'bellman-ford'
    | 'floyd-warshall'
    | 'kruskal-mst'
    | 'prim-mst'
    | 'dsu'
    | 'bubble-sort'
    | 'insertion-sort'
    | 'merge-sort'
    | 'quick-sort'
    | 'heap-sort'
    | 'radix-sort'
    | 'linear-search'
    | 'binary-search'
    | 'ternary-search'
    | 'divide-conquer'
    | 'greedy'
    | 'dp'
    | 'backtracking'
    | 'branch-bound'
    | 'kmp'
    | 'rabin-karp'
    | 'z-algo'
    | 'suffix-structures'
    | 'tree'
    | 'graph'
    | 'recursion'
    | 'stack-allocation'
    | 'heap-allocation'
    | 'big-o'
    | 'time-complexity'
    | 'program-flow'
    | 'practice-platforms'
    | 'two-pointers'
    | 'sliding-window'
    | 'fast-slow-pointer'
    | 'cyclic-sort'
    | 'merge-intervals'
    | 'two-heaps'
    | 'a-star'
    | 'cap-theorem'
    | 'sql-vs-nosql'
    | 'cdn-caching'
    | 'load-balancer-l4-l7'
    | 'service-discovery'
    | 'consistent-hashing'
    | 'message-queues'
    | 'cqrs-event-sourcing'
    | 'leader-election'
    | 'sidecar-pattern'
    | 'tcp-handshake'
    | 'encryption-ssl'
    | 'circuit-breaker'
    | 'what-is-dsa'
    | null => {
    const s = slug.toLowerCase();
    
    // Complexity analysis mapping
    if (s === 'big-o-notation' || s === 'searching') {
      return 'big-o';
    }
    if (s === 'time-complexity' || s === 'time-complexity-analysis') {
      return 'time-complexity';
    }

    // Memory Allocation mapping
    if (s === 'stack-allocation') {
      return 'stack-allocation';
    }
    if (s === 'heap-allocation') {
      return 'heap-allocation';
    }

    // New pattern mappings
    if (s === 'two-pointer-technique') {
      return 'two-pointers';
    }
    if (s === 'sliding-window-technique') {
      return 'sliding-window';
    }
    if (s === 'fast-slow-pointers') {
      return 'fast-slow-pointer';
    }
    if (s === 'cyclic-sort') {
      return 'cyclic-sort';
    }
    if (s === 'merge-intervals') {
      return 'merge-intervals';
    }
    if (s === 'two-heaps-pattern') {
      return 'two-heaps';
    }
    if (s === 'a-star-algorithm') {
      return 'a-star';
    }
    // System Design mappings
    if (s === 'cap-theorem-consistency' || s === 'availability-vs-consistency' || s === 'weak-consistency' || s === 'eventual-consistency' || s === 'strong-consistency' || s === 'what-is-system-design' || s === 'how-to-approach-system-design' || s === 'performance-vs-scalability' || s === 'latency-vs-throughput') {
      return 'cap-theorem';
    }
    if (s === 'sql-vs-nosql' || s === 'key-value-store' || s === 'document-store' || s === 'wide-column-store' || s === 'graph-databases' || s === 'federation' || s === 'denormalization' || s === 'sql-tuning') {
      return 'sql-vs-nosql';
    }
    if (s === 'cdn-edge-caching-strategies' || s === 'cdn-caching' || s === 'pull-cdns' || s === 'push-cdns' || s === 'client-caching' || s === 'web-server-caching' || s === 'static-content-hosting-design' || s === 'static-content-hosting-data' || s === 'cache-aside' || s === 'write-through' || s === 'write-behind' || s === 'refresh-ahead' || s === 'database-caching' || s === 'application-caching' || s === 'cache-aside-data' || s === 'no-caching') {
      return 'cdn-caching';
    }
    if (s === 'load-balancer-layer-4-routing' || s === 'layer-7-load-balancing' || s === 'load-balancing-algorithms' || s === 'reverse-proxy-caches' || s === 'horizontal-scaling') {
      return 'load-balancer-l4-l7';
    }
    if (s === 'service-discovery' || s === 'microservices' || s === 'gateway-routing' || s === 'gateway-offloading' || s === 'gateway-aggregation' || s === 'backends-for-frontend' || s === 'anti-corruption-layer' || s === 'ambassador' || s === 'health-monitoring' || s === 'availability-monitoring' || s === 'performance-monitoring' || s === 'usage-monitoring' || s === 'instrumentation' || s === 'visualization-alerts') {
      return 'service-discovery';
    }
    if (s === 'consistent-hashing' || s === 'database-sharding-partitions' || s === 'sharding-data') {
      return 'consistent-hashing';
    }
    if (s === 'message-queues' || s === 'task-queues' || s === 'backpressure-queues-sizing' || s === 'queue-based-load-leveling' || s === 'priority-queue' || s === 'competing-consumers' || s === 'publishersubscriber' || s === 'pipes-and-filters-messaging' || s === 'pipes-filters-design' || s === 'background-jobs' || s === 'event-driven-jobs' || s === 'schedule-driven-jobs' || s === 'returning-job-results' || s === 'sequential-convoy' || s === 'scheduling-agent-supervisor' || s === 'choreography' || s === 'claim-check' || s === 'async-request-reply') {
      return 'message-queues';
    }
    if (s === 'cqrs-design' || s === 'cqrs-data' || s === 'event-sourcing' || s === 'materialized-view' || s === 'index-table') {
      return 'cqrs-event-sourcing';
    }
    if (s === 'leader-election' || s === 'failover-replication-dns-updates' || s === 'replication-master-slave-master-master' || s === 'availability-in-numbers' || s === 'database-replication-lags') {
      return 'leader-election';
    }
    if (s === 'sidecar' || s === 'strangler-fig' || s === 'external-config-store' || s === 'compute-resource-consolidation') {
      return 'sidecar-pattern';
    }
    if (s === 'tcp' || s === 'udp' || s === 'http' || s === 'rpc' || s === 'grpc' || s === 'rest' || s === 'graphql' || s === 'idempotent-operations' || s === 'dns-root-authority-resolution') {
      return 'tcp-handshake';
    }
    if (s === 'valet-key' || s === 'security-monitoring') {
      return 'encryption-ssl';
    }
    if (s === 'retry-storm' || s === 'noisy-neighbor' || s === 'improper-instantiation' || s === 'monolithic-persistence' || s === 'synchronous-io' || s === 'extraneous-fetching' || s === 'busy-database' || s === 'busy-frontend' || s === 'chatty-io') {
      return 'circuit-breaker';
    }

    if (s === 'two-three-trees') {
      return 'b-tree';
    }
    if (s === 'skip-lists-complex') {
      return 'skip-list';
    }
    if (s === 'isam-indexing') {
      return 'sparse-table';
    }
    if (s === 'linear-indexing') {
      return 'static-array';
    }
    if (s === 'tree-indexing') {
      return 'b-tree';
    }
    if (s === 'recursion') {
      return 'recursion';
    }
    if (s === 'island-traversal') {
      return 'bfs-traversal';
    }
    if (s === 'multi-threaded') {
      return null;
    }

    // DSA foundations mapping
    if (
      s === 'what-is-dsa' || 
      s === 'importance-dsa' ||
      s === 'arrays' ||
      s === 'linked-list' ||
      s === 'stack' ||
      s === 'queue' ||
      s === 'binary-search' ||
      s === 'bfs' ||
      s === 'dfs' ||
      s === 'heap' ||
      s === 'trie' ||
      s === 'static-arrays' ||
      s === 'dynamic-vectors' ||
      s === 'singly-linked-lists' ||
      s === 'doubly-linked-lists' ||
      s === 'circular-linked-lists' ||
      s === 'skip-lists' ||
      s === 'lifo-stacks' ||
      s === 'fifo-queues' ||
      s === 'double-ended-deques' ||
      s === 'circular-buffers' ||
      s === 'min-heaps' ||
      s === 'max-heaps' ||
      s === 'leftist-heaps' ||
      s === 'binomial-heaps' ||
      s === 'fibonacci-heaps' ||
      s === 'bfs-traversal' ||
      s === 'dfs-traversal' ||
      s === 'dijkstra-algorithm' ||
      s === 'dynamic-programming' ||
      s === 'greedy' ||
      s === 'backtracking' ||
      s === 'searching' ||
      s === 'sorting' ||
      s === 'tree-traversal' ||
      s === 'mst-union-find' ||
      s === 'scc-bridges' ||
      s === 'string-algorithms' ||
      s === 'advanced-cp' ||
      s === 'bellman-ford-floyd-warshall' ||
      s === 'topological-sort' ||
      s === 'fenwick-tree' ||
      s === 'sparse-table' ||
      s === 'avl-red-black-tree' ||
      s === 'kmp-algorithm' ||
      s === 'binary-search-trees' ||
      s === 'avl-trees' ||
      s === 'red-black-trees' ||
      s === 'tries' ||
      s === 'segment-trees' ||
      s === 'fenwick-trees' ||
      s === 'sparse-tables' ||
      s === 'suffix-trees' ||
      s === 'suffix-arrays' ||
      s === 'b-trees' ||
      s === 'quadtrees' ||
      s === 'k-d-trees' ||
      s === 'splay-trees' ||
      s === 'treaps' ||
      s === 'linear-search' ||
      s === 'ternary-search' ||
      s === 'bubble-sort' ||
      s === 'selection-sort' ||
      s === 'insertion-sort' ||
      s === 'merge-sort' ||
      s === 'quick-sort' ||
      s === 'heap-sort' ||
      s === 'counting-sort' ||
      s === 'radix-sort' ||
      s === 'bucket-sort' ||
      s === 'shell-sort' ||
      s === 'bellman-ford' ||
      s === 'floyd-warshall' ||
      s === 'kruskal-mst' ||
      s === 'prim-mst' ||
      s === 'tarjan-scc' ||
      s === 'kosaraju-scc' ||
      s === 'bridges-cuts' ||
      s === 'a-search' ||
      s === 'boyer-moore-search' ||
      s === 'rabin-karp-search' ||
      s === 'z-algorithm' ||
      s === 'manacher-substrings' ||
      s === 'euler-tour' ||
      s === 'two-pointer-technique' ||
      s === 'sliding-window-technique' ||
      s === 'fast-slow-pointers' ||
      s === 'cyclic-sort' ||
      s === 'merge-intervals' ||
      s === 'two-heaps-pattern' ||
      s === 'in-order-traversal' ||
      s === 'pre-order-traversal' ||
      s === 'post-order-traversal' ||
      s === 'tree-bfs' ||
      s === 'tree-dfs' ||
      s === 'binary-tree' ||
      s === 'directed-graphs' ||
      s === 'undirected-graphs' ||
      s === 'graph-representations' ||
      s === 'two-three-trees' ||
      s === 'skip-lists-complex' ||
      s === 'isam-indexing' ||
      s === 'linear-indexing' ||
      s === 'tree-indexing' ||
      s === 'a-star-algorithm' ||
      s === 'floyd-warshall-algorithm' ||
      s === 'disjoint-set-union' ||
      s === 'collision-resolution' ||
      s === 'functions-basic-i-o' ||
      s === 'stack-allocation' ||
      s === 'heap-allocation' ||
      s === 'time-vs-space' ||
      s === 'calculate-complexity' ||
      s === 'common-runtimes' ||
      s === 'big-theta-notation' ||
      s === 'big-omega-notation' ||
      s === 'time-complexity-analysis' ||
      s === 'space-complexity-analysis' ||
      s === 'load-factor-scaling' ||
      s === 'brute-force' ||
      s === 'randomized-algorithms' ||
      s === 'divide-and-conquer' ||
      s === 'recursion' ||
      s === 'kth-element' ||
      s === 'island-traversal' ||
      s === 'multi-threaded' ||
      s === 'leetcode-platform' ||
      s === 'edabit-platform' ||
      s === 'segment-tree'
    ) {
      return null;
    }
    if (s === 'procedural-state-pipelines') {
      return 'program-flow';
    }
    // Arrays mapping
    if (s === 'static-arrays') {
      return 'static-array';
    }
    if (s === 'dynamic-vectors') {
      return 'dynamic-array';
    }
    
    // Linked Lists mapping
    if (s === 'singly-linked-lists' || s === 'linked-list') {
      return 'singly-linked-list';
    }
    if (s === 'doubly-linked-lists') {
      return 'doubly-linked-list';
    }
    if (s === 'circular-linked-lists') {
      return 'circular-linked-list';
    }
    if (s === 'skip-lists') {
      return 'skip-list';
    }

    // Stacks and Queues mapping
    if (s === 'lifo-stacks') {
      return 'lifo-stack';
    }
    if (s === 'fifo-queues') {
      return 'fifo-queue';
    }
    if (s === 'circular-buffers') {
      return 'circular-buffer';
    }
    if (s === 'double-ended-deques') {
      return 'deque';
    }

    // Hash Tables mapping
    if (s === 'hash-indexes') {
      return 'hash-function';
    }
    if (s === 'collision-resolution') {
      return 'collision-resolution';
    }
    if (s === 'load-factor-scaling') {
      return 'load-factor';
    }
    
    // Trees mapping
    if (s === 'binary-tree') {
      return 'binary-tree';
    }
    if (s === 'binary-search-trees') {
      return 'binary-search-tree';
    }
    if (s === 'tree-traversal' || s === 'in-order-traversal' || s === 'pre-order-traversal' || s === 'post-order-traversal') {
      return 'tree-traversal';
    }
    if (s === 'avl-trees') {
      return 'avl-tree';
    }
    if (s === 'red-black-trees') {
      return 'red-black-tree';
    }
    if (s === 'segment-tree') {
      return 'segment-tree';
    }
    if (s === 'fenwick-tree') {
      return 'fenwick-tree';
    }
    if (s === 'sparse-table') {
      return 'sparse-table';
    }
    if (s === 'trie') {
      return 'trie';
    }
    if (s === 'treaps') {
      return 'treap';
    }
    if (s === 'b-trees-index-seeks') {
      return 'b-tree';
    }
    
    // Heaps mapping
    if (s === 'min-heaps') {
      return 'min-heap';
    }
    if (s === 'binomial-heaps') {
      return 'binomial-heap';
    }
    if (s === 'fibonacci-heaps') {
      return 'fibonacci-heap';
    }

    if (s === 'b-trees') {
      return 'b-tree';
    }
    if (s === 'suffix-trees') {
      return 'tree';
    }
    
    // Graphs mapping
    if (s === 'directed-graphs' || s === 'undirected-graphs') {
      return 'graph';
    }
    if (s === 'graph-representations') {
      return 'graph-representations';
    }
    if (s === 'bfs-traversal' || s === 'tree-bfs') {
      return 'bfs-traversal';
    }
    if (s === 'dfs-traversal' || s === 'tree-dfs') {
      return 'dfs-traversal';
    }
    if (s === 'topological-sort') {
      return 'topological-sort';
    }
    if (s === 'dijkstra') {
      return 'dijkstra';
    }
    if (s === 'bellman-ford-floyd-warshall') {
      return 'bellman-ford';
    }
    if (s === 'floyd-warshall-algorithm') {
      return 'floyd-warshall';
    }
    if (s === 'kruskal-mst') {
      return 'kruskal-mst';
    }
    if (s === 'prim-mst') {
      return 'prim-mst';
    }
    if (s === 'mst-union-find' || s === 'disjoint-set-union') {
      return 'dsu';
    }

    if (s === 'scc-bridges') {
      return 'graph';
    }
    
    // Recursion and Paradigms mapping
    if (s === 'brute-force') {
      return 'time-complexity';
    }
    if (s === 'randomized-algorithms') {
      return 'quick-sort';
    }
    if (s === 'kth-element') {
      return 'two-heaps';
    }
    if (s === 'divide-and-conquer') {
      return 'divide-conquer';
    }
    if (s === 'greedy') {
      return 'greedy';
    }
    if (s === 'dynamic-programming') {
      return 'dp';
    }
    if (s === 'backtracking') {
      return 'backtracking';
    }
    if (s === 'branch-and-bound') {
      return 'branch-bound';
    }
    
    // Sorting & Searching mapping
    if (s === 'bubble-sort' || s === 'selection-sort') {
      return 'bubble-sort';
    }
    if (s === 'insertion-sort') {
      return 'insertion-sort';
    }
    if (s === 'merge-sort') {
      return 'merge-sort';
    }
    if (s === 'quick-sort') {
      return 'quick-sort';
    }
    if (s === 'heap-sort') {
      return 'heap-sort';
    }
    if (s === 'radix-sort') {
      return 'radix-sort';
    }
    if (s === 'linear-search') {
      return 'linear-search';
    }
    if (s === 'binary-search') {
      return 'binary-search';
    }
    if (s === 'ternary-search') {
      return 'ternary-search';
    }

    // String Algorithms mapping
    if (s === 'kmp-algorithm') {
      return 'kmp';
    }
    if (s === 'rabin-karp-search') {
      return 'rabin-karp';
    }
    if (s === 'z-algorithm') {
      return 'z-algo';
    }
    if (s === 'suffix-arrays') {
      return 'suffix-structures';
    }

    return null;
  };

  const type = getIllustrationType();
  if (!type) return null;

  return (
    <div className="w-full h-[320px] md:h-[360px] rounded-xl border border-zinc-800 bg-[#121214] select-none relative overflow-hidden flex items-center justify-center p-3">
      {/* Chalkboard Slate Grid Background */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-zinc-950/40" />

      {/* SVG Illustrations */}
      {type === 'static-array' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Static Array (Fixed Capacity = 6)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">int arr[6] = &#123; 8, 12, 19, 21, 35, 40 &#125;;</text>

          {/* Draw Grid */}
          {[8, 12, 19, 21, 35, 40].map((val, idx) => (
            <g key={idx}>
              <rect x={100 + idx * 60} y="85" width="50" height="50" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
              <text x={125 + idx * 60} y="116" fill="#e4e4e7" fontSize="15" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">{val}</text>
              <text x={125 + idx * 60} y="152" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">[{idx}]</text>
            </g>
          ))}

          {/* Pointer */}
          <text x="245" y="46" fill="#c084fc" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">i = 2 (arr[2] = 19)</text>
          <path d="M 245 52 L 245 76" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-purple)" />
          
          <text x="475" y="105" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Immutable Bounds</text>
          <text x="475" y="119" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Direct Offset Read</text>
          <text x="475" y="133" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(1) Access time</text>

          <defs>
            <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#c084fc" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'dynamic-array' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Dynamic Array (Vector Resizing)</text>
          
          {/* Old Array: size=4, cap=4 */}
          <text x="50" y="62" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Full Vector: Size = 4, Capacity = 4</text>
          {[8, 12, 19, 21].map((val, idx) => (
            <g key={idx}>
              <rect x={50 + idx * 45} y="75" width="38" height="38" rx="2" fill="none" stroke="#f472b6" strokeWidth="1.5" />
              <text x={69 + idx * 45} y="99" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">{val}</text>
            </g>
          ))}
          
          {/* Reallocate copy action arrow */}
          <path d="M 245 94 C 275 94, 305 120, 335 120" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-copy)" />
          <text x="285" y="112" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Copy (x2 Capacity)</text>

          {/* New Array: size=4, cap=8 */}
          <text x="350" y="62" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">New Allocation: Size = 4, Capacity = 8</text>
          {[8, 12, 19, 21].map((val, idx) => (
            <g key={idx}>
              <rect x={350 + idx * 28} y="75" width="24" height="38" rx="1" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
              <text x={362 + idx * 28} y="99" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">{val}</text>
            </g>
          ))}
          {/* Reserved unallocated slots */}
          {[0, 1, 2, 3].map((idx) => (
            <rect key={idx} x={462 + idx * 28} y="75" width="24" height="38" rx="1" fill="none" stroke="#52525b" strokeWidth="1" strokeDasharray="2 2" />
          ))}
          <text x="515" y="125" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Reserved Slots</text>

          {/* Vector stats */}
          <text x="50" y="165" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Push item triggers geometric capacity doubling</text>
          <text x="50" y="179" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Amortized O(1) insertions on tail</text>
          <text x="50" y="193" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Contiguous memory blocks reallocated on heap</text>

          <defs>
            <marker id="arrow-copy" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#a1a1aa" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'singly-linked-list' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Singly Linked List (Unidirectional)</text>
          
          {/* Head pointer */}
          <text x="45" y="100" fill="#38bdf8" fontSize="12" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">head</text>
          <path d="M 45 110 L 85 110" stroke="#38bdf8" strokeWidth="2" fill="none" markerEnd="url(#arrow-singly-blue)" />
          
          {/* Node A */}
          <circle cx="120" cy="110" r="22" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="120" y="115" fill="#e4e4e7" fontSize="14" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">A</text>
          
          {/* Pointer A -> B */}
          <path d="M 142 110 L 208 110" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-singly-orange)" />
          <text x="175" y="100" fill="#fb923c" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">next</text>
          
          {/* Node B */}
          <circle cx="240" cy="110" r="22" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="240" y="115" fill="#e4e4e7" fontSize="14" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">B</text>
          
          {/* Pointer B -> C */}
          <path d="M 262 110 L 328 110" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-singly-orange)" />
          <text x="295" y="100" fill="#fb923c" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">next</text>
          
          {/* Node C */}
          <circle cx="360" cy="110" r="22" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="360" y="115" fill="#e4e4e7" fontSize="14" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">C</text>
          
          {/* Pointer C -> null */}
          <path d="M 382 110 L 420 110" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-singly-orange)" />
          
          {/* null box */}
          <rect x="421" y="98" width="44" height="24" rx="3" fill="none" stroke="#71717a" strokeWidth="1.5" strokeDasharray="3 1" />
          <text x="443" y="114" fill="#a1a1aa" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">null</text>
          
          <text x="495" y="105" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Nodes scattered on Heap</text>
          <text x="495" y="119" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Unidirectional pointers</text>
          <text x="495" y="133" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(N) linear search bounds</text>
          
          <defs>
            <marker id="arrow-singly-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-singly-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'doubly-linked-list' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Doubly Linked List (Bidirectional Nodes)</text>
          
          {/* head pointer */}
          <text x="40" y="90" fill="#38bdf8" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">head</text>
          <path d="M 40 100 L 75 100" stroke="#38bdf8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-dll-blue)" />
          
          {/* Node 1 */}
          <rect x="80" y="80" width="80" height="40" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
          <line x1="105" y1="80" x2="105" y2="120" stroke="#c084fc" strokeWidth="1.5" />
          <line x1="135" y1="80" x2="135" y2="120" stroke="#c084fc" strokeWidth="1.5" />
          <text x="92" y="105" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">prev</text>
          <text x="120" y="105" fill="#ffffff" fontSize="13" textAnchor="middle" fontFamily="monospace" fontWeight="bold">A</text>
          <text x="147" y="105" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">next</text>
          
          {/* Pointers Node 1 <-> Node 2 */}
          <path d="M 160 92 L 205 92" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-dll-orange)" />
          <path d="M 210 108 L 165 108" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-dll-orange)" />
          <text x="185" y="85" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace">next</text>
          <text x="185" y="121" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace">prev</text>

          {/* Node 2 */}
          <rect x="210" y="80" width="80" height="40" rx="3" fill="none" stroke="#4ade80" strokeWidth="2" />
          <line x1="235" y1="80" x2="235" y2="120" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="265" y1="80" x2="265" y2="120" stroke="#4ade80" strokeWidth="1.5" />
          <text x="222" y="105" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">prev</text>
          <text x="250" y="105" fill="#ffffff" fontSize="13" textAnchor="middle" fontFamily="monospace" fontWeight="bold">B</text>
          <text x="277" y="105" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">next</text>

          {/* Pointers Node 2 <-> Node 3 */}
          <path d="M 290 92 L 335 92" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-dll-orange)" />
          <path d="M 340 108 L 295 108" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-dll-orange)" />

          {/* Node 3 */}
          <rect x="340" y="80" width="80" height="40" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
          <line x1="365" y1="80" x2="365" y2="120" stroke="#c084fc" strokeWidth="1.5" />
          <line x1="395" y1="80" x2="395" y2="120" stroke="#c084fc" strokeWidth="1.5" />
          <text x="352" y="105" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">prev</text>
          <text x="380" y="105" fill="#ffffff" fontSize="13" textAnchor="middle" fontFamily="monospace" fontWeight="bold">C</text>
          <text x="407" y="105" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">next</text>
          
          {/* null pointers at ends */}
          <text x="92" y="145" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">A.prev = null</text>
          <text x="380" y="145" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">C.next = null</text>

          {/* DLL properties */}
          <text x="440" y="140" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Bidirectional traversal</text>
          <text x="440" y="154" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Requires more memory</text>
          <text x="440" y="168" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Easy deletion of local node</text>

          <defs>
            <marker id="arrow-dll-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-dll-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'circular-linked-list' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Circular Linked List (Closed Loop)</text>
          
          {/* Head pointer */}
          <text x="45" y="100" fill="#38bdf8" fontSize="12" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">head</text>
          <path d="M 45 110 L 85 110" stroke="#38bdf8" strokeWidth="2" fill="none" markerEnd="url(#arrow-circ-blue)" />
          
          {/* Node A */}
          <circle cx="120" cy="110" r="22" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="120" y="115" fill="#ffffff" fontSize="14" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">A</text>
          
          {/* Pointer A -> B */}
          <path d="M 142 110 L 208 110" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-circ-orange)" />
          
          {/* Node B */}
          <circle cx="240" cy="110" r="22" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="240" y="115" fill="#ffffff" fontSize="14" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">B</text>
          
          {/* Pointer B -> C */}
          <path d="M 262 110 L 328 110" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-circ-orange)" />
          
          {/* Node C */}
          <circle cx="360" cy="110" r="22" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="360" y="115" fill="#ffffff" fontSize="14" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">C</text>
          
          {/* Pointer C -> D */}
          <path d="M 382 110 L 448 110" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-circ-orange)" />
          
          {/* Node D (Last) */}
          <circle cx="480" cy="110" r="22" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="480" y="115" fill="#ffffff" fontSize="14" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">D</text>
          
          {/* Circular loop pointer from D back to A */}
          <path d="M 480 132 C 480 185, 120 185, 120 132" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-circ-pink)" />
          <text x="300" y="175" fill="#f472b6" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">D.next = head (Node A)</text>

          <defs>
            <marker id="arrow-circ-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-circ-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-circ-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'skip-list' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Skip List (Multi-Level Search Lanes)</text>
          
          {/* Level 2 (Express Lane) */}
          <text x="45" y="72" fill="#f472b6" fontSize="9" fontFamily="monospace">L2</text>
          <rect x="75" y="60" width="30" height="20" rx="2" fill="none" stroke="#f472b6" strokeWidth="1" />
          <text x="90" y="73" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">H</text>
          <path d="M 105 70 L 265 70" stroke="#f472b6" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-skip-pink)" />
          
          <rect x="265" y="60" width="30" height="20" rx="2" fill="none" stroke="#f472b6" strokeWidth="1" />
          <text x="280" y="73" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">30</text>
          <path d="M 295 70 L 455 70" stroke="#f472b6" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-skip-pink)" />
          
          <rect x="455" y="60" width="30" height="20" rx="2" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="470" y="73" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">NIL</text>

          {/* Level 1 (Intermediate Lane) */}
          <text x="45" y="112" fill="#c084fc" fontSize="9" fontFamily="monospace">L1</text>
          <rect x="75" y="100" width="30" height="20" rx="2" fill="none" stroke="#c084fc" strokeWidth="1" />
          <text x="90" y="113" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">H</text>
          <path d="M 105 110 L 170 110" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-skip-purple)" />
          
          <rect x="170" y="100" width="30" height="20" rx="2" fill="none" stroke="#c084fc" strokeWidth="1" />
          <text x="185" y="113" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">15</text>
          <path d="M 200 110 L 265 110" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-skip-purple)" />
          
          <rect x="265" y="100" width="30" height="20" rx="2" fill="none" stroke="#c084fc" strokeWidth="1" />
          <text x="280" y="113" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">30</text>
          <path d="M 295 110 L 360 110" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-skip-purple)" />
          
          <rect x="360" y="100" width="30" height="20" rx="2" fill="none" stroke="#c084fc" strokeWidth="1" />
          <text x="375" y="113" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">42</text>
          <path d="M 390 110 L 455 110" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-skip-purple)" />
          
          <rect x="455" y="100" width="30" height="20" rx="2" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="470" y="113" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">NIL</text>

          {/* Level 0 (Base Lane) */}
          <text x="45" y="152" fill="#60a5fa" fontSize="9" fontFamily="monospace">L0</text>
          <rect x="75" y="140" width="30" height="20" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1" />
          <text x="90" y="153" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">H</text>
          <path d="M 105 150 L 170 150" stroke="#60a5fa" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-skip-blue)" />
          
          {[[15, 170], [22, 218], [30, 265], [38, 312], [42, 360], [50, 408]].map(([val, xPos], idx, arr) => (
            <g key={idx}>
              <rect x={xPos} y="140" width="30" height="20" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1" />
              <text x={xPos + 15} y="153" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">{val}</text>
              {idx < arr.length - 1 ? (
                <path d={`M ${xPos + 30} 150 L ${arr[idx+1][1]} 150`} stroke="#60a5fa" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-skip-blue)" />
              ) : (
                <path d={`M ${xPos + 30} 150 L 455 150`} stroke="#60a5fa" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-skip-blue)" />
              )}
            </g>
          ))}
          <rect x="455" y="140" width="30" height="20" rx="2" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="470" y="153" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">NIL</text>

          {/* Vertical alignment dotted lines */}
          <line x1="90" y1="80" x2="90" y2="140" stroke="#52525b" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="185" y1="120" x2="185" y2="140" stroke="#52525b" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="280" y1="80" x2="280" y2="140" stroke="#52525b" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="375" y1="120" x2="375" y2="140" stroke="#52525b" strokeWidth="1" strokeDasharray="2 2" />

          {/* Information */}
          <text x="500" y="110" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Fast O(log N) search bounds</text>
          <text x="500" y="124" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Skip levels randomized height</text>
          <text x="500" y="138" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Avoids tree balance re-runs</text>

          <defs>
            <marker id="arrow-skip-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
            <marker id="arrow-skip-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#c084fc" />
            </marker>
            <marker id="arrow-skip-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#60a5fa" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'tree' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Binary Search Tree</text>
          
          {/* Root Node (50) */}
          <circle cx="300" cy="45" r="18" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="300" y="49" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">50</text>
          
          {/* Level 1 Connections */}
          <line x1="287" y1="57" x2="213" y2="93" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="313" y1="57" x2="387" y2="93" stroke="#a1a1aa" strokeWidth="1.5" />
          
          {/* Node 30 */}
          <circle cx="200" cy="105" r="18" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="200" y="109" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">30</text>
          
          {/* Node 70 */}
          <circle cx="400" cy="105" r="18" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="400" y="109" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">70</text>
          
          {/* Level 2 Connections */}
          <line x1="188" y1="117" x2="142" y2="153" stroke="#a1a1aa" strokeWidth="1.5" />
          <line x1="212" y1="117" x2="258" y2="153" stroke="#a1a1aa" strokeWidth="1.5" stroke-dasharray="2 1" />
          <line x1="388" y1="117" x2="342" y2="153" stroke="#a1a1aa" stroke-width="1.5" />
          <line x1="412" y1="117" x2="458" y2="153" stroke="#a1a1aa" stroke-width="1.5" />
          
          {/* Node 20 */}
          <circle cx="130" cy="165" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="130" y="169" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">20</text>
          
          {/* Node 40 */}
          <circle cx="270" cy="165" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="270" y="169" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">40</text>
          
          {/* Node 60 */}
          <circle cx="330" cy="165" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 1" />
          <text x="330" y="169" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">60</text>
          
          {/* Node 80 */}
          <circle cx="470" cy="165" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="470" y="169" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">80</text>
          
          <text x="510" y="45" fill="#facc15" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">left &lt; root &lt; right</text>
        </svg>
      )}

      {type === 'graph' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Graph Mesh Network</text>
          
          {/* Node A */}
          <circle cx="300" cy="55" r="18" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="300" y="59" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">A</text>
          
          {/* Node B */}
          <circle cx="200" cy="100" r="18" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="200" y="104" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">B</text>
          
          {/* Node C */}
          <circle cx="300" cy="145" r="18" fill="none" stroke="#4ade80" strokeWidth="2" strokeDasharray="3 1" />
          <text x="300" y="149" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">C</text>
          
          {/* Node D */}
          <circle cx="400" cy="100" r="18" fill="none" stroke="#f472b6" strokeWidth="2" />
          <text x="400" y="104" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">D</text>
          
          {/* Node E */}
          <circle cx="300" cy="95" r="18" fill="none" stroke="#eab308" strokeWidth="2" />
          <text x="300" y="99" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">E</text>
          
          {/* Edges */}
          <path d="M 283 62 L 217 93" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="4 2" fill="none" markerEnd="url(#arrow-g)" />
          <path d="M 300 73 L 300 77" stroke="#a1a1aa" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-g)" />
          <path d="M 317 62 L 383 93" stroke="#a1a1aa" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-g)" />
          <path d="M 217 107 L 283 138" stroke="#a1a1aa" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-g)" />
          <path d="M 300 113 L 300 127" stroke="#a1a1aa" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-g)" />
          <path d="M 383 107 L 317 138" stroke="#a1a1aa" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-g)" />
          
          <text x="245" y="70" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">w=4</text>
          <text x="355" y="70" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">w=2</text>
          
          <defs>
            <marker id="arrow-g" viewBox="0 0 10 10" refX="17" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#a1a1aa" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'recursion' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Recursion / Nested Scopes</text>
          
          {/* Call Stack */}
          <text x="50" y="58" fill="#a1a1aa" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Call Stack</text>
          
          {/* Frame 4 */}
          <rect x="50" y="68" width="130" height="24" rx="2" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 1" />
          <text x="115" y="83" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">solve(4) -&gt; 4 * solve(3)</text>
          
          {/* Frame 3 */}
          <rect x="50" y="96" width="130" height="24" rx="2" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="115" y="111" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">solve(3) -&gt; 3 * solve(2)</text>
          
          {/* Frame 2 */}
          <rect x="50" y="124" width="130" height="24" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x="115" y="139" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">solve(2) -&gt; 2 * solve(1)</text>
          
          {/* Frame 1 */}
          <rect x="50" y="152" width="130" height="24" rx="2" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="115" y="167" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">solve(1) -&gt; return 1</text>
          
          {/* Nested Scopes Visualizer */}
          <rect x="250" y="55" width="300" height="130" rx="4" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="265" y="72" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">solve(4)</text>
          
          <rect x="300" y="80" width="230" height="95" rx="4" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="315" y="97" fill="#c084fc" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">solve(3)</text>
          
          <rect x="350" y="105" width="165" height="60" rx="4" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2 1" />
          <text x="365" y="122" fill="#60a5fa" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">solve(2)</text>
          
          <rect x="400" y="130" width="100" height="28" rx="4" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="450" y="147" fill="#4ade80" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">solve(1) = 1</text>
        </svg>
      )}

      {type === 'stack-allocation' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Stack Memory Allocation</text>
          
          {/* Stack Container */}
          <rect x="180" y="60" width="160" height="135" rx="4" fill="none" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          <text x="260" y="52" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Stack Space (High -&gt; Low Address)</text>
          
          {/* Stack Frame 1 (Bottom, main) */}
          <rect x="182" y="152" width="156" height="38" rx="2" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="260" y="175" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">main() frame: argc=1</text>
          
          {/* Stack Frame 2 (Middle, helper) */}
          <rect x="182" y="112" width="156" height="38" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="2 1" />
          <text x="260" y="135" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">helper() frame: x=10</text>
          
          {/* Stack Frame 3 (Top, runLogic) */}
          <rect x="182" y="72" width="156" height="38" rx="2" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="260" y="95" fill="#c084fc" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">runLogic() frame: temp=42</text>
          
          {/* Stack Pointer */}
          <text x="420" y="86" fill="#c084fc" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">SP (Stack Pointer)</text>
          <text x="420" y="98" fill="#71717a" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Points to top active frame</text>
          <path d="M 415 90 L 348 90" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-sp)" />
          
          {/* Stack Properties */}
          <text x="420" y="138" fill="#e4e4e7" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• LIFO (Last In First Out)</text>
          <text x="420" y="152" fill="#e4e4e7" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Auto-freed on function exit</text>
          <text x="420" y="166" fill="#e4e4e7" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Highly performant, fixed size</text>

          <defs>
            <marker id="arrow-sp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#c084fc" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'what-is-dsa' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Data Layouts in Physical Memory</text>
          
          {/* Contiguous Block */}
          <text x="50" y="60" fill="#60a5fa" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Contiguous Layout (Array in RAM)</text>
          
          {/* Elements packed side by side */}
          <g>
            {/* Address labels */}
            <text x="75" y="112" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">0x100</text>
            <text x="125" y="112" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">0x104</text>
            <text x="175" y="112" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">0x108</text>
            <text x="225" y="112" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">0x10C</text>

            <rect x="50" y="68" width="50" height="32" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="75" y="88" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Val A</text>

            <rect x="100" y="68" width="50" height="32" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="125" y="88" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Val B</text>

            <rect x="150" y="68" width="50" height="32" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="175" y="88" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Val C</text>

            <rect x="200" y="68" width="50" height="32" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="225" y="88" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Val D</text>
            
            {/* O(1) pointer math label */}
            <text x="150" y="132" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Address = Base + (Index * Size) [O(1) Random Access]</text>
          </g>

          {/* Linked Block */}
          <text x="340" y="60" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Linked Layout (Scatter &amp; Pointer Reference)</text>

          {/* Node 1 */}
          <g>
            <rect x="340" y="68" width="60" height="32" rx="2" fill="none" stroke="#f472b6" strokeWidth="1.5" />
            <line x1="380" y1="68" x2="380" y2="100" stroke="#f472b6" strokeWidth="1" />
            <text x="360" y="88" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Val A</text>
            <text x="390" y="86" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">0x1A0</text>
            <text x="370" y="112" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">node @ 0x104</text>
          </g>

          {/* Arrow Node 1 -> Node 2 */}
          <path d="M 390 84 Q 440 120 480 120" stroke="#f472b6" strokeWidth="1.5" fill="none" strokeDasharray="3 2" markerEnd="url(#arrow-linked)" />

          {/* Node 2 */}
          <g>
            <rect x="470" y="105" width="60" height="32" rx="2" fill="none" stroke="#f472b6" strokeWidth="1.5" />
            <line x1="510" y1="105" x2="510" y2="137" stroke="#f472b6" strokeWidth="1" />
            <text x="490" y="125" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Val B</text>
            <text x="520" y="123" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">null</text>
            <text x="500" y="149" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">node @ 0x1A0</text>
          </g>

          <text x="460" y="172" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Hop-by-hop traversal [O(N) Sequential Access]</text>

          <defs>
            <marker id="arrow-linked" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'heap-allocation' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Heap Memory Allocation</text>
          
          {/* Virtual address block border */}
          <rect x="80" y="60" width="440" height="130" rx="4" fill="none" stroke="#71717a" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="95" y="52" fill="#71717a" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Heap Memory Pool (Dynamic / Fragmented Space)</text>
          
          {/* Block 1 (Allocated) */}
          <rect x="95" y="75" width="105" height="42" rx="3" fill="none" stroke="#f472b6" strokeWidth="2" />
          <text x="147" y="93" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Allocated Block</text>
          <text x="147" y="105" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">0x7fa2b0 (16 Bytes)</text>
          
          {/* Free gap */}
          <rect x="210" y="75" width="55" height="42" rx="3" fill="none" stroke="#52525b" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x="237" y="100" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">[Free Hole]</text>
          
          {/* Block 2 (Allocated) */}
          <rect x="275" y="75" width="115" height="42" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="332" y="93" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Allocated Block</text>
          <text x="332" y="105" fill="#c084fc" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">0x7fa3a0 (32 Bytes)</text>
          
          {/* Block 3 (Allocated) */}
          <rect x="400" y="75" width="110" height="42" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 1" />
          <text x="455" y="93" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Allocated Block</text>
          <text x="455" y="105" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">0x7fa4e0 (64 Bytes)</text>
          
          {/* Pointer references from bottom */}
          <text x="147" y="170" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">ptr1 = new Node()</text>
          <path d="M 147 155 L 147 122" stroke="#4ade80" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-h-green)" />
          
          <text x="332" y="170" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">ptr2 = malloc(32)</text>
          <path d="M 332 155 L 332 122" stroke="#4ade80" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-h-green)" />
          
          {/* Heap info text */}
          <text x="400" y="145" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Size determined at runtime</text>
          <text x="400" y="157" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Must be freed (free/delete)</text>
          <text x="400" y="169" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Susceptible to fragmentation</text>
          
          <defs>
            <marker id="arrow-h-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'big-o' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Big-O Growth Rates</text>
          
          {/* Axis lines */}
          <path d="M 80 180 L 480 180" stroke="#71717a" strokeWidth="2" fill="none" markerEnd="url(#arrow-o-axis)" />
          <path d="M 80 180 L 80 50" stroke="#71717a" strokeWidth="2" fill="none" markerEnd="url(#arrow-o-axis)" />
          
          <text x="480" y="195" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">n (size)</text>
          <text x="50" y="55" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Time</text>
          
          {/* O(1) - constant */}
          <path d="M 80 160 L 460 160" stroke="#4ade80" strokeWidth="2" fill="none" />
          <text x="475" y="163" fill="#4ade80" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">O(1)</text>
          
          {/* O(log n) - logarithmic */}
          <path d="M 80 180 Q 200 135, 460 130" stroke="#38bdf8" strokeWidth="2" fill="none" />
          <text x="475" y="133" fill="#38bdf8" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">O(log n)</text>
          
          {/* O(n) - linear */}
          <path d="M 80 180 L 380 70" stroke="#eab308" strokeWidth="2" fill="none" />
          <text x="390" y="68" fill="#eab308" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">O(n)</text>
          
          {/* O(n^2) - quadratic */}
          <path d="M 80 180 Q 150 160, 220 60" stroke="#f472b6" strokeWidth="2" fill="none" />
          <text x="225" y="55" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">O(n^2)</text>
          
          {/* Legend */}
          <text x="420" y="60" fill="#f472b6" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(n^2) Horrible</text>
          <text x="420" y="74" fill="#eab308" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(n) Fair</text>
          <text x="420" y="88" fill="#38bdf8" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(log n) Good</text>
          <text x="420" y="102" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(1) Excellent</text>
          
          <defs>
            <marker id="arrow-o-axis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#71717a" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'time-complexity' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Time Complexity Loop Mechanics</text>
          
          {/* Linear Loop */}
          <rect x="50" y="50" width="230" height="42" rx="3" fill="none" stroke="#52525b" strokeWidth="1" />
          <text x="60" y="66" fill="#e4e4e7" fontSize="10" fontFamily="monospace">for (let i = 0; i &lt; n; i++) &#123;</text>
          <text x="80" y="80" fill="#a1a1aa" fontSize="10" fontFamily="monospace">operation();</text>
          <text x="60" y="88" fill="#e4e4e7" fontSize="10" fontFamily="monospace">&#125;</text>
          
          <path d="M 295 71 L 340 71" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-tc-orange)" />
          <text x="360" y="75" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">O(n)</text>
          <text x="405" y="74" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">(Linear loop traversal)</text>
          
          {/* Nested Loops */}
          <rect x="50" y="102" width="230" height="52" rx="3" fill="none" stroke="#52525b" strokeWidth="1" />
          <text x="60" y="116" fill="#e4e4e7" fontSize="9" fontFamily="monospace">for (let i=0; i&lt;n; i++) &#123;</text>
          <text x="75" y="128" fill="#e4e4e7" fontSize="9" fontFamily="monospace">  for (let j=0; j&lt;n; j++) &#123; op(); &#125;</text>
          <text x="60" y="142" fill="#e4e4e7" fontSize="9" fontFamily="monospace">&#125;</text>
          
          <path d="M 295 128 L 340 128" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-tc-orange)" />
          <text x="360" y="132" fill="#f472b6" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">O(n^2)</text>
          <text x="415" y="131" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">(Quadratic nested runs)</text>
          
          {/* Divide and conquer */}
          <rect x="50" y="164" width="230" height="42" rx="3" fill="none" stroke="#52525b" strokeWidth="1" />
          <text x="60" y="180" fill="#e4e4e7" fontSize="10" fontFamily="monospace">while (n &gt; 1) &#123;</text>
          <text x="80" y="194" fill="#a1a1aa" fontSize="10" fontFamily="monospace">n = Math.floor(n / 2);</text>
          <text x="60" y="202" fill="#e4e4e7" fontSize="10" fontFamily="monospace">&#125;</text>
          
          <path d="M 295 185 L 340 185" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-tc-orange)" />
          <text x="360" y="189" fill="#38bdf8" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">O(log n)</text>
          <text x="425" y="188" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">(Logarithmic dynamic split)</text>
          
          <defs>
            <marker id="arrow-tc-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'program-flow' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Procedural State Pipeline</text>

          <rect x="55" y="78" width="86" height="44" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="98" y="96" fill="#60a5fa" fontSize="10" textAnchor="middle" fontFamily="monospace">INPUT</text>
          <text x="98" y="110" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">read x</text>

          <rect x="178" y="66" width="96" height="68" rx="3" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="226" y="86" fill="#fb923c" fontSize="10" textAnchor="middle" fontFamily="monospace">STATE</text>
          <text x="226" y="102" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">x = x + 1</text>
          <text x="226" y="118" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">typed variable</text>

          <polygon points="350,62 420,100 350,138 280,100" fill="none" stroke="#f472b6" strokeWidth="2" />
          <text x="350" y="96" fill="#f472b6" fontSize="10" textAnchor="middle" fontFamily="monospace">if / loop</text>
          <text x="350" y="112" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">control path</text>

          <rect x="458" y="78" width="88" height="44" rx="3" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="502" y="96" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace">OUTPUT</text>
          <text x="502" y="110" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">print result</text>

          <path d="M 144 100 L 172 100" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-program-flow)" />
          <path d="M 276 100 L 306 100" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-program-flow)" />
          <path d="M 420 100 L 452 100" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-program-flow)" />
          <path d="M 350 140 C 350 172, 225 172, 225 138" stroke="#71717a" strokeWidth="1.2" strokeDasharray="4 2" fill="none" markerEnd="url(#arrow-program-loop)" />

          <text x="85" y="165" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Functions package this pipeline into reusable blocks</text>
          <text x="85" y="181" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Operators mutate state; branches choose which block runs next</text>

          <defs>
            <marker id="arrow-program-flow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-program-loop" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#71717a" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'practice-platforms' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Practice Platform Feedback Loop</text>

          <rect x="65" y="68" width="112" height="56" rx="4" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="121" y="91" fill="#60a5fa" fontSize="10" textAnchor="middle" fontFamily="monospace">PROBLEM</text>
          <text x="121" y="108" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">constraints + examples</text>

          <rect x="238" y="62" width="124" height="68" rx="4" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="300" y="84" fill="#fb923c" fontSize="10" textAnchor="middle" fontFamily="monospace">CODE</text>
          <text x="300" y="101" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">choose pattern</text>
          <text x="300" y="116" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">array / graph / dp</text>

          <rect x="424" y="68" width="112" height="56" rx="4" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="480" y="91" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace">JUDGE</text>
          <text x="480" y="108" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">tests + runtime</text>

          <path d="M 180 96 L 232 96" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-practice)" />
          <path d="M 365 96 L 418 96" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-practice)" />
          <path d="M 480 128 C 455 176, 168 176, 121 128" stroke="#f472b6" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-practice-fail)" />

          <text x="300" y="166" fill="#f472b6" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Wrong answer or TLE loops back into learning</text>
          <text x="300" y="184" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Accepted submissions build pattern memory over many small problems</text>

          <defs>
            <marker id="arrow-practice" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-practice-fail" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
          </defs>
        </svg>
      )}
      {type === 'lifo-stack' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">LIFO Stack (Last-In First-Out)</text>
          
          {/* U-shaped Container */}
          <path d="M 200 60 L 200 180 L 320 180 L 320 60" stroke="#71717a" strokeWidth="2.5" fill="none" strokeDasharray="3 2" />
          
          {/* Stack elements */}
          <rect x="204" y="145" width="112" height="30" rx="3" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="260" y="164" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Item A (Bottom)</text>
          
          <rect x="204" y="110" width="112" height="30" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="260" y="129" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Item B</text>
          
          <rect x="204" y="75" width="112" height="30" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="260" y="94" fill="#c084fc" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Item C (Top)</text>
          
          {/* PUSH operation */}
          <text x="110" y="75" fill="#38bdf8" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">PUSH (Item D)</text>
          <path d="M 110 82 C 140 82, 160 50, 240 50" stroke="#38bdf8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-stack-push)" />
          
          {/* POP operation */}
          <text x="350" y="75" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">POP() -&gt; Item C</text>
          <path d="M 270 50 C 310 50, 330 82, 380 82" stroke="#f472b6" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-stack-pop)" />
          
          {/* Properties */}
          <text x="420" y="120" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Push / Pop at active Top</text>
          <text x="420" y="134" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(1) time bounds</text>
          <text x="420" y="148" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Depth-First Search tool</text>

          <defs>
            <marker id="arrow-stack-push" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-stack-pop" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'fifo-queue' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">FIFO Queue (First-In First-Out)</text>
          
          {/* Horizontal tube */}
          <line x1="100" y1="80" x2="480" y2="80" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="100" y1="130" x2="480" y2="130" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Queue items */}
          <rect x="140" y="85" width="70" height="40" rx="3" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="175" y="109" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Item A</text>
          
          <rect x="235" y="85" width="70" height="40" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="270" y="109" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Item B</text>
          
          <rect x="330" y="85" width="70" height="40" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="375" y="109" fill="#c084fc" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Item C</text>
          
          {/* FRONT and REAR pointers */}
          <text x="175" y="152" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Front</text>
          <path d="M 175 140 L 175 128" stroke="#4ade80" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-q-green)" />
          
          <text x="375" y="152" fill="#c084fc" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Rear</text>
          <path d="M 375 140 L 375 128" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-q-purple)" />
          
          {/* Enqueue / Dequeue ops */}
          <text x="470" y="65" fill="#38bdf8" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">ENQUEUE (Item D)</text>
          <path d="M 470 75 C 470 105, 430 105, 410 105" stroke="#38bdf8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-q-blue)" />
          
          <text x="75" y="65" fill="#f472b6" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">DEQUEUE() -&gt; A</text>
          <path d="M 130 105 C 100 105, 80 105, 60 78" stroke="#f472b6" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-q-pink)" />
          
          <defs>
            <marker id="arrow-q-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
            <marker id="arrow-q-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#c084fc" />
            </marker>
            <marker id="arrow-q-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-q-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'circular-buffer' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Circular Queue (Ring Buffer)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Index = (Index + 1) % Capacity</text>
          
          {/* Draw Ring segments */}
          {/* Inner circle (cx=220, cy=120, r=40) */}
          <circle cx="220" cy="120" r="40" fill="none" stroke="#71717a" strokeWidth="2" />
          
          {/* Outer circle (cx=220, cy=120, r=80) */}
          <circle cx="220" cy="120" r="80" fill="none" stroke="#71717a" strokeWidth="2" />
          
          {/* Divide into segments (8 segments) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
            <line 
              key={idx}
              x1={220 + 40 * Math.cos(deg * Math.PI / 180)} 
              y1={120 + 40 * Math.sin(deg * Math.PI / 180)} 
              x2={220 + 80 * Math.cos(deg * Math.PI / 180)} 
              y2={120 + 80 * Math.sin(deg * Math.PI / 180)} 
              stroke="#71717a" 
              strokeWidth="1.5" 
            />
          ))}

          {/* Segment values: labels placed at angular middle points */}
          {[
            { val: '[ ]', a: 22.5, fill: '#71717a' },
            { val: '[ ]', a: 67.5, fill: '#71717a' },
            { val: '10', a: 112.5, fill: '#4ade80' }, 
            { val: '20', a: 157.5, fill: '#e4e4e7' },
            { val: '30', a: 202.5, fill: '#e4e4e7' },
            { val: '40', a: 247.5, fill: '#c084fc' }, 
            { val: '[ ]', a: 292.5, fill: '#71717a' },
            { val: '[ ]', a: 337.5, fill: '#71717a' },
          ].map((item, idx) => {
            const rad = item.a * Math.PI / 180;
            const x = 220 + 60 * Math.cos(rad);
            const y = 120 + 60 * Math.sin(rad) + 4;
            return (
              <text key={idx} x={x} y={y} fill={item.fill} fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                {item.val}
              </text>
            );
          })}

          {/* Index markers around the ring */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
            const angle = (22.5 + idx * 45) * Math.PI / 180;
            const x = 220 + 95 * Math.cos(angle);
            const y = 120 + 95 * Math.sin(angle) + 4;
            return (
              <text key={idx} x={x} y={y} fill="#52525b" fontSize="8" textAnchor="middle" fontFamily="monospace">
                i={idx}
              </text>
            );
          })}

          {/* Front / Rear pointers */}
          <path d="M 120 180 C 130 180, 140 160, 165 155" stroke="#4ade80" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-circ-pt)" />
          <text x="110" y="184" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Front (i=2)</text>

          <path d="M 120 60 C 130 60, 140 80, 165 85" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-circ-pt-p)" />
          <text x="110" y="56" fill="#c084fc" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Rear (i=5)</text>

          {/* Stats on the right */}
          <text x="350" y="110" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Fixed memory buffer, wraps around</text>
          <text x="350" y="124" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• No elements shifting on dequeue</text>
          <text x="350" y="138" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Essential for streaming data queues</text>

          <defs>
            <marker id="arrow-circ-pt" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
            <marker id="arrow-circ-pt-p" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#c084fc" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'deque' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Double Ended Deque (Double Queue)</text>
          
          {/* Horizontal tube */}
          <line x1="140" y1="80" x2="440" y2="80" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="140" y1="130" x2="440" y2="130" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Elements */}
          <rect x="190" y="85" width="60" height="40" rx="3" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="220" y="109" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="monospace">Node A</text>
          
          <rect x="260" y="85" width="60" height="40" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="290" y="109" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="monospace">Node B</text>
          
          <rect x="330" y="85" width="60" height="40" rx="3" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="360" y="109" fill="#c084fc" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Node C</text>
          
          {/* Front operations (Left End) */}
          <text x="75" y="60" fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Push Front</text>
          <path d="M 50 72 C 80 72, 100 90, 130 90" stroke="#38bdf8" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-deq-blue)" />
          
          <text x="75" y="152" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Pop Front</text>
          <path d="M 160 115 C 130 115, 110 135, 75 135" stroke="#f472b6" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-deq-pink)" />
          
          {/* Rear operations (Right End) */}
          <text x="505" y="60" fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Push Rear</text>
          <path d="M 525 72 C 495 72, 475 90, 445 90" stroke="#38bdf8" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-deq-blue-inv)" />
          
          <text x="505" y="152" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Pop Rear</text>
          <path d="M 420 115 C 450 115, 470 135, 505 135" stroke="#f472b6" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-deq-pink-inv)" />
          
          {/* Key information */}
          <text x="180" y="175" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Supports Stack (LIFO) and Queue (FIFO) behaviors</text>
          <text x="180" y="189" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Insertion {"&"} deletion on both ends in O(1) time bounds</text>

          <defs>
            <marker id="arrow-deq-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-deq-blue-inv" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-deq-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
            <marker id="arrow-deq-pink-inv" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'hash-function' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Hash Function h(key)</text>
          
          {/* Key list */}
          <text x="50" y="65" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Keys (Strings)</text>
          
          <rect x="50" y="75" width="70" height="24" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="85" y="91" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">"apple"</text>
          
          <rect x="50" y="110" width="70" height="24" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="85" y="126" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">"banana"</text>
          
          <rect x="50" y="145" width="70" height="24" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="85" y="161" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">"cat"</text>
          
          {/* Hash function box */}
          <rect x="180" y="90" width="130" height="60" rx="3" fill="none" stroke="#eab308" strokeWidth="2.5" />
          <text x="245" y="115" fill="#eab308" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Hash Function</text>
          <text x="245" y="132" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">h(k) = (ascii sum) % 8</text>
          
          {/* Mapping arrows key -> hash function */}
          <path d="M 120 87 L 175 105" stroke="#a1a1aa" strokeWidth="1" fill="none" markerEnd="url(#arrow-hash-grey)" />
          <path d="M 120 122 L 175 122" stroke="#a1a1aa" strokeWidth="1" fill="none" markerEnd="url(#arrow-hash-grey)" />
          <path d="M 120 157 L 175 138" stroke="#a1a1aa" strokeWidth="1" fill="none" markerEnd="url(#arrow-hash-grey)" />
          
          {/* Destination Buckets Array (Indices 0 to 7) */}
          <text x="380" y="55" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Index Slots</text>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
            <g key={idx}>
              <rect x="380" y={65 + idx * 18} width="90" height="16" rx="1" fill="none" stroke="#71717a" strokeWidth="1" />
              <text x="365" y={77 + idx * 18} fill="#71717a" fontSize="8" textAnchor="end" fontFamily="monospace">[{idx}]</text>
            </g>
          ))}
          
          {/* Values in mapped slots */}
          <text x="425" y="113" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">"apple" (i=2)</text>
          <text x="425" y="149" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">"banana" (i=4)</text>
          <text x="425" y="185" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">"cat" (i=6)</text>

          {/* Mapping arrows hash function -> array */}
          <path d="M 310 105 C 330 105, 340 101, 375 101" stroke="#fb923c" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-hash-orange)" />
          <path d="M 310 120 C 330 120, 340 137, 375 137" stroke="#fb923c" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-hash-orange)" />
          <path d="M 310 135 C 330 135, 340 173, 375 173" stroke="#fb923c" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-hash-orange)" />

          {/* Properties */}
          <text x="490" y="105" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Maps keys to integers</text>
          <text x="490" y="119" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Deterministic output</text>
          <text x="490" y="133" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Uniform distribution goal</text>
          <text x="490" y="147" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(1) expected lookup</text>

          <defs>
            <marker id="arrow-hash-grey" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#a1a1aa" />
            </marker>
            <marker id="arrow-hash-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'collision-resolution' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Collision Resolution Strategies</text>
          
          {/* Left Side: Chaining */}
          <text x="50" y="60" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">1. Separate Chaining (Linked Lists)</text>
          
          {[0, 1, 2].map((idx) => (
            <g key={idx}>
              <rect x="50" y={75 + idx * 35} width="40" height="25" rx="1" fill="none" stroke="#71717a" strokeWidth="1.5" />
              <text x="40" y={91 + idx * 35} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">[{idx + 3}]</text>
            </g>
          ))}
          
          {/* Chain 1 (Index 3 -> "apple" -> "apricot" -> null) */}
          <path d="M 90 87 L 125 87" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-coll-orange)" />
          <rect x="125" y="75" width="55" height="25" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="152" y="91" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"apple"</text>
          
          <path d="M 180 87 L 215 87" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-coll-orange)" />
          <rect x="215" y="75" width="55" height="25" rx="2" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="242" y="91" fill="#c084fc" fontSize="9" textAnchor="middle" fontFamily="monospace">"apricot"</text>
          <text x="280" y="91" fill="#71717a" fontSize="9" fontFamily="monospace">/ NIL</text>
          
          {/* Chain 2 (Index 4 -> null) */}
          <text x="105" y="126" fill="#71717a" fontSize="10" fontFamily="monospace">NIL</text>

          {/* Right Side: Open Addressing */}
          <text x="350" y="60" fill="#38bdf8" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">2. Open Addressing (Linear Probing)</text>
          
          {[0, 1, 2, 3].map((idx) => (
            <g key={idx}>
              <rect x="370" y={75 + idx * 30} width="100" height="22" rx="1" fill="none" stroke="#71717a" strokeWidth="1.5" />
              <text x="360" y={89 + idx * 30} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">[{idx + 3}]</text>
            </g>
          ))}
          <text x="420" y="89" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"apple"</text>
          <text x="420" y="119" fill="#c084fc" fontSize="9" textAnchor="middle" fontFamily="monospace">"apricot"</text>
          <text x="420" y="149" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">empty</text>
          <text x="420" y="179" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">empty</text>
          
          {/* Probing curve arrow showing collision resolution path */}
          <path d="M 475 86 C 510 86, 510 116, 475 116" stroke="#fb923c" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-coll-orange)" />
          <text x="532" y="105" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Collision! Probe next</text>

          <defs>
            <marker id="arrow-coll-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'load-factor' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Load Factor {"&"} Table Resizing</text>
          
          {/* Small Table: cap=4, size=3, alpha=0.75 */}
          <text x="60" y="60" fill="#f472b6" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">1. Small Buffer (Cap=4, Size=3)</text>
          {[0, 1, 2, 3].map((idx) => (
            <g key={idx}>
              <rect x="60" y={75 + idx * 24} width="80" height="20" rx="1" fill="none" stroke="#f472b6" strokeWidth="1.5" />
              <text x="50" y="89 + idx * 24" fill="#71717a" fontSize="8" textAnchor="end" fontFamily="monospace">[{idx}]</text>
            </g>
          ))}
          <text x="100" y="89" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"apple"</text>
          <text x="100" y="113" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"banana"</text>
          <text x="100" y="137" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">empty</text>
          <text x="100" y="161" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"cat"</text>
          
          <text x="100" y="190" fill="#f472b6" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">alpha = N/M = 3/4 = 0.75</text>

          {/* Trigger Resizing arrow */}
          <path d="M 160 115 L 260 115" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-resize-orange)" />
          <text x="210" y="103" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Resize {"&"} Rehash</text>
          <text x="210" y="132" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">O(N) Reallocation</text>

          {/* Double sized Table: cap=8 */}
          <text x="320" y="60" fill="#60a5fa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">2. Resized Buffer (Cap=8, alpha=0.375)</text>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
            <g key={idx}>
              <rect x="320" y={70 + idx * 16} width="90" height="14" rx="1" fill="none" stroke="#60a5fa" strokeWidth="1" />
              <text x="310" y="81 + idx * 16" fill="#71717a" fontSize="8" textAnchor="end" fontFamily="monospace">[{idx}]</text>
            </g>
          ))}
          <text x="365" y="97" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">"apple" (new index)</text>
          <text x="365" y="129" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">"banana"</text>
          <text x="365" y="161" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">"cat"</text>
          <text x="365" y="195" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">alpha = 3/8 = 0.375</text>

          {/* Guidelines on resizing */}
          <text x="440" y="110" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Usually triggered at alpha &gt;= 0.7</text>
          <text x="440" y="124" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Reallocates memory blocks</text>
          <text x="440" y="138" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Re-runs hash modulo for all keys</text>

          <defs>
            <marker id="arrow-resize-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'graph-representations' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Graph Representations (List vs Matrix)</text>
          
          {/* Small graph */}
          <circle cx="80" cy="70" r="12" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="80" y="74" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>

          <line x1="90" y1="78" x2="110" y2="102" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="120" cy="115" r="12" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="120" y="119" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          <line x1="70" y1="78" x2="50" y2="102" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="40" cy="115" r="12" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="40" y="119" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          <line x1="52" y1="115" x2="108" y2="115" stroke="#71717a" strokeWidth="1.5" />

          {/* Adjacency Matrix */}
          <text x="180" y="65" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">1. Adjacency Matrix</text>
          <text x="210" y="85" fill="#71717a" fontSize="10" fontFamily="monospace">  A B C</text>
          <text x="210" y="105" fill="#e4e4e7" fontSize="10" fontFamily="monospace">A 0 1 1</text>
          <text x="210" y="125" fill="#e4e4e7" fontSize="10" fontFamily="monospace">B 1 0 1</text>
          <text x="210" y="145" fill="#e4e4e7" fontSize="10" fontFamily="monospace">C 1 1 0</text>

          {/* Adjacency List */}
          <text x="360" y="65" fill="#4ade80" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">2. Adjacency List</text>
          
          <text x="360" y="90" fill="#e4e4e7" fontSize="10" fontFamily="monospace">A: [B, C]</text>
          <path d="M 410 87 L 440 87" stroke="#4ade80" strokeWidth="1" markerEnd="url(#arrow-graph-rep)" />
          <rect x="445" y="78" width="16" height="15" fill="none" stroke="#4ade80" strokeWidth="1" />
          <text x="453" y="89" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">B</text>
          <rect x="461" y="78" width="16" height="15" fill="none" stroke="#4ade80" strokeWidth="1" />
          <text x="469" y="89" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">C</text>

          <text x="360" y="115" fill="#e4e4e7" fontSize="10" fontFamily="monospace">B: [A, C]</text>
          <path d="M 410 112 L 440 112" stroke="#4ade80" strokeWidth="1" markerEnd="url(#arrow-graph-rep)" />
          <rect x="445" y="103" width="16" height="15" fill="none" stroke="#4ade80" strokeWidth="1" />
          <text x="453" y="114" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">A</text>
          <rect x="461" y="103" width="16" height="15" fill="none" stroke="#4ade80" strokeWidth="1" />
          <text x="469" y="114" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">C</text>

          <text x="360" y="140" fill="#e4e4e7" fontSize="10" fontFamily="monospace">C: [A, B]</text>
          <path d="M 410 137 L 440 137" stroke="#4ade80" strokeWidth="1" markerEnd="url(#arrow-graph-rep)" />
          <rect x="445" y="128" width="16" height="15" fill="none" stroke="#4ade80" strokeWidth="1" />
          <text x="453" y="139" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">A</text>
          <rect x="461" y="128" width="16" height="15" fill="none" stroke="#4ade80" strokeWidth="1" />
          <text x="469" y="139" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">B</text>

          <defs>
            <marker id="arrow-graph-rep" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'bfs-traversal' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">BFS (Breadth-First Search - FIFO Queue)</text>
          
          {/* Level 0: A */}
          <circle cx="150" cy="65" r="14" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
          <text x="150" y="69" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>
          
          {/* Level 1: B, C */}
          <line x1="140" y1="77" x2="110" y2="108" stroke="#71717a" strokeWidth="1" />
          <circle cx="100" cy="120" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="100" y="124" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          <line x1="160" y1="77" x2="190" y2="108" stroke="#71717a" strokeWidth="1" />
          <circle cx="200" cy="120" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="200" y="124" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          {/* Level 2: D */}
          <line x1="100" y1="134" x2="140" y2="166" stroke="#71717a" strokeWidth="1" />
          <circle cx="150" cy="175" r="14" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="150" y="179" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">D</text>

          {/* Level Dotted indicators */}
          <path d="M 60 65 L 240 65" stroke="#a1a1aa" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x="245" y="68" fill="#a1a1aa" fontSize="8" fontFamily="monospace">Level 0</text>
          
          <path d="M 60 120 L 240 120" stroke="#a1a1aa" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x="245" y="123" fill="#a1a1aa" fontSize="8" fontFamily="monospace">Level 1</text>
          
          <path d="M 60 175 L 240 175" stroke="#a1a1aa" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x="245" y="178" fill="#a1a1aa" fontSize="8" fontFamily="monospace">Level 2</text>

          {/* Queue Block representation */}
          <text x="340" y="70" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Queue Frontier State:</text>
          <rect x="340" y="85" width="160" height="28" rx="2" fill="none" stroke="#f472b6" strokeWidth="1.5" />
          <line x1="393" y1="85" x2="393" y2="113" stroke="#f472b6" strokeWidth="1" />
          <line x1="446" y1="85" x2="446" y2="113" stroke="#f472b6" strokeWidth="1" />
          <text x="366" y="103" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">B</text>
          <text x="420" y="103" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">C</text>
          <text x="473" y="102" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">empty</text>
          
          <text x="340" y="130" fill="#fb923c" fontSize="8" fontFamily="monospace">front</text>
          <text x="446" y="130" fill="#fb923c" fontSize="8" fontFamily="monospace">rear</text>

          {/* Visited log */}
          <text x="340" y="165" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Visited Order:</text>
          <text x="340" y="185" fill="#e4e4e7" fontSize="11" fontFamily="monospace">A &rarr; B &rarr; C &rarr; D</text>
        </svg>
      )}

      {type === 'dfs-traversal' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">DFS (Depth-First Search - Stack/Recursion)</text>
          
          {/* Depth structure */}
          <circle cx="150" cy="65" r="14" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
          <text x="150" y="69" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>

          <line x1="140" y1="77" x2="110" y2="108" stroke="#71717a" strokeWidth="1" />
          <circle cx="100" cy="120" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="100" y="124" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          <line x1="100" y1="134" x2="100" y2="161" stroke="#71717a" strokeWidth="1" />
          <circle cx="100" cy="175" r="14" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="100" y="179" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">D</text>

          <line x1="160" y1="77" x2="190" y2="108" stroke="#71717a" strokeWidth="1" />
          <circle cx="200" cy="120" r="14" fill="none" stroke="#a1a1aa" strokeWidth="1.5" />
          <text x="200" y="124" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          {/* DFS Exploration Path Curve */}
          <path d="M 150 45 C 130 50, 100 80, 85 110 C 80 130, 85 170, 100 193 C 115 175, 115 130, 135 105 C 160 85, 190 100, 200 102 C 210 115, 215 130, 200 140" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 2" fill="none" markerEnd="url(#arrow-dfs-path)" />
          <text x="60" y="145" fill="#fb923c" fontSize="8" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" textAnchor="middle">1. Deep Down</text>
          <text x="150" y="145" fill="#a1a1aa" fontSize="8" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" textAnchor="middle">2. Backtrack {"&"} visit C</text>

          {/* Stack Representation */}
          <text x="340" y="70" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Stack States (Push/Pop):</text>
          <rect x="340" y="85" width="40" height="90" fill="none" stroke="#f472b6" strokeWidth="1.5" />
          <line x1="340" y1="115" x2="380" y2="115" stroke="#f472b6" strokeWidth="1" />
          <line x1="340" y1="145" x2="380" y2="145" stroke="#f472b6" strokeWidth="1" />
          <text x="360" y="105" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">D</text>
          <text x="360" y="135" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">B</text>
          <text x="360" y="165" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">A</text>
          <text x="390" y="105" fill="#f472b6" fontSize="8" fontFamily="monospace">Top</text>

          {/* Visited log */}
          <text x="440" y="125" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">DFS Visited Order:</text>
          <text x="440" y="145" fill="#e4e4e7" fontSize="11" fontFamily="monospace">A &rarr; B &rarr; D &rarr; C</text>

          <defs>
            <marker id="arrow-dfs-path" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'topological-sort' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Topological Sort (DAG Directed Dependency Ordering)</text>
          
          {/* DAG Nodes */}
          <circle cx="80" cy="80" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="80" y="84" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>
          
          <path d="M 94 80 L 142 80" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-topo)" />
          <circle cx="160" cy="80" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="160" y="84" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          <path d="M 174 80 L 222 80" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-topo)" />
          <circle cx="240" cy="80" r="14" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="240" y="84" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          {/* Direct edge A -> C */}
          <path d="M 90 90 C 130 115, 190 115, 230 90" stroke="#71717a" strokeWidth="1.2" fill="none" markerEnd="url(#arrow-topo)" />
          <text x="160" y="125" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Direct edge dependency A &rarr; C</text>

          {/* Linear order */}
          <text x="340" y="70" fill="#fb923c" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Linearized Sequence Ordering:</text>
          
          {[
            { label: 'A', x: 340, desc: 'Indegree = 0' },
            { label: 'B', x: 410, desc: 'Requires A' },
            { label: 'C', x: 480, desc: 'Requires B' }
          ].map((item, idx) => (
            <g key={idx}>
              <rect x={item.x} y="85" width="50" height="25" rx="3" fill="none" stroke="#fb923c" strokeWidth="1.5" />
              <text x={item.x + 25} y="102" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{item.label}</text>
              <text x={item.x + 25} y="125" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">{item.desc}</text>
              {idx < 2 && (
                <path d={ `M ${item.x + 50} 97 L ${item.x + 70} 97` } stroke="#fb923c" strokeWidth="1" markerEnd="url(#arrow-topo-orange)" />
              )}
            </g>
          ))}

          {/* Core rules */}
          <text x="340" y="160" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Edges u &rarr; v imply u must precede v</text>
          <text x="340" y="174" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Solved via Kahn's Queue or DFS backtrack</text>

          <defs>
            <marker id="arrow-topo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#71717a" />
            </marker>
            <marker id="arrow-topo-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'dijkstra' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Dijkstra's Shortest Path (Single-Source Greedy)</text>
          
          {/* A */}
          <circle cx="100" cy="90" r="14" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
          <text x="100" y="94" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">A</text>
          <text x="100" y="68" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="monospace">d=0</text>

          {/* Route edge A -> C */}
          <line x1="113" y1="96" x2="167" y2="128" stroke="#4ade80" strokeWidth="2.5" />
          <text x="145" y="125" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace">w=2</text>

          {/* C */}
          <circle cx="180" cy="135" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="180" y="139" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">C</text>
          <text x="180" y="162" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">d=2</text>

          {/* Route edge C -> B */}
          <line x1="193" y1="130" x2="247" y2="98" stroke="#4ade80" strokeWidth="2.5" />
          <text x="225" y="105" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace">w=1</text>

          {/* B */}
          <circle cx="260" cy="90" r="14" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="260" y="94" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">B</text>
          <text x="260" y="68" fill="#c084fc" fontSize="9" textAnchor="middle" fontFamily="monospace">d=3</text>

          {/* Direct edge A -> B */}
          <line x1="114" y1="90" x2="246" y2="90" stroke="#71717a" strokeWidth="1" strokeDasharray="3 3" />
          <text x="180" y="82" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">w=4</text>

          {/* Table list */}
          <text x="350" y="70" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Greedy Distance Updates Table:</text>
          
          <rect x="350" y="85" width="180" height="70" rx="2" fill="none" stroke="#f472b6" strokeWidth="1.5" />
          <line x1="350" y1="108" x2="530" y2="108" stroke="#f472b6" strokeWidth="1" />
          <line x1="410" y1="85" x2="410" y2="155" stroke="#f472b6" strokeWidth="1" />
          <line x1="470" y1="85" x2="470" y2="155" stroke="#f472b6" strokeWidth="1" />

          {/* Headers */}
          <text x="380" y="100" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">Node</text>
          <text x="440" y="100" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">Direct</text>
          <text x="500" y="100" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">Dijkstra</text>

          {/* Rows */}
          <text x="380" y="125" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>
          <text x="440" y="125" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">dist=2</text>
          <text x="500" y="125" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">2 (Chosen)</text>

          <text x="380" y="145" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>
          <text x="440" y="145" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">dist=4</text>
          <text x="500" y="145" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">3 (via C)</text>

          <text x="350" y="180" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Does not support negative edge weights</text>
        </svg>
      )}

      {type === 'bellman-ford' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Bellman-Ford Algorithm {"&"} Negative Cycle Check</text>
          
          {/* Node A */}
          <circle cx="120" cy="90" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="120" y="94" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>

          {/* A -> B edge */}
          <path d="M 134 85 L 206 85" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-bf)" />
          <text x="170" y="78" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">+4</text>

          {/* Node B */}
          <circle cx="220" cy="90" r="14" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="220" y="94" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          {/* B -> C edge */}
          <path d="M 210 100 L 174 136" stroke="#f472b6" strokeWidth="2" markerEnd="url(#arrow-bf-pink)" />
          <text x="202" y="126" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace">-5</text>

          {/* Node C */}
          <circle cx="160" cy="150" r="14" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="160" y="154" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          {/* C -> A edge */}
          <path d="M 150 138 L 126 104" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-bf)" />
          <text x="130" y="130" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">+2</text>

          {/* Sum Cycle */}
          <path d="M 180 110 A 15 15 0 1 1 179 109" stroke="#fb923c" strokeWidth="1.2" strokeDasharray="2 2" fill="none" markerEnd="url(#arrow-bf-orange)" />
          <text x="165" y="114" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace">cycle</text>

          {/* Explanations */}
          <text x="310" y="75" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Negative Cycle Detected!</text>
          <text x="310" y="94" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Cost: +4 (A&rarr;B) - 5 (B&rarr;C) + 2 (C&rarr;A) = -1</text>
          <text x="310" y="110" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Infinite path relaxations reduce distance to -infinity</text>
          <text x="310" y="126" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Bellman-Ford runs N-1 relaxation iterations</text>
          <text x="310" y="142" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• 1 extra pass flags updates as Negative Cycles</text>

          <defs>
            <marker id="arrow-bf" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#71717a" />
            </marker>
            <marker id="arrow-bf-pink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
            <marker id="arrow-bf-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'floyd-warshall' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Floyd-Warshall (All-Pairs Shortest Path Dynamic Programming)</text>
          
          {/* Grid */}
          <text x="50" y="55" fill="#71717a" fontSize="9" fontFamily="monospace">vertex i \ vertex j (relaxed via k)</text>
          
          <text x="145" y="70" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">j = 0</text>
          <text x="215" y="70" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">j = 1</text>
          <text x="285" y="70" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">j = 2</text>
          
          {[0, 1, 2, 3].map((rowIdx) => (
            <g key={rowIdx}>
              <text x="85" y={95 + rowIdx * 22} fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">i = {rowIdx}</text>
              {[0, 1, 2].map((colIdx) => (
                <rect key={colIdx} x={110 + colIdx * 70} y={80 + rowIdx * 22} width="65" height="18" rx="1" fill="none" stroke="#52525b" strokeWidth="1" />
              ))}
            </g>
          ))}

          <text x="142" y="93" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>
          <text x="212" y="93" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">dist(0&rarr;1)</text>
          <text x="282" y="93" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">dist(0&rarr;2)</text>

          <text x="142" y="115" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">dist(1&rarr;0)</text>
          <text x="212" y="115" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>

          {/* Formulas */}
          <text x="380" y="90" fill="#fb923c" fontSize="10" fontFamily="monospace">dp[i][j] =</text>
          <text x="380" y="106" fill="#fb923c" fontSize="10" fontFamily="monospace">min(dp[i][j], dp[i][k] + dp[k][j])</text>
          
          <text x="380" y="135" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Computes shortest paths between all pairs</text>
          <text x="380" y="149" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Runtime complexity: O(V^3)</text>
          <text x="380" y="163" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• DP state updates on each k node path</text>
        </svg>
      )}

      {type === 'kruskal-mst' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Kruskal's Minimum Spanning Tree (Sort {"&"} Union)</text>
          
          {/* Sorted edge list */}
          <text x="60" y="55" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">1. Sort Edges by Weight:</text>
          
          {[
            { label: 'Edge A-B: wt=1', status: 'Chosen', color: '#4ade80' },
            { label: 'Edge B-C: wt=2', status: 'Chosen', color: '#4ade80' },
            { label: 'Edge A-C: wt=4', status: 'Rejected (Cycle!)', color: '#f472b6' }
          ].map((item, idx) => (
            <g key={idx}>
              <rect x="60" y={68 + idx * 24} width="160" height="20" rx="2" fill="none" stroke={item.color} strokeWidth="1" />
              <text x="70" y={81 + idx * 24} fill="#e4e4e7" fontSize="9" fontFamily="monospace">{item.label}</text>
              <text x="210" y={81 + idx * 24} fill={item.color} fontSize="8" textAnchor="end" fontFamily="monospace" fontWeight="bold">{item.status}</text>
            </g>
          ))}

          {/* Graph visual */}
          <text x="320" y="55" fill="#60a5fa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">2. MST Forest growth:</text>
          
          <circle cx="350" cy="115" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="350" y="119" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>

          <line x1="364" y1="115" x2="436" y2="115" stroke="#4ade80" strokeWidth="2.5" />
          <text x="400" y="108" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">wt=1</text>

          <circle cx="450" cy="115" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="450" y="119" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          <line x1="436" y1="123" x2="394" y2="162" stroke="#4ade80" strokeWidth="2.5" />
          <text x="420" y="152" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">wt=2</text>

          <circle cx="380" cy="175" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="380" y="179" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          <line x1="356" y1="128" x2="374" y2="162" stroke="#f472b6" strokeWidth="1" strokeDasharray="3 3" />
          <text x="352" y="150" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace">wt=4</text>
          
          <line x1="358" y1="141" x2="370" y2="149" stroke="#f472b6" strokeWidth="1.5" />
          <line x1="370" y1="141" x2="358" y2="149" stroke="#f472b6" strokeWidth="1.5" />

          {/* Info */}
          <text x="490" y="90" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(E log E) sorting</text>
          <text x="490" y="104" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Cycle checking via DSU</text>
          <text x="490" y="118" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Safe for disconnected forests</text>
        </svg>
      )}

      {type === 'prim-mst' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Prim's MST Algorithm (Greedy Vertex-Growing Cut Property)</text>
          
          {/* Active set MST boundary cut */}
          <text x="60" y="55" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">1. Visited MST Set (S):</text>
          <rect x="60" y="70" width="130" height="110" rx="5" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 3" />
          
          <circle cx="100" cy="110" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="100" y="114" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>

          <line x1="114" y1="110" x2="146" y2="110" stroke="#4ade80" strokeWidth="2" />
          <text x="130" y="102" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">wt=1</text>

          <circle cx="160" cy="110" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="160" y="114" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          {/* Edge crossing cut */}
          <line x1="172" y1="116" x2="268" y2="154" stroke="#fb923c" strokeWidth="2" />
          <text x="215" y="130" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="monospace">wt=2</text>
          <text x="215" y="152" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Min cut edge</text>

          <line x1="108" y1="98" x2="268" y2="62" stroke="#71717a" strokeWidth="1" strokeDasharray="3 3" />
          <text x="195" y="75" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">wt=5</text>

          {/* Outside set V-S */}
          <text x="280" y="55" fill="#c084fc" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">2. Unvisited Vertices:</text>
          
          <circle cx="280" cy="60" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="280" y="64" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">D</text>

          <circle cx="280" cy="160" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="280" y="164" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          <text x="360" y="90" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• MST set S starts at a random root</text>
          <text x="360" y="106" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Min-Priority queue holds candidate cross-edges</text>
          <text x="360" y="122" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Adds minimum weight boundary edge to S</text>
        </svg>
      )}

      {type === 'dsu' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Disjoint Set Union (DSU with Path Compression)</text>
          
          {/* Tree set 1 */}
          <text x="60" y="55" fill="#60a5fa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Set 1 (Root A, Rank 1)</text>
          <circle cx="100" cy="80" r="14" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
          <text x="100" y="84" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>

          <line x1="100" y1="94" x2="100" y2="126" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="100" cy="140" r="14" fill="none" stroke="#a1a1aa" strokeWidth="1.5" />
          <text x="100" y="144" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          {/* Tree set 2 */}
          <text x="220" y="55" fill="#c084fc" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Set 2 (Root C, Rank 0)</text>
          <circle cx="260" cy="80" r="14" fill="none" stroke="#c084fc" strokeWidth="2.5" />
          <text x="260" y="84" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          {/* Union-by-Rank */}
          <path d="M 246 80 L 120 80" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-dsu-union)" />
          <text x="183" y="73" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Union(B, C)</text>

          {/* Path Compression */}
          <text x="360" y="55" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Path Compression find(B):</text>
          
          <circle cx="430" cy="80" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="430" y="84" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">A</text>

          <circle cx="390" cy="140" r="14" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="390" y="144" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">B</text>

          <circle cx="470" cy="140" r="14" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="470" y="144" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">C</text>

          <line x1="400" y1="128" x2="422" y2="92" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="460" y1="128" x2="438" y2="92" stroke="#4ade80" strokeWidth="1.5" />
          
          <text x="400" y="180" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Pointers updated to root directly</text>
          <text x="400" y="194" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Amortized queries run in O(alpha(N))</text>

          <defs>
            <marker id="arrow-dsu-union" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'bubble-sort' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Bubble {"&"} Selection Sort (Swaps {"&"} Min-Scans)</text>
          
          {/* Bubble swap */}
          <text x="60" y="60" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Bubble Sort: Compare Adjacent {"&"} Swap</text>
          
          {[5, 8, 2, 9].map((val, idx) => (
            <g key={idx}>
              <rect x={60 + idx * 42} y="75" width="36" height="24" rx="2" fill="none" stroke={idx === 1 || idx === 2 ? '#fb923c' : '#71717a'} strokeWidth={idx === 1 || idx === 2 ? '2' : '1'} />
              <text x={78 + idx * 42} y="91" fill={idx === 1 || idx === 2 ? '#fb923c' : '#e4e4e7'} fontSize="10" textAnchor="middle" fontFamily="monospace">{val}</text>
            </g>
          ))}
          <path d="M 120 70 C 130 55, 146 55, 156 70" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-bubble-swap)" />
          <text x="138" y="52" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace">8 &gt; 2 (Swap!)</text>

          {/* Selection sort min scan */}
          <text x="320" y="60" fill="#4ade80" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Selection Sort: Scan for Min {"&"} Swap to Front</text>
          
          {[5, 8, 2, 9].map((val, idx) => (
            <g key={idx}>
              <rect x={320 + idx * 42} y="75" width="36" height="24" rx="2" fill="none" stroke={idx === 2 ? '#4ade80' : idx === 0 ? '#60a5fa' : '#71717a'} strokeWidth={idx === 2 || idx === 0 ? '1.5' : '1'} />
              <text x={338 + idx * 42} y="91" fill={idx === 2 ? '#4ade80' : '#e4e4e7'} fontSize="10" textAnchor="middle" fontFamily="monospace">{val}</text>
            </g>
          ))}
          <path d="M 404 105 C 380 120, 360 120, 338 105" stroke="#4ade80" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-selection-swap)" />
          <text x="371" y="125" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace">Swap min (2) to front</text>

          {/* Core bounds */}
          <text x="60" y="165" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Bubble: repeats swaps, worst time: O(N^2)</text>
          <text x="60" y="179" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Selection: minimizes total swaps, worst time: O(N^2)</text>

          <defs>
            <marker id="arrow-bubble-swap" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-selection-swap" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'insertion-sort' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Insertion Sort (Insert {"&"} Shift Partition)</text>
          
          {/* Sorted vs unsorted array */}
          <text x="80" y="65" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Sorted Segment</text>
          <text x="210" y="65" fill="#f472b6" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Unsorted Segment</text>

          {[2, 5, 8, 3].map((val, idx) => (
            <g key={idx}>
              <rect x={80 + idx * 45} y="80" width="40" height="30" rx="2" fill="none" stroke={idx === 3 ? '#fb923c' : idx < 3 ? '#4ade80' : '#f472b6'} strokeWidth={idx === 3 ? '2.5' : '1.5'} />
              <text x={100 + idx * 45} y="99" fill={idx === 3 ? '#fb923c' : '#e4e4e7'} fontSize="11" textAnchor="middle" fontFamily="monospace">{val}</text>
              <text x={100 + idx * 45} y="125" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">idx {idx}</text>
            </g>
          ))}

          {/* Dotted split wall */}
          <line x1="212.5" y1="70" x2="212.5" y2="130" stroke="#f472b6" strokeWidth="2" strokeDasharray="3 3" />

          {/* Action shifting arrows */}
          <path d="M 215 95 C 190 70, 160 70, 145 80" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-insert-shift)" />
          <text x="175" y="60" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Insert 3 in place</text>
          <text x="175" y="72" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">(shifts 8 and 5 right)</text>

          {/* Details */}
          <text x="320" y="85" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Segment [0 to i-1] stays sorted dynamically</text>
          <text x="320" y="101" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Shifts elements larger than key to the right</text>
          <text x="320" y="117" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Best case O(N) when array is already sorted</text>

          <defs>
            <marker id="arrow-insert-shift" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'merge-sort' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Merge Sort Tree (Divide {"&"} Conquer Partitioning)</text>
          
          {/* Level 0: Input */}
          <rect x="250" y="45" width="100" height="20" rx="2" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="300" y="58" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">5, 8, 2, 9</text>

          {/* Level 1: Split */}
          <line x1="280" y1="68" x2="200" y2="92" stroke="#71717a" strokeWidth="1" />
          <rect x="150" y="95" width="70" height="20" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1" />
          <text x="185" y="108" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">5, 8</text>

          <line x1="320" y1="68" x2="400" y2="92" stroke="#71717a" strokeWidth="1" />
          <rect x="380" y="95" width="70" height="20" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1" />
          <text x="420" y="108" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">2, 9</text>

          {/* Level 2: Individual */}
          <line x1="170" y1="118" x2="140" y2="142" stroke="#71717a" strokeWidth="1" />
          <circle cx="130" cy="155" r="12" fill="none" stroke="#c084fc" strokeWidth="1" />
          <text x="130" y="159" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">5</text>

          <line x1="200" y1="118" x2="230" y2="142" stroke="#71717a" strokeWidth="1" />
          <circle cx="240" cy="155" r="12" fill="none" stroke="#c084fc" strokeWidth="1" />
          <text x="240" y="159" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">8</text>

          {/* Merge back */}
          <path d="M 130 170 C 150 190, 220 190, 240 170" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="2 2" fill="none" markerEnd="url(#arrow-merge)" />
          <rect x="150" y="185" width="70" height="20" rx="2" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="185" y="198" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">5, 8</text>
          <text x="185" y="180" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Sorted Merge</text>

          {/* Info */}
          <text x="380" y="145" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Splits list until size = 1</text>
          <text x="380" y="161" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Merges sorted halves: O(N) merge</text>
          <text x="380" y="177" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Time complexity: O(N log N) stable</text>

          <defs>
            <marker id="arrow-merge" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'quick-sort' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Quick Sort (Pivot Partitioning)</text>
          
          {/* Partition state */}
          <text x="100" y="65" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Elements &lt; Pivot</text>
          <text x="235" y="65" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Pivot</text>
          <text x="340" y="65" fill="#c084fc" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Elements &gt; Pivot</text>

          <rect x="80" y="80" width="80" height="30" rx="3" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="120" y="99" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">2, 3</text>

          <rect x="220" y="80" width="50" height="30" rx="3" fill="none" stroke="#fb923c" strokeWidth="2.5" />
          <text x="245" y="99" fill="#fb923c" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">5</text>

          <rect x="320" y="80" width="80" height="30" rx="3" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="360" y="99" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">8, 9</text>

          <path d="M 170 95 L 210 95" stroke="#71717a" strokeWidth="1" markerEnd="url(#arrow-quick-pt)" />
          <path d="M 310 95 L 280 95" stroke="#71717a" strokeWidth="1" markerEnd="url(#arrow-quick-pt)" />

          {/* Explanation */}
          <text x="80" y="145" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Pivot selection can be first, last, random, or median element</text>
          <text x="80" y="161" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Partition swaps items until pivot is in its correct sorted index position</text>
          <text x="80" y="177" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">• Average time: O(N log N)  |  Worst case (unbalanced splits): O(N^2)</text>

          <defs>
            <marker id="arrow-quick-pt" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#71717a" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'heap-sort' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Heap Sort (Max-Heap Array Extraction)</text>
          
          {/* Tree layout */}
          <circle cx="120" cy="65" r="14" fill="none" stroke="#fb923c" strokeWidth="2.5" />
          <text x="120" y="69" fill="#fb923c" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">90</text>
          
          <line x1="120" y1="80" x2="160" y2="120" stroke="#71717a" strokeWidth="1" />
          <circle cx="170" cy="130" r="14" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="170" y="134" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">20</text>

          {/* Swap root */}
          <path d="M 125 50 C 150 40, 180 70, 175 110" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-heapsort-swap)" />
          <text x="190" y="70" fill="#fb923c" fontSize="8" fontFamily="monospace">Swap Root {"&"} Last</text>

          {/* Sorting array */}
          <text x="280" y="65" fill="#f472b6" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Heap Array Representation:</text>
          
          {[90, 40, 50, 10, 20].map((val, idx) => (
            <g key={idx}>
              <rect x={280 + idx * 35} y="80" width="30" height="24" rx="1" fill="none" stroke={idx === 0 ? '#fb923c' : idx === 4 ? '#60a5fa' : '#71717a'} strokeWidth={idx === 0 || idx === 4 ? '1.5' : '1'} />
              <text x={295 + idx * 35} y="96" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">{val}</text>
              <text x={295 + idx * 35} y="116" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">[{idx}]</text>
            </g>
          ))}

          {/* Action */}
          <text x="280" y="145" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Step 1: Build Max-Heap from input data</text>
          <text x="280" y="161" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Step 2: Swap max (root) to end of array</text>
          <text x="280" y="177" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Step 3: Run heapify-down on remaining nodes</text>

          <defs>
            <marker id="arrow-heapsort-swap" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'radix-sort' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Radix {"&"} Bucket Sort (Non-Comparison Distribution)</text>
          
          <text x="60" y="60" fill="#a1a1aa" fontSize="10" fontFamily="monospace">Input: [170, 45, 75, 90, 802, 24]</text>
          <text x="60" y="90" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Distribute by 1s digit into Buckets:</text>
          
          {[0, 1, 2, 3, 4, 5].map((val) => (
            <g key={val}>
              <rect x={60 + val * 80} y="110" width="70" height="50" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
              <text x={95 + val * 80} y="152" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">Bin {val}</text>
            </g>
          ))}

          <text x="95" y="125" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">170, 90</text>
          <text x="255" y="125" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">802</text>
          <text x="415" y="125" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">24</text>
          <text x="495" y="125" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">45, 75</text>

          <text x="60" y="185" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Radix Sort: passes digit-by-digit from LSD to MSD (stable)</text>
          <text x="60" y="199" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Bucket Sort: distributes items into ranges; sorts bins individually</text>
        </svg>
      )}

      {type === 'linear-search' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Linear Search (Sequential Value Lookup)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Target = 45</text>

          {[10, 25, 30, 45, 50].map((val, idx) => (
            <g key={idx}>
              <rect x={60 + idx * 55} y="80" width="45" height="32" rx="2" fill="none" stroke={idx === 3 ? '#4ade80' : idx < 3 ? '#f472b6' : '#71717a'} strokeWidth={idx === 3 ? '2.5' : '1'} />
              <text x={82 + idx * 55} y="100" fill={idx === 3 ? '#4ade80' : '#e4e4e7'} fontSize="11" textAnchor="middle" fontFamily="monospace">{val}</text>
              <text x={82 + idx * 55} y="127" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">idx {idx}</text>
            </g>
          ))}

          <path d="M 82 145 L 82 120" stroke="#f472b6" strokeWidth="1" markerEnd="url(#arrow-linsearch)" />
          <text x="82" y="156" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">Step 1 (No)</text>

          <path d="M 137 145 L 137 120" stroke="#f472b6" strokeWidth="1" markerEnd="url(#arrow-linsearch)" />
          <text x="137" y="156" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">Step 2 (No)</text>

          <path d="M 192 145 L 192 120" stroke="#f472b6" strokeWidth="1" markerEnd="url(#arrow-linsearch)" />
          <text x="192" y="156" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">Step 3 (No)</text>

          <path d="M 247 145 L 247 120" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-linsearch-g)" />
          <text x="247" y="156" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Step 4 (Found!)</text>

          <text x="360" y="90" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Scans elements linearly from index 0</text>
          <text x="360" y="106" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Average time complexity: O(N)</text>
          <text x="360" y="122" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• No sorted order constraint required</text>

          <defs>
            <marker id="arrow-linsearch" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
            <marker id="arrow-linsearch-g" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'binary-search' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Binary Search (Sorted Array Halving)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Target = 60</text>

          {[10, 25, 30, 45, 50, 60, 70].map((val, idx) => (
            <g key={idx}>
              <rect x={60 + idx * 55} y="80" width="45" height="32" rx="2" fill="none" stroke={idx === 3 ? '#fb923c' : idx === 5 ? '#4ade80' : '#71717a'} strokeWidth={idx === 3 || idx === 5 ? '2.5' : '1'} />
              <text x={82 + idx * 55} y="100" fill={idx === 5 ? '#4ade80' : '#e4e4e7'} fontSize="11" textAnchor="middle" fontFamily="monospace">{val}</text>
              <text x={82 + idx * 55} y="127" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">idx {idx}</text>
            </g>
          ))}

          <text x="82" y="145" fill="#60a5fa" fontSize="8" textAnchor="middle" fontFamily="monospace">Low</text>
          
          <text x="247" y="145" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace">Mid (45)</text>
          <text x="247" y="158" fill="#fb923c" fontSize="7" textAnchor="middle" fontFamily="monospace">60 &gt; 45 (Go Right)</text>
          <path d="M 247 70 C 270 50, 310 50, 335 70" stroke="#fb923c" strokeWidth="1" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-binsearch-jump)" />

          <text x="412" y="145" fill="#60a5fa" fontSize="8" textAnchor="middle" fontFamily="monospace">High</text>

          <text x="357" y="145" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Found!</text>

          <text x="460" y="90" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Must be sorted</text>
          <text x="460" y="104" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Mid = (L + H) / 2</text>
          <text x="460" y="118" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Splits bounds: O(log N)</text>

          <defs>
            <marker id="arrow-binsearch-jump" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'ternary-search' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Ternary Search (Three-Way Partition Split)</text>
          
          <line x1="80" y1="100" x2="480" y2="100" stroke="#71717a" strokeWidth="2" />
          
          <circle cx="80" cy="100" r="6" fill="#60a5fa" />
          <text x="80" y="85" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="monospace">Low (L)</text>

          <circle cx="213.3" cy="100" r="6" fill="#fb923c" />
          <text x="213.3" y="85" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="monospace">Mid1 (m1)</text>

          <circle cx="346.6" cy="100" r="6" fill="#fb923c" />
          <text x="346.6" y="85" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="monospace">Mid2 (m2)</text>

          <circle cx="480" cy="100" r="6" fill="#60a5fa" />
          <text x="480" y="85" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="monospace">High (H)</text>

          <text x="146.6" y="120" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Part 1</text>
          <text x="280" y="120" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Part 2</text>
          <text x="413.3" y="120" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Part 3</text>

          <text x="80" y="160" fill="#fb923c" fontSize="9" fontFamily="monospace">m1 = L + (H - L) / 3</text>
          <text x="80" y="176" fill="#fb923c" fontSize="9" fontFamily="monospace">m2 = H - (H - L) / 3</text>

          <text x="320" y="160" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Divides sorted array into 3 equal partitions</text>
          <text x="320" y="174" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Compares target with values at m1 and m2</text>
          <text x="320" y="188" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Worst-case search comparisons: O(log3 N)</text>
        </svg>
      )}

      {type === 'divide-conquer' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Divide {"&"} Conquer Paradigm (Recursive Splits)</text>
          
          {/* Main Problem */}
          <rect x="230" y="45" width="140" height="24" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="300" y="61" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">Main Problem (N)</text>

          {/* Splits Level 1 */}
          <line x1="260" y1="69" x2="170" y2="101" stroke="#71717a" strokeWidth="1" />
          <rect x="100" y="105" width="120" height="24" rx="3" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="160" y="121" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Subproblem 1 (N/2)</text>

          <line x1="340" y1="69" x2="430" y2="101" stroke="#71717a" strokeWidth="1" />
          <rect x="380" y="105" width="120" height="24" rx="3" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="440" y="121" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Subproblem 2 (N/2)</text>

          {/* Solved state and merges */}
          <path d="M 160 129 C 180 155, 280 155, 300 135" stroke="#4ade80" strokeWidth="1.2" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-dc-combine)" />
          <path d="M 440 129 C 420 155, 320 155, 300 135" stroke="#4ade80" strokeWidth="1.2" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-dc-combine)" />
          
          <rect x="230" y="150" width="140" height="24" rx="3" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="300" y="166" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Combined Solution</text>
          
          <text x="300" y="195" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Step 1: Divide (splits problem) | Step 2: Conquer (solves base case) | Step 3: Combine (merges solutions)</text>

          <defs>
            <marker id="arrow-dc-combine" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'greedy' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Greedy Algorithms (Local Optimum vs Global Optimum)</text>
          
          {/* Start node */}
          <circle cx="150" cy="55" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="150" y="59" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Start</text>

          {/* Left choice: cost 10 */}
          <line x1="140" y1="67" x2="90" y2="103" stroke="#71717a" strokeWidth="1.5" />
          <text x="105" y="80" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">cost=10</text>
          <circle cx="80" cy="115" r="14" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="80" y="119" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">A</text>

          {/* Left branch node A -> end node cost 1 */}
          <line x1="80" y1="129" x2="80" y2="161" stroke="#4ade80" strokeWidth="2.5" />
          <text x="70" y="150" fill="#4ade80" fontSize="9" textAnchor="end" fontFamily="monospace">cost=1</text>
          <circle cx="80" cy="175" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="80" y="179" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Goal1</text>

          {/* Right choice (Greedy): cost 2 */}
          <line x1="160" y1="67" x2="210" y2="103" stroke="#fb923c" strokeWidth="2.5" />
          <text x="195" y="80" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">cost=2</text>
          <circle cx="220" cy="115" r="14" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="220" y="119" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="monospace">B</text>
          <text x="242" y="119" fill="#fb923c" fontSize="8" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Greedy choice</text>

          {/* Right branch B -> end node cost 100 */}
          <line x1="220" y1="129" x2="220" y2="161" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="230" y="150" fill="#fb923c" fontSize="9" textAnchor="start" fontFamily="monospace">cost=100</text>
          <circle cx="220" cy="175" r="14" fill="none" stroke="#f472b6" strokeWidth="1.5" />
          <text x="220" y="179" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Goal2</text>

          {/* Cost calculations */}
          <text x="350" y="80" fill="#fb923c" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Greedy Total Path Cost = 2 + 100 = 102</text>
          <text x="350" y="100" fill="#4ade80" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Optimal Global Path Cost = 10 + 1 = 11</text>
          
          <text x="350" y="135" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Greedy makes locally optimal choices at each step</text>
          <text x="350" y="149" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Does not backtrack or look ahead to verify future costs</text>
          <text x="350" y="163" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Efficient O(N) choices (heuristics, Prim, Huffman)</text>
        </svg>
      )}

      {type === 'dp' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Dynamic Programming (Overlapping Subproblems {"&"} Memoization)</text>
          
          {/* Fibonacci Tree */}
          <text x="60" y="55" fill="#f472b6" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Overlapping Subproblems tree (Fibonacci):</text>
          
          <circle cx="120" cy="80" r="13" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="120" y="84" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">F(4)</text>

          <line x1="110" y1="92" x2="80" y2="118" stroke="#71717a" strokeWidth="1" />
          <circle cx="70" cy="130" r="13" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="70" y="134" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">F(3)</text>

          <line x1="130" y1="92" x2="160" y2="118" stroke="#71717a" strokeWidth="1" />
          <circle cx="170" cy="130" r="13" fill="none" stroke="#f472b6" strokeWidth="2.5" />
          <text x="170" y="134" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">F(2)</text>
          <text x="170" y="152" fill="#f472b6" fontSize="7" textAnchor="middle" fontFamily="monospace">Redundant</text>

          <line x1="60" y1="142" x2="45" y2="168" stroke="#71717a" strokeWidth="1" />
          <circle cx="35" cy="180" r="13" fill="none" stroke="#f472b6" strokeWidth="2.5" />
          <text x="35" y="184" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">F(2)</text>

          <line x1="80" y1="142" x2="95" y2="168" stroke="#71717a" strokeWidth="1" />
          <circle cx="105" cy="180" r="13" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="105" y="184" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">F(1)</text>

          {/* Memo Table */}
          <text x="320" y="55" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">DP Memo Table Lookup (Saves re-evaluation):</text>
          
          <rect x="320" y="70" width="220" height="25" rx="3" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="364" y1="70" x2="364" y2="95" stroke="#4ade80" strokeWidth="1" />
          <line x1="408" y1="70" x2="408" y2="95" stroke="#4ade80" strokeWidth="1" />
          <line x1="452" y1="70" x2="452" y2="95" stroke="#4ade80" strokeWidth="1" />
          <line x1="496" y1="70" x2="496" y2="95" stroke="#4ade80" strokeWidth="1" />

          <text x="342" y="86" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">f[0]=0</text>
          <text x="386" y="86" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">f[1]=1</text>
          <text x="430" y="86" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">f[2]=1</text>
          <text x="474" y="86" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">f[3]=2</text>
          <text x="518" y="86" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">f[4]=3</text>

          {/* Lookup arrow */}
          <path d="M 183 130 C 220 120, 260 100, 420 88" stroke="#4ade80" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-dp-lookup)" />
          <text x="280" y="106" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Returns f[2] in O(1)</text>

          <text x="320" y="135" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• DP stores overlapping subproblem values in memory tables</text>
          <text x="320" y="149" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Top-Down (Memoization) or Bottom-Up (Tabulation)</text>
          <text x="320" y="163" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Reduces recursive bounds from O(2^N) to O(N) linear time</text>

          <defs>
            <marker id="arrow-dp-lookup" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'backtracking' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Backtracking (Pruning {"&"} State Rollback)</text>
          
          <circle cx="150" cy="65" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="150" y="69" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Root</text>

          {/* Branch A (Dead End) */}
          <line x1="140" y1="77" x2="100" y2="108" stroke="#f472b6" strokeWidth="2" />
          <circle cx="90" cy="120" r="14" fill="none" stroke="#f472b6" strokeWidth="2" />
          <text x="90" y="124" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace">State A</text>

          <line x1="90" y1="134" x2="90" y2="161" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="90" cy="175" r="14" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="90" y="179" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">Pruned</text>
          
          <line x1="83" y1="168" x2="97" y2="182" stroke="#f472b6" strokeWidth="2" />
          <line x1="97" y1="168" x2="83" y2="182" stroke="#f472b6" strokeWidth="2" />
          <text x="70" y="152" fill="#f472b6" fontSize="8" textAnchor="end" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Constraint failed!</text>

          {/* Backtrack Arrow */}
          <path d="M 85 110 C 105 90, 115 90, 134 77" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 2" fill="none" markerEnd="url(#arrow-bt-rollback)" />
          <text x="135" y="103" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Backtrack</text>

          {/* Branch B */}
          <line x1="160" y1="77" x2="200" y2="108" stroke="#4ade80" strokeWidth="2" />
          <circle cx="210" cy="120" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="210" y="124" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">State B</text>

          <line x1="210" y1="134" x2="210" y2="161" stroke="#4ade80" strokeWidth="2" />
          <circle cx="210" cy="175" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="210" y="179" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Goal</text>

          <text x="280" y="85" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Traverses choices recursively (Depth-First)</text>
          <text x="280" y="101" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Pruning: stops exploring sub-tree when bounds fail</text>
          <text x="280" y="117" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Rollback: reverts state variables on return path (N-Queens, Sudoku)</text>

          <defs>
            <marker id="arrow-bt-rollback" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'branch-bound' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Branch {"&"} Bound (Optimization Bounds Pruning)</text>
          
          <text x="310" y="60" fill="#4ade80" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Best Solution found so far (Upper Bound U) = 15</text>

          <circle cx="150" cy="65" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="150" y="69" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">Root</text>

          {/* Left Branch */}
          <line x1="140" y1="77" x2="90" y2="108" stroke="#4ade80" strokeWidth="1.5" />
          <circle cx="80" cy="120" r="14" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="80" y="124" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">LB=12</text>
          
          <line x1="80" y1="134" x2="80" y2="161" stroke="#71717a" strokeWidth="1" strokeDasharray="2 2" />
          <text x="80" y="180" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Explore (12 &lt; 15)</text>

          {/* Right Branch */}
          <line x1="160" y1="77" x2="210" y2="108" stroke="#f472b6" strokeWidth="2.5" />
          <circle cx="220" cy="120" r="14" fill="none" stroke="#f472b6" strokeWidth="2.5" />
          <text x="220" y="124" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">LB=18</text>
          
          <line x1="205" y1="142" x2="235" y2="152" stroke="#f472b6" strokeWidth="3" />
          <text x="235" y="152" fill="#f472b6" fontSize="8" textAnchor="start" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">PRUNED! (18 &gt;= 15)</text>

          <text x="310" y="90" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Used for NP-Hard optimization problems (TSP, Knapsack)</text>
          <text x="310" y="104" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Branching splits the solution space dynamically (Breadth/Best-First)</text>
          <text x="310" y="118" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Bounding calculates best possible cost (LB) for subtree</text>
          <text x="310" y="132" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Prunes tree paths if LB &gt;= best solution upper bound U</text>
        </svg>
      )}

      {type === 'kmp' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">KMP Knuth-Morris-Pratt (Prefix matching without backtracking)</text>
          
          {/* Text and Pattern matching */}
          <text x="60" y="65" fill="#a1a1aa" fontSize="10" fontFamily="monospace">Text T = </text>
          <text x="130" y="65" fill="#e4e4e7" fontSize="11" fontFamily="monospace">A  B  A  Z  A  B  A  C</text>

          <text x="60" y="85" fill="#f472b6" fontSize="10" fontFamily="monospace">Pattern P = </text>
          <text x="130" y="85" fill="#f472b6" fontSize="11" fontFamily="monospace">A  B  A  C</text>
          <text x="187" y="103" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace">^ mismatch (Z != C)</text>

          {/* LPS table */}
          <text x="320" y="125" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">LPS Array (Longest Proper Prefix which is Suffix):</text>
          
          <rect x="320" y="135" width="160" height="40" rx="2" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="320" y1="155" x2="480" y2="155" stroke="#4ade80" strokeWidth="1" />
          <line x1="360" y1="135" x2="360" y2="175" stroke="#4ade80" strokeWidth="1" />
          <line x1="400" y1="135" x2="400" y2="175" stroke="#4ade80" strokeWidth="1" />
          <line x1="440" y1="135" x2="440" y2="175" stroke="#4ade80" strokeWidth="1" />

          {/* Table values */}
          <text x="340" y="148" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">P[i]</text>
          <text x="380" y="148" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">A</text>
          <text x="420" y="148" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">B</text>
          <text x="460" y="148" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">A</text>

          <text x="340" y="168" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">LPS[i]</text>
          <text x="380" y="168" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>
          <text x="420" y="168" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>
          <text x="460" y="168" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">1</text>

          {/* Shift visual */}
          <path d="M 187 88 C 160 115, 140 115, 130 100" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-kmp-shift)" />
          <text x="135" y="125" fill="#fb923c" fontSize="8" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Shift pattern right based on LPS[2]=1</text>

          {/* complexity info */}
          <text x="60" y="150" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Precomputes LPS table in O(M) time</text>
          <text x="60" y="166" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Matches text stream without backtracking pointers</text>
          <text x="60" y="182" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">• Total Match Time Complexity: O(N + M)</text>

          <defs>
            <marker id="arrow-kmp-shift" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'rabin-karp' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Rabin-Karp Algorithm (Rolling Hash Matcher)</text>
          
          {/* Sliding window */}
          <text x="60" y="65" fill="#a1a1aa" fontSize="10" fontFamily="monospace">Text T = </text>
          <text x="130" y="65" fill="#71717a" fontSize="11" fontFamily="monospace">A  B </text>
          <text x="165" y="65" fill="#4ade80" fontSize="11" fontFamily="monospace"> C  O  D  E </text>
          <text x="245" y="65" fill="#71717a" fontSize="11" fontFamily="monospace"> B  A  N  A  N  A</text>
          
          <rect x="160" y="50" width="82" height="24" rx="2" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="200" y="44" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Sliding Window</text>

          {/* Hash matches */}
          <text x="60" y="105" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Hash comparisons:</text>
          <text x="60" y="125" fill="#e4e4e7" fontSize="10" fontFamily="monospace">Hash("CODE") = 394285 (Pattern)</text>
          <text x="60" y="141" fill="#4ade80" fontSize="10" fontFamily="monospace">Hash(Window) = 394285 (Window matches!)</text>

          <text x="60" y="170" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Compute hash of pattern and initial window in O(M)</text>
          <text x="60" y="184" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Slide window: update hash in O(1) via rolling division modulo subtraction</text>

          {/* Formula */}
          <text x="360" y="115" fill="#fb923c" fontSize="10" fontFamily="monospace">Rolling Hash Equation:</text>
          <text x="360" y="135" fill="#fb923c" fontSize="9" fontFamily="monospace">H(i+1) = (d * (H(i) - T[i]*h) + T[i+M]) mod q</text>
          <text x="360" y="165" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Checks exact match only if hashes match (spurious hits check)</text>
        </svg>
      )}

      {type === 'z-algo' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Z-Algorithm (Z-Array String Prefix Matching)</text>
          
          <text x="60" y="60" fill="#a1a1aa" fontSize="10" fontFamily="monospace">Concatenated string S = Pattern + "$" + Text</text>
          
          {/* Z Array visualization */}
          <rect x="60" y="75" width="280" height="40" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <line x1="60" y1="95" x2="340" y2="95" stroke="#60a5fa" strokeWidth="1" />
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <line key={idx} x1={60 + idx * 40} y1="75" x2={60 + idx * 40} y2="115" stroke="#60a5fa" strokeWidth="1" />
          ))}

          {/* Chars */}
          <text x="80" y="88" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">a</text>
          <text x="120" y="88" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">b</text>
          <text x="160" y="88" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="monospace">$</text>
          <text x="200" y="88" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">a</text>
          <text x="240" y="88" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">b</text>
          <text x="280" y="88" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">a</text>
          <text x="320" y="88" fill="#ffffff" fontSize="9" textAnchor="middle" fontFamily="monospace">b</text>

          {/* Z-values */}
          <text x="80" y="108" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>
          <text x="120" y="108" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>
          <text x="160" y="108" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>
          <text x="200" y="108" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">2</text>
          <text x="240" y="108" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>
          <text x="280" y="108" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">2</text>
          <text x="320" y="108" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>

          {/* Indices */}
          {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
            <text key={idx} x={80 + idx * 40} y="130" fill="#71717a" fontSize="7" textAnchor="middle" fontFamily="monospace">i={idx}</text>
          ))}

          {/* Match highlight */}
          <path d="M 200 72 C 160 50, 120 50, 80 72" stroke="#4ade80" strokeWidth="1.2" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-z-match)" />
          <text x="140" y="45" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Prefix matches length=2</text>

          <text x="360" y="85" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Z[i] = length of LCP of S and suffix starting at i</text>
          <text x="360" y="99" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Uses [L, R] segment boxes to skip re-comparisons</text>
          <text x="360" y="113" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Matches text stream in O(N + M) linear time</text>

          <defs>
            <marker id="arrow-z-match" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'suffix-structures' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Suffix Arrays {"&"} Trees (Suffix Indexes)</text>
          
          <text x="60" y="60" fill="#a1a1aa" fontSize="10" fontFamily="monospace">String S = "banana$"</text>

          {/* Suffix sorting table */}
          <text x="60" y="85" fill="#fb923c" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Sorted Suffixes (Lexicographical):</text>
          
          {[
            { idx: 6, suff: "$" },
            { idx: 5, suff: "a$" },
            { idx: 3, suff: "ana$" },
            { idx: 1, suff: "anana$" },
            { idx: 0, suff: "banana$" },
            { idx: 4, suff: "na$" },
            { idx: 2, suff: "nana$" }
          ].map((item, idx) => (
            <g key={idx}>
              <text x="60" y={105 + idx * 15} fill="#71717a" fontSize="8" fontFamily="monospace">SA[{idx}] = {item.idx}</text>
              <text x="120" y={105 + idx * 15} fill="#e4e4e7" fontSize="9" fontFamily="monospace">{item.suff}</text>
            </g>
          ))}

          {/* Suffix Tree visual */}
          <text x="340" y="85" fill="#60a5fa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Suffix Tree (Compact Trie of Suffixes):</text>
          
          {/* Suffix Tree Node root */}
          <circle cx="380" cy="115" r="10" fill="none" stroke="#60a5fa" strokeWidth="2" />
          
          <line x1="380" y1="125" x2="350" y2="155" stroke="#71717a" strokeWidth="1" />
          <circle cx="340" cy="165" r="10" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="355" y="145" fill="#ffffff" fontSize="8" textAnchor="end" fontFamily="monospace">banana$</text>

          <line x1="390" y1="123" x2="430" y2="155" stroke="#71717a" strokeWidth="1" />
          <circle cx="440" cy="165" r="10" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="420" y="145" fill="#ffffff" fontSize="8" textAnchor="start" fontFamily="monospace">a</text>

          {/* Child fork */}
          <line x1="440" y1="175" x2="420" y2="200" stroke="#71717a" strokeWidth="1" />
          <circle cx="415" cy="208" r="8" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="410" y="195" fill="#71717a" fontSize="8" textAnchor="end" fontFamily="monospace">$</text>

          <line x1="448" y1="173" x2="475" y2="200" stroke="#71717a" strokeWidth="1" />
          <circle cx="480" cy="208" r="8" fill="none" stroke="#71717a" strokeWidth="1" />
          <text x="470" y="195" fill="#71717a" fontSize="8" textAnchor="start" fontFamily="monospace">na$</text>

          <text x="340" y="60" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Search patterns: Binary search on Suffix Array in O(M log N)</text>
          <text x="340" y="72" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Suffix Tree search matches patterns in O(M) time</text>
        </svg>
      )}

      {type === 'avl-tree' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">AVL Tree Self-Balancing (Rotations)</text>
          
          {/* Unbalanced Tree Root: 30 (BF = -2) */}
          <circle cx="200" cy="70" r="16" fill="none" stroke="#f472b6" strokeWidth="2.5" />
          <text x="200" y="74" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">30</text>
          <text x="200" y="48" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace">BF = -2</text>

          {/* Left Child: 20 (BF = 0) */}
          <line x1="186" y1="80" x2="134" y2="120" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="120" cy="130" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="120" y="134" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">20</text>
          <text x="120" y="156" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">BF = 0</text>

          {/* Right Child: 40 (BF = -1) */}
          <line x1="214" y1="80" x2="266" y2="120" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="280" cy="130" r="16" fill="none" stroke="#fb923c" strokeWidth="1.5" />
          <text x="280" y="134" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">40</text>
          <text x="280" y="156" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace">BF = -1</text>

          {/* Right-Right Child: 50 (BF = 0) */}
          <line x1="294" y1="140" x2="336" y2="175" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="350" cy="185" r="16" fill="none" stroke="#fb923c" strokeWidth="1.5" />
          <text x="350" y="189" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">50</text>

          {/* Left Rotation indicator */}
          <path d="M 230 110 C 240 90, 260 90, 255 108" stroke="#38bdf8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-avl-rotate)" />
          <text x="275" y="90" fill="#38bdf8" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Left Rotation</text>

          {/* Explanation parameters */}
          <text x="410" y="90" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• BF = Height(Left) - Height(Right)</text>
          <text x="410" y="106" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• BF must be in range [-1, 0, 1]</text>
          <text x="410" y="122" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Rotation re-structures path in O(1)</text>

          <defs>
            <marker id="arrow-avl-rotate" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#38bdf8" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'red-black-tree' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Red-Black Tree Balancing Rules</text>
          
          {/* Black Root: 30 */}
          <circle cx="300" cy="65" r="16" fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
          <text x="300" y="69" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">30</text>
          <text x="300" y="44" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">Black</text>

          {/* Left Red Child: 15 */}
          <line x1="286" y1="75" x2="214" y2="105" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="200" cy="115" r="16" fill="none" stroke="#f472b6" strokeWidth="2" />
          <text x="200" y="119" fill="#f472b6" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">15</text>
          <text x="200" y="139" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">Red</text>

          {/* Right Black Child: 40 */}
          <line x1="314" y1="75" x2="386" y2="105" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="400" cy="115" r="16" fill="none" stroke="#e4e4e7" strokeWidth="2" />
          <text x="400" y="119" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">40</text>
          <text x="400" y="139" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">Black</text>

          {/* Left-Left Black Child: 10 */}
          <line x1="187" y1="125" x2="143" y2="155" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="130" cy="165" r="16" fill="none" stroke="#e4e4e7" strokeWidth="2" />
          <text x="130" y="169" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">10</text>

          {/* Left-Right Black Child: 20 */}
          <line x1="213" y1="125" x2="257" y2="155" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="270" cy="165" r="16" fill="none" stroke="#e4e4e7" strokeWidth="2" />
          <text x="270" y="169" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">20</text>

          {/* Right-Right Red Child: 50 */}
          <line x1="413" y1="125" x2="457" y2="155" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="470" cy="165" r="16" fill="none" stroke="#f472b6" strokeWidth="2" />
          <text x="470" y="169" fill="#f472b6" fontSize="10" textAnchor="middle" fontFamily="monospace">50</text>

          {/* RB Rules */}
          <text x="450" y="60" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Root is always Black</text>
          <text x="450" y="74" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• No consecutive Red nodes</text>
          <text x="450" y="88" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Equal Black path count</text>
        </svg>
      )}

      {type === 'segment-tree' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Segment Tree (Interval Range Sums)</text>
          
          {/* Root Range [0-3]: val=24 */}
          <circle cx="300" cy="60" r="18" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="300" y="64" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">24</text>
          <text x="300" y="36" fill="#60a5fa" fontSize="8" textAnchor="middle" fontFamily="monospace">[0-3]</text>

          {/* Left Range [0-1]: val=13 */}
          <line x1="284" y1="72" x2="216" y2="108" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="200" cy="120" r="18" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="200" y="124" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">13</text>
          <text x="200" y="96" fill="#c084fc" fontSize="8" textAnchor="middle" fontFamily="monospace">[0-1]</text>

          {/* Right Range [2-3]: val=11 */}
          <line x1="316" y1="72" x2="384" y2="108" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="400" cy="120" r="18" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="400" y="124" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">11</text>
          <text x="400" y="96" fill="#c084fc" fontSize="8" textAnchor="middle" fontFamily="monospace">[2-3]</text>

          {/* Leaf nodes */}
          <line x1="184" y1="132" x2="136" y2="168" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="120" cy="180" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="120" y="184" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">5</text>
          <text x="120" y="204" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace">[0]</text>

          <line x1="216" y1="132" x2="264" y2="168" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="280" cy="180" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="280" y="184" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">8</text>
          <text x="280" y="204" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace">[1]</text>

          <line x1="384" y1="132" x2="336" y2="168" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="320" cy="180" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="320" y="184" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">2</text>
          <text x="320" y="204" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace">[2]</text>

          <line x1="416" y1="132" x2="464" y2="168" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="480" cy="180" r="16" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="480" y="184" fill="#ffffff" fontSize="10" textAnchor="middle" fontFamily="monospace">9</text>
          <text x="480" y="204" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace">[3]</text>

          {/* Information */}
          <text x="500" y="70" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Base array elements: [5, 8, 2, 9]</text>
          <text x="500" y="84" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Segment nodes hold sum ranges</text>
          <text x="500" y="98" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Updates: O(log N)</text>
        </svg>
      )}

      {type === 'fenwick-tree' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Fenwick Tree (Binary Indexed Tree - BIT)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Index covers size computed by LSB = (x {"&"} -x)</text>

          {/* Array representation */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((val, idx) => (
            <g key={idx}>
              <rect x={70 + idx * 45} y="150" width="40" height="30" rx="2" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
              <text x={90 + idx * 45} y="169" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">{val}</text>
              <text x={90 + idx * 45} y="194" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">idx {idx+1}</text>
            </g>
          ))}

          {/* Cover intervals paths */}
          <path d="M 90 145 L 90 120" stroke="#f472b6" strokeWidth="1" markerEnd="url(#arrow-bit-pt)" />
          <text x="90" y="115" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">[1]</text>

          <path d="M 135 145 L 135 100" stroke="#f472b6" strokeWidth="1" markerEnd="url(#arrow-bit-pt)" />
          <text x="135" y="95" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">[1-2]</text>

          <path d="M 180 145 L 180 120" stroke="#f472b6" strokeWidth="1" markerEnd="url(#arrow-bit-pt)" />
          <text x="180" y="115" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">[3]</text>

          <path d="M 225 145 L 225 80" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-bit-pt-g)" />
          <text x="225" y="75" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">[1-4]</text>

          <path d="M 270 145 L 270 120" stroke="#f472b6" strokeWidth="1" markerEnd="url(#arrow-bit-pt)" />
          <text x="270" y="115" fill="#f472b6" fontSize="8" textAnchor="middle" fontFamily="monospace">[5]</text>

          <path d="M 315 145 L 315 100" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-bit-pt-g)" />
          <text x="315" y="95" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">[5-6]</text>

          {/* Example Cumulative query */}
          <path d="M 315 78 C 315 50, 225 50, 225 65" stroke="#fb923c" strokeWidth="1.2" strokeDasharray="2 2" fill="none" markerEnd="url(#arrow-bit-pt-o)" />
          <text x="270" y="44" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Query Sum(6) = BIT[6] + BIT[4]</text>

          <defs>
            <marker id="arrow-bit-pt" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#f472b6" />
            </marker>
            <marker id="arrow-bit-pt-g" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
            <marker id="arrow-bit-pt-o" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'sparse-table' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Sparse Table Matrix (O(1) Range Minimum Queries)</text>
          
          {/* Sparse matrix grid */}
          <text x="50" y="55" fill="#71717a" fontSize="9" fontFamily="monospace">idx \ length (2^j)</text>
          
          {/* Headers */}
          <text x="145" y="70" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">j=0 (len 1)</text>
          <text x="215" y="70" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">j=1 (len 2)</text>
          <text x="285" y="70" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontFamily="monospace">j=2 (len 4)</text>
          
          {[0, 1, 2, 3, 4].map((rowIdx) => (
            <g key={rowIdx}>
              <text x="85" y={95 + rowIdx * 22} fill="#71717a" fontSize="10" textAnchor="end" fontFamily="monospace">i={rowIdx}</text>
              {[0, 1, 2].map((colIdx) => (
                <rect key={colIdx} x={110 + colIdx * 70} y={80 + rowIdx * 22} width="65" height="18" rx="1" fill="none" stroke="#52525b" strokeWidth="1" />
              ))}
            </g>
          ))}

          {/* Cell examples */}
          <text x="142" y="93" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">arr[0]</text>
          <text x="212" y="93" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="monospace">min(0..1)</text>
          <text x="282" y="93" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">min(0..3)</text>

          <text x="142" y="115" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">arr[1]</text>
          <text x="212" y="115" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="monospace">min(1..2)</text>

          {/* Formulas and details */}
          <text x="380" y="95" fill="#fb923c" fontSize="10" fontFamily="monospace">table[i][j] =</text>
          <text x="380" y="112" fill="#fb923c" fontSize="9" fontFamily="monospace">min(table[i][j-1], table[i + 2^(j-1)][j-1])</text>
          <text x="380" y="145" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Precompute: O(N log N) time</text>
          <text x="380" y="159" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Query: O(1) interval overlap</text>
        </svg>
      )}

      {type === 'trie' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Trie Prefix Tree (Prefix Match)</text>
          
          {/* Root node */}
          <circle cx="260" cy="55" r="14" fill="none" stroke="#71717a" strokeWidth="1.5" />
          <text x="260" y="59" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">root</text>

          {/* Word Cat / Car pathway */}
          <line x1="248" y1="65" x2="192" y2="95" stroke="#71717a" strokeWidth="1" />
          <circle cx="180" cy="105" r="14" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="180" y="109" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">c</text>

          <line x1="180" y1="119" x2="180" y2="146" stroke="#71717a" strokeWidth="1" />
          <circle cx="180" cy="160" r="14" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="180" y="164" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">a</text>

          {/* Splitting suffix t and r */}
          <line x1="170" y1="172" x2="135" y2="193" stroke="#71717a" strokeWidth="1" />
          <circle cx="120" cy="200" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="120" y="204" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">t*</text>

          <line x1="190" y1="172" x2="225" y2="193" stroke="#71717a" strokeWidth="1" />
          <circle cx="240" cy="200" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="240" y="204" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">r*</text>

          {/* Word Dog pathway */}
          <line x1="272" y1="65" x2="328" y2="95" stroke="#71717a" strokeWidth="1" />
          <circle cx="340" cy="105" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="340" y="109" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">d</text>

          <line x1="340" y1="119" x2="340" y2="146" stroke="#71717a" strokeWidth="1" />
          <circle cx="340" cy="160" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="340" y="164" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">o</text>

          <line x1="340" y1="174" x2="340" y2="191" stroke="#71717a" strokeWidth="1" />
          <circle cx="340" cy="200" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="340" y="204" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">g*</text>

          {/* Information */}
          <text x="420" y="110" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Word end node marker (*)</text>
          <text x="420" y="124" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Search runtime: O(L) length</text>
          <text x="420" y="138" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• High efficiency prefix seeking</text>
        </svg>
      )}

      {type === 'treap' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Treap (Binary Search Tree Keys + Max Heap Priorities)</text>
          
          {/* Root node */}
          <rect x="250" y="55" width="80" height="30" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="290" y="74" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">K:50, P:99</text>

          {/* Left node */}
          <line x1="260" y1="85" x2="190" y2="115" stroke="#71717a" strokeWidth="1.5" />
          <rect x="130" y="115" width="80" height="30" rx="3" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="170" y="134" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">K:30, P:75</text>

          {/* Right node */}
          <line x1="320" y1="85" x2="390" y2="115" stroke="#71717a" strokeWidth="1.5" />
          <rect x="370" y="115" width="80" height="30" rx="3" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="410" y="134" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">K:70, P:80</text>

          {/* Left-Right node */}
          <line x1="190" y1="145" x2="220" y2="175" stroke="#71717a" strokeWidth="1.5" />
          <rect x="200" y="175" width="80" height="30" rx="3" fill="none" stroke="#a1a1aa" strokeWidth="1.2" />
          <text x="240" y="194" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">K:40, P:45</text>

          {/* Explanatory arrows */}
          <text x="480" y="90" fill="#4ade80" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• BST rule (Keys K):</text>
          <text x="490" y="104" fill="#a1a1aa" fontSize="8" fontFamily="monospace">30 &lt; 50 &lt; 70</text>
          
          <text x="480" y="130" fill="#38bdf8" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Max-Heap rule (Priorities P):</text>
          <text x="490" y="144" fill="#a1a1aa" fontSize="8" fontFamily="monospace">75 &lt; 99 and 80 &lt; 99</text>
        </svg>
      )}

      {type === 'b-tree' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">B-Tree (Multi-Key Disk Index Page Nodes)</text>
          
          {/* Root node block with 2 keys */}
          <rect x="230" y="55" width="120" height="30" rx="2" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <line x1="270" y1="55" x2="270" y2="85" stroke="#60a5fa" strokeWidth="1.5" />
          <line x1="310" y1="55" x2="310" y2="85" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="250" y="74" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="monospace">20</text>
          <text x="290" y="74" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="monospace">50</text>
          <text x="330" y="74" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">ptrs</text>

          {/* Down Pointers */}
          <path d="M 240 85 L 140 135" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-btree-pt)" />
          <path d="M 290 85 L 290 135" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-btree-pt)" />
          <path d="M 340 85 L 440 135" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-btree-pt)" />

          {/* Child 1 block: keys < 20 */}
          <rect x="60" y="135" width="120" height="30" rx="2" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="100" y1="135" x2="100" y2="165" stroke="#4ade80" strokeWidth="1" />
          <line x1="140" y1="135" x2="140" y2="165" stroke="#4ade80" strokeWidth="1" />
          <text x="80" y="154" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">5</text>
          <text x="120" y="154" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">10</text>
          <text x="160" y="154" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">15</text>

          {/* Child 2 block: 20 < keys < 50 */}
          <rect x="230" y="135" width="120" height="30" rx="2" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="270" y1="135" x2="270" y2="165" stroke="#4ade80" strokeWidth="1" />
          <line x1="310" y1="135" x2="310" y2="165" stroke="#4ade80" strokeWidth="1" />
          <text x="250" y="154" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">30</text>
          <text x="290" y="154" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">40</text>
          <text x="330" y="154" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">-</text>

          {/* Child 3 block: keys > 50 */}
          <rect x="400" y="135" width="120" height="30" rx="2" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="440" y1="135" x2="440" y2="165" stroke="#4ade80" strokeWidth="1" />
          <line x1="480" y1="135" x2="480" y2="165" stroke="#4ade80" strokeWidth="1" />
          <text x="420" y="154" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">60</text>
          <text x="460" y="154" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">70</text>
          <text x="500" y="154" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">80</text>

          <defs>
            <marker id="arrow-btree-pt" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'min-heap' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Min-Heap Complete Binary Tree</text>
          
          {/* Root: 10 */}
          <circle cx="260" cy="55" r="15" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
          <text x="260" y="59" fill="#60a5fa" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">10</text>
          <text x="260" y="34" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">arr[0]</text>

          {/* Level 1: Left=25, Right=30 */}
          <line x1="247" y1="65" x2="193" y2="95" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="180" cy="105" r="15" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="180" y="109" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">25</text>
          <text x="150" y="109" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">arr[1]</text>

          <line x1="273" y1="65" x2="327" y2="95" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="340" cy="105" r="15" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="340" y="109" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">30</text>
          <text x="370" y="109" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">arr[2]</text>

          {/* Level 2: children under 25 */}
          <line x1="168" y1="117" x2="132" y2="153" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="120" cy="165" r="15" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="120" y="169" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">40</text>
          <text x="120" y="190" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">arr[3]</text>

          <line x1="192" y1="117" x2="228" y2="153" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="240" cy="165" r="15" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="240" y="169" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace">50</text>
          <text x="240" y="190" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">arr[4]</text>

          {/* Key validations */}
          <text x="430" y="80" fill="#4ade80" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Heap Property:</text>
          <text x="430" y="96" fill="#a1a1aa" fontSize="9" fontFamily="monospace">Parent &lt;= Children</text>
          <text x="430" y="110" fill="#a1a1aa" fontSize="9" fontFamily="monospace">10 &lt;= 25 and 10 &lt;= 30</text>
          <text x="430" y="130" fill="#38bdf8" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Index calculations:</text>
          <text x="430" y="146" fill="#a1a1aa" fontSize="9" fontFamily="monospace">LeftChild = 2 * i + 1</text>
          <text x="430" y="160" fill="#a1a1aa" fontSize="9" fontFamily="monospace">RightChild = 2 * i + 2</text>
        </svg>
      )}

      {type === 'binomial-heap' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Binomial Heap (Collection of Binomial Trees)</text>
          
          {/* Tree B0 */}
          <text x="60" y="60" fill="#a1a1aa" fontSize="9" fontFamily="monospace">B_0</text>
          <circle cx="60" cy="85" r="12" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="60" y="88" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">12</text>

          {/* Link B0 and B2 */}
          <line x1="90" y1="85" x2="130" y2="85" stroke="#52525b" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Tree B2 */}
          <text x="180" y="60" fill="#a1a1aa" fontSize="9" fontFamily="monospace">B_2</text>
          <circle cx="180" cy="85" r="14" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="180" y="89" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">10</text>

          <line x1="170" y1="97" x2="140" y2="128" stroke="#71717a" strokeWidth="1" />
          <circle cx="130" cy="140" r="12" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="130" y="143" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">25</text>

          <line x1="190" y1="97" x2="220" y2="128" stroke="#71717a" strokeWidth="1" />
          <circle cx="230" cy="140" r="12" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="230" y="143" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">30</text>

          <line x1="130" y1="152" x2="130" y2="178" stroke="#71717a" strokeWidth="1" />
          <circle cx="130" cy="190" r="12" fill="none" stroke="#fb923c" strokeWidth="1.5" />
          <text x="130" y="193" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">40</text>

          {/* Heap parameters */}
          <text x="330" y="90" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Binomial tree B_k contains exactly 2^k nodes</text>
          <text x="330" y="106" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Roots linked in increasing order of size</text>
          <text x="330" y="122" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Merges in O(log N) runtime bounds</text>
        </svg>
      )}

      {type === 'fibonacci-heap' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Fibonacci Heap (Circular Doubly Linked Roots)</text>
          
          {/* Roots list */}
          <circle cx="180" cy="80" r="16" fill="none" stroke="#4ade80" strokeWidth="2.5" />
          <text x="180" y="84" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">7</text>
          
          <circle cx="280" cy="80" r="16" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="280" y="84" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">18</text>

          <circle cx="380" cy="80" r="16" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="380" y="84" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">38</text>

          {/* Links */}
          <path d="M 196 74 L 264 74" stroke="#fb923c" strokeWidth="1" fill="none" markerEnd="url(#arrow-fib-o)" />
          <path d="M 264 86 L 196 86" stroke="#fb923c" strokeWidth="1" fill="none" markerEnd="url(#arrow-fib-o)" />

          <path d="M 296 74 L 364 74" stroke="#fb923c" strokeWidth="1" fill="none" markerEnd="url(#arrow-fib-o)" />
          <path d="M 364 86 L 296 86" stroke="#fb923c" strokeWidth="1" fill="none" markerEnd="url(#arrow-fib-o)" />

          <path d="M 380 64 C 380 40, 180 40, 180 64" stroke="#fb923c" strokeWidth="1.2" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-fib-o)" />

          {/* min pointer */}
          <text x="180" y="130" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">min</text>
          <path d="M 180 118 L 180 98" stroke="#4ade80" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-fib-min)" />

          {/* Child */}
          <line x1="280" y1="96" x2="280" y2="124" stroke="#71717a" strokeWidth="1" />
          <circle cx="280" cy="140" r="14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="280" y="144" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">24</text>

          <line x1="280" y1="154" x2="280" y2="174" stroke="#71717a" strokeWidth="1" />
          <circle cx="280" cy="188" r="12" fill="none" stroke="#a1a1aa" strokeWidth="1.2" />
          <text x="280" y="191" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">46</text>

          {/* Info */}
          <text x="440" y="120" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Constant O(1) insert {"&"} merge</text>
          <text x="440" y="134" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Constant O(1) amortized decrease-key</text>
          <text x="440" y="148" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Lazy consolidation on extract-min</text>

          <defs>
            <marker id="arrow-fib-o" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-fib-min" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'binary-tree' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Binary Tree Structure (Max 2 Children)</text>
          
          {/* Level 0: Root */}
          <circle cx="300" cy="65" r="16" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="300" y="69" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">A</text>
          <text x="300" y="44" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Root Node</text>

          {/* Level 1 */}
          <line x1="286" y1="75" x2="214" y2="105" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="200" cy="115" r="16" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="200" y="119" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">B</text>

          <line x1="314" y1="75" x2="386" y2="105" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="400" cy="115" r="16" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="400" y="119" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">C</text>

          {/* Level 2 */}
          <line x1="187" y1="125" x2="143" y2="155" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="130" cy="165" r="16" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="130" y="169" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">D</text>

          <line x1="213" y1="125" x2="257" y2="155" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="270" cy="165" r="16" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="270" y="169" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">E</text>

          <line x1="413" y1="125" x2="457" y2="155" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="470" cy="165" r="16" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="470" y="169" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">F</text>
          
          <text x="510" y="170" fill="#4ade80" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Leaf Nodes (Zero Children)</text>

          {/* Left vs Right pointer labels */}
          <text x="235" y="85" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">left</text>
          <text x="365" y="85" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">right</text>
        </svg>
      )}

      {type === 'binary-search-tree' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Binary Search Tree (BST Properties)</text>
          <text x="30" y="52" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Left Child &lt; Parent &lt; Right Child</text>

          {/* Root: 50 */}
          <circle cx="300" cy="70" r="16" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="300" y="74" fill="#60a5fa" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">50</text>

          {/* Level 1: Left=30, Right=70 */}
          <line x1="286" y1="80" x2="214" y2="110" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="200" cy="120" r="16" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="200" y="124" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace">30</text>
          <text x="225" y="98" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace">&lt; 50</text>

          <line x1="314" y1="80" x2="386" y2="110" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="400" cy="120" r="16" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="400" y="124" fill="#c084fc" fontSize="10" textAnchor="middle" fontFamily="monospace">70</text>
          <text x="375" y="98" fill="#c084fc" fontSize="9" textAnchor="middle" fontFamily="monospace">&gt; 50</text>

          {/* Level 2: Left/Right under 30 and 70 */}
          <line x1="187" y1="130" x2="143" y2="160" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="130" cy="170" r="16" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="130" y="174" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">20</text>

          <line x1="213" y1="130" x2="257" y2="160" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="270" cy="170" r="16" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="270" y="174" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">40</text>

          <line x1="413" y1="130" x2="457" y2="160" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="470" cy="170" r="16" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="470" y="174" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">80</text>
          
          {/* BST Rule annotations */}
          <text x="90" y="125" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Search bounds O(log N)</text>
          <text x="90" y="139" fill="#a1a1aa" fontSize="9" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Inorder traversal yields sorted array</text>
        </svg>
      )}

      {type === 'tree-traversal' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Depth-First Search (DFS) Traversals</text>
          
          {/* Tree structure: Root=1, Left=2, Right=3 */}
          <circle cx="180" cy="70" r="16" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="180" y="74" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">1</text>
          
          <line x1="166" y1="80" x2="134" y2="120" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="120" cy="130" r="16" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="120" y="134" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">2</text>
          
          <line x1="194" y1="80" x2="226" y2="120" stroke="#71717a" strokeWidth="1.5" />
          <circle cx="240" cy="130" r="16" fill="none" stroke="#c084fc" strokeWidth="2" />
          <text x="240" y="134" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">3</text>
          
          {/* Dotted traversal path curve */}
          <path d="M 180 44 C 150 44, 150 70, 100 115 C 95 130, 115 155, 130 152 C 145 145, 175 110, 180 90 C 185 110, 215 145, 230 152 C 245 155, 265 130, 260 115 C 210 70, 210 44, 180 44" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
          
          <text x="90" y="165" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Traversal path route</text>

          {/* Sequences on the right */}
          <text x="320" y="70" fill="#4ade80" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Pre-order (Root, L, R)</text>
          <text x="320" y="86" fill="#e4e4e7" fontSize="10" fontFamily="monospace">1 -&gt; 2 -&gt; 3</text>

          <text x="320" y="115" fill="#38bdf8" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">In-order (L, Root, R)</text>
          <text x="320" y="131" fill="#e4e4e7" fontSize="10" fontFamily="monospace">2 -&gt; 1 -&gt; 3</text>

          <text x="320" y="160" fill="#c084fc" fontSize="11" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Post-order (L, R, Root)</text>
          <text x="320" y="176" fill="#e4e4e7" fontSize="10" fontFamily="monospace">2 -&gt; 3 -&gt; 1</text>
        </svg>
      )}

      {type === 'two-pointers' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Two Pointer Technique (Target Sum = 24)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">int arr[6] = &#123; 3, 8, 11, 13, 16, 21 &#125;;</text>

          {/* Draw Grid */}
          {[3, 8, 11, 13, 16, 21].map((val, idx) => {
            const isTargetPair = idx === 1 || idx === 4;
            return (
              <g key={idx}>
                <rect x={100 + idx * 60} y="85" width="50" height="50" rx="3" fill="none" stroke={isTargetPair ? "#4ade80" : "#60a5fa"} strokeWidth={isTargetPair ? "2.5" : "1.5"} />
                <text x={125 + idx * 60} y="116" fill={isTargetPair ? "#4ade80" : "#e4e4e7"} fontSize="15" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight={isTargetPair ? "bold" : "normal"}>{val}</text>
                <text x={125 + idx * 60} y="152" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">[{idx}]</text>
              </g>
            );
          })}

          {/* Pointers */}
          <text x="185" y="46" fill="#c084fc" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Left pointer (arr[1] = 8)</text>
          <path d="M 185 52 L 185 76" stroke="#c084fc" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-purple)" />

          <text x="365" y="46" fill="#fb923c" fontSize="12" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Right pointer (arr[4] = 16)</text>
          <path d="M 365 52 L 365 76" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-orange-tp)" />

          <text x="475" y="105" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Converge inward</text>
          <text x="475" y="119" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• If sum &lt; target, left++</text>
          <text x="475" y="133" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• If sum &gt; target, right--</text>

          <defs>
            <marker id="arrow-orange-tp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'sliding-window' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Sliding Window (Size k = 3)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Finding max sum subarray of size 3</text>

          {/* Draw Grid */}
          {[2, 1, 5, 1, 3, 2].map((val, idx) => (
            <g key={idx}>
              <rect x={100 + idx * 60} y="85" width="50" height="50" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
              <text x={125 + idx * 60} y="116" fill="#e4e4e7" fontSize="15" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">{val}</text>
              <text x={125 + idx * 60} y="152" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">[{idx}]</text>
            </g>
          ))}

          {/* Highlight Window */}
          <rect x="215" y="80" width="170" height="60" rx="5" fill="rgba(74, 222, 128, 0.15)" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="4 2" />
          <text x="300" y="70" fill="#4ade80" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Current Window (Sum = 9)</text>

          {/* Slide Arrow */}
          <path d="M 395 110 L 435 110" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-orange-sw)" />
          <text x="415" y="100" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">slide</text>

          <text x="475" y="105" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Reuse past elements</text>
          <text x="475" y="119" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Add new right element</text>
          <text x="475" y="133" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Remove old left element</text>

          <defs>
            <marker id="arrow-orange-sw" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'fast-slow-pointer' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Fast & Slow Pointers (Floyd's Cycle Detection)</text>
          
          {/* Nodes */}
          <circle cx="100" cy="110" r="16" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="100" y="114" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">1</text>
          <path d="M 116 110 L 154 110" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-gray)" />

          <circle cx="170" cy="110" r="16" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="170" y="114" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">2</text>
          <path d="M 186 110 L 224 110" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-gray)" />

          <circle cx="240" cy="110" r="16" fill="none" stroke="#4ade80" strokeWidth="2.5" />
          <text x="240" y="114" fill="#4ade80" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">3</text>
          <path d="M 256 110 L 294 110" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-gray)" />

          <circle cx="310" cy="110" r="16" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="310" y="114" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">4</text>
          <path d="M 326 110 L 364 110" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-gray)" />

          <circle cx="380" cy="110" r="16" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="380" y="114" fill="#e4e4e7" fontSize="11" textAnchor="middle" fontFamily="monospace">5</text>
          
          {/* Cycle loop backward arrow */}
          <path d="M 380 94 C 380 40, 240 40, 240 94" stroke="#fb923c" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-orange-fsp)" />

          {/* Labels */}
          <text x="170" y="145" fill="#c084fc" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Slow (1 step/it)</text>
          <path d="M 170 135 L 170 128" stroke="#c084fc" strokeWidth="1.2" markerEnd="url(#arrow-purple-fsp)" />

          <text x="310" y="145" fill="#fb923c" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Fast (2 steps/it)</text>
          <path d="M 310 135 L 310 128" stroke="#fb923c" strokeWidth="1.2" markerEnd="url(#arrow-orange-fsp-dir)" />

          <text x="475" y="105" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Fast speed = 2x Slow</text>
          <text x="475" y="119" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Meet point inside cycle</text>
          <text x="475" y="133" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• O(1) extra space complexity</text>

          <defs>
            <marker id="arrow-gray" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#71717a" />
            </marker>
            <marker id="arrow-orange-fsp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-orange-fsp-dir" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-purple-fsp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#c084fc" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'cyclic-sort' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Cyclic Sort Pattern (Range 1 to N)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Current element = 3. Belongs at index = 2</text>

          {/* Unsorted Array */}
          {[3, 1, 5, 4, 2].map((val, idx) => (
            <g key={idx}>
              <rect x={120 + idx * 60} y="85" width="50" height="50" rx="3" fill="none" stroke={idx === 0 || idx === 2 ? "#4ade80" : "#60a5fa"} strokeWidth={idx === 0 || idx === 2 ? "2" : "1.5"} />
              <text x={145 + idx * 60} y="116" fill="#e4e4e7" fontSize="15" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">{val}</text>
              <text x={145 + idx * 60} y="152" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="monospace">[{idx}]</text>
            </g>
          ))}

          {/* Swap Arc */}
          <path d="M 145 78 C 175 45, 235 45, 265 78" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow-orange-cs)" markerStart="url(#arrow-orange-cs)" />
          <text x="205" y="45" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Swap in-place</text>

          <text x="475" y="105" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Linear O(N) runtime</text>
          <text x="475" y="119" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Zero auxiliary space</text>
          <text x="475" y="133" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Finds duplicate/missing</text>

          <defs>
            <marker id="arrow-orange-cs" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'merge-intervals' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Merge Intervals (Scheduling Blocks)</text>
          
          {/* Overlapping intervals */}
          <text x="60" y="60" fill="#71717a" fontSize="10" fontFamily="monospace">Overlapping Input Ranges:</text>
          <rect x="150" y="70" width="100" height="20" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="200" y="83" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">[1, 4]</text>

          <rect x="220" y="100" width="120" height="20" rx="3" fill="none" stroke="#fb923c" strokeWidth="1.5" />
          <text x="280" y="113" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">[3, 7]</text>

          {/* Merge Arrow */}
          <path d="M 370 95 L 410 95" stroke="#4ade80" strokeWidth="2" fill="none" markerEnd="url(#arrow-green-mi)" />
          <text x="390" y="85" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">merge</text>

          {/* Merged intervals */}
          <rect x="430" y="85" width="140" height="25" rx="3" fill="rgba(74, 222, 128, 0.15)" stroke="#4ade80" strokeWidth="2" />
          <text x="500" y="101" fill="#4ade80" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">[1, 7]</text>

          <text x="60" y="155" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Sort intervals by start time first</text>
          <text x="60" y="169" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• If current.start &lt;= last.end, update last.end = max(last.end, current.end)</text>

          <defs>
            <marker id="arrow-green-mi" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'two-heaps' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Two Heaps (Dynamic running median)</text>
          
          {/* Max Heap Left */}
          <text x="150" y="60" fill="#60a5fa" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Max-Heap (small half)</text>
          <circle cx="150" cy="90" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="150" y="94" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">12</text>
          
          <line x1="140" y1="102" x2="120" y2="128" stroke="#71717a" strokeWidth="1.2" />
          <circle cx="110" cy="140" r="12" fill="none" stroke="#71717a" strokeWidth="1.5" />
          <text x="110" y="143" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">8</text>

          <line x1="160" y1="102" x2="180" y2="128" stroke="#71717a" strokeWidth="1.2" />
          <circle cx="190" cy="140" r="12" fill="none" stroke="#71717a" strokeWidth="1.5" />
          <text x="190" y="143" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">10</text>

          {/* Min Heap Right */}
          <text x="350" y="60" fill="#fb923c" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Min-Heap (large half)</text>
          <circle cx="350" cy="90" r="14" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="350" y="94" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">15</text>
          
          <line x1="340" y1="102" x2="320" y2="128" stroke="#71717a" strokeWidth="1.2" />
          <circle cx="310" cy="140" r="12" fill="none" stroke="#71717a" strokeWidth="1.5" />
          <text x="310" y="143" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">19</text>

          <line x1="360" y1="102" x2="380" y2="128" stroke="#71717a" strokeWidth="1.2" />
          <circle cx="390" cy="140" r="12" fill="none" stroke="#71717a" strokeWidth="1.5" />
          <text x="390" y="143" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">22</text>

          {/* Median lookup bubble */}
          <rect x="210" y="165" width="180" height="30" rx="15" fill="rgba(74, 222, 128, 0.1)" stroke="#4ade80" strokeWidth="1.5" />
          <text x="300" y="184" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Median = (MaxHeap.top + MinHeap.top)/2 = 13.5</text>

          <text x="475" y="105" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Median in O(1)</text>
          <text x="475" y="119" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Insert value in O(log N)</text>
          <text x="475" y="133" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Automatic balance checks</text>
        </svg>
      )}

      {type === 'a-star' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">A* Pathfinding Search (f = g + h)</text>
          <text x="30" y="52" fill="#71717a" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">g = cost from start, h = heuristic distance to end</text>

          {/* Grid nodes */}
          <g>
            {/* Start Node */}
            <rect x="120" y="80" width="50" height="50" rx="3" fill="none" stroke="#4ade80" strokeWidth="2.5" />
            <text x="145" y="105" fill="#4ade80" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Start</text>
            <text x="145" y="122" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">f = 5</text>

            <path d="M 175 105 L 215 105" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-orange-astar)" />

            {/* Middle Node */}
            <rect x="220" y="80" width="50" height="50" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            <text x="245" y="105" fill="#e4e4e7" fontSize="12" textAnchor="middle" fontFamily="monospace">Node</text>
            <text x="245" y="122" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">g=1, h=4</text>

            <path d="M 275 105 L 315 105" stroke="#fb923c" strokeWidth="2" fill="none" markerEnd="url(#arrow-orange-astar)" />

            {/* End Node */}
            <rect x="320" y="80" width="50" height="50" rx="3" fill="none" stroke="#fb923c" strokeWidth="2.5" />
            <text x="345" y="105" fill="#fb923c" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">End</text>
            <text x="345" y="122" fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">f = g</text>
          </g>

          {/* Blocked path node */}
          <rect x="220" y="145" width="50" height="50" rx="3" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
          <text x="245" y="175" fill="#ef4444" fontSize="11" textAnchor="middle" fontFamily="monospace">Blocked</text>

          <text x="420" y="100" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Heuristic-based routing</text>
          <text x="420" y="114" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Faster than Dijkstra</text>
          <text x="420" y="128" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Standard in game AI meshes</text>

          <defs>
            <marker id="arrow-orange-astar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'cap-theorem' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">CAP Theorem Trade-Off Triangle</text>
          
          {/* Triangle vertices */}
          <polygon points="250,55 170,165 330,165" fill="none" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* C - Consistency */}
          <circle cx="250" cy="55" r="15" fill="none" stroke="#4ade80" strokeWidth="2.5" />
          <text x="250" y="59" fill="#4ade80" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">C</text>
          <text x="250" y="35" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Consistency</text>
          
          {/* A - Availability */}
          <circle cx="170" cy="165" r="15" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
          <text x="170" y="169" fill="#60a5fa" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">A</text>
          <text x="170" y="190" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Availability</text>
          
          {/* P - Partition Tolerance */}
          <circle cx="330" cy="165" r="15" fill="none" stroke="#fb923c" strokeWidth="2.5" />
          <text x="330" y="169" fill="#fb923c" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">P</text>
          <text x="330" y="190" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Partition Tolerance</text>
          
          {/* Side labels */}
          <text x="175" y="110" fill="#c084fc" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" transform="rotate(-54 175 110)">CP (Atomic {"&"} Partitioned)</text>
          <text x="325" y="110" fill="#c084fc" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" transform="rotate(54 325 110)">AP (Available {"&"} Soft State)</text>
          <text x="250" y="178" fill="#ef4444" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">CA (Single Node - No network partitions)</text>
          
          {/* Explanations */}
          <text x="420" y="80" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Network splits (P) are inevitable</text>
          <text x="420" y="98" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• CP: Refuse updates to keep safety</text>
          <text x="420" y="116" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• AP: Accept stale reads to stay online</text>
          <text x="420" y="134" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Trade-off applies only on splits</text>
        </svg>
      )}

      {type === 'sql-vs-nosql' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">SQL (Relational) vs NoSQL (Document)</text>
          
          {/* SQL Table */}
          <text x="120" y="55" fill="#60a5fa" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">SQL: Structured Table</text>
          
          <rect x="50" y="65" width="140" height="120" rx="3" fill="none" stroke="#71717a" strokeWidth="1.5" />
          <line x1="50" y1="85" x2="190" y2="85" stroke="#71717a" strokeWidth="1.5" />
          <line x1="90" y1="65" x2="90" y2="185" stroke="#71717a" strokeWidth="1" />
          <line x1="140" y1="65" x2="140" y2="185" stroke="#71717a" strokeWidth="1" />
          
          <text x="70" y="78" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">id</text>
          <text x="115" y="78" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">name</text>
          <text x="165" y="78" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">role</text>
          
          <text x="70" y="105" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">1</text>
          <text x="115" y="105" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"Alice"</text>
          <text x="165" y="105" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"Admin"</text>

          <text x="70" y="130" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">2</text>
          <text x="115" y="130" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"Bob"</text>
          <text x="165" y="130" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">"User"</text>
          
          {/* NoSQL Document */}
          <text x="320" y="55" fill="#fb923c" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">NoSQL: Document Store</text>
          <rect x="240" y="65" width="160" height="120" rx="4" fill="none" stroke="#fb923c" strokeWidth="1.5" />
          <text x="250" y="85" fill="#fb923c" fontSize="9" fontFamily="monospace">{"{"}</text>
          <text x="265" y="105" fill="#e4e4e7" fontSize="9" fontFamily="monospace">"id": 1,</text>
          <text x="265" y="125" fill="#e4e4e7" fontSize="9" fontFamily="monospace">"name": "Alice",</text>
          <text x="265" y="145" fill="#c084fc" fontSize="9" fontFamily="monospace">"metadata": {"{"} "active": true {"}"}</text>
          <text x="250" y="165" fill="#fb923c" fontSize="9" fontFamily="monospace">{"}"}</text>

          {/* Core differences side notes */}
          <text x="430" y="75" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• SQL: ACID, Joins, Rigid schemas</text>
          <text x="430" y="93" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• NoSQL: BASE, Partitioning key</text>
          <text x="430" y="111" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• SQL scales vertically (Hardware CPU)</text>
          <text x="430" y="129" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• NoSQL scales horizontally (Hashing)</text>
        </svg>
      )}

      {type === 'cdn-caching' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">CDN Edge Caching Topology</text>
          
          {/* Client node */}
          <circle cx="70" cy="110" r="20" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="70" y="114" fill="#60a5fa" fontSize="10" textAnchor="middle" fontFamily="monospace">User</text>
          
          {/* CDN Edge Node */}
          <rect x="200" y="70" width="100" height="80" rx="3" fill="none" stroke="#4ade80" strokeWidth="2.5" />
          <text x="250" y="92" fill="#4ade80" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">CDN Edge</text>
          <text x="250" y="110" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">(Edge Server)</text>
          <text x="250" y="132" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">Cache Hit: 5ms</text>
          
          {/* Origin Server */}
          <rect x="420" y="70" width="110" height="80" rx="3" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="475" y="92" fill="#fb923c" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Central Origin</text>
          <text x="475" y="110" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">(App DB Server)</text>
          <text x="475" y="132" fill="#e4e4e7" fontSize="8" textAnchor="middle" fontFamily="monospace">Cache Miss: 300ms</text>

          {/* Paths */}
          <path d="M 95 100 L 195 100" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#arrow-cdn-edge)" />
          <text x="145" y="90" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Request</text>
          
          <path d="M 305 100 L 415 100" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow-cdn-edge)" />
          <text x="360" y="90" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Pull (Cache Miss)</text>
          
          <path d="M 195 125 L 95 125" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-cdn-edge-inv)" />
          <text x="145" y="142" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Fast Edge Response</text>

          <defs>
            <marker id="arrow-cdn-edge" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#60a5fa" />
            </marker>
            <marker id="arrow-cdn-edge-inv" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'load-balancer-l4-l7' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Load Balancing (Layer 4 vs Layer 7)</text>
          
          {/* Client request */}
          <rect x="40" y="90" width="80" height="50" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="80" y="110" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">Client</text>
          <text x="80" y="125" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">HTTP /api/users</text>
          
          {/* Load Balancer */}
          <rect x="180" y="80" width="110" height="70" rx="3" fill="none" stroke="#eab308" strokeWidth="2.5" />
          <text x="235" y="105" fill="#eab308" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Load Balancer</text>
          <text x="235" y="122" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">L4: TCP IP/Port | L7: URL/Cookies</text>
          
          {/* Backend Servers */}
          <rect x="360" y="60" width="80" height="40" rx="3" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="400" y="84" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">Server Group A</text>
          
          <rect x="360" y="130" width="80" height="40" rx="3" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <text x="400" y="154" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">Server Group B</text>

          {/* Paths */}
          <path d="M 125 115 L 175 115" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#arrow-lb)" />
          
          <path d="M 295 105 L 350 85" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-lb-green)" />
          <path d="M 295 125 L 350 145" stroke="#c084fc" strokeWidth="1.5" markerEnd="url(#arrow-lb-purple)" />

          <text x="475" y="70" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• L4 routes at transport Layer (TCP)</text>
          <text x="475" y="88" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• L4: High speed, low resource</text>
          <text x="475" y="106" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• L7 routes at application Layer (HTTP)</text>
          <text x="475" y="124" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• L7: Sticky sessions, path rules</text>

          <defs>
            <marker id="arrow-lb" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#60a5fa" />
            </marker>
            <marker id="arrow-lb-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
            <marker id="arrow-lb-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#c084fc" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'service-discovery' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Service Discovery Architecture</text>
          
          {/* Client Node */}
          <rect x="50" y="120" width="80" height="40" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="90" y="144" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">API Gateway</text>
          
          {/* Central Service Registry */}
          <rect x="210" y="45" width="160" height="65" rx="3" fill="none" stroke="#eab308" strokeWidth="2" />
          <text x="290" y="65" fill="#eab308" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Service Registry</text>
          <text x="290" y="80" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">(Consul / ZooKeeper)</text>
          <text x="290" y="95" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace">Map: Service A {"->"} 10.0.1.5:8080</text>
          
          {/* Worker Node A */}
          <rect x="230" y="140" width="120" height="40" rx="3" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="290" y="160" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">Service Instance A</text>
          <text x="290" y="172" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">IP: 10.0.1.5:8080</text>

          {/* Paths */}
          {/* Register */}
          <path d="M 290 135 L 290 115" stroke="#4ade80" strokeWidth="1.2" markerEnd="url(#arrow-sd-green)" />
          <text x="335" y="125" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">1. Register Node</text>
          
          {/* Lookup */}
          <path d="M 110 115 L 205 75" stroke="#60a5fa" strokeWidth="1.2" markerEnd="url(#arrow-sd-blue)" />
          <text x="135" y="90" fill="#60a5fa" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">2. Lookup Endpoint</text>
          
          {/* Route */}
          <path d="M 135 150 L 225 150" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-sd-orange)" />
          <text x="180" y="142" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">3. Call Direct</text>

          <text x="410" y="80" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Nodes register IP/port dynamically</text>
          <text x="410" y="98" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Registry runs heartbeat monitoring</text>
          <text x="410" y="116" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Clients cache IP locally, avoiding SPOF</text>
          <text x="410" y="134" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Supports automated service health</text>

          <defs>
            <marker id="arrow-sd-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
            <marker id="arrow-sd-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#60a5fa" />
            </marker>
            <marker id="arrow-sd-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'consistent-hashing' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Consistent Hash Ring Partitioning</text>
          
          {/* Circle ring */}
          <circle cx="200" cy="115" r="55" fill="none" stroke="#71717a" strokeWidth="2.5" strokeDasharray="3 3" />
          
          {/* Server Nodes on Ring */}
          {/* Node A (top-left, 315 deg) */}
          <circle cx="161" cy="76" r="10" fill="none" stroke="#4ade80" strokeWidth="2" />
          <text x="145" y="70" fill="#4ade80" fontSize="9" fontFamily="monospace">Node A</text>
          
          {/* Node B (right, 45 deg) */}
          <circle cx="239" cy="76" r="10" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <text x="255" y="70" fill="#60a5fa" fontSize="9" fontFamily="monospace">Node B</text>
          
          {/* Node C (bottom, 180 deg) */}
          <circle cx="200" cy="170" r="10" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="200" y="192" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="monospace">Node C</text>

          {/* Keys mapped onto the ring */}
          {/* Key 1 (0 deg, right edge) */}
          <circle cx="255" cy="115" r="4" fill="#c084fc" />
          <text x="272" y="118" fill="#c084fc" fontSize="8" fontFamily="monospace">Key 1</text>
          <path d="M 252 121 C 248 135, 225 160, 212 165" stroke="#fb923c" strokeWidth="1" strokeDasharray="2 2" markerEnd="url(#arrow-ch-orange)" />
          
          {/* Key 2 (270 deg, top) */}
          <circle cx="200" cy="60" r="4" fill="#c084fc" />
          <text x="200" y="52" fill="#c084fc" fontSize="8" textAnchor="middle" fontFamily="monospace">Key 2</text>
          <path d="M 205 60 C 215 60, 225 65, 233 70" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 2" markerEnd="url(#arrow-ch-blue)" />

          <text x="350" y="80" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Servers {"&"} Keys are hashed onto 360° ring</text>
          <text x="350" y="98" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Key travels clockwise to first Node</text>
          <text x="350" y="116" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Node changes require minimal key shifts (1/N)</text>
          <text x="350" y="134" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Virtual nodes balance load uniformities</text>

          <defs>
            <marker id="arrow-ch-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-ch-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#60a5fa" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'message-queues' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Message Queue Broker (Decoupled Buffering)</text>
          
          {/* Producer */}
          <rect x="50" y="90" width="80" height="40" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="90" y="115" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">Producer</text>
          
          {/* Queue Container */}
          <rect x="200" y="70" width="180" height="80" rx="3" fill="none" stroke="#eab308" strokeWidth="2.5" />
          <text x="290" y="62" fill="#eab308" fontSize="11" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Queue Broker (Kafka/RabbitMQ)</text>
          
          {/* Message Slots */}
          <rect x="215" y="90" width="40" height="40" rx="2" fill="none" stroke="#71717a" strokeWidth="1.5" />
          <text x="235" y="114" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">Msg 3</text>
          
          <rect x="265" y="90" width="40" height="40" rx="2" fill="none" stroke="#71717a" strokeWidth="1.5" />
          <text x="285" y="114" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">Msg 2</text>
          
          <rect x="315" y="90" width="40" height="40" rx="2" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="335" y="114" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Msg 1</text>

          {/* Consumer */}
          <rect x="450" y="90" width="80" height="40" rx="3" fill="none" stroke="#fb923c" strokeWidth="1.5" />
          <text x="490" y="115" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">Consumer</text>

          {/* Paths */}
          <path d="M 135 110 L 195 110" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#arrow-mq-blue)" />
          <text x="165" y="98" fill="#60a5fa" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Publish</text>
          
          <path d="M 385 110 L 445 110" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-mq-orange)" />
          <text x="415" y="98" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Poll / Pull</text>

          <text x="180" y="175" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Decouples processing speed: scale producers {"&"} consumers independently</text>
          <text x="180" y="189" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Load Leveling: buffers traffic spikes, preventing DB exhaustion</text>

          <defs>
            <marker id="arrow-mq-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#60a5fa" />
            </marker>
            <marker id="arrow-mq-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'cqrs-event-sourcing' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">CQRS {"&"} Event Sourcing Topology</text>
          
          {/* Write Command Loop */}
          <rect x="50" y="60" width="110" height="50" rx="3" fill="none" stroke="#fb923c" strokeWidth="1.5" />
          <text x="105" y="80" fill="#fb923c" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Command Handler</text>
          <text x="105" y="95" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">(Write Model)</text>
          
          <rect x="220" y="60" width="110" height="50" rx="3" fill="none" stroke="#fb923c" strokeWidth="2" strokeDasharray="3 3" />
          <text x="275" y="85" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Event Store</text>
          <text x="275" y="98" fill="#fb923c" fontSize="8" textAnchor="middle" fontFamily="monospace">Append-Only log</text>
          
          {/* Read Query Loop */}
          <rect x="390" y="130" width="110" height="50" rx="3" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <text x="445" y="150" fill="#4ade80" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Read Database</text>
          <text x="445" y="165" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">(Materialized View)</text>
          
          {/* Paths */}
          <path d="M 165 85 L 215 85" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-cqrs-orange)" />
          
          {/* Sync Event stream path */}
          <path d="M 275 115 C 275 155, 340 155, 385 155" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrow-cqrs-purple)" />
          <text x="330" y="145" fill="#c084fc" fontSize="8" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Event Projection</text>

          <text x="390" y="65" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Write paths decoupled from Read paths</text>
          <text x="390" y="83" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Event Store acts as absolute source of truth</text>
          <text x="390" y="101" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Pre-aggregates fast views for user read queries</text>

          <defs>
            <marker id="arrow-cqrs-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
            <marker id="arrow-cqrs-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#c084fc" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'leader-election' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Leader Election {"&"} Heartbeats (Raft Consensus)</text>
          
          {/* Node 1 - Leader */}
          <circle cx="150" cy="110" r="22" fill="none" stroke="#4ade80" strokeWidth="2.5" />
          <text x="150" y="110" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Leader</text>
          <text x="150" y="122" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">Node 1</text>
          
          {/* Node 2 - Follower */}
          <circle cx="320" cy="70" r="20" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="320" y="70" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">Follower</text>
          <text x="320" y="80" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">Node 2</text>
          
          {/* Node 3 - Follower */}
          <circle cx="320" cy="150" r="20" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="320" y="150" fill="#e4e4e7" fontSize="9" textAnchor="middle" fontFamily="monospace">Follower</text>
          <text x="320" y="160" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">Node 3</text>

          {/* Heartbeats */}
          <path d="M 172 100 L 300 75" stroke="#4ade80" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrow-raft)" />
          <text x="236" y="77" fill="#4ade80" fontSize="7" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Heartbeat (AppendEntries)</text>
          
          <path d="M 172 120 L 300 145" stroke="#4ade80" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrow-raft)" />
          <text x="236" y="148" fill="#4ade80" fontSize="7" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Heartbeat (AppendEntries)</text>

          <text x="400" y="80" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Leader coordinates all updates</text>
          <text x="400" y="98" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Heartbeats prevent new elections</text>
          <text x="400" y="116" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• If leader dies, followers transition</text>
          <text x="400" y="134" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Split-brain avoided via majority quorum</text>

          <defs>
            <marker id="arrow-raft" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'sidecar-pattern' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Sidecar Design Pattern (Co-located Containers)</text>
          
          {/* Pod Bounding Box */}
          <rect x="50" y="55" width="310" height="135" rx="5" fill="none" stroke="#71717a" strokeWidth="2" strokeDasharray="3 3" />
          <text x="60" y="47" fill="#71717a" fontSize="9" fontFamily="monospace">Deployment Pod Boundary (Shared Localhost Network)</text>
          
          {/* Main Application Container */}
          <rect x="70" y="80" width="120" height="90" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
          <text x="130" y="115" fill="#60a5fa" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Main App</text>
          <text x="130" y="132" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">(NodeJS/Go core)</text>
          
          {/* Sidecar Proxy Container */}
          <rect x="220" y="80" width="120" height="90" rx="3" fill="none" stroke="#f472b6" strokeWidth="2.5" />
          <text x="280" y="115" fill="#f472b6" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Sidecar Proxy</text>
          <text x="280" y="132" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">(Envoy / Logstash)</text>

          {/* Local communication */}
          <path d="M 190 125 L 220 125" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-sidecar)" />
          <path d="M 220 135 L 190 135" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-sidecar-inv)" />
          <text x="205" y="117" fill="#4ade80" fontSize="7" textAnchor="middle" fontFamily="monospace">localhost</text>

          <text x="390" y="80" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Sidecar runs helper tasks (logging, metrics)</text>
          <text x="390" y="98" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Decouples operations from app logic</text>
          <text x="390" y="116" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Shares lifecycle, storage, and network IPs</text>
          <text x="390" y="134" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Commonly used in Service Meshes (Istio)</text>

          <defs>
            <marker id="arrow-sidecar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
            <marker id="arrow-sidecar-inv" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'tcp-handshake' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">TCP 3-Way Handshake Connection Cycle</text>
          
          {/* Timelines */}
          <line x1="120" y1="55" x2="120" y2="185" stroke="#71717a" strokeWidth="2" />
          <text x="120" y="47" fill="#60a5fa" fontSize="10" textAnchor="middle" fontFamily="monospace">Client</text>
          
          <line x1="280" y1="55" x2="280" y2="185" stroke="#71717a" strokeWidth="2" />
          <text x="280" y="47" fill="#fb923c" fontSize="10" textAnchor="middle" fontFamily="monospace">Server</text>

          {/* Handshake Arrows */}
          {/* 1. SYN */}
          <path d="M 120 70 L 280 100" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#arrow-tcp)" />
          <text x="200" y="80" fill="#60a5fa" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">1. SYN (seq=x)</text>
          
          {/* 2. SYN-ACK */}
          <path d="M 280 110 L 120 140" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#arrow-tcp-inv)" />
          <text x="200" y="120" fill="#fb923c" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">2. SYN-ACK (ack=x+1, seq=y)</text>
          
          {/* 3. ACK */}
          <path d="M 120 150 L 280 180" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#arrow-tcp)" />
          <text x="200" y="160" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">3. ACK (ack=y+1)</text>

          <text x="350" y="80" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Establishes double-duplex sockets</text>
          <text x="350" y="98" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Handshake creates network latency overhead</text>
          <text x="350" y="116" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Mitigated via TCP Keep-Alive and TLS reuse</text>
          <text x="350" y="134" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• UDP bypasses handshake for raw speed</text>

          <defs>
            <marker id="arrow-tcp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#60a5fa" />
            </marker>
            <marker id="arrow-tcp-inv" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#fb923c" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'encryption-ssl' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Asymmetric Key Encryption (SSL / TLS Security)</text>
          
          {/* Left: Client */}
          <rect x="50" y="70" width="120" height="90" rx="3" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="110" y="95" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">Client Side</text>
          <text x="110" y="115" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">Encrypts via</text>
          <text x="110" y="130" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Public Key</text>
          
          {/* Center: Encrypted transit */}
          <path d="M 175 110 L 225 110" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-ssl)" />
          <rect x="235" y="90" width="100" height="40" rx="3" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
          <text x="285" y="110" fill="#ef4444" fontSize="8" textAnchor="middle" fontFamily="monospace">"f8x2h@Lp9a"</text>
          <text x="285" y="122" fill="#ef4444" fontSize="7" textAnchor="middle" fontFamily="monospace">(Ciphertext)</text>
          <path d="M 340 110 L 390 110" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#arrow-ssl)" />

          {/* Right: Server */}
          <rect x="400" y="70" width="120" height="90" rx="3" fill="none" stroke="#fb923c" strokeWidth="1.5" />
          <text x="460" y="95" fill="#e4e4e7" fontSize="10" textAnchor="middle" fontFamily="monospace">Server Side</text>
          <text x="460" y="115" fill="#a1a1aa" fontSize="8" textAnchor="middle" fontFamily="monospace">Decrypts using</text>
          <text x="460" y="130" fill="#f472b6" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">Private Key</text>

          <text x="180" y="180" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Public keys shared openly; Private keys kept highly secure</text>
          <text x="180" y="194" fill="#a1a1aa" fontSize="10" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">• Prevents Man-in-the-Middle (MITM) snooping attacks</text>

          <defs>
            <marker id="arrow-ssl" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#71717a" />
            </marker>
          </defs>
        </svg>
      )}

      {type === 'circuit-breaker' && (
        <svg viewBox="0 0 600 220" className="w-full h-full relative z-10" xmlns="http://www.w3.org/2000/svg">
          <text x="30" y="32" fill="#eab308" fontSize="13" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive" fontWeight="bold">Circuit Breaker Fault-Tolerance States</text>
          
          {/* CLOSED STATE */}
          <circle cx="120" cy="110" r="22" fill="none" stroke="#4ade80" strokeWidth="2.5" />
          <text x="120" y="110" fill="#4ade80" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">CLOSED</text>
          <text x="120" y="122" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">(Flows Normal)</text>
          
          {/* OPEN STATE */}
          <circle cx="280" cy="110" r="22" fill="none" stroke="#ef4444" strokeWidth="2.5" />
          <text x="280" y="110" fill="#ef4444" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">OPEN</text>
          <text x="280" y="122" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">(Tripped: Fail-Fast)</text>
          
          {/* HALF-OPEN STATE */}
          <circle cx="440" cy="110" r="22" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="3 3" />
          <text x="440" y="110" fill="#eab308" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">HALF-OPEN</text>
          <text x="440" y="122" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">(Testing Canaries)</text>

          {/* Transitions */}
          {/* Closed -> Open */}
          <path d="M 143 100 L 257 100" stroke="#ef4444" strokeWidth="1.2" markerEnd="url(#arrow-cb-red)" />
          <text x="200" y="93" fill="#ef4444" fontSize="7" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Threshold Exceeded</text>
          
          {/* Open -> Half-Open */}
          <path d="M 303 100 L 417 100" stroke="#eab308" strokeWidth="1.2" markerEnd="url(#arrow-cb-yellow)" />
          <text x="360" y="93" fill="#eab308" fontSize="7" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Cooldown Timeout</text>
          
          {/* Half-Open -> Closed */}
          <path d="M 425 125 C 370 160, 190 160, 135 125" stroke="#4ade80" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrow-cb-green-inv)" />
          <text x="280" y="172" fill="#4ade80" fontSize="7" textAnchor="middle" fontFamily="'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive">Success Rate Restored</text>

          <defs>
            <marker id="arrow-cb-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#ef4444" />
            </marker>
            <marker id="arrow-cb-yellow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#eab308" />
            </marker>
            <marker id="arrow-cb-green-inv" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#4ade80" />
            </marker>
          </defs>
        </svg>
      )}
    </div>
  );
};
