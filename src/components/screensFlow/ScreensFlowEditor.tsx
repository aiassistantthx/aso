import React, { useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, TranslationData, ScreenshotMockupSettings } from '../../types';
import { DEFAULT_MOCKUP_SETTINGS } from './types';
import { LinkedPairCanvas } from './LinkedPairCanvas';
import { SingleScreenPreview } from './SingleScreenPreview';
import { UploadCard } from './UploadCard';

// Inject responsive styles for ScreensFlowEditor
if (typeof document !== 'undefined' && !document.getElementById('screens-flow-editor-responsive')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'screens-flow-editor-responsive';
  styleEl.textContent = `
    @media (max-width: 768px) {
      .screens-flow-editor {
        transform: scale(0.8);
        transform-origin: top center;
      }
      .screens-flow-thumbs {
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        justify-content: flex-start !important;
        padding-bottom: 10px !important;
      }
      .screens-flow-thumb {
        flex-shrink: 0 !important;
      }
      .screens-flow-controls {
        flex-wrap: wrap !important;
        gap: 8px !important;
      }
      .screens-flow-slider {
        min-width: 100px !important;
      }
    }
    @media (max-width: 480px) {
      .screens-flow-editor {
        transform: scale(0.65);
      }
    }
  `;
  document.head.appendChild(styleEl);
}

interface Props {
  screenshots: Screenshot[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  style: StyleConfig;
  deviceSize: DeviceSize;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  onTranslationChange?: (data: TranslationData) => void;
  /** Read-only mode: hides all editing controls, just displays previews */
  readOnly?: boolean;
}

export const ScreensFlowEditor: React.FC<Props> = ({
  screenshots,
  selectedIndex,
  onSelectIndex,
  onScreenshotsChange,
  style,
  deviceSize,
  translationData,
  selectedLanguage = 'all',
  onTranslationChange,
  readOnly = false
}) => {
  const maxScreenshots = 10;

  // Handle file upload
  const handleFilesSelected = useCallback((files: FileList) => {
    const remainingSlots = maxScreenshots - screenshots.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newScreenshots: Screenshot[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      text: ''
    }));

    onScreenshotsChange([...screenshots, ...newScreenshots]);
  }, [screenshots, onScreenshotsChange]);

  // Add text-only slide
  const handleAddTextSlide = useCallback(() => {
    if (screenshots.length >= maxScreenshots) return;

    const newScreenshot: Screenshot = {
      id: `${Date.now()}-text`,
      file: null as unknown as File,
      preview: '',
      text: 'Your text here'
    };

    onScreenshotsChange([...screenshots, newScreenshot]);
  }, [screenshots, onScreenshotsChange]);

  // Remove screenshot
  const handleRemoveScreenshot = useCallback((id: string) => {
    const screenshot = screenshots.find(s => s.id === id);
    if (screenshot && screenshot.preview) {
      URL.revokeObjectURL(screenshot.preview);
    }
    onScreenshotsChange(screenshots.filter(s => s.id !== id));
  }, [screenshots, onScreenshotsChange]);

  // Replace screenshot at specific index
  const handleReplaceScreenshot = useCallback((index: number, file: File) => {
    const oldScreenshot = screenshots[index];
    if (oldScreenshot && oldScreenshot.preview) {
      URL.revokeObjectURL(oldScreenshot.preview);
    }

    const newScreenshots = screenshots.map((s, i) => {
      if (i === index) {
        return {
          ...s,
          file,
          preview: URL.createObjectURL(file)
        };
      }
      return s;
    });
    onScreenshotsChange(newScreenshots);
  }, [screenshots, onScreenshotsChange]);

  // Move screenshot left or right
  const handleMoveScreenshot = useCallback((index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= screenshots.length) return;

    const newScreenshots = [...screenshots];
    [newScreenshots[index], newScreenshots[targetIndex]] = [newScreenshots[targetIndex], newScreenshots[index]];
    onScreenshotsChange(newScreenshots);
  }, [screenshots, onScreenshotsChange]);

  const updateSettings = (index: number, settings: ScreenshotMockupSettings) => {
    const newScreenshots = screenshots.map((s, i) =>
      i === index ? { ...s, mockupSettings: settings } : s
    );
    onScreenshotsChange(newScreenshots);
  };

  const updateBothSettings = (index1: number, index2: number, s1: ScreenshotMockupSettings, s2: ScreenshotMockupSettings) => {
    const newScreenshots = screenshots.map((s, i) => {
      if (i === index1) return { ...s, mockupSettings: s1 };
      if (i === index2) return { ...s, mockupSettings: s2 };
      return s;
    });
    onScreenshotsChange(newScreenshots);
  };

  const linkScreens = (index: number) => {
    if (index >= screenshots.length - 1) return;

    const screen1Settings = screenshots[index].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
    // Don't copy scale - let it fall back to style.mockupScale
    const { scale: _s1, ...screen1SettingsWithoutScale } = screen1Settings;
    const screen2Settings = screenshots[index + 1].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
    const { scale: _s2, ...screen2SettingsWithoutScale } = screen2Settings;

    // When linking screen1 and screen2:
    // - screen2 uses screen1's screenshot in the mockup (continuation)
    // - screen2's original screenshot moves to screen3 (if exists)
    const screen2Screenshot = {
      file: screenshots[index + 1].file,
      preview: screenshots[index + 1].preview
    };

    const newScreenshots = screenshots.map((s, i) => {
      if (i === index) {
        // Screen 1: mark as linked, position mockup at right edge
        return {
          ...s,
          mockupSettings: {
            ...screen1SettingsWithoutScale,
            linkedToNext: true,
            offsetX: 50 // Start at divider
          }
        };
      }
      if (i === index + 1) {
        // Screen 2: use screen1's screenshot (via linkedMockupIndex), clear its own screenshot
        return {
          ...s,
          file: null,
          preview: '',
          linkedMockupIndex: index,
          mockupSettings: {
            ...screen2SettingsWithoutScale,
            offsetX: -50,
            rotation: screen1Settings.rotation
          }
        };
      }
      if (i === index + 2 && screen2Screenshot.preview) {
        // Screen 3: receives screen2's original screenshot (if screen2 had one)
        return {
          ...s,
          file: screen2Screenshot.file,
          preview: screen2Screenshot.preview
        };
      }
      return s;
    });

    onScreenshotsChange(newScreenshots);
  };

  const unlinkScreens = (index: number) => {
    // When unlinking, restore screen2's mockup to use its own screenshot
    // If screen2 has no screenshot, copy from screen1 (the linked source)
    const screen1 = screenshots[index];

    // Check if screen3 has a screenshot that was originally from screen2
    const screen3 = screenshots[index + 2];
    const restoreFromScreen3 = screen3?.preview && !screen3?.mockupSettings?.linkedToNext;

    const newScreenshots = screenshots.map((s, i) => {
      if (i === index) {
        return {
          ...s,
          mockupSettings: {
            ...(s.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
            linkedToNext: false,
            offsetX: 0
          }
        };
      }
      if (i === index + 1) {
        const { linkedMockupIndex: _, ...rest } = s;
        // Restore screenshot: if screen3 has one, move it back; otherwise use screen1's
        const restoredPreview = restoreFromScreen3 ? screen3.preview : screen1.preview;
        const restoredFile = restoreFromScreen3 ? screen3.file : null;
        return {
          ...rest,
          preview: restoredPreview,
          file: restoredFile,
          mockupSettings: {
            ...(s.mockupSettings || DEFAULT_MOCKUP_SETTINGS),
            offsetX: 0
          }
        };
      }
      if (i === index + 2 && restoreFromScreen3) {
        // Clear screen3's screenshot since we moved it back to screen2
        return {
          ...s,
          preview: '',
          file: null
        };
      }
      return s;
    });

    onScreenshotsChange(newScreenshots);
  };

  // Text editing helpers
  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  const handleTextChange = (id: string, text: string) => {
    onScreenshotsChange(
      screenshots.map(s => s.id === id ? { ...s, text } : s)
    );
  };

  const handleTranslatedTextChange = (index: number, text: string) => {
    if (!translationData || !onTranslationChange || selectedLanguage === 'all') return;
    const newHeadlines = { ...translationData.headlines };
    newHeadlines[selectedLanguage] = [...(newHeadlines[selectedLanguage] || [])];
    newHeadlines[selectedLanguage][index] = text;
    onTranslationChange({ ...translationData, headlines: newHeadlines });
  };

  const getTextValue = (screenshot: Screenshot, index: number): string => {
    if (isEditingTranslation) {
      return translationData.headlines[selectedLanguage]?.[index] || screenshot.text;
    }
    return screenshot.text;
  };

  // Build render list - group linked pairs
  const renderItems: Array<{ type: 'single'; index: number } | { type: 'pair'; index1: number; index2: number }> = [];
  let i = 0;
  while (i < screenshots.length) {
    const screen = screenshots[i];
    if (screen.mockupSettings?.linkedToNext && i < screenshots.length - 1) {
      renderItems.push({ type: 'pair', index1: i, index2: i + 1 });
      i += 2;
    } else {
      renderItems.push({ type: 'single', index: i });
      i += 1;
    }
  }

  // Empty state - show full upload UI
  if (screenshots.length === 0) {
    return (
      <div style={{
        padding: '40px 24px',
        marginTop: '16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <UploadCard
          onFilesSelected={handleFilesSelected}
          onAddTextSlide={handleAddTextSlide}
        />
      </div>
    );
  }

  return (
    <div style={{
      padding: readOnly ? '16px 0' : '20px 24px',
      paddingTop: readOnly ? '16px' : '28px',
      marginTop: readOnly ? '0' : '16px',
      backgroundColor: '#fff',
      borderBottom: readOnly ? 'none' : '1px solid rgba(0, 0, 0, 0.06)'
    }}>
      {!readOnly && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>
            Screens ({screenshots.length}/{maxScreenshots})
          </span>

          <span style={{ fontSize: '12px', color: '#86868b', flex: 1 }}>
            Drag mockups to position • Click ○ to link screens
          </span>

          {/* Align to first button - aligns X and Y position */}
          <button
            onClick={() => {
              if (screenshots.length < 2) return;
              const firstSettings = screenshots[0].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
              const newScreenshots = screenshots.map((s, i) => {
                if (i === 0) return s;
                // Skip linked screens (they share settings with previous)
                if (s.linkedMockupIndex !== undefined) return s;

                // Copy X and Y position from first, preserve rotation
                const currentSettings = s.mockupSettings;
                return {
                  ...s,
                  mockupSettings: {
                    offsetX: firstSettings.offsetX,
                    offsetY: firstSettings.offsetY,
                    rotation: currentSettings?.rotation ?? 0,
                    linkedToNext: currentSettings?.linkedToNext
                    // Don't set scale - let it fall back to style.mockupScale
                  }
                };
              });
              onScreenshotsChange(newScreenshots);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 500,
              border: '1px solid #FF6B4A',
              borderRadius: '6px',
              backgroundColor: '#f0f7ff',
              color: '#FF6B4A',
              cursor: 'pointer'
            }}
          >
            Align to First
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              const newScreenshots = screenshots.map(s => {
                const { mockupSettings: _, linkedMockupIndex: __, ...rest } = s;
                return rest;
              });
              onScreenshotsChange(newScreenshots);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 500,
              border: '1px solid #d1d1d6',
              borderRadius: '6px',
              backgroundColor: '#fff',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            Reset Layout
          </button>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingTop: '12px',
        paddingBottom: '16px',
        alignItems: 'flex-start'
      }}>
        {renderItems.map((item) => {
          if (item.type === 'pair') {
            return (
              <div key={`pair-${item.index1}-scale-${style.mockupScale}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <LinkedPairCanvas
                    screen1={screenshots[item.index1]}
                    screen2={screenshots[item.index2]}
                    index1={item.index1}
                    index2={item.index2}
                    selectedIndex={selectedIndex}
                    style={style}
                    deviceSize={deviceSize}
                    onSelectIndex={onSelectIndex}
                    onBothSettingsChange={(s1, s2) => updateBothSettings(item.index1, item.index2, s1, s2)}
                    onUnlink={() => unlinkScreens(item.index1)}
                    translationData={translationData}
                    selectedLanguage={selectedLanguage}
                    readOnly={readOnly}
                  />
                </div>
                {/* Text inputs for linked pair - hide in readOnly mode */}
                {!readOnly && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[item.index1, item.index2].map((idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={getTextValue(screenshots[idx], idx)}
                        onChange={(e) => {
                          if (isEditingTranslation) {
                            handleTranslatedTextChange(idx, e.target.value);
                          } else {
                            handleTextChange(screenshots[idx].id, e.target.value);
                          }
                        }}
                        placeholder={`Screen ${idx + 1} headline`}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '12px',
                          border: '1px solid #e0e0e5',
                          borderRadius: '8px',
                          outline: 'none',
                          minWidth: 0
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF6B4A';
                          e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 74, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e5';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            const screen = screenshots[item.index];
            const isLastLinkedScreen = item.index > 0 && screenshots[item.index - 1]?.mockupSettings?.linkedToNext;
            if (isLastLinkedScreen) return null; // Skip - already rendered in pair

            return (
              <div key={`${screen.id}-scale-${style.mockupScale}`} style={{ display: 'flex', flexDirection: 'column', gap: readOnly ? '0' : '8px' }}>
                <div style={{ position: 'relative' }}>
                  {/* Delete button - hide in readOnly mode */}
                  {!readOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveScreenshot(screen.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#ff3b30',
                        color: '#fff',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        boxShadow: '0 2px 6px rgba(255,59,48,0.4)'
                      }}
                      title="Remove screenshot"
                    >
                      ×
                    </button>
                  )}
                  <SingleScreenPreview
                    key={`single-${item.index}-scale-${style.mockupScale}`}
                    screenshot={screen}
                    index={item.index}
                    isSelected={item.index === selectedIndex}
                    style={style}
                    deviceSize={deviceSize}
                    onClick={() => onSelectIndex(item.index)}
                    onSettingsChange={(settings) => updateSettings(item.index, settings)}
                    onLinkToNext={() => linkScreens(item.index)}
                    showLinkButton={item.index < screenshots.length - 1}
                    translationData={translationData}
                    selectedLanguage={selectedLanguage}
                    allScreenshots={screenshots}
                    readOnly={readOnly}
                    onReplaceScreenshot={(file) => handleReplaceScreenshot(item.index, file)}
                    onMoveLeft={() => handleMoveScreenshot(item.index, 'left')}
                    onMoveRight={() => handleMoveScreenshot(item.index, 'right')}
                    canMoveLeft={item.index > 0}
                    canMoveRight={item.index < screenshots.length - 1}
                  />
                </div>
                {/* Text input below preview - hide in readOnly mode */}
                {!readOnly && (
                  <input
                    type="text"
                    value={getTextValue(screen, item.index)}
                    onChange={(e) => {
                      if (isEditingTranslation) {
                        handleTranslatedTextChange(item.index, e.target.value);
                      } else {
                        handleTextChange(screen.id, e.target.value);
                      }
                    }}
                    placeholder={`Screen ${item.index + 1} headline`}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12px',
                      border: '1px solid #e0e0e5',
                      borderRadius: '8px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#FF6B4A';
                      e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 74, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e5';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}
              </div>
            );
          }
        })}

        {/* Add more screenshots - hide in readOnly mode */}
        {!readOnly && screenshots.length < maxScreenshots && (
          <UploadCard
            onFilesSelected={handleFilesSelected}
            onAddTextSlide={handleAddTextSlide}
            isCompact
          />
        )}
      </div>
    </div>
  );
};
