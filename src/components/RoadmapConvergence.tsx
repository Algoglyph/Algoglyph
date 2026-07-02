import React from 'react';
import { ROADMAP_ZONES } from '../config/roadmapData';

interface RoadmapConvergenceProps {
  roadmapProgress: Record<string, 'Not Started' | 'In Progress' | 'Completed'>;
  onLaunch: () => void;
}

// Node coordinates on a 1000×500 grid
const POS: Array<{ x: number; y: number }> = [
  { x: 80, y: 250 },
  { x: 175, y: 130 },
  { x: 270, y: 350 },
  { x: 365, y: 200 },
  { x: 460, y: 380 },
  { x: 555, y: 150 },
  { x: 650, y: 330 },
  { x: 745, y: 180 },
  { x: 840, y: 350 },
  { x: 930, y: 220 },
];

// Structural links
const EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9],
  [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [7, 9],
];

export const RoadmapConvergence: React.FC<RoadmapConvergenceProps> = ({
  roadmapProgress,
  onLaunch,
}) => {
  const zoneStatus = (index: number) => {
    const zone = ROADMAP_ZONES[index];
    if (!zone) return 'Not Started';
    const subtopics = zone.topics.flatMap((t) =>
      t.concepts.flatMap((c) => c.subtopics)
    );
    if (subtopics.length === 0) return 'Not Started';
    const statuses = subtopics.map(
      (s) => roadmapProgress[s.name] || 'Not Started'
    );
    if (statuses.every((s) => s === 'Completed')) return 'Completed';
    if (statuses.every((s) => s === 'Not Started')) return 'Not Started';
    return 'In Progress';
  };

  const statusColor = (status: string) => {
    if (status === 'Completed') return '#10b981'; // emerald
    if (status === 'In Progress') return '#f59e0b'; // amber
    return '#4b5563'; // gray
  };

  return (
    <section className="relative w-full py-12 flex flex-col items-center justify-center border-t border-gray-800/60 mt-10">
      <div className="relative z-10 flex flex-col items-center gap-2 text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Curriculum Overview Map
        </h2>
        <p className="max-w-xl text-[13px] text-gray-400 font-sans">
          Visualize the structural connections across all ten domains of the Computer Science curriculum.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 bg-[#13151b] border border-gray-800 rounded-xl p-6">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="Knowledge graph connecting all nine roadmap modules"
        >
          {/* Edges */}
          {EDGES.map(([from, to], i) => {
            const a = POS[from];
            const b = POS[to];
            return (
              <line
                key={`e-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#374151"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Nodes */}
          {POS.map((p, i) => {
            const zone = ROADMAP_ZONES[i];
            if (!zone) return null;
            const status = zoneStatus(i);
            const color = statusColor(status);
            return (
              <g key={`n-${i}`} className="cursor-default">
                <circle cx={p.x} cy={p.y} r={22} fill="#1f2937" stroke={color} strokeWidth={2} />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={12}
                  fontWeight={700}
                  fill="#ffffff"
                >
                  {zone.number}
                </text>
                <text
                  x={p.x}
                  y={p.y + 42}
                  textAnchor="middle"
                  className="font-sans"
                  fontSize={11}
                  fontWeight={500}
                  fill="#9ca3af"
                >
                  {zone.name.length > 20 ? zone.name.slice(0, 18) + '…' : zone.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <button
        onClick={onLaunch}
        className="mt-8 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-[12.5px] font-medium transition cursor-pointer font-sans border border-gray-700"
      >
        Open Workspace Sandbox
      </button>
    </section>
  );
};
