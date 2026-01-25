import React from 'react';
import { Screenshot } from '../types';

interface Props {
  screenshots: Screenshot[];
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
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
  hint: {
    fontSize: '12px',
    color: '#86868b',
    marginBottom: '12px'
  },
  textItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    alignItems: 'flex-start'
  },
  thumbnail: {
    width: '48px',
    height: '80px',
    borderRadius: '6px',
    objectFit: 'cover',
    flexShrink: 0,
    backgroundColor: '#f5f5f7'
  },
  inputWrapper: {
    flex: 1
  },
  indexLabel: {
    fontSize: '12px',
    color: '#86868b',
    marginBottom: '4px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '24px',
    color: '#86868b',
    backgroundColor: '#f5f5f7',
    borderRadius: '8px',
    fontSize: '14px'
  }
};

export const TextEditor: React.FC<Props> = ({
  screenshots,
  onScreenshotsChange
}) => {
  const handleTextChange = (id: string, text: string) => {
    onScreenshotsChange(
      screenshots.map(s =>
        s.id === id ? { ...s, text } : s
      )
    );
  };

  if (screenshots.length === 0) {
    return (
      <div style={styles.container}>
        <label style={styles.label}>Headline Texts</label>
        <div style={styles.emptyState as React.CSSProperties}>
          Upload screenshots first to add headline texts
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <label style={styles.label}>Headline Texts</label>
      <p style={styles.hint}>
        Enter the text that will appear on each screenshot (source language)
      </p>

      {screenshots.map((screenshot, index) => (
        <div key={screenshot.id} style={styles.textItem}>
          <img
            src={screenshot.preview}
            alt={`Screenshot ${index + 1}`}
            style={styles.thumbnail}
          />
          <div style={styles.inputWrapper}>
            <div style={styles.indexLabel}>Screenshot {index + 1}</div>
            <input
              type="text"
              value={screenshot.text}
              onChange={(e) => handleTextChange(screenshot.id, e.target.value)}
              placeholder={`Enter headline for screenshot ${index + 1}...`}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#0071e3';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d2d2d7';
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
