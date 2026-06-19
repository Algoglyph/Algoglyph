import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

export interface UserSession {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export const loginWithGoogle = async (): Promise<UserSession> => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error("Firebase is not configured");
  }
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    uid: user.uid,
    name: user.displayName || "Google User",
    email: user.email || "",
    avatarUrl: user.photoURL || ""
  };
};

export const logoutUser = async (): Promise<void> => {
  if (!isFirebaseConfigured || !auth) {
    return;
  }
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: UserSession | null) => void) => {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      callback({
        uid: user.uid,
        name: user.displayName || "Google User",
        email: user.email || "",
        avatarUrl: user.photoURL || ""
      });
    } else {
      callback(null);
    }
  });
};
