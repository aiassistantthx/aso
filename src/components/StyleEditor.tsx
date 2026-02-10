import React from 'react';
import { StyleConfig, DeviceSize, Screenshot, ScreenshotStyleOverride, TranslationData, PerLanguageScreenshotStyle, BackgroundPatternType } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';
import { Toggle, Slider, ColorPicker } from './ui';
import { colors } from '../styles/common';
import { THEME_PRESETS, THEME_PRESET_GROUPS, ThemePreset, PATTERN_OPTIONS } from '../constants/templates';

// Inject responsive styles for StyleEditor
if (typeof document !== 'undefined' && !document.getElementById('style-editor-responsive')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'style-editor-responsive';
  styleEl.textContent = `
    @media (max-width: 768px) {
      .style-editor-container {
        padding: 16px !important;
      }
      .style-editor-section {
        padding: 14px !important;
      }
      .style-editor-grid {
        grid-template-columns: 1fr !important;
      }
      .style-editor-color-row {
        flex-direction: column !important;
        gap: 12px !important;
      }
      .style-editor-slider-row {
        flex-direction: column !important;
        align-items: stretch !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

interface Props {
  style: StyleConfig;
  onStyleChange: (style: StyleConfig) => void;
  deviceSize: DeviceSize;
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
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '12px'
  },
  labelIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '16px',
    marginBottom: '8px',
    paddingTop: '12px',
    borderTop: `1px solid ${colors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fieldLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: colors.textSecondary
  },
  input: {
    padding: '8px 10px',
    fontSize: '13px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  select: {
    padding: '8px 10px',
    fontSize: '13px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: colors.white,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2386868b' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: '28px'
  },
  colorInput: {
    width: '100%',
    height: '32px',
    padding: '3px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '8px',
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
    fontSize: '12px',
    fontWeight: 500,
    color: colors.text,
    minWidth: '48px',
    textAlign: 'center',
    backgroundColor: colors.background,
    padding: '4px 8px',
    borderRadius: '6px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '3px',
    backgroundColor: colors.background,
    borderRadius: '8px',
    padding: '3px'
  },
  button: {
    flex: 1,
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
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
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  gradientPreview: {
    height: '32px',
    borderRadius: '8px',
    border: `1px solid ${colors.borderLight}`,
    marginTop: '6px',
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
  deviceSize: _deviceSize,
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

  const hasPerLangOverride = isEditingTranslation && !!translationData?.perLanguageStyles?.[selectedLanguage]?.[selectedIndex];
  const mockupScaleValue = Math.round((isEditingTranslation
    ? (getPerLangStyle().mockupScale ?? style.mockupScale ?? 1.0)
    : (style.mockupScale ?? 1.0)) * 100);

  const updateStyle = <K extends keyof StyleConfig>(key: K, value: StyleConfig[K]) => {
    onStyleChange({ ...style, [key]: value });
  };

  const applyThemePreset = (preset: ThemePreset) => {
    // Update global style with full template settings (colors + fonts + pattern)
    onStyleChange({
      ...style,
      backgroundColor: preset.backgroundColor,
      gradient: preset.gradient,
      textColor: preset.textColor,
      highlightColor: preset.highlightColor,
      mockupColor: preset.mockupColor,
      pattern: preset.pattern || { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 },
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      textAlign: preset.textAlign || 'center',
      mockupScale: preset.mockupScale ?? style.mockupScale
    });

    // Apply alternating colors if template has them
    if (preset.alternatingColors && preset.alternatingColors.length > 0) {
      const allColors = [
        { backgroundColor: preset.backgroundColor, gradient: preset.gradient, textColor: preset.textColor, highlightColor: preset.highlightColor },
        ...preset.alternatingColors
      ];

      const newScreenshots = screenshots.map((s, i) => {
        const colorIndex = i % allColors.length;
        const colorVariant = allColors[colorIndex];

        // First screen uses global style (no override needed)
        if (i === 0) {
          const { styleOverride: _, ...rest } = s;
          return rest;
        }

        // Other screens get styleOverride with alternating colors
        return {
          ...s,
          styleOverride: {
            backgroundColor: colorVariant.backgroundColor,
            gradient: colorVariant.gradient,
            textColor: colorVariant.textColor || preset.textColor,
            highlightColor: colorVariant.highlightColor || preset.highlightColor
          }
        };
      });
      onScreenshotsChange(newScreenshots);
    } else {
      // Clear all per-screenshot style overrides so template applies uniformly
      const newScreenshots = screenshots.map(s => {
        const { styleOverride: _, ...rest } = s;
        return rest;
      });
      onScreenshotsChange(newScreenshots);
    }
  };

  const updatePattern = (updates: Partial<StyleConfig['pattern']>) => {
    onStyleChange({
      ...style,
      pattern: { ...(style.pattern || { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 }), ...updates }
    });
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

  return (
    <div style={cssStyles.container}>
      {/* Mockup Scale slider */}
      <div style={{ marginBottom: '12px' }}>
        <Slider
          label="Mockup Scale"
          min={30}
          max={200}
          value={mockupScaleValue}
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
      </div>

      {/* Screenshot in Mockup selector */}
      {style.showMockup && screenshots.length > 1 && selectedScreenshot && (
        <div style={{ marginBottom: '12px' }}>
          <span style={{ ...cssStyles.fieldLabel, display: 'block', marginBottom: '6px' }}>
            Screenshot in Mockup
          </span>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
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
                  width: '28px',
                  height: '48px',
                  borderRadius: '4px',
                  border: `2px solid ${(selectedScreenshot.linkedMockupIndex === idx || (selectedScreenshot.linkedMockupIndex === undefined && idx === selectedIndex)) ? colors.primary : colors.borderLight}`,
                  padding: '1px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  backgroundColor: colors.white
                }}
                title={`Use screenshot ${idx + 1}`}
              >
                {s.preview ? (
                  <img src={s.preview} alt={`${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: colors.background, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: colors.textSecondary }}>
                    {idx + 1}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Theme Presets */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        <span>🎨</span> Theme
        {selectedIndex > 0 && <span style={{ fontWeight: 400, fontSize: '10px', color: colors.primary, marginLeft: '6px' }}>Screen {selectedIndex + 1}</span>}
      </div>

      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {THEME_PRESET_GROUPS.flatMap((group) => group.presets.map((presetId) => {
          const preset = THEME_PRESETS.find(p => p.id === presetId);
          if (!preset) return null;
          const hasAlternating = preset.alternatingColors && preset.alternatingColors.length > 0;
          let background: string;
          if (hasAlternating && preset.alternatingColors) {
            const c1 = preset.gradient.enabled ? preset.gradient.color1 : preset.backgroundColor;
            const c2 = preset.alternatingColors[0].gradient.enabled ? preset.alternatingColors[0].gradient.color1 : preset.alternatingColors[0].backgroundColor;
            background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
          } else {
            background = preset.gradient.enabled ? `linear-gradient(${preset.gradient.angle}deg, ${preset.gradient.color1}, ${preset.gradient.color2})` : preset.backgroundColor;
          }
          return (
            <button
              key={preset.id}
              onClick={() => applyThemePreset(preset)}
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: '2px solid rgba(0,0,0,0.1)', cursor: 'pointer', background, transition: 'transform 0.15s' }}
              title={preset.name}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          );
        }))}
      </div>

      {hasOverride && selectedIndex > 0 && (
        <button onClick={resetToGlobal} style={{ padding: '8px 12px', fontSize: '12px', border: `1px solid ${colors.warning}`, borderRadius: '8px', backgroundColor: '#fff8e6', color: '#996300', cursor: 'pointer', marginBottom: '12px', width: '100%', fontWeight: 500 }}>
          ↩️ Reset to global style
        </button>
      )}

      {/* Background: Gradient toggle + colors */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Toggle label="Gradient" checked={effectiveGradient.enabled} onChange={(checked) => updateScreenshotGradient({ enabled: checked })} />
        {effectiveGradient.enabled ? (
          <>
            <ColorPicker label="Color 1" value={effectiveGradient.color1} onChange={(color) => updateScreenshotGradient({ color1: color })} />
            <ColorPicker label="Color 2" value={effectiveGradient.color2} onChange={(color) => updateScreenshotGradient({ color2: color })} />
            <div style={{ width: '120px' }}>
              <Slider label="Angle" min={0} max={360} value={effectiveGradient.angle} onChange={(value) => updateScreenshotGradient({ angle: value })} unit="°" />
            </div>
          </>
        ) : (
          <ColorPicker label="Background" value={effectiveBackgroundColor} onChange={(color) => updateScreenshotStyle({ backgroundColor: color })} />
        )}
      </div>

      {/* Pattern */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span style={{ ...cssStyles.fieldLabel, marginRight: '6px' }}>Pattern:</span>
        {PATTERN_OPTIONS.map((opt) => {
          const isActive = (style.pattern?.type || 'none') === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => updatePattern({ type: opt.value as BackgroundPatternType })}
              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 500, border: `1px solid ${isActive ? colors.primary : colors.borderLight}`, borderRadius: '6px', backgroundColor: isActive ? colors.primaryLight : colors.white, color: isActive ? colors.primary : colors.textSecondary, cursor: 'pointer' }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {style.pattern && style.pattern.type !== 'none' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          <ColorPicker label="Pattern Color" value={style.pattern.color} onChange={(color) => updatePattern({ color })} />
          <Slider label="Opacity" min={1} max={50} value={Math.round((style.pattern.opacity || 0.1) * 100)} onChange={(value) => updatePattern({ opacity: value / 100 })} unit="%" />
          <Slider label="Size" min={1} max={20} value={style.pattern.size || 4} onChange={(value) => updatePattern({ size: value })} unit="px" />
        </div>
      )}

      {/* Text Section */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        <span>✏️</span> Text
        {isEditingTranslation && <span style={{ fontWeight: 400, fontSize: '10px', color: colors.primary, marginLeft: '6px' }}>{getLanguageName(selectedLanguage)}</span>}
      </div>

      {hasPerLangOverride && (
        <button onClick={resetPerLangStyle} style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 500, border: `1px solid ${colors.primary}`, borderRadius: '8px', backgroundColor: colors.primaryLight, color: colors.primary, cursor: 'pointer', marginBottom: '12px', width: '100%' }}>
          ↩️ Reset to global style
        </button>
      )}

      {/* Font selector */}
      <div style={{ marginBottom: '12px' }}>
        <span style={cssStyles.fieldLabel}>Font Family</span>
        <select
          value={style.fontFamily}
          onChange={(e) => updateStyle('fontFamily', e.target.value)}
          style={{ ...cssStyles.select, width: '100%', marginTop: '4px' }}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
        <ColorPicker label="Text Color" value={effectiveTextColor} onChange={(color) => updateScreenshotStyle({ textColor: color })} />
        <ColorPicker label="Highlight" value={style.highlightColor || '#FFE135'} onChange={(color) => updateStyle('highlightColor', color)} />
      </div>
    </div>
  );
};
