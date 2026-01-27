import React, { useState } from 'react';
import { TranslationData, Screenshot, LaurelDecoration } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';

interface Props {
  translationData: TranslationData;
  screenshots: Screenshot[];
  onTranslationChange: (data: TranslationData) => void;
  onClose: () => void;
  onExport: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e8e8ed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1d1d1f'
  },
  closeButton: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '20px 24px'
  },
  languageSelector: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  languageTab: {
    padding: '8px 16px',
    fontSize: '13px',
    border: '1px solid #d2d2d7',
    borderRadius: '20px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  languageTabActive: {
    backgroundColor: '#0071e3',
    borderColor: '#0071e3',
    color: '#fff'
  },
  screenshotSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f5f5f7',
    borderRadius: '12px'
  },
  screenshotTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '12px'
  },
  field: {
    marginBottom: '12px'
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#86868b',
    marginBottom: '4px',
    display: 'block'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    resize: 'vertical',
    minHeight: '60px',
    fontFamily: 'inherit',
    outline: 'none'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    outline: 'none'
  },
  laurelSection: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e8e8ed'
  },
  laurelTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#86868b',
    marginBottom: '8px'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e8e8ed',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  exportButton: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#0071e3',
    color: '#fff',
    cursor: 'pointer'
  },
  hint: {
    fontSize: '12px',
    color: '#86868b',
    marginBottom: '16px'
  }
};

export const TranslationEditor: React.FC<Props> = ({
  translationData,
  screenshots,
  onTranslationChange,
  onClose,
  onExport
}) => {
  const languages = Object.keys(translationData.headlines);
  const [selectedLang, setSelectedLang] = useState(languages[0] || 'en-US');

  const getLanguageName = (code: string) => {
    const lang = APP_STORE_LANGUAGES.find(l => l.code === code);
    return lang?.name || code;
  };

  const updateHeadline = (screenshotIndex: number, newText: string) => {
    const newHeadlines = { ...translationData.headlines };
    newHeadlines[selectedLang] = [...newHeadlines[selectedLang]];
    newHeadlines[selectedLang][screenshotIndex] = newText;
    onTranslationChange({
      ...translationData,
      headlines: newHeadlines
    });
  };

  const updateLaurelText = (screenshotIndex: number, blockIndex: number, newText: string) => {
    const newLaurelTexts = { ...translationData.laurelTexts };
    if (!newLaurelTexts[selectedLang]) {
      newLaurelTexts[selectedLang] = [];
    }
    if (!newLaurelTexts[selectedLang][screenshotIndex]) {
      newLaurelTexts[selectedLang][screenshotIndex] = [];
    }
    newLaurelTexts[selectedLang] = [...newLaurelTexts[selectedLang]];
    newLaurelTexts[selectedLang][screenshotIndex] = [...newLaurelTexts[selectedLang][screenshotIndex]];
    newLaurelTexts[selectedLang][screenshotIndex][blockIndex] = newText;
    onTranslationChange({
      ...translationData,
      laurelTexts: newLaurelTexts
    });
  };

  const getLaurelDecoration = (screenshot: Screenshot): LaurelDecoration | undefined => {
    return screenshot.decorations?.find(d => d.type === 'laurel') as LaurelDecoration | undefined;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal as React.CSSProperties} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Edit Translations</h2>
          <button style={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>

        <div style={styles.content as React.CSSProperties}>
          <p style={styles.hint}>
            Review and edit translations before exporting. Use [brackets] for highlights and | for line breaks.
          </p>

          <div style={styles.languageSelector}>
            {languages.map(lang => (
              <button
                key={lang}
                style={{
                  ...styles.languageTab,
                  ...(lang === selectedLang ? styles.languageTabActive : {})
                }}
                onClick={() => setSelectedLang(lang)}
              >
                {getLanguageName(lang)}
              </button>
            ))}
          </div>

          {screenshots.map((screenshot, sIdx) => {
            const headline = translationData.headlines[selectedLang]?.[sIdx] || screenshot.text;
            const laurelDec = getLaurelDecoration(screenshot);
            const laurelTexts = translationData.laurelTexts[selectedLang]?.[sIdx] || [];

            return (
              <div key={screenshot.id} style={styles.screenshotSection}>
                <div style={styles.screenshotTitle}>
                  Screenshot {sIdx + 1}
                  {screenshot.preview && (
                    <img
                      src={screenshot.preview}
                      alt=""
                      style={{
                        height: '40px',
                        marginLeft: '12px',
                        borderRadius: '4px',
                        verticalAlign: 'middle'
                      }}
                    />
                  )}
                </div>

                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Headline</label>
                  <textarea
                    style={styles.textarea}
                    value={headline}
                    onChange={e => updateHeadline(sIdx, e.target.value)}
                    placeholder="Enter headline..."
                  />
                </div>

                {laurelDec && laurelDec.textBlocks.length > 0 && (
                  <div style={styles.laurelSection}>
                    <div style={styles.laurelTitle}>Laurel Wreath Text</div>
                    {laurelDec.textBlocks.map((block, bIdx) => (
                      <div key={bIdx} style={styles.field}>
                        <label style={styles.fieldLabel}>Block {bIdx + 1}</label>
                        <input
                          type="text"
                          style={styles.input}
                          value={laurelTexts[bIdx] || block.text}
                          onChange={e => updateLaurelText(sIdx, bIdx, e.target.value)}
                          placeholder={block.text}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.footer}>
          <button style={styles.closeButton} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.exportButton} onClick={onExport}>
            Export All Languages
          </button>
        </div>
      </div>
    </div>
  );
};
