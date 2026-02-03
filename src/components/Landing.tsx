import React, { useState, useEffect } from 'react';

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

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
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.05)' : 'none',
      }}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white" fillOpacity="0.9"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill="#6366f1"/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill="#6366f1" fillOpacity="0.3"/>
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
            <button style={styles.ctaBtn} onClick={onGetStarted}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            AI-Powered ASO Tool
          </div>
          <h1 style={styles.heroTitle}>
            App Store Screenshots
            <br />
            <span style={styles.heroGradient}>Localized in Minutes</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Generate stunning App Store screenshots with AI headlines,
            translate to 40+ languages, and export ready-to-upload assets.
            All from one powerful tool.
          </p>
          <div style={styles.heroCtas}>
            <button style={styles.heroCtaPrimary} onClick={onGetStarted}>
              Start Free — No Credit Card
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button style={styles.heroCtaSecondary} onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </button>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <span style={styles.heroStatNumber}>40+</span>
              <span style={styles.heroStatLabel}>Languages</span>
            </div>
            <div style={styles.heroStatDivider} />
            <div style={styles.heroStat}>
              <span style={styles.heroStatNumber}>8</span>
              <span style={styles.heroStatLabel}>Device Sizes</span>
            </div>
            <div style={styles.heroStatDivider} />
            <div style={styles.heroStat}>
              <span style={styles.heroStatNumber}>AI</span>
              <span style={styles.heroStatLabel}>Headlines & Icons</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div style={styles.heroVisual}>
          <div style={styles.heroGlow} />
          <div style={styles.screenshotsRow}>
            {[
              { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '[Create] Stunning\nVideos [Effortlessly]', highlight: '#FFE135' },
              { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '[Transform] Ideas\ninto [Reality]', highlight: '#00ff88' },
              { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '[Save] Hours\n[Every Week]', highlight: '#fff740' },
              { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '[Boost] Your\nProductivity [Now]', highlight: '#ff6b6b' },
            ].map((item, i) => (
              <div key={i} style={{ ...styles.mockupCard, animationDelay: `${i * 0.1}s` }}>
                <div style={{ ...styles.mockupInner, background: item.bg }}>
                  <div style={styles.mockupText}>
                    {item.text.split('\n').map((line, j) => (
                      <div key={j}>
                        {line.split(/(\[.*?\])/).map((part, k) => {
                          if (part.startsWith('[') && part.endsWith(']')) {
                            return (
                              <span key={k} style={{ ...styles.mockupHighlight, backgroundColor: item.highlight }}>
                                {part.slice(1, -1)}
                              </span>
                            );
                          }
                          return <span key={k}>{part}</span>;
                        })}
                      </div>
                    ))}
                  </div>
                  <div style={styles.mockupPhone}>
                    <div style={styles.mockupScreen} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Everything you need for ASO success</h2>
          <p style={styles.sectionSubtitle}>
            From AI-generated headlines to one-click localization — we've got you covered
          </p>
        </div>

        <div style={styles.featuresGrid}>
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'AI-Powered Headlines',
              description: 'GPT-4 generates compelling, ASO-optimized headlines with smart highlighting for maximum impact.',
              color: '#6366f1',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#10b981" strokeWidth="2"/>
                </svg>
              ),
              title: '40+ Languages',
              description: 'Translate all your screenshots and metadata to every App Store language with context-aware AI.',
              color: '#10b981',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke="#f59e0b" strokeWidth="2"/>
                  <path d="M12 18h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              title: 'iPhone Mockups',
              description: 'Beautiful device frames in multiple styles. Position, scale, and rotate with pixel-perfect control.',
              color: '#f59e0b',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              title: 'AI App Icons',
              description: 'Generate unique app icons with DALL-E 3. Multiple styles and color schemes to match your brand.',
              color: '#ec4899',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'ASO Metadata',
              description: 'AI generates optimized titles, subtitles, keywords, and descriptions following ASO best practices.',
              color: '#8b5cf6',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'One-Click Export',
              description: 'Download everything as a ZIP — all languages, all device sizes, organized and ready to upload.',
              color: '#06b6d4',
            },
          ].map((feature, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={{ ...styles.featureIcon, backgroundColor: `${feature.color}15` }}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={styles.howItWorks}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>From upload to App Store in 8 simple steps</h2>
          <p style={styles.sectionSubtitle}>Our AI-powered wizard handles the heavy lifting</p>
        </div>

        <div style={styles.stepsContainer}>
          {[
            { num: '1', title: 'Add App Info', desc: 'Enter your app name, description, and target keywords' },
            { num: '2', title: 'Upload Screenshots', desc: 'Add 3-8 screenshots of your app interface' },
            { num: '3', title: 'Choose Services', desc: 'Select what to generate: screenshots, icon, metadata' },
            { num: '4', title: 'Pick Style', desc: 'Choose color theme and layout preset' },
            { num: '5', title: 'Generate', desc: 'AI creates headlines, metadata, and app icon' },
            { num: '6', title: 'Review & Edit', desc: 'Fine-tune everything in the visual editor' },
            { num: '7', title: 'Translate', desc: 'Localize to 40+ languages with one click' },
            { num: '8', title: 'Export', desc: 'Download ready-to-upload ZIP package' },
          ].map((step, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.stepNumber}>{step.num}</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>{step.title}</h4>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
              {i < 7 && <div style={styles.stepConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={styles.pricing}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p style={styles.sectionSubtitle}>Start free, upgrade when you're ready</p>
        </div>

        <div style={styles.pricingCards}>
          {/* Free Plan */}
          <div style={styles.pricingCard}>
            <div style={styles.pricingHeader}>
              <span style={styles.pricingPlan}>Free</span>
              <div style={styles.pricingPriceRow}>
                <span style={styles.pricingPrice}>$0</span>
                <span style={styles.pricingPeriod}>forever</span>
              </div>
              <p style={styles.pricingDesc}>Perfect for getting started</p>
            </div>
            <ul style={styles.pricingFeatures}>
              {[
                '3 wizard projects',
                '2 target languages',
                'All mockup styles',
                'AI headlines & metadata',
                'ZIP export',
              ].map((f, i) => (
                <li key={i} style={styles.pricingFeature}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            <div style={styles.pricingPopular}>Most Popular</div>
            <div style={styles.pricingHeader}>
              <span style={{ ...styles.pricingPlan, color: '#6366f1' }}>Pro</span>
              <div style={styles.pricingPriceRow}>
                <span style={styles.pricingPrice}>$9</span>
                <span style={styles.pricingPeriod}>/month</span>
              </div>
              <p style={styles.pricingDesc}>For serious app developers</p>
            </div>
            <ul style={styles.pricingFeatures}>
              {[
                'Unlimited projects',
                'All 40+ languages',
                'AI app icon generation',
                'Priority AI processing',
                'Select All languages button',
                'Priority support',
              ].map((f, i) => (
                <li key={i} style={styles.pricingFeature}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M20 6L9 17l-5-5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
        <div style={styles.finalCtaContent}>
          <h2 style={styles.finalCtaTitle}>Ready to localize your App Store presence?</h2>
          <p style={styles.finalCtaSubtitle}>Join developers who save hours on screenshot localization</p>
          <button style={styles.finalCtaBtn} onClick={onGetStarted}>
            Get Started Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>
            <div style={{ ...styles.logoIcon, width: 32, height: 32 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white" fillOpacity="0.9"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill="#6366f1"/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill="#6366f1" fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={{ ...styles.logoText, fontSize: 16 }}>LocalizeShots</span>
          </div>
          <p style={styles.footerText}>App Store Screenshot Generator & ASO Tool</p>
          <p style={styles.footerCopy}>&copy; {new Date().getFullYear()} LocalizeShots. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    maxWidth: 1200,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1f2937',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    gap: 32,
  },
  navLink: {
    fontSize: 14,
    fontWeight: 500,
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  loginBtn: {
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    color: '#6366f1',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  ctaBtn: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s',
  },

  // Hero
  hero: {
    paddingTop: 120,
    paddingBottom: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: 800,
    margin: '0 auto',
    textAlign: 'center',
    padding: '0 24px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    backgroundColor: '#f0f0ff',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    color: '#6366f1',
    marginBottom: 24,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#10b981',
    animation: 'pulse 2s infinite',
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 800,
    color: '#111827',
    lineHeight: 1.1,
    letterSpacing: '-2px',
    marginBottom: 20,
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 1.7,
    color: '#6b7280',
    maxWidth: 600,
    margin: '0 auto 32px',
  },
  heroCtas: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
  },
  heroCtaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
    transition: 'all 0.2s',
  },
  heroCtaSecondary: {
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 600,
    color: '#374151',
    backgroundColor: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  heroStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 28,
    fontWeight: 800,
    color: '#111827',
  },
  heroStatLabel: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: 500,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },

  // Hero Visual
  heroVisual: {
    position: 'relative',
    marginTop: 64,
    padding: '0 24px',
  },
  heroGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    height: 400,
    background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  screenshotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  mockupCard: {
    width: 200,
    animation: 'fadeInUp 0.6s ease-out forwards',
    opacity: 0,
  },
  mockupInner: {
    borderRadius: 20,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
  mockupText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 1.4,
    marginBottom: 16,
  },
  mockupHighlight: {
    padding: '2px 6px',
    borderRadius: 4,
    color: '#000',
    fontWeight: 800,
  },
  mockupPhone: {
    width: '85%',
    aspectRatio: '9/19',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  mockupScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },

  // Features
  features: {
    padding: '100px 24px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 64,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: 800,
    color: '#111827',
    letterSpacing: '-1px',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    maxWidth: 500,
    margin: '0 auto',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    border: '1px solid #f3f4f6',
    transition: 'all 0.2s',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#6b7280',
    margin: 0,
  },

  // How It Works
  howItWorks: {
    padding: '100px 24px',
    backgroundColor: '#fff',
  },
  stepsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    maxWidth: 1000,
    margin: '0 auto',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepContent: {
    minWidth: 140,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 2px',
  },
  stepDesc: {
    fontSize: 12,
    color: '#9ca3af',
    margin: 0,
  },
  stepConnector: {
    width: 24,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginLeft: 4,
  },

  // Pricing
  pricing: {
    padding: '100px 24px',
    backgroundColor: '#fafafa',
  },
  pricingCards: {
    display: 'flex',
    justifyContent: 'center',
    gap: 24,
    maxWidth: 800,
    margin: '0 auto',
  },
  pricingCard: {
    flex: 1,
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    border: '1px solid #e5e7eb',
    position: 'relative',
  },
  pricingCardPro: {
    border: '2px solid #6366f1',
    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
  },
  pricingPopular: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '4px 16px',
    backgroundColor: '#6366f1',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
  },
  pricingHeader: {
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottom: '1px solid #f3f4f6',
  },
  pricingPlan: {
    fontSize: 14,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pricingPriceRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    margin: '8px 0',
  },
  pricingPrice: {
    fontSize: 48,
    fontWeight: 800,
    color: '#111827',
  },
  pricingPeriod: {
    fontSize: 16,
    color: '#9ca3af',
  },
  pricingDesc: {
    fontSize: 14,
    color: '#6b7280',
    margin: 0,
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px',
  },
  pricingFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    fontSize: 14,
    color: '#374151',
  },
  pricingBtnSecondary: {
    width: '100%',
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#374151',
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pricingBtnPrimary: {
    width: '100%',
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
    transition: 'all 0.2s',
  },

  // Final CTA
  finalCta: {
    padding: '100px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  finalCtaContent: {
    maxWidth: 600,
    margin: '0 auto',
    textAlign: 'center',
  },
  finalCtaTitle: {
    fontSize: 36,
    fontWeight: 800,
    color: '#fff',
    marginBottom: 16,
  },
  finalCtaSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
  },
  finalCtaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    fontSize: 16,
    fontWeight: 600,
    color: '#6366f1',
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s',
  },

  // Footer
  footer: {
    padding: '48px 24px',
    backgroundColor: '#111827',
  },
  footerContent: {
    maxWidth: 1200,
    margin: '0 auto',
    textAlign: 'center',
  },
  footerLogo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  footerCopy: {
    fontSize: 13,
    color: '#6b7280',
  },
};

// Add CSS animations via style tag
const styleSheet = document.createElement('style');
styleSheet.textContent = `
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
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
if (!document.getElementById('landing-animations')) {
  styleSheet.id = 'landing-animations';
  document.head.appendChild(styleSheet);
}
