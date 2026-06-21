import { ALGORITHMS } from './algorithms';

export interface DSAStructure {
  id: string;
  name: string;
  category: 'structures' | 'algorithms';
  description: string;
  commands: string[];
  generate: (startX: number, startY: number) => any[];
}

const makeId = () => Math.random().toString(36).substring(2, 9);

const autoFontSize = (text: string, maxW: number, maxH: number, baseFontSize = 14): number => {
  const padding = 6;
  const availW = maxW - padding;
  const availH = maxH - padding;
  let fs = baseFontSize;
  // Shrink until text fits: approximate width = text.length * fontSize * 0.6
  while (fs > 8 && text.length * fs * 0.6 > availW) fs--;
  // Also ensure line height fits the container
  while (fs > 8 && fs * 1.3 > availH) fs--;
  return fs;
};

const createRect = (id: string, x: number, y: number, width: number, height: number, textVal?: string, bg = '#ffffff', stroke = '#171717', borderStyle = 'solid' as any) => {
  const els: any[] = [];
  els.push({
    type: 'rectangle',
    id,
    x,
    y,
    width,
    height,
    strokeColor: stroke,
    backgroundColor: bg,
    fillStyle: 'solid',
    strokeWidth: 1.5,
    roughness: 1,
    strokeStyle: borderStyle,
  });
  if (textVal) {
    const fs = autoFontSize(textVal, width, height);
    els.push({
      type: 'text',
      text: textVal,
      containerId: id,
      fontSize: fs,
      strokeColor: stroke,
      textAlign: 'center',
      verticalAlign: 'middle',
    });
  }
  return els;
};

const createCircle = (id: string, x: number, y: number, r: number, textVal?: string, bg = '#ffffff', stroke = '#171717') => {
  const els: any[] = [];
  // For circles the usable width is roughly 70% of the diameter (inscribed rectangle)
  const diameter = r * 2;
  els.push({
    type: 'ellipse',
    id,
    x: x - r,
    y: y - r,
    width: diameter,
    height: diameter,
    strokeColor: stroke,
    backgroundColor: bg,
    fillStyle: 'solid',
    strokeWidth: 1.5,
    roughness: 1,
  });
  if (textVal) {
    const usableW = diameter * 0.7;
    const usableH = diameter * 0.7;
    const fs = autoFontSize(textVal, usableW, usableH);
    els.push({
      type: 'text',
      text: textVal,
      containerId: id,
      fontSize: fs,
      strokeColor: stroke,
      textAlign: 'center',
      verticalAlign: 'middle',
    });
  }
  return els;
};

const createArrow = (x1: number, y1: number, x2: number, y2: number, color = '#0070f3', startEl?: string, endEl?: string) => {
  return {
    type: 'arrow',
    x: x1,
    y: y1,
    points: [[0, 0], [x2 - x1, y2 - y1]],
    strokeColor: color,
    strokeWidth: 1.5,
    roughness: 1,
    startBinding: startEl ? { elementId: startEl } : undefined,
    endBinding: endEl ? { elementId: endEl } : undefined,
  };
};

const createLabel = (text: string, x: number, y: number, color = '#666666', size = 12) => {
  return {
    type: 'text',
    text,
    x,
    y,
    fontSize: size,
    strokeColor: color,
  };
};

// Generates high-fidelity visual layouts dynamically for all algorithms and structures
const renderCanvasLayout = (id: string, name: string, category: string, x: number, y: number): any[] => {
  const elements: any[] = [];

  // 1. Array-based layouts (Searching, Sorting, Pointers, Strings, CP)
  if (category === 'Searching' || category === 'Sorting' || category === 'String Algorithms' || id === 'coordinate-compression') {
    const vals = ['15', '24', '35', '50', '66'];
    
    // Original input array
    elements.push(createLabel(`${name} Array State:`, x, y - 24, '#1e40af', 13));
    for (let i = 0; i < 5; i++) {
      const cellId = `cell-${i}-${makeId()}`;
      elements.push(...createRect(cellId, x + i * 55, y, 55, 36, vals[i], '#eff6ff', '#1e40af'));
      elements.push(createLabel(`${i}`, x + i * 55 + 23, y + 42, '#888888'));
    }

    if (id === 'merge-sort') {
      // Split halves array below
      elements.push(createLabel('Sorted Halves:', x, y + 70, '#0d9488'));
      for (let i = 0; i < 2; i++) {
        const cellId = `m-left-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 50, y + 90, 50, 32, vals[i], '#f0fdf4', '#0d9488'));
      }
      for (let i = 2; i < 5; i++) {
        const cellId = `m-right-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 50 + 15, y + 90, 50, 32, vals[i], '#f0fdf4', '#0d9488'));
      }
      elements.push(
        createArrow(x + 55, y + 36, x + 50, y + 86, '#0d9488'),
        createArrow(x + 165, y + 36, x + 180, y + 86, '#0d9488')
      );
    } else if (id === 'quick-sort') {
      // Pivot pointer
      elements.push(
        createArrow(x + 192, y + 80, x + 192, y + 48, '#ef4444'),
        createLabel('Pivot = 66', x + 168, y + 88, '#ef4444', 11)
      );
    } else if (id === 'insertion-sort') {
      // Swap out/inset pointer
      elements.push(
        createArrow(x + 82, y + 80, x + 82, y + 48, '#7928ca'),
        createLabel('Insert key (24)', x + 55, y + 88, '#7928ca', 11)
      );
    } else if (id === 'selection-sort') {
      // Split partition pointer
      elements.push({
        type: 'line',
        x: x + 110,
        y: y - 5,
        points: [[0, 0], [0, 48]],
        strokeColor: '#7c3aed',
        strokeWidth: 2.5,
      });
      elements.push(createLabel('Sorted | Unsorted', x + 65, y + 54, '#7c3aed', 10));
    } else if (id === 'counting-sort') {
      // Freq counts array below
      elements.push(createLabel('Frequencies Count Map:', x, y + 70, '#d97706'));
      const counts = ['0', '1', '1', '2', '1'];
      for (let i = 0; i < 5; i++) {
        const cellId = `count-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 50, y + 90, 50, 30, counts[i], '#fffbeb', '#d97706'));
      }
    } else if (id === 'kmp') {
      // π lookup failure table
      elements.push(createLabel('KMP Pi table (LPS Array):', x, y + 70, '#0284c7'));
      const pi = ['0', '1', '0', '1', '2'];
      for (let i = 0; i < 5; i++) {
        const cellId = `pi-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 50, y + 90, 50, 30, pi[i], '#e0f2fe', '#0284c7'));
      }
    } else if (id === 'coordinate-compression') {
      elements.push(createLabel('Compressed Ranks Map:', x, y + 70, '#0f766e'));
      const compressed = ['0', '1', '2', '3', '4'];
      for (let i = 0; i < 5; i++) {
        const cellId = `comp-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 55, y + 90, 55, 32, compressed[i], '#f0fdfa', '#0f766e'));
        elements.push(createArrow(x + i * 55 + 27, y + 36, x + i * 55 + 27, y + 86, '#0f766e'));
      }
    }
  }

  // 2. Tree-based layouts (Trees, Traversals, Range Query, CP Trees)
  else if (category === 'Tree Traversals' || category === 'Range Query & Trees' || id === 'binary-lifting' || id === 'euler-tour') {
    const rootId = `tree-root-${makeId()}`;
    const leftId = `tree-left-${makeId()}`;
    const rightId = `tree-right-${makeId()}`;
    
    elements.push(createLabel(`${name} Tree Trace:`, x - 30, y - 30, '#581c87', 13));
    elements.push(...createCircle(rootId, x, y, 18, 'A', '#faf5ff', '#581c87'));
    elements.push(...createCircle(leftId, x - 70, y + 60, 18, 'B', '#faf5ff', '#581c87'));
    elements.push(...createCircle(rightId, x + 70, y + 60, 18, 'C', '#faf5ff', '#581c87'));
    elements.push(createArrow(x - 5, y + 16, x - 55, y + 48, '#581c87', rootId, leftId));
    elements.push(createArrow(x + 5, y + 16, x + 55, y + 48, '#581c87', rootId, rightId));

    if (id === 'preorder' || id === 'inorder' || id === 'postorder' || id === 'dfs-tree' || id === 'bfs-tree') {
      // Step numbers next to visits
      elements.push(
        createLabel('[t=1]', x + 24, y - 5, '#854d0e', 11),
        createLabel('[t=2]', x - 105, y + 55, '#854d0e', 11),
        createLabel('[t=3]', x + 95, y + 55, '#854d0e', 11)
      );
    } else if (id === 'binary-lifting') {
      // Ancestor leaps mapping
      elements.push(
        createArrow(x - 70, y + 42, x - 18, y, '#2563eb'),
        createLabel('leap 2^0', x - 95, y + 15, '#2563eb', 10)
      );
    } else if (id === 'euler-tour') {
      // DFS enter/exit sequence label
      elements.push(
        createLabel('Euler Path: A -> B -> B -> C -> C -> A', x - 75, y + 100, '#059669', 11)
      );
    }
  }

  // 3. Graph-based layouts (Graph Algorithms)
  else if (category === 'Graph Algorithms') {
    const nodeA = `g-node-a-${makeId()}`;
    const nodeB = `g-node-b-${makeId()}`;
    const nodeC = `g-node-c-${makeId()}`;
    const nodeD = `g-node-d-${makeId()}`;
    
    elements.push(createLabel(`${name} Graph Setup:`, x - 30, y - 30, '#0284c7', 13));
    elements.push(...createCircle(nodeA, x, y, 16, 'A', '#e0f2fe', '#0284c7'));
    elements.push(...createCircle(nodeB, x + 90, y + 10, 16, 'B', '#e0f2fe', '#0284c7'));
    elements.push(...createCircle(nodeC, x + 45, y + 80, 16, 'C', '#e0f2fe', '#0284c7'));
    elements.push(...createCircle(nodeD, x - 45, y + 60, 16, 'D', '#e0f2fe', '#0284c7'));

    const addEdge = (x1: number, y1: number, x2: number, y2: number, w?: string) => {
      elements.push(createArrow(x1, y1, x2, y2, '#0284c7'));
      if (w) elements.push(createLabel(w, (x1 + x2) / 2 - 5, (y1 + y2) / 2 - 12, '#0284c7', 10));
    };

    addEdge(x + 16, y, x + 74, y + 5, 'w=4');
    addEdge(x + 90, y + 26, x + 55, y + 70, 'w=1');
    addEdge(x + 35, y + 80, x - 29, y + 65, 'w=5');
    addEdge(x - 30, y + 48, x - 5, y + 14, 'w=3');
  }

  // 4. Dynamic Programming (2D table)
  else if (category === 'Dynamic Programming') {
    elements.push(createLabel(`${name} DP Cache Table:`, x, y - 24, '#c2410c', 13));
    const cells = [
      ['0', '0', '0'],
      ['0', '1', '1'],
      ['0', '1', '2']
    ];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cellId = `dp-mat-${r}-${c}-${makeId()}`;
        const isOpt = r === 2 && c === 2;
        elements.push(...createRect(cellId, x + c * 50, y + r * 35, 50, 35, cells[r][c], isOpt ? '#ffedd5' : '#ffffff', isOpt ? '#ea580c' : '#171717'));
      }
    }
  }

  // 5. Greedy Scheduling (horizontal timeline intervals)
  else if (category === 'Greedy') {
    elements.push(createLabel(`${name} Scheduling Timeline:`, x, y - 24, '#0d9488', 13));
    // Draw timeline baseline axis
    elements.push({
      type: 'line',
      x: x,
      y: y + 90,
      points: [[0, 0], [220, 0]],
      strokeColor: '#666666',
      strokeWidth: 2,
    });
    // Intervals
    elements.push(
      ...createRect(`greedy-1-${makeId()}`, x + 10, y, 80, 24, 'Act 1', '#f0fdfa', '#0d9488'),
      ...createRect(`greedy-2-${makeId()}`, x + 100, y + 30, 90, 24, 'Act 2 (Select)', '#f0fdfa', '#0d9488'),
      ...createRect(`greedy-3-${makeId()}`, x + 40, y + 60, 80, 24, 'Act 3 (Overlap/Skip)', '#fee2e2', '#ef4444', 'dashed')
    );
  }

  // 6. Recursion & Backtracking
  else if (category === 'Recursion & Backtracking') {
    if (id === 'n-queens') {
      elements.push(createLabel('N-Queens Chessboard State:', x, y - 24, '#b45309', 13));
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const isQueen = (r === 0 && c === 1) || (r === 1 && c === 3) || (r === 2 && c === 0) || (r === 3 && c === 2);
          const cellId = `queen-${r}-${c}-${makeId()}`;
          const isDark = (r + c) % 2 === 1;
          elements.push(...createRect(cellId, x + c * 35, y + r * 35, 35, 35, isQueen ? '♛' : '', isDark ? '#d1a37a' : '#f5e3d3', '#b45309'));
        }
      }
    } else {
      const rootId = `rec-root-${makeId()}`;
      const child1 = `rec-c1-${makeId()}`;
      const child2 = `rec-c2-${makeId()}`;
      elements.push(createLabel(`${name} Recursion Tree:`, x - 30, y - 30, '#b45309', 13));
      elements.push(...createCircle(rootId, x, y, 18, 'solve(N)', '#fef3c7', '#b45309'));
      elements.push(...createCircle(child1, x - 55, y + 55, 18, 'N-1', '#fef3c7', '#b45309'));
      elements.push(...createCircle(child2, x + 55, y + 55, 18, 'N-2', '#fef3c7', '#b45309'));
      elements.push(
        createArrow(x - 5, y + 16, x - 45, y + 45, '#b45309', rootId, child1),
        createArrow(x + 5, y + 16, x + 45, y + 45, '#b45309', rootId, child2)
      );
    }
  }

  // 7. Advanced CP & Range Query (fallback/details)
  else if (category === 'Advanced CP' || category === 'Range Query & Trees') {
    if (id === 'mos-algorithm') {
      elements.push(createLabel(`${name} Queries Block (Block Size = √N):`, x, y - 24, '#4f46e5', 13));
      const cells = ['Q1 [0-2]', 'Q2 [1-4]', 'Q3 [3-5]'];
      for (let i = 0; i < 3; i++) {
        const cellId = `mos-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 70, y, 68, 30, cells[i], '#eef2ff', '#4f46e5'));
      }
      elements.push(createLabel('Block 0 [idx 0-2] | Block 1 [idx 3-5]', x, y + 46, '#4f46e5', 11));
    } else if (id === 'sweep-line') {
      elements.push(createLabel(`${name} Sweep Line State:`, x, y - 24, '#0891b2', 13));
      elements.push(
        {
          type: 'line',
          x: x + 10,
          y: y + 20,
          points: [[0, 0], [180, 20]],
          strokeColor: '#0891b2',
          strokeWidth: 2,
        },
        {
          type: 'line',
          x: x + 20,
          y: y + 70,
          points: [[0, 0], [160, -30]],
          strokeColor: '#0891b2',
          strokeWidth: 2,
        },
        {
          type: 'line',
          x: x + 100,
          y: y - 5,
          points: [[0, 0], [0, 95]],
          strokeColor: '#db2777',
          strokeWidth: 2,
          strokeStyle: 'dashed',
        },
        createLabel('Active Line x=100', x + 50, y + 102, '#db2777', 10),
        createLabel('Intersection Point', x + 110, y + 30, '#0891b2', 9)
      );
    } else if (id.includes('segment') || id.includes('lazy')) {
      const rootId = `seg-algo-root-${makeId()}`;
      const l1 = `seg-algo-l1-${makeId()}`;
      const r1 = `seg-algo-r1-${makeId()}`;
      elements.push(createLabel(`${name} Segment Nodes:`, x - 30, y - 30, '#7c3aed', 13));
      elements.push(...createRect(rootId, x - 25, y - 18, 50, 36, 'Sum=10', '#faf5ff', '#7c3aed'));
      elements.push(...createRect(l1, x - 105, y + 52, 50, 36, 'L: 6', '#faf5ff', '#7c3aed'));
      elements.push(...createRect(r1, x + 55, y + 52, 50, 36, 'R: 4', '#faf5ff', '#7c3aed'));
      elements.push(
        createArrow(x - 15, y + 18, x - 65, y + 52, '#7c3aed', rootId, l1),
        createArrow(x + 15, y + 18, x + 65, y + 52, '#7c3aed', rootId, r1)
      );
      if (id.includes('lazy')) {
        elements.push(createLabel('Lazy Value = +2', x - 90, y + 95, '#ea580c', 11));
      }
    } else {
      const vals = ['4', '8', '15', '16', '23'];
      elements.push(createLabel(`${name} Range State:`, x, y - 24, '#4f46e5', 13));
      for (let i = 0; i < 5; i++) {
        const cellId = `rg-cell-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 50, y, 50, 36, vals[i], '#eef2ff', '#4f46e5'));
      }
    }
  }

  // 8. Default Fallback
  else {
    const blockId = `algo-block-${id}-${makeId()}`;
    elements.push(...createRect(blockId, x, y, 220, 50, name, '#f8fafc', '#64748b'));
    elements.push(createLabel('Theoretical Structure Anchor', x + 15, y + 68, '#64748b', 11));
  }

  return elements;
};

// ── Complete Catalog of Canvas DSA Skeletons ────────────────
export const dsaStructures: DSAStructure[] = [
  // ── DATA STRUCTURES: Basic ────────────────────────────────
  {
    id: 'array',
    name: 'Array',
    category: 'structures',
    description: 'Contiguous memory cells with indices.',
    commands: ['array', 'arr'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['12', '9', '3', '7', '5'];
      for (let i = 0; i < 5; i++) {
        const id = `arr-cell-${i}-${makeId()}`;
        elements.push(...createRect(id, x + i * 60, y, 60, 40, values[i]));
        elements.push(createLabel(`${i}`, x + i * 60 + 25, y + 48));
      }
      elements.push(createLabel('Index:', x - 55, y + 48));
      return elements;
    },
  },
  {
    id: 'string-structure',
    name: 'String',
    category: 'structures',
    description: 'Sequence of characters.',
    commands: ['string', 'str'],
    generate: (x, y) => {
      const elements: any[] = [];
      const chars = ['H', 'e', 'l', 'l', 'o'];
      for (let i = 0; i < 5; i++) {
        const id = `str-${i}-${makeId()}`;
        elements.push(...createRect(id, x + i * 50, y, 50, 40, chars[i], '#f0fdf4', '#166534'));
        elements.push(createLabel(`${i}`, x + i * 50 + 20, y + 48));
      }
      return elements;
    },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    category: 'structures',
    description: '2D grid array structure.',
    commands: ['matrix', 'grid-2d'],
    generate: (x, y) => {
      const elements: any[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const id = `mat-${r}-${c}-${makeId()}`;
          elements.push(...createRect(id, x + c * 50, y + r * 40, 50, 40, `${r},${c}`, '#fafafa'));
        }
      }
      return elements;
    },
  },
  {
    id: 'prefix-sum-structure',
    name: 'Prefix Sum Array',
    category: 'structures',
    description: 'Precalculated cumulative sums of elements.',
    commands: ['prefix-sum', 'psa'],
    generate: (x, y) => {
      const elements: any[] = [];
      const orig = ['2', '4', '1', '5'];
      const pref = ['2', '6', '7', '12'];
      // Original Array
      elements.push(createLabel('Original:', x - 70, y + 10));
      for (let i = 0; i < 4; i++) {
        const id = `orig-${i}-${makeId()}`;
        elements.push(...createRect(id, x + i * 55, y, 55, 36, orig[i]));
      }
      // Prefix Array
      elements.push(createLabel('Prefix Sum:', x - 85, y + 75));
      for (let i = 0; i < 4; i++) {
        const id = `pref-${i}-${makeId()}`;
        elements.push(...createRect(id, x + i * 55, y + 65, 55, 36, pref[i], '#eff6ff', '#1e40af'));
        elements.push(createArrow(x + i * 55 + 27, y + 36, x + i * 55 + 27, y + 65));
      }
      return elements;
    },
  },
  {
    id: 'difference-array-structure',
    name: 'Difference Array',
    category: 'structures',
    description: 'Stores differences between adjacent elements.',
    commands: ['difference-array', 'diff-arr'],
    generate: (x, y) => {
      const elements: any[] = [];
      const orig = ['3', '8', '5', '12'];
      const diff = ['3', '5', '-3', '7'];
      elements.push(createLabel('Original:', x - 70, y + 10));
      for (let i = 0; i < 4; i++) {
        const id = `d-orig-${i}-${makeId()}`;
        elements.push(...createRect(id, x + i * 55, y, 55, 36, orig[i]));
      }
      elements.push(createLabel('Difference:', x - 85, y + 75));
      for (let i = 0; i < 4; i++) {
        const id = `d-diff-${i}-${makeId()}`;
        elements.push(...createRect(id, x + i * 55, y + 65, 55, 36, diff[i], '#fff7ed', '#c2410c'));
        elements.push(createArrow(x + i * 55 + 27, y + 36, x + i * 55 + 27, y + 65));
      }
      return elements;
    },
  },

  // ── DATA STRUCTURES: Linked Lists ─────────────────────────
  {
    id: 'linked-list',
    name: 'Linked List',
    category: 'structures',
    description: 'Singly linked list nodes.',
    commands: ['linked-list', 'singly-linked-list', 'list'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['A', 'B', 'C'];
      for (let i = 0; i < 3; i++) {
        const valId = `ll-val-${i}-${makeId()}`;
        const nextId = `ll-next-${i}-${makeId()}`;
        elements.push(...createRect(valId, x + i * 140, y, 50, 40, values[i]));
        elements.push(...createRect(nextId, x + i * 140 + 50, y, 25, 40, '•', '#f5f5f5', '#0070f3'));
        if (i < 2) {
          elements.push(createArrow(x + i * 140 + 62, y + 20, x + i * 140 + 140, y + 20));
        }
      }
      elements.push(createArrow(x + 2 * 140 + 62, y + 20, x + 2 * 140 + 102, y + 20));
      elements.push(createLabel('NULL', x + 2 * 140 + 107, y + 12, '#888888', 14));
      return elements;
    },
  },
  {
    id: 'doubly-linked-list',
    name: 'Doubly Linked List',
    category: 'structures',
    description: 'Nodes with forward and backward links.',
    commands: ['doubly-linked-list', 'dll'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['A', 'B', 'C'];
      for (let i = 0; i < 3; i++) {
        const prevId = `dll-prev-${i}-${makeId()}`;
        const valId = `dll-val-${i}-${makeId()}`;
        const nextId = `dll-next-${i}-${makeId()}`;
        elements.push(...createRect(prevId, x + i * 180, y, 25, 40, 'L', '#f5f5f5', '#888888'));
        elements.push(...createRect(valId, x + i * 180 + 25, y, 45, 40, values[i]));
        elements.push(...createRect(nextId, x + i * 180 + 70, y, 25, 40, 'R', '#f5f5f5', '#888888'));
        if (i < 2) {
          elements.push(createArrow(x + i * 180 + 82, y + 12, x + i * 180 + 180, y + 12, '#0070f3'));
          elements.push(createArrow(x + (i + 1) * 180 + 12, y + 28, x + i * 180 + 95, y + 28, '#7928ca'));
        }
      }
      return elements;
    },
  },
  {
    id: 'circular-linked-list-structure',
    name: 'Circular Linked List',
    category: 'structures',
    description: 'Linked list where the last node points back to the first.',
    commands: ['circular-linked-list', 'cll'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['A', 'B', 'C'];
      for (let i = 0; i < 3; i++) {
        const valId = `cll-val-${i}-${makeId()}`;
        const nextId = `cll-next-${i}-${makeId()}`;
        elements.push(...createRect(valId, x + i * 140, y, 50, 40, values[i]));
        elements.push(...createRect(nextId, x + i * 140 + 50, y, 25, 40, '•', '#f5f5f5', '#0070f3'));
        if (i < 2) {
          elements.push(createArrow(x + i * 140 + 62, y + 20, x + i * 140 + 140, y + 20));
        }
      }
      elements.push({
        type: 'arrow',
        x: x + 2 * 140 + 62,
        y: y + 20,
        points: [[0, 0], [20, 0], [20, 50], [-345, 50], [-345, 25]],
        strokeColor: '#7928ca',
        strokeWidth: 1.5,
      });
      return elements;
    },
  },

  // ── DATA STRUCTURES: Stack & Queue ────────────────────────
  {
    id: 'stack',
    name: 'Stack',
    category: 'structures',
    description: 'LIFO stack container with values.',
    commands: ['stack', 'lifo'],
    generate: (x, y) => {
      const elements: any[] = [];
      elements.push({
        type: 'line',
        x,
        y,
        points: [[0, 0], [0, 160], [80, 160], [80, 0]],
        strokeColor: '#171717',
        strokeWidth: 2,
      });
      const cellVals = ['3 (Top)', '2', '1'];
      for (let i = 0; i < 3; i++) {
        const id = `stack-cell-${i}-${makeId()}`;
        elements.push(...createRect(id, x + 6, y + 150 - (i + 1) * 40, 68, 36, cellVals[i], '#ffffff', '#0070f3'));
      }
      return elements;
    },
  },
  {
    id: 'queue',
    name: 'Queue',
    category: 'structures',
    description: 'FIFO open-ended buffer container.',
    commands: ['queue', 'fifo'],
    generate: (x, y) => {
      const elements: any[] = [];
      elements.push(
        { type: 'line', x, y, points: [[0, 0], [180, 0]], strokeColor: '#171717', strokeWidth: 2 },
        { type: 'line', x, y: y + 40, points: [[0, 0], [180, 0]], strokeColor: '#171717', strokeWidth: 2 }
      );
      const values = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < 4; i++) {
        const id = `q-${i}-${makeId()}`;
        elements.push(...createRect(id, x + 10 + i * 40, y + 4, 36, 32, values[i], '#ffffff', '#7928ca'));
      }
      elements.push(
        createArrow(x - 30, y + 20, x + 5, y + 20, '#ef4444'),
        createLabel('Front', x - 65, y + 12, '#ef4444'),
        createArrow(x + 210, y + 20, x + 175, y + 20, '#10b981'),
        createLabel('Rear', x + 215, y + 12, '#10b981')
      );
      return elements;
    },
  },
  {
    id: 'deque-structure',
    name: 'Deque',
    category: 'structures',
    description: 'Double-ended queue (insert/delete at both ends).',
    commands: ['deque', 'double-ended-queue'],
    generate: (x, y) => {
      const elements: any[] = [];
      elements.push(
        { type: 'line', x, y, points: [[0, 0], [180, 0]], strokeColor: '#171717', strokeWidth: 2 },
        { type: 'line', x, y: y + 40, points: [[0, 0], [180, 0]], strokeColor: '#171717', strokeWidth: 2 }
      );
      const values = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < 4; i++) {
        const id = `dq-${i}-${makeId()}`;
        elements.push(...createRect(id, x + 10 + i * 40, y + 4, 36, 32, values[i]));
      }
      elements.push(
        createArrow(x - 35, y + 10, x + 5, y + 10, '#0070f3'),
        createArrow(x + 5, y + 30, x - 35, y + 30, '#ef4444'),
        createLabel('Left', x - 70, y + 12, '#0070f3'),
        createArrow(x + 215, y + 30, x + 175, y + 30, '#0070f3'),
        createArrow(x + 175, y + 10, x + 215, y + 10, '#ef4444'),
        createLabel('Right', x + 225, y + 12, '#ef4444')
      );
      return elements;
    },
  },
  {
    id: 'circular-queue-structure',
    name: 'Circular Queue',
    category: 'structures',
    description: 'Queue structured in a ring using array indices.',
    commands: ['circular-queue', 'ring-buffer'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeCoords = [
        { label: '0', x: 0, y: -45 },
        { label: '1', x: 40, y: -20 },
        { label: '2', x: 40, y: 30 },
        { label: '3', x: 0, y: 55 },
        { label: '4', x: -40, y: 30 },
        { label: '5', x: -40, y: -20 },
      ];
      nodeCoords.forEach((node, i) => {
        const id = `cq-node-${i}-${makeId()}`;
        elements.push(...createCircle(id, x + node.x + 50, y + node.y + 40, 18, node.label));
      });
      elements.push({
        type: 'ellipse',
        x: x - 20,
        y: y - 30,
        width: 140,
        height: 140,
        strokeColor: '#0070f3',
        backgroundColor: 'transparent',
        strokeWidth: 1.5,
        strokeStyle: 'dashed',
      });
      return elements;
    },
  },
  {
    id: 'priority-queue-structure',
    name: 'Priority Queue',
    category: 'structures',
    description: 'Queue where elements have associated priorities.',
    commands: ['priority-queue', 'pq'],
    generate: (x, y) => {
      const elements: any[] = [];
      const items = [
        { val: 'A', pri: '10' },
        { val: 'B', pri: '7' },
        { val: 'C', pri: '3' },
      ];
      for (let i = 0; i < 3; i++) {
        const id = `pq-${i}-${makeId()}`;
        elements.push(...createRect(id, x + i * 85, y, 80, 40, `${items[i].val} (p=${items[i].pri})`, '#f0fdfa', '#0d9488'));
      }
      elements.push(createLabel('Sorted by Highest Priority First', x, y + 54, '#0d9488'));
      return elements;
    },
  },
  {
    id: 'monotonic-stack-structure',
    name: 'Monotonic Stack',
    category: 'structures',
    description: 'Stack elements kept in increasing/decreasing order.',
    commands: ['monotonic-stack', 'mono-stack'],
    generate: (x, y) => {
      const elements: any[] = [];
      elements.push({
        type: 'line',
        x,
        y,
        points: [[0, 0], [0, 160], [80, 160], [80, 0]],
        strokeColor: '#171717',
        strokeWidth: 2,
      });
      const vals = ['8', '5', '2'];
      for (let i = 0; i < 3; i++) {
        const id = `mstack-${i}-${makeId()}`;
        elements.push(...createRect(id, x + 6, y + 150 - (i + 1) * 40, 68, 36, vals[i], '#fffbeb', '#d97706'));
      }
      elements.push(createLabel('Decreasing Order', x - 25, y + 172, '#d97706'));
      return elements;
    },
  },
  {
    id: 'monotonic-queue-structure',
    name: 'Monotonic Queue',
    category: 'structures',
    description: 'Queue elements kept in increasing/decreasing order.',
    commands: ['monotonic-queue', 'mono-queue'],
    generate: (x, y) => {
      const elements: any[] = [];
      elements.push(
        { type: 'line', x, y, points: [[0, 0], [180, 0]], strokeColor: '#171717', strokeWidth: 2 },
        { type: 'line', x, y: y + 40, points: [[0, 0], [180, 0]], strokeColor: '#171717', strokeWidth: 2 }
      );
      const vals = ['9', '6', '4', '2'];
      for (let i = 0; i < 4; i++) {
        const id = `mq-${i}-${makeId()}`;
        elements.push(...createRect(id, x + 10 + i * 40, y + 4, 36, 32, vals[i], '#fffbeb', '#d97706'));
      }
      return elements;
    },
  },

  // ── DATA STRUCTURES: Hashing ──────────────────────────────
  {
    id: 'hash-table-structure',
    name: 'Hash Table',
    category: 'structures',
    description: 'Indices pointing to chained buckets.',
    commands: ['hash-table', 'hash-map', 'hash-set', 'hash'],
    generate: (x, y) => {
      const elements: any[] = [];
      for (let i = 0; i < 4; i++) {
        const bucketId = `bucket-${i}-${makeId()}`;
        elements.push(...createRect(bucketId, x, y + i * 45, 40, 36, `[${i}]`, '#f4f4f5'));
        if (i % 2 === 0) {
          const valId1 = `hash-val1-${i}-${makeId()}`;
          const valId2 = `hash-val2-${i}-${makeId()}`;
          elements.push(...createRect(valId1, x + 80, y + i * 45, 55, 36, `K${i}->V`, '#fafafa'));
          elements.push(createArrow(x + 40, y + i * 45 + 18, x + 80, y + i * 45 + 18));
          if (i === 0) {
            elements.push(...createRect(valId2, x + 175, y + i * 45, 55, 36, `K${i + 4}->V`));
            elements.push(createArrow(x + 135, y + i * 45 + 18, x + 175, y + i * 45 + 18));
          }
        } else {
          elements.push(createLabel('NULL', x + 70, y + i * 45 + 10, '#888888', 12));
          elements.push(createArrow(x + 40, y + i * 45 + 18, x + 65, y + i * 45 + 18));
        }
      }
      return elements;
    },
  },

  // ── DATA STRUCTURES: Trees ────────────────────────────────
  {
    id: 'binary-tree',
    name: 'Binary Tree',
    category: 'structures',
    description: 'Basic binary tree with parent-child links.',
    commands: ['binary-tree', 'tree'],
    generate: (x, y) => {
      const elements: any[] = [];
      const rootId = `tree-root-${makeId()}`;
      const leftId = `tree-left-${makeId()}`;
      const rightId = `tree-right-${makeId()}`;
      elements.push(...createCircle(rootId, x, y, 20, 'Root'));
      elements.push(...createCircle(leftId, x - 80, y + 80, 20, 'L'));
      elements.push(...createCircle(rightId, x + 80, y + 80, 20, 'R'));
      elements.push(createArrow(x - 5, y + 20, x - 65, y + 65, '#0070f3', rootId, leftId));
      elements.push(createArrow(x + 5, y + 20, x + 65, y + 65, '#0070f3', rootId, rightId));
      return elements;
    },
  },
  {
    id: 'bst',
    name: 'BST (Binary Search Tree)',
    category: 'structures',
    description: 'Binary search tree ordered values.',
    commands: ['bst', 'binary-search-tree'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: '15', val: 15, x: 0, y: 0, left: '10', right: '20' },
        { id: '10', val: 10, x: -80, y: 70, left: '5', right: '12' },
        { id: '20', val: 20, x: 80, y: 70, left: null, right: '25' },
        { id: '5', val: 5, x: -120, y: 140, left: null, right: null },
        { id: '12', val: 12, x: -40, y: 140, left: null, right: null },
        { id: '25', val: 25, x: 120, y: 140, left: null, right: null },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `bst-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 19, `${item.val}`));
      });
      nodeData.forEach((item) => {
        const currentUId = instanceMap[item.id];
        if (item.left) {
          const targetUId = instanceMap[item.left];
          const tx = nodeData.find(n => n.id === item.left)!.x;
          elements.push(createArrow(x + item.x - 10, y + item.y + 15, x + tx + 10, y + item.y + 55, '#0070f3', currentUId, targetUId));
        }
        if (item.right) {
          const targetUId = instanceMap[item.right];
          const tx = nodeData.find(n => n.id === item.right)!.x;
          elements.push(createArrow(x + item.x + 10, y + item.y + 15, x + tx - 10, y + item.y + 55, '#0070f3', currentUId, targetUId));
        }
      });
      return elements;
    },
  },
  {
    id: 'avl-tree-structure',
    name: 'AVL Tree',
    category: 'structures',
    description: 'Self-balancing binary search tree.',
    commands: ['avl-tree', 'avl'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: '30', val: '30', bal: '0', x: 0, y: 0, left: '20', right: '40' },
        { id: '20', val: '20', bal: '0', x: -70, y: 70, left: null, right: null },
        { id: '40', val: '40', bal: '0', x: 70, y: 70, left: null, right: null },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `avl-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 18, item.val, '#eff6ff', '#1e40af'));
        elements.push(createLabel(`bal:${item.bal}`, x + item.x - 15, y + item.y - 30, '#1e40af', 10));
      });
      elements.push(
        createArrow(x - 10, y + 15, x - 55, y + 55, '#0070f3', instanceMap['30'], instanceMap['20']),
        createArrow(x + 10, y + 15, x + 55, y + 55, '#0070f3', instanceMap['30'], instanceMap['40'])
      );
      return elements;
    },
  },
  {
    id: 'red-black-tree-structure',
    name: 'Red Black Tree',
    category: 'structures',
    description: 'Self-balancing BST with red/black node color constraints.',
    commands: ['red-black-tree', 'rbt'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodes = [
        { id: '1', val: '10', color: '#171717', stroke: '#ef4444', x: 0, y: 0 },
        { id: '2', val: '5', color: '#fee2e2', stroke: '#ef4444', x: -60, y: 60 },
        { id: '3', val: '15', color: '#fee2e2', stroke: '#ef4444', x: 60, y: 60 },
      ];
      const instanceMap: Record<string, string> = {};
      nodes.forEach((n) => {
        const uId = `rbt-${n.id}-${makeId()}`;
        instanceMap[n.id] = uId;
        elements.push(...createCircle(uId, x + n.x, y + n.y, 18, n.val, n.color, n.stroke));
      });
      elements.push(
        createArrow(x - 10, y + 15, x - 50, y + 50, '#ef4444', instanceMap['1'], instanceMap['2']),
        createArrow(x + 10, y + 15, x + 50, y + 50, '#ef4444', instanceMap['1'], instanceMap['3'])
      );
      return elements;
    },
  },
  {
    id: 'trie-structure',
    name: 'Trie',
    category: 'structures',
    description: 'Prefix tree for key string retrieval.',
    commands: ['trie', 'prefix-tree'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: 'root', label: 'root', x: 0, y: 0 },
        { id: 'c', label: 'c', x: -40, y: 60 },
        { id: 'a', label: 'a', x: -40, y: 120 },
        { id: 't', label: 't', x: -40, y: 180 },
        { id: 'o', label: 'o', x: 40, y: 60 },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `trie-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 16, item.label, '#faf5ff', '#6b21a8'));
      });
      elements.push(
        createArrow(x - 10, y + 15, x - 30, y + 45, '#6b21a8', instanceMap['root'], instanceMap['c']),
        createArrow(x - 40, y + 76, x - 40, y + 104, '#6b21a8', instanceMap['c'], instanceMap['a']),
        createArrow(x - 40, y + 136, x - 40, y + 164, '#6b21a8', instanceMap['a'], instanceMap['t']),
        createArrow(x + 10, y + 15, x + 30, y + 45, '#6b21a8', instanceMap['root'], instanceMap['o'])
      );
      return elements;
    },
  },
  {
    id: 'heap',
    name: 'Heap',
    category: 'structures',
    description: 'Binary Max-Heap layout.',
    commands: ['heap', 'max-heap', 'min-heap'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: '1', val: 50, x: 0, y: 0, left: '2', right: '3' },
        { id: '2', val: 30, x: -70, y: 70, left: '4', right: '5' },
        { id: '3', val: 40, x: 70, y: 70, left: null, right: null },
        { id: '4', val: 10, x: -110, y: 140, left: null, right: null },
        { id: '5', val: 20, x: -30, y: 140, left: null, right: null },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `heap-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 19, `${item.val}`));
      });
      nodeData.forEach((item) => {
        const currentUId = instanceMap[item.id];
        if (item.left) {
          const targetUId = instanceMap[item.left];
          const tx = nodeData.find(n => n.id === item.left)!.x;
          elements.push(createArrow(x + item.x - 10, y + item.y + 15, x + tx + 10, y + item.y + 55, '#0070f3', currentUId, targetUId));
        }
        if (item.right) {
          const targetUId = instanceMap[item.right];
          const tx = nodeData.find(n => n.id === item.right)!.x;
          elements.push(createArrow(x + item.x + 10, y + item.y + 15, x + tx - 10, y + item.y + 55, '#0070f3', currentUId, targetUId));
        }
      });
      return elements;
    },
  },
  {
    id: 'segment-tree-structure',
    name: 'Segment Tree',
    category: 'structures',
    description: 'Interval array queries representation tree.',
    commands: ['segment-tree', 'segtree'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: 'root', range: '[0-3]', val: '10', x: 0, y: 0, left: 'l1', right: 'r1' },
        { id: 'l1', range: '[0-1]', val: '6', x: -80, y: 70, left: null, right: null },
        { id: 'r1', range: '[2-3]', val: '4', x: 80, y: 70, left: null, right: null },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `seg-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createRect(uId, x + item.x - 25, y + item.y - 18, 50, 36, item.val, '#faf5ff', '#7c3aed'));
        elements.push(createLabel(item.range, x + item.x - 20, y + item.y - 34, '#7c3aed', 10));
      });
      elements.push(
        createArrow(x - 15, y + 18, x - 65, y + 52, '#7c3aed', instanceMap['root'], instanceMap['l1']),
        createArrow(x + 15, y + 18, x + 65, y + 52, '#7c3aed', instanceMap['root'], instanceMap['r1'])
      );
      return elements;
    },
  },
  {
    id: 'fenwick-tree-structure',
    name: 'Fenwick Tree (BIT)',
    category: 'structures',
    description: 'Binary Indexed Tree range queries structures.',
    commands: ['fenwick-tree', 'bit'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['0', '3', '5', '2', '11'];
      for (let i = 0; i < 5; i++) {
        const id = `bit-${i}-${makeId()}`;
        elements.push(...createRect(id, x + i * 55, y, 55, 36, values[i], '#f0fdfa', '#0f766e'));
        elements.push(createLabel(`idx:${i}`, x + i * 55 + 15, y + 46, '#0f766e', 11));
      }
      return elements;
    },
  },
  {
    id: 'sparse-table-structure',
    name: 'Sparse Table',
    category: 'structures',
    description: 'Power-of-2 ranges static query table.',
    commands: ['sparse-table', 'st'],
    generate: (x, y) => {
      const elements: any[] = [];
      for (let r = 0; r < 3; r++) {
        elements.push(createLabel(`k=${r}`, x - 40, y + r * 35 + 10, '#4f46e5'));
        for (let c = 0; c < 4; c++) {
          const id = `st-${r}-${c}-${makeId()}`;
          elements.push(...createRect(id, x + c * 50, y + r * 35, 50, 30, `ST[${c}][${r}]`, '#e0e7ff', '#4f46e5'));
        }
      }
      return elements;
    },
  },

  // ── DATA STRUCTURES: Graphs ───────────────────────────────
  {
    id: 'graph',
    name: 'Graph',
    category: 'structures',
    description: 'Directed/undirected vertex-edge graph.',
    commands: ['graph', 'vertex', 'edge'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 100, y: 30 },
        { id: 'C', x: 50, y: 100 },
        { id: 'D', x: -50, y: 80 },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `graph-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 18, item.id));
      });
      const addEdge = (fromKey: string, toKey: string, color = '#0070f3') => {
        const fromId = instanceMap[fromKey];
        const toId = instanceMap[toKey];
        const from = nodeData.find(n => n.id === fromKey)!;
        const to = nodeData.find(n => n.id === toKey)!;
        elements.push(createArrow(x + from.x + 10, y + from.y + 10, x + to.x + 10, y + to.y + 10, color, fromId, toId));
      };
      addEdge('A', 'B');
      addEdge('B', 'C');
      addEdge('C', 'D');
      addEdge('D', 'A', '#7928ca');
      return elements;
    },
  },
  {
    id: 'directed-graph-structure',
    name: 'Directed Graph',
    category: 'structures',
    description: 'Graph with directed edge paths.',
    commands: ['directed-graph', 'digraph'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 110, y: 0 },
        { id: 'C', x: 55, y: 80 },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `dg-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 18, item.id, '#fff8e1', '#f57f17'));
      });
      elements.push(
        createArrow(x + 18, y, x + 92, y, '#f57f17', instanceMap['A'], instanceMap['B']),
        createArrow(x + 110 - 10, y + 15, x + 55 + 10, y + 65, '#f57f17', instanceMap['B'], instanceMap['C']),
        createArrow(x + 55 - 10, y + 65, x + 10, y + 15, '#f57f17', instanceMap['C'], instanceMap['A'])
      );
      return elements;
    },
  },
  {
    id: 'undirected-graph-structure',
    name: 'Undirected Graph',
    category: 'structures',
    description: 'Graph with undirected connections.',
    commands: ['undirected-graph', 'graph-undir'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 110, y: 0 },
        { id: 'C', x: 55, y: 80 },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `ug-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 18, item.id));
      });
      elements.push(
        { type: 'line', x: x + 18, y: y, points: [[0, 0], [74, 0]], strokeColor: '#171717', strokeWidth: 1.5 },
        { type: 'line', x: x + 110 - 10, y: y + 15, points: [[0, 0], [-45, 50]], strokeColor: '#171717', strokeWidth: 1.5 },
        { type: 'line', x: x + 55 - 10, y: y + 65, points: [[0, 0], [-45, -50]], strokeColor: '#171717', strokeWidth: 1.5 }
      );
      return elements;
    },
  },
  {
    id: 'weighted-graph-structure',
    name: 'Weighted Graph',
    category: 'structures',
    description: 'Graph where connections have numeric weights.',
    commands: ['weighted-graph', 'graph-weighted'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 120, y: 0 },
        { id: 'C', x: 60, y: 80 },
      ];
      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `wg-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 18, item.id, '#fdf2f8', '#db2777'));
      });
      elements.push(
        createArrow(x + 18, y, x + 102, y, '#db2777', instanceMap['A'], instanceMap['B']),
        createArrow(x + 120 - 10, y + 15, x + 60 + 10, y + 65, '#db2777', instanceMap['B'], instanceMap['C']),
        createLabel('w=4', x + 50, y - 18, '#db2777', 11),
        createLabel('w=2', x + 98, y + 42, '#db2777', 11)
      );
      return elements;
    },
  },
  {
    id: 'dag-structure',
    name: 'DAG (Directed Acyclic Graph)',
    category: 'structures',
    description: 'Directed graph without cyclic loops.',
    commands: ['dag', 'directed-acyclic-graph'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodes = [
        { id: 'A', x: 0, y: 0 },
        { id: 'B', x: 100, y: -40 },
        { id: 'C', x: 100, y: 40 },
        { id: 'D', x: 200, y: 0 },
      ];
      const instanceMap: Record<string, string> = {};
      nodes.forEach((n) => {
        const uId = `dag-${n.id}-${makeId()}`;
        instanceMap[n.id] = uId;
        elements.push(...createCircle(uId, x + n.x, y + n.y, 16, n.id, '#f0f9ff', '#0369a1'));
      });
      elements.push(
        createArrow(x + 12, y - 8, x + 88, y - 32, '#0369a1', instanceMap['A'], instanceMap['B']),
        createArrow(x + 12, y + 8, x + 88, y + 32, '#0369a1', instanceMap['A'], instanceMap['C']),
        createArrow(x + 112, y - 32, x + 188, y - 8, '#0369a1', instanceMap['B'], instanceMap['D']),
        createArrow(x + 112, y + 32, x + 188, y + 8, '#0369a1', instanceMap['C'], instanceMap['D'])
      );
      return elements;
    },
  },
  {
    id: 'dsu-structure',
    name: 'DSU (Disjoint Set Union)',
    category: 'structures',
    description: 'Tree elements tracking disjoint set partitions.',
    commands: ['dsu', 'union-find-structure'],
    generate: (x, y) => {
      const elements: any[] = [];
      const rootId1 = `dsu-root1-${makeId()}`;
      const childId1 = `dsu-child1-${makeId()}`;
      const rootId2 = `dsu-root2-${makeId()}`;
      elements.push(...createCircle(rootId1, x, y, 18, '0', '#fdf2f8', '#db2777'));
      elements.push(...createCircle(childId1, x, y + 60, 18, '1'));
      elements.push(createArrow(x, y + 42, x, y + 18, '#db2777', childId1, rootId1));

      elements.push(...createCircle(rootId2, x + 100, y, 18, '2', '#fdf2f8', '#db2777'));
      elements.push(createLabel('Set Parents representation', x - 20, y + 90, '#db2777'));
      return elements;
    },
  },

  // ── ALGORITHMS: Fallbacks & conceptual insertions ──────────
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    category: 'algorithms',
    description: 'Array with highlighted subset window.',
    commands: ['sliding-window', 'window'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['1', '3', '-1', '-3', '5', '3'];
      for (let i = 0; i < 6; i++) {
        const cellId = `sw-arr-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 50, y, 50, 40, values[i], '#ffffff', '#666666'));
      }
      elements.push({
        type: 'rectangle',
        x: x + 50 - 4,
        y: y - 6,
        width: 158,
        height: 52,
        strokeColor: '#0070f3',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        backgroundColor: 'transparent',
      });
      elements.push(
        createArrow(x + 70, y - 35, x + 70, y - 10, '#0070f3'),
        createLabel('L = 1', x + 58, y - 50, '#0070f3'),
        createArrow(x + 170, y - 35, x + 170, y - 10, '#0070f3'),
        createLabel('R = 3', x + 158, y - 50, '#0070f3')
      );
      return elements;
    },
  },
  {
    id: 'fast-slow-pointer',
    name: 'Fast & Slow Pointer',
    category: 'algorithms',
    description: 'Cyclic linked list with pointer labels.',
    commands: ['fast-slow-pointer', 'cycle-detection', 'tortoise-hare'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeCoords = [
        { id: '1', x: 0, y: 0 },
        { id: '2', x: 90, y: 0 },
        { id: '3', x: 180, y: 0 },
        { id: '4', x: 135, y: 70 },
      ];
      const instanceMap: Record<string, string> = {};
      nodeCoords.forEach((node) => {
        const uId = `cycle-node-${node.id}-${makeId()}`;
        instanceMap[node.id] = uId;
        elements.push(...createCircle(uId, x + node.x, y + node.y, 18, node.id));
      });
      const connect = (fromNode: string, toNode: string, color = '#0070f3') => {
        const fromId = instanceMap[fromNode];
        const toId = instanceMap[toNode];
        const from = nodeCoords.find(n => n.id === fromNode)!;
        const to = nodeCoords.find(n => n.id === toNode)!;
        elements.push(createArrow(x + from.x + 10, y + from.y + 10, x + to.x + 10, y + to.y + 10, color, fromId, toId));
      };
      connect('1', '2');
      connect('2', '3');
      connect('3', '4');
      connect('4', '2', '#7928ca');
      elements.push(
        createLabel('Slow', x + 70, y - 50, '#ef4444'),
        createArrow(x + 90, y - 22, x + 100, y - 6, '#ef4444'),
        createLabel('Fast', x + 155, y + 105, '#10b981'),
        createArrow(x + 160, y + 102, x + 150, y + 84, '#10b981')
      );
      return elements;
    },
  },
  {
    id: 'dfs',
    name: 'DFS (Depth First Search)',
    category: 'algorithms',
    description: 'Tree traversal order demonstration.',
    commands: ['dfs', 'depth-first-search'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: '1', val: 'A', x: 0, y: 0, order: '1' },
        { id: '2', val: 'B', x: -60, y: 60, order: '2' },
        { id: '3', val: 'C', x: -100, y: 120, order: '3' },
        { id: '4', val: 'D', x: -20, y: 120, order: '4' },
        { id: '5', val: 'E', x: 60, y: 60, order: '5' },
      ];
      nodeData.forEach((item) => {
        const uId = `dfs-${item.id}-${makeId()}`;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 18, item.val));
        elements.push(createLabel(`[t=${item.order}]`, x + item.x + 22, y + item.y + 8, '#f59e0b', 11));
      });
      const connect = (fIdx: number, tIdx: number) => {
        const f = nodeData[fIdx - 1];
        const t = nodeData[tIdx - 1];
        elements.push(createArrow(x + f.x + 10, y + f.y + 10, x + t.x + 10, y + t.y + 10, '#888888'));
      };
      connect(1, 2);
      connect(2, 3);
      connect(2, 4);
      connect(1, 5);
      return elements;
    },
  },
  {
    id: 'bfs',
    name: 'BFS (Breadth First Search)',
    category: 'algorithms',
    description: 'Level-order node traversal values.',
    commands: ['bfs', 'breadth-first-search'],
    generate: (x, y) => {
      const elements: any[] = [];
      const nodeData = [
        { id: '1', val: 'A', x: 0, y: 0, order: '1' },
        { id: '2', val: 'B', x: -60, y: 60, order: '2' },
        { id: '3', val: 'C', x: 60, y: 60, order: '3' },
        { id: '4', val: 'D', x: -90, y: 120, order: '4' },
        { id: '5', val: 'E', x: -30, y: 120, order: '5' },
      ];
      nodeData.forEach((item) => {
        const uId = `bfs-${item.id}-${makeId()}`;
        elements.push(...createCircle(uId, x + item.x, y + item.y, 18, item.val));
        elements.push(createLabel(`[t=${item.order}]`, x + item.x + 22, y + item.y + 8, '#10b981', 11));
      });
      const connect = (fIdx: number, tIdx: number) => {
        const f = nodeData[fIdx - 1];
        const t = nodeData[tIdx - 1];
        elements.push(createArrow(x + f.x + 10, y + f.y + 10, x + t.x + 10, y + t.y + 10, '#888888'));
      };
      connect(1, 2);
      connect(1, 3);
      connect(2, 4);
      connect(2, 5);
      return elements;
    },
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    category: 'algorithms',
    description: 'Inward matching array pointers.',
    commands: ['two-pointers', 'pointers'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['1', '2', '3', '4', '5'];
      for (let i = 0; i < 5; i++) {
        const cellId = `tp-arr-${i}-${makeId()}`;
        elements.push(...createRect(cellId, x + i * 50, y, 50, 40, values[i]));
      }
      elements.push(
        createArrow(x + 25, y + 80, x + 25, y + 48, '#7928ca'),
        createLabel('left\n(i=0)', x + 5, y + 88, '#7928ca', 10),
        createArrow(x + 225, y + 80, x + 225, y + 48, '#ef4444'),
        createLabel('right\n(i=4)', x + 205, y + 88, '#ef4444', 10)
      );
      return elements;
    },
  },
];

const genericGenerator = (id: string, name: string): DSAStructure => {
  const algoDef = ALGORITHMS.find((a) => a.id === id);
  const category = algoDef ? algoDef.category : 'algorithms';

  return {
    id,
    name,
    category: 'algorithms',
    description: algoDef?.blurb || `Interactive flow skeleton for ${name}.`,
    commands: [id],
    generate: (x, y) => renderCanvasLayout(id, name, category, x, y),
  };
};

const missingGenerators: [string, string][] = [
  ['linear-search', 'Linear Search'],
  ['binary-search', 'Binary Search'],
  ['ternary-search', 'Ternary Search'],
  ['lower-bound', 'Lower Bound'],
  ['upper-bound', 'Upper Bound'],
  ['bubble-sort', 'Bubble Sort'],
  ['selection-sort', 'Selection Sort'],
  ['insertion-sort', 'Insertion Sort'],
  ['merge-sort', 'Merge Sort'],
  ['quick-sort', 'Quick Sort'],
  ['heap-sort', 'Heap Sort'],
  ['counting-sort', 'Counting Sort'],
  ['radix-sort', 'Radix Sort'],
  ['recursion', 'Recursion'],
  ['recursion-tree', 'Recursion Tree'],
  ['backtracking', 'Backtracking'],
  ['subsets', 'Subsets'],
  ['permutations', 'Permutations'],
  ['combination-sum', 'Combination Sum'],
  ['n-queens', 'N-Queens'],
  ['dfs-tree', 'DFS Tree'],
  ['bfs-tree', 'BFS Tree'],
  ['preorder', 'Preorder Traversal'],
  ['inorder', 'Inorder Traversal'],
  ['postorder', 'Postorder Traversal'],
  ['level-order', 'Level Order Traversal'],
  ['morris-traversal', 'Morris Traversal'],
  ['bfs-graph', 'BFS Graph'],
  ['dfs-graph', 'DFS Graph'],
  ['topological-sort', 'Topological Sort'],
  ['dijkstra', "Dijkstra's Shortest Path"],
  ['bellman-ford', 'Bellman Ford'],
  ['floyd-warshall', 'Floyd Warshall'],
  ['kruskal', 'Kruskal MST'],
  ['prim', 'Prim MST'],
  ['kosaraju', 'Kosaraju SCC'],
  ['tarjan', 'Tarjan SCC'],
  ['bridges', 'Bridges & Articulation'],
  ['1d-dp', '1D DP'],
  ['2d-dp', '2D DP'],
  ['knapsack', '0/1 Knapsack'],
  ['lis', 'LIS (Longest Increasing Subseq)'],
  ['lcs', 'LCS (Longest Common Subseq)'],
  ['dp-on-trees', 'DP on Trees'],
  ['digit-dp', 'Digit DP'],
  ['bitmask-dp', 'Bitmask DP'],
  ['activity-selection', 'Activity Selection'],
  ['interval-scheduling', 'Interval Scheduling'],
  ['huffman-coding', 'Huffman Coding'],
  ['kmp', 'KMP String Search'],
  ['rabin-karp', 'Rabin Karp Hash Match'],
  ['z-algorithm', 'Z Algorithm Matcher'],
  ['manacher', "Manacher's Palindrome"],
  ['lazy-propagation', 'Lazy Propagation Tree'],
  ['binary-lifting', 'Binary Lifting Tree'],
  ['euler-tour', 'Euler Tour Tree'],
  ['mos-algorithm', "Mo's Offline Queries"],
  ['sweep-line', 'Sweep Line Geometric'],
  ['coordinate-compression', 'Coordinate Compression'],
];

missingGenerators.forEach(([id, name]) => {
  if (!dsaStructures.some(s => s.id === id)) {
    dsaStructures.push(genericGenerator(id, name));
  }
});

export const bindTextContainers = (skeletons: any[]) => {
  const containerMap = new Map<string, any>();
  skeletons.forEach((s) => {
    if (s.id) {
      containerMap.set(s.id, s);
    }
  });

  skeletons.forEach((s) => {
    if (s.type === 'text' && s.containerId) {
      const container = containerMap.get(s.containerId);
      if (container) {
        s.id = s.id || `${s.containerId}-text-${Math.random().toString(36).substring(2, 6)}`;
        container.boundElements = container.boundElements || [];
        if (!container.boundElements.some((be: any) => be.id === s.id)) {
          container.boundElements.push({ type: 'text', id: s.id });
        }
        const textStr = String(s.text || '');
        const fontSize = s.fontSize || 14;
        const textWidth = textStr.length * fontSize * 0.6;
        const textHeight = fontSize * 1.25;

        // Clamp text dimensions to never exceed container bounds (with 4px padding)
        const maxTextW = Math.max(8, container.width - 4);
        const maxTextH = Math.max(8, container.height - 4);
        const clampedW = Math.min(textWidth, maxTextW);
        const clampedH = Math.min(textHeight, maxTextH);

        s.x = container.x + (container.width - clampedW) / 2;
        s.y = container.y + (container.height - clampedH) / 2;
        s.width = clampedW;
        s.height = clampedH;
      }
    }
  });
  return skeletons;
};
