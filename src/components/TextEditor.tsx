import React from 'react';
import { Screenshot, TranslationData, LaurelDecoration } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';

interface Props {
  screenshots: Screenshot[];
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  onTranslationChange?: (data: TranslationData) => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '0'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px'
  },
  headerIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#fff3e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f'
  },
  hint: {
    fontSize: '13px',
    color: '#86868b',
    marginBottom: '14px'
  },
  formatHint: {
    fontSize: '12px',
    color: '#6b6b70',
    marginTop: '8px',
    padding: '12px 14px',
    backgroundColor: '#f8f8fa',
    borderRadius: '10px',
    lineHeight: '1.6',
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  formatExample: {
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    backgroundColor: '#e8e8ed',
    padding: '2px 7px',
    borderRadius: '5px',
    fontSize: '11px'
  },
  textItem: {
    display: 'flex',
    gap: '14px',
    marginBottom: '16px',
    alignItems: 'flex-start',
    padding: '14px',
    backgroundColor: '#f9f9fb',
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  thumbnail: {
    width: '50px',
    height: '86px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
    backgroundColor: '#f5f5f7',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  textOnlyThumbnail: {
    width: '50px',
    height: '86px',
    borderRadius: '8px',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)'
  },
  inputWrapper: {
    flex: 1
  },
  indexLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#86868b',
    marginBottom: '6px'
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: '1px solid #e0e0e5',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    resize: 'vertical',
    minHeight: '68px',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    backgroundColor: '#fff'
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 24px',
    color: '#86868b',
    backgroundColor: '#f8f8fa',
    borderRadius: '12px',
    fontSize: '14px',
    border: '1px dashed #d0d0d5'
  }
};

const getLanguageName = (code: string): string => {
  const lang = APP_STORE_LANGUAGES.find(l => l.code === code);
  return lang?.name || code;
};

export const TextEditor: React.FC<Props> = ({
  screenshots,
  onScreenshotsChange,
  translationData,
  selectedLanguage = 'all',
  onTranslationChange
}) => {
  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  // Handle source text change (affects all languages or when no translations yet)
  const handleTextChange = (id: string, text: string) => {
    onScreenshotsChange(
      screenshots.map(s =>
        s.id === id ? { ...s, text } : s
      )
    );
  };

  // Handle translated headline change
  const handleTranslatedTextChange = (index: number, text: string) => {
    if (!translationData || !onTranslationChange || selectedLanguage === 'all') return;

    const newHeadlines = { ...translationData.headlines };
    newHeadlines[selectedLanguage] = [...(newHeadlines[selectedLanguage] || [])];
    newHeadlines[selectedLanguage][index] = text;

    onTranslationChange({
      ...translationData,
      headlines: newHeadlines
    });
  };

  // Handle laurel text change
  const handleLaurelTextChange = (screenshotIndex: number, blockIndex: number, text: string) => {
    if (!translationData || !onTranslationChange || selectedLanguage === 'all') return;

    const newLaurelTexts = { ...translationData.laurelTexts };
    if (!newLaurelTexts[selectedLanguage]) {
      newLaurelTexts[selectedLanguage] = [];
    }
    newLaurelTexts[selectedLanguage] = [...newLaurelTexts[selectedLanguage]];
    if (!newLaurelTexts[selectedLanguage][screenshotIndex]) {
      newLaurelTexts[selectedLanguage][screenshotIndex] = [];
    }
    newLaurelTexts[selectedLanguage][screenshotIndex] = [...newLaurelTexts[selectedLanguage][screenshotIndex]];
    newLaurelTexts[selectedLanguage][screenshotIndex][blockIndex] = text;

    onTranslationChange({
      ...translationData,
      laurelTexts: newLaurelTexts
    });
  };

  // Get text value to display
  const getTextValue = (screenshot: Screenshot, index: number): string => {
    if (isEditingTranslation) {
      return translationData.headlines[selectedLanguage]?.[index] || screenshot.text;
    }
    return screenshot.text;
  };

  // Get laurel text values
  const getLaurelTexts = (screenshot: Screenshot, index: number): string[] => {
    const laurelDec = screenshot.decorations?.find(d => d.type === 'laurel') as LaurelDecoration | undefined;
    if (!laurelDec) return [];

    if (isEditingTranslation && translationData.laurelTexts[selectedLanguage]?.[index]) {
      return translationData.laurelTexts[selectedLanguage][index];
    }
    return laurelDec.textBlocks.map(b => b.text);
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
      <div style={styles.header}>
        <div style={styles.headerIcon as React.CSSProperties}>✏️</div>
        <label style={styles.label}>
          Headline Texts
          {isEditingTranslation && (
            <span style={{
              fontWeight: 500,
              fontSize: '12px',
              color: '#0071e3',
              marginLeft: '8px',
              backgroundColor: '#f0f7ff',
              padding: '3px 8px',
              borderRadius: '6px'
            }}>
              {getLanguageName(selectedLanguage)}
            </span>
          )}
        </label>
      </div>
      <p style={styles.hint}>
        {isEditingTranslation
          ? `Edit translated texts for ${getLanguageName(selectedLanguage)}`
          : 'Enter the text that will appear on each screenshot'
        }
      </p>

      {!isEditingTranslation && (
        <div style={styles.formatHint as React.CSSProperties}>
          <strong>Formatting:</strong><br />
          Use <span style={styles.formatExample as React.CSSProperties}>[text]</span> to highlight words<br />
          Use <span style={styles.formatExample as React.CSSProperties}>|</span> or new line for line breaks<br />
          Example: <span style={styles.formatExample as React.CSSProperties}>[Create]|Viral Videos in|[Seconds]</span>
        </div>
      )}

      {screenshots.map((screenshot, index) => {
        const laurelDec = screenshot.decorations?.find(d => d.type === 'laurel') as LaurelDecoration | undefined;
        const laurelTexts = getLaurelTexts(screenshot, index);

        return (
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
                value={getTextValue(screenshot, index)}
                onChange={(e) => {
                  if (isEditingTranslation) {
                    handleTranslatedTextChange(index, e.target.value);
                  } else {
                    handleTextChange(screenshot.id, e.target.value);
                  }
                }}
                placeholder={`[Highlighted]|Regular text|[Another highlight]`}
                style={styles.textarea as React.CSSProperties}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0071e3';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e5';
                  e.target.style.boxShadow = 'none';
                }}
                rows={3}
              />

              {/* Laurel text editing - only show for translation editing */}
              {isEditingTranslation && laurelDec && laurelDec.textBlocks.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#86868b', marginBottom: '4px' }}>
                    Laurel Text
                  </div>
                  {laurelDec.textBlocks.map((block, bIdx) => (
                    <input
                      key={bIdx}
                      type="text"
                      value={laurelTexts[bIdx] || block.text}
                      onChange={(e) => handleLaurelTextChange(index, bIdx, e.target.value)}
                      placeholder={block.text}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '13px',
                        border: '1px solid #d2d2d7',
                        borderRadius: '6px',
                        marginBottom: '4px'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
