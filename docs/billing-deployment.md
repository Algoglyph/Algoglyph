# Authentication and billing deployment

AlgoGlyph's browser is an untrusted billing client. Firebase establishes identity, the Functions API owns authorization and provider selection, verified provider events update server-owned billing records, and entitlements authorize the hosted managed agent. A checkout return or browser callback never grants access by itself.

The local MCP connector is free and subscription-agnostic. Pairing, connector sessions, MCP server tests, and local agent runs do not call the billing API. Never use `managedAgentAccess` to gate MCP.

## Environment isolation

Use a distinct Firebase project and distinct Stripe/Razorpay test or live accounts for development, staging, and production. Each environment needs its own Firebase web app, App Check registration, provider price/plan identifiers, webhook endpoints, allowed web origins, and return URLs. Do not point a development or staging frontend at the production billing API.

The public web configuration belongs in an ignored Vite environment file copied from `/.env.example`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_APPCHECK_SITE_KEY`
- `VITE_BILLING_API_URL`

These are browser configuration values, not administrator credentials. They may appear in the compiled web app. Firebase security rules, verified ID tokens, App Check, backend authorization, and provider webhook verification are the security boundaries. The UI reports missing variable *names* but never renders their configured values.

The Functions runtime configuration is documented in `/firebase-functions/.env.example`:

- `ALLOWED_WEB_ORIGINS`
- `CHECKOUT_SUCCESS_URL`
- `CHECKOUT_CANCEL_URL`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_ANNUAL_PRICE_ID`
- `RAZORPAY_PRO_MONTHLY_PLAN_ID`
- `RAZORPAY_PRO_ANNUAL_PLAN_ID`

The following are backend-only Firebase Functions secrets and must be set with `firebase functions:secrets:set` for the selected Firebase project:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Never prefix those secrets with `VITE_`, commit them, render them, log them, or send them to the browser. Razorpay's public checkout key ID is returned only as part of the server-created checkout response; its key secret stays in Functions.

## Provider routing and checkout

The browser submits only `planKey` (`pro_monthly` or `pro_annual`), `billingRegion` (`international` or `india`), and optionally an organization identifier selected from the server-authorized billing-workspace list. Functions verifies membership and requires an owner or billing-admin role before organization billing changes. It maps international billing to Stripe/USD and India billing to Razorpay/INR, then selects the configured provider Price/Plan ID. The amount is owned by that provider object and cannot be supplied by the browser.

- Stripe uses hosted Checkout in subscription mode. Configure its webhook to send supported subscription, invoice, refund, dispute, and fraud events to `/v1/webhooks/stripe` on the deployed `api` function.
- Razorpay uses Subscriptions plus Standard Checkout. Configure supported subscription, payment-failure, refund, and dispute events to `/v1/webhooks/razorpay`. The browser callback is signature-checked and retrieved from Razorpay for UX confirmation, but entitlement waits for a verified provider webhook or reconciliation.
- The hourly reconciliation function retrieves stored subscriptions from their provider and expires elapsed entitlements. It is a recovery path, not a substitute for webhook configuration.

## Managed-agent authorization

`POST /v1/managed-agent/authorize` is the managed-agent policy boundary. It accepts an exact workspace ID after Firebase ID-token and App Check verification. `canUseManagedAgent(user, workspace)` allows access when either:

- the user has a current individual `managedAgentAccess` entitlement and may access the requested workspace; or
- the requested organization workspace has a current `managedAgentAccess` entitlement and the user has an active membership in that organization.

Organization records live in `organizations`, memberships in `organizationMembers`, and the server-owned billing subject is `organization_<organizationId>`. Revoked membership, revoked/expired entitlement, or an unrelated workspace is denied. Legacy `mcpAccess` fields are deliberately ignored. Removing an organization entitlement disables only the hosted managed agent; free MCP remains available.

Provision organization access with server/admin tooling, never direct browser writes:

- `organizations/{organizationId}`: `name`, `status: "active"`;
- `organizationMembers/{organizationId}_{uid}`: matching `organizationId`, `uid`, `status: "active"`, and role `owner`, `billing_admin`, or `member`;
- `workspaces/organization_{organizationId}`: matching `organizationId`;
- `workspaceMembers/organization_{organizationId}_{uid}`: matching workspace/user IDs and `status: "active"`.

Members can consume an active organization entitlement. Only owners and billing admins can start or cancel its subscription.

## BillDesk status

BillDesk is intentionally unavailable in the UI and backend. Neither `origin/web_mcp_OAI` nor any reachable repository history contains a BillDesk adapter, configuration, callback, notification handler, signature verification, or test. The public BillDesk checkout demo documents example request fields, but it does not define the merchant-specific server authentication and verification contract needed for a secure implementation.

Do not add placeholder BillDesk buttons or guessed environment variables. Enabling BillDesk requires the merchant's official, versioned integration package and sandbox access, including:

- UAT and production API/checkout endpoints;
- merchant/client identifiers and the exact backend-only signing or encryption key format;
- request-token creation and response verification algorithms;
- transaction, mandate/recurring, cancellation, refund, and retrieval APIs actually enabled for the merchant;
- callback and server-notification schemas, signature rules, event/replay identifiers, and retry behavior;
- authoritative status mapping and sandbox test credentials.

Once supplied, implement BillDesk behind the same provider facade, add a backend-owned plan route, persist its pending transaction before redirecting, verify callbacks only for UX, process signed notifications idempotently, retrieve ambiguous state from BillDesk, and add provider-specific emulator/unit fixtures before exposing it in the plan selector.

## Local verification

Run:

```bash
npm run build
npm run build:functions
npm run test:billing
npm run test:firebase
npm run test:mcp
npm run test:mcp:ui
npm run lint:billing
npm run lint:mcp
```

The Firestore emulator test verifies that browser clients cannot read or write workspaces, organizations, memberships, subscriptions, entitlements, payment events, audit logs, or rate limits. Backend status must be read through the authenticated/App-Checked API.
