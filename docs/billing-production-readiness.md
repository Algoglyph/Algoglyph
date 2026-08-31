# Paid MCP production readiness audit

Audit date: 2026-08-31

Scope: Firebase billing Functions and Firestore rules, Stripe and Razorpay adapters, the browser billing client, MCP protocol v3 pairing and sessions, release workflow, and operating documentation.

## Verdict

**Ready for a credentialed staging deployment; not yet approved for live production.**

The source implementation has a complete trusted authorization path and its local release gates pass. Production approval remains blocked on evidence that requires configured external systems: successful monthly and annual test-mode checkouts through both providers, signed webhook delivery against a deployed staging endpoint, App Check enforcement, reconciliation against real provider objects, alerts, and an end-to-end paid connector redemption.

Production-readiness score: **82/100**. The score is capped below 85 while deployed provider evidence is absent.

| Area | Score | Evidence |
| --- | ---: | --- |
| Critical billing and connector path | 19/20 | Provider-neutral checkout, canonical subscription records, verified webhook activation, grants, direct redemption, bounded sessions |
| Authentication and authorization | 18/20 | Revocation-aware Firebase token verification, App Check, exact origins, deny-all client rules, fixed connector backend |
| Correctness and recovery | 17/20 | Transactional event deduplication, payload-conflict detection, ordering rules, 72-hour grace, terminal revocation, rotating reconciliation |
| Automated verification | 14/20 | Unit, emulator, MCP security, UI, package-release, build, lint, and audit gates pass; external test-mode flows remain outstanding |
| Deployment and rollback | 8/10 | Environment separation, secrets, independent rollback, cutover order, and failure guidance documented |
| Observability and operations | 6/10 | Redacted audit records and alert conditions are defined; deployed dashboards, alerts, and on-call evidence remain outstanding |

## Architecture authorization audit

The paid wrapper does not rely on frontend state for authorization. The browser proves Firebase identity and App Check, the backend owns workspace and entitlement state, and a local connector receives access only after directly redeeming a single-use backend grant. Grants are hashed at rest and bound to pairing-credential hash, origin, workspace, connector version, and exact requested scopes. Browser traffic cannot use the operator master token, and the entitlement backend URL is fixed in the published connector.

Payment state and feature entitlement remain separate records. Only verified provider events or reconciliation update the canonical subscription before projecting entitlement. Delayed non-terminal events cannot overwrite newer state; refund, dispute, fraud, and security revocations remain terminal for the affected provider subscription.

The existing tool confirmation, SSRF, origin, scope, rate-limit, worker-isolation, and process-isolation controls remain on the paid session path. Billing introduces no prompt persistence, cloud workspace persistence, alternate tool executor, autonomous retry loop, or hidden authority path.

## Required production evidence

These are release gates, not optional follow-up work:

1. Deploy to an isolated staging Firebase project and staging API hostname with exact CORS origins, enforced App Check, Secret Manager values, Firestore TTL policies, and test-mode provider objects.
2. Record monthly and annual activation for Stripe and Razorpay, then exercise voluntary cancellation, renewal failure, recovery during grace, grace expiry, refund, dispute, and fraud/security revocation.
3. Use Stripe CLI and Razorpay test delivery to prove raw-body signature verification, duplicate/replayed/out-of-order delivery, and recovery by scheduled reconciliation.
4. Complete an end-to-end browser-to-connector paid redemption and a renewal attempt during a backend outage. Confirm the connector fails closed and a browser master-token bypass returns an error.
5. Configure dashboards and alerts for signature failures, supported-event resolution failures, reconciliation failures, checkout conflicts, grant-redemption spikes, and locked entitlement transitions. Exercise the rollback and incident runbook.
6. Complete processor business verification, production plan/price configuration, customer disclosures, retention requirements, refund policy review, and tax/GST advice.

## Verified source gates

| Gate | Result |
| --- | --- |
| `npm run build` | Pass |
| `npm run lint:mcp` | Pass |
| `npm run lint:billing` | Pass |
| `npm run test:billing` | 8 passed |
| `npm run test:firebase` | 4 passed |
| `npm run test:mcp` | 55 passed, 1 Windows-only skip |
| `npm run test:mcp:ui` | 4 passed |
| `npm run test:mcp:package -- --install-smoke` | Pass, including clean install, audit, health, and native PTY smoke |
| `npm run test:seo` | Pass, 1,427 canonical routes |
| Production dependency audits | 0 vulnerabilities in Functions and connector production dependency trees |

The repository-wide `npm run lint` remains red in pre-existing generated/content files outside this release surface. Targeted billing, connector, browser client, and install-command lint gates pass. The Firebase CLI development tree has three moderate OpenTelemetry baggage advisories through its local Pub/Sub tooling; the deployed Functions dependency tree has zero known audit findings. Forcing the suggested Firebase CLI downgrade would conflict with the repository's pinned CLI policy, so this remains a documented development-tooling exception pending an upstream compatible release.

## Accepted residual risks

- A backend terminal revocation prevents new grants immediately, but a local paid session already issued can remain valid for at most 30 minutes and never beyond its recorded entitlement expiry. Incident response should revoke the local pairing session when the user can coordinate.
- The official connector is open source. Protocol v3 enforces licensing for the published connector and trusted backend, but it is not tamper-proof DRM against a deliberately modified fork.
- Reconciliation processes a rotating batch of 250 subscriptions each hour. This is adequate for V1; backlog age and failure count must be monitored as the customer base grows.

## Rollback decision

Frontend and Functions can roll back independently, but the safe sequence preserves webhook ingestion and reconciliation. If a previous Functions version cannot understand newer records, disable checkout creation while leaving provider webhooks, terminal revocations, and reconciliation online. Never roll Firestore rules back to a client-readable state and never advertise protocol-v2 connectors after the v3 cutover.
