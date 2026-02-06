import React, { useState } from 'react';
import { colors } from '../../styles/common';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  compact?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled, compact }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const size = compact ? { width: 36, height: 20, knob: 16, padding: 2 } : { width: 48, height: 28, knob: 22, padding: 3 };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: compact ? '6px' : '8px',
        padding: compact ? '2px 0' : '8px 0',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'default'
      }}
    >
      {label && (
        <span style={{
          fontSize: compact ? '10px' : '13px',
          color: colors.text,
          fontWeight: 500,
          userSelect: 'none'
        }}>
          {label}
        </span>
      )}
      <div
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          backgroundColor: checked ? colors.primary : '#d1d1d6',
          borderRadius: `${size.height / 2}px`,
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered && !disabled ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none',
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
            width: `${isPressed ? size.knob + 2 : size.knob}px`,
            height: `${size.knob}px`,
            backgroundColor: colors.white,
            borderRadius: `${size.knob / 2}px`,
            position: 'absolute',
            top: `${size.padding}px`,
            left: checked ? `${size.width - size.knob - size.padding - (isPressed ? 2 : 0)}px` : `${size.padding}px`,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1)'
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};
