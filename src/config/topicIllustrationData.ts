import type { DiagramConfig, DiagramElement } from './illustrationData';

const ink = "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive";
const gray = '#a1a1aa';
const orange = '#fb923c';
const blue = '#60a5fa';
const amber = '#eab308';
const red = '#f87171';
const slate = '#71717a';

const text = (x: number, y: number, textContent: string, fill = gray, fontSize = 9, textAnchor: DiagramElement['textAnchor'] = 'start', fontWeight?: string): DiagramElement => ({
  type: 'text', x, y, textContent, fill, fontSize, textAnchor, fontWeight, fontFamily: ink
});

const rect = (x: number, y: number, width: number, height: number, stroke = blue, fill = 'none', rx = 4): DiagramElement => ({
  type: 'rect', x, y, width, height, rx, stroke, fill, strokeWidth: 1.8
});

const circle = (cx: number, cy: number, r: number, stroke = blue, fill = 'none'): DiagramElement => ({
  type: 'circle', cx, cy, r, stroke, fill, strokeWidth: 1.8
});

const line = (x1: number, y1: number, x2: number, y2: number, stroke = slate, dash?: string): DiagramElement => ({
  type: 'line', x1, y1, x2, y2, stroke, strokeWidth: 1.4, strokeDasharray: dash
});

const path = (d: string, stroke = orange, dash?: string, markerEnd = 'url(#arrow-copy)'): DiagramElement => ({
  type: 'path', d, stroke, strokeWidth: 1.5, fill: 'none', strokeDasharray: dash, markerEnd
});

const poly = (points: string, stroke = blue, fill = 'none'): DiagramElement => ({
  type: 'polygon', points, stroke, fill, strokeWidth: 1.7
});

const titleCase = (slug: string) => slug.split('-').map((part) => part.toUpperCase() === part ? part : part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const short = (value: string, max = 20) => value.length <= max ? value : `${value.slice(0, max - 1)}.`;

const boxFlow = (title: string, boxes: string[], notes: string[], accent = amber): DiagramConfig => {
  const elements: DiagramElement[] = [text(30, 32, title, accent, 13, 'start', 'bold')];
  const startX = 55;
  const gap = 28;
  const width = Math.min(118, Math.floor((500 - gap * (boxes.length - 1)) / boxes.length));
  boxes.forEach((label, index) => {
    const x = startX + index * (width + gap);
    const stroke = index % 2 === 0 ? blue : orange;
    elements.push(rect(x, 76, width, 52, stroke));
    elements.push(text(x + width / 2, 100, label, stroke, 9, 'middle', 'bold'));
    if (index < boxes.length - 1) elements.push(path(`M ${x + width + 4} 102 L ${x + width + gap - 4} 102`, orange));
  });
  notes.slice(0, 4).forEach((note, index) => elements.push(text(76, 158 + index * 16, note, gray, 9)));
  return { title, elements };
};

const base = (title: string, accent = amber): DiagramElement[] => [text(30, 32, title, accent, 13, 'start', 'bold')];

const mathScene = (slug: string, label: string): DiagramConfig => {
  const name = short(label, 22);
  if (slug.includes('vector')) {
    return { title: label, elements: [...base(`${name}: Direction + Magnitude`), line(95, 160, 360, 70, slate), path('M 95 160 L 355 72', orange), circle(95, 160, 5, blue), text(250, 70, 'velocity arrow', orange, 10), text(80, 185, 'x/y/z components', gray, 9), line(95, 160, 355, 160, blue, '4 2'), line(355, 160, 355, 74, blue, '4 2')] };
  }
  if (slug.includes('matrix')) {
    return { title: label, elements: [...base(`${name}: Grid Transform`), rect(85, 58, 150, 120, blue), ...[0, 1, 2, 3].flatMap((i) => [line(85 + i * 37.5, 58, 85 + i * 37.5, 178, slate), line(85, 58 + i * 30, 235, 58 + i * 30, slate)]), path('M 270 118 L 345 118', orange), poly('385,76 470,112 405,164', red), text(160, 198, 'basis columns', blue, 9, 'middle'), text(425, 188, 'rotated space', red, 9, 'middle')] };
  }
  if (slug.includes('quaternion') || slug.includes('euler') || slug.includes('orientation')) {
    return { title: label, elements: [...base(`${name}: Rotation Control`), circle(260, 115, 70, blue), path('M 190 115 C 215 55, 315 55, 340 115', orange), path('M 340 115 C 315 175, 215 175, 190 115', orange, '4 2'), line(260, 115, 338, 72, red), text(362, 76, 'axis', red, 10), text(238, 116, slug.includes('euler') ? 'yaw/pitch/roll' : 'unit rotation', blue, 10), text(195, 198, 'avoids bad camera twists', gray, 9)] };
  }
  if (slug.includes('spline') || slug.includes('bezier') || slug.includes('hermite') || slug.includes('catmull')) {
    return { title: label, elements: [...base(`${name}: Curve Handle`), circle(100, 155, 5, blue), circle(220, 70, 5, orange), circle(360, 130, 5, red), circle(485, 72, 5, blue), path('M 100 155 C 190 25, 300 185, 485 72', orange, undefined, undefined), line(100, 155, 220, 70, slate, '4 2'), line(360, 130, 485, 72, slate, '4 2'), text(185, 50, 'control tangent', gray, 9), text(345, 170, 'smooth path', orange, 10)] };
  }
  return { title: label, elements: [...base(`${name}: Space Mapping`), rect(90, 75, 120, 82, blue), poly('330,58 500,92 455,170 302,138', orange), path('M 218 112 L 292 112', orange), text(150, 122, 'local space', blue, 10, 'middle'), text(402, 122, 'world/view space', orange, 10, 'middle'), text(120, 190, 'geometry changes coordinate frame', gray, 9)] };
};

const languageScene = (slug: string, label: string): DiagramConfig => {
  const runtime = slug.includes('cpp') ? 'manual memory' : slug.includes('rust') ? 'borrow checker' : slug.includes('csharp') ? 'managed engine' : slug.includes('python') ? 'tool scripts' : 'node scripts';
  return { title: label, elements: [...base(`${label}: Runtime Fit`), rect(74, 72, 118, 58, blue), text(133, 96, 'Gameplay', blue, 10, 'middle', 'bold'), rect(242, 54, 120, 94, orange), text(302, 88, runtime, orange, 10, 'middle', 'bold'), text(302, 110, 'trade-offs', gray, 9, 'middle'), rect(415, 72, 110, 58, red), text(470, 96, 'Engine ABI', red, 10, 'middle', 'bold'), path('M 195 101 L 236 101'), path('M 365 101 L 409 101'), text(86, 176, 'language choice shapes iteration speed, safety, and engine access', gray, 9)] };
};

const engineScene = (slug: string, label: string): DiagramConfig => {
  const center = slug.includes('unity') ? 'C# scene graph' : slug.includes('unreal') ? 'Blueprint + C++' : slug.includes('godot') ? 'node tree' : 'custom loop';
  return { title: label, elements: [...base(`${label}: Engine Loop`), circle(300, 115, 54, orange), text(300, 110, center, orange, 10, 'middle', 'bold'), text(300, 126, 'frame tick', gray, 9, 'middle'), rect(88, 66, 96, 42, blue), text(136, 91, 'Assets', blue, 10, 'middle'), rect(86, 142, 100, 42, red), text(136, 167, 'Physics', red, 10, 'middle'), rect(416, 66, 104, 42, blue), text(468, 91, 'Editor', blue, 10, 'middle'), rect(420, 142, 100, 42, red), text(470, 167, 'Export', red, 10, 'middle'), path('M 188 87 L 248 105'), path('M 188 162 L 248 128'), path('M 354 105 L 412 88'), path('M 354 128 L 416 162')] };
};

const physicsScene = (slug: string, label: string): DiagramConfig => {
  const main = slug.includes('buoyancy') ? 'upward water force' : slug.includes('friction') ? 'surface drag' : slug.includes('joint') ? 'constraint link' : slug.includes('inertia') ? 'spin resistance' : slug.includes('restitution') ? 'bounce energy' : slug.includes('mass-center') ? 'balance point' : slug.includes('angular') ? 'rotational speed' : slug.includes('linear') ? 'straight velocity' : slug.includes('acceleration') ? 'velocity change' : 'net force';
  return { title: label, elements: [...base(`${label}: Body State`), rect(235, 92, 104, 58, blue), circle(287, 121, 6, red), path('M 287 121 L 410 76', orange), path('M 287 121 L 173 158', red), line(235, 150, 339, 150, slate), text(420, 78, 'force', orange, 10), text(116, 165, main, red, 10), text(268, 172, 'mass body', blue, 9), text(90, 58, 'integrate per tick', gray, 9), path('M 110 70 C 170 42, 230 54, 258 88', blue, '4 2')] };
};

const collisionScene = (slug: string, label: string): DiagramConfig => {
  const detail = slug.includes('broad') ? 'many cheap bounds' : slug.includes('narrow') ? 'exact contact' : slug.includes('aabb') ? 'axis-aligned box' : slug.includes('obb') ? 'rotated box' : slug.includes('sat') ? 'separating axis' : slug.includes('gjk') ? 'support points' : slug.includes('epa') ? 'penetration depth' : slug.includes('bvh') || slug.includes('dbvt') ? 'tree of bounds' : slug.includes('sweep') ? 'sorted intervals' : 'shape overlap';
  return { title: label, elements: [...base(`${label}: Collision Test`), rect(98, 80, 128, 82, blue), poly('310,64 462,96 430,170 285,140', orange), circle(354, 118, 38, red), path('M 230 120 L 280 120', orange), text(162, 184, 'candidate A', blue, 9, 'middle'), text(377, 190, detail, orange, 9, 'middle'), line(84, 58, 520, 58, slate, '4 2'), text(88, 52, 'broad -> narrow -> contact manifold', gray, 9)] };
};

const graphicsScene = (slug: string, label: string): DiagramConfig => {
  if (slug.includes('ray')) return { title: label, elements: [...base(`${label}: Light Rays`), circle(94, 88, 18, amber), path('M 116 92 L 250 120'), path('M 250 120 L 420 66', blue), path('M 250 120 L 440 170', red), circle(250, 120, 26, blue), text(78, 136, 'camera / light', amber, 9), text(270, 116, 'hit', blue, 9), text(390, 55, 'reflection', blue, 9), text(405, 190, 'shadow ray', red, 9)] };
  if (slug.includes('raster')) return { title: label, elements: [...base(`${label}: Triangle to Pixels`), poly('110,158 220,62 332,158', orange), rect(392, 70, 118, 92, blue), ...[0,1,2,3].flatMap((i)=>[line(392+i*30,70,392+i*30,162,slate), line(392,70+i*23,510,70+i*23,slate)]), path('M 338 116 L 386 116'), text(155, 184, 'triangle coverage', orange, 9), text(430, 184, 'fragments', blue, 9)] };
  return { title: label, elements: [...base(`${label}: Pixel Recipe`), rect(70, 76, 96, 52, blue), text(118, 104, 'mesh', blue, 10, 'middle'), rect(226, 56, 110, 88, orange), text(281, 90, slug.includes('shader') ? 'shader code' : 'material data', orange, 10, 'middle'), rect(405, 76, 110, 52, red), text(460, 104, 'final pixel', red, 10, 'middle'), path('M 170 102 L 220 102'), path('M 340 102 L 398 102'), text(90, 176, `focus: ${short(label, 28)}`, gray, 9)] };
};

const lightScene = (slug: string, label: string): DiagramConfig => {
  const kind = slug.includes('directional') ? 'parallel rays' : slug.includes('point') ? 'radial bulb' : slug.includes('spot') ? 'cone beam' : slug.includes('cube') ? 'six faces' : slug.includes('shadow-map') ? 'depth map' : slug.includes('stencil') ? 'volume mask' : 'light volume';
  return { title: label, elements: [...base(`${label}: Illumination Shape`), circle(118, 82, 18, amber), path('M 138 88 L 380 70'), path('M 138 96 L 420 130'), path('M 138 104 L 360 178'), rect(360, 70, 92, 108, blue), poly('452,72 520,110 452,178', red), text(88, 128, kind, amber, 10), text(385, 194, 'receiver', blue, 9), text(468, 194, 'shadow area', red, 9)] };
};

const visibilityScene = (slug: string, label: string): DiagramConfig => ({
  title: label,
  elements: [...base(`${label}: What Survives Draw`), circle(90, 120, 10, blue), poly('110,82 420,50 420,190 110,158', orange), rect(255, 92, 62, 48, red), circle(372, 118, 22, blue), path('M 318 118 L 366 118', red, '4 2'), text(84, 145, 'camera', blue, 9), text(240, 82, slug.includes('fog') ? 'depth fade' : slug.includes('occluder') ? 'occluder' : slug.includes('frustum') ? 'frustum cone' : 'clip test', red, 9), text(366, 158, 'visible object', blue, 9)]
});

const apiScene = (slug: string, label: string): DiagramConfig => ({
  title: label,
  elements: [...base(`${label}: GPU Command Route`), rect(66, 76, 104, 54, blue), text(118, 99, slug.includes('hlsl') || slug.includes('glsl') ? 'shader source' : 'app calls', blue, 9, 'middle'), rect(238, 56, 118, 92, orange), text(297, 92, slug.includes('spirv') ? 'SPIR-V IR' : short(label, 16), orange, 10, 'middle', 'bold'), rect(430, 76, 94, 54, red), text(477, 99, 'GPU queue', red, 10, 'middle'), path('M 174 103 L 232 103'), path('M 360 103 L 424 103'), text(90, 178, 'API differences change portability, driver work, and graphics features', gray, 9)]
});

const aiScene = (slug: string, label: string): DiagramConfig => {
  const evaluator = slug.includes('minimax') ? 'score tree' : slug.includes('mcts') ? 'rollouts' : slug.includes('fuzzy') ? 'soft rules' : slug.includes('markov') ? 'state odds' : slug.includes('neural') || slug.includes('deep') ? 'weights' : slug.includes('bayes') ? 'probability' : 'decision nodes';
  return { title: label, elements: [...base(`${label}: Decision Brain`), circle(112, 116, 26, blue), text(112, 120, 'sense', blue, 9, 'middle'), rect(224, 62, 150, 108, orange), text(299, 92, evaluator, orange, 10, 'middle', 'bold'), text(299, 116, short(label, 18), gray, 9, 'middle'), circle(486, 116, 28, red), text(486, 120, 'act', red, 10, 'middle'), path('M 140 116 L 218 116'), path('M 378 116 L 452 116'), path('M 486 148 C 420 190, 210 190, 112 146', blue, '4 2'), text(270, 198, 'feedback updates future choices', gray, 9)] };
};

const pbrScene = (slug: string, label: string): DiagramConfig => ({
  title: label,
  elements: [...base(`${label}: Material Light Model`), circle(95, 78, 18, amber), path('M 116 86 L 286 130'), rect(245, 115, 104, 42, blue), path('M 350 128 L 500 76', orange), path('M 350 134 L 500 164', red), text(250, 105, slug.includes('metal') ? 'metal surface' : slug.includes('transluc') ? 'translucent layer' : slug.includes('energy') ? 'energy budget' : 'micro surface', blue, 9), text(470, 62, slug.includes('rt') || slug.includes('optix') ? 'ray query' : 'reflected lobe', orange, 9), text(470, 184, 'absorbed / scattered', red, 9)]
});

const gameTopicsText = `
game-math-vector|Vector
game-math-matrix|Matrix
game-math-lin-trans|Linear Transformation
game-math-geometry|Geometry
game-math-affine-space|Affine Space
game-math-affine-trans|Affine Transformation
game-math-projection|Projection
game-math-orientation|Orientation
game-math-perspective|Perspective
game-math-quaternion|Quaternion
game-math-orthogonal|Orthogonal
game-math-euler|Euler Angle
game-math-spline|Spline
game-math-hermite|Hermite
game-math-bezier|Bezier
game-math-catmull|Catmull-Rom
game-lang-csharp|C#
game-lang-cpp|C/C++
game-lang-rust|Rust
game-lang-python|Python
game-lang-gdscript|GDScript
game-engine-unity|Unity 3D
game-engine-unreal|Unreal Engine
game-engine-native|Native
game-engine-godot|Godot
game-phys-mass-center|Center of Mass
game-phys-inertia|Moment of Inertia
game-phys-acceleration|Acceleration
game-phys-joints|Joints
game-phys-restitution|Restitution
game-phys-force|Force
game-phys-angular-vel|Angular Velocity
game-phys-buoyancy|Buoyancy
game-phys-friction|Friction
game-phys-linear-vel|Linear Velocity
game-phys-dynamics|Dynamics
game-phys-ccd|CCD
game-phys-narrow-phase|Narrow Phase
game-phys-broad-phase|Broad Phase
game-phys-obb|OBB
game-phys-aabb|AABB
game-phys-sat|SAT
game-phys-gjk|GJK
game-phys-epa|EPA
game-phys-intersection|Intersection
game-phys-convexity|Convexity
game-phys-convex|Convex
game-phys-concave|Concave
game-phys-convex-hull|Convex Hull
game-phys-convex-dec|Convex Decomposition
game-phys-sweep|Sort & Sweep
game-phys-dbvt|DBVT
game-phys-bvh|BVH
game-gfx-ray-tracing|Ray Tracing
game-gfx-rasterization|Rasterization
game-gfx-pipeline|Graphics Pipeline
game-gfx-sampling|Sampling
game-gfx-shader|Shader
game-gfx-rendering-eq|Rendering Equation
game-gfx-mapping|Mapping
game-gfx-reflection|Reflection
game-gfx-texture|Texture
game-gfx-diffuse|Diffuse
game-gfx-bump|Bump
game-gfx-specular|Specular
game-gfx-parallax|Parallax
game-gfx-horizon|Horizon
game-gfx-animation|Computer Animation
game-gfx-color|Color
game-gfx-perception|Visual Perception
game-gfx-tone|Tone Reproduction
game-light-shadow-map|Shadow Map
game-light-source|Light Source
game-light-2d|2D
game-light-cube|Cube
game-light-directional|Directional
game-light-spot|Spot
game-light-cascaded|Cascaded
game-light-infinite|Infinite
game-light-point|Point
game-light-stencil-shadow|Stencil Shadow
game-vis-occluder|Occluder
game-vis-culling|Culling
game-vis-clipping|Clipping
game-vis-fog|Fog
game-vis-frustum|Frustum
game-vis-polygon|Polygon
game-vis-light|Light
game-vis-polyhedron|Polyhedron
game-vis-shadow|Shadow
game-api-hlsl|HLSL
game-api-glsl|GLSL
game-api-spirv|SPIR-V
game-api-directx|DirectX
game-api-opengl|OpenGL
game-api-vulkan|Vulkan
game-api-opengles|OpenGL ES
game-api-metal|Metal
game-api-webgl|WebGL
game-ai-decision-tree|Decision Tree
game-ai-state-machine|State Machine
game-ai-behavior-tree|Behavior Tree
game-ai-fuzzy|Fuzzy Logic
game-ai-markov|Markov System
game-ai-goal-oriented|Goal Oriented Behavior
game-ai-board-game|Board Game
game-ai-minimax|Minimax
game-ai-ab-pruning|AB Pruning
game-ai-mcts|MCTS
game-ai-naive-bayes|Naive Bayes Classifier
game-ai-decision-learning|Decision Learning
game-ai-reinforcement|Reinforcements Learning
game-ai-dt-learning|Decision Tree Learning
game-ai-deep-learning|Deep Learning
game-ai-neural-net|Artificial Neural Network
game-adv-microsurface|Microsurface Scattering
game-adv-translucency|Translucency & Transparency
game-adv-energy-cons|Conservation of Energy
game-adv-metallicity|Metallicity
game-adv-dx-rt|DirectX Ray Tracing
game-adv-vulkan-rt|Vulkan Ray Tracing
game-adv-optix|OptiX
`;

const makeGameDiagram = (slug: string, label: string): DiagramConfig => {
  if (slug.startsWith('game-math-')) return mathScene(slug, label);
  if (slug.startsWith('game-lang-')) return languageScene(slug, label);
  if (slug.startsWith('game-engine-')) return engineScene(slug, label);
  if (/^game-phys-(ccd|narrow|broad|obb|aabb|sat|gjk|epa|intersection|convex|concave|sweep|dbvt|bvh)/.test(slug)) return collisionScene(slug, label);
  if (slug.startsWith('game-phys-')) return physicsScene(slug, label);
  if (slug.startsWith('game-gfx-')) return graphicsScene(slug, label);
  if (slug.startsWith('game-light-')) return lightScene(slug, label);
  if (slug.startsWith('game-vis-')) return visibilityScene(slug, label);
  if (slug.startsWith('game-api-')) return apiScene(slug, label);
  if (slug.startsWith('game-ai-')) return aiScene(slug, label);
  if (slug.startsWith('game-adv-')) return pbrScene(slug, label);
  return boxFlow(titleCase(slug), ['Concept', 'Mechanic', 'Trade-off', 'Output'], ['Game developer topic illustration.']);
};

const gameDiagrams = new Map<string, DiagramConfig>(
  gameTopicsText.trim().split('\n').map((row) => {
    const [slug, label] = row.split('|');
    return [slug, makeGameDiagram(slug, label)] as const;
  })
);

const backendTopicsText = `
lang-javascript|JavaScript
lang-go|Go
lang-python|Python
lang-ruby|Ruby
lang-java|Java
lang-csharp|C#
lang-php|PHP
lang-rust|Rust
checkpoint-beginner-projects|Checkpoint - Beginner Project Ideas
internet-how-works-sub|How does the internet work?
what-is-http|What is HTTP?
what-is-domain-name|What is Domain Name?
what-is-hosting|What is hosting?
dns-how-works|DNS and how it works?
browsers-how-works|Browsers and how they work?
frontend-html|HTML Basics
frontend-css|CSS Basics
frontend-javascript|JavaScript Basics
git-vcs|Git VCS
github-hosting|GitHub
gitlab-hosting|GitLab
db-mysql|MySQL
db-postgresql|PostgreSQL
db-mariadb|MariaDB
db-sqlite|SQLite
db-mssql|MS SQL
db-oracle|Oracle
db-migrations|Database Migrations
n-plus-one-problem|N+1 Query Problem
api-style-rest|REST APIs
api-style-json|JSON APIs
api-style-soap|SOAP APIs
api-style-grpc|gRPC
api-style-graphql|GraphQL
openapi-specs|OpenAPI Specifications
auth-jwt|JWT
auth-oauth|OAuth
auth-basic|Basic Authentication
auth-token|Token Authentication
auth-cookie|Cookie Based Auth
auth-openid|OpenID Connect
auth-saml|SAML
checkpoint-intermediate-projects|Checkpoint - Intermediate Project Ideas
sec-https|HTTPS/TLS
sec-owasp|OWASP Risks
sec-cors|CORS
sec-ssl-tls|SSL/TLS
sec-csp|CSP
sec-server-security|Server Security
sec-api-best-practices|API Security Best Practices
hash-md5|MD5
hash-sha|SHA-256
hash-scrypt|scrypt
hash-bcrypt|bcrypt
cache-redis|Redis
cache-memcached|Memcached
cache-http|HTTP Caching
server-nginx|Nginx
server-apache|Apache
server-caddy|Caddy
server-iis|MS IIS
ai-llm-workings|How LLMs work
ai-vs-traditional|AI vs Traditional Coding
ai-embeddings|Embeddings
ai-vectors|Vectors
ai-rags|RAGs
tool-claude-code|Claude Code
tool-cursor|Cursor
tool-copilot|Copilot
tool-antigravity|Antigravity
ai-app-code-reviews|Code Reviews
ai-app-refactoring|Refactoring
ai-app-docs|Documentation Generation
ai-app-streaming|Streaming
ai-app-structured-outputs|Structured Outputs
prompt-techniques|Prompting Techniques
agent-architecture|Agents
mcp-protocol|MCP
agent-skills|Skills
agent-roadmap|AI Agents Roadmap
provider-gemini|Gemini
provider-openai|OpenAI
provider-anthropic|Anthropic
cicd-integration|Continuous Integration
cicd-deployment|Continuous Deployment
test-integration|Integration Testing
test-unit|Unit Testing
test-functional|Functional Testing
db-transactions|Database Transactions
db-orms|ORMs
db-acid|ACID Properties
db-normalization-advanced|Database Normalization
db-failure-modes|Failure Modes
db-performance-profiling|Profiling Performance
container-docker|Docker
container-lxc|LXC
orch-kubernetes|Kubernetes
broker-kafka|Kafka
broker-rabbitmq|RabbitMQ
pattern-monolith|Monolith
pattern-microservices|Microservices
pattern-soa|SOA
pattern-serverless|Serverless
pattern-service-mesh|Service Mesh
pattern-twelve-factor|Twelve Factor Apps
search-elasticsearch|Elasticsearch
search-solr|Solr
realtime-sse|Server Sent Events
realtime-websockets|WebSockets
realtime-polling|Long / Short Polling
scale-db-indexes|Database Indexes
scale-data-replication|Data Replication
scale-sharding|Sharding Strategies
scale-cap-theorem|CAP Theorem
nosql-firebase|Firebase
nosql-rethinkdb|RethinkDB
nosql-mongodb|MongoDB
nosql-couchdb|CouchDB
nosql-redis|Redis
nosql-dynamodb|DynamoDB
nosql-clickhouse|ClickHouse
nosql-cassandra|Cassandra
nosql-scylladb|ScyllaDB
nosql-neo4j|Neo4j
nosql-neptune|AWS Neptune
nosql-dgraph|DGraph
nosql-influxdb|Influx DB
nosql-timescaledb|TimescaleDB
scale-obs-core|Observability Core Concepts
scale-obs-instrumentation|Instrumentation
scale-obs-monitoring|Monitoring
scale-obs-telemetry|Telemetry
mit-graceful|Graceful Degradation
mit-throttling|Throttling
mit-backpressure|Backpressure
mit-loadshifting|Loadshifting
mit-circuit|Circuit Breaker
`;

const androidTopicsText = `
android-lang-kotlin|Kotlin
android-lang-java|Java
android-git|Git
android-github|GitHub
android-bitbucket|Bitbucket
android-gitlab|GitLab
android-ide|Development IDE
android-kotlin-basics|Basics of Kotlin
android-oop-basics|Basics of OOP
android-dsa-basics|Data Structures and Algorithms
android-gradle|What is and how to use Gradle?
android-hello-world|Create a Basic Hello World App
android-activity-lifecycle|Activity LifeCycle
android-state-changes|State Changes
android-tasks-backstack|Tasks & Backstack
android-implicit-intents|Implicit Intents
android-explicit-intents|Explicit Intents
android-intent-filters|Intent Filters
android-content-provider|Content Provider
android-broadcast-receiver|Broadcast Receiver
compose-column-row|Column / Row
compose-lazy-column-row|Lazy Column / Row
compose-box|Box
compose-scaffold|Scaffold
compose-constraint-layout|ConstraintLayout
compose-text|Text Element
compose-button|Button Element
compose-icon|Icon Element
compose-image|Image Element
compose-textfield|TextField Element
compose-card|Card Element
compose-bottomsheet|BottomSheet
compose-tabrow|TabRow
compose-dialog|Dialog
compose-animations|Animations
compose-drawer|Drawer
compose-navhost|NavHost
compose-remember-state|remember / State
compose-viewmodel-state|ViewModel state
compose-side-effects|Side effects
xml-textview|TextView
xml-imageview|ImageView
xml-fragments|Fragments
xml-recyclerview|RecyclerView
xml-constraint|ConstraintLayout XML
android-jetpack-compose-core|Jetpack Compose Layout
android-app-shortcuts|App Shortcuts
android-navigation-core|Navigation Components
arch-mvi|MVI
arch-mvvm|MVVM
arch-mvp|MVP
arch-mvc|MVC
pattern-android-repository|Repository Pattern
pattern-android-builder|Builder Pattern
pattern-android-factory|Factory Pattern
pattern-android-observer|Observer Pattern
pattern-android-flow|Flow
pattern-android-rxkotlin|RxKotlin
pattern-android-rxjava|RxJava
pattern-android-livedata|LiveData
di-dagger|Dagger
di-hilt|Hilt
di-koin|Koin
storage-shared-preferences|Shared Preferences
storage-datastore|DataStore
storage-room|Room Database
storage-filesystem|File System
android-security-keystore|Cryptography / Keystore
network-retrofit|Retrofit
network-okhttp|OkHttp
network-apollo|Apollo-Android
android-logger-timber|Timber
android-leakcanary|Leak Canary
android-chucker|Chucker
android-benchmark|Jetpack Benchmark
async-coroutines|Coroutines
async-threads|Threads
async-rxjava|RxJava Async
async-rxkotlin|RxKotlin Async
async-workmanager|WorkManager
test-espresso|Espresso
test-junit|JUnit
lint-ktlint|Ktlint
lint-detekt|Detekt
android-adb-debugging|Android Debug Bridge / Profiler
service-firebase-auth|Authentication
service-crashlytics|Crashlytics
service-remote-config|Remote Config
service-cloud-messaging|Cloud Messaging
service-firestore|FireStore
service-firebase-core|Firebase SDK
service-admob|Google Admob
service-play-services|Google Play Services
service-maps|Google Maps
dist-signed-apk|Signed APK
dist-firebase|Firebase Distribution
dist-playstore|Google Playstore
`;

const fullStackTopicsText = `
html-semantics|HTML Structure & Semantics
css-layouts|CSS Layouts & Responsive Design
checkpoint-static|Checkpoint - Static Webpages
javascript-basics|JavaScript Syntax & DOM
npm-ecosystem|npm & Package Ecosystem
checkpoint-interactivity|Checkpoint - Interactivity
git-version-control|Git Version Control
github-collaboration|GitHub Collaboration
checkpoint-collaborative|Checkpoint - Collaborative Work
checkpoint-external-packages|Checkpoint - External Packages
react-components|React Components & Hooks
tailwind-css|Tailwind CSS Utility Styling
checkpoint-frontend-apps|Checkpoint - Frontend Apps
node-js-runtime|Node.js Runtime Engine
checkpoint-cli-apps|Checkpoint - CLI Apps
postgresql-databases|PostgreSQL Relational DB
checkpoint-crud-apps|Checkpoint - Simple CRUD Apps
restful-api-design|RESTful API Patterns
jwt-authentication|JWT Secure Authentication
redis-caching|Redis Distributed Cache
checkpoint-complete-app|Checkpoint - Complete App
linux-cli-basics|Linux Command Line Basics
basic-aws-services|Basic AWS Services (EC2, S3, VPC)
checkpoint-deployment|Checkpoint - Deployment
mesh-like-structures|Mesh-like Structures & Topologies
ansible-configuration|Ansible Automations
terraform-iac|Terraform IaC Provisions
checkpoint-automation|Checkpoint - Automation
checkpoint-infrastructure|Checkpoint - Infrastructure
github-actions-cicd|GitHub Actions CI/CD
monit-monitoring|Monit Health Monitoring
checkpoint-cicd|Checkpoint - CI/CD
checkpoint-monitoring|Checkpoint - Monitoring
`;

const mlTopicsText = `
what-is-ml-engineer|What is an ML Engineer?
ml-vs-ai-engineer|ML Engineer vs AI Engineer
ml-skills|Skills and Responsibilities
partial-derivative-slopes|Derivatives & Partial Derivatives
chain-rule-derivation|Chain rule of derivation
gradient-jacobian-hessian|Gradient, Jacobian & Hessian
discrete-mathematics-basics|Discrete Mathematics Basics
matrix-multiplication-gradients|Matrix & Matrix Operations
scalars-vectors-tensors|Scalars, Vectors & Tensors
singular-value-decomposition|Singular Value Decomposition
determinants-matrix-inverse|Determinants & Inverse of Matrix
eigenvalues-diagonalization|Eigenvalues & Diagonalization
probability-basics|Basics of Probability
bayesian-probability-tables|Bayes Theorem
random-variances-pdfs|Random Variances & PDFs
distribution-types|Types of Distribution
stats-basics|Basic Concepts of Statistics
descriptive-statistics|Descriptive Statistics
graphs-charts|Graphs & Charts
inferential-statistics|Inferential Statistics
python-basic-syntax|Basic Syntax & Structure
python-variables-types|Variables and Data Types
python-data-structures|Data Structures
python-loops|Loops
python-conditionals|Conditionals
python-exceptions|Exceptions
python-functions|Functions & Built-ins
oop-class-inheritance-stubs|OOP Class Design
numpy-arrays|Numpy
pandas-dataframes|Pandas
matplotlib-plots|Matplotlib
seaborn-visualization|Seaborn
databases-sql-nosql|Databases (SQL & NoSQL)
internet-data-source|Internet Data Source
apis-data-extraction|APIs & Data Extraction
mobile-apps-data|Mobile Apps Data
iot-devices-data|IoT Devices Data
csv-format|CSV Format
excel-format|Excel Format
json-format|JSON Format
parquet-format|Parquet Format
other-data-formats|Other Data Formats
data-cleaning|Data Cleaning
feature-engineering|Feature Engineering
feature-scaling|Feature Scaling & Normalization
pca-dimension-projection-matrices|Dimensionality Reduction
feature-selection|Feature Selection
what-is-machine-learning|What is Machine Learning?
supervised-learning-paradigm|Supervised Learning Paradigm
unsupervised-learning-paradigm|Unsupervised Learning Paradigm
semi-supervised-learning-paradigm|Semi-supervised Learning Paradigm
self-supervised-learning-paradigm|Self-supervised Learning Paradigm
reinforcement-learning-paradigm|Reinforcement Learning Paradigm
scikit-learn-data-loading|Data Loading
train-test-split|Train - Test Data Split
scikit-learn-data-preparation|Data Preparation
scikit-learn-model-selection|Model Selection
scikit-learn-hyperparameter-tuning|Hyperparameter Tuning
scikit-learn-prediction|Model Prediction
what-is-supervised-learning|What is Supervised Learning?
k-nearest-neighbors|K-Nearest Neighbors (KNN)
logistic-regression-sigmoids|Logistic Regression
svm-hyper-plane-margin-offsets|Support Vector Machines
decision-trees-entropy-splits|Decision Trees & Random Forest
gradient-boosting-tree-iterations|Gradient Boosting Machines
linear-regression-estimation|Linear Regression
polynomial-regression|Polynomial Regression
lasso-regularization|Lasso Regression
ridge-regularization|Ridge Regression
elasticnet-regularization|ElasticNet Regularization
what-is-unsupervised-learning|What is Unsupervised Learning?
k-means-clustering-centers|K-Means Clustering
exclusive-clustering|Exclusive Clustering
overlapping-clustering|Overlapping Clustering
hierarchical-clustering|Hierarchical Clustering
probabilistic-clustering|Probabilistic Clustering
pca-dimension-projection-matrices|Principal Component Analysis
autoencoders-dimension-compression|Autoencoders
what-is-model-evaluation|What is Model Evaluation?
why-evaluation-important|Why is it important?
accuracy-metric|Accuracy
precision-metric|Precision
recall-metric|Recall
f1-score-metric|F1-Score
roc-auc-metric|ROC-AUC
log-loss-metric|Log Loss
confusion-matrix|Confusion Matrix
`;

const aiDataTopicsText = `
mathematics-for-machine-learning|Mathematics for Machine Learning
algebra-differential-calculus|Coursera: Algebra and Differential Calculus
introduction-to-statistics|Coursera: Introduction to Statistics
hypothesis-testing|Coursera: Hypothesis Testing
probability-and-statistics|Coursera: Probability and Statistics
practitioners-guide-statistical-tests|Practitioner's Guide to Statistical Tests
experiment-design|Experiment Design Article
minimum-detectable-effect|Minimum Detectable Effect
improving-test-sensitivity|Paper: Improving Test Sensitivity
improving-sensitivity-cuped|Paper: Improving Sensitivity (CUPED)
cuped-at-booking|CUPED at Booking.com
doordash-cupac|Doordash: CUPAC
netflix-stratification|Netflix: Stratification
microsoft-delta-method|Microsoft: Delta Method in Metric Analytics
ratio-metrics|Paper: Ratio Metrics
fundamentals-of-econometrics|Fundamentals of Econometrics
intro-to-econometrics|Intro to Econometrics
econometrics-course|Coursera: Econometrics
learn-time-series|Kaggle: Learn Time Series
time-series-basics|Kaggle: Time Series Basics
arima-model-for-time-series|ARIMA model for Time Series
time-series-models|Time Series Models
forecasting-task-with-solution|Forecasting Task with Solution
linear-regression-econ|Coursera: Linear Regression
learn-python-kaggle|Learn Python: Kaggle
googles-python-class|Google's Python Class
algorithmic-exercises|Algorithmic Exercises
study-plans-leetcode|Study Plans - Leetcode
algorithms-specialization|Algorithms Specialization
sql-tutorial-course|SQL Tutorial
exploratory-data-analysis-with-python-and-pandas|Exploratory Data Analysis with Python and Pandas
exploratory-data-analysis-for-machine-learning|Exploratory Data Analysis for Machine Learning
exploratory-data-analysis-with-seaborn|Exploratory Data Analysis with Seaborn
open-machine-learning-course|Open Machine Learning Course - Open Data Science
machine-learning-specialization|Machine Learning Specialization
pattern-recognition-ml|Pattern Recognition & ML by Christopher m. Bishop
pattern-recognition-github|GitHub repository with notes & code from the eBook above
deep-learning-specialization|Deep Learning Specialization
deep-learning-book|Deep Learning Book
attention-is-all-you-need|Attention is all you need
illustrated-transformer|The Illustrated Transformer
mlops-specialization|MLOps Specialization
google-ai-courses|Google AI Courses
hugging-face-nlp|Hugging Face NLP
prompt-engineering-guide|Prompt Engineering Guide
rag-for-knowledge-intensive-nlp-tasks|RAG for Knowledge - Intensive NLP Tasks
vibe-coding-fundamentals|Vibe Coding Fundamentals
claude-code-docs|Claude Code
agentic-coding-handbook|Agentic Coding Handbook
`;

type CuratedDomain = 'Backend' | 'Android' | 'Full Stack' | 'ML' | 'AI/Data';
const hashSlug = (slug: string): number => {
  let value = 0;
  for (const char of slug) value = (value * 31 + char.charCodeAt(0)) % 9973;
  return value;
};

const cleanLabel = (label: string): string => short(label.replace(/\?/g, ''), 24);

const domainTerms = (slug: string, label: string, domain: CuratedDomain): [string, string, string, string] => {
  const topic = cleanLabel(label);
  if (domain === 'Android') {
    if (slug.startsWith('compose-')) return ['Composable', topic, 'State', 'Preview'];
    if (slug.startsWith('xml-')) return ['XML View', topic, 'Adapter', 'Screen'];
    if (slug.startsWith('arch-')) return ['View', topic, 'State', 'Model'];
    if (slug.startsWith('pattern-')) return ['Caller', topic, 'Contract', 'Result'];
    if (slug.startsWith('di-')) return ['Module', topic, 'Graph', 'Instance'];
    if (slug.startsWith('storage-')) return ['Entity', topic, 'Disk', 'Query'];
    if (slug.startsWith('network-')) return ['Request', topic, 'Client', 'Response'];
    if (slug.startsWith('async-')) return ['Work', topic, 'Scheduler', 'Result'];
    if (slug.startsWith('test-') || slug.startsWith('lint-')) return ['Code', topic, 'Check', 'Report'];
    if (slug.startsWith('service-')) return ['App', topic, 'Cloud', 'Event'];
    if (slug.startsWith('dist-')) return ['Build', topic, 'Track', 'Release'];
    return ['App', topic, 'Android OS', 'User'];
  }
  if (domain === 'Full Stack') {
    if (slug.includes('html') || slug.includes('css') || slug.includes('javascript') || slug.includes('react') || slug.includes('tailwind') || slug.includes('frontend')) return ['Markup', topic, 'Component', 'Browser'];
    if (slug.includes('node') || slug.includes('api') || slug.includes('jwt') || slug.includes('redis') || slug.includes('postgresql') || slug.includes('crud')) return ['Request', topic, 'Service', 'Response'];
    if (slug.includes('git') || slug.includes('github') || slug.includes('npm') || slug.includes('package')) return ['Change', topic, 'Repo', 'Team'];
    if (slug.includes('linux') || slug.includes('aws') || slug.includes('deployment') || slug.includes('mesh')) return ['Traffic', topic, 'Cloud', 'Service'];
    if (slug.includes('ansible') || slug.includes('terraform') || slug.includes('actions') || slug.includes('monit') || slug.includes('cicd') || slug.includes('monitoring') || slug.includes('infrastructure')) return ['Commit', topic, 'Pipeline', 'Release'];
    return ['Client', topic, 'Server', 'User'];
  }
  if (domain === 'ML') {
    if (slug.includes('derivative') || slug.includes('gradient') || slug.includes('matrix') || slug.includes('vector') || slug.includes('tensor') || slug.includes('eigen') || slug.includes('svd') || slug.includes('probability') || slug.includes('bayes') || slug.includes('distribution') || slug.includes('stats')) return ['Data', topic, 'Formula', 'Signal'];
    if (slug.includes('python') || slug.includes('numpy') || slug.includes('pandas') || slug.includes('matplotlib') || slug.includes('seaborn') || slug.includes('csv') || slug.includes('excel') || slug.includes('json') || slug.includes('parquet')) return ['Raw Data', topic, 'Frame', 'Feature'];
    if (slug.includes('cleaning') || slug.includes('feature') || slug.includes('scaling') || slug.includes('pca') || slug.includes('dimension')) return ['Dataset', topic, 'Feature Space', 'Model Input'];
    if (slug.includes('supervised') || slug.includes('unsupervised') || slug.includes('regression') || slug.includes('neighbors') || slug.includes('svm') || slug.includes('trees') || slug.includes('boosting') || slug.includes('clustering') || slug.includes('autoencoders')) return ['Features', topic, 'Model', 'Prediction'];
    if (slug.includes('accuracy') || slug.includes('precision') || slug.includes('recall') || slug.includes('score') || slug.includes('auc') || slug.includes('loss') || slug.includes('confusion') || slug.includes('evaluation')) return ['Labels', topic, 'Score', 'Decision'];
    if (slug.includes('scikit') || slug.includes('train-test') || slug.includes('model-selection') || slug.includes('tuning') || slug.includes('prediction')) return ['Dataset', topic, 'Training Loop', 'Prediction'];
    return ['Dataset', topic, 'Training', 'Output'];
  }
  if (domain === 'AI/Data') {
    if (slug.includes('math') || slug.includes('calculus') || slug.includes('statistics') || slug.includes('hypothesis') || slug.includes('probability')) return ['Sample', topic, 'Estimator', 'Insight'];
    if (slug.includes('experiment') || slug.includes('detectable') || slug.includes('sensitivity') || slug.includes('cuped') || slug.includes('cupac') || slug.includes('stratification') || slug.includes('delta') || slug.includes('ratio')) return ['Users', topic, 'Metric', 'Decision'];
    if (slug.includes('econometrics') || slug.includes('time-series') || slug.includes('arima') || slug.includes('forecasting') || slug.includes('regression')) return ['History', topic, 'Forecast', 'Plan'];
    if (slug.includes('python') || slug.includes('leetcode') || slug.includes('algorithm') || slug.includes('sql') || slug.includes('eda') || slug.includes('exploratory') || slug.includes('seaborn')) return ['Table', topic, 'Notebook', 'Chart'];
    if (slug.includes('machine-learning') || slug.includes('pattern-recognition') || slug.includes('deep-learning') || slug.includes('attention') || slug.includes('transformer')) return ['Features', topic, 'Neural Layers', 'Prediction'];
    if (slug.includes('mlops') || slug.includes('prompt') || slug.includes('rag') || slug.includes('hugging') || slug.includes('google-ai') || slug.includes('vibe') || slug.includes('claude') || slug.includes('agentic')) return ['Context', topic, 'Model', 'Answer'];
    return ['Data', topic, 'Analysis', 'Result'];
  }
  if (slug.startsWith('lang-')) return ['Request', topic, 'Runtime', 'Response'];
  if (slug.startsWith('db-') || slug.includes('sql') || slug.startsWith('nosql-')) return ['Schema', topic, 'Index', 'Query'];
  if (slug.startsWith('api-') || slug === 'openapi-specs') return ['Client', topic, 'Contract', 'Service'];
  if (slug.startsWith('auth-') || slug.startsWith('sec-') || slug.startsWith('hash-')) return ['Credential', topic, 'Policy', 'Resource'];
  if (slug.startsWith('cache-') || slug.startsWith('server-')) return ['Client', topic, 'Cache', 'Origin'];
  if (slug.startsWith('ai-') || slug.startsWith('tool-') || slug.startsWith('prompt-') || slug.startsWith('agent-') || slug.startsWith('provider-') || slug.startsWith('mcp-')) return ['Prompt', topic, 'Tool', 'Code'];
  if (slug.startsWith('cicd-') || slug.startsWith('test-')) return ['Commit', topic, 'Check', 'Deploy'];
  if (slug.startsWith('container-') || slug.startsWith('orch-') || slug.startsWith('broker-')) return ['Service', topic, 'Queue', 'Worker'];
  if (slug.startsWith('pattern-') || slug.startsWith('realtime-') || slug.startsWith('search-')) return ['Gateway', topic, 'Stream', 'Client'];
  if (slug.startsWith('scale-') || slug.startsWith('mit-')) return ['Load', topic, 'Guard', 'Fallback'];
  return ['Input', topic, 'System', 'Output'];
};

const variedScene = (slug: string, label: string, domain: CuratedDomain): DiagramConfig => {
  const h = hashSlug(slug);
  const variant = h % 12;
  const accent = [amber, blue, orange, red][h % 4];
  const [a, b, c, d] = domainTerms(slug, label, domain);
  const title = domain + ': ' + cleanLabel(label);
  const offset = h % 18;

  if (variant === 0) {
    return { title, elements: [...base(title, accent), rect(70, 72, 108, 58, blue), text(124, 101, a, blue, 9, 'middle', 'bold'), rect(238, 52, 124, 94, orange), text(300, 91, b, orange, 10, 'middle', 'bold'), rect(430, 72, 98, 58, red), text(479, 101, d, red, 9, 'middle', 'bold'), path('M 182 102 L 232 102'), path('M 366 102 L 424 102'), text(90, 178, b + ' sits between ' + a + ' and ' + d, gray, 9)] };
  }
  if (variant === 1) {
    return { title, elements: [...base(title, accent), circle(300, 112, 58, orange), text(300, 108, b, orange, 10, 'middle', 'bold'), text(300, 126, c, gray, 9, 'middle'), rect(72, 70, 104, 42, blue), text(124, 96, a, blue, 9, 'middle'), rect(424, 70, 104, 42, red), text(476, 96, d, red, 9, 'middle'), rect(246, 168, 108, 34, blue), text(300, 190, 'state/result', blue, 9, 'middle'), path('M 180 91 L 242 106'), path('M 358 106 L 420 91'), path('M 300 154 L 300 164')] };
  }
  if (variant === 2) {
    return { title, elements: [...base(title, accent), rect(92, 58, 116, 116, blue), rect(244, 78, 116, 78, orange), rect(396, 98, 110, 58, red), text(150, 88, a, blue, 9, 'middle'), text(302, 110, b, orange, 9, 'middle', 'bold'), text(451, 130, d, red, 9, 'middle'), path('M 210 116 C 236 76, 260 70, 286 80', orange), path('M 362 118 C 384 94, 400 94, 424 106', red), text(90, 198, 'layered path: ' + a + ' -> ' + b + ' -> ' + d, gray, 9)] };
  }
  if (variant === 3) {
    return { title, elements: [...base(title, accent), line(84, 164, 510, 164, slate), circle(120 + offset, 132, 20, blue), circle(244, 96, 20, orange), circle(366, 132, 20, red), circle(482 - offset, 96, 20, blue), path('M ' + (140 + offset) + ' 132 L 222 100'), path('M 266 100 L 344 128'), path('M 388 128 L ' + (460 - offset) + ' 100'), text(120 + offset, 138, a, blue, 8, 'middle'), text(244, 102, b, orange, 8, 'middle'), text(366, 138, c, red, 8, 'middle'), text(482 - offset, 102, d, blue, 8, 'middle'), text(92, 190, 'route map with handoff points', gray, 9)] };
  }
  if (variant === 4) {
    return { title, elements: [...base(title, accent), poly('105,148 184,72 260,148', blue), poly('330,72 508,92 456,168 300,148', orange), path('M 265 126 L 296 126'), text(174, 168, a, blue, 9, 'middle'), text(402, 188, b, orange, 9, 'middle'), line(330, 72, 456, 168, slate, '4 2'), line(508, 92, 300, 148, slate, '4 2'), text(82, 56, c + ' checks the boundary', gray, 9)] };
  }
  if (variant === 5) {
    return { title, elements: [...base(title, accent), rect(88, 68, 78, 124, blue), rect(196, 48, 78, 144, orange), rect(304, 82, 78, 110, red), rect(412, 60, 78, 132, blue), text(127, 134, a, blue, 8, 'middle'), text(235, 124, b, orange, 8, 'middle'), text(343, 140, c, red, 8, 'middle'), text(451, 132, d, blue, 8, 'middle'), path('M 166 122 L 190 122'), path('M 274 122 L 298 122'), path('M 382 122 L 406 122'), text(86, 212, 'pipeline bars show changing responsibility per step', gray, 9)] };
  }
  if (variant === 6) {
    return { title, elements: [...base(title, accent), circle(178, 116, 54, blue), circle(306, 116, 54, orange), circle(434, 116, 54, red), text(178, 108, a, blue, 9, 'middle', 'bold'), text(306, 108, b, orange, 9, 'middle', 'bold'), text(434, 108, d, red, 9, 'middle', 'bold'), text(306, 136, c, gray, 8, 'middle'), line(230, 116, 254, 116, slate, '3 3'), line(358, 116, 382, 116, slate, '3 3'), text(112, 190, 'overlapping roles share state without being the same box', gray, 9)] };
  }
  if (variant === 7) {
    return { title, elements: [...base(title, accent), rect(78, 78, 118, 46, blue), text(137, 105, a, blue, 9, 'middle'), path('M 198 102 C 250 32, 352 32, 402 102', orange), rect(402, 78, 118, 46, red), text(461, 105, d, red, 9, 'middle'), circle(300, 62, 20, orange), text(300, 67, b, orange, 8, 'middle'), path('M 402 124 C 352 196, 246 196, 198 124', blue, '4 2'), text(250, 184, c, gray, 9, 'middle')] };
  }
  if (variant === 8) {
    return { title, elements: [...base(title, accent), rect(102, 62, 398, 104, slate), line(202, 62, 202, 166, blue), line(302, 62, 302, 166, orange), line(402, 62, 402, 166, red), text(152, 100, a, blue, 8, 'middle'), text(252, 130, b, orange, 8, 'middle'), text(352, 100, c, red, 8, 'middle'), text(452, 130, d, blue, 8, 'middle'), path('M 126 182 L 474 182', orange), text(300, 202, 'timeline / lifecycle progression', gray, 9, 'middle')] };
  }
  if (variant === 9) {
    return { title, elements: [...base(title, accent), circle(300, 118, 18, orange), ...[0, 1, 2, 3, 4].map((i) => circle(300 + Math.cos(i * 1.256) * 105, 118 + Math.sin(i * 1.256) * 62, 17, i % 2 ? blue : red)), ...[0, 1, 2, 3, 4].map((i) => line(300, 118, 300 + Math.cos(i * 1.256) * 88, 118 + Math.sin(i * 1.256) * 52, slate, '3 3')), text(300, 123, b, orange, 8, 'middle'), text(72, 190, a + ', ' + c + ', and ' + d + ' connect around the central concern', gray, 9)] };
  }
  if (variant === 10) {
    return { title, elements: [...base(title, accent), rect(78, 60, 128, 102, blue), text(142, 88, a, blue, 9, 'middle'), text(142, 116, 'before', gray, 8, 'middle'), rect(394, 60, 128, 102, red), text(458, 88, d, red, 9, 'middle'), text(458, 116, 'after', gray, 8, 'middle'), path('M 210 112 C 260 62, 340 62, 390 112', orange), circle(300, 86, 24, orange), text(300, 91, b, orange, 8, 'middle'), text(188, 190, c + ' changes the system state', gray, 9)] };
  }
  return { title, elements: [...base(title, accent), poly('80,116 150,68 220,116 150,164', blue), poly('246,116 316,68 386,116 316,164', orange), poly('412,116 482,68 552,116 482,164', red), text(150, 121, a, blue, 8, 'middle'), text(316, 121, b, orange, 8, 'middle'), text(482, 121, d, red, 8, 'middle'), path('M 224 116 L 240 116'), path('M 390 116 L 406 116'), text(84, 194, 'diamond decisions: ' + b + ' controls ' + c, gray, 9)] };
};
const mapRows = (rows: string, domain: CuratedDomain): Map<string, DiagramConfig> => new Map(
  rows.trim().split('\n').map((row) => {
    const [slug, label] = row.split('|');
    return [slug, variedScene(slug, label, domain)] as const;
  })
);

const backendDiagrams = mapRows(backendTopicsText, 'Backend');
const androidDiagrams = mapRows(androidTopicsText, 'Android');
const fullStackDiagrams = mapRows(fullStackTopicsText, 'Full Stack');
const mlDiagrams = mapRows(mlTopicsText, 'ML');
const aiDataDiagrams = mapRows(aiDataTopicsText, 'AI/Data');

export const getCuratedRoadmapDiagram = (slug: string): DiagramConfig | undefined => {
  const gameDiagram = gameDiagrams.get(slug);
  if (gameDiagram) return gameDiagram;
  const backendDiagram = backendDiagrams.get(slug);
  if (backendDiagram) return backendDiagram;
  const androidDiagram = androidDiagrams.get(slug);
  if (androidDiagram) return androidDiagram;
  const fullStackDiagram = fullStackDiagrams.get(slug);
  if (fullStackDiagram) return fullStackDiagram;
  const mlDiagram = mlDiagrams.get(slug);
  if (mlDiagram) return mlDiagram;
  const aiDataDiagram = aiDataDiagrams.get(slug);
  if (aiDataDiagram) return aiDataDiagram;
  return undefined;
};

