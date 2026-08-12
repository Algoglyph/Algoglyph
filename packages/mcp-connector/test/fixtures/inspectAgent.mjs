import { existsSync, readFileSync } from 'node:fs';

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
    userProfileIsCwd: process.env.USERPROFILE === process.cwd(),
    tempIsCwd: process.env.TEMP === process.cwd() && process.env.TMP === process.cwd(),
  },
}));
