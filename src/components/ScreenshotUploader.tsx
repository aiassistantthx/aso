import React, { useCallback, useState } from 'react';
import { Screenshot } from '../types';

interface Props {
  screenshots: Screenshot[];
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  maxScreenshots?: number;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '0'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '16px'
  },
  labelIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#e8f5e9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  dropzone: {
    border: '2px dashed #d2d2d7',
    borderRadius: '16px',
    padding: '36px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#fafafa',
    backgroundImage: 'radial-gradient(circle at center, #f0f0f5 0%, transparent 70%)',
    position: 'relative',
    overflow: 'hidden'
  },
  dropzoneActive: {
    borderColor: '#0071e3',
    backgroundColor: '#f0f7ff',
    transform: 'scale(1.02)',
    boxShadow: '0 0 0 4px rgba(0, 113, 227, 0.1)'
  },
  dropzoneText: {
    color: '#1d1d1f',
    fontSize: '15px',
    fontWeight: 600,
    margin: 0
  },
  dropzoneHint: {
    color: '#86868b',
    fontSize: '13px',
    marginTop: '8px'
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
  },
  addTextButton: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 600,
    border: '1px solid #0071e3',
    borderRadius: '10px',
    backgroundColor: '#fff',
    color: '#0071e3',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
    gap: '10px',
    marginTop: '16px'
  },
  previewItem: {
    position: 'relative',
    aspectRatio: '9/16',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f5f5f7',
    cursor: 'grab',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
  },
  previewItemDragging: {
    opacity: 0.6,
    transform: 'scale(0.92) rotate(-2deg)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
  },
  previewItemDragOver: {
    transform: 'scale(1.05)',
    boxShadow: '0 12px 32px rgba(0, 113, 227, 0.25), 0 0 0 2px #0071e3'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  emptyPreview: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 600,
    textAlign: 'center',
    padding: '8px'
  },
  removeButton: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 300,
    transition: 'all 0.2s ease',
    opacity: 0.8
  },
  indexBadge: {
    position: 'absolute',
    bottom: '6px',
    left: '6px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px'
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
    fontSize: '12px',
    color: '#86868b',
    marginTop: '12px',
    textAlign: 'center',
    padding: '10px 12px',
    backgroundColor: '#f5f5f7',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
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
        <div style={styles.labelIcon as React.CSSProperties}>📸</div>
        <span style={{ flex: 1 }}>Screenshots</span>
        <span style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#86868b',
          backgroundColor: '#f5f5f7',
          padding: '4px 10px',
          borderRadius: '6px'
        }}>
          {screenshots.length}/{maxScreenshots}
        </span>
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
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: isDragging ? '#e3f0ff' : '#f0f0f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)'
        }}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              transition: 'transform 0.3s ease',
              transform: isDragging ? 'translateY(-4px)' : 'translateY(0)'
            }}
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
        </div>
        <p style={{
          ...styles.dropzoneText,
          color: isDragging ? '#0071e3' : '#1d1d1f'
        }}>
          {isDragging ? 'Drop to upload' : 'Drop screenshots here or click to upload'}
        </p>
        <p style={styles.dropzoneHint}>
          PNG or JPG • Max {maxScreenshots} files
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
          onMouseEnter={(e) => {
            if (screenshots.length < maxScreenshots) {
              e.currentTarget.style.backgroundColor = '#f0f7ff';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          <span>📝</span> Add Text-Only Slide
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
                    📝 Text
                  </div>
                )}
                <button
                  style={styles.removeButton as React.CSSProperties}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(screenshot.id);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
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
            💡 Drag screenshots to reorder
          </p>
        </>
      )}
    </div>
  );
};
