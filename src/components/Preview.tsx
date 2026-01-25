import React, { useRef, useEffect } from 'react';
import { Screenshot, StyleConfig, DeviceSize } from '../types';
import { generatePreviewCanvas } from '../services/canvas';

interface Props {
  screenshots: Screenshot[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  style: StyleConfig;
  deviceSize: DeviceSize;
}

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
    minHeight: '400px'
  },
  canvas: {
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
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
  hint: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#86868b',
    marginTop: '8px'
  }
};

export const Preview: React.FC<Props> = ({
  screenshots,
  selectedIndex,
  onSelectIndex,
  style,
  deviceSize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedScreenshot = screenshots[selectedIndex];

  useEffect(() => {
    if (canvasRef.current) {
      generatePreviewCanvas(canvasRef.current, {
        screenshot: selectedScreenshot?.preview || null,
        text: selectedScreenshot?.text || 'Your headline here',
        style,
        deviceSize
      });
    }
  }, [selectedScreenshot, style, deviceSize]);

  return (
    <div style={cssStyles.container as React.CSSProperties}>
      <label style={cssStyles.label}>Preview</label>

      <div style={cssStyles.previewWrapper}>
        <canvas ref={canvasRef} style={cssStyles.canvas} />
      </div>

      {screenshots.length === 0 && (
        <p style={cssStyles.hint as React.CSSProperties}>
          Upload a screenshot to see it in the mockup
        </p>
      )}

      {screenshots.length > 1 && (
        <div style={cssStyles.thumbnailStrip}>
          {screenshots.map((screenshot, index) => (
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
          ))}
        </div>
      )}
    </div>
  );
};
