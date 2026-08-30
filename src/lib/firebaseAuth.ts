import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import type { Auth, User } from 'firebase/auth';

export interface FirebaseAuthConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
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
}

let authInstance: Auth | null = null;

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
  };
};
