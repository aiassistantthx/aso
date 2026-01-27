import React, { useState, useEffect, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, TranslationData } from './types';
import { ScreenshotUploader } from './components/ScreenshotUploader';
import { TextEditor } from './components/TextEditor';
import { StyleEditor } from './components/StyleEditor';
import { DecorationsEditor } from './components/DecorationsEditor';
import { Preview } from './components/Preview';
import { LanguageSelector } from './components/LanguageSelector';
import { ExportButton } from './components/ExportButton';
import { LanguageSidebar } from './components/LanguageSidebar';
import {
  saveProject,
  loadProject,
  getProjectsList,
  deleteProject,
  autoSave,
  loadAutoSave,
  hasAutoSave,
  clearAutoSave
} from './services/storage';

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
  mockupScale: 1.0,
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
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'flex',
    gap: '0'
  },
  mainContent: {
    flex: 1,
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px',
    minWidth: 0
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
  },
  headerButtons: {
    display: 'flex',
    gap: '8px'
  },
  headerButton: {
    padding: '8px 16px',
    fontSize: '13px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  headerButtonPrimary: {
    backgroundColor: '#0071e3',
    borderColor: '#0071e3',
    color: '#fff'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#1d1d1f'
  },
  modalInput: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d2d2d7',
    borderRadius: '8px',
    marginBottom: '16px',
    outline: 'none'
  },
  modalButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  projectList: {
    marginBottom: '16px'
  },
  projectItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e8e8ed',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  projectInfo: {
    flex: 1
  },
  projectName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1d1d1f'
  },
  projectDate: {
    fontSize: '12px',
    color: '#86868b'
  },
  deleteButton: {
    padding: '4px 8px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#ff3b30',
    color: '#fff',
    cursor: 'pointer'
  },
  currentProject: {
    fontSize: '13px',
    color: '#86868b',
    marginLeft: '12px'
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

  // Translation state
  const [translationData, setTranslationData] = useState<TranslationData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Project management state
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveProjectName, setSaveProjectName] = useState('');
  const [projectsList, setProjectsList] = useState<{ id: string; name: string; updatedAt: string }[]>([]);

  // Load autosave on mount
  useEffect(() => {
    if (hasAutoSave()) {
      const saved = loadAutoSave();
      if (saved && saved.screenshots.length > 0) {
        const restore = window.confirm('Found unsaved work. Would you like to restore it?');
        if (restore) {
          setScreenshots(saved.screenshots);
          setStyleConfig(saved.styleConfig);
          setDeviceSize(saved.deviceSize);
          setSourceLanguage(saved.sourceLanguage);
          setTargetLanguages(saved.targetLanguages);
        } else {
          clearAutoSave();
        }
      }
    }
  }, []);

  // Auto-save on changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (screenshots.length > 0) {
        autoSave(screenshots, styleConfig, deviceSize, sourceLanguage, targetLanguages);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [screenshots, styleConfig, deviceSize, sourceLanguage, targetLanguages]);

  // Ensure preview index is valid
  useEffect(() => {
    if (selectedPreviewIndex >= screenshots.length && screenshots.length > 0) {
      setSelectedPreviewIndex(screenshots.length - 1);
    } else if (screenshots.length === 0) {
      setSelectedPreviewIndex(0);
    }
  }, [screenshots.length, selectedPreviewIndex]);

  // Save project handler
  const handleSaveProject = useCallback(() => {
    if (!saveProjectName.trim()) return;
    const project = saveProject(
      saveProjectName,
      screenshots,
      styleConfig,
      deviceSize,
      sourceLanguage,
      targetLanguages,
      currentProjectId || undefined
    );
    setCurrentProjectId(project.id);
    setCurrentProjectName(project.name);
    setShowSaveModal(false);
    clearAutoSave();
  }, [saveProjectName, screenshots, styleConfig, deviceSize, sourceLanguage, targetLanguages, currentProjectId]);

  // Load project handler
  const handleLoadProject = useCallback((id: string) => {
    const project = loadProject(id);
    if (project) {
      setScreenshots(project.screenshots);
      setStyleConfig(project.styleConfig);
      setDeviceSize(project.deviceSize);
      setSourceLanguage(project.sourceLanguage);
      setTargetLanguages(project.targetLanguages);
      setSelectedPreviewIndex(0);

      const projectData = getProjectsList().find(p => p.id === id);
      setCurrentProjectId(id);
      setCurrentProjectName(projectData?.name || '');
      setShowLoadModal(false);
      clearAutoSave();
    }
  }, []);

  // Delete project handler
  const handleDeleteProject = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      setProjectsList(getProjectsList());
      if (currentProjectId === id) {
        setCurrentProjectId(null);
        setCurrentProjectName('');
      }
    }
  }, [currentProjectId]);

  // Open save modal
  const openSaveModal = useCallback(() => {
    setSaveProjectName(currentProjectName || `Project ${new Date().toLocaleDateString()}`);
    setShowSaveModal(true);
  }, [currentProjectName]);

  // Open load modal
  const openLoadModal = useCallback(() => {
    setProjectsList(getProjectsList());
    setShowLoadModal(true);
  }, []);

  // New project
  const handleNewProject = useCallback(() => {
    if (screenshots.length > 0) {
      if (!window.confirm('Start a new project? Unsaved changes will be lost.')) {
        return;
      }
    }
    setScreenshots([]);
    setStyleConfig(defaultStyle);
    setDeviceSize('6.9');
    setSourceLanguage('en-US');
    setTargetLanguages(['en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-Hans', 'ru-RU']);
    setCurrentProjectId(null);
    setCurrentProjectName('');
    setSelectedPreviewIndex(0);
    clearAutoSave();
  }, [screenshots.length]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <h1 style={styles.logo}>App Store Screenshot Generator</h1>
              <p style={styles.subtitle}>
                Create localized screenshots for App Store in 40+ languages
              </p>
            </div>
            {currentProjectName && (
              <span style={styles.currentProject as React.CSSProperties}>
                Project: {currentProjectName}
              </span>
            )}
          </div>
          <div style={styles.headerButtons as React.CSSProperties}>
            <button style={styles.headerButton} onClick={handleNewProject}>
              New
            </button>
            <button style={styles.headerButton} onClick={openLoadModal}>
              Open
            </button>
            <button
              style={{ ...styles.headerButton, ...styles.headerButtonPrimary }}
              onClick={openSaveModal}
            >
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Save Modal */}
      {showSaveModal && (
        <div style={styles.modal as React.CSSProperties} onClick={() => setShowSaveModal(false)}>
          <div style={styles.modalContent as React.CSSProperties} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Save Project</h2>
            <input
              type="text"
              placeholder="Project name..."
              value={saveProjectName}
              onChange={(e) => setSaveProjectName(e.target.value)}
              style={styles.modalInput}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveProject()}
            />
            <div style={styles.modalButtons as React.CSSProperties}>
              <button style={styles.headerButton} onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button
                style={{ ...styles.headerButton, ...styles.headerButtonPrimary }}
                onClick={handleSaveProject}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div style={styles.modal as React.CSSProperties} onClick={() => setShowLoadModal(false)}>
          <div style={styles.modalContent as React.CSSProperties} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Open Project</h2>
            {projectsList.length === 0 ? (
              <p style={{ color: '#86868b', textAlign: 'center', padding: '20px' }}>
                No saved projects yet
              </p>
            ) : (
              <div style={styles.projectList}>
                {projectsList.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      ...styles.projectItem,
                      ...(project.id === currentProjectId ? { borderColor: '#0071e3', backgroundColor: '#f0f7ff' } : {})
                    }}
                    onClick={() => handleLoadProject(project.id)}
                  >
                    <div style={styles.projectInfo}>
                      <div style={styles.projectName}>{project.name}</div>
                      <div style={styles.projectDate as React.CSSProperties}>
                        {formatDate(project.updatedAt)}
                      </div>
                    </div>
                    <button
                      style={styles.deleteButton}
                      onClick={(e) => handleDeleteProject(project.id, e)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={styles.modalButtons as React.CSSProperties}>
              <button style={styles.headerButton} onClick={() => setShowLoadModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {/* Language Sidebar - shown when translations exist */}
        {translationData && (
          <LanguageSidebar
            translationData={translationData}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        )}

        <div style={translationData ? styles.mainContent : styles.mainContent as React.CSSProperties}>
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
                translationData={translationData}
                selectedLanguage={selectedLanguage}
                onTranslationChange={setTranslationData}
              />
            </div>

            <div style={styles.card}>
              <StyleEditor
                style={styleConfig}
                onStyleChange={setStyleConfig}
                deviceSize={deviceSize}
                onDeviceSizeChange={setDeviceSize}
                screenshots={screenshots}
                selectedIndex={selectedPreviewIndex}
                onScreenshotsChange={setScreenshots}
                translationData={translationData}
                selectedLanguage={selectedLanguage}
                onTranslationChange={setTranslationData}
              />
            </div>

            <div style={styles.card}>
              <DecorationsEditor
                screenshots={screenshots}
                selectedIndex={selectedPreviewIndex}
                onScreenshotsChange={setScreenshots}
                deviceSize={deviceSize}
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
              translationData={translationData}
              onTranslationChange={setTranslationData}
            />
          </div>

          {/* Right Panel - Preview */}
          <div style={styles.rightPanel as React.CSSProperties}>
            <div style={styles.card}>
              <Preview
                screenshots={screenshots}
                selectedIndex={selectedPreviewIndex}
                onSelectIndex={setSelectedPreviewIndex}
                onScreenshotsChange={setScreenshots}
                style={styleConfig}
                deviceSize={deviceSize}
                onStyleChange={setStyleConfig}
                translationData={translationData}
                selectedLanguage={selectedLanguage}
                onTranslationChange={setTranslationData}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
