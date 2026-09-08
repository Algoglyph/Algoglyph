# Production HSTS deployment

AlgoGlyph sets HTTP Strict Transport Security in the Cloudflare Pages edge middleware at `functions/_middleware.ts`. It is deliberately not implemented in React, Vite, Firebase Auth, or Firebase Functions: HSTS is a browser transport policy and belongs on the public web origin's HTTPS responses.

## Policy and scope

The middleware sends this exact header:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

It is added only when the request URL is HTTPS and the hostname is exactly one of:

- `algoglyph.com` — the canonical production website
- `www.algoglyph.com` — the production alias, which normally redirects to the apex

The check is an explicit hostname/protocol allowlist, not an environment flag. Consequently, Vite development, Cloudflare Pages local development, branch previews, `algoglyph.pages.dev`, Firebase emulators, and loopback MCP endpoints do not receive this policy.

The apex policy's `includeSubDomains` directive applies browser enforcement to every current or future `*.algoglyph.com` hostname after a browser observes the apex header. Before creating or activating any new AlgoGlyph subdomain, provision valid TLS and a working HTTPS route first. Never introduce an HTTP-only subdomain.

## Hostname audit

The repository and active local deployment configuration reference these web hosts:

| Host | Purpose | HSTS relationship | Deployment requirement |
|---|---|---|---|
| `algoglyph.com` | Canonical Cloudflare Pages website | Sends the policy | Keep Cloudflare Universal SSL and HTTP-to-HTTPS redirect enabled. |
| `www.algoglyph.com` | Website alias and MCP browser origin | Sends the policy before its apex redirect | Keep valid TLS and the Pages middleware redirect. |
| `algoglyph.pages.dev` | Cloudflare Pages preview/fallback origin | Does not receive AlgoGlyph's policy; it is outside `algoglyph.com` | Keep HTTPS; this origin remains `noindex`. |
| `api.algoglyph.com` | Intended custom origin for Firebase Functions API in local deployment configuration | Covered by apex `includeSubDomains` once DNS exists | Provision DNS, valid TLS, and an HTTPS proxy/custom-domain route to the deployed `api` function before using it. Do not publish this API origin while it is absent or HTTP-only. |
| `auth.algoglyph.com` | Documented optional future Firebase Auth helper domain | Covered if it is ever created | Provision the Firebase auth helper/proxy and valid TLS before setting `VITE_FIREBASE_AUTH_DOMAIN` to this host. It is not the currently configured auth domain. |

Firebase's current project auth domain (`*.firebaseapp.com`), the direct Functions hostname (`*.cloudfunctions.net` or its platform routing host), Stripe, Razorpay, Google, and the local MCP connector are outside the `algoglyph.com` DNS subtree. Their transport policies are owned by their respective platforms and are not changed by this header.

At the time of the audit, the live apex and `www` alias both had valid HTTPS. HTTP redirected to HTTPS, and `www` then redirected to the canonical apex. `api.algoglyph.com` and `auth.algoglyph.com` did not resolve; they are not active production services and must satisfy the prerequisites above before activation. The newly implemented cloud API was also not yet deployed at the direct Firebase Functions URL, so authenticated API, billing, collaboration, and managed-agent smoke tests must be completed after that deployment.

## Why `includeSubDomains` is safe

Every currently live AlgoGlyph-owned web hostname found in code, configuration, documentation, DNS checks, and certificate-transparency results is HTTPS-capable. The only live subdomain is `www`, and it has valid TLS before redirecting to the apex. The Pages preview is under `pages.dev`, so the apex policy does not cover it. The intended `api` and optional `auth` names are not active; both architectures require HTTPS and this document makes TLS-before-DNS activation an explicit release gate.

## Why `preload` is intentionally absent

Preloading is a separate, difficult-to-reverse commitment that affects the registrable domain before the first visit. AlgoGlyph is not requesting browser preload enrollment in this change. After the policy has operated successfully for an observation period, all production and contingency subdomains have been inventoried, and API/auth custom domains are live and verified, preload can be evaluated as a separate security change.

## Deployment and verification

Deploy through the existing Cloudflare Pages command so the `functions/` middleware is included:

```bash
npm run deploy
```

After deployment, verify without following redirects:

```bash
curl -I http://algoglyph.com/
curl -I https://algoglyph.com/
curl -I http://www.algoglyph.com/
curl -I https://www.algoglyph.com/
curl -I https://algoglyph.pages.dev/
```

Expected results:

- HTTP apex redirects to `https://algoglyph.com/`.
- HTTPS apex returns the exact HSTS value above.
- HTTPS `www` returns the same HSTS value on its redirect response.
- The `pages.dev` response does not inherit the AlgoGlyph HSTS policy.
- `http://localhost:5173` and local Pages/Firebase emulator responses do not contain `Strict-Transport-Security`.

Once the cloud API is deployed, also verify its HTTPS health/preflight/auth rejection behavior, an authenticated workspace read, collaboration subscription/write, billing status and test checkout, managed-agent authorization/run, and workspace-scoped MCP request. These feature checks validate the deployment; no application authorization or billing logic is changed by the HSTS middleware.
