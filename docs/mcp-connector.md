# Algoglyph MCP Connector

The browser workspace never receives access to local CLIs or saved provider credentials. It communicates with a loopback process instead:

```text
Algoglyph workspace -> 127.0.0.1 connector -> Codex / Antigravity / MCP servers
```

## Start the connector

From the project root, run:

```bash
npm run mcp:connector
```

The connector binds only to `127.0.0.1:4319` and prints a session token. Paste that token into the MCP dialog. The token is not saved in the workspace or browser storage.

For a stable local token, start it with `ALGOGLYPH_CONNECTOR_TOKEN` set in your shell. The connector accepts browser requests only from the local Vite origins by default. A hosted Algoglyph deployment must opt in with a comma-separated `ALGOGLYPH_ALLOWED_ORIGINS` list.

## Current endpoints

- `GET /v1/health`: reports connector availability without exposing local agent details.
- `GET /v1/catalog`: requires the connector token and detects `codex` and `agy` using fixed `--version` commands.
- `POST /v1/mcp/test`: requires the connector token, connects to an HTTPS Streamable HTTP MCP endpoint with the official MCP SDK, and falls back to legacy SSE.

The first slice is intentionally discovery-only for local agents. It does not yet send prompts to Codex or Antigravity, invoke MCP tools, or persist remote server tokens. Those capabilities need explicit user approval and a structured canvas-action contract in the next phase.
