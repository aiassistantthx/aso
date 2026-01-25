import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, DEVICE_SIZES } from '../types';
import { generatePreviewCanvas, getElementBounds } from '../services/canvas';

interface Props {
  screenshots: Screenshot[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  style: StyleConfig;
  deviceSize: DeviceSize;
  onStyleChange: (style: StyleConfig) => void;
}

type DragTarget = 'mockup' | 'text' | { type: 'decoration'; index: number } | null;

const cssStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f'
  },
  previewWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8ed',
    borderRadius: '12px',
    padding: '24px',
    minHeight: '400px',
    position: 'relative'
  },
  canvas: {
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    cursor: 'move'
  },
  thumbnailStrip: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    padding: '4px 0'
  },
  thumbnail: {
    width: '60px',
    height: '100px',
    borderRadius: '6px',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s',
    flexShrink: 0
  },
  thumbnailActive: {
    borderColor: '#0071e3'
  },
  textOnlyThumbnail: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '8px',
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
    padding: '6px 12px',
    fontSize: '12px',
    border: '1px solid #d2d2d7',
    borderRadius: '6px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    marginTop: '8px'
  },
  dragHint: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#86868b',
    marginTop: '4px'
  }
};

export const Preview: React.FC<Props> = ({
  screenshots,
  selectedIndex,
  onSelectIndex,
  onScreenshotsChange,
  style,
  deviceSize,
  onStyleChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedScreenshot = screenshots[selectedIndex];
  const decorations = selectedScreenshot?.decorations || [];

  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });

  // Calculate scale factor for preview
  const dimensions = DEVICE_SIZES[deviceSize];
  const scale = Math.min(400 / dimensions.width, 600 / dimensions.height);

  useEffect(() => {
    if (canvasRef.current) {
      generatePreviewCanvas(canvasRef.current, {
        screenshot: selectedScreenshot?.preview || null,
        text: selectedScreenshot?.text || 'Your headline here',
        style,
        deviceSize,
        decorations: selectedScreenshot?.decorations
      });
    }
  }, [selectedScreenshot, style, deviceSize]);

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
    // Check decorations first (they're on top)
    for (let i = decorations.length - 1; i >= 0; i--) {
      const dec = decorations[i];
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

    const bounds = getElementBounds(style, deviceSize);

    // Check mockup bounds
    if (style.showMockup) {
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
  }, [style, deviceSize, decorations]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    const target = hitTest(coords.x, coords.y);

    if (target) {
      setIsDragging(true);
      setDragTarget(target);
      setDragStart(coords);

      if (target === 'mockup') {
        setInitialOffset(style.mockupOffset);
      } else if (target === 'text') {
        setInitialOffset(style.textOffset);
      } else if (typeof target === 'object' && target.type === 'decoration') {
        const dec = decorations[target.index];
        setInitialOffset(dec.position);
      }
      e.preventDefault();
    }
  }, [getCanvasCoordinates, hitTest, style.mockupOffset, style.textOffset, decorations]);

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
      onStyleChange({ ...style, mockupOffset: newPosition });
    } else if (dragTarget === 'text') {
      onStyleChange({ ...style, textOffset: newPosition });
    } else if (typeof dragTarget === 'object' && dragTarget.type === 'decoration') {
      // Update decoration position
      const newDecorations = decorations.map((dec, i) =>
        i === dragTarget.index ? { ...dec, position: newPosition } : dec
      );
      const newScreenshots = screenshots.map((s, i) =>
        i === selectedIndex ? { ...s, decorations: newDecorations } : s
      );
      onScreenshotsChange(newScreenshots);
    }
  }, [isDragging, dragTarget, getCanvasCoordinates, dragStart, initialOffset, onStyleChange, style, decorations, screenshots, selectedIndex, onScreenshotsChange]);

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
    onStyleChange({
      ...style,
      mockupOffset: { x: 0, y: 0 },
      textOffset: { x: 0, y: 0 }
    });
  }, [onStyleChange, style]);

  const hasCustomPosition = style.mockupOffset.x !== 0 || style.mockupOffset.y !== 0 ||
                            style.textOffset.x !== 0 || style.textOffset.y !== 0;

  return (
    <div style={cssStyles.container as React.CSSProperties}>
      <label style={cssStyles.label}>Preview</label>

      <div style={cssStyles.previewWrapper as React.CSSProperties}>
        <canvas
          ref={canvasRef}
          style={{
            ...cssStyles.canvas,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      <p style={cssStyles.dragHint as React.CSSProperties}>
        Drag to move elements (mockup, text, decorations)
      </p>

      {hasCustomPosition && (
        <button style={cssStyles.resetButton} onClick={resetPositions}>
          Reset Positions
        </button>
      )}

      {screenshots.length === 0 && (
        <p style={cssStyles.hint as React.CSSProperties}>
          Upload a screenshot to see it in the mockup
        </p>
      )}

      {screenshots.length > 1 && (
        <div style={cssStyles.thumbnailStrip}>
          {screenshots.map((screenshot, index) => (
            screenshot.preview ? (
              <img
                key={screenshot.id}
                src={screenshot.preview}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  ...cssStyles.thumbnail,
                  ...(index === selectedIndex ? cssStyles.thumbnailActive : {})
                }}
                onClick={() => onSelectIndex(index)}
              />
            ) : (
              <div
                key={screenshot.id}
                style={{
                  ...cssStyles.thumbnail,
                  ...cssStyles.textOnlyThumbnail,
                  ...(index === selectedIndex ? cssStyles.thumbnailActive : {})
                }}
                onClick={() => onSelectIndex(index)}
              >
                Text Only
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};
