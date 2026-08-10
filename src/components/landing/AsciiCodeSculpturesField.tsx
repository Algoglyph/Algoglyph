import { useEffect, useRef } from 'react';

type SculptureKind = 'torus' | 'cube' | 'helix';

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
const MOBILE_REEL_DURATION = MOBILE_SLOT_DURATION * 3;
const SCULPTURES: SculptureKind[] = ['torus', 'cube', 'helix'];

const TORUS_THETA = Array.from({ length: Math.ceil(TAU / 0.12) }, (_, index) => {
  const angle = index * 0.12;
  return { sin: Math.sin(angle), cos: Math.cos(angle) };
});

const TORUS_PHI = Array.from({ length: Math.ceil(TAU / 0.05) }, (_, index) => {
  const angle = index * 0.05;
  return { sin: Math.sin(angle), cos: Math.cos(angle) };
});

const CUBE_VERTICES = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
] as const;
const CUBE_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
] as const;

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

const rotatePoint = (
  x: number,
  y: number,
  z: number,
  angleX: number,
  angleY: number,
  angleZ: number,
) => {
  const sinX = Math.sin(angleX);
  const cosX = Math.cos(angleX);
  const sinY = Math.sin(angleY);
  const cosY = Math.cos(angleY);
  const sinZ = Math.sin(angleZ);
  const cosZ = Math.cos(angleZ);

  const yX = y * cosX - z * sinX;
  const zX = y * sinX + z * cosX;
  const xY = x * cosY + zX * sinY;
  const zY = -x * sinY + zX * cosY;

  return {
    x: xY * cosZ - yX * sinZ,
    y: xY * sinZ + yX * cosZ,
    z: zY,
  };
};

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

const renderCube = (
  buffer: AsciiBuffer,
  angleX: number,
  angleY: number,
  angleZ: number,
) => {
  resetBuffer(buffer);
  const cameraDistance = 4.4;
  const scaleX = buffer.columns * 0.98;
  const scaleY = buffer.rows * 0.86;

  for (const [startIndex, endIndex] of CUBE_EDGES) {
    const start = CUBE_VERTICES[startIndex];
    const end = CUBE_VERTICES[endIndex];
    const rotatedStart = rotatePoint(start[0], start[1], start[2], angleX, angleY, angleZ);
    const rotatedEnd = rotatePoint(end[0], end[1], end[2], angleX, angleY, angleZ);
    const startDepth = 1 / (cameraDistance + rotatedStart.z);
    const endDepth = 1 / (cameraDistance + rotatedEnd.z);
    const startX = buffer.columns * 0.5 + scaleX * startDepth * rotatedStart.x;
    const startY = buffer.rows * 0.5 - scaleY * startDepth * rotatedStart.y;
    const endX = buffer.columns * 0.5 + scaleX * endDepth * rotatedEnd.x;
    const endY = buffer.rows * 0.5 - scaleY * endDepth * rotatedEnd.y;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const slope = Math.abs(deltaX) / Math.max(0.001, Math.abs(deltaY));
    const glyph = slope > 2.2
      ? ASCII_GLYPHS.indexOf('-') + 1
      : slope < 0.45
        ? ASCII_GLYPHS.indexOf('|') + 1
        : deltaX * deltaY > 0
          ? ASCII_GLYPHS.indexOf('\\') + 1
          : ASCII_GLYPHS.indexOf('/') + 1;
    const steps = Math.max(2, Math.ceil(Math.max(Math.abs(deltaX), Math.abs(deltaY)) * 2));

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const inverseDepth = startDepth + (endDepth - startDepth) * progress;
      const luminance = Math.max(0.42, Math.min(1, 0.42 + (inverseDepth - 0.18) * 4.2));
      plot(
        buffer,
        startX + deltaX * progress,
        startY + deltaY * progress,
        inverseDepth,
        luminance,
        glyph,
      );
    }
  }
};

const renderHelix = (buffer: AsciiBuffer, phaseOffset: number, orbitBias: number) => {
  resetBuffer(buffer);
  const samples = 190;
  const turns = 3.25;
  const cameraDistance = 4;
  const scaleX = buffer.columns * 1.72;
  const scaleY = buffer.rows * 0.74;

  const projectHelixPoint = (phase: number, vertical: number, strandOffset: number, rung = false) => {
    const angle = phase + strandOffset + phaseOffset;
    const rawX = Math.cos(angle) * 0.72;
    const rawZ = Math.sin(angle) * 0.72;
    const rotated = rotatePoint(rawX, vertical, rawZ, -0.08, orbitBias, 0.04);
    const z = cameraDistance + rotated.z;
    const inverseDepth = 1 / z;
    const depthLight = Math.max(0, Math.min(1, (inverseDepth - 0.2) / 0.12));

    plot(
      buffer,
      buffer.columns * 0.5 + scaleX * inverseDepth * rotated.x,
      buffer.rows * 0.5 - scaleY * inverseDepth * rotated.y,
      inverseDepth,
      rung ? 0.28 + depthLight * 0.32 : 0.42 + depthLight * 0.58,
    );
  };

  for (let index = 0; index < samples; index += 1) {
    const progress = index / (samples - 1);
    const phase = progress * turns * TAU;
    const vertical = -1.8 + progress * 3.6;
    projectHelixPoint(phase, vertical, 0);
    projectHelixPoint(phase, vertical, Math.PI);

    if (index % 16 === 0) {
      for (let rungStep = 1; rungStep < 8; rungStep += 1) {
        const blend = rungStep / 8;
        const firstAngle = phase + phaseOffset;
        const secondAngle = firstAngle + Math.PI;
        const x = Math.cos(firstAngle) * (1 - blend) + Math.cos(secondAngle) * blend;
        const z = Math.sin(firstAngle) * (1 - blend) + Math.sin(secondAngle) * blend;
        const rotated = rotatePoint(x * 0.72, vertical, z * 0.72, -0.08, orbitBias, 0.04);
        const cameraZ = cameraDistance + rotated.z;
        const inverseDepth = 1 / cameraZ;
        plot(
          buffer,
          buffer.columns * 0.5 + scaleX * inverseDepth * rotated.x,
          buffer.rows * 0.5 - scaleY * inverseDepth * rotated.y,
          inverseDepth,
          0.34,
          ASCII_RAMP.indexOf('-') + 1,
        );
      }
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
    const cubeBuffer = createBuffer(42, 28);
    const helixBuffer = createBuffer(24, 24);
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
      } else if (kind === 'cube') {
        renderCube(
          cubeBuffer,
          0.56 + seconds * 0.34 + pointerY * 0.12,
          0.68 + seconds * 0.43 + pointerX * 0.18,
          -0.12 + seconds * 0.16,
        );
      } else {
        renderHelix(helixBuffer, seconds * 0.88, 0.16 + pointerX * 0.16);
      }
    };

    const drawDesktop = (elapsed: number) => {
      const outerBand = width * 0.225;
      const torusCellWidth = Math.min(6.3, Math.max(3.2, (outerBand - 18) / torusBuffer.columns));
      const cubeCellWidth = Math.min(5.2, Math.max(3, (outerBand - 22) / cubeBuffer.columns));
      const helixCellWidth = Math.min(6, Math.max(3.3, (outerBand - 36) / helixBuffer.columns));

      renderSculpture('torus', elapsed);
      renderSculpture('cube', elapsed);
      renderSculpture('helix', elapsed);

      drawBuffer(torusBuffer, outerBand * 0.5, height * 0.49, torusCellWidth, torusCellWidth * 1.56);
      drawBuffer(cubeBuffer, width - outerBand * 0.5, height * 0.38, cubeCellWidth, cubeCellWidth * 1.58);
      drawBuffer(helixBuffer, width - outerBand * 0.47, height * 0.74, helixCellWidth, helixCellWidth * 1.54);
    };

    const drawMobileSculpture = (kind: SculptureKind, elapsed: number, opacity: number) => {
      renderSculpture(kind, elapsed);
      const centerY = height * 0.835;

      if (kind === 'torus') {
        drawBuffer(torusBuffer, width * 0.5, centerY, 6.2, 9.55, opacity);
      } else if (kind === 'cube') {
        drawBuffer(cubeBuffer, width * 0.5, centerY, 6.1, 8.7, opacity);
      } else {
        drawBuffer(helixBuffer, width * 0.5, centerY, 7.2, 9.5, opacity);
      }
    };

    const drawMobile = (elapsed: number) => {
      if (reducedMotion) {
        renderTorus(torusBuffer, 1.04, 0.28);
        drawBuffer(torusBuffer, width * 0.5, height * 0.835, 6.2, 9.55);
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
