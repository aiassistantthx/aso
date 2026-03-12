import React, { useState, useEffect } from 'react';
import { SEOHead } from '../components/SEOHead';
import { SchemaMarkup } from '../components/SchemaMarkup';

interface Props {
  onNavigate?: (page: string) => void;
}

// Color palette matching the project
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
  info: '#3B82F6',
  infoBg: '#EFF6FF',
};

// Device specifications with accurate App Store requirements
const DEVICES = [
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    category: 'iPhone',
    screenSize: '6.7"',
    portraitWidth: 1290,
    portraitHeight: 2796,
    landscapeWidth: 2796,
    landscapeHeight: 1290,
    required: true,
    notes: 'Required for all iPhone apps. Also covers iPhone 14 Pro Max, 15 Plus, 14 Plus.',
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    category: 'iPhone',
    screenSize: '6.1"',
    portraitWidth: 1179,
    portraitHeight: 2556,
    landscapeWidth: 2556,
    landscapeHeight: 1179,
    required: false,
    notes: 'Covers iPhone 15, 14 Pro, 14, 13 Pro, 13, 12 Pro, 12.',
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE (3rd gen)',
    category: 'iPhone',
    screenSize: '4.7"',
    portraitWidth: 750,
    portraitHeight: 1334,
    landscapeWidth: 1334,
    landscapeHeight: 750,
    required: false,
    notes: 'Required only if your app supports iPhone SE. Covers iPhone 8, 7, 6s.',
  },
  {
    id: 'iphone-8-plus',
    name: 'iPhone 8 Plus',
    category: 'iPhone',
    screenSize: '5.5"',
    portraitWidth: 1242,
    portraitHeight: 2208,
    landscapeWidth: 2208,
    landscapeHeight: 1242,
    required: false,
    notes: 'Covers iPhone 7 Plus, 6s Plus. Only needed for legacy device support.',
  },
  {
    id: 'ipad-pro-129',
    name: 'iPad Pro 12.9"',
    category: 'iPad',
    screenSize: '12.9"',
    portraitWidth: 2048,
    portraitHeight: 2732,
    landscapeWidth: 2732,
    landscapeHeight: 2048,
    required: true,
    notes: 'Required for all iPad apps. Covers all 12.9" iPad Pro models.',
  },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    category: 'iPad',
    screenSize: '11"',
    portraitWidth: 1668,
    portraitHeight: 2388,
    landscapeWidth: 2388,
    landscapeHeight: 1668,
    required: false,
    notes: 'Covers iPad Pro 11", iPad Air (4th & 5th gen).',
  },
  {
    id: 'ipad-10th',
    name: 'iPad (10th gen)',
    category: 'iPad',
    screenSize: '10.9"',
    portraitWidth: 1640,
    portraitHeight: 2360,
    landscapeWidth: 2360,
    landscapeHeight: 1640,
    required: false,
    notes: 'Covers iPad 10th generation.',
  },
  {
    id: 'ipad-9th',
    name: 'iPad (9th gen)',
    category: 'iPad',
    screenSize: '10.2"',
    portraitWidth: 1620,
    portraitHeight: 2160,
    landscapeWidth: 2160,
    landscapeHeight: 1620,
    required: false,
    notes: 'Covers iPad 9th, 8th, 7th generation.',
  },
  {
    id: 'mac-desktop',
    name: 'Mac (Desktop)',
    category: 'Mac',
    screenSize: 'Desktop',
    portraitWidth: 1280,
    portraitHeight: 800,
    landscapeWidth: 1280,
    landscapeHeight: 800,
    required: true,
    notes: 'Required for Mac App Store. Minimum 1280x800.',
  },
  {
    id: 'apple-watch-ultra',
    name: 'Apple Watch Ultra',
    category: 'Apple Watch',
    screenSize: '49mm',
    portraitWidth: 410,
    portraitHeight: 502,
    landscapeWidth: 502,
    landscapeHeight: 410,
    required: false,
    notes: 'Required for watchOS apps targeting Ultra models.',
  },
  {
    id: 'apple-watch-series-9',
    name: 'Apple Watch Series 9 (45mm)',
    category: 'Apple Watch',
    screenSize: '45mm',
    portraitWidth: 396,
    portraitHeight: 484,
    landscapeWidth: 484,
    landscapeHeight: 396,
    required: false,
    notes: 'Covers Series 9, 8, 7 (45mm).',
  },
  {
    id: 'apple-tv',
    name: 'Apple TV',
    category: 'Apple TV',
    screenSize: 'TV',
    portraitWidth: 1920,
    portraitHeight: 1080,
    landscapeWidth: 1920,
    landscapeHeight: 1080,
    required: true,
    notes: 'Required for tvOS apps. Full HD resolution.',
  },
];

// Tips for optimal screenshots
const TIPS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Use PNG or JPEG format',
    description: 'PNG is recommended for crisp text. JPEG works for photo-heavy screenshots.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Avoid transparency',
    description: 'Screenshots must have no transparent areas. Use a solid background.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Maximum 10 screenshots per locale',
    description: 'You can upload up to 10 screenshots for each device type and language.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'First 3 screenshots matter most',
    description: 'Users see the first 3 screenshots without scrolling. Make them count!',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),title: 'Consistent style across all screenshots',
    description: 'Use the same colors, fonts, and layout for a professional look.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'File size limit: 500MB per image',
    description: 'Keep files under 500MB. Typical screenshots are much smaller.',
  },
];

// FAQ Schema for SEO
const FAQSchema = () => {
  useEffect(() => {
    const existingScript = document.getElementById('faq-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'faq-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What are the required screenshot sizes for iPhone apps?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For iPhone apps, the primary required size is 1290 x 2796 pixels (iPhone 15 Pro Max / 6.7" display). This size is mandatory for all iPhone apps on the App Store.',
          },
        },
        {
          '@type': 'Question',
          name: 'What screenshot sizes are required for iPad apps?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For iPad apps, the primary required size is 2048 x 2732 pixels (iPad Pro 12.9"). This is mandatory for all iPad apps on the App Store.',
          },
        },
        {
          '@type': 'Question',
          name: 'What format should App Store screenshots be in?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'App Store screenshots should be in PNG or JPEG format. PNG is recommended for screenshots with text as it maintains crisp edges. Screenshots must have no transparency.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many screenshots can I upload to the App Store?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can upload up to 10 screenshots per device type per language/locale on the App Store.',
          },
        },
      ],
    });

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('faq-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
};

export const SizeCalculatorPage: React.FC<Props> = ({ onNavigate }) => {
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentWidth = orientation === 'portrait' ? selectedDevice.portraitWidth : selectedDevice.landscapeWidth;
  const currentHeight = orientation === 'portrait' ? selectedDevice.portraitHeight : selectedDevice.landscapeHeight;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${currentWidth} x ${currentHeight}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [...new Set(DEVICES.map(d => d.category))];

  return (
    <div style={styles.container}>
      <SEOHead
        title="App Store Screenshot Size Calculator - Free Tool | LocalizeShots"
        description="Find the exact screenshot dimensions for iPhone, iPad, Mac, Apple Watch, and Apple TV. Free App Store screenshot size calculator with all device specifications."
        canonicalUrl="/tools/size-calculator"
      />
      <FAQSchema />
      <SchemaMarkup />

      {/* Navigation */}
      <nav style={{
        ...styles.nav,
        backgroundColor: scrolled ? 'rgba(250, 250, 248, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.borderLight}` : 'none',
      }}>
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
            <button style={styles.ctaBtn} onClick={() => onNavigate?.('register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeLine} />
            <span style={styles.heroBadgeText}>Free Tool</span>
            <span style={styles.heroBadgeLine} />
          </div>
          <h1 style={styles.heroTitle}>
            App Store Screenshot<br />
            <span style={styles.heroAccent}>Size Calculator</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Find the exact pixel dimensions for any Apple device.<br />
            iPhone, iPad, Mac, Apple Watch, and Apple TV.
          </p>
        </div>
      </section>

      {/* Main Calculator */}
      <section style={styles.calculator}>
        <div style={styles.calculatorInner}>
          {/* Device Selector */}
          <div style={styles.selectorCard}>
            <h2 style={styles.selectorTitle}>Select Device</h2>

            {/* Category Tabs */}
            <div style={styles.categoryTabs}>
              {categories.map(category => (
                <button
                  key={category}
                  style={{
                    ...styles.categoryTab,
                    ...(selectedDevice.category === category ? styles.categoryTabActive : {}),
                  }}
                  onClick={() => {
                    const firstDevice = DEVICES.find(d => d.category === category);
                    if (firstDevice) setSelectedDevice(firstDevice);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Device List */}
            <div style={styles.deviceList}>
              {DEVICES.filter(d => d.category === selectedDevice.category).map(device => (
                <button
                  key={device.id}
                  style={{
                    ...styles.deviceButton,
                    ...(selectedDevice.id === device.id ? styles.deviceButtonActive : {}),
                  }}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div style={styles.deviceInfo}>
                    <span style={styles.deviceName}>{device.name}</span>
                    <span style={styles.deviceScreen}>{device.screenSize}</span>
                  </div>
                  {device.required && (
                    <span style={styles.requiredBadge}>Required</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Card */}
          <div style={styles.resultsCard}>
            <div style={styles.resultsHeader}>
              <h2 style={styles.resultsTitle}>{selectedDevice.name}</h2>
              <p style={styles.resultsSubtitle}>{selectedDevice.screenSize} Display</p>
            </div>

            {/* Orientation Toggle */}
            <div style={styles.orientationToggle}>
              <button
                style={{
                  ...styles.orientationBtn,
                  ...(orientation === 'portrait' ? styles.orientationBtnActive : {}),
                }}
                onClick={() => setOrientation('portrait')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Portrait
              </button>
              <button
                style={{
                  ...styles.orientationBtn,
                  ...(orientation === 'landscape' ? styles.orientationBtnActive : {}),
                }}
                onClick={() => setOrientation('landscape')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Landscape
              </button>
            </div>

            {/* Dimensions Display */}
            <div style={styles.dimensionsBox}>
              <div style={styles.dimensionLabel}>Screenshot Size (pixels)</div>
              <div style={styles.dimensionValue}>
                <span style={styles.dimensionNumber}>{currentWidth}</span>
                <span style={styles.dimensionX}>x</span>
                <span style={styles.dimensionNumber}>{currentHeight}</span>
              </div>
              <button style={styles.copyBtn} onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Copy Size
                  </>
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div style={styles.infoBox}>
              <div style={styles.infoIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={colors.info} strokeWidth="1.5"/>
                  <path d="M12 16v-4M12 8h.01" stroke={colors.info} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={styles.infoText}>{selectedDevice.notes}</p>
            </div>

            {/* Quick Stats */}
            <div style={styles.quickStats}>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Aspect Ratio</span>
                <span style={styles.statValue}>
                  {orientation === 'portrait'
                    ? `${(selectedDevice.portraitHeight / selectedDevice.portraitWidth).toFixed(2)}:1`
                    : `${(selectedDevice.landscapeWidth / selectedDevice.landscapeHeight).toFixed(2)}:1`
                  }
                </span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Total Pixels</span>
                <span style={styles.statValue}>
                  {(currentWidth * currentHeight / 1000000).toFixed(2)}MP
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section style={styles.requirements}>
        <div style={styles.requirementsInner}>
          <h2 style={styles.sectionTitle}>App Store Screenshot Requirements</h2>
          <p style={styles.sectionSubtitle}>
            Apple has specific requirements for screenshots. Here is what you need to know.
          </p>

          <div style={styles.requirementsGrid}>
            <div style={styles.requirementCard}>
              <div style={styles.requirementIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="2" width="14" height="20" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M12 18h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.requirementTitle}>iPhone (Required)</h3>
              <p style={styles.requirementText}>
                <strong>1290 x 2796</strong> (6.7" display)<br />
                PNG or JPEG, no transparency
              </p>
            </div>

            <div style={styles.requirementCard}>
              <div style={styles.requirementIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="18" rx="3" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M12 17h.01" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.requirementTitle}>iPad (Required)</h3>
              <p style={styles.requirementText}>
                <strong>2048 x 2732</strong> (12.9" display)<br />
                PNG or JPEG, no transparency
              </p>
            </div>

            <div style={styles.requirementCard}>
              <div style={styles.requirementIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="14" rx="2" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M8 21h8M12 18v3" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.requirementTitle}>Mac (If applicable)</h3>
              <p style={styles.requirementText}>
                <strong>1280 x 800</strong> minimum<br />
                PNG or JPEG format
              </p>
            </div>

            <div style={styles.requirementCard}>
              <div style={styles.requirementIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke={colors.accent} strokeWidth="1.5"/>
                  <path d="M12 7v5l3 3" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.requirementTitle}>Apple Watch</h3>
              <p style={styles.requirementText}>
                <strong>410 x 502</strong> (Ultra 49mm)<br />
                Required for watchOS apps
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section style={styles.tips}>
        <div style={styles.tipsInner}>
          <h2 style={styles.sectionTitle}>Screenshot Best Practices</h2>
          <p style={styles.sectionSubtitle}>
            Follow these tips to create screenshots that convert.
          </p>

          <div style={styles.tipsGrid}>
            {TIPS.map((tip, index) => (
              <div key={index} style={styles.tipCard}>
                <div style={styles.tipIcon}>{tip.icon}</div>
                <div style={styles.tipContent}>
                  <h3 style={styles.tipTitle}>{tip.title}</h3>
                  <p style={styles.tipDescription}>{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Ready to Create Screenshots?</h2>
          <p style={styles.ctaSubtitle}>
            Generate professional App Store screenshots with AI-powered headlines,<br />
            automatic device mockups, and one-click localization to 40+ languages.
          </p>
          <button style={styles.ctaPrimary} onClick={() => onNavigate?.('register')}>
            Create Screenshots Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 10 }}>
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <p style={styles.ctaNote}>Free to start. No credit card required.</p>
        </div>
      </section>

      {/* Related Resources Section */}
      <section style={styles.relatedSection}>
        <div style={styles.relatedInner}>
          <h2 style={styles.relatedTitle}>Related Resources</h2>
          <div style={styles.relatedGrid} className="calc-related-grid">
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
            <button onClick={() => onNavigate?.('terms')} style={styles.footerLink}>Terms</button>
            <span style={styles.footerLinkDivider}>|</span>
            <button onClick={() => onNavigate?.('privacy')} style={styles.footerLink}>Privacy</button>
            <span style={styles.footerLinkDivider}>|</span>
            <button onClick={() => onNavigate?.('refund')} style={styles.footerLink}>Refund</button>
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
    paddingBottom: 40,
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: 700,
    margin: '0 auto',
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
    fontSize: 48,
    fontWeight: 400,
    color: colors.text,
    lineHeight: 1.15,
    letterSpacing: '-1px',
    marginBottom: 20,
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
    letterSpacing: '0.2px',
  },

  // Calculator
  calculator: {
    padding: '40px 24px 80px',
  },
  calculatorInner: {
    maxWidth: 900,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },

  // Selector Card
  selectorCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    border: `1px solid ${colors.borderLight}`,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 20,
  },
  categoryTabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryTab: {
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: colors.textSecondary,
    backgroundColor: colors.bg,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: 20,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryTabActive: {
    color: colors.accent,
    backgroundColor: colors.accentBg,
    borderColor: colors.accent,
  },
  deviceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 320,
    overflowY: 'auto',
  },
  deviceButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: colors.bg,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  deviceButtonActive: {
    backgroundColor: colors.accentBg,
    borderColor: colors.accent,
  },
  deviceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
  },
  deviceScreen: {
    fontSize: 12,
    color: colors.textMuted,
  },
  requiredBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.success,
    backgroundColor: '#ECFDF5',
    padding: '3px 8px',
    borderRadius: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Results Card
  resultsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    border: `1px solid ${colors.borderLight}`,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  orientationToggle: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
  },
  orientationBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: colors.textSecondary,
    backgroundColor: colors.bg,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  orientationBtnActive: {
    color: colors.accent,
    backgroundColor: colors.accentBg,
    borderColor: colors.accent,
  },
  dimensionsBox: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  dimensionLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 12,
  },
  dimensionValue: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dimensionNumber: {
    fontSize: 36,
    fontWeight: 600,
    color: colors.text,
    letterSpacing: '-1px',
  },
  dimensionX: {
    fontSize: 20,
    fontWeight: 400,
    color: colors.textMuted,
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: colors.accent,
    backgroundColor: colors.accentBg,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: colors.infoBg,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: colors.text,
    margin: 0,
  },
  quickStats: {
    display: 'flex',
    gap: 16,
  },
  stat: {
    flex: 1,
    padding: 14,
    backgroundColor: colors.bg,
    borderRadius: 10,
    textAlign: 'center',
  },
  statLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
  },

  // Requirements Section
  requirements: {
    padding: '60px 24px',
    backgroundColor: colors.card,
  },
  requirementsInner: {
    maxWidth: 900,
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 500,
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
  requirementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  requirementCard: {
    backgroundColor: colors.bg,
    borderRadius: 14,
    padding: 20,
    textAlign: 'center',
  },
  requirementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
  },
  requirementTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
  },

  // Tips Section
  tips: {
    padding: '60px 24px',
  },
  tipsInner: {
    maxWidth: 900,
    margin: '0 auto',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  tipCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    border: `1px solid ${colors.borderLight}`,
  },
  tipIcon: {
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    lineHeight: 1.5,
    color: colors.textSecondary,
    margin: 0,
  },

  // CTA Section
  cta: {
    padding: '80px 24px',
    backgroundColor: colors.card,
    textAlign: 'center',
  },
  ctaInner: {
    maxWidth: 600,
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 500,
    color: colors.text,
    marginBottom: 16,
    letterSpacing: '-0.5px',
  },
  ctaSubtitle: {
    fontSize: 16,
    lineHeight: 1.7,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 32px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    boxShadow: `0 6px 20px ${colors.accent}35`,
    letterSpacing: '0.3px',
    marginBottom: 16,
  },
  ctaNote: {
    fontSize: 13,
    color: colors.textMuted,
    margin: 0,
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
};

// Add responsive styles
if (typeof document !== 'undefined' && !document.getElementById('size-calculator-responsive')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'size-calculator-responsive';
  styleEl.textContent = `
    @media (max-width: 768px) {
      .size-calc-grid {
        grid-template-columns: 1fr !important;
      }
      .calc-related-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 14px !important;
      }
    }
    @media (max-width: 480px) {
      .calc-related-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

export default SizeCalculatorPage;
