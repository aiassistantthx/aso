import React, { useEffect } from 'react';

interface Props {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const colors = {
  bg: '#FFFBF5',
  card: '#FFFFFF',
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  textMuted: '#9A9A9A',
  accent: '#FF6B4A',
  accentLight: '#FF8A65',
  accentBg: '#FFF5F2',
  border: '#e5e5e7',
  borderLight: '#F0F0F0',
  success: '#22C55E',
};

// Add JSON-LD Organization schema to head
const OrganizationSchema = () => {
  useEffect(() => {
    const existingScript = document.getElementById('organization-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'organization-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'LocalizeShots',
      url: 'https://localizeshots.com',
      logo: 'https://localizeshots.com/logo.png',
      description: 'AI-powered App Store screenshot localization tool. Generate headlines, metadata, and localized screenshots for 40+ languages in minutes.',
      email: 'support@localizeshots.com',
      sameAs: [],
      foundingDate: '2024',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@localizeshots.com',
        contactType: 'customer support',
        availableLanguage: ['English'],
      },
      offers: {
        '@type': 'Offer',
        description: 'App Store Screenshot Localization Service',
        priceCurrency: 'USD',
        price: '0',
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'USD',
          price: '0',
          description: 'Free tier available',
        },
      },
    });

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('organization-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
};

export const AboutPage: React.FC<Props> = ({ onBack, onNavigate }) => {
  return (
    <div style={styles.container}>
      <OrganizationSchema />

      <nav style={styles.nav}>
        <button onClick={onBack} style={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </nav>

      <main style={styles.content}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
          </div>
          <h1 style={styles.title}>About LocalizeShots</h1>
          <p style={styles.tagline}>
            Helping app developers reach global audiences with beautiful, localized App Store screenshots.
          </p>
        </section>

        {/* Mission Section */}
        <section style={styles.section}>
          <h2 style={styles.heading}>Our Mission</h2>
          <p style={styles.text}>
            We believe that language should never be a barrier to app discovery. Every app deserves to
            be presented beautifully to users around the world, regardless of their native language.
          </p>
          <p style={styles.text}>
            LocalizeShots was built to democratize App Store Optimization. We combine the power of AI
            with intuitive design tools to help indie developers and teams of all sizes create
            professional, localized screenshots in minutes instead of days. Discover all our{' '}
            <button onClick={() => onNavigate?.('features')} style={styles.inlineLink}>
              powerful features
            </button>{' '}
            designed to streamline your localization workflow.
          </p>
        </section>

        {/* Story Section */}
        <section style={styles.section}>
          <h2 style={styles.heading}>The Story</h2>
          <p style={styles.text}>
            LocalizeShots started from a simple frustration: creating localized App Store screenshots
            was painfully time-consuming. Manual resizing, coordinating with translators, designing
            headlines in Photoshop — it took weeks of work for each app update.
          </p>
          <p style={styles.text}>
            We knew there had to be a better way. So we built LocalizeShots — a tool that{' '}
            <button onClick={() => onNavigate?.('features')} style={styles.inlineLink}>
              generates compelling marketing headlines
            </button>
            , translates them to 40+ languages, and renders beautiful device mockups, all in one
            streamlined workflow.
          </p>
        </section>

        {/* Benefits Section */}
        <section style={styles.section}>
          <h2 style={styles.heading}>Why LocalizeShots?</h2>
          <div style={styles.benefitsGrid} className="about-benefits-grid">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth="1.5"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={colors.accent} strokeWidth="1.5"/>
                  </svg>
                ),
                title: '40+ Languages',
                description: 'Reach users in every App Store market with accurate, context-aware translations.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                title: 'AI-Powered Headlines',
                description: 'Generate compelling marketing copy that converts, with smart bracket highlighting.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                    <path d="M12 18h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ),
                title: 'Beautiful Mockups',
                description: 'Professional iPhone frames with pixel-perfect rendering and customizable styles.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: 'ASO Best Practices',
                description: 'Metadata generation following Apple App Store optimization guidelines.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: 'One-Click Export',
                description: 'Download organized ZIP files ready to upload directly to App Store Connect.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: 'Minutes, Not Days',
                description: 'Complete localization workflow that used to take weeks now takes minutes.',
              },
            ].map((benefit, i) => (
              <div key={i} style={styles.benefitCard}>
                <div style={styles.benefitIcon}>{benefit.icon}</div>
                <h3 style={styles.benefitTitle}>{benefit.title}</h3>
                <p style={styles.benefitDescription}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section style={styles.contactSection}>
          <h2 style={styles.heading}>Get in Touch</h2>
          <p style={styles.text}>
            Have questions, feedback, or suggestions? We would love to hear from you.
          </p>
          <div style={styles.contactCard}>
            <div style={styles.contactIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={styles.contactLabel}>Email</div>
              <a href="mailto:support@localizeshots.com" style={styles.contactLink}>
                support@localizeshots.com
              </a>
            </div>
          </div>
        </section>

        {/* Learn More Section */}
        <section style={styles.section}>
          <h2 style={styles.heading}>Learn More</h2>
          <p style={styles.text}>
            Explore more about LocalizeShots and how we can help you optimize your App Store presence.
          </p>
          <div style={styles.learnMoreGrid} className="about-learn-more-grid">
            <button onClick={() => onNavigate?.('features')} style={styles.learnMoreCard}>
              <div style={styles.learnMoreIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.learnMoreContent}>
                <h3 style={styles.learnMoreTitle}>Features</h3>
                <p style={styles.learnMoreDescription}>
                  Discover all the powerful tools and capabilities LocalizeShots offers.
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.learnMoreArrow}>
                <path d="M9 18l6-6-6-6" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={() => onNavigate?.('blog')} style={styles.learnMoreCard}>
              <div style={styles.learnMoreIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.learnMoreContent}>
                <h3 style={styles.learnMoreTitle}>Blog</h3>
                <p style={styles.learnMoreDescription}>
                  Tips, guides, and insights on App Store Optimization and localization.
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.learnMoreArrow}>
                <path d="M9 18l6-6-6-6" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={() => onNavigate?.('alternatives')} style={styles.learnMoreCard}>
              <div style={styles.learnMoreIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.learnMoreContent}>
                <h3 style={styles.learnMoreTitle}>Alternatives</h3>
                <p style={styles.learnMoreDescription}>
                  Compare LocalizeShots with other screenshot localization tools.
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.learnMoreArrow}>
                <path d="M9 18l6-6-6-6" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        {/* Footer Links */}
        <section style={styles.footerSection}>
          <div style={styles.footerLinksMain}>
            <button onClick={() => onNavigate?.('features')} style={styles.footerLinkAccent}>
              Features
            </button>
            <span style={styles.footerDivider}>|</span>
            <button onClick={() => onNavigate?.('blog')} style={styles.footerLinkAccent}>
              Blog
            </button>
            <span style={styles.footerDivider}>|</span>
            <button onClick={() => onNavigate?.('tools/size-calculator')} style={styles.footerLinkAccent}>
              Size Calculator
            </button>
          </div>
          <div style={styles.footerLinks}>
            <button onClick={() => onNavigate?.('terms')} style={styles.footerLink}>
              Terms of Service
            </button>
            <span style={styles.footerDivider}>|</span>
            <button onClick={() => onNavigate?.('privacy')} style={styles.footerLink}>
              Privacy Policy
            </button>
            <span style={styles.footerDivider}>|</span>
            <button onClick={() => onNavigate?.('refund')} style={styles.footerLink}>
              Refund Policy
            </button>
          </div>
          <p style={styles.copyright}>&copy; {new Date().getFullYear()} LocalizeShots. All rights reserved.</p>
        </section>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.bg,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  nav: {
    padding: '20px 40px',
    borderBottom: `1px solid ${colors.border}`,
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
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '60px 40px',
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '56px',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logoIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 24px ${colors.accent}40`,
  },
  title: {
    fontSize: '42px',
    fontWeight: 700,
    color: colors.text,
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  tagline: {
    fontSize: '18px',
    lineHeight: 1.7,
    color: colors.textSecondary,
    maxWidth: '600px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '48px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '20px',
    letterSpacing: '-0.3px',
  },
  text: {
    fontSize: '16px',
    lineHeight: 1.8,
    color: colors.text,
    marginBottom: '16px',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '24px',
  },
  benefitCard: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${colors.borderLight}`,
  },
  benefitIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  benefitTitle: {
    fontSize: '17px',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '8px',
  },
  benefitDescription: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
  },
  contactSection: {
    marginBottom: '48px',
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${colors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '20px',
  },
  contactIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  contactLink: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.accent,
    textDecoration: 'none',
  },
  footerSection: {
    borderTop: `1px solid ${colors.border}`,
    paddingTop: '32px',
    textAlign: 'center',
  },
  footerLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  footerLink: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: 0,
    fontWeight: 500,
  },
  footerDivider: {
    color: colors.border,
    fontSize: '14px',
  },
  copyright: {
    fontSize: '13px',
    color: colors.textMuted,
    margin: 0,
  },
  inlineLink: {
    background: 'none',
    border: 'none',
    color: colors.accent,
    fontSize: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    textDecorationColor: `${colors.accent}50`,
    textUnderlineOffset: '2px',
  },
  learnMoreGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginTop: '24px',
  },
  learnMoreCard: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    padding: '20px 24px',
    border: `1px solid ${colors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  learnMoreIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  learnMoreContent: {
    flex: 1,
  },
  learnMoreTitle: {
    fontSize: '17px',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '4px',
    margin: 0,
  },
  learnMoreDescription: {
    fontSize: '14px',
    lineHeight: 1.5,
    color: colors.textSecondary,
    margin: 0,
    marginTop: '4px',
  },
  learnMoreArrow: {
    flexShrink: 0,
    opacity: 0.5,
  },
  footerLinksMain: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '12px',
  },
  footerLinkAccent: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: colors.accent,
    cursor: 'pointer',
    padding: 0,
    fontWeight: 600,
  },
};

// Add responsive styles
if (typeof document !== 'undefined' && !document.getElementById('about-page-responsive')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'about-page-responsive';
  styleEl.textContent = `
    @media (max-width: 768px) {
      .about-benefits-grid {
        grid-template-columns: 1fr !important;
      }
      .about-learn-more-grid {
        grid-template-columns: 1fr !important;
      }
    }
    .about-learn-more-grid button:hover {
      border-color: #FF6B4A !important;
      box-shadow: 0 4px 12px rgba(255, 107, 74, 0.15);
    }
  `;
  document.head.appendChild(styleEl);
}
