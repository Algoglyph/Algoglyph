# Algoglyph MCP Connector

The browser workspace never receives direct access to local CLIs or saved provider credentials. It communicates with a loopback connector process instead:

```text
Algoglyph workspace -> 127.0.0.1 connector -> Codex / Claude / Antigravity / MCP servers
```

The connector must stay local. It binds to `127.0.0.1:4319` by default and should not be exposed on `0.0.0.0`.

## Start the connector

For public AlgoGlyph users, the intended command is:

```bash
npx @algoglyph/mcp-connector
```

For repository development, run from the project root:

```bash
npm run mcp:connector
```

Open the AlgoGlyph workspace and click the MCP/Local AI button. The UI polls `http://127.0.0.1:4319/health`, detects the connector, performs one-time pairing, and stores only the resulting connector session token in `sessionStorage` for the current browser tab/session.

Normal users should not need to paste a URL, port, token, or session ID.

## Pairing model

Automatic pairing uses a separate one-time credential:

1. Browser discovers the connector with `GET /health`.
2. Browser asks for a short-lived pairing credential with `POST /v1/pairings`.
3. Browser redeems it once with `POST /v1/session`.
4. Connector invalidates the pairing credential immediately.
5. Browser uses the returned session token for authenticated MCP operations.
6. Disconnect calls `POST /v1/session/revoke` and clears the browser-side token.

The pairing credential is cryptographically random, expires after 90 seconds, is single-use, and is not used for normal operations. The connector also prints a quick-connect URL containing a one-time `mcpPair` value in the hash fragment. The app scrubs MCP URL parameters before analytics initialization and before pageview capture.

The older manual token remains as an Advanced fallback. If `ALGOGLYPH_CONNECTOR_TOKEN` is set, the connector accepts it for manual connection. Otherwise it creates a process-local fallback token and prints it to the terminal.

## Endpoints

Public discovery and pairing endpoints, restricted by trusted browser origin where CORS applies:

- `GET /health`: reports connector availability. No secrets, workspace data, filesystem data, MCP tool results, or user data.
- `GET /v1/health`: compatibility alias for health.
- `POST /v1/pairings`: creates a short-lived one-time pairing credential.
- `POST /v1/session`: redeems a pairing credential and returns a connector session token.

Authenticated endpoints:

- `GET /v1/catalog`: detects allowed local agent CLIs using fixed `--version` commands.
- `POST /v1/mcp/test`: tests an HTTPS Streamable HTTP MCP endpoint and falls back to legacy SSE.
- `POST /v1/agents/run`: runs one allowlisted local CLI prompt and streams stdout/stderr over SSE.
- `POST /v1/session/revoke`: revokes the current connector session token.

## Browser security

Allowed CORS origins are explicit:

- `https://algoglyph.com`
- `https://www.algoglyph.com`
- `https://algoglyph.pages.dev`
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- any extra origins in `ALGOGLYPH_ALLOWED_ORIGINS`
- the origin of `ALGOGLYPH_APP_URL`

Authenticated endpoints do not use `Access-Control-Allow-Origin: *`. Private Network Access preflights are answered with `Access-Control-Allow-Private-Network: true` only for allowed origins.

There is currently no site-wide CSP in `public/_headers`; therefore no `connect-src` rule blocks loopback connector requests. If a CSP is added later, it must include `http://127.0.0.1:4319` and any configured loopback connector port.

## Future npm package

A local package is prepared at `packages/mcp-connector`, but nothing is published yet. The public package should expose this bin:

```bash
npx @algoglyph/mcp-connector
```

Before publishing, run `npm pack --dry-run` in `packages/mcp-connector` and confirm the tarball contains only `package.json`, `README.md`, and `bin/algoglyph-mcp-connector.mjs`. The package defaults `ALGOGLYPH_APP_URL` to `https://algoglyph.com`; the repository development shim keeps `npm run mcp:connector` pointed at local Vite.
