import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

// Define unified User interface
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isMock?: boolean;
}

// Config variables checked dynamically
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;

import type { Auth } from 'firebase/auth';

let authInstance: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error('Firebase initialization failed. Falling back to mock authentication:', error);
  }
} else {
  console.log('Firebase VITE_FIREBASE_API_KEY is missing. Running in Mock Auth Mode.');
}

// Simulated mock auth listener callbacks
const mockListeners = new Set<(user: AuthUser | null) => void>();
let currentMockUser: AuthUser | null = (() => {
  try {
    const saved = localStorage.getItem('dsadelta-mock-user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

// Initialize Auth Listener wrapper
export const subscribeAuth = (callback: (user: AuthUser | null) => void): (() => void) => {
  if (isFirebaseConfigured && authInstance) {
    return onAuthStateChanged(authInstance, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        callback({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });
      } else {
        callback(null);
      }
    });
  } else {
    mockListeners.add(callback);
    // Fire callback immediately with current mock value
    callback(currentMockUser);
    return () => {
      mockListeners.delete(callback);
    };
  }
};

// Sign in trigger
export const signInWithGoogle = async (): Promise<AuthUser> => {
  if (isFirebaseConfigured && authInstance && googleProvider) {
    try {
      const result = await signInWithPopup(authInstance, googleProvider);
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };
    } catch (error) {
      console.error('Google Sign In failed via Firebase:', error);
      throw error;
    }
  } else {
    // Simulated mock authentication delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockUser: AuthUser = {
      uid: 'mock-user-id-varun',
      email: 'varun@dsadelta.dev',
      displayName: 'Varun',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
      isMock: true,
    };
    currentMockUser = mockUser;
    localStorage.setItem('dsadelta-mock-user', JSON.stringify(mockUser));
    mockListeners.forEach((listener) => listener(mockUser));
    return mockUser;
  }
};

// Sign out trigger
export const signOutUser = async (): Promise<void> => {
  if (isFirebaseConfigured && authInstance) {
    await fbSignOut(authInstance);
  } else {
    currentMockUser = null;
    localStorage.removeItem('dsadelta-mock-user');
    mockListeners.forEach((listener) => listener(null));
  }
};
