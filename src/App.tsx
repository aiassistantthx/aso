import React, { useState, useEffect, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, TranslationData } from './types';
import { ScreenshotUploader } from './components/ScreenshotUploader';
import { TextEditor } from './components/TextEditor';
import { StyleEditor } from './components/StyleEditor';
import { DecorationsEditor } from './components/DecorationsEditor';
import { ScreensFlowEditor } from './components/ScreensFlowEditor';
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
  mockupStyle: 'realistic',
  mockupVisibility: 'full',
  mockupAlignment: 'center',
  mockupOffset: { x: 0, y: 0 },
  textOffset: { x: 0, y: 0 },
  mockupScale: 1.0,
  mockupRotation: 0,
  mockupContinuation: 'none',
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
    background: 'rgba(255, 255, 255, 0.72)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    padding: '0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)'
  },
  headerContent: {
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  logoIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)'
  },
  logo: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.4px'
  },
  subtitle: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '3px'
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
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minWidth: 0,
    maxWidth: '800px'
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '18px',
    padding: '22px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
    transition: 'box-shadow 0.3s ease, transform 0.2s ease'
  },
  headerButtons: {
    display: 'flex',
    gap: '10px'
  },
  headerButton: {
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: 600,
    border: '1px solid #e0e0e5',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
  },
  headerButtonPrimary: {
    background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
    borderColor: 'transparent',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(0, 113, 227, 0.35)'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-out'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '28px',
    maxWidth: '480px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.15)',
    animation: 'fadeIn 0.25s ease-out'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '20px',
    color: '#1d1d1f',
    letterSpacing: '-0.3px'
  },
  modalInput: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: '1px solid #e0e0e5',
    borderRadius: '12px',
    marginBottom: '20px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  projectList: {
    marginBottom: '20px'
  },
  projectItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #e8e8ed',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  projectInfo: {
    flex: 1
  },
  projectName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f'
  },
  projectDate: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '4px'
  },
  deleteButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#ff3b30',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: 0.9
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
          <div style={styles.logoContainer as React.CSSProperties}>
            <div style={styles.logoIcon as React.CSSProperties}>📱</div>
            <div>
              <h1 style={styles.logo}>Screenshot Studio</h1>
              <p style={styles.subtitle}>
                {currentProjectName ? `Project: ${currentProjectName}` : 'Create App Store screenshots in 40+ languages'}
              </p>
            </div>
          </div>
          <div style={styles.headerButtons as React.CSSProperties}>
            <button
              style={styles.headerButton}
              onClick={handleNewProject}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f7';
                e.currentTarget.style.borderColor = '#d0d0d5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#e0e0e5';
              }}
            >
              <span>✨</span> New
            </button>
            <button
              style={styles.headerButton}
              onClick={openLoadModal}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f7';
                e.currentTarget.style.borderColor = '#d0d0d5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#e0e0e5';
              }}
            >
              <span>📂</span> Open
            </button>
            <button
              style={{ ...styles.headerButton, ...styles.headerButtonPrimary }}
              onClick={openSaveModal}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 113, 227, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 113, 227, 0.35)';
              }}
            >
              <span>💾</span> Save
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
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0071e3';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e5';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
                    onMouseEnter={(e) => {
                      if (project.id !== currentProjectId) {
                        e.currentTarget.style.backgroundColor = '#f9f9fb';
                        e.currentTarget.style.borderColor = '#d0d0d5';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (project.id !== currentProjectId) {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.borderColor = '#e8e8ed';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
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

      {/* Screens Flow Editor */}
      {screenshots.length > 0 && (
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <ScreensFlowEditor
            screenshots={screenshots}
            selectedIndex={selectedPreviewIndex}
            onSelectIndex={setSelectedPreviewIndex}
            onScreenshotsChange={setScreenshots}
            style={styleConfig}
            deviceSize={deviceSize}
            translationData={translationData}
            selectedLanguage={selectedLanguage}
          />
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

        </div>
      </main>
    </div>
  );
}

export default App;
