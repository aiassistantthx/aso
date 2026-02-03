import React, { useState } from 'react';
import { Screenshot, StyleConfig, DeviceSize, TranslationData } from '../types';
import { generateZipArchive } from '../services/zip';
import { translate as translateApi } from '../services/api';

interface Props {
  screenshots: Screenshot[];
  style: StyleConfig;
  deviceSize: DeviceSize;
  sourceLanguage: string;
  targetLanguages: string[];
  translationData: TranslationData | null;
  onTranslationChange: (data: TranslationData | null) => void;
  userPlan: 'FREE' | 'PRO';
  onUpgrade: () => void;
}

const cssStyles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '0',
    padding: '22px',
    backgroundColor: '#fff',
    borderRadius: '18px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '18px'
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)'
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1d1d1f'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  exportButton: {
    flex: 1,
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  exportButtonEnabled: {
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)'
  },
  exportButtonDisabled: {
    backgroundColor: '#e8e8ed',
    color: '#a1a1a6',
    cursor: 'not-allowed'
  },
  secondaryButton: {
    flex: 1,
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 600,
    border: '1.5px solid #FF6B4A',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#FF6B4A',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  progressContainer: {
    marginTop: '18px'
  },
  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e8e8ed',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF6B4A 0%, #4a9eff 100%)',
    transition: 'width 0.3s ease',
    borderRadius: '3px'
  },
  progressText: {
    fontSize: '13px',
    color: '#6b6b70',
    marginTop: '10px',
    textAlign: 'center',
    fontWeight: 500
  },
  error: {
    color: '#ff3b30',
    fontSize: '13px',
    marginTop: '12px',
    padding: '10px 14px',
    backgroundColor: '#fff5f5',
    borderRadius: '8px',
    border: '1px solid #ffebeb'
  },
  requirements: {
    fontSize: '13px',
    color: '#6b6b70',
    marginBottom: '14px',
    padding: '12px 14px',
    backgroundColor: '#f8f8fa',
    borderRadius: '10px',
    border: '1px solid rgba(0, 0, 0, 0.04)'
  },
  translationReady: {
    fontSize: '13px',
    color: '#248a3d',
    marginBottom: '14px',
    padding: '12px 14px',
    backgroundColor: '#e8f9ed',
    borderRadius: '10px',
    border: '1px solid rgba(52, 199, 89, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  popupTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '8px',
  },
  popupSubtitle: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  popupFeatures: {
    textAlign: 'left',
    marginBottom: '24px',
    padding: '0 16px',
  },
  popupFeature: {
    fontSize: '14px',
    color: '#1d1d1f',
    padding: '8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  popupPrice: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '4px',
  },
  popupPricePeriod: {
    fontSize: '14px',
    color: '#86868b',
    marginBottom: '20px',
  },
  popupButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    cursor: 'pointer',
    marginBottom: '12px',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
  },
  popupCancel: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: '#86868b',
    cursor: 'pointer',
  },
};

export const ExportButton: React.FC<Props> = ({
  screenshots,
  style,
  deviceSize,
  sourceLanguage,
  targetLanguages,
  translationData,
  onTranslationChange,
  userPlan,
  onUpgrade,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  const canTranslate = screenshots.length > 0 &&
    screenshots.some(s => s.text) &&
    targetLanguages.length > 0;

  const canExportSourceOnly = screenshots.length > 0 &&
    screenshots.some(s => s.text || s.preview);

  const handleTranslate = async () => {
    if (!canTranslate || isTranslating) return;

    if (userPlan === 'FREE') {
      setShowPaywall(true);
      return;
    }

    await doTranslate();
  };

  const doTranslate = async (): Promise<TranslationData | null> => {
    setIsTranslating(true);
    setProgress(0);
    setStatus('Translating texts...');
    setError('');
    onTranslationChange(null);

    try {
      const texts = screenshots.map(s => s.text || '');

      // Translate headlines via server API
      setProgress(20);
      const headlineResult = await translateApi.translate(texts, sourceLanguage, targetLanguages);

      // Translate laurel texts if any
      setProgress(60);
      const laurelTexts = screenshots.map(s => {
        const laurelDec = s.decorations?.find(d => d.type === 'laurel');
        if (laurelDec && 'textBlocks' in laurelDec) {
          return laurelDec.textBlocks.map(b => b.text);
        }
        return [];
      });

      const hasLaurelTexts = laurelTexts.some(arr => arr.length > 0);
      let laurelResults: Record<string, string[][]> = {};

      if (hasLaurelTexts) {
        // Flatten all laurel texts, translate, then unflatten
        const flatLaurelTexts: string[] = [];
        const laurelLengths: number[] = [];
        for (const arr of laurelTexts) {
          laurelLengths.push(arr.length);
          flatLaurelTexts.push(...arr);
        }

        if (flatLaurelTexts.length > 0) {
          const laurelTranslated = await translateApi.translate(flatLaurelTexts, sourceLanguage, targetLanguages);

          // Unflatten for each language
          for (const lang of Object.keys(laurelTranslated.translations)) {
            const flat = laurelTranslated.translations[lang];
            const unflattened: string[][] = [];
            let offset = 0;
            for (const len of laurelLengths) {
              unflattened.push(flat.slice(offset, offset + len));
              offset += len;
            }
            laurelResults[lang] = unflattened;
          }
        }
      }

      // Build source laurel texts
      if (!laurelResults[sourceLanguage]) {
        laurelResults[sourceLanguage] = laurelTexts;
      }

      const data: TranslationData = {
        headlines: headlineResult.translations,
        laurelTexts: laurelResults,
        perLanguageStyles: translationData?.perLanguageStyles || {},
      };

      onTranslationChange(data);
      setProgress(100);
      setStatus('Translation complete!');
      return data;
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExport = async () => {
    if (!translationData || isExporting) return;

    if (userPlan === 'FREE') {
      setShowPaywall(true);
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setStatus('Generating images...');
    setError('');

    try {
      await generateZipArchive({
        screenshots,
        translationData,
        style,
        deviceSize,
        onProgress: (p, s) => {
          setProgress(p);
          setStatus(s);
        }
      });

      setProgress(100);
      setStatus('Export complete!');
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = async () => {
    if (!canTranslate || isTranslating || isExporting) return;

    if (userPlan === 'FREE') {
      setShowPaywall(true);
      return;
    }

    setIsTranslating(true);
    setProgress(0);
    setStatus('Translating texts...');
    setError('');

    try {
      const data = await doTranslate();
      if (!data) return;

      setIsExporting(true);
      setProgress(40);
      setStatus('Generating images...');

      await generateZipArchive({
        screenshots,
        translationData: data,
        style,
        deviceSize,
        onProgress: (p, s) => {
          setProgress(40 + p * 0.6);
          setStatus(s);
        }
      });

      setProgress(100);
      setStatus('Export complete!');
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsTranslating(false);
      setIsExporting(false);
    }
  };

  const handleExportSourceOnly = async () => {
    if (!canExportSourceOnly || isWorking) return;

    setIsExporting(true);
    setProgress(0);
    setStatus('Generating images...');
    setError('');

    try {
      const texts = screenshots.map(s => s.text || '');
      const laurelTexts = screenshots.map(s => {
        const laurelDec = s.decorations?.find(d => d.type === 'laurel');
        if (laurelDec && 'textBlocks' in laurelDec) {
          return laurelDec.textBlocks.map(b => b.text);
        }
        return [];
      });

      const sourceOnlyData: TranslationData = {
        headlines: {
          [sourceLanguage]: texts
        },
        laurelTexts: {
          [sourceLanguage]: laurelTexts
        },
        perLanguageStyles: translationData?.perLanguageStyles || {}
      };

      await generateZipArchive({
        screenshots,
        translationData: sourceOnlyData,
        style,
        deviceSize,
        onProgress: (p, s) => {
          setProgress(p);
          setStatus(s);
        }
      });

      setProgress(100);
      setStatus('Export complete!');
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const getMissingRequirements = (): string[] => {
    const missing: string[] = [];
    if (screenshots.length === 0) missing.push('Upload at least one screenshot');
    if (!screenshots.some(s => s.text)) missing.push('Add text to at least one screenshot');
    if (targetLanguages.length === 0) missing.push('Select at least one target language');
    return missing;
  };

  const missingRequirements = getMissingRequirements();
  const isWorking = isTranslating || isExporting;

  return (
    <div style={cssStyles.container}>
      {/* Header */}
      <div style={cssStyles.header as React.CSSProperties}>
        <div style={cssStyles.headerIcon as React.CSSProperties}>🚀</div>
        <span style={cssStyles.headerTitle}>Export Screenshots</span>
      </div>

      {/* Requirements */}
      {missingRequirements.length > 0 && (
        <div style={cssStyles.requirements}>
          <strong>Before export:</strong>
          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
            {missingRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Translation ready indicator */}
      {translationData && !isWorking && (
        <div style={cssStyles.translationReady as React.CSSProperties}>
          <span style={{ fontSize: '16px' }}>✓</span>
          <span>
            Translations ready for <strong>{Object.keys(translationData.headlines).length}</strong> languages.
            Use the sidebar to edit.
          </span>
        </div>
      )}

      {/* Pro badge for translation buttons */}
      {userPlan === 'FREE' && (
        <div style={{
          fontSize: '13px',
          color: '#86868b',
          marginBottom: '14px',
          padding: '10px 14px',
          backgroundColor: '#f0f7ff',
          borderRadius: '10px',
          border: '1px solid rgba(255, 107, 74, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            backgroundColor: '#FF6B4A',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
          }}>PRO</span>
          <span>Translation & translated export require a Pro plan</span>
        </div>
      )}

      {/* Export Buttons */}
      <div style={cssStyles.buttonGroup as React.CSSProperties}>
        <button
          onClick={handleTranslate}
          disabled={!canTranslate || isWorking}
          style={{
            ...cssStyles.secondaryButton,
            ...((!canTranslate || isWorking) ? { opacity: 0.5, cursor: 'not-allowed' } : {})
          }}
          onMouseEnter={(e) => {
            if (canTranslate && !isWorking) {
              e.currentTarget.style.backgroundColor = '#f0f7ff';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          {isTranslating ? 'Translating...' : translationData ? 'Re-translate' : 'Translate'}
        </button>
        <button
          onClick={translationData ? handleExport : handleQuickExport}
          disabled={!canTranslate || isWorking}
          style={{
            ...cssStyles.exportButton,
            ...(canTranslate && !isWorking
              ? cssStyles.exportButtonEnabled
              : cssStyles.exportButtonDisabled)
          }}
          onMouseEnter={(e) => {
            if (canTranslate && !isWorking) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 74, 0.45)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            if (canTranslate && !isWorking) {
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 107, 74, 0.35)';
            }
          }}
        >
          {isExporting ? 'Exporting...' : translationData ? 'Export ZIP' : 'Translate & Export'}
        </button>
      </div>

      {/* Export Source Language Only */}
      <button
        onClick={handleExportSourceOnly}
        disabled={!canExportSourceOnly || isWorking}
        style={{
          width: '100%',
          marginTop: '10px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid #d2d2d7',
          borderRadius: '10px',
          backgroundColor: '#f5f5f7',
          color: '#1d1d1f',
          cursor: canExportSourceOnly && !isWorking ? 'pointer' : 'not-allowed',
          opacity: canExportSourceOnly && !isWorking ? 1 : 0.5,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (canExportSourceOnly && !isWorking) {
            e.currentTarget.style.backgroundColor = '#e8e8ed';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f5f5f7';
        }}
      >
        Export {sourceLanguage.toUpperCase()} Only (No Translation)
      </button>

      {/* Progress */}
      {isWorking && (
        <div style={cssStyles.progressContainer}>
          <div style={cssStyles.progressBar}>
            <div
              style={{
                ...cssStyles.progressFill,
                width: `${progress}%`
              }}
            />
          </div>
          <p style={cssStyles.progressText as React.CSSProperties}>{status}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={cssStyles.error}>{error}</p>
      )}

      {/* Paywall Popup */}
      {showPaywall && (
        <div
          style={cssStyles.overlay as React.CSSProperties}
          onClick={() => setShowPaywall(false)}
        >
          <div
            style={cssStyles.popup as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={cssStyles.popupTitle as React.CSSProperties}>
              Upgrade to Pro
            </div>
            <p style={cssStyles.popupSubtitle as React.CSSProperties}>
              Unlock translation and multi-language export to reach users worldwide.
            </p>
            <div style={cssStyles.popupFeatures as React.CSSProperties}>
              <div style={cssStyles.popupFeature as React.CSSProperties}>
                <span style={{ color: '#34c759' }}>✓</span>
                Unlimited projects
              </div>
              <div style={cssStyles.popupFeature as React.CSSProperties}>
                <span style={{ color: '#34c759' }}>✓</span>
                AI-powered translation to 30+ languages
              </div>
              <div style={cssStyles.popupFeature as React.CSSProperties}>
                <span style={{ color: '#34c759' }}>✓</span>
                Translated screenshot export (ZIP)
              </div>
              <div style={cssStyles.popupFeature as React.CSSProperties}>
                <span style={{ color: '#34c759' }}>✓</span>
                Unlimited target languages
              </div>
            </div>
            <div style={cssStyles.popupPrice as React.CSSProperties}>$9.99</div>
            <div style={cssStyles.popupPricePeriod as React.CSSProperties}>per month</div>
            <button
              style={cssStyles.popupButton}
              onClick={() => {
                setShowPaywall(false);
                onUpgrade();
              }}
            >
              Upgrade Now
            </button>
            <button
              style={cssStyles.popupCancel}
              onClick={() => setShowPaywall(false)}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
