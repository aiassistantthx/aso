import React, { useCallback } from 'react';
import { Screenshot } from '../types';

interface Props {
  screenshots: Screenshot[];
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  maxScreenshots?: number;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px'
  },
  dropzone: {
    border: '2px dashed #d2d2d7',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#fff'
  },
  dropzoneActive: {
    borderColor: '#0071e3',
    backgroundColor: '#f0f7ff'
  },
  dropzoneText: {
    color: '#86868b',
    fontSize: '14px',
    margin: 0
  },
  dropzoneHint: {
    color: '#86868b',
    fontSize: '12px',
    marginTop: '8px'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px',
    marginTop: '16px'
  },
  previewItem: {
    position: 'relative',
    aspectRatio: '9/16',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f7'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  indexBadge: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px'
  }
};

export const ScreenshotUploader: React.FC<Props> = ({
  screenshots,
  onScreenshotsChange,
  maxScreenshots = 10
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
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
    handleFiles(e.dataTransfer.files);
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

  const handleRemove = useCallback((id: string) => {
    const screenshot = screenshots.find(s => s.id === id);
    if (screenshot) {
      URL.revokeObjectURL(screenshot.preview);
    }
    onScreenshotsChange(screenshots.filter(s => s.id !== id));
  }, [screenshots, onScreenshotsChange]);

  return (
    <div style={styles.container}>
      <label style={styles.label}>
        Screenshots ({screenshots.length}/{maxScreenshots})
      </label>

      <div
        style={{
          ...styles.dropzone,
          ...(isDragging ? styles.dropzoneActive : {})
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p style={styles.dropzoneText}>
          Drop screenshots here or click to upload
        </p>
        <p style={styles.dropzoneHint}>
          PNG or JPG, max {maxScreenshots} files
        </p>
      </div>

      {screenshots.length > 0 && (
        <div style={styles.previewGrid}>
          {screenshots.map((screenshot, index) => (
            <div key={screenshot.id} style={styles.previewItem as React.CSSProperties}>
              <img
                src={screenshot.preview}
                alt={`Screenshot ${index + 1}`}
                style={styles.previewImage}
              />
              <button
                style={styles.removeButton as React.CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(screenshot.id);
                }}
              >
                ×
              </button>
              <span style={styles.indexBadge as React.CSSProperties}>
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
