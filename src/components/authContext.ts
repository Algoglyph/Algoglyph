import { createContext, use } from 'react';

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated' | 'unavailable';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  pending: boolean;
  error: string | null;
}

export interface AuthActions {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export interface AuthContextValue {
  state: AuthState;
  actions: AuthActions;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
};
