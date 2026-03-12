import React from 'react';

// Base URL for the website
const BASE_URL = 'https://localizeshots.com';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showVisual?: boolean;
  visualStyle?: 'minimal' | 'standard';
}

/**
 * Breadcrumbs component that generates:
 * 1. BreadcrumbList JSON-LD schema for SEO (Google rich results)
 * 2. Optional visual breadcrumb navigation
 *
 * Usage:
 * <Breadcrumbs
 *   items={[
 *     { name: 'Home', path: '/' },
 *     { name: 'Features', path: '/features' }
 *   ]}
 *   showVisual={true}
 * />
 */
export function Breadcrumbs({ items, showVisual = false, visualStyle = 'minimal' }: BreadcrumbsProps) {
  // Generate JSON-LD BreadcrumbList schema following Google's guidelines
  // https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path === '/' ? BASE_URL : `${BASE_URL}${item.path}`,
    })),
  };

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* Optional Visual Breadcrumb UI */}
      {showVisual && (
        <nav
          aria-label="Breadcrumb"
          style={visualStyle === 'minimal' ? styles.navMinimal : styles.navStandard}
        >
          <ol style={styles.list}>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={item.path} style={styles.item}>
                  {!isLast ? (
                    <>
                      <a
                        href={item.path}
                        style={visualStyle === 'minimal' ? styles.linkMinimal : styles.linkStandard}
                      >
                        {item.name}
                      </a>
                      <span style={styles.separator} aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 18l6-6-6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <span
                      aria-current="page"
                      style={visualStyle === 'minimal' ? styles.currentMinimal : styles.currentStandard}
                    >
                      {item.name}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
}

// Color palette matching the app design
const colors = {
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  accent: '#FF6B4A',
  border: '#E8E8E8',
  bg: '#FAFAF8',
};

const styles: Record<string, React.CSSProperties> = {
  navMinimal: {
    padding: '8px 0',
  },
  navStandard: {
    padding: '12px 16px',
    backgroundColor: colors.bg,
    borderRadius: 8,
    marginBottom: 16,
  },
  list: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  linkMinimal: {
    fontSize: 13,
    color: colors.textMuted,
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  linkStandard: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  currentMinimal: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: 500,
  },
  currentStandard: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 600,
  },
  separator: {
    display: 'flex',
    alignItems: 'center',
    color: colors.textMuted,
    marginLeft: 4,
    marginRight: 4,
  },
};

// Pre-configured breadcrumb paths for common pages
export const breadcrumbConfig = {
  home: [
    { name: 'Home', path: '/' },
  ],
  features: [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
  ],
  pricing: [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/#pricing' },
  ],
  howItWorks: [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works' },
  ],
  dashboard: [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
  ],
  project: (projectName?: string) => [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: projectName || 'Project', path: '/project' },
  ],
  profile: [
    { name: 'Home', path: '/' },
    { name: 'Profile', path: '/profile' },
  ],
  login: [
    { name: 'Home', path: '/' },
    { name: 'Sign In', path: '/login' },
  ],
  register: [
    { name: 'Home', path: '/' },
    { name: 'Sign Up', path: '/register' },
  ],
  terms: [
    { name: 'Home', path: '/' },
    { name: 'Terms of Service', path: '/terms' },
  ],
  privacy: [
    { name: 'Home', path: '/' },
    { name: 'Privacy Policy', path: '/privacy' },
  ],
  refund: [
    { name: 'Home', path: '/' },
    { name: 'Refund Policy', path: '/refund' },
  ],
};

export default Breadcrumbs;
