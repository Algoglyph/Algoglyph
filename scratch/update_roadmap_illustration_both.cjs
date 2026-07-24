const fs = require('fs');

const ilPath = './src/components/RoadmapIllustration.tsx';
let ilContent = fs.readFileSync(ilPath, 'utf8');

// Find the body of RoadmapIllustration
const funcStart = ilContent.indexOf('export const RoadmapIllustration: React.FC<RoadmapIllustrationProps> = ({ slug }) => {');
const funcEnd = ilContent.indexOf('  const getIllustrationType = ():', funcStart);

// We replace the early return logic with combined imageNode + svgNode rendering
const newFuncBody = `export const RoadmapIllustration: React.FC<RoadmapIllustrationProps> = ({ slug }) => {
  const sLower = slug.toLowerCase();
  
  const staticImages: Record<string, string> = {
    'sys-observability': '/images/dsa/sys-observability-dark.png',
    'performance-vs-scalability': '/images/dsa/performance-vs-scalability-dark.png',
  };

  const backendSlugs = new Set([
    'lang-javascript','lang-go','lang-python','lang-ruby','lang-java','lang-csharp','lang-php','lang-rust',
    'checkpoint-beginner-projects','internet-how-works-sub','what-is-http','what-is-domain-name',
    'what-is-hosting','dns-how-works','browsers-how-works','frontend-html','frontend-css',
    'frontend-javascript','git-vcs','github-hosting','gitlab-hosting','db-mysql','db-postgresql',
    'db-mariadb','db-sqlite','db-mssql','db-oracle','db-migrations','n-plus-one-problem',
    'api-style-rest','api-style-json','api-style-soap','api-style-grpc','api-style-graphql',
    'openapi-specs','auth-jwt','auth-oauth','auth-basic','auth-token','auth-cookie','auth-openid',
    'auth-saml','checkpoint-intermediate-projects','sec-https','sec-owasp','sec-cors','sec-ssl-tls',
    'sec-csp','sec-server-security','sec-api-best-practices','hash-md5','hash-sha','hash-scrypt',
    'hash-bcrypt','cache-redis','cache-memcached','cache-http','server-nginx','server-apache',
    'server-caddy','server-iis','ai-llm-workings','ai-vs-traditional','ai-embeddings','ai-vectors',
    'ai-rags','tool-claude-code','tool-cursor','tool-copilot','tool-antigravity','ai-app-code-reviews',
    'ai-app-refactoring','ai-app-docs','ai-app-streaming','ai-app-structured-outputs',
    'prompt-techniques','agent-architecture','mcp-protocol','agent-skills','agent-roadmap',
    'provider-gemini','provider-openai','provider-anthropic','cicd-integration','cicd-deployment',
    'test-integration','test-unit','test-functional','db-transactions','db-orms','db-acid',
    'db-normalization-advanced','db-failure-modes','db-performance-profiling','container-docker',
    'container-lxc','orch-kubernetes','broker-kafka','broker-rabbitmq','pattern-monolith',
    'pattern-microservices','pattern-soa','pattern-serverless','pattern-service-mesh',
    'pattern-twelve-factor','search-elasticsearch','search-solr','realtime-sse','realtime-websockets',
    'realtime-polling','scale-db-indexes','scale-data-replication','scale-sharding','scale-cap-theorem',
    'nosql-firebase','nosql-rethinkdb','nosql-mongodb','nosql-couchdb','nosql-redis','nosql-dynamodb',
    'nosql-clickhouse','nosql-cassandra','nosql-scylladb','nosql-neo4j','nosql-neptune','nosql-dgraph',
    'nosql-influxdb','nosql-timescaledb','scale-obs-core','scale-obs-instrumentation',
    'scale-obs-monitoring','scale-obs-telemetry','mit-graceful','mit-throttling','mit-backpressure',
    'mit-loadshifting','mit-circuit',
  ]);

  const dsaFiles = [
    'a-star-algorithm','advanced-cp','aho-corasick','approximation-algorithm-bounds-bounds','avl-trees','b-trees','b-trees-index-seeks','backtracking','bellman-ford-floyd-warshall','bfs','bfs-traversal','big-omega-notation','big-theta-notation','binary-search','binary-search-trees','binary-tree','boolean-satisfiability-solvers-algorithms','boyer-moore-majority','boyer-moore-search','brents-algorithm','bresenhams-line','bridges-cuts','brute-force','bubble-sort','bucket-sort','calculate-complexity','cfg-production-grammars-bounds','chans-algorithm','chomsky-grammar-hierarchies','church-turing-computability-lambda-calculus','circuit-complexity-gates-bounds','circular-buffers','circular-linked-lists','collision-resolution','common-runtimes','cook-levin-theorem-sat-formulas','cooley-tukey-fft','counting-sort','cyclic-sort','deterministic-vs-non-deterministic-complexity','dfa-state-transitions-automatas','dfs','dfs-traversal','dijkstra','directed-graphs','directed-vs-undirected','disjoint-set-union','divide-and-conquer','double-ended-deques','doubly-linked-lists','dynamic-programming','dynamic-vectors','edabit-platform','euler-tour','fast-slow-pointers','fenwick-tree','fibonacci-heaps','fifo-queues','floyd-warshall','floyd-warshall-algorithm','functions-basic-i-o','g-del-incompleteness-logic-limits','gale-shapley','graham-scan','graph-isomorphism-classification','graph-representations','greedy','halting-problem-undecidability-contradiction','hash-indexes','heap','heap-allocation','heap-sort','importance-dsa','in-order-traversal','insertion-sort','interactive-proofs-ip-classes','isam-indexing','island-traversal','jarvis-march','johnsons-algorithm','k-d-trees','kadanes-algorithm','kargers-algorithm','kirkpatrick-seidel','kmp-algorithm','kosaraju-scc','kruskal-mst','kth-element','lee-algorithm','leetcode-platform','leftist-heaps','lifo-stacks','linear-indexing','linear-search','load-factor-scaling','manacher-substrings','max-heaps','merge-intervals','merge-sort','min-heaps','mos-algorithm','mst-union-find','multi-interval-search','multi-threaded','np-complete-polynomial-reductions','p-vs-np-class-limits','parameterized-complexity-tractability-splits','performance-vs-scalability','polynomial-time-verification-runs','post-order-traversal','pre-order-traversal','prim-mst','procedural-state-pipelines','pushdown-automata-stack-transitions','quadtrees','quantum-complexity-bqp-bounds','quick-sort','rabin-karp-search','radix-sort','randomized-algorithm-probability-checks','randomized-algorithms','recursion','red-black-trees','regular-language-matches-expressions','scc-bridges','searching','segment-tree','selection-sort','shell-sort','singly-linked-lists','skip-lists','skip-lists-complex','sliding-window-technique','sorting','space-complexity-analysis','space-complexity-class-pspace','sparse-table','sparse-tables','splay-trees','stack-allocation','static-arrays','string-algorithms','suffix-arrays','suffix-trees','sys-observability','tarjan-scc','ternary-search','time-complexity-analysis','time-hierarchy-theorem-bounds','time-vs-space','topological-sort','treaps','tree-bfs','tree-dfs','tree-indexing','tree-traversal','trie','turing-tape-state-transitions','two-heaps-pattern','two-pointer-technique','two-three-trees','undirected-graphs','viterbi-algorithm','what-is-dsa','z-algorithm','zero-knowledge-proof-protocols-verification'
  ];
  const dsaSlugs = new Set(dsaFiles);

  let imageElement: React.ReactNode = null;

  if (sLower.startsWith('game-')) {
    imageElement = (
      <div className="w-full rounded-lg overflow-hidden flex items-center justify-center select-none">
        <img 
          src={\`/images/game-dev/\${sLower}-dark.jpg\`} 
          alt={slug} 
          className="w-full object-contain rounded-lg border border-zinc-800" 
        />
      </div>
    );
  } else if (backendSlugs.has(sLower)) {
    imageElement = (
      <div className="w-full rounded-lg overflow-hidden flex items-center justify-center select-none">
        <img 
          src={\`/images/backend/\${sLower}-dark.png\`} 
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.endsWith('.png')) {
              target.src = \`/images/backend/\${sLower}-dark.jpg\`;
            } else {
              target.style.display = 'none';
            }
          }}
          alt={slug} 
          className="w-full object-contain rounded-lg border border-zinc-800" 
        />
      </div>
    );
  } else if (dsaSlugs.has(sLower)) {
    imageElement = (
      <div className="w-full rounded-lg overflow-hidden flex items-center justify-center select-none">
        <img 
          src={\`/images/dsa/\${sLower}-dark.png\`} 
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.endsWith('.png')) {
              target.src = \`/images/dsa/\${sLower}-dark.jpg\`;
            } else {
              target.style.display = 'none';
            }
          }}
          alt={slug} 
          className="w-full object-contain rounded-lg border border-zinc-800" 
        />
      </div>
    );
  } else if (staticImages[sLower]) {
    imageElement = (
      <div className="w-full h-[400px] md:h-[480px] bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center p-6 select-none relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }} 
        />
        <img 
          src={staticImages[sLower]} 
          alt={slug} 
          className="max-w-full max-h-full object-contain relative z-10" 
        />
      </div>
    );
  }

  const customConfig = getCuratedRoadmapDiagram(sLower) || SYSTEM_DESIGN_DIAGRAMS[sLower] || ML_DIAGRAMS[sLower] || DE_DIAGRAMS[sLower];

  let illustrationElement: React.ReactNode = null;

  if (customConfig) {
    illustrationElement = (
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

  if (imageElement || illustrationElement) {
    return (
      <div className="w-full flex flex-col gap-6 select-none my-6">
        {imageElement}
        {illustrationElement}
      </div>
    );
  }

`;

ilContent = ilContent.slice(0, funcStart) + newFuncBody + ilContent.slice(funcEnd);

fs.writeFileSync(ilPath, ilContent, 'utf8');
console.log("Successfully updated RoadmapIllustration.tsx to render BOTH image and SVG illustration!");
