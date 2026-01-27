import React, { useState } from 'react';
import { colors } from '../../styles/common';

interface SectionProps {
  title: string;
  icon: string;
  iconBg?: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  badge?: string;
  badgeColor?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  icon,
  iconBg = colors.background,
  children,
  defaultCollapsed = false,
  badge,
  badgeColor = colors.primary
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 8px',
          margin: '0 -8px',
          borderRadius: '10px',
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
          transition: 'background-color 0.2s ease'
        }}
        onClick={() => setCollapsed(!collapsed)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          {icon}
        </div>
        <span style={{
          flex: 1,
          fontSize: '15px',
          fontWeight: 600,
          color: colors.text,
          letterSpacing: '-0.2px'
        }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: badgeColor,
            backgroundColor: `${badgeColor}15`,
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            {badge}
          </span>
        )}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
            }}
          >
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke={colors.textSecondary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {!collapsed && (
        <div style={{
          paddingTop: '14px',
          paddingBottom: '8px',
          borderTop: `1px solid ${colors.borderLight}`,
          marginTop: '4px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};
