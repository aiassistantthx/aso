import React, { useState, useRef, useEffect } from 'react';
import { colors } from '../../styles/common';

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  label
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const activeIndex = options.findIndex(opt => opt.value === value);
    const buttons = containerRef.current.querySelectorAll('button');
    if (buttons[activeIndex]) {
      const btn = buttons[activeIndex] as HTMLElement;
      setIndicatorStyle({
        left: btn.offsetLeft,
        width: btn.offsetWidth
      });
    }
  }, [value, options]);

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
        ref={containerRef}
        style={{
          display: 'flex',
          backgroundColor: colors.background,
          borderRadius: '10px',
          padding: '4px',
          gap: '2px',
          position: 'relative'
        }}
      >
        {/* Animated background indicator */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            height: 'calc(100% - 8px)',
            backgroundColor: colors.white,
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none'
          }}
        />
        {options.map((option, index) => {
          const isActive = value === option.value;
          const isHovered = hoveredIndex === index;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: isActive ? colors.text : isHovered ? colors.text : colors.textSecondary,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                position: 'relative',
                zIndex: 1
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
