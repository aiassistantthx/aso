import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES, TranslationData, ScreenshotMockupSettings } from '../../types';
import { DEFAULT_MOCKUP_SETTINGS } from './types';
import { drawBackground, drawMockupFrame, drawText } from './drawHelpers';

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
  const cachedImgRef = useRef<{ src: string; img: HTMLImageElement } | null>(null);
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

  // Full canvas draw using a loaded image (or null if no mockup)
  const drawCanvas = useCallback((loadedImg: HTMLImageElement | null) => {
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

    const currentMockupScale = Math.max(0.3, Math.min(2.0, style.mockupScale ?? 1.0));
    const visibilityRatio = style.mockupVisibility === '2/3' ? 2/3 : style.mockupVisibility === '1/2' ? 0.5 : 1;

    const textAreaHeightForMockup = previewHeight * 0.35;

    const availableHeight = previewHeight - textAreaHeightForMockup - (40 * previewHeight / dimensions.height);
    const baseMockupHeight = Math.min(availableHeight, previewHeight * 0.75);
    const mockupHeight = baseMockupHeight * currentMockupScale;
    const phoneAspectLinked = dimensions.platform === 'android' ? 0.459 : 0.49;
    const mockupWidth = mockupHeight * phoneAspectLinked;

    const visiblePhoneHeight = mockupHeight * visibilityRatio;
    const hiddenHeight = mockupHeight - visiblePhoneHeight;

    let baseMockupCenterX = singleScreenWidth / 2;
    let baseMockupCenterY: number;

    const scaleFactor = previewHeight / dimensions.height;

    switch (style.mockupAlignment) {
      case 'top': {
        const textAreaOffsetTop = style.textPosition === 'top' ? textAreaHeightForMockup : 0;
        baseMockupCenterY = textAreaOffsetTop - hiddenHeight + mockupHeight / 2;
        break;
      }
      case 'bottom':
        baseMockupCenterY = previewHeight - visiblePhoneHeight - (40 * scaleFactor) + mockupHeight / 2;
        break;
      case 'center':
      default:
        baseMockupCenterY = (previewHeight - mockupHeight) / 2 + mockupHeight / 2;
        break;
    }

    const mockupCenterX = baseMockupCenterX + (localOffsetX / 100) * singleScreenWidth;
    const mockupCenterY = baseMockupCenterY + (localOffsetY / 100) * previewHeight;
    const frameColor = style.mockupColor === 'white' ? '#F5F5F7' :
                      style.mockupColor === 'natural' ? '#E3D5C8' : '#1D1D1F';
    const currentRotation = localRotation;
    const currentMockupStyle = style.mockupStyle || 'realistic';

    if (loadedImg && style.showMockup) {
      ctx.save();
      ctx.translate(mockupCenterX, mockupCenterY);
      ctx.rotate((currentRotation * Math.PI) / 180);

      const isAndroid = dimensions.platform === 'android';
      drawMockupFrame(ctx, currentMockupStyle, mockupWidth, mockupHeight, frameColor, loadedImg, isAndroid);

      ctx.restore();

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
    } else {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, style, screen1, screen2, localOffsetX, localOffsetY, localRotation, index1, index2, translationData, selectedLanguage]);

  // Draw canvas — cache mockup image in ref for instant redraws on style changes
  useEffect(() => {
    const mockupSrc = screen1.preview;

    if (mockupSrc && style.showMockup) {
      // Reuse cached image if URL hasn't changed
      if (cachedImgRef.current && cachedImgRef.current.src === mockupSrc) {
        drawCanvas(cachedImgRef.current.img);
        return;
      }

      // Load new image and cache it
      const img = new Image();
      img.onload = () => {
        cachedImgRef.current = { src: mockupSrc, img };
        drawCanvas(img);
      };
      img.src = mockupSrc;
      if (img.complete && img.naturalWidth > 0) {
        cachedImgRef.current = { src: mockupSrc, img };
        drawCanvas(img);
      }
    } else {
      cachedImgRef.current = null;
      drawCanvas(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawCanvas]);

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

export { LinkedPairCanvas };
