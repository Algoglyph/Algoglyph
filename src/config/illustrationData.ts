// Automatically generated System Design chalkboard SVG configurations
export interface DiagramElement {
  type: 'circle' | 'rect' | 'line' | 'path' | 'text' | 'polygon';
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  d?: string;
  points?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  markerEnd?: string;
  textContent?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  transform?: string;
}

export interface DiagramConfig {
  title: string;
  elements: DiagramElement[];
}

export const SYSTEM_DESIGN_DIAGRAMS: Record<string, DiagramConfig> = {
  "what-is-system-design": {
    "title": "What Is System Design",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "What Is System Design"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "how-to-approach-system-design": {
    "title": "How To Approach System Design",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "How To Approach System Design"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "performance-vs-scalability": {
    "title": "Performance Vs Scalability",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Performance Vs Scalability"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "latency-vs-throughput": {
    "title": "Latency Vs Throughput",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Latency Vs Throughput"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "availability-vs-consistency": {
    "title": "Availability Vs Consistency",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Availability Vs Consistency"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Consistency guarantees read freshness"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Availability keeps nodes responding on splits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Partition tolerance handles dropouts"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• PACELC maps latency behavior on normal runs"
      }
    ]
  },
  "cap-theorem-consistency": {
    "title": "Cap Theorem Consistency",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Cap Theorem Consistency"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Consistency guarantees read freshness"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Availability keeps nodes responding on splits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Partition tolerance handles dropouts"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• PACELC maps latency behavior on normal runs"
      }
    ]
  },
  "weak-consistency": {
    "title": "Weak Consistency",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Weak Consistency"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Consistency guarantees read freshness"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Availability keeps nodes responding on splits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Partition tolerance handles dropouts"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• PACELC maps latency behavior on normal runs"
      }
    ]
  },
  "eventual-consistency": {
    "title": "Eventual Consistency",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Eventual Consistency"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Event Source"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "strong-consistency": {
    "title": "Strong Consistency",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Strong Consistency"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Consistency guarantees read freshness"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Availability keeps nodes responding on splits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Partition tolerance handles dropouts"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• PACELC maps latency behavior on normal runs"
      }
    ]
  },
  "failover-replication-dns-updates": {
    "title": "Failover Replication Dns Updates",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Failover Replication Dns Updates"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "replication-master-slave-master-master": {
    "title": "Replication Master Slave Master Master",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Replication Master Slave Master Master"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "availability-in-numbers": {
    "title": "Availability In Numbers",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Availability In Numbers"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "background-jobs": {
    "title": "Background Jobs",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Background Jobs"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Producer"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "event-driven-jobs": {
    "title": "Event Driven Jobs",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Event Driven Jobs"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Event Source"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "schedule-driven-jobs": {
    "title": "Schedule Driven Jobs",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Schedule Driven Jobs"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Producer"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "returning-job-results": {
    "title": "Returning Job Results",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Returning Job Results"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Producer"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "dns-root-authority-resolution": {
    "title": "Dns Root Authority Resolution",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Dns Root Authority Resolution"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "cdn-edge-caching-strategies": {
    "title": "Cdn Edge Caching Strategies",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Cdn Edge Caching Strategies"
      },
      {
        "type": "circle",
        "cx": 70,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 70,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 180,
        "y": 75,
        "width": 80,
        "height": 70,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 220,
        "y": 100,
        "fill": "#4ade80",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Cache Store"
      },
      {
        "type": "text",
        "x": 220,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Edge Node"
      },
      {
        "type": "text",
        "x": 220,
        "y": 130,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Fast Hit: 2ms"
      },
      {
        "type": "rect",
        "x": 340,
        "y": 75,
        "width": 90,
        "height": 70,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 385,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Origin DB"
      },
      {
        "type": "text",
        "x": 385,
        "y": 125,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Slow Miss: 200ms"
      },
      {
        "type": "path",
        "d": "M 90 100 L 175 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 130,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Request"
      },
      {
        "type": "path",
        "d": "M 265 110 L 335 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 300,
        "y": 102,
        "fill": "#fb923c",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Pull Miss"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Reduces round-trip read latencies (RTT)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves database compute & network cycles"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Eviction policies (LRU/LFU) manage bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Cache invalidation (TTL) prevents stale reads"
      }
    ]
  },
  "pull-cdns": {
    "title": "Pull Cdns",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Pull Cdns"
      },
      {
        "type": "circle",
        "cx": 70,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 70,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 180,
        "y": 75,
        "width": 80,
        "height": 70,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 220,
        "y": 100,
        "fill": "#4ade80",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Cache Store"
      },
      {
        "type": "text",
        "x": 220,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Edge Node"
      },
      {
        "type": "text",
        "x": 220,
        "y": 130,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Fast Hit: 2ms"
      },
      {
        "type": "rect",
        "x": 340,
        "y": 75,
        "width": 90,
        "height": 70,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 385,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Origin DB"
      },
      {
        "type": "text",
        "x": 385,
        "y": 125,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Slow Miss: 200ms"
      },
      {
        "type": "path",
        "d": "M 90 100 L 175 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 130,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Request"
      },
      {
        "type": "path",
        "d": "M 265 110 L 335 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 300,
        "y": 102,
        "fill": "#fb923c",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Pull Miss"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Reduces round-trip read latencies (RTT)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves database compute & network cycles"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Eviction policies (LRU/LFU) manage bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Cache invalidation (TTL) prevents stale reads"
      }
    ]
  },
  "push-cdns": {
    "title": "Push Cdns",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Push Cdns"
      },
      {
        "type": "circle",
        "cx": 70,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 70,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 180,
        "y": 75,
        "width": 80,
        "height": 70,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 220,
        "y": 100,
        "fill": "#4ade80",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Cache Store"
      },
      {
        "type": "text",
        "x": 220,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Edge Node"
      },
      {
        "type": "text",
        "x": 220,
        "y": 130,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Fast Hit: 2ms"
      },
      {
        "type": "rect",
        "x": 340,
        "y": 75,
        "width": 90,
        "height": 70,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 385,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Origin DB"
      },
      {
        "type": "text",
        "x": 385,
        "y": 125,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Slow Miss: 200ms"
      },
      {
        "type": "path",
        "d": "M 90 100 L 175 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 130,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Request"
      },
      {
        "type": "path",
        "d": "M 265 110 L 335 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 300,
        "y": 102,
        "fill": "#fb923c",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Pull Miss"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Reduces round-trip read latencies (RTT)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves database compute & network cycles"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Eviction policies (LRU/LFU) manage bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Cache invalidation (TTL) prevents stale reads"
      }
    ]
  },
  "sql-vs-nosql": {
    "title": "Sql Vs Nosql",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Sql Vs Nosql"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "key-value-store": {
    "title": "Key Value Store",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Key Value Store"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "document-store": {
    "title": "Document Store",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Document Store"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "wide-column-store": {
    "title": "Wide Column Store",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Wide Column Store"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "graph-databases": {
    "title": "Graph Databases",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Graph Databases"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "database-replication-lags": {
    "title": "Database Replication Lags",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Database Replication Lags"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "database-sharding-partitions": {
    "title": "Database Sharding Partitions",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Database Sharding Partitions"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "federation": {
    "title": "Federation",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Federation"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "denormalization": {
    "title": "Denormalization",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Denormalization"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "sql-tuning": {
    "title": "Sql Tuning",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Sql Tuning"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "microservices": {
    "title": "Microservices",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Microservices"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 90,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "API Gateway"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 50,
        "width": 120,
        "height": 40,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 250,
        "y": 75,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Registry (Consul)"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 80,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 102,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance A"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 130,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#c084fc",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 152,
        "fill": "#c084fc",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance B"
      },
      {
        "type": "path",
        "d": "M 140 100 L 185 75",
        "stroke": "#60a5fa",
        "strokeWidth": 1,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 115 L 320 100",
        "stroke": "#4ade80",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 125 L 320 145",
        "stroke": "#c084fc",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "service-discovery": {
    "title": "Service Discovery",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Service Discovery"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 90,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "API Gateway"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 50,
        "width": 120,
        "height": 40,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 250,
        "y": 75,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Registry (Consul)"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 80,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 102,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance A"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 130,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#c084fc",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 152,
        "fill": "#c084fc",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance B"
      },
      {
        "type": "path",
        "d": "M 140 100 L 185 75",
        "stroke": "#60a5fa",
        "strokeWidth": 1,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 115 L 320 100",
        "stroke": "#4ade80",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 125 L 320 145",
        "stroke": "#c084fc",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Aggregates external API client entry paths"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Performs security, logging, & rate limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Dynamic server discovery updates endpoints"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples public routes from inner services"
      }
    ]
  },
  "reverse-proxy-caches": {
    "title": "Reverse Proxy Caches",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Reverse Proxy Caches"
      },
      {
        "type": "circle",
        "cx": 70,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 70,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 180,
        "y": 75,
        "width": 80,
        "height": 70,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 220,
        "y": 100,
        "fill": "#4ade80",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Cache Store"
      },
      {
        "type": "text",
        "x": 220,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Memcached/Redis"
      },
      {
        "type": "text",
        "x": 220,
        "y": 130,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Fast Hit: 2ms"
      },
      {
        "type": "rect",
        "x": 340,
        "y": 75,
        "width": 90,
        "height": 70,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 385,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Origin DB"
      },
      {
        "type": "text",
        "x": 385,
        "y": 125,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Slow Miss: 200ms"
      },
      {
        "type": "path",
        "d": "M 90 100 L 175 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 130,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Request"
      },
      {
        "type": "path",
        "d": "M 265 110 L 335 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 300,
        "y": 102,
        "fill": "#fb923c",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Pull Miss"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Reduces round-trip read latencies (RTT)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves database compute & network cycles"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Eviction policies (LRU/LFU) manage bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Cache invalidation (TTL) prevents stale reads"
      }
    ]
  },
  "load-balancing-algorithms": {
    "title": "Load Balancing Algorithms",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Load Balancing Algorithms"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "layer-7-load-balancing": {
    "title": "Layer 7 Load Balancing",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Layer 7 Load Balancing"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "load-balancer-layer-4-routing": {
    "title": "Load Balancer Layer 4 Routing",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Load Balancer Layer 4 Routing"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 90,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "API Gateway"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 50,
        "width": 120,
        "height": 40,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 250,
        "y": 75,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Registry (Consul)"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 80,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 102,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance A"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 130,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#c084fc",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 152,
        "fill": "#c084fc",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance B"
      },
      {
        "type": "path",
        "d": "M 140 100 L 185 75",
        "stroke": "#60a5fa",
        "strokeWidth": 1,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 115 L 320 100",
        "stroke": "#4ade80",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 125 L 320 145",
        "stroke": "#c084fc",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Aggregates external API client entry paths"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Performs security, logging, & rate limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Dynamic server discovery updates endpoints"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples public routes from inner services"
      }
    ]
  },
  "horizontal-scaling": {
    "title": "Horizontal Scaling",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Horizontal Scaling"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "cache-aside": {
    "title": "Cache Aside",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Cache Aside"
      },
      {
        "type": "circle",
        "cx": 70,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 70,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 180,
        "y": 75,
        "width": 80,
        "height": 70,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 220,
        "y": 100,
        "fill": "#4ade80",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Cache Store"
      },
      {
        "type": "text",
        "x": 220,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Memcached/Redis"
      },
      {
        "type": "text",
        "x": 220,
        "y": 130,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Fast Hit: 2ms"
      },
      {
        "type": "rect",
        "x": 340,
        "y": 75,
        "width": 90,
        "height": 70,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 385,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Origin DB"
      },
      {
        "type": "text",
        "x": 385,
        "y": 125,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Slow Miss: 200ms"
      },
      {
        "type": "path",
        "d": "M 90 100 L 175 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 130,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Request"
      },
      {
        "type": "path",
        "d": "M 265 110 L 335 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 300,
        "y": 102,
        "fill": "#fb923c",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Pull Miss"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Reduces round-trip read latencies (RTT)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves database compute & network cycles"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Eviction policies (LRU/LFU) manage bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Cache invalidation (TTL) prevents stale reads"
      }
    ]
  },
  "write-through": {
    "title": "Write Through",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Write Through"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "write-behind": {
    "title": "Write Behind",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Write Behind"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "refresh-ahead": {
    "title": "Refresh Ahead",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Refresh Ahead"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "client-caching": {
    "title": "Client Caching",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Client Caching"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "cdn-caching": {
    "title": "Cdn Caching",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Cdn Caching"
      },
      {
        "type": "circle",
        "cx": 70,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 70,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 180,
        "y": 75,
        "width": 80,
        "height": 70,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 220,
        "y": 100,
        "fill": "#4ade80",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Cache Store"
      },
      {
        "type": "text",
        "x": 220,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Edge Node"
      },
      {
        "type": "text",
        "x": 220,
        "y": 130,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Fast Hit: 2ms"
      },
      {
        "type": "rect",
        "x": 340,
        "y": 75,
        "width": 90,
        "height": 70,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 385,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Origin DB"
      },
      {
        "type": "text",
        "x": 385,
        "y": 125,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Slow Miss: 200ms"
      },
      {
        "type": "path",
        "d": "M 90 100 L 175 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 130,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Request"
      },
      {
        "type": "path",
        "d": "M 265 110 L 335 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 300,
        "y": 102,
        "fill": "#fb923c",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Pull Miss"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Reduces round-trip read latencies (RTT)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves database compute & network cycles"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Eviction policies (LRU/LFU) manage bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Cache invalidation (TTL) prevents stale reads"
      }
    ]
  },
  "web-server-caching": {
    "title": "Web Server Caching",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Web Server Caching"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "database-caching": {
    "title": "Database Caching",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Database Caching"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "application-caching": {
    "title": "Application Caching",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Application Caching"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "backpressure-queues-sizing": {
    "title": "Backpressure Queues Sizing",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Backpressure Queues Sizing"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Producer"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "task-queues": {
    "title": "Task Queues",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Task Queues"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Producer"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "message-queues": {
    "title": "Message Queues",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Message Queues"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Producer"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "http": {
    "title": "Http",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Http"
      },
      {
        "type": "line",
        "x1": 100,
        "y1": 60,
        "x2": 100,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 52,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "line",
        "x1": 250,
        "y1": 60,
        "x2": 250,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 250,
        "y": 52,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Server"
      },
      {
        "type": "path",
        "d": "M 100 80 L 250 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN / Request"
      },
      {
        "type": "path",
        "d": "M 250 115 L 100 135",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 127,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN-ACK / Response"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Defines communication format boundaries"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Handles socket connection handshakes"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• TCP guarantees packet ordering & retransmits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• HTTP wraps payload with status & headers"
      }
    ]
  },
  "tcp": {
    "title": "Tcp",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Tcp"
      },
      {
        "type": "line",
        "x1": 100,
        "y1": 60,
        "x2": 100,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 52,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "line",
        "x1": 250,
        "y1": 60,
        "x2": 250,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 250,
        "y": 52,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Server"
      },
      {
        "type": "path",
        "d": "M 100 80 L 250 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN / Request"
      },
      {
        "type": "path",
        "d": "M 250 115 L 100 135",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 127,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN-ACK / Response"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Defines communication format boundaries"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Handles socket connection handshakes"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• TCP guarantees packet ordering & retransmits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• HTTP wraps payload with status & headers"
      }
    ]
  },
  "udp": {
    "title": "Udp",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Udp"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "rpc": {
    "title": "Rpc",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Rpc"
      },
      {
        "type": "line",
        "x1": 100,
        "y1": 60,
        "x2": 100,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 52,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "line",
        "x1": 250,
        "y1": 60,
        "x2": 250,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 250,
        "y": 52,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Server"
      },
      {
        "type": "path",
        "d": "M 100 80 L 250 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN / Request"
      },
      {
        "type": "path",
        "d": "M 250 115 L 100 135",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 127,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN-ACK / Response"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "grpc": {
    "title": "Grpc",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Grpc"
      },
      {
        "type": "line",
        "x1": 100,
        "y1": 60,
        "x2": 100,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 52,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "line",
        "x1": 250,
        "y1": 60,
        "x2": 250,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 250,
        "y": 52,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Server"
      },
      {
        "type": "path",
        "d": "M 100 80 L 250 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN / Request"
      },
      {
        "type": "path",
        "d": "M 250 115 L 100 135",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 127,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN-ACK / Response"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Defines communication format boundaries"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Handles socket connection handshakes"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• TCP guarantees packet ordering & retransmits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• HTTP wraps payload with status & headers"
      }
    ]
  },
  "rest": {
    "title": "Rest",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Rest"
      },
      {
        "type": "line",
        "x1": 100,
        "y1": 60,
        "x2": 100,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 52,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "line",
        "x1": 250,
        "y1": 60,
        "x2": 250,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 250,
        "y": 52,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Server"
      },
      {
        "type": "path",
        "d": "M 100 80 L 250 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN / Request"
      },
      {
        "type": "path",
        "d": "M 250 115 L 100 135",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 127,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN-ACK / Response"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "graphql": {
    "title": "Graphql",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Graphql"
      },
      {
        "type": "line",
        "x1": 100,
        "y1": 60,
        "x2": 100,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 52,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "line",
        "x1": 250,
        "y1": 60,
        "x2": 250,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 250,
        "y": 52,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Server"
      },
      {
        "type": "path",
        "d": "M 100 80 L 250 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN / Request"
      },
      {
        "type": "path",
        "d": "M 250 115 L 100 135",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 175,
        "y": 127,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "SYN-ACK / Response"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "idempotent-operations": {
    "title": "Idempotent Operations",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Idempotent Operations"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "improper-instantiation": {
    "title": "Improper Instantiation",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Improper Instantiation"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "monolithic-persistence": {
    "title": "Monolithic Persistence",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Monolithic Persistence"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "noisy-neighbor": {
    "title": "Noisy Neighbor",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Noisy Neighbor"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "synchronous-io": {
    "title": "Synchronous Io",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Synchronous Io"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "extraneous-fetching": {
    "title": "Extraneous Fetching",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Extraneous Fetching"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "busy-database": {
    "title": "Busy Database",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Busy Database"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "busy-frontend": {
    "title": "Busy Frontend",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Busy Frontend"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "chatty-io": {
    "title": "Chatty Io",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Chatty Io"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "retry-storm": {
    "title": "Retry Storm",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Retry Storm"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "no-caching": {
    "title": "No Caching",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "No Caching"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "health-monitoring": {
    "title": "Health Monitoring",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Health Monitoring"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "availability-monitoring": {
    "title": "Availability Monitoring",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Availability Monitoring"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "performance-monitoring": {
    "title": "Performance Monitoring",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Performance Monitoring"
      },
      {
        "type": "circle",
        "cx": 120,
        "cy": 110,
        "r": 16,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 138,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Availability"
      },
      {
        "type": "circle",
        "cx": 280,
        "cy": 110,
        "r": 16,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 280,
        "y": 113,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "C"
      },
      {
        "type": "text",
        "x": 280,
        "y": 138,
        "fill": "#fb923c",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Consistency"
      },
      {
        "type": "line",
        "x1": 138,
        "y1": 110,
        "x2": 262,
        "y2": 110,
        "stroke": "#c084fc",
        "strokeWidth": 1.5,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 200,
        "y": 100,
        "fill": "#c084fc",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Trade-off boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "security-monitoring": {
    "title": "Security Monitoring",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Security Monitoring"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "usage-monitoring": {
    "title": "Usage Monitoring",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Usage Monitoring"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "instrumentation": {
    "title": "Instrumentation",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Instrumentation"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "visualization-alerts": {
    "title": "Visualization Alerts",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Visualization Alerts"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "strangler-fig": {
    "title": "Strangler Fig",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Strangler Fig"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "sidecar": {
    "title": "Sidecar",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Sidecar"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 90,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "API Gateway"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 50,
        "width": 120,
        "height": 40,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 250,
        "y": 75,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Registry (Consul)"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 80,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 102,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance A"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 130,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#c084fc",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 152,
        "fill": "#c084fc",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance B"
      },
      {
        "type": "path",
        "d": "M 140 100 L 185 75",
        "stroke": "#60a5fa",
        "strokeWidth": 1,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 115 L 320 100",
        "stroke": "#4ade80",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 125 L 320 145",
        "stroke": "#c084fc",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "static-content-hosting-design": {
    "title": "Static Content Hosting Design",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Static Content Hosting Design"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "leader-election": {
    "title": "Leader Election",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Leader Election"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "cqrs-design": {
    "title": "Cqrs Design",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Cqrs Design"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "pipes-filters-design": {
    "title": "Pipes Filters Design",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Pipes Filters Design"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "ambassador": {
    "title": "Ambassador",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Ambassador"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 90,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "API Gateway"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 50,
        "width": 120,
        "height": 40,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 250,
        "y": 75,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Registry (Consul)"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 80,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 102,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance A"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 130,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#c084fc",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 152,
        "fill": "#c084fc",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance B"
      },
      {
        "type": "path",
        "d": "M 140 100 L 185 75",
        "stroke": "#60a5fa",
        "strokeWidth": 1,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 115 L 320 100",
        "stroke": "#4ade80",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 125 L 320 145",
        "stroke": "#c084fc",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "gateway-routing": {
    "title": "Gateway Routing",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Gateway Routing"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 90,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "API Gateway"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 50,
        "width": 120,
        "height": 40,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 250,
        "y": 75,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Registry (Consul)"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 80,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 102,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance A"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 130,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#c084fc",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 152,
        "fill": "#c084fc",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance B"
      },
      {
        "type": "path",
        "d": "M 140 100 L 185 75",
        "stroke": "#60a5fa",
        "strokeWidth": 1,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 115 L 320 100",
        "stroke": "#4ade80",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 125 L 320 145",
        "stroke": "#c084fc",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Aggregates external API client entry paths"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Performs security, logging, & rate limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Dynamic server discovery updates endpoints"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples public routes from inner services"
      }
    ]
  },
  "gateway-offloading": {
    "title": "Gateway Offloading",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Gateway Offloading"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 90,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "API Gateway"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 50,
        "width": 120,
        "height": 40,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 250,
        "y": 75,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Registry (Consul)"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 80,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 102,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance A"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 130,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#c084fc",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 152,
        "fill": "#c084fc",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance B"
      },
      {
        "type": "path",
        "d": "M 140 100 L 185 75",
        "stroke": "#60a5fa",
        "strokeWidth": 1,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 115 L 320 100",
        "stroke": "#4ade80",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 125 L 320 145",
        "stroke": "#c084fc",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Aggregates external API client entry paths"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Performs security, logging, & rate limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Dynamic server discovery updates endpoints"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples public routes from inner services"
      }
    ]
  },
  "gateway-aggregation": {
    "title": "Gateway Aggregation",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Gateway Aggregation"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 90,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "API Gateway"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 50,
        "width": 120,
        "height": 40,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 250,
        "y": 75,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Registry (Consul)"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 80,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 102,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance A"
      },
      {
        "type": "rect",
        "x": 330,
        "y": 130,
        "width": 90,
        "height": 35,
        "rx": 3,
        "stroke": "#c084fc",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 375,
        "y": 152,
        "fill": "#c084fc",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Service Instance B"
      },
      {
        "type": "path",
        "d": "M 140 100 L 185 75",
        "stroke": "#60a5fa",
        "strokeWidth": 1,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 115 L 320 100",
        "stroke": "#4ade80",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 140 125 L 320 145",
        "stroke": "#c084fc",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Aggregates external API client entry paths"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Performs security, logging, & rate limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Dynamic server discovery updates endpoints"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples public routes from inner services"
      }
    ]
  },
  "external-config-store": {
    "title": "External Config Store",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "External Config Store"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves state durability & consistency rules"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Sharding splits data across partition rings"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Normalization reduces write duplication bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Indexes build fast O(log N) lookup paths"
      }
    ]
  },
  "compute-resource-consolidation": {
    "title": "Compute Resource Consolidation",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Compute Resource Consolidation"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "backends-for-frontend": {
    "title": "Backends For Frontend",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Backends For Frontend"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "anti-corruption-layer": {
    "title": "Anti Corruption Layer",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Anti Corruption Layer"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "valet-key": {
    "title": "Valet Key",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Valet Key"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "static-content-hosting-data": {
    "title": "Static Content Hosting Data",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Static Content Hosting Data"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "sharding-data": {
    "title": "Sharding Data",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Sharding Data"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "materialized-view": {
    "title": "Materialized View",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Materialized View"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "index-table": {
    "title": "Index Table",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Index Table"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "event-sourcing": {
    "title": "Event Sourcing",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Event Sourcing"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Event Source"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "cqrs-data": {
    "title": "Cqrs Data",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Cqrs Data"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "cache-aside-data": {
    "title": "Cache Aside Data",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Cache Aside Data"
      },
      {
        "type": "circle",
        "cx": 70,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 70,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 180,
        "y": 75,
        "width": 80,
        "height": 70,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 220,
        "y": 100,
        "fill": "#4ade80",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Cache Store"
      },
      {
        "type": "text",
        "x": 220,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Memcached/Redis"
      },
      {
        "type": "text",
        "x": 220,
        "y": 130,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Fast Hit: 2ms"
      },
      {
        "type": "rect",
        "x": 340,
        "y": 75,
        "width": 90,
        "height": 70,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 385,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Origin DB"
      },
      {
        "type": "text",
        "x": 385,
        "y": 125,
        "fill": "#e4e4e7",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Slow Miss: 200ms"
      },
      {
        "type": "path",
        "d": "M 90 100 L 175 100",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 130,
        "y": 92,
        "fill": "#60a5fa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Request"
      },
      {
        "type": "path",
        "d": "M 265 110 L 335 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "strokeDasharray": "2 2",
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 300,
        "y": 102,
        "fill": "#fb923c",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Pull Miss"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Reduces round-trip read latencies (RTT)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Saves database compute & network cycles"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Eviction policies (LRU/LFU) manage bounds"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Cache invalidation (TTL) prevents stale reads"
      }
    ]
  },
  "sequential-convoy": {
    "title": "Sequential Convoy",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Sequential Convoy"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "scheduling-agent-supervisor": {
    "title": "Scheduling Agent Supervisor",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Scheduling Agent Supervisor"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "queue-based-load-leveling": {
    "title": "Queue Based Load Leveling",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Queue Based Load Leveling"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Producer"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "publishersubscriber": {
    "title": "Publishersubscriber",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Publishersubscriber"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "priority-queue": {
    "title": "Priority Queue",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Priority Queue"
      },
      {
        "type": "rect",
        "x": 60,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 100,
        "y": 115,
        "fill": "#60a5fa",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Producer"
      },
      {
        "type": "rect",
        "x": 190,
        "y": 70,
        "width": 140,
        "height": 80,
        "rx": 4,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 260,
        "y": 62,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Queue Broker"
      },
      {
        "type": "rect",
        "x": 205,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 221,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 3"
      },
      {
        "type": "rect",
        "x": 245,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#52525b",
        "strokeWidth": 1
      },
      {
        "type": "text",
        "x": 261,
        "y": 114,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "Msg 2"
      },
      {
        "type": "rect",
        "x": 285,
        "y": 90,
        "width": 32,
        "height": 40,
        "rx": 2,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 301,
        "y": 114,
        "fill": "#4ade80",
        "fontSize": 8,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Msg 1"
      },
      {
        "type": "rect",
        "x": 380,
        "y": 85,
        "width": 80,
        "height": 50,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 420,
        "y": 115,
        "fill": "#fb923c",
        "fontSize": 10,
        "textAnchor": "middle",
        "textContent": "Consumer"
      },
      {
        "type": "path",
        "d": "M 145 110 L 185 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 335 110 L 375 110",
        "stroke": "#fb923c",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Decouples processing speeds of systems"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Buffers sudden traffic spikes safely"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Compensating transactions handle failures"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Ensures message delivery (At-least-once)"
      }
    ]
  },
  "pipes-and-filters-messaging": {
    "title": "Pipes And Filters Messaging",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Pipes And Filters Messaging"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "competing-consumers": {
    "title": "Competing Consumers",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Competing Consumers"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "choreography": {
    "title": "Choreography",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Choreography"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "claim-check": {
    "title": "Claim Check",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Claim Check"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "async-request-reply": {
    "title": "Async Request Reply",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Async Request Reply"
      },
      {
        "type": "circle",
        "cx": 80,
        "cy": 110,
        "r": 18,
        "stroke": "#60a5fa",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 80,
        "y": 113,
        "fill": "#60a5fa",
        "fontSize": 9,
        "textAnchor": "middle",
        "textContent": "Client"
      },
      {
        "type": "rect",
        "x": 170,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#eab308",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 210,
        "y": 110,
        "fill": "#eab308",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "System Node"
      },
      {
        "type": "text",
        "x": 210,
        "y": 125,
        "fill": "#a1a1aa",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "(Coordinator)"
      },
      {
        "type": "rect",
        "x": 290,
        "y": 80,
        "width": 80,
        "height": 60,
        "rx": 3,
        "stroke": "#4ade80",
        "strokeWidth": 1.5
      },
      {
        "type": "text",
        "x": 330,
        "y": 110,
        "fill": "#4ade80",
        "fontSize": 9,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "Target Service"
      },
      {
        "type": "path",
        "d": "M 100 110 L 165 110",
        "stroke": "#60a5fa",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "path",
        "d": "M 255 110 L 285 110",
        "stroke": "#eab308",
        "strokeWidth": 1.2,
        "markerEnd": "url(#arrow-copy)"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  },
  "consistent-hashing": {
    "title": "Consistent Hashing",
    "elements": [
      {
        "type": "text",
        "x": 30,
        "y": 32,
        "fill": "#eab308",
        "fontSize": 13,
        "fontWeight": "bold",
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "Consistent Hashing"
      },
      {
        "type": "rect",
        "x": 70,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#60a5fa",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 120,
        "y": 105,
        "fill": "#60a5fa",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard A"
      },
      {
        "type": "text",
        "x": 120,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 0-9999"
      },
      {
        "type": "rect",
        "x": 240,
        "y": 80,
        "width": 100,
        "height": 75,
        "rx": 3,
        "stroke": "#fb923c",
        "strokeWidth": 2
      },
      {
        "type": "text",
        "x": 290,
        "y": 105,
        "fill": "#fb923c",
        "fontSize": 11,
        "textAnchor": "middle",
        "fontWeight": "bold",
        "textContent": "DB Shard B"
      },
      {
        "type": "text",
        "x": 290,
        "y": 120,
        "fill": "#a1a1aa",
        "fontSize": 8,
        "textAnchor": "middle",
        "textContent": "User IDs 10k+"
      },
      {
        "type": "line",
        "x1": 205,
        "y1": 70,
        "x2": 205,
        "y2": 170,
        "stroke": "#71717a",
        "strokeWidth": 1.2,
        "strokeDasharray": "3 3"
      },
      {
        "type": "text",
        "x": 205,
        "y": 60,
        "fill": "#71717a",
        "fontSize": 7,
        "textAnchor": "middle",
        "textContent": "Hash Boundary"
      },
      {
        "type": "text",
        "x": 450,
        "y": 75,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Analyzes distributed trade-offs & limits"
      },
      {
        "type": "text",
        "x": 450,
        "y": 95,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Improves read/write path scaling parameters"
      },
      {
        "type": "text",
        "x": 450,
        "y": 115,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Mitigates single point of failure (SPOF) risks"
      },
      {
        "type": "text",
        "x": 450,
        "y": 135,
        "fill": "#a1a1aa",
        "fontSize": 10,
        "fontFamily": "'Ink Free', 'Chalkboard SE', 'Comic Sans MS', cursive",
        "textContent": "• Optimizes physical resource utilization levels"
      }
    ]
  }
};
