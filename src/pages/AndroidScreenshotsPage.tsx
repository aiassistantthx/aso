import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';

interface Props {
  onGetStarted: () => void;
  onNavigate?: (page: string) => void;
}

// Color palette: Warm Neutral + Coral Accent (matching Landing.tsx)
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
  android: '#3DDC84', // Android green
  androidDark: '#0F9D58',
};

// Android device specifications for Play Store
const androidDevices = [
  {
    name: 'Phone Screenshots',
    minSize: '320px x 569px',
    maxSize: '1080px x 1920px',
    aspectRatio: '16:9',
    required: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke={colors.android} strokeWidth="1.5"/>
        <circle cx="12" cy="18" r="1" fill={colors.android}/>
        <path d="M9 5h6" stroke={colors.android} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: '7-inch Tablet',
    minSize: '320px x 480px',
    maxSize: '1080px x 1920px',
    aspectRatio: '16:9',
    required: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke={colors.android} strokeWidth="1.5"/>
        <circle cx="12" cy="17" r="1" fill={colors.android}/>
      </svg>
    ),
  },
  {
    name: '10-inch Tablet',
    minSize: '1080px x 1920px',
    maxSize: '1920px x 1200px',
    aspectRatio: '16:10',
    required: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke={colors.android} strokeWidth="1.5"/>
        <circle cx="19" cy="12" r="1" fill={colors.android}/>
      </svg>
    ),
  },
  {
    name: 'Chromebook',
    minSize: '1280px x 800px',
    maxSize: '1920px x 1080px',
    aspectRatio: '16:9',
    required: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="12" rx="2" stroke={colors.android} strokeWidth="1.5"/>
        <path d="M4 20h16" stroke={colors.android} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 16v4M16 16v4" stroke={colors.android} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// Play Store specific features
const playStoreFeatures = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 3l18 9-18 9V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Play Store Ready',
    description: 'Export screenshots optimized for Google Play Console requirements.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 22h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Android Device Frames',
    description: 'Beautiful Pixel and Samsung device mockups for professional presentation.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Multi-language Support',
    description: 'Localize to all 50+ Play Store languages with AI-powered translations.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Store Metadata',
    description: 'Generate optimized titles, descriptions, and feature graphics.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Batch Export',
    description: 'Download all device sizes and languages in one organized ZIP file.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Smart Headlines',
    description: 'AI-generated marketing headlines with bracket highlighting.',
  },
];

// Android mockup types available
const androidMockups = [
  { name: 'Google Pixel 8', style: 'Clean minimal design', popular: true },
  { name: 'Samsung Galaxy S24', style: 'Modern flagship look', popular: true },
  { name: 'Google Pixel 7a', style: 'Affordable premium', popular: false },
  { name: 'OnePlus 12', style: 'Sleek and fast', popular: false },
  { name: 'Samsung Galaxy Z Fold', style: 'Foldable innovation', popular: false },
  { name: 'Generic Android', style: 'Universal clean frame', popular: false },
];

// Section header with decorative lines
const SectionHeader: React.FC<{ label: string; title: string; subtitle: string }> = ({ label, title, subtitle }) => (
  <div style={styles.sectionHeader} className="android-section-header">
    <span style={styles.sectionLabel}>{label}</span>
    <h2 style={styles.sectionTitle} className="android-section-title">{title}</h2>
    <div style={styles.sectionTitleLine} />
    <p style={styles.sectionSubtitle}>{subtitle}</p>
  </div>
);

// Section divider
const SectionDivider: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', ...style }}>
    <div style={{ height: '0.5px', width: 50, backgroundColor: colors.border }} />
    <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: colors.android, margin: '0 14px' }} />
    <div style={{ height: '0.5px', width: 50, backgroundColor: colors.border }} />
  </div>
);

export const AndroidScreenshotsPage: React.FC<Props> = ({ onGetStarted, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={styles.container}>
      <SEOHead
        title="Play Store Screenshots Generator - Android Mockups | LocalizeShots"
        description="Create stunning Play Store screenshots with Android device mockups. Generate localized Google Play screenshots for Pixel, Samsung, and all Android devices. Free tool for ASO optimization."
        canonicalUrl="/android-screenshots"
      />

      {/* Navigation */}
      <nav style={{
        ...styles.nav,
        backgroundColor: scrolled ? 'rgba(250, 250, 248, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.borderLight}` : 'none',
      }}>
        <div style={styles.navInner} className="android-nav-inner">
          <a
            href="/"
            style={styles.logo}
            onClick={(e) => { e.preventDefault(); onNavigate?.('landing'); }}
          >
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={styles.logoText} className="android-logo-text">LocalizeShots</span>
          </a>
          <div style={styles.navLinks} className="android-nav-links">
            <a href="/#features" style={styles.navLink}>Features</a>
            <a href="/#how-it-works" style={styles.navLink}>How it works</a>
            <a href="/#pricing" style={styles.navLink}>Pricing</a>
          </div>
          <div style={styles.navButtons} className="android-nav-buttons">
            <button style={styles.loginBtn} className="android-login-btn" onClick={() => onNavigate?.('login')}>Sign In</button>
            <button style={styles.ctaBtn} className="android-cta-btn" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero} className="android-hero">
        <div style={styles.heroContent}>
          <div style={styles.heroBadge} className="android-hero-badge">
            <span style={styles.heroBadgeLine} />
            <span style={{ ...styles.heroBadgeText, color: colors.android }}>Play Store Screenshots</span>
            <span style={styles.heroBadgeLine} />
          </div>
          <h1 style={styles.heroTitle} className="android-hero-title">
            Create stunning<br />
            <span style={{ color: colors.android }}>Android screenshots</span>
          </h1>
          <p style={styles.heroSubtitle} className="android-hero-subtitle">
            Generate professional Play Store screenshots with Android device mockups.<br />
            Pixel, Samsung, and more - localized for all markets in minutes.
          </p>
          <div style={styles.heroCtas} className="android-hero-ctas">
            <button style={{ ...styles.heroCtaPrimary, backgroundColor: colors.android, boxShadow: `0 6px 20px ${colors.android}35` }} className="android-hero-cta-primary" onClick={onGetStarted}>
              Start Creating Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button style={styles.heroCtaSecondary} className="android-hero-cta-secondary" onClick={() => document.getElementById('device-sizes')?.scrollIntoView({ behavior: 'smooth' })}>
              View Requirements
            </button>
          </div>
        </div>

        {/* Hero Visual - Android Device Preview */}
        <div style={styles.heroVisual} className="android-hero-visual">
          <div style={styles.devicesPreview}>
            {/* Pixel Phone Mockup */}
            <div style={styles.deviceFrame}>
              <div style={styles.pixelDevice}>
                <div style={styles.pixelNotch} />
                <div style={styles.pixelScreen}>
                  <div style={styles.screenshotPlaceholder}>
                    <div style={styles.headlineBracket}>[Transform]</div>
                    <div style={styles.headlineText}>Your App's</div>
                    <div style={styles.headlineBracket}>[Presence]</div>
                  </div>
                </div>
              </div>
              <div style={styles.deviceLabel}>Google Pixel</div>
            </div>

            {/* Samsung Phone Mockup */}
            <div style={{ ...styles.deviceFrame, transform: 'scale(0.9) translateY(20px)' }}>
              <div style={styles.samsungDevice}>
                <div style={styles.samsungPunch} />
                <div style={styles.pixelScreen}>
                  <div style={styles.screenshotPlaceholder}>
                    <div style={styles.headlineBracket}>[Boost]</div>
                    <div style={styles.headlineText}>Downloads</div>
                    <div style={styles.headlineBracket}>[Instantly]</div>
                  </div>
                </div>
              </div>
              <div style={styles.deviceLabel}>Samsung Galaxy</div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider style={{ marginTop: 20, marginBottom: 20 }} />

      {/* Device Sizes Section */}
      <section id="device-sizes" style={styles.deviceSizesSection}>
        <SectionHeader
          label="Requirements"
          title="Play Store Screenshot Sizes"
          subtitle="All the dimensions you need for Google Play Console"
        />

        <div style={styles.deviceGrid} className="android-device-grid">
          {androidDevices.map((device, i) => (
            <div key={i} style={styles.deviceCard} className="android-device-card">
              <div style={styles.deviceIconWrapper}>
                {device.icon}
              </div>
              <h3 style={styles.deviceName}>{device.name}</h3>
              {device.required && (
                <span style={styles.requiredBadge}>Required</span>
              )}
              <div style={styles.deviceDivider} />
              <div style={styles.deviceSpecs}>
                <div style={styles.specRow}>
                  <span style={styles.specLabel}>Min Size:</span>
                  <span style={styles.specValue}>{device.minSize}</span>
                </div>
                <div style={styles.specRow}>
                  <span style={styles.specLabel}>Max Size:</span>
                  <span style={styles.specValue}>{device.maxSize}</span>
                </div>
                <div style={styles.specRow}>
                  <span style={styles.specLabel}>Aspect:</span>
                  <span style={styles.specValue}>{device.aspectRatio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.tipsBox}>
          <div style={styles.tipsIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={colors.android} strokeWidth="1.5"/>
              <path d="M12 16v-4M12 8h.01" stroke={colors.android} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <strong style={{ color: colors.text }}>Pro Tip:</strong>{' '}
            <span style={{ color: colors.textSecondary }}>
              Upload 4-8 screenshots per device type. Google Play displays the first 3-4 in search results.
            </span>
          </div>
        </div>
      </section>

      {/* Android Mockups Section */}
      <section style={styles.mockupsSection}>
        <SectionHeader
          label="Mockups"
          title="Android Device Frames"
          subtitle="Professional mockups for every major Android device"
        />

        <div style={styles.mockupsGrid} className="android-mockups-grid">
          {androidMockups.map((mockup, i) => (
            <div key={i} style={styles.mockupCard} className="android-mockup-card">
              <div style={styles.mockupPreview}>
                <div style={{ ...styles.mockupFrame, borderColor: mockup.popular ? colors.android : colors.borderLight }}>
                  <div style={styles.mockupScreen} />
                </div>
              </div>
              <div style={styles.mockupInfo}>
                <h4 style={styles.mockupName}>
                  {mockup.name}
                  {mockup.popular && <span style={styles.popularBadge}>Popular</span>}
                </h4>
                <p style={styles.mockupStyle}>{mockup.style}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <SectionHeader
          label="Features"
          title="Everything for Play Store"
          subtitle="Tools designed specifically for Android app success"
        />

        <div style={styles.featuresGrid} className="android-features-grid">
          {playStoreFeatures.map((feature, i) => (
            <div key={i} style={styles.featureCard} className="android-feature-card">
              <div style={{ ...styles.featureIcon, backgroundColor: `${colors.android}15`, color: colors.android }}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <div style={styles.featureDivider} />
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <div style={styles.ctaAndroidLogo}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M17 8l1.5-2.5M7 8L5.5 5.5M12 2v3M4 12h2M18 12h2M5 19h14a2 2 0 002-2v-5a7 7 0 10-14 0v5a2 2 0 002 2z" stroke={colors.android} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="13" r="1" fill={colors.android}/>
              <circle cx="15" cy="13" r="1" fill={colors.android}/>
            </svg>
          </div>
          <h2 style={styles.ctaTitle}>Ready to boost your Play Store presence?</h2>
          <p style={styles.ctaSubtitle}>
            Create professional Android screenshots in minutes, not hours.<br />
            Start free - no credit card required.
          </p>
          <button
            style={{ ...styles.ctaButton, backgroundColor: colors.android }}
            onClick={onGetStarted}
          >
            Create Android Screenshots
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner} className="android-footer-inner">
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
          <div style={styles.footerLinks} className="android-footer-links">
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
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
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
    fontSize: 58,
    fontWeight: 400,
    color: colors.text,
    lineHeight: 1.15,
    letterSpacing: '-1px',
    marginBottom: 24,
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
    backgroundColor: colors.android,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
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

  // Hero Visual
  heroVisual: {
    marginTop: 56,
    padding: '0 24px',
    overflow: 'hidden',
  },
  devicesPreview: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 32,
    maxWidth: 600,
    margin: '0 auto',
  },
  deviceFrame: {
    textAlign: 'center',
  },
  pixelDevice: {
    width: 180,
    height: 360,
    backgroundColor: '#1d1d1f',
    borderRadius: 32,
    padding: 8,
    position: 'relative',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2)',
  },
  pixelNotch: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 60,
    height: 20,
    backgroundColor: '#1d1d1f',
    borderRadius: 10,
    zIndex: 10,
  },
  pixelScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  samsungDevice: {
    width: 180,
    height: 360,
    backgroundColor: '#1d1d1f',
    borderRadius: 28,
    padding: 6,
    position: 'relative',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2)',
  },
  samsungPunch: {
    position: 'absolute',
    top: 18,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 12,
    height: 12,
    backgroundColor: '#1d1d1f',
    borderRadius: '50%',
    zIndex: 10,
  },
  screenshotPlaceholder: {
    textAlign: 'center',
    padding: 20,
  },
  headlineBracket: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.android,
    marginBottom: 4,
  },
  headlineText: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 4,
  },
  deviceLabel: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: 500,
    color: colors.textMuted,
  },

  // Section Header
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 56,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.android,
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
    backgroundColor: colors.android,
    margin: '0 auto 16px',
  },
  sectionSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    fontWeight: 400,
    letterSpacing: '0.2px',
  },

  // Device Sizes Section
  deviceSizesSection: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  deviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    maxWidth: 1000,
    margin: '0 auto',
  },
  deviceCard: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 24,
    textAlign: 'center',
    border: `1px solid ${colors.borderLight}`,
    position: 'relative',
  },
  deviceIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: `${colors.android}10`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  requiredBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    fontSize: 10,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.android,
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  deviceDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    margin: '16px 0',
  },
  deviceSpecs: {
    textAlign: 'left',
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: 13,
  },
  specLabel: {
    color: colors.textMuted,
  },
  specValue: {
    color: colors.text,
    fontWeight: 500,
  },
  tipsBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    maxWidth: 600,
    margin: '40px auto 0',
    padding: 20,
    backgroundColor: `${colors.android}08`,
    borderRadius: 12,
    border: `1px solid ${colors.android}20`,
  },
  tipsIcon: {
    flexShrink: 0,
  },

  // Mockups Section
  mockupsSection: {
    padding: '80px 24px',
  },
  mockupsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    maxWidth: 900,
    margin: '0 auto',
  },
  mockupCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 20,
    border: `1px solid ${colors.borderLight}`,
    textAlign: 'center',
  },
  mockupPreview: {
    marginBottom: 16,
  },
  mockupFrame: {
    width: 60,
    height: 100,
    backgroundColor: '#1d1d1f',
    borderRadius: 10,
    padding: 4,
    margin: '0 auto',
    border: '2px solid',
  },
  mockupScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  mockupInfo: {
    textAlign: 'center',
  },
  mockupName: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  popularBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.android,
    backgroundColor: `${colors.android}15`,
    padding: '2px 6px',
    borderRadius: 4,
  },
  mockupStyle: {
    fontSize: 13,
    color: colors.textMuted,
    margin: 0,
  },

  // Features Section
  featuresSection: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 18,
    maxWidth: 900,
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    padding: 26,
    border: `1px solid ${colors.borderLight}`,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 10,
    letterSpacing: '-0.2px',
  },
  featureDivider: {
    width: 24,
    height: '0.5px',
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
    fontWeight: 400,
  },

  // CTA Section
  ctaSection: {
    padding: '80px 24px',
  },
  ctaBox: {
    maxWidth: 700,
    margin: '0 auto',
    padding: '60px 40px',
    backgroundColor: colors.card,
    borderRadius: 24,
    textAlign: 'center',
    border: `1px solid ${colors.borderLight}`,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)',
  },
  ctaAndroidLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${colors.android}10`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 16,
    letterSpacing: '-0.5px',
  },
  ctaSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 1.6,
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: `0 6px 24px ${colors.android}35`,
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  /* Mobile Responsive Styles */
  @media (max-width: 768px) {
    /* Navigation */
    .android-nav-links {
      display: none !important;
    }
    .android-nav-inner {
      padding: 12px 16px !important;
    }
    .android-logo-text {
      font-size: 15px !important;
    }
    .android-nav-buttons .android-login-btn {
      display: none !important;
    }
    .android-nav-buttons .android-cta-btn {
      padding: 8px 16px !important;
      font-size: 12px !important;
    }

    /* Hero */
    .android-hero {
      padding-top: 80px !important;
      padding-bottom: 40px !important;
    }
    .android-hero-title {
      font-size: 36px !important;
      line-height: 1.2 !important;
      margin-bottom: 16px !important;
    }
    .android-hero-subtitle {
      font-size: 15px !important;
      margin-bottom: 24px !important;
    }
    .android-hero-subtitle br {
      display: none;
    }
    .android-hero-ctas {
      flex-direction: column !important;
      gap: 10px !important;
    }
    .android-hero-cta-primary,
    .android-hero-cta-secondary {
      width: 100% !important;
      justify-content: center !important;
      padding: 12px 20px !important;
    }
    .android-hero-visual {
      margin-top: 32px !important;
    }

    /* Section Headers */
    .android-section-title {
      font-size: 28px !important;
    }
    .android-section-header {
      margin-bottom: 32px !important;
    }

    /* Device Grid */
    .android-device-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px !important;
    }
    .android-device-card {
      padding: 16px !important;
    }

    /* Mockups Grid */
    .android-mockups-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 14px !important;
    }
    .android-mockup-card {
      padding: 16px !important;
    }

    /* Features Grid */
    .android-features-grid {
      grid-template-columns: 1fr !important;
      gap: 14px !important;
    }
    .android-feature-card {
      padding: 20px !important;
    }

    /* Footer */
    .android-footer-inner {
      flex-direction: column !important;
      gap: 12px !important;
    }
    .android-footer-links {
      flex-wrap: wrap !important;
      justify-content: center !important;
    }
  }

  @media (max-width: 480px) {
    .android-hero-title {
      font-size: 30px !important;
    }
    .android-device-grid {
      grid-template-columns: 1fr !important;
    }
    .android-mockups-grid {
      grid-template-columns: 1fr !important;
    }
    .android-hero-badge {
      display: none !important;
    }
  }
`;
if (!document.getElementById('android-page-styles')) {
  styleSheet.id = 'android-page-styles';
  document.head.appendChild(styleSheet);
}

export default AndroidScreenshotsPage;
