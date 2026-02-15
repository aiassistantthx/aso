import React from 'react';
import { billing, PricingResponse } from '../services/api';

export type UpgradeLimitType =
  | 'lifetimeProjects'
  | 'generations'
  | 'targetLanguages'
  | 'generic';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: UpgradeLimitType;
  currentUsage?: number;
  maxAllowed?: number;
}

const LIMIT_CONTENT: Record<UpgradeLimitType, {
  icon: string;
  title: string;
  description: string;
  features: string[];
}> = {
  lifetimeProjects: {
    icon: '📁',
    title: 'Project Limit Reached',
    description: 'You\'ve used your free project. Upgrade to Pro to create unlimited projects.',
    features: [
      'Unlimited projects',
      'Unlimited AI generations',
      'All 40+ languages',
      'Priority support',
    ],
  },
  generations: {
    icon: '✨',
    title: 'Generation Limit Reached',
    description: 'You\'ve used all 3 free AI generations. Upgrade to Pro for unlimited generations.',
    features: [
      'Unlimited AI generations',
      'Regenerate as many times as needed',
      'All 40+ languages',
      'Priority support',
    ],
  },
  targetLanguages: {
    icon: '🌍',
    title: 'Unlock All Languages',
    description: 'Free plan includes 2 additional languages. Upgrade to Pro for all 40+ languages.',
    features: [
      'All 40+ languages',
      'Unlimited projects',
      'Unlimited AI generations',
      'Priority support',
    ],
  },
  generic: {
    icon: '⚡',
    title: 'Upgrade to Pro',
    description: 'Unlock the full power of LocalizeShots with a Pro subscription.',
    features: [
      'Unlimited projects',
      'Unlimited AI generations',
      'All 40+ languages',
      'Priority support',
    ],
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

export function UpgradeModal({ isOpen, onClose, limitType, currentUsage, maxAllowed }: UpgradeModalProps) {
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pricing, setPricing] = React.useState<PricingResponse | null>(null);
  const [priceLoading, setPriceLoading] = React.useState(false);
  const [selectedInterval, setSelectedInterval] = React.useState<'month' | 'year'>('year');
  const [promoOpen, setPromoOpen] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setPriceLoading(true);
    setError(null);
    billing.prices()
      .then(data => setPricing(data))
      .catch(() => setError('Failed to load pricing'))
      .finally(() => setPriceLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const content = LIMIT_CONTENT[limitType];

  const selectedProductId = pricing
    ? (selectedInterval === 'year' ? pricing.yearly.productId : pricing.monthly.productId)
    : undefined;

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    setError(null);
    try {
      const code = promoCode.trim() || undefined;
      const { url } = await billing.checkout(selectedProductId, code);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setCheckoutLoading(false);
    }
  };

  const isMonthSelected = selectedInterval === 'month';
  const isYearSelected = selectedInterval === 'year';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>×</button>

        <div style={styles.iconWrapper}>
          <span style={styles.icon}>{content.icon}</span>
        </div>

        <h2 style={styles.title}>{content.title}</h2>

        <p style={styles.description}>{content.description}</p>

        {priceLoading && (
          <div style={styles.priceLoading}>Loading prices...</div>
        )}

        {error && !priceLoading && (
          <div style={styles.error}>{error}</div>
        )}

        {!priceLoading && pricing && (<>
          {currentUsage !== undefined && maxAllowed !== undefined && (
            <div style={styles.usageBar}>
              <div style={styles.usageLabel}>
                {currentUsage} / {maxAllowed} used
              </div>
              <div style={styles.usageTrack}>
                <div
                  style={{
                    ...styles.usageFill,
                    width: `${Math.min(100, (currentUsage / maxAllowed) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div style={styles.features}>
            <div style={styles.featuresTitle}>PRO includes:</div>
            {content.features.map((feature, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.checkmark}>✓</span>
                {feature}
              </div>
            ))}
          </div>

          <div style={styles.cardsRow}>
            {/* Monthly card */}
            <div
              style={{
                ...styles.card,
                borderColor: isMonthSelected ? '#FF6B4A' : '#e5e7eb',
                backgroundColor: isMonthSelected ? '#fff8f6' : '#fff',
              }}
              onClick={() => setSelectedInterval('month')}
            >
              <div style={styles.cardLabel}>Monthly</div>
              <div style={styles.cardPrice}>{formatPrice(pricing.monthly.priceCents)}</div>
              <div style={styles.cardSub}>per month</div>
            </div>

            {/* Yearly card */}
            <div
              style={{
                ...styles.card,
                borderColor: isYearSelected ? '#FF6B4A' : '#e5e7eb',
                backgroundColor: isYearSelected ? '#fff8f6' : '#fff',
              }}
              onClick={() => setSelectedInterval('year')}
            >
              {pricing.savingsPercent > 0 && (
                <div style={styles.badge}>Save {pricing.savingsPercent}%</div>
              )}
              <div style={styles.cardLabel}>Yearly</div>
              <div style={styles.cardPrice}>
                {formatPrice(pricing.yearly.perMonthCents ?? 0)}
              </div>
              <div style={styles.cardSub}>per month</div>
              <div style={styles.cardYearlyTotal}>
                {formatPrice(pricing.yearly.priceCents)} / year
              </div>
            </div>
          </div>

          {/* Promo code collapsible */}
          <div style={styles.promoSection}>
            <div
              style={styles.promoToggle}
              onClick={() => setPromoOpen(!promoOpen)}
            >
              <span>Have a promo code?</span>
              <span style={{
                ...styles.promoChevron,
                transform: promoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>&#9662;</span>
            </div>
            {promoOpen && (
              <input
                style={styles.promoInput}
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
              />
            )}
          </div>

          <button
            style={{
              ...styles.upgradeButton,
              opacity: checkoutLoading ? 0.7 : 1,
            }}
            onClick={handleUpgrade}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Loading...' : 'Upgrade to Pro'}
          </button>

          <button style={styles.cancelButton} onClick={onClose}>
            Maybe later
          </button>
        </>)}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 520,
    width: '100%',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    border: 'none',
    background: '#f5f5f5',
    borderRadius: '50%',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  iconWrapper: {
    textAlign: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
    margin: '0 0 12px',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    margin: '0 0 24px',
    lineHeight: 1.5,
  },
  usageBar: {
    marginBottom: 24,
  },
  usageLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  usageTrack: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    backgroundColor: '#FF6B4A',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  features: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    color: '#333',
    padding: '6px 0',
  },
  checkmark: {
    color: '#22c55e',
    fontWeight: 700,
  },
  priceLoading: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: '16px 0',
  },
  cardsRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    padding: '20px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
    position: 'relative',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  cardSub: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  cardYearlyTotal: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -6,
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8F6B 100%)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 6,
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  promoSection: {
    marginBottom: 16,
  },
  promoToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontSize: 13,
    color: '#999',
    cursor: 'pointer',
    userSelect: 'none' as const,
    padding: '4px 0',
  },
  promoChevron: {
    fontSize: 10,
    transition: 'transform 0.2s ease',
  },
  promoInput: {
    width: '100%',
    marginTop: 8,
    padding: '10px 12px',
    fontSize: 14,
    border: '1.5px solid #e5e7eb',
    borderRadius: 8,
    outline: 'none',
    color: '#1a1a1a',
    boxSizing: 'border-box' as const,
  },
  upgradeButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8F6B 100%)',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    marginBottom: 12,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cancelButton: {
    width: '100%',
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 500,
    color: '#666',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};

export default UpgradeModal;
