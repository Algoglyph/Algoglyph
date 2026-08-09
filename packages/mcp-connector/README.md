# @algoglyph/mcp-connector

Local loopback connector for pairing [AlgoGlyph](https://algoglyph.com) with local AI agents and MCP servers.

## Install/run

```bash
npx @algoglyph/mcp-connector
```

The connector starts on:

```text
http://127.0.0.1:4319
```

It is intended to run on the user's own machine. `127.0.0.1` always means the browser user's computer, not AlgoGlyph's Cloudflare hosting.

## Security model

- Binds to `127.0.0.1` only.
- Does not expose an arbitrary shell endpoint.
- Does not expose arbitrary filesystem access.
- Discovery endpoint returns no secrets or workspace data.
- Pairing credentials are random, single-use, and expire after 90 seconds.
- Pairing is automatic for trusted AlgoGlyph browser origins after the connector starts.
- Starting the command is the entire connection flow; no link or copied token is required.
- Normal MCP/agent operations use a scoped session token that expires after 8 hours or 30 minutes of inactivity.
- At most 8 sessions are retained; creating another evicts the least recently used session.
- Session tokens can be revoked with the disconnect flow.
- CORS allows `https://algoglyph.com` and `https://www.algoglyph.com` by default.
- Local development origins are disabled unless `ALGOGLYPH_DEV_ORIGINS=1` is set.
- Host headers are restricted to the configured loopback listener.
- Remote MCP redirects and DNS results are revalidated; private, reserved, link-local, and metadata destinations are blocked unless exact loopback access is explicitly approved.
- Agent runs use temporary working directories, a minimal environment, resolved executable paths, output/time limits, and process-tree termination.

## Endpoints

Public:

- `GET /health`
- `GET /v1/health`
- `POST /v1/pairings`
- `POST /v1/session`

Authenticated:

- `GET /v1/catalog`
- `POST /v1/mcp/test`
- `POST /v1/mcp/invoke`
- `POST /v1/agents/run`
- `POST /v1/session/revoke`

Agent runs stream by default. Send `outputMode: "buffered"` to coalesce stdout/stderr into at most one event per stream when only the completed response is needed.

## Configuration

- `ALGOGLYPH_CONNECTOR_PORT`: port, default `4319`.
- `ALGOGLYPH_ALLOWED_ORIGINS`: comma-separated extra browser origins.
- `ALGOGLYPH_DEV_ORIGINS=1`: allow local dev origins and `algoglyph.pages.dev`.
- `ALGOGLYPH_CONNECTOR_TOKEN`: optional manual fallback token.

## Publishing checklist

Before publishing, run:

```bash
npm pack --dry-run
```

Inspect the file list. It should contain only:

- `package.json`
- `README.md`
- `bin/algoglyph-mcp-connector.mjs`
- `bin/algoglyph-mcp-connector.js`

Do not publish from a folder containing secrets, `.env` files, workspace data, or unrelated repo contents.

This package is intentionally marked `UNLICENSED`; source distribution does not grant reuse rights.
