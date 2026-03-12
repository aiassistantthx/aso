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

interface CompareScreenshotsProPageProps {
  onBack: () => void;
  onGetStarted: () => void;
  onNavigate?: (page: string) => void;
}

// JSON-LD Schema for FAQ
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the main difference between LocalizeShots and Screenshots Pro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LocalizeShots uses AI to automatically generate marketing headlines and translate content to 40+ languages in one click. Screenshots Pro focuses on professional design tools with manual text editing and no AI features.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Screenshots Pro offer AI features?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, Screenshots Pro does not include AI-powered features. All text creation and translation must be done manually. LocalizeShots offers AI headline generation and one-click translation to 40+ languages.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which tool is more affordable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LocalizeShots Pro costs $4.99/month (billed yearly) compared to Screenshots Pro at approximately $19/month. LocalizeShots also includes AI features that would require additional tools or services with Screenshots Pro.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Screenshots Pro support API integration?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Screenshots Pro offers API access for CI/CD integration. LocalizeShots focuses on a user-friendly web interface optimized for indie developers and small teams.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I try LocalizeShots for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, LocalizeShots offers a free plan with 3 projects and 2 languages. You can test the AI headline generation and screenshot creation before upgrading to Pro.',
      },
    },
  ],
};

export const CompareScreenshotsProPage: React.FC<CompareScreenshotsProPageProps> = ({
  onBack,
  onGetStarted,
  onNavigate,
}) => {
  // Inject FAQ schema
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-schema-screenshots-pro';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('faq-schema-screenshots-pro');
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
      screenshotspro: false,
      screenshotsproNote: 'Manual text only',
    },
    {
      feature: 'AI Translation',
      localizeshots: true,
      localizeshotsNote: '40+ languages, one-click',
      screenshotspro: false,
      screenshotsproNote: 'Manual translation',
    },
    {
      feature: 'ASO Metadata Generation',
      localizeshots: true,
      localizeshotsNote: 'Title, subtitle, keywords',
      screenshotspro: false,
      screenshotsproNote: 'Screenshots only',
    },
    {
      feature: 'Device Mockups',
      localizeshots: true,
      localizeshotsNote: 'iPhone frames included',
      screenshotspro: true,
      screenshotsproNote: 'Multiple device frames',
    },
    {
      feature: 'Professional Templates',
      localizeshots: true,
      localizeshotsNote: 'Style presets',
      screenshotspro: true,
      screenshotsproNote: 'Extensive library',
    },
    {
      feature: 'Precise Layout Controls',
      localizeshots: true,
      localizeshotsNote: 'Drag-and-drop editor',
      screenshotspro: true,
      screenshotsproNote: 'Advanced controls',
    },
    {
      feature: 'API for CI/CD',
      localizeshots: false,
      localizeshotsNote: 'Web interface only',
      screenshotspro: true,
      screenshotsproNote: 'API available',
    },
    {
      feature: 'Free Plan',
      localizeshots: true,
      localizeshotsNote: '3 projects, 2 languages',
      screenshotspro: false,
      screenshotsproNote: 'Paid only',
    },
    {
      feature: 'Starting Price',
      localizeshots: true,
      localizeshotsNote: '$4.99/mo (yearly)',
      screenshotspro: true,
      screenshotsproNote: '~$19/mo',
    },
  ];

  const localizeshotsPros = [
    'AI generates marketing headlines automatically',
    'One-click translation to 40+ languages',
    'Generates ASO metadata (title, subtitle, keywords)',
    'Lower price point ($4.99/mo yearly)',
    'No design skills needed - AI does the work',
    'Free plan available to get started',
  ];

  const localizeshotsCons = [
    'No API for CI/CD automation',
    'Fewer professional template options',
    'Newer product with smaller user base',
  ];

  const screenshotsproPros = [
    'Professional design templates',
    'Precise layout controls',
    'API for CI/CD integration',
    'Good export quality',
  ];

  const screenshotsproCons = [
    'No AI headline generation',
    'Manual translation required',
    'No ASO metadata generation',
    'Higher price point (~$19/mo)',
    'Steep learning curve',
    'No free plan',
  ];

  const faqs = [
    {
      question: 'What is the main difference between LocalizeShots and Screenshots Pro?',
      answer:
        'LocalizeShots uses AI to automatically generate marketing headlines and translate content to 40+ languages in one click. Screenshots Pro focuses on professional design tools with precise layout controls but requires manual text entry and translation. If you want speed and automation, LocalizeShots is the better choice. If you need API integration and advanced design controls, Screenshots Pro might suit you.',
    },
    {
      question: 'Does Screenshots Pro offer AI features?',
      answer:
        'No, Screenshots Pro does not include AI-powered features. All text creation and translation must be done manually or with third-party tools. LocalizeShots includes built-in AI for headline generation and translation.',
    },
    {
      question: 'Which tool is more affordable?',
      answer:
        'LocalizeShots Pro costs $4.99/month when billed yearly, compared to Screenshots Pro at approximately $19/month. Additionally, LocalizeShots includes AI translation and metadata generation that would require separate tools or services with Screenshots Pro.',
    },
    {
      question: 'Does Screenshots Pro support API integration?',
      answer:
        'Yes, Screenshots Pro offers API access for CI/CD integration, which can be valuable for teams with automated build pipelines. LocalizeShots focuses on a user-friendly web interface optimized for indie developers and small teams.',
    },
    {
      question: 'Can I try LocalizeShots for free?',
      answer:
        'Yes, LocalizeShots offers a free plan with 3 projects and 2 languages. You can test the AI headline generation and screenshot creation before deciding to upgrade to Pro. Screenshots Pro does not offer a free tier.',
    },
    {
      question: 'Can I migrate from Screenshots Pro to LocalizeShots?',
      answer:
        'Yes, you can easily switch to LocalizeShots. Simply upload your existing screenshots to LocalizeShots, and the AI will generate new headlines and handle translations automatically. Your workflow will become significantly faster.',
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
          <span style={styles.heroBadge}>Screenshots Pro Alternative</span>
          <h1 style={styles.heroTitle}>
            LocalizeShots vs Screenshots Pro
          </h1>
          <p style={styles.heroSubtitle}>
            Looking for a Screenshots Pro alternative? Compare features, pricing, and see why developers
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
              LocalizeShots generates headlines automatically. Screenshots Pro requires manual text entry.
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
              One-click AI translation vs manual translation with Screenshots Pro.
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
            <h3 style={styles.quickCompareTitle}>75% Cheaper</h3>
            <p style={styles.quickCompareText}>
              $4.99/mo vs ~$19/mo - save significantly without sacrificing quality.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section style={styles.comparisonSection}>
        <h2 style={styles.sectionTitle}>Feature Comparison</h2>
        <p style={styles.sectionSubtitle}>
          A detailed look at how LocalizeShots and Screenshots Pro compare
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
                  <span style={styles.competitorName}>Screenshots Pro</span>
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
                      {row.screenshotspro ? (
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
                      <span style={styles.featureNote}>{row.screenshotsproNote}</span>
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

          {/* Screenshots Pro */}
          <div style={styles.prosConsCard}>
            <div style={styles.prosConsHeader}>
              <span style={styles.competitorName}>Screenshots Pro</span>
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
                {screenshotsproPros.map((pro, i) => (
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
                {screenshotsproCons.map((con, i) => (
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
        <p style={styles.sectionSubtitle}>Common questions about LocalizeShots vs Screenshots Pro</p>

        <div style={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} style={styles.faqItem}>
              <h3 style={styles.faqQuestion}>{faq.question}</h3>
              <p style={styles.faqAnswer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Comparisons Section */}
      <section style={styles.relatedSection}>
        <h2 style={styles.sectionTitle}>Related Comparisons</h2>
        <p style={styles.sectionSubtitle}>
          Explore more comparisons and resources to find the best tool for your needs
        </p>

        <div style={styles.relatedGrid}>
          {/* Other Comparisons */}
          <div style={styles.relatedCard}>
            <h3 style={styles.relatedCardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
                <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              More Comparisons
            </h3>
            <ul style={styles.relatedList}>
              <li>
                <a
                  href="/compare/appscreens"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('compare-appscreens'); }}
                  style={styles.relatedLink}
                >
                  LocalizeShots vs AppScreens
                </a>
              </li>
              <li>
                <a
                  href="/compare/applaunchpad"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('compare-applaunchpad'); }}
                  style={styles.relatedLink}
                >
                  LocalizeShots vs AppLaunchpad
                </a>
              </li>
              <li>
                <a
                  href="/alternatives"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('alternatives'); }}
                  style={styles.relatedLink}
                >
                  All Screenshot Tool Alternatives
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Pages */}
          <div style={styles.relatedCard}>
            <h3 style={styles.relatedCardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
                <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                <path d="M12 18h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Platform Guides
            </h3>
            <ul style={styles.relatedList}>
              <li>
                <a
                  href="/ios-screenshots"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('ios-screenshots'); }}
                  style={styles.relatedLink}
                >
                  iOS App Store Screenshots
                </a>
              </li>
              <li>
                <a
                  href="/android-screenshots"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('android-screenshots'); }}
                  style={styles.relatedLink}
                >
                  Google Play Screenshots
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div style={styles.relatedCard}>
            <h3 style={styles.relatedCardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 10 }}>
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253s-3.332.477-4.5 1.253" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Resources
            </h3>
            <ul style={styles.relatedList}>
              <li>
                <a
                  href="/features"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('features'); }}
                  style={styles.relatedLink}
                >
                  All Features
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('blog'); }}
                  style={styles.relatedLink}
                >
                  ASO Blog & Tips
                </a>
              </li>
            </ul>
          </div>
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

  // Related Comparisons
  relatedSection: {
    padding: '60px 24px',
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    maxWidth: 900,
    margin: '0 auto',
  },
  relatedCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    border: `1px solid ${colors.borderLight}`,
  },
  relatedCardTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 16,
  },
  relatedList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  relatedLink: {
    display: 'block',
    fontSize: 14,
    color: colors.accent,
    textDecoration: 'none',
    padding: '8px 0',
    cursor: 'pointer',
    fontWeight: 500,
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
if (!document.getElementById('compare-screenshots-pro-styles')) {
  styleSheet.id = 'compare-screenshots-pro-styles';
  document.head.appendChild(styleSheet);
}

export default CompareScreenshotsProPage;
