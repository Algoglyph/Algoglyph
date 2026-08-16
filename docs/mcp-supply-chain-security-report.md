# MCP connector supply-chain security report

Date: 2026-08-16
Scope: `@algoglyph/mcp-connector` published artifact, runtime dependencies, package validation, and npm release workflow. The main ScratchPad web/Electron dependency tree is outside this report.

## Executive summary

Published version `0.2.1` has zero known production vulnerabilities and its clean 22-package installation has valid npm registry signatures. Socket nevertheless assigns 71/100 for Supply Chain Security because the tarball contains `npm-shrinkwrap.json`, which Socket categorizes as a high-severity heuristic. Socket's alert is not evidence that the reviewed lock is malicious; npm recommends publishable shrinkwraps for command-line applications.

Release candidate `0.2.2` removes the shrinkwrap from the published four-file artifact, retains the exact 21-dependency review tree in a source-only lock, explicitly declares the MCP Node transport's Hono peer, and rejects a clean install whose package identities differ from the reviewed lock. Its clean-install signature, vulnerability, executable, health, and native PTY checks pass.

A literal Socket 100/100 cannot be guaranteed by a code change. Socket's documented score also weights download count, direct dependencies, and transitive dependencies. Those inputs remain below their mathematical maxima even after the only package-level high alert is removed. The correct release gate is zero untriaged critical/high malicious-behavior alerts, zero known vulnerabilities, valid registry signatures, reviewed dependency identities, and a working installed artifact.

## High severity

### MCP-SC-001 — Published npm shrinkwrap triggers Socket's high alert

- Status: Remediated in unpublished `0.2.2`; present in immutable `0.2.1`.
- Location: `packages/mcp-connector/package.json:9-13`; `packages/mcp-connector/test/package-release.mjs:24-29`.
- Evidence: The supplied Socket report shows `Shrinkwrap` as the only supply-chain alert. The registry tarball for `0.2.1` contains `package/npm-shrinkwrap.json`; the `0.2.2` pack validator proves an exact four-file inventory without it.
- Impact: Socket applies a high-alert penalty and warns that shrinkwrap can alter normal dependency resolution. This is a scanner heuristic, not proof of malicious behavior in this package.
- Fix: Publish `0.2.2`, which excludes the shrinkwrap.
- Mitigation: Keep `packages/mcp-connector/package-lock.json` in source control and fail release validation when a clean packed install differs from its reviewed identities.
- False-positive note: npm documents command-line tools as a recommended use case for `npm-shrinkwrap.json`. Removing it is therefore a scoring/interoperability trade-off, not an unconditional security improvement.

### MCP-SC-002 — Required native dependency executes install scripts

- Status: Accepted, constrained, and tested.
- Location: `packages/mcp-connector/package.json:40`; `packages/mcp-connector/test/package-release.mjs:21-22`.
- Evidence: `node-pty@1.2.0-beta.15` defines `install` and `postinstall`; validation rejects every install-script package except the exact reviewed `node_modules/node-pty` entry.
- Impact: npm lifecycle scripts execute code during installation and therefore have supply-chain impact if the upstream artifact is compromised.
- Fix: No equivalent dependency-free implementation preserves the required native PTY behavior across supported platforms. Removing or hiding this dependency would break functionality or conceal risk.
- Mitigation: Exact direct version, npm-registry integrity metadata, registry-signature verification, zero-vulnerability audit, install-script allowlist, clean install, and native PTY smoke test.
- False-positive note: The capability is expected for a native addon, but the execution risk is real and remains explicitly monitored.

## Medium severity

### MCP-SC-003 — MCP Node transport peer was implicit without shrinkwrap

- Status: Fixed in `0.2.2`.
- Location: `packages/mcp-connector/package.json:34-41`; `packages/mcp-connector/package-lock.json:11-18`.
- Evidence: The first shrinkwrap-free install gate omitted `hono` and failed before runtime execution. `@modelcontextprotocol/node@2.0.0` declares Hono as a peer.
- Impact: A clean consumer installation could be incomplete or depend on package-manager peer-resolution behavior.
- Fix: Declare exact `hono@4.13.1` as a direct runtime dependency.
- Mitigation: The install-smoke test compares all clean-install package identities with the source review lock.
- False-positive note: None; the failure was reproduced from the packed artifact.

### MCP-SC-004 — Published `0.2.1` lacks public provenance

- Status: Pending the next authenticated release path.
- Location: `.github/workflows/publish-mcp.yml:60-92`.
- Evidence: npm metadata for `0.2.1` has a registry signature but no package-level provenance attestation. The prepared workflow isolates `id-token: write` to a post-verification publish job.
- Impact: Consumers can verify registry integrity, but cannot cryptographically link `0.2.1` to a public source commit and build workflow.
- Fix: Publish future releases through npm trusted publishing. Public npm provenance additionally requires a public source repository; the repository is currently private.
- Mitigation: Pinned action commits, pinned Node/npm versions, separated verification and OIDC jobs, exact version checks, and no long-lived npm token in the workflow.
- False-positive note: Registry signatures are present and valid; provenance is an additional assurance layer.

## Informational constraints

### MCP-SC-005 — Socket 100/100 is not a code-only acceptance criterion

- Status: Not achievable immediately from the package source alone.
- Location: External Socket scoring model and npm download metadata.
- Evidence: Socket documents Supply Chain Risk weights for download count (5), transitive dependency count (1), total dependency count (1), and direct dependency count (1). The package currently has 187 weekly downloads and the reviewed `0.2.2` tree has 7 direct and 21 total dependencies.
- Impact: Removing all alerts does not make every normalized metric equal to one, so the score remains below 100 until external adoption and dependency characteristics change.
- Fix: Do not fake downloads, maintainers, releases, or hide dependencies. Reduce dependencies only when functionality and security remain intact, and let adoption metrics grow organically.
- Mitigation: Gate releases on concrete security properties rather than an unattainable immediate aggregate score.
- False-positive note: Socket states that its documented model may differ from the currently deployed model; only an authenticated post-publication Socket query can establish the new displayed score.

### MCP-SC-006 — License score is separate and requires owner authorization

- Status: Unchanged.
- Location: `packages/mcp-connector/package.json:30`.
- Evidence: The package is explicitly `UNLICENSED`, matching the supplied Socket 0% License result.
- Impact: Registry publication grants no reuse license and cannot receive a positive permissive-license score.
- Fix: The copyright owner must explicitly choose and approve a license. This report does not make that legal grant.
- Mitigation: Keep the manifest and documentation consistent until a license decision is made.
- False-positive note: None; this is intentional package metadata, not a vulnerability.

## Verification evidence

- Exact tarball inventory: four files; no shrinkwrap.
- Reviewed production identities: 21 packages.
- Unexpected package lifecycle scripts: rejected.
- Clean-install dependency drift: rejected at `packages/mcp-connector/test/package-release.mjs:261-275`.
- Registry signatures: verified during install smoke at `packages/mcp-connector/test/package-release.mjs:231-236`.
- Known production vulnerabilities: must equal zero at `packages/mcp-connector/test/package-release.mjs:238-247`.
- Installed CLI, protocol health, and native PTY path: exercised before release.
