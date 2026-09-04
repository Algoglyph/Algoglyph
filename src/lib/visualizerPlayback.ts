export const clampFrameIndex = (index: number, frameCount: number): number => {
  if (frameCount <= 0) return 0;
  return Math.max(0, Math.min(Math.trunc(index), frameCount - 1));
};

export const moveFrameIndex = (index: number, delta: number, frameCount: number): number =>
  clampFrameIndex(index + delta, frameCount);

export const playbackDelay = (speedIndex: number): number => [1800, 1000, 500][clampFrameIndex(speedIndex, 3)];
