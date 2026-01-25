import React from 'react';
import { StyleConfig, DeviceSize, DEVICE_SIZES } from '../types';

interface Props {
  style: StyleConfig;
  onStyleChange: (style: StyleConfig) => void;
  deviceSize: DeviceSize;
  onDeviceSizeChange: (size: DeviceSize) => void;
}

const cssStyles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#86868b'
  },
  input: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    outline: 'none'
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  colorInput: {
    width: '100%',
    height: '40px',
    padding: '4px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  rangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  range: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    backgroundColor: '#d2d2d7',
    cursor: 'pointer'
  },
  rangeValue: {
    fontSize: '12px',
    color: '#86868b',
    minWidth: '40px',
    textAlign: 'right'
  },
  buttonGroup: {
    display: 'flex',
    gap: '4px'
  },
  button: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '12px',
    border: '1px solid #d2d2d7',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  buttonActive: {
    backgroundColor: '#0071e3',
    borderColor: '#0071e3',
    color: '#fff'
  }
};

const FONT_OPTIONS = [
  { value: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif', label: 'SF Pro Display' },
  { value: 'Helvetica Neue, Helvetica, Arial, sans-serif', label: 'Helvetica Neue' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Menlo, monospace', label: 'Menlo' }
];

export const StyleEditor: React.FC<Props> = ({
  style,
  onStyleChange,
  deviceSize,
  onDeviceSizeChange
}) => {
  const updateStyle = <K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) => {
    onStyleChange({ ...style, [key]: value });
  };

  return (
    <div style={cssStyles.container}>
      <label style={cssStyles.label}>Style Settings</label>

      <div style={cssStyles.grid}>
        {/* Device Size */}
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Device Size</span>
          <select
            value={deviceSize}
            onChange={(e) => onDeviceSizeChange(e.target.value as DeviceSize)}
            style={cssStyles.select}
          >
            {(Object.keys(DEVICE_SIZES) as DeviceSize[]).map((size) => (
              <option key={size} value={size}>
                {DEVICE_SIZES[size].name}
              </option>
            ))}
          </select>
        </div>

        {/* Font */}
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Font Family</span>
          <select
            value={style.fontFamily}
            onChange={(e) => updateStyle('fontFamily', e.target.value)}
            style={cssStyles.select}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Background Color */}
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Background Color</span>
          <input
            type="color"
            value={style.backgroundColor}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            style={cssStyles.colorInput}
          />
        </div>

        {/* Text Color */}
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Text Color</span>
          <input
            type="color"
            value={style.textColor}
            onChange={(e) => updateStyle('textColor', e.target.value)}
            style={cssStyles.colorInput}
          />
        </div>

        {/* Font Size */}
        <div style={{ ...cssStyles.field as React.CSSProperties, gridColumn: '1 / -1' }}>
          <span style={cssStyles.fieldLabel}>Font Size</span>
          <div style={cssStyles.rangeContainer}>
            <input
              type="range"
              min="40"
              max="120"
              value={style.fontSize}
              onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
              style={cssStyles.range}
            />
            <span style={cssStyles.rangeValue as React.CSSProperties}>{style.fontSize}px</span>
          </div>
        </div>

        {/* Text Position */}
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Text Position</span>
          <div style={cssStyles.buttonGroup}>
            <button
              style={{
                ...cssStyles.button,
                ...(style.textPosition === 'top' ? cssStyles.buttonActive : {})
              }}
              onClick={() => updateStyle('textPosition', 'top')}
            >
              Top
            </button>
            <button
              style={{
                ...cssStyles.button,
                ...(style.textPosition === 'bottom' ? cssStyles.buttonActive : {})
              }}
              onClick={() => updateStyle('textPosition', 'bottom')}
            >
              Bottom
            </button>
          </div>
        </div>

        {/* Text Align */}
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Text Alignment</span>
          <div style={cssStyles.buttonGroup}>
            <button
              style={{
                ...cssStyles.button,
                ...(style.textAlign === 'left' ? cssStyles.buttonActive : {})
              }}
              onClick={() => updateStyle('textAlign', 'left')}
            >
              Left
            </button>
            <button
              style={{
                ...cssStyles.button,
                ...(style.textAlign === 'center' ? cssStyles.buttonActive : {})
              }}
              onClick={() => updateStyle('textAlign', 'center')}
            >
              Center
            </button>
            <button
              style={{
                ...cssStyles.button,
                ...(style.textAlign === 'right' ? cssStyles.buttonActive : {})
              }}
              onClick={() => updateStyle('textAlign', 'right')}
            >
              Right
            </button>
          </div>
        </div>

        {/* Padding Top */}
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Padding Top</span>
          <div style={cssStyles.rangeContainer}>
            <input
              type="range"
              min="20"
              max="200"
              value={style.paddingTop}
              onChange={(e) => updateStyle('paddingTop', Number(e.target.value))}
              style={cssStyles.range}
            />
            <span style={cssStyles.rangeValue as React.CSSProperties}>{style.paddingTop}px</span>
          </div>
        </div>

        {/* Padding Bottom */}
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Padding Bottom</span>
          <div style={cssStyles.rangeContainer}>
            <input
              type="range"
              min="20"
              max="200"
              value={style.paddingBottom}
              onChange={(e) => updateStyle('paddingBottom', Number(e.target.value))}
              style={cssStyles.range}
            />
            <span style={cssStyles.rangeValue as React.CSSProperties}>{style.paddingBottom}px</span>
          </div>
        </div>
      </div>
    </div>
  );
};
