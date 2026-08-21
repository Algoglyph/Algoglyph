import { readFileSync, writeFileSync } from 'node:fs';

const statePath = process.env.ALGOGLYPH_TEST_CLAUDE_STATE_FILE;
const readState = () => {
  if (!statePath) return { processes: [], prompts: [], clears: [] };
  try { return JSON.parse(readFileSync(statePath, 'utf8')); } catch { return { processes: [], prompts: [], clears: [] }; }
};
const updateState = (mutate) => {
  if (!statePath) return;
  const state = readState();
  mutate(state);
  writeFileSync(statePath, JSON.stringify(state));
};

updateState((state) => state.processes.push({ pid: process.pid, argv: process.argv.slice(2) }));

let buffer = '';
let initialized = false;
let sessionCounter = 1;
let sessionId = `claude-session-${process.pid}-${sessionCounter}`;
const send = (message) => process.stdout.write(`${JSON.stringify(message)}\n`);
const sendResult = (result) => send({
  type: 'result',
  subtype: 'success',
  is_error: false,
  result,
  session_id: sessionId,
});

const handle = (message) => {
  const content = message?.type === 'user' && message.message?.role === 'user'
    ? message.message.content
    : undefined;
  if (typeof content !== 'string') return;
  if (!initialized) {
    initialized = true;
    send({ type: 'system', subtype: 'init', session_id: sessionId, tools: [], mcp_servers: [] });
  }
  send({ type: 'user', message: { role: 'user', content }, session_id: sessionId });
  if (content === '/clear') {
    const previousSessionId = sessionId;
    sessionId = `claude-session-${process.pid}-${++sessionCounter}`;
    updateState((state) => state.clears.push({ pid: process.pid, previousSessionId, sessionId }));
    sendResult('');
    return;
  }
  updateState((state) => state.prompts.push({ pid: process.pid, sessionId, content }));
  const finish = () => {
    send({
      type: 'assistant',
      message: { role: 'assistant', content: [{ type: 'text', text: `fixture:${content}` }] },
      session_id: sessionId,
    });
    sendResult(`fixture:${content}`);
  };
  setTimeout(finish, content.includes('slow-turn') ? 10_000 : 5);
};

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let boundary;
  while ((boundary = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, boundary).replace(/\r$/, '');
    buffer = buffer.slice(boundary + 1);
    if (line.trim()) handle(JSON.parse(line));
  }
});
