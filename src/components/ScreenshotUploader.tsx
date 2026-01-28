import React, { useCallback, useState } from 'react';
import { Screenshot } from '../types';

interface Props {
  screenshots: Screenshot[];
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  maxScreenshots?: number;
}

const styles: Record<string, React.CSSProperties> = {
  labelIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#e8f5e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  dropzone: {
    border: '2px dashed #d2d2d7',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#fafafa',
    position: 'relative',
    overflow: 'hidden'
  },
  dropzoneActive: {
    borderColor: '#0071e3',
    backgroundColor: '#f0f7ff',
    transform: 'scale(1.02)',
    boxShadow: '0 0 0 4px rgba(0, 113, 227, 0.1)'
  }
};

export const ScreenshotUploader: React.FC<Props> = ({
  screenshots,
  onScreenshotsChange,
  maxScreenshots = 10
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxScreenshots - screenshots.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newScreenshots: Screenshot[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      text: ''
    }));

    onScreenshotsChange([...screenshots, ...newScreenshots]);
  }, [screenshots, onScreenshotsChange, maxScreenshots]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleAddTextOnly = useCallback(() => {
    if (screenshots.length >= maxScreenshots) return;

    const newScreenshot: Screenshot = {
      id: `${Date.now()}-text`,
      file: null as unknown as File,
      preview: '',
      text: 'Your text here'
    };

    onScreenshotsChange([...screenshots, newScreenshot]);
  }, [screenshots, onScreenshotsChange, maxScreenshots]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: '#fff',
      borderRadius: '14px',
      padding: '12px 16px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={styles.labelIcon as React.CSSProperties}>📸</div>

      <div
        style={{
          ...styles.dropzone,
          flex: 1,
          padding: '12px 16px',
          ...(isDragging ? styles.dropzoneActive : {})
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = '#a1a1a6';
            e.currentTarget.style.backgroundColor = '#f5f5f7';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = '#d2d2d7';
            e.currentTarget.style.backgroundColor = '#fafafa';
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 16V4M12 4L8 8M12 4L16 8"
              stroke={isDragging ? '#0071e3' : '#86868b'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17"
              stroke={isDragging ? '#0071e3' : '#86868b'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{
            fontSize: '14px',
            fontWeight: 500,
            color: isDragging ? '#0071e3' : '#666'
          }}>
            {isDragging ? 'Drop to upload' : 'Drop screenshots or click'}
          </span>
        </div>
      </div>

      <button
        style={{
          padding: '10px 14px',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid #0071e3',
          borderRadius: '10px',
          backgroundColor: '#fff',
          color: '#0071e3',
          cursor: screenshots.length >= maxScreenshots ? 'not-allowed' : 'pointer',
          opacity: screenshots.length >= maxScreenshots ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}
        onClick={handleAddTextOnly}
        disabled={screenshots.length >= maxScreenshots}
        onMouseEnter={(e) => {
          if (screenshots.length < maxScreenshots) {
            e.currentTarget.style.backgroundColor = '#f0f7ff';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#fff';
        }}
      >
        <span>📝</span> Text Slide
      </button>

      <span style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#86868b',
        backgroundColor: '#f5f5f7',
        padding: '6px 12px',
        borderRadius: '8px',
        whiteSpace: 'nowrap'
      }}>
        {screenshots.length}/{maxScreenshots}
      </span>
    </div>
  );
};
