import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth as authApi, UserWithPlan, setTokenSource } from './api';
import {
  signInWithGoogle as firebaseSignInWithGoogle,
  completeGoogleRedirectSignIn,
  sendMagicLink as firebaseSendMagicLink,
  completeMagicLinkSignIn,
  firebaseSignOut,
  subscribeToAuthState,
  isFirebaseEnabled,
} from './firebase';

interface AuthState {
  user: UserWithPlan | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isFirebaseAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const firebaseAuthInitialized = useRef(false);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.me();
      setState({ user, loading: false, error: null });
    } catch {
      authApi.logout();
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  // Handle magic link and Google redirect completion on page load
  useEffect(() => {
    async function handleAuthCallbacks() {
      try {
        // Check Google redirect result first
        const googleToken = await completeGoogleRedirectSignIn();
        if (googleToken) {
          const { user } = await authApi.firebaseVerify(googleToken);
          setState({ user, loading: false, error: null });
          return;
        }

        // Then check magic link
        const magicLinkToken = await completeMagicLinkSignIn();
        if (magicLinkToken) {
          const { user } = await authApi.firebaseVerify(magicLinkToken);
          setState({ user, loading: false, error: null });
        }
      } catch (err) {
        console.error('Auth callback failed:', err);
        setState(s => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Sign-in failed',
        }));
      }
    }

    if (isFirebaseEnabled()) {
      handleAuthCallbacks();
    }
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    if (!isFirebaseEnabled()) {
      // No Firebase - check for legacy token
      if (authApi.hasLegacyToken()) {
        refreshUser();
      } else {
        setState({ user: null, loading: false, error: null });
      }
      return;
    }

    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        if (!firebaseAuthInitialized.current) {
          firebaseAuthInitialized.current = true;
          try {
            const idToken = await firebaseUser.getIdToken();
            const { user } = await authApi.firebaseVerify(idToken);
            setState({ user, loading: false, error: null });
          } catch (err) {
            console.error('Firebase auth verification failed:', err);
            // Fallback to legacy token check
            if (authApi.hasLegacyToken()) {
              refreshUser();
            } else {
              setState({ user: null, loading: false, error: null });
            }
          }
        }
      } else {
        // No Firebase user - check for legacy token
        firebaseAuthInitialized.current = false;
        if (authApi.hasLegacyToken()) {
          refreshUser();
        } else {
          setState({ user: null, loading: false, error: null });
        }
      }
    });

    return () => unsubscribe();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      await authApi.login(email, password);
      const fullUser = await authApi.me();
      setState({ user: fullUser, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      await authApi.register(email, password, name);
      const fullUser = await authApi.me();
      setState({ user: fullUser, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    console.log('[Auth] loginWithGoogle called');
    setState((s) => ({ ...s, error: null }));
    try {
      const idToken = await firebaseSignInWithGoogle();
      console.log('[Auth] Got idToken:', idToken ? `${idToken.substring(0, 20)}...` : 'null');
      if (!idToken) {
        // Redirect flow started; token will be handled on page load.
        console.log('[Auth] No token, redirect flow started');
        return;
      }
      console.log('[Auth] Calling firebaseVerify...');
      const { user } = await authApi.firebaseVerify(idToken);
      console.log('[Auth] firebaseVerify success, user:', user.email);
      setState({ user, loading: false, error: null });
    } catch (err) {
      console.error('[Auth] loginWithGoogle error:', err);
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      await firebaseSendMagicLink(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send magic link';
      setState((s) => ({ ...s, error: message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    authApi.logout();
    if (isFirebaseEnabled()) {
      await firebaseSignOut();
    }
    setTokenSource('legacy');
    firebaseAuthInitialized.current = false;
    setState({ user: null, loading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        loginWithGoogle,
        sendMagicLink,
        logout,
        refreshUser,
        isFirebaseAvailable: isFirebaseEnabled(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
