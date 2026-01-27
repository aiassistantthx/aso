import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TranslationData, Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES, LaurelDecoration, Decoration, PerLanguageScreenshotStyle } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';
import { generatePreviewCanvas, getElementBounds } from '../services/canvas';

interface Props {
  translationData: TranslationData;
  screenshots: Screenshot[];
  style: StyleConfig;
  deviceSize: DeviceSize;
  onTranslationChange: (data: TranslationData) => void;
  onClose: () => void;
  onExport: () => void;
}

type DragTarget = 'mockup' | 'text' | { type: 'decoration'; index: number } | null;

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    zIndex: 1000
  },
  sidebar: {
    width: '320px',
    backgroundColor: '#fff',
    borderRight: '1px solid #e8e8ed',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  sidebarHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e8e8ed'
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '4px'
  },
  sidebarSubtitle: {
    fontSize: '12px',
    color: '#86868b'
  },
  languageList: {
    flex: 1,
    overflow: 'auto',
    padding: '8px'
  },
  languageItem: {
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.2s'
  },
  languageItemActive: {
    backgroundColor: '#0071e3',
    color: '#fff'
  },
  languageName: {
    fontSize: '14px',
    fontWeight: 500
  },
  languageCode: {
    fontSize: '11px',
    opacity: 0.7
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1d1d1f'
  },
  header: {
    padding: '12px 20px',
    backgroundColor: '#2d2d2f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #3d3d3f'
  },
  headerTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500
  },
  headerButtons: {
    display: 'flex',
    gap: '8px'
  },
  closeButton: {
    padding: '8px 16px',
    fontSize: '13px',
    border: '1px solid #555',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#fff',
    cursor: 'pointer'
  },
  exportButton: {
    padding: '8px 16px',
    fontSize: '13px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#0071e3',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500
  },
  previewArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflow: 'auto'
  },
  canvas: {
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    cursor: 'grab'
  },
  screenshotStrip: {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#2d2d2f',
    borderTop: '1px solid #3d3d3f',
    overflowX: 'auto'
  },
  thumbnail: {
    width: '50px',
    height: '80px',
    borderRadius: '6px',
    border: '2px solid transparent',
    cursor: 'pointer',
    flexShrink: 0,
    objectFit: 'cover'
  },
  thumbnailActive: {
    borderColor: '#0071e3'
  },
  thumbnailPlaceholder: {
    width: '50px',
    height: '80px',
    borderRadius: '6px',
    border: '2px solid transparent',
    cursor: 'pointer',
    flexShrink: 0,
    backgroundColor: '#3d3d3f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    fontSize: '8px',
    textAlign: 'center'
  },
  controlsPanel: {
    padding: '12px 20px',
    backgroundColor: '#2d2d2f',
    borderTop: '1px solid #3d3d3f'
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  controlLabel: {
    color: '#999',
    fontSize: '12px',
    width: '80px'
  },
  controlInput: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    backgroundColor: '#555',
    cursor: 'pointer'
  },
  controlValue: {
    color: '#fff',
    fontSize: '12px',
    width: '50px',
    textAlign: 'right'
  },
  resetButton: {
    padding: '4px 8px',
    fontSize: '11px',
    border: '1px solid #555',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#999',
    cursor: 'pointer'
  },
  textEditArea: {
    padding: '12px',
    backgroundColor: '#f5f5f7',
    borderBottom: '1px solid #e8e8ed'
  },
  textInput: {
    width: '100%',
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #d2d2d7',
    borderRadius: '6px',
    resize: 'vertical',
    minHeight: '60px'
  },
  fieldLabel: {
    fontSize: '11px',
    color: '#86868b',
    marginBottom: '4px',
    display: 'block'
  }
};

export const LanguagePreviewEditor: React.FC<Props> = ({
  translationData,
  screenshots,
  style,
  deviceSize,
  onTranslationChange,
  onClose,
  onExport
}) => {
  const languages = Object.keys(translationData.headlines);
  const [selectedLang, setSelectedLang] = useState(languages[0] || 'en-US');
  const [selectedScreenshot, setSelectedScreenshot] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });

  const dimensions = DEVICE_SIZES[deviceSize];
  const scale = Math.min(350 / dimensions.width, 500 / dimensions.height);

  const getLanguageName = (code: string) => {
    const lang = APP_STORE_LANGUAGES.find(l => l.code === code);
    return lang?.name || code;
  };

  // Get current per-language style
  const getCurrentPerLangStyle = (): PerLanguageScreenshotStyle => {
    return translationData.perLanguageStyles?.[selectedLang]?.[selectedScreenshot] || {};
  };

  // Update per-language style
  const updatePerLangStyle = (updates: Partial<PerLanguageScreenshotStyle>) => {
    const newStyles = translationData.perLanguageStyles ? { ...translationData.perLanguageStyles } : {};
    if (!newStyles[selectedLang]) {
      newStyles[selectedLang] = {};
    }
    newStyles[selectedLang][selectedScreenshot] = {
      ...getCurrentPerLangStyle(),
      ...updates
    };
    onTranslationChange({
      ...translationData,
      perLanguageStyles: newStyles
    });
  };

  // Get effective font size (per-language override or global)
  const getEffectiveFontSize = () => {
    return getCurrentPerLangStyle().fontSize ?? style.fontSize;
  };

  // Get effective text offset
  const getEffectiveTextOffset = () => {
    return getCurrentPerLangStyle().textOffset ?? style.textOffset;
  };

  // Get effective mockup offset
  const getEffectiveMockupOffset = () => {
    return getCurrentPerLangStyle().mockupOffset ?? style.mockupOffset;
  };

  // Apply translated decorations with per-language positions
  const getTranslatedDecorations = (): Decoration[] | undefined => {
    const screenshot = screenshots[selectedScreenshot];
    if (!screenshot?.decorations) return undefined;

    const laurelTexts = translationData.laurelTexts[selectedLang]?.[selectedScreenshot];
    const positionOverrides = getCurrentPerLangStyle().decorationPositions;

    return screenshot.decorations.map((dec, idx) => {
      let result = { ...dec };

      // Apply position override
      if (positionOverrides?.[idx]) {
        result = { ...result, position: positionOverrides[idx] };
      }

      // Apply laurel text translations
      if (dec.type === 'laurel' && laurelTexts) {
        const laurelDec = result as LaurelDecoration;
        result = {
          ...laurelDec,
          textBlocks: laurelDec.textBlocks.map((block, bIdx) => ({
            ...block,
            text: laurelTexts[bIdx] || block.text
          }))
        };
      }

      return result;
    });
  };

  // Get merged style for preview
  const getMergedStyle = (): StyleConfig => {
    const perLang = getCurrentPerLangStyle();
    return {
      ...style,
      fontSize: perLang.fontSize ?? style.fontSize,
      textOffset: perLang.textOffset ?? style.textOffset,
      mockupOffset: perLang.mockupOffset ?? style.mockupOffset
    };
  };

  // Update headline
  const updateHeadline = (newText: string) => {
    const newHeadlines = { ...translationData.headlines };
    newHeadlines[selectedLang] = [...newHeadlines[selectedLang]];
    newHeadlines[selectedLang][selectedScreenshot] = newText;
    onTranslationChange({
      ...translationData,
      headlines: newHeadlines
    });
  };

  // Update laurel text
  const updateLaurelText = (blockIndex: number, newText: string) => {
    const newLaurelTexts = { ...translationData.laurelTexts };
    if (!newLaurelTexts[selectedLang]) {
      newLaurelTexts[selectedLang] = [];
    }
    if (!newLaurelTexts[selectedLang][selectedScreenshot]) {
      newLaurelTexts[selectedLang][selectedScreenshot] = [];
    }
    newLaurelTexts[selectedLang] = [...newLaurelTexts[selectedLang]];
    newLaurelTexts[selectedLang][selectedScreenshot] = [...newLaurelTexts[selectedLang][selectedScreenshot]];
    newLaurelTexts[selectedLang][selectedScreenshot][blockIndex] = newText;
    onTranslationChange({
      ...translationData,
      laurelTexts: newLaurelTexts
    });
  };

  // Reset per-language styles for current screenshot
  const resetToGlobal = () => {
    const newStyles = { ...translationData.perLanguageStyles };
    if (newStyles[selectedLang]) {
      delete newStyles[selectedLang][selectedScreenshot];
      if (Object.keys(newStyles[selectedLang]).length === 0) {
        delete newStyles[selectedLang];
      }
    }
    onTranslationChange({
      ...translationData,
      perLanguageStyles: newStyles
    });
  };

  // Render preview
  useEffect(() => {
    if (canvasRef.current) {
      const screenshot = screenshots[selectedScreenshot];
      const headline = translationData.headlines[selectedLang]?.[selectedScreenshot] || screenshot?.text || '';

      generatePreviewCanvas(canvasRef.current, {
        screenshot: screenshot?.preview || null,
        text: headline,
        style: getMergedStyle(),
        deviceSize,
        decorations: getTranslatedDecorations(),
        styleOverride: screenshot?.styleOverride
      });
    }
  }, [selectedLang, selectedScreenshot, translationData, style, deviceSize, screenshots]);

  // Drag handlers
  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
  }, [scale]);

  const hitTest = useCallback((x: number, y: number): DragTarget => {
    const decorations = getTranslatedDecorations();
    if (decorations) {
      for (let i = decorations.length - 1; i >= 0; i--) {
        const dec = decorations[i];
        if (!dec.enabled) continue;

        if (dec.type === 'stars') {
          const totalWidth = dec.count * dec.size + (dec.count - 1) * dec.size * 0.2;
          const hitX = dec.position.x - totalWidth / 2;
          const hitY = dec.position.y - dec.size / 2;
          if (x >= hitX && x <= hitX + totalWidth && y >= hitY && y <= hitY + dec.size) {
            return { type: 'decoration', index: i };
          }
        } else if (dec.type === 'laurel') {
          const hitSize = 500 * dec.size;
          const hitX = dec.position.x - hitSize / 2;
          const hitY = dec.position.y - hitSize / 2;
          if (x >= hitX && x <= hitX + hitSize && y >= hitY && y <= hitY + hitSize) {
            return { type: 'decoration', index: i };
          }
        }
      }
    }

    const mergedStyle = getMergedStyle();
    const bounds = getElementBounds(mergedStyle, deviceSize);

    if (mergedStyle.showMockup) {
      const mockup = bounds.mockup;
      if (x >= mockup.x && x <= mockup.x + mockup.width && y >= mockup.y && y <= mockup.y + mockup.height) {
        return 'mockup';
      }
    }

    const text = bounds.text;
    if (x >= text.x && x <= text.x + text.width && y >= text.y && y <= text.y + text.height) {
      return 'text';
    }

    return null;
  }, [deviceSize, style, translationData, selectedLang, selectedScreenshot]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    const target = hitTest(coords.x, coords.y);

    if (target) {
      setIsDragging(true);
      setDragTarget(target);
      setDragStart(coords);

      if (target === 'mockup') {
        setInitialOffset(getEffectiveMockupOffset());
      } else if (target === 'text') {
        setInitialOffset(getEffectiveTextOffset());
      } else if (typeof target === 'object' && target.type === 'decoration') {
        const dec = getTranslatedDecorations()?.[target.index];
        if (dec) {
          setInitialOffset(dec.position);
        }
      }
      e.preventDefault();
    }
  }, [getCanvasCoordinates, hitTest]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragTarget) return;

    const coords = getCanvasCoordinates(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    const newPosition = {
      x: initialOffset.x + deltaX,
      y: initialOffset.y + deltaY
    };

    if (dragTarget === 'mockup') {
      updatePerLangStyle({ mockupOffset: newPosition });
    } else if (dragTarget === 'text') {
      updatePerLangStyle({ textOffset: newPosition });
    } else if (typeof dragTarget === 'object' && dragTarget.type === 'decoration') {
      const currentPositions = getCurrentPerLangStyle().decorationPositions || {};
      updatePerLangStyle({
        decorationPositions: {
          ...currentPositions,
          [dragTarget.index]: newPosition
        }
      });
    }
  }, [isDragging, dragTarget, getCanvasCoordinates, dragStart, initialOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragTarget(null);
  }, []);

  const screenshot = screenshots[selectedScreenshot];
  const headline = translationData.headlines[selectedLang]?.[selectedScreenshot] || screenshot?.text || '';
  const laurelDec = screenshot?.decorations?.find(d => d.type === 'laurel') as LaurelDecoration | undefined;
  const laurelTexts = translationData.laurelTexts[selectedLang]?.[selectedScreenshot] || [];
  const hasOverrides = !!translationData.perLanguageStyles?.[selectedLang]?.[selectedScreenshot];

  return (
    <div style={styles.overlay}>
      {/* Sidebar - Language List */}
      <div style={styles.sidebar as React.CSSProperties}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarTitle}>Languages</div>
          <div style={styles.sidebarSubtitle}>{languages.length} translations</div>
        </div>
        <div style={styles.languageList as React.CSSProperties}>
          {languages.map(lang => (
            <div
              key={lang}
              style={{
                ...styles.languageItem,
                ...(lang === selectedLang ? styles.languageItemActive : { backgroundColor: '#f5f5f7' })
              }}
              onClick={() => setSelectedLang(lang)}
            >
              <div>
                <div style={styles.languageName}>{getLanguageName(lang)}</div>
                <div style={styles.languageCode}>{lang}</div>
              </div>
              {translationData.perLanguageStyles?.[lang] && (
                <span style={{ fontSize: '10px', opacity: 0.7 }}>edited</span>
              )}
            </div>
          ))}
        </div>

        {/* Text editing */}
        <div style={styles.textEditArea}>
          <label style={styles.fieldLabel}>Headline</label>
          <textarea
            style={styles.textInput}
            value={headline}
            onChange={e => updateHeadline(e.target.value)}
            placeholder="Enter headline..."
          />
          {laurelDec && laurelDec.textBlocks.length > 0 && (
            <>
              <label style={{ ...styles.fieldLabel, marginTop: '8px' }}>Laurel Text</label>
              {laurelDec.textBlocks.map((block, bIdx) => (
                <input
                  key={bIdx}
                  type="text"
                  style={{ ...styles.textInput, minHeight: 'auto', marginBottom: '4px' }}
                  value={laurelTexts[bIdx] || block.text}
                  onChange={e => updateLaurelText(bIdx, e.target.value)}
                  placeholder={block.text}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div style={styles.mainArea as React.CSSProperties}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            {getLanguageName(selectedLang)} - Screenshot {selectedScreenshot + 1}
          </div>
          <div style={styles.headerButtons as React.CSSProperties}>
            <button style={styles.closeButton} onClick={onClose}>
              Close
            </button>
            <button style={styles.exportButton} onClick={onExport}>
              Export All
            </button>
          </div>
        </div>

        <div style={styles.previewArea as React.CSSProperties}>
          <canvas
            ref={canvasRef}
            style={{
              ...styles.canvas,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Controls */}
        <div style={styles.controlsPanel}>
          <div style={styles.controlRow}>
            <span style={styles.controlLabel}>Font Size</span>
            <input
              type="range"
              min="30"
              max="400"
              value={getEffectiveFontSize()}
              onChange={e => updatePerLangStyle({ fontSize: Number(e.target.value) })}
              style={styles.controlInput}
            />
            <span style={styles.controlValue as React.CSSProperties}>{getEffectiveFontSize()}px</span>
            {hasOverrides && (
              <button style={styles.resetButton} onClick={resetToGlobal}>
                Reset
              </button>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
            Drag elements to reposition. Changes are saved per language.
          </div>
        </div>

        {/* Screenshot Strip */}
        <div style={styles.screenshotStrip}>
          {screenshots.map((s, idx) => (
            s.preview ? (
              <img
                key={s.id}
                src={s.preview}
                alt={`Screenshot ${idx + 1}`}
                style={{
                  ...styles.thumbnail,
                  ...(idx === selectedScreenshot ? styles.thumbnailActive : {})
                }}
                onClick={() => setSelectedScreenshot(idx)}
              />
            ) : (
              <div
                key={s.id}
                style={{
                  ...styles.thumbnailPlaceholder,
                  ...(idx === selectedScreenshot ? styles.thumbnailActive : {})
                }}
                onClick={() => setSelectedScreenshot(idx)}
              >
                Text Only
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};
