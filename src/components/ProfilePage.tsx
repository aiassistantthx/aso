import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { AppHeader } from './AppHeader';
import { billing, PricingResponse } from '../services/api';

// Inject responsive styles for ProfilePage
if (typeof document !== 'undefined' && !document.getElementById('profile-page-responsive')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'profile-page-responsive';
  styleEl.textContent = `
    @media (max-width: 768px) {
      .profile-content {
        padding: 24px 16px !important;
      }
      .profile-card {
        padding: 20px !important;
      }
      .profile-title {
        font-size: 26px !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

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
};

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

function formatPrice(cents: number): string {
  return fmt.format(cents / 100);
}

const CANCEL_REASONS: { value: string; label: string }[] = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'unused', label: 'Not using it enough' },
  { value: 'switched_service', label: 'Switched to another service' },
  { value: 'other', label: 'Other reason' },
];

export const ProfilePage: React.FC<Props> = ({ onNavigate }) => {
  const { user, logout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('year');
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const plan = user?.plan ?? 'FREE';
  const isCanceled = user?.subscription?.status === 'canceled';

  useEffect(() => {
    if (plan !== 'FREE') return;
    setPriceLoading(true);
    billing.prices()
      .then(data => setPricing(data))
      .catch(() => {})
      .finally(() => setPriceLoading(false));
  }, [plan]);

  if (!user) return null;

  const selectedProductId = pricing
    ? (selectedInterval === 'year' ? pricing.yearly.productId : pricing.monthly.productId)
    : undefined;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const code = promoCode.trim() || undefined;
      const { url } = await billing.checkout(selectedProductId, code);
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

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setError(null);
    try {
      const reason = cancelReason || undefined;
      await billing.cancel(reason);
      await refreshUser();
      setShowCancelConfirm(false);
      setCancelReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
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
                <span style={{ fontSize: '13px', fontWeight: 400, color: isCanceled ? '#92400e' : '#86868b' }}>
                  {isCanceled
                    ? `(canceled — active until ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()})`
                    : `(active until ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()})`
                  }
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

              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#86868b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '12px' }}>
                  PRO includes:
                </div>
                {['Unlimited projects', 'All 40+ languages', 'AI-powered ASO metadata generation', 'AI app icon generation', 'Priority support'].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', fontSize: '14px', color: '#424245' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              {priceLoading && (
                <div style={{ textAlign: 'center', color: '#86868b', fontSize: '14px', padding: '16px 0' }}>
                  Loading prices...
                </div>
              )}

              {!priceLoading && pricing && (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    {/* Monthly card */}
                    <div
                      style={{
                        flex: 1,
                        border: `2px solid ${selectedInterval === 'month' ? '#FF6B4A' : '#e0e0e5'}`,
                        borderRadius: '12px',
                        padding: '20px 16px',
                        textAlign: 'center' as const,
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, background-color 0.2s',
                        backgroundColor: selectedInterval === 'month' ? '#fff8f6' : '#fff',
                      }}
                      onClick={() => setSelectedInterval('month')}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#86868b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px' }}>Monthly</div>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#1d1d1f' }}>{formatPrice(pricing.monthly.priceCents)}</div>
                      <div style={{ fontSize: '13px', color: '#86868b', marginTop: '2px' }}>per month</div>
                    </div>

                    {/* Yearly card */}
                    <div
                      style={{
                        flex: 1,
                        border: `2px solid ${selectedInterval === 'year' ? '#FF6B4A' : '#e0e0e5'}`,
                        borderRadius: '12px',
                        padding: '20px 16px',
                        textAlign: 'center' as const,
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, background-color 0.2s',
                        backgroundColor: selectedInterval === 'year' ? '#fff8f6' : '#fff',
                        position: 'relative' as const,
                      }}
                      onClick={() => setSelectedInterval('year')}
                    >
                      {pricing.savingsPercent > 0 && (
                        <div style={{
                          position: 'absolute' as const,
                          top: '-10px',
                          right: '-6px',
                          background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8F6B 100%)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}>Save {pricing.savingsPercent}%</div>
                      )}
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#86868b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px' }}>Yearly</div>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#1d1d1f' }}>{formatPrice(pricing.yearly.perMonthCents ?? 0)}</div>
                      <div style={{ fontSize: '13px', color: '#86868b', marginTop: '2px' }}>per month</div>
                      <div style={{ fontSize: '12px', color: '#86868b', marginTop: '8px' }}>{formatPrice(pricing.yearly.priceCents)} / year</div>
                    </div>
                  </div>

                  {/* Promo code */}
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: '#86868b', cursor: 'pointer', userSelect: 'none' as const, padding: '4px 0' }}
                      onClick={() => setPromoOpen(!promoOpen)}
                    >
                      <span>Have a promo code?</span>
                      <span style={{ fontSize: '10px', transition: 'transform 0.2s ease', transform: promoOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>&#9662;</span>
                    </div>
                    {promoOpen && (
                      <input
                        style={{
                          width: '100%',
                          marginTop: '8px',
                          padding: '10px 12px',
                          fontSize: '14px',
                          border: '1.5px solid #e0e0e5',
                          borderRadius: '8px',
                          outline: 'none',
                          color: '#1d1d1f',
                          boxSizing: 'border-box' as const,
                        }}
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                      />
                    )}
                  </div>
                </>
              )}

              <button
                style={{ ...styles.upgradeButton, marginTop: '4px', opacity: loading ? 0.7 : 1 }}
                onClick={handleUpgrade}
                disabled={loading || priceLoading}
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
              {isCanceled && user?.subscription?.currentPeriodEnd && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  color: '#92400e',
                  fontSize: '14px',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}>
                  Your subscription is canceled. You'll keep PRO access until{' '}
                  <strong>{new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}</strong>.
                </div>
              )}

              {!isCanceled && (
                <p style={{ fontSize: '15px', color: '#424245', marginBottom: '16px', lineHeight: 1.5 }}>
                  You have access to all PRO features. Manage your subscription or view billing history.
                </p>
              )}

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

              {!isCanceled && !showCancelConfirm && (
                <button
                  style={{
                    ...styles.logoutButton,
                    marginTop: '12px',
                    color: '#ff3b30',
                    border: '1px solid #ff3b30',
                  }}
                  onClick={() => setShowCancelConfirm(true)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  Cancel Subscription
                </button>
              )}

              {showCancelConfirm && (
                <div style={{
                  marginTop: '16px',
                  padding: '20px',
                  backgroundColor: '#fef2f2',
                  borderRadius: '12px',
                  border: '1px solid #fecaca',
                }}>
                  <p style={{ fontSize: '15px', color: '#1d1d1f', fontWeight: 600, marginBottom: '8px' }}>
                    Are you sure you want to cancel?
                  </p>
                  {user?.subscription?.currentPeriodEnd && (
                    <p style={{ fontSize: '14px', color: '#424245', marginBottom: '16px', lineHeight: 1.5 }}>
                      You'll keep PRO access until{' '}
                      <strong>{new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}</strong>.
                      After that, your plan will revert to Free.
                    </p>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#86868b', display: 'block', marginBottom: '6px' }}>
                      Reason for canceling (optional)
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1.5px solid #e0e0e5',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        color: '#1d1d1f',
                        outline: 'none',
                        boxSizing: 'border-box' as const,
                      }}
                    >
                      <option value="">Select a reason...</option>
                      {CANCEL_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '10px',
                        backgroundColor: '#ff3b30',
                        color: '#fff',
                        cursor: cancelLoading ? 'not-allowed' : 'pointer',
                        opacity: cancelLoading ? 0.7 : 1,
                      }}
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? 'Canceling...' : 'Confirm Cancellation'}
                    </button>
                    <button
                      style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: '1px solid #e0e0e5',
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        color: '#1d1d1f',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setShowCancelConfirm(false);
                        setCancelReason('');
                      }}
                      disabled={cancelLoading}
                    >
                      Keep Subscription
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Contact</h2>
          <p style={{ fontSize: '15px', color: '#424245', lineHeight: 1.6 }}>
            Have any questions, feedback, or suggestions? Feel free to reach out at{' '}
            <a
              href="mailto:i@sparrowcorp.io"
              style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 600 }}
            >
              i@sparrowcorp.io
            </a>
          </p>
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
