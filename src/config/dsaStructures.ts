export interface DSAStructure {
  id: string;
  name: string;
  category: 'structures' | 'algorithms';
  description: string;
  commands: string[];
  generate: (startX: number, startY: number) => any[];
}

// Helper: unique random ID generator for skeletons
const makeId = () => Math.random().toString(36).substring(2, 9);

export const dsaStructures: DSAStructure[] = [
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
        const cellId = `arr-cell-${i}-${makeId()}`;
        // Cell rectangle
        elements.push({
          type: 'rectangle',
          id: cellId,
          x: x + i * 60,
          y: y,
          width: 60,
          height: 40,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
          roughness: 1,
        });
        // Cell Value Text
        elements.push({
          type: 'text',
          text: values[i],
          containerId: cellId,
          fontSize: 16,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
        // Index Label below
        elements.push({
          type: 'text',
          text: `${i}`,
          x: x + i * 60 + 25,
          y: y + 48,
          fontSize: 12,
          strokeColor: '#a1a1aa',
          textAlign: 'center',
        });
      }
      // Array Label
      elements.push({
        type: 'text',
        text: 'Index:',
        x: x - 55,
        y: y + 48,
        fontSize: 12,
        strokeColor: '#71717a',
      });
      return elements;
    },
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    category: 'structures',
    description: 'Singly linked list nodes.',
    commands: ['linked-list', 'singly-linked-list', 'list'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['A', 'B', 'C'];
      const nodeIds: string[] = [];

      for (let i = 0; i < 3; i++) {
        const valCellId = `ll-val-${i}-${makeId()}`;
        const nextCellId = `ll-next-${i}-${makeId()}`;
        nodeIds.push(valCellId);

        // Value compartment
        elements.push({
          type: 'rectangle',
          id: valCellId,
          x: x + i * 140,
          y: y,
          width: 50,
          height: 40,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
          roughness: 1,
        });
        elements.push({
          type: 'text',
          text: values[i],
          containerId: valCellId,
          fontSize: 16,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });

        // Next pointer compartment
        elements.push({
          type: 'rectangle',
          id: nextCellId,
          x: x + i * 140 + 50,
          y: y,
          width: 25,
          height: 40,
          strokeColor: '#e4e4e7',
          backgroundColor: '#27272a',
          fillStyle: 'solid',
          strokeWidth: 1.5,
          roughness: 1,
        });
        elements.push({
          type: 'text',
          text: '•',
          containerId: nextCellId,
          fontSize: 18,
          strokeColor: '#a855f7',
          textAlign: 'center',
          verticalAlign: 'middle',
        });

        // Arrow connecting to next node
        if (i < 2) {
          elements.push({
            type: 'arrow',
            x: x + i * 140 + 62,
            y: y + 20,
            points: [[0, 0], [78, 0]],
            strokeColor: '#a855f7',
            strokeWidth: 1.5,
            roughness: 1,
          });
        }
      }

      // Pointer to NULL
      elements.push({
        type: 'arrow',
        x: x + 2 * 140 + 62,
        y: y + 20,
        points: [[0, 0], [40, 0]],
        strokeColor: '#a855f7',
        strokeWidth: 1.5,
      });

      const nullId = `ll-null-${makeId()}`;
      elements.push({
        type: 'text',
        id: nullId,
        text: 'NULL',
        x: x + 2 * 140 + 107,
        y: y + 12,
        fontSize: 14,
        strokeColor: '#71717a',
      });

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

        // Prev compartment
        elements.push({
          type: 'rectangle',
          id: prevId,
          x: x + i * 180,
          y: y,
          width: 25,
          height: 40,
          strokeColor: '#e4e4e7',
          backgroundColor: '#27272a',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: 'L',
          containerId: prevId,
          fontSize: 10,
          strokeColor: '#71717a',
          textAlign: 'center',
          verticalAlign: 'middle',
        });

        // Value compartment
        elements.push({
          type: 'rectangle',
          id: valId,
          x: x + i * 180 + 25,
          y: y,
          width: 45,
          height: 40,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: values[i],
          containerId: valId,
          fontSize: 16,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });

        // Next compartment
        elements.push({
          type: 'rectangle',
          id: nextId,
          x: x + i * 180 + 70,
          y: y,
          width: 25,
          height: 40,
          strokeColor: '#e4e4e7',
          backgroundColor: '#27272a',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: 'R',
          containerId: nextId,
          fontSize: 10,
          strokeColor: '#71717a',
          textAlign: 'center',
          verticalAlign: 'middle',
        });

        // Bidirectional Arrows
        if (i < 2) {
          // Forward arrow (top)
          elements.push({
            type: 'arrow',
            x: x + i * 180 + 82,
            y: y + 12,
            points: [[0, 0], [98, 0]],
            strokeColor: '#a855f7',
            strokeWidth: 1.5,
          });
          // Backward arrow (bottom)
          elements.push({
            type: 'arrow',
            x: x + (i + 1) * 180 + 12,
            y: y + 28,
            points: [[0, 0], [-98, 0]],
            strokeColor: '#3b82f6',
            strokeWidth: 1.5,
          });
        }
      }

      return elements;
    },
  },
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

      // Root node
      elements.push({
        type: 'ellipse',
        id: rootId,
        x: x,
        y: y,
        width: 40,
        height: 40,
        strokeColor: '#e4e4e7',
        backgroundColor: '#1c1917',
        fillStyle: 'solid',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'Root',
        containerId: rootId,
        fontSize: 14,
        strokeColor: '#f4f4f5',
        textAlign: 'center',
        verticalAlign: 'middle',
      });

      // Left Child Node
      elements.push({
        type: 'ellipse',
        id: leftId,
        x: x - 80,
        y: y + 80,
        width: 40,
        height: 40,
        strokeColor: '#e4e4e7',
        backgroundColor: '#1c1917',
        fillStyle: 'solid',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'L',
        containerId: leftId,
        fontSize: 14,
        strokeColor: '#f4f4f5',
        textAlign: 'center',
        verticalAlign: 'middle',
      });

      // Right Child Node
      elements.push({
        type: 'ellipse',
        id: rightId,
        x: x + 80,
        y: y + 80,
        width: 40,
        height: 40,
        strokeColor: '#e4e4e7',
        backgroundColor: '#1c1917',
        fillStyle: 'solid',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'R',
        containerId: rightId,
        fontSize: 14,
        strokeColor: '#f4f4f5',
        textAlign: 'center',
        verticalAlign: 'middle',
      });

      // Connective arrows
      elements.push({
        type: 'arrow',
        x: x + 10,
        y: y + 38,
        points: [[0, 0], [-70, 44]],
        strokeColor: '#a855f7',
        strokeWidth: 1.5,
        startBinding: { elementId: rootId },
        endBinding: { elementId: leftId },
      });
      elements.push({
        type: 'arrow',
        x: x + 30,
        y: y + 38,
        points: [[0, 0], [70, 44]],
        strokeColor: '#a855f7',
        strokeWidth: 1.5,
        startBinding: { elementId: rootId },
        endBinding: { elementId: rightId },
      });

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

        // Render node circle
        elements.push({
          type: 'ellipse',
          id: uId,
          x: x + item.x,
          y: y + item.y,
          width: 38,
          height: 38,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: `${item.val}`,
          containerId: uId,
          fontSize: 14,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
      });

      // Connections
      nodeData.forEach((item) => {
        const currentUId = instanceMap[item.id];
        if (item.left) {
          const targetUId = instanceMap[item.left];
          const tx = nodeData.find(n => n.id === item.left)!.x;
          elements.push({
            type: 'arrow',
            x: x + item.x + 10,
            y: y + item.y + 36,
            points: [[0, 0], [tx - item.x + 10, 34]],
            strokeColor: '#a855f7',
            strokeWidth: 1.5,
            startBinding: { elementId: currentUId },
            endBinding: { elementId: targetUId },
          });
        }
        if (item.right) {
          const targetUId = instanceMap[item.right];
          const tx = nodeData.find(n => n.id === item.right)!.x;
          elements.push({
            type: 'arrow',
            x: x + item.x + 28,
            y: y + item.y + 36,
            points: [[0, 0], [tx - item.x - 10, 34]],
            strokeColor: '#a855f7',
            strokeWidth: 1.5,
            startBinding: { elementId: currentUId },
            endBinding: { elementId: targetUId },
          });
        }
      });

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

        elements.push({
          type: 'ellipse',
          id: uId,
          x: x + item.x,
          y: y + item.y,
          width: 38,
          height: 38,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: `${item.val}`,
          containerId: uId,
          fontSize: 14,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
      });

      // Connections
      nodeData.forEach((item) => {
        const currentUId = instanceMap[item.id];
        if (item.left) {
          const targetUId = instanceMap[item.left];
          const tx = nodeData.find(n => n.id === item.left)!.x;
          elements.push({
            type: 'arrow',
            x: x + item.x + 10,
            y: y + item.y + 36,
            points: [[0, 0], [tx - item.x + 10, 34]],
            strokeColor: '#a855f7',
            strokeWidth: 1.5,
            startBinding: { elementId: currentUId },
            endBinding: { elementId: targetUId },
          });
        }
        if (item.right) {
          const targetUId = instanceMap[item.right];
          const tx = nodeData.find(n => n.id === item.right)!.x;
          elements.push({
            type: 'arrow',
            x: x + item.x + 28,
            y: y + item.y + 36,
            points: [[0, 0], [tx - item.x - 10, 34]],
            strokeColor: '#a855f7',
            strokeWidth: 1.5,
            startBinding: { elementId: currentUId },
            endBinding: { elementId: targetUId },
          });
        }
      });

      return elements;
    },
  },
  {
    id: 'stack',
    name: 'Stack',
    category: 'structures',
    description: 'LIFO stack container with values.',
    commands: ['stack', 'lifo'],
    generate: (x, y) => {
      const elements: any[] = [];
      const stackWidth = 80;
      const stackHeight = 160;

      // Draw container walls (left, bottom, right)
      elements.push({
        type: 'line',
        x: x,
        y: y,
        points: [[0, 0], [0, stackHeight]],
        strokeColor: '#e4e4e7',
        strokeWidth: 2,
        roughness: 0,
      });
      elements.push({
        type: 'line',
        x: x,
        y: y + stackHeight,
        points: [[0, 0], [stackWidth, 0]],
        strokeColor: '#e4e4e7',
        strokeWidth: 2,
        roughness: 0,
      });
      elements.push({
        type: 'line',
        x: x + stackWidth,
        y: y + stackHeight,
        points: [[0, 0], [0, -stackHeight]],
        strokeColor: '#e4e4e7',
        strokeWidth: 2,
        roughness: 0,
      });

      const cellVals = ['3 (Top)', '2', '1'];
      for (let i = 0; i < 3; i++) {
        const cellId = `stack-cell-${i}-${makeId()}`;
        // Draw elements from bottom to top
        elements.push({
          type: 'rectangle',
          id: cellId,
          x: x + 6,
          y: y + stackHeight - 10 - (i + 1) * 40,
          width: stackWidth - 12,
          height: 36,
          strokeColor: '#a855f7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: cellVals[i],
          containerId: cellId,
          fontSize: 12,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
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
      const queueWidth = 180;
      const queueHeight = 40;

      // Top wall
      elements.push({
        type: 'line',
        x: x,
        y: y,
        points: [[0, 0], [queueWidth, 0]],
        strokeColor: '#e4e4e7',
        strokeWidth: 2,
        roughness: 0,
      });
      // Bottom wall
      elements.push({
        type: 'line',
        x: x,
        y: y + queueHeight,
        points: [[0, 0], [queueWidth, 0]],
        strokeColor: '#e4e4e7',
        strokeWidth: 2,
        roughness: 0,
      });

      const values = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < 4; i++) {
        const cellId = `q-cell-${i}-${makeId()}`;
        elements.push({
          type: 'rectangle',
          id: cellId,
          x: x + 10 + i * 40,
          y: y + 4,
          width: 36,
          height: 32,
          strokeColor: '#3b82f6',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: values[i],
          containerId: cellId,
          fontSize: 14,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
      }

      // Front / Dequeue pointer label
      elements.push({
        type: 'arrow',
        x: x - 40,
        y: y + 20,
        points: [[0, 0], [45, 0]],
        strokeColor: '#ef4444',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'Front\n(out)',
        x: x - 90,
        y: y + 8,
        fontSize: 10,
        strokeColor: '#ef4444',
        textAlign: 'center',
      });

      // Rear / Enqueue pointer label
      elements.push({
        type: 'arrow',
        x: x + queueWidth + 5,
        y: y + 20,
        points: [[0, 0], [-25, 0]],
        strokeColor: '#10b981',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'Rear\n(in)',
        x: x + queueWidth + 12,
        y: y + 8,
        fontSize: 10,
        strokeColor: '#10b981',
        textAlign: 'center',
      });

      return elements;
    },
  },
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

        elements.push({
          type: 'ellipse',
          id: uId,
          x: x + item.x,
          y: y + item.y,
          width: 36,
          height: 36,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: item.id,
          containerId: uId,
          fontSize: 16,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
      });

      // Add Edges
      const addEdge = (fromKey: string, toKey: string, directed = true, color = '#a855f7') => {
        const fromId = instanceMap[fromKey];
        const toId = instanceMap[toKey];
        const from = nodeData.find(n => n.id === fromKey)!;
        const to = nodeData.find(n => n.id === toKey)!;

        elements.push({
          type: directed ? 'arrow' : 'line',
          x: x + from.x + 18,
          y: y + from.y + 18,
          points: [[0, 0], [to.x - from.x, to.y - from.y]],
          strokeColor: color,
          strokeWidth: 1.5,
          startBinding: { elementId: fromId },
          endBinding: { elementId: toId },
        });
      };

      addEdge('A', 'B', true);
      addEdge('B', 'C', true);
      addEdge('C', 'D', true);
      addEdge('D', 'A', false, '#3b82f6'); // Undirected back edge
      addEdge('A', 'C', true, '#a855f7');

      return elements;
    },
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    category: 'algorithms',
    description: 'Array with highlighted subset window.',
    commands: ['sliding-window', 'window'],
    generate: (x, y) => {
      const elements: any[] = [];
      const values = ['1', '3', '-1', '-3', '5', '3'];

      // Draw standard array cells
      for (let i = 0; i < 6; i++) {
        const cellId = `sw-arr-${i}-${makeId()}`;
        elements.push({
          type: 'rectangle',
          id: cellId,
          x: x + i * 50,
          y: y,
          width: 50,
          height: 40,
          strokeColor: '#a1a1aa',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: values[i],
          containerId: cellId,
          fontSize: 14,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
      }

      // Draw sliding window dashed border overlay
      elements.push({
        type: 'rectangle',
        x: x + 50 - 4,
        y: y - 6,
        width: 158,
        height: 52,
        strokeColor: '#c084fc', // purple-400
        strokeWidth: 2,
        strokeStyle: 'dashed',
        backgroundColor: 'transparent',
      });

      // Window labels
      elements.push({
        type: 'arrow',
        x: x + 50 + 20,
        y: y - 35,
        points: [[0, 0], [0, 25]],
        strokeColor: '#c084fc',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'L = 1',
        x: x + 50 + 8,
        y: y - 50,
        fontSize: 10,
        strokeColor: '#c084fc',
      });

      elements.push({
        type: 'arrow',
        x: x + 150 + 20,
        y: y - 35,
        points: [[0, 0], [0, 25]],
        strokeColor: '#c084fc',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'R = 3',
        x: x + 150 + 8,
        y: y - 50,
        fontSize: 10,
        strokeColor: '#c084fc',
      });

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
      const instanceMap: Record<string, string> = {};

      const nodeCoords = [
        { id: '1', x: 0, y: 0 },
        { id: '2', x: 90, y: 0 },
        { id: '3', x: 180, y: 0 },
        { id: '4', x: 135, y: 70 },
      ];

      nodeCoords.forEach((node) => {
        const uId = `cycle-node-${node.id}-${makeId()}`;
        instanceMap[node.id] = uId;

        elements.push({
          type: 'ellipse',
          id: uId,
          x: x + node.x,
          y: y + node.y,
          width: 36,
          height: 36,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: node.id,
          containerId: uId,
          fontSize: 14,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
      });

      // Linear connections
      const connect = (fromNode: string, toNode: string, color = '#a855f7') => {
        const fromId = instanceMap[fromNode];
        const toId = instanceMap[toNode];
        const from = nodeCoords.find(n => n.id === fromNode)!;
        const to = nodeCoords.find(n => n.id === toNode)!;

        elements.push({
          type: 'arrow',
          x: x + from.x + 18,
          y: y + from.y + 18,
          points: [[0, 0], [to.x - from.x, to.y - from.y]],
          strokeColor: color,
          strokeWidth: 1.5,
          startBinding: { elementId: fromId },
          endBinding: { elementId: toId },
        });
      };

      connect('1', '2');
      connect('2', '3');
      connect('3', '4');
      connect('4', '2', '#c084fc'); // Loop arrow pointing back to Node 2

      // Slow & Fast label annotations
      elements.push({
        type: 'text',
        text: 'Slow\nPointer',
        x: x + 70,
        y: y - 55,
        fontSize: 10,
        strokeColor: '#ef4444',
        textAlign: 'center',
      });
      elements.push({
        type: 'arrow',
        x: x + 90,
        y: y - 22,
        points: [[0, 0], [10, 16]],
        strokeColor: '#ef4444',
        strokeWidth: 1.5,
      });

      elements.push({
        type: 'text',
        text: 'Fast\nPointer',
        x: x + 155,
        y: y + 105,
        fontSize: 10,
        strokeColor: '#10b981',
        textAlign: 'center',
      });
      elements.push({
        type: 'arrow',
        x: x + 160,
        y: y + 102,
        points: [[0, 0], [-10, -18]],
        strokeColor: '#10b981',
        strokeWidth: 1.5,
      });

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

      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `dfs-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;

        elements.push({
          type: 'ellipse',
          id: uId,
          x: x + item.x,
          y: y + item.y,
          width: 36,
          height: 36,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: item.val,
          containerId: uId,
          fontSize: 14,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });

        // Search Order annotation
        elements.push({
          type: 'text',
          text: `[t=${item.order}]`,
          x: x + item.x + 36,
          y: y + item.y + 8,
          fontSize: 11,
          strokeColor: '#f59e0b',
        });
      });

      // Connections
      const connect = (fromId: string, toId: string) => {
        const f = nodeData.find(n => n.id === fromId)!;
        const t = nodeData.find(n => n.id === toId)!;
        elements.push({
          type: 'arrow',
          x: x + f.x + 18,
          y: y + f.y + 18,
          points: [[0, 0], [t.x - f.x, t.y - f.y]],
          strokeColor: '#71717a',
          strokeWidth: 1.5,
        });
      };
      connect('1', '2');
      connect('2', '3');
      connect('2', '4');
      connect('1', '5');

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

      const instanceMap: Record<string, string> = {};
      nodeData.forEach((item) => {
        const uId = `bfs-${item.id}-${makeId()}`;
        instanceMap[item.id] = uId;

        elements.push({
          type: 'ellipse',
          id: uId,
          x: x + item.x,
          y: y + item.y,
          width: 36,
          height: 36,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: item.val,
          containerId: uId,
          fontSize: 14,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });

        // Search Order annotation
        elements.push({
          type: 'text',
          text: `[t=${item.order}]`,
          x: x + item.x + 36,
          y: y + item.y + 8,
          fontSize: 11,
          strokeColor: '#10b981',
        });
      });

      // Connections
      const connect = (fromId: string, toId: string) => {
        const f = nodeData.find(n => n.id === fromId)!;
        const t = nodeData.find(n => n.id === toId)!;
        elements.push({
          type: 'arrow',
          x: x + f.x + 18,
          y: y + f.y + 18,
          points: [[0, 0], [t.x - f.x, t.y - f.y]],
          strokeColor: '#71717a',
          strokeWidth: 1.5,
        });
      };
      connect('1', '2');
      connect('1', '3');
      connect('2', '4');
      connect('2', '5');

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
        elements.push({
          type: 'rectangle',
          id: cellId,
          x: x + i * 50,
          y: y,
          width: 50,
          height: 40,
          strokeColor: '#e4e4e7',
          backgroundColor: '#1c1917',
          fillStyle: 'solid',
          strokeWidth: 1.5,
        });
        elements.push({
          type: 'text',
          text: values[i],
          containerId: cellId,
          fontSize: 14,
          strokeColor: '#f4f4f5',
          textAlign: 'center',
          verticalAlign: 'middle',
        });
      }

      // Left Pointer (i = 0)
      elements.push({
        type: 'arrow',
        x: x + 25,
        y: y + 80,
        points: [[0, 0], [0, -32]],
        strokeColor: '#3b82f6',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'left\n(i=0)',
        x: x + 5,
        y: y + 88,
        fontSize: 10,
        strokeColor: '#3b82f6',
        textAlign: 'center',
      });

      // Right Pointer (i = 4)
      elements.push({
        type: 'arrow',
        x: x + 4 * 50 + 25,
        y: y + 80,
        points: [[0, 0], [0, -32]],
        strokeColor: '#ef4444',
        strokeWidth: 1.5,
      });
      elements.push({
        type: 'text',
        text: 'right\n(i=4)',
        x: x + 4 * 50 + 5,
        y: y + 88,
        fontSize: 10,
        strokeColor: '#ef4444',
        textAlign: 'center',
      });

      return elements;
    },
  },
];

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
        // Ensure text element has a unique ID
        s.id = s.id || `${s.containerId}-text-${Math.random().toString(36).substring(2, 6)}`;
        
        // Link container to text
        container.boundElements = container.boundElements || [];
        if (!container.boundElements.some((be: any) => be.id === s.id)) {
          container.boundElements.push({ type: 'text', id: s.id });
        }

        // Calculate text coordinates to center it inside the container
        const textStr = String(s.text || '');
        const fontSize = s.fontSize || 14;
        
        // Approximation of text dimensions for initial centering
        const textWidth = textStr.length * fontSize * 0.6;
        const textHeight = fontSize * 1.25;

        s.x = container.x + (container.width - textWidth) / 2;
        s.y = container.y + (container.height - textHeight) / 2;
        s.width = textWidth;
        s.height = textHeight;
      }
    }
  });
  return skeletons;
};

