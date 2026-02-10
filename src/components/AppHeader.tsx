import React, { useState } from 'react';
import { useAuth } from '../services/authContext';

interface AppHeaderProps {
  currentPage: 'dashboard' | 'editor' | 'profile' | 'metadata' | 'wizard';
  onNavigate: (page: string) => void;
  rightContent?: React.ReactNode;
}

const headerStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.72)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backdropFilter: 'saturate(180%) blur(20px)',
  WebkitBackdropFilter: 'saturate(180%) blur(20px)',
};

const innerStyle: React.CSSProperties = {
  maxWidth: '1600px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 24px',
  gap: '16px',
};

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  userSelect: 'none',
  flexShrink: 0,
};

const logoIconStyle: React.CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '9px',
  background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(255, 107, 74, 0.3)',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#1d1d1f',
  letterSpacing: '-0.3px',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginLeft: '8px',
  flexShrink: 0,
};

const navLinkBase: React.CSSProperties = {
  padding: '5px 12px',
  fontSize: '13px',
  fontWeight: 500,
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  backgroundColor: 'transparent',
  color: '#86868b',
};

const navLinkActive: React.CSSProperties = {
  ...navLinkBase,
  backgroundColor: 'rgba(255, 107, 74, 0.1)',
  color: '#FF6B4A',
  fontWeight: 600,
};

const rightSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexShrink: 0,
  marginLeft: 'auto',
};

const planBadgeBase: React.CSSProperties = {
  padding: '3px 10px',
  borderRadius: '20px',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const userNameStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#1d1d1f',
};

const signOutStyle: React.CSSProperties = {
  padding: '5px 12px',
  fontSize: '12px',
  fontWeight: 500,
  border: '1px solid #e0e0e5',
  borderRadius: '7px',
  backgroundColor: '#fff',
  color: '#86868b',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const separatorStyle: React.CSSProperties = {
  width: '1px',
  height: '20px',
  backgroundColor: '#e0e0e5',
};

const hamburgerStyle: React.CSSProperties = {
  display: 'none',
  padding: '8px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  borderRadius: '8px',
};

const mobileMenuStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  zIndex: 200,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  backdropFilter: 'blur(20px)',
};

const mobileMenuHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
};

const mobileMenuLinksStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const mobileMenuLinkStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '16px',
  fontWeight: 500,
  border: 'none',
  borderRadius: '12px',
  backgroundColor: '#f5f5f7',
  color: '#1d1d1f',
  cursor: 'pointer',
  textAlign: 'left',
};

const mobileMenuLinkActiveStyle: React.CSSProperties = {
  ...mobileMenuLinkStyle,
  backgroundColor: 'rgba(255, 107, 74, 0.1)',
  color: '#FF6B4A',
  fontWeight: 600,
};

const mobileMenuUserStyle: React.CSSProperties = {
  marginTop: 'auto',
  paddingTop: '24px',
  borderTop: '1px solid #e0e0e5',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

// Add responsive CSS
const responsiveStyles = `
  @media (max-width: 768px) {
    .app-header-inner {
      padding: 10px 16px !important;
    }
    .app-header-logo-text {
      display: none !important;
    }
    .app-header-nav {
      display: none !important;
    }
    .app-header-right-content {
      display: none !important;
    }
    .app-header-right-section {
      display: none !important;
    }
    .app-header-hamburger {
      display: flex !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('app-header-responsive')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'app-header-responsive';
  styleEl.textContent = responsiveStyles;
  document.head.appendChild(styleEl);
}

export const AppHeader: React.FC<AppHeaderProps> = ({ currentPage, onNavigate, rightContent }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const plan = user?.plan ?? 'FREE';

  const isProjectsActive = currentPage === 'dashboard' || currentPage === 'editor';
  const isProfileActive = currentPage === 'profile';

  const handleNavigate = (page: string) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <>
      <header style={headerStyle}>
        <div style={innerStyle} className="app-header-inner">
          {/* Logo */}
          <div style={logoContainerStyle} onClick={() => handleNavigate('dashboard')}>
            <div style={logoIconStyle}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="3" stroke="white" strokeWidth="2" />
                <rect x="7" y="8" width="10" height="8" rx="1" fill="white" opacity="0.5" />
              </svg>
            </div>
            <span style={logoTextStyle} className="app-header-logo-text">LocalizeShots</span>
          </div>

          {/* Navigation */}
          <nav style={navStyle} className="app-header-nav">
            <button
              style={isProjectsActive ? navLinkActive : navLinkBase}
              onClick={() => handleNavigate('dashboard')}
            >
              Projects
            </button>
          </nav>

          {/* Page-specific right content */}
          {rightContent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }} className="app-header-right-content">
              <div style={separatorStyle} />
              {rightContent}
            </div>
          )}

          {/* User section - desktop */}
          <div style={rightSectionStyle} className="app-header-right-section">
            <div style={separatorStyle} />
            <span
              style={{
                ...planBadgeBase,
                backgroundColor: plan === 'PRO' ? '#e8f9ed' : '#FFF5F2',
                color: plan === 'PRO' ? '#248a3d' : '#FF6B4A',
              }}
            >
              {plan}
            </span>
            <span style={userNameStyle}>
              {user?.name || user?.email}
            </span>
            <button
              style={isProfileActive ? { ...navLinkBase, color: '#FF6B4A', fontWeight: 600, fontSize: '12px', padding: '5px 10px' } : { ...navLinkBase, fontSize: '12px', padding: '5px 10px' }}
              onClick={() => handleNavigate('profile')}
            >
              Profile
            </button>
            <button
              style={signOutStyle}
              onClick={logout}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff3b30';
                e.currentTarget.style.color = '#ff3b30';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e5';
                e.currentTarget.style.color = '#86868b';
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Hamburger menu button - mobile */}
          <button
            style={hamburgerStyle}
            className="app-header-hamburger"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={mobileMenuStyle}>
          <div style={mobileMenuHeaderStyle}>
            <div style={logoContainerStyle} onClick={() => handleNavigate('dashboard')}>
              <div style={logoIconStyle}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="3" stroke="white" strokeWidth="2" />
                  <rect x="7" y="8" width="10" height="8" rx="1" fill="white" opacity="0.5" />
                </svg>
              </div>
              <span style={logoTextStyle}>LocalizeShots</span>
            </div>
            <button
              style={{ ...hamburgerStyle, display: 'flex' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div style={mobileMenuLinksStyle}>
            <button
              style={isProjectsActive ? mobileMenuLinkActiveStyle : mobileMenuLinkStyle}
              onClick={() => handleNavigate('dashboard')}
            >
              Projects
            </button>
            <button
              style={isProfileActive ? mobileMenuLinkActiveStyle : mobileMenuLinkStyle}
              onClick={() => handleNavigate('profile')}
            >
              Profile
            </button>
          </div>

          <div style={mobileMenuUserStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  ...planBadgeBase,
                  backgroundColor: plan === 'PRO' ? '#e8f9ed' : '#FFF5F2',
                  color: plan === 'PRO' ? '#248a3d' : '#FF6B4A',
                }}
              >
                {plan}
              </span>
              <span style={{ ...userNameStyle, flex: 1 }}>
                {user?.name || user?.email}
              </span>
            </div>
            <button
              style={{
                ...mobileMenuLinkStyle,
                backgroundColor: '#fff',
                border: '1px solid #ff3b30',
                color: '#ff3b30',
                textAlign: 'center',
              }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
};
