import React, { useState } from 'react';
import { colors } from '../../styles/common';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'default'
      }}
    >
      {label && (
        <span style={{
          fontSize: '13px',
          color: colors.text,
          fontWeight: 500,
          userSelect: 'none'
        }}>
          {label}
        </span>
      )}
      <div
        style={{
          width: '48px',
          height: '28px',
          backgroundColor: checked ? colors.primary : '#d1d1d6',
          borderRadius: '14px',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered && !disabled
            ? 'inset 0 0 0 1px rgba(0,0,0,0.1)'
            : 'none',
          transform: isPressed ? 'scale(0.98)' : 'scale(1)',
          flexShrink: 0
        } as React.CSSProperties}
        onClick={() => !disabled && onChange(!checked)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
      >
        <div
          style={{
            width: isPressed ? '24px' : '22px',
            height: '22px',
            backgroundColor: colors.white,
            borderRadius: '11px',
            position: 'absolute',
            top: '3px',
            left: checked
              ? (isPressed ? '21px' : '23px')
              : '3px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1)'
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};
