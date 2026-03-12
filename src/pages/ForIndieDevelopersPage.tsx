import React, { useEffect } from 'react';

interface Props {
  onGetStarted: () => void;
  onNavigate?: (page: string) => void;
}

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

// JSON-LD Schema for SEO
const IndieDevPageSchema = () => {
  useEffect(() => {
    const existingScript = document.getElementById('indie-dev-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'indie-dev-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'LocalizeShots for Indie Developers',
      description: 'App Store screenshot localization tool designed for solo and indie developers. Save time and money on ASO with AI-powered screenshots.',
      url: 'https://localizeshots.com/for/indie-developers',
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'LocalizeShots',
        applicationCategory: 'DeveloperApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier for indie developers',
        },
      },
    });

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('indie-dev-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
};

export const ForIndieDevelopersPage: React.FC<Props> = ({ onGetStarted, onNavigate }) => {
  return (
    <div style={styles.container}>
      <IndieDevPageSchema />

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <button onClick={() => onNavigate?.('landing')} style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={styles.logoText}>LocalizeShots</span>
          </button>
          <div style={styles.navButtons}>
            <button style={styles.loginBtn} onClick={() => onNavigate?.('login')}>Sign In</button>
            <button style={styles.ctaBtn} onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeLine} />
            <span style={styles.heroBadgeText}>For Indie Developers</span>
            <span style={styles.heroBadgeLine} />
          </div>
          <h1 style={styles.heroTitle}>
            Professional App Store<br />
            screenshots <span style={styles.heroAccent}>without the agency price</span>
          </h1>
          <p style={styles.heroSubtitle}>
            You built an amazing app. Now reach users worldwide with localized screenshots<br />
            that convert — without hiring designers or translators.
          </p>
          <div style={styles.heroCtas}>
            <button style={styles.heroCtaPrimary} onClick={onGetStarted}>
              Start Free — No Credit Card
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p style={styles.heroNote}>Free plan includes 3 projects and 2 languages</p>
        </div>
      </section>

      {/* Pain Points Section */}
      <section style={styles.painSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>The Problem</span>
          <h2 style={styles.sectionTitle}>Sound familiar?</h2>
          <div style={styles.sectionTitleLine} />
        </div>

        <div style={styles.painGrid}>
          {[
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
                  <path d="M12 6v6l4 2" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'Time Drain',
              description: 'You spend days creating screenshots instead of building features. Every app update means another screenshot marathon.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="9" y1="9" x2="9.01" y2="9" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="15" y1="9" x2="15.01" y2="9" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              title: 'Translation Headaches',
              description: 'Coordinating with freelance translators for 40+ languages? Managing spreadsheets and back-and-forth emails is exhausting.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
                  <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'Budget Constraints',
              description: 'Agencies charge $500+ per language. As a solo developer, you cannot afford professional localization for every market.',
            },
            {
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.5"/>
                  <path d="M4.93 4.93l14.14 14.14" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'Design Skills Gap',
              description: 'You are a developer, not a designer. Creating compelling marketing visuals feels impossible without Figma expertise.',
            },
          ].map((pain, i) => (
            <div key={i} style={styles.painCard}>
              <div style={styles.painIcon}>{pain.icon}</div>
              <h3 style={styles.painTitle}>{pain.title}</h3>
              <p style={styles.painDescription}>{pain.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution Section */}
      <section style={styles.solutionSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>The Solution</span>
          <h2 style={styles.sectionTitle}>Built for solo developers like you</h2>
          <div style={styles.sectionTitleLine} />
          <p style={styles.sectionSubtitle}>
            LocalizeShots handles the tedious work so you can focus on what matters — your app.
          </p>
        </div>

        <div style={styles.solutionGrid}>
          {[
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'AI Generates Headlines',
              description: 'Describe your app once. Get compelling marketing headlines in seconds — no copywriting skills required.',
              highlight: 'Saves hours',
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={colors.accent} strokeWidth="1.5"/>
                </svg>
              ),
              title: 'One-Click Translation',
              description: 'Translate to all 40+ App Store languages instantly. No freelancers, no spreadsheets, no waiting.',
              highlight: 'All languages',
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M12 18h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: 'Beautiful Mockups',
              description: 'Professional iPhone frames applied automatically. Your screenshots look App Store-ready without touching Figma.',
              highlight: 'No design skills',
            },
            {
              icon: (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: 'Export Ready ZIP',
              description: 'Download organized folders by language. Drag and drop directly to App Store Connect.',
              highlight: 'Upload-ready',
            },
          ].map((solution, i) => (
            <div key={i} style={styles.solutionCard}>
              <div style={styles.solutionIcon}>{solution.icon}</div>
              <span style={styles.solutionHighlight}>{solution.highlight}</span>
              <h3 style={styles.solutionTitle}>{solution.title}</h3>
              <p style={styles.solutionDescription}>{solution.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Highlight */}
      <section style={styles.pricingSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>Pricing</span>
          <h2 style={styles.sectionTitle}>Indie-friendly pricing</h2>
          <div style={styles.sectionTitleLine} />
          <p style={styles.sectionSubtitle}>
            Start free, upgrade only when your app takes off.
          </p>
        </div>

        <div style={styles.pricingCards}>
          <div style={styles.pricingCard}>
            <span style={styles.pricingPlan}>Free</span>
            <div style={styles.pricingPriceRow}>
              <span style={styles.pricingCurrency}>$</span>
              <span style={styles.pricingPrice}>0</span>
            </div>
            <p style={styles.pricingNote}>Perfect for your first app</p>
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
              Get Started Free
            </button>
          </div>

          <div style={{ ...styles.pricingCard, ...styles.pricingCardPro }}>
            <span style={styles.pricingPopular}>Best for Indie</span>
            <span style={{ ...styles.pricingPlan, color: colors.accent }}>Pro</span>
            <div style={styles.pricingPriceRow}>
              <span style={{ ...styles.pricingCurrency, color: colors.accent }}>$</span>
              <span style={styles.pricingPrice}>4.99</span>
              <span style={styles.pricingPeriod}>/mo</span>
            </div>
            <p style={styles.pricingNote}>$59.99/year — less than one coffee per week</p>
            <ul style={styles.pricingFeatures}>
              {['Unlimited projects', 'All 40+ languages', 'ASO metadata', 'Priority processing', 'Priority support'].map((f, i) => (
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

        <div style={styles.comparisonNote}>
          <span style={styles.comparisonIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>
            <strong>Compare:</strong> Agencies charge $500-2000 per language. LocalizeShots Pro gives you unlimited languages for $60/year.
          </span>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section style={styles.testimonialsSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionLabel}>Success Stories</span>
          <h2 style={styles.sectionTitle}>Trusted by indie developers</h2>
          <div style={styles.sectionTitleLine} />
        </div>

        <div style={styles.testimonialGrid}>
          {[
            {
              quote: "I localized my app to 15 languages in one afternoon. Downloads from international markets tripled within a month.",
              name: "Alex K.",
              role: "Solo Developer",
              app: "Productivity App",
            },
            {
              quote: "Finally, a tool that understands indie budget constraints. The free tier let me test localization before committing.",
              name: "Sarah M.",
              role: "Indie Developer",
              app: "Fitness Tracker",
            },
            {
              quote: "The AI headlines are surprisingly good. Way better than what I could write myself, and they actually convert.",
              name: "James L.",
              role: "Solo Founder",
              app: "Photo Editor",
            },
          ].map((testimonial, i) => (
            <div key={i} style={styles.testimonialCard}>
              <p style={styles.testimonialQuote}>"{testimonial.quote}"</p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.testimonialAvatar}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div style={styles.testimonialName}>{testimonial.name}</div>
                  <div style={styles.testimonialRole}>{testimonial.role} - {testimonial.app}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to go global?</h2>
        <p style={styles.ctaSubtitle}>
          Join hundreds of indie developers who save hours every app update.<br />
          Start free — no credit card required.
        </p>
        <button style={styles.ctaBtnPrimary} onClick={onGetStarted}>
          Create Your First Screenshot
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </section>

      {/* Related Resources Section */}
      <section style={styles.relatedSection}>
        <div style={styles.relatedInner}>
          <h2 style={styles.relatedTitle}>Related Resources</h2>
          <div style={styles.relatedGrid} className="indie-related-grid">
            <a href="/ios-screenshots" style={styles.relatedCard} onClick={(e) => { e.preventDefault(); onNavigate?.('ios-screenshots'); }}>
              <div style={styles.relatedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M12 18h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.relatedCardTitle}>iOS Screenshots</h3>
              <p style={styles.relatedCardDesc}>Create stunning App Store screenshots for iPhone and iPad</p>
            </a>
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
          <div style={styles.footerLinks}>
            <button onClick={() => onNavigate?.('terms')} style={styles.footerLink}>
              Terms of Service
            </button>
            <span style={styles.footerLinkDivider}>|</span>
            <button onClick={() => onNavigate?.('privacy')} style={styles.footerLink}>
              Privacy Policy
            </button>
            <span style={styles.footerLinkDivider}>|</span>
            <button onClick={() => onNavigate?.('refund')} style={styles.footerLink}>
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
    padding: '16px 24px',
    borderBottom: `1px solid ${colors.borderLight}`,
    backgroundColor: colors.bg,
  },
  navInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
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
  },

  // Hero
  hero: {
    paddingTop: 80,
    paddingBottom: 80,
  },
  heroContent: {
    maxWidth: 750,
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
    color: colors.accent,
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: 400,
    color: colors.text,
    lineHeight: 1.2,
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
    marginBottom: 36,
  },
  heroCtas: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroCtaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 6px 20px ${colors.accent}35`,
  },
  heroNote: {
    fontSize: 14,
    color: colors.textMuted,
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
    maxWidth: 600,
    margin: '0 auto',
  },

  // Pain Points
  painSection: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  painGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
    maxWidth: 900,
    margin: '0 auto',
  },
  painCard: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
  },
  painIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  painTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  painDescription: {
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
  },

  // Solution
  solutionSection: {
    padding: '80px 24px',
  },
  solutionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
    maxWidth: 900,
    margin: '0 auto',
  },
  solutionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
  },
  solutionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  solutionHighlight: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 8,
    display: 'block',
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  solutionDescription: {
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
  },

  // Pricing
  pricingSection: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  pricingCards: {
    display: 'flex',
    justifyContent: 'center',
    gap: 20,
    maxWidth: 680,
    margin: '0 auto 32px',
  },
  pricingCard: {
    flex: 1,
    maxWidth: 310,
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 30,
    border: `1px solid ${colors.borderLight}`,
    position: 'relative' as const,
  },
  pricingCardPro: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  pricingPopular: {
    position: 'absolute' as const,
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
    textTransform: 'uppercase' as const,
  },
  pricingPlan: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    display: 'block',
  },
  pricingPriceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 8,
    marginBottom: 8,
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
  pricingNote: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  pricingFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px 0',
  },
  pricingFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    fontSize: 15,
    color: colors.text,
    fontWeight: 400,
  },
  pricingBtnSecondary: {
    width: '100%',
    padding: '13px 20px',
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
    backgroundColor: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    cursor: 'pointer',
  },
  pricingBtnPrimary: {
    width: '100%',
    padding: '13px 20px',
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 4px 14px ${colors.accent}35`,
  },
  comparisonNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 600,
    margin: '0 auto',
    padding: '16px 24px',
    backgroundColor: colors.accentBg,
    borderRadius: 12,
    fontSize: 15,
    color: colors.text,
  },
  comparisonIcon: {
    flexShrink: 0,
  },

  // Testimonials
  testimonialsSection: {
    padding: '80px 24px',
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    maxWidth: 1000,
    margin: '0 auto',
  },
  testimonialCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
  },
  testimonialQuote: {
    fontSize: 15,
    lineHeight: 1.7,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: colors.accentBg,
    color: colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 16,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
  },
  testimonialRole: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Final CTA
  ctaSection: {
    padding: '80px 24px',
    backgroundColor: colors.card,
    textAlign: 'center' as const,
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: 400,
    color: colors.text,
    marginBottom: 16,
    letterSpacing: '-0.5px',
  },
  ctaSubtitle: {
    fontSize: 17,
    lineHeight: 1.7,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  ctaBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 6px 20px ${colors.accent}35`,
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
  },
  footerLinkDivider: {
    color: colors.border,
    fontSize: 12,
  },
};

// Add responsive styles
if (typeof document !== 'undefined' && !document.getElementById('indie-dev-page-responsive')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'indie-dev-page-responsive';
  styleEl.textContent = `
    @media (max-width: 768px) {
      .indie-pain-grid,
      .indie-solution-grid {
        grid-template-columns: 1fr !important;
      }
      .indie-testimonial-grid {
        grid-template-columns: 1fr !important;
      }
      .indie-pricing-cards {
        flex-direction: column !important;
      }
      .indie-pricing-card {
        max-width: 100% !important;
      }
      .indie-hero-title {
        font-size: 36px !important;
      }
      .indie-hero-subtitle br {
        display: none;
      }
      .indie-footer-inner {
        flex-direction: column !important;
        gap: 12px !important;
      }
      .indie-footer-links {
        flex-wrap: wrap !important;
        justify-content: center !important;
      }
      .indie-related-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 14px !important;
      }
    }
    @media (max-width: 480px) {
      .indie-related-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}
