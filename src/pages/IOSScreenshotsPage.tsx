import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigate?: (page: string) => void;
}

// Color palette: Warm Neutral + Coral Accent (same as Landing)
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

// iOS device specifications
const iosDevices = [
  {
    name: 'iPhone 16 Pro Max',
    size: '6.9"',
    resolution: '1320 x 2868',
    scale: '3x',
    category: 'iPhone',
  },
  {
    name: 'iPhone 16 Pro',
    size: '6.3"',
    resolution: '1206 x 2622',
    scale: '3x',
    category: 'iPhone',
  },
  {
    name: 'iPhone 16 Plus',
    size: '6.7"',
    resolution: '1290 x 2796',
    scale: '3x',
    category: 'iPhone',
  },
  {
    name: 'iPhone 16',
    size: '6.1"',
    resolution: '1179 x 2556',
    scale: '3x',
    category: 'iPhone',
  },
  {
    name: 'iPhone 15 Pro Max',
    size: '6.7"',
    resolution: '1290 x 2796',
    scale: '3x',
    category: 'iPhone',
  },
  {
    name: 'iPhone 15 Pro',
    size: '6.1"',
    resolution: '1179 x 2556',
    scale: '3x',
    category: 'iPhone',
  },
  {
    name: 'iPhone SE (3rd gen)',
    size: '4.7"',
    resolution: '750 x 1334',
    scale: '2x',
    category: 'iPhone',
  },
  {
    name: 'iPad Pro 12.9"',
    size: '12.9"',
    resolution: '2048 x 2732',
    scale: '2x',
    category: 'iPad',
  },
  {
    name: 'iPad Pro 11"',
    size: '11"',
    resolution: '1668 x 2388',
    scale: '2x',
    category: 'iPad',
  },
  {
    name: 'iPad Air',
    size: '10.9"',
    resolution: '1640 x 2360',
    scale: '2x',
    category: 'iPad',
  },
];

// App Store screenshot requirements
const screenshotRequirements = [
  {
    device: '6.9" Super Retina XDR',
    required: true,
    size: '1320 x 2868 px',
    models: 'iPhone 16 Pro Max',
  },
  {
    device: '6.7" Super Retina XDR',
    required: true,
    size: '1290 x 2796 px',
    models: 'iPhone 15 Plus, 15 Pro Max, 14 Plus, 14 Pro Max',
  },
  {
    device: '6.5" Super Retina XDR',
    required: true,
    size: '1284 x 2778 px',
    models: 'iPhone 11 Pro Max, 12 Pro Max, 13 Pro Max',
  },
  {
    device: '5.5" Retina HD',
    required: true,
    size: '1242 x 2208 px',
    models: 'iPhone 6s Plus, 7 Plus, 8 Plus',
  },
  {
    device: '12.9" iPad Pro',
    required: false,
    size: '2048 x 2732 px',
    models: 'iPad Pro 12.9" (all generations)',
  },
];

// Section header component
const SectionHeader: React.FC<{ label: string; title: string; subtitle: string }> = ({ label, title, subtitle }) => (
  <div style={styles.sectionHeader} className="ios-section-header">
    <span style={styles.sectionLabel}>{label}</span>
    <h2 style={styles.sectionTitle} className="ios-section-title">{title}</h2>
    <div style={styles.sectionTitleLine} />
    <p style={styles.sectionSubtitle}>{subtitle}</p>
  </div>
);

// Decorative line component
const SectionDivider: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', ...style }}>
    <div style={{ height: '0.5px', width: 50, backgroundColor: colors.border }} />
    <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: colors.accent, margin: '0 14px' }} />
    <div style={{ height: '0.5px', width: 50, backgroundColor: colors.border }} />
  </div>
);

export const IOSScreenshotsPage: React.FC<Props> = ({ onGetStarted, onLogin, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={styles.container}>
      <SEOHead
        title="iPhone Screenshot Generator - iOS App Store Screenshots | LocalizeShots"
        description="Create stunning iPhone and iPad screenshots for the App Store. Generate localized iOS screenshots with device mockups, AI headlines, and export in all required sizes. iPhone 16, 15 Pro, iPad Pro supported."
        canonicalUrl="/ios-screenshots"
      />

      {/* iOS-specific Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'LocalizeShots - iOS Screenshot Generator',
            applicationCategory: 'DesignApplication',
            operatingSystem: 'Web',
            description: 'Create professional iPhone and iPad screenshots for the App Store with AI-powered headlines and automatic localization.',
            url: 'https://localizeshots.com/ios-screenshots',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free plan available with 3 projects',
            },
            featureList: [
              'iPhone 16 Pro Max screenshots',
              'iPhone 15 Pro screenshots',
              'iPad Pro screenshots',
              'iOS device mockups',
              'App Store-ready export',
              '40+ language localization',
            ],
          }),
        }}
      />

      {/* Navigation */}
      <nav style={{
        ...styles.nav,
        backgroundColor: scrolled ? 'rgba(250, 250, 248, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.borderLight}` : 'none',
      }}>
        <div style={styles.navInner} className="ios-nav-inner">
          <a href="/" style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={styles.logoText} className="ios-logo-text">LocalizeShots</span>
          </a>
          <div style={styles.navLinks} className="ios-nav-links">
            <a href="/#features" style={styles.navLink}>Features</a>
            <a href="/#how-it-works" style={styles.navLink}>How it works</a>
            <a href="/#pricing" style={styles.navLink}>Pricing</a>
          </div>
          <div style={styles.navButtons} className="ios-nav-buttons">
            <button style={styles.loginBtn} className="ios-login-btn" onClick={onLogin}>Sign In</button>
            <button style={styles.ctaBtn} className="ios-cta-btn" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero} className="ios-hero">
        <div style={styles.heroContent}>
          <div style={styles.heroBadge} className="ios-hero-badge">
            <span style={styles.heroBadgeLine} />
            <span style={styles.heroBadgeText}>iPhone Screenshot Generator</span>
            <span style={styles.heroBadgeLine} />
          </div>
          <h1 style={styles.heroTitle} className="ios-hero-title">
            Create stunning <span style={styles.heroAccent}>iOS</span><br />
            App Store screenshots
          </h1>
          <p style={styles.heroSubtitle} className="ios-hero-subtitle">
            Generate professional iPhone and iPad screenshots with device mockups,<br />
            AI-powered headlines, and one-click localization to 40+ languages.
          </p>
          <div style={styles.heroCtas} className="ios-hero-ctas">
            <button style={styles.heroCtaPrimary} className="ios-hero-cta-primary" onClick={onGetStarted}>
              Create iOS Screenshots Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button style={styles.heroCtaSecondary} className="ios-hero-cta-secondary" onClick={() => document.getElementById('devices')?.scrollIntoView({ behavior: 'smooth' })}>
              View Supported Devices
            </button>
          </div>
        </div>

        {/* Hero Visual - iPhone Mockup Grid */}
        <div style={styles.heroVisual} className="ios-hero-visual">
          <div style={styles.mockupGrid}>
            {/* iPhone mockup representation */}
            <div style={styles.mockupItem}>
              <div style={styles.iphoneMockup}>
                <div style={styles.iphoneNotch} />
                <div style={styles.iphoneScreen}>
                  <div style={styles.iphoneScreenContent}>
                    <div style={styles.mockupHeadline}>[Capture] Every Moment</div>
                    <div style={styles.mockupApp}>
                      <div style={styles.mockupAppPlaceholder} />
                    </div>
                  </div>
                </div>
              </div>
              <span style={styles.mockupLabel}>iPhone 16 Pro Max</span>
            </div>
            <div style={styles.mockupItem}>
              <div style={{ ...styles.iphoneMockup, transform: 'scale(0.85)' }}>
                <div style={styles.iphoneNotch} />
                <div style={styles.iphoneScreen}>
                  <div style={styles.iphoneScreenContent}>
                    <div style={styles.mockupHeadline}>[Edit] Like a Pro</div>
                    <div style={styles.mockupApp}>
                      <div style={styles.mockupAppPlaceholder} />
                    </div>
                  </div>
                </div>
              </div>
              <span style={styles.mockupLabel}>iPhone 15 Pro</span>
            </div>
            <div style={styles.mockupItem}>
              <div style={{ ...styles.iphoneMockup, transform: 'scale(0.7)' }}>
                <div style={styles.iphoneNotch} />
                <div style={styles.iphoneScreen}>
                  <div style={styles.iphoneScreenContent}>
                    <div style={{ ...styles.mockupHeadline, fontSize: 10 }}>[Share] Instantly</div>
                    <div style={styles.mockupApp}>
                      <div style={styles.mockupAppPlaceholder} />
                    </div>
                  </div>
                </div>
              </div>
              <span style={styles.mockupLabel}>iPhone SE</span>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider style={{ marginTop: 20, marginBottom: 20 }} />

      {/* iOS Features Section */}
      <section style={styles.iosFeatures}>
        <SectionHeader
          label="iOS Features"
          title="Built for the App Store"
          subtitle="Everything you need for perfect iOS screenshots"
        />

        <div style={styles.featuresGrid} className="ios-features-grid">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'iPhone 16 Series Ready',
              description: 'Full support for iPhone 16, 16 Plus, 16 Pro, and 16 Pro Max with Dynamic Island mockups.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 18v4M8 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'iPad Screenshots',
              description: 'Create screenshots for iPad Pro 12.9", iPad Pro 11", iPad Air, and iPad mini.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'App Store Ready Export',
              description: 'Export in all required sizes: 6.9", 6.7", 6.5", 5.5" displays plus iPad formats.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              ),
              title: '40+ Languages',
              description: 'Localize your iOS screenshots to all App Store supported languages instantly.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'AI Headlines',
              description: 'Generate compelling App Store headlines with smart [bracket] highlights automatically.',
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'Apple Guidelines',
              description: 'Screenshots follow Apple Human Interface Guidelines and App Store requirements.',
            },
          ].map((feature, i) => (
            <div key={i} style={styles.featureCard} className="ios-feature-card">
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <div style={styles.featureDivider} />
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Device Sizes Section */}
      <section id="devices" style={styles.devicesSection}>
        <SectionHeader
          label="Device Sizes"
          title="All iOS devices supported"
          subtitle="Create screenshots for every iPhone and iPad in the App Store"
        />

        <div style={styles.devicesTabs}>
          <div style={styles.devicesGrid} className="ios-devices-grid">
            {iosDevices.map((device, i) => (
              <div key={i} style={styles.deviceCard} className="ios-device-card">
                <div style={styles.deviceIcon}>
                  {device.category === 'iPhone' ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                      <path d="M12 18h.01" stroke={colors.accent} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="16" rx="2" stroke={colors.accent} strokeWidth="1.5"/>
                      <circle cx="12" cy="12" r="1" fill={colors.accent}/>
                    </svg>
                  )}
                </div>
                <div style={styles.deviceInfo}>
                  <h4 style={styles.deviceName}>{device.name}</h4>
                  <p style={styles.deviceSpecs}>{device.size} display | {device.resolution} | {device.scale}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Store Requirements Section */}
      <section style={styles.requirementsSection}>
        <SectionHeader
          label="Requirements"
          title="App Store screenshot sizes"
          subtitle="We handle all the required sizes automatically"
        />

        <div style={styles.requirementsTable}>
          <div style={styles.tableHeader}>
            <span style={styles.tableHeaderCell}>Display Size</span>
            <span style={styles.tableHeaderCell}>Resolution</span>
            <span style={styles.tableHeaderCell}>Compatible Devices</span>
            <span style={styles.tableHeaderCell}>Required</span>
          </div>
          {screenshotRequirements.map((req, i) => (
            <div key={i} style={styles.tableRow}>
              <span style={styles.tableCell}>{req.device}</span>
              <span style={{ ...styles.tableCell, fontFamily: 'monospace' }}>{req.size}</span>
              <span style={{ ...styles.tableCell, color: colors.textSecondary }}>{req.models}</span>
              <span style={styles.tableCell}>
                {req.required ? (
                  <span style={styles.requiredBadge}>Required</span>
                ) : (
                  <span style={styles.optionalBadge}>Optional</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works for iOS */}
      <section style={styles.howItWorks}>
        <SectionHeader
          label="Process"
          title="Create iOS screenshots in 4 steps"
          subtitle="From raw screenshots to App Store-ready in minutes"
        />

        <div style={styles.stepsGrid} className="ios-steps-grid">
          {[
            {
              num: '1',
              title: 'Upload iOS screenshots',
              desc: 'Add your raw iPhone or iPad screenshots from your device or simulator.',
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            },
            {
              num: '2',
              title: 'Add device mockups',
              desc: 'Choose from iPhone 16, 15 Pro, SE, or iPad frames with realistic bezels.',
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M12 18h.01" stroke={colors.accent} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )
            },
            {
              num: '3',
              title: 'Generate headlines',
              desc: 'AI creates compelling headlines with [highlighted] keywords for the App Store.',
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )
            },
            {
              num: '4',
              title: 'Export for App Store',
              desc: 'Download in all required iOS sizes, organized by language and device.',
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            },
          ].map((step, i) => (
            <div key={i} style={styles.stepCard} className="ios-step-card">
              <div style={styles.stepIcon}>{step.icon}</div>
              <div style={styles.stepNum}>{step.num}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to create iOS screenshots?</h2>
          <p style={styles.ctaSubtitle}>
            Start for free. No credit card required.
          </p>
          <button style={styles.ctaButton} onClick={onGetStarted}>
            Create iOS Screenshots
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Related Resources Section */}
      <section style={styles.relatedSection}>
        <div style={styles.relatedInner}>
          <h2 style={styles.relatedTitle}>Related Resources</h2>
          <div style={styles.relatedGrid} className="ios-related-grid">
            <a href="/android-screenshots" style={styles.relatedCard} onClick={(e) => { e.preventDefault(); onNavigate?.('android-screenshots'); }}>
              <div style={styles.relatedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17 8l1.5-2.5M7 8L5.5 5.5M12 2v3" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="5" y="10" width="14" height="10" rx="2" stroke={colors.accent} strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 style={styles.relatedCardTitle}>Android Screenshots</h3>
              <p style={styles.relatedCardDesc}>Create Play Store screenshots with Android device mockups</p>
            </a>
            <a href="/features" style={styles.relatedCard} onClick={(e) => { e.preventDefault(); onNavigate?.('features'); }}>
              <div style={styles.relatedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.relatedCardTitle}>All Features</h3>
              <p style={styles.relatedCardDesc}>Explore AI headlines, localization, and mockup generation</p>
            </a>
            <a href="/tools/size-calculator" style={styles.relatedCard} onClick={(e) => { e.preventDefault(); onNavigate?.('size-calculator'); }}>
              <div style={styles.relatedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M4 9h16M9 4v16" stroke={colors.accent} strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 style={styles.relatedCardTitle}>Size Calculator</h3>
              <p style={styles.relatedCardDesc}>Find exact screenshot dimensions for all Apple devices</p>
            </a>
            <a href="/blog" style={styles.relatedCard} onClick={(e) => { e.preventDefault(); onNavigate?.('blog'); }}>
              <div style={styles.relatedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={styles.relatedCardTitle}>Blog</h3>
              <p style={styles.relatedCardDesc}>ASO tips, screenshot best practices, and app marketing guides</p>
            </a>
            <a href="/alternatives" style={styles.relatedCard} onClick={(e) => { e.preventDefault(); onNavigate?.('alternatives'); }}>
              <div style={styles.relatedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={styles.relatedCardTitle}>Alternatives</h3>
              <p style={styles.relatedCardDesc}>Compare LocalizeShots with other screenshot tools</p>
            </a>
            <a href="/about" style={styles.relatedCard} onClick={(e) => { e.preventDefault(); onNavigate?.('about'); }}>
              <div style={styles.relatedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M12 16v-4M12 8h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.relatedCardTitle}>About Us</h3>
              <p style={styles.relatedCardDesc}>Learn about our mission to simplify app localization</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner} className="ios-footer-inner">
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
          <div style={styles.footerLinks} className="ios-footer-links">
            <button
              onClick={() => onNavigate?.('terms')}
              style={styles.footerLink}
            >
              Terms of Service
            </button>
            <span style={styles.footerLinkDivider}>|</span>
            <button
              onClick={() => onNavigate?.('privacy')}
              style={styles.footerLink}
            >
              Privacy Policy
            </button>
            <span style={styles.footerLinkDivider}>|</span>
            <button
              onClick={() => onNavigate?.('refund')}
              style={styles.footerLink}
            >
              Refund Policy
            </button>
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

  // Hero Visual - Mockup Grid
  heroVisual: {
    marginTop: 56,
    padding: '0 24px',
    overflow: 'hidden',
  },
  mockupGrid: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 24,
    maxWidth: 700,
    margin: '0 auto',
  },
  mockupItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  iphoneMockup: {
    width: 180,
    height: 380,
    backgroundColor: '#1d1d1f',
    borderRadius: 32,
    padding: 8,
    position: 'relative',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
  },
  iphoneNotch: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 80,
    height: 24,
    backgroundColor: '#1d1d1f',
    borderRadius: 12,
    zIndex: 2,
  },
  iphoneScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  iphoneScreenContent: {
    padding: 16,
    paddingTop: 40,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
  },
  mockupHeadline: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  mockupApp: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupAppPlaceholder: {
    width: '80%',
    height: '70%',
    backgroundColor: colors.accentBg,
    borderRadius: 12,
    border: `2px dashed ${colors.accent}`,
  },
  mockupLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: colors.textSecondary,
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

  // iOS Features
  iosFeatures: {
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
    backgroundColor: colors.accentBg,
    color: colors.accent,
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

  // Devices Section
  devicesSection: {
    padding: '80px 24px',
  },
  devicesTabs: {
    maxWidth: 900,
    margin: '0 auto',
  },
  devicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  deviceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    border: `1px solid ${colors.borderLight}`,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  deviceSpecs: {
    fontSize: 13,
    color: colors.textSecondary,
    margin: 0,
  },

  // Requirements Section
  requirementsSection: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  requirementsTable: {
    maxWidth: 900,
    margin: '0 auto',
    borderRadius: 12,
    border: `1px solid ${colors.borderLight}`,
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 2fr 0.8fr',
    gap: 16,
    padding: '16px 20px',
    backgroundColor: colors.bg,
    borderBottom: `1px solid ${colors.borderLight}`,
    fontWeight: 600,
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableHeaderCell: {},
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 2fr 0.8fr',
    gap: 16,
    padding: '16px 20px',
    borderBottom: `1px solid ${colors.borderLight}`,
    fontSize: 14,
    color: colors.text,
  },
  tableCell: {},
  requiredBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: `${colors.accent}15`,
    color: colors.accent,
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
  },
  optionalBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: colors.bg,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 6,
  },

  // How it Works
  howItWorks: {
    padding: '80px 24px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    maxWidth: 900,
    margin: '0 auto',
  },
  stepCard: {
    textAlign: 'center',
    padding: '32px 22px',
    backgroundColor: colors.card,
    borderRadius: 18,
    border: `1px solid ${colors.borderLight}`,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  stepNum: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.accent,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 10,
    letterSpacing: '-0.3px',
  },
  stepDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 400,
  },

  // CTA Section
  ctaSection: {
    padding: '80px 24px',
    backgroundColor: colors.accentBg,
  },
  ctaContent: {
    maxWidth: 600,
    margin: '0 auto',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 12,
    letterSpacing: '-0.5px',
  },
  ctaSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  ctaButton: {
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
    letterSpacing: '0.3px',
  },

  // Related Resources
  relatedSection: {
    padding: '80px 24px',
    backgroundColor: colors.bg,
  },
  relatedInner: {
    maxWidth: 1000,
    margin: '0 auto',
  },
  relatedTitle: {
    fontSize: 28,
    fontWeight: 500,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: 40,
    letterSpacing: '-0.5px',
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
  },
  relatedCard: {
    display: 'block',
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 14,
    border: `1px solid ${colors.borderLight}`,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  relatedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  relatedCardTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  relatedCardDesc: {
    fontSize: 14,
    lineHeight: 1.5,
    color: colors.textSecondary,
    margin: 0,
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
  /* Mobile Responsive Styles for iOS Screenshots Page */
  @media (max-width: 768px) {
    /* Navigation */
    .ios-nav-links {
      display: none !important;
    }
    .ios-nav-inner {
      padding: 12px 16px !important;
    }
    .ios-logo-text {
      font-size: 15px !important;
    }
    .ios-nav-buttons .ios-login-btn {
      display: none !important;
    }
    .ios-nav-buttons .ios-cta-btn {
      padding: 8px 16px !important;
      font-size: 12px !important;
    }

    /* Hero */
    .ios-hero {
      padding-top: 80px !important;
      padding-bottom: 40px !important;
    }
    .ios-hero-title {
      font-size: 32px !important;
      line-height: 1.2 !important;
    }
    .ios-hero-subtitle {
      font-size: 15px !important;
      margin-bottom: 24px !important;
    }
    .ios-hero-subtitle br {
      display: none;
    }
    .ios-hero-ctas {
      flex-direction: column !important;
      gap: 10px !important;
    }
    .ios-hero-cta-primary,
    .ios-hero-cta-secondary {
      width: 100% !important;
      justify-content: center !important;
      padding: 12px 20px !important;
    }
    .ios-hero-visual {
      margin-top: 32px !important;
    }

    /* Section Headers */
    .ios-section-title {
      font-size: 28px !important;
    }
    .ios-section-header {
      margin-bottom: 32px !important;
    }

    /* Features Grid */
    .ios-features-grid {
      grid-template-columns: 1fr !important;
      gap: 14px !important;
    }
    .ios-feature-card {
      padding: 20px !important;
    }

    /* Devices Grid */
    .ios-devices-grid {
      grid-template-columns: 1fr !important;
    }

    /* Steps Grid */
    .ios-steps-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px !important;
    }
    .ios-step-card {
      padding: 20px 14px !important;
    }

    /* Related Resources Grid */
    .ios-related-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 14px !important;
    }

    /* Footer */
    .ios-footer-inner {
      flex-direction: column !important;
      gap: 12px !important;
    }
    .ios-footer-links {
      flex-wrap: wrap !important;
      justify-content: center !important;
    }
  }

  @media (max-width: 480px) {
    .ios-hero-title {
      font-size: 28px !important;
    }
    .ios-hero-badge {
      display: none !important;
    }
    .ios-steps-grid {
      grid-template-columns: 1fr !important;
    }
    .ios-related-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
if (!document.getElementById('ios-screenshots-styles')) {
  styleSheet.id = 'ios-screenshots-styles';
  document.head.appendChild(styleSheet);
}

export default IOSScreenshotsPage;
