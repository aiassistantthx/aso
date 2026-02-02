import React from 'react';
import { useAuth } from '../services/authContext';
import { AppHeader } from './AppHeader';

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
};

export const ProfilePage: React.FC<Props> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const plan = user.plan ?? 'FREE';

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
                color: plan === 'PRO' ? '#248a3d' : '#0071e3',
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
