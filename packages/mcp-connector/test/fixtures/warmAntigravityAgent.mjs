import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const homeDirectory = process.env.HOME;
if (!homeDirectory) process.exit(2);

// This descendant deliberately ignores graceful termination. The connector's
// warm-session cleanup test verifies that revocation kills the whole tree.
const descendant = spawn(process.execPath, [
  '-e',
  "process.on('SIGTERM',()=>{});setInterval(()=>{},1000)",
], {
  stdio: 'ignore',
  windowsHide: true,
});

const brainDirectory = join(homeDirectory, '.gemini', 'antigravity-cli', 'brain');
let requestIndex = 0;
let input = '';

const writeTranscript = (prompt) => {
  requestIndex += 1;
  const marker = prompt.match(/WARM_REQUEST_[A-Z0-9_]+/)?.[0] || 'WARM_REQUEST_UNKNOWN';
  const conversationId = `conversation-${String(requestIndex).padStart(4, '0')}`;
  const transcriptDirectory = join(
    brainDirectory,
    conversationId,
    '.system_generated',
    'logs',
  );
  mkdirSync(transcriptDirectory, { recursive: true });
  const event = {
    step_index: requestIndex,
    source: 'MODEL',
    type: 'PLANNER_RESPONSE',
    status: 'DONE',
    created_at: new Date().toISOString(),
    content: JSON.stringify({ marker, homeDirectory, descendantPid: descendant.pid }),
  };
  writeFileSync(join(transcriptDirectory, 'transcript.jsonl'), `${JSON.stringify(event)}\n`);
};

const processInput = () => {
  while (/\/clear(?:\r\n|\r|\n)/.test(input)) {
    input = input.replace(/\/clear(?:\r\n|\r|\n)/, '');
    process.stdout.write('? for shortcuts\r\n');
  }

  while (true) {
    const match = input.match(/\x1b\[200~([\s\S]*?)\x1b\[201~(?:\r\n|\r|\n)/);
    if (!match || match.index === undefined) break;
    const prompt = match[1];
    input = input.slice(match.index + match[0].length);
    writeTranscript(prompt);
  }

  // Windows ConPTY consumes bracketed-paste control sequences before the child
  // sees stdin. Detect the deterministic marker in that normalized input too.
  const normalizedMarker = input.match(/WARM_REQUEST_[A-Z0-9_]+/)?.[0];
  if (normalizedMarker) {
    input = input.replace(normalizedMarker, '');
    writeTranscript(normalizedMarker);
  }
};

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
  processInput();
});

process.stdout.write('? for shortcuts\r\n');
