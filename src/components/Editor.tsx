import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Screenshot, StyleConfig, DeviceSize, TranslationData } from '../types';
import { StyleEditor } from './StyleEditor';
import { ScreensFlowEditor } from './ScreensFlowEditor';
import { LanguageSelector } from './LanguageSelector';
import { ExportButton } from './ExportButton';
import { LanguageSidebar } from './LanguageSidebar';
import { projects as projectsApi, screenshots as screenshotsApi, ProjectFull } from '../services/api';
import { useAuth } from '../services/authContext';

interface Props {
  projectId: string;
  onBack: () => void;
}

const defaultStyle: StyleConfig = {
  backgroundColor: '#667eea',
  gradient: {
    enabled: true,
    color1: '#667eea',
    color2: '#764ba2',
    angle: 135,
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
  mockupStyle: 'flat',
  mockupVisibility: 'full',
  mockupAlignment: 'center',
  mockupOffset: { x: 0, y: 0 },
  textOffset: { x: 0, y: 0 },
  mockupScale: 1.0,
  mockupRotation: 0,
  mockupContinuation: 'none',
  highlightColor: '#FFE135',
  highlightPadding: 12,
  highlightBorderRadius: 8,
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.72)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    padding: '0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
  },
  headerContent: {
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
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
    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
  },
  logo: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1d1d1f',
    letterSpacing: '-0.4px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '3px',
  },
  main: {
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'flex',
    gap: '0',
  },
  mainContent: {
    flex: 1,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minWidth: 0,
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '18px',
    padding: '22px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
    transition: 'box-shadow 0.3s ease, transform 0.2s ease',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  headerButtonPrimary: {
    background: 'linear-gradient(135deg, #0071e3 0%, #0077ed 100%)',
    borderColor: 'transparent',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(0, 113, 227, 0.35)',
  },
  saveStatus: {
    fontSize: '12px',
    color: '#86868b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
};

export const Editor: React.FC<Props> = ({ projectId, onBack }) => {
  const { user } = useAuth();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultStyle);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('6.9');
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguages, setTargetLanguages] = useState<string[]>([
    'en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT',
    'pt-BR', 'ja-JP', 'ko-KR', 'zh-Hans', 'ru-RU',
  ]);
  const [apiKey, setApiKey] = useState('');
  const [translationData, setTranslationData] = useState<TranslationData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [projectName, setProjectName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load project from API
  useEffect(() => {
    const loadProject = async () => {
      try {
        const project: ProjectFull = await projectsApi.get(projectId);
        setProjectName(project.name);
        setDeviceSize((project.deviceSize || '6.9') as DeviceSize);
        setSourceLanguage(project.sourceLanguage || 'en-US');
        setTargetLanguages(project.targetLanguages?.length ? project.targetLanguages : [
          'en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT',
          'pt-BR', 'ja-JP', 'ko-KR', 'zh-Hans', 'ru-RU',
        ]);

        if (project.styleConfig && Object.keys(project.styleConfig).length > 0) {
          setStyleConfig({ ...defaultStyle, ...project.styleConfig } as StyleConfig);
        }

        if (project.translationData) {
          setTranslationData(project.translationData as unknown as TranslationData);
        }

        // Convert DB screenshots to frontend format
        const loadedScreenshots: Screenshot[] = await Promise.all(
          project.screenshots.map(async (s) => {
            let preview = '';
            if (s.imagePath) {
              const imageUrl = `/uploads/${project.userId}/${projectId}/${s.imagePath}`;
              // Load image as base64 for canvas rendering
              try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                preview = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(blob);
                });
              } catch {
                preview = '';
              }
            }
            return {
              id: s.id,
              file: null,
              preview,
              text: s.text || '',
              decorations: s.decorations as Screenshot['decorations'],
              styleOverride: s.styleOverride as Screenshot['styleOverride'],
              mockupSettings: s.mockupSettings as Screenshot['mockupSettings'],
            };
          }),
        );

        setScreenshots(loadedScreenshots);
        setLoaded(true);
      } catch (err) {
        console.error('Failed to load project:', err);
        onBack();
      }
    };

    loadProject();
  }, [projectId, onBack]);

  // Auto-save (debounced)
  useEffect(() => {
    if (!loaded) return;

    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        await projectsApi.autosave(projectId, {
          styleConfig,
          deviceSize,
          sourceLanguage,
          targetLanguages,
          translationData,
        });

        // Also save screenshot data
        if (screenshots.length > 0) {
          await screenshotsApi.bulkUpdate(
            projectId,
            screenshots.map((s, i) => ({
              id: s.id,
              text: s.text,
              order: i,
              decorations: s.decorations,
              styleOverride: s.styleOverride,
              mockupSettings: s.mockupSettings,
            })),
          );
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [screenshots, styleConfig, deviceSize, sourceLanguage, targetLanguages, translationData, projectId, loaded]);

  // Ensure preview index is valid
  useEffect(() => {
    if (selectedPreviewIndex >= screenshots.length && screenshots.length > 0) {
      setSelectedPreviewIndex(screenshots.length - 1);
    } else if (screenshots.length === 0) {
      setSelectedPreviewIndex(0);
    }
  }, [screenshots.length, selectedPreviewIndex]);

  // Handle screenshot upload - upload to server then add to state
  const handleScreenshotsChange = useCallback(async (newScreenshots: Screenshot[]) => {
    // Find new screenshots (those with a File but no server ID matching pattern)
    const toUpload = newScreenshots.filter(
      (s) => s.file && !screenshots.find((existing) => existing.id === s.id),
    );

    if (toUpload.length > 0) {
      const uploadedScreenshots: Screenshot[] = [...screenshots];

      for (const s of toUpload) {
        if (!s.file) continue;
        try {
          const result = await screenshotsApi.upload(projectId, s.file);
          // Load the uploaded image as base64
          let preview = s.preview;
          if (result.imageUrl) {
            try {
              const response = await fetch(result.imageUrl);
              const blob = await response.blob();
              preview = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
            } catch {
              // keep original preview
            }
          }
          uploadedScreenshots.push({
            ...s,
            id: result.id,
            preview,
            file: null,
          });
        } catch (err) {
          console.error('Failed to upload screenshot:', err);
        }
      }

      setScreenshots(uploadedScreenshots);
    } else {
      // Just update state (reorder, text change, etc.)
      setScreenshots(newScreenshots);
    }
  }, [screenshots, projectId]);

  // Handle manual save
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await projectsApi.update(projectId, {
        name: projectName,
        styleConfig,
        deviceSize,
        sourceLanguage,
        targetLanguages,
        translationData,
      });

      if (screenshots.length > 0) {
        await screenshotsApi.bulkUpdate(
          projectId,
          screenshots.map((s, i) => ({
            id: s.id,
            text: s.text,
            order: i,
            decorations: s.decorations,
            styleOverride: s.styleOverride,
            mockupSettings: s.mockupSettings,
          })),
        );
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [projectId, projectName, styleConfig, deviceSize, sourceLanguage, targetLanguages, translationData, screenshots]);

  const startEditingName = useCallback(() => {
    setNameDraft(projectName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  }, [projectName]);

  const commitName = useCallback(async () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== projectName) {
      setProjectName(trimmed);
      try {
        await projectsApi.update(projectId, { name: trimmed });
      } catch (err) {
        console.error('Failed to rename project:', err);
      }
    }
    setEditingName(false);
  }, [nameDraft, projectName, projectId]);

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header as React.CSSProperties}>
        <div style={styles.headerContent as React.CSSProperties}>
          <div style={styles.logoContainer as React.CSSProperties}>
            <button
              style={{
                ...styles.headerButton,
                padding: '8px 14px',
              }}
              onClick={onBack}
            >
              ← Back
            </button>
            <div>
              {editingName ? (
                <input
                  ref={nameInputRef}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={commitName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitName();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  autoFocus
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1d1d1f',
                    letterSpacing: '-0.4px',
                    border: '1px solid #0071e3',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    outline: 'none',
                    width: '240px',
                    boxShadow: '0 0 0 3px rgba(0, 113, 227, 0.12)',
                  }}
                />
              ) : (
                <h1
                  style={{ ...styles.logo, cursor: 'pointer' }}
                  onClick={startEditingName}
                  title="Click to rename"
                >
                  {projectName || 'Untitled Project'}
                  <span style={{ marginLeft: '8px', fontSize: '14px', color: '#86868b', fontWeight: 400 }}>
                    &#9998;
                  </span>
                </h1>
              )}
              <p style={styles.subtitle}>
                {user?.plan === 'PRO' ? 'Pro' : 'Free'} plan
              </p>
            </div>
          </div>
          <div style={styles.headerButtons as React.CSSProperties}>
            <span style={styles.saveStatus as React.CSSProperties}>
              {saving ? 'Saving...' : 'Auto-saved'}
            </span>
            <button
              style={{ ...styles.headerButton, ...styles.headerButtonPrimary }}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Screens Flow Editor */}
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <ScreensFlowEditor
          screenshots={screenshots}
          selectedIndex={selectedPreviewIndex}
          onSelectIndex={setSelectedPreviewIndex}
          onScreenshotsChange={handleScreenshotsChange}
          style={styleConfig}
          onStyleChange={setStyleConfig}
          deviceSize={deviceSize}
          translationData={translationData}
          selectedLanguage={selectedLanguage}
          onTranslationChange={setTranslationData}
        />
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        {translationData && (
          <LanguageSidebar
            translationData={translationData}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        )}

        <div style={styles.mainContent as React.CSSProperties}>
          <div style={styles.leftPanel as React.CSSProperties}>
            <div style={styles.card}>
              <StyleEditor
                style={styleConfig}
                onStyleChange={setStyleConfig}
                deviceSize={deviceSize}
                screenshots={screenshots}
                selectedIndex={selectedPreviewIndex}
                onScreenshotsChange={setScreenshots}
                translationData={translationData}
                selectedLanguage={selectedLanguage}
                onTranslationChange={setTranslationData}
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
};
