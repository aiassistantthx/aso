import React from 'react';

const colors = {
  bg: '#FFFBF5',
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  accent: '#FF6B4A',
  border: '#e5e5e7',
};

interface RefundPolicyProps {
  onBack: () => void;
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ onBack }) => {
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
        <h1 style={styles.title}>Refund Policy</h1>
        <p style={styles.lastUpdated}>Last updated: February 3, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.heading}>1. Overview</h2>
          <p style={styles.text}>
            At LocalizeShots, we want you to be completely satisfied with your purchase. This Refund 
            Policy outlines the terms and conditions for refunds on our subscription plans.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>2. Free Trial</h2>
          <p style={styles.text}>
            We offer a free plan that allows you to try our core features before committing to a 
            paid subscription. We encourage you to fully explore the free tier to ensure LocalizeShots 
            meets your needs before upgrading.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>3. Refund Eligibility</h2>
          
          <h3 style={styles.subheading}>3.1 Full Refund (Within 7 Days)</h3>
          <p style={styles.text}>
            You are eligible for a full refund if you request it within 7 days of your initial 
            subscription purchase and:
          </p>
          <ul style={styles.list}>
            <li>You have not generated more than 10 AI outputs (headlines, metadata, or icons)</li>
            <li>You have not exported more than 5 localized screenshot sets</li>
            <li>This is your first subscription with LocalizeShots</li>
          </ul>

          <h3 style={styles.subheading}>3.2 Partial Refund (8-30 Days)</h3>
          <p style={styles.text}>
            Between 8 and 30 days after purchase, you may be eligible for a prorated refund based 
            on unused time remaining in your billing period. This is evaluated on a case-by-case basis.
          </p>

          <h3 style={styles.subheading}>3.3 No Refund</h3>
          <p style={styles.text}>
            Refunds are generally not available:
          </p>
          <ul style={styles.list}>
            <li>After 30 days from the purchase date</li>
            <li>For subscription renewals (you can cancel anytime to prevent future charges)</li>
            <li>If you have extensively used the Service's paid features</li>
            <li>For promotional or discounted subscriptions</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>4. Subscription Cancellation</h2>
          <p style={styles.text}>
            You can cancel your subscription at any time from your Profile settings. When you cancel:
          </p>
          <ul style={styles.list}>
            <li>Your subscription will remain active until the end of your current billing period</li>
            <li>You will not be charged for the next billing period</li>
            <li>You will retain access to PRO features until your subscription expires</li>
            <li>Your projects and data will be preserved and accessible on the free plan</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>5. How to Request a Refund</h2>
          <p style={styles.text}>
            To request a refund, please contact us at support@localizeshots.com with:
          </p>
          <ul style={styles.list}>
            <li>Your account email address</li>
            <li>The date of purchase</li>
            <li>The reason for your refund request</li>
          </ul>
          <p style={styles.text}>
            We aim to respond to all refund requests within 2 business days.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>6. Refund Processing</h2>
          <p style={styles.text}>
            Once your refund is approved:
          </p>
          <ul style={styles.list}>
            <li>Refunds will be processed to your original payment method</li>
            <li>Credit card refunds typically appear within 5-10 business days</li>
            <li>Your account will be downgraded to the free plan immediately</li>
            <li>You will receive an email confirmation of your refund</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>7. Chargebacks</h2>
          <p style={styles.text}>
            If you believe there has been an error with your billing, please contact us before 
            initiating a chargeback with your bank. We are committed to resolving any billing 
            issues promptly and fairly.
          </p>
          <p style={styles.text}>
            Initiating a chargeback without first contacting us may result in account suspension 
            and loss of access to your projects and data.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>8. Technical Issues</h2>
          <p style={styles.text}>
            If you experience technical issues that prevent you from using the Service, please 
            contact our support team. We will work to resolve the issue and may offer:
          </p>
          <ul style={styles.list}>
            <li>Extended subscription time to compensate for downtime</li>
            <li>A full or partial refund if the issue cannot be resolved</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>9. Exceptions</h2>
          <p style={styles.text}>
            We reserve the right to make exceptions to this policy on a case-by-case basis at our 
            sole discretion. We may also refuse refunds if we detect abuse of our refund policy.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>10. Changes to This Policy</h2>
          <p style={styles.text}>
            We may update this Refund Policy from time to time. Changes will be effective when 
            posted on this page. The policy that was in effect at the time of your purchase will 
            apply to your refund request.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>11. Contact Us</h2>
          <p style={styles.text}>
            If you have any questions about our Refund Policy, please contact us at:
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
