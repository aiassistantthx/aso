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
    marginTop: '24px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #d2d2d7'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '8px'
  },
  apiKeySection: {
    marginBottom: '16px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'monospace'
  },
  hint: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '4px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px'
  },
  exportButton: {
    flex: 1,
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  exportButtonEnabled: {
    backgroundColor: '#0071e3',
    color: '#fff'
  },
  exportButtonDisabled: {
    backgroundColor: '#d2d2d7',
    color: '#86868b',
    cursor: 'not-allowed'
  },
  secondaryButton: {
    flex: 1,
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 600,
    border: '1px solid #0071e3',
    borderRadius: '10px',
    backgroundColor: '#fff',
    color: '#0071e3',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  progressContainer: {
    marginTop: '16px'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e8e8ed',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0071e3',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '8px',
    textAlign: 'center'
  },
  error: {
    color: '#ff3b30',
    fontSize: '12px',
    marginTop: '8px'
  },
  requirements: {
    fontSize: '12px',
    color: '#86868b',
    marginBottom: '12px',
    padding: '8px',
    backgroundColor: '#f5f5f7',
    borderRadius: '6px'
  },
  translationReady: {
    fontSize: '12px',
    color: '#34c759',
    marginBottom: '12px',
    padding: '8px',
    backgroundColor: '#e8f9ed',
    borderRadius: '6px'
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
      {/* API Key Input */}
      <div style={cssStyles.apiKeySection}>
        <label style={cssStyles.label}>OpenAI API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="sk-..."
          style={cssStyles.input}
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
        <div style={cssStyles.translationReady}>
          Translations ready for {Object.keys(translationData.headlines).length} languages.
          Use the sidebar to edit individual languages.
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
