// Common UI components and styles
import React from 'react';

// Color palette
export const colors = {
  primary: '#FF6B4A',
  primaryHover: '#FF8A65',
  primaryLight: '#f0f7ff',
  text: '#1d1d1f',
  textSecondary: '#86868b',
  border: '#d2d2d7',
  borderLight: '#e8e8ed',
  background: '#f5f5f7',
  white: '#ffffff',
  danger: '#ff3b30',
  warning: '#ff9500',
  success: '#34c759'
};

// Card styles
export const cardStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  borderRadius: '16px',
  padding: '20px',
  border: `1px solid ${colors.borderLight}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'box-shadow 0.2s, transform 0.2s'
};

export const cardHoverStyle: React.CSSProperties = {
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
};

// Section header with icon
export const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '16px',
  cursor: 'pointer',
  userSelect: 'none'
};

export const sectionTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: colors.text,
  flex: 1
};

export const sectionIconStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px'
};

// Toggle switch styles
export const toggleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 0'
};

export const toggleSwitchStyle = (checked: boolean): React.CSSProperties => ({
  width: '44px',
  height: '24px',
  backgroundColor: checked ? colors.primary : colors.border,
  borderRadius: '12px',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  flexShrink: 0
});

export const toggleKnobStyle = (checked: boolean): React.CSSProperties => ({
  width: '20px',
  height: '20px',
  backgroundColor: colors.white,
  borderRadius: '50%',
  position: 'absolute',
  top: '2px',
  left: checked ? '22px' : '2px',
  transition: 'left 0.2s',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
});

// Slider styles
export const sliderContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

export const sliderStyle: React.CSSProperties = {
  flex: 1,
  height: '6px',
  borderRadius: '3px',
  appearance: 'none',
  background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} var(--value), ${colors.borderLight} var(--value), ${colors.borderLight} 100%)`,
  cursor: 'pointer',
  outline: 'none'
};

export const sliderValueStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: colors.text,
  minWidth: '50px',
  textAlign: 'right',
  backgroundColor: colors.background,
  padding: '4px 8px',
  borderRadius: '6px'
};

// Button styles
export const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '13px',
  fontWeight: 500,
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  backgroundColor: colors.white,
  color: colors.text,
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px'
};

export const buttonPrimaryStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: colors.primary,
  borderColor: colors.primary,
  color: colors.white
};

export const buttonActiveStyle: React.CSSProperties = {
  backgroundColor: colors.primary,
  borderColor: colors.primary,
  color: colors.white
};

// Segmented control
export const segmentedControlStyle: React.CSSProperties = {
  display: 'flex',
  backgroundColor: colors.background,
  borderRadius: '8px',
  padding: '3px',
  gap: '2px'
};

export const segmentStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 500,
  border: 'none',
  borderRadius: '6px',
  backgroundColor: active ? colors.white : 'transparent',
  color: active ? colors.text : colors.textSecondary,
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
});

// Color picker with preview
export const colorPickerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px',
  border: `1px solid ${colors.borderLight}`,
  borderRadius: '10px',
  backgroundColor: colors.white,
  cursor: 'pointer'
};

export const colorSwatchStyle = (color: string): React.CSSProperties => ({
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  backgroundColor: color,
  border: '2px solid rgba(0, 0, 0, 0.1)',
  flexShrink: 0
});

export const colorInputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  fontSize: '13px',
  fontFamily: 'monospace',
  color: colors.text,
  backgroundColor: 'transparent',
  outline: 'none',
  textTransform: 'uppercase'
};

// Field styles
export const fieldStyle: React.CSSProperties = {
  marginBottom: '16px'
};

export const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: colors.textSecondary,
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.3px'
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: `1px solid ${colors.border}`,
  borderRadius: '10px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: colors.white
};

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2386868b' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px'
};

// Collapse arrow
export const collapseArrowStyle = (collapsed: boolean): React.CSSProperties => ({
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s',
  transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
  color: colors.textSecondary
});

// Grid layouts
export const gridStyle = (columns: number = 2, gap: number = 16): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  gap: `${gap}px`
});

// Divider
export const dividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: colors.borderLight,
  margin: '16px 0'
};
