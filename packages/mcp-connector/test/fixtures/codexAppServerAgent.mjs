import { readFileSync, writeFileSync } from 'node:fs';

const statePath = process.env.ALGOGLYPH_TEST_CODEX_STATE_FILE;
const readState = () => {
  if (!statePath) return { processes: [], threads: [], turns: [], interrupts: 0 };
  try { return JSON.parse(readFileSync(statePath, 'utf8')); } catch { return { processes: [], threads: [], turns: [], interrupts: 0 }; }
};
const updateState = (mutate) => {
  if (!statePath) return;
  const state = readState();
  mutate(state);
  writeFileSync(statePath, JSON.stringify(state));
};

if (process.argv.includes('--version')) {
  console.log('codex-cli fixture-1.0.0');
  process.exit(0);
}

if (!process.argv.includes('app-server')) {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => console.log(`fallback:${input}`));
} else {
  const homeDirectory = process.env.CODEX_HOME || '';
  let security = {};
  try {
    const config = readFileSync(`${homeDirectory}/config.toml`, 'utf8');
    security = {
      approvalNever: config.includes('approval_policy = "never"'),
      rootDenied: config.includes('filesystem = { ":root" = "deny" }'),
      childEnvironmentDenied: config.includes('inherit = "none"'),
      historyDisabled: config.includes('history.persistence = "none"'),
    };
  } catch {
    security = { configMissing: true };
  }
  updateState((state) => state.processes.push({ pid: process.pid, homeDirectory, security }));

  let inputBuffer = '';
  let threadCounter = 0;
  let turnCounter = 0;
  const activeTurns = new Map();
  const send = (message) => process.stdout.write(`${JSON.stringify(message)}\n`);
  const completeTurn = (turn, status = 'completed') => {
    if (turn.completed) return;
    turn.completed = true;
    if (turn.timer) clearTimeout(turn.timer);
    if (status === 'completed') {
      send({ method: 'item/agentMessage/delta', params: {
        threadId: turn.threadId, turnId: turn.turnId, itemId: `item-${turn.turnId}`, delta: turn.output,
      } });
      send({ method: 'item/completed', params: {
        threadId: turn.threadId,
        turnId: turn.turnId,
        completedAtMs: Date.now(),
        item: { type: 'agentMessage', id: `item-${turn.turnId}`, text: turn.output },
      } });
    }
    send({ method: 'turn/completed', params: {
      threadId: turn.threadId,
      turn: { id: turn.turnId, items: [], status },
    } });
    activeTurns.delete(turn.turnId);
  };

  const handle = (message) => {
    if (message.method === 'initialize') {
      send({ id: message.id, result: { userAgent: 'algoglyph-codex-fixture' } });
      return;
    }
    if (message.method === 'initialized') return;
    if (message.method === 'thread/start') {
      const threadId = `thread-${process.pid}-${++threadCounter}`;
      updateState((state) => state.threads.push({
        pid: process.pid,
        threadId,
        ephemeral: message.params?.ephemeral,
        approvalPolicy: message.params?.approvalPolicy,
        cwd: message.params?.cwd,
      }));
      send({ id: message.id, result: {
        thread: { id: threadId, ephemeral: message.params?.ephemeral === true },
        approvalPolicy: message.params?.approvalPolicy,
      } });
      send({ method: 'thread/started', params: { thread: { id: threadId, ephemeral: true } } });
      return;
    }
    if (message.method === 'turn/start') {
      const turnId = `turn-${process.pid}-${++turnCounter}`;
      const prompt = message.params?.input?.find((item) => item?.type === 'text')?.text || '';
      const turn = {
        threadId: message.params?.threadId,
        turnId,
        output: `fixture:${prompt}`,
        completed: false,
        timer: undefined,
      };
      activeTurns.set(turnId, turn);
      updateState((state) => state.turns.push({
        pid: process.pid,
        threadId: turn.threadId,
        turnId,
        approvalPolicy: message.params?.approvalPolicy,
      }));
      send({ id: message.id, result: { turn: { id: turnId, items: [], status: 'inProgress' } } });
      send({ method: 'turn/started', params: {
        threadId: turn.threadId, turn: { id: turnId, items: [], status: 'inProgress' },
      } });
      turn.timer = setTimeout(() => completeTurn(turn), prompt.includes('slow-turn') ? 10_000 : 5);
      return;
    }
    if (message.method === 'turn/interrupt') {
      const turn = activeTurns.get(message.params?.turnId);
      updateState((state) => { state.interrupts += 1; });
      send({ id: message.id, result: {} });
      if (turn) completeTurn(turn, 'interrupted');
      return;
    }
    if (message.method === 'thread/unsubscribe') {
      send({ id: message.id, result: {} });
      return;
    }
    if (message.id !== undefined) {
      send({ id: message.id, error: { code: -32601, message: 'Unsupported fixture method.' } });
    }
  };

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
    let boundary;
    while ((boundary = inputBuffer.indexOf('\n')) !== -1) {
      const line = inputBuffer.slice(0, boundary).replace(/\r$/, '');
      inputBuffer = inputBuffer.slice(boundary + 1);
      if (line.trim()) handle(JSON.parse(line));
    }
  });
}
