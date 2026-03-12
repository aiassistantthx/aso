import React from 'react';

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

interface AlternativesPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onGetStarted?: () => void;
}

interface Competitor {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  pricing: string;
  website: string;
  slug: string;
}

const competitors: Competitor[] = [
  {
    name: 'AppScreens',
    description: 'AppScreens is a popular screenshot generator that offers device mockups and basic localization features. It provides a visual editor for creating App Store and Google Play screenshots.',
    pros: [
      'Wide range of device mockups',
      'Template library available',
      'Supports multiple app stores',
    ],
    cons: [
      'No AI-powered headline generation',
      'Manual translation required',
      'Limited automation features',
    ],
    pricing: 'From $19/month',
    website: 'appscreens.com',
    slug: 'appscreens',
  },
  {
    name: 'AppLaunchpad',
    description: 'AppLaunchpad is a screenshot builder focused on simplicity and quick exports. It offers drag-and-drop editing and various templates for app store optimization.',
    pros: [
      'User-friendly interface',
      'Fast export options',
      'Good template variety',
    ],
    cons: [
      'No AI text generation',
      'Translations not included',
      'Basic customization options',
    ],
    pricing: 'From $25/month',
    website: 'applaunchpad.com',
    slug: 'applaunchpad',
  },
  {
    name: 'Screenshots Pro',
    description: 'Screenshots Pro is a design tool specifically built for app store screenshots. It features professional templates and precise layout controls for creating polished visuals.',
    pros: [
      'Professional design templates',
      'Precise layout controls',
      'Good export quality',
    ],
    cons: [
      'Steep learning curve',
      'No automated translations',
      'No metadata generation',
    ],
    pricing: 'From $29/month',
    website: 'screenshotspro.com',
    slug: 'screenshots-pro',
  },
  {
    name: 'Appure',
    description: 'Appure focuses on creating beautiful app store visuals with their design-first approach. They offer custom mockups and background effects for eye-catching screenshots.',
    pros: [
      'Beautiful design options',
      'Custom backgrounds',
      'Multiple mockup styles',
    ],
    cons: [
      'Manual headline creation',
      'No localization features',
      'Higher price point',
    ],
    pricing: 'From $35/month',
    website: 'appure.io',
    slug: 'appure',
  },
  {
    name: 'StoreMaven',
    description: 'StoreMaven is an enterprise-focused ASO platform that includes screenshot testing and optimization tools. It is geared towards large teams with A/B testing needs.',
    pros: [
      'A/B testing capabilities',
      'Enterprise features',
      'Analytics integration',
    ],
    cons: [
      'Enterprise pricing',
      'Complex setup required',
      'Overkill for indie developers',
    ],
    pricing: 'Custom pricing',
    website: 'storemaven.com',
    slug: 'storemaven',
  },
];

const localizeAdvantages = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'AI-Powered Headlines',
    description: 'Generate compelling marketing headlines instantly with GPT-4. Smart [bracket] highlighting creates professional-looking screenshots without design skills.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth="1.5"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={colors.accent} strokeWidth="1.5"/>
      </svg>
    ),
    title: 'One-Click Translation',
    description: 'Translate screenshots and metadata to 40+ languages in one click. Context-aware translations that preserve marketing impact across all locales.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'ASO Metadata Suite',
    description: 'Generate optimized app names, subtitles, keywords, and descriptions following App Store best practices. Zero keyword duplication guaranteed.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
        <path d="M12 18h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Beautiful Device Mockups',
    description: 'Pixel-perfect iPhone mockups with customizable positioning, scaling, and rotation. Multiple frame styles to match your brand aesthetic.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'AI App Icon Generator',
    description: 'Create stunning app icons with DALL-E 3. Describe your vision and get professional icons ready for App Store submission.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'One-Click Export',
    description: 'Download organized ZIP files with all languages and device sizes. Ready to upload directly to App Store Connect or Google Play Console.',
  },
];

export const AlternativesPage: React.FC<AlternativesPageProps> = ({ onBack, onNavigate, onGetStarted }) => {
  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <button onClick={onBack} style={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div style={styles.logo} onClick={onBack}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="2" width="18" height="20" rx="3" fill="white"/>
                <rect x="6" y="5" width="12" height="3" rx="1" fill={colors.accent}/>
                <rect x="6" y="10" width="12" height="8" rx="1" fill={colors.accent} fillOpacity="0.3"/>
              </svg>
            </div>
            <span style={styles.logoText}>LocalizeShots</span>
          </div>
          <button style={styles.ctaButton} onClick={onGetStarted}>
            Try Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroLabel}>COMPARISON GUIDE</span>
          <h1 style={styles.heroTitle}>
            Best App Screenshot Tools<br />
            <span style={styles.heroAccent}>in 2026</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Compare the top App Store screenshot generators and find the best tool for your ASO workflow.
            See how LocalizeShots stacks up against popular alternatives.
          </p>
        </div>
      </section>

      {/* Market Overview */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>App Screenshot Tool Market Overview</h2>
          <div style={styles.overviewGrid}>
            <div style={styles.overviewCard}>
              <div style={styles.overviewIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={styles.overviewTitle}>Growing Demand</h3>
              <p style={styles.overviewText}>
                With millions of apps competing for attention, professional screenshots are essential for App Store optimization.
                Tools that automate this process save developers significant time and resources.
              </p>
            </div>
            <div style={styles.overviewCard}>
              <div style={styles.overviewIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={styles.overviewTitle}>AI Revolution</h3>
              <p style={styles.overviewText}>
                AI-powered tools are transforming ASO workflows. From automated headline generation to instant translations,
                AI saves hours of manual work while maintaining quality.
              </p>
            </div>
            <div style={styles.overviewCard}>
              <div style={styles.overviewIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={colors.accent} strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 style={styles.overviewTitle}>Global Reach</h3>
              <p style={styles.overviewText}>
                Localization is key to global success. Apps available in multiple languages see significantly higher downloads.
                The best tools make translation effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Competitors List */}
      <section style={styles.sectionAlt}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Top Screenshot Generator Alternatives</h2>
          <p style={styles.sectionSubtitle}>
            Detailed comparison of the leading app screenshot tools available in 2026
          </p>
          <div style={styles.competitorsList}>
            {competitors.map((competitor, index) => (
              <div key={index} style={styles.competitorCard}>
                <div style={styles.competitorHeader}>
                  <h3 style={styles.competitorName}>{competitor.name}</h3>
                  <span style={styles.competitorPricing}>{competitor.pricing}</span>
                </div>
                <p style={styles.competitorDescription}>{competitor.description}</p>
                <div style={styles.prosConsGrid}>
                  <div style={styles.prosSection}>
                    <h4 style={styles.prosTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                        <path d="M20 6L9 17l-5-5" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Pros
                    </h4>
                    <ul style={styles.prosList}>
                      {competitor.pros.map((pro, i) => (
                        <li key={i} style={styles.prosItem}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={styles.consSection}>
                    <h4 style={styles.consTitle}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                        <path d="M18 6L6 18M6 6l12 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Cons
                    </h4>
                    <ul style={styles.consList}>
                      {competitor.cons.map((con, i) => (
                        <li key={i} style={styles.consItem}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <a
                  href={`/compare/${competitor.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(`compare-${competitor.slug}`);
                  }}
                  style={styles.compareLink}
                >
                  Compare with LocalizeShots
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why LocalizeShots */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.whyHeader}>
            <span style={styles.whyLabel}>WHY CHOOSE US</span>
            <h2 style={styles.whyTitle}>Why LocalizeShots?</h2>
            <p style={styles.whySubtitle}>
              LocalizeShots combines powerful AI with intuitive design tools to deliver the most efficient
              screenshot generation workflow available.
            </p>
          </div>
          <div style={styles.advantagesGrid}>
            {localizeAdvantages.map((advantage, index) => (
              <div key={index} style={styles.advantageCard}>
                <div style={styles.advantageIcon}>{advantage.icon}</div>
                <h3 style={styles.advantageTitle}>{advantage.title}</h3>
                <p style={styles.advantageDescription}>{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={styles.sectionAlt}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>Feature Comparison</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.comparisonTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Feature</th>
                  <th style={{ ...styles.tableHeader, ...styles.tableHeaderHighlight }}>LocalizeShots</th>
                  <th style={styles.tableHeader}>AppScreens</th>
                  <th style={styles.tableHeader}>AppLaunchpad</th>
                  <th style={styles.tableHeader}>Others</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'AI Headline Generation', localizeshots: true, appscreens: false, applaunchpad: false, others: false },
                  { feature: 'One-Click Translation', localizeshots: true, appscreens: false, applaunchpad: false, others: false },
                  { feature: '40+ Languages', localizeshots: true, appscreens: false, applaunchpad: false, others: false },
                  { feature: 'ASO Metadata Suite', localizeshots: true, appscreens: false, applaunchpad: false, others: false },
                  { feature: 'AI App Icon Generator', localizeshots: true, appscreens: false, applaunchpad: false, others: false },
                  { feature: 'Device Mockups', localizeshots: true, appscreens: true, applaunchpad: true, others: true },
                  { feature: 'Visual Editor', localizeshots: true, appscreens: true, applaunchpad: true, others: true },
                  { feature: 'Batch Export', localizeshots: true, appscreens: true, applaunchpad: true, others: true },
                  { feature: 'Free Plan Available', localizeshots: true, appscreens: false, applaunchpad: false, others: false },
                ].map((row, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                    <td style={styles.tableCell}>{row.feature}</td>
                    <td style={{ ...styles.tableCell, ...styles.tableCellHighlight }}>
                      {row.localizeshots ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {row.appscreens ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {row.applaunchpad ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {row.others ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* More Resources Section */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionTitle}>More Resources</h2>
          <p style={styles.sectionSubtitle}>
            Explore platform guides, features, and ASO tips to maximize your app's visibility
          </p>
          <div style={styles.resourcesGrid}>
            {/* Platform Guides */}
            <div style={styles.resourceCard}>
              <div style={styles.resourceIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M12 18h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.resourceTitle}>Platform Guides</h3>
              <p style={styles.resourceText}>Learn best practices for each platform</p>
              <div style={styles.resourceLinks}>
                <a
                  href="/ios-screenshots"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('ios-screenshots'); }}
                  style={styles.resourceLink}
                >
                  iOS App Store Screenshots
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a
                  href="/android-screenshots"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('android-screenshots'); }}
                  style={styles.resourceLink}
                >
                  Google Play Screenshots
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Features */}
            <div style={styles.resourceCard}>
              <div style={styles.resourceIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={styles.resourceTitle}>Features</h3>
              <p style={styles.resourceText}>Discover all LocalizeShots capabilities</p>
              <div style={styles.resourceLinks}>
                <a
                  href="/features"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('features'); }}
                  style={styles.resourceLink}
                >
                  View All Features
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* ASO Blog */}
            <div style={styles.resourceCard}>
              <div style={styles.resourceIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253s-3.332.477-4.5 1.253" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={styles.resourceTitle}>ASO Blog</h3>
              <p style={styles.resourceText}>Tips and strategies for app success</p>
              <div style={styles.resourceLinks}>
                <a
                  href="/blog"
                  onClick={(e) => { e.preventDefault(); onNavigate?.('blog'); }}
                  style={styles.resourceLink}
                >
                  Read ASO Tips
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 6 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to Transform Your ASO Workflow?</h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of developers who create stunning, localized App Store screenshots in minutes.
            Start free, no credit card required.
          </p>
          <div style={styles.ctaButtons}>
            <button style={styles.ctaPrimary} onClick={onGetStarted}>
              Start Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button style={styles.ctaSecondary} onClick={onBack}>
              Learn More
            </button>
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
            <button onClick={() => onNavigate?.('terms')} style={styles.footerLink}>Terms of Service</button>
            <span style={styles.footerDivider}>|</span>
            <button onClick={() => onNavigate?.('privacy')} style={styles.footerLink}>Privacy Policy</button>
            <span style={styles.footerDivider}>|</span>
            <button onClick={() => onNavigate?.('refund')} style={styles.footerLink}>Refund Policy</button>
          </div>
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
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    color: colors.accent,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 0',
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
  ctaButton: {
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
    padding: '80px 24px 60px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: 700,
    margin: '0 auto',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.accent,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: 16,
    display: 'block',
  },
  heroTitle: {
    fontSize: 48,
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
    fontSize: 18,
    lineHeight: 1.7,
    color: colors.textSecondary,
    fontWeight: 400,
  },

  // Sections
  section: {
    padding: '80px 24px',
  },
  sectionAlt: {
    padding: '80px 24px',
    backgroundColor: colors.card,
  },
  sectionInner: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 400,
    color: colors.text,
    letterSpacing: '-0.5px',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },

  // Overview Grid
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    marginTop: 48,
  },
  overviewCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
  },
  overviewIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
  },
  overviewText: {
    fontSize: 15,
    lineHeight: 1.7,
    color: colors.textSecondary,
    margin: 0,
  },

  // Competitors List
  competitorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  competitorCard: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 32,
    border: `1px solid ${colors.borderLight}`,
  },
  competitorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  competitorName: {
    fontSize: 22,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  },
  competitorPricing: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textSecondary,
    backgroundColor: colors.borderLight,
    padding: '6px 12px',
    borderRadius: 20,
  },
  competitorDescription: {
    fontSize: 16,
    lineHeight: 1.7,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  prosConsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
    marginBottom: 24,
  },
  prosSection: {},
  consSection: {},
  prosTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: colors.success,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  consTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: '#DC2626',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  prosList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  consList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  prosItem: {
    fontSize: 15,
    color: colors.text,
    padding: '6px 0',
    paddingLeft: 24,
    position: 'relative',
  },
  consItem: {
    fontSize: 15,
    color: colors.text,
    padding: '6px 0',
    paddingLeft: 24,
    position: 'relative',
  },
  compareLink: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 15,
    fontWeight: 600,
    color: colors.accent,
    textDecoration: 'none',
    cursor: 'pointer',
  },

  // Why LocalizeShots
  whyHeader: {
    textAlign: 'center',
    marginBottom: 56,
  },
  whyLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.accent,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: 14,
    display: 'block',
  },
  whyTitle: {
    fontSize: 38,
    fontWeight: 400,
    color: colors.text,
    letterSpacing: '-0.5px',
    marginBottom: 16,
  },
  whySubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    maxWidth: 600,
    margin: '0 auto',
  },
  advantagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  advantageCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
  },
  advantageIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  advantageTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
  },
  advantageDescription: {
    fontSize: 15,
    lineHeight: 1.7,
    color: colors.textSecondary,
    margin: 0,
  },

  // Comparison Table
  tableWrapper: {
    overflowX: 'auto',
    marginTop: 32,
  },
  comparisonTable: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 700,
  },
  tableHeader: {
    padding: '16px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    textAlign: 'left',
    borderBottom: `2px solid ${colors.border}`,
  },
  tableHeaderHighlight: {
    backgroundColor: colors.accentBg,
    color: colors.accent,
  },
  tableRowEven: {
    backgroundColor: colors.bg,
  },
  tableRowOdd: {
    backgroundColor: colors.card,
  },
  tableCell: {
    padding: '14px 20px',
    fontSize: 15,
    color: colors.text,
    borderBottom: `1px solid ${colors.borderLight}`,
    textAlign: 'center',
  },
  tableCellHighlight: {
    backgroundColor: `${colors.accentBg}50`,
  },

  // Resources Grid
  resourcesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
    marginTop: 48,
  },
  resourceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    border: `1px solid ${colors.borderLight}`,
  },
  resourceIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  resourceText: {
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
    marginBottom: 16,
  },
  resourceLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  resourceLink: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: colors.accent,
    textDecoration: 'none',
    cursor: 'pointer',
  },

  // CTA Section
  ctaSection: {
    padding: '100px 24px',
    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: 600,
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: 400,
    color: '#fff',
    marginBottom: 16,
    letterSpacing: '-0.5px',
  },
  ctaSubtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 32,
    lineHeight: 1.7,
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: 14,
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 600,
    color: colors.accent,
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
  ctaSecondary: {
    padding: '14px 28px',
    fontSize: 16,
    fontWeight: 500,
    color: '#fff',
    backgroundColor: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.5)',
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
    flexWrap: 'wrap',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
  footerDivider: {
    color: colors.border,
    fontSize: 12,
  },
  footerCopy: {
    fontSize: 12,
    color: colors.textMuted,
    margin: 0,
  },
};

// Add responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .alternatives-overview-grid {
      grid-template-columns: 1fr !important;
    }
    .alternatives-advantages-grid {
      grid-template-columns: 1fr !important;
    }
    .alternatives-pros-cons-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
if (!document.getElementById('alternatives-responsive')) {
  styleSheet.id = 'alternatives-responsive';
  document.head.appendChild(styleSheet);
}
