import React, { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';

/**
 * RoadmapBackground — a cursor-driven field of warm light "dust".
 *
 * Philosophy (Field Dynamics): invisible forces made visible only through their
 * trace on matter. Nodes are emitted *where the cursor moves* and wire into a
 * faint local constellation, then dissolve when the pointer rests — so the field
 * stays calm and intentional rather than a busy global graph.
 *
 * Each mote carries a `depth` (0 = far, 1 = near) that drives its size, parallax
 * drift and luminance, giving the flat canvas a quiet sense of dimensionality
 * without the weight of a real 3D scene.
 *
 * Deliberately *light & low-opacity*: warm bone-white tones, never blue — the
 * trail should read as soft luminous powder, not a neon mesh.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
  depth: number; // 0 far → 1 near
  warm: boolean; // a few motes lean to warm cream instead of cool bone
}

interface RoadmapBackgroundProps {
  scrollYProgress?: MotionValue<number>;
  /**
   * Palette of the dust motes. `warm` (default) is the roadmap's bone/cream;
   * `neutral` is a colourless grey-white for surfaces that must not read warm.
   */
  tone?: 'warm' | 'neutral';
}

// Two monochrome palettes — both blue-free. `warm` leans bone/cream; `neutral`
// is a true grey-white so the texture never looks brownish.
const PALETTES = {
  warm: { bone: '226, 222, 213', cream: '244, 238, 226' },
  neutral: { bone: '214, 216, 220', cream: '242, 243, 247' },
} as const;

export const RoadmapBackground: React.FC<RoadmapBackgroundProps> = ({
  scrollYProgress,
  tone = 'warm',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const BONE = PALETTES[tone].bone;
    const CREAM = PALETTES[tone].cream;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    const MAX_PARTICLES = isCoarse ? 80 : 200;
    const CONNECT = isCoarse ? 90 : 118;
    const CONNECT2 = CONNECT * CONNECT;
    const SPAWN_EVERY = 16; // px of cursor travel between spawned motes

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    // Parallax: the whole field drifts a hair against scroll for depth.
    let parallax = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const cursor = { x: -9999, y: -9999, on: false, lastMove: 0 };
    let lastX: number | null = null;
    let lastY: number | null = null;
    let accDist = 0;

    const spawn = (x: number, y: number) => {
      const depth = Math.random(); // depth-of-field: most are mid, some near/far
      const warm = Math.random() < 0.28;
      particles.push({
        x: x + (Math.random() - 0.5) * 26,
        y: y + (Math.random() - 0.5) * 26,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18 - 0.05,
        born: performance.now(),
        life: 1400 + Math.random() * 1600,
        size: (0.7 + depth * 1.9) * (0.85 + Math.random() * 0.7),
        depth,
        warm,
      });
      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
      }
    };

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      cursor.x = x;
      cursor.y = y;
      cursor.on = true;
      cursor.lastMove = performance.now();

      if (lastX === null || lastY === null) {
        lastX = x;
        lastY = y;
        return;
      }
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      accDist += dist;

      // Emit motes evenly along the segment so fast flicks leave a continuous trail.
      let placed = 0;
      while (accDist >= SPAWN_EVERY) {
        accDist -= SPAWN_EVERY;
        placed++;
      }
      for (let k = 1; k <= placed; k++) {
        const f = k / (placed + 1);
        spawn(lastX + dx * f, lastY + dy * f);
      }
      lastX = x;
      lastY = y;
    };
    const onLeave = () => {
      cursor.on = false;
      cursor.x = -9999;
      cursor.y = -9999;
      lastX = null;
      lastY = null;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);

    let raf = 0;
    let running = true;

    const render = (now: number) => {
      if (!running) return;
      const scroll = scrollYProgress ? scrollYProgress.get() : 0;
      parallax += ((scroll * 26 - parallax) || 0) * 0.06; // ease toward target

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // ── Advance + cull, precompute current alpha (kept deliberately low) ──
      type Live = { x: number; y: number; r: number; alpha: number; warm: boolean };
      const live: Live[] = [];
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.born;
        if (age >= p.life) {
          particles.splice(i, 1);
          continue;
        }
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
        }
        const r = age / p.life;
        // quick fade-in, gentle fade-out with a soft visible plateau
        const env = Math.pow(Math.sin(Math.PI * r), 0.85);
        // near motes a touch brighter than far ones (atmospheric depth)
        const depthLum = 0.45 + p.depth * 0.55;
        const alpha = env * depthLum;
        const drift = (p.depth - 0.5) * parallax; // near & far shear opposite ways
        live.push({ x: p.x + drift, y: p.y, r: p.size, alpha, warm: p.warm });
      }

      // ── Faint constellation edges between nearby live motes ──
      ctx.lineWidth = 0.55;
      for (let i = 0; i < live.length; i++) {
        const a = live[i];
        for (let j = i + 1; j < live.length; j++) {
          const b = live[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > CONNECT2) continue;
          const closeness = 1 - Math.sqrt(d2) / CONNECT;
          // much softer than before — threads, not wires
          const alpha = closeness * Math.min(a.alpha, b.alpha) * 0.22;
          if (alpha < 0.012) continue;
          ctx.strokeStyle = `rgba(${BONE}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // ── Whisper-thin links from the freshest motes to the cursor itself ──
      if (cursor.on) {
        ctx.lineWidth = 0.7;
        for (let i = 0; i < live.length; i++) {
          const p = live[i];
          const dx = p.x - cursor.x;
          const dy = p.y - cursor.y;
          const md = Math.sqrt(dx * dx + dy * dy);
          if (md < 124) {
            const a = (1 - md / 124) * p.alpha * 0.22;
            ctx.strokeStyle = `rgba(${CREAM}, ${a})`;
            ctx.beginPath();
            ctx.moveTo(cursor.x, cursor.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      // ── Motes ──
      for (let i = 0; i < live.length; i++) {
        const p = live[i];
        const tone = p.warm ? CREAM : BONE;
        // overall opacity ceiling kept low so the field reads as soft powder
        ctx.fillStyle = `rgba(${tone}, ${p.alpha * 0.42})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── A barely-there focal halo that rides the cursor while active ──
      if (cursor.on && now - cursor.lastMove < 520) {
        const g = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 30);
        g.addColorStop(0, `rgba(${CREAM}, 0.10)`);
        g.addColorStop(1, `rgba(${CREAM}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [scrollYProgress, tone]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
};
