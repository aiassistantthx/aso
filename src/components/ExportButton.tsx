import React, { useState } from 'react';
import { Screenshot, StyleConfig, DeviceSize } from '../types';
import { translateTexts, initializeOpenAI } from '../services/openai';
import { generateZipArchive } from '../services/zip';

interface Props {
  screenshots: Screenshot[];
  style: StyleConfig;
  deviceSize: DeviceSize;
  sourceLanguage: string;
  targetLanguages: string[];
  apiKey: string;
  onApiKeyChange: (key: string) => void;
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
  exportButton: {
    width: '100%',
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
  }
};

export const ExportButton: React.FC<Props> = ({
  screenshots,
  style,
  deviceSize,
  sourceLanguage,
  targetLanguages,
  apiKey,
  onApiKeyChange
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const canExport = screenshots.length > 0 &&
    screenshots.some(s => s.text) &&
    targetLanguages.length > 0 &&
    apiKey.trim();

  const handleExport = async () => {
    if (!canExport || isExporting) return;

    setIsExporting(true);
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
      const translations = await translateTexts(
        texts,
        sourceLanguage,
        targetLanguages,
        (p) => setProgress(p * 0.4) // Translation is 40% of progress
      );

      // Generate ZIP
      setProgress(40);
      setStatus('Generating images...');
      await generateZipArchive({
        screenshots,
        translations,
        style,
        deviceSize,
        onProgress: (p, s) => {
          setProgress(40 + p * 0.6); // Image generation is 60% of progress
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
    if (!apiKey.trim()) missing.push('Enter your OpenAI API key');
    return missing;
  };

  const missingRequirements = getMissingRequirements();

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

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={!canExport || isExporting}
        style={{
          ...cssStyles.exportButton,
          ...(canExport && !isExporting
            ? cssStyles.exportButtonEnabled
            : cssStyles.exportButtonDisabled)
        }}
      >
        {isExporting ? 'Exporting...' : `Export to ${targetLanguages.length} Language${targetLanguages.length !== 1 ? 's' : ''}`}
      </button>

      {/* Progress */}
      {isExporting && (
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
