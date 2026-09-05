# ADR-002: Separate billing subjects, managed-agent entitlement, and free MCP

Status: accepted

## Context

The existing billing code correctly used server-selected Stripe/Razorpay plans and verified webhooks, but its synthetic "billing workspace" IDs overlapped conceptually with product workspaces. The local MCP connector was free but had no cloud workspace data plane. A hosted agent authorization endpoint existed without execution.

## Decision

Billing subjects are explicitly `user_<uid>` or `organization_<organizationId>`. Subscriptions and `managedAgentAccess` entitlements belong to those subjects, never to a canvas. `canUseManagedAgent(user, workspace)` first verifies workspace membership, then checks the user's entitlement or the workspace organization's entitlement plus organization membership. Every hosted run repeats this server-side check before using a backend-only provider key.

Organization checkout/cancellation requires owner or `billing_admin`. An organization entitlement covers its authorized members without granting access to workspaces where they lack membership.

Cloud MCP uses high-entropy workspace-scoped bearer tokens whose hashes alone are stored. Every request rechecks active workspace membership and tool scope. It never reads subscriptions or entitlements. The existing loopback BYO-agent connector also remains subscription-independent.

Razorpay and Stripe facts flow from server-created checkout through cryptographic callback/webhook verification and idempotent event processing into subscriptions, then entitlements. Browser returns are UX signals only.

## Consequences

Managed-agent access stops when entitlement access time expires or is revoked, while MCP continues until its own token or workspace membership is revoked. Provider secrets stay in Functions secret storage. The managed-agent adapter currently targets an OpenAI-compatible HTTPS endpoint and does not yet provide provider failover or usage metering.
