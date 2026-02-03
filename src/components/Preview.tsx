import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES, TranslationData, Decoration, LaurelDecoration, PerLanguageScreenshotStyle } from '../types';
import { generatePreviewCanvas, getElementBounds } from '../services/canvas';
import { APP_STORE_LANGUAGES } from '../constants/languages';

interface Props {
  screenshots: Screenshot[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  style: StyleConfig;
  deviceSize: DeviceSize;
  onStyleChange: (style: StyleConfig) => void;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  onTranslationChange?: (data: TranslationData) => void;
}

type DragTarget = 'mockup' | 'text' | 'mockup-resize' | { type: 'decoration'; index: number } | null;

const cssStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f'
  },
  labelIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#e6f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  previewWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(145deg, #f5f5fa 0%, #eaeaef 100%)',
    borderRadius: '20px',
    padding: '28px',
    minHeight: '420px',
    position: 'relative',
    boxShadow: 'inset 0 2px 12px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  canvas: {
    borderRadius: '16px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
    cursor: 'move',
    transition: 'box-shadow 0.3s ease, transform 0.2s ease'
  },
  thumbnailStrip: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    padding: '8px 4px',
    marginTop: '8px'
  },
  thumbnail: {
    width: '52px',
    height: '90px',
    borderRadius: '10px',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  thumbnailActive: {
    borderColor: '#FF6B4A',
    boxShadow: '0 4px 16px rgba(255, 107, 74, 0.35)',
    transform: 'scale(1.05)'
  },
  textOnlyThumbnail: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 600,
    textAlign: 'center'
  },
  hint: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#86868b',
    marginTop: '8px'
  },
  resetButton: {
    padding: '11px 16px',
    fontSize: '13px',
    fontWeight: 600,
    border: '1px solid #e8e8ed',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  dragHint: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#86868b',
    marginTop: '8px',
    padding: '10px 14px',
    backgroundColor: '#f5f5f7',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  }
};

const getLanguageName = (code: string): string => {
  const lang = APP_STORE_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
};

// Mini preview for showing all screenshots (exported for use in other components)
export const MiniPreview: React.FC<{
  screenshot: Screenshot;
  index: number;
  isSelected: boolean;
  style: StyleConfig;
  deviceSize: DeviceSize;
  onClick: () => void;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  allScreenshots: Screenshot[];
}> = ({ screenshot, index, isSelected, style, deviceSize, onClick, translationData, selectedLanguage = 'all', allScreenshots }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  const getDisplayText = (): string => {
    if (isEditingTranslation) {
      return translationData.headlines[selectedLanguage]?.[index] || screenshot?.text || '';
    }
    return screenshot?.text || '';
  };

  // Get the screenshot to show in mockup (may be linked to another screen)
  const getMockupScreenshot = (): string | null => {
    if (!screenshot) return null;
    const linkedIndex = screenshot.linkedMockupIndex;
    if (linkedIndex !== undefined && allScreenshots[linkedIndex]) {
      return allScreenshots[linkedIndex].preview || null;
    }
    return screenshot.preview || null;
  };

  useEffect(() => {
    if (canvasRef.current) {
      generatePreviewCanvas(canvasRef.current, {
        screenshot: screenshot?.preview || null,
        text: getDisplayText(),
        style,
        deviceSize,
        decorations: screenshot?.decorations,
        styleOverride: screenshot?.styleOverride,
        mockupScreenshot: getMockupScreenshot(),
        mockupContinuation: screenshot?.mockupContinuation
      });
    }
  }, [screenshot, style, deviceSize, translationData, selectedLanguage, allScreenshots]);

  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0,
        cursor: 'pointer',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isSelected ? '3px solid #FF6B4A' : '3px solid transparent',
        boxShadow: isSelected ? '0 8px 24px rgba(255, 107, 74, 0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        backgroundColor: '#f5f5f7'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '180px',
          height: '310px',
          display: 'block',
          borderRadius: '13px 13px 0 0'
        }}
      />
      <div style={{
        padding: '8px',
        backgroundColor: isSelected ? '#FF6B4A' : '#fff',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 600,
        color: isSelected ? '#fff' : '#86868b'
      }}>
        {index + 1}
      </div>
    </div>
  );
};

export const Preview: React.FC<Props> = ({
  screenshots,
  selectedIndex,
  onSelectIndex: _onSelectIndex,
  onScreenshotsChange,
  style,
  deviceSize,
  onStyleChange,
  translationData,
  selectedLanguage = 'all',
  onTranslationChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedScreenshot = screenshots[selectedIndex];
  const decorations = selectedScreenshot?.decorations || [];

  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(1.0);
  const [initialMockupHeight, setInitialMockupHeight] = useState(0);

  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  // Calculate scale factor for preview
  const dimensions = DEVICE_SIZES[deviceSize];
  const scale = Math.min(400 / dimensions.width, 600 / dimensions.height);

  // Get per-language style overrides
  const getPerLangStyle = (): PerLanguageScreenshotStyle => {
    if (!isEditingTranslation) return {};
    return translationData.perLanguageStyles?.[selectedLanguage]?.[selectedIndex] || {};
  };

  // Update per-language style
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

  // Get effective style (merged with per-language overrides)
  const getEffectiveStyle = (): StyleConfig => {
    if (!isEditingTranslation) return style;
    const perLang = getPerLangStyle();
    return {
      ...style,
      fontSize: perLang.fontSize ?? style.fontSize,
      textOffset: perLang.textOffset ?? style.textOffset,
      mockupOffset: perLang.mockupOffset ?? style.mockupOffset,
      mockupScale: perLang.mockupScale ?? style.mockupScale
    };
  };


  // Get translated text
  const getDisplayText = (): string => {
    if (isEditingTranslation) {
      return translationData.headlines[selectedLanguage]?.[selectedIndex] || selectedScreenshot?.text || 'Your headline here';
    }
    return selectedScreenshot?.text || 'Your headline here';
  };

  // Get translated decorations
  const getTranslatedDecorations = (): Decoration[] | undefined => {
    if (!selectedScreenshot?.decorations) return undefined;

    if (!isEditingTranslation) return decorations;

    const laurelTexts = translationData.laurelTexts[selectedLanguage]?.[selectedIndex];
    const positionOverrides = getPerLangStyle().decorationPositions;

    return selectedScreenshot.decorations.map((dec, idx) => {
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

  // Get the screenshot to show in mockup (may be linked to another screen)
  const getMockupScreenshot = (): string | null => {
    if (!selectedScreenshot) return null;
    const linkedIndex = selectedScreenshot.linkedMockupIndex;
    if (linkedIndex !== undefined && screenshots[linkedIndex]) {
      return screenshots[linkedIndex].preview || null;
    }
    return selectedScreenshot.preview || null;
  };

  useEffect(() => {
    if (canvasRef.current) {
      generatePreviewCanvas(canvasRef.current, {
        screenshot: selectedScreenshot?.preview || null,
        text: getDisplayText(),
        style: getEffectiveStyle(),
        deviceSize,
        decorations: getTranslatedDecorations(),
        styleOverride: selectedScreenshot?.styleOverride,
        mockupScreenshot: getMockupScreenshot(),
        mockupContinuation: selectedScreenshot?.mockupContinuation
      });
    }
  }, [selectedScreenshot, style, deviceSize, translationData, selectedLanguage, selectedIndex, screenshots]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    // Convert to canvas coordinates (accounting for scale)
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
  }, [scale]);

  const hitTest = useCallback((x: number, y: number): DragTarget => {
    const currentDecorations = getTranslatedDecorations() || [];

    // Check decorations first (they're on top)
    for (let i = currentDecorations.length - 1; i >= 0; i--) {
      const dec = currentDecorations[i];
      if (!dec.enabled) continue;

      if (dec.type === 'stars') {
        // Stars hit area
        const totalWidth = dec.count * dec.size + (dec.count - 1) * dec.size * 0.2;
        const hitX = dec.position.x - totalWidth / 2;
        const hitY = dec.position.y - dec.size / 2;
        if (x >= hitX && x <= hitX + totalWidth &&
            y >= hitY && y <= hitY + dec.size) {
          return { type: 'decoration', index: i };
        }
      } else if (dec.type === 'laurel') {
        // Laurel hit area (roughly square based on size)
        const hitSize = 500 * dec.size;
        const hitX = dec.position.x - hitSize / 2;
        const hitY = dec.position.y - hitSize / 2;
        if (x >= hitX && x <= hitX + hitSize &&
            y >= hitY && y <= hitY + hitSize) {
          return { type: 'decoration', index: i };
        }
      }
    }

    const effectiveStyle = getEffectiveStyle();
    const bounds = getElementBounds(effectiveStyle, deviceSize);

    // Check mockup resize handle first (bottom-right corner)
    if (effectiveStyle.showMockup && selectedScreenshot?.preview) {
      const mockup = bounds.mockup;
      const handleSize = 60; // Size of resize handle area
      const handleX = mockup.x + mockup.width - handleSize;
      const handleY = mockup.y + mockup.height - handleSize;

      if (x >= handleX && x <= mockup.x + mockup.width &&
          y >= handleY && y <= mockup.y + mockup.height) {
        return 'mockup-resize';
      }
    }

    // Check mockup bounds (for dragging)
    if (effectiveStyle.showMockup) {
      const mockup = bounds.mockup;
      if (x >= mockup.x && x <= mockup.x + mockup.width &&
          y >= mockup.y && y <= mockup.y + mockup.height) {
        return 'mockup';
      }
    }

    // Check text bounds
    const text = bounds.text;
    if (x >= text.x && x <= text.x + text.width &&
        y >= text.y && y <= text.y + text.height) {
      return 'text';
    }

    return null;
  }, [style, deviceSize, decorations, translationData, selectedLanguage, selectedIndex]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    const target = hitTest(coords.x, coords.y);

    if (target) {
      setIsDragging(true);
      setDragTarget(target);
      setDragStart(coords);

      const effectiveStyle = getEffectiveStyle();
      const currentDecorations = getTranslatedDecorations() || [];

      if (target === 'mockup-resize') {
        // Store initial scale and mockup height for resize calculation
        setInitialScale(effectiveStyle.mockupScale ?? 1.0);
        const bounds = getElementBounds(effectiveStyle, deviceSize);
        setInitialMockupHeight(bounds.mockup.height);
      } else if (target === 'mockup') {
        setInitialOffset(effectiveStyle.mockupOffset);
      } else if (target === 'text') {
        setInitialOffset(effectiveStyle.textOffset);
      } else if (typeof target === 'object' && target.type === 'decoration') {
        const dec = currentDecorations[target.index];
        if (dec) {
          setInitialOffset(dec.position);
        }
      }
      e.preventDefault();
    }
  }, [getCanvasCoordinates, hitTest, style, decorations, translationData, selectedLanguage, selectedIndex, deviceSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragTarget) return;

    const coords = getCanvasCoordinates(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    if (dragTarget === 'mockup-resize') {
      // Calculate new scale based on vertical delta (diagonal drag)
      const delta = Math.max(deltaX, deltaY); // Use the larger of the two for smooth scaling
      const scaleDelta = delta / initialMockupHeight;
      const newScale = Math.max(0.3, Math.min(2.0, initialScale + scaleDelta));

      if (isEditingTranslation) {
        updatePerLangStyle({ mockupScale: newScale });
      } else {
        onStyleChange({ ...style, mockupScale: newScale });
      }
      return;
    }

    const newPosition = {
      x: initialOffset.x + deltaX,
      y: initialOffset.y + deltaY
    };

    if (dragTarget === 'mockup') {
      if (isEditingTranslation) {
        updatePerLangStyle({ mockupOffset: newPosition });
      } else {
        onStyleChange({ ...style, mockupOffset: newPosition });
      }
    } else if (dragTarget === 'text') {
      if (isEditingTranslation) {
        updatePerLangStyle({ textOffset: newPosition });
      } else {
        onStyleChange({ ...style, textOffset: newPosition });
      }
    } else if (typeof dragTarget === 'object' && dragTarget.type === 'decoration') {
      if (isEditingTranslation) {
        // Update per-language decoration position
        const currentPositions = getPerLangStyle().decorationPositions || {};
        updatePerLangStyle({
          decorationPositions: {
            ...currentPositions,
            [dragTarget.index]: newPosition
          }
        });
      } else {
        // Update global decoration position
        const newDecorations = decorations.map((dec, i) =>
          i === dragTarget.index ? { ...dec, position: newPosition } : dec
        );
        const newScreenshots = screenshots.map((s, i) =>
          i === selectedIndex ? { ...s, decorations: newDecorations } : s
        );
        onScreenshotsChange(newScreenshots);
      }
    }
  }, [isDragging, dragTarget, getCanvasCoordinates, dragStart, initialOffset, initialScale, initialMockupHeight, onStyleChange, style, decorations, screenshots, selectedIndex, onScreenshotsChange, isEditingTranslation, translationData, selectedLanguage, onTranslationChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragTarget(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragTarget(null);
    }
  }, [isDragging]);

  const resetPositions = useCallback(() => {
    if (isEditingTranslation && translationData && onTranslationChange) {
      // Reset per-language styles for current screenshot
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
    } else {
      onStyleChange({
        ...style,
        mockupOffset: { x: 0, y: 0 },
        textOffset: { x: 0, y: 0 },
        mockupScale: 1.0
      });
    }
  }, [onStyleChange, style, isEditingTranslation, translationData, selectedLanguage, selectedIndex, onTranslationChange]);

  // Determine cursor style based on hover position
  const [hoverTarget, setHoverTarget] = useState<DragTarget>(null);

  const handleMouseMoveForCursor = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return; // Don't update hover state while dragging
    const coords = getCanvasCoordinates(e);
    const target = hitTest(coords.x, coords.y);
    setHoverTarget(target);
  }, [isDragging, getCanvasCoordinates, hitTest]);

  const getCursorStyle = (): string => {
    if (isDragging) {
      return dragTarget === 'mockup-resize' ? 'nwse-resize' : 'grabbing';
    }
    if (hoverTarget === 'mockup-resize') return 'nwse-resize';
    if (hoverTarget) return 'grab';
    return 'default';
  };

  const hasCustomPosition = isEditingTranslation
    ? !!translationData?.perLanguageStyles?.[selectedLanguage]?.[selectedIndex]
    : (style.mockupOffset.x !== 0 || style.mockupOffset.y !== 0 ||
       style.textOffset.x !== 0 || style.textOffset.y !== 0 ||
       (style.mockupScale ?? 1.0) !== 1.0);

  return (
    <div style={cssStyles.container as React.CSSProperties}>
      <label style={cssStyles.label}>
        <div style={cssStyles.labelIcon as React.CSSProperties}>👁️</div>
        <span style={{ flex: 1 }}>Preview</span>
        {isEditingTranslation && (
          <span style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#FF6B4A',
            backgroundColor: '#f0f7ff',
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            {getLanguageName(selectedLanguage)}
          </span>
        )}
      </label>

      <div style={cssStyles.previewWrapper as React.CSSProperties}>
        <canvas
          ref={canvasRef}
          style={{
            ...cssStyles.canvas,
            cursor: getCursorStyle()
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMoveForCursor(e);
            handleMouseMove(e);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseLeave();
            setHoverTarget(null);
          }}
        />
      </div>

      <p style={cssStyles.dragHint as React.CSSProperties}>
        💡 Drag elements to reposition • Drag corner to resize mockup
      </p>

      {hasCustomPosition && (
        <button
          style={cssStyles.resetButton}
          onClick={resetPositions}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f7'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <span>↩️</span> Reset Positions
        </button>
      )}

      {screenshots.length === 0 && (
        <p style={cssStyles.hint as React.CSSProperties}>
          Upload a screenshot to see it in the mockup
        </p>
      )}
    </div>
  );
};
