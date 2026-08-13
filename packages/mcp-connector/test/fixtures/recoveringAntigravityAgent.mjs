import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const homeDirectory = process.env.HOME;
const stateFile = process.env.ALGOGLYPH_TEST_ANTIGRAVITY_STATE_FILE;
if (!homeDirectory || !stateFile) process.exit(2);

let firstAttempt = false;
let state;
try {
  state = { phase: 'prewarm-started', prewarmHomeDirectory: homeDirectory };
  writeFileSync(stateFile, JSON.stringify(state), { encoding: 'utf8', flag: 'wx' });
  firstAttempt = true;
} catch (error) {
  if (error?.code !== 'EEXIST') throw error;
  state = JSON.parse(readFileSync(stateFile, 'utf8'));
}

// The first process deliberately stays alive without emitting the readiness
// marker. The connector must time it out, clean it up, and let the owner request
// start a replacement instead of retaining the rejected prewarm promise.
if (firstAttempt) {
  setInterval(() => undefined, 1_000);
} else {
  state = { ...state, phase: 'healthy-started', healthyHomeDirectory: homeDirectory };
  writeFileSync(stateFile, JSON.stringify(state), 'utf8');

  const brainDirectory = join(homeDirectory, '.gemini', 'antigravity-cli', 'brain');
  let requestIndex = 0;
  let input = '';

  const writeTranscript = (prompt) => {
    requestIndex += 1;
    const marker = prompt.match(/RECOVERY_REQUEST_[A-Z0-9_]+/)?.[0]
      || 'RECOVERY_REQUEST_UNKNOWN';
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
      content: JSON.stringify({ marker, homeDirectory }),
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

    // Windows ConPTY normalizes bracketed-paste control sequences before the
    // fixture sees stdin, so accept the deterministic marker in plain input too.
    const normalizedMarker = input.match(/RECOVERY_REQUEST_[A-Z0-9_]+/)?.[0];
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

  // Reading the state file also ensures the fixture fails loudly if its test
  // coordination path becomes inaccessible.
  if (JSON.parse(readFileSync(stateFile, 'utf8')).phase !== 'healthy-started') process.exit(3);
  process.stdout.write('? for shortcuts\r\n');
}
