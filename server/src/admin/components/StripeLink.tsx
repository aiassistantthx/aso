import React from 'react';
import { ShowPropertyProps } from 'adminjs';

const StripeLink: React.FC<ShowPropertyProps> = ({ record }) => {
  const stripeCustomerId = record?.params?.stripeCustomerId;

  if (!stripeCustomerId) {
    return <span style={{ color: '#999' }}>Not connected</span>;
  }

  // Use test mode URL if the customer ID starts with 'cus_test' or environment is not production
  const isTest = stripeCustomerId.includes('test') || process.env.NODE_ENV !== 'production';
  const stripeUrl = isTest
    ? `https://dashboard.stripe.com/test/customers/${stripeCustomerId}`
    : `https://dashboard.stripe.com/customers/${stripeCustomerId}`;

  return (
    <a
      href={stripeUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: '#635BFF',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span>View in Stripe</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
};

export default StripeLink;
