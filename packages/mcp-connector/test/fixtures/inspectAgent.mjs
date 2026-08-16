import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const canonicalPath = (value) => {
  try {
    return typeof value === 'string' ? realpathSync(value) : undefined;
  } catch {
    return undefined;
  }
};

const canonicalCwd = canonicalPath(process.cwd());

const safeEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !/TOKEN|SECRET|PASSWORD|KEY/i.test(name)),
);

let approvedMcpConfig;
try {
  approvedMcpConfig = JSON.parse(readFileSync('approved-mcp.json', 'utf8'));
} catch {
  approvedMcpConfig = undefined;
}

const approvedServer = approvedMcpConfig?.mcpServers?.algoglyph_approved;
const approvedAuthorization = approvedServer?.headers?.Authorization;
const approvedUrl = typeof approvedServer?.url === 'string' ? approvedServer.url : '';

let relayProbe = { attempted: false };
if (approvedUrl && typeof approvedAuthorization === 'string') {
  relayProbe = { attempted: true };
  const relayClient = new Client({ name: 'algoglyph-legacy-relay-probe', version: '1.0.0' });
  const relayTransport = new StreamableHTTPClientTransport(new URL(approvedUrl), {
    requestInit: { headers: { Authorization: approvedAuthorization } },
  });
  try {
    await relayClient.connect(relayTransport);
    const listed = await relayClient.listTools();
    const called = await relayClient.callTool({
      name: 'echo_for_test',
      arguments: { value: 'relay-compatibility' },
    });
    relayProbe = {
      attempted: true,
      listedTool: listed.tools.some((tool) => tool.name === 'echo_for_test'),
      result: called.content?.[0]?.type === 'text' ? called.content[0].text : undefined,
    };
  } catch (error) {
    relayProbe = {
      attempted: true,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await relayClient.close().catch(() => undefined);
  }
}

process.stdout.write(JSON.stringify({
  cwd: process.cwd(),
  argv: process.argv.slice(2),
  environment: safeEnvironment,
  leaks: {
    arbitraryParentSecret: process.env.ALGOGLYPH_TEST_PARENT_SECRET !== undefined,
    awsSecret: process.env.AWS_SECRET_ACCESS_KEY !== undefined,
    connectorToken: process.env.ALGOGLYPH_CONNECTOR_TOKEN !== undefined,
    openAiKey: process.env.OPENAI_API_KEY !== undefined,
  },
  isolation: {
    approvedMcpConfig: existsSync('approved-mcp.json'),
    approvedMcpTokenPresent: Boolean(process.env.ALGOGLYPH_APPROVED_MCP_TOKEN),
    approvedMcpUsesInternalRelay: /^http:\/\/127\.0\.0\.1:\d+\/internal\/mcp\/relay_/.test(approvedUrl),
    approvedMcpTokenMatchesEnvironment:
      approvedAuthorization === `Bearer ${process.env.ALGOGLYPH_APPROVED_MCP_TOKEN}`,
    upstreamFixtureTokenPresent:
      JSON.stringify(approvedMcpConfig || {}).includes('fixture-mcp-access-token'),
    relayProbe,
    userProfileIsCwd: canonicalPath(process.env.USERPROFILE) === canonicalCwd,
    tempIsCwd: canonicalPath(process.env.TEMP) === canonicalCwd
      && canonicalPath(process.env.TMP) === canonicalCwd,
  },
}));
