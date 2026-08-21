# @algoglyph/mcp-connector

The local loopback bridge between [AlgoGlyph](https://algoglyph.com), supported local AI CLIs, and user-approved MCP servers.

This package provides `0.2.6` / protocol v2. Running the release checks does not publish anything.

## 0.2.6 macOS Antigravity launch fix

- Starts Antigravity only after an authorized run request.
- Uses Agy's normal profile and one-shot print mode on macOS while preserving the existing Windows runtime path.
- Never rewrites the user's shared Agy configuration on macOS and fails closed for connector-scoped MCP attachment until Agy provides a supported per-run settings root.

## 0.2.5 production CLI discovery fix

- Detects normally installed per-user Codex, Claude Code, and Antigravity CLIs when the connector is started from the user's home directory.
- Keeps arbitrary project-local executables and every `node_modules/.bin` candidate blocked from implicit discovery.
- Preserves isolated version probes, shell-free execution, fixed agent adapters, and all protocol v2 security controls.
- Keeps the repository command and public NPX package on the same connector runtime so fixes cannot drift between them.

### 0.2.3 cross-platform agent update

- Supports native and npm-installed Codex, Claude Code, and Antigravity executables on macOS and Windows.
- Reuses owner-bound workers where the CLI supports safe profile isolation while clearing request context between runs.
- Lets Claude use its native OS-profile authentication while keeping its workspace and MCP configuration isolated, built-in tools disabled, and approved MCP tools strictly allowlisted.
- Keeps CLI warnings on diagnostic stderr out of executable-version labels and keeps warm-worker startup details out of normal connector output.
- Preserves the `0.2.2` supply-chain packaging controls and the `0.2.1` security and reliability changes below.

### Previous packaging and security changes

- Removes `npm-shrinkwrap.json` from the published artifact so package managers use their normal dependency-resolution procedure and Socket does not raise its shrinkwrap heuristic.
- Retains the exact reviewed 21-package tree in a source-only `package-lock.json`; release smoke tests compare a clean packed install with that review lock before publication.
- Declares the modular MCP Node transport's `hono@4.13.1` peer explicitly so clean installs cannot omit it.
- Applies one end-to-end deadline to MCP DNS resolution, transport fallback, calls, and bounded client shutdown.
- Rejects Antigravity transcript data that began before the current prompt, including stale partially written JSONL records.
- Uses monotonic clocks for credential lifetimes, rate limits, caches, waits, and retries, and escalates shutdown across the whole PTY process group.
- Uses the stable modular MCP SDK v2 client/server/Node packages, reducing the locked production tree from 98 packages to 21 while retaining a legacy-client relay compatibility test.
- Pins the official `node-pty@1.2.0-beta.15` package whose macOS spawn helper ships executable, and exercises that native path from the packed artifact.
- Adds a browser-side watchdog slightly beyond the connector's server-side agent deadline.

## Requirements

- Node.js 20.18.1 or newer.
- A supported local agent CLI for agent-backed notes or drawings: Antigravity, Codex, or Claude Code.
- A platform supported by the `node-pty` native dependency when using the warm Antigravity runtime.

`node-pty` is native code and its dependency install runs a reviewed selector for the platform artifact already carried in its package, falling back to `node-gyp` compilation when no compatible artifact exists. The AlgoGlyph package itself defines no `preinstall`, `install`, `postinstall`, `prepare`, or other npm scripts. On platforms without a compatible native artifact, normal compiler/build-tool requirements for `node-pty` apply.

## Start and connect

```bash
npx --yes @algoglyph/mcp-connector@0.2.6
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
- An owner-bound Codex app-server worker with a fresh ephemeral thread for every request and a safe one-shot fallback.
- An owner-bound Claude stream-json worker that clears and verifies its conversation boundary before every reused request.
- Shell-free CLI discovery across Windows native executables/npm `.cmd` shims and macOS native executables/Node launchers, including reduced-GUI PATH and standard package-manager environment hints.

The web app and connector reject incompatible protocol versions instead of silently attempting a partial connection.

## External MCP servers are explicit only

Testing an MCP endpoint creates a short-lived approval for the current connector session. It does **not** attach that server to later drawings, notes, or agent runs.

An external server is available to an agent only when that individual run explicitly includes the opaque server ID returned by the successful test. Direct tool invocation additionally requires the exact tool and arguments to be previewed and confirmed. Approvals disappear on expiry, session revocation/expiry, or connector shutdown. Access tokens are kept connector-side and are never returned in discovery or catalog responses.

Loopback HTTP MCP endpoints require the explicit private-network opt-in. Non-loopback MCP endpoints must use HTTPS. Redirect targets and every resolved address are checked again; local, private, link-local, reserved, multicast, and cloud-metadata destinations are rejected.

Where Antigravity supports an isolated profile, it uses the current `.gemini/config/mcp_config.json` `serverUrl` schema. For explicitly attached servers, its separate isolated CLI settings grant only `mcp(algoglyph_approved/*)`; no command, file, browser, or global MCP wildcard is enabled. A confirmed transient account-eligibility rejection may be retried once after the provider settle window, and only when no transcript event shows that the prompt was accepted. macOS Agy runs use the user's normal profile without rewriting shared settings, so a connector-scoped MCP relay is rejected there until Agy provides a supported per-run settings root.

## Security boundary

- The HTTP listener binds only to `127.0.0.1`; Host headers must match the configured loopback listener.
- Browser access uses an exact CORS allowlist. Production defaults are `https://algoglyph.com`, `https://www.algoglyph.com`, and the packaged app origin `app://algoglyph`.
- Development origins are **off by default**. `ALGOGLYPH_DEV_ORIGINS=1` adds exactly `http://localhost:5173` and `http://127.0.0.1:5173`.
- The public preview origin is separate: `ALGOGLYPH_PREVIEW_ORIGINS=1` explicitly adds `https://algoglyph.pages.dev`. The repository startup command does not trust that public origin by default.
- `ALGOGLYPH_ALLOWED_ORIGINS` is an advanced, explicit comma-separated extension to that allowlist. Adding an origin grants that origin access to this local connector and must be treated as a security decision.
- Pairing credentials are random, origin-bound, single-use, and expire after 90 seconds. Session tokens are random, capability-scoped, and kept in browser `sessionStorage`.
- Request bodies, JSON structure, prompts, remote responses, MCP pagination, output, concurrency, and execution time are bounded. Unknown or dangerous request fields are rejected.
- Browser data never chooses a command, executable, shell, argument vector, working directory, environment variable, or filesystem path. Processes are launched without a shell.
- Agent file credentials are copied only from reviewed locations into private temporary homes. Source paths are checked for links/escape, copied files are private, and temporary trees are removed after use. macOS Antigravity instead retains the normal user profile required by the native CLI and never rewrites its shared settings; Windows keeps the existing isolated-session behavior.
- Codex uses a connector-owned deny-root permission profile with command, app, web, hook, subagent, and plugin surfaces disabled. Tool-child processes inherit no credential environment; when private file credentials are available, duplicate API-key environment auth is removed from the Codex host too.
- Errors and normal logs do not include prompts, pairing/session tokens, MCP bearer tokens, copied credentials, or generated content.

This remains a same-user local integration, not a multi-user security boundary. Origin/CORS checks prevent drive-by websites, but a hostile native process can forge an HTTP `Origin` header; the no-link pairing flow therefore assumes other processes running as the same OS user are trusted. Stronger native-local consent would require an OS-protected IPC or signed bootstrap channel and a different setup flow. Do not expose the port through a proxy, port forward, container publish, tunnel, or `0.0.0.0`. A compromised process running as the same operating-system user may still attack local processes or their files. Local agent/provider CLIs and explicitly approved MCP servers also receive the data necessary to answer the request; review their own privacy and retention policies.

### Persistent Antigravity limitation

On platforms using persistent Antigravity sessions, reuse is restricted to one owning connector session and one approved-MCP identity. Every request starts a cleared conversation; if ownership or reset cannot be confirmed, the connector discards the runtime instead of reusing it. Revocation, expiry, cancellation failure, configuration change, and shutdown also destroy the owned process and temporary state. macOS uses an explicit one-shot print-mode run instead.

The warm runtime may retain Antigravity's provider/account caches inside that session's private temporary home. It is an optimization within a trusted same-user process, not a substitute for operating-system isolation. Restart the connector to discard all in-memory warm state immediately.

### Warm Codex app-server

When the installed Codex CLI supports its official app-server protocol, the connector initializes one private stdio worker per owning session and approved-MCP identity. Every diagram starts a new `ephemeral: true` thread with `approvalPolicy: never`, so requests do not share conversation history and no rollout is materialized on disk. Completed threads are unsubscribed and unloaded. Credential changes, owner changes, MCP changes, revocation, expiry, cancellation that cannot be confirmed, unexpected exit, and shutdown destroy the worker and its private home.

If app-server initialization or compatibility checks fail before a model turn is dispatched, the connector uses the existing isolated `codex exec --ephemeral` path. It never retries or falls back automatically after `turn/start`, because doing so could duplicate model or MCP side effects.

### Warm Claude stream worker

Claude Code runs through its stream-json protocol in an owner-bound process. Before every request after the first, the connector sends `/clear` and requires Claude to return a new session identifier; a failed reset destroys the worker instead of risking context reuse. Owner changes, MCP changes, revocation, expiry, cancellation, protocol errors, unexpected exit, and connector shutdown also destroy the process and its temporary state. Missing Claude installations are reported as unavailable without affecting the connector.

CLI discovery checks the inherited absolute PATH entries first, then the connector's trusted Node directory, explicit package-manager environment hints (`NVM_BIN`, `PNPM_HOME`, `VOLTA_HOME`, `FNM_MULTISHELL_PATH`, npm prefix, Bun, asdf, and mise), and standard per-user bin roots. It does not run `where`, `which`, a login shell, PowerShell, `cmd.exe`, bash, or zsh. Windows Node shims are parsed and resolved to a canonical JavaScript entry point that is run by the connector's own Node executable; macOS Node launchers are handled the same way instead of relying on a shebang lookup. Relative PATH entries, project-local binaries, malformed shims, unsupported shell wrappers, and `node_modules/.bin` candidates are rejected. If an earlier structural candidate fails its isolated `--version` probe, discovery continues to the next candidate.

Unusual installations can use the absolute per-agent overrides below. An override selects a path; it does not enable shell execution or relax executable/shim validation.

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
| `ALGOGLYPH_DEV_ORIGINS=1` | Enables only the two local development origins listed above. |
| `ALGOGLYPH_PREVIEW_ORIGINS=1` | Explicitly enables the public `https://algoglyph.pages.dev` preview origin. |
| `ALGOGLYPH_ALLOWED_ORIGINS` | Adds explicitly trusted, comma-separated browser origins. |
| `ALGOGLYPH_CONNECTOR_TOKEN` | Advanced manual bearer fallback. Use at least 32 bytes of unpredictable secret material. It is never printed. |
| `ALGOGLYPH_CODEX_PATH` | Optional absolute Codex native executable or validated Node-shim path. |
| `ALGOGLYPH_ANTIGRAVITY_PATH` | Optional absolute Antigravity native executable or validated Node-shim path. |
| `ALGOGLYPH_CLAUDE_PATH` | Optional absolute Claude native executable or validated Node-shim path. |

## Release validation

From the repository root:

```bash
npm run test:mcp:package
```

This checks version/protocol synchronization, exact reviewed dependency versions, the 21-package source review lock, registry/integrity pinning, the single expected transitive install-script package (`node-pty`), absence of package scripts and secret-like content, and an exact six-file tarball inventory:

- `LICENSE`
- `NOTICE`
- `package.json`
- `README.md`
- `bin/algoglyph-mcp-connector.js`
- `bin/algoglyph-mcp-connector.mjs`

The source-only `package-lock.json` is committed for review but is intentionally not published. To additionally create a temporary tarball, perform a clean install, compare its resolved package identities with that review lock, verify registry signatures, run an isolated production dependency audit (including the reviewed `node-pty` native install surface), launch the installed binary through its generated npm shim on an ephemeral loopback port, and exercise health plus the native PTY path:

```bash
npm run test:mcp:package -- --install-smoke
```

Both commands clean up their temporary artifacts and never publish.

## License

The AlgoGlyph MCP Connector is licensed under the [Apache License 2.0](LICENSE). Its `NOTICE` attribution must be retained when required by the license.
