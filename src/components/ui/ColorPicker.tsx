import React, { useRef, useState } from 'react';
import { colors } from '../../styles/common';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <span style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 500,
          color: colors.textSecondary,
          marginBottom: '8px'
        }}>
          {label}
        </span>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          border: `1px solid ${isFocused ? colors.primary : isHovered ? colors.border : colors.borderLight}`,
          borderRadius: '10px',
          backgroundColor: colors.white,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isFocused
            ? `0 0 0 3px rgba(0, 113, 227, 0.1)`
            : isHovered
              ? '0 2px 8px rgba(0, 0, 0, 0.06)'
              : 'none'
        }}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: value,
            border: '2px solid rgba(0, 0, 0, 0.08)',
            boxShadow: `inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset`,
            flexShrink: 0,
            transition: 'transform 0.15s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <span style={{
          flex: 1,
          fontSize: '13px',
          fontFamily: 'SF Mono, Monaco, Consolas, monospace',
          color: colors.text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {value}
        </span>
        <div style={{
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textSecondary,
          opacity: isHovered ? 1 : 0.5,
          transition: 'opacity 0.2s ease'
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M10.5 1.5l-9 9M1.5 1.5l9 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '0',
            height: '0',
            padding: '0',
            border: 'none',
            visibility: 'hidden',
            position: 'absolute'
          }}
        />
      </div>
    </div>
  );
};
