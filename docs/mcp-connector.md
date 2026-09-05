# AlgoGlyph MCP connector

AlgoGlyph now has two free MCP surfaces. This document primarily describes the local loopback connector, which lets the browser drive a user-owned CLI agent. Authenticated cloud workspaces can additionally issue a one-time-displayed, workspace-scoped bearer token for the deployed `/v1/mcp` Streamable HTTP endpoint. Only the token hash is stored, every tool call rechecks active workspace membership, and read/write scopes are independent of subscriptions and `managedAgentAccess`.

## Release and compatibility status

The browser workspace, repository connector, and npm package `@algoglyph/mcp-connector@0.2.6` implement protocol v2. No repository test or validation command publishes the package.

The browser and connector exchange a numeric protocol version in `/health` and fail closed on a mismatch. Package release validation also requires the package version, runtime version, browser protocol, and connector protocol to agree.

Version 0.2.6 starts Antigravity only for an authorized request and restores the normal one-shot Agy profile on macOS. It includes the 0.2.5 production CLI-discovery fix, the 0.2.3 cross-platform Codex, Claude Code, and Antigravity execution pipeline, the 0.2.2 supply-chain packaging controls, and the earlier security and reliability hardening.

```text
AlgoGlyph browser/app
        |
        | exact-origin CORS + scoped bearer session
        v
127.0.0.1 connector
        |-- fixed local agent adapters --> isolated Codex / Claude / Antigravity run
        `-- approved HTTPS/loopback URL --> one explicitly selected MCP server
```

The connector is a same-user loopback service. It must never be bound to or forwarded through a LAN address, public interface, tunnel, proxy, or container-published port.

## Starting and automatic pairing

Public package:

```bash
npx --yes @algoglyph/mcp-connector@0.2.6
```

Repository checkout:

```bash
npm run mcp:connector
```

Starting the command is the complete normal connection flow. While it remains running, the workspace polls `http://127.0.0.1:4319` and pairs automatically. The connector does not print a credential or connection URL, and the user does not click a link or copy a token.

Automatic discovery checks only the default endpoint. If `ALGOGLYPH_CONNECTOR_PORT` is set, the user must enter the matching `http://127.0.0.1:<port>` endpoint in **MCP > Advanced**. Custom-port discovery is intentionally not attempted.

### Pairing sequence

1. The browser requests `/health` and verifies service identity and protocol v2.
2. A trusted browser origin requests a one-time credential with `POST /v1/pairings`.
3. The connector binds the credential to that exact origin, requested capability scopes, and a 90-second expiry.
4. The same origin redeems it once at `POST /v1/session`.
5. The credential is destroyed and the returned session token is stored only in that tab's `sessionStorage`.
6. Authenticated requests carry `Authorization: Bearer <session token>` and are checked for the required endpoint scope.
7. Disconnect uses `POST /v1/session/revoke`, clears browser state, terminates owned work, and destroys owned MCP approvals/warm state.

Pairing issuance and redemption are separately rate-limited. Credentials are random, single-use, origin-bound, time-limited, and never valid as normal operation tokens. Sessions have an absolute eight-hour lifetime, a 30-minute inactivity timeout, a bounded process-wide count, least-recently-used eviction, and explicit revocation. Expiry/eviction uses the same cleanup path as manual revocation.

`ALGOGLYPH_CONNECTOR_TOKEN` is an advanced manual fallback, not part of automatic pairing. It must contain at least 32 bytes of unpredictable secret material and is never printed.

## Origin, Host, and browser controls

The production origin allowlist is exactly:

- `https://algoglyph.com`
- `https://www.algoglyph.com`
- `app://algoglyph`

Development access is disabled by default. `ALGOGLYPH_DEV_ORIGINS=1` adds exactly:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

The public preview is deliberately separate. `ALGOGLYPH_PREVIEW_ORIGINS=1` explicitly adds `https://algoglyph.pages.dev`; the repository `mcp:connector` command enables only the two localhost development origins.

`ALGOGLYPH_ALLOWED_ORIGINS` is an advanced comma-separated extension. Each entry is normalized to an origin. Configuring one delegates browser access to that origin, so it must not be populated from untrusted input.

The connector rejects unrecognized `Origin` values and rejects Host headers that do not match the configured loopback host and port. Authenticated routes never use wildcard CORS. Private Network Access permission is emitted only for an allowed origin. Security headers disable caching, framing, MIME sniffing, referrer leakage, and unnecessary browser capabilities. Web deployments must include the exact loopback connector endpoint in CSP `connect-src`; the packaged Electron app uses its trusted custom origin.

## Agent execution

The browser selects only a stable agent ID and supplies a bounded prompt. The connector owns the executable name and fixed argument vector:

- Codex normally uses one owner-bound app-server stdio worker. Every request creates a fresh ephemeral thread with `approvalPolicy: never`, then unsubscribes it after completion; no conversational history is shared. The connector-owned deny-root profile still disables shell/unified-exec, apps, web search, hooks, subagents, remote plugins, and skill installation. If app-server compatibility fails before turn dispatch, the existing isolated `codex exec --ephemeral` adapter is used.
- Claude Code runs in print mode with every built-in tool disabled, non-interactive `dontAsk` permission mode, and session persistence disabled. An explicitly attached MCP server enables only its exact fully qualified tool names for that run; the prompt arrives over stdin.
- Antigravity runs sandboxed in output-only mode. macOS uses one-shot execution with slash commands disabled and starts only for an authorized request. Other supported platforms may retain a connector-owned session with only the reset command available between requests.

On macOS, Antigravity retains its normal user profile because that is part of the native CLI's supported authentication model. The connector never starts Agy during connector startup and never rewrites the user's shared Agy configuration. Windows keeps its existing isolated-session behavior.

Where Antigravity supports an isolated profile, its connector-owned relay is written only inside that home at `.gemini/config/mcp_config.json`, using the current `serverUrl` schema. Its isolated CLI settings allow exactly `mcp(algoglyph_approved/*)` when that relay is attached, so headless use works without granting global MCP, command, file, or browser permissions. On macOS, connector-scoped MCP attachment fails closed because Agy does not provide a supported per-run settings root; the connector does not merge or modify the shared profile. A narrowly identified Antigravity account-eligibility rejection may cause one retry only when no transcript event proves the prompt was accepted; other failures are never automatically resubmitted.

The HTTP API cannot supply a command, executable path, shell fragment, argument array, working directory, environment override, config path, or credential path. Unknown fields and unknown agent IDs are rejected. Child processes are started without a shell from a canonical, allowlisted executable path.

The shared resolver is capability-based rather than shell-based. It tries absolute PATH entries, the running connector's trusted Node directory, package-manager environment hints, and standard Windows/macOS per-user bin roots. Native `.exe`/Mach-O-style executables run directly. Validated Windows Node `.cmd` shims and executable macOS Node launchers are reduced to their canonical JavaScript entry and executed with the connector's trusted Node binary. Relative PATH entries, project-local binaries, `node_modules/.bin`, malformed shims, and arbitrary shell wrappers are rejected. A candidate that cannot pass the isolated `--version` probe does not mask a valid later candidate. No `where`, `which`, login shell, PowerShell, `cmd.exe`, bash, or zsh discovery is used.

For an unusual installation, `ALGOGLYPH_CODEX_PATH`, `ALGOGLYPH_ANTIGRAVITY_PATH`, or `ALGOGLYPH_CLAUDE_PATH` may name an absolute executable/shim. These overrides still go through canonical-path, file-type, and shim validation and never enable shell execution.

Every run receives:

- an empty connector-created working directory;
- a private temporary home and agent configuration root where the CLI supports profile isolation;
- a scrubbed environment with only the selected adapter's required profile values retained;
- only the selected adapter's reviewed provider-auth variables/files;
- private copied credential/config permissions and source-link/containment checks;
- prompt, output, time, concurrency, and response limits;
- cancellation handling, graceful termination, and forced descendant process-tree cleanup;
- removal of temporary state on success, error, cancellation, timeout, revocation, and shutdown.

For a warm Codex worker, the private directory lives for that owner/configuration lifetime rather than one request. Credential fingerprints, owner identity, executable identity, and approved-MCP identity are part of the worker key. A change to any of them terminates the process tree and deletes the directory before replacement. Each request still receives an independent in-memory ephemeral thread, bounded output/deadline handling, and `turn/interrupt` cancellation. No fallback is attempted after a model turn has been dispatched.

Claude Code uses an owner-bound stream-json worker. Every reused request first sends `/clear` and must receive a new Claude session identifier; otherwise the connector discards the worker. Owner, executable, credential, or approved-MCP changes also replace the worker, and cancellation or protocol failures terminate it.

Prompts are data, never arguments that can become flags or shell syntax. Terminal control bytes are removed before warm PTY submission, and bracketed paste prevents prompt text from becoming interactive keystrokes.

### Persistent Antigravity reuse

Persistent reuse is limited to platforms where Antigravity supports the connector's isolated profile. macOS uses a fresh one-shot print-mode process instead. Persistent reuse is not global conversation reuse:

- A runtime has one owning connector session and one approved-MCP identity.
- A runtime cannot move to another browser session, token, user context, or MCP configuration.
- The connector clears and confirms a clean conversation boundary before a subsequent request. If reset cannot be confirmed, it destroys and recreates the process.
- Revocation, expiry/eviction, MCP configuration change, cancellation failure, unexpected exit, and connector shutdown terminate the process tree and delete its temporary home/workspace.
- Prompt/output buffers are bounded, and normal logs do not record prompt or model output.
- Transcript candidates are ranked deterministically and must be both absent from the pre-request snapshot and timestamped after the current submission; stale conversation output cannot satisfy a later request.

The private temporary home may retain provider/account/model caches needed by the same owned warm process. Therefore warm reuse is an optimization inside the connector's trusted same-user boundary, not a multi-user sandbox. A compromised same-OS-user process may still inspect or interfere with another local process. Restarting the connector is the immediate way to discard all warm memory.

## External MCP flow is opt-in per operation

Ordinary drawings and notes never inherit an MCP server merely because the user tested it earlier.

1. `POST /v1/mcp/test` validates the endpoint and returns bounded server/tool/resource/prompt metadata plus an opaque server ID.
2. That ID is bound to the authorizing connector session, expires after 30 minutes, and is one of at most four approvals owned by that session.
3. `POST /v1/mcp/invoke` requires the ID, an advertised tool name, bounded JSON arguments, and `confirmed: true` after the UI preview.
4. `POST /v1/agents/run` receives external MCP configuration only when that exact run explicitly includes the session-owned ID.
5. Merely saving/testing an endpoint never changes later agent behavior. There is no implicit global or store-level fallback.

MCP access tokens stay in connector memory/private per-run configuration and are redacted from errors. They are removed when approval/session lifetime ends and are never returned by `/health`, `/v1/catalog`, or approval summaries.

### SSRF and remote-response boundary

- Non-loopback MCP servers require HTTPS; URL credentials and fragments are rejected.
- Loopback HTTP requires the UI's explicit private-network opt-in, and the endpoint hostname itself must explicitly be `localhost` or a loopback literal; a public hostname cannot opt into resolving or redirecting to loopback.
- DNS is resolved and pinned for the connection, with every resolved address validated.
- Private, loopback (without opt-in), link-local, multicast, unspecified, reserved/documentation, and cloud-metadata destinations are rejected for IPv4 and IPv6.
- Redirect count is bounded; each redirect URL and DNS result is revalidated. Authorization is never forwarded across origins.
- MCP request/response bytes, fetch duration, pages, item counts, approval metadata, and JSON structure are bounded.
- Streamable HTTP is attempted first with legacy SSE fallback; both use the same destination checks and limits.

## HTTP and input hardening

Only documented methods and normalized paths are accepted. JSON endpoints require the expected media type, a bounded body, a plain-object root, endpoint-specific allowlisted fields, bounded depth/keys/arrays/strings, and rejection of prototype-pollution keys. IDs, URLs, names, booleans, modes, scopes, prompts, and optional development trace IDs are independently validated.

The HTTP server applies header count/size, headers timeout, request timeout, keep-alive, and requests-per-socket limits. Expensive catalog, MCP test/invoke, and agent-run endpoints are session/rate limited; agent concurrency is separately bounded. Error responses are generic and length-limited and include neither stack traces nor secrets.

## Endpoint and capability map

| Endpoint | Authentication | Capability / note |
| --- | --- | --- |
| `GET /health`, `GET /v1/health` | Public loopback discovery | Fixed service/version/protocol/availability data only. |
| `POST /v1/pairings` | Trusted browser origin | Rate-limited one-time credential issuance. |
| `POST /v1/session` | Matching origin + one-time credential | Rate-limited single redemption. |
| `GET /v1/catalog` | Bearer | `catalog:read`; fixed version probes only. |
| `POST /v1/mcp/test` | Bearer | `mcp:test`; guarded endpoint inspection and approval. |
| `POST /v1/mcp/invoke` | Bearer | `mcp:invoke`; exact approved tool plus confirmation. |
| `POST /v1/agents/run` | Bearer | `agent:run`; one allowlisted adapter, SSE output. |
| `POST /v1/session/revoke` | Bearer | `session:revoke`; cascaded owned-resource cleanup. |

Agent runs stream by default. `outputMode: "buffered"` is an additive option that coalesces stdout/stderr for diagram generation while preserving output limits and exit/error reporting.

## Configuration

| Variable | Default | Security effect |
| --- | --- | --- |
| `ALGOGLYPH_CONNECTOR_PORT` | `4319` | Accepts 1024-65535 and still binds to `127.0.0.1`; custom ports require matching Advanced UI configuration. |
| `ALGOGLYPH_DEV_ORIGINS` | off | Value `1` enables only the two enumerated localhost development origins. |
| `ALGOGLYPH_PREVIEW_ORIGINS` | off | Value `1` explicitly trusts the public `https://algoglyph.pages.dev` preview origin. |
| `ALGOGLYPH_ALLOWED_ORIGINS` | empty | Explicitly delegates browser access to additional exact origins. |
| `ALGOGLYPH_CONNECTOR_TOKEN` | random in-memory fallback | Optional manual bearer; minimum 32 bytes, never printed. |

Test-only environment overrides are accepted only when `NODE_ENV=test`; production ignores them.

## Dependency and package surface

The release candidate pins its seven direct runtime dependencies exactly:

- `@modelcontextprotocol/client@2.0.0`
- `@modelcontextprotocol/node@2.0.0`
- `@modelcontextprotocol/server@2.0.0`
- `@xterm/headless@6.0.0`
- `hono@4.13.1`
- `node-pty@1.2.0-beta.15`
- `undici@7.29.0`

The package requires Node `>=20.18.1`, matching the reviewed `undici` engine floor. `node-pty` is the only direct native-code dependency and is used for the warm Antigravity terminal. Its reviewed install step selects the platform artifact included in the package and falls back to `node-gyp` compilation when necessary. The AlgoGlyph package manifest contains no lifecycle scripts.

The audited 21-package production tree is fixed in a source-only `packages/mcp-connector/package-lock.json`, down from 98 packages with the monolithic MCP SDK. npm excludes that review lock from the published dependency package, avoiding Socket's high-severity shrinkwrap heuristic. Release validation rejects a lock that is missing or out of sync, requires every reviewed dependency to have npm-registry integrity metadata, compares a clean packed install with the reviewed package identities, and audits the installed artifact. Integration coverage also connects the modular v2 relay to a legacy v1 MCP client and upstream server.

Only these files may enter the tarball:

- `package.json`
- `LICENSE`
- `NOTICE`
- `README.md`
- `bin/algoglyph-mcp-connector.js`
- `bin/algoglyph-mcp-connector.mjs`

Repository tests, fixtures, `.env` files, logs, credentials, workspaces, build output, and unrelated application sources are excluded by the manifest allowlist.

## Release checks (never publish)

```bash
npm run test:mcp
npm run test:mcp:package
npm run test:mcp:package -- --install-smoke
npm run lint:mcp
npm --prefix packages/mcp-connector audit --omit=dev
npm run build
```

The package validator runs `npm pack --dry-run --json`, checks exact inventory, reviewed dependencies, the 21-package ceiling, npm-registry integrity pins, the single expected transitive install-script package (`node-pty`), and source-lock synchronization, rejects package scripts/secret-like content, and verifies package/runtime/browser protocol synchronization. `--install-smoke` packs into a temporary directory, performs a clean install, compares the resolved production identities with the source review lock, verifies registry signatures, runs an isolated production dependency audit, starts the generated installed bin shim on an ephemeral loopback port, checks health/version/protocol plus the native PTY path, terminates it, and deletes the temporary directory.

Publishing is a separate maintainer action and is intentionally absent from scripts. The MCP connector package is licensed under Apache-2.0; the license grant is scoped to `packages/mcp-connector` and does not relicense the rest of the repository.

## Production publishing

`.github/workflows/publish-mcp.yml` is a manual, `main`-branch-only release gate. Configure the npm trusted publisher for GitHub organization `Algoglyph`, repository `Algoglyph`, and workflow `publish-mcp.yml`, with `npm publish` permission. Its verification job has no OIDC permission: it verifies the requested version, runs the integration/security suite and packed-artifact smoke test, lints the MCP release surface, and builds. Only after that succeeds does a separate minimal job receive a short-lived OIDC credential, check out the same commit, install the exact npm client with lifecycle scripts disabled, recheck the version, and publish. It does not consume or store an npm automation token.

After authenticating the maintainer locally with `npm login`, the equivalent pinned CLI setup is:

```bash
npm exec --yes --package=npm@11.19.0 -- npm trust github @algoglyph/mcp-connector --file publish-mcp.yml --repo Algoglyph/Algoglyph --allow-publish --yes
```

The GitHub repository is currently private. npm trusted publishing still works for a public package from a private repository, but npm cannot issue a public provenance attestation until the source repository is public. Do not make the repository public solely as an automated release step; that is a separate owner decision.

## Residual risks

- Same-user compromise: loopback, temp permissions, and process isolation do not defend against a hostile process with the same or greater OS privileges. Origin/CORS blocks drive-by websites, but native software can forge `Origin`; retaining no-link automatic pairing means same-user native processes remain inside the trust boundary unless a future OS-protected IPC or signed browser bootstrap is introduced.
- Upstream agents/providers: prompts and generated data leave AlgoGlyph for the selected local CLI/provider according to that product's policies.
- Approved MCP servers: an explicitly approved server/tool is external code and data; confirmation and schemas reduce but do not remove semantic risk.
- Native dependency supply chain: `node-pty` expands installation and platform attack surface; exact pinning, audit, clean-install smoke testing, and minimal packaging reduce but cannot eliminate it.
- DNS/HTTP ecosystem: destination pinning and redirect checks address common SSRF/rebinding paths, but the connector should continue receiving dependency and IP-classification reviews.
- Warm runtime correctness: isolation depends on successful ownership/reset checks; fail-closed destruction is required whenever those checks become uncertain.
