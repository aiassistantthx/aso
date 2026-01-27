import React from 'react';
import { StyleConfig, DeviceSize, DEVICE_SIZES, MockupVisibility, MockupAlignment, Screenshot, ScreenshotStyleOverride, TranslationData, PerLanguageScreenshotStyle } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';

interface Props {
  style: StyleConfig;
  onStyleChange: (style: StyleConfig) => void;
  deviceSize: DeviceSize;
  onDeviceSizeChange: (size: DeviceSize) => void;
  screenshots: Screenshot[];
  selectedIndex: number;
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  onTranslationChange?: (data: TranslationData) => void;
}

const getLanguageName = (code: string): string => {
  const lang = APP_STORE_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
};

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
  // System fonts
  { value: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif', label: 'SF Pro Display' },
  { value: 'Helvetica Neue, Helvetica, Arial, sans-serif', label: 'Helvetica Neue' },
  // Bold/Condensed fonts (like first screenshot)
  { value: 'Bebas Neue, sans-serif', label: 'Bebas Neue (Bold)' },
  { value: 'Anton, sans-serif', label: 'Anton (Bold)' },
  { value: 'Oswald, sans-serif', label: 'Oswald (Condensed)' },
  // Thin/Light fonts (like second screenshot)
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Raleway, sans-serif', label: 'Raleway' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  // Modern sans-serif
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Source Sans 3, sans-serif', label: 'Source Sans' },
  // Serif/Elegant
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Georgia, serif', label: 'Georgia' },
  // Monospace
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
  onDeviceSizeChange,
  screenshots,
  selectedIndex,
  onScreenshotsChange,
  translationData,
  selectedLanguage = 'all',
  onTranslationChange
}) => {
  const selectedScreenshot = screenshots[selectedIndex];
  const styleOverride = selectedScreenshot?.styleOverride;

  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  // Get effective colors (per-screenshot override or global)
  const effectiveTextColor = styleOverride?.textColor ?? style.textColor;
  const effectiveBackgroundColor = styleOverride?.backgroundColor ?? style.backgroundColor;
  const effectiveGradient = styleOverride?.gradient ?? style.gradient;

  const hasOverride = selectedScreenshot && (
    styleOverride?.textColor !== undefined ||
    styleOverride?.backgroundColor !== undefined ||
    styleOverride?.gradient !== undefined
  );

  // Per-language style helpers
  const getPerLangStyle = (): PerLanguageScreenshotStyle => {
    if (!isEditingTranslation) return {};
    return translationData.perLanguageStyles?.[selectedLanguage]?.[selectedIndex] || {};
  };

  const updatePerLangStyle = (updates: Partial<PerLanguageScreenshotStyle>) => {
    if (!translationData || !onTranslationChange || selectedLanguage === 'all') return;

    const newStyles = translationData.perLanguageStyles ? { ...translationData.perLanguageStyles } : {};
    if (!newStyles[selectedLanguage]) {
      newStyles[selectedLanguage] = {};
    }
    newStyles[selectedLanguage][selectedIndex] = {
      ...getPerLangStyle(),
      ...updates
    };
    onTranslationChange({
      ...translationData,
      perLanguageStyles: newStyles
    });
  };

  const resetPerLangStyle = () => {
    if (!translationData || !onTranslationChange) return;
    const newStyles = { ...translationData.perLanguageStyles };
    if (newStyles[selectedLanguage]) {
      delete newStyles[selectedLanguage][selectedIndex];
      if (Object.keys(newStyles[selectedLanguage]).length === 0) {
        delete newStyles[selectedLanguage];
      }
    }
    onTranslationChange({
      ...translationData,
      perLanguageStyles: newStyles
    });
  };

  // Get effective font size (per-language or global)
  const getEffectiveFontSize = (): number => {
    if (isEditingTranslation) {
      return getPerLangStyle().fontSize ?? style.fontSize;
    }
    return style.fontSize;
  };

  const hasPerLangOverride = isEditingTranslation && !!translationData?.perLanguageStyles?.[selectedLanguage]?.[selectedIndex];

  const updateStyle = <K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) => {
    onStyleChange({ ...style, [key]: value });
  };

  const updateGradient = (updates: Partial<StyleConfig['gradient']>) => {
    onStyleChange({
      ...style,
      gradient: { ...style.gradient, ...updates }
    });
  };

  // Update per-screenshot style override
  const updateScreenshotStyle = (updates: Partial<ScreenshotStyleOverride>) => {
    if (!selectedScreenshot) return;

    // For the first screenshot (index 0), update global style
    if (selectedIndex === 0) {
      if (updates.textColor !== undefined) {
        updateStyle('textColor', updates.textColor);
      }
      if (updates.backgroundColor !== undefined) {
        updateStyle('backgroundColor', updates.backgroundColor);
      }
      if (updates.gradient !== undefined) {
        updateGradient(updates.gradient);
      }
      return;
    }

    // For other screenshots, update their styleOverride
    const newScreenshots = screenshots.map((s, i) => {
      if (i !== selectedIndex) return s;
      return {
        ...s,
        styleOverride: {
          ...s.styleOverride,
          ...updates
        }
      };
    });
    onScreenshotsChange(newScreenshots);
  };

  // Update per-screenshot gradient
  const updateScreenshotGradient = (updates: Partial<ScreenshotStyleOverride['gradient']>) => {
    const currentGradient = effectiveGradient;
    updateScreenshotStyle({
      gradient: { ...currentGradient, ...updates } as ScreenshotStyleOverride['gradient']
    });
  };

  // Reset current screenshot to use global style
  const resetToGlobal = () => {
    if (!selectedScreenshot || selectedIndex === 0) return;
    const newScreenshots = screenshots.map((s, i) => {
      if (i !== selectedIndex) return s;
      const { styleOverride: _, ...rest } = s;
      return rest;
    });
    onScreenshotsChange(newScreenshots);
  };

  const gradientBackground = effectiveGradient.enabled
    ? `linear-gradient(${effectiveGradient.angle}deg, ${effectiveGradient.color1}, ${effectiveGradient.color2})`
    : effectiveBackgroundColor;

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

        {style.showMockup && (
          <div style={cssStyles.field as React.CSSProperties}>
            <span style={cssStyles.fieldLabel}>
              Scale
              {isEditingTranslation && getPerLangStyle().mockupScale !== undefined && (
                <span style={{ color: '#0071e3', marginLeft: '4px' }}>(custom)</span>
              )}
            </span>
            <div style={cssStyles.rangeContainer}>
              <input
                type="range"
                min="30"
                max="200"
                value={Math.round((isEditingTranslation ? (getPerLangStyle().mockupScale ?? style.mockupScale ?? 1.0) : (style.mockupScale ?? 1.0)) * 100)}
                onChange={(e) => {
                  const newScale = Number(e.target.value) / 100;
                  if (isEditingTranslation) {
                    updatePerLangStyle({ mockupScale: newScale });
                  } else {
                    updateStyle('mockupScale', newScale);
                  }
                }}
                style={cssStyles.range}
              />
              <span style={cssStyles.rangeValue as React.CSSProperties}>
                {Math.round((isEditingTranslation ? (getPerLangStyle().mockupScale ?? style.mockupScale ?? 1.0) : (style.mockupScale ?? 1.0)) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Background Section */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        Background
        {selectedIndex > 0 && (
          <span style={{ fontWeight: 400, marginLeft: '8px' }}>
            (Screen {selectedIndex + 1})
          </span>
        )}
      </div>

      {hasOverride && selectedIndex > 0 && (
        <button
          onClick={resetToGlobal}
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            border: '1px solid #ff9500',
            borderRadius: '6px',
            backgroundColor: '#fff8e6',
            color: '#996300',
            cursor: 'pointer',
            marginBottom: '12px',
            width: '100%'
          }}
        >
          Reset to global style
        </button>
      )}

      <div style={{ marginBottom: '12px' }}>
        <label style={cssStyles.toggle}>
          <input
            type="checkbox"
            checked={effectiveGradient.enabled}
            onChange={(e) => updateScreenshotGradient({ enabled: e.target.checked })}
            style={cssStyles.checkbox}
          />
          <span style={cssStyles.fieldLabel}>Use Gradient</span>
        </label>
      </div>

      {effectiveGradient.enabled ? (
        <>
          <div style={cssStyles.grid}>
            <div style={cssStyles.field as React.CSSProperties}>
              <span style={cssStyles.fieldLabel}>Color 1</span>
              <input
                type="color"
                value={effectiveGradient.color1}
                onChange={(e) => updateScreenshotGradient({ color1: e.target.value })}
                style={cssStyles.colorInput}
              />
            </div>
            <div style={cssStyles.field as React.CSSProperties}>
              <span style={cssStyles.fieldLabel}>Color 2</span>
              <input
                type="color"
                value={effectiveGradient.color2}
                onChange={(e) => updateScreenshotGradient({ color2: e.target.value })}
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
                value={effectiveGradient.angle}
                onChange={(e) => updateScreenshotGradient({ angle: Number(e.target.value) })}
                style={cssStyles.range}
              />
              <span style={cssStyles.rangeValue as React.CSSProperties}>{effectiveGradient.angle}°</span>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <span style={cssStyles.fieldLabel}>Presets</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateScreenshotGradient({ color1: preset.color1, color2: preset.color2 })}
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
            value={effectiveBackgroundColor}
            onChange={(e) => updateScreenshotStyle({ backgroundColor: e.target.value })}
            style={cssStyles.colorInput}
          />
        </div>
      )}

      {/* Text Section */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        Text
        {isEditingTranslation && (
          <span style={{ fontWeight: 400, fontSize: '11px', color: '#0071e3', marginLeft: '8px' }}>
            ({getLanguageName(selectedLanguage)})
          </span>
        )}
      </div>

      {hasPerLangOverride && (
        <button
          onClick={resetPerLangStyle}
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            border: '1px solid #0071e3',
            borderRadius: '6px',
            backgroundColor: '#f0f7ff',
            color: '#0071e3',
            cursor: 'pointer',
            marginBottom: '12px',
            width: '100%'
          }}
        >
          Reset to global style
        </button>
      )}

      <div style={cssStyles.grid}>
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Text Color</span>
          <input
            type="color"
            value={effectiveTextColor}
            onChange={(e) => updateScreenshotStyle({ textColor: e.target.value })}
            style={cssStyles.colorInput}
          />
        </div>

        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Highlight Color</span>
          <input
            type="color"
            value={style.highlightColor || '#FFE135'}
            onChange={(e) => updateStyle('highlightColor', e.target.value)}
            style={cssStyles.colorInput}
          />
        </div>

        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>
            Font Size
            {isEditingTranslation && getPerLangStyle().fontSize !== undefined && (
              <span style={{ color: '#0071e3', marginLeft: '4px' }}>(custom)</span>
            )}
          </span>
          <div style={cssStyles.rangeContainer}>
            <input
              type="range"
              min="40"
              max="400"
              value={getEffectiveFontSize()}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                if (isEditingTranslation) {
                  updatePerLangStyle({ fontSize: newSize });
                } else {
                  updateStyle('fontSize', newSize);
                }
              }}
              style={cssStyles.range}
            />
            <span style={cssStyles.rangeValue as React.CSSProperties}>{getEffectiveFontSize()}px</span>
          </div>
        </div>

        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Position</span>
          <button
            onClick={() => {
              if (isEditingTranslation) {
                updatePerLangStyle({ textOffset: { x: 0, y: getPerLangStyle().textOffset?.y ?? style.textOffset.y } });
              } else {
                updateStyle('textOffset', { ...style.textOffset, x: 0 });
              }
            }}
            style={{
              ...cssStyles.button,
              width: '100%'
            }}
          >
            Center Horizontally
          </button>
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
