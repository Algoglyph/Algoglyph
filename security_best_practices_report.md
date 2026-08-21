# Security Best-Practices Audit

Audit date: 2026-08-21  
Branch: main  
Reviewer scope: the web application’s malicious/shared-file handling and the exact published @algoglyph/mcp-connector@0.2.5 artifact. Electron is explicitly out of scope.

## Executive summary

No critical vulnerability was confirmed. The connector has a strong low-level security baseline: loopback-only binding and Host validation, origin-bound sessions, bounded input/output, DNS-pinned outbound MCP requests, private-network blocking, fixed agent commands, environment scrubbing, project-local executable rejection, and isolated credentials where the installed CLI supports profile isolation.

The highest-risk issue is architectural rather than a command-injection bug: any JavaScript executing under the trusted production web origin can automatically obtain all connector session scopes. The production workspace also loads a remote Google Tag Manager script and deploys no Content-Security-Policy. A production-origin XSS, compromised deployment, or third-party script compromise would therefore cross the browser-to-loopback boundary and gain agent-run and MCP capabilities. The fixed adapters materially limit impact, but origin trust alone is not adequate user authorization for a local privileged bridge.

The shared-file review also found unbounded workspace/Markdown/PDF imports, weak workspace schema validation, and an unsandboxed PDF iframe that accepts imported source URLs and preserves a file-provided Blob MIME type. These are realistic user-assisted availability, tracking, UI-spoofing, and conditional same-origin content risks.

## Scope and verification

- The npm tarball for @algoglyph/mcp-connector@0.2.5 was downloaded and extracted only under /private/tmp.
- Tarball SHA-256: 837584fa9bc8d295f030b2094d056a0085200b1a3010732d4b9a5f99ce909aa1.
- The published connector runtime and CLI resolver were byte-for-byte identical to packages/mcp-connector/bin/algoglyph-mcp-connector.mjs and packages/mcp-connector/bin/cli-runtime.mjs.
- A clean, script-disabled dependency resolution of the exact tarball produced 22 total package entries and npm audit --omit=dev reported zero known vulnerabilities.
- The repository’s locked web production tree reported 14 advisory-affected dependency nodes: 4 high and 10 moderate. Reachability is discussed separately below.
- The real production Antigravity CLI was not started during this audit.
- Secret review was limited to tracked repository files and did not identify a committed private-key/token signature.

Validation completed:

- npm run test:mcp: 53 passed, 0 failed, 1 platform-conditional Windows test skipped on macOS.
- npm run lint:mcp: passed.
- npm run test:mcp:ui: passed; Vite’s optional HMR listener logged a sandbox-only bind warning.
- npm run test:mcp:package: validated seven published files and protocol v2.
- Exact connector clean dependency audit: zero known vulnerabilities.

## Positive security controls

- Loopback Host and browser-origin enforcement: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:550-594.
- Origin-bound, scope-checked session authorization: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:615-632.
- Fixed agent commands with local/open-world Codex tools disabled and Claude built-ins removed: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:71-136.
- Bounded JSON, prompts, output, sessions, concurrency, and remote MCP operations: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:15-63.
- SSRF controls, DNS resolution, IP validation, redirect limits, DNS pinning, and credential stripping: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:1035-1247.
- CLI discovery avoids shell execution, rejects project-local and node_modules/.bin candidates, validates executable shape, and uses a trusted Node binary for Node launchers: packages/mcp-connector/bin/cli-runtime.mjs:97-173 and packages/mcp-connector/bin/cli-runtime.mjs:235-385.
- Credential copies reject symlinks and path escape and use mode 0600: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:924-980.
- Published dependencies are exactly pinned, the tarball inventory is allowlisted, npm signatures/advisories are checked in the install smoke, and only node-pty may run an install script: packages/mcp-connector/test/package-release.mjs:24-45, packages/mcp-connector/test/package-release.mjs:227-280, and packages/mcp-connector/test/package-release.mjs:402-449.
- The publish workflow pins GitHub Actions by commit SHA and gives OIDC authority only to the downstream publish job: .github/workflows/publish-mcp.yml:11-37 and .github/workflows/publish-mcp.yml:60-92.

## High severity

### SBP-001 — Trusted-origin JavaScript can automatically obtain broad local-connector capabilities

Urgency: P1, address before expanding connector capabilities or adding more third-party workspace scripts.

Evidence:

- All five capabilities are the default session scope set: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:63.
- Omitting scopes grants the entire set: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:275-288.
- The production origin can issue and redeem a pairing without local user confirmation: packages/mcp-connector/bin/algoglyph-mcp-connector.mjs:3623-3651.
- The browser deliberately sends an empty pairing body and pairs during bootstrap: src/lib/mcp/connectorClient.ts:345-375 and src/lib/mcp/bootstrap.ts:70-108.
- The session bearer token is readable by any same-origin script through sessionStorage: src/store/mcpStore.ts:44-66.
- The production page loads Google Tag Manager on every route, including the workspace: index.html:39-49.
- The deployed header source has no Content-Security-Policy: public/_headers:1-5.

Risk:

A script that gains execution under https://algoglyph.com—through an application XSS, compromised deployment, dependency compromise, or remote tag compromise—can call the loopback connector, pair automatically, read or mint a session token, enumerate CLIs, submit agent prompts, approve remote MCP endpoints, and invoke MCP tools. The connector’s fixed adapters, SSRF protection, rate limits, and output bounds prevent this from being equivalent to unrestricted local shell access, but the attacker can still consume the user’s authenticated model quota, observe generated output, exercise approved MCP tools, and create local availability/privacy impact.

Recommended remediation:

1. Make automatic pairing grant only catalog:read and session:revoke.
2. Require a fresh, short-lived, one-operation capability for agent:run, mcp:test, and mcp:invoke. Bind it to the origin, session, operation, agent/server/tool identifier, and a digest of the submitted parameters.
3. Require an explicit local user-presence step for the first privileged grant. A terminal confirmation code or connector-local approval prompt is stronger than a browser-controlled boolean.
4. Do not load remote analytics/tag scripts on /workspace. Keep the privileged workspace route first-party-only.
5. Deploy a nonce/hash-based CSP. Prefer script-src 'self' for /workspace, disallow object embedding, and explicitly constrain frame-src and connect-src.
6. Log security events without prompts or tokens: pairing issuance/redemption, privileged scope grants, agent selection, MCP endpoint origin, cancellation, and repeated rate-limit failures.

Residual risk:

Even after step-up authorization, a fully compromised production origin can mislead users into approving actions. Action-bound grants, clear local confirmation text, and a first-party-only workspace substantially reduce silent exploitation.

## Medium severity

### SBP-002 — Imported PDF nodes accept unvalidated sources and render them in an unsandboxed iframe

Urgency: P1 for shared-file safety.

Evidence:

- A file is considered a PDF when either its MIME type is PDF or its filename merely ends in .pdf: src/components/Editor.tsx:49-54.
- The entire file is stored and its supplied MIME type is preserved: src/lib/notePdfStore.ts:85-89.
- Imported Markdown can create a PDF node with an arbitrary src attribute: src/components/notes/PdfEmbed.tsx:35-43 and src/components/notes/PdfEmbed.tsx:196-219.
- Non-pdfstore sources are used directly, exposed as a new-tab link, and rendered in an iframe with no sandbox or referrerPolicy: src/components/notes/PdfEmbed.tsx:45-83 and src/components/notes/PdfEmbed.tsx:101-145.

Risk:

A malicious shared Markdown file can trigger requests to attacker-controlled content and display an active cross-origin page inside the workspace, enabling tracking and convincing UI spoofing. Browser same-origin policy prevents an ordinary cross-origin HTTPS frame from reading the parent. The higher-impact case is conditional: if non-PDF bytes arrive as a File named .pdf with an active MIME such as text/html, the app preserves that MIME and creates a same-origin Blob URL; without iframe sandboxing, active content may be able to reach workspace storage and the connector session.

Recommended remediation:

1. Enforce per-file and total-batch byte limits before reading.
2. Verify the PDF magic prefix and basic structure; do not rely on extension or file.type.
3. Always store and recreate accepted PDF blobs as application/pdf.
4. For imported Markdown, accept only canonical pdfstore identifiers by default. If remote PDFs are a required feature, allow only normalized https URLs and reject data, blob, file, javascript, and custom schemes.
5. Add an iframe sandbox that omits scripts, forms, popups, and top navigation; add referrerPolicy="no-referrer".
6. Display remote files as explicit user-clicked links until a safe rendering design is validated in supported browsers.

### SBP-003 — Workspace, Markdown, and PDF imports are unbounded and workspace data is only shallowly validated

Urgency: P1 for files shared between users.

Evidence:

- Workspace import reads the whole file, parses arbitrary JSON, and validates only the presence of notes or canvasElements: src/components/Toolbar.tsx:99-161.
- Multi-tab and legacy data are copied into live state without a strict schema, depth, key, string, tab, element, or file-count limit: src/store/workspaceStore.ts:367-399.
- Imported canvas objects are passed directly into Excalidraw: src/components/Canvas.tsx:225-239.
- The persistence clone walks arbitrary nested objects recursively and has no depth, key, array, or byte budget: src/db/indexedDB.ts:85-108.
- Notes import accepts multiple files, reads each whole Markdown file, and stores each PDF as an ArrayBuffer with no byte or batch limit: src/components/Editor.tsx:184-220 and src/components/Editor.tsx:419-437.

Risk:

A malicious or accidentally huge shared file can block the main thread during FileReader, JSON.parse, TipTap parsing, Excalidraw scene loading, or recursive persistence; exhaust heap/IndexedDB quota; trigger a recursion overflow; or leave a poisoned workspace that fails on every reload. User interaction is required, so this is primarily a local availability and data-integrity issue rather than remote code execution.

Recommended remediation:

1. Define a versioned runtime schema for WorkspaceData with an allowlist of keys and exact primitive/collection types.
2. Reject unsafe object keys and enforce global budgets for input bytes, JSON depth, keys, array items, strings, tabs, canvas elements, canvas files, and visualizer nodes before mutating state.
3. Parse large workspaces in a Web Worker and show a summary/confirmation before replacement.
4. Validate into a fresh canonical object; do not spread attacker-provided tab objects over defaults.
5. Make imports transactional: validate and estimate storage first, then commit state and persistence together; preserve the current workspace on failure.
6. Add a recovery mode that can discard only the last failed import without clearing unrelated local data.

Suggested initial budgets, to be tuned from real exported workspaces: 10 MiB per workspace/Markdown file, 25 MiB per PDF, 100 MiB per import batch, 100 tabs, 20,000 canvas elements total, JSON depth 32, and bounded strings/data URLs.

### SBP-004 — The web application lock contains advisory-affected production dependencies

Urgency: P2, after the direct trust-boundary and import fixes.

Evidence:

- Excalidraw is a direct production dependency and receives imported scene data: package.json:34 and src/components/Canvas.tsx:225-239.
- The lock contains @excalidraw/excalidraw 0.18.1 with mermaid-to-excalidraw: package-lock.json:1729-1738.
- The locked tree contains DOMPurify 3.4.12, Mermaid 11.15.0, lodash-es 4.17.21, and vulnerable Nano ID lines: package-lock.json:7407-7414, package-lock.json:9652-9656, package-lock.json:9802-9811, and package-lock.json:10043-10053.
- @remotion/tailwind is listed as a production dependency even though it is build tooling, pulling a vulnerable nested PostCSS: package.json:42 and package-lock.json:3278-3289, package-lock.json:3373-3376.

Current audit result:

- 14 advisory-affected production dependency nodes: 4 high, 10 moderate.
- Relevant advisories include Mermaid CSS injection/prototype-pollution/DoS issues, DOMPurify GHSA-55q2-fjhq-7xh7, lodash-es code-injection/prototype-pollution advisories, Nano ID loop advisories, JS-YAML CPU exhaustion, and a nested PostCSS path-disclosure advisory.
- This count is not proof that every advisory is reachable. The Excalidraw/Mermaid chain is browser-facing and deserves manual reachability testing with imported scene data. The Remotion/PostCSS/JS-YAML path appears build-only and should not be installed as production runtime surface.
- The exact connector 0.2.5 dependency graph separately has zero advisories.

Recommended remediation:

1. Build a controlled Excalidraw upgrade/override branch and test imported scene compatibility, Mermaid functionality, SVG/image handling, and deterministic diagram tests. Do not blindly accept npm audit’s suggested Excalidraw downgrade.
2. Upgrade or override Mermaid, DOMPurify, lodash-es, and Nano ID only to versions compatible with the owning packages.
3. Remove unused @remotion/tailwind or move build-only CSS tooling to devDependencies.
4. Add an npm audit --omit=dev gate for the web production lock with a time-bounded, documented exception mechanism and reachability notes.
5. Add dependency review on pull requests and keep release package signature verification.

## Low severity / assurance gaps

### SBP-006 — Malicious-file security invariants lack focused regression tests

Urgency: P3.

Evidence:

- The current MCP suite extensively tests connector JSON limits, SSRF, origins, sessions, subprocess isolation, and resolver safety: packages/mcp-connector/test/connector.integration.test.mjs.
- No focused test covers workspace byte/depth/count limits, imported PDF magic/MIME validation, PDF URL scheme rejection, iframe sandboxing, or transactional import rollback.

Recommended remediation:

Add unit/integration tests for oversized files, deeply nested JSON, huge arrays/strings/data URLs, unsafe object keys, malformed tab/canvas/PDF records, HTML disguised as PDF, data/blob/custom PDF URLs, remote iframe policy, and preservation of the current workspace after rejection.

## Recommended remediation order

1. SBP-001: reduce automatic scopes, add local step-up authorization, remove third-party scripts from /workspace, and deploy CSP.
2. SBP-002 and SBP-003: harden shared workspace/Markdown/PDF imports before encouraging file sharing.
3. SBP-004: remediate reachable runtime dependencies and remove build-only production packages.
4. SBP-005: make credentialed Antigravity startup lazy and owner-authorized.
5. SBP-006: lock the new invariants into tests.

## Audit limitations

- Electron was not reviewed.
- The real production Antigravity/Codex/Claude providers were not asked to process audit prompts.
- No claim is made that an ordinary cross-origin PDF iframe can read the parent; browser same-origin policy is an existing mitigation.
- Dependency severity is based on the repository lock and npm advisory data current on the audit date. Reachability must be rechecked after dependency changes.
- A full browser exploit proof for the conditional active-MIME Blob case was not executed; it remains a high-impact conditional path that should be closed by validation and sandboxing.
