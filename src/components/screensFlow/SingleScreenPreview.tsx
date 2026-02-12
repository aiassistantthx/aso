import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES, TranslationData, ScreenshotMockupSettings } from '../../types';
import { DEFAULT_MOCKUP_SETTINGS } from './types';
import { drawBackground, drawMockupFrame, drawText } from './drawHelpers';

// Single screen preview (for unlinked screens)
const SingleScreenPreview: React.FC<{
  screenshot: Screenshot;
  index: number;
  isSelected: boolean;
  style: StyleConfig;
  deviceSize: DeviceSize;
  onClick: () => void;
  onSettingsChange: (settings: ScreenshotMockupSettings) => void;
  onLinkToNext: () => void;
  showLinkButton: boolean;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  allScreenshots: Screenshot[];
  readOnly?: boolean;
  onReplaceScreenshot?: (file: File) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}> = ({
  screenshot,
  index,
  isSelected,
  style,
  deviceSize,
  onClick,
  onSettingsChange,
  onLinkToNext,
  showLinkButton,
  translationData,
  selectedLanguage = 'all',
  allScreenshots,
  readOnly = false,
  onReplaceScreenshot,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false
}) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const settings = screenshot.mockupSettings || DEFAULT_MOCKUP_SETTINGS;
  const dimensions = DEVICE_SIZES[deviceSize];
  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  const getDisplayText = (): string => {
    if (isEditingTranslation && translationData) {
      return translationData.headlines[selectedLanguage]?.[index] || screenshot?.text || '';
    }
    return screenshot?.text || '';
  };

  const getMockupScreenshot = (): string | null => {
    const linkedIndex = screenshot.linkedMockupIndex;
    if (linkedIndex !== undefined && allScreenshots[linkedIndex]) {
      return allScreenshots[linkedIndex].preview || null;
    }
    return screenshot.preview || null;
  };

  // Draw single screen canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewHeight = 340;
    const aspectRatio = dimensions.width / dimensions.height;
    const previewWidth = previewHeight * aspectRatio;

    canvas.width = previewWidth * 2;
    canvas.height = previewHeight * 2;
    ctx.scale(2, 2);

    // Draw background
    drawBackground(ctx, 0, 0, previewWidth, previewHeight, style, screenshot.styleOverride);

    // Draw mockup
    const mockupScreenshot = getMockupScreenshot();
    if (mockupScreenshot && style.showMockup) {
      const img = new Image();
      img.onload = () => {
        // Use exact same formulas as generatePreviewCanvas
        // Per-screenshot scale (settings.scale) takes precedence over global style.mockupScale
        const mockupScale = Math.max(0.3, Math.min(2.0, settings.scale ?? style.mockupScale ?? 1));
        const visibilityRatio = style.mockupVisibility === '2/3' ? 2/3 : style.mockupVisibility === '1/2' ? 0.5 : 1;

        // Get effective text position and mockup alignment (per-screenshot override takes precedence)
        const effectiveTextPosition = screenshot.styleOverride?.textPosition ?? style.textPosition;
        const effectiveMockupAlignment = screenshot.styleOverride?.mockupAlignment ?? style.mockupAlignment;

        // Use CONSISTENT text area height for mockup size calculation (35%)
        // This ensures mockups are the same size regardless of text position
        const textAreaHeightForMockup = previewHeight * 0.35;

        // Text area height for positioning (can vary by text position)
        const textAreaHeight = effectiveTextPosition === 'top'
          ? previewHeight * 0.35  // 35% when at top
          : previewHeight * 0.35; // 35% when at bottom (same for consistency)

        const availableHeight = previewHeight - textAreaHeightForMockup - (40 * previewHeight / dimensions.height);
        const baseMockupHeight = Math.min(availableHeight, previewHeight * 0.75);
        const mockupHeight = baseMockupHeight * mockupScale;
        const phoneAspectSingle = dimensions.platform === 'android' ? 0.459 : 0.49;
        const mockupWidth = mockupHeight * phoneAspectSingle;

        // Calculate visible portion
        const visiblePhoneHeight = mockupHeight * visibilityRatio;
        const hiddenHeight = mockupHeight - visiblePhoneHeight;

        // Calculate base position (exact same formula as generatePreviewCanvas)
        let baseMockupCenterX = previewWidth / 2;
        let baseMockupCenterY: number;

        // Scale factor for padding
        const scaleFactor = previewHeight / dimensions.height;

        switch (effectiveMockupAlignment) {
          case 'top':
            // When text is at bottom, mockup goes to top
            const textAreaOffsetTop = effectiveTextPosition === 'top' ? textAreaHeight : 0;
            baseMockupCenterY = textAreaOffsetTop - hiddenHeight + mockupHeight / 2;
            break;
          case 'bottom':
            baseMockupCenterY = previewHeight - visiblePhoneHeight - (40 * scaleFactor) + mockupHeight / 2;
            break;
          case 'center':
          default:
            baseMockupCenterY = (previewHeight - mockupHeight) / 2 + mockupHeight / 2;
            break;
        }

        // Add percentage offset
        const mockupCenterX = baseMockupCenterX + (settings.offsetX / 100) * previewWidth;
        const mockupCenterY = baseMockupCenterY + (settings.offsetY / 100) * previewHeight;
        const frameColor = style.mockupColor === 'white' ? '#F5F5F7' :
                          style.mockupColor === 'natural' ? '#E3D5C8' : '#1D1D1F';

        ctx.save();
        ctx.translate(mockupCenterX, mockupCenterY);
        ctx.rotate((settings.rotation * Math.PI) / 180);

        const isAndroidSingle = dimensions.platform === 'android';
        drawMockupFrame(ctx, style.mockupStyle || 'realistic', mockupWidth, mockupHeight, frameColor, img, isAndroidSingle);

        ctx.restore();

        // Draw text with mockup info for auto-sizing
        const mockupInfo = {
          centerY: mockupCenterY,
          height: mockupHeight,
          width: mockupWidth,
          rotation: settings.rotation
        };
        const textOffsetOverride = {
          x: settings.textOffsetX ?? style.textOffset?.x ?? 0,
          y: settings.textOffsetY ?? style.textOffset?.y ?? 0
        };
        drawText(ctx, getDisplayText(), 0, previewHeight, previewWidth, style, screenshot.styleOverride, mockupInfo, textOffsetOverride);
      };
      img.src = mockupScreenshot;
    } else {
      const textOffsetOverride = {
        x: settings.textOffsetX ?? style.textOffset?.x ?? 0,
        y: settings.textOffsetY ?? style.textOffset?.y ?? 0
      };
      drawText(ctx, getDisplayText(), 0, previewHeight, previewWidth, style, screenshot.styleOverride, undefined, textOffsetOverride);
    }
  }, [screenshot, style, style.mockupScale, style.mockupAlignment, style.mockupVisibility, style.textPosition, style.paddingTop, style.paddingBottom, style.fontSize, style.textColor, style.highlightColor, style.textOffset, deviceSize, settings, translationData, selectedLanguage, allScreenshots]);

  // Handle drag (mouse)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    // Update mockup offset
    onSettingsChange({
      ...settings,
      offsetX: Math.max(-80, Math.min(80, settings.offsetX + deltaX)),
      offsetY: Math.max(-30, Math.min(30, settings.offsetY + deltaY))
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, settings, onSettingsChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle drag (touch for mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.touches[0].clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.touches[0].clientY - dragStart.y) / rect.height) * 100;

    onSettingsChange({
      ...settings,
      offsetX: Math.max(-80, Math.min(80, settings.offsetX + deltaX)),
      offsetY: Math.max(-30, Math.min(30, settings.offsetY + deltaY))
    });

    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    e.preventDefault();
  }, [isDragging, dragStart, settings, onSettingsChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const previewHeight = 340;
  const aspectRatio = dimensions.width / dimensions.height;
  const previewWidth = previewHeight * aspectRatio;

  // Check if there's any offset to show
  const hasOffset = settings.offsetX !== 0 || settings.offsetY !== 0 || settings.rotation !== 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Position indicator - above canvas - only show in edit mode */}
        {!readOnly && (
          <div style={{
            backgroundColor: hasOffset ? 'rgba(0,0,0,0.7)' : 'transparent',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            marginBottom: '6px',
            minHeight: '18px',
            visibility: hasOffset ? 'visible' : 'hidden'
          }}>
            {`X:${Math.round(settings.offsetX)}% Y:${Math.round(settings.offsetY)}%`}
          </div>
        )}

        <div
          ref={containerRef}
          onClick={onClick}
          onMouseDown={readOnly ? undefined : handleMouseDown}
          onTouchStart={readOnly ? undefined : handleTouchStart}
          style={{
            cursor: readOnly ? 'default' : (isDragging ? 'grabbing' : 'grab'),
            borderRadius: '16px',
            overflow: 'hidden',
            border: isSelected && !readOnly ? '3px solid #FF6B4A' : '3px solid transparent',
            boxShadow: isSelected && !readOnly ? '0 8px 24px rgba(255, 107, 74, 0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
            position: 'relative',
            touchAction: readOnly ? 'auto' : 'none'
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              display: 'block'
            }}
          />

          {/* Screen number - hide in readOnly mode */}
          {!readOnly && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px',
              backgroundColor: isSelected ? '#FF6B4A' : 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: isSelected ? '#fff' : '#1d1d1f'
            }}>
              {index + 1}
            </div>
          )}

          {/* Upload/replace screenshot button */}
          {!readOnly && onReplaceScreenshot && (
            <>
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onReplaceScreenshot(file);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  uploadInputRef.current?.click();
                }}
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                title={screenshot.preview ? 'Replace screenshot' : 'Upload screenshot'}
              >
                📷
              </button>
            </>
          )}
        </div>

        {/* Rotation controls - hide in readOnly mode */}
        {!readOnly && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettingsChange({ ...settings, rotation: settings.rotation - 5 });
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #d1d1d6',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ↺
            </button>
            <span style={{ fontSize: '12px', color: '#666', minWidth: '36px', textAlign: 'center' }}>
              {settings.rotation}°
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettingsChange({ ...settings, rotation: settings.rotation + 5 });
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #d1d1d6',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ↻
            </button>

            {/* Spacer */}
            <div style={{ width: '12px' }} />

            {/* Move left button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveLeft?.();
              }}
              disabled={!canMoveLeft}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #d1d1d6',
                backgroundColor: canMoveLeft ? '#fff' : '#f5f5f5',
                cursor: canMoveLeft ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                opacity: canMoveLeft ? 1 : 0.4
              }}
              title="Move left"
            >
              ←
            </button>

            {/* Move right button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveRight?.();
              }}
              disabled={!canMoveRight}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #d1d1d6',
                backgroundColor: canMoveRight ? '#fff' : '#f5f5f5',
                cursor: canMoveRight ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                opacity: canMoveRight ? 1 : 0.4
              }}
              title="Move right"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Link button - hide in readOnly mode */}
      {showLinkButton && !readOnly && (
        <button
          onClick={onLinkToNext}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '2px solid #d1d1d6',
            backgroundColor: '#fff',
            color: '#86868b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            marginLeft: '8px',
            marginRight: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          title="Link with next screen"
        >
          ○
        </button>
      )}
    </div>
  );
};

export { SingleScreenPreview };
