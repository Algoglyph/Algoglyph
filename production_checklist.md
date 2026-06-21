# ScratchPad — Production Readiness Checklist

This document covers everything missing from the current stack to make ScratchPad production-ready as both a **web app** and a **desktop (Electron) app**.

---

## 1. Authentication

**Current state:** None. Anyone who opens the app is anonymous.  
**Why it's needed:** Without auth, you cannot associate data with a user, which means no cloud sync, no cross-device access, and no ability to charge money.

**Recommended solution:** Firebase Auth

### Tasks
- [ ] Set up a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable **Google Sign-In** and **Email/Password** providers in Firebase Auth
- [ ] Install the Firebase SDK: `npm install firebase`
- [ ] Create `src/lib/firebase.ts` — initialize the Firebase app with your config
- [ ] Create `src/lib/auth.ts` — expose `signIn`, `signOut`, `onAuthStateChanged` helpers
- [ ] Create an `AuthGate` component that wraps the app and shows a login screen if the user is not signed in
- [ ] Store the current user in `workspaceStore` or a dedicated `authStore`
- [ ] Add a user avatar / sign-out button to the Toolbar
- [ ] Handle auth persistence across page refreshes (`setPersistence(browserLocalPersistence)`)

---

## 2. Cloud Database (Firestore)

**Current state:** Data is stored in browser IndexedDB — local only. Clearing cache = data loss. No cross-device sync.  
**Why it's needed:** Users expect their notes and canvas to be available on any device, any browser.

**Recommended solution:** Firebase Firestore

### Data Model
```
users/
  {uid}/
    workspaces/
      {workspaceId}/
        tabs: TabData[]
        activeTabId: string
        updatedAt: timestamp
```

### Tasks
- [ ] Enable Firestore in Firebase Console (start in **production mode**)
- [ ] Write Firestore security rules so users can only read/write their own data:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
- [ ] Create `src/db/firestore.ts` — replace/extend `indexedDB.ts` with Firestore read/write functions
- [ ] Update `workspaceStore.ts`:
  - `initializeWorkspace()` → load from Firestore if user is signed in, fall back to IndexedDB if offline
  - `saveCurrentWorkspace()` → write to Firestore (debounced, same 1s delay as current auto-save)
- [ ] Implement **offline support** via Firestore's `enableIndexedDbPersistence()` so the app still works without internet and syncs when reconnected
- [ ] Migrate existing local IndexedDB data to Firestore on first sign-in (one-time migration prompt)

---

## 3. Hosting (Web App)

**Current state:** No web deployment. The app only runs as an Electron desktop app.  
**Why it's needed:** A web version lets users access ScratchPad from any browser without installing anything.

**Recommended solution:** Vercel (best CI/CD, edge network, free tier) or Firebase Hosting

### Vercel (Recommended)
- [ ] Create a `vercel.json` at the project root:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite"
  }
  ```
- [ ] Connect the GitHub repo to Vercel for automatic preview deployments on every PR
- [ ] Set environment variables in Vercel dashboard (Firebase API keys, etc.)
- [ ] Configure a custom domain (e.g. `scratchpad.app`)
- [ ] Set up redirect rules for SPA routing (all routes → `index.html`)

### Firebase Hosting (Alternative)
- [ ] `npm install -g firebase-tools`
- [ ] `firebase init hosting` → set public dir to `dist`
- [ ] `firebase deploy` to ship

---

## 4. Analytics

**Current state:** None. You have no idea how users are using the app, which features they use, or where they drop off.  
**Why it's needed:** You cannot improve a product you cannot measure.

**Recommended solution:** PostHog (open-source, privacy-friendly) or Plausible (minimal, GDPR compliant)

### Tasks
- [ ] Sign up for [PostHog](https://posthog.com) (free up to 1M events/month)
- [ ] Install: `npm install posthog-js`
- [ ] Initialize PostHog in `main.tsx` with your project API key
- [ ] Track key events:
  - `workspace_opened`
  - `tab_created`
  - `structure_inserted` (which DSA structure)
  - `layout_mode_changed` (canvas / split / notes / code)
  - `canvas_exported`
  - `code_run`
- [ ] Set up a PostHog dashboard to track DAU, feature adoption, and session length

---

## 5. Error Monitoring

**Current state:** None. If the app crashes for a user, you'll never know.  
**Why it's needed:** Production bugs are invisible without error monitoring. You will find out about them from angry users instead of your dashboard.

**Recommended solution:** Sentry (industry standard, generous free tier)

### Tasks
- [ ] Sign up at [sentry.io](https://sentry.io) and create a new **React** project
- [ ] Install: `npm install @sentry/react`
- [ ] Initialize Sentry in `main.tsx` **before** `createRoot`:
  ```typescript
  import * as Sentry from "@sentry/react";
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE, // 'development' | 'production'
    tracesSampleRate: 0.2, // capture 20% of transactions for performance
  });
  ```
- [ ] Wrap the root component with `Sentry.ErrorBoundary` to catch React render errors
- [ ] Add Sentry to the Vite config for source map uploads (so stack traces show real code, not minified bundles):
  ```
  npm install @sentry/vite-plugin
  ```
- [ ] Set `VITE_SENTRY_DSN` as an environment variable in Vercel

---

## 6. Environment Variables & Secrets Management

**Current state:** No `.env` files. Firebase keys would be hardcoded — a security risk.

### Tasks
- [ ] Create `.env.local` for local development (never commit this):
  ```
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  VITE_FIREBASE_STORAGE_BUCKET=...
  VITE_FIREBASE_MESSAGING_SENDER_ID=...
  VITE_FIREBASE_APP_ID=...
  VITE_SENTRY_DSN=...
  ```
- [ ] Add `.env.local` to `.gitignore`
- [ ] Add all variables to Vercel's environment variable dashboard for production

---

## 7. Electron Production Build & Distribution

**Current state:** Electron runs in dev mode only. There is no packaged installer.

### Tasks
- [ ] Install `electron-builder`: `npm install --save-dev electron-builder`
- [ ] Add `build` config to `package.json`:
  ```json
  "build": {
    "appId": "com.scratchpad.app",
    "productName": "Scratchpad",
    "mac": { "target": "dmg", "category": "public.app-category.productivity" },
    "win": { "target": "nsis" },
    "linux": { "target": "AppImage" }
  }
  ```
- [ ] Code-sign the macOS build (requires Apple Developer account, $99/yr)
- [ ] Set up auto-updates using `electron-updater` so users get new versions automatically
- [ ] Set up GitHub Releases or an S3 bucket to host update artifacts
- [ ] Build a GitHub Actions CI workflow that builds and signs the Electron app on every release tag

---

## Priority Order (Recommended)

| Priority | Task | Why |
|----------|------|-----|
| 🔴 1 | Firebase Auth | Everything else depends on knowing who the user is |
| 🔴 2 | Firestore cloud sync | Core value prop of the web version |
| 🔴 3 | Vercel hosting | Ships the web app |
| 🟡 4 | Environment variables | Security baseline before going live |
| 🟡 5 | Sentry error monitoring | Find bugs before users report them |
| 🟢 6 | Analytics (PostHog) | Nice to have at launch, essential post-launch |
| 🟢 7 | Electron distribution | Ship the desktop app after web is stable |
