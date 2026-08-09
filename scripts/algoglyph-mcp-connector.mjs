// Development shim for the repository workflow. Starting this command is the
// complete connection flow; the browser discovers and pairs with it locally.
process.env.ALGOGLYPH_DEV_ORIGINS ||= '1';

await import('../packages/mcp-connector/bin/algoglyph-mcp-connector.mjs');
