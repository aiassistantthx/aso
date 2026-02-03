import React from 'react';
import { ShowPropertyProps } from 'adminjs';

const PolarLink: React.FC<ShowPropertyProps> = ({ record }) => {
  const polarCustomerId = record?.params?.polarCustomerId;

  if (!polarCustomerId) {
    return <span style={{ color: '#999' }}>Not connected</span>;
  }

  const polarUrl = `https://dashboard.polar.sh/customers/${polarCustomerId}`;

  return (
    <a
      href={polarUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: '#0066cc',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span>View in Polar</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
};

export default PolarLink;
