import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES, TranslationData, ScreenshotMockupSettings, MockupStyle } from '../types';

// Inject responsive styles for ScreensFlowEditor
if (typeof document !== 'undefined' && !document.getElementById('screens-flow-editor-responsive')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'screens-flow-editor-responsive';
  styleEl.textContent = `
    @media (max-width: 768px) {
      .screens-flow-editor {
        transform: scale(0.8);
        transform-origin: top center;
      }
      .screens-flow-thumbs {
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        justify-content: flex-start !important;
        padding-bottom: 10px !important;
      }
      .screens-flow-thumb {
        flex-shrink: 0 !important;
      }
      .screens-flow-controls {
        flex-wrap: wrap !important;
        gap: 8px !important;
      }
      .screens-flow-slider {
        min-width: 100px !important;
      }
    }
    @media (max-width: 480px) {
      .screens-flow-editor {
        transform: scale(0.65);
      }
    }
  `;
  document.head.appendChild(styleEl);
}

interface Props {
  screenshots: Screenshot[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  style: StyleConfig;
  deviceSize: DeviceSize;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  onTranslationChange?: (data: TranslationData) => void;
  /** Read-only mode: hides all editing controls, just displays previews */
  readOnly?: boolean;
}

const DEFAULT_MOCKUP_SETTINGS: ScreenshotMockupSettings = {
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  scale: 1.0,
  linkedToNext: false
};

// Draw side buttons for preview mockups (centered coordinate system)
const drawPreviewSideButtons = (
  ctx: CanvasRenderingContext2D,
  mockupWidth: number,
  mockupHeight: number,
  frameColor: string,
  isOutline: boolean = false
): void => {
  const buttonColor = frameColor === '#F5F5F7' ? '#D1D1D6' :
                      frameColor === '#E3D5C8' ? '#C4B5A8' : '#0D0D0D';
  const buttonWidth = mockupWidth * 0.012;
  const buttonRadius = buttonWidth / 2;
  const x = -mockupWidth / 2;
  const y = -mockupHeight / 2;

  if (isOutline) {
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = buttonWidth * 0.6;
  } else {
    ctx.fillStyle = buttonColor;
  }

  // Action button
  const actionH = mockupHeight * 0.035;
  const actionY = y + mockupHeight * 0.15;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, actionY, buttonWidth, actionH, buttonRadius);
  isOutline ? ctx.stroke() : ctx.fill();

  // Volume Up
  const volH = mockupHeight * 0.065;
  const volUpY = y + mockupHeight * 0.22;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, volUpY, buttonWidth, volH, buttonRadius);
  isOutline ? ctx.stroke() : ctx.fill();

  // Volume Down
  const volDownY = volUpY + volH + mockupHeight * 0.015;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, volDownY, buttonWidth, volH, buttonRadius);
  isOutline ? ctx.stroke() : ctx.fill();

  // Power button
  const powerH = mockupHeight * 0.08;
  const powerY = y + mockupHeight * 0.24;
  ctx.beginPath();
  ctx.roundRect(-x, powerY, buttonWidth, powerH, buttonRadius);
  isOutline ? ctx.stroke() : ctx.fill();
};

// Draw mockup frame based on style (centered at 0,0)
const drawMockupFrame = (
  ctx: CanvasRenderingContext2D,
  mockupStyle: MockupStyle,
  mockupWidth: number,
  mockupHeight: number,
  frameColor: string,
  img: HTMLImageElement | null
): void => {
  const frameThickness = mockupWidth * 0.035;
  const cornerRadius = mockupWidth * 0.12;
  const innerRadius = cornerRadius - frameThickness * 0.8;

  // Dynamic Island dimensions
  const diWidth = mockupWidth * 0.30;
  const diHeight = mockupHeight * 0.022;
  const diY = -mockupHeight / 2 + frameThickness + mockupHeight * 0.008;

  switch (mockupStyle) {
    case 'flat': {
      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;

      // Solid phone body
      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, cornerRadius);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Side buttons
      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, false);

      // Black screen background
      const screenW = mockupWidth - frameThickness * 2;
      const screenH = mockupHeight - frameThickness * 2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, innerRadius);
      ctx.fill();

      // Screenshot
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, innerRadius);
        ctx.clip();
        const imgAspect = img.width / img.height;
        const screenAspect = screenW / screenH;
        const drawH = imgAspect > screenAspect ? screenH : screenW / imgAspect;
        const drawW = imgAspect > screenAspect ? drawH * imgAspect : screenW;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // Dynamic Island
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, diY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    case 'minimal': {
      const borderW = mockupWidth * 0.02;
      const minRadius = mockupWidth * 0.1;
      const minInnerRadius = minRadius - borderW;

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;

      // Border frame
      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, minRadius);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Side buttons
      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, false);

      // Black screen
      const screenW = mockupWidth - borderW * 2;
      const screenH = mockupHeight - borderW * 2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, minInnerRadius);
      ctx.fill();

      // Screenshot
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, minInnerRadius);
        ctx.clip();
        const imgAspect = img.width / img.height;
        const screenAspect = screenW / screenH;
        const drawH = imgAspect > screenAspect ? screenH : screenW / imgAspect;
        const drawW = imgAspect > screenAspect ? drawH * imgAspect : screenW;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // Dynamic Island
      const minDiY = -mockupHeight / 2 + borderW + mockupHeight * 0.01;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, minDiY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    case 'outline': {
      const borderW = mockupWidth * 0.025;
      const outRadius = mockupWidth * 0.11;
      const outInnerRadius = outRadius - borderW / 2;

      // Black screen background
      const screenW = mockupWidth - borderW * 2;
      const screenH = mockupHeight - borderW * 2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, outInnerRadius);
      ctx.fill();

      // Screenshot
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, outInnerRadius);
        ctx.clip();
        const imgAspect = img.width / img.height;
        const screenAspect = screenW / screenH;
        const drawH = imgAspect > screenAspect ? screenH : screenW / imgAspect;
        const drawW = imgAspect > screenAspect ? drawH * imgAspect : screenW;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      // Outline frame
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = borderW;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2 + borderW / 2, -mockupHeight / 2 + borderW / 2,
                    mockupWidth - borderW, mockupHeight - borderW, outRadius);
      ctx.stroke();

      // Side buttons (outline style)
      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, true);

      // Dynamic Island
      const outDiY = -mockupHeight / 2 + borderW + mockupHeight * 0.012;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, outDiY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    default: {
      // Realistic style
      ctx.fillStyle = frameColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2 - 8, -mockupHeight / 2 - 8, mockupWidth + 16, mockupHeight + 16, cornerRadius + 4);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Screenshot
      if (img) {
        ctx.beginPath();
        ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, cornerRadius);
        ctx.clip();
        const imgAspect = img.width / img.height;
        const frameAspect = mockupWidth / mockupHeight;
        const drawH = imgAspect > frameAspect ? mockupHeight : mockupWidth / imgAspect;
        const drawW = imgAspect > frameAspect ? drawH * imgAspect : mockupWidth;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      }

      // Dynamic Island
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, -mockupHeight / 2 + 8, diWidth, mockupHeight * 0.035, 10);
      ctx.fill();
    }
  }
};

// Combined canvas for linked pair of screens
const LinkedPairCanvas: React.FC<{
  screen1: Screenshot;
  screen2: Screenshot;
  index1: number;
  index2: number;
  selectedIndex: number;
  style: StyleConfig;
  deviceSize: DeviceSize;
  onSelectIndex: (index: number) => void;
  onBothSettingsChange: (s1: ScreenshotMockupSettings, s2: ScreenshotMockupSettings) => void;
  onUnlink: () => void;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  readOnly?: boolean;
}> = ({
  screen1,
  screen2,
  index1,
  index2,
  selectedIndex,
  style,
  deviceSize,
  onSelectIndex,
  onBothSettingsChange,
  onUnlink,
  translationData,
  selectedLanguage = 'all',
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Local state for smooth dragging
  const [localOffsetX, setLocalOffsetX] = useState(0);
  const [localOffsetY, setLocalOffsetY] = useState(0);
  const [localRotation, setLocalRotation] = useState(0);

  const settings1 = screen1.mockupSettings || DEFAULT_MOCKUP_SETTINGS;

  // Sync local state with props when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalOffsetX(settings1.offsetX);
      setLocalOffsetY(settings1.offsetY);
      setLocalRotation(settings1.rotation);
    }
  }, [settings1.offsetX, settings1.offsetY, settings1.rotation, isDragging]);

  const dimensions = DEVICE_SIZES[deviceSize];
  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  const getDisplayText = (screen: Screenshot, idx: number): string => {
    if (isEditingTranslation && translationData) {
      return translationData.headlines[selectedLanguage]?.[idx] || screen?.text || '';
    }
    return screen?.text || '';
  };

  // Draw canvas - same pattern as SingleScreenPreview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isCancelled = false;

    const previewHeight = 340;
    const aspectRatio = dimensions.width / dimensions.height;
    const singleScreenWidth = previewHeight * aspectRatio;
    const combinedWidth = singleScreenWidth * 2;

    canvas.width = combinedWidth * 2;
    canvas.height = previewHeight * 2;
    ctx.scale(2, 2);

    // Draw backgrounds
    drawBackground(ctx, 0, 0, singleScreenWidth, previewHeight, style, screen1.styleOverride);
    drawBackground(ctx, singleScreenWidth, 0, singleScreenWidth, previewHeight, style, screen2.styleOverride);

    // Draw divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(singleScreenWidth, 0);
    ctx.lineTo(singleScreenWidth, previewHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pre-calculate mockup dimensions using exact same formulas as generatePreviewCanvas
    const currentMockupScale = Math.max(0.3, Math.min(2.0, style.mockupScale ?? 1.0));
    const visibilityRatio = style.mockupVisibility === '2/3' ? 2/3 : style.mockupVisibility === '1/2' ? 0.5 : 1;

    // Calculate text area height - use fixed percentage for reliable spacing
    const textAreaHeight = style.textPosition === 'top'
      ? previewHeight * 0.38  // 38% of preview height for text when at top
      : previewHeight * 0.30; // 30% when at bottom

    const availableHeight = previewHeight - textAreaHeight - (40 * previewHeight / dimensions.height);
    const baseMockupHeight = Math.min(availableHeight, previewHeight * 0.75);
    const mockupHeight = baseMockupHeight * currentMockupScale;
    const mockupWidth = mockupHeight * 0.49;

    // Calculate visible portion
    const visiblePhoneHeight = mockupHeight * visibilityRatio;
    const hiddenHeight = mockupHeight - visiblePhoneHeight;

    // Calculate base position (exact same formula as generatePreviewCanvas)
    let baseMockupCenterX = singleScreenWidth / 2;
    let baseMockupCenterY: number;

    // Scale factor for padding
    const scaleFactor = previewHeight / dimensions.height;

    switch (style.mockupAlignment) {
      case 'top':
        // When text is at top, offset mockup down to leave room for text
        const textAreaOffsetTop = style.textPosition === 'top' ? textAreaHeight : 0;
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
    const mockupCenterX = baseMockupCenterX + (localOffsetX / 100) * singleScreenWidth;
    const mockupCenterY = baseMockupCenterY + (localOffsetY / 100) * previewHeight;
    const frameColor = style.mockupColor === 'white' ? '#F5F5F7' :
                      style.mockupColor === 'natural' ? '#E3D5C8' : '#1D1D1F';
    const currentRotation = localRotation;
    const currentMockupStyle = style.mockupStyle || 'realistic';

    // Draw mockup - create image inside effect like SingleScreenPreview
    if (screen1.preview && style.showMockup) {
      const img = new Image();
      img.onload = () => {
        if (isCancelled) return; // Don't draw if effect was cleaned up

        ctx.save();
        ctx.translate(mockupCenterX, mockupCenterY);
        ctx.rotate((currentRotation * Math.PI) / 180);

        drawMockupFrame(ctx, currentMockupStyle, mockupWidth, mockupHeight, frameColor, img);

        ctx.restore();

        // Draw text with mockup info for auto-sizing
        const mockupInfo = {
          centerY: mockupCenterY,
          height: mockupHeight,
          width: mockupWidth,
          rotation: currentRotation
        };
        const screen1TextOffset = {
          x: screen1.mockupSettings?.textOffsetX ?? style.textOffset?.x ?? 0,
          y: screen1.mockupSettings?.textOffsetY ?? style.textOffset?.y ?? 0
        };
        const screen2TextOffset = {
          x: screen2.mockupSettings?.textOffsetX ?? style.textOffset?.x ?? 0,
          y: screen2.mockupSettings?.textOffsetY ?? style.textOffset?.y ?? 0
        };
        drawText(ctx, getDisplayText(screen1, index1), 0, previewHeight, singleScreenWidth, style, screen1.styleOverride, mockupInfo, screen1TextOffset);
        drawText(ctx, getDisplayText(screen2, index2), singleScreenWidth, previewHeight, singleScreenWidth, style, screen2.styleOverride, mockupInfo, screen2TextOffset);
      };
      img.src = screen1.preview;
    } else {
      // No mockup - just draw text
      const screen1TextOffset = {
        x: screen1.mockupSettings?.textOffsetX ?? style.textOffset?.x ?? 0,
        y: screen1.mockupSettings?.textOffsetY ?? style.textOffset?.y ?? 0
      };
      const screen2TextOffset = {
        x: screen2.mockupSettings?.textOffsetX ?? style.textOffset?.x ?? 0,
        y: screen2.mockupSettings?.textOffsetY ?? style.textOffset?.y ?? 0
      };
      drawText(ctx, getDisplayText(screen1, index1), 0, previewHeight, singleScreenWidth, style, screen1.styleOverride, undefined, screen1TextOffset);
      drawText(ctx, getDisplayText(screen2, index2), singleScreenWidth, previewHeight, singleScreenWidth, style, screen2.styleOverride, undefined, screen2TextOffset);
    }

    return () => {
      isCancelled = true;
    };
  }, [dimensions, style, style.mockupScale, style.mockupAlignment, style.mockupVisibility, style.textPosition, style.paddingTop, style.paddingBottom, style.fontSize, style.textOffset, screen1, screen2, localOffsetX, localOffsetY, localRotation, index1, index2, translationData, selectedLanguage]);

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
    const deltaX = ((e.clientX - dragStart.x) / (rect.width / 2)) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    const newOffsetX = Math.max(-50, Math.min(150, localOffsetX + deltaX));
    const newOffsetY = Math.max(-30, Math.min(30, localOffsetY + deltaY));

    setLocalOffsetX(newOffsetX);
    setLocalOffsetY(newOffsetY);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, localOffsetX, localOffsetY]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // Commit changes to parent
      const newSettings1: ScreenshotMockupSettings = {
        ...settings1,
        offsetX: localOffsetX,
        offsetY: localOffsetY,
        rotation: localRotation
      };
      const newSettings2: ScreenshotMockupSettings = {
        ...(screen2.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
        offsetX: localOffsetX - 100,
        offsetY: localOffsetY,
        rotation: localRotation
      };
      onBothSettingsChange(newSettings1, newSettings2);
    }
    setIsDragging(false);
  }, [isDragging, localOffsetX, localOffsetY, localRotation, settings1, screen2.mockupSettings, onBothSettingsChange]);

  // Handle drag (touch for mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.touches[0].clientX - dragStart.x) / (rect.width / 2)) * 100;
    const deltaY = ((e.touches[0].clientY - dragStart.y) / rect.height) * 100;

    const newOffsetX = Math.max(-50, Math.min(150, localOffsetX + deltaX));
    const newOffsetY = Math.max(-30, Math.min(30, localOffsetY + deltaY));

    setLocalOffsetX(newOffsetX);
    setLocalOffsetY(newOffsetY);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    e.preventDefault();
  }, [isDragging, dragStart, localOffsetX, localOffsetY]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      const newSettings1: ScreenshotMockupSettings = {
        ...settings1,
        offsetX: localOffsetX,
        offsetY: localOffsetY,
        rotation: localRotation
      };
      const newSettings2: ScreenshotMockupSettings = {
        ...(screen2.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
        offsetX: localOffsetX - 100,
        offsetY: localOffsetY,
        rotation: localRotation
      };
      onBothSettingsChange(newSettings1, newSettings2);
    }
    setIsDragging(false);
  }, [isDragging, localOffsetX, localOffsetY, localRotation, settings1, screen2.mockupSettings, onBothSettingsChange]);

  const handleRotationChange = (delta: number) => {
    const newRotation = localRotation + delta;
    setLocalRotation(newRotation);

    const newSettings1: ScreenshotMockupSettings = {
      ...settings1,
      rotation: newRotation
    };
    const newSettings2: ScreenshotMockupSettings = {
      ...(screen2.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
      rotation: newRotation
    };
    onBothSettingsChange(newSettings1, newSettings2);
  };

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
  const singleScreenWidth = previewHeight * aspectRatio;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Position indicator - above canvas - hide in readOnly */}
      {!readOnly && (
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          marginBottom: '8px'
        }}>
          {`X:${Math.round(localOffsetX)}% Y:${Math.round(localOffsetY)}% R:${localRotation}°`}
        </div>
      )}

      <div
        ref={containerRef}
        onMouseDown={readOnly ? undefined : handleMouseDown}
        onTouchStart={readOnly ? undefined : handleTouchStart}
        style={{
          cursor: readOnly ? 'default' : (isDragging ? 'grabbing' : 'grab'),
          borderRadius: '16px',
          overflow: 'hidden',
          border: readOnly ? '3px solid transparent' : '3px solid #FF6B4A',
          boxShadow: readOnly ? '0 4px 16px rgba(0,0,0,0.1)' : '0 8px 24px rgba(255, 107, 74, 0.3)',
          position: 'relative',
          touchAction: readOnly ? 'auto' : 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: `${singleScreenWidth * 2}px`,
            height: `${previewHeight}px`,
            display: 'block'
          }}
        />

        {/* Screen labels - hide in readOnly */}
        {!readOnly && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex'
          }}>
            <div
              onClick={() => onSelectIndex(index1)}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: selectedIndex === index1 ? '#FF6B4A' : 'rgba(255,255,255,0.9)',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: selectedIndex === index1 ? '#fff' : '#1d1d1f',
                cursor: 'pointer',
                borderRight: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              {index1 + 1}
            </div>
            <div
              onClick={() => onSelectIndex(index2)}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: selectedIndex === index2 ? '#FF6B4A' : 'rgba(255,255,255,0.9)',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: selectedIndex === index2 ? '#fff' : '#1d1d1f',
                cursor: 'pointer'
              }}
            >
              {index2 + 1}
            </div>
          </div>
        )}
      </div>

      {/* Controls below canvas - hide in readOnly */}
      {!readOnly && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '8px'
        }}>
          {/* Rotation controls */}
          <button
            onClick={() => handleRotationChange(-5)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #d1d1d6',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ↺
          </button>
          <span style={{ fontSize: '13px', color: '#666', minWidth: '40px', textAlign: 'center' }}>
            {localRotation}°
          </span>
          <button
            onClick={() => handleRotationChange(5)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #d1d1d6',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ↻
          </button>

          {/* Unlink button */}
          <button
            onClick={onUnlink}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #d1d1d6',
              backgroundColor: '#fff',
              color: '#FF6B4A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}
            title="Unlink screens"
          >
            🔗
          </button>
        </div>
      )}
    </div>
  );
};

// Helper functions for drawing
function drawBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style: StyleConfig,
  override?: Screenshot['styleOverride']
) {
  const gradient = override?.gradient ?? style.gradient;
  const bgColor = override?.backgroundColor ?? style.backgroundColor;

  if (gradient.enabled) {
    const grad = ctx.createLinearGradient(x, y, x + width, y + height);
    grad.addColorStop(0, gradient.color1);
    grad.addColorStop(1, gradient.color2);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = bgColor;
  }
  ctx.fillRect(x, y, width, height);

  // Draw pattern if present
  if (style.pattern && style.pattern.type !== 'none') {
    drawPreviewPattern(ctx, x, y, width, height, style.pattern);
  }
}

// Draw pattern for preview (simplified for performance)
function drawPreviewPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pattern: StyleConfig['pattern']
) {
  if (!pattern || pattern.type === 'none') return;

  const { type, color, opacity, size, spacing } = pattern;
  const scale = 0.15; // Preview scale factor
  const scaledSize = Math.max(1, size * scale);
  const scaledSpacing = spacing * scale;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);

  switch (type) {
    case 'dots':
      ctx.fillStyle = color;
      for (let px = scaledSpacing / 2; px < width; px += scaledSpacing) {
        for (let py = scaledSpacing / 2; py < height; py += scaledSpacing) {
          ctx.beginPath();
          ctx.arc(px, py, scaledSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;

    case 'grid':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      for (let px = 0; px <= width; px += scaledSpacing) {
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();
      }
      for (let py = 0; py <= height; py += scaledSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }
      break;

    case 'diagonal-lines':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      for (let i = -height; i < width + height; i += scaledSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      break;

    case 'circles':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      for (let px = scaledSpacing; px < width; px += scaledSpacing * 2) {
        for (let py = scaledSpacing; py < height; py += scaledSpacing * 2) {
          ctx.beginPath();
          ctx.arc(px, py, scaledSpacing / 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      break;

    case 'squares':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      const squareSize = scaledSpacing * 0.6;
      for (let px = scaledSpacing / 2; px < width; px += scaledSpacing) {
        for (let py = scaledSpacing / 2; py < height; py += scaledSpacing) {
          ctx.strokeRect(px - squareSize / 2, py - squareSize / 2, squareSize, squareSize);
        }
      }
      break;
  }

  ctx.restore();
}

// Calculate rotated bounding box top position
function getRotatedMockupTop(
  centerY: number,
  mockupWidth: number,
  mockupHeight: number,
  rotationDegrees: number
): number {
  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const bboxHeight = mockupWidth * sin + mockupHeight * cos;
  return centerY - bboxHeight / 2;
}

// Calculate adaptive font size for preview
function calculatePreviewFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string
): number {
  const minFontSize = 8;
  const maxFontSize = 24;

  let low = minFontSize;
  let high = maxFontSize;
  let bestFit = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = `bold ${mid}px ${fontFamily}`;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = mid * 1.3;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFit;
}

// Text segment with highlight info
interface TextSegment {
  text: string;
  highlighted: boolean;
}

// Parsed line with segments
interface ParsedLine {
  segments: TextSegment[];
}

// Parse text with [highlighted] syntax
function parseFormattedText(text: string): ParsedLine[] {
  const rawLines = text.split(/\||\n/);

  return rawLines.map(line => {
    const segments: TextSegment[] = [];
    const regex = /\[([^\]]+)\]|([^\[]+)/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match[1]) {
        segments.push({ text: match[1], highlighted: true });
      } else if (match[2]) {
        segments.push({ text: match[2], highlighted: false });
      }
    }

    return { segments };
  });
}

// Measure line width
function measureLineWidth(ctx: CanvasRenderingContext2D, line: ParsedLine): number {
  return line.segments.reduce((total, seg) => total + ctx.measureText(seg.text).width, 0);
}

// Wrap formatted text
function wrapFormattedText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): ParsedLine[] {
  const parsedLines = parseFormattedText(text);
  const wrappedLines: ParsedLine[] = [];

  for (const line of parsedLines) {
    let currentLine: TextSegment[] = [];
    let currentWidth = 0;

    for (const segment of line.segments) {
      const words = segment.text.split(' ');

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordWithSpace = i > 0 || currentLine.length > 0 ? ' ' + word : word;
        const wordWidth = ctx.measureText(wordWithSpace).width;

        if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
          wrappedLines.push({ segments: currentLine });
          currentLine = [];
          currentWidth = 0;
          currentLine.push({ text: word, highlighted: segment.highlighted });
          currentWidth = ctx.measureText(word).width;
        } else {
          if (currentLine.length > 0 && currentLine[currentLine.length - 1].highlighted === segment.highlighted) {
            currentLine[currentLine.length - 1].text += wordWithSpace;
          } else {
            currentLine.push({ text: wordWithSpace.trimStart() ? wordWithSpace : word, highlighted: segment.highlighted });
          }
          currentWidth += wordWidth;
        }
      }
    }

    if (currentLine.length > 0) {
      wrappedLines.push({ segments: currentLine });
    }
  }

  return wrappedLines;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  canvasHeight: number,
  width: number,
  style: StyleConfig,
  override?: Screenshot['styleOverride'],
  mockupInfo?: { centerY: number; height: number; width: number; rotation: number },
  textOffsetOverride?: { x: number; y: number }
) {
  if (!text) return;

  const textColor = override?.textColor ?? style.textColor;
  const highlightColor = override?.highlightColor ?? style.highlightColor ?? '#FFE135';
  const textPosition = override?.textPosition ?? style.textPosition;
  const maxWidth = width * 0.80; // 10% padding on each side

  // Calculate available text area based on mockup position
  let availableHeight: number;
  let textAreaY: number;

  // Minimum text area height (35% of canvas for reasonable text display with 4+ lines)
  const minTextAreaHeight = canvasHeight * 0.35;

  // Fixed padding values for preview (not scaled from full size)
  const paddingTop = 15; // Fixed 15px top padding for preview
  const gapFromMockup = 10; // Fixed 10px gap between text and mockup

  if (mockupInfo && style.showMockup) {
    const mockupTop = getRotatedMockupTop(
      mockupInfo.centerY,
      mockupInfo.width,
      mockupInfo.height,
      mockupInfo.rotation
    );
    const mockupBottom = mockupInfo.centerY + mockupInfo.height / 2;

    if (textPosition === 'top') {
      // Space above mockup
      const spaceAboveMockup = mockupTop - gapFromMockup - paddingTop;

      if (spaceAboveMockup >= minTextAreaHeight) {
        // Enough space above mockup - use it
        availableHeight = spaceAboveMockup;
        textAreaY = paddingTop;
      } else {
        // Not enough space above mockup - use minimum area from top
        // Text will overlay on mockup, which is acceptable
        availableHeight = minTextAreaHeight;
        textAreaY = paddingTop;
      }
    } else {
      availableHeight = Math.max(canvasHeight - mockupBottom - gapFromMockup - 8, minTextAreaHeight);
      textAreaY = mockupBottom + gapFromMockup;
    }
  } else {
    availableHeight = canvasHeight * 0.35;
    textAreaY = textPosition === 'top' ? paddingTop : canvasHeight - availableHeight - 8;
  }

  // Use consistent font size based on style, only shrink if text doesn't fit
  // Preview scale: convert full-size font (72px) to preview size (~18px)
  const previewScaleFactor = 0.25;
  const targetFontSize = Math.max(12, (style.fontSize ?? 72) * previewScaleFactor);

  // Check if text fits at target size
  ctx.font = `bold ${targetFontSize}px ${style.fontFamily}`;
  let testLines = wrapFormattedText(ctx, text, maxWidth);
  let testLineHeight = targetFontSize * 1.3;
  let testTotalHeight = testLines.length * testLineHeight;

  let fontSize: number;
  if (testTotalHeight <= availableHeight) {
    // Text fits at target size - use it (consistent across all screenshots)
    fontSize = targetFontSize;
  } else {
    // Text doesn't fit - shrink to fit (but maintain minimum readability)
    fontSize = Math.max(10, calculatePreviewFontSize(ctx, text, maxWidth, availableHeight, style.fontFamily));
    // Don't exceed target size
    fontSize = Math.min(fontSize, targetFontSize);
  }

  ctx.font = `bold ${fontSize}px ${style.fontFamily}`;

  const lines = wrapFormattedText(ctx, text, maxWidth);
  const lineHeight = fontSize * 1.3;
  const totalTextHeight = lines.length * lineHeight;

  // Apply text offset
  const effectiveTextOffset = textOffsetOverride ?? style.textOffset ?? { x: 0, y: 0 };
  const textOffsetX = (effectiveTextOffset.x || 0) * width / 100;
  const textOffsetY = (effectiveTextOffset.y || 0) * canvasHeight / 100;

  // Position text within available area
  let textY: number;
  if (textPosition === 'top') {
    textY = textAreaY + fontSize + (availableHeight - totalTextHeight) / 4 + textOffsetY;
  } else {
    textY = textAreaY + (availableHeight - totalTextHeight) / 2 + fontSize + textOffsetY;
  }

  // Draw each line with highlights
  lines.forEach((line, lineIndex) => {
    const y = textY + lineIndex * lineHeight;
    const lineWidth = measureLineWidth(ctx, line);

    // Center the line
    let lineX = x + (width - lineWidth) / 2 + textOffsetX;

    for (const segment of line.segments) {
      const segmentWidth = ctx.measureText(segment.text).width;

      if (segment.highlighted && segment.text.trim()) {
        // Draw highlight background - adaptive padding based on font size
        const paddingH = fontSize * 0.25; // Horizontal padding
        const paddingV = fontSize * 0.15; // Vertical padding
        const radius = fontSize * 0.15;

        ctx.save();
        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.roundRect(
          lineX - paddingH,
          y - fontSize * 0.9 - paddingV,
          segmentWidth + paddingH * 2,
          fontSize * 1.1 + paddingV * 2,
          radius
        );
        ctx.fill();
        ctx.restore();
      }

      // Draw text
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.fillText(segment.text, lineX, y);
      lineX += segmentWidth;
    }
  });
}

// Simple wrap for font size calculation (strips formatting)
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\[|\]/g, '').split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

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
  readOnly = false
}) => {
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
        const mockupScale = Math.max(0.3, Math.min(2.0, style.mockupScale ?? 1));
        const visibilityRatio = style.mockupVisibility === '2/3' ? 2/3 : style.mockupVisibility === '1/2' ? 0.5 : 1;

        // Calculate text area height - use fixed percentage for reliable spacing
        const textAreaHeight = style.textPosition === 'top'
          ? previewHeight * 0.38  // 38% of preview height for text when at top
          : previewHeight * 0.30; // 30% when at bottom

        const availableHeight = previewHeight - textAreaHeight - (40 * previewHeight / dimensions.height);
        const baseMockupHeight = Math.min(availableHeight, previewHeight * 0.75);
        const mockupHeight = baseMockupHeight * mockupScale;
        const mockupWidth = mockupHeight * 0.49;

        // Calculate visible portion
        const visiblePhoneHeight = mockupHeight * visibilityRatio;
        const hiddenHeight = mockupHeight - visiblePhoneHeight;

        // Calculate base position (exact same formula as generatePreviewCanvas)
        let baseMockupCenterX = previewWidth / 2;
        let baseMockupCenterY: number;

        // Scale factor for padding
        const scaleFactor = previewHeight / dimensions.height;

        switch (style.mockupAlignment) {
          case 'top':
            // When text is at top, offset mockup down to leave room for text
            const textAreaOffsetTop = style.textPosition === 'top' ? textAreaHeight : 0;
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

        drawMockupFrame(ctx, style.mockupStyle || 'realistic', mockupWidth, mockupHeight, frameColor, img);

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

// Compact upload card for adding screenshots
const UploadCard: React.FC<{
  onFilesSelected: (files: FileList) => void;
  onAddTextSlide: () => void;
  isCompact?: boolean;
}> = ({ onFilesSelected, onAddTextSlide, isCompact = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  }, [onFilesSelected]);

  const dimensions = DEVICE_SIZES['6.9'];
  const previewHeight = 340;
  const aspectRatio = dimensions.width / dimensions.height;
  const previewWidth = previewHeight * aspectRatio;

  if (isCompact) {
    // Compact version - just an add button card
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: `${previewWidth}px` }}>
        {/* Placeholder to match position indicator height */}
        <div style={{ minHeight: '18px', marginBottom: '6px' }} />
        <div
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            borderRadius: '16px',
            border: isDragging ? '3px solid #FF6B4A' : '3px dashed #d1d1d6',
            backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '20px',
            boxSizing: 'border-box',
            transition: 'all 0.2s'
          }}
        >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
        />
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            width: '100%'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#4caf50'
          }}>
            +
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>
            Add Screenshot
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTextSlide();
          }}
          style={{
            padding: '8px 16px',
            fontSize: '11px',
            fontWeight: 500,
            border: '1px solid #FF6B4A',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#FF6B4A',
            cursor: 'pointer',
            width: '100%',
            maxWidth: '120px'
          }}
        >
          📝 Text Slide
        </button>
        </div>
        {/* Placeholder to align with text input row */}
        <div
          style={{
            width: '100%',
            height: '32px',
            borderRadius: '8px',
            border: '1px dashed #e0e0e5',
            backgroundColor: '#fafafa'
          }}
        />
      </div>
    );
  }

  // Full version - empty state
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      style={{
        padding: '60px 40px',
        borderRadius: '20px',
        border: isDragging ? '3px solid #FF6B4A' : '3px dashed #d1d1d6',
        backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        backgroundColor: '#e8f5e9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px'
      }}>
        📸
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f', margin: '0 0 4px 0' }}>
          Drop screenshots here or click to upload
        </p>
        <p style={{ fontSize: '13px', color: '#86868b', margin: 0 }}>
          PNG or JPG • Max 10 files
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddTextSlide();
        }}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 600,
          border: '1px solid #FF6B4A',
          borderRadius: '10px',
          backgroundColor: '#fff',
          color: '#FF6B4A',
          cursor: 'pointer',
          marginTop: '8px'
        }}
      >
        📝 Or add a text-only slide
      </button>
    </div>
  );
};

export const ScreensFlowEditor: React.FC<Props> = ({
  screenshots,
  selectedIndex,
  onSelectIndex,
  onScreenshotsChange,
  style,
  deviceSize,
  translationData,
  selectedLanguage = 'all',
  onTranslationChange,
  readOnly = false
}) => {
  const maxScreenshots = 10;

  // Handle file upload
  const handleFilesSelected = useCallback((files: FileList) => {
    const remainingSlots = maxScreenshots - screenshots.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newScreenshots: Screenshot[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      text: ''
    }));

    onScreenshotsChange([...screenshots, ...newScreenshots]);
  }, [screenshots, onScreenshotsChange]);

  // Add text-only slide
  const handleAddTextSlide = useCallback(() => {
    if (screenshots.length >= maxScreenshots) return;

    const newScreenshot: Screenshot = {
      id: `${Date.now()}-text`,
      file: null as unknown as File,
      preview: '',
      text: 'Your text here'
    };

    onScreenshotsChange([...screenshots, newScreenshot]);
  }, [screenshots, onScreenshotsChange]);

  // Remove screenshot
  const handleRemoveScreenshot = useCallback((id: string) => {
    const screenshot = screenshots.find(s => s.id === id);
    if (screenshot && screenshot.preview) {
      URL.revokeObjectURL(screenshot.preview);
    }
    onScreenshotsChange(screenshots.filter(s => s.id !== id));
  }, [screenshots, onScreenshotsChange]);

  const updateSettings = (index: number, settings: ScreenshotMockupSettings) => {
    const newScreenshots = screenshots.map((s, i) =>
      i === index ? { ...s, mockupSettings: settings } : s
    );
    onScreenshotsChange(newScreenshots);
  };

  const updateBothSettings = (index1: number, index2: number, s1: ScreenshotMockupSettings, s2: ScreenshotMockupSettings) => {
    const newScreenshots = screenshots.map((s, i) => {
      if (i === index1) return { ...s, mockupSettings: s1 };
      if (i === index2) return { ...s, mockupSettings: s2 };
      return s;
    });
    onScreenshotsChange(newScreenshots);
  };

  const linkScreens = (index: number) => {
    if (index >= screenshots.length - 1) return;

    const screen1Settings = screenshots[index].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
    // Don't copy scale - let it fall back to style.mockupScale
    const { scale: _s1, ...screen1SettingsWithoutScale } = screen1Settings;
    const screen2Settings = screenshots[index + 1].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
    const { scale: _s2, ...screen2SettingsWithoutScale } = screen2Settings;

    // When linking screen1 and screen2:
    // - screen2 uses screen1's screenshot in the mockup (continuation)
    // - screen2's original screenshot moves to screen3 (if exists)
    const screen2Screenshot = {
      file: screenshots[index + 1].file,
      preview: screenshots[index + 1].preview
    };

    const newScreenshots = screenshots.map((s, i) => {
      if (i === index) {
        // Screen 1: mark as linked, position mockup at right edge
        return {
          ...s,
          mockupSettings: {
            ...screen1SettingsWithoutScale,
            linkedToNext: true,
            offsetX: 50 // Start at divider
          }
        };
      }
      if (i === index + 1) {
        // Screen 2: use screen1's screenshot (via linkedMockupIndex), clear its own screenshot
        return {
          ...s,
          file: null,
          preview: '',
          linkedMockupIndex: index,
          mockupSettings: {
            ...screen2SettingsWithoutScale,
            offsetX: -50,
            rotation: screen1Settings.rotation
          }
        };
      }
      if (i === index + 2 && screen2Screenshot.preview) {
        // Screen 3: receives screen2's original screenshot (if screen2 had one)
        return {
          ...s,
          file: screen2Screenshot.file,
          preview: screen2Screenshot.preview
        };
      }
      return s;
    });

    onScreenshotsChange(newScreenshots);
  };

  const unlinkScreens = (index: number) => {
    // When unlinking, restore screen2's mockup to use its own screenshot
    // If screen2 has no screenshot, copy from screen1 (the linked source)
    const screen1 = screenshots[index];

    // Check if screen3 has a screenshot that was originally from screen2
    const screen3 = screenshots[index + 2];
    const restoreFromScreen3 = screen3?.preview && !screen3?.mockupSettings?.linkedToNext;

    const newScreenshots = screenshots.map((s, i) => {
      if (i === index) {
        return {
          ...s,
          mockupSettings: {
            ...(s.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
            linkedToNext: false,
            offsetX: 0
          }
        };
      }
      if (i === index + 1) {
        const { linkedMockupIndex: _, ...rest } = s;
        // Restore screenshot: if screen3 has one, move it back; otherwise use screen1's
        const restoredPreview = restoreFromScreen3 ? screen3.preview : screen1.preview;
        const restoredFile = restoreFromScreen3 ? screen3.file : null;
        return {
          ...rest,
          preview: restoredPreview,
          file: restoredFile,
          mockupSettings: {
            ...(s.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
            offsetX: 0
          }
        };
      }
      if (i === index + 2 && restoreFromScreen3) {
        // Clear screen3's screenshot since we moved it back to screen2
        return {
          ...s,
          preview: '',
          file: null
        };
      }
      return s;
    });

    onScreenshotsChange(newScreenshots);
  };

  // Text editing helpers
  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  const handleTextChange = (id: string, text: string) => {
    onScreenshotsChange(
      screenshots.map(s => s.id === id ? { ...s, text } : s)
    );
  };

  const handleTranslatedTextChange = (index: number, text: string) => {
    if (!translationData || !onTranslationChange || selectedLanguage === 'all') return;
    const newHeadlines = { ...translationData.headlines };
    newHeadlines[selectedLanguage] = [...(newHeadlines[selectedLanguage] || [])];
    newHeadlines[selectedLanguage][index] = text;
    onTranslationChange({ ...translationData, headlines: newHeadlines });
  };

  const getTextValue = (screenshot: Screenshot, index: number): string => {
    if (isEditingTranslation) {
      return translationData.headlines[selectedLanguage]?.[index] || screenshot.text;
    }
    return screenshot.text;
  };

  // Build render list - group linked pairs
  const renderItems: Array<{ type: 'single'; index: number } | { type: 'pair'; index1: number; index2: number }> = [];
  let i = 0;
  while (i < screenshots.length) {
    const screen = screenshots[i];
    if (screen.mockupSettings?.linkedToNext && i < screenshots.length - 1) {
      renderItems.push({ type: 'pair', index1: i, index2: i + 1 });
      i += 2;
    } else {
      renderItems.push({ type: 'single', index: i });
      i += 1;
    }
  }

  // Empty state - show full upload UI
  if (screenshots.length === 0) {
    return (
      <div style={{
        padding: '40px 24px',
        marginTop: '16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <UploadCard
          onFilesSelected={handleFilesSelected}
          onAddTextSlide={handleAddTextSlide}
        />
      </div>
    );
  }

  return (
    <div style={{
      padding: readOnly ? '16px 0' : '20px 24px',
      paddingTop: readOnly ? '16px' : '28px',
      marginTop: readOnly ? '0' : '16px',
      backgroundColor: '#fff',
      borderBottom: readOnly ? 'none' : '1px solid rgba(0, 0, 0, 0.06)'
    }}>
      {!readOnly && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>
            Screens ({screenshots.length}/{maxScreenshots})
          </span>

          <span style={{ fontSize: '12px', color: '#86868b', flex: 1 }}>
            Drag mockups to position • Click ○ to link screens
          </span>

          {/* Align to first button - only aligns Y position, keeps rotation */}
          <button
            onClick={() => {
              if (screenshots.length < 2) return;
              const firstSettings = screenshots[0].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
              const newScreenshots = screenshots.map((s, i) => {
                if (i === 0) return s;
                // Skip linked screens (they share settings with previous)
                if (s.linkedMockupIndex !== undefined) return s;

                // Only update offsetY, preserve everything else including not setting scale
                const currentSettings = s.mockupSettings;
                return {
                  ...s,
                  mockupSettings: {
                    offsetX: currentSettings?.offsetX ?? 0,
                    offsetY: firstSettings.offsetY,
                    rotation: currentSettings?.rotation ?? 0,
                    linkedToNext: currentSettings?.linkedToNext
                    // Don't set scale - let it fall back to style.mockupScale
                  }
                };
              });
              onScreenshotsChange(newScreenshots);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 500,
              border: '1px solid #FF6B4A',
              borderRadius: '6px',
              backgroundColor: '#f0f7ff',
              color: '#FF6B4A',
              cursor: 'pointer'
            }}
          >
            Align to First
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              const newScreenshots = screenshots.map(s => {
                const { mockupSettings: _, linkedMockupIndex: __, ...rest } = s;
                return rest;
              });
              onScreenshotsChange(newScreenshots);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 500,
              border: '1px solid #d1d1d6',
              borderRadius: '6px',
              backgroundColor: '#fff',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            Reset Layout
          </button>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingTop: '12px',
        paddingBottom: '16px',
        alignItems: 'flex-start'
      }}>
        {renderItems.map((item) => {
          if (item.type === 'pair') {
            return (
              <div key={`pair-${item.index1}-scale-${style.mockupScale}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <LinkedPairCanvas
                    screen1={screenshots[item.index1]}
                    screen2={screenshots[item.index2]}
                    index1={item.index1}
                    index2={item.index2}
                    selectedIndex={selectedIndex}
                    style={style}
                    deviceSize={deviceSize}
                    onSelectIndex={onSelectIndex}
                    onBothSettingsChange={(s1, s2) => updateBothSettings(item.index1, item.index2, s1, s2)}
                    onUnlink={() => unlinkScreens(item.index1)}
                    translationData={translationData}
                    selectedLanguage={selectedLanguage}
                    readOnly={readOnly}
                  />
                </div>
                {/* Text inputs for linked pair - hide in readOnly mode */}
                {!readOnly && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[item.index1, item.index2].map((idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={getTextValue(screenshots[idx], idx)}
                        onChange={(e) => {
                          if (isEditingTranslation) {
                            handleTranslatedTextChange(idx, e.target.value);
                          } else {
                            handleTextChange(screenshots[idx].id, e.target.value);
                          }
                        }}
                        placeholder={`Screen ${idx + 1} headline`}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '12px',
                          border: '1px solid #e0e0e5',
                          borderRadius: '8px',
                          outline: 'none',
                          minWidth: 0
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF6B4A';
                          e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 74, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e5';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            const screen = screenshots[item.index];
            const isLastLinkedScreen = item.index > 0 && screenshots[item.index - 1]?.mockupSettings?.linkedToNext;
            if (isLastLinkedScreen) return null; // Skip - already rendered in pair

            return (
              <div key={`${screen.id}-scale-${style.mockupScale}`} style={{ display: 'flex', flexDirection: 'column', gap: readOnly ? '0' : '8px' }}>
                <div style={{ position: 'relative' }}>
                  {/* Delete button - hide in readOnly mode */}
                  {!readOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveScreenshot(screen.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#ff3b30',
                        color: '#fff',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        boxShadow: '0 2px 6px rgba(255,59,48,0.4)'
                      }}
                      title="Remove screenshot"
                    >
                      ×
                    </button>
                  )}
                  <SingleScreenPreview
                    key={`single-${item.index}-scale-${style.mockupScale}`}
                    screenshot={screen}
                    index={item.index}
                    isSelected={item.index === selectedIndex}
                    style={style}
                    deviceSize={deviceSize}
                    onClick={() => onSelectIndex(item.index)}
                    onSettingsChange={(settings) => updateSettings(item.index, settings)}
                    onLinkToNext={() => linkScreens(item.index)}
                    showLinkButton={item.index < screenshots.length - 1}
                    translationData={translationData}
                    selectedLanguage={selectedLanguage}
                    allScreenshots={screenshots}
                    readOnly={readOnly}
                  />
                </div>
                {/* Text input below preview - hide in readOnly mode */}
                {!readOnly && (
                  <input
                    type="text"
                    value={getTextValue(screen, item.index)}
                    onChange={(e) => {
                      if (isEditingTranslation) {
                        handleTranslatedTextChange(item.index, e.target.value);
                      } else {
                        handleTextChange(screen.id, e.target.value);
                      }
                    }}
                    placeholder={`Screen ${item.index + 1} headline`}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12px',
                      border: '1px solid #e0e0e5',
                      borderRadius: '8px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FF6B4A';
                      e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 74, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e5';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}
              </div>
            );
          }
        })}

        {/* Add more screenshots - hide in readOnly mode */}
        {!readOnly && screenshots.length < maxScreenshots && (
          <UploadCard
            onFilesSelected={handleFilesSelected}
            onAddTextSlide={handleAddTextSlide}
            isCompact
          />
        )}
      </div>
    </div>
  );
};
