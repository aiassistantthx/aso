import React, { useState } from 'react';
import { Screenshot, StyleConfig, DeviceSize, TranslationData } from '../types';
import { translateAllContent, initializeOpenAI } from '../services/openai';
import { generateZipArchive } from '../services/zip';

interface Props {
  screenshots: Screenshot[];
  style: StyleConfig;
  deviceSize: DeviceSize;
  sourceLanguage: string;
  targetLanguages: string[];
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  translationData: TranslationData | null;
  onTranslationChange: (data: TranslationData | null) => void;
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
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px'
  },
  apiKeySection: {
    marginBottom: '18px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: '1px solid #e0e0e5',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  hint: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '6px'
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
    background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(0, 113, 227, 0.35)'
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
    border: '1.5px solid #0071e3',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#0071e3',
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
    background: 'linear-gradient(90deg, #0071e3 0%, #4a9eff 100%)',
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
  }
};

export const ExportButton: React.FC<Props> = ({
  screenshots,
  style,
  deviceSize,
  sourceLanguage,
  targetLanguages,
  apiKey,
  onApiKeyChange,
  translationData,
  onTranslationChange
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const canTranslate = screenshots.length > 0 &&
    screenshots.some(s => s.text) &&
    targetLanguages.length > 0 &&
    apiKey.trim();

  const handleTranslate = async () => {
    if (!canTranslate || isTranslating) return;

    setIsTranslating(true);
    setProgress(0);
    setStatus('Initializing...');
    setError('');
    onTranslationChange(null);

    try {
      // Initialize OpenAI
      initializeOpenAI(apiKey.trim());

      // Get texts to translate
      const texts = screenshots.map(s => s.text || '');

      // Translate texts (including laurel texts)
      setStatus('Translating texts...');
      const data: TranslationData = await translateAllContent(
        texts,
        screenshots,
        sourceLanguage,
        targetLanguages,
        (p) => setProgress(p)
      );

      onTranslationChange(data);
      setProgress(100);
      setStatus('Translation complete!');
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExport = async () => {
    if (!translationData || isExporting) return;

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

    setIsTranslating(true);
    setProgress(0);
    setStatus('Initializing...');
    setError('');

    try {
      // Initialize OpenAI
      initializeOpenAI(apiKey.trim());

      // Get texts to translate
      const texts = screenshots.map(s => s.text || '');

      // Translate texts
      setStatus('Translating texts...');
      const data: TranslationData = await translateAllContent(
        texts,
        screenshots,
        sourceLanguage,
        targetLanguages,
        (p) => setProgress(p * 0.4)
      );

      onTranslationChange(data);
      setIsTranslating(false);

      // Generate ZIP
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

  const getMissingRequirements = (): string[] => {
    const missing: string[] = [];
    if (screenshots.length === 0) missing.push('Upload at least one screenshot');
    if (!screenshots.some(s => s.text)) missing.push('Add text to at least one screenshot');
    if (targetLanguages.length === 0) missing.push('Select at least one target language');
    if (!apiKey.trim()) missing.push('Enter your OpenAI API key');
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

      {/* API Key Input */}
      <div style={cssStyles.apiKeySection}>
        <label style={cssStyles.label}>OpenAI API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="sk-..."
          style={cssStyles.input}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#0071e3';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e5';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <p style={cssStyles.hint}>
          Required for translation. Your key is not stored.
        </p>
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
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 113, 227, 0.45)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            if (canTranslate && !isWorking) {
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 113, 227, 0.35)';
            }
          }}
        >
          {isExporting ? 'Exporting...' : translationData ? 'Export ZIP' : 'Translate & Export'}
        </button>
      </div>

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
    </div>
  );
};
