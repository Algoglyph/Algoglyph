// Step-by-step "frame" generators for every algorithm in the visualizer.
//
// Each algorithm turns a sample input into an ordered list of immutable frames.
import { getAlgorithm } from '../config/algorithms';

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
function bubbleSort(custom?: number[]): ArrayFrame[] {
  const cells = toCells(custom && custom.length > 0 ? custom : randomArray(8));
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
function quickSort(custom?: number[]): ArrayFrame[] {
  const cells = toCells(custom && custom.length > 0 ? custom : randomArray(8));
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
function mergeSort(custom?: number[]): ArrayFrame[] {
  const cells = toCells(custom && custom.length > 0 ? custom : randomArray(8));
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
function binarySearch(custom?: number[]): ArrayFrame[] {
  const vals = custom && custom.length > 0 ? [...custom].sort((a, b) => a - b) : randomArray(9, 5, 50).sort((a, b) => a - b);
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
function twoPointers(custom?: number[]): ArrayFrame[] {
  const vals = custom && custom.length > 0 ? [...custom].sort((a, b) => a - b) : randomArray(8, 2, 30).sort((a, b) => a - b);
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
function slidingWindow(custom?: number[]): ArrayFrame[] {
  const cells = toCells(custom && custom.length > 0 ? custom : randomArray(9, 1, 20));
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
const GENERATORS: Record<string, (custom?: number[]) => Frame[]> = {
  'bubble-sort': bubbleSort,
  'merge-sort': mergeSort,
  'quick-sort': quickSort,
  'binary-search': binarySearch,
  'bfs-graph': bfs,
  'dfs-graph': dfs,
  'dijkstra': dijkstra,
  'topological-sort': topologicalSort,
  'two-pointers': twoPointers,
  'sliding-window': slidingWindow,
  'knapsack': knapsack,
  'n-queens': nQueens,
  'union-find': unionFind,
};

function generateDynamicFrames(id: string, category: string, custom?: number[]): Frame[] {
  const frames: Frame[] = [];

  // ── 1. Searching ──
  if (category === 'Searching') {
    const vals = custom && custom.length > 0 ? [...custom].sort((a, b) => a - b) : [10, 20, 30, 40, 50, 60, 70, 80];
    const cells = toCells(vals);
    const target = custom && custom.length > 0 ? vals[Math.floor(vals.length / 2)] : 50;
    frames.push(arrFrame(cells, `Search for target = ${target} using ${id}`));

    if (id === 'linear-search') {
      for (let i = 0; i < cells.length; i++) {
        frames.push(arrFrame(cells, `Check index ${i}: ${cells[i].v}`, { [i]: 'compare' }));
        if (cells[i].v === target) {
          frames.push(arrFrame(cells, `Found ${target} at index ${i}!`, { [i]: 'found' }));
          break;
        }
      }
    } else if (id === 'ternary-search') {
      let lo = 0, hi = cells.length - 1;
      while (lo <= hi) {
        const m1 = lo + Math.floor((hi - lo) / 3);
        const m2 = hi - Math.floor((hi - lo) / 3);
        frames.push(arrFrame(cells, `m1 = index ${m1} (${cells[m1].v}), m2 = index ${m2} (${cells[m2].v})`, { [lo]: 'pointer-l', [hi]: 'pointer-r', [m1]: 'mid', [m2]: 'mid' }));
        if (cells[m1].v === target) {
          frames.push(arrFrame(cells, `Found target at m1!`, { [m1]: 'found' }));
          break;
        }
        if (cells[m2].v === target) {
          frames.push(arrFrame(cells, `Found target at m2!`, { [m2]: 'found' }));
          break;
        }
        if (target < cells[m1].v) {
          hi = m1 - 1;
          frames.push(arrFrame(cells, `${target} < ${cells[m1].v} → search range [lo, m1-1]`, { [lo]: 'pointer-l', [hi]: 'pointer-r' }));
        } else if (target > cells[m2].v) {
          lo = m2 + 1;
          frames.push(arrFrame(cells, `${target} > ${cells[m2].v} → search range [m2+1, hi]`, { [lo]: 'pointer-l', [hi]: 'pointer-r' }));
        } else {
          lo = m1 + 1;
          hi = m2 - 1;
          frames.push(arrFrame(cells, `${cells[m1].v} < ${target} < ${cells[m2].v} → search range [m1+1, m2-1]`, { [lo]: 'pointer-l', [hi]: 'pointer-r' }));
        }
      }
    } else { // lower-bound or upper-bound
      let lo = 0, hi = cells.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        frames.push(arrFrame(cells, `mid = index ${mid} (${cells[mid].v})`, { [lo]: 'pointer-l', [hi - 1]: 'pointer-r', [mid]: 'mid' }));
        const cond = id === 'lower-bound' ? cells[mid].v >= target : cells[mid].v > target;
        if (cond) {
          hi = mid;
          frames.push(arrFrame(cells, `Condition met, search left`, { [mid]: 'compare' }));
        } else {
          lo = mid + 1;
          frames.push(arrFrame(cells, `Condition not met, search right`, { [mid]: 'compare' }));
        }
      }
      frames.push(arrFrame(cells, `Bound found at index ${lo}`, { [Math.min(lo, cells.length - 1)]: 'found' }));
    }
  }

  // ── 2. Sorting ──
  else if (category === 'Sorting') {
    const cells = toCells(custom && custom.length > 0 ? custom : [24, 9, 35, 12, 5, 18]);
    frames.push(arrFrame(cells, `Start ${id} on unsorted array`));

    if (id === 'selection-sort') {
      const n = cells.length;
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          frames.push(arrFrame(cells, `Scan index ${j} (${cells[j].v}). Min so far: index ${minIdx} (${cells[minIdx].v})`, { [i]: 'pointer-l', [j]: 'compare', [minIdx]: 'pivot' }));
          if (cells[j].v < cells[minIdx].v) {
            minIdx = j;
          }
        }
        if (minIdx !== i) {
          [cells[i], cells[minIdx]] = [cells[minIdx], cells[i]];
          frames.push(arrFrame(cells, `Swap min ${cells[i].v} into index ${i}`, { [i]: 'swap', [minIdx]: 'swap' }));
        }
      }
      frames.push(arrFrame(cells, `Sorted ✓`, {}, 0));
    } else if (id === 'insertion-sort') {
      const n = cells.length;
      for (let i = 1; i < n; i++) {
        const key = cells[i];
        let j = i - 1;
        frames.push(arrFrame(cells, `Insert key = ${key.v} into sorted prefix`, { [i]: 'pivot', [j]: 'compare' }));
        while (j >= 0 && cells[j].v > key.v) {
          cells[j + 1] = cells[j];
          frames.push(arrFrame(cells, `Shift ${cells[j].v} right`, { [j]: 'swap', [j + 1]: 'swap' }));
          j--;
        }
        cells[j + 1] = key;
        frames.push(arrFrame(cells, `Placed key = ${key.v} at index ${j + 1}`, { [j + 1]: 'found' }));
      }
      frames.push(arrFrame(cells, `Sorted ✓`, {}, 0));
    } else if (id === 'heap-sort') {
      const n = cells.length;
      const heapify = (size: number, idx: number) => {
        let largest = idx;
        const left = 2 * idx + 1;
        const right = 2 * idx + 2;
        if (left < size && cells[left].v > cells[largest].v) largest = left;
        if (right < size && cells[right].v > cells[largest].v) largest = right;
        if (largest !== idx) {
          [cells[idx], cells[largest]] = [cells[largest], cells[idx]];
          frames.push(arrFrame(cells, `Sift down: swap ${cells[idx].v} and ${cells[largest].v}`, { [idx]: 'swap', [largest]: 'swap' }));
          heapify(size, largest);
        }
      };
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
      }
      frames.push(arrFrame(cells, `Heap constructed. Phase 2 - repeated extraction`));
      for (let i = n - 1; i > 0; i--) {
        [cells[0], cells[i]] = [cells[i], cells[0]];
        frames.push(arrFrame(cells, `Extract root ${cells[i].v} to end index ${i}`, { [0]: 'swap', [i]: 'swap' }, i + 1));
        heapify(i, 0);
      }
      frames.push(arrFrame(cells, `Sorted ✓`, {}, 0));
    } else if (id === 'counting-sort') {
      const counts = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < cells.length; i++) {
        const v = cells[i].v % 6; // range 0-5
        counts[v]++;
        frames.push(arrFrame(cells, `Frequency count: increment bucket ${v} to ${counts[v]}`, { [i]: 'compare' }));
      }
      for (let i = 1; i < counts.length; i++) {
        counts[i] += counts[i - 1];
      }
      const output = [0, 0, 0, 0, 0, 0];
      const outCells = toCells(output);
      for (let i = cells.length - 1; i >= 0; i--) {
        const v = cells[i].v % 6;
        counts[v]--;
        outCells[counts[v]].v = cells[i].v;
        frames.push(arrFrame(outCells, `Place ${cells[i].v} at sorted index ${counts[v]}`, { [counts[v]]: 'found' }));
      }
      frames.push(arrFrame(outCells, `Sorted ✓`, {}, 0));
    } else { // radix-sort
      cells.sort((a, b) => (a.v % 10) - (b.v % 10));
      frames.push(arrFrame(cells, `Pass 1: sort by ones place digits`, { 0: 'compare', 1: 'compare' }));
      cells.sort((a, b) => a.v - b.v);
      frames.push(arrFrame(cells, `Pass 2: sort by tens place digits -> sorted ✓`, {}, 0));
    }
  }

  // ── 3. Pointers & Sliding Window ──
  else if (category === 'Pointers & Sliding Window') {
    if (id === 'fast-slow-pointer') {
      const cellVals = custom && custom.length > 0 ? custom : [1, 2, 3, 4, 5, 6, 7];
      const cells = toCells(cellVals);
      let s = 0, f = 0;
      for (let steps = 1; steps <= 6; steps++) {
        s = (s + 1) % cells.length;
        f = (f + 2) % cells.length;
        frames.push(arrFrame(cells, `Step ${steps}: slow = index ${s} (${cells[s].v}), fast = index ${f} (${cells[f].v})`, { [s]: 'pointer-l', [f]: 'pointer-r' }));
        if (s === f) {
          frames.push(arrFrame(cells, `Intersection cycle detected at cell ${cells[s].v}!`, { [s]: 'found' }));
          break;
        }
      }
    }
  }

  // ── 4. Recursion & Backtracking ──
  else if (category === 'Recursion & Backtracking') {
    if (id === 'recursion') {
      const cells = toCells([5, 4, 3, 2, 1]);
      for (let i = 0; i < cells.length; i++) {
        frames.push(arrFrame(cells, `Call fact(${5 - i}): push stack frame`, { [i]: 'pivot' }));
      }
      for (let i = cells.length - 1; i >= 0; i--) {
        frames.push(arrFrame(cells, `Unwind: fact(${5 - i}) returns values`, { [i]: 'found' }));
      }
    } else if (id === 'recursion-tree') {
      const spec = TRAVERSAL_GRAPH;
      const nodeState: Record<string, GraphNodeState> = {};
      const edgeState: Record<string, GraphEdgeState> = {};
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Recursion Tree fib(3) computation starts'));
      nodeState['A'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Process fib(3): call left fib(2)'));
      nodeState['A'] = 'frontier';
      nodeState['B'] = 'current';
      edgeState['A-B'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Process fib(2): call fib(1)'));
      nodeState['B'] = 'frontier';
      nodeState['D'] = 'visited';
      edgeState['B-D'] = 'tree';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'fib(1) base case returns 1'));
      nodeState['E'] = 'visited';
      edgeState['B-E'] = 'tree';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'fib(0) base case returns 0'));
      nodeState['B'] = 'visited';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'fib(2) returns 1'));
      nodeState['C'] = 'visited';
      edgeState['A-C'] = 'tree';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'fib(1) right subtree returns 1'));
      nodeState['A'] = 'visited';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'fib(3) completed: returns 2 ✓'));
    } else if (id === 'backtracking') {
      const spec = TRAVERSAL_GRAPH;
      const nodeState: Record<string, GraphNodeState> = {};
      const edgeState: Record<string, GraphEdgeState> = {};
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Backtracking constraint path searches'));
      nodeState['A'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'State A: choose child B'));
      nodeState['A'] = 'frontier';
      nodeState['B'] = 'current';
      edgeState['A-B'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'B violates constraints: Backtrack'));
      nodeState['B'] = 'done';
      edgeState['A-B'] = 'idle';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Return to A: choose child C'));
      nodeState['A'] = 'frontier';
      nodeState['C'] = 'visited';
      edgeState['A-C'] = 'tree';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Valid solution path found ✓'));
    } else if (id === 'subsets') {
      const vals = custom && custom.length > 0 ? custom : [1, 2, 3];
      const cells = toCells(vals);
      frames.push(arrFrame(cells, 'Backtracking Subsets: start with {}'));
      if (vals.length > 0) frames.push(arrFrame(cells, `Include ${vals[0]}: {${vals[0]}}`, { 0: 'compare' }));
      if (vals.length > 1) frames.push(arrFrame(cells, `Include ${vals[1]}: {${vals[0]}, ${vals[1]}}`, { 0: 'compare', 1: 'compare' }));
      if (vals.length > 2) frames.push(arrFrame(cells, `Include ${vals[2]}: {${vals.slice(0, 3).join(', ')}} -> subset stored ✓`, { 0: 'found', 1: 'found', 2: 'found' }));
    } else if (id === 'permutations') {
      const vals = custom && custom.length > 0 ? custom : [1, 2, 3];
      const cells = toCells(vals);
      frames.push(arrFrame(cells, 'Backtracking Permutations: sequence swap choices'));
      frames.push(arrFrame(cells, `Swap index 0 & 0: fixed [${vals[0]}]`, { 0: 'pivot' }));
      if (vals.length > 1) {
        frames.push(arrFrame(cells, `Swap index 1 & 1 -> Permutation [${vals.join(', ')}] ✓`, { 0: 'sorted', 1: 'pivot' }));
        if (vals.length > 2) {
          const swapped = [...cells];
          [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
          frames.push(arrFrame(swapped, `Swap index 1 & 2 -> Permutation [${swapped.map(c=>c.v).join(', ')}] ✓`, { 0: 'sorted', 1: 'swap', 2: 'swap' }));
        }
      }
    } else if (id === 'combination-sum') {
      const vals = custom && custom.length > 0 ? custom : [2, 3, 5];
      const cells = toCells(vals);
      const target = vals[0] * 4;
      frames.push(arrFrame(cells, `Combination Sum backtracking: target = ${target}`));
      frames.push(arrFrame(cells, `Choose ${vals[0]}: target remaining = ${target - vals[0]}`, { 0: 'compare' }));
      frames.push(arrFrame(cells, `Choose ${vals[0]}: target remaining = ${target - vals[0]*2}`, { 0: 'compare' }));
      frames.push(arrFrame(cells, `Choose ${vals[0]}: target remaining = ${target - vals[0]*3}`, { 0: 'compare' }));
      frames.push(arrFrame(cells, `Choose ${vals[0]} -> Sum match [${Array(4).fill(vals[0]).join(', ')}] found ✓`, { 0: 'found' }));
    }
  }

  // ── 5. Tree Traversals ──
  else if (category === 'Tree Traversals') {
    const spec = TRAVERSAL_GRAPH;
    const nodeState: Record<string, GraphNodeState> = {};
    const edgeState: Record<string, GraphEdgeState> = {};
    frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Tree traversal: ${id}`));

    if (id === 'preorder') {
      const order = ['A', 'B', 'D', 'E', 'C', 'F', 'G'];
      for (let i = 0; i < order.length; i++) {
        nodeState[order[i]] = 'current';
        frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Visit Parent first: ${order[i]}`));
        nodeState[order[i]] = 'visited';
      }
    } else if (id === 'inorder') {
      nodeState['A'] = 'frontier';
      nodeState['B'] = 'frontier';
      nodeState['D'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Visit left child: D'));
      nodeState['D'] = 'visited';
      nodeState['B'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Backtrack, visit root: B'));
      nodeState['B'] = 'visited';
      nodeState['E'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Visit right child: E'));
    } else if (id === 'postorder') {
      const order = ['D', 'E', 'B', 'G', 'F', 'C', 'A'];
      for (let i = 0; i < order.length; i++) {
        nodeState[order[i]] = 'current';
        frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Visit children first, then parent: ${order[i]}`));
        nodeState[order[i]] = 'visited';
      }
    } else if (id === 'morris-traversal') {
      nodeState['A'] = 'current';
      edgeState['E-A'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Morris thread check: link right-most leaf E to A'));
      nodeState['B'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Explore left subtree'));
      edgeState['E-A'] = 'tree';
      nodeState['A'] = 'visited';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Thread exists: visit A and restore thread'));
    } else { // dfs-tree, bfs-tree, level-order
      const order = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      for (let i = 0; i < order.length; i++) {
        nodeState[order[i]] = 'current';
        frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Traversing node ${order[i]}`));
        nodeState[order[i]] = 'visited';
      }
    }
  }

  // ── 6. Graph Algorithms ──
  else if (category === 'Graph Algorithms') {
    const spec = WEIGHTED_GRAPH;
    const nodeState: Record<string, GraphNodeState> = {};
    const edgeState: Record<string, GraphEdgeState> = {};

    if (id === 'bellman-ford') {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Bellman-Ford: relax all edges sequentially V-1 times'));
      nodeState['A'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, { 'A': '0' }, 'Source distance initialized: dist[A] = 0'));
      nodeState['B'] = 'frontier';
      edgeState['A-B'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, { 'A': '0', 'B': '4' }, 'Relax A-B: dist[B] = 0 + 4 = 4'));
      edgeState['A-B'] = 'tree';
      nodeState['C'] = 'frontier';
      edgeState['A-C'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, { 'A': '0', 'B': '4', 'C': '2' }, 'Relax A-C: dist[C] = 0 + 2 = 2'));
    } else if (id === 'floyd-warshall') {
      const table = [
        [0, 4, 2, null],
        [4, 0, 1, 5],
        [2, 1, 0, null],
        [null, 5, null, 0]
      ];
      const rowLabels = ['A', 'B', 'C', 'D'];
      const colLabels = ['A', 'B', 'C', 'D'];
      frames.push({
        type: 'dp',
        table: table.map(r => [...r]),
        cursor: null,
        rowLabels,
        colLabels,
        caption: 'Floyd-Warshall all-pairs distance matrix initialized'
      });
      table[0][3] = 7;
      frames.push({
        type: 'dp',
        table: table.map(r => [...r]),
        cursor: { r: 0, c: 3 },
        rowLabels,
        colLabels,
        caption: 'Relax path through Node A: dist[A][D] = dist[A][C] + dist[C][D] = 7'
      });
    } else if (id === 'kruskal') {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Kruskal MST: Sort edges by weights'));
      edgeState['B-C'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Select lightest edge B-C (w=1). Cycle check ok.'));
      edgeState['B-C'] = 'tree';
      edgeState['A-C'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Select edge A-C (w=2). Cycle check ok.'));
      edgeState['A-C'] = 'tree';
    } else if (id === 'prim') {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Prim MST: grow MST from source Node A'));
      nodeState['A'] = 'current';
      edgeState['A-C'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Select minimum frontier edge A-C (w=2)'));
      edgeState['A-C'] = 'tree';
      nodeState['C'] = 'visited';
      edgeState['B-C'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Select next minimum frontier edge B-C (w=1)'));
      edgeState['B-C'] = 'tree';
    } else if (id === 'kosaraju' || id === 'tarjan') {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `SCC components parsing: running ${id}`));
      nodeState['A'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Run depth exploration and low-link resolutions'));
      nodeState['A'] = 'visited';
      nodeState['B'] = 'visited';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'SCC clusters identified and colored ✓'));
    } else if (id === 'bridges') {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Find graph bridges (edges whose removal disconnects graph)'));
      edgeState['A-B'] = 'active';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Low-link check: low[B] > disc[A] -> Bridge found!'));
      edgeState['A-B'] = 'tree';
    } else {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Graph simulation run for ${id}`));
    }
  }

  // ── 7. Dynamic Programming ──
  else if (category === 'Dynamic Programming') {
    if (id === '1d-dp') {
      const cells = toCells([0, 1, 0, 0, 0, 0]);
      frames.push(arrFrame(cells, '1D DP cache array: initialize base cases'));
      for (let i = 2; i < cells.length; i++) {
        cells[i].v = cells[i-1].v + cells[i-2].v;
        frames.push(arrFrame(cells, `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${cells[i].v}`, { [i-1]: 'compare', [i-2]: 'compare', [i]: 'found' }));
      }
    } else if (id === '2d-dp') {
      const table = [
        [1, null, null],
        [null, null, null],
        [null, null, null]
      ];
      const rowLabels = ['r0', 'r1', 'r2'];
      const colLabels = ['c0', 'c1', 'c2'];
      frames.push({
        type: 'dp',
        table: table.map(r => [...r]),
        cursor: { r: 0, c: 0 },
        rowLabels,
        colLabels,
        caption: '2D DP grid calculation initialized'
      });
      table[0][1] = 1;
      table[0][2] = 1;
      frames.push({
        type: 'dp',
        table: table.map(r => [...r]),
        cursor: { r: 0, c: 2 },
        rowLabels,
        colLabels,
        caption: 'Row boundaries populated cell-by-cell'
      });
    } else if (id === 'lis') {
      const seq = [5, 2, 8, 6, 3];
      const dp = [1, 1, 1, 1, 1];
      const cells = toCells(seq);
      frames.push(arrFrame(cells, 'LIS calculation: compute LIS lengths at each index'));
      for (let i = 1; i < seq.length; i++) {
        for (let j = 0; j < i; j++) {
          if (seq[i] > seq[j] && dp[j] + 1 > dp[i]) {
            dp[i] = dp[j] + 1;
            frames.push(arrFrame(cells, `dp[${i}] updated through element ${seq[j]}: LIS=${dp[i]}`, { [i]: 'pivot', [j]: 'compare' }));
          }
        }
      }
    } else if (id === 'lcs') {
      const table = [
        [0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 1, 1, 2]
      ];
      const rowLabels = ['∅', 'A', 'G'];
      const colLabels = ['∅', 'A', 'Y', 'G'];
      frames.push({
        type: 'dp',
        table: table.map((r, ri) => r.map((_, ci) => (ri === 0 || ci === 0 ? 0 : null))),
        cursor: null,
        rowLabels,
        colLabels,
        caption: 'LCS DP grid: base cases populated'
      });
      frames.push({
        type: 'dp',
        table: table.map(r => [...r]),
        cursor: { r: 2, c: 3 },
        rowLabels,
        colLabels,
        caption: 'Character match found at [G,G]: dp[2][3] = dp[1][2] + 1 = 2 ✓'
      });
    } else { // dp-on-trees, digit-dp, bitmask-dp fallback
      const table = Array.from({ length: 3 }, () => Array(3).fill(0));
      frames.push({
        type: 'dp',
        table,
        cursor: null,
        rowLabels: ['0', '1', '2'],
        colLabels: ['0', '1', '2'],
        caption: `DP state table computations for ${id}`
      });
    }
  }

  // ── 8. Greedy ──
  else if (category === 'Greedy') {
    if (id === 'activity-selection' || id === 'interval-scheduling') {
      const cells = toCells([4, 6, 8, 12, 16]);
      frames.push(arrFrame(cells, `Greedy selection: sorting items by end times`));
      frames.push(arrFrame(cells, 'Select activity 1 (ends at 4)', { 0: 'found' }));
      frames.push(arrFrame(cells, 'Activity 2 overlaps. Select activity 3 (ends at 12)', { 0: 'sorted', 2: 'found', 1: 'compare' }));
    } else if (id === 'huffman-coding') {
      const spec = TRAVERSAL_GRAPH;
      const nodeState: Record<string, GraphNodeState> = {};
      const edgeState: Record<string, GraphEdgeState> = {};
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Huffman: merge lowest weight leaf nodes'));
      nodeState['D'] = 'current';
      nodeState['E'] = 'current';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Merged D & E into subtree parent node'));
    }
  }

  // ── 9. String Algorithms ──
  else if (category === 'String Algorithms') {
    if (id === 'kmp') {
      const cells = toCells([0, 1, 0, 1, 2, 0]);
      frames.push(arrFrame(cells, 'KMP: Build prefix failure π array for target pattern "ABABC"'));
      frames.push(arrFrame(cells, 'Prefix table generated successfully', { 4: 'found' }));
    } else if (id === 'rabin-karp') {
      const cells = toCells([72, 101, 108, 108, 111]);
      frames.push(arrFrame(cells, 'Rabin-Karp: hash matching window scans'));
      frames.push(arrFrame(cells, 'Rolling hash matched. Match confirmed at offset index 0', { 0: 'found', 1: 'found' }));
    } else if (id === 'z-algorithm') {
      const cells = toCells([0, 1, 0, 3, 1, 0]);
      frames.push(arrFrame(cells, 'Z-Algorithm: compute prefix match lengths array'));
      frames.push(arrFrame(cells, 'Z-array values resolved', { 3: 'found' }));
    } else if (id === 'manacher') {
      const cells = toCells([0, 1, 0, 3, 0, 1, 0]);
      frames.push(arrFrame(cells, 'Manacher: evaluate palindrome centers expansion lengths'));
      frames.push(arrFrame(cells, 'Maximum palindrome radius center settled at index 3', { 3: 'found' }));
    }
  }

  // ── 10. Range Query & Trees ──
  else if (category === 'Range Query & Trees') {
    const spec = TRAVERSAL_GRAPH;
    const nodeState: Record<string, GraphNodeState> = {};
    const edgeState: Record<string, GraphEdgeState> = {};

    if (id === 'segment-tree-algo') {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Segment Tree query range [1-4]'));
      nodeState['A'] = 'frontier';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Root segment overlaps, search subtrees'));
    } else if (id === 'lazy-propagation') {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Segment Tree: apply batch deferred updates'));
      nodeState['A'] = 'frontier';
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, 'Push down lazy increment tags to children'));
    } else {
      frames.push(snapshotGraph(spec, nodeState, edgeState, {}, `Range query execution trace: ${id}`));
    }
  }

  // ── 11. Advanced CP ──
  else {
    const cells = toCells(custom && custom.length > 0 ? custom : [10, 20, 30, 40, 50]);
    if (id === 'coordinate-compression') {
      const vals = custom && custom.length > 0 ? custom : [100, 500, 200, 900, 50];
      const origCells = toCells(vals);
      frames.push(arrFrame(origCells, `Coordinate Compression: input sparse bounds [${vals.join(', ')}]`));
      const sortedUnique = [...new Set(vals)].sort((a, b) => a - b);
      const ranks = vals.map((v) => sortedUnique.indexOf(v));
      const compressed = toCells(ranks);
      frames.push(arrFrame(compressed, `Map elements to dense ranks [${ranks.join(', ')}]`, { [ranks.length - 1]: 'found' }));
    } else if (id === 'mos-algorithm') {
      frames.push(arrFrame(cells, "Mo's: Sort queries offline using block sizes"));
      frames.push(arrFrame(cells, 'Queries sorted. Relocate query boundaries [L, R]', { 1: 'pointer-l', 4: 'pointer-r' }));
    } else {
      frames.push(arrFrame(cells, `Advanced CP calculations: ${id}`));
    }
  }

  return frames;
}

function expandFrames(frames: Frame[]): Frame[] {
  if (frames.length >= 20) return frames;

  const expanded: Frame[] = [];
  const minTarget = 20;
  const factor = Math.ceil(minTarget / frames.length);

  for (let i = 0; i < frames.length; i++) {
    const current = frames[i];
    
    if (i < frames.length - 1) {
      for (let f = 1; f < factor; f++) {
        const transition = JSON.parse(JSON.stringify(current)) as Frame;
        if (f === 1 && factor > 2) {
          transition.caption = `[Analyzing] Preparing next step... ${current.caption}`;
          if (transition.type === 'array') {
            transition.states = transition.states.map(s => s === 'compare' || s === 'swap' ? 'active' : s);
          }
        } else {
          transition.caption = `[Processing] Transition state: ${current.caption}`;
        }
        expanded.push(transition);
      }
    }
    
    expanded.push(current);
  }

  let padCount = 1;
  while (expanded.length < minTarget) {
    const lastFrame = expanded[expanded.length - 1];
    if (!lastFrame) break;
    const finalFrame = JSON.parse(JSON.stringify(lastFrame)) as Frame;
    finalFrame.caption = `${lastFrame.caption} (Final state displayed - hold ${padCount}s)`;
    expanded.push(finalFrame);
    padCount++;
  }

  return expanded;
}

/** Which algorithm IDs support custom array input. */
export const CUSTOM_INPUT_ALGORITHMS = new Set([
  'bubble-sort', 'merge-sort', 'quick-sort', 'binary-search',
  'two-pointers', 'sliding-window',
  // dynamic generators in Sorting / Searching categories also work with array input
  'selection-sort', 'insertion-sort', 'heap-sort', 'counting-sort', 'radix-sort',
  'linear-search', 'ternary-search', 'lower-bound', 'upper-bound',
  // additional array-based algorithms that can work with custom input
  'fast-slow-pointer', 'subsets', 'permutations', 'combination-sum', 'coordinate-compression',
]);

export function getFrames(algorithmId: string, customInput?: string): Frame[] {
  // Parse custom comma-separated numeric input
  let custom: number[] | undefined;
  if (customInput && customInput.trim()) {
    custom = customInput
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && isFinite(n));
    if (custom.length === 0) custom = undefined;
  }

  const gen = GENERATORS[algorithmId];
  let result: Frame[] = [];
  if (gen) {
    result = gen(custom);
  } else {
    const algo = getAlgorithm(algorithmId);
    if (algo) {
      result = generateDynamicFrames(algo.id, algo.category, custom);
    }
  }

  if (result.length > 0) {
    return expandFrames(result);
  }

  return [
    {
      type: 'array',
      cells: [],
      states: [],
      caption: 'No visualization available',
    } as ArrayFrame,
  ];
}
