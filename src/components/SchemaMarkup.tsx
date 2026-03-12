import React from 'react';

interface SchemaMarkupProps {
  monthlyPrice?: string;
  yearlyPrice?: string;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({
  monthlyPrice = '9.99',
  yearlyPrice = '59.99'
}) => {
  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LocalizeShots',
    description: 'App Store Screenshot Generator & ASO Tool. Create localized App Store screenshots with iPhone mockups, AI-generated headlines, metadata, and app icons. Export ready-to-upload assets for 40+ languages.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    url: 'https://localizeshots.com',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: '3 projects, 2 languages, all mockup styles',
      },
      {
        '@type': 'Offer',
        name: 'Pro Monthly',
        price: monthlyPrice,
        priceCurrency: 'USD',
        description: 'Unlimited projects, 40+ languages, ASO metadata, priority support',
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      },
      {
        '@type': 'Offer',
        name: 'Pro Yearly',
        price: yearlyPrice,
        priceCurrency: 'USD',
        description: 'Unlimited projects, 40+ languages, ASO metadata, priority support - billed annually',
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'AI-powered headline generation',
      'One-click translation to 40+ languages',
      'iPhone device mockups',
      'ASO metadata optimization',
      'ZIP export organized by language',
    ],
    screenshot: 'https://localizeshots.com/demos/demo1.png',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LocalizeShots',
    url: 'https://localizeshots.com',
    logo: 'https://localizeshots.com/logo.png',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://localizeshots.com',
    },
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LocalizeShots',
    url: 'https://localizeshots.com',
    description: 'App Store Screenshot Generator & ASO Tool for localized screenshots and metadata.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://localizeshots.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: "What's included in the free plan?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The free plan includes 3 projects, 2 target languages, all mockup styles, smart AI-generated headlines, and ZIP export. It\'s perfect for trying out LocalizeShots before upgrading.',
        },
      },
      {
        '@type': 'Question',
        name: "What's the difference between Free and Pro plans?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pro unlocks unlimited projects, all 40+ languages, ASO metadata generation (app name, subtitle, keywords, description), and priority support. The free plan is limited to 3 projects and 2 languages.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel my subscription anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can cancel your Pro subscription at any time. Your access continues until the end of your billing period. No questions asked.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer refunds?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer a 7-day money-back guarantee for Pro subscriptions. If you\'re not satisfied, contact us within 7 days of purchase for a full refund.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the AI generation work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI analyzes your app description and keywords to generate compelling marketing headlines and ASO-optimized metadata. It uses advanced language models to create content that converts, then translates everything while preserving marketing impact.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
};

export default SchemaMarkup;
