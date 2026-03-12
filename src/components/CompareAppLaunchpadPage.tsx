import React, { useState, useEffect } from 'react';
import { billing, PricingResponse } from '../services/api';

// Color palette matching Landing.tsx
const colors = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  accent: '#FF6B4A',
  accentLight: '#FF8A65',
  accentBg: '#FFF5F2',
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  success: '#22C55E',
  successBg: '#ECFDF5',
};

interface Props {
  onBack: () => void;
  onGetStarted: () => void;
  onNavigate?: (page: string) => void;
}

// FAQ Schema for SEO
const FAQPageSchema = () => {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the best AppLaunchpad alternative?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LocalizeShots is a modern AppLaunchpad alternative that offers AI-powered headline generation, automatic localization to 40+ languages, ASO metadata optimization, and competitive pricing starting from $4.99/month.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does LocalizeShots compare to AppLaunchpad pricing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LocalizeShots offers a free plan with 3 projects and 2 languages, plus a Pro plan at $4.99/month (yearly) or $9.99/month. AppLaunchpad pricing typically starts at $6.99/month for basic features.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does LocalizeShots support automatic translation like AppLaunchpad?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, LocalizeShots supports one-click translation to 40+ languages with context-aware AI translation. This includes both screenshot headlines and full ASO metadata (app name, subtitle, keywords, description).',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I migrate from AppLaunchpad to LocalizeShots?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, migrating is easy. Simply upload your existing screenshots to LocalizeShots and our AI will generate new headlines and metadata. You can then translate to all your target languages with one click.',
        },
      },
      {
        '@type': 'Question',
        name: 'What features does LocalizeShots have that AppLaunchpad does not?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LocalizeShots offers AI-powered headline generation with smart bracket highlighting, ASO metadata generation following Apple best practices, AI app icon generation, and a modern visual editor with real-time preview.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData),
      }}
    />
  );
};

// Comparison table data
const comparisonFeatures = [
  {
    category: 'Screenshot Creation',
    features: [
      { name: 'Device mockup templates', localizeshots: true, applaunchpad: true },
      { name: 'Custom backgrounds', localizeshots: true, applaunchpad: true },
      { name: 'Text overlays', localizeshots: true, applaunchpad: true },
      { name: 'AI-generated headlines', localizeshots: true, applaunchpad: false },
      { name: 'Smart bracket highlighting', localizeshots: true, applaunchpad: false },
      { name: 'Real-time visual editor', localizeshots: true, applaunchpad: true },
    ],
  },
  {
    category: 'Localization',
    features: [
      { name: 'Multiple language support', localizeshots: '40+ languages', applaunchpad: '30+ languages' },
      { name: 'One-click translation', localizeshots: true, applaunchpad: true },
      { name: 'Context-aware AI translation', localizeshots: true, applaunchpad: false },
      { name: 'Screenshot + metadata translation', localizeshots: true, applaunchpad: 'Screenshots only' },
    ],
  },
  {
    category: 'ASO Tools',
    features: [
      { name: 'Metadata generation', localizeshots: true, applaunchpad: false },
      { name: 'App name optimization', localizeshots: true, applaunchpad: false },
      { name: 'Keyword suggestions', localizeshots: true, applaunchpad: false },
      { name: 'Description writing', localizeshots: true, applaunchpad: false },
      { name: "What's New generator", localizeshots: true, applaunchpad: false },
    ],
  },
  {
    category: 'Export & Integration',
    features: [
      { name: 'ZIP export by language', localizeshots: true, applaunchpad: true },
      { name: 'App Store ready formats', localizeshots: true, applaunchpad: true },
      { name: 'Metadata export (JSON)', localizeshots: true, applaunchpad: false },
    ],
  },
  {
    category: 'Additional Features',
    features: [
      { name: 'AI app icon generation', localizeshots: true, applaunchpad: false },
      { name: 'Free plan available', localizeshots: '3 projects', applaunchpad: 'Limited' },
      { name: 'Priority support', localizeshots: 'Pro plan', applaunchpad: 'Higher tiers' },
    ],
  },
];

// FAQ items
const faqItems = [
  {
    question: 'What is the best AppLaunchpad alternative?',
    answer: 'LocalizeShots is a modern AppLaunchpad alternative that offers AI-powered headline generation, automatic localization to 40+ languages, ASO metadata optimization, and competitive pricing. It is designed specifically for indie developers and small teams who need professional App Store screenshots without the complexity.',
  },
  {
    question: 'How does LocalizeShots compare to AppLaunchpad pricing?',
    answer: 'LocalizeShots offers a generous free plan with 3 projects and 2 languages. The Pro plan costs $4.99/month when billed yearly ($59.99/year) or $9.99/month billed monthly. AppLaunchpad pricing starts at $6.99/month for their Starter plan with limited features.',
  },
  {
    question: 'Does LocalizeShots support automatic translation?',
    answer: 'Yes, LocalizeShots supports one-click translation to 40+ App Store languages using context-aware AI. Unlike basic translation tools, our AI understands app marketing context and produces natural, compelling copy in each language. This includes both screenshot headlines and full ASO metadata.',
  },
  {
    question: 'Can I migrate from AppLaunchpad to LocalizeShots?',
    answer: 'Absolutely! Migrating is straightforward. Simply upload your existing app screenshots to LocalizeShots, and our AI will generate fresh headlines and metadata. You can then translate everything to your target languages with one click. Many users report the migration takes less than 30 minutes.',
  },
  {
    question: 'What unique features does LocalizeShots offer?',
    answer: 'LocalizeShots stands out with AI-powered headline generation that uses smart [bracket] highlighting to emphasize key benefits. It also includes full ASO metadata generation (app name, subtitle, keywords, description), AI app icon creation, and a step-by-step wizard that guides you through the entire process.',
  },
  {
    question: 'Is LocalizeShots suitable for agencies managing multiple apps?',
    answer: 'Yes! With the Pro plan, you get unlimited projects, making it perfect for agencies or developers with multiple apps. Each project is organized separately, and you can export localized assets for all your apps efficiently.',
  },
];

export const CompareAppLaunchpadPage: React.FC<Props> = ({ onBack, onGetStarted, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    billing.prices()
      .then(data => setPricing(data))
      .catch(() => { /* fallback to hardcoded values */ });
  }, []);

  const yearlyPerMonth = pricing ? ((pricing.yearly.perMonthCents ?? 0) / 100).toFixed(2) : '4.99';

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill={colors.successBg} />
          <path d="M9 12l2 2 4-4" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (value === false) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#FEF2F2" />
          <path d="M15 9l-6 6M9 9l6 6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return <span style={styles.featureText}>{value}</span>;
  };

  return (
    <div style={styles.container}>
      <FAQPageSchema />

      {/* Navigation */}
      <nav style={{
        ...styles.nav,
        backgroundColor: scrolled ? 'rgba(250, 250, 248, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.borderLight}` : 'none',
      }}>
        <div style={styles.navInner}>
          <button onClick={onBack} style={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white" />
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent} />
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3" />
              </svg>
            </div>
            <span style={styles.logoText}>LocalizeShots</span>
          </div>
          <button style={styles.ctaBtn} onClick={onGetStarted}>Try Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeLine} />
            <span style={styles.heroBadgeText}>AppLaunchpad Alternative</span>
            <span style={styles.heroBadgeLine} />
          </div>
          <h1 style={styles.heroTitle}>
            LocalizeShots vs<br />
            <span style={styles.heroAccent}>AppLaunchpad</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Looking for an AppLaunchpad alternative? Compare features, pricing, and capabilities
            to find the best screenshot generator for your App Store optimization needs.
          </p>
          <div style={styles.heroCtas}>
            <button style={styles.heroCtaPrimary} onClick={onGetStarted}>
              Try LocalizeShots Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <a href="#comparison" style={styles.heroCtaSecondary}>
              View Comparison
            </a>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section style={styles.summarySection}>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={styles.summaryTitle}>AI-Powered</h3>
            <p style={styles.summaryText}>Generate compelling headlines and metadata with context-aware AI</p>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth="1.5" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={colors.accent} strokeWidth="1.5" />
              </svg>
            </div>
            <h3 style={styles.summaryTitle}>40+ Languages</h3>
            <p style={styles.summaryText}>More languages than AppLaunchpad for global reach</p>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={styles.summaryTitle}>Better Value</h3>
            <p style={styles.summaryText}>Starting at ${yearlyPerMonth}/month with more features included</p>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={styles.summaryTitle}>Full ASO Suite</h3>
            <p style={styles.summaryText}>Screenshots + metadata + icons in one tool</p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="comparison" style={styles.comparisonSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>Feature Comparison</span>
          <h2 style={styles.sectionTitle}>Side-by-side comparison</h2>
          <div style={styles.sectionTitleLine} />
          <p style={styles.sectionSubtitle}>See how LocalizeShots stacks up against AppLaunchpad</p>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.comparisonTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Feature</th>
                <th style={{ ...styles.tableHeader, ...styles.tableHeaderHighlight }}>
                  <div style={styles.tableHeaderLogo}>
                    <div style={styles.tableLogoIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="2" width="18" height="20" rx="3" fill="white" />
                        <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent} />
                        <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3" />
                      </svg>
                    </div>
                    LocalizeShots
                  </div>
                </th>
                <th style={styles.tableHeader}>AppLaunchpad</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((category, categoryIndex) => (
                <React.Fragment key={categoryIndex}>
                  <tr>
                    <td colSpan={3} style={styles.categoryRow}>{category.category}</td>
                  </tr>
                  {category.features.map((feature, featureIndex) => (
                    <tr key={`${categoryIndex}-${featureIndex}`} style={styles.featureRow}>
                      <td style={styles.featureCell}>{feature.name}</td>
                      <td style={{ ...styles.featureCell, ...styles.featureCellHighlight }}>
                        {renderFeatureValue(feature.localizeshots)}
                      </td>
                      <td style={styles.featureCell}>
                        {renderFeatureValue(feature.applaunchpad)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section style={styles.pricingSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>Pricing</span>
          <h2 style={styles.sectionTitle}>Better value for your money</h2>
          <div style={styles.sectionTitleLine} />
          <p style={styles.sectionSubtitle}>Transparent pricing with more features at every tier</p>
        </div>

        <div style={styles.pricingGrid}>
          {/* LocalizeShots Card */}
          <div style={{ ...styles.pricingCard, ...styles.pricingCardHighlight }}>
            <div style={styles.pricingBadge}>Recommended</div>
            <div style={styles.pricingCardHeader}>
              <div style={styles.pricingLogo}>
                <div style={styles.tableLogoIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="2" width="18" height="20" rx="3" fill="white" />
                    <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent} />
                    <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3" />
                  </svg>
                </div>
                <span style={styles.pricingLogoText}>LocalizeShots</span>
              </div>
            </div>
            <div style={styles.pricingTiers}>
              <div style={styles.pricingTier}>
                <span style={styles.tierName}>Free</span>
                <span style={styles.tierPrice}>$0</span>
                <span style={styles.tierPeriod}>/forever</span>
              </div>
              <div style={styles.pricingTier}>
                <span style={styles.tierName}>Pro</span>
                <span style={styles.tierPrice}>${yearlyPerMonth}</span>
                <span style={styles.tierPeriod}>/month (yearly)</span>
              </div>
            </div>
            <ul style={styles.pricingFeatures}>
              <li>Free: 3 projects, 2 languages</li>
              <li>Pro: Unlimited projects</li>
              <li>Pro: 40+ languages</li>
              <li>AI headline generation</li>
              <li>ASO metadata included</li>
              <li>AI app icon generation</li>
            </ul>
            <button style={styles.pricingCta} onClick={onGetStarted}>
              Start Free
            </button>
          </div>

          {/* AppLaunchpad Card */}
          <div style={styles.pricingCard}>
            <div style={styles.pricingCardHeader}>
              <div style={styles.pricingLogo}>
                <span style={styles.pricingLogoText}>AppLaunchpad</span>
              </div>
            </div>
            <div style={styles.pricingTiers}>
              <div style={styles.pricingTier}>
                <span style={styles.tierName}>Starter</span>
                <span style={styles.tierPrice}>$6.99</span>
                <span style={styles.tierPeriod}>/month</span>
              </div>
              <div style={styles.pricingTier}>
                <span style={styles.tierName}>Pro</span>
                <span style={styles.tierPrice}>$14.99</span>
                <span style={styles.tierPeriod}>/month</span>
              </div>
            </div>
            <ul style={styles.pricingFeatures}>
              <li>Starter: 3 apps</li>
              <li>Pro: 10 apps</li>
              <li>30+ languages</li>
              <li>Manual headlines only</li>
              <li>No metadata tools</li>
              <li>No icon generation</li>
            </ul>
            <a href="https://applaunchpad.com" target="_blank" rel="noopener noreferrer" style={styles.pricingCtaSecondary}>
              Visit Site
            </a>
          </div>
        </div>
      </section>

      {/* Why Switch Section */}
      <section style={styles.whySection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>Why Switch</span>
          <h2 style={styles.sectionTitle}>Top reasons to choose LocalizeShots</h2>
          <div style={styles.sectionTitleLine} />
        </div>

        <div style={styles.reasonsGrid}>
          <div style={styles.reasonCard}>
            <div style={styles.reasonNumber}>1</div>
            <h3 style={styles.reasonTitle}>AI Does the Heavy Lifting</h3>
            <p style={styles.reasonText}>
              Stop writing headlines manually. Our AI generates compelling, conversion-focused headlines
              based on your app's features and benefits. Just review and approve.
            </p>
          </div>
          <div style={styles.reasonCard}>
            <div style={styles.reasonNumber}>2</div>
            <h3 style={styles.reasonTitle}>Complete ASO Toolkit</h3>
            <p style={styles.reasonText}>
              Beyond screenshots, LocalizeShots generates optimized app names, subtitles, keywords,
              and descriptions following Apple's ASO best practices.
            </p>
          </div>
          <div style={styles.reasonCard}>
            <div style={styles.reasonNumber}>3</div>
            <h3 style={styles.reasonTitle}>More Languages, Better Translations</h3>
            <p style={styles.reasonText}>
              Support for 40+ App Store languages with context-aware AI translation. Our translations
              understand marketing copy and produce natural, compelling text.
            </p>
          </div>
          <div style={styles.reasonCard}>
            <div style={styles.reasonNumber}>4</div>
            <h3 style={styles.reasonTitle}>Better Value</h3>
            <p style={styles.reasonText}>
              Get more features at a lower price. Our Pro plan at ${yearlyPerMonth}/month includes
              features that cost extra or are unavailable in AppLaunchpad.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={styles.faqSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>FAQ</span>
          <h2 style={styles.sectionTitle}>Frequently asked questions</h2>
          <div style={styles.sectionTitleLine} />
          <p style={styles.sectionSubtitle}>Common questions about switching from AppLaunchpad</p>
        </div>

        <div style={styles.faqList}>
          {faqItems.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.faqItem,
                borderBottom: index === faqItems.length - 1 ? 'none' : `1px solid ${colors.borderLight}`,
              }}
            >
              <button
                style={styles.faqQuestion}
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span>{item.question}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <path d="M6 9l6 6 6-6" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {expandedFaq === index && (
                <div style={styles.faqAnswer}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.finalCta}>
        <div style={styles.finalCtaContent}>
          <h2 style={styles.finalCtaTitle}>Ready to try LocalizeShots?</h2>
          <p style={styles.finalCtaText}>
            Start free with 3 projects and 2 languages. No credit card required.
          </p>
          <button style={styles.finalCtaButton} onClick={onGetStarted}>
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLogo}>
            <div style={{ ...styles.logoIcon, width: 28, height: 28 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white" />
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent} />
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3" />
              </svg>
            </div>
            <span style={{ ...styles.logoText, fontSize: 15, color: colors.textSecondary }}>LocalizeShots</span>
          </div>
          <div style={styles.footerLinks}>
            <button onClick={() => onNavigate?.('terms')} style={styles.footerLink}>Terms of Service</button>
            <span style={styles.footerLinkDivider}>|</span>
            <button onClick={() => onNavigate?.('privacy')} style={styles.footerLink}>Privacy Policy</button>
            <span style={styles.footerLinkDivider}>|</span>
            <button onClick={() => onNavigate?.('refund')} style={styles.footerLink}>Refund Policy</button>
          </div>
          <div style={styles.footerDivider} />
          <p style={styles.footerCopy}>&copy; {new Date().getFullYear()} LocalizeShots</p>
        </div>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.bg,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Navigation
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
  },
  navInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: colors.accent,
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 0',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 12px ${colors.accent}40`,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.text,
    letterSpacing: '-0.3px',
  },
  ctaBtn: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },

  // Hero
  hero: {
    paddingTop: 110,
    paddingBottom: 60,
  },
  heroContent: {
    maxWidth: 700,
    margin: '0 auto',
    textAlign: 'center',
    padding: '0 24px',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  heroBadgeLine: {
    width: 35,
    height: '0.5px',
    backgroundColor: colors.border,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.textMuted,
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: 400,
    color: colors.text,
    lineHeight: 1.15,
    letterSpacing: '-1px',
    marginBottom: 24,
  },
  heroAccent: {
    color: colors.accent,
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 1.7,
    color: colors.textSecondary,
    fontWeight: 400,
    letterSpacing: '0.2px',
    marginBottom: 36,
    maxWidth: 600,
    margin: '0 auto 36px',
  },
  heroCtas: {
    display: 'flex',
    justifyContent: 'center',
    gap: 14,
  },
  heroCtaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 6px 20px ${colors.accent}35`,
    letterSpacing: '0.3px',
  },
  heroCtaSecondary: {
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 500,
    color: colors.text,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    letterSpacing: '0.3px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  },

  // Summary Section
  summarySection: {
    padding: '40px 24px 60px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    maxWidth: 1000,
    margin: '0 auto',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    border: `1px solid ${colors.borderLight}`,
    textAlign: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.5,
    margin: 0,
  },

  // Section Header
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 48,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.accent,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: 14,
    display: 'block',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 400,
    color: colors.text,
    letterSpacing: '-0.5px',
    marginBottom: 16,
  },
  sectionTitleLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.accent,
    margin: '0 auto 16px',
  },
  sectionSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    fontWeight: 400,
    letterSpacing: '0.2px',
  },

  // Comparison Table
  comparisonSection: {
    padding: '60px 24px',
    backgroundColor: colors.card,
  },
  tableWrapper: {
    maxWidth: 900,
    margin: '0 auto',
    overflowX: 'auto',
  },
  comparisonTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 15,
  },
  tableHeader: {
    padding: '16px 20px',
    textAlign: 'left',
    fontWeight: 600,
    color: colors.text,
    borderBottom: `2px solid ${colors.border}`,
    backgroundColor: colors.bg,
  },
  tableHeaderHighlight: {
    backgroundColor: colors.accentBg,
  },
  tableHeaderLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  tableLogoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    padding: '20px 20px 12px',
    fontWeight: 600,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    backgroundColor: colors.bg,
  },
  featureRow: {
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  featureCell: {
    padding: '14px 20px',
    color: colors.text,
    verticalAlign: 'middle',
  },
  featureCellHighlight: {
    backgroundColor: `${colors.accentBg}50`,
  },
  featureText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: 500,
  },

  // Pricing Section
  pricingSection: {
    padding: '80px 24px',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
    maxWidth: 800,
    margin: '0 auto',
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    border: `1px solid ${colors.borderLight}`,
    position: 'relative',
  },
  pricingCardHighlight: {
    borderColor: colors.accent,
    borderWidth: 2,
    boxShadow: `0 8px 30px ${colors.accent}15`,
  },
  pricingBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 16px',
    backgroundColor: colors.accent,
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 20,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  pricingCardHeader: {
    marginBottom: 24,
  },
  pricingLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  pricingLogoText: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
  },
  pricingTiers: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
  },
  pricingTier: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.bg,
    borderRadius: 12,
    textAlign: 'center',
  },
  tierName: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 8,
  },
  tierPrice: {
    fontSize: 28,
    fontWeight: 500,
    color: colors.text,
  },
  tierPeriod: {
    fontSize: 13,
    color: colors.textMuted,
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px',
  },
  pricingCta: {
    width: '100%',
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 4px 14px ${colors.accent}35`,
  },
  pricingCtaSecondary: {
    display: 'block',
    width: '100%',
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
    backgroundColor: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    textDecoration: 'none',
    textAlign: 'center',
  },

  // Why Section
  whySection: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  reasonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
    maxWidth: 900,
    margin: '0 auto',
  },
  reasonCard: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
  },
  reasonNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentBg,
    color: colors.accent,
    fontSize: 14,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
  },
  reasonText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },

  // FAQ Section
  faqSection: {
    padding: '80px 24px',
  },
  faqList: {
    maxWidth: 700,
    margin: '0 auto',
    backgroundColor: colors.card,
    borderRadius: 16,
    border: `1px solid ${colors.borderLight}`,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  faqQuestion: {
    width: '100%',
    padding: '20px 24px',
    fontSize: 16,
    fontWeight: 500,
    color: colors.text,
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  faqAnswer: {
    padding: '0 24px 20px',
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 1.7,
  },

  // Final CTA
  finalCta: {
    padding: '80px 24px',
    backgroundColor: colors.accentBg,
  },
  finalCtaContent: {
    maxWidth: 600,
    margin: '0 auto',
    textAlign: 'center',
  },
  finalCtaTitle: {
    fontSize: 32,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 16,
  },
  finalCtaText: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  finalCtaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 6px 20px ${colors.accent}35`,
  },

  // Footer
  footer: {
    padding: '28px 24px',
    backgroundColor: colors.bg,
    borderTop: `1px solid ${colors.borderLight}`,
  },
  footerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  footerDivider: {
    width: '0.5px',
    height: 14,
    backgroundColor: colors.border,
  },
  footerCopy: {
    fontSize: 12,
    color: colors.textMuted,
    margin: 0,
    fontWeight: 400,
    letterSpacing: '0.2px',
  },
  footerLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  footerLink: {
    background: 'none',
    border: 'none',
    fontSize: 12,
    color: colors.textMuted,
    cursor: 'pointer',
    padding: 0,
    fontWeight: 400,
    letterSpacing: '0.2px',
  },
  footerLinkDivider: {
    color: colors.border,
    fontSize: 12,
  },
};

// Add responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 900px) {
    .compare-summary-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .compare-pricing-grid {
      grid-template-columns: 1fr !important;
    }
    .compare-reasons-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 600px) {
    .compare-summary-grid {
      grid-template-columns: 1fr !important;
    }
    .compare-hero-title {
      font-size: 36px !important;
    }
    .compare-hero-ctas {
      flex-direction: column !important;
    }
    .compare-section-title {
      font-size: 28px !important;
    }
  }
`;
if (!document.getElementById('compare-responsive-styles')) {
  styleSheet.id = 'compare-responsive-styles';
  document.head.appendChild(styleSheet);
}

export default CompareAppLaunchpadPage;
