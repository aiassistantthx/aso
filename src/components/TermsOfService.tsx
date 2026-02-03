import React from 'react';

const colors = {
  bg: '#FFFBF5',
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  accent: '#FF6B4A',
  border: '#e5e5e7',
};

interface TermsOfServiceProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <button onClick={onBack} style={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </nav>

      <main style={styles.content}>
        <h1 style={styles.title}>Terms of Service</h1>
        <p style={styles.lastUpdated}>Last updated: February 3, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.heading}>1. Agreement to Terms</h2>
          <p style={styles.text}>
            By accessing or using LocalizeShots ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the Service.
          </p>
          <p style={styles.text}>
            LocalizeShots is operated by LocalizeShots ("we", "us", or "our"). The Service provides tools for 
            creating localized App Store screenshots, generating ASO metadata, and creating app icons using AI.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>2. Description of Service</h2>
          <p style={styles.text}>LocalizeShots provides the following services:</p>
          <ul style={styles.list}>
            <li>AI-powered screenshot headline generation with localization to 35+ languages</li>
            <li>Visual editor for creating App Store screenshots with device mockups</li>
            <li>AI metadata generation (app name, subtitle, keywords, description)</li>
            <li>AI app icon generation</li>
            <li>Batch export of localized assets in App Store-ready formats</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>3. Account Registration</h2>
          <p style={styles.text}>
            To use certain features of the Service, you must create an account. You agree to:
          </p>
          <ul style={styles.list}>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be responsible for all activities that occur under your account</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>4. Subscription Plans and Payment</h2>
          <p style={styles.text}>
            LocalizeShots offers both free and paid subscription plans:
          </p>
          <ul style={styles.list}>
            <li><strong>FREE Plan:</strong> Limited access to basic features</li>
            <li><strong>PRO Plan:</strong> Full access to all features, unlimited projects, all languages, and priority generation</li>
          </ul>
          <p style={styles.text}>
            Paid subscriptions are billed on a recurring basis (monthly or annually) and will automatically 
            renew unless cancelled. By subscribing, you authorize us to charge your payment method on a 
            recurring basis.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>5. User Content</h2>
          <p style={styles.text}>
            You retain ownership of all content you upload to the Service, including screenshots, images, 
            and text ("User Content"). By uploading User Content, you grant us a limited license to process, 
            store, and display this content solely for the purpose of providing the Service.
          </p>
          <p style={styles.text}>You represent and warrant that:</p>
          <ul style={styles.list}>
            <li>You own or have the necessary rights to use and share your User Content</li>
            <li>Your User Content does not infringe any third-party intellectual property rights</li>
            <li>Your User Content does not violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>6. AI-Generated Content</h2>
          <p style={styles.text}>
            The Service uses artificial intelligence to generate headlines, metadata, and app icons. 
            You acknowledge that:
          </p>
          <ul style={styles.list}>
            <li>AI-generated content may require review and editing before use</li>
            <li>We do not guarantee the accuracy, appropriateness, or suitability of AI-generated content</li>
            <li>You are responsible for reviewing and approving all AI-generated content before publishing</li>
            <li>AI-generated content is provided "as is" without warranties of any kind</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>7. Acceptable Use</h2>
          <p style={styles.text}>You agree not to use the Service to:</p>
          <ul style={styles.list}>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
            <li>Use the Service for any fraudulent or deceptive purposes</li>
            <li>Generate content that is illegal, harmful, or violates third-party rights</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>8. Intellectual Property</h2>
          <p style={styles.text}>
            The Service, including its design, features, and technology, is owned by LocalizeShots and 
            protected by intellectual property laws. You may not copy, modify, distribute, or reverse 
            engineer any part of the Service without our written consent.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>9. Limitation of Liability</h2>
          <p style={styles.text}>
            To the maximum extent permitted by law, LocalizeShots shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages, including loss of profits, data, 
            or business opportunities, arising from your use of the Service.
          </p>
          <p style={styles.text}>
            Our total liability for any claims arising from the Service shall not exceed the amount 
            you paid us in the twelve (12) months preceding the claim.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>10. Disclaimer of Warranties</h2>
          <p style={styles.text}>
            The Service is provided "as is" and "as available" without warranties of any kind, either 
            express or implied, including but not limited to warranties of merchantability, fitness for 
            a particular purpose, and non-infringement.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>11. Termination</h2>
          <p style={styles.text}>
            We reserve the right to suspend or terminate your account at any time for violation of these 
            Terms or for any other reason at our sole discretion. Upon termination, your right to use 
            the Service will immediately cease.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>12. Changes to Terms</h2>
          <p style={styles.text}>
            We may update these Terms from time to time. We will notify you of significant changes by 
            posting a notice on the Service or sending you an email. Your continued use of the Service 
            after changes become effective constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>13. Governing Law</h2>
          <p style={styles.text}>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
            in which LocalizeShots operates, without regard to conflict of law principles.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>14. Contact Us</h2>
          <p style={styles.text}>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p style={styles.text}>
            <strong>Email:</strong> support@localizeshots.com
          </p>
        </section>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.bg,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  nav: {
    padding: '20px 40px',
    borderBottom: `1px solid ${colors.border}`,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: colors.accent,
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 0',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '60px 40px',
  },
  title: {
    fontSize: '42px',
    fontWeight: 700,
    color: colors.text,
    marginBottom: '8px',
  },
  lastUpdated: {
    fontSize: '14px',
    color: colors.textSecondary,
    marginBottom: '48px',
  },
  section: {
    marginBottom: '40px',
  },
  heading: {
    fontSize: '22px',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '16px',
  },
  text: {
    fontSize: '16px',
    lineHeight: 1.7,
    color: colors.text,
    marginBottom: '12px',
  },
  list: {
    fontSize: '16px',
    lineHeight: 1.7,
    color: colors.text,
    marginLeft: '24px',
    marginBottom: '12px',
  },
};
