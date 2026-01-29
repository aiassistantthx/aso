import React from 'react';

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 24px',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLogoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
  },
  navLogoText: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.5px',
  },
  navButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  navLoginButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: '#0071e3',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navCta: {
    padding: '10px 22px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 113, 227, 0.35)',
    transition: 'all 0.2s ease',
  },
  hero: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 24px 60px',
    textAlign: 'center',
  },
  heroTag: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    backgroundColor: '#f0f7ff',
    color: '#0071e3',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '24px',
  },
  heroTitle: {
    fontSize: '64px',
    fontWeight: 800,
    color: '#1d1d1f',
    letterSpacing: '-2px',
    lineHeight: 1.1,
    marginBottom: '20px',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '20px',
    color: '#86868b',
    maxWidth: '600px',
    margin: '0 auto 40px',
    lineHeight: 1.6,
  },
  heroCta: {
    padding: '16px 40px',
    fontSize: '18px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0, 113, 227, 0.35)',
    transition: 'all 0.2s ease',
  },
  heroSecondary: {
    padding: '16px 40px',
    fontSize: '18px',
    fontWeight: 600,
    border: '2px solid #e0e0e5',
    borderRadius: '14px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginLeft: '16px',
  },
  heroImage: {
    maxWidth: '1000px',
    margin: '60px auto 0',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.12)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  },
  mockupPreview: {
    width: '160px',
    height: '340px',
    backgroundColor: '#fff',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mockupHeader: {
    padding: '16px 12px 8px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#1d1d1f',
    textAlign: 'center',
  },
  mockupScreen: {
    flex: 1,
    margin: '0 12px 12px',
    borderRadius: '8px',
    background: 'linear-gradient(180deg, #e8f0fe 0%, #d4e5fd 100%)',
  },
  features: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 24px',
  },
  featuresTitle: {
    fontSize: '40px',
    fontWeight: 700,
    color: '#1d1d1f',
    textAlign: 'center',
    marginBottom: '12px',
    letterSpacing: '-1px',
  },
  featuresSubtitle: {
    fontSize: '18px',
    color: '#86868b',
    textAlign: 'center',
    marginBottom: '48px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: '#f5f5f7',
    borderRadius: '20px',
    padding: '32px',
    transition: 'transform 0.2s ease',
  },
  featureIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
  },
  featureText: {
    fontSize: '15px',
    color: '#86868b',
    lineHeight: 1.6,
  },
  steps: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 24px',
    backgroundColor: '#f5f5f7',
  },
  stepsTitle: {
    fontSize: '40px',
    fontWeight: 700,
    color: '#1d1d1f',
    textAlign: 'center',
    marginBottom: '48px',
    letterSpacing: '-1px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  step: {
    textAlign: 'center',
  },
  stepNumber: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontSize: '20px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px',
  },
  stepText: {
    fontSize: '14px',
    color: '#86868b',
    lineHeight: 1.6,
  },
  pricing: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 24px',
  },
  pricingTitle: {
    fontSize: '40px',
    fontWeight: 700,
    color: '#1d1d1f',
    textAlign: 'center',
    marginBottom: '12px',
    letterSpacing: '-1px',
  },
  pricingSubtitle: {
    fontSize: '18px',
    color: '#86868b',
    textAlign: 'center',
    marginBottom: '48px',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  pricingCard: {
    borderRadius: '20px',
    padding: '36px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  pricingPlan: {
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  pricingPrice: {
    fontSize: '48px',
    fontWeight: 800,
    color: '#1d1d1f',
    marginBottom: '4px',
  },
  pricingPeriod: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '24px',
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 28px',
  },
  pricingFeature: {
    padding: '8px 0',
    fontSize: '15px',
    color: '#1d1d1f',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pricingButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  footer: {
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    padding: '40px 24px',
    textAlign: 'center',
    color: '#86868b',
    fontSize: '14px',
  },
};

export const Landing: React.FC<Props> = ({ onGetStarted, onLogin }) => {
  return (
    <div style={styles.container}>
      {/* Nav */}
      <nav style={styles.nav as React.CSSProperties}>
        <div style={styles.navLogo as React.CSSProperties}>
          <div style={styles.navLogoIcon as React.CSSProperties}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="white" strokeWidth="2" />
              <rect x="7" y="8" width="10" height="8" rx="1" fill="white" opacity="0.5" />
            </svg>
          </div>
          <span style={styles.navLogoText}>Screenshot Studio</span>
        </div>
        <div style={styles.navButtons as React.CSSProperties}>
          <button style={styles.navLoginButton} onClick={onLogin}>
            Sign In
          </button>
          <button style={styles.navCta} onClick={onGetStarted}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero as React.CSSProperties}>
        <div style={styles.heroTag}>App Store Screenshot Generator</div>
        <h1 style={styles.heroTitle as React.CSSProperties}>
          Create stunning{' '}
          <span style={styles.heroGradient as React.CSSProperties}>App Store</span>
          {' '}screenshots
        </h1>
        <p style={styles.heroSubtitle}>
          Design professional App Store screenshots with iPhone mockups,
          translate to 40+ languages, and export for all device sizes — all in one tool.
        </p>
        <div>
          <button style={styles.heroCta} onClick={onGetStarted}>
            Get Started Free
          </button>
          <button style={styles.heroSecondary} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Learn More
          </button>
        </div>

        <div style={styles.heroImage as React.CSSProperties}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.mockupPreview as React.CSSProperties}>
              <div style={styles.mockupHeader}>Screenshot {i}</div>
              <div style={styles.mockupScreen} />
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.features}>
        <h2 style={styles.featuresTitle as React.CSSProperties}>Everything you need</h2>
        <p style={styles.featuresSubtitle}>
          Professional App Store screenshots without a designer
        </p>
        <div style={styles.featuresGrid}>
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="3" />
                  <line x1="9" y1="18" x2="15" y2="18" />
                </svg>
              ),
              bg: '#e8f4ff',
              title: 'iPhone Mockups',
              text: 'Realistic, flat, minimal, and outline mockup styles with full customization.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
              bg: '#e8f9ed',
              title: '40+ Languages',
              text: 'AI-powered translation for all App Store languages with context-aware results.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#af52de" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M3 9h18M9 3v18" />
                </svg>
              ),
              bg: '#f5eeff',
              title: 'Templates & Themes',
              text: 'Beautiful presets to get started quickly. Customize colors, fonts, and layouts.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff9500" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              ),
              bg: '#fff4e8',
              title: 'Export Everything',
              text: 'Download ZIP with all screenshots, all languages, both device sizes — ready to upload.',
            },
          ].map((feature, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={{ ...styles.featureIcon, backgroundColor: feature.bg } as React.CSSProperties}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureText}>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...styles.steps, borderRadius: 0, maxWidth: 'none', padding: '80px 24px' }}>
        <h2 style={styles.stepsTitle as React.CSSProperties}>How it works</h2>
        <div style={styles.stepsGrid}>
          {[
            { num: '1', title: 'Upload', text: 'Add your app screenshots and choose a device mockup style' },
            { num: '2', title: 'Customize', text: 'Add headlines, choose colors and templates, configure decorations' },
            { num: '3', title: 'Export', text: 'Translate to 40+ languages and download a ready-to-upload ZIP' },
          ].map((step, i) => (
            <div key={i} style={styles.step as React.CSSProperties}>
              <div style={styles.stepNumber as React.CSSProperties}>{step.num}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={styles.pricing}>
        <h2 style={styles.pricingTitle as React.CSSProperties}>Simple pricing</h2>
        <p style={styles.pricingSubtitle}>Start free, upgrade when you need more</p>
        <div style={styles.pricingGrid}>
          {/* Free */}
          <div style={{ ...styles.pricingCard, backgroundColor: '#f5f5f7' }}>
            <div style={{ ...styles.pricingPlan, color: '#86868b' }}>Free</div>
            <div style={styles.pricingPrice}>$0</div>
            <div style={styles.pricingPeriod}>Forever free</div>
            <ul style={styles.pricingFeatures}>
              {['3 projects', '2 target languages', '5 translations/day', 'All mockup styles', 'ZIP export'].map((f, i) => (
                <li key={i} style={styles.pricingFeature as React.CSSProperties}>
                  <span style={{ color: '#34c759' }}>&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <button
              style={{
                ...styles.pricingButton,
                backgroundColor: '#fff',
                border: '2px solid #e0e0e5',
                color: '#1d1d1f',
              }}
              onClick={onGetStarted}
            >
              Get Started
            </button>
          </div>
          {/* Pro */}
          <div style={{
            ...styles.pricingCard,
            backgroundColor: '#fff',
            border: '2px solid #0071e3',
            boxShadow: '0 8px 32px rgba(0, 113, 227, 0.15)',
          }}>
            <div style={{ ...styles.pricingPlan, color: '#0071e3' }}>Pro</div>
            <div style={styles.pricingPrice}>$9</div>
            <div style={styles.pricingPeriod}>per month</div>
            <ul style={styles.pricingFeatures}>
              {['Unlimited projects', 'All 40+ languages', 'Unlimited translations', 'All mockup styles', 'ZIP export', 'Priority support'].map((f, i) => (
                <li key={i} style={styles.pricingFeature as React.CSSProperties}>
                  <span style={{ color: '#0071e3' }}>&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <button
              style={{
                ...styles.pricingButton,
                background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
                border: 'none',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(0, 113, 227, 0.35)',
              }}
              onClick={onGetStarted}
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer as React.CSSProperties}>
        <p>Screenshot Studio — App Store Screenshot Generator</p>
      </footer>
    </div>
  );
};
