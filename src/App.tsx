import React, { useState } from 'react';
import { Screenshot, StyleConfig, DeviceSize } from './types';
import { ScreenshotUploader } from './components/ScreenshotUploader';
import { TextEditor } from './components/TextEditor';
import { StyleEditor } from './components/StyleEditor';
import { Preview } from './components/Preview';
import { LanguageSelector } from './components/LanguageSelector';
import { ExportButton } from './components/ExportButton';

const defaultStyle: StyleConfig = {
  backgroundColor: '#667eea',
  gradient: {
    enabled: true,
    color1: '#667eea',
    color2: '#764ba2',
    angle: 135
  },
  textColor: '#ffffff',
  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: 72,
  textPosition: 'top',
  textAlign: 'center',
  paddingTop: 80,
  paddingBottom: 60,
  showMockup: true,
  mockupColor: 'black',
  mockupVisibility: 'full',
  mockupAlignment: 'center',
  mockupOffset: { x: 0, y: 0 },
  textOffset: { x: 0, y: 0 },
  highlightColor: '#FFE135',
  highlightPadding: 12,
  highlightBorderRadius: 8
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7'
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #d2d2d7',
    padding: '16px 24px'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1d1d1f'
  },
  subtitle: {
    fontSize: '14px',
    color: '#86868b'
  },
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px'
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  rightPanel: {
    position: 'sticky',
    top: '24px',
    alignSelf: 'start'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #d2d2d7'
  }
};

function App() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultStyle);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('6.9');
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguages, setTargetLanguages] = useState<string[]>([
    'en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT',
    'pt-BR', 'ja-JP', 'ko-KR', 'zh-Hans', 'ru-RU'
  ]);
  const [apiKey, setApiKey] = useState('');

  // Ensure preview index is valid
  React.useEffect(() => {
    if (selectedPreviewIndex >= screenshots.length && screenshots.length > 0) {
      setSelectedPreviewIndex(screenshots.length - 1);
    } else if (screenshots.length === 0) {
      setSelectedPreviewIndex(0);
    }
  }, [screenshots.length, selectedPreviewIndex]);

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.logo}>App Store Screenshot Generator</h1>
            <p style={styles.subtitle}>
              Create localized screenshots for App Store in 40+ languages
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Left Panel - Settings */}
        <div style={styles.leftPanel as React.CSSProperties}>
          <div style={styles.card}>
            <ScreenshotUploader
              screenshots={screenshots}
              onScreenshotsChange={setScreenshots}
            />
          </div>

          <div style={styles.card}>
            <TextEditor
              screenshots={screenshots}
              onScreenshotsChange={setScreenshots}
            />
          </div>

          <div style={styles.card}>
            <StyleEditor
              style={styleConfig}
              onStyleChange={setStyleConfig}
              deviceSize={deviceSize}
              onDeviceSizeChange={setDeviceSize}
            />
          </div>

          <div style={styles.card}>
            <LanguageSelector
              selectedLanguages={targetLanguages}
              onLanguagesChange={setTargetLanguages}
              sourceLanguage={sourceLanguage}
              onSourceLanguageChange={setSourceLanguage}
            />
          </div>

          <ExportButton
            screenshots={screenshots}
            style={styleConfig}
            deviceSize={deviceSize}
            sourceLanguage={sourceLanguage}
            targetLanguages={targetLanguages}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
          />
        </div>

        {/* Right Panel - Preview */}
        <div style={styles.rightPanel as React.CSSProperties}>
          <div style={styles.card}>
            <Preview
              screenshots={screenshots}
              selectedIndex={selectedPreviewIndex}
              onSelectIndex={setSelectedPreviewIndex}
              style={styleConfig}
              deviceSize={deviceSize}
              onStyleChange={setStyleConfig}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
