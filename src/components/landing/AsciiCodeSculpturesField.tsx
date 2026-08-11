import { useEffect, useRef } from 'react';

type SculptureKind = 'torus' | 'tree';

interface AsciiBuffer {
  columns: number;
  rows: number;
  depths: Float32Array;
  glyphs: Uint8Array;
  light: Float32Array;
}

interface FieldColors {
  active: string;
  ink: string;
}

const TAU = Math.PI * 2;
const ASCII_RAMP = '.,-~:;=!*#$@';
const ASCII_GLYPHS = `${ASCII_RAMP}/\\|`;
const FRAME_INTERVAL = 1_000 / 30;
const MOBILE_SLOT_DURATION = 5_000;
const MOBILE_CROSSFADE_DURATION = 1_000;
const SCULPTURES: SculptureKind[] = ['torus', 'tree'];
const MOBILE_REEL_DURATION = MOBILE_SLOT_DURATION * SCULPTURES.length;

const TORUS_THETA = Array.from({ length: Math.ceil(TAU / 0.12) }, (_, index) => {
  const angle = index * 0.12;
  return { sin: Math.sin(angle), cos: Math.cos(angle) };
});

const TORUS_PHI = Array.from({ length: Math.ceil(TAU / 0.05) }, (_, index) => {
  const angle = index * 0.05;
  return { sin: Math.sin(angle), cos: Math.cos(angle) };
});

const createBuffer = (columns: number, rows: number): AsciiBuffer => {
  const cells = columns * rows;
  return {
    columns,
    rows,
    depths: new Float32Array(cells),
    glyphs: new Uint8Array(cells),
    light: new Float32Array(cells),
  };
};

const resetBuffer = (buffer: AsciiBuffer) => {
  buffer.depths.fill(0);
  buffer.glyphs.fill(0);
  buffer.light.fill(0);
};

const plot = (
  buffer: AsciiBuffer,
  x: number,
  y: number,
  inverseDepth: number,
  luminance: number,
  glyphOverride?: number,
) => {
  const column = Math.round(x);
  const row = Math.round(y);
  if (column < 0 || column >= buffer.columns || row < 0 || row >= buffer.rows) return;
  const index = row * buffer.columns + column;
  if (inverseDepth <= buffer.depths[index]) return;

  const normalizedLight = Math.max(0, Math.min(1, luminance));
  buffer.depths[index] = inverseDepth;
  buffer.light[index] = normalizedLight;
  buffer.glyphs[index] =
    glyphOverride ??
    Math.min(
      ASCII_RAMP.length,
      Math.floor(normalizedLight * (ASCII_RAMP.length - 1)) + 1,
    );
};

const readColor = (canvas: HTMLCanvasElement, name: string, fallback: string) =>
  getComputedStyle(canvas).getPropertyValue(name).trim() || fallback;

const renderTorus = (buffer: AsciiBuffer, angleA: number, angleB: number) => {
  resetBuffer(buffer);
  const sinA = Math.sin(angleA);
  const cosA = Math.cos(angleA);
  const sinB = Math.sin(angleB);
  const cosB = Math.cos(angleB);
  const scaleX = buffer.columns * 0.65;
  const scaleY = buffer.rows * 0.7;

  for (const theta of TORUS_THETA) {
    const circleX = 2 + theta.cos;
    const circleY = theta.sin;

    for (const phi of TORUS_PHI) {
      const x = circleX * (cosB * phi.cos + sinA * sinB * phi.sin) - circleY * cosA * sinB;
      const y = circleX * (sinB * phi.cos - sinA * cosB * phi.sin) + circleY * cosA * cosB;
      const z = 5 + cosA * circleX * phi.sin + circleY * sinA;
      const inverseDepth = 1 / z;
      const luminance =
        phi.cos * theta.cos * sinB -
        cosA * theta.cos * phi.sin -
        sinA * theta.sin +
        cosB * (cosA * theta.sin - theta.cos * sinA * phi.sin);

      if (luminance <= 0) continue;
      plot(
        buffer,
        buffer.columns * 0.5 + scaleX * inverseDepth * x,
        buffer.rows * 0.5 - scaleY * inverseDepth * y,
        inverseDepth,
        luminance / Math.SQRT2,
      );
    }
  }
};

const stableNoise = (x: number, y: number, seed: number) => {
  const raw = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43_758.5453;
  return raw - Math.floor(raw);
};

const ellipse = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
) => {
  const normalizedX = (x - centerX) / radiusX;
  const normalizedY = (y - centerY) / radiusY;
  return normalizedX * normalizedX + normalizedY * normalizedY;
};

const treeGlyph = (noise: number, luminance: number) => {
  if (luminance > 0.82 && noise > 0.38) return ASCII_RAMP.indexOf('$') + 1;
  if (noise > 0.78) return ASCII_RAMP.indexOf('#') + 1;
  if (noise > 0.56) return ASCII_RAMP.indexOf('*') + 1;
  if (noise > 0.38) return ASCII_RAMP.indexOf('!') + 1;
  if (noise > 0.2) return ASCII_RAMP.indexOf(':') + 1;
  return ASCII_RAMP.indexOf('.') + 1;
};

const renderTree = (buffer: AsciiBuffer, seconds: number, pointerBias: number) => {
  resetBuffer(buffer);
  const sway = Math.sin(seconds * 0.72) * 0.035 + pointerBias * 0.06;
  const pulse = 0.5 + Math.sin(seconds * 1.3) * 0.5;

  for (let row = 0; row < buffer.rows; row += 1) {
    const y = ((row + 0.5) / buffer.rows - 0.5) * 2.22;

    for (let column = 0; column < buffer.columns; column += 1) {
      const x = ((column + 0.5) / buffer.columns - 0.5) * 2.16 - sway * (0.55 - y);
      const upperCrown = Math.min(
        ellipse(x, y, -0.02, -0.62, 0.62, 0.34),
        ellipse(x, y, -0.42, -0.45, 0.42, 0.3),
        ellipse(x, y, 0.42, -0.44, 0.44, 0.31),
        ellipse(x, y, -0.18, -0.79, 0.31, 0.22),
        ellipse(x, y, 0.22, -0.78, 0.34, 0.23),
      );
      const lowerCrown = Math.min(
        ellipse(x, y, -0.28, -0.25, 0.5, 0.22),
        ellipse(x, y, 0.3, -0.23, 0.52, 0.23),
        ellipse(x, y, 0, -0.11, 0.34, 0.2),
      );
      const roots = Math.min(
        ellipse(x, y, -0.26, 0.72, 0.42, 0.22),
        ellipse(x, y, 0.28, 0.72, 0.44, 0.22),
        ellipse(x, y, 0, 0.84, 0.72, 0.2),
      );
      const trunkWidth = 0.07 + Math.max(0, y + 0.08) * 0.1;
      const trunk = Math.abs(x - sway * 0.26) < trunkWidth && y > -0.24 && y < 0.88;
      const leftBranch = y > -0.42 && y < -0.12 && Math.abs(y + 0.33 + (x + 0.12) * 0.7) < 0.035 && x < 0.02;
      const rightBranch = y > -0.42 && y < -0.1 && Math.abs(y + 0.31 - (x - 0.1) * 0.66) < 0.035 && x > -0.02;
      const canopyMask = Math.min(upperCrown, lowerCrown);
      const inCanopy = canopyMask < 1;
      const inRoots = roots < 1 && y > 0.48;
      const noise = stableNoise(column, row, Math.floor(seconds * 7));
      const edge = inCanopy ? Math.max(0, 1 - canopyMask) : inRoots ? Math.max(0, 1 - roots) : 1;
      const density = trunk || leftBranch || rightBranch ? 0.96 : Math.min(0.92, 0.34 + edge * 0.92);

      if (!(inCanopy || inRoots || trunk || leftBranch || rightBranch) || noise > density) continue;

      const centerGlow = Math.max(0, 1 - Math.abs(x) * 1.25) * Math.max(0, 1 - Math.abs(y + 0.08) * 0.72);
      const organicLight = 0.32 + edge * 0.32 + centerGlow * 0.28 + pulse * 0.08 + noise * 0.12;
      const luminance = trunk || leftBranch || rightBranch
        ? Math.min(1, 0.48 + centerGlow * 0.36 + noise * 0.18)
        : Math.min(1, organicLight);

      plot(
        buffer,
        column,
        row,
        1 + luminance * 0.1 + noise * 0.01,
        luminance,
        treeGlyph(noise, luminance),
      );
    }
  }
};

/**
 * A decorative collection of live, mathematically projected ASCII forms.
 * Rendering stays outside React so the animation never causes component updates.
 */
export function AsciiCodeSculpturesField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const torusBuffer = createBuffer(48, 26);
    const treeBuffer = createBuffer(54, 44);
    let width = 0;
    let height = 0;
    let isMobile = false;
    let colors: FieldColors;
    let animationFrame = 0;
    let animationElapsed = 0;
    let lastTickTime = 0;
    let lastPaintTime = 0;
    let isIntersecting = true;
    let isRunning = false;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;

    const refreshColors = () => {
      colors = {
        active: readColor(canvas, '--lp-hero-cyan', '#83eaff'),
        ink: readColor(canvas, '--lp-hero-ink', '#f4f7f8'),
      };
    };

    const drawBuffer = (
      buffer: AsciiBuffer,
      centerX: number,
      centerY: number,
      cellWidth: number,
      cellHeight: number,
      opacity = 1,
    ) => {
      if (opacity <= 0) return;
      const left = centerX - (buffer.columns * cellWidth) / 2;
      const top = centerY - (buffer.rows * cellHeight) / 2;
      context.save();
      context.font = `500 ${Math.max(7, cellHeight * 0.92)}px "Geist Mono Variable", ui-monospace, monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      for (let index = 0; index < buffer.glyphs.length; index += 1) {
        const glyphIndex = buffer.glyphs[index];
        if (glyphIndex === 0) continue;
        const luminance = buffer.light[index];
        const column = index % buffer.columns;
        const row = Math.floor(index / buffer.columns);
        context.globalAlpha = opacity * (0.18 + luminance * 0.82);
        context.fillStyle = luminance > 0.78 ? colors.active : colors.ink;
        context.fillText(
          ASCII_GLYPHS[glyphIndex - 1],
          left + (column + 0.5) * cellWidth,
          top + (row + 0.5) * cellHeight,
        );
      }
      context.restore();
    };

    const renderSculpture = (kind: SculptureKind, elapsed: number) => {
      const seconds = elapsed / 1_000;
      if (kind === 'torus') {
        renderTorus(
          torusBuffer,
          0.78 + seconds * 0.54 + pointerY * 0.14,
          -0.28 + seconds * 0.31 + pointerX * 0.18,
        );
      } else {
        renderTree(treeBuffer, seconds, pointerX);
      }
    };

    const drawDesktop = (elapsed: number) => {
      const outerBand = width * 0.29;
      const torusCellWidth = Math.min(7.8, Math.max(3.8, (outerBand - 10) / torusBuffer.columns));
      const treeCellWidth = Math.min(7.5, Math.max(3.4, (outerBand - 6) / treeBuffer.columns));

      renderSculpture('torus', elapsed);
      renderSculpture('tree', elapsed);

      drawBuffer(torusBuffer, outerBand * 0.46, height * 0.5, torusCellWidth, torusCellWidth * 1.56);
      drawBuffer(treeBuffer, width - outerBand * 0.45, height * 0.55, treeCellWidth, treeCellWidth * 1.24);
    };

    const drawMobileSculpture = (kind: SculptureKind, elapsed: number, opacity: number) => {
      renderSculpture(kind, elapsed);
      const centerY = height * 0.82;

      if (kind === 'torus') {
        drawBuffer(torusBuffer, width * 0.5, centerY, 7.5, 11.4, opacity);
      } else {
        drawBuffer(treeBuffer, width * 0.5, centerY, 7.5, 9.3, opacity);
      }
    };

    const drawMobile = (elapsed: number) => {
      if (reducedMotion) {
        renderTorus(torusBuffer, 1.04, 0.28);
        drawBuffer(torusBuffer, width * 0.5, height * 0.82, 7.5, 11.4);
        return;
      }

      const reelTime = elapsed % MOBILE_REEL_DURATION;
      const currentIndex = Math.floor(reelTime / MOBILE_SLOT_DURATION);
      const slotTime = reelTime % MOBILE_SLOT_DURATION;
      const current = SCULPTURES[currentIndex];
      const next = SCULPTURES[(currentIndex + 1) % SCULPTURES.length];
      const fadeStart = MOBILE_SLOT_DURATION - MOBILE_CROSSFADE_DURATION;

      if (slotTime < fadeStart) {
        drawMobileSculpture(current, elapsed, 1);
      } else {
        const progress = (slotTime - fadeStart) / MOBILE_CROSSFADE_DURATION;
        drawMobileSculpture(current, elapsed, 1 - progress);
        drawMobileSculpture(next, elapsed, progress);
      }
    };

    const paint = () => {
      context.clearRect(0, 0, width, height);
      if (!width || !height) return;
      pointerX += (pointerTargetX - pointerX) * 0.055;
      pointerY += (pointerTargetY - pointerY) * 0.055;

      if (isMobile) drawMobile(animationElapsed);
      else drawDesktop(reducedMotion ? 1_250 : animationElapsed);
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      isMobile = width < 720;
      canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      refreshColors();
      if (isMobile) {
        pointerTargetX = 0;
        pointerTargetY = 0;
        pointerX = 0;
        pointerY = 0;
      }
      paint();
    };

    const tick = (time: number) => {
      if (!isRunning) return;
      if (lastTickTime === 0) lastTickTime = time;
      animationElapsed += time - lastTickTime;
      lastTickTime = time;

      if (time - lastPaintTime >= FRAME_INTERVAL) {
        paint();
        lastPaintTime = time;
      }
      animationFrame = requestAnimationFrame(tick);
    };

    const pause = () => {
      if (!isRunning) return;
      isRunning = false;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastTickTime = 0;
    };

    const syncPlayback = () => {
      const shouldRun = !reducedMotion && isIntersecting && !document.hidden;
      if (shouldRun && !isRunning) {
        isRunning = true;
        lastTickTime = 0;
        animationFrame = requestAnimationFrame(tick);
      } else if (!shouldRun) {
        pause();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (isMobile || event.pointerType === 'touch') return;
      const bounds = canvas.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;
      const inside = localX >= 0 && localX <= bounds.width && localY >= 0 && localY <= bounds.height;
      pointerTargetX = inside ? Math.max(-1, Math.min(1, (localX / bounds.width - 0.5) * 2)) : 0;
      pointerTargetY = inside ? Math.max(-1, Math.min(1, (localY / bounds.height - 0.5) * 2)) : 0;
    };

    const handlePointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0 },
    );

    resize();
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerout', handlePointerLeave);
    syncPlayback();

    return () => {
      pause();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerout', handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />;
}
