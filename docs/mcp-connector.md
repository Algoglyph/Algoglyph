# AlgoGlyph MCP connector

## Release and compatibility status

The browser workspace and repository connector implement protocol v2. The repository package is the `@algoglyph/mcp-connector@0.2.0` release candidate; the npm registry still serves the older `0.1.0` package until a maintainer performs a separate, deliberate publish. No repository test or validation command publishes the package.

The browser and connector exchange a numeric protocol version in `/health` and fail closed on a mismatch. Package release validation also requires the package version, runtime version, browser protocol, and connector protocol to agree.

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
npx @algoglyph/mcp-connector
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

- `https://algoglyph.pages.dev`
- `http://localhost:5173`
- `http://127.0.0.1:5173`

`ALGOGLYPH_ALLOWED_ORIGINS` is an advanced comma-separated extension. Each entry is normalized to an origin. Configuring one delegates browser access to that origin, so it must not be populated from untrusted input.

The connector rejects unrecognized `Origin` values and rejects Host headers that do not match the configured loopback host and port. Authenticated routes never use wildcard CORS. Private Network Access permission is emitted only for an allowed origin. Security headers disable caching, framing, MIME sniffing, referrer leakage, and unnecessary browser capabilities. Web deployments must include the exact loopback connector endpoint in CSP `connect-src`; the packaged Electron app uses its trusted custom origin.

## Agent execution

The browser selects only a stable agent ID and supplies a bounded prompt. The connector owns the executable name and fixed argument vector:

- Codex runs ephemerally under a connector-owned deny-root filesystem permission profile. Shell/unified-exec, apps, web search, hooks, subagents, remote plugins, and skill installation are disabled; any tool-child environment inherits nothing and receives only runtime essentials. The prompt arrives over stdin after an option terminator.
- Claude Code runs in print mode with every built-in tool disabled, non-interactive `dontAsk` permission mode, and session persistence disabled. An explicitly attached MCP server enables only its exact fully qualified tool names for that run; the prompt arrives over stdin.
- Antigravity runs sandboxed in output-only mode. One-shot execution disables slash commands; warm execution retains only the connector-owned reset command.

The HTTP API cannot supply a command, executable path, shell fragment, argument array, working directory, environment override, config path, or credential path. Unknown fields and unknown agent IDs are rejected. Child processes are started without a shell from a canonical, allowlisted executable path.

Every run receives:

- an empty connector-created working directory;
- a private temporary home and agent configuration root;
- a minimal allowlisted environment instead of wholesale environment inheritance;
- only the selected adapter's reviewed provider-auth variables/files;
- private copied credential/config permissions and source-link/containment checks;
- prompt, output, time, concurrency, and response limits;
- cancellation handling, graceful termination, and forced descendant process-tree cleanup;
- removal of temporary state on success, error, cancellation, timeout, revocation, and shutdown.

Prompts are data, never arguments that can become flags or shell syntax. Terminal control bytes are removed before warm PTY submission, and bracketed paste prevents prompt text from becoming interactive keystrokes.

### Warm Antigravity reuse

Warm reuse exists only to avoid Antigravity startup latency. It is not global conversation reuse:

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
- Loopback HTTP requires the UI's explicit private-network opt-in.
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
| `ALGOGLYPH_DEV_ORIGINS` | off | Value `1` enables only the three enumerated development origins. |
| `ALGOGLYPH_ALLOWED_ORIGINS` | empty | Explicitly delegates browser access to additional exact origins. |
| `ALGOGLYPH_CONNECTOR_TOKEN` | random in-memory fallback | Optional manual bearer; minimum 32 bytes, never printed. |

Test-only environment overrides are accepted only when `NODE_ENV=test`; production ignores them.

## Dependency and package surface

The release candidate pins its four direct runtime dependencies exactly:

- `@modelcontextprotocol/sdk@1.30.0`
- `@xterm/headless@6.0.0`
- `node-pty@1.1.0`
- `undici@7.29.0`

The package requires Node `>=20.18.1`, matching the reviewed `undici` engine floor. `node-pty` is the only direct native-code dependency and is used for the warm Antigravity terminal. It may run its own dependency install/build step. The AlgoGlyph package manifest contains no lifecycle scripts.

Because the connector is an installed command/daemon rather than a reusable library, its audited transitive dependency tree is also fixed in a publishable `npm-shrinkwrap.json`. Release validation rejects a lock that is missing or out of sync and audits a clean install of the packed artifact.

Only these files may enter the tarball:

- `package.json`
- `README.md`
- `bin/algoglyph-mcp-connector.js`
- `bin/algoglyph-mcp-connector.mjs`
- `npm-shrinkwrap.json`

Repository tests, fixtures, `.env` files, logs, credentials, workspaces, build output, and unrelated application sources are excluded by the manifest allowlist.

## Release checks (never publish)

```bash
npm run test:mcp
npm run test:mcp:package
npm run test:mcp:package -- --install-smoke
npm --prefix packages/mcp-connector audit --omit=dev
npm run build
```

The package validator runs `npm pack --dry-run --json`, checks exact inventory, reviewed dependencies, and shrinkwrap synchronization, rejects package scripts/secret-like content, and verifies package/runtime/browser protocol synchronization. `--install-smoke` packs into a temporary directory, performs a clean install plus an isolated production dependency audit, starts the installed bin through npm on an ephemeral loopback port, checks health/version/protocol, terminates it, and deletes the temporary directory.

Publishing is a separate maintainer action and is intentionally absent from scripts. The package is `UNLICENSED`; registry availability does not grant permission to reuse its source.

## Residual risks

- Same-user compromise: loopback, temp permissions, and process isolation do not defend against a hostile process with the same or greater OS privileges. Origin/CORS blocks drive-by websites, but native software can forge `Origin`; retaining no-link automatic pairing means same-user native processes remain inside the trust boundary unless a future OS-protected IPC or signed browser bootstrap is introduced.
- Upstream agents/providers: prompts and generated data leave AlgoGlyph for the selected local CLI/provider according to that product's policies.
- Approved MCP servers: an explicitly approved server/tool is external code and data; confirmation and schemas reduce but do not remove semantic risk.
- Native dependency supply chain: `node-pty` expands installation and platform attack surface; exact pinning, audit, clean-install smoke testing, and minimal packaging reduce but cannot eliminate it.
- DNS/HTTP ecosystem: destination pinning and redirect checks address common SSRF/rebinding paths, but the connector should continue receiving dependency and IP-classification reviews.
- Warm runtime correctness: isolation depends on successful ownership/reset checks; fail-closed destruction is required whenever those checks become uncertain.
