import React from 'react';
import { StyleConfig, DeviceSize, DEVICE_SIZES, Screenshot, ScreenshotStyleOverride, TranslationData, PerLanguageScreenshotStyle, StarRatingDecoration, LaurelDecoration, BackgroundPatternType } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';
import { Toggle, Slider, ColorPicker, SegmentedControl } from './ui';
import { colors } from '../styles/common';
import { THEME_PRESETS, THEME_PRESET_GROUPS, ThemePreset, PATTERN_OPTIONS } from '../constants/templates';

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
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: colors.text,
    marginBottom: '6px'
  },
  labelIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px'
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '8px',
    marginBottom: '4px',
    paddingTop: '6px',
    borderTop: `1px solid ${colors.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  fieldLabel: {
    fontSize: '10px',
    fontWeight: 500,
    color: colors.textSecondary
  },
  input: {
    padding: '5px 8px',
    fontSize: '12px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  select: {
    padding: '5px 8px',
    fontSize: '12px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: colors.white,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2386868b' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    paddingRight: '24px'
  },
  colorInput: {
    width: '100%',
    height: '28px',
    padding: '2px',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: '6px',
    cursor: 'pointer'
  },
  rangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  range: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    appearance: 'none',
    backgroundColor: colors.borderLight,
    cursor: 'pointer'
  },
  rangeValue: {
    fontSize: '11px',
    fontWeight: 500,
    color: colors.text,
    minWidth: '40px',
    textAlign: 'center',
    backgroundColor: colors.background,
    padding: '2px 6px',
    borderRadius: '4px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '2px',
    backgroundColor: colors.background,
    borderRadius: '6px',
    padding: '2px'
  },
  button: {
    flex: 1,
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '5px',
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  buttonActive: {
    backgroundColor: colors.white,
    color: colors.text,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '14px',
    height: '14px',
    cursor: 'pointer'
  },
  gradientPreview: {
    height: '24px',
    borderRadius: '6px',
    border: `1px solid ${colors.borderLight}`,
    marginTop: '4px',
    boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.08)'
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

  const gradientBackground = effectiveGradient.enabled
    ? `linear-gradient(${effectiveGradient.angle}deg, ${effectiveGradient.color1}, ${effectiveGradient.color2})`
    : effectiveBackgroundColor;

  return (
    <div style={cssStyles.container}>
      {/* Mockup + Font row */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
        <div style={{ flex: 1 }}>
          <Toggle
            label="iPhone Frame"
            checked={style.showMockup}
            onChange={(checked) => updateStyle('showMockup', checked)}
            compact
          />
        </div>
        {style.showMockup && (
          <div style={{ display: 'flex', gap: '2px' }}>
            {(['black', 'white', 'natural'] as const).map(c => (
              <button
                key={c}
                onClick={() => updateStyle('mockupColor', c)}
                style={{
                  padding: '3px 8px',
                  fontSize: '10px',
                  border: style.mockupColor === c ? `1px solid ${colors.primary}` : `1px solid ${colors.borderLight}`,
                  borderRadius: '4px',
                  backgroundColor: style.mockupColor === c ? colors.primaryLight : colors.white,
                  color: style.mockupColor === c ? colors.primary : colors.textSecondary,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >{c}</button>
            ))}
          </div>
        )}
      </div>

      {/* Scale + Font row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
        <Slider
          label="Scale"
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
          compact
        />
        <div style={cssStyles.field as React.CSSProperties}>
          <span style={cssStyles.fieldLabel}>Font</span>
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

      {/* Screenshot in Mockup selector - compact */}
      {style.showMockup && screenshots.length > 1 && selectedScreenshot && (
        <div style={{ marginBottom: '6px' }}>
          <span style={{ ...cssStyles.fieldLabel, display: 'block', marginBottom: '4px' }}>
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

      {/* Theme Presets - compact horizontal */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        <span>🎨</span> Theme
        {selectedIndex > 0 && <span style={{ fontWeight: 400, fontSize: '9px', color: colors.primary, marginLeft: '4px' }}>Screen {selectedIndex + 1}</span>}
      </div>

      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '6px' }}>
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
              style={{ width: '22px', height: '22px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', background }}
              title={preset.name}
            />
          );
        }))}
      </div>

      {hasOverride && selectedIndex > 0 && (
        <button onClick={resetToGlobal} style={{ padding: '4px 8px', fontSize: '10px', border: `1px solid ${colors.warning}`, borderRadius: '6px', backgroundColor: '#fff8e6', color: '#996300', cursor: 'pointer', marginBottom: '6px', width: '100%' }}>
          ↩️ Reset to global
        </button>
      )}

      {/* Background: Gradient toggle + colors in one row */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '4px' }}>
        <Toggle label="Gradient" checked={effectiveGradient.enabled} onChange={(checked) => updateScreenshotGradient({ enabled: checked })} compact />
        {effectiveGradient.enabled ? (
          <>
            <ColorPicker label="C1" value={effectiveGradient.color1} onChange={(color) => updateScreenshotGradient({ color1: color })} compact />
            <ColorPicker label="C2" value={effectiveGradient.color2} onChange={(color) => updateScreenshotGradient({ color2: color })} compact />
            <Slider label="°" min={0} max={360} value={effectiveGradient.angle} onChange={(value) => updateScreenshotGradient({ angle: value })} unit="" compact />
          </>
        ) : (
          <ColorPicker label="BG" value={effectiveBackgroundColor} onChange={(color) => updateScreenshotStyle({ backgroundColor: color })} compact />
        )}
      </div>

      {/* Pattern - compact */}
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
        <span style={{ ...cssStyles.fieldLabel, marginRight: '4px' }}>Pattern:</span>
        {PATTERN_OPTIONS.map((opt) => {
          const isActive = (style.pattern?.type || 'none') === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => updatePattern({ type: opt.value as BackgroundPatternType })}
              style={{ padding: '2px 8px', fontSize: '10px', border: `1px solid ${isActive ? colors.primary : colors.borderLight}`, borderRadius: '4px', backgroundColor: isActive ? colors.primaryLight : colors.white, color: isActive ? colors.primary : colors.textSecondary, cursor: 'pointer' }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {style.pattern && style.pattern.type !== 'none' && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
          <ColorPicker label="Color" value={style.pattern.color} onChange={(color) => updatePattern({ color })} compact />
          <Slider label="Op" min={1} max={50} value={Math.round((style.pattern.opacity || 0.1) * 100)} onChange={(value) => updatePattern({ opacity: value / 100 })} unit="%" compact />
          <Slider label="Sz" min={1} max={20} value={style.pattern.size || 4} onChange={(value) => updatePattern({ size: value })} unit="" compact />
        </div>
      )}

      {/* Text Section - compact */}
      <div style={cssStyles.sectionTitle as React.CSSProperties}>
        <span>✏️</span> Text
        {isEditingTranslation && <span style={{ fontWeight: 400, fontSize: '9px', color: colors.primary, marginLeft: '4px' }}>{getLanguageName(selectedLanguage)}</span>}
      </div>

      {hasPerLangOverride && (
        <button onClick={resetPerLangStyle} style={{ padding: '4px 8px', fontSize: '10px', border: `1px solid ${colors.primary}`, borderRadius: '6px', backgroundColor: colors.primaryLight, color: colors.primary, cursor: 'pointer', marginBottom: '6px', width: '100%' }}>
          ↩️ Reset to global
        </button>
      )}

      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '6px' }}>
        <ColorPicker label="Text" value={effectiveTextColor} onChange={(color) => updateScreenshotStyle({ textColor: color })} compact />
        <ColorPicker label="Highlight" value={style.highlightColor || '#FFE135'} onChange={(color) => updateStyle('highlightColor', color)} compact />
        <button
          onClick={() => {
            if (isEditingTranslation) {
              updatePerLangStyle({ textOffset: { x: 0, y: getPerLangStyle().textOffset?.y ?? style.textOffset.y } });
            } else {
              updateStyle('textOffset', { ...style.textOffset, x: 0 });
            }
          }}
          style={{ padding: '4px 10px', fontSize: '10px', border: `1px solid ${colors.borderLight}`, borderRadius: '6px', backgroundColor: colors.white, color: colors.text, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ↔️ Center
        </button>
      </div>

      {/* Decorations - compact */}
      {selectedScreenshot && (
        <>
          <div style={cssStyles.sectionTitle as React.CSSProperties}>
            <span>✨</span> Decorations
            <span style={{ fontWeight: 400, fontSize: '9px', color: colors.textSecondary, marginLeft: '4px' }}>Screen {selectedIndex + 1}</span>
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            <button
              onClick={() => {
                const decorations = selectedScreenshot.decorations || [];
                const newDecoration = createDefaultStars(deviceSize);
                const newScreenshots = screenshots.map((s, i) => i === selectedIndex ? { ...s, decorations: [...decorations, newDecoration] } : s);
                onScreenshotsChange(newScreenshots);
              }}
              style={{ flex: 1, padding: '6px 10px', fontSize: '11px', border: `1px solid ${colors.borderLight}`, borderRadius: '6px', backgroundColor: colors.white, color: colors.text, cursor: 'pointer' }}
            >
              ⭐ Stars
            </button>
            <button
              onClick={() => {
                const decorations = selectedScreenshot.decorations || [];
                const newDecoration = createDefaultLaurel(deviceSize);
                const newScreenshots = screenshots.map((s, i) => i === selectedIndex ? { ...s, decorations: [...decorations, newDecoration] } : s);
                onScreenshotsChange(newScreenshots);
              }}
              style={{ flex: 1, padding: '6px 10px', fontSize: '11px', border: `1px solid ${colors.borderLight}`, borderRadius: '6px', backgroundColor: colors.white, color: colors.text, cursor: 'pointer' }}
            >
              🏆 Laurel
            </button>
          </div>

          {selectedScreenshot.decorations && selectedScreenshot.decorations.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {selectedScreenshot.decorations.map((dec, decIndex) => (
                <div key={decIndex} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', backgroundColor: colors.background, borderRadius: '6px', fontSize: '11px' }}>
                  <span>{dec.type === 'stars' ? '⭐' : '🏆'}</span>
                  <button
                    onClick={() => {
                      const newDecorations = selectedScreenshot.decorations!.filter((_, i) => i !== decIndex);
                      const newScreenshots = screenshots.map((s, i) => i === selectedIndex ? { ...s, decorations: newDecorations } : s);
                      onScreenshotsChange(newScreenshots);
                    }}
                    style={{ padding: '2px 6px', fontSize: '9px', border: 'none', borderRadius: '4px', backgroundColor: '#ff3b30', color: '#fff', cursor: 'pointer' }}
                  >
                    ✕
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
