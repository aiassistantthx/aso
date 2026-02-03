import React from 'react';
import { Link } from '@adminjs/design-system';

interface Props {
  record: {
    params: {
      stripeCustomerId?: string;
    };
  };
}

const StripeLink: React.FC<Props> = ({ record }) => {
  const stripeCustomerId = record.params.stripeCustomerId;

  if (!stripeCustomerId) {
    return <span>—</span>;
  }

  return (
    <Link
      href={`https://dashboard.stripe.com/customers/${stripeCustomerId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      View in Stripe
    </Link>
  );
};

export default StripeLink;
