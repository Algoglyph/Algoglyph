const safeEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !/TOKEN|SECRET|PASSWORD|KEY/i.test(name)),
);

process.stdout.write(JSON.stringify({
  cwd: process.cwd(),
  argv: process.argv.slice(2),
  environment: safeEnvironment,
  isolation: {
    approvedMcpConfig: existsSync('approved-mcp.json'),
    approvedMcpTokenPresent: Boolean(process.env.ALGOGLYPH_APPROVED_MCP_TOKEN),
    userProfileIsCwd: process.env.USERPROFILE === process.cwd(),
  },
}));
import { existsSync } from 'node:fs';
