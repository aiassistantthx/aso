import React, { useRef, useState, useCallback } from 'react';
import { DEVICE_SIZES } from '../../types';

// Compact upload card for adding screenshots
const UploadCard: React.FC<{
  onFilesSelected: (files: FileList) => void;
  onAddTextSlide: () => void;
  isCompact?: boolean;
}> = ({ onFilesSelected, onAddTextSlide, isCompact = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  }, [onFilesSelected]);

  const dimensions = DEVICE_SIZES['6.9'];
  const previewHeight = 340;
  const aspectRatio = dimensions.width / dimensions.height;
  const previewWidth = previewHeight * aspectRatio;

  if (isCompact) {
    // Compact version - just an add button card
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: `${previewWidth}px` }}>
        {/* Placeholder to match position indicator height */}
        <div style={{ minHeight: '18px', marginBottom: '6px' }} />
        <div
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            borderRadius: '16px',
            border: isDragging ? '3px solid #FF6B4A' : '3px dashed #d1d1d6',
            backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '20px',
            boxSizing: 'border-box',
            transition: 'all 0.2s'
          }}
        >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
        />
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            width: '100%'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#4caf50'
          }}>
            +
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>
            Add Screenshot
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTextSlide();
          }}
          style={{
            padding: '8px 16px',
            fontSize: '11px',
            fontWeight: 500,
            border: '1px solid #FF6B4A',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#FF6B4A',
            cursor: 'pointer',
            width: '100%',
            maxWidth: '120px'
          }}
        >
          📝 Text Slide
        </button>
        </div>
        {/* Placeholder to align with text input row */}
        <div
          style={{
            width: '100%',
            height: '32px',
            borderRadius: '8px',
            border: '1px dashed #e0e0e5',
            backgroundColor: '#fafafa'
          }}
        />
      </div>
    );
  }

  // Full version - empty state
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      style={{
        padding: '60px 40px',
        borderRadius: '20px',
        border: isDragging ? '3px solid #FF6B4A' : '3px dashed #d1d1d6',
        backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        backgroundColor: '#e8f5e9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px'
      }}>
        📸
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f', margin: '0 0 4px 0' }}>
          Drop screenshots here or click to upload
        </p>
        <p style={{ fontSize: '13px', color: '#86868b', margin: 0 }}>
          PNG or JPG • Max 10 files
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddTextSlide();
        }}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 600,
          border: '1px solid #FF6B4A',
          borderRadius: '10px',
          backgroundColor: '#fff',
          color: '#FF6B4A',
          cursor: 'pointer',
          marginTop: '8px'
        }}
      >
        📝 Or add a text-only slide
      </button>
    </div>
  );
};

export { UploadCard };
