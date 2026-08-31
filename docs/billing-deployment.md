# Paid MCP billing deployment

AlgoGlyph keeps the workspace local. Firebase stores only identity, the personal billing workspace, provider state, entitlement state, connector grants, rate-limit counters, and audit records. The web frontend stays on Cloudflare Pages; `firebase-functions/` is the trusted billing and connector-entitlement boundary.

## Environment isolation

Create distinct Firebase, Stripe, and Razorpay environments for development, staging, and production. Never reuse live provider credentials or webhook secrets outside production.

1. Copy `.firebaserc.example` to `.firebaserc` and replace every project ID.
2. Select a project explicitly with `firebase use dev`, `firebase use staging`, or `firebase use production` before any mutation.
3. Create `firebase-functions/.env.<firebase-project-id>` from `firebase-functions/.env.example`. Set exact web origins and provider price/plan IDs for that environment.
4. Set server secrets independently in each project:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY --project staging
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET --project staging
firebase functions:secrets:set RAZORPAY_KEY_ID --project staging
firebase functions:secrets:set RAZORPAY_KEY_SECRET --project staging
firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET --project staging
```

Repeat with `--project production` only after staging is signed off. Do not put Admin SDK credentials or payment secrets in `.env`, `VITE_*`, Firestore, CI output, or frontend hosting variables.

## Firebase and frontend setup

- Enable Google Authentication, Firestore, App Check with reCAPTCHA Enterprise, Cloud Functions, Cloud Scheduler, and Secret Manager in each Firebase project.
- Register the exact production and staging web origins. `ALLOWED_WEB_ORIGINS` must not contain wildcard or preview origins in production.
- Put only Firebase public web configuration, `VITE_FIREBASE_APPCHECK_SITE_KEY`, and the environment's billing API URL in the Cloudflare Pages variables.
- Map the production `api` function to `https://api.algoglyph.com` and use a separate staging hostname. The published connector deliberately redeems only against `https://api.algoglyph.com`; a frontend cannot replace that URL.
- Enable Firestore TTL policies on `connectorGrants.expiresAt` and `rateLimits.expiresAt`. TTL is storage cleanup only; request authorization continues to enforce expiry transactionally and must never rely on background deletion timing.
- Keep Electron billing disabled for V1. No notes, canvas elements, code, prompts, or MCP credentials belong in Firebase.

Deploy from an explicitly selected project:

```bash
npm ci --prefix firebase-functions
npm run test:billing
npm run test:firebase
firebase deploy --only firestore:rules,firestore:indexes,functions --project staging
```

The emulator command requires Java 21 or newer.

## Provider configuration

Stripe Checkout must use the two server-configured recurring Price IDs. Subscribe the environment webhook to checkout-session, subscription, invoice payment, refund, dispute, and early-fraud-warning events and point it to `/v1/webhooks/stripe`. Verify it with the Stripe CLI before staging sign-off.

Razorpay must use the two server-configured recurring Plan IDs. Configure its Standard Checkout public Key ID and send subscription, failed-payment, refund, and dispute webhooks to `/v1/webhooks/razorpay`. The webhook secret must be different from the API key secret.

Both handlers verify the unmodified body, deduplicate event IDs in Firestore, ignore older non-terminal state, and make refunds/disputes terminal for that provider subscription. A new subscription ID is required before a terminally revoked subscription can grant access again. Unknown signed event types are acknowledged without changing state; supported events that cannot be associated with server-created workspace metadata fail for provider retry and scheduled reconciliation.

## Staging acceptance

Complete all of these with provider test modes before production:

- Monthly and annual activation through Stripe and Razorpay.
- A client-modified checkout body containing amount, currency, provider, price ID, or entitlement fields is rejected.
- Invalid signatures, duplicate delivery, delayed delivery, and reversed event order cannot grant access.
- Cancellation keeps access only through period end; failed renewal enters one 72-hour grace window; recovery restores active access; elapsed grace locks access.
- Refund and dispute events revoke immediately and cannot be undone by later updates for the same subscription.
- Connector grants reject unpaid, missing, expired, reused, or mismatched credentials and fail closed while the billing backend is unavailable.
- A browser-origin request carrying `ALGOGLYPH_CONNECTOR_TOKEN` is rejected.
- Firestore emulator tests prove authenticated clients cannot read or write server-owned records.

For Stripe, use `stripe listen --forward-to <staging-api>/v1/webhooks/stripe` and provider test clocks where practical. For Razorpay, use dashboard test mode and its webhook test delivery. Never treat a browser checkout callback as payment proof; the UI remains in “verifying payment” until the entitlement endpoint reports active access.

## Operations, rollback, and support

- Alert on webhook signature failures, supported-event resolution failures, reconciliation failures, repeated checkout conflicts, grant-redemption spikes, and entitlement changes to locked state.
- Review redacted audit records for checkout, cancellation, subscription, entitlement, grant, and paid-session events. Logs must never contain raw webhook bodies, grants, pairing credentials, bearer tokens, prompts, or payment details.
- The hourly reconciliation job re-reads provider subscription state and expires elapsed access. Investigate any non-zero reconciliation failure count.
- A connector session is deliberately capped at 30 minutes and cannot outlive the entitlement timestamp it received. Refund, dispute, fraud, and security revocations are immediate in the backend, but an already-issued local session can retain access for the remainder of that bounded window; include this in incident response and revoke the local pairing session when coordinating with the user.
- Define retention and export policies for `paymentEvents` and `auditLogs` that satisfy accounting, dispute, privacy, and support needs. Do not apply short TTL cleanup to canonical subscription or entitlement records.
- Roll back frontend and Functions independently. Do not roll back Firestore rules to a client-readable version. If a Functions rollback cannot understand a newer record, disable checkout creation first while retaining webhooks and reconciliation.
- Before a manual refund, dispute response, duplicate-subscription correction, or entitlement repair, confirm the Firebase project, workspace ID, provider, provider customer, and provider subscription. Record the reason and operator in an audit log; never edit entitlement state without reconciling the canonical provider record.
- Publish `@algoglyph/mcp-connector@0.3.0` only after backend production deployment and end-to-end paid redemption are verified. Older protocol-v2 connectors must not be advertised after the v3 cutover.

Complete Stripe/Razorpay business verification, refund/cancellation disclosures, privacy/terms review, and tax/GST advice before enabling live-mode prices.
