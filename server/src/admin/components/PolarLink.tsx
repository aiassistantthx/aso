import React from 'react';
import { Link } from '@adminjs/design-system';

interface Props {
  record: {
    params: {
      polarCustomerId?: string;
    };
  };
}

const PolarLink: React.FC<Props> = ({ record }) => {
  const polarCustomerId = record.params.polarCustomerId;

  if (!polarCustomerId) {
    return <span>—</span>;
  }

  return (
    <Link
      href={`https://polar.sh/dashboard/customers/${polarCustomerId}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      View in Polar
    </Link>
  );
};

export default PolarLink;
