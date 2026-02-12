import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES, TranslationData, ScreenshotMockupSettings } from '../../types';
import { DragMode, DEFAULT_MOCKUP_SETTINGS } from './types';
import { drawBackground, drawMockupFrame, drawText } from './drawHelpers';

interface Props {
  screenshot: Screenshot;
  index: number;
  isSelected: boolean;
  style: StyleConfig;
  deviceSize: DeviceSize;
  onClick: () => void;
  onSettingsChange: (settings: ScreenshotMockupSettings) => void;
  onStyleChange: (style: StyleConfig) => void;
  onLinkToNext: () => void;
  showLinkButton: boolean;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  allScreenshots: Screenshot[];
  dragMode: DragMode;
}

export const SingleScreenPreview: React.FC<Props> = ({
  screenshot, index, isSelected, style, deviceSize, onClick,
  onSettingsChange, onStyleChange, onLinkToNext, showLinkButton,
  translationData, selectedLanguage = 'all', allScreenshots, dragMode
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewHeight = 420;
    const aspectRatio = dimensions.width / dimensions.height;
    const previewWidth = previewHeight * aspectRatio;

    canvas.width = previewWidth * 2;
    canvas.height = previewHeight * 2;
    ctx.scale(2, 2);

    drawBackground(ctx, 0, 0, previewWidth, previewHeight, style, screenshot.styleOverride);

    const mockupScreenshot = getMockupScreenshot();
    if (mockupScreenshot && style.showMockup) {
      const img = new Image();
      img.onload = () => {
        const mockupCenterX = previewWidth * (0.5 + settings.offsetX / 100);
        const mockupCenterY = previewHeight * (0.5 + settings.offsetY / 100);
        const mockupHeight = previewHeight * 0.7 * (screenshot.mockupSettings?.scale ?? style.mockupScale ?? 1);
        const mockupWidth = mockupHeight * 0.49;
        const frameColor = style.mockupColor === 'white' ? '#F5F5F7' :
                          style.mockupColor === 'natural' ? '#E3D5C8' : '#1D1D1F';

        ctx.save();
        ctx.translate(mockupCenterX, mockupCenterY);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        drawMockupFrame(ctx, style.mockupStyle || 'realistic', mockupWidth, mockupHeight, frameColor, img);
        ctx.restore();

        const mockupInfo = { centerY: mockupCenterY, height: mockupHeight, width: mockupWidth, rotation: settings.rotation };
        drawText(ctx, getDisplayText(), 0, previewHeight, previewWidth, style, screenshot.styleOverride, mockupInfo);
      };
      img.src = mockupScreenshot;
    } else {
      drawText(ctx, getDisplayText(), 0, previewHeight, previewWidth, style, screenshot.styleOverride, undefined);
    }
  }, [screenshot, style, style.mockupScale, deviceSize, settings, translationData, selectedLanguage, allScreenshots]);

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

    if (dragMode === 'text') {
      onStyleChange({
        ...style,
        textOffset: {
          x: Math.max(-50, Math.min(50, (style.textOffset?.x || 0) + deltaX)),
          y: Math.max(-50, Math.min(50, (style.textOffset?.y || 0) + deltaY))
        }
      });
    } else {
      onSettingsChange({
        ...settings,
        offsetX: Math.max(-80, Math.min(80, settings.offsetX + deltaX)),
        offsetY: Math.max(-30, Math.min(30, settings.offsetY + deltaY))
      });
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, settings, onSettingsChange, dragMode, style, onStyleChange]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); }, []);

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

  const previewHeight = 420;
  const aspectRatio = dimensions.width / dimensions.height;
  const previewWidth = previewHeight * aspectRatio;

  const hasOffset = dragMode === 'mockup'
    ? (settings.offsetX !== 0 || settings.offsetY !== 0 || settings.rotation !== 0)
    : (style.textOffset?.x !== 0 || style.textOffset?.y !== 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {hasOffset && (
          <div style={{
            backgroundColor: dragMode === 'text' ? 'rgba(0,113,227,0.85)' : 'rgba(0,0,0,0.7)',
            color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', marginBottom: '6px'
          }}>
            {dragMode === 'text'
              ? `Text: X:${Math.round(style.textOffset?.x || 0)}% Y:${Math.round(style.textOffset?.y || 0)}%`
              : `X:${Math.round(settings.offsetX)}% Y:${Math.round(settings.offsetY)}%`}
          </div>
        )}

        <div ref={containerRef} onClick={onClick} onMouseDown={handleMouseDown} style={{
          cursor: isDragging ? 'grabbing' : 'grab', borderRadius: '16px', overflow: 'hidden',
          border: isSelected ? '3px solid #0071e3' : '3px solid transparent',
          boxShadow: isSelected ? '0 8px 24px rgba(0, 113, 227, 0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <canvas ref={canvasRef} style={{ width: `${previewWidth}px`, height: `${previewHeight}px`, display: 'block' }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px',
            backgroundColor: isSelected ? '#0071e3' : 'rgba(255,255,255,0.9)',
            textAlign: 'center', fontSize: '13px', fontWeight: 600,
            color: isSelected ? '#fff' : '#1d1d1f'
          }}>{index + 1}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
          <button onClick={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, rotation: settings.rotation - 5 }); }}
            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d1d1d6', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' }}>↺</button>
          <span style={{ fontSize: '12px', color: '#666', minWidth: '36px', textAlign: 'center' }}>{settings.rotation}°</span>
          <button onClick={(e) => { e.stopPropagation(); onSettingsChange({ ...settings, rotation: settings.rotation + 5 }); }}
            style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #d1d1d6', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' }}>↻</button>
        </div>
      </div>

      {showLinkButton && (
        <button onClick={onLinkToNext} style={{
          width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #d1d1d6',
          backgroundColor: '#fff', color: '#86868b', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', marginLeft: '8px', marginRight: '8px',
          transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }} title="Link with next screen">○</button>
      )}
    </div>
  );
};
