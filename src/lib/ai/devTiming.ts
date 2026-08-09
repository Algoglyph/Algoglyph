export interface CanvasPerfTrace {
  traceId: string;
  prompt: string;
  startedAt: number;
  finishedAt?: number;
  totalMs?: number;
  stages: Record<string, number>;
  error?: string;
}

type PerfWindow = Window & {
  __ALGOGLYPH_PERF_RESULTS__?: CanvasPerfTrace[];
};

const activeTraces = new Map<string, CanvasPerfTrace>();

const timingEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const explicitlyEnabled = new URLSearchParams(window.location.search).get('algoglyphPerf') === '1';
  return (import.meta.env.DEV || explicitlyEnabled)
    && window.localStorage.getItem('algoglyph-dev-timing') === '1';
};

const rounded = (value: number): number => Math.round(value * 1000) / 1000;

export const beginCanvasPerfTrace = (prompt: string): string | undefined => {
  if (!timingEnabled()) return undefined;
  const traceId = `canvas-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeTraces.set(traceId, {
    traceId,
    prompt,
    startedAt: performance.now(),
    stages: {},
  });
  return traceId;
};

export const recordCanvasPerfStage = (traceId: string | undefined, stage: string, durationMs: number): void => {
  if (!traceId || !Number.isFinite(durationMs)) return;
  const trace = activeTraces.get(traceId);
  if (trace) trace.stages[stage] = rounded(durationMs);
};

export const recordCanvasPerfStages = (
  traceId: string | undefined,
  stages: Record<string, number>,
): void => {
  for (const [stage, durationMs] of Object.entries(stages)) {
    recordCanvasPerfStage(traceId, stage, durationMs);
  }
};

export const finishCanvasPerfTrace = (traceId: string | undefined, error?: string): CanvasPerfTrace | undefined => {
  if (!traceId) return undefined;
  const trace = activeTraces.get(traceId);
  if (!trace) return undefined;
  trace.finishedAt = performance.now();
  trace.totalMs = rounded(trace.finishedAt - trace.startedAt);
  if (error) trace.error = error;
  activeTraces.delete(traceId);
  const perfWindow = window as PerfWindow;
  perfWindow.__ALGOGLYPH_PERF_RESULTS__ = [...(perfWindow.__ALGOGLYPH_PERF_RESULTS__ || []), trace];
  console.info(`[algoglyph-perf] ${JSON.stringify(trace)}`);
  return trace;
};
