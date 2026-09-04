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
  appCheckSiteKey: import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY ?? '',
};

const missingFirebaseKeys = Object.entries({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
})
  .filter(([, value]) => value.trim().length === 0)
  .map(([key]) => key);
const isFirebaseConfigured = missingFirebaseKeys.length === 0;
const isElectron = typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent);
const canUseFirebaseAuth = typeof window !== 'undefined' && !isElectron && isFirebaseConfigured;
const firebaseVariableByKey: Record<string, string> = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};
const missingFirebaseVariables = missingFirebaseKeys.map((key) => firebaseVariableByKey[key] ?? key);
const unavailableReason = isElectron
  ? 'Cloud accounts and billing are available in the web app; the desktop workspace remains local-first.'
  : !isFirebaseConfigured
    ? `Authentication is not configured. Missing: ${missingFirebaseVariables.join(', ')}.`
    : null;

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

  const reauthenticateWithGoogle = useCallback(async (): Promise<boolean> => {
    const client = clientRef.current;
    if (!client || pendingRef.current) return false;
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      const nextUser = await client.reauthenticateWithGoogle();
      setUser(toAuthUser(nextUser));
      setStatus('authenticated');
      return true;
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      return false;
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const getIdToken = useCallback(async () => {
    const client = clientRef.current;
    if (!client) throw new Error('Google sign-in is unavailable.');
    return client.getIdToken();
  }, []);
  const getAppCheckToken = useCallback(async () => {
    const client = clientRef.current;
    if (!client) throw new Error('Google sign-in is unavailable.');
    return client.getAppCheckToken();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    state: {
      status,
      user,
      pending,
      error,
      unavailableReason,
      missingConfiguration: missingFirebaseVariables,
    },
    actions: {
      signInWithGoogle,
      signOut,
      reauthenticateWithGoogle,
      clearError,
      getIdToken,
      getAppCheckToken,
    },
  }), [status, user, pending, error, signInWithGoogle, signOut, reauthenticateWithGoogle, clearError, getIdToken, getAppCheckToken]);

  return <AuthContext value={value}>{children}</AuthContext>;
};
