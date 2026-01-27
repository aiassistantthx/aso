import React, { useState } from 'react';
import { colors } from '../../styles/common';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  iconBg?: string;
  noPadding?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  iconBg = colors.background,
  noPadding = false,
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '18px',
        border: `1px solid rgba(0, 0, 0, 0.06)`,
        boxShadow: isHovered
          ? '0 8px 28px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)'
          : '0 2px 12px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {title && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px 22px',
            borderBottom: collapsed ? 'none' : `1px solid rgba(0, 0, 0, 0.06)`,
            cursor: collapsible ? 'pointer' : 'default',
            userSelect: 'none',
            backgroundColor: isHeaderHovered && collapsible ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
            transition: 'background-color 0.2s ease'
          }}
          onClick={() => collapsible && setCollapsed(!collapsed)}
          onMouseEnter={() => setIsHeaderHovered(true)}
          onMouseLeave={() => setIsHeaderHovered(false)}
        >
          {icon && (
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
                transition: 'transform 0.2s ease',
                transform: isHeaderHovered && collapsible ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {icon}
            </div>
          )}
          <span style={{
            flex: 1,
            fontSize: '16px',
            fontWeight: 600,
            color: colors.text,
            letterSpacing: '-0.2px'
          }}>
            {title}
          </span>
          {collapsible && (
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: isHeaderHovered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
                }}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke={colors.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      )}
      {!collapsed && (
        <div style={{
          padding: noPadding ? 0 : '22px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};
