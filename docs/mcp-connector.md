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

Run the connector while AlgoGlyph is open. The workspace polls localhost and pairs automatically as soon as the connector is available. There is no connection link to open and no token to copy. The resulting connector session token is stored in `sessionStorage` for the current browser tab/session.

Normal users should not need to paste a URL, port, token, or session ID.

## Pairing model

Automatic pairing uses a separate one-time credential:

1. The trusted AlgoGlyph app discovers the loopback connector.
2. The browser requests a short-lived pairing credential directly from the connector.
3. The browser redeems the credential once with `POST /v1/session`.
4. The connector invalidates the pairing credential immediately.
5. The browser uses the returned scoped session token for authenticated MCP operations.
6. Disconnect calls `POST /v1/session/revoke` and clears the browser-side token.

The pairing credential is cryptographically random, expires after 90 seconds, is single-use, and is not used for normal operations. `POST /v1/pairings` is available only to trusted browser origins under the connector's CORS policy and is rate limited. Legacy MCP URL parameters are scrubbed and ignored.

Sessions are capability-scoped, expire after 8 hours or 30 minutes of inactivity, and are pruned automatically. The connector keeps at most 8 sessions and evicts the least recently used one when a newly approved session exceeds that limit. Pairing issuance and redemption are rate limited.

An explicitly configured `ALGOGLYPH_CONNECTOR_TOKEN` remains available as an advanced fallback. Random process secrets are never printed.

## Endpoints

Public discovery and pairing endpoints, restricted by trusted browser origin where CORS applies:

- `GET /health`: reports connector availability. No secrets, workspace data, filesystem data, MCP tool results, or user data.
- `GET /v1/health`: compatibility alias for health.
- `POST /v1/pairings`: creates a short-lived, one-time pairing credential for automatic connection.
- `POST /v1/session`: redeems a pairing credential and returns a connector session token.

Authenticated endpoints:

- `GET /v1/catalog`: detects allowed local agent CLIs using fixed `--version` commands.
- `POST /v1/mcp/test`: validates and inspects an HTTPS MCP endpoint (or an explicitly approved loopback endpoint), returning paginated tool/resource/prompt metadata and a session-bound server ID.
- `POST /v1/mcp/invoke`: invokes a tool from an approved server after the app previews exact arguments and records explicit confirmation.
- `POST /v1/agents/run`: runs one allowlisted local CLI prompt over SSE. The optional additive `outputMode: "buffered"` coalesces process chunks for callers, such as diagram generation, that only consume the completed result; streaming remains the default.
- `POST /v1/session/revoke`: revokes the current connector session token.

## Browser security

Allowed CORS origins are explicit:

- `https://algoglyph.com`
- `https://www.algoglyph.com`
- `https://algoglyph.pages.dev`
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- any extra origins in `ALGOGLYPH_ALLOWED_ORIGINS`
- `app://algoglyph` for the packaged Electron workspace

Authenticated endpoints do not use `Access-Control-Allow-Origin: *`. Private Network Access preflights are answered with `Access-Control-Allow-Private-Network: true` only for allowed origins.

The packaged Electron workspace uses the trusted `app://algoglyph` origin and a restrictive response CSP. Any web-host CSP must keep the configured loopback connector in `connect-src`.

## Future npm package

The package exposes this bin:

```bash
npx @algoglyph/mcp-connector
```

Before publishing, run `npm pack --dry-run` in `packages/mcp-connector` and confirm the tarball contains exactly `package.json`, `README.md`, `bin/algoglyph-mcp-connector.js`, and `bin/algoglyph-mcp-connector.mjs`. The package is intentionally marked `UNLICENSED`; publishing it does not grant reuse rights.
