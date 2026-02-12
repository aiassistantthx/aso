import React from 'react';

export const pageStyles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.72)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
  },
  headerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 24px',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1d1d1f',
    flex: 1,
  },
  backButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #e0e0e5',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
  },
  createButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
  },
  stepBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    overflowX: 'auto',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    minWidth: '60px',
  },
  stepContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  stepTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '4px',
  },
  stepDesc: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '24px',
  },
  stepActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #f0f0f5',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '6px',
    marginTop: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid #e5e5ea',
    borderRadius: '12px',
    backgroundColor: '#fafafa',
    color: '#1d1d1f',
    outline: 'none',
    marginBottom: '8px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  },
  primaryButton: {
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
    transition: 'all 0.2s',
  },
  secondaryButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 500,
    border: '1px solid #e0e0e5',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
  },
  smallButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #e0e0e5',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
  },
  toggleCard: {
    padding: '16px 20px',
    borderRadius: '14px',
    border: '2px solid #e5e5ea',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'all 0.2s',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e5ea',
    borderTopColor: '#FF6B4A',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },
};

/** Inject spinner animation and responsive styles into the document head */
export function injectWizardStyles(): void {
  if (typeof document === 'undefined') return;

  const styleEl = document.getElementById('wizard-spinner-style') || document.createElement('style');
  styleEl.id = 'wizard-spinner-style';
  styleEl.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Wizard responsive styles */
    @media (max-width: 768px) {
      .wizard-content {
        padding: 12px !important;
      }
      .wizard-step-content {
        padding: 16px !important;
        border-radius: 14px !important;
      }
      .wizard-step-title {
        font-size: 18px !important;
      }
      .wizard-step-desc {
        font-size: 13px !important;
        margin-bottom: 16px !important;
      }
      .wizard-step-bar {
        gap: 4px !important;
        padding: 12px 16px !important;
        overflow-x: auto !important;
        justify-content: space-between !important;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .wizard-step-bar::-webkit-scrollbar {
        display: none;
      }
      .wizard-step-item {
        min-width: 55px !important;
        flex-shrink: 0 !important;
      }
      .wizard-step-label {
        display: block !important;
        font-size: 9px !important;
        white-space: nowrap !important;
      }
      .wizard-step-actions {
        flex-direction: column-reverse !important;
        gap: 10px !important;
        margin-top: 20px !important;
        padding-top: 16px !important;
      }
      .wizard-step-actions > button {
        width: 100% !important;
      }
      .wizard-screenshots-grid {
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 6px !important;
      }
      .wizard-headline-item {
        padding: 10px !important;
      }
      .wizard-headline-text {
        font-size: 13px !important;
      }
      .wizard-tabs {
        flex-wrap: wrap !important;
      }
      .wizard-language-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .wizard-preview-grid {
        flex-direction: column !important;
      }
      .wizard-editor-container {
        flex-direction: column !important;
      }
      .wizard-editor-sidebar {
        width: 100% !important;
        max-height: 300px !important;
        overflow-y: auto !important;
      }
      .wizard-template-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }
      .wizard-layout-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }
      .wizard-metadata-panel {
        max-width: 100% !important;
      }
    }
    @media (max-width: 480px) {
      .wizard-step-title {
        font-size: 16px !important;
      }
      .wizard-screenshots-grid {
        grid-template-columns: repeat(3, 1fr) !important;
      }
      .wizard-language-grid {
        grid-template-columns: 1fr !important;
      }
      .wizard-template-grid {
        grid-template-columns: 1fr !important;
      }
      .wizard-layout-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  if (!styleEl.parentNode) document.head.appendChild(styleEl);
}
