import React from 'react';

const colors = {
  bg: '#FFFBF5',
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  accent: '#FF6B4A',
  border: '#e5e5e7',
};

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.lastUpdated}>Last updated: February 3, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.heading}>1. Introduction</h2>
          <p style={styles.text}>
            LocalizeShots ("we", "us", or "our") is committed to protecting your privacy. This Privacy 
            Policy explains how we collect, use, disclose, and safeguard your information when you use 
            our web application and services (collectively, the "Service").
          </p>
          <p style={styles.text}>
            Please read this Privacy Policy carefully. By using the Service, you consent to the collection 
            and use of your information as described in this policy.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>2. Information We Collect</h2>
          
          <h3 style={styles.subheading}>2.1 Information You Provide</h3>
          <ul style={styles.list}>
            <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
            <li><strong>Payment Information:</strong> Billing details processed securely through our payment providers (Stripe, Polar)</li>
            <li><strong>User Content:</strong> Screenshots, images, app names, descriptions, and other content you upload</li>
            <li><strong>Communications:</strong> Information you provide when contacting support</li>
          </ul>

          <h3 style={styles.subheading}>2.2 Information Collected Automatically</h3>
          <ul style={styles.list}>
            <li><strong>Usage Data:</strong> Pages visited, features used, and actions taken within the Service</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
            <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
            <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>3. How We Use Your Information</h2>
          <p style={styles.text}>We use your information to:</p>
          <ul style={styles.list}>
            <li>Provide, maintain, and improve the Service</li>
            <li>Process your transactions and manage your subscription</li>
            <li>Generate AI-powered content (headlines, metadata, icons) based on your inputs</li>
            <li>Send you service-related communications and updates</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Detect, prevent, and address technical issues and security threats</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>4. AI Processing</h2>
          <p style={styles.text}>
            Our Service uses artificial intelligence (OpenAI) to generate content. When you use AI features:
          </p>
          <ul style={styles.list}>
            <li>Your inputs (app descriptions, screenshots) are sent to OpenAI's API for processing</li>
            <li>OpenAI processes this data according to their privacy policy and data usage policies</li>
            <li>We do not use your content to train AI models</li>
            <li>Generated content is stored in your account for your use</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>5. Data Sharing and Disclosure</h2>
          <p style={styles.text}>We may share your information with:</p>
          <ul style={styles.list}>
            <li><strong>Service Providers:</strong> Third-party vendors who assist in operating the Service (payment processors, cloud hosting, AI providers)</li>
            <li><strong>Legal Requirements:</strong> When required by law, legal process, or government request</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>Protection:</strong> To protect rights, privacy, safety, or property of LocalizeShots or others</li>
          </ul>
          <p style={styles.text}>
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>6. Data Retention</h2>
          <p style={styles.text}>
            We retain your information for as long as your account is active or as needed to provide 
            the Service. After account deletion:
          </p>
          <ul style={styles.list}>
            <li>Your personal data is deleted within 30 days</li>
            <li>Your uploaded content and projects are permanently removed</li>
            <li>Anonymized usage data may be retained for analytics</li>
            <li>Some data may be retained as required by law</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>7. Data Security</h2>
          <p style={styles.text}>
            We implement appropriate technical and organizational measures to protect your information:
          </p>
          <ul style={styles.list}>
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Secure password hashing</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
          </ul>
          <p style={styles.text}>
            However, no method of transmission over the internet is 100% secure, and we cannot 
            guarantee absolute security.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>8. Your Rights</h2>
          <p style={styles.text}>Depending on your location, you may have the right to:</p>
          <ul style={styles.list}>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
            <li><strong>Objection:</strong> Object to certain types of processing</li>
          </ul>
          <p style={styles.text}>
            To exercise these rights, please contact us at support@localizeshots.com.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>9. Cookies</h2>
          <p style={styles.text}>
            We use essential cookies for authentication and session management. These cookies are 
            necessary for the Service to function and cannot be disabled.
          </p>
          <p style={styles.text}>
            We do not use tracking or advertising cookies.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>10. International Data Transfers</h2>
          <p style={styles.text}>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place for such transfers in compliance with 
            applicable data protection laws.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>11. Children's Privacy</h2>
          <p style={styles.text}>
            The Service is not intended for children under 16 years of age. We do not knowingly 
            collect personal information from children. If you believe a child has provided us with 
            personal information, please contact us immediately.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>12. Changes to This Policy</h2>
          <p style={styles.text}>
            We may update this Privacy Policy from time to time. We will notify you of significant 
            changes by posting a notice on the Service or sending you an email. Your continued use 
            of the Service after changes become effective constitutes acceptance of the updated policy.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>13. Contact Us</h2>
          <p style={styles.text}>
            If you have questions about this Privacy Policy or our data practices, please contact us at:
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
  subheading: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.text,
    marginTop: '20px',
    marginBottom: '12px',
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
