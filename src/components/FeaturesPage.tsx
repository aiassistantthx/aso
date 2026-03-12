import React, { useState, useEffect } from 'react';

interface Props {
  onGetStarted: () => void;
  onNavigate: (page: string) => void;
}

// Color palette: matching Landing.tsx
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
};

// Section header with decorative lines
const SectionHeader: React.FC<{ label: string; title: string; subtitle: string }> = ({ label, title, subtitle }) => (
  <div style={styles.sectionHeader} className="features-section-header">
    <span style={styles.sectionLabel}>{label}</span>
    <h2 style={styles.sectionTitle} className="features-section-title">{title}</h2>
    <div style={styles.sectionTitleLine} />
    <p style={styles.sectionSubtitle}>{subtitle}</p>
  </div>
);

// Feature data
const FEATURES = [
  {
    id: 'ai-headlines',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'AI-Powered Headlines',
    shortDesc: 'Compelling marketing headlines with smart highlighting',
    longDesc: 'Generate conversion-optimized App Store headlines in seconds. Our AI creates catchy, localized text with smart [bracket] highlighting that draws attention to key benefits and features.',
    benefits: [
      'GPT-4 powered generation',
      'Smart bracket highlighting',
      'Multiple variations to choose from',
      'ASO-optimized copy',
    ],
  },
  {
    id: 'languages',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: '40+ Languages',
    shortDesc: 'Translate to every App Store locale instantly',
    longDesc: 'Reach global audiences with context-aware translations. Our AI understands app marketing nuances and delivers natural, culturally appropriate copy for every supported App Store language.',
    benefits: [
      'All App Store languages supported',
      'Context-aware translations',
      'Preserves marketing tone',
      'One-click batch translation',
    ],
  },
  {
    id: 'mockups',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 18h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'iPhone Mockups',
    shortDesc: 'Beautiful device frames with pixel-perfect control',
    longDesc: 'Display your screenshots in stunning iPhone mockups. Choose from multiple device styles, adjust positioning, and create professional-looking App Store visuals that convert.',
    benefits: [
      'Latest iPhone models',
      'Drag-and-drop positioning',
      'Multiple layout options',
      'Pixel-perfect rendering',
    ],
  },
  {
    id: 'metadata',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'ASO Metadata Generation',
    shortDesc: 'Optimized titles, subtitles, and keywords',
    longDesc: 'Generate App Store-optimized metadata that ranks. Our AI follows ASO best practices to create compelling app names, subtitles, keyword lists, and descriptions that boost discoverability.',
    benefits: [
      'App name optimization',
      'Keyword research built-in',
      'Description generation',
      'What\'s New updates',
    ],
  },
  {
    id: 'icons',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'AI Icon Generation',
    shortDesc: 'Create stunning app icons with DALL-E 3',
    longDesc: 'Generate unique, professional app icons powered by DALL-E 3. Describe your vision and get multiple icon variations that match your brand and stand out in the App Store.',
    benefits: [
      'DALL-E 3 powered',
      'Multiple variations',
      'App Store compliant',
      'High-resolution output',
    ],
  },
  {
    id: 'export',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Batch Export',
    shortDesc: 'Download all localized assets in one click',
    longDesc: 'Export everything you need for App Store Connect in a single ZIP. Screenshots organized by language and device, metadata files ready to upload, and all assets in the correct formats.',
    benefits: [
      'Organized by language',
      'App Store-ready formats',
      'Metadata JSON included',
      'One-click download',
    ],
  },
];

export const FeaturesPage: React.FC<Props> = ({ onGetStarted, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={{
        ...styles.nav,
        backgroundColor: scrolled ? 'rgba(250, 250, 248, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.borderLight}` : 'none',
      }}>
        <div style={styles.navInner} className="features-nav-inner">
          <div style={styles.logo} onClick={() => onNavigate('landing')}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={styles.logoText} className="features-logo-text">LocalizeShots</span>
          </div>
          <div style={styles.navLinks} className="features-nav-links">
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#details" style={styles.navLink}>Details</a>
          </div>
          <div style={styles.navButtons} className="features-nav-buttons">
            <button style={styles.loginBtn} className="features-login-btn" onClick={() => onNavigate('login')}>Sign In</button>
            <button style={styles.ctaBtn} className="features-cta-btn" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero} className="features-hero">
        <div style={styles.heroContent}>
          <div style={styles.heroBadge} className="features-hero-badge">
            <span style={styles.heroBadgeLine} />
            <span style={styles.heroBadgeText}>AI Screenshot Generator</span>
            <span style={styles.heroBadgeLine} />
          </div>
          <h1 style={styles.heroTitle} className="features-hero-title">
            Powerful tools for<br />
            <span style={styles.heroAccent}>App Store success</span>
          </h1>
          <p style={styles.heroSubtitle} className="features-hero-subtitle">
            Everything you need to create stunning localized screenshots,<br />
            generate ASO metadata, and launch globally with confidence.
          </p>
          <div style={styles.heroCtas} className="features-hero-ctas">
            <button style={styles.heroCtaPrimary} className="features-hero-cta-primary" onClick={onGetStarted}>
              Start Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              style={styles.heroCtaSecondary}
              className="features-hero-cta-secondary"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Features Overview Grid */}
      <section id="features" style={styles.featuresOverview}>
        <SectionHeader
          label="App Localization Tool"
          title="Everything you need"
          subtitle="Powerful features to create App Store screenshots in minutes"
        />

        <div style={styles.featuresGrid} className="features-grid">
          {FEATURES.map((feature) => (
            <div key={feature.id} style={styles.featureCard} className="features-card">
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <div style={styles.featureDivider} />
              <p style={styles.featureDescription}>{feature.shortDesc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Feature Sections */}
      <section id="details" style={styles.featureDetails}>
        {FEATURES.map((feature, index) => (
          <div
            key={feature.id}
            style={{
              ...styles.featureDetailSection,
              backgroundColor: index % 2 === 0 ? colors.card : colors.bg,
            }}
            className="features-detail-section"
          >
            <div style={styles.featureDetailInner} className="features-detail-inner">
              <div style={{
                ...styles.featureDetailContent,
                order: index % 2 === 0 ? 1 : 2,
              }} className="features-detail-content">
                <div style={styles.featureDetailIcon}>{feature.icon}</div>
                <h3 style={styles.featureDetailTitle}>{feature.title}</h3>
                <p style={styles.featureDetailDesc}>{feature.longDesc}</p>
                <ul style={styles.featureDetailBenefits}>
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} style={styles.featureDetailBenefit}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{
                ...styles.featureDetailVisual,
                order: index % 2 === 0 ? 2 : 1,
              }} className="features-detail-visual">
                <div style={styles.featureDetailIconLarge}>{feature.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaSectionInner}>
          <h2 style={styles.ctaTitle}>Ready to localize your app?</h2>
          <p style={styles.ctaSubtitle}>Start creating stunning App Store screenshots in minutes</p>
          <button style={styles.ctaButton} onClick={onGetStarted}>
            Get Started Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner} className="features-footer-inner">
          <div style={styles.footerLogo}>
            <div style={{ ...styles.logoIcon, width: 28, height: 28 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={{ ...styles.logoText, fontSize: 15, color: colors.textSecondary }}>LocalizeShots</span>
          </div>
          <div style={styles.footerLinks} className="features-footer-links">
            <button onClick={() => onNavigate('terms')} style={styles.footerLink}>Terms of Service</button>
            <span style={styles.footerLinkDivider}>|</span>
            <button onClick={() => onNavigate('privacy')} style={styles.footerLink}>Privacy Policy</button>
            <span style={styles.footerLinkDivider}>|</span>
            <button onClick={() => onNavigate('refund')} style={styles.footerLink}>Refund Policy</button>
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
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
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
  navLinks: {
    display: 'flex',
    gap: 32,
  },
  navLink: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.textSecondary,
    textDecoration: 'none',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  loginBtn: {
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: colors.textSecondary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.3px',
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
    paddingTop: 130,
    paddingBottom: 80,
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
    fontSize: 54,
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
    fontSize: 19,
    lineHeight: 1.7,
    color: colors.textSecondary,
    fontWeight: 400,
    letterSpacing: '0.2px',
    marginBottom: 36,
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
  },

  // Section Header
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 56,
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
    fontSize: 38,
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

  // Features Overview
  featuresOverview: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    maxWidth: 1000,
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accentBg,
    color: colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
    letterSpacing: '-0.2px',
  },
  featureDivider: {
    width: 28,
    height: '0.5px',
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
    fontWeight: 400,
  },

  // Feature Details
  featureDetails: {
    // container for detailed sections
  },
  featureDetailSection: {
    padding: '80px 24px',
  },
  featureDetailInner: {
    maxWidth: 1000,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 60,
  },
  featureDetailContent: {
    flex: 1,
  },
  featureDetailVisual: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureDetailIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.accentBg,
    color: colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  featureDetailIconLarge: {
    width: 180,
    height: 180,
    borderRadius: 36,
    backgroundColor: colors.accentBg,
    color: colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'scale(1.5)',
  },
  featureDetailTitle: {
    fontSize: 32,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 16,
    letterSpacing: '-0.5px',
  },
  featureDetailDesc: {
    fontSize: 17,
    lineHeight: 1.7,
    color: colors.textSecondary,
    marginBottom: 28,
    fontWeight: 400,
  },
  featureDetailBenefits: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featureDetailBenefit: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    fontSize: 16,
    color: colors.text,
    fontWeight: 400,
  },

  // CTA Section
  ctaSection: {
    padding: '100px 24px',
    backgroundColor: colors.text,
    textAlign: 'center',
  },
  ctaSectionInner: {
    maxWidth: 600,
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: 38,
    fontWeight: 400,
    color: '#fff',
    marginBottom: 16,
    letterSpacing: '-0.5px',
  },
  ctaSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 36,
    fontWeight: 400,
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    fontSize: 17,
    fontWeight: 600,
    color: colors.text,
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
    letterSpacing: '0.3px',
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
    transition: 'color 0.2s',
  },
  footerLinkDivider: {
    color: colors.border,
    fontSize: 12,
  },
};

// Add responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* Mobile Responsive Styles for Features Page */
  @media (max-width: 768px) {
    /* Navigation */
    .features-nav-links {
      display: none !important;
    }
    .features-nav-inner {
      padding: 12px 16px !important;
    }
    .features-logo-text {
      font-size: 15px !important;
    }
    .features-nav-buttons .features-login-btn {
      display: none !important;
    }
    .features-nav-buttons .features-cta-btn {
      padding: 8px 16px !important;
      font-size: 12px !important;
    }

    /* Hero */
    .features-hero {
      padding-top: 100px !important;
      padding-bottom: 50px !important;
    }
    .features-hero-title {
      font-size: 34px !important;
      line-height: 1.2 !important;
    }
    .features-hero-subtitle {
      font-size: 15px !important;
    }
    .features-hero-subtitle br {
      display: none;
    }
    .features-hero-ctas {
      flex-direction: column !important;
      gap: 10px !important;
    }
    .features-hero-cta-primary,
    .features-hero-cta-secondary {
      width: 100% !important;
      justify-content: center !important;
      padding: 12px 20px !important;
    }

    /* Section Headers */
    .features-section-title {
      font-size: 28px !important;
    }
    .features-section-header {
      margin-bottom: 32px !important;
    }

    /* Features Grid */
    .features-grid {
      grid-template-columns: 1fr !important;
      gap: 14px !important;
    }
    .features-card {
      padding: 20px !important;
    }

    /* Feature Details */
    .features-detail-inner {
      flex-direction: column !important;
      gap: 30px !important;
    }
    .features-detail-content,
    .features-detail-visual {
      order: unset !important;
    }
    .features-detail-visual {
      display: none !important;
    }

    /* Footer */
    .features-footer-inner {
      flex-direction: column !important;
      gap: 12px !important;
    }
    .features-footer-links {
      flex-wrap: wrap !important;
      justify-content: center !important;
    }
  }

  @media (max-width: 480px) {
    .features-hero-title {
      font-size: 28px !important;
    }
    .features-hero-badge {
      display: none !important;
    }
  }
`;
if (!document.getElementById('features-animations')) {
  styleSheet.id = 'features-animations';
  document.head.appendChild(styleSheet);
}

export default FeaturesPage;
