import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  FirebaseAuthClient,
  FirebaseAuthConfig,
  FirebaseAuthUser,
} from '../lib/firebaseAuth';
import { AuthContext } from './authContext';
import type { AuthContextValue, AuthStatus, AuthUser } from './authContext';

const firebaseConfig: FirebaseAuthConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

const missingFirebaseKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => value.trim().length === 0)
  .map(([key]) => key);
const isFirebaseConfigured = missingFirebaseKeys.length === 0;
const isElectron = typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent);
const canUseFirebaseAuth = typeof window !== 'undefined' && !isElectron && isFirebaseConfigured;

if (import.meta.env.DEV && !isElectron && !isFirebaseConfigured) {
  console.warn(
    `Firebase authentication is disabled. Missing configuration: ${missingFirebaseKeys.join(', ')}.`,
  );
}

const getErrorCode = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  return typeof error.code === 'string' ? error.code : null;
};

const getAuthErrorMessage = (error: unknown): string | null => {
  switch (getErrorCode(error)) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null;
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups and try again.';
    case 'auth/network-request-failed':
      return 'Google sign-in could not reach the network. Check your connection and try again.';
    case 'auth/unauthorized-domain':
      return 'Google sign-in is not enabled for this website domain.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project.';
    default:
      return 'Google sign-in failed. Please try again.';
  }
};

const toAuthUser = (user: FirebaseAuthUser): AuthUser => ({ ...user });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<FirebaseAuthClient | null>(null);
  const pendingRef = useRef(false);
  const [status, setStatus] = useState<AuthStatus>(canUseFirebaseAuth ? 'loading' : 'unavailable');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canUseFirebaseAuth) return;

    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    void import('../lib/firebaseAuth')
      .then(({ createFirebaseAuthClient }) => {
        if (disposed) return;

        const client = createFirebaseAuthClient(firebaseConfig);
        clientRef.current = client;
        unsubscribe = client.subscribe(
          (nextUser) => {
            if (disposed) return;
            setUser(nextUser ? toAuthUser(nextUser) : null);
            setStatus(nextUser ? 'authenticated' : 'anonymous');
          },
          (authError) => {
            if (disposed) return;
            if (import.meta.env.DEV) console.error('Firebase auth state listener failed:', authError);
            setStatus('unavailable');
            setError('Google sign-in is temporarily unavailable.');
          },
        );
      })
      .catch((initializationError: unknown) => {
        if (disposed) return;
        if (import.meta.env.DEV) {
          console.error('Firebase authentication initialization failed:', initializationError);
        }
        setStatus('unavailable');
        setError('Google sign-in is temporarily unavailable.');
      });

    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, []);

  const runAuthAction = useCallback(async (action: (client: FirebaseAuthClient) => Promise<void>) => {
    const client = clientRef.current;
    if (!client || pendingRef.current) return;

    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      await action(client);
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await runAuthAction(async (client) => {
      const nextUser = await client.signInWithGoogle();
      setUser(toAuthUser(nextUser));
      setStatus('authenticated');
    });
  }, [runAuthAction]);

  const signOut = useCallback(async () => {
    await runAuthAction(async (client) => {
      await client.signOut();
      setUser(null);
      setStatus('anonymous');
    });
  }, [runAuthAction]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(() => ({
    state: { status, user, pending, error },
    actions: { signInWithGoogle, signOut, clearError },
  }), [status, user, pending, error, signInWithGoogle, signOut, clearError]);

  return <AuthContext value={value}>{children}</AuthContext>;
};
