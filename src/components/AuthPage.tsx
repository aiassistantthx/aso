import React, { useState } from 'react';
import { useAuth } from '../services/authContext';

interface Props {
  mode: 'login' | 'register';
  onToggleMode: () => void;
  onSuccess: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f7',
    padding: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '32px',
    justifyContent: 'center',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.5px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '8px',
    textAlign: 'center',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '28px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '6px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: '1px solid #e0e0e5',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
    marginTop: '8px',
  },
  googleButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 600,
    border: '1px solid #e0e0e5',
    borderRadius: '12px',
    background: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  magicLinkButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 600,
    border: '1px solid #e0e0e5',
    borderRadius: '12px',
    background: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e0e5',
  },
  dividerText: {
    fontSize: '13px',
    color: '#86868b',
    fontWeight: 500,
  },
  error: {
    color: '#ff3b30',
    fontSize: '14px',
    padding: '12px 16px',
    backgroundColor: '#fff5f5',
    borderRadius: '10px',
    border: '1px solid #ffebeb',
    textAlign: 'center',
  },
  success: {
    color: '#34c759',
    fontSize: '14px',
    padding: '12px 16px',
    backgroundColor: '#f0fff4',
    borderRadius: '10px',
    border: '1px solid #c6f6d5',
    textAlign: 'center',
  },
  toggle: {
    fontSize: '14px',
    color: '#86868b',
    textAlign: 'center',
    marginTop: '20px',
  },
  toggleLink: {
    color: '#FF6B4A',
    cursor: 'pointer',
    fontWeight: 600,
    border: 'none',
    background: 'none',
    fontSize: '14px',
    padding: 0,
  },
  authMethods: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '4px',
  },
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const MagicLinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const AuthPage: React.FC<Props> = ({ mode, onToggleMode, onSuccess }) => {
  const { login, register, loginWithGoogle, sendMagicLink, error: authError, isFirebaseAvailable } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(email, password, name || undefined);
      } else {
        await login(email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setMagicLinkLoading(true);

    try {
      await sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logoContainer as React.CSSProperties}>
            <div style={styles.logoIcon as React.CSSProperties}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="3" stroke="white" strokeWidth="2" />
                <rect x="7" y="8" width="10" height="8" rx="1" fill="white" opacity="0.5" />
              </svg>
            </div>
            <span style={styles.logoText}>LocalizeShots</span>
          </div>

          <h1 style={styles.title as React.CSSProperties}>Check your email</h1>
          <p style={styles.subtitle as React.CSSProperties}>
            We sent a sign-in link to <strong>{email}</strong>
          </p>

          <div style={styles.success as React.CSSProperties}>
            Click the link in the email to sign in. You can close this page.
          </div>

          <p style={styles.toggle as React.CSSProperties}>
            Didn't receive the email?{' '}
            <button
              style={styles.toggleLink}
              onClick={() => {
                setMagicLinkSent(false);
                setError('');
              }}
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer as React.CSSProperties}>
          <div style={styles.logoIcon as React.CSSProperties}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="white" strokeWidth="2" />
              <rect x="7" y="8" width="10" height="8" rx="1" fill="white" opacity="0.5" />
            </svg>
          </div>
          <span style={styles.logoText}>LocalizeShots</span>
        </div>

        <h1 style={styles.title as React.CSSProperties}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={styles.subtitle as React.CSSProperties}>
          {mode === 'login'
            ? 'Sign in to access your projects'
            : 'Start creating App Store screenshots'}
        </p>

        {(error || authError) && (
          <div style={{ ...styles.error as React.CSSProperties, marginBottom: '16px' }}>
            {error || authError}
          </div>
        )}

        {isFirebaseAvailable && !showEmailForm && (
          <>
            <div style={styles.authMethods as React.CSSProperties}>
              <button
                type="button"
                style={{
                  ...styles.googleButton,
                  opacity: googleLoading ? 0.7 : 1,
                  cursor: googleLoading ? 'not-allowed' : 'pointer',
                }}
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                onMouseEnter={(e) => {
                  if (!googleLoading) e.currentTarget.style.backgroundColor = '#f5f5f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <GoogleIcon />
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              <div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={styles.label}>Email for Magic Link</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={styles.input}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0071e3';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e5';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <button
                  type="button"
                  style={{
                    ...styles.magicLinkButton,
                    opacity: magicLinkLoading ? 0.7 : 1,
                    cursor: magicLinkLoading ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleMagicLink}
                  disabled={magicLinkLoading}
                  onMouseEnter={(e) => {
                    if (!magicLinkLoading) e.currentTarget.style.backgroundColor = '#f5f5f7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  <MagicLinkIcon />
                  {magicLinkLoading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </div>
            </div>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or use password</span>
              <div style={styles.dividerLine} />
            </div>

            <button
              type="button"
              style={{
                ...styles.toggleLink,
                width: '100%',
                textAlign: 'center',
                padding: '12px',
                marginBottom: '8px',
              }}
              onClick={() => setShowEmailForm(true)}
            >
              {mode === 'login' ? 'Sign in with email and password' : 'Sign up with email and password'}
            </button>
          </>
        )}

        {(!isFirebaseAvailable || showEmailForm) && (
          <form onSubmit={handleSubmit} style={styles.form as React.CSSProperties}>
            {mode === 'register' && (
              <div>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B4A';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 74, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e5';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            <div>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0071e3';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                required
                minLength={6}
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0071e3';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign In' : 'Create Account')
              }
            </button>

            {isFirebaseAvailable && showEmailForm && (
              <button
                type="button"
                style={{
                  ...styles.toggleLink,
                  width: '100%',
                  textAlign: 'center',
                  padding: '12px',
                }}
                onClick={() => setShowEmailForm(false)}
              >
                Back to other sign-in options
              </button>
            )}
          </form>
        )}

        <p style={styles.toggle as React.CSSProperties}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button style={styles.toggleLink} onClick={onToggleMode}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};
