import React from 'react';
import { StyleConfig, DeviceSize, DEVICE_SIZES, MockupVisibility, MockupAlignment } from '../types';

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
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '16px',
    marginBottom: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e8e8ed'
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
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  gradientPreview: {
    height: '40px',
    borderRadius: '8px',
    border: '1px solid #d2d2d7',
    marginTop: '8px'
  }
};

const FONT_OPTIONS = [
  { value: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif', label: 'SF Pro Display' },
  { value: 'Helvetica Neue, Helvetica, Arial, sans-serif', label: 'Helvetica Neue' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Menlo, monospace', label: 'Menlo' }
];

const GRADIENT_PRESETS = [
  { name: 'Purple Blue', color1: '#667eea', color2: '#764ba2' },
  { name: 'Orange Red', color1: '#f093fb', color2: '#f5576c' },
  { name: 'Green Teal', color1: '#4facfe', color2: '#00f2fe' },
  { name: 'Pink Orange', color1: '#fa709a', color2: '#fee140' },
  { name: 'Blue Purple', color1: '#a18cd1', color2: '#fbc2eb' },
  { name: 'Dark', color1: '#0f0c29', color2: '#302b63' }
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

  const updateGradient = (updates: Partial<StyleConfig['gradient']>) => {
    onStyleChange({
      ...style,
      gradient: { ...style.gradient, ...updates }
    });
  };

  const gradientBackground = style.gradient.enabled
    ? `linear-gradient(${style.gradient.angle}deg, ${style.gradient.color1}, ${style.gradient.color2})`
    : style.backgroundColor;

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
      </div>

      {/* Mockup Section */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>iPhone Mockup</div>
      <div style={cssStyles.grid}>
        <div style={cssStyles.field as React.CSSProperties}>
          <label style={cssStyles.toggle}>
            <input
              type="checkbox"
              checked={style.showMockup}
              onChange={(e) => updateStyle('showMockup', e.target.checked)}
              style={cssStyles.checkbox}
            />
            <span style={cssStyles.fieldLabel}>Show iPhone Frame</span>
          </label>
        </div>

        {style.showMockup && (
          <div style={cssStyles.field as React.CSSProperties}>
            <span style={cssStyles.fieldLabel}>Frame Color</span>
            <div style={cssStyles.buttonGroup}>
              {(['black', 'white', 'natural'] as const).map((color) => (
                <button
                  key={color}
                  style={{
                    ...cssStyles.button,
                    ...(style.mockupColor === color ? cssStyles.buttonActive : {})
                  }}
                  onClick={() => updateStyle('mockupColor', color)}
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {style.showMockup && (
          <div style={cssStyles.field as React.CSSProperties}>
            <span style={cssStyles.fieldLabel}>Visibility</span>
            <div style={cssStyles.buttonGroup}>
              {([
                { value: 'full', label: 'Full' },
                { value: '2/3', label: '2/3' },
                { value: '1/2', label: '1/2' }
              ] as { value: MockupVisibility; label: string }[]).map((v) => (
                <button
                  key={v.value}
                  style={{
                    ...cssStyles.button,
                    ...(style.mockupVisibility === v.value ? cssStyles.buttonActive : {})
                  }}
                  onClick={() => updateStyle('mockupVisibility', v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {style.showMockup && (
          <div style={cssStyles.field as React.CSSProperties}>
            <span style={cssStyles.fieldLabel}>Alignment</span>
            <div style={cssStyles.buttonGroup}>
              {([
                { value: 'top', label: 'Top' },
                { value: 'center', label: 'Center' },
                { value: 'bottom', label: 'Bottom' }
              ] as { value: MockupAlignment; label: string }[]).map((a) => (
                <button
                  key={a.value}
                  style={{
                    ...cssStyles.button,
                    ...(style.mockupAlignment === a.value ? cssStyles.buttonActive : {})
                  }}
                  onClick={() => updateStyle('mockupAlignment', a.value)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background Section */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>Background</div>

      <div style={{ marginBottom: '12px' }}>
        <label style={cssStyles.toggle}>
          <input
            type="checkbox"
            checked={style.gradient.enabled}
            onChange={(e) => updateGradient({ enabled: e.target.checked })}
            style={cssStyles.checkbox}
          />
          <span style={cssStyles.fieldLabel}>Use Gradient</span>
        </label>
      </div>

      {style.gradient.enabled ? (
        <>
          <div style={cssStyles.grid}>
            <div style={cssStyles.field as React.CSSProperties}>
              <span style={cssStyles.fieldLabel}>Color 1</span>
              <input
                type="color"
                value={style.gradient.color1}
                onChange={(e) => updateGradient({ color1: e.target.value })}
                style={cssStyles.colorInput}
              />
            </div>
            <div style={cssStyles.field as React.CSSProperties}>
              <span style={cssStyles.fieldLabel}>Color 2</span>
              <input
                type="color"
                value={style.gradient.color2}
                onChange={(e) => updateGradient({ color2: e.target.value })}
                style={cssStyles.colorInput}
              />
            </div>
          </div>

          <div style={{ ...cssStyles.field as React.CSSProperties, marginTop: '12px' }}>
            <span style={cssStyles.fieldLabel}>Angle</span>
            <div style={cssStyles.rangeContainer}>
              <input
                type="range"
                min="0"
                max="360"
                value={style.gradient.angle}
                onChange={(e) => updateGradient({ angle: Number(e.target.value) })}
                style={cssStyles.range}
              />
              <span style={cssStyles.rangeValue as React.CSSProperties}>{style.gradient.angle}°</span>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <span style={cssStyles.fieldLabel}>Presets</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateGradient({ color1: preset.color1, color2: preset.color2 })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '2px solid #fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              ...cssStyles.gradientPreview,
              background: gradientBackground
            }}
          />
        </>
      ) : (
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Background Color</span>
          <input
            type="color"
            value={style.backgroundColor}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            style={cssStyles.colorInput}
          />
        </div>
      )}

      {/* Text Section */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>Text</div>

      <div style={cssStyles.grid}>
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Text Color</span>
          <input
            type="color"
            value={style.textColor}
            onChange={(e) => updateStyle('textColor', e.target.value)}
            style={cssStyles.colorInput}
          />
        </div>

        <div style={cssStyles.field as React.CSSProperties}>
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
