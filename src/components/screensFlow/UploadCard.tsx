import React, { useRef, useState, useCallback } from 'react';
import { DEVICE_SIZES } from '../../types';

interface Props {
  onFilesSelected: (files: FileList) => void;
  onAddTextSlide: () => void;
  isCompact?: boolean;
}

export const UploadCard: React.FC<Props> = ({ onFilesSelected, onAddTextSlide, isCompact = false }) => {
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
  const previewHeight = 420;
  const aspectRatio = dimensions.width / dimensions.height;
  const previewWidth = previewHeight * aspectRatio;

  const fileInput = (
    <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
      onChange={(e) => e.target.files && onFilesSelected(e.target.files)} />
  );

  const dragProps = {
    onDrop: handleDrop,
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); },
    onDragLeave: () => setIsDragging(false),
  };

  if (isCompact) {
    return (
      <div onClick={() => inputRef.current?.click()} {...dragProps} style={{
        width: `${previewWidth}px`, height: `${previewHeight}px`, borderRadius: '16px',
        border: isDragging ? '3px solid #0071e3' : '3px dashed #d1d1d6',
        backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '12px', cursor: 'pointer', transition: 'all 0.2s'
      }}>
        {fileInput}
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e8f5e9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
        }}>+</div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#666' }}>Add Screenshot</span>
        <button onClick={(e) => { e.stopPropagation(); onAddTextSlide(); }} style={{
          padding: '8px 14px', fontSize: '12px', fontWeight: 500,
          border: '1px solid #0071e3', borderRadius: '8px',
          backgroundColor: '#fff', color: '#0071e3', cursor: 'pointer'
        }}>📝 Text Slide</button>
      </div>
    );
  }

  return (
    <div {...dragProps} onClick={() => inputRef.current?.click()} style={{
      padding: '60px 40px', borderRadius: '20px',
      border: isDragging ? '3px solid #0071e3' : '3px dashed #d1d1d6',
      backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '16px', cursor: 'pointer', transition: 'all 0.2s', maxWidth: '600px', margin: '0 auto'
    }}>
      {fileInput}
      <div style={{
        width: '72px', height: '72px', borderRadius: '20px', backgroundColor: '#e8f5e9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'
      }}>📸</div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f', margin: '0 0 4px 0' }}>
          Drop screenshots here or click to upload
        </p>
        <p style={{ fontSize: '13px', color: '#86868b', margin: 0 }}>PNG or JPG • Max 10 files</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onAddTextSlide(); }} style={{
        padding: '10px 20px', fontSize: '14px', fontWeight: 600,
        border: '1px solid #0071e3', borderRadius: '10px',
        backgroundColor: '#fff', color: '#0071e3', cursor: 'pointer', marginTop: '8px'
      }}>📝 Or add a text-only slide</button>
    </div>
  );
};
