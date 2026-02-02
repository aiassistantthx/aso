import React from 'react';
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
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
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
  backgroundColor: 'rgba(0, 113, 227, 0.08)',
  color: '#0071e3',
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

export const AppHeader: React.FC<AppHeaderProps> = ({ currentPage, onNavigate, rightContent }) => {
  const { user, logout } = useAuth();
  const plan = user?.plan ?? 'FREE';

  const isProjectsActive = currentPage === 'dashboard' || currentPage === 'editor';
  const isProfileActive = currentPage === 'profile';

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        {/* Logo */}
        <div style={logoContainerStyle} onClick={() => onNavigate('dashboard')}>
          <div style={logoIconStyle}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="white" strokeWidth="2" />
              <rect x="7" y="8" width="10" height="8" rx="1" fill="white" opacity="0.5" />
            </svg>
          </div>
          <span style={logoTextStyle}>Screenshot Studio</span>
        </div>

        {/* Navigation */}
        <nav style={navStyle}>
          <button
            style={isProjectsActive ? navLinkActive : navLinkBase}
            onClick={() => onNavigate('dashboard')}
          >
            Projects
          </button>
          <button
            style={currentPage === 'wizard' ? navLinkActive : navLinkBase}
            onClick={() => onNavigate('wizard')}
          >
            Wizard
          </button>
          <button
            style={currentPage === 'metadata' ? navLinkActive : navLinkBase}
            onClick={() => onNavigate('metadata')}
          >
            ASO Texts
          </button>
        </nav>

        {/* Page-specific right content */}
        {rightContent && (
          <>
            <div style={separatorStyle} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              {rightContent}
            </div>
          </>
        )}

        {/* User section */}
        <div style={rightSectionStyle}>
          <div style={separatorStyle} />
          <span
            style={{
              ...planBadgeBase,
              backgroundColor: plan === 'PRO' ? '#e8f9ed' : '#f0f7ff',
              color: plan === 'PRO' ? '#248a3d' : '#0071e3',
            }}
          >
            {plan}
          </span>
          <span style={userNameStyle}>
            {user?.name || user?.email}
          </span>
          <button
            style={isProfileActive ? { ...navLinkBase, color: '#0071e3', fontWeight: 600, fontSize: '12px', padding: '5px 10px' } : { ...navLinkBase, fontSize: '12px', padding: '5px 10px' }}
            onClick={() => onNavigate('profile')}
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
      </div>
    </header>
  );
};
