import React, { useState } from 'react';
import { colors } from '../../styles/common';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  step?: number;
  compact?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  onChange,
  label,
  unit = '',
  step = 1,
  compact
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const [isDragging, setIsDragging] = useState(false);

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '50px' }}>
        {label && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', fontWeight: 500, color: colors.textSecondary }}>{label}</span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: colors.text }}>{value}{unit}</span>
          </div>
        )}
        <div style={{ position: 'relative', height: '14px', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', borderRadius: '2px', backgroundColor: colors.borderLight, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percentage}%`, background: colors.primary, borderRadius: '2px' }} />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ width: '100%', height: '14px', appearance: 'none', background: 'transparent', cursor: 'pointer', position: 'relative', zIndex: 1, margin: 0 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: colors.textSecondary,
            transition: 'color 0.2s ease'
          }}>
            {label}
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: isDragging ? colors.primary : colors.text,
            backgroundColor: isDragging ? colors.primaryLight : colors.background,
            padding: '4px 12px',
            borderRadius: '6px',
            minWidth: '54px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            transform: isDragging ? 'scale(1.05)' : 'scale(1)'
          }}>
            {value}{unit}
          </span>
        </div>
      )}
      <div
        style={{
          position: 'relative',
          height: '20px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Track background */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '6px',
          borderRadius: '3px',
          backgroundColor: colors.borderLight,
          overflow: 'hidden'
        }}>
          {/* Filled track */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${colors.primary} 0%, #4a9eff 100%)`,
            borderRadius: '3px',
            transition: isDragging ? 'none' : 'width 0.1s ease'
          }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          style={{
            width: '100%',
            height: '20px',
            appearance: 'none',
            background: 'transparent',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
            margin: 0
          }}
        />
      </div>
    </div>
  );
};
