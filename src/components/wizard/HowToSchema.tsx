import React from 'react';

/**
 * HowTo JSON-LD Schema for the Wizard page
 * Follows Google's HowTo structured data guidelines:
 * https://developers.google.com/search/docs/appearance/structured-data/how-to
 */
export const HowToSchema: React.FC = () => {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create Localized App Store Screenshots',
    description: 'Learn how to create professional, localized App Store screenshots with AI-generated headlines. Upload your app screenshots, choose a visual style, select target languages, and export ready-to-upload assets for iOS App Store and Google Play.',
    image: 'https://localizeshots.com/demos/demo1.png',
    totalTime: 'PT10M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    tool: [
      {
        '@type': 'HowToTool',
        name: 'LocalizeShots Web App',
      },
    ],
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'App screenshots (3-8 images)',
      },
      {
        '@type': 'HowToSupply',
        name: 'App name and description',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter App Information',
        text: 'Provide your app name, a brief description of what your app does, and optional target keywords. This information helps the AI generate compelling, relevant headlines.',
        url: 'https://localizeshots.com/wizard#step-1',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload Your App Screenshots',
        text: 'Upload 3 to 8 screenshots of your app interface. These will be placed inside device mockups with your generated headlines. Supported formats: PNG, JPEG, WebP.',
        url: 'https://localizeshots.com/wizard#step-2',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Select Services to Generate',
        text: 'Choose what to generate: Screenshots with AI headlines for visual marketing, and/or ASO metadata (title, subtitle, keywords, description) optimized for app store search.',
        url: 'https://localizeshots.com/wizard#step-3',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Choose Visual Style and Layout',
        text: 'Select a color theme that matches your brand identity and choose a layout for your mockups. Options include centered, alternating, tilted, and spanning layouts.',
        url: 'https://localizeshots.com/wizard#step-4',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Generate AI Content',
        text: 'Click Generate to have AI create compelling marketing headlines and optimized metadata based on your app information. Generation takes just a few seconds.',
        url: 'https://localizeshots.com/wizard#step-5',
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Review and Edit Generated Content',
        text: 'Review the AI-generated headlines and metadata. Fine-tune text, adjust colors, or customize individual screenshots in the built-in editor.',
        url: 'https://localizeshots.com/wizard#step-6',
      },
      {
        '@type': 'HowToStep',
        position: 7,
        name: 'Select Languages and Translate',
        text: 'Choose target languages from 40+ supported languages. Click Translate All to automatically localize your headlines and metadata while preserving marketing impact.',
        url: 'https://localizeshots.com/wizard#step-7',
      },
      {
        '@type': 'HowToStep',
        position: 8,
        name: 'Export Your ASO Package',
        text: 'Download a ZIP file containing all your screenshots organized by language and device size, plus metadata JSON files ready to upload to App Store Connect or Google Play Console.',
        url: 'https://localizeshots.com/wizard#step-8',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(howToSchema),
      }}
    />
  );
};

export default HowToSchema;
