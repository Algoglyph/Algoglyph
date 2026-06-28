import React from 'react';
import { motion } from 'framer-motion';
import { ROADMAP_ZONES } from '../config/roadmapData';

/**
 * RoadmapConvergence — the finale. Every zone of the curriculum, wired together
 * into a single knowledge graph that draws itself as it scrolls into view.
 * It echoes the warm dust-field backdrop so the page resolves into one coherent
 * map rather than ending on a flat CTA.
 */

interface RoadmapConvergenceProps {
  roadmapProgress: Record<string, 'Not Started' | 'In Progress' | 'Completed'>;
  onLaunch: () => void;
}

// Hand-placed node coordinates on a 1000×560 plane — a serpentine that fans out.
const POS: Array<{ x: number; y: number }> = [
  { x: 80, y: 300 },
  { x: 200, y: 150 },
  { x: 290, y: 420 },
  { x: 420, y: 250 },
  { x: 510, y: 470 },
  { x: 630, y: 170 },
  { x: 730, y: 390 },
  { x: 850, y: 220 },
  { x: 930, y: 430 },
];

// Sequential spine + a few skip-links so it reads as a mesh, not a line.
const EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [1, 3], [2, 4], [3, 5], [5, 7], [6, 8],
];

export const RoadmapConvergence: React.FC<RoadmapConvergenceProps> = ({
  roadmapProgress,
  onLaunch,
}) => {
  const zoneStatus = (index: number) => {
    const zone = ROADMAP_ZONES[index];
    if (!zone) return 'Not Started';
    const statuses = zone.subConcepts.map(
      (c) => roadmapProgress[c.name] || c.learningStatus || 'Not Started'
    );
    if (statuses.every((s) => s === 'Completed')) return 'Completed';
    if (statuses.every((s) => s === 'Not Started')) return 'Not Started';
    return 'In Progress';
  };

  // Earthy, warm status accents — readable on the dark canvas, never blue.
  const statusColor = (status: string) => {
    if (status === 'Completed') return '#9bb592'; // sage
    if (status === 'In Progress') return '#d8bf8f'; // ochre / sand
    return 'rgba(214, 208, 194, 0.55)'; // bone
  };

  return (
    <section
      id="convergence-section"
      className="relative w-full min-h-screen shrink-0 flex flex-col items-center justify-center py-32"
    >
      {/* scrim — seats the labelled graph above the warm dust field */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 72% 68% at 50% 52%, rgba(10,9,8,0.92) 0%, rgba(10,9,8,0.6) 52%, rgba(10,9,8,0) 80%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-4 text-center mb-12"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#cdbf9f] font-semibold">
          The Complete Map
        </span>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.03em] text-[#f0ece3] leading-[1.02]">
          Nine zones,{' '}
          <span className="italic font-normal text-[#cdbf9f]" style={{ fontFamily: '"Instrument Serif", serif' }}>
            one graph
          </span>
        </h2>
        <p className="max-w-xl text-[14.5px] leading-relaxed text-[#9a948a] font-sans">
          Every structure and paradigm connects. This is the full traversal —
          from raw syntax to competitive invariants — rendered as the knowledge
          graph it really is.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        className="relative z-10 w-full max-w-5xl px-4"
      >
        <svg
          viewBox="0 0 1000 560"
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="Knowledge graph connecting all nine roadmap zones"
        >
          <defs>
            <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e6ddca" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d8bf8f" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Edges draw themselves in */}
          {EDGES.map(([from, to], i) => {
            const a = POS[from];
            const b = POS[to];
            return (
              <motion.line
                key={`e-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="url(#edgeGrad)"
                strokeWidth={1.3}
                variants={{
                  hidden: { pathLength: 0, opacity: 0 },
                  visible: {
                    pathLength: 1,
                    opacity: 1,
                    transition: {
                      pathLength: { duration: 1.1, delay: 0.2 + i * 0.06, ease: 'easeInOut' },
                      opacity: { duration: 0.3, delay: 0.2 + i * 0.06 },
                    },
                  },
                }}
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
              <motion.g
                key={`n-${i}`}
                variants={{
                  hidden: { opacity: 0, scale: 0.4 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.5, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                className="cursor-default"
              >
                <circle cx={p.x} cy={p.y} r={29} fill="none" stroke={color} strokeWidth={7} opacity={0.14} />
                <circle cx={p.x} cy={p.y} r={29} fill="#13110e" stroke={color} strokeWidth={1.6} />
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={16}
                  fontWeight={600}
                  fill="#efe9df"
                >
                  {zone.number}
                </text>
                <text
                  x={p.x}
                  y={p.y + 52}
                  textAnchor="middle"
                  className="font-sans"
                  fontSize={12.5}
                  fontWeight={500}
                  fill="rgba(237,233,223,0.82)"
                >
                  {zone.name.length > 20 ? zone.name.slice(0, 18) + '…' : zone.name}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </motion.div>

      <motion.button
        onClick={onLaunch}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="group relative z-10 mt-12 inline-flex items-center gap-2 rounded-full bg-[#f0ece3] hover:bg-white px-7 py-3 text-[13px] font-semibold text-[#13110e] transition cursor-pointer font-sans shadow-[0_1px_30px_rgba(216,191,143,0.16)]"
      >
        <span>Traverse the whole map</span>
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </motion.button>
    </section>
  );
};
