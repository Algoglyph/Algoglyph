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
- Normal MCP/agent operations use a separate session token.
- Session tokens can be revoked with the disconnect flow.
- CORS allows `https://algoglyph.com` and `https://www.algoglyph.com` by default.
- Local development origins are disabled unless `ALGOGLYPH_DEV_ORIGINS=1` is set.

## Endpoints

Public:

- `GET /health`
- `GET /v1/health`
- `POST /v1/pairings`
- `POST /v1/session`

Authenticated:

- `GET /v1/catalog`
- `POST /v1/mcp/test`
- `POST /v1/agents/run`
- `POST /v1/session/revoke`

## Configuration

- `ALGOGLYPH_CONNECTOR_PORT`: port, default `4319`.
- `ALGOGLYPH_APP_URL`: app URL used in quick-connect links, default `https://algoglyph.com`.
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

Do not publish from a folder containing secrets, `.env` files, workspace data, or unrelated repo contents.