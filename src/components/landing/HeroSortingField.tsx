import { useEffect, useRef } from 'react';

/**
 * HeroSortingField — the hero's animated background, modeled directly on
 * composio.dev's WebGL field but drawn in Canvas 2D.
 *
 * Geometry: parallel diagonal "streams" of thin vertical bars descending at
 * ~21 degrees, mirrored from the left and right edges. Bars are grouped into
 * chunks that share a base height, which produces the terraced / slab look.
 * Brightest at the outer edges, faded to nothing through the center so the
 * headline reads cleanly.
 *
 * Palette sampled from Composio's render: indigo -> blue -> cyan -> green.
 */

// Composio's spectrum, sampled from the live canvas.
const PALETTE: Array<[number, number, number]> = [
  [59, 47, 191], // deep indigo
  [68, 56, 202], // indigo
  [37, 99, 235], // blue
  [59, 130, 246], // bright blue
  [34, 211, 238], // cyan
  [34, 197, 94], // green
  [74, 222, 128], // mint
];

// Deterministic hash -> [0, 1)
function hash(a: number, b: number): number {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function HeroSortingField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = !reduce;
    let lastFrame = 0;

    // Diagonal direction: ~21 degrees below horizontal.
    const DX = 0.934;
    const DY = 0.358;
    const STEP = 3; // distance between bars along a stream
    const BARW = 2.2;

    let spacing = 32; // vertical gap between streams
    let streams = 0;

    const layout = () => {
      spacing = w < 700 ? 40 : 30;
      streams = Math.ceil((h * 1.9) / spacing);
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };

    // Horizontal falloff: 1 at the outer edges, 0 through the middle.
    const edgeFade = (x: number) => {
      const dead = w < 700 ? 0.42 : 0.3;
      const d = Math.abs(x / w - 0.5) * 2;
      const e = (d - dead) / (1 - dead);
      if (e <= 0) return 0;
      return e * e;
    };

    const drawSide = (side: -1 | 1, t: number) => {
      const dx = DX * side;
      const originX = side === 1 ? -70 : w + 70;
      const maxLen = w * 0.62;
      const bars = Math.floor(maxLen / STEP);

      for (let s = 0; s < streams; s++) {
        const seed = s + (side === 1 ? 0 : 500);
        const startY = -h * 0.45 + s * spacing;
        // Chunk length varies per stream -> irregular slab widths.
        const chunkLen = 5 + Math.floor(hash(seed, 3) * 11);
        // Colour: walk the palette by stream, so adjacent streams differ.
        const cIdx = (hash(seed, 7) * 0.55 + (s / streams) * 0.45) * (PALETTE.length - 1);
        const c0 = PALETTE[Math.floor(cIdx)];
        const c1 = PALETTE[Math.min(PALETTE.length - 1, Math.floor(cIdx) + 1)];
        const mix = cIdx - Math.floor(cIdx);
        const r = Math.round(c0[0] + (c1[0] - c0[0]) * mix);
        const g = Math.round(c0[1] + (c1[1] - c0[1]) * mix);
        const b = Math.round(c0[2] + (c1[2] - c0[2]) * mix);
        const rgb = `${r},${g},${b}`;

        const speed = 0.6 + hash(seed, 11) * 0.9;
        const slabH = 18 + hash(seed, 13) * 58;

        let chunkBase = 0;
        let lastChunk = -1;

        for (let k = 0; k < bars; k++) {
          const px = originX + dx * k * STEP;
          // Streams begin off-canvas: skip until they enter, stop once past.
          if (side === 1 ? px > w + BARW : px < -BARW) break;
          if (side === 1 ? px < -BARW : px > w + BARW) continue;
          const fade = edgeFade(px);
          if (fade < 0.015) continue;

          const py = startY + DY * k * STEP;
          if (py < -60 || py > h + 60) continue;

          const chunk = Math.floor(k / chunkLen);
          if (chunk !== lastChunk) {
            lastChunk = chunk;
            const wave = 0.5 + 0.5 * Math.sin(t * speed + chunk * 0.55 + s * 0.7);
            chunkBase = (0.22 + 0.78 * hash(seed, chunk)) * (0.45 + 0.55 * wave);
          }
          // Per-bar jitter inside the slab keeps the equalizer texture.
          const barH = slabH * chunkBase * (0.7 + 0.3 * hash(seed, k));

          // Concentrate intensity toward the top, like Composio's corner bloom.
          const vFade = 1 - 0.45 * Math.min(1, Math.max(0, py / h));
          const alpha = fade * vFade * (0.3 + 0.72 * chunkBase);
          ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
          ctx.fillRect(px, py - barH, BARW, barH);
        }
      }
    };

    const paint = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      drawSide(1, t);
      drawSide(-1, t);
    };

    const run = (now: number) => {
      if (!running) return;
      // Ambient field: ~30fps is plenty and halves the fill cost.
      if (now - lastFrame > 32) {
        paint(now / 1000);
        lastFrame = now;
      }
      raf = requestAnimationFrame(run);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduce) return;
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(run);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    if (reduce) {
      paint(0);
    } else {
      raf = requestAnimationFrame(run);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" />;
}
