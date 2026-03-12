import React, { useEffect } from 'react';

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
  successBg: '#F0FDF4',
};

interface CompareAppScreensPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

// JSON-LD Schema for FAQ
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the main difference between LocalizeShots and AppScreens?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LocalizeShots uses AI to automatically generate marketing headlines and translate content to 40+ languages in one click. AppScreens focuses on template-based design with manual text editing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which tool is better for indie developers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LocalizeShots is ideal for indie developers who want to quickly localize their app without hiring designers or translators. The AI-powered workflow saves hours of manual work.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does LocalizeShots support all App Store languages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, LocalizeShots supports 40+ languages including all languages available in the App Store. Translation is done with AI that understands app marketing context.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I try LocalizeShots for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, LocalizeShots offers a free plan with 3 projects and 2 languages. You can test the AI headline generation and screenshot creation before upgrading.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is LocalizeShots cheaper than AppScreens?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LocalizeShots Pro costs $4.99/month (billed yearly) compared to AppScreens starting at $9/month. LocalizeShots also includes AI features that would require additional tools or services with AppScreens.',
      },
    },
  ],
};

export const CompareAppScreensPage: React.FC<CompareAppScreensPageProps> = ({
  onBack,
  onGetStarted,
}) => {
  // Inject FAQ schema
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('faq-schema');
      if (existing) {
        existing.remove();
      }
    };
  }, []);

  const comparisonFeatures = [
    {
      feature: 'AI Headline Generation',
      localizeshots: true,
      localizeshotsNote: 'GPT-4 powered',
      appscreens: false,
      appscreensNote: 'Manual text only',
    },
    {
      feature: 'AI Translation',
      localizeshots: true,
      localizeshotsNote: '40+ languages, one-click',
      appscreens: false,
      appscreensNote: 'Manual or third-party',
    },
    {
      feature: 'ASO Metadata Generation',
      localizeshots: true,
      localizeshotsNote: 'Title, subtitle, keywords',
      appscreens: false,
      appscreensNote: 'Screenshots only',
    },
    {
      feature: 'Device Mockups',
      localizeshots: true,
      localizeshotsNote: 'iPhone frames included',
      appscreens: true,
      appscreensNote: 'Multiple device frames',
    },
    {
      feature: 'Template Library',
      localizeshots: true,
      localizeshotsNote: 'Style presets',
      appscreens: true,
      appscreensNote: 'Large template library',
    },
    {
      feature: 'Drag & Drop Editor',
      localizeshots: true,
      localizeshotsNote: 'Canvas-based editor',
      appscreens: true,
      appscreensNote: 'Full visual editor',
    },
    {
      feature: 'Batch Export',
      localizeshots: true,
      localizeshotsNote: 'All languages at once',
      appscreens: true,
      appscreensNote: 'Multiple sizes',
    },
    {
      feature: 'Free Plan',
      localizeshots: true,
      localizeshotsNote: '3 projects, 2 languages',
      appscreens: true,
      appscreensNote: 'Limited features',
    },
    {
      feature: 'Starting Price',
      localizeshots: true,
      localizeshotsNote: '$4.99/mo (yearly)',
      appscreens: true,
      appscreensNote: '$9/mo',
    },
  ];

  const localizeshotsPros = [
    'AI generates marketing headlines automatically',
    'One-click translation to 40+ languages',
    'Generates ASO metadata (title, subtitle, keywords)',
    'Lower price point ($4.99/mo yearly)',
    'No design skills needed - AI does the work',
    'Fast workflow - minutes instead of hours',
  ];

  const localizeshotsCons = [
    'Smaller template library',
    'Fewer device frame options',
    'Newer product with smaller user base',
  ];

  const appscreensPros = [
    'Large template library',
    'Multiple device mockup options',
    'Established product with proven track record',
    'Advanced visual editor features',
  ];

  const appscreensCons = [
    'No AI headline generation',
    'Manual translation required',
    'No ASO metadata generation',
    'Higher starting price',
    'More time-consuming workflow',
  ];

  const faqs = [
    {
      question: 'What is the main difference between LocalizeShots and AppScreens?',
      answer:
        'LocalizeShots uses AI to automatically generate marketing headlines and translate content to 40+ languages in one click. AppScreens focuses on template-based design with manual text editing. If you want speed and automation, LocalizeShots is the better choice. If you prefer full manual control over design, AppScreens might suit you.',
    },
    {
      question: 'Which tool is better for indie developers?',
      answer:
        'LocalizeShots is ideal for indie developers who want to quickly localize their app without hiring designers or translators. The AI-powered workflow saves hours of manual work and the lower price point fits indie budgets.',
    },
    {
      question: 'Does LocalizeShots support all App Store languages?',
      answer:
        'Yes, LocalizeShots supports 40+ languages including all major App Store languages. Translation is done with AI that understands app marketing context, ensuring natural-sounding localized content.',
    },
    {
      question: 'Can I try LocalizeShots for free?',
      answer:
        'Yes, LocalizeShots offers a free plan with 3 projects and 2 languages. You can test the AI headline generation and screenshot creation before deciding to upgrade to Pro.',
    },
    {
      question: 'Is LocalizeShots cheaper than AppScreens?',
      answer:
        'Yes, LocalizeShots Pro costs $4.99/month when billed yearly, compared to AppScreens starting at $9/month. Additionally, LocalizeShots includes AI translation and metadata generation that would require separate tools or services with other solutions.',
    },
    {
      question: 'Can I migrate from AppScreens to LocalizeShots?',
      answer:
        'Yes, you can easily switch to LocalizeShots. Simply upload your existing screenshots to LocalizeShots, and the AI will generate new headlines and handle translations. Your workflow will become significantly faster.',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <button onClick={onBack} style={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
          <button style={styles.ctaButton} onClick={onGetStarted}>
            Try LocalizeShots Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>AppScreens Alternative</span>
          <h1 style={styles.heroTitle}>
            LocalizeShots vs AppScreens
          </h1>
          <p style={styles.heroSubtitle}>
            Looking for an AppScreens alternative? Compare features, pricing, and see why developers
            are switching to LocalizeShots for AI-powered screenshot localization.
          </p>
          <button style={styles.heroCtaButton} onClick={onGetStarted}>
            Start Free
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginLeft: 10 }}
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Quick Comparison Cards */}
      <section style={styles.quickCompare}>
        <div style={styles.quickCompareGrid}>
          <div style={styles.quickCompareCard}>
            <div style={styles.quickCompareIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke={colors.accent}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={styles.quickCompareTitle}>AI-Powered</h3>
            <p style={styles.quickCompareText}>
              LocalizeShots generates headlines automatically. AppScreens requires manual text entry.
            </p>
          </div>
          <div style={styles.quickCompareCard}>
            <div style={styles.quickCompareIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth="1.5" />
                <path
                  d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                  stroke={colors.accent}
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <h3 style={styles.quickCompareTitle}>40+ Languages</h3>
            <p style={styles.quickCompareText}>
              One-click AI translation vs manual translation with AppScreens.
            </p>
          </div>
          <div style={styles.quickCompareCard}>
            <div style={styles.quickCompareIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  stroke={colors.accent}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 style={styles.quickCompareTitle}>50% Cheaper</h3>
            <p style={styles.quickCompareText}>
              $4.99/mo vs $9/mo - save money without sacrificing features.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section style={styles.comparisonSection}>
        <h2 style={styles.sectionTitle}>Feature Comparison</h2>
        <p style={styles.sectionSubtitle}>
          A detailed look at how LocalizeShots and AppScreens compare
        </p>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Feature</th>
                <th style={{ ...styles.tableHeader, ...styles.tableHeaderHighlight }}>
                  <div style={styles.logoMini}>
                    <div style={styles.logoIconMini}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="2" width="18" height="20" rx="3" fill="white" />
                        <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent} />
                        <rect
                          x="6"
                          y="10"
                          width="12"
                          height="8"
                          rx="1"
                          fill={colors.accent}
                          fillOpacity="0.3"
                        />
                      </svg>
                    </div>
                    LocalizeShots
                  </div>
                </th>
                <th style={styles.tableHeader}>
                  <span style={styles.competitorName}>AppScreens</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : {}}>
                  <td style={styles.tableCell}>{row.feature}</td>
                  <td style={{ ...styles.tableCell, ...styles.tableCellHighlight }}>
                    <div style={styles.featureCheck}>
                      {row.localizeshots ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill={colors.successBg} />
                          <path
                            d="M9 12l2 2 4-4"
                            stroke={colors.success}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#FEF2F2" />
                          <path
                            d="M15 9l-6 6M9 9l6 6"
                            stroke="#DC2626"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                      <span style={styles.featureNote}>{row.localizeshotsNote}</span>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.featureCheck}>
                      {row.appscreens ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill={colors.successBg} />
                          <path
                            d="M9 12l2 2 4-4"
                            stroke={colors.success}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#FEF2F2" />
                          <path
                            d="M15 9l-6 6M9 9l6 6"
                            stroke="#DC2626"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                      <span style={styles.featureNote}>{row.appscreensNote}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pros and Cons */}
      <section style={styles.prosConsSection}>
        <h2 style={styles.sectionTitle}>Pros and Cons</h2>
        <p style={styles.sectionSubtitle}>
          An honest look at the strengths and weaknesses of each tool
        </p>

        <div style={styles.prosConsGrid}>
          {/* LocalizeShots */}
          <div style={styles.prosConsCard}>
            <div style={styles.prosConsHeader}>
              <div style={styles.logoMini}>
                <div style={styles.logoIconMini}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="2" width="18" height="20" rx="3" fill="white" />
                    <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent} />
                    <rect
                      x="6"
                      y="10"
                      width="12"
                      height="8"
                      rx="1"
                      fill={colors.accent}
                      fillOpacity="0.3"
                    />
                  </svg>
                </div>
                LocalizeShots
              </div>
            </div>
            <div style={styles.prosList}>
              <h4 style={styles.prosTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke={colors.success}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Pros
              </h4>
              <ul style={styles.prosListItems}>
                {localizeshotsPros.map((pro, i) => (
                  <li key={i} style={styles.prosItem}>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div style={styles.consList}>
              <h4 style={styles.consTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#DC2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Cons
              </h4>
              <ul style={styles.consListItems}>
                {localizeshotsCons.map((con, i) => (
                  <li key={i} style={styles.consItem}>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AppScreens */}
          <div style={styles.prosConsCard}>
            <div style={styles.prosConsHeader}>
              <span style={styles.competitorName}>AppScreens</span>
            </div>
            <div style={styles.prosList}>
              <h4 style={styles.prosTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke={colors.success}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Pros
              </h4>
              <ul style={styles.prosListItems}>
                {appscreensPros.map((pro, i) => (
                  <li key={i} style={styles.prosItem}>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div style={styles.consList}>
              <h4 style={styles.consTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#DC2626"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Cons
              </h4>
              <ul style={styles.consListItems}>
                {appscreensCons.map((con, i) => (
                  <li key={i} style={styles.consItem}>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={styles.faqSection}>
        <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
        <p style={styles.sectionSubtitle}>Common questions about LocalizeShots vs AppScreens</p>

        <div style={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} style={styles.faqItem}>
              <h3 style={styles.faqQuestion}>{faq.question}</h3>
              <p style={styles.faqAnswer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to try LocalizeShots?</h2>
          <p style={styles.ctaSubtitle}>
            Start with our free plan. No credit card required.
          </p>
          <button style={styles.ctaButtonLarge} onClick={onGetStarted}>
            Start Free
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ marginLeft: 10 }}
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          &copy; {new Date().getFullYear()} LocalizeShots. All rights reserved.
        </p>
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
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(250, 250, 248, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${colors.borderLight}`,
    zIndex: 100,
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
  ctaButton: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },

  // Hero
  hero: {
    padding: '80px 24px 60px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: 700,
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    backgroundColor: colors.accentBg,
    color: colors.accent,
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
    marginBottom: 24,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 400,
    color: colors.text,
    lineHeight: 1.2,
    letterSpacing: '-1px',
    marginBottom: 20,
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 1.7,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  heroCtaButton: {
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
  },

  // Quick Compare
  quickCompare: {
    padding: '0 24px 60px',
  },
  quickCompareGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    maxWidth: 900,
    margin: '0 auto',
  },
  quickCompareCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
    textAlign: 'center',
  },
  quickCompareIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  quickCompareTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  quickCompareText: {
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
  },

  // Section styles
  comparisonSection: {
    padding: '60px 24px',
    backgroundColor: colors.card,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 400,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: '-0.5px',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },

  // Table
  tableWrapper: {
    maxWidth: 900,
    margin: '0 auto',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: colors.bg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 600,
    color: colors.textSecondary,
    backgroundColor: colors.card,
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  tableHeaderHighlight: {
    backgroundColor: colors.accentBg,
    color: colors.text,
  },
  tableCell: {
    padding: '16px 20px',
    fontSize: 15,
    color: colors.text,
    borderBottom: `1px solid ${colors.borderLight}`,
    verticalAlign: 'middle',
  },
  tableCellHighlight: {
    backgroundColor: 'rgba(255, 107, 74, 0.03)',
  },
  tableRowEven: {
    backgroundColor: colors.card,
  },
  featureCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  featureNote: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoMini: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
  },
  logoIconMini: {
    width: 24,
    height: 24,
    borderRadius: 6,
    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  competitorName: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textSecondary,
  },

  // Pros and Cons
  prosConsSection: {
    padding: '60px 24px',
  },
  prosConsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
    maxWidth: 900,
    margin: '0 auto',
  },
  prosConsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    border: `1px solid ${colors.borderLight}`,
  },
  prosConsHeader: {
    padding: '20px 24px',
    borderBottom: `1px solid ${colors.borderLight}`,
    backgroundColor: colors.bg,
  },
  prosList: {
    padding: '20px 24px',
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  consList: {
    padding: '20px 24px',
  },
  prosTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: colors.success,
    marginBottom: 12,
  },
  consTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#DC2626',
    marginBottom: 12,
  },
  prosListItems: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  consListItems: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  prosItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 1.8,
    paddingLeft: 16,
    position: 'relative',
  },
  consItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 1.8,
    paddingLeft: 16,
    position: 'relative',
  },

  // FAQ
  faqSection: {
    padding: '60px 24px',
    backgroundColor: colors.card,
  },
  faqList: {
    maxWidth: 700,
    margin: '0 auto',
  },
  faqItem: {
    padding: '24px 0',
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  faqQuestion: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 1.7,
    color: colors.textSecondary,
    margin: 0,
  },

  // CTA Section
  ctaSection: {
    padding: '80px 24px',
    textAlign: 'center',
    background: `linear-gradient(135deg, ${colors.accentBg} 0%, ${colors.bg} 100%)`,
  },
  ctaContent: {
    maxWidth: 500,
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: 400,
    color: colors.text,
    marginBottom: 12,
    letterSpacing: '-0.5px',
  },
  ctaSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  ctaButtonLarge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: `0 8px 24px ${colors.accent}40`,
  },

  // Footer
  footer: {
    padding: '24px',
    textAlign: 'center',
    borderTop: `1px solid ${colors.borderLight}`,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    margin: 0,
  },
};

// Add responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .compare-quick-grid {
      grid-template-columns: 1fr !important;
    }
    .compare-pros-cons-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
if (!document.getElementById('compare-appscreens-styles')) {
  styleSheet.id = 'compare-appscreens-styles';
  document.head.appendChild(styleSheet);
}
