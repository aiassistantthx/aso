import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES, TranslationData, ScreenshotMockupSettings, MockupStyle } from '../types';

interface Props {
  screenshots: Screenshot[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  style: StyleConfig;
  deviceSize: DeviceSize;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
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
  selectedLanguage = 'all'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
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

  // Load image once
  useEffect(() => {
    if (screen1.preview) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        // Trigger redraw
        drawCanvas();
      };
      img.src = screen1.preview;
    }
  }, [screen1.preview]);

  // Draw function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    // Draw mockup
    const img = imageRef.current;
    if (img && style.showMockup) {
      const mockupCenterX = singleScreenWidth * (0.5 + localOffsetX / 100);
      const mockupCenterY = previewHeight * (0.5 + localOffsetY / 100);
      const mockupScale = settings1.scale || 1.0;
      const mockupHeight = previewHeight * 0.7 * mockupScale;
      const mockupWidth = mockupHeight * 0.49;
      const frameColor = style.mockupColor === 'white' ? '#F5F5F7' :
                        style.mockupColor === 'natural' ? '#E3D5C8' : '#1D1D1F';

      ctx.save();
      ctx.translate(mockupCenterX, mockupCenterY);
      ctx.rotate((localRotation * Math.PI) / 180);

      drawMockupFrame(ctx, style.mockupStyle || 'realistic', mockupWidth, mockupHeight, frameColor, img);

      ctx.restore();
    }

    // Draw text
    drawText(ctx, getDisplayText(screen1, index1), 0, previewHeight, singleScreenWidth, style, screen1.styleOverride);
    drawText(ctx, getDisplayText(screen2, index2), singleScreenWidth, previewHeight, singleScreenWidth, style, screen2.styleOverride);
  }, [dimensions, style, screen1, screen2, localOffsetX, localOffsetY, localRotation, settings1.scale, index1, index2, translationData, selectedLanguage]);

  // Redraw on changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle drag
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
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const previewHeight = 340;
  const aspectRatio = dimensions.width / dimensions.height;
  const singleScreenWidth = previewHeight * aspectRatio;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '3px solid #0071e3',
          boxShadow: '0 8px 24px rgba(0, 113, 227, 0.3)',
          position: 'relative'
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

        {/* Screen labels */}
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
              backgroundColor: selectedIndex === index1 ? '#0071e3' : 'rgba(255,255,255,0.9)',
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
              backgroundColor: selectedIndex === index2 ? '#0071e3' : 'rgba(255,255,255,0.9)',
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

        {/* Unlink button */}
        <button
          onClick={onUnlink}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '2px solid #fff',
            backgroundColor: '#0071e3',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10
          }}
          title="Unlink screens"
        >
          🔗
        </button>

        {/* Position indicator */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: '8px',
          fontSize: '11px'
        }}>
          X:{Math.round(localOffsetX)}% Y:{Math.round(localOffsetY)}% R:{localRotation}°
        </div>
      </div>

      {/* Rotation controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px'
      }}>
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
      </div>
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
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  _canvasHeight: number,
  width: number,
  style: StyleConfig,
  override?: Screenshot['styleOverride']
) {
  if (!text) return;

  const textColor = override?.textColor ?? style.textColor;
  const fontSize = Math.min(16, style.fontSize * 0.15);

  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
  ctx.textAlign = 'center';

  const textY = style.paddingTop * 0.15 + fontSize;
  const maxWidth = width * 0.85;
  const lines = wrapText(ctx, text, maxWidth);

  lines.forEach((line, i) => {
    ctx.fillText(line, x + width / 2, textY + i * fontSize * 1.3);
  });
}

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
  allScreenshots
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
        const mockupCenterX = previewWidth * (0.5 + settings.offsetX / 100);
        const mockupCenterY = previewHeight * (0.5 + settings.offsetY / 100);
        const mockupHeight = previewHeight * 0.7 * (settings.scale || 1);
        const mockupWidth = mockupHeight * 0.49;
        const frameColor = style.mockupColor === 'white' ? '#F5F5F7' :
                          style.mockupColor === 'natural' ? '#E3D5C8' : '#1D1D1F';

        ctx.save();
        ctx.translate(mockupCenterX, mockupCenterY);
        ctx.rotate((settings.rotation * Math.PI) / 180);

        drawMockupFrame(ctx, style.mockupStyle || 'realistic', mockupWidth, mockupHeight, frameColor, img);

        ctx.restore();

        // Draw text
        drawText(ctx, getDisplayText(), 0, previewHeight, previewWidth, style, screenshot.styleOverride);
      };
      img.src = mockupScreenshot;
    } else {
      drawText(ctx, getDisplayText(), 0, previewHeight, previewWidth, style, screenshot.styleOverride);
    }
  }, [screenshot, style, deviceSize, settings, translationData, selectedLanguage, allScreenshots]);

  // Handle drag
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

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const previewHeight = 340;
  const aspectRatio = dimensions.width / dimensions.height;
  const previewWidth = previewHeight * aspectRatio;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          ref={containerRef}
          onClick={onClick}
          onMouseDown={handleMouseDown}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            borderRadius: '16px',
            overflow: 'hidden',
            border: isSelected ? '3px solid #0071e3' : '3px solid transparent',
            boxShadow: isSelected ? '0 8px 24px rgba(0, 113, 227, 0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
            position: 'relative'
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

          {/* Screen number */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px',
            backgroundColor: isSelected ? '#0071e3' : 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 600,
            color: isSelected ? '#fff' : '#1d1d1f'
          }}>
            {index + 1}
          </div>

          {/* Position indicator */}
          {(settings.offsetX !== 0 || settings.offsetY !== 0) && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px'
            }}>
              X:{Math.round(settings.offsetX)}% Y:{Math.round(settings.offsetY)}%
            </div>
          )}
        </div>

        {/* Rotation controls */}
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
      </div>

      {/* Link button */}
      {showLinkButton && (
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

export const ScreensFlowEditor: React.FC<Props> = ({
  screenshots,
  selectedIndex,
  onSelectIndex,
  onScreenshotsChange,
  style,
  deviceSize,
  translationData,
  selectedLanguage = 'all'
}) => {

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

    const newScreenshots = screenshots.map((s, i) => {
      if (i === index) {
        return {
          ...s,
          mockupSettings: {
            ...screen1Settings,
            linkedToNext: true,
            offsetX: 50 // Start at divider
          }
        };
      }
      if (i === index + 1) {
        return {
          ...s,
          linkedMockupIndex: index,
          mockupSettings: {
            ...(s.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
            offsetX: -50,
            rotation: screen1Settings.rotation
          }
        };
      }
      return s;
    });

    onScreenshotsChange(newScreenshots);
  };

  const unlinkScreens = (index: number) => {
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
        return {
          ...rest,
          mockupSettings: {
            ...(s.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
            offsetX: 0
          }
        };
      }
      return s;
    });

    onScreenshotsChange(newScreenshots);
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

  return (
    <div style={{
      padding: '20px 24px',
      backgroundColor: '#fff',
      borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>
          Screens Flow ({screenshots.length})
        </span>
        <span style={{ fontSize: '12px', color: '#86868b' }}>
          Drag mockups to position • Click ○ to link screens
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '16px',
        alignItems: 'flex-start'
      }}>
        {renderItems.map((item) => {
          if (item.type === 'pair') {
            return (
              <LinkedPairCanvas
                key={`pair-${item.index1}`}
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
              />
            );
          } else {
            const screen = screenshots[item.index];
            const isLastLinkedScreen = item.index > 0 && screenshots[item.index - 1]?.mockupSettings?.linkedToNext;
            if (isLastLinkedScreen) return null; // Skip - already rendered in pair

            return (
              <SingleScreenPreview
                key={screen.id}
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
              />
            );
          }
        })}
      </div>

      {/* Reset button */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={() => {
            const newScreenshots = screenshots.map(s => {
              const { mockupSettings: _, linkedMockupIndex: __, ...rest } = s;
              return rest;
            });
            onScreenshotsChange(newScreenshots);
          }}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 500,
            border: '1px solid #d1d1d6',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#666',
            cursor: 'pointer'
          }}
        >
          Reset All
        </button>
      </div>
    </div>
  );
};
