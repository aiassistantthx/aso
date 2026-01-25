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
  formatHint: {
    fontSize: '11px',
    color: '#86868b',
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: '#f5f5f7',
    borderRadius: '6px',
    lineHeight: '1.5'
  },
  formatExample: {
    fontFamily: 'monospace',
    backgroundColor: '#e8e8ed',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px'
  },
  textItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
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
  textOnlyThumbnail: {
    width: '48px',
    height: '80px',
    borderRadius: '6px',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '8px',
    fontWeight: 600
  },
  inputWrapper: {
    flex: 1
  },
  indexLabel: {
    fontSize: '12px',
    color: '#86868b',
    marginBottom: '4px'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
    resize: 'vertical',
    minHeight: '60px',
    fontFamily: 'inherit',
    lineHeight: '1.4'
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

      <div style={styles.formatHint as React.CSSProperties}>
        <strong>Formatting:</strong><br />
        Use <span style={styles.formatExample as React.CSSProperties}>[text]</span> to highlight words<br />
        Use <span style={styles.formatExample as React.CSSProperties}>|</span> or new line for line breaks<br />
        Example: <span style={styles.formatExample as React.CSSProperties}>[Create]|Viral Videos in|[Seconds]</span>
      </div>

      {screenshots.map((screenshot, index) => (
        <div key={screenshot.id} style={styles.textItem}>
          {screenshot.preview ? (
            <img
              src={screenshot.preview}
              alt={`Screenshot ${index + 1}`}
              style={styles.thumbnail}
            />
          ) : (
            <div style={styles.textOnlyThumbnail as React.CSSProperties}>
              Text Only
            </div>
          )}
          <div style={styles.inputWrapper}>
            <div style={styles.indexLabel}>Screenshot {index + 1}</div>
            <textarea
              value={screenshot.text}
              onChange={(e) => handleTextChange(screenshot.id, e.target.value)}
              placeholder={`[Highlighted]|Regular text|[Another highlight]`}
              style={styles.textarea as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.borderColor = '#0071e3';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d2d2d7';
              }}
              rows={3}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
