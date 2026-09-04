import type {
  ArrayCell,
  ArrayCellState,
  ArrayFrame,
  DPFrame,
  Frame,
  GraphEdgeState,
  GraphFrame,
  GraphNodeState,
  TraceMeta,
} from './algorithmFrames';

type Marks = Partial<Record<number, ArrayCellState>>;

const cells = (values: number[]): ArrayCell[] => values.map((v, id) => ({ id, v }));
const cloneCells = (values: ArrayCell[]) => values.map((cell) => ({ ...cell }));
const states = (length: number, marks: Marks = {}): ArrayCellState[] =>
  Array.from({ length }, (_, index) => marks[index] ?? 'idle');
const randomValues = (length = 8, min = 4, max = 60): number[] =>
  Array.from({ length }, () => min + Math.floor(Math.random() * (max - min + 1)));

const info = (
  operation: string,
  phase: string,
  why: string,
  state?: TraceMeta['state'],
  invariant?: string,
  collections?: TraceMeta['collections'],
  important = false,
): TraceMeta => ({ operation, phase, why, state, invariant, collections, important });

const arrayFrame = (
  values: ArrayCell[],
  caption: string,
  marks: Marks,
  meta: TraceMeta,
  eliminated?: number[],
): ArrayFrame => ({
  type: 'array',
  cells: cloneCells(values),
  states: states(values.length, marks),
  caption,
  meta,
  eliminated,
});

interface GraphSpec {
  directed: boolean;
  nodes: Array<{ id: string; x: number; y: number }>;
  edges: Array<{ from: string; to: string; weight?: number }>;
}

const graphFrame = (
  spec: GraphSpec,
  caption: string,
  nodeStates: Record<string, GraphNodeState>,
  edgeStates: Record<string, GraphEdgeState>,
  badges: Record<string, string>,
  meta: TraceMeta,
): GraphFrame => ({
  type: 'graph',
  directed: spec.directed,
  caption,
  meta,
  nodes: spec.nodes.map((node) => ({ ...node, state: nodeStates[node.id] ?? 'idle', badge: badges[node.id] })),
  edges: spec.edges.map((edge) => ({
    ...edge,
    state: edgeStates[`${edge.from}-${edge.to}`] ?? edgeStates[`${edge.to}-${edge.from}`] ?? 'idle',
  })),
});

const dpFrame = (
  table: (number | null)[][],
  rowLabels: string[],
  colLabels: string[],
  cursor: { r: number; c: number } | null,
  caption: string,
  meta: TraceMeta,
  dependencies?: Array<{ r: number; c: number }>,
): DPFrame => ({ type: 'dp', table: table.map((row) => [...row]), rowLabels, colLabels, cursor, caption, meta, dependencies });

const TREE: GraphSpec = {
  directed: true,
  nodes: [
    { id: '8', x: 165, y: 24 },
    { id: '4', x: 88, y: 78 },
    { id: '12', x: 242, y: 78 },
    { id: '2', x: 45, y: 142 },
    { id: '6', x: 122, y: 142 },
    { id: '10', x: 208, y: 142 },
    { id: '14', x: 285, y: 142 },
  ],
  edges: [
    { from: '8', to: '4' }, { from: '8', to: '12' },
    { from: '4', to: '2' }, { from: '4', to: '6' },
    { from: '12', to: '10' }, { from: '12', to: '14' },
  ],
};

const DIRECTED_GRAPH: GraphSpec = {
  directed: true,
  nodes: [
    { id: 'A', x: 40, y: 96 }, { id: 'B', x: 132, y: 35 },
    { id: 'C', x: 132, y: 155 }, { id: 'D', x: 225, y: 35 },
    { id: 'E', x: 225, y: 155 }, { id: 'F', x: 305, y: 96 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 }, { from: 'A', to: 'C', weight: 2 },
    { from: 'C', to: 'B', weight: -1 }, { from: 'B', to: 'D', weight: 3 },
    { from: 'C', to: 'E', weight: 5 }, { from: 'D', to: 'E', weight: -2 },
    { from: 'D', to: 'F', weight: 4 }, { from: 'E', to: 'F', weight: 2 },
  ],
};

const UNDIRECTED_GRAPH: GraphSpec = {
  ...DIRECTED_GRAPH,
  directed: false,
  edges: DIRECTED_GRAPH.edges.map((edge) => ({ ...edge, weight: Math.abs(edge.weight ?? 1) })),
};

const SCC_GRAPH: GraphSpec = {
  directed: true,
  nodes: DIRECTED_GRAPH.nodes.map((node) => ({ ...node })),
  edges: [
    { from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'A' },
    { from: 'C', to: 'D' }, { from: 'D', to: 'E' }, { from: 'E', to: 'D' },
    { from: 'E', to: 'F' },
  ],
};

const BRIDGE_GRAPH: GraphSpec = {
  directed: false,
  nodes: DIRECTED_GRAPH.nodes.map((node) => ({ ...node })),
  edges: [
    { from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'A' },
    { from: 'C', to: 'D' },
    { from: 'D', to: 'E' }, { from: 'E', to: 'F' }, { from: 'F', to: 'D' },
  ],
};

function searchingTrace(id: string, custom?: number[]): Frame[] {
  const raw = custom?.length ? [...custom] : randomValues(9, 5, 45);
  const values = cells(raw);
  const target = raw[Math.floor(raw.length / 2)];
  const frames: Frame[] = [];
  if (id === 'linear-search') {
    frames.push(arrayFrame(values, `Search for ${target}`, {}, info('INITIALIZE', 'Search', 'Linear search makes no ordering assumption.', { target }, 'Indices before the cursor have been ruled out.')));
    for (let i = 0; i < values.length; i++) {
      frames.push(arrayFrame(values, `Compare A[${i}] = ${values[i].v} with ${target}`, { [i]: 'compare' }, info('COMPARE', 'Scan', 'The next unchecked position must be examined.', { index: i, target, value: values[i].v }, 'Every earlier index does not contain the target.')));
      if (values[i].v === target) {
        frames.push(arrayFrame(values, `Found ${target} at index ${i}`, { [i]: 'found' }, info('FOUND', 'Complete', 'The current value equals the target.', { index: i, comparisons: i + 1 }, 'The returned index contains the target.', undefined, true)));
        break;
      }
    }
    return frames;
  }

  values.sort((a, b) => a.v - b.v);
  frames.push(arrayFrame(values, `Sorted search input; target = ${target}`, {}, info('INITIALIZE', 'Search', 'Ordered search requires a sorted range.', { target, length: values.length }, 'The target, if present, lies in the active range.')));
  let lo = 0;
  let hi = id === 'lower-bound' || id === 'upper-bound' ? values.length : values.length - 1;
  while (id === 'lower-bound' || id === 'upper-bound' ? lo < hi : lo <= hi) {
    if (id === 'ternary-search') {
      const m1 = lo + Math.floor((hi - lo) / 3);
      const m2 = hi - Math.floor((hi - lo) / 3);
      frames.push(arrayFrame(values, `Probe indices ${m1} and ${m2}`, { [lo]: 'pointer-l', [hi]: 'pointer-r', [m1]: 'mid', [m2]: 'mid' }, info('COMPARE', 'Narrow range', 'Two pivots divide the active sorted range into thirds.', { lo, m1, m2, hi, target }, 'All eliminated indices cannot contain the target.'), Array.from({ length: values.length }, (_, i) => i).filter((i) => i < lo || i > hi)));
      if (values[m1].v === target || values[m2].v === target) {
        const found = values[m1].v === target ? m1 : m2;
        frames.push(arrayFrame(values, `Found ${target} at index ${found}`, { [found]: 'found' }, info('FOUND', 'Complete', 'One probe equals the target.', { index: found }, undefined, undefined, true)));
        return frames;
      }
      if (target < values[m1].v) hi = m1 - 1;
      else if (target > values[m2].v) lo = m2 + 1;
      else { lo = m1 + 1; hi = m2 - 1; }
      continue;
    }

    const mid = Math.floor((lo + hi) / 2);
    const rightIndex = Math.min(values.length - 1, hi - (id === 'lower-bound' || id === 'upper-bound' ? 1 : 0));
    frames.push(arrayFrame(values, `Compare A[${mid}] = ${values[mid].v}`, { [lo]: 'pointer-l', [rightIndex]: 'pointer-r', [mid]: 'mid' }, info('COMPARE', 'Narrow range', 'The midpoint determines which sorted half remains possible.', { lo, mid, hi, target, value: values[mid].v }, 'The answer remains inside the active interval.'), Array.from({ length: values.length }, (_, i) => i).filter((i) => i < lo || i > rightIndex)));
    if (id === 'lower-bound') {
      if (values[mid].v >= target) hi = mid; else lo = mid + 1;
    } else if (id === 'upper-bound') {
      if (values[mid].v > target) hi = mid; else lo = mid + 1;
    } else {
      if (values[mid].v === target) {
        frames.push(arrayFrame(values, `Found ${target} at index ${mid}`, { [mid]: 'found' }, info('FOUND', 'Complete', 'The midpoint equals the target.', { index: mid }, undefined, undefined, true)));
        return frames;
      }
      if (values[mid].v < target) lo = mid + 1; else hi = mid - 1;
    }
  }
  const found = lo < values.length ? lo : -1;
  frames.push(arrayFrame(values, found >= 0 ? `${id === 'lower-bound' ? 'Lower' : 'Upper'} bound is index ${lo}` : `Bound is one-past-end (${lo})`, found >= 0 ? { [found]: 'found' } : {}, info('RETURN', 'Complete', 'The half-open search interval has converged.', { index: lo, target }, 'Every earlier value fails the bound predicate.', undefined, true)));
  return frames;
}

function auxiliarySortingTrace(id: string, custom?: number[]): Frame[] {
  const values = cells(custom?.length ? custom : randomValues());
  const frames: Frame[] = [arrayFrame(values, `Start ${id}`, {}, info('INITIALIZE', 'Sort', 'Prepare the input sequence.', { length: values.length }))];
  let comparisons = 0;
  let writes = 0;
  if (id === 'selection-sort') {
    for (let i = 0; i < values.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < values.length; j++) {
        comparisons++;
        frames.push(arrayFrame(values, `Compare candidate ${values[min].v} with ${values[j].v}`, { [i]: 'pointer-l', [min]: 'pivot', [j]: 'compare' }, info('COMPARE', 'Select minimum', 'Scan the unsorted suffix for its smallest value.', { i, j, min, comparisons }, 'Positions before i are finalized.')));
        if (values[j].v < values[min].v) min = j;
      }
      if (min !== i) { [values[i], values[min]] = [values[min], values[i]]; writes += 2; }
      frames.push(arrayFrame(values, `Finalize index ${i}`, { [i]: 'sorted', ...(min !== i ? { [min]: 'swap' as const } : {}) }, info('FINALIZE', 'Place minimum', 'The suffix minimum belongs at the first unsorted index.', { i, min, writes }, 'The prefix through i is sorted and final.', undefined, true)));
    }
  } else if (id === 'insertion-sort') {
    for (let i = 1; i < values.length; i++) {
      let j = i;
      frames.push(arrayFrame(values, `Insert ${values[i].v} into prefix [0…${i - 1}]`, { [i]: 'pivot' }, info('SELECT', 'Insertion', 'The next value must be placed in the sorted prefix.', { i }, 'A[0…i-1] is sorted.')));
      while (j > 0) {
        comparisons++;
        frames.push(arrayFrame(values, `Compare ${values[j - 1].v} and ${values[j].v}`, { [j - 1]: 'compare', [j]: 'pivot' }, info('COMPARE', 'Insertion', 'Move left while the predecessor is larger.', { i, j, comparisons }, 'A[0…i] is a permutation of the original prefix.')));
        if (values[j - 1].v <= values[j].v) break;
        [values[j - 1], values[j]] = [values[j], values[j - 1]];
        writes += 2;
        j--;
        frames.push(arrayFrame(values, `Shift key left to index ${j}`, { [j]: 'swap', [j + 1]: 'swap' }, info('SHIFT', 'Insertion', 'Swapping adjacent inverted values preserves the sorted prefix.', { keyIndex: j, writes }, 'A[0…i] is sorted after the key reaches its insertion point.')));
      }
    }
  } else if (id === 'heap-sort') {
    const heapify = (size: number, root: number) => {
      let current = root;
      while (true) {
        const left = current * 2 + 1;
        const right = left + 1;
        let largest = current;
        if (left < size) { comparisons++; if (values[left].v > values[largest].v) largest = left; }
        if (right < size) { comparisons++; if (values[right].v > values[largest].v) largest = right; }
        frames.push(arrayFrame(values, `Heapify node ${current}; largest = ${largest}`, { [current]: 'pivot', ...(left < size ? { [left]: 'compare' as const } : {}), ...(right < size ? { [right]: 'compare' as const } : {}) }, info('HEAPIFY', 'Restore heap', 'Compare the parent with its children.', { size, root: current, largest, comparisons }, 'Every subtree below current is already a max-heap.')));
        if (largest === current) return;
        [values[current], values[largest]] = [values[largest], values[current]];
        writes += 2;
        frames.push(arrayFrame(values, `Swap parent with larger child`, { [current]: 'swap', [largest]: 'swap' }, info('SWAP', 'Restore heap', 'The larger child must become the subtree root.', { current, largest, writes })));
        current = largest;
      }
    };
    for (let i = Math.floor(values.length / 2) - 1; i >= 0; i--) heapify(values.length, i);
    frames.push(arrayFrame(values, 'Max-heap constructed', { 0: 'pivot' }, info('BUILD HEAP', 'Heap ready', 'The maximum is now at the root.', { heapSize: values.length }, 'Every parent is at least as large as its children.', undefined, true)));
    for (let end = values.length - 1; end > 0; end--) {
      [values[0], values[end]] = [values[end], values[0]];
      writes += 2;
      frames.push(arrayFrame(values, `Extract maximum to index ${end}`, { 0: 'swap', [end]: 'sorted' }, info('EXTRACT', 'Sort down', 'Move the heap maximum into its final suffix position.', { heapSize: end, writes }, 'The suffix after the heap is sorted and final.', undefined, true)));
      heapify(end, 0);
    }
  } else if (id === 'counting-sort') {
    if (values.length === 0) return frames;
    const min = Math.min(...values.map((cell) => cell.v));
    const max = Math.max(...values.map((cell) => cell.v));
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max - min > 2048) {
      frames.push(arrayFrame(values, 'Counting sort key range is too large', {}, { ...info('INVALID INPUT', 'Validation', 'Counting sort allocates one counter per integer key.'), invalid: 'Use safe integers with a maximum key range of 2048 for this visualizer.' }));
      return frames;
    }
    const count = Array(max - min + 1).fill(0) as number[];
    for (let i = 0; i < values.length; i++) {
      count[values[i].v - min]++;
      frames.push(arrayFrame(values, `Count ${values[i].v}`, { [i]: 'compare' }, info('COUNT', 'Frequency pass', 'Increment the bucket for this exact key.', { index: i, key: values[i].v }, 'Counts equal frequencies in the processed prefix.', [{ label: 'counts', values: [...count] }])));
    }
    let out = 0;
    for (let bucket = 0; bucket < count.length; bucket++) {
      for (let k = 0; k < count[bucket]; k++) values[out++].v = bucket + min;
      if (count[bucket]) frames.push(arrayFrame(values, `Write ${count[bucket]} occurrence(s) of ${bucket + min}`, { [Math.max(0, out - 1)]: 'active' }, info('WRITE', 'Output pass', 'Buckets are emitted in increasing key order.', { bucket: bucket + min, outputSize: out }, 'The emitted prefix is sorted.', [{ label: 'counts', values: [...count] }])));
    }
  } else {
    if (values.some((cell) => cell.v < 0)) {
      frames.push(arrayFrame(values, 'Radix sort requires non-negative integers', {}, { ...info('INVALID INPUT', 'Validation', 'This LSD implementation uses decimal digit buckets 0–9.'), invalid: 'Negative values are not supported by this radix-sort variant.' }));
      return frames;
    }
    const max = Math.max(0, ...values.map((cell) => cell.v));
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      const buckets = Array.from({ length: 10 }, () => [] as ArrayCell[]);
      for (let i = 0; i < values.length; i++) {
        const digit = Math.floor(values[i].v / exp) % 10;
        buckets[digit].push(values[i]);
        frames.push(arrayFrame(values, `Place ${values[i].v} in digit bucket ${digit}`, { [i]: 'compare' }, info('DISTRIBUTE', `Digit ${exp}`, 'Stable bucketing by the current digit preserves lower-digit order.', { exp, index: i, digit }, 'Elements processed so far are grouped stably.', buckets.map((bucket, index) => ({ label: String(index), values: bucket.map((cell) => cell.v) })))));
      }
      values.splice(0, values.length, ...buckets.flat());
      frames.push(arrayFrame(values, `Collect buckets for digit ${exp}`, {}, info('COLLECT', `Digit ${exp}`, 'Concatenating buckets completes this stable digit pass.', { exp }, 'The array is sorted by all digits through the current place.', undefined, true)));
    }
  }
  frames.push(arrayFrame(values, 'Sorted', Object.fromEntries(values.map((_, i) => [i, 'sorted'])) as Marks, info('COMPLETE', 'Done', 'Every key is in nondecreasing order.', { comparisons, writes }, 'A[i] ≤ A[i+1] for every valid i.', undefined, true)));
  return frames;
}

function pointerTrace(id: 'two-pointers' | 'sliding-window', custom?: number[]): Frame[] {
  const input = custom?.length ? [...custom] : randomValues(id === 'two-pointers' ? 8 : 9, 1, 25);
  const values = cells(id === 'two-pointers' ? input.sort((a, b) => a - b) : input);
  if (id === 'two-pointers') {
    if (values.length < 2) {
      return [
        arrayFrame(values, 'Initialize pair-sum search', {}, info('INITIALIZE', 'Two pointers', 'A pair needs two distinct positions.')),
        arrayFrame(values, 'At least two values are required', {}, { ...info('INVALID INPUT', 'Validation', 'Two pointer pair search cannot form a pair.'), invalid: 'Provide at least two numeric values.' }),
      ];
    }
    const target = values[0].v + values[values.length - 1].v;
    const frames: Frame[] = [];
    let left = 0;
    let right = values.length - 1;
    while (left < right) {
      const sum = values[left].v + values[right].v;
      frames.push(arrayFrame(values, `${values[left].v} + ${values[right].v} = ${sum}`, { [left]: 'pointer-l', [right]: 'pointer-r' }, info('COMPARE SUM', 'Converge pointers', sum === target ? 'The pair equals the target.' : sum < target ? 'The sum is too small, so only increasing the left value can help.' : 'The sum is too large, so only decreasing the right value can help.', { left, right, sum, target }, 'All pairs outside the active interval have been ruled out.', undefined, sum === target), Array.from({ length: values.length }, (_, i) => i).filter((i) => i < left || i > right)));
      if (sum === target) {
        frames.push(arrayFrame(values, `Pair found at ${left}, ${right}`, { [left]: 'found', [right]: 'found' }, info('FOUND', 'Complete', 'The two distinct positions sum to the target.', { left, right, target }, undefined, undefined, true)));
        break;
      }
      if (sum < target) left++; else right--;
    }
    return frames;
  }
  if (values.length === 0) {
    return [arrayFrame(values, 'Sliding window requires input', {}, { ...info('INVALID INPUT', 'Validation', 'There is no non-empty window in an empty sequence.'), invalid: 'Provide at least one numeric value.' })];
  }
  const width = Math.min(3, values.length);
  let sum = values.slice(0, width).reduce((total, cell) => total + cell.v, 0);
  let best = sum;
  let bestStart = 0;
  const frames: Frame[] = [];
  for (let start = 0; start + width <= values.length; start++) {
    if (start > 0) sum += values[start + width - 1].v - values[start - 1].v;
    if (sum > best) { best = sum; bestStart = start; }
    const marks = Object.fromEntries(Array.from({ length: width }, (_, k) => [start + k, 'window'])) as Marks;
    frames.push(arrayFrame(values, `Window [${start}, ${start + width - 1}] sum = ${sum}`, marks, info('SLIDE', 'Fixed-size window', start === 0 ? 'Compute the first window once.' : 'Remove the outgoing value and add the incoming value in O(1).', { start, end: start + width - 1, sum, best }, 'sum always equals exactly the values inside the current window.', undefined, sum === best)));
  }
  frames.push(arrayFrame(values, `Maximum sum ${best} at [${bestStart}, ${bestStart + width - 1}]`, Object.fromEntries(Array.from({ length: width }, (_, k) => [bestStart + k, 'found'])) as Marks, info('COMPLETE', 'Best window', 'Every fixed-size window was evaluated exactly once.', { best, bestStart, width }, 'The highlighted window has maximum observed sum.', undefined, true)));
  return frames;
}

function recursionTrace(id: string, custom?: number[]): Frame[] {
  if (id === 'subsets' || id === 'permutations' || id === 'combination-sum' || id === 'n-queens') return [];
  const frames: Frame[] = [];
  if (id === 'recursion') {
    const n = Math.max(0, Math.min(7, custom?.[0] ?? 5));
    const stack = cells(Array.from({ length: n + 1 }, (_, index) => n - index));
    for (let depth = 0; depth <= n; depth++) frames.push(arrayFrame(stack, `Enter fact(${n - depth})`, { [depth]: 'pivot' }, info('CALL', 'Descend', depth === n ? 'The base case returns 1.' : 'Factorial delegates to the next smaller argument.', { argument: n - depth, depth }, 'One frame exists for each active call.', [{ label: 'call stack', values: stack.slice(0, depth + 1).map((cell) => `fact(${cell.v})`) }], depth === n)));
    let result = 1;
    for (let depth = n - 1; depth >= 0; depth--) {
      result *= n - depth;
      frames.push(arrayFrame(stack, `Return ${result} from fact(${n - depth})`, { [depth]: 'found' }, info('RETURN', 'Unwind', 'Multiply the child result by the current argument.', { argument: n - depth, result, depth }, 'The returned value equals the factorial of this frame argument.', [{ label: 'call stack', values: stack.slice(0, depth + 1).map((cell) => `fact(${cell.v})`) }], true)));
    }
    return frames;
  }
  const spec: GraphSpec = {
    directed: true,
    nodes: [
      { id: 'f4', x: 165, y: 20 }, { id: 'f3a', x: 95, y: 70 }, { id: 'f2a', x: 235, y: 70 },
      { id: 'f2b', x: 55, y: 125 }, { id: 'f1a', x: 130, y: 125 }, { id: 'f1b', x: 205, y: 125 }, { id: 'f0', x: 280, y: 125 },
    ],
    edges: [
      { from: 'f4', to: 'f3a' }, { from: 'f4', to: 'f2a' },
      { from: 'f3a', to: 'f2b' }, { from: 'f3a', to: 'f1a' },
      { from: 'f2a', to: 'f1b' }, { from: 'f2a', to: 'f0' },
    ],
  };
  const order = ['f4', 'f3a', 'f2b', 'f1a', 'f2a', 'f1b', 'f0'];
  const nodeStates: Record<string, GraphNodeState> = {};
  for (let i = 0; i < order.length; i++) {
    nodeStates[order[i]] = 'current';
    frames.push(graphFrame(spec, `Explore call ${order[i]}`, nodeStates, {}, {}, info(id === 'backtracking' ? 'CHOOSE' : 'CALL', id === 'backtracking' ? 'Search' : 'Expand recursion tree', 'The execution follows one child call at a time.', { depth: i }, 'The active path is exactly the call stack.', [{ label: 'stack', values: order.slice(0, i + 1) }])));
    nodeStates[order[i]] = i >= 2 ? 'done' : 'frontier';
  }
  frames.push(graphFrame(spec, id === 'backtracking' ? 'Backtrack and accept the first valid branch' : 'All calls returned; fib(4) = 3', Object.fromEntries(order.map((node) => [node, 'visited'])) as Record<string, GraphNodeState>, {}, {}, info('RETURN', 'Complete', 'Completed child results are combined while frames leave the stack.', { result: id === 'backtracking' ? 'valid branch' : 3 }, undefined, undefined, true)));
  return frames;
}

function treeTrace(id: string): Frame[] {
  const traversal: Record<string, string[]> = {
    preorder: ['8', '4', '2', '6', '12', '10', '14'],
    inorder: ['2', '4', '6', '8', '10', '12', '14'],
    postorder: ['2', '6', '4', '10', '14', '12', '8'],
    'dfs-tree': ['8', '4', '2', '6', '12', '10', '14'],
    'bfs-tree': ['8', '4', '12', '2', '6', '10', '14'],
    'level-order': ['8', '4', '12', '2', '6', '10', '14'],
    'morris-traversal': ['2', '4', '6', '8', '10', '12', '14'],
  };
  const order = traversal[id];
  const nodeStates: Record<string, GraphNodeState> = {};
  const edgeStates: Record<string, GraphEdgeState> = {};
  const frames: Frame[] = [graphFrame(TREE, `Start ${id}`, nodeStates, edgeStates, {}, info('INITIALIZE', 'Traversal', 'Begin at the root.', {}, id === 'morris-traversal' ? 'Temporary threads replace the recursion stack and are later removed.' : 'Each node is visited exactly once.'))];
  const isBreadthFirst = id === 'bfs-tree' || id === 'level-order';
  const queue: string[] = isBreadthFirst ? [order[0]] : [];
  for (let index = 0; index < order.length; index++) {
    const node = order[index];
    nodeStates[node] = 'current';
    if (isBreadthFirst) {
      if (queue[0] === node) queue.shift();
      queue.push(...TREE.edges.filter((edge) => edge.from === node).map((edge) => edge.to));
    }
    frames.push(graphFrame(TREE, `Visit ${node}; order: ${order.slice(0, index + 1).join(' → ')}`, nodeStates, edgeStates, { [node]: String(index + 1) }, info('VISIT', id === 'morris-traversal' ? 'Threaded inorder' : 'Traverse', id === 'morris-traversal' ? 'Visit after the predecessor thread returns control.' : 'Emit the current node in the traversal order.', { node, position: index + 1 }, 'Visited nodes form the exact traversal prefix.', [{ label: isBreadthFirst ? 'queue' : 'order', values: isBreadthFirst ? queue : order.slice(0, index + 1) }], true)));
    nodeStates[node] = 'visited';
  }
  return frames;
}

function bellmanFordTrace(): Frame[] {
  const nodes = DIRECTED_GRAPH.nodes.map((node) => node.id);
  const dist = Object.fromEntries(nodes.map((node) => [node, Infinity])) as Record<string, number>;
  const pred: Record<string, string> = {};
  dist.A = 0;
  const frames: Frame[] = [];
  const badges = () => Object.fromEntries(nodes.map((node) => [node, Number.isFinite(dist[node]) ? String(dist[node]) : '∞']));
  frames.push(graphFrame(DIRECTED_GRAPH, 'Initialize source A', { A: 'current' }, {}, badges(), info('INITIALIZE', 'Shortest paths', 'Only the source has known distance zero.', { pass: 0 }, 'Every known distance is an upper bound on the true shortest distance.')));
  for (let pass = 1; pass < nodes.length; pass++) {
    let changed = false;
    for (const edge of DIRECTED_GRAPH.edges) {
      const candidate = dist[edge.from] + (edge.weight ?? 1);
      const key = `${edge.from}-${edge.to}`;
      const improves = Number.isFinite(dist[edge.from]) && candidate < dist[edge.to];
      frames.push(graphFrame(DIRECTED_GRAPH, `Pass ${pass}: ${edge.from}→${edge.to}, candidate ${Number.isFinite(candidate) ? candidate : '∞'}`, { [edge.from]: 'current', [edge.to]: improves ? 'frontier' : 'idle' }, { [key]: 'active' }, badges(), info('RELAX', `Pass ${pass}/${nodes.length - 1}`, improves ? 'The candidate path is shorter, so update distance and predecessor.' : 'The edge cannot improve the current distance.', { from: edge.from, to: edge.to, current: Number.isFinite(dist[edge.to]) ? dist[edge.to] : '∞', candidate: Number.isFinite(candidate) ? candidate : '∞' }, 'After pass p, shortest paths using at most p edges are correct.', [{ label: 'predecessors', values: Object.entries(pred).map(([v, u]) => `${v}←${u}`) }], improves)));
      if (improves) { dist[edge.to] = candidate; pred[edge.to] = edge.from; changed = true; }
    }
    if (!changed) break;
  }
  const negativeCycle = DIRECTED_GRAPH.edges.some((edge) => Number.isFinite(dist[edge.from]) && dist[edge.from] + (edge.weight ?? 1) < dist[edge.to]);
  frames.push(graphFrame(DIRECTED_GRAPH, negativeCycle ? 'Reachable negative cycle detected' : 'No reachable negative cycle', Object.fromEntries(nodes.map((node) => [node, 'visited'])) as Record<string, GraphNodeState>, Object.fromEntries(Object.entries(pred).map(([v, u]) => [`${u}-${v}`, 'tree'])), badges(), info('VERIFY', 'Cycle check', 'A final relaxation pass detects any reachable negative cycle.', { negativeCycle: String(negativeCycle) }, negativeCycle ? 'A reachable negative cycle makes shortest distances undefined.' : 'No edge can improve any final distance.', undefined, true)));
  return frames;
}

function floydWarshallTrace(): Frame[] {
  const labels = ['A', 'B', 'C', 'D'];
  const inf = Infinity;
  const table = [[0, 3, inf, 7], [8, 0, 2, inf], [5, inf, 0, 1], [2, inf, inf, 0]];
  const frames: Frame[] = [dpFrame(table.map((row) => row.map((v) => Number.isFinite(v) ? v : null)), labels, labels, null, 'Initialize direct-edge distances', info('INITIALIZE', 'All-pairs shortest paths', 'Start with zero diagonals and direct edge weights.', {}, 'D contains shortest paths using no intermediate vertices.'))];
  for (let k = 0; k < labels.length; k++) for (let i = 0; i < labels.length; i++) for (let j = 0; j < labels.length; j++) {
    const candidate = table[i][k] + table[k][j];
    if (candidate < table[i][j]) {
      const previous = table[i][j];
      table[i][j] = candidate;
      frames.push(dpFrame(table.map((row) => row.map((v) => Number.isFinite(v) ? v : null)), labels, labels, { r: i, c: j }, `Via ${labels[k]}: ${labels[i]}→${labels[j]} improves to ${candidate}`, info('RELAX', `Intermediate ${labels[k]}`, 'Compare the current route with the route through k.', { previous: Number.isFinite(previous) ? previous : '∞', candidate, k: labels[k] }, 'After k, the table permits only processed vertices as intermediates.', undefined, true), [{ r: i, c: k }, { r: k, c: j }]))
    }
  }
  return frames;
}

function mstTrace(id: 'kruskal' | 'prim'): Frame[] {
  const spec = UNDIRECTED_GRAPH;
  const frames: Frame[] = [];
  const selected: Record<string, GraphEdgeState> = {};
  if (id === 'kruskal') {
    const parent = Object.fromEntries(spec.nodes.map((node) => [node.id, node.id])) as Record<string, string>;
    const find = (x: string): string => parent[x] === x ? x : (parent[x] = find(parent[x]));
    const sorted = [...spec.edges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));
    let weight = 0;
    for (const edge of sorted) {
      const ra = find(edge.from); const rb = find(edge.to); const accept = ra !== rb;
      frames.push(graphFrame(spec, `${accept ? 'Accept' : 'Reject'} ${edge.from}—${edge.to} (w=${edge.weight})`, {}, { ...selected, [`${edge.from}-${edge.to}`]: 'active' }, {}, info('CYCLE CHECK', 'Kruskal', accept ? 'The endpoints are in different components.' : 'The endpoints are already connected; this edge would form a cycle.', { rootU: ra, rootV: rb, totalWeight: weight }, 'Selected edges form an acyclic minimum-weight forest.', [{ label: 'edge order', values: sorted.map((item) => `${item.from}${item.to}:${item.weight}`) }], true)));
      if (accept) { parent[rb] = ra; selected[`${edge.from}-${edge.to}`] = 'tree'; weight += edge.weight ?? 1; }
      if (Object.keys(selected).length === spec.nodes.length - 1) break;
    }
  } else {
    const visited = new Set<string>(['A']);
    let weight = 0;
    while (visited.size < spec.nodes.length) {
      const candidates = spec.edges.filter((edge) => visited.has(edge.from) !== visited.has(edge.to));
      const edge = candidates.reduce((best, item) => (item.weight ?? 1) < (best.weight ?? 1) ? item : best);
      const next = visited.has(edge.from) ? edge.to : edge.from;
      frames.push(graphFrame(spec, `Choose crossing edge ${edge.from}—${edge.to} (w=${edge.weight})`, Object.fromEntries([...visited].map((node) => [node, 'visited'])) as Record<string, GraphNodeState>, { ...selected, [`${edge.from}-${edge.to}`]: 'active' }, {}, info('SELECT MIN', 'Prim', 'This is the lightest edge crossing from the tree to an unvisited node.', { next, totalWeight: weight }, 'Selected edges form one connected tree over visited vertices.', [{ label: 'candidates', values: candidates.map((item) => `${item.from}${item.to}:${item.weight}`) }], true)));
      visited.add(next); selected[`${edge.from}-${edge.to}`] = 'tree'; weight += edge.weight ?? 1;
    }
  }
  frames.push(graphFrame(spec, 'Minimum spanning tree complete', Object.fromEntries(spec.nodes.map((node) => [node.id, 'visited'])) as Record<string, GraphNodeState>, selected, {}, info('COMPLETE', 'MST', 'Exactly V−1 accepted edges connect every vertex.', { edges: Object.keys(selected).length }, 'The selected connected tree has minimum total weight.', undefined, true)));
  return frames;
}

function graphDepthTrace(id: 'kosaraju' | 'tarjan' | 'bridges'): Frame[] {
  const spec = id === 'bridges' ? BRIDGE_GRAPH : SCC_GRAPH;
  const adj = Object.fromEntries(spec.nodes.map((node) => [node.id, [] as string[]])) as Record<string, string[]>;
  for (const edge of spec.edges) { adj[edge.from].push(edge.to); if (!spec.directed) adj[edge.to].push(edge.from); }
  const disc: Record<string, number> = {}; const low: Record<string, number> = {}; const parent: Record<string, string> = {};
  const stack: string[] = []; const onStack = new Set<string>(); const frames: Frame[] = []; let time = 0;
  const dfs = (u: string) => {
    disc[u] = low[u] = time++;
    if (id === 'tarjan') { stack.push(u); onStack.add(u); }
    frames.push(graphFrame(spec, `Enter ${u}: disc=${disc[u]}, low=${low[u]}`, { [u]: 'current' }, {}, { [u]: `${disc[u]}/${low[u]}` }, info('DFS ENTER', id, 'Assign discovery and low-link values.', { node: u, discovery: disc[u], low: low[u] }, 'low[u] is the earliest discovery reachable from u.', [{ label: 'stack', values: [...stack] }])));
    for (const v of adj[u]) {
      if (!(v in disc)) {
        parent[v] = u; dfs(v); low[u] = Math.min(low[u], low[v]);
        const bridge = id === 'bridges' && low[v] > disc[u];
        frames.push(graphFrame(spec, `${bridge ? 'Bridge' : 'Return'} ${u}—${v}; low[${u}]=${low[u]}`, { [u]: 'current', [v]: 'visited' }, { [`${u}-${v}`]: bridge ? 'tree' : 'active' }, { [u]: `${disc[u]}/${low[u]}`, [v]: `${disc[v]}/${low[v]}` }, info(bridge ? 'BRIDGE' : 'LOW-LINK UPDATE', id, bridge ? 'The child subtree has no back edge to u or an ancestor.' : 'Propagate the child low-link value to its parent.', { u, v, lowU: low[u], lowV: low[v] }, id === 'bridges' ? 'An edge (u,v) is a bridge iff low[v] > disc[u].' : 'Low-link values summarize reachable ancestors.', undefined, bridge)));
      } else if (v !== parent[u] && (id !== 'tarjan' || onStack.has(v))) low[u] = Math.min(low[u], disc[v]);
    }
    if (id === 'tarjan' && low[u] === disc[u]) {
      const component: string[] = []; let v: string;
      do { v = stack.pop()!; onStack.delete(v); component.push(v); } while (v !== u);
      frames.push(graphFrame(spec, `SCC: {${component.join(', ')}}`, Object.fromEntries(component.map((node) => [node, 'done'])) as Record<string, GraphNodeState>, {}, {}, info('EMIT SCC', 'Tarjan', 'A DFS root whose low-link equals its discovery index closes one SCC.', { root: u }, 'No node in the emitted component remains on the active stack.', [{ label: 'component', values: component }], true)));
    }
  };
  if (id === 'kosaraju') {
    const seen = new Set<string>(); const finish: string[] = [];
    const pass1 = (u: string) => { seen.add(u); for (const v of adj[u]) if (!seen.has(v)) pass1(v); finish.push(u); frames.push(graphFrame(spec, `Finish ${u}`, { [u]: 'visited' }, {}, {}, info('FINISH', 'Kosaraju pass 1', 'Postorder determines the next root order on the transpose.', { node: u }, 'finish contains completed vertices.', [{ label: 'finish stack', values: [...finish] }]))); };
    for (const node of spec.nodes) if (!seen.has(node.id)) pass1(node.id);
    const reverse = Object.fromEntries(spec.nodes.map((node) => [node.id, [] as string[]])) as Record<string, string[]>;
    for (const edge of spec.edges) reverse[edge.to].push(edge.from);
    seen.clear();
    while (finish.length) {
      const root = finish.pop()!; if (seen.has(root)) continue;
      const component: string[] = []; const visit = (u: string) => { seen.add(u); component.push(u); for (const v of reverse[u]) if (!seen.has(v)) visit(v); }; visit(root);
      frames.push(graphFrame(spec, `Transpose DFS emits SCC {${component.join(', ')}}`, Object.fromEntries(component.map((node) => [node, 'done'])) as Record<string, GraphNodeState>, {}, {}, info('EMIT SCC', 'Kosaraju pass 2', 'A DFS from the latest unfinished root cannot leave its SCC in the transpose.', { root }, 'Each emitted component is maximal and disjoint.', [{ label: 'component', values: component }], true)));
    }
  } else for (const node of spec.nodes) if (!(node.id in disc)) dfs(node.id);
  return frames;
}

function dpTrace(id: string): Frame[] {
  if (id === '1d-dp') {
    const values = cells([0, 1, 0, 0, 0, 0, 0]); const frames: Frame[] = [];
    for (let i = 2; i < values.length; i++) { values[i].v = values[i - 1].v + values[i - 2].v; frames.push(arrayFrame(values, `dp[${i}] = ${values[i - 1].v} + ${values[i - 2].v} = ${values[i].v}`, { [i - 2]: 'compare', [i - 1]: 'compare', [i]: 'found' }, info('COMPUTE', '1D recurrence', 'The current Fibonacci state depends on the two preceding states.', { i, value: values[i].v }, 'All dp positions before i are final.', undefined, true))); }
    return frames;
  }
  if (id === '2d-dp') {
    const rows = 4; const cols = 4; const table = Array.from({ length: rows }, () => Array(cols).fill(0) as number[]); const frames: Frame[] = [];
    table[0].fill(1); for (let r = 0; r < rows; r++) table[r][0] = 1;
    for (let r = 1; r < rows; r++) for (let c = 1; c < cols; c++) { table[r][c] = table[r - 1][c] + table[r][c - 1]; frames.push(dpFrame(table, ['0', '1', '2', '3'], ['0', '1', '2', '3'], { r, c }, `ways[${r}][${c}] = top + left = ${table[r][c]}`, info('COMPUTE', 'Grid paths', 'Every path enters from the cell above or left.', { r, c, value: table[r][c] }, 'All cells above or left of the cursor are final.', undefined, true), [{ r: r - 1, c }, { r, c: c - 1 }])); }
    return frames;
  }
  if (id === 'lcs') {
    const a = 'AGGT'; const b = 'GXTX'; const table = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0) as number[]); const frames: Frame[] = [];
    for (let r = 1; r <= a.length; r++) for (let c = 1; c <= b.length; c++) { const match = a[r - 1] === b[c - 1]; table[r][c] = match ? table[r - 1][c - 1] + 1 : Math.max(table[r - 1][c], table[r][c - 1]); frames.push(dpFrame(table, ['∅', ...a], ['∅', ...b], { r, c }, match ? `${a[r - 1]} matches: diagonal + 1` : `${a[r - 1]} ≠ ${b[c - 1]}: max(top, left)`, info('COMPUTE', 'LCS table', match ? 'A matching character extends the best shorter subsequence.' : 'A mismatch must discard one of the two current characters.', { r, c, value: table[r][c] }, 'Each cell is the LCS length of its two prefixes.', undefined, true), match ? [{ r: r - 1, c: c - 1 }] : [{ r: r - 1, c }, { r, c: c - 1 }])); }
    return frames;
  }
  if (id === 'lis') {
    const input = [5, 2, 8, 6, 3, 6, 9]; const tails: number[] = []; const values = cells(input); const frames: Frame[] = [];
    for (let i = 0; i < input.length; i++) { let lo = 0; let hi = tails.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] < input[i]) lo = mid + 1; else hi = mid; } tails[lo] = input[i]; frames.push(arrayFrame(values, `Place ${input[i]} at tails[${lo}]`, { [i]: 'active' }, info('BINARY SEARCH + REPLACE', 'Patience tails', 'Replace the first tail ≥ x; this preserves the smallest possible tail for each length.', { index: i, position: lo, lisLength: tails.length }, 'tails[k] is the minimum ending value of an increasing subsequence of length k+1.', [{ label: 'tails', values: [...tails] }], true))); }
    return frames;
  }
  if (id === 'digit-dp') {
    const digits = [2, 5]; const memo = new Map<string, number>(); const frames: Frame[] = [];
    const solve = (pos: number, tight: boolean, sum: number): number => { if (pos === digits.length) return sum % 2 === 0 ? 1 : 0; const key = `${pos}-${tight}-${sum % 2}`; if (!tight && memo.has(key)) return memo.get(key)!; let total = 0; const limit = tight ? digits[pos] : 9; for (let d = 0; d <= limit; d++) total += solve(pos + 1, tight && d === limit, sum + d); if (!tight) memo.set(key, total); frames.push(arrayFrame(cells(digits), `state(pos=${pos}, tight=${tight}, parity=${sum % 2}) = ${total}`, { [pos]: 'active' }, info('MEMOIZE', 'Digit DP', 'Aggregate all legal next digits under the tight prefix constraint.', { pos, tight: String(tight), parity: sum % 2, total }, 'The state depends only on position, tightness, and parity.', [{ label: 'memo keys', values: [...memo.keys()] }], true))); return total; }; solve(0, true, 0); return frames;
  }
  if (id === 'bitmask-dp') {
    const n = 4; const full = 1 << n; const dp = Array(full).fill(Infinity) as number[]; dp[0] = 0; const values = cells(dp.map(() => 0)); const frames: Frame[] = [];
    for (let mask = 0; mask < full; mask++) for (let next = 0; next < n; next++) if ((mask & (1 << next)) === 0) { const nextMask = mask | (1 << next); const candidate = dp[mask] + next + 1; if (candidate < dp[nextMask]) { dp[nextMask] = candidate; values[nextMask].v = candidate; frames.push(arrayFrame(values, `${mask.toString(2).padStart(n, '0')} + item ${next} → ${nextMask.toString(2).padStart(n, '0')}`, { [mask]: 'compare', [nextMask]: 'found' }, info('TRANSITION', 'Bitmask DP', 'Add one not-yet-selected item to the represented subset.', { mask, next, nextMask, cost: candidate }, 'dp[mask] is the best cost for exactly that selected set.', undefined, true))); } } return frames;
  }
  const spec = TREE; const nodeStates: Record<string, GraphNodeState> = {}; const badges: Record<string, string> = {}; const frames: Frame[] = [];
  for (const node of ['2', '6', '4', '10', '14', '12', '8']) { const children = spec.edges.filter((edge) => edge.from === node).map((edge) => Number(badges[edge.to] ?? 1)); badges[node] = String(1 + children.reduce((sum, value) => sum + value, 0)); nodeStates[node] = 'current'; frames.push(graphFrame(spec, `dp[${node}] = 1 + child totals = ${badges[node]}`, nodeStates, {}, badges, info('POSTORDER COMBINE', 'Tree DP', 'A parent state is computed only after its child states.', { node, value: badges[node] }, 'Every completed subtree badge is final.', undefined, true))); nodeStates[node] = 'visited'; }
  return frames;
}

function greedyTrace(id: string): Frame[] {
  if (id === 'huffman-coding') {
    const freq = [5, 9, 12, 13, 16, 45]; const values = cells(freq); const frames: Frame[] = [];
    while (freq.length > 1) { freq.sort((a, b) => a - b); const a = freq.shift()!; const b = freq.shift()!; freq.push(a + b); frames.push(arrayFrame(values, `Merge ${a} + ${b} → ${a + b}`, {}, info('EXTRACT TWO MINIMA', 'Build Huffman tree', 'The two least frequent subtrees receive the greatest remaining depth.', { left: a, right: b, merged: a + b }, 'The queue contains roots of an optimal prefix forest.', [{ label: 'min-queue', values: [...freq].sort((x, y) => x - y) }], true))); }
    return frames;
  }
  if (id === 'interval-scheduling') {
    const intervals = [{ s: 0, e: 4 }, { s: 1, e: 3 }, { s: 2, e: 5 }, { s: 4, e: 7 }, { s: 6, e: 8 }].sort((a, b) => a.s - b.s);
    const values = cells(intervals.map((interval) => interval.e));
    const roomEnds: number[] = [];
    const frames: Frame[] = [];
    for (let i = 0; i < intervals.length; i++) {
      roomEnds.sort((a, b) => a - b);
      const reusable = roomEnds.length > 0 && roomEnds[0] <= intervals[i].s;
      if (reusable) roomEnds.shift();
      roomEnds.push(intervals[i].e);
      frames.push(arrayFrame(values, `${reusable ? 'Reuse' : 'Open'} room for [${intervals[i].s}, ${intervals[i].e})`, { [i]: reusable ? 'found' : 'active' }, info(reusable ? 'REUSE RESOURCE' : 'ALLOCATE RESOURCE', 'Interval partitioning', reusable ? 'The earliest-finishing room is free before this interval begins.' : 'Every existing room still overlaps this interval.', { interval: i, rooms: roomEnds.length }, 'The min-heap stores one end time per currently allocated room.', [{ label: 'room end-times', values: [...roomEnds].sort((a, b) => a - b) }], true)));
    }
    return frames;
  }
  const intervals = [{ s: 1, e: 4 }, { s: 3, e: 5 }, { s: 0, e: 6 }, { s: 5, e: 7 }, { s: 8, e: 9 }, { s: 5, e: 9 }].sort((a, b) => a.e - b.e);
  const values = cells(intervals.map((interval) => interval.e)); const frames: Frame[] = []; let lastEnd = -Infinity; let count = 0;
  for (let i = 0; i < intervals.length; i++) { const accept = intervals[i].s >= lastEnd; if (accept) { lastEnd = intervals[i].e; count++; } frames.push(arrayFrame(values, `${accept ? 'Accept' : 'Reject'} [${intervals[i].s}, ${intervals[i].e})`, { [i]: accept ? 'found' : 'compare' }, info(accept ? 'ACCEPT' : 'REJECT', id, accept ? 'It starts after the last selected interval ends.' : 'It overlaps the last selected interval.', { index: i, selected: count, lastEnd }, 'Selecting the earliest finishing compatible interval leaves maximum room.', undefined, true))); }
  return frames;
}

function stringTrace(id: string): Frame[] {
  const frames: Frame[] = [];
  if (id === 'kmp') {
    const pattern = 'ABABC'; const text = 'ABABDABABC'; const lps = Array(pattern.length).fill(0); let len = 0;
    for (let i = 1; i < pattern.length;) { if (pattern[i] === pattern[len]) lps[i++] = ++len; else if (len) len = lps[len - 1]; else i++; frames.push(arrayFrame(cells(lps), `Build LPS: [${lps.join(', ')}]`, { [Math.max(0, i - 1)]: 'active' }, info('PREFIX UPDATE', 'Preprocess pattern', 'Reuse the longest proper prefix that is also a suffix.', { i, len }, 'lps[k] is correct for every processed pattern index.', [{ label: 'pattern', values: [...pattern] }]))); }
    let i = 0; let j = 0; while (i < text.length) { frames.push(arrayFrame(cells([...text].map((c) => c.charCodeAt(0))), `Compare text[${i}] with pattern[${j}]`, { [i]: 'compare' }, info('COMPARE', 'Search', 'Advance on a match; on mismatch reuse the LPS border.', { textIndex: i, patternIndex: j }, 'No text position before i-j can begin an undiscovered match.', [{ label: 'pattern', values: [...pattern] }, { label: 'lps', values: lps }]))); if (text[i] === pattern[j]) { i++; j++; if (j === pattern.length) { frames.push(arrayFrame(cells([...text].map((c) => c.charCodeAt(0))), `Match at index ${i - j}`, Object.fromEntries(Array.from({ length: j }, (_, k) => [i - j + k, 'found'])) as Marks, info('MATCH', 'Complete', 'All pattern characters matched consecutively.', { index: i - j }, undefined, undefined, true))); break; } } else if (j) j = lps[j - 1]; else i++; }
    return frames;
  }
  if (id === 'rabin-karp') {
    const text = 'BANANAS'; const pattern = 'ANA'; const base = 256; const mod = 101; const high = base ** (pattern.length - 1) % mod; const hash = (s: string) => [...s].reduce((h, c) => (h * base + c.charCodeAt(0)) % mod, 0); const target = hash(pattern); let rolling = hash(text.slice(0, pattern.length));
    for (let i = 0; i <= text.length - pattern.length; i++) { const equalHash = rolling === target; const exact = equalHash && text.slice(i, i + pattern.length) === pattern; frames.push(arrayFrame(cells([...text].map((c) => c.charCodeAt(0))), `Window ${i}: hash ${rolling}${exact ? ' — exact match' : ''}`, Object.fromEntries(Array.from({ length: pattern.length }, (_, k) => [i + k, exact ? 'found' : 'window'])) as Marks, info(equalHash ? 'VERIFY HASH HIT' : 'COMPARE HASH', 'Rolling window', equalHash ? 'Equal hashes require an exact character check because collisions are possible.' : 'Different hashes prove this window cannot match.', { index: i, rolling, target }, 'rolling is the polynomial hash of the current window.', undefined, exact))); if (i < text.length - pattern.length) { rolling = (base * (rolling - text.charCodeAt(i) * high) + text.charCodeAt(i + pattern.length)) % mod; rolling = (rolling + mod) % mod; } }
    return frames;
  }
  if (id === 'z-algorithm') {
    const s = 'AABCAABXAAZ'; const z = Array(s.length).fill(0); let l = 0; let r = 0;
    for (let i = 1; i < s.length; i++) { if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]); while (i + z[i] < s.length && s[z[i]] === s[i + z[i]]) z[i]++; if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; } frames.push(arrayFrame(cells(z), `Z[${i}] = ${z[i]}, box [${l}, ${r}]`, { [i]: 'found', ...(l <= r ? { [l]: 'pointer-l', [r]: 'pointer-r' } : {}) }, info('EXTEND Z-BOX', 'Prefix matching', 'Reuse overlap with the current box, then compare only beyond its boundary.', { i, z: z[i], l, r }, 's[l…r] equals a prefix of the same length.', undefined, true))); }
    return frames;
  }
  const raw = 'ABACABA'; const transformed = `^#${[...raw].join('#')}#$`; const p = Array(transformed.length).fill(0); let center = 0; let right = 0;
  for (let i = 1; i < transformed.length - 1; i++) { const mirror = 2 * center - i; if (i < right) p[i] = Math.min(right - i, p[mirror]); while (transformed[i + 1 + p[i]] === transformed[i - 1 - p[i]]) p[i]++; if (i + p[i] > right) { center = i; right = i + p[i]; } frames.push(arrayFrame(cells(p), `Center ${i}: radius ${p[i]}`, { [i]: 'pivot' }, info('EXPAND', 'Manacher', 'Mirror information initializes the radius; comparisons extend only past the known boundary.', { i, radius: p[i], center, right }, 'The rightmost palindrome boundary never moves left.', undefined, i === center))); }
  return frames;
}

function rangeTrace(id: string): Frame[] {
  if (id === 'lazy-propagation') {
    const input = [2, 1, 5, 3, 4, 7, 6, 8];
    const values = cells(input);
    const lazy: Record<number, number> = {};
    const frames: Frame[] = [];
    const update = (node: number, left: number, right: number, ql: number, qr: number, delta: number) => {
      if (right < ql || qr < left) {
        frames.push(arrayFrame(values, `Skip disjoint node [${left}, ${right}]`, {}, info('SKIP', 'Range update', 'This segment has no overlap with the update range.', { node, left, right }, 'Only intersecting nodes may receive the update.')));
        return;
      }
      if (ql <= left && right <= qr) {
        lazy[node] = (lazy[node] ?? 0) + delta;
        frames.push(arrayFrame(values, `Store lazy +${delta} on [${left}, ${right}]`, Object.fromEntries(Array.from({ length: right - left + 1 }, (_, k) => [left + k, 'found'])) as Marks, info('DEFER UPDATE', 'Range update', 'Full coverage lets this node record one lazy tag instead of visiting every leaf.', { node, left, right, lazy: lazy[node] }, 'A lazy tag represents an update owed uniformly to the entire segment.', [{ label: 'lazy tags', values: Object.entries(lazy).map(([key, value]) => `${key}:+${value}`) }], true)));
        return;
      }
      const mid = (left + right) >> 1;
      frames.push(arrayFrame(values, `Partial cover [${left}, ${right}] — descend`, Object.fromEntries(Array.from({ length: right - left + 1 }, (_, k) => [left + k, 'window'])) as Marks, info('DESCEND', 'Range update', 'A partially covered segment must split into its children.', { node, left, right }, 'Covered descendants collectively represent exactly the requested range.')));
      update(node * 2, left, mid, ql, qr, delta);
      update(node * 2 + 1, mid + 1, right, ql, qr, delta);
    };
    update(1, 0, input.length - 1, 2, 6, 3);
    frames.push(arrayFrame(values, 'Range update encoded in lazy tags', Object.fromEntries(Array.from({ length: 5 }, (_, k) => [k + 2, 'found'])) as Marks, info('COMPLETE', 'Deferred update', 'Future queries push tags only along paths they inspect.', { rangeStart: 2, rangeEnd: 6, delta: 3 }, 'Every covered leaf inherits exactly one +3 update from its tagged ancestors.', [{ label: 'lazy tags', values: Object.entries(lazy).map(([key, value]) => `${key}:+${value}`) }], true)));
    return frames;
  }
  if (id === 'fenwick-tree-algo') {
    const bit = Array(9).fill(0) as number[]; const input = [3, 2, -1, 6, 5, 4, -3, 3]; const frames: Frame[] = [];
    for (let index = 1; index <= input.length; index++) for (let i = index; i < bit.length; i += i & -i) { bit[i] += input[index - 1]; frames.push(arrayFrame(cells(bit.slice(1)), `Add ${input[index - 1]} to BIT[${i}]`, { [i - 1]: 'active' }, info('UPDATE', 'Fenwick build', 'i += lowbit(i) visits every aggregate containing the source index.', { source: index, treeIndex: i, value: bit[i] }, 'BIT[i] stores the sum of its lowbit-sized suffix.', undefined, true))); }
    let sum = 0; for (let i = 7; i > 0; i -= i & -i) { sum += bit[i]; frames.push(arrayFrame(cells(bit.slice(1)), `Prefix(7): include BIT[${i}] → ${sum}`, { [i - 1]: 'found' }, info('QUERY', 'Prefix sum', 'i -= lowbit(i) moves to the preceding disjoint aggregate.', { treeIndex: i, sum }, 'Included ranges are disjoint and exactly cover the prefix.', undefined, true))); } return frames;
  }
  if (id === 'sparse-table-algo') {
    const input = [7, 2, 3, 0, 5, 10, 3, 12, 18]; const levels = Math.floor(Math.log2(input.length)) + 1; const table = Array.from({ length: levels }, () => Array(input.length).fill(null) as (number | null)[]); table[0] = [...input]; const frames: Frame[] = [];
    for (let k = 1; k < levels; k++) for (let i = 0; i + (1 << k) <= input.length; i++) { table[k][i] = Math.min(table[k - 1][i]!, table[k - 1][i + (1 << (k - 1))]!); frames.push(dpFrame(table, Array.from({ length: levels }, (_, x) => `2^${x}`), input.map((_, x) => String(x)), { r: k, c: i }, `min interval [${i}, ${i + (1 << k) - 1}] = ${table[k][i]}`, info('BUILD', 'Sparse table', 'Combine two adjacent half-length intervals.', { level: k, start: i }, 'Every populated cell answers a power-of-two range minimum.', undefined, true), [{ r: k - 1, c: i }, { r: k - 1, c: i + (1 << (k - 1)) }])); } return frames;
  }
  const input = [2, 1, 5, 3, 4, 7, 6, 8]; const values = cells(input); const frames: Frame[] = [];
  const visit = (node: number, left: number, right: number, ql: number, qr: number, depth: number) => { const overlap = ql <= left && right <= qr; const none = right < ql || qr < left; frames.push(arrayFrame(values, `${none ? 'No overlap' : overlap ? 'Full cover' : 'Partial overlap'} [${left}, ${right}]`, Object.fromEntries(Array.from({ length: right - left + 1 }, (_, k) => [left + k, none ? 'idle' : overlap ? 'found' : 'window'])) as Marks, info(none ? 'SKIP' : overlap ? 'USE NODE' : 'DESCEND', id, none ? 'This segment is outside the query.' : overlap ? 'The stored aggregate exactly covers this segment.' : 'Only part of the segment is covered, so inspect children.', { node, left, right, depth }, 'The query result combines exactly the fully covered disjoint nodes.', undefined, overlap))); if (!none && !overlap && left < right) { const mid = (left + right) >> 1; visit(node * 2, left, mid, ql, qr, depth + 1); visit(node * 2 + 1, mid + 1, right, ql, qr, depth + 1); } };
  visit(1, 0, input.length - 1, 2, 6, 0); return frames;
}

function advancedTrace(id: string, custom?: number[]): Frame[] {
  const input = custom?.length ? custom : [40, 10, 70, 20, 20, 55]; const frames: Frame[] = [];
  if (id === 'coordinate-compression') {
    const unique = [...new Set(input)].sort((a, b) => a - b); const ranks = input.map((value) => unique.indexOf(value)); frames.push(arrayFrame(cells(input), 'Sort unique coordinates', {}, info('SORT UNIQUE', 'Compression', 'Ranks are defined by the ordered distinct values.', { distinct: unique.length }, 'Equal coordinates receive equal ranks.', [{ label: 'unique', values: unique }], true))); frames.push(arrayFrame(cells(ranks), `Ranks: [${ranks.join(', ')}]`, Object.fromEntries(ranks.map((_, i) => [i, 'found'])) as Marks, info('MAP', 'Compression', 'Replace each value with its index in the sorted unique list.', {}, 'Order and equality are preserved.', [{ label: 'mapping', values: unique.map((value, rank) => `${value}→${rank}`) }], true))); return frames;
  }
  if (id === 'binary-lifting') {
    const labels = ['8', '4', '12', '2', '6', '10', '14'];
    const parent = [-1, 0, 0, 1, 1, 2, 2];
    const levels = 3;
    const up = Array.from({ length: levels }, () => Array(labels.length).fill(-1) as number[]);
    up[0] = [...parent];
    const frames: Frame[] = [dpFrame(up, ['2^0', '2^1', '2^2'], labels, null, 'Initialize immediate parents', info('INITIALIZE', 'Binary lifting', 'The first row stores each node’s 2^0-th ancestor.', {}, 'up[0][v] is parent[v].'))];
    for (let k = 1; k < levels; k++) for (let v = 0; v < labels.length; v++) {
      const half = up[k - 1][v];
      up[k][v] = half < 0 ? -1 : up[k - 1][half];
      frames.push(dpFrame(up, ['2^0', '2^1', '2^2'], labels, { r: k, c: v }, `up[${k}][${labels[v]}] = ${up[k][v] < 0 ? '∅' : labels[up[k][v]]}`, info('DOUBLE JUMP', 'Preprocess ancestors', 'Two 2^(k−1) jumps compose one 2^k jump.', { level: k, node: labels[v] }, 'up[k][v] is exactly the 2^k-th ancestor of v.', undefined, true), half < 0 ? [] : [{ r: k - 1, c: v }, { r: k - 1, c: half }]));
    }
    let node = 6;
    const distance = 2;
    for (let bit = 0; bit < levels; bit++) if (distance & (1 << bit)) {
      const previous = node;
      node = up[bit][node];
      frames.push(dpFrame(up, ['2^0', '2^1', '2^2'], labels, { r: bit, c: previous }, `Jump 2^${bit}: ${labels[previous]} → ${node < 0 ? '∅' : labels[node]}`, info('JUMP', 'Query ancestor', 'Each set bit in k applies one precomputed power-of-two jump.', { bit, result: node < 0 ? 'none' : labels[node] }, 'The remaining distance equals the unprocessed bits of k.', undefined, true)));
    }
    return frames;
  }
  if (id === 'euler-tour') {
    const order = ['8', '4', '2', '4', '6', '4', '8', '12', '10', '12', '14', '12', '8']; const nodeStates: Record<string, GraphNodeState> = {};
    for (let i = 0; i < order.length; i++) { nodeStates[order[i]] = 'current'; frames.push(graphFrame(TREE, `${id === 'euler-tour' ? 'Euler visit' : 'Ancestor preprocessing'} ${order[i]}`, nodeStates, {}, { [order[i]]: String(i) }, info(id === 'euler-tour' ? 'ENTER/EXIT' : 'JUMP TABLE', id, id === 'euler-tour' ? 'Record a vertex whenever DFS enters or returns to it.' : 'Build power-of-two ancestors from smaller jumps.', { index: i, node: order[i] }, id === 'euler-tour' ? 'A subtree occupies a contiguous first-entry interval.' : 'up[v][k] = up[up[v][k-1]][k-1].', [{ label: 'tour', values: order.slice(0, i + 1) }], true))); nodeStates[order[i]] = 'visited'; } return frames;
  }
  if (id === 'mos-algorithm') {
    const values = cells([1, 2, 1, 3, 4, 2, 3]); const queries = [{ l: 0, r: 4 }, { l: 1, r: 3 }, { l: 2, r: 6 }]; const block = Math.floor(Math.sqrt(values.length)); queries.sort((a, b) => Math.floor(a.l / block) - Math.floor(b.l / block) || a.r - b.r); let l = 0; let r = -1; const freq: Record<number, number> = {};
    for (const q of queries) { while (r < q.r) freq[values[++r].v] = (freq[values[r].v] ?? 0) + 1; while (r > q.r) { freq[values[r].v]--; r--; } while (l < q.l) { freq[values[l].v]--; l++; } while (l > q.l) freq[values[--l].v] = (freq[values[l].v] ?? 0) + 1; frames.push(arrayFrame(values, `Answer [${q.l}, ${q.r}] with ${Object.values(freq).filter((v) => v > 0).length} distinct`, Object.fromEntries(Array.from({ length: q.r - q.l + 1 }, (_, k) => [q.l + k, 'window'])) as Marks, info('MOVE BOUNDARIES', "Mo's algorithm", 'Adjust the previous window one endpoint at a time.', { l, r, block }, 'freq exactly describes the current inclusive window.', [{ label: 'frequencies', values: Object.entries(freq).filter(([, count]) => count > 0).map(([value, count]) => `${value}:${count}`) }], true))); } return frames;
  }
  if (id === 'sweep-line') {
    const intervals = [{ start: 1, end: 5 }, { start: 2, end: 7 }, { start: 4, end: 6 }, { start: 8, end: 10 }];
    const events = intervals.flatMap((interval, index) => [{ x: interval.start, delta: 1, index }, { x: interval.end, delta: -1, index }]).sort((a, b) => a.x - b.x || a.delta - b.delta);
    const values = cells(events.map((event) => event.x));
    const frames: Frame[] = [];
    let active = 0;
    let maximum = 0;
    for (let i = 0; i < events.length; i++) {
      active += events[i].delta;
      maximum = Math.max(maximum, active);
      frames.push(arrayFrame(values, `x=${events[i].x}: ${events[i].delta > 0 ? 'open' : 'close'} interval ${events[i].index}`, { [i]: events[i].delta > 0 ? 'active' : 'sorted' }, info('PROCESS EVENT', 'Sweep line', 'Sorted boundary events update the active interval set.', { x: events[i].x, active, maximum }, 'active equals intervals covering the open sweep position.', [{ label: 'event order', values: events.map((event) => `${event.x}${event.delta > 0 ? '+' : '−'}`) }], true)));
    }
    return frames;
  }
  const values = cells(input); const sorted = [...input].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) frames.push(arrayFrame(values, `${id === 'sweep-line' ? 'Process event' : 'Rank'} ${sorted[i]}`, { [input.indexOf(sorted[i])]: 'active' }, info(id === 'sweep-line' ? 'EVENT' : 'MAP', id, id === 'sweep-line' ? 'Process coordinates in order so the active set reflects the current sweep position.' : 'Sorted unique order defines dense ranks.', { position: i, coordinate: sorted[i] }, 'All earlier coordinates have been fully processed.', [{ label: 'ordered events', values: sorted }], true)));
  return frames;
}

/** Correct deterministic traces for entries that previously used placeholder category demos. */
export function generateAlgorithmTrace(id: string, custom?: number[]): Frame[] | undefined {
  if (['linear-search', 'binary-search', 'ternary-search', 'lower-bound', 'upper-bound'].includes(id)) return searchingTrace(id, custom);
  if (['selection-sort', 'insertion-sort', 'heap-sort', 'counting-sort', 'radix-sort'].includes(id)) return auxiliarySortingTrace(id, custom);
  if (id === 'two-pointers' || id === 'sliding-window') return pointerTrace(id, custom);
  if (id === 'fast-slow-pointer') {
    const next = [1, 2, 3, 4, 5, 3]; const values = cells(next); const frames: Frame[] = []; let slow = 0; let fast = 0;
    do { slow = next[slow]; fast = next[next[fast]]; frames.push(arrayFrame(values, `slow=${slow}, fast=${fast}`, { [slow]: 'pointer-l', [fast]: 'pointer-r' }, info('ADVANCE POINTERS', "Floyd's cycle detection", 'Slow moves one edge and fast moves two; a collision proves a reachable cycle.', { slow, fast }, 'If a cycle exists, the relative offset changes by one modulo the cycle length.', [{ label: 'next pointers', values: next.map((to, from) => `${from}→${to}`) }], slow === fast))); } while (slow !== fast); return frames;
  }
  if (['recursion', 'recursion-tree', 'backtracking'].includes(id)) return recursionTrace(id, custom);
  if (['dfs-tree', 'bfs-tree', 'preorder', 'inorder', 'postorder', 'level-order', 'morris-traversal'].includes(id)) return treeTrace(id);
  if (id === 'bellman-ford') return bellmanFordTrace();
  if (id === 'floyd-warshall') return floydWarshallTrace();
  if (id === 'kruskal' || id === 'prim') return mstTrace(id);
  if (id === 'kosaraju' || id === 'tarjan' || id === 'bridges') return graphDepthTrace(id);
  if (['1d-dp', '2d-dp', 'lis', 'lcs', 'dp-on-trees', 'digit-dp', 'bitmask-dp'].includes(id)) return dpTrace(id);
  if (['activity-selection', 'interval-scheduling', 'huffman-coding'].includes(id)) return greedyTrace(id);
  if (['kmp', 'rabin-karp', 'z-algorithm', 'manacher'].includes(id)) return stringTrace(id);
  if (['segment-tree-algo', 'lazy-propagation', 'fenwick-tree-algo', 'sparse-table-algo'].includes(id)) return rangeTrace(id);
  if (['binary-lifting', 'euler-tour', 'mos-algorithm', 'sweep-line', 'coordinate-compression'].includes(id)) return advancedTrace(id, custom);
  return undefined;
}
