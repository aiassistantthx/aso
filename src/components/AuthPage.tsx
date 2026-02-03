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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
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
    background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(0, 113, 227, 0.35)',
    marginTop: '8px',
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
  toggle: {
    fontSize: '14px',
    color: '#86868b',
    textAlign: 'center',
    marginTop: '20px',
  },
  toggleLink: {
    color: '#0071e3',
    cursor: 'pointer',
    fontWeight: 600,
    border: 'none',
    background: 'none',
    fontSize: '14px',
    padding: 0,
  },
};

export const AuthPage: React.FC<Props> = ({ mode, onToggleMode, onSuccess }) => {
  const { login, register, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
                  e.currentTarget.style.borderColor = '#0071e3';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.12)';
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

          {(error || authError) && (
            <div style={styles.error as React.CSSProperties}>
              {error || authError}
            </div>
          )}

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
        </form>

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
