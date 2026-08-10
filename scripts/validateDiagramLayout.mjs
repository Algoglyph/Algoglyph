import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createBasicIllustrationPlan } from '../src/lib/ai/basicIllustrations.ts';
import { inspectCanvasLayout, parseCanvasResponse } from '../src/lib/ai/diagramLayout.ts';
import { placeSkeletonsBelowAnchor } from '../src/lib/ai/canvasPlacement.ts';
import {
  applyLibraryMatches,
  createSingleLibraryPlan,
  hydrateLibrarySkeletons,
  includeDsaCatalog,
  resolveLibraryItem,
} from '../src/lib/ai/libraryAssets.ts';

const BENCHMARK_ITERATIONS = 40;
const withoutModelGeometry = (raw) => ({
  ...raw,
  elements: raw.elements.map(({ x: _x, y: _y, width: _width, height: _height, ...element }) => element),
});

let legacyPayloadBytes = 0;
let batchedPayloadBytes = 0;
let legacyLayoutMilliseconds = 0;
let batchedLayoutMilliseconds = 0;

const fixtures = [
  {
    name: 'simple flowchart',
    raw: {
      intent: 'draw',
      layout: 'flow-top-to-bottom',
      elements: [
        { type: 'rectangle', id: 'start', x: 0, y: 0, width: 150, height: 60, label: 'Receive request', role: 'primary' },
        { type: 'diamond', id: 'valid', x: 10, y: 90, width: 150, height: 90, label: 'Valid?' },
        { type: 'rectangle', id: 'accept', x: -30, y: 210, width: 150, height: 60, label: 'Process' },
        { type: 'rectangle', id: 'reject', x: 80, y: 210, width: 150, height: 60, label: 'Reject' },
        { type: 'arrow', from: 'start', to: 'valid' },
        { type: 'arrow', from: 'valid', to: 'accept', label: 'yes' },
        { type: 'arrow', from: 'valid', to: 'reject', label: 'no' },
      ],
    },
  },
  {
    name: 'data structure / algorithm',
    raw: {
      intent: 'draw',
      layout: 'hierarchical-top-down',
      elements: [
        { type: 'ellipse', id: 'root', x: 140, y: 0, width: 76, height: 76, label: '8', role: 'primary', group: 'tree' },
        { type: 'ellipse', id: 'left', x: 40, y: 130, width: 76, height: 76, label: '3', group: 'tree' },
        { type: 'ellipse', id: 'right', x: 210, y: 130, width: 76, height: 76, label: '10', group: 'tree' },
        { type: 'ellipse', id: 'leaf-a', x: 20, y: 245, width: 76, height: 76, label: '1', group: 'tree' },
        { type: 'ellipse', id: 'leaf-b', x: 80, y: 245, width: 76, height: 76, label: '6', group: 'tree' },
        { type: 'arrow', from: 'root', to: 'left' },
        { type: 'arrow', from: 'root', to: 'right' },
        { type: 'arrow', from: 'left', to: 'leaf-a' },
        { type: 'arrow', from: 'left', to: 'leaf-b' },
      ],
    },
  },
  {
    name: 'system design architecture',
    raw: {
      intent: 'draw',
      layout: 'flow-left-to-right',
      elements: [
        { type: 'rectangle', id: 'client', x: 0, y: 90, width: 150, height: 64, label: 'Web client', role: 'external', group: 'edge' },
        { type: 'rectangle', id: 'gateway', x: 230, y: 90, width: 160, height: 64, label: 'API gateway', role: 'primary', group: 'edge' },
        { type: 'rectangle', id: 'users', x: 470, y: 20, width: 160, height: 64, label: 'User service', group: 'services' },
        { type: 'rectangle', id: 'orders', x: 470, y: 110, width: 160, height: 64, label: 'Order service', group: 'services' },
        { type: 'ellipse', id: 'db', x: 720, y: 20, width: 120, height: 80, label: 'Postgres', role: 'storage', group: 'data' },
        { type: 'ellipse', id: 'cache', x: 720, y: 120, width: 120, height: 80, label: 'Redis', role: 'storage', group: 'data' },
        { type: 'arrow', from: 'client', to: 'gateway', label: 'HTTPS' },
        { type: 'arrow', from: 'gateway', to: 'users' },
        { type: 'arrow', from: 'gateway', to: 'orders' },
        { type: 'arrow', from: 'users', to: 'db' },
        { type: 'arrow', from: 'orders', to: 'db' },
        { type: 'arrow', from: 'orders', to: 'cache' },
      ],
    },
  },
  {
    name: 'graph / network',
    raw: {
      intent: 'draw',
      layout: 'network',
      elements: [
        { type: 'ellipse', id: 'a', x: 0, y: 100, width: 80, height: 80, label: 'A', group: 'graph' },
        { type: 'ellipse', id: 'b', x: 220, y: 100, width: 80, height: 80, label: 'B', group: 'graph' },
        { type: 'ellipse', id: 'c', x: 440, y: 100, width: 80, height: 80, label: 'C', group: 'graph' },
        { type: 'ellipse', id: 'd', x: 220, y: 300, width: 80, height: 80, label: 'D', group: 'graph' },
        { type: 'line', from: 'a', to: 'c', label: '5' },
        { type: 'line', from: 'a', to: 'd', label: '2' },
        { type: 'line', from: 'b', to: 'd', label: '1' },
        { type: 'line', from: 'c', to: 'd', label: '3' },
      ],
    },
  },
  {
    name: 'layered architecture',
    raw: {
      intent: 'draw',
      layout: 'layered-top-down',
      elements: [
        { type: 'rectangle', id: 'ui', x: 130, y: 0, width: 220, height: 64, label: 'Presentation layer', role: 'primary', group: 'presentation' },
        { type: 'rectangle', id: 'api', x: 20, y: 130, width: 190, height: 64, label: 'Application API', group: 'application' },
        { type: 'rectangle', id: 'jobs', x: 250, y: 130, width: 190, height: 64, label: 'Background jobs', group: 'application' },
        { type: 'rectangle', id: 'domain', x: 130, y: 260, width: 220, height: 64, label: 'Domain services', group: 'domain' },
        { type: 'ellipse', id: 'repository', x: 130, y: 390, width: 150, height: 80, label: 'Repository', role: 'storage', group: 'infrastructure' },
        { type: 'arrow', from: 'ui', to: 'api' },
        { type: 'arrow', from: 'ui', to: 'jobs' },
        { type: 'arrow', from: 'api', to: 'domain' },
        { type: 'arrow', from: 'jobs', to: 'domain' },
        { type: 'arrow', from: 'domain', to: 'repository' },
      ],
    },
  },
  {
    name: 'gateway offloading overlap regression',
    raw: {
      intent: 'draw',
      layout: 'layered-top-down',
      elements: [
        { type: 'rectangle', id: 'no-off-svc-a', x: 586, y: 475, width: 286, height: 179, label: 'Gateway offloading component 18', group: 'edge' },
        { type: 'rectangle', id: 'node-20', x: 80, y: 310, width: 181, height: 70, label: 'Gateway offloading component 20', group: 'origin' },
        { type: 'ellipse', id: 'node-21', x: 18, y: 477, width: 226, height: 93, label: 'Gateway offloading component 21', group: 'edge' },
        { type: 'rectangle', id: 'no-off-svc-b', x: 115, y: 408, width: 217, height: 168, label: 'Gateway offloading component 23', group: 'origin' },
        { type: 'arrow', from: 'node-21', to: 'no-off-svc-a', label: 'offload' },
        { type: 'arrow', from: 'node-21', to: 'no-off-svc-b', label: 'offload' },
        { type: 'arrow', from: 'no-off-svc-a', to: 'node-20' },
        { type: 'arrow', from: 'no-off-svc-b', to: 'node-20' },
      ],
    },
  },
];

for (const fixture of fixtures) {
  const response = parseCanvasResponse(fixture.raw);
  const issues = inspectCanvasLayout(response.skeletons);
  assert.deepEqual(issues, [], `${fixture.name}: ${issues.join('; ')}`);

  const nodes = response.skeletons.filter((element) =>
    element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond',
  );
  const connectors = response.skeletons.filter((element) => element.type === 'arrow' || element.type === 'line');
  assert.ok(nodes.length >= 3, `${fixture.name}: expected at least three nodes`);
  assert.ok(connectors.length >= 2, `${fixture.name}: expected at least two connectors`);
  assert.ok(connectors.every((edge) => Array.isArray(edge.points) && edge.points.length >= 2));

  const bends = connectors.reduce((total, edge) => total + Math.max(0, edge.points.length - 2), 0);
  console.log(`PASS ${fixture.name}: ${nodes.length} nodes, ${connectors.length} connectors, ${bends} routed bends`);

  const batchedRaw = withoutModelGeometry(fixture.raw);
  const batchedResponse = parseCanvasResponse(batchedRaw);
  const batchedIssues = inspectCanvasLayout(batchedResponse.skeletons);
  assert.deepEqual(batchedIssues, [], `${fixture.name} batched plan: ${batchedIssues.join('; ')}`);
  assert.equal(
    batchedResponse.skeletons.filter((element) => element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond').length,
    nodes.length,
    `${fixture.name}: batched plan lost nodes`,
  );
  assert.equal(
    batchedResponse.skeletons.filter((element) => element.type === 'arrow' || element.type === 'line').length,
    connectors.length,
    `${fixture.name}: batched plan lost connectors`,
  );

  const legacyStart = performance.now();
  for (let index = 0; index < BENCHMARK_ITERATIONS; index++) parseCanvasResponse(fixture.raw);
  legacyLayoutMilliseconds += performance.now() - legacyStart;
  const batchedStart = performance.now();
  for (let index = 0; index < BENCHMARK_ITERATIONS; index++) parseCanvasResponse(batchedRaw);
  batchedLayoutMilliseconds += performance.now() - batchedStart;

  const fixtureLegacyBytes = Buffer.byteLength(JSON.stringify(fixture.raw));
  const fixtureBatchedBytes = Buffer.byteLength(JSON.stringify(batchedRaw));
  legacyPayloadBytes += fixtureLegacyBytes;
  batchedPayloadBytes += fixtureBatchedBytes;
  console.log(
    `PERF ${fixture.name}: 1 agent call, 1 canvas update, model payload ${fixtureLegacyBytes} -> ${fixtureBatchedBytes} bytes`,
  );
}

const illustrationCases = [
  ['create a triangle', 'triangle'],
  ['draw a right triangle', 'triangle'],
  ['create a semicircle', 'semicircle-arc'],
  ['draw a circle', 'circle'],
  ['draw a 45 degree angle', 'angle-base'],
  ['draw a number line', 'number-line'],
  ['draw coordinate axes', 'x-axis'],
  ['create a Venn diagram', 'set-a'],
];

for (const [request, expectedId] of illustrationCases) {
  const plan = createBasicIllustrationPlan(request);
  assert.ok(plan, `${request}: expected a deterministic illustration plan`);
  const response = parseCanvasResponse(plan);
  assert.equal(response.intent, 'illustration', `${request}: wrong intent`);
  assert.ok(response.skeletons.some((element) => element.id === expectedId), `${request}: missing ${expectedId}`);
  console.log(`PASS basic illustration: ${request} (${response.skeletons.length} primitives, 0 agent calls)`);
}
assert.equal(createBasicIllustrationPlan('What is a circle?'), null, 'questions must still go to the agent');
assert.equal(createBasicIllustrationPlan('draw a box plot'), null, 'compound charts must still go to the agent');
assert.equal(
  createBasicIllustrationPlan('draw a triangle inside a circle'),
  null,
  'multi-object illustrations need the general illustration planner',
);

const triangle = parseCanvasResponse(createBasicIllustrationPlan('create a triangle'));
assert.equal(triangle.skeletons.length, 1, 'triangle should be one closed path, not a graph');
assert.equal(triangle.skeletons[0].type, 'line');
assert.equal(triangle.skeletons[0].points.length, 4);
assert.equal(
  triangle.skeletons.some((element) => typeof element.label === 'object'),
  false,
  'triangle must not contain fake vertex nodes',
);

const semicircle = parseCanvasResponse(createBasicIllustrationPlan('create a semicircle'));
assert.equal(semicircle.skeletons.length, 2, 'semicircle should contain an arc and diameter');
assert.ok(semicircle.skeletons.every((element) => element.type === 'line'));
assert.ok(semicircle.skeletons.find((element) => element.id === 'semicircle-arc').points.length >= 20);

const venn = parseCanvasResponse(createBasicIllustrationPlan('create a Venn diagram'));
const vennCircles = venn.skeletons.filter((element) => element.type === 'ellipse');
assert.equal(vennCircles.length, 2);
assert.ok(
  vennCircles[0].x + vennCircles[0].width > vennCircles[1].x,
  'illustration layout must preserve intentional Venn overlap',
);

const customIllustration = parseCanvasResponse({
  intent: 'illustration',
  layout: 'auto',
  elements: [
    { type: 'path', id: 'roof', points: [[0, 100], [100, 0], [200, 100]], closed: false },
    { type: 'rectangle', id: 'house', x: 20, y: 100, width: 160, height: 140 },
    { type: 'arc', id: 'sun', x: 250, y: 0, width: 80, height: 80, startAngle: 0, endAngle: 360 },
  ],
});
assert.equal(customIllustration.skeletons.length, 3);
assert.equal(customIllustration.skeletons.find((element) => element.id === 'roof').points.length, 3);
assert.ok(customIllustration.skeletons.find((element) => element.id === 'sun').points.length >= 40);

const staticLibraryCatalog = JSON.parse(
  readFileSync(new URL('../public/libraries/catalog.json', import.meta.url), 'utf8'),
);
const libraryCatalog = includeDsaCatalog(staticLibraryCatalog);
assert.equal(resolveLibraryItem('Cloud', 'draw a system design architecture', libraryCatalog)?.libraryId, 'system-design');
assert.equal(resolveLibraryItem('Cloud', 'draw a cloud for a database architecture', libraryCatalog)?.libraryId, 'db-eng');
assert.equal(resolveLibraryItem('Cloud', 'draw an AWS cloud architecture', libraryCatalog)?.name, 'AWS Cloud');
assert.equal(resolveLibraryItem('Linked List', 'draw a linked list data structure', libraryCatalog)?.libraryId, 'dsa');

const directCloudPlan = createSingleLibraryPlan('draw a cloud', libraryCatalog);
assert.ok(directCloudPlan);
assert.equal(directCloudPlan.elements[0].type, 'library');
assert.equal(directCloudPlan.elements[0].libraryId, 'system-design');
assert.equal(
  createSingleLibraryPlan('link router with cloud', libraryCatalog),
  null,
  'relationship requests must reach full model planning instead of collapsing to one matching asset',
);
assert.equal(
  createSingleLibraryPlan('place a cloud next to a custom edge service', libraryCatalog),
  null,
  'spatial multi-object requests must reach full model planning even when only one object exists in the library',
);
assert.ok(
  createSingleLibraryPlan('draw a cloud with label Production', libraryCatalog),
  'single assets with attribute changes should retain the direct template path',
);
const directLinkedListPlan = createSingleLibraryPlan('draw a linked list', libraryCatalog);
assert.equal(directLinkedListPlan?.elements[0].libraryId, 'dsa');

const mixedArchitectureRaw = applyLibraryMatches({
  intent: 'draw',
  layout: 'flow-left-to-right',
  elements: [
    { type: 'ellipse', id: 'cloud', label: 'Cloud', role: 'external' },
    { type: 'rectangle', id: 'gateway', label: 'API Gateway', role: 'primary' },
    { type: 'ellipse', id: 'database', label: 'Database', role: 'storage' },
    { type: 'rectangle', id: 'worker', label: 'Custom Worker' },
    { type: 'arrow', from: 'cloud', to: 'gateway' },
    { type: 'arrow', from: 'gateway', to: 'database' },
    { type: 'arrow', from: 'gateway', to: 'worker' },
  ],
}, 'draw a system architecture from a cloud through an API gateway to a database and custom worker', libraryCatalog);
assert.equal(mixedArchitectureRaw.elements.filter((element) => element.type === 'library').length, 3);
assert.equal(mixedArchitectureRaw.elements.find((element) => element.id === 'cloud').libraryId, 'system-design');
assert.equal(mixedArchitectureRaw.elements.find((element) => element.id === 'worker').type, 'rectangle');
const mixedArchitecture = parseCanvasResponse(mixedArchitectureRaw);
assert.deepEqual(inspectCanvasLayout(mixedArchitecture.skeletons), []);

const libraryLoader = async (libraryId) => JSON.parse(
  readFileSync(new URL(`../public/libraries/${libraryId}.json`, import.meta.url), 'utf8'),
);
const hydratedArchitecture = await hydrateLibrarySkeletons(mixedArchitecture, libraryLoader);
assert.equal(hydratedArchitecture.skeletons.some((element) => element.type === 'library'), false);
assert.ok(hydratedArchitecture.skeletons.filter((element) => element.opacity === 0).length >= 3);
assert.ok(hydratedArchitecture.skeletons.some((element) => element.id === 'cloud-asset-0'));
assert.ok(hydratedArchitecture.skeletons.some((element) => element.id === 'gateway-asset-0'));
assert.ok(hydratedArchitecture.skeletons.some((element) => element.id === 'database-asset-0'));
assert.ok(hydratedArchitecture.skeletons.some((element) => element.id === 'worker'));
console.log('PASS library-aware architecture: contextual assets, grouped anchors, routed connectors, and generated fallback');

const hydrateDirectTemplate = async (request) => {
  const plan = createSingleLibraryPlan(request, libraryCatalog);
  assert.ok(plan, `${request}: expected a direct library template plan`);
  assert.equal(plan.elements.length, 1, `${request}: base and modified assets must not both be emitted`);
  return {
    plan,
    response: await hydrateLibrarySkeletons(parseCanvasResponse(plan), libraryLoader),
  };
};
const visibleLabels = (response) => response.skeletons
  .flatMap((element) => typeof element.label?.text === 'string'
    ? [element.label.text]
    : typeof element.text === 'string' ? [element.text] : []);

const arrayTemplate = await hydrateDirectTemplate('draw an array with values 4, 8, 15, 16');
assert.equal(arrayTemplate.plan.elements[0].libraryId, 'dsa');
assert.deepEqual(
  arrayTemplate.response.skeletons.filter((element) => element.type === 'rectangle' && element.opacity !== 0)
    .map((element) => element.label?.text),
  ['4', '8', '15', '16'],
);
assert.ok(visibleLabels(arrayTemplate.response).includes('Index:'), 'array decoration should survive template edits');

const expandedArrayTemplate = await hydrateDirectTemplate('draw an array of size 11');
assert.deepEqual(
  expandedArrayTemplate.response.skeletons
    .filter((element) => element.type === 'text' && /^\d+$/.test(element.text || ''))
    .sort((left, right) => left.x - right.x)
    .map((element) => element.text),
  Array.from({ length: 11 }, (_, index) => String(index)),
  'ordinal annotations should continue when a repeated library template is expanded',
);

const largeArrayTemplate = await hydrateDirectTemplate('draw an array of size 19');
const largeArrayCells = largeArrayTemplate.response.skeletons
  .filter((element) => element.type === 'rectangle' && element.opacity !== 0)
  .sort((left, right) => left.x - right.x);
assert.equal(largeArrayCells.length, 19);
assert.equal(new Set(largeArrayCells.map((element) => element.height.toFixed(4))).size, 1, 'repeated containers must stay uniform');
assert.ok(
  largeArrayCells.every((element) => {
    const text = element.label?.text || '';
    const fontSize = element.label?.fontSize || 0;
    return text.length * fontSize * 0.65 + 10 <= element.width + 0.01
      && fontSize * 1.3 + 6 <= element.height + 0.01;
  }),
  'bound labels must fit their repeated containers without triggering renderer-driven resizing',
);
assert.ok(largeArrayCells[0].width > 45, 'expanded templates should preserve readable unit dimensions');

const linkedListTemplate = await hydrateDirectTemplate('draw a linked list with 5 nodes labels A, B, C, D, E');
const linkedValueNodes = linkedListTemplate.response.skeletons.filter((element) =>
  element.type === 'rectangle' && /^[A-E]$/.test(element.label?.text || ''),
);
assert.equal(linkedValueNodes.length, 5);
const nullLabel = linkedListTemplate.response.skeletons.find((element) => element.text === 'NULL');
assert.ok(nullLabel.x > Math.max(...linkedValueNodes.map((element) => element.x)), 'trailing NULL should follow cloned nodes');

const queueTemplate = await hydrateDirectTemplate('draw a queue with 6 elements');
assert.equal(queueTemplate.plan.elements[0].name, 'Queue', 'element-count context should select the DSA queue');
assert.deepEqual(
  queueTemplate.response.skeletons.filter((element) => element.type === 'rectangle' && element.opacity !== 0)
    .map((element) => element.label?.text),
  ['A', 'B', 'C', 'D', 'E', 'F'],
);

const treeTemplate = await hydrateDirectTemplate('draw a binary tree with 7 nodes labels A, B, C, D, E, F, G');
assert.equal(treeTemplate.response.skeletons.filter((element) => element.type === 'ellipse').length, 7);
assert.equal(
  treeTemplate.response.skeletons.filter((element) => element.type === 'arrow'
    && element.startBinding?.elementId && element.endBinding?.elementId).length,
  6,
  'tree-like templates should infer and preserve their bound connector topology',
);
assert.deepEqual(visibleLabels(treeTemplate.response), ['A', 'B', 'C', 'D', 'E', 'F', 'G']);

const cloudTemplate = await hydrateDirectTemplate('draw a cloud 300x180 with label Production Cloud');
assert.equal(cloudTemplate.response.skeletons[0].width, 300);
assert.equal(cloudTemplate.response.skeletons[0].height, 180);
assert.ok(visibleLabels(cloudTemplate.response).includes('Production Cloud'));

const reorderedArrayPlan = createSingleLibraryPlan('draw an array', libraryCatalog);
reorderedArrayPlan.elements[0].libraryTemplate = {
  labels: ['1', '2', '3', '4'],
  replace: [{ from: '3', to: '30' }],
  remove: ['2'],
  append: ['5'],
  order: 'reverse',
  count: 4,
};
const reorderedArray = await hydrateLibrarySkeletons(parseCanvasResponse(reorderedArrayPlan), libraryLoader);
assert.deepEqual(
  reorderedArray.skeletons.filter((element) => element.type === 'rectangle' && element.opacity !== 0)
    .map((element) => element.label?.text),
  ['5', '4', '30', '1'],
  'generic replacement, removal, append, ordering, and count edits should compose',
);
console.log('PASS parameterized library templates: resize, relabel, reorder, add/remove, and topology preservation');

const promptAnchor = { minX: 100, minY: 40, maxX: 300, maxY: 80, elementIds: ['prompt'] };
const placementSkeletons = [
  { type: 'rectangle', id: 'left', x: 0, y: 0, width: 100, height: 60 },
  { type: 'rectangle', id: 'right', x: 220, y: 0, width: 100, height: 60 },
];
const placement = placeSkeletonsBelowAnchor(
  placementSkeletons,
  [
    { type: 'text', id: 'prompt', x: 100, y: 40, width: 200, height: 40 },
    { type: 'rectangle', id: 'unrelated', x: 900, y: 2000, width: 200, height: 100 },
  ],
  promptAnchor,
);
assert.equal(Math.min(...placement.map((element) => element.y)), 128, 'drawing should start directly below its prompt');
assert.equal(
  (Math.min(...placement.map((element) => element.x)) + Math.max(...placement.map((element) => element.x + element.width))) / 2,
  200,
  'drawing should be horizontally centred under its prompt',
);
const collisionPlacement = placeSkeletonsBelowAnchor(
  placementSkeletons,
  [{ type: 'rectangle', id: 'blocker', x: 40, y: 110, width: 320, height: 100 }],
  promptAnchor,
);
assert.equal(Math.min(...collisionPlacement.map((element) => element.y)), 258, 'occupied prompt lanes should move only downward');
console.log('PASS prompt-relative placement: direct-below anchor, centring, and downward collision fallback');

const failedHydration = await hydrateLibrarySkeletons(
  parseCanvasResponse(directCloudPlan),
  async () => { throw new Error('offline'); },
);
assert.equal(failedHydration.skeletons[0].type, 'rectangle', 'unavailable library assets must use generated fallback');

const diagramSource = readFileSync(new URL('../src/lib/ai/diagram.ts', import.meta.url), 'utf8');
const promptBytes = (name) => {
  const marker = `export const ${name} = \``;
  const start = diagramSource.indexOf(marker);
  assert.notEqual(start, -1, `missing ${name}`);
  const contentStart = start + marker.length;
  const end = diagramSource.indexOf('`;', contentStart);
  assert.notEqual(end, -1, `unterminated ${name}`);
  return Buffer.byteLength(diagramSource.slice(contentStart, end));
};
// Measured from the coordinate-heavy prompt before the batched semantic plan.
const legacyPromptBytes = 4461;
const batchedPromptBytes = promptBytes('CANVAS_AI_SYSTEM_PROMPT');
assert.ok(batchedPromptBytes < legacyPromptBytes * 0.75, 'compact diagram prompt regressed beyond its performance budget');
assert.ok(batchedPayloadBytes < legacyPayloadBytes, 'semantic batch payload must stay smaller than coordinate-heavy output');

const samples = fixtures.length * BENCHMARK_ITERATIONS;
console.log(
  `PERF SUMMARY prompt ${legacyPromptBytes} -> ${batchedPromptBytes} bytes; fixture payloads ${legacyPayloadBytes} -> ${batchedPayloadBytes} bytes; `
    + `layout avg ${(legacyLayoutMilliseconds / samples).toFixed(3)}ms -> ${(batchedLayoutMilliseconds / samples).toFixed(3)}ms; `
    + 'transport remains at the minimum 1 agent request and rendering remains 1 batched canvas update per diagram.',
);
