import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { AppHeader } from './AppHeader';
import { billing } from '../services/api';

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.72)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
  },
  backButton: {
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 600,
    border: '1px solid #e0e0e5',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1d1d1f',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '18px',
    padding: '32px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '24px',
  },
  field: {
    marginBottom: '20px',
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#86868b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  fieldValue: {
    fontSize: '16px',
    color: '#1d1d1f',
    fontWeight: 500,
  },
  planBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
  },
  logoutButton: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    border: '1px solid #ff3b30',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#ff3b30',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  upgradeButton: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 12px rgba(255, 107, 74, 0.3)',
  },
  manageButton: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 600,
    border: '1px solid #e0e0e5',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  proFeaturesList: {
    marginTop: '16px',
    paddingLeft: '0',
    listStyle: 'none',
  },
  proFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    fontSize: '14px',
    color: '#424245',
  },
};

export const ProfilePage: React.FC<Props> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const plan = user.plan ?? 'FREE';

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await billing.checkout();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await billing.portal();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open subscription portal');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <AppHeader currentPage="profile" onNavigate={onNavigate} />

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Account</h2>

          <div style={styles.field}>
            <div style={styles.fieldLabel}>Name</div>
            <div style={styles.fieldValue}>{user.name || 'Not set'}</div>
          </div>

          <div style={styles.field}>
            <div style={styles.fieldLabel}>Email</div>
            <div style={styles.fieldValue}>{user.email}</div>
          </div>

          <div style={styles.field}>
            <div style={styles.fieldLabel}>Plan</div>
            <div
              style={{
                ...styles.planBadge,
                backgroundColor: plan === 'PRO' ? '#e8f9ed' : '#f0f7ff',
                color: plan === 'PRO' ? '#248a3d' : '#FF6B4A',
              }}
            >
              {plan === 'PRO' ? 'Pro' : 'Free'}
              {plan === 'PRO' && user.subscription && (
                <span style={{ fontSize: '13px', fontWeight: 400, color: '#86868b' }}>
                  (active until {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Subscription</h2>

          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fff5f5',
              border: '1px solid #ffccc7',
              borderRadius: '10px',
              color: '#ff3b30',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {plan === 'FREE' ? (
            <>
              <p style={{ fontSize: '15px', color: '#424245', marginBottom: '16px', lineHeight: 1.5 }}>
                Upgrade to PRO to unlock all features:
              </p>
              <ul style={styles.proFeaturesList}>
                <li style={styles.proFeature}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#e8f9ed"/>
                    <path d="M8 12l3 3 5-6" stroke="#248a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Unlimited projects
                </li>
                <li style={styles.proFeature}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#e8f9ed"/>
                    <path d="M8 12l3 3 5-6" stroke="#248a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  All 40+ languages
                </li>
                <li style={styles.proFeature}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#e8f9ed"/>
                    <path d="M8 12l3 3 5-6" stroke="#248a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  AI-powered ASO metadata generation
                </li>
                <li style={styles.proFeature}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#e8f9ed"/>
                    <path d="M8 12l3 3 5-6" stroke="#248a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  AI app icon generation
                </li>
                <li style={styles.proFeature}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#e8f9ed"/>
                    <path d="M8 12l3 3 5-6" stroke="#248a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Priority support
                </li>
              </ul>
              <button
                style={{ ...styles.upgradeButton, marginTop: '20px', opacity: loading ? 0.7 : 1 }}
                onClick={handleUpgrade}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {loading ? 'Processing...' : 'Upgrade to PRO'}
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '15px', color: '#424245', marginBottom: '16px', lineHeight: 1.5 }}>
                You have access to all PRO features. Manage your subscription or view billing history.
              </p>
              <button
                style={{ ...styles.manageButton, opacity: loading ? 0.7 : 1 }}
                onClick={handleManageSubscription}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#f5f5f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                {loading ? 'Processing...' : 'Manage Subscription'}
              </button>
            </>
          )}
        </div>

        <div style={styles.card}>
          <button
            style={styles.logoutButton}
            onClick={() => {
              logout();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fff5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
