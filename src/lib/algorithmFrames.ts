// Step-by-step "frame" generators for every algorithm in the visualizer.
//
// Each algorithm turns a sample input into an ordered list of immutable frames.
// A frame is a complete visual snapshot; the node component just walks the list
// with its playback controls. Frames are tagged by `type` so a single
// FrameRenderer can dispatch to the right visual without knowing the algorithm.

// ── Array (sorting / searching / pointers) ──────────────────
export type ArrayCellState =
  | 'idle'
  | 'compare'
  | 'swap'
  | 'sorted'
  | 'pivot'
  | 'pointer-l'
  | 'pointer-r'
  | 'window'
  | 'mid'
  | 'found'
  | 'active';

export interface ArrayCell {
  id: number; // stable identity so framer-motion animates reorders as slides
  v: number;
}

export interface ArrayFrame {
  type: 'array';
  cells: ArrayCell[];
  states: ArrayCellState[];
  caption: string;
}

// ── Graph (BFS / DFS / Dijkstra / Topological) ──────────────
export type GraphNodeState = 'idle' | 'frontier' | 'current' | 'visited' | 'done';
export type GraphEdgeState = 'idle' | 'active' | 'tree';

export interface GraphFrameNode {
  id: string;
  x: number;
  y: number;
  state: GraphNodeState;
  badge?: string; // e.g. distance / in-degree
}
export interface GraphFrameEdge {
  from: string;
  to: string;
  weight?: number;
  state: GraphEdgeState;
}
export interface GraphFrame {
  type: 'graph';
  directed: boolean;
  nodes: GraphFrameNode[];
  edges: GraphFrameEdge[];
  caption: string;
}

// ── Grid (N-Queens) ─────────────────────────────────────────
export interface GridFrame {
  type: 'grid';
  n: number;
  queens: number[]; // queens[row] = col, or -1
  trying: { r: number; c: number } | null;
  conflict: boolean;
  solved: boolean;
  caption: string;
}

// ── DP table (Knapsack) ─────────────────────────────────────
export interface DPFrame {
  type: 'dp';
  table: (number | null)[][];
  cursor: { r: number; c: number } | null;
  rowLabels: string[];
  colLabels: string[];
  caption: string;
}

// ── Union-Find ──────────────────────────────────────────────
export interface UFFrame {
  type: 'uf';
  parent: number[];
  highlight: number[];
  caption: string;
}

export type Frame = ArrayFrame | GraphFrame | GridFrame | DPFrame | UFFrame;

// ── helpers ─────────────────────────────────────────────────
const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

const randomArray = (n: number, lo = 8, hi = 90) =>
  Array.from({ length: n }, () => randInt(lo, hi));

const toCells = (vals: number[]): ArrayCell[] => vals.map((v, i) => ({ id: i, v }));
const cloneCells = (cells: ArrayCell[]): ArrayCell[] => cells.map((c) => ({ ...c }));

const idleStates = (n: number): ArrayCellState[] => Array(n).fill('idle');

function arrFrame(
  cells: ArrayCell[],
  caption: string,
  marks: Partial<Record<number, ArrayCellState>> = {},
  sortedFrom = Infinity
): ArrayFrame {
  const states = idleStates(cells.length);
  for (let i = 0; i < cells.length; i++) if (i >= sortedFrom) states[i] = 'sorted';
  for (const k in marks) states[Number(k)] = marks[Number(k)]!;
  return { type: 'array', cells: cloneCells(cells), states, caption };
}

// ── Bubble Sort ─────────────────────────────────────────────
function bubbleSort(): ArrayFrame[] {
  const cells = toCells(randomArray(8));
  const n = cells.length;
  const frames: ArrayFrame[] = [arrFrame(cells, 'Unsorted input')];
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      frames.push(
        arrFrame(cells, `Compare ${cells[j].v} and ${cells[j + 1].v}`, { [j]: 'compare', [j + 1]: 'compare' }, n - i)
      );
      if (cells[j].v > cells[j + 1].v) {
        [cells[j], cells[j + 1]] = [cells[j + 1], cells[j]];
        swapped = true;
        frames.push(arrFrame(cells, `Swap → ${cells[j].v} before ${cells[j + 1].v}`, { [j]: 'swap', [j + 1]: 'swap' }, n - i));
      }
    }
    frames.push(arrFrame(cells, `Position ${n - i - 1} locked in`, {}, n - i - 1));
    if (!swapped) break;
  }
  frames.push(arrFrame(cells, 'Sorted ✓', {}, 0));
  return frames;
}

// ── Quick Sort (Lomuto) ─────────────────────────────────────
function quickSort(): ArrayFrame[] {
  const cells = toCells(randomArray(8));
  const frames: ArrayFrame[] = [arrFrame(cells, 'Unsorted input')];
  const sortedIdx = new Set<number>();
  const markSorted = (): Partial<Record<number, ArrayCellState>> => {
    const m: Partial<Record<number, ArrayCellState>> = {};
    sortedIdx.forEach((i) => (m[i] = 'sorted'));
    return m;
  };

  const stack: [number, number][] = [[0, cells.length - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop()!;
    if (lo >= hi) {
      if (lo === hi) sortedIdx.add(lo);
      continue;
    }
    const pivot = cells[hi].v;
    frames.push(arrFrame(cells, `Pivot = ${pivot}`, { ...markSorted(), [hi]: 'pivot' }));
    let i = lo;
    for (let j = lo; j < hi; j++) {
      frames.push(arrFrame(cells, `Is ${cells[j].v} ≤ ${pivot}?`, { ...markSorted(), [hi]: 'pivot', [j]: 'compare', [i]: 'pointer-l' }));
      if (cells[j].v <= pivot) {
        if (i !== j) {
          [cells[i], cells[j]] = [cells[j], cells[i]];
          frames.push(arrFrame(cells, `Swap into place`, { ...markSorted(), [hi]: 'pivot', [i]: 'swap', [j]: 'swap' }));
        }
        i++;
      }
    }
    [cells[i], cells[hi]] = [cells[hi], cells[i]];
    sortedIdx.add(i);
    frames.push(arrFrame(cells, `Pivot settles at ${i}`, markSorted()));
    stack.push([lo, i - 1]);
    stack.push([i + 1, hi]);
  }
  frames.push(arrFrame(cells, 'Sorted ✓', {}, 0));
  return frames;
}

// ── Merge Sort (top-down) ───────────────────────────────────
function mergeSort(): ArrayFrame[] {
  const cells = toCells(randomArray(8));
  const frames: ArrayFrame[] = [arrFrame(cells, 'Unsorted input')];

  const windowMarks = (lo: number, hi: number, extra: Partial<Record<number, ArrayCellState>> = {}) => {
    const m: Partial<Record<number, ArrayCellState>> = {};
    for (let i = lo; i <= hi; i++) m[i] = 'window';
    return { ...m, ...extra };
  };

  const merge = (lo: number, mid: number, hi: number) => {
    const left = cells.slice(lo, mid + 1);
    const right = cells.slice(mid + 1, hi + 1);
    let li = 0,
      ri = 0,
      k = lo;
    frames.push(arrFrame(cells, `Merge [${lo}…${mid}] + [${mid + 1}…${hi}]`, windowMarks(lo, hi)));
    while (li < left.length && ri < right.length) {
      if (left[li].v <= right[ri].v) cells[k] = left[li++];
      else cells[k] = right[ri++];
      frames.push(arrFrame(cells, `Place ${cells[k].v}`, windowMarks(lo, hi, { [k]: 'active' })));
      k++;
    }
    while (li < left.length) {
      cells[k] = left[li++];
      frames.push(arrFrame(cells, `Place ${cells[k].v}`, windowMarks(lo, hi, { [k]: 'active' })));
      k++;
    }
    while (ri < right.length) {
      cells[k] = right[ri++];
      frames.push(arrFrame(cells, `Place ${cells[k].v}`, windowMarks(lo, hi, { [k]: 'active' })));
      k++;
    }
  };

  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  };
  sort(0, cells.length - 1);
  frames.push(arrFrame(cells, 'Sorted ✓', {}, 0));
  return frames;
}

// ── Binary Search ───────────────────────────────────────────
function binarySearch(): ArrayFrame[] {
  const vals = randomArray(9, 5, 50)
    .sort((a, b) => a - b);
  const cells = toCells(vals);
  const target = cells[randInt(0, cells.length - 1)].v;
  const frames: ArrayFrame[] = [arrFrame(cells, `Search for ${target} (sorted)`)];
  let lo = 0,
    hi = cells.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    frames.push(
      arrFrame(cells, `mid = ${cells[mid].v}`, { [lo]: 'pointer-l', [hi]: 'pointer-r', [mid]: 'mid' })
    );
    if (cells[mid].v === target) {
      frames.push(arrFrame(cells, `Found ${target} at index ${mid} ✓`, { [mid]: 'found' }));
      return frames;
    }
    if (cells[mid].v < target) {
      lo = mid + 1;
      frames.push(arrFrame(cells, `${cells[mid].v} < ${target} → search right`, { [mid]: 'compare' }));
    } else {
      hi = mid - 1;
      frames.push(arrFrame(cells, `${cells[mid].v} > ${target} → search left`, { [mid]: 'compare' }));
    }
  }
  frames.push(arrFrame(cells, `${target} not found`));
  return frames;
}

// ── Two Pointers (pair sum) ─────────────────────────────────
function twoPointers(): ArrayFrame[] {
  const vals = randomArray(8, 2, 30).sort((a, b) => a - b);
  const cells = toCells(vals);
  // Guarantee a solvable target from two distinct elements.
  const target = cells[1].v + cells[cells.length - 2].v;
  const frames: ArrayFrame[] = [arrFrame(cells, `Find a pair summing to ${target}`)];
  let l = 0,
    r = cells.length - 1;
  while (l < r) {
    const sum = cells[l].v + cells[r].v;
    frames.push(arrFrame(cells, `${cells[l].v} + ${cells[r].v} = ${sum}`, { [l]: 'pointer-l', [r]: 'pointer-r' }));
    if (sum === target) {
      frames.push(arrFrame(cells, `Pair found ✓`, { [l]: 'found', [r]: 'found' }));
      return frames;
    }
    if (sum < target) {
      l++;
      frames.push(arrFrame(cells, `${sum} < ${target} → move left pointer →`, {}));
    } else {
      r--;
      frames.push(arrFrame(cells, `${sum} > ${target} → move right pointer ←`, {}));
    }
  }
  return frames;
}

// ── Sliding Window (max sum of size k) ──────────────────────
function slidingWindow(): ArrayFrame[] {
  const cells = toCells(randomArray(9, 1, 20));
  const k = 3;
  const frames: ArrayFrame[] = [];
  const winMarks = (start: number, extra: Partial<Record<number, ArrayCellState>> = {}) => {
    const m: Partial<Record<number, ArrayCellState>> = {};
    for (let i = start; i < start + k; i++) m[i] = 'window';
    return { ...m, ...extra };
  };
  let sum = 0;
  for (let i = 0; i < k; i++) sum += cells[i].v;
  let best = sum,
    bestStart = 0;
  frames.push(arrFrame(cells, `Window k=${k}, sum = ${sum}`, winMarks(0)));
  for (let end = k; end < cells.length; end++) {
    sum += cells[end].v - cells[end - k].v;
    const start = end - k + 1;
    if (sum > best) {
      best = sum;
      bestStart = start;
    }
    frames.push(arrFrame(cells, `Slide → sum = ${sum}, best = ${best}`, winMarks(start)));
  }
  const found: Partial<Record<number, ArrayCellState>> = {};
  for (let i = bestStart; i < bestStart + k; i++) found[i] = 'found';
  frames.push(arrFrame(cells, `Max window sum = ${best} ✓`, found));
  return frames;
}

// ── Graph helpers ───────────────────────────────────────────
interface GraphSpec {
  nodes: { id: string; x: number; y: number }[];
  edges: { from: string; to: string; weight?: number }[];
  directed: boolean;
}

const TRAVERSAL_GRAPH: GraphSpec = {
  directed: false,
  nodes: [
    { id: 'A', x: 45, y: 30 },
    { id: 'B', x: 160, y: 22 },
    { id: 'C', x: 270, y: 38 },
    { id: 'D', x: 70, y: 120 },
    { id: 'E', x: 185, y: 118 },
    { id: 'F', x: 285, y: 138 },
    { id: 'G', x: 150, y: 178 },
  ],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'D' },
    { from: 'B', to: 'C' },
    { from: 'B', to: 'E' },
    { from: 'C', to: 'F' },
    { from: 'D', to: 'E' },
    { from: 'D', to: 'G' },
    { from: 'E', to: 'G' },
    { from: 'E', to: 'F' },
  ],
};

const adjacency = (spec: GraphSpec) => {
  const adj: Record<string, { to: string; weight: number }[]> = {};
  spec.nodes.forEach((n) => (adj[n.id] = []));
  spec.edges.forEach((e) => {
    adj[e.from].push({ to: e.to, weight: e.weight ?? 1 });
    if (!spec.directed) adj[e.to].push({ to: e.from, weight: e.weight ?? 1 });
  });
  return adj;
};

function snapshotGraph(
  spec: GraphSpec,
  nodeState: Record<string, GraphNodeState>,
  edgeState: Record<string, GraphEdgeState>,
  badges: Record<string, string>,
  caption: string
): GraphFrame {
  return {
    type: 'graph',
    directed: spec.directed,
    caption,
    nodes: spec.nodes.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
      state: nodeState[n.id] ?? 'idle',
      badge: badges[n.id],
    })),
    edges: spec.edges.map((e) => ({
      from: e.from,
      to: e.to,
      weight: e.weight,
      state: edgeState[`${e.from}-${e.to}`] ?? 'idle',
    })),
  };
}

const edgeKey = (spec: GraphSpec, a: string, b: string) =>
  spec.edges.find((e) => (e.from === a && e.to === b) || (!spec.directed && e.from === b && e.to === a));

// ── BFS / DFS ───────────────────────────────────────────────
function bfs(): GraphFrame[] {
  const spec = TRAVERSAL_GRAPH;
  const adj = adjacency(spec);
  const nodeState: Record<string, GraphNodeState> = {};
  const edgeState: Record<string, GraphEdgeState> = {};
  const frames: GraphFrame[] = [];
  const start = 'A';
  const queue: string[] = [start];
  const seen = new Set<string>([start]);
  nodeState[start] = 'frontier';
  frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Enqueue ${start}`));
  while (queue.length) {
    const u = queue.shift()!;
    nodeState[u] = 'current';
    frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Visit ${u}`));
    for (const { to: v } of adj[u].sort((a, b) => a.to.localeCompare(b.to))) {
      if (!seen.has(v)) {
        seen.add(v);
        queue.push(v);
        nodeState[v] = 'frontier';
        const ek = edgeKey(spec, u, v);
        if (ek) edgeState[`${ek.from}-${ek.to}`] = 'tree';
        frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Discover ${v} from ${u}`));
      }
    }
    nodeState[u] = 'visited';
  }
  frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Traversal complete ✓'));
  return frames;
}

function dfs(): GraphFrame[] {
  const spec = TRAVERSAL_GRAPH;
  const adj = adjacency(spec);
  const nodeState: Record<string, GraphNodeState> = {};
  const edgeState: Record<string, GraphEdgeState> = {};
  const frames: GraphFrame[] = [];
  const seen = new Set<string>();
  const visit = (u: string, parent: string | null) => {
    seen.add(u);
    nodeState[u] = 'current';
    if (parent) {
      const ek = edgeKey(spec, parent, u);
      if (ek) edgeState[`${ek.from}-${ek.to}`] = 'tree';
    }
    frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Visit ${u}`));
    for (const { to: v } of adj[u].sort((a, b) => a.to.localeCompare(b.to))) {
      if (!seen.has(v)) {
        nodeState[u] = 'frontier';
        visit(v, u);
        nodeState[u] = 'current';
        frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Backtrack to ${u}`));
      }
    }
    nodeState[u] = 'visited';
    frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Finish ${u}`));
  };
  visit('A', null);
  frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Traversal complete ✓'));
  return frames;
}

// ── Dijkstra ────────────────────────────────────────────────
const WEIGHTED_GRAPH: GraphSpec = {
  directed: false,
  nodes: [
    { id: 'A', x: 40, y: 90 },
    { id: 'B', x: 140, y: 28 },
    { id: 'C', x: 140, y: 150 },
    { id: 'D', x: 245, y: 60 },
    { id: 'E', x: 250, y: 150 },
    { id: 'F', x: 300, y: 105 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'C', to: 'E', weight: 8 },
    { from: 'D', to: 'E', weight: 2 },
    { from: 'D', to: 'F', weight: 6 },
    { from: 'E', to: 'F', weight: 3 },
  ],
};

function dijkstra(): GraphFrame[] {
  const spec = WEIGHTED_GRAPH;
  const adj = adjacency(spec);
  const dist: Record<string, number> = {};
  const done: Record<string, boolean> = {};
  spec.nodes.forEach((n) => (dist[n.id] = Infinity));
  const start = 'A';
  dist[start] = 0;
  const frames: GraphFrame[] = [];
  const badges = () => {
    const b: Record<string, string> = {};
    for (const id in dist) b[id] = dist[id] === Infinity ? '∞' : String(dist[id]);
    return b;
  };
  const nodeState = () => {
    const s: Record<string, GraphNodeState> = {};
    spec.nodes.forEach((n) => (s[n.id] = done[n.id] ? 'visited' : 'idle'));
    return s;
  };
  frames.push(snapshotGraph(spec, nodeState(), {}, badges(), `Source ${start}, dist=0`));
  for (let iter = 0; iter < spec.nodes.length; iter++) {
    let u: string | null = null;
    let best = Infinity;
    for (const n of spec.nodes) if (!done[n.id] && dist[n.id] < best) ((best = dist[n.id]), (u = n.id));
    if (u === null) break;
    done[u] = true;
    const cur = nodeState();
    cur[u] = 'current';
    frames.push(snapshotGraph(spec, cur, {}, badges(), `Settle ${u} (dist ${dist[u]})`));
    for (const { to: v, weight } of adj[u]) {
      if (done[v]) continue;
      const nd = dist[u] + weight;
      const es: Record<string, GraphEdgeState> = {};
      const ek = edgeKey(spec, u, v);
      if (ek) es[`${ek.from}-${ek.to}`] = 'active';
      if (nd < dist[v]) {
        dist[v] = nd;
        const cur2 = nodeState();
        cur2[u] = 'current';
        cur2[v] = 'frontier';
        frames.push(snapshotGraph(spec, cur2, es, badges(), `Relax ${u}→${v}: ${nd}`));
      } else {
        const cur2 = nodeState();
        cur2[u] = 'current';
        frames.push(snapshotGraph(spec, cur2, es, badges(), `${u}→${v}: ${nd} ≥ ${dist[v]}, keep`));
      }
    }
  }
  frames.push(snapshotGraph(spec, nodeState(), {}, badges(), 'Shortest paths found ✓'));
  return frames;
}

// ── Topological Sort (Kahn) ─────────────────────────────────
const DAG: GraphSpec = {
  directed: true,
  nodes: [
    { id: 'A', x: 40, y: 40 },
    { id: 'B', x: 40, y: 140 },
    { id: 'C', x: 150, y: 30 },
    { id: 'D', x: 160, y: 120 },
    { id: 'E', x: 265, y: 70 },
    { id: 'F', x: 280, y: 160 },
  ],
  edges: [
    { from: 'A', to: 'C' },
    { from: 'B', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'E' },
    { from: 'D', to: 'E' },
    { from: 'D', to: 'F' },
    { from: 'E', to: 'F' },
  ],
};

function topologicalSort(): GraphFrame[] {
  const spec = DAG;
  const indeg: Record<string, number> = {};
  spec.nodes.forEach((n) => (indeg[n.id] = 0));
  spec.edges.forEach((e) => (indeg[e.to] += 1));
  const removed: Record<string, boolean> = {};
  const frames: GraphFrame[] = [];
  const order: string[] = [];
  const badges = () => {
    const b: Record<string, string> = {};
    for (const id in indeg) if (!removed[id]) b[id] = String(indeg[id]);
    return b;
  };
  const nodeState = (current?: string) => {
    const s: Record<string, GraphNodeState> = {};
    spec.nodes.forEach((n) => {
      s[n.id] = removed[n.id] ? 'visited' : indeg[n.id] === 0 ? 'frontier' : 'idle';
    });
    if (current) s[current] = 'current';
    return s;
  };
  frames.push(snapshotGraph(spec, nodeState(), {}, badges(), 'In-degrees computed'));
  while (order.length < spec.nodes.length) {
    const ready = spec.nodes.find((n) => !removed[n.id] && indeg[n.id] === 0);
    if (!ready) break;
    removed[ready.id] = true;
    order.push(ready.id);
    frames.push(snapshotGraph(spec, nodeState(ready.id), {}, badges(), `Output ${ready.id}  →  [${order.join(' ')}]`));
    spec.edges
      .filter((e) => e.from === ready.id)
      .forEach((e) => {
        indeg[e.to] -= 1;
      });
    frames.push(snapshotGraph(spec, nodeState(), {}, badges(), `Decrement neighbours of ${ready.id}`));
  }
  frames.push(snapshotGraph(spec, nodeState(), {}, badges(), `Order: ${order.join(' → ')} ✓`));
  return frames;
}

// ── N-Queens (backtracking) ─────────────────────────────────
function nQueens(): GridFrame[] {
  const n = 6;
  const queens = Array(n).fill(-1);
  const frames: GridFrame[] = [];
  const snap = (
    trying: { r: number; c: number } | null,
    conflict: boolean,
    solved: boolean,
    caption: string
  ): GridFrame => ({ type: 'grid', n, queens: [...queens], trying, conflict, solved, caption });

  const safe = (row: number, col: number) => {
    for (let r = 0; r < row; r++) {
      const c = queens[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) return false;
    }
    return true;
  };
  frames.push(snap(null, false, false, `Place ${n} non-attacking queens`));
  const solve = (row: number): boolean => {
    if (row === n) {
      frames.push(snap(null, false, true, 'Solution found ✓'));
      return true;
    }
    for (let col = 0; col < n; col++) {
      frames.push(snap({ r: row, c: col }, false, false, `Try row ${row}, col ${col}`));
      if (safe(row, col)) {
        queens[row] = col;
        frames.push(snap({ r: row, c: col }, false, false, `Place queen at (${row}, ${col})`));
        if (solve(row + 1)) return true;
        queens[row] = -1;
        frames.push(snap({ r: row, c: col }, false, false, `Dead end → backtrack row ${row}`));
      } else {
        frames.push(snap({ r: row, c: col }, true, false, `(${row}, ${col}) is attacked`));
      }
    }
    return false;
  };
  solve(0);
  return frames;
}

// ── 0/1 Knapsack (DP) ───────────────────────────────────────
function knapsack(): DPFrame[] {
  const weights = [1, 2, 3, 4];
  const values = [1, 6, 10, 16];
  const W = 6;
  const n = weights.length;
  const table: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null));
  const rowLabels = ['∅', ...weights.map((w, i) => `w${w}·v${values[i]}`)];
  const colLabels = Array.from({ length: W + 1 }, (_, c) => String(c));
  const frames: DPFrame[] = [];
  const snap = (cursor: { r: number; c: number } | null, caption: string): DPFrame => ({
    type: 'dp',
    table: table.map((row) => [...row]),
    cursor,
    rowLabels,
    colLabels,
    caption,
  });

  for (let c = 0; c <= W; c++) table[0][c] = 0;
  frames.push(snap(null, 'Base row: 0 items → value 0'));
  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= W; c++) {
      const wi = weights[i - 1];
      const vi = values[i - 1];
      if (wi > c) {
        table[i][c] = table[i - 1][c];
        frames.push(snap({ r: i, c }, `Item ${i} too heavy (${wi} > ${c}) → copy above`));
      } else {
        const skip = table[i - 1][c]!;
        const take = vi + table[i - 1][c - wi]!;
        table[i][c] = Math.max(skip, take);
        frames.push(snap({ r: i, c }, `max(skip ${skip}, take ${take}) = ${table[i][c]}`));
      }
    }
  }
  frames.push(snap({ r: n, c: W }, `Best value = ${table[n][W]} ✓`));
  return frames;
}

// ── Union-Find ──────────────────────────────────────────────
function unionFind(): UFFrame[] {
  const n = 7;
  const parent = Array.from({ length: n }, (_, i) => i);
  const frames: UFFrame[] = [];
  const snap = (highlight: number[], caption: string): UFFrame => ({
    type: 'uf',
    parent: [...parent],
    highlight,
    caption,
  });
  const find = (x: number): number => {
    let root = x;
    while (parent[root] !== root) root = parent[root];
    return root;
  };
  frames.push(snap([], '7 singleton sets'));
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    frames.push(snap([ra, rb], `union(${a}, ${b}) → roots ${ra}, ${rb}`));
    if (ra === rb) {
      frames.push(snap([ra], `Already connected`));
      return;
    }
    parent[rb] = ra;
    frames.push(snap([ra, rb], `Attach ${rb} under ${ra}`));
  };
  union(0, 1);
  union(2, 3);
  union(4, 5);
  union(1, 3);
  union(5, 6);
  union(3, 5);
  // Path compression demo
  const x = 6;
  const root = find(x);
  const path: number[] = [];
  let cur = x;
  while (parent[cur] !== cur) {
    path.push(cur);
    cur = parent[cur];
  }
  frames.push(snap([x, root], `find(${x}) climbs to root ${root}`));
  path.forEach((p) => (parent[p] = root));
  frames.push(snap([...path, root], `Path compression: point all to ${root} ✓`));
  return frames;
}

// ── Registry ────────────────────────────────────────────────
const GENERATORS: Record<string, () => Frame[]> = {
  'bubble-sort': bubbleSort,
  'merge-sort': mergeSort,
  'quick-sort': quickSort,
  'binary-search': binarySearch,
  bfs,
  dfs,
  dijkstra,
  'topological-sort': topologicalSort,
  'two-pointers': twoPointers,
  'sliding-window': slidingWindow,
  knapsack,
  'n-queens': nQueens,
  'union-find': unionFind,
};

export function getFrames(algorithmId: string): Frame[] {
  const gen = GENERATORS[algorithmId];
  if (!gen) {
    return [
      {
        type: 'array',
        cells: [],
        states: [],
        caption: 'No visualization available',
      } as ArrayFrame,
    ];
  }
  return gen();
}
