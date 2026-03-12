import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'LocalizeShots - App Store Screenshot Generator';
const DEFAULT_DESCRIPTION = 'Create stunning localized App Store screenshots with iPhone mockups, AI-generated headlines, and metadata. Perfect for ASO optimization.';
const BASE_URL = 'https://localizeshots.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export function SEOHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false,
}: SEOHeadProps) {
  const fullCanonicalUrl = canonicalUrl
    ? `${BASE_URL}${canonicalUrl.startsWith('/') ? '' : '/'}${canonicalUrl}`
    : undefined;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      <meta property="og:site_name" content="LocalizeShots" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

// Pre-configured SEO for common pages
export const seoConfig = {
  home: {
    title: 'LocalizeShots - App Store Screenshot Generator',
    description: 'Create stunning localized App Store screenshots with iPhone mockups, AI-generated headlines, and metadata. Perfect for ASO optimization.',
    canonicalUrl: '/',
  },
  dashboard: {
    title: 'Dashboard - LocalizeShots',
    description: 'Manage your App Store screenshot projects. Create, edit, and export localized screenshots for your mobile apps.',
    canonicalUrl: '/dashboard',
  },
  wizard: {
    title: 'Create Screenshots - LocalizeShots',
    description: 'Step-by-step wizard to generate professional App Store screenshots with AI-powered headlines and automatic localization.',
    canonicalUrl: '/project',
  },
  login: {
    title: 'Login - LocalizeShots',
    description: 'Sign in to LocalizeShots to manage your App Store screenshot projects.',
    canonicalUrl: '/login',
  },
  register: {
    title: 'Sign Up - LocalizeShots',
    description: 'Create a free LocalizeShots account to start generating professional App Store screenshots.',
    canonicalUrl: '/register',
  },
  profile: {
    title: 'Profile - LocalizeShots',
    description: 'Manage your LocalizeShots account settings and subscription.',
    canonicalUrl: '/profile',
  },
  terms: {
    title: 'Terms of Service - LocalizeShots',
    description: 'Terms of Service for LocalizeShots App Store Screenshot Generator.',
    canonicalUrl: '/terms',
  },
  privacy: {
    title: 'Privacy Policy - LocalizeShots',
    description: 'Privacy Policy for LocalizeShots App Store Screenshot Generator.',
    canonicalUrl: '/privacy',
  },
  refund: {
    title: 'Refund Policy - LocalizeShots',
    description: 'Refund Policy for LocalizeShots App Store Screenshot Generator.',
    canonicalUrl: '/refund',
  },
  about: {
    title: 'About - LocalizeShots',
    description: 'Learn about LocalizeShots - AI-powered App Store screenshot localization tool that helps app developers reach global audiences.',
    canonicalUrl: '/about',
  },
  features: {
    title: 'Features - AI Screenshot Generator & App Localization Tool | LocalizeShots',
    description: 'Discover LocalizeShots features: AI-powered App Store screenshot generator, 40+ language translations, iPhone mockups, ASO metadata generation, AI icon creation, and batch export.',
    canonicalUrl: '/features',
  },
  iosScreenshots: {
    title: 'iPhone Screenshot Generator - iOS App Store Screenshots | LocalizeShots',
    description: 'Create stunning iPhone and iPad screenshots for the App Store. Generate localized iOS screenshots with device mockups, AI headlines, and export in all required sizes. iPhone 16, 15 Pro, iPad Pro supported.',
    canonicalUrl: '/ios-screenshots',
  },
};
