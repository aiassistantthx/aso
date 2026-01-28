import React from 'react';
import { StyleConfig, DeviceSize, DEVICE_SIZES, MockupVisibility, MockupAlignment, Screenshot, ScreenshotStyleOverride, TranslationData, PerLanguageScreenshotStyle, MockupContinuation, Template, StarRatingDecoration, LaurelDecoration } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';
import { Toggle, Slider, ColorPicker, SegmentedControl } from './ui';
import { colors } from '../styles/common';
import { TEMPLATES } from '../constants/templates';

// Default decorations
const createDefaultStars = (deviceSize: DeviceSize): StarRatingDecoration => {
  const dimensions = DEVICE_SIZES[deviceSize];
  return {
    type: 'stars',
    enabled: true,
    count: 5,
    size: 120,
    color: '#FFD700',
    position: { x: dimensions.width / 2, y: dimensions.height * 0.15 }
  };
};

const createDefaultLaurel = (deviceSize: DeviceSize): LaurelDecoration => {
  const dimensions = DEVICE_SIZES[deviceSize];
  return {
    type: 'laurel',
    enabled: true,
    size: 1.5,
    color: '#E91E8B',
    position: { x: dimensions.width / 2, y: dimensions.height * 0.5 },
    textBlocks: [
      { text: 'You need only', size: 60, bold: false },
      { text: '1', size: 200, bold: true },
      { text: 'App to create|Viral Video', size: 50, bold: false }
    ],
    textColor: '#000000',
    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
  };
};

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
    marginBottom: '0'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '16px'
  },
  labelIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '20px',
    marginBottom: '12px',
    paddingTop: '16px',
    borderTop: `1px solid ${colors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: colors.textSecondary
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '10px',
    outline: 'none',
    backgroundColor: colors.white,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2386868b' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px'
  },
  colorInput: {
    width: '100%',
    height: '40px',
    padding: '4px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '10px',
    cursor: 'pointer'
  },
  rangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  range: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    backgroundColor: colors.borderLight,
    cursor: 'pointer'
  },
  rangeValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: colors.text,
    minWidth: '50px',
    textAlign: 'center',
    backgroundColor: colors.background,
    padding: '4px 8px',
    borderRadius: '6px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '4px',
    backgroundColor: colors.background,
    borderRadius: '10px',
    padding: '4px'
  },
  button: {
    flex: 1,
    padding: '8px 10px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  buttonActive: {
    backgroundColor: colors.white,
    color: colors.text,
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
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
    height: '48px',
    borderRadius: '12px',
    border: `1px solid ${colors.borderLight}`,
    marginTop: '12px',
    boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.08)'
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

  const applyTemplate = (template: Template) => {
    // Update global style with template settings
    onStyleChange({
      ...style,
      backgroundColor: template.backgroundColor,
      gradient: template.gradient,
      textColor: template.textColor,
      fontFamily: template.fontFamily,
      fontSize: template.fontSize,
      textAlign: template.textAlign,
      paddingTop: template.paddingTop,
      paddingBottom: template.paddingBottom,
      mockupColor: template.mockupColor,
      mockupScale: template.mockupScale,
      highlightColor: template.highlightColor,
      pattern: template.pattern
    });

    // Clear all per-screenshot style overrides so template applies uniformly
    const newScreenshots = screenshots.map(s => {
      const { styleOverride: _, ...rest } = s;
      return rest;
    });
    onScreenshotsChange(newScreenshots);
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
      <label style={cssStyles.label}>
        <div style={{ ...cssStyles.labelIcon, backgroundColor: '#f0e6ff' } as React.CSSProperties}>🎨</div>
        Style Settings
      </label>

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
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        <span>📱</span> iPhone Mockup
      </div>

      <Toggle
        label="Show iPhone Frame"
        checked={style.showMockup}
        onChange={(checked) => updateStyle('showMockup', checked)}
      />

      <div style={{ ...cssStyles.grid, marginTop: '12px' }}>

        {style.showMockup && (
          <SegmentedControl
            label="Frame Color"
            options={[
              { value: 'black', label: 'Black' },
              { value: 'white', label: 'White' },
              { value: 'natural', label: 'Natural' }
            ]}
            value={style.mockupColor}
            onChange={(value) => updateStyle('mockupColor', value as 'black' | 'white' | 'natural')}
          />
        )}


        {style.showMockup && (
          <SegmentedControl
            label="Visibility"
            options={[
              { value: 'full', label: 'Full' },
              { value: '2/3', label: '2/3' },
              { value: '1/2', label: '1/2' }
            ]}
            value={style.mockupVisibility}
            onChange={(value) => updateStyle('mockupVisibility', value as MockupVisibility)}
          />
        )}

        {style.showMockup && (
          <SegmentedControl
            label="Alignment"
            options={[
              { value: 'top', label: 'Top' },
              { value: 'center', label: 'Center' },
              { value: 'bottom', label: 'Bottom' }
            ]}
            value={style.mockupAlignment}
            onChange={(value) => updateStyle('mockupAlignment', value as MockupAlignment)}
          />
        )}

        {style.showMockup && (
          <Slider
            label={`Scale${isEditingTranslation && getPerLangStyle().mockupScale !== undefined ? ' (custom)' : ''}`}
            min={30}
            max={200}
            value={Math.round((isEditingTranslation ? (getPerLangStyle().mockupScale ?? style.mockupScale ?? 1.0) : (style.mockupScale ?? 1.0)) * 100)}
            onChange={(value) => {
              const newScale = value / 100;
              if (isEditingTranslation) {
                updatePerLangStyle({ mockupScale: newScale });
              } else {
                updateStyle('mockupScale', newScale);
              }
            }}
            unit="%"
          />
        )}
      </div>

      {/* Rotation Control */}
      {style.showMockup && (
        <div style={{ marginTop: '12px' }}>
          <Slider
            label="Rotation"
            min={-45}
            max={45}
            value={style.mockupRotation ?? 0}
            onChange={(value) => updateStyle('mockupRotation', value)}
            unit="°"
          />
          {style.mockupRotation !== 0 && (
            <button
              onClick={() => updateStyle('mockupRotation', 0)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 500,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: '8px',
                backgroundColor: colors.background,
                color: colors.textSecondary,
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Reset Rotation
            </button>
          )}
        </div>
      )}

      {/* Mockup Continuation - Split across screens */}
      {style.showMockup && screenshots.length > 1 && (
        <div style={{ marginTop: '16px' }}>
          <span style={{ ...cssStyles.fieldLabel, display: 'block', marginBottom: '8px' }}>
            Mockup Position
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { value: 'none', label: 'Center', icon: '⬜' },
              { value: 'left-start', label: 'Right →', icon: '▶' },
              { value: 'right-start', label: '← Left', icon: '◀' }
            ].map((opt) => {
              const currentContinuation = selectedScreenshot?.mockupContinuation ?? style.mockupContinuation ?? 'none';
              const isActive = currentContinuation === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    // Update per-screenshot mockupContinuation
                    if (selectedScreenshot) {
                      const newScreenshots = screenshots.map((s, i) =>
                        i === selectedIndex
                          ? { ...s, mockupContinuation: opt.value as MockupContinuation }
                          : s
                      );
                      onScreenshotsChange(newScreenshots);
                    }
                  }}
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 500,
                    border: `2px solid ${isActive ? colors.primary : colors.borderLight}`,
                    borderRadius: '8px',
                    backgroundColor: isActive ? colors.primaryLight : colors.white,
                    color: isActive ? colors.primary : colors.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{opt.icon}</span> {opt.label}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '6px' }}>
            Position mockup for screen {selectedIndex + 1}
          </p>

          {/* Linked Screenshot for continuation */}
          {selectedScreenshot && (
            <div style={{ marginTop: '12px' }}>
              <span style={{ ...cssStyles.fieldLabel, display: 'block', marginBottom: '8px' }}>
                Screenshot in Mockup
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {screenshots.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const newScreenshots = screenshots.map((ss, i) =>
                        i === selectedIndex
                          ? { ...ss, linkedMockupIndex: idx === selectedIndex ? undefined : idx }
                          : ss
                      );
                      onScreenshotsChange(newScreenshots);
                    }}
                    style={{
                      width: '36px',
                      height: '60px',
                      borderRadius: '6px',
                      border: `2px solid ${(selectedScreenshot.linkedMockupIndex === idx || (selectedScreenshot.linkedMockupIndex === undefined && idx === selectedIndex)) ? colors.primary : colors.borderLight}`,
                      padding: '2px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      backgroundColor: colors.white,
                      transition: 'all 0.2s'
                    }}
                    title={`Use screenshot ${idx + 1} in mockup`}
                  >
                    {s.preview ? (
                      <img
                        src={s.preview}
                        alt={`Screen ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: colors.background,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: colors.textSecondary
                      }}>
                        {idx + 1}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '6px' }}>
                Select which screenshot to show inside the mockup
              </p>
            </div>
          )}
        </div>
      )}

      {/* Background Section */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        <span>🎨</span> Background
        {selectedIndex > 0 && (
          <span style={{ fontWeight: 400, fontSize: '11px', color: colors.primary }}>
            Screen {selectedIndex + 1}
          </span>
        )}
      </div>

      {hasOverride && selectedIndex > 0 && (
        <button
          onClick={resetToGlobal}
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 500,
            border: `1px solid ${colors.warning}`,
            borderRadius: '10px',
            backgroundColor: '#fff8e6',
            color: '#996300',
            cursor: 'pointer',
            marginBottom: '12px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>↩️</span> Reset to global style
        </button>
      )}

      <Toggle
        label="Use Gradient"
        checked={effectiveGradient.enabled}
        onChange={(checked) => updateScreenshotGradient({ enabled: checked })}
      />

      {effectiveGradient.enabled ? (
        <>
          <div style={{ ...cssStyles.grid, marginTop: '12px' }}>
            <ColorPicker
              label="Color 1"
              value={effectiveGradient.color1}
              onChange={(color) => updateScreenshotGradient({ color1: color })}
            />
            <ColorPicker
              label="Color 2"
              value={effectiveGradient.color2}
              onChange={(color) => updateScreenshotGradient({ color2: color })}
            />
          </div>

          <Slider
            label="Angle"
            min={0}
            max={360}
            value={effectiveGradient.angle}
            onChange={(value) => updateScreenshotGradient({ angle: value })}
            unit="°"
          />

          <div
            style={{
              ...cssStyles.gradientPreview,
              background: gradientBackground
            }}
          />
        </>
      ) : (
        <div style={{ marginTop: '12px' }}>
          <ColorPicker
            label="Background Color"
            value={effectiveBackgroundColor}
            onChange={(color) => updateScreenshotStyle({ backgroundColor: color })}
          />
        </div>
      )}

      {/* Templates Section */}
      <div style={{ marginTop: '16px' }}>
        <span style={cssStyles.fieldLabel}>Templates</span>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          {TEMPLATES.map((template) => {
            const background = template.gradient.enabled
              ? `linear-gradient(${template.gradient.angle}deg, ${template.gradient.color1}, ${template.gradient.color2})`
              : template.backgroundColor;
            return (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '2px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), inset 0 0 0 2px #fff',
                  cursor: 'pointer',
                  background,
                  transition: 'transform 0.2s'
                }}
                title={template.name}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            );
          })}
        </div>
      </div>

      {/* Text Section */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        <span>✏️</span> Text
        {isEditingTranslation && (
          <span style={{ fontWeight: 400, fontSize: '11px', color: colors.primary }}>
            {getLanguageName(selectedLanguage)}
          </span>
        )}
      </div>

      {hasPerLangOverride && (
        <button
          onClick={resetPerLangStyle}
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 500,
            border: `1px solid ${colors.primary}`,
            borderRadius: '10px',
            backgroundColor: colors.primaryLight,
            color: colors.primary,
            cursor: 'pointer',
            marginBottom: '12px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>↩️</span> Reset to global style
        </button>
      )}

      <div style={cssStyles.grid}>
        <ColorPicker
          label="Text Color"
          value={effectiveTextColor}
          onChange={(color) => updateScreenshotStyle({ textColor: color })}
        />

        <ColorPicker
          label="Highlight Color"
          value={style.highlightColor || '#FFE135'}
          onChange={(color) => updateStyle('highlightColor', color)}
        />
      </div>

      <Slider
        label={`Font Size${isEditingTranslation && getPerLangStyle().fontSize !== undefined ? ' (custom)' : ''}`}
        min={40}
        max={400}
        value={getEffectiveFontSize()}
        onChange={(value) => {
          if (isEditingTranslation) {
            updatePerLangStyle({ fontSize: value });
          } else {
            updateStyle('fontSize', value);
          }
        }}
        unit="px"
      />

      <button
        onClick={() => {
          if (isEditingTranslation) {
            updatePerLangStyle({ textOffset: { x: 0, y: getPerLangStyle().textOffset?.y ?? style.textOffset.y } });
          } else {
            updateStyle('textOffset', { ...style.textOffset, x: 0 });
          }
        }}
        style={{
          width: '100%',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 500,
          border: `1px solid ${colors.borderLight}`,
          borderRadius: '10px',
          backgroundColor: colors.white,
          color: colors.text,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '12px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
      >
        <span>↔️</span> Center Horizontally
      </button>

      <div style={cssStyles.grid}>
        <Slider
          label="Padding Top"
          min={20}
          max={200}
          value={style.paddingTop}
          onChange={(value) => updateStyle('paddingTop', value)}
          unit="px"
        />

        <Slider
          label="Padding Bottom"
          min={20}
          max={200}
          value={style.paddingBottom}
          onChange={(value) => updateStyle('paddingBottom', value)}
          unit="px"
        />
      </div>

      {/* Decorations Section */}
      {selectedScreenshot && (
        <>
          <div style={cssStyles.sectionTitle as React.CSSProperties}>
            <span>✨</span> Decorations
            <span style={{ fontWeight: 400, fontSize: '11px', color: colors.textSecondary }}>
              Screen {selectedIndex + 1}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                const decorations = selectedScreenshot.decorations || [];
                const newDecoration = createDefaultStars(deviceSize);
                const newScreenshots = screenshots.map((s, i) =>
                  i === selectedIndex ? { ...s, decorations: [...decorations, newDecoration] } : s
                );
                onScreenshotsChange(newScreenshots);
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 500,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: '10px',
                backgroundColor: colors.white,
                color: colors.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
            >
              <span>⭐</span> Add Stars
            </button>
            <button
              onClick={() => {
                const decorations = selectedScreenshot.decorations || [];
                const newDecoration = createDefaultLaurel(deviceSize);
                const newScreenshots = screenshots.map((s, i) =>
                  i === selectedIndex ? { ...s, decorations: [...decorations, newDecoration] } : s
                );
                onScreenshotsChange(newScreenshots);
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 500,
                border: `1px solid ${colors.borderLight}`,
                borderRadius: '10px',
                backgroundColor: colors.white,
                color: colors.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.white}
            >
              <span>🏆</span> Add Laurel
            </button>
          </div>

          {/* List existing decorations */}
          {selectedScreenshot.decorations && selectedScreenshot.decorations.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {selectedScreenshot.decorations.map((dec, decIndex) => (
                <div key={decIndex} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: colors.background,
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '13px'
                }}>
                  <span>{dec.type === 'stars' ? '⭐ Stars' : '🏆 Laurel'}</span>
                  <button
                    onClick={() => {
                      const newDecorations = selectedScreenshot.decorations!.filter((_, i) => i !== decIndex);
                      const newScreenshots = screenshots.map((s, i) =>
                        i === selectedIndex ? { ...s, decorations: newDecorations } : s
                      );
                      onScreenshotsChange(newScreenshots);
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#ff3b30',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
