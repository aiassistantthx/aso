import React, { useState, useEffect } from 'react';

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

// Color palette: Warm Neutral + Coral Accent
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

// Decorative line component
const SectionDivider: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', ...style }}>
    <div style={{ height: '0.5px', width: 50, backgroundColor: colors.border }} />
    <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: colors.accent, margin: '0 14px' }} />
    <div style={{ height: '0.5px', width: 50, backgroundColor: colors.border }} />
  </div>
);

// Section header with decorative lines
const SectionHeader: React.FC<{ label: string; title: string; subtitle: string }> = ({ label, title, subtitle }) => (
  <div style={styles.sectionHeader}>
    <span style={styles.sectionLabel}>{label}</span>
    <h2 style={styles.sectionTitle}>{title}</h2>
    <div style={styles.sectionTitleLine} />
    <p style={styles.sectionSubtitle}>{subtitle}</p>
  </div>
);

export const Landing: React.FC<Props> = ({ onGetStarted, onLogin }) => {
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
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={styles.logoText}>LocalizeShots</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#how-it-works" style={styles.navLink}>How it works</a>
            <a href="#pricing" style={styles.navLink}>Pricing</a>
          </div>
          <div style={styles.navButtons}>
            <button style={styles.loginBtn} onClick={onLogin}>Sign In</button>
            <button style={styles.ctaBtn} onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeLine} />
            <span style={styles.heroBadgeText}>AI-Powered ASO Tool</span>
            <span style={styles.heroBadgeLine} />
          </div>
          <h1 style={styles.heroTitle}>
            Localize App Store<br />
            screenshots <span style={styles.heroAccent}>in minutes</span>
          </h1>
          <p style={styles.heroSubtitle}>
            AI generates headlines and metadata, translates to 40+ languages.<br />
            Export ready-to-upload assets with one click.
          </p>
          <div style={styles.heroCtas}>
            <button style={styles.heroCtaPrimary} onClick={onGetStarted}>
              Start Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button style={styles.heroCtaSecondary} onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </button>
          </div>
        </div>

        {/* Hero Visual - App Interface Preview */}
        <div style={styles.heroVisual}>
          <div style={styles.appPreview}>
            {/* Browser Window */}
            <div style={styles.browserWindow}>
              {/* Browser Header */}
              <div style={styles.browserHeader}>
                <div style={styles.browserDots}>
                  <span style={{ ...styles.browserDot, backgroundColor: '#FF5F57' }} />
                  <span style={{ ...styles.browserDot, backgroundColor: '#FFBD2E' }} />
                  <span style={{ ...styles.browserDot, backgroundColor: '#28C840' }} />
                </div>
                <div style={styles.browserUrl}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#9A9A9A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  localizeshots.com
                </div>
              </div>

              {/* App Content */}
              <div style={styles.appContent}>
                {/* Wizard Steps */}
                <div style={styles.wizardSteps}>
                  {['App Info', 'Screenshots', 'Generate', 'Review', 'Translate', 'Export'].map((_, i) => (
                    <div key={i} style={{
                      ...styles.wizardStep,
                      backgroundColor: i === 3 ? colors.accent : i < 3 ? colors.success : 'transparent',
                      color: i <= 3 ? '#fff' : colors.textMuted,
                      borderColor: i > 3 ? colors.border : 'transparent',
                    }}>
                      {i < 3 ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <span style={{ fontSize: 9, fontWeight: 600 }}>{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Main Content Area */}
                <div style={styles.appMain}>
                  {/* Left Panel - Headlines */}
                  <div style={styles.headlinesPanel}>
                    <div style={styles.panelTitle}>Generated Headlines</div>
                    <div style={styles.headlinesList}>
                      {[
                        '[Create] Stunning Videos [Effortlessly]',
                        '[Transform] Ideas into [Reality]',
                        '[Save] Hours [Every Week]',
                      ].map((headline, i) => (
                        <div key={i} style={styles.headlineItem}>
                          <span style={styles.headlineNum}>{i + 1}</span>
                          <span style={styles.headlineText}>
                            {headline.split(/(\[.*?\])/).map((part, k) => {
                              if (part.startsWith('[') && part.endsWith(']')) {
                                return (
                                  <span key={k} style={styles.headlineHighlight}>
                                    {part.slice(1, -1)}
                                  </span>
                                );
                              }
                              return <span key={k}>{part}</span>;
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Panel - Preview */}
                  <div style={styles.previewPanel}>
                    <div style={styles.previewLanguages}>
                      {['EN', 'DE', 'JA', 'ES'].map((lang, i) => (
                        <span key={i} style={{
                          ...styles.previewLangTab,
                          backgroundColor: i === 0 ? colors.accent : 'transparent',
                          color: i === 0 ? '#fff' : colors.textMuted,
                        }}>{lang}</span>
                      ))}
                    </div>
                    <div style={styles.previewScreenshots}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={styles.previewCard}>
                          <div style={styles.previewHeadline}>
                            {i === 0 && <><span style={styles.hl}>[Create]</span> Stunning Videos <span style={styles.hl}>[Effortlessly]</span></>}
                            {i === 1 && <><span style={styles.hl}>[Transform]</span> Ideas into <span style={styles.hl}>[Reality]</span></>}
                            {i === 2 && <><span style={styles.hl}>[Save]</span> Hours <span style={styles.hl}>[Every Week]</span></>}
                          </div>
                          <div style={styles.previewPhone} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider style={{ marginTop: 20, marginBottom: 20 }} />

      {/* Problem → Solution */}
      <section style={styles.problemSolution}>
        <div style={styles.psContainer}>
          <div style={styles.psCard}>
            <div style={styles.psIconBad}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 style={styles.psTitle}>Without LocalizeShots</h3>
            <div style={styles.psDivider} />
            <ul style={styles.psList}>
              <li>Manually resize screenshots for each device</li>
              <li>Hire translators for each language</li>
              <li>Design headlines in Figma/Photoshop</li>
              <li>Days or weeks of work</li>
            </ul>
          </div>
          <div style={styles.psArrow}>
            <div style={styles.psArrowLine} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={styles.psArrowLine} />
          </div>
          <div style={{ ...styles.psCard, ...styles.psCardGood }}>
            <div style={styles.psIconGood}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke={colors.success} strokeWidth="1.5"/>
                <path d="M9 12l2 2 4-4" stroke={colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={styles.psTitle}>With LocalizeShots</h3>
            <div style={{ ...styles.psDivider, backgroundColor: `${colors.success}30` }} />
            <ul style={styles.psList}>
              <li>AI generates optimized headlines</li>
              <li>One-click translation to 40+ languages</li>
              <li>Automatic device mockups</li>
              <li>Done in minutes, not days</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={styles.howItWorks}>
        <SectionHeader
          label="Process"
          title="How it works"
          subtitle="Four simple steps to localized screenshots"
        />

        <div style={styles.stepsGrid}>
          {[
            {
              num: '01',
              title: 'Upload',
              desc: 'Add your app screenshots and basic info',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            },
            {
              num: '02',
              title: 'Generate',
              desc: 'AI creates headlines, metadata & icons',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )
            },
            {
              num: '03',
              title: 'Translate',
              desc: 'Localize to any of 40+ languages',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={colors.accent} strokeWidth="1.5"/>
                </svg>
              )
            },
            {
              num: '04',
              title: 'Export',
              desc: 'Download ready-to-upload ZIP',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            },
          ].map((step, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNum}>{step.num}</div>
              <div style={styles.stepIcon}>{step.icon}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
              {i < 3 && <div style={styles.stepConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.features}>
        <SectionHeader
          label="Features"
          title="Everything you need"
          subtitle="Powerful tools for App Store optimization"
        />

        <div style={styles.featuresGrid}>
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'AI Headlines',
              description: 'GPT-4 generates compelling headlines with smart [bracket] highlighting.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              ),
              title: '40+ Languages',
              description: 'Translate to every App Store language with context-aware AI.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 18h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'Device Mockups',
              description: 'Beautiful iPhone frames with pixel-perfect control.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'AI App Icons',
              description: 'Generate unique icons with DALL-E 3 to match your brand.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'ASO Metadata',
              description: 'Optimized titles, subtitles, keywords following best practices.',
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'One-Click Export',
              description: 'Download organized ZIP with all languages and devices.',
            },
          ].map((feature, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <div style={styles.featureDivider} />
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={styles.pricing}>
        <SectionHeader
          label="Pricing"
          title="Simple pricing"
          subtitle="Start free, upgrade when you need more"
        />

        <div style={styles.pricingCards}>
          {/* Free Plan */}
          <div style={styles.pricingCard}>
            <div style={styles.pricingHeader}>
              <span style={styles.pricingPlan}>Free</span>
              <div style={styles.pricingPriceRow}>
                <span style={styles.pricingCurrency}>$</span>
                <span style={styles.pricingPrice}>0</span>
              </div>
              <div style={styles.pricingDivider} />
            </div>
            <ul style={styles.pricingFeatures}>
              {['3 projects', '2 languages', 'All mockup styles', 'AI headlines', 'ZIP export'].map((f, i) => (
                <li key={i} style={styles.pricingFeature}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke={colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button style={styles.pricingBtnSecondary} onClick={onGetStarted}>
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{ ...styles.pricingCard, ...styles.pricingCardPro }}>
            <div style={styles.pricingPopular}>Popular</div>
            <div style={styles.pricingHeader}>
              <span style={{ ...styles.pricingPlan, color: colors.accent }}>Pro</span>
              <div style={styles.pricingPriceRow}>
                <span style={{ ...styles.pricingCurrency, color: colors.accent }}>$</span>
                <span style={styles.pricingPrice}>9</span>
                <span style={styles.pricingPeriod}>/mo</span>
              </div>
              <div style={{ ...styles.pricingDivider, backgroundColor: `${colors.accent}30` }} />
            </div>
            <ul style={styles.pricingFeatures}>
              {['Unlimited projects', 'All 40+ languages', 'AI app icons', 'Priority processing', 'Priority support'].map((f, i) => (
                <li key={i} style={styles.pricingFeature}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button style={styles.pricingBtnPrimary} onClick={onGetStarted}>
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.finalCta}>
        <div style={styles.finalCtaInner}>
          <div style={styles.finalCtaLines}>
            <div style={styles.finalCtaLine} />
            <div style={styles.finalCtaLine} />
          </div>
          <h2 style={styles.finalCtaTitle}>Ready to localize your app?</h2>
          <p style={styles.finalCtaSubtitle}>Join developers who save hours on App Store assets</p>
          <button style={styles.finalCtaBtn} onClick={onGetStarted}>
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={{ ...styles.logoText, fontSize: 15, color: colors.textSecondary }}>LocalizeShots</span>
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
    fontSize: 17,
    fontWeight: 500,
    color: colors.text,
    letterSpacing: '-0.3px',
  },
  navLinks: {
    display: 'flex',
    gap: 32,
  },
  navLink: {
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: 500,
    color: colors.textSecondary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
  ctaBtn: {
    padding: '10px 20px',
    fontSize: 13,
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
    fontSize: 11,
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
    fontSize: 17,
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },

  // Hero Visual - App Interface Preview
  heroVisual: {
    marginTop: 56,
    padding: '0 24px',
    overflow: 'hidden',
  },
  appPreview: {
    maxWidth: 900,
    margin: '0 auto',
    animation: 'fadeInUp 0.6s ease-out forwards',
  },
  browserWindow: {
    backgroundColor: colors.card,
    borderRadius: 12,
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  browserHeader: {
    backgroundColor: '#F5F5F5',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  browserDots: {
    display: 'flex',
    gap: 6,
    marginRight: 16,
  },
  browserDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
  },
  browserUrl: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 11,
    color: colors.textMuted,
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${colors.borderLight}`,
  },
  appContent: {
    padding: 20,
    backgroundColor: colors.bg,
  },
  wizardSteps: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  wizardStep: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 600,
    border: '1px solid transparent',
  },
  appMain: {
    display: 'flex',
    gap: 16,
    minHeight: 280,
  },
  headlinesPanel: {
    width: 240,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    border: `1px solid ${colors.borderLight}`,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 14,
  },
  headlinesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  headlineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 12px',
    backgroundColor: colors.bg,
    borderRadius: 8,
    border: `1px solid ${colors.borderLight}`,
  },
  headlineNum: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: colors.accentBg,
    color: colors.accent,
    fontSize: 9,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headlineText: {
    fontSize: 11,
    lineHeight: 1.4,
    color: colors.text,
    fontWeight: 500,
  },
  headlineHighlight: {
    backgroundColor: colors.accent,
    color: '#fff',
    padding: '1px 4px',
    borderRadius: 3,
    fontWeight: 600,
  },
  previewPanel: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    border: `1px solid ${colors.borderLight}`,
  },
  previewLanguages: {
    display: 'flex',
    gap: 6,
    marginBottom: 14,
  },
  previewLangTab: {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  previewScreenshots: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  previewCard: {
    width: 140,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  previewHeadline: {
    fontSize: 9,
    fontWeight: 500,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 10,
  },
  hl: {
    backgroundColor: colors.accent,
    color: '#fff',
    padding: '1px 4px',
    borderRadius: 3,
    fontWeight: 600,
  },
  previewPhone: {
    width: '85%',
    aspectRatio: '9/16',
    backgroundColor: '#fff',
    borderRadius: 10,
  },

  // Problem/Solution
  problemSolution: {
    padding: '70px 24px',
  },
  psContainer: {
    maxWidth: 850,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  psCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
  },
  psCardGood: {
    borderColor: `${colors.success}30`,
    backgroundColor: '#FAFDFB',
  },
  psIconBad: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  psIconGood: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  psTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 12,
    letterSpacing: '-0.2px',
  },
  psDivider: {
    height: '0.5px',
    backgroundColor: colors.borderLight,
    marginBottom: 16,
  },
  psList: {
    margin: 0,
    paddingLeft: 16,
    fontSize: 13,
    lineHeight: 2.1,
    color: colors.textSecondary,
    fontWeight: 400,
  },
  psArrow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  psArrowLine: {
    width: '0.5px',
    height: 16,
    backgroundColor: colors.border,
  },

  // Section Header
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 56,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.accent,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: 14,
    display: 'block',
  },
  sectionTitle: {
    fontSize: 34,
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
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: 400,
    letterSpacing: '0.2px',
  },

  // How It Works
  howItWorks: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    maxWidth: 900,
    margin: '0 auto',
    position: 'relative',
  },
  stepCard: {
    textAlign: 'center',
    padding: '28px 18px',
    backgroundColor: colors.bg,
    borderRadius: 14,
    position: 'relative',
    border: `1px solid ${colors.borderLight}`,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMuted,
    letterSpacing: '1px',
    marginBottom: 16,
  },
  stepIcon: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: '-0.2px',
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 400,
  },
  stepConnector: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 8,
    height: '0.5px',
    backgroundColor: colors.border,
  },

  // Features
  features: {
    padding: '80px 24px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 18,
    maxWidth: 900,
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: colors.card,
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
    fontSize: 15,
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
    fontSize: 13,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
    fontWeight: 400,
  },

  // Pricing
  pricing: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  pricingCards: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    maxWidth: 680,
    margin: '0 auto',
  },
  pricingCard: {
    flex: 1,
    maxWidth: 310,
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 30,
    border: `1px solid ${colors.borderLight}`,
    position: 'relative',
  },
  pricingCardPro: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  pricingPopular: {
    position: 'absolute',
    top: -11,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '5px 16px',
    backgroundColor: colors.accent,
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 20,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  pricingHeader: {
    marginBottom: 24,
  },
  pricingPlan: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  },
  pricingPriceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 8,
    marginBottom: 16,
  },
  pricingCurrency: {
    fontSize: 20,
    fontWeight: 500,
    color: colors.textMuted,
  },
  pricingPrice: {
    fontSize: 48,
    fontWeight: 400,
    color: colors.text,
    letterSpacing: '-1.5px',
  },
  pricingPeriod: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: 400,
    marginLeft: 4,
  },
  pricingDivider: {
    height: '0.5px',
    backgroundColor: colors.borderLight,
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '24px 0',
  },
  pricingFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    fontSize: 13,
    color: colors.text,
    fontWeight: 400,
  },
  pricingBtnSecondary: {
    width: '100%',
    padding: '13px 20px',
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
  pricingBtnPrimary: {
    width: '100%',
    padding: '13px 20px',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 4px 14px ${colors.accent}35`,
    letterSpacing: '0.3px',
  },

  // Final CTA
  finalCta: {
    padding: '90px 24px',
    textAlign: 'center',
    backgroundColor: colors.text,
    position: 'relative',
    overflow: 'hidden',
  },
  finalCtaInner: {
    position: 'relative',
    zIndex: 1,
  },
  finalCtaLines: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  finalCtaLine: {
    width: 25,
    height: '0.5px',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  finalCtaTitle: {
    fontSize: 30,
    fontWeight: 400,
    color: '#fff',
    marginBottom: 12,
    letterSpacing: '-0.3px',
  },
  finalCtaSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 32,
    fontWeight: 400,
    letterSpacing: '0.2px',
  },
  finalCtaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 30px',
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
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
};

// Add CSS animations and Google Fonts
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
if (!document.getElementById('landing-animations')) {
  styleSheet.id = 'landing-animations';
  document.head.appendChild(styleSheet);
}
