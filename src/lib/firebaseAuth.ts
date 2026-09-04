import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';
import {
  getToken as getAppCheckToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from 'firebase/app-check';
import type { AppCheck } from 'firebase/app-check';

export interface FirebaseAuthConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  appCheckSiteKey?: string;
}

export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface FirebaseAuthClient {
  subscribe: (
    onUserChanged: (user: FirebaseAuthUser | null) => void,
    onError: (error: unknown) => void,
  ) => () => void;
  signInWithGoogle: () => Promise<FirebaseAuthUser>;
  signOut: () => Promise<void>;
  reauthenticateWithGoogle: () => Promise<FirebaseAuthUser>;
  getIdToken: () => Promise<string>;
  getAppCheckToken: () => Promise<string>;
}

let authInstance: Auth | null = null;
const appCheckGlobal = globalThis as typeof globalThis & {
  __algoglyphAppCheck?: AppCheck;
};
let appCheckInstance: AppCheck | null = appCheckGlobal.__algoglyphAppCheck ?? null;

const toAuthUser = (user: User): FirebaseAuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

const getOrCreateAuth = (config: FirebaseAuthConfig): Auth => {
  if (authInstance) return authInstance;

  const app = getApps().length === 0 ? initializeApp(config) : getApp();

  try {
    authInstance = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch {
    // Hot reload can preserve the Firebase app while re-evaluating this module.
    authInstance = getAuth(app);
  }

  return authInstance;
};

export const createFirebaseAuthClient = (config: FirebaseAuthConfig): FirebaseAuthClient => {
  const auth = getOrCreateAuth(config);
  const googleProvider = new GoogleAuthProvider();
  if (config.appCheckSiteKey && !appCheckInstance) {
    appCheckInstance = initializeAppCheck(auth.app, {
      provider: new ReCaptchaEnterpriseProvider(config.appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckGlobal.__algoglyphAppCheck = appCheckInstance;
  }

  return {
    subscribe: (onUserChanged, onError) => onAuthStateChanged(
      auth,
      (user) => onUserChanged(user ? toAuthUser(user) : null),
      onError,
    ),
    signInWithGoogle: async () => {
      const credential = await signInWithPopup(
        auth,
        googleProvider,
        browserPopupRedirectResolver,
      );
      return toAuthUser(credential.user);
    },
    signOut: () => signOut(auth),
    reauthenticateWithGoogle: async () => {
      if (!auth.currentUser) throw new Error('Sign in before confirming this account change.');
      const credential = await reauthenticateWithPopup(
        auth.currentUser,
        googleProvider,
        browserPopupRedirectResolver,
      );
      await credential.user.getIdToken(true);
      return toAuthUser(credential.user);
    },
    getIdToken: async () => {
      if (!auth.currentUser) throw new Error('Sign in before making an authenticated API request.');
      return auth.currentUser.getIdToken();
    },
    getAppCheckToken: async () => {
      if (!appCheckInstance) {
        if (import.meta.env.DEV) return 'firebase-emulator-app-check';
        throw new Error('Firebase App Check is not configured.');
      }
      return (await getAppCheckToken(appCheckInstance)).token;
    },
  };
};
