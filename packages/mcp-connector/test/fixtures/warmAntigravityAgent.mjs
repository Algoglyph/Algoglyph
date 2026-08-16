import { spawn } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
const staleTranscriptDirectory = join(
  brainDirectory,
  'conversation-stale-partial',
  '.system_generated',
  'logs',
);
const staleTranscriptPath = join(staleTranscriptDirectory, 'transcript.jsonl');
mkdirSync(staleTranscriptDirectory, { recursive: true });
writeFileSync(
  staleTranscriptPath,
  '{"step_index":0,"source":"MODEL","type":"PLANNER_RESPONSE","status":"DONE","created_at":"',
);
let requestIndex = 0;
let input = '';
let staleTranscriptCompleted = false;
const submissionCounts = new Map();
const firstSubmissionAt = new Map();

const handlePrompt = (prompt) => {
  const marker = prompt.match(/WARM_REQUEST_[A-Z0-9_]+/)?.[0] || 'WARM_REQUEST_UNKNOWN';
  const submissionCount = (submissionCounts.get(marker) || 0) + 1;
  submissionCounts.set(marker, submissionCount);
  if (!firstSubmissionAt.has(marker)) firstSubmissionAt.set(marker, Date.now());
  const retryElapsedMs = Date.now() - firstSubmissionAt.get(marker);
  if (marker === 'WARM_REQUEST_ELIGIBILITY' && submissionCount === 1) {
    process.stdout.write([
      'Verifying your account...',
      "We're finishing verifying your account eligibility.",
      'This usually takes a moment. Please try again shortly.',
      '? for shortcuts',
      '',
    ].join('\r\n'));
    return;
  }
  if (marker === 'WARM_REQUEST_STALE_PARTIAL' && !staleTranscriptCompleted) {
    staleTranscriptCompleted = true;
    appendFileSync(
      staleTranscriptPath,
      `${new Date().toISOString()}","content":${JSON.stringify(JSON.stringify({ marker: 'STALE_PARTIAL_OUTPUT' }))}}\n`,
    );
  }

  requestIndex += 1;
  const conversationId = `conversation-${String(requestIndex).padStart(4, '0')}`;
  const transcriptDirectory = join(
    brainDirectory,
    conversationId,
    '.system_generated',
    'logs',
  );
  mkdirSync(transcriptDirectory, { recursive: true });
  const currentConfigPath = join(homeDirectory, '.gemini', 'config', 'mcp_config.json');
  const legacySettingsPath = join(homeDirectory, '.gemini', 'antigravity-cli', 'settings.json');
  let currentConfig;
  let legacySettings;
  try { currentConfig = JSON.parse(readFileSync(currentConfigPath, 'utf8')); } catch { /* absent */ }
  try { legacySettings = JSON.parse(readFileSync(legacySettingsPath, 'utf8')); } catch { /* absent */ }
  const approvedServer = currentConfig?.mcpServers?.algoglyph_approved;
  const authorization = approvedServer?.headers?.Authorization;
  const permissionAllow = Array.isArray(legacySettings?.permissions?.allow)
    ? legacySettings.permissions.allow
    : [];
  const event = {
    step_index: requestIndex,
    source: 'MODEL',
    type: 'PLANNER_RESPONSE',
    status: 'DONE',
    created_at: new Date().toISOString(),
    content: JSON.stringify({
      marker,
      submissionCount,
      retryElapsedMs,
      homeDirectory,
      descendantPid: descendant.pid,
      promptPolicy: {
        approvedToolsAvailable: prompt.includes(
          'The explicitly configured algoglyph_approved MCP tools are available for this request.',
        ),
        denyAllTools: prompt.includes('Do not call any tools.'),
        saysToolCallWillBeDenied: prompt.includes(
          'A tool call will be denied and will make the task fail.',
        ),
      },
      mcpIsolation: {
        currentConfigPresent: Boolean(currentConfig),
        currentServerUrlIsLoopback: /^http:\/\/127\.0\.0\.1:\d+\/internal\/mcp\/relay_[A-Za-z0-9_-]{40,64}$/.test(
          approvedServer?.serverUrl || '',
        ),
        authorizationHeaderPresent: /^Bearer [A-Za-z0-9_-]+$/.test(authorization || ''),
        authorizationMatchesIsolatedRelay: authorization === `Bearer ${process.env.ALGOGLYPH_APPROVED_MCP_TOKEN}`,
        legacyMcpServersPresent: Boolean(legacySettings?.mcpServers),
        legacyHttpUrlPresent: JSON.stringify(legacySettings || {}).includes('httpUrl'),
        exactMcpPermissionPresent: permissionAllow.includes('mcp(algoglyph_approved/*)'),
        broadMcpPermissionPresent: permissionAllow.includes('mcp(*)'),
      },
    }),
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
    handlePrompt(prompt);
  }

  // Windows ConPTY consumes bracketed-paste control sequences before the child
  // sees stdin. Detect the deterministic marker in that normalized input too.
  const normalizedMarker = input.match(/WARM_REQUEST_[A-Z0-9_]+/)?.[0];
  if (normalizedMarker) {
    const normalizedPrompt = input;
    input = input.replace(normalizedMarker, '');
    handlePrompt(normalizedPrompt);
  }
};

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
  processInput();
});

process.stdout.write('? for shortcuts\r\n');
