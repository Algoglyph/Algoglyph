import type { ReactNode } from 'react';

/**
 * GradientPanel — Composio-style colorful gradient art framing a dark inset that
 * holds a hand-drawn sketch. Composio's feature rows pair a big saturated
 * gradient with a dark product panel floating on it; this reproduces that so the
 * page gets real color while the Excalidraw sketches (light strokes) stay legible
 * on their dark inset.
 *
 * Pure CSS gradients — static, so nothing to gate behind prefers-reduced-motion.
 * Sharp corners to match the flat Composio language.
 */

type Variant = 'canvas' | 'notes' | 'agent' | 'visualizer';

// Each variant gets its own saturated blend, sampled to echo Composio's palette.
const GRADIENTS: Record<Variant, string> = {
  canvas:
    'radial-gradient(120% 120% at 12% 8%, #2e5bff 0%, transparent 46%), radial-gradient(120% 120% at 92% 20%, #22d3ee 0%, transparent 50%), linear-gradient(135deg, #1b2a6b 0%, #0a1230 60%, #050a1f 100%)',
  notes:
    'radial-gradient(120% 120% at 10% 12%, #a855f7 0%, transparent 48%), radial-gradient(120% 120% at 90% 82%, #ec4899 0%, transparent 50%), linear-gradient(135deg, #3b1466 0%, #1a0a2e 60%, #120820 100%)',
  agent:
    'radial-gradient(120% 120% at 14% 88%, #22c55e 0%, transparent 48%), radial-gradient(120% 120% at 88% 10%, #4ade80 0%, transparent 46%), linear-gradient(135deg, #0c3b28 0%, #071f18 60%, #04140f 100%)',
  visualizer:
    'radial-gradient(120% 120% at 8% 20%, #6366f1 0%, transparent 46%), radial-gradient(120% 120% at 96% 30%, #22d3ee 0%, transparent 48%), radial-gradient(120% 120% at 60% 100%, #2dd4bf 0%, transparent 52%), linear-gradient(135deg, #241a5e 0%, #0b1030 60%, #060a1f 100%)',
};

interface GradientPanelProps {
  variant: Variant;
  children: ReactNode;
}

export function GradientPanel({ variant, children }: GradientPanelProps) {
  return (
    <div
      className="relative w-full overflow-hidden p-4 sm:p-6"
      style={{ background: GRADIENTS[variant] }}
    >
      {/* faint grain so the flat gradient reads as a surface, not a swatch */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* dark inset that holds the sketch, floating on the colour */}
      <div
        className="relative border p-4 sm:p-6"
        style={{
          background: 'rgba(6,8,12,0.86)',
          borderColor: 'rgba(255,255,255,0.10)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
