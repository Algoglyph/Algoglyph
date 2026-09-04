import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const [{ ALGORITHMS }, { getFrames }, playback] = await Promise.all([
    server.ssrLoadModule('/src/config/algorithms.ts'),
    server.ssrLoadModule('/src/lib/algorithmFrames.ts'),
    server.ssrLoadModule('/src/lib/visualizerPlayback.ts'),
  ]);

  assert.equal(ALGORITHMS.length, 66, 'the visualizer catalog changed; update the audit intentionally');

  for (const algorithm of ALGORITHMS) {
    const frames = getFrames(algorithm.id);
    assert.ok(frames.length >= 2, `${algorithm.id}: expected at least two real events`);
    assert.ok(frames.every((frame) => frame.meta?.operation && frame.meta?.why), `${algorithm.id}: every frame needs semantic metadata`);

    for (const frame of frames) {
      if (frame.type === 'array') {
        assert.equal(frame.states.length, frame.cells.length, `${algorithm.id}: array state length mismatch`);
        assert.equal(new Set(frame.cells.map((cell) => cell.id)).size, frame.cells.length, `${algorithm.id}: duplicate visual identities`);
        assert.ok(frame.cells.every((cell) => Number.isFinite(cell.v)), `${algorithm.id}: non-finite array value`);
      } else if (frame.type === 'graph') {
        const ids = new Set(frame.nodes.map((node) => node.id));
        assert.ok(frame.edges.every((edge) => ids.has(edge.from) && ids.has(edge.to)), `${algorithm.id}: edge references a missing node`);
      } else if (frame.type === 'dp') {
        assert.equal(frame.table.length, frame.rowLabels.length, `${algorithm.id}: DP row labels mismatch`);
        assert.ok(frame.table.every((row) => row.length === frame.colLabels.length), `${algorithm.id}: ragged DP table`);
        if (frame.cursor) {
          assert.ok(frame.cursor.r >= 0 && frame.cursor.r < frame.table.length, `${algorithm.id}: DP cursor row out of bounds`);
          assert.ok(frame.cursor.c >= 0 && frame.cursor.c < frame.table[frame.cursor.r].length, `${algorithm.id}: DP cursor column out of bounds`);
        }
      }
    }

    for (let i = 1; i < frames.length; i++) {
      assert.notDeepEqual(frames[i], frames[i - 1], `${algorithm.id}: duplicate hold frame at ${i}`);
    }
  }

  const sortedIds = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort', 'counting-sort'];
  for (const id of sortedIds) {
    const input = [5, -2, 5, 0, 3, 1];
    const frames = getFrames(id, input.join(','));
    const final = frames.at(-1);
    assert.equal(final.type, 'array', `${id}: final frame must be an array`);
    assert.deepEqual(final.cells.map((cell) => cell.v), [...input].sort((a, b) => a - b), `${id}: wrong final ordering`);
  }

  const radix = getFrames('radix-sort', '-1,2,3');
  assert.ok(radix.at(-1).meta?.invalid, 'radix-sort must explain its non-negative-input precondition');

  const lower = getFrames('lower-bound', '1,2,2,2,4');
  assert.equal(lower.at(-1).meta?.state?.index, 1, 'lower-bound must return the first matching index');
  const upper = getFrames('upper-bound', '1,2,2,2,4');
  assert.equal(upper.at(-1).meta?.state?.index, 4, 'upper-bound must return the first greater index');

  assert.equal(playback.moveFrameIndex(0, -1, 10), 0, 'step backward must clamp at the first frame');
  assert.equal(playback.moveFrameIndex(4, 1, 10), 5, 'step forward must advance exactly one snapshot');
  assert.equal(playback.moveFrameIndex(9, 1, 10), 9, 'step forward must clamp at the final frame');
  assert.equal(playback.clampFrameIndex(7, 3), 2, 'seeking must clamp after a trace regeneration');
  assert.deepEqual([0, 1, 2].map(playback.playbackDelay), [1800, 1000, 500], 'speed settings must map to stable delays');

  console.log(`Visualizer validation passed: ${ALGORITHMS.length} catalog entries, semantic frames, renderer invariants, and correctness cases.`);
} finally {
  await server.close();
}
