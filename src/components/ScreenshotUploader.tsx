import React, { useCallback, useState } from 'react';
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
  buttonRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
  },
  addTextButton: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '13px',
    border: '1px solid #0071e3',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#0071e3',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
    backgroundColor: '#f5f5f7',
    cursor: 'grab',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  previewItemDragging: {
    opacity: 0.5,
    transform: 'scale(0.95)'
  },
  previewItemDragOver: {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  emptyPreview: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    fontSize: '10px',
    textAlign: 'center',
    padding: '8px'
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
  },
  dragHandle: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    cursor: 'grab'
  },
  hint: {
    fontSize: '11px',
    color: '#86868b',
    marginTop: '8px',
    textAlign: 'center'
  }
};

export const ScreenshotUploader: React.FC<Props> = ({
  screenshots,
  onScreenshotsChange,
  maxScreenshots = 10
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
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

    // Check if it's a file drop (not reordering)
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

  const handleRemove = useCallback((id: string) => {
    const screenshot = screenshots.find(s => s.id === id);
    if (screenshot && screenshot.preview) {
      URL.revokeObjectURL(screenshot.preview);
    }
    onScreenshotsChange(screenshots.filter(s => s.id !== id));
  }, [screenshots, onScreenshotsChange]);

  // Add empty screenshot (text only)
  const handleAddTextOnly = useCallback(() => {
    if (screenshots.length >= maxScreenshots) return;

    const newScreenshot: Screenshot = {
      id: `${Date.now()}-text`,
      file: null as unknown as File, // No file for text-only
      preview: '', // Empty preview
      text: 'Your text here'
    };

    onScreenshotsChange([...screenshots, newScreenshot]);
  }, [screenshots, onScreenshotsChange, maxScreenshots]);

  // Reordering drag handlers
  const handleItemDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleItemDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleItemDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleItemDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newScreenshots = [...screenshots];
    const [removed] = newScreenshots.splice(draggedIndex, 1);
    newScreenshots.splice(dropIndex, 0, removed);

    onScreenshotsChange(newScreenshots);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, screenshots, onScreenshotsChange]);

  const handleItemDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

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

      <div style={styles.buttonRow}>
        <button
          style={{
            ...styles.addTextButton,
            opacity: screenshots.length >= maxScreenshots ? 0.5 : 1,
            cursor: screenshots.length >= maxScreenshots ? 'not-allowed' : 'pointer'
          }}
          onClick={handleAddTextOnly}
          disabled={screenshots.length >= maxScreenshots}
        >
          + Add Text-Only Slide
        </button>
      </div>

      {screenshots.length > 0 && (
        <>
          <div style={styles.previewGrid}>
            {screenshots.map((screenshot, index) => (
              <div
                key={screenshot.id}
                style={{
                  ...styles.previewItem as React.CSSProperties,
                  ...(draggedIndex === index ? styles.previewItemDragging : {}),
                  ...(dragOverIndex === index ? styles.previewItemDragOver : {})
                }}
                draggable
                onDragStart={(e) => handleItemDragStart(e, index)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDragLeave={handleItemDragLeave}
                onDrop={(e) => handleItemDrop(e, index)}
                onDragEnd={handleItemDragEnd}
              >
                {screenshot.preview ? (
                  <img
                    src={screenshot.preview}
                    alt={`Screenshot ${index + 1}`}
                    style={styles.previewImage}
                    draggable={false}
                  />
                ) : (
                  <div style={styles.emptyPreview as React.CSSProperties}>
                    Text Only
                  </div>
                )}
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
          <p style={styles.hint as React.CSSProperties}>
            Drag to reorder screenshots
          </p>
        </>
      )}
    </div>
  );
};
