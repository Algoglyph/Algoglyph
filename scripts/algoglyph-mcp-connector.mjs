// Development shim for the repository workflow. The publishable connector lives
// in packages/mcp-connector and defaults to https://algoglyph.com; this shim
// keeps `npm run mcp:connector` pointed at the local Vite app.
process.env.ALGOGLYPH_APP_URL ||= 'http://localhost:5173';
process.env.ALGOGLYPH_DEV_ORIGINS ||= '1';

await import('../packages/mcp-connector/bin/algoglyph-mcp-connector.mjs');