import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES, TranslationData, ScreenshotMockupSettings } from '../../types';
import { DragMode, DEFAULT_MOCKUP_SETTINGS } from './types';
import { drawBackground, drawMockupFrame, drawText } from './drawHelpers';

interface Props {
  screen1: Screenshot;
  screen2: Screenshot;
  index1: number;
  index2: number;
  selectedIndex: number;
  style: StyleConfig;
  onStyleChange: (style: StyleConfig) => void;
  deviceSize: DeviceSize;
  onSelectIndex: (index: number) => void;
  onBothSettingsChange: (s1: ScreenshotMockupSettings, s2: ScreenshotMockupSettings) => void;
  onUnlink: () => void;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  dragMode: DragMode;
}

export const LinkedPairCanvas: React.FC<Props> = ({
  screen1, screen2, index1, index2, selectedIndex,
  style, onStyleChange, deviceSize, onSelectIndex,
  onBothSettingsChange, onUnlink, translationData,
  selectedLanguage = 'all', dragMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [localOffsetX, setLocalOffsetX] = useState(0);
  const [localOffsetY, setLocalOffsetY] = useState(0);
  const [localRotation, setLocalRotation] = useState(0);

  const settings1 = screen1.mockupSettings || DEFAULT_MOCKUP_SETTINGS;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isCancelled = false;
    const previewHeight = 420;
    const aspectRatio = dimensions.width / dimensions.height;
    const singleScreenWidth = previewHeight * aspectRatio;
    const combinedWidth = singleScreenWidth * 2;

    canvas.width = combinedWidth * 2;
    canvas.height = previewHeight * 2;
    ctx.scale(2, 2);

    drawBackground(ctx, 0, 0, singleScreenWidth, previewHeight, style, screen1.styleOverride);
    drawBackground(ctx, singleScreenWidth, 0, singleScreenWidth, previewHeight, style, screen2.styleOverride);

    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(singleScreenWidth, 0);
    ctx.lineTo(singleScreenWidth, previewHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    const currentMockupScale = screen1.mockupSettings?.scale ?? style.mockupScale ?? 1.0;
    const mockupCenterX = singleScreenWidth * (0.5 + localOffsetX / 100);
    const mockupCenterY = previewHeight * (0.5 + localOffsetY / 100);
    const mockupHeight = previewHeight * 0.7 * currentMockupScale;
    const mockupWidth = mockupHeight * 0.49;
    const frameColor = style.mockupColor === 'white' ? '#F5F5F7' :
                      style.mockupColor === 'natural' ? '#E3D5C8' : '#1D1D1F';
    const currentRotation = localRotation;
    const currentMockupStyle = style.mockupStyle || 'realistic';

    if (screen1.preview && style.showMockup) {
      const img = new Image();
      img.onload = () => {
        if (isCancelled) return;
        ctx.save();
        ctx.translate(mockupCenterX, mockupCenterY);
        ctx.rotate((currentRotation * Math.PI) / 180);
        drawMockupFrame(ctx, currentMockupStyle, mockupWidth, mockupHeight, frameColor, img);
        ctx.restore();

        const mockupInfo = { centerY: mockupCenterY, height: mockupHeight, width: mockupWidth, rotation: currentRotation };
        drawText(ctx, getDisplayText(screen1, index1), 0, previewHeight, singleScreenWidth, style, screen1.styleOverride, mockupInfo);
        drawText(ctx, getDisplayText(screen2, index2), singleScreenWidth, previewHeight, singleScreenWidth, style, screen2.styleOverride, mockupInfo);
      };
      img.src = screen1.preview;
    } else {
      drawText(ctx, getDisplayText(screen1, index1), 0, previewHeight, singleScreenWidth, style, screen1.styleOverride, undefined);
      drawText(ctx, getDisplayText(screen2, index2), singleScreenWidth, previewHeight, singleScreenWidth, style, screen2.styleOverride, undefined);
    }

    return () => { isCancelled = true; };
  }, [dimensions, style, style.mockupScale, screen1, screen2, localOffsetX, localOffsetY, localRotation, index1, index2, translationData, selectedLanguage]);

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

    if (dragMode === 'text') {
      onStyleChange({
        ...style,
        textOffset: {
          x: Math.max(-50, Math.min(50, (style.textOffset?.x || 0) + deltaX)),
          y: Math.max(-50, Math.min(50, (style.textOffset?.y || 0) + deltaY))
        }
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      setLocalOffsetX(Math.max(-50, Math.min(150, localOffsetX + deltaX)));
      setLocalOffsetY(Math.max(-30, Math.min(30, localOffsetY + deltaY)));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart, localOffsetX, localOffsetY, dragMode, style, onStyleChange]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      const newSettings1: ScreenshotMockupSettings = { ...settings1, offsetX: localOffsetX, offsetY: localOffsetY, rotation: localRotation };
      const newSettings2: ScreenshotMockupSettings = {
        ...(screen2.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
        offsetX: localOffsetX - 100, offsetY: localOffsetY, rotation: localRotation
      };
      onBothSettingsChange(newSettings1, newSettings2);
    }
    setIsDragging(false);
  }, [isDragging, localOffsetX, localOffsetY, localRotation, settings1, screen2.mockupSettings, onBothSettingsChange]);

  const handleRotationChange = (delta: number) => {
    const newRotation = localRotation + delta;
    setLocalRotation(newRotation);
    const newSettings1: ScreenshotMockupSettings = { ...settings1, rotation: newRotation };
    const newSettings2: ScreenshotMockupSettings = {
      ...(screen2.mockupSettings || DEFAULT_MOCKUP_SETTINGS), rotation: newRotation
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

  const previewHeight = 420;
  const aspectRatio = dimensions.width / dimensions.height;
  const singleScreenWidth = previewHeight * aspectRatio;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        backgroundColor: dragMode === 'text' ? 'rgba(0,113,227,0.85)' : 'rgba(0,0,0,0.7)',
        color: '#fff', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', marginBottom: '8px'
      }}>
        {dragMode === 'text'
          ? `Text: X:${Math.round(style.textOffset?.x || 0)}% Y:${Math.round(style.textOffset?.y || 0)}%`
          : `X:${Math.round(localOffsetX)}% Y:${Math.round(localOffsetY)}% R:${localRotation}°`}
      </div>

      <div ref={containerRef} onMouseDown={handleMouseDown} style={{
        cursor: isDragging ? 'grabbing' : 'grab', borderRadius: '16px', overflow: 'hidden',
        border: '3px solid #0071e3', boxShadow: '0 8px 24px rgba(0, 113, 227, 0.3)', position: 'relative'
      }}>
        <canvas ref={canvasRef} style={{ width: `${singleScreenWidth * 2}px`, height: `${previewHeight}px`, display: 'block' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex' }}>
          {[{ idx: index1, border: 'right' }, { idx: index2, border: '' }].map(({ idx, border }) => (
            <div key={idx} onClick={() => onSelectIndex(idx)} style={{
              flex: 1, padding: '8px',
              backgroundColor: selectedIndex === idx ? '#0071e3' : 'rgba(255,255,255,0.9)',
              textAlign: 'center', fontSize: '13px', fontWeight: 600,
              color: selectedIndex === idx ? '#fff' : '#1d1d1f',
              cursor: 'pointer', ...(border ? { borderRight: '1px solid rgba(0,0,0,0.1)' } : {})
            }}>{idx + 1}</div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
        {[-5, 5].map((delta) => (
          <button key={delta} onClick={() => handleRotationChange(delta)} style={{
            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #d1d1d6',
            backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px'
          }}>{delta < 0 ? '↺' : '↻'}</button>
        ))}
        <span style={{ fontSize: '13px', color: '#666', minWidth: '40px', textAlign: 'center' }}>{localRotation}°</span>
        <button onClick={onUnlink} style={{
          width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #d1d1d6',
          backgroundColor: '#fff', color: '#0071e3', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
        }} title="Unlink screens">🔗</button>
      </div>
    </div>
  );
};
