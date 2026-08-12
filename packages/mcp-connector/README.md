# @algoglyph/mcp-connector

The local loopback bridge between [AlgoGlyph](https://algoglyph.com), supported local AI CLIs, and user-approved MCP servers.

This repository contains the `0.2.0` / protocol-v2 release candidate. Until that candidate is deliberately published, the npm registry's `latest` tag remains on the older `0.1.0` connector. Running the release checks does not publish anything.

## Requirements

- Node.js 20.18.1 or newer.
- A supported local agent CLI for agent-backed notes or drawings: Antigravity, Codex, or Claude Code.
- A platform supported by the `node-pty` native dependency when using the warm Antigravity runtime.

`node-pty` is native code and its dependency install may run a native install/build step. The AlgoGlyph package itself defines no `preinstall`, `install`, `postinstall`, `prepare`, or other npm scripts. On platforms without a compatible native artifact, normal compiler/build-tool requirements for `node-pty` apply.

## Start and connect

```bash
npx @algoglyph/mcp-connector
```

Keep the command running and open AlgoGlyph. The browser discovers `http://127.0.0.1:4319`, obtains a short-lived one-time pairing credential, and redeems it automatically. There is no connection link to open and no token to copy.

The default port is part of automatic discovery. If `ALGOGLYPH_CONNECTOR_PORT` changes it, the same loopback URL and port must also be entered in AlgoGlyph's **MCP > Advanced** configuration. A custom port is not discovered automatically.

## What protocol v2 provides

- Automatic, origin-bound, single-use pairing followed by scoped sessions.
- Session expiry, inactivity expiry, revocation, bounded session counts, and endpoint rate limits.
- Allowlisted local agents with fixed executable arguments, isolated temporary workspaces, minimal environments, bounded prompts/output, cancellation, and process-tree cleanup.
- Streamable HTTP MCP inspection with SSE fallback, bounded pagination/results, DNS and redirect revalidation, and SSRF protections.
- Session-bound, expiring MCP approvals and confirmation-gated tool invocation.
- A warm Antigravity runtime whose owner and approved MCP configuration are isolated from other connector sessions.

The web app and connector reject incompatible protocol versions instead of silently attempting a partial connection.

## External MCP servers are explicit only

Testing an MCP endpoint creates a short-lived approval for the current connector session. It does **not** attach that server to later drawings, notes, or agent runs.

An external server is available to an agent only when that individual run explicitly includes the opaque server ID returned by the successful test. Direct tool invocation additionally requires the exact tool and arguments to be previewed and confirmed. Approvals disappear on expiry, session revocation/expiry, or connector shutdown. Access tokens are kept connector-side and are never returned in discovery or catalog responses.

Loopback HTTP MCP endpoints require the explicit private-network opt-in. Non-loopback MCP endpoints must use HTTPS. Redirect targets and every resolved address are checked again; local, private, link-local, reserved, multicast, and cloud-metadata destinations are rejected.

## Security boundary

- The HTTP listener binds only to `127.0.0.1`; Host headers must match the configured loopback listener.
- Browser access uses an exact CORS allowlist. Production defaults are `https://algoglyph.com`, `https://www.algoglyph.com`, and the packaged app origin `app://algoglyph`.
- Development origins are **off by default**. `ALGOGLYPH_DEV_ORIGINS=1` adds exactly `https://algoglyph.pages.dev`, `http://localhost:5173`, and `http://127.0.0.1:5173`.
- `ALGOGLYPH_ALLOWED_ORIGINS` is an advanced, explicit comma-separated extension to that allowlist. Adding an origin grants that origin access to this local connector and must be treated as a security decision.
- Pairing credentials are random, origin-bound, single-use, and expire after 90 seconds. Session tokens are random, capability-scoped, and kept in browser `sessionStorage`.
- Request bodies, JSON structure, prompts, remote responses, MCP pagination, output, concurrency, and execution time are bounded. Unknown or dangerous request fields are rejected.
- Browser data never chooses a command, executable, shell, argument vector, working directory, environment variable, or filesystem path. Processes are launched without a shell.
- Agent credentials are copied only from reviewed locations into private temporary homes. Source paths are checked for links/escape, copied files are private, and temporary trees are removed after use.
- Codex uses a connector-owned deny-root permission profile with command, app, web, hook, subagent, and plugin surfaces disabled. Tool-child processes inherit no credential environment; when private file credentials are available, duplicate API-key environment auth is removed from the Codex host too.
- Errors and normal logs do not include prompts, pairing/session tokens, MCP bearer tokens, copied credentials, or generated content.

This remains a same-user local integration, not a multi-user security boundary. Origin/CORS checks prevent drive-by websites, but a hostile native process can forge an HTTP `Origin` header; the no-link pairing flow therefore assumes other processes running as the same OS user are trusted. Stronger native-local consent would require an OS-protected IPC or signed bootstrap channel and a different setup flow. Do not expose the port through a proxy, port forward, container publish, tunnel, or `0.0.0.0`. A compromised process running as the same operating-system user may still attack local processes or their files. Local agent/provider CLIs and explicitly approved MCP servers also receive the data necessary to answer the request; review their own privacy and retention policies.

### Warm Antigravity limitation

Warm reuse avoids repeated CLI initialization, but reuse is restricted to one owning connector session and one approved-MCP identity. Every request starts a cleared conversation; if ownership or reset cannot be confirmed, the connector discards the runtime instead of reusing it. Revocation, expiry, cancellation failure, configuration change, and shutdown also destroy the owned process and temporary state.

The warm runtime may retain Antigravity's provider/account caches inside that session's private temporary home. It is an optimization within a trusted same-user process, not a substitute for operating-system isolation. Restart the connector to discard all in-memory warm state immediately.

## Endpoints

Public only for loopback discovery or trusted-origin pairing:

- `GET /health`
- `GET /v1/health`
- `POST /v1/pairings`
- `POST /v1/session`

Bearer-authenticated and capability-scoped:

- `GET /v1/catalog`
- `POST /v1/mcp/test`
- `POST /v1/mcp/invoke`
- `POST /v1/agents/run`
- `POST /v1/session/revoke`

Agent output streams by default. `outputMode: "buffered"` coalesces output when the caller only needs the completed response.

## Configuration

| Variable | Purpose |
| --- | --- |
| `ALGOGLYPH_CONNECTOR_PORT` | Loopback port from 1024 through 65535; default `4319`. Configure the same URL in AlgoGlyph Advanced settings. |
| `ALGOGLYPH_DEV_ORIGINS=1` | Enables only the three development origins listed above. |
| `ALGOGLYPH_ALLOWED_ORIGINS` | Adds explicitly trusted, comma-separated browser origins. |
| `ALGOGLYPH_CONNECTOR_TOKEN` | Advanced manual bearer fallback. Use at least 32 bytes of unpredictable secret material. It is never printed. |

## Release validation

From the repository root:

```bash
npm run test:mcp:package
```

This checks version/protocol synchronization, exact reviewed dependency versions, the publishable transitive lock, absence of package scripts and secret-like content, and an exact five-file tarball inventory:

- `package.json`
- `README.md`
- `bin/algoglyph-mcp-connector.js`
- `bin/algoglyph-mcp-connector.mjs`
- `npm-shrinkwrap.json`

To additionally create a temporary tarball, perform a clean install and isolated production dependency audit (including the reviewed `node-pty` native install surface), launch the installed binary through npm on an ephemeral loopback port, and verify health:

```bash
npm run test:mcp:package -- --install-smoke
```

Both commands clean up their temporary artifacts and never publish. The package is intentionally `UNLICENSED`; public distribution does not grant reuse rights.
