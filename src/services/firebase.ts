import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

// Only initialize if config is present
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

export function isFirebaseEnabled(): boolean {
  return isFirebaseConfigured && auth !== null;
}

export async function signInWithGoogle(): Promise<string | null> {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user.getIdToken();
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

export async function sendMagicLink(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  const actionCodeSettings = {
    url: import.meta.env.VITE_APP_URL || window.location.origin,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);

  // Save email for verification when user returns
  localStorage.setItem('magicLinkEmail', email);
}

export async function completeMagicLinkSignIn(): Promise<string | null> {
  if (!auth) {
    return null;
  }

  // Check if this is a magic link callback
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  // Get email from localStorage or prompt user
  let email = localStorage.getItem('magicLinkEmail');
  if (!email) {
    email = window.prompt('Please enter your email for confirmation');
    if (!email) {
      throw new Error('Email is required to complete sign in');
    }
  }

  const result = await signInWithEmailLink(auth, email, window.location.href);
  localStorage.removeItem('magicLinkEmail');

  // Clean up URL
  window.history.replaceState({}, document.title, window.location.pathname);

  return result.user.getIdToken();
}

export async function getIdToken(): Promise<string | null> {
  if (!auth || !auth.currentUser) {
    return null;
  }

  return auth.currentUser.getIdToken();
}

export async function firebaseSignOut(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth?.currentUser || null;
}
