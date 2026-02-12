import React, { useState, useCallback } from 'react';
import { Screenshot, StyleConfig, DeviceSize, TranslationData, ScreenshotMockupSettings } from '../../types';
import { DragMode, DEFAULT_MOCKUP_SETTINGS } from './types';
import { LinkedPairCanvas } from './LinkedPairCanvas';
import { SingleScreenPreview } from './SingleScreenPreview';
import { UploadCard } from './UploadCard';

interface Props {
  screenshots: Screenshot[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  style: StyleConfig;
  onStyleChange: (style: StyleConfig) => void;
  deviceSize: DeviceSize;
  translationData?: TranslationData | null;
  selectedLanguage?: string;
  onTranslationChange?: (data: TranslationData) => void;
}

export const ScreensFlowEditor: React.FC<Props> = ({
  screenshots, selectedIndex, onSelectIndex, onScreenshotsChange,
  style, onStyleChange, deviceSize, translationData,
  selectedLanguage = 'all', onTranslationChange
}) => {
  const [dragMode, setDragMode] = useState<DragMode>('mockup');
  const maxScreenshots = 10;

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

  const handleRemoveScreenshot = useCallback((id: string) => {
    const screenshot = screenshots.find(s => s.id === id);
    if (screenshot && screenshot.preview) URL.revokeObjectURL(screenshot.preview);
    onScreenshotsChange(screenshots.filter(s => s.id !== id));
  }, [screenshots, onScreenshotsChange]);

  const updateSettings = (index: number, settings: ScreenshotMockupSettings) => {
    onScreenshotsChange(screenshots.map((s, i) => i === index ? { ...s, mockupSettings: settings } : s));
  };

  const updateBothSettings = (index1: number, index2: number, s1: ScreenshotMockupSettings, s2: ScreenshotMockupSettings) => {
    onScreenshotsChange(screenshots.map((s, i) => {
      if (i === index1) return { ...s, mockupSettings: s1 };
      if (i === index2) return { ...s, mockupSettings: s2 };
      return s;
    }));
  };

  const linkScreens = (index: number) => {
    if (index >= screenshots.length - 1) return;
    const screen1Settings = screenshots[index].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
    const { scale: _s1, ...screen1SettingsWithoutScale } = screen1Settings;
    const screen2Settings = screenshots[index + 1].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
    const { scale: _s2, ...screen2SettingsWithoutScale } = screen2Settings;

    const screen2Screenshot = { file: screenshots[index + 1].file, preview: screenshots[index + 1].preview };
    const newScreenshots = screenshots.map((s, i) => {
      if (i === index) return { ...s, mockupSettings: { ...screen1SettingsWithoutScale, linkedToNext: true, offsetX: 50 } };
      if (i === index + 1) return { ...s, file: null, preview: '', linkedMockupIndex: index, mockupSettings: { ...screen2SettingsWithoutScale, offsetX: -50, rotation: screen1Settings.rotation } };
      if (i === index + 2 && screen2Screenshot.preview) return { ...s, file: screen2Screenshot.file, preview: screen2Screenshot.preview };
      return s;
    });
    onScreenshotsChange(newScreenshots);
  };

  const unlinkScreens = (index: number) => {
    const newScreenshots = screenshots.map((s, i) => {
      if (i === index) return { ...s, mockupSettings: { ...(s.mockupSettings || DEFAULT_MOCKUP_SETTINGS), linkedToNext: false, offsetX: 0 } };
      if (i === index + 1) {
        const { linkedMockupIndex: _, ...rest } = s;
        return { ...rest, mockupSettings: { ...(s.mockupSettings || DEFAULT_MOCKUP_SETTINGS), offsetX: 0 } };
      }
      return s;
    });
    onScreenshotsChange(newScreenshots);
  };

  const isEditingTranslation = selectedLanguage !== 'all' && translationData;

  const handleTextChange = (id: string, text: string) => {
    onScreenshotsChange(screenshots.map(s => s.id === id ? { ...s, text } : s));
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
    if (screenshots[i].mockupSettings?.linkedToNext && i < screenshots.length - 1) {
      renderItems.push({ type: 'pair', index1: i, index2: i + 1 });
      i += 2;
    } else {
      renderItems.push({ type: 'single', index: i });
      i += 1;
    }
  }

  if (screenshots.length === 0) {
    return (
      <div style={{ padding: '40px 24px', marginTop: '16px', backgroundColor: '#fff', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <UploadCard onFilesSelected={handleFilesSelected} onAddTextSlide={handleAddTextSlide} />
      </div>
    );
  }

  const textInput = (idx: number) => (
    <input
      key={idx}
      type="text"
      value={getTextValue(screenshots[idx], idx)}
      onChange={(e) => {
        if (isEditingTranslation) handleTranslatedTextChange(idx, e.target.value);
        else handleTextChange(screenshots[idx].id, e.target.value);
      }}
      placeholder={`Screen ${idx + 1} headline`}
      style={{
        flex: 1, padding: '8px 10px', fontSize: '12px',
        border: '1px solid #e0e0e5', borderRadius: '8px', outline: 'none', minWidth: 0, boxSizing: 'border-box'
      }}
      onFocus={(e) => { e.target.style.borderColor = '#0071e3'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 113, 227, 0.1)'; }}
      onBlur={(e) => { e.target.style.borderColor = '#e0e0e5'; e.target.style.boxShadow = 'none'; }}
    />
  );

  return (
    <div style={{ padding: '20px 24px', paddingTop: '28px', marginTop: '16px', backgroundColor: '#fff', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>
          Screens ({screenshots.length}/{maxScreenshots})
        </span>

        {/* Drag mode toggle */}
        <div style={{ display: 'flex', backgroundColor: '#f0f0f5', borderRadius: '8px', padding: '2px' }}>
          {(['mockup', 'text'] as DragMode[]).map((mode) => (
            <button key={mode} onClick={() => setDragMode(mode)} style={{
              padding: '6px 12px', fontSize: '12px', fontWeight: 500, border: 'none', borderRadius: '6px',
              backgroundColor: dragMode === mode ? '#fff' : 'transparent',
              color: dragMode === mode ? '#0071e3' : '#666',
              cursor: 'pointer',
              boxShadow: dragMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</button>
          ))}
        </div>

        <span style={{ fontSize: '12px', color: '#86868b', flex: 1 }}>
          Drag {dragMode === 'mockup' ? 'mockups' : 'text'} to position • Click ○ to link screens
        </span>

        <button onClick={() => {
          if (screenshots.length < 2) return;
          const firstSettings = screenshots[0].mockupSettings || DEFAULT_MOCKUP_SETTINGS;
          onScreenshotsChange(screenshots.map((s, i) => {
            if (i === 0 || s.linkedMockupIndex !== undefined) return s;
            const cs = s.mockupSettings;
            return { ...s, mockupSettings: { offsetX: cs?.offsetX ?? 0, offsetY: firstSettings.offsetY, rotation: cs?.rotation ?? 0, linkedToNext: cs?.linkedToNext } };
          }));
        }} style={{
          padding: '6px 12px', fontSize: '11px', fontWeight: 500,
          border: '1px solid #0071e3', borderRadius: '6px',
          backgroundColor: '#f0f7ff', color: '#0071e3', cursor: 'pointer'
        }}>Align to First</button>

        <button onClick={() => {
          onScreenshotsChange(screenshots.map(s => {
            const { mockupSettings: _, linkedMockupIndex: __, ...rest } = s;
            return rest;
          }));
        }} style={{
          padding: '6px 12px', fontSize: '11px', fontWeight: 500,
          border: '1px solid #d1d1d6', borderRadius: '6px',
          backgroundColor: '#fff', color: '#666', cursor: 'pointer'
        }}>Reset Layout</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingTop: '12px', paddingBottom: '16px', alignItems: 'flex-start' }}>
        {renderItems.map((item) => {
          if (item.type === 'pair') {
            return (
              <div key={`pair-${item.index1}-scale-${style.mockupScale}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <LinkedPairCanvas
                    screen1={screenshots[item.index1]} screen2={screenshots[item.index2]}
                    index1={item.index1} index2={item.index2} selectedIndex={selectedIndex}
                    style={style} onStyleChange={onStyleChange} deviceSize={deviceSize}
                    onSelectIndex={onSelectIndex}
                    onBothSettingsChange={(s1, s2) => updateBothSettings(item.index1, item.index2, s1, s2)}
                    onUnlink={() => unlinkScreens(item.index1)}
                    translationData={translationData} selectedLanguage={selectedLanguage} dragMode={dragMode}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {textInput(item.index1)}
                  {textInput(item.index2)}
                </div>
              </div>
            );
          } else {
            const screen = screenshots[item.index];
            const isLastLinkedScreen = item.index > 0 && screenshots[item.index - 1]?.mockupSettings?.linkedToNext;
            if (isLastLinkedScreen) return null;

            return (
              <div key={screen.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveScreenshot(screen.id); }} style={{
                    position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px',
                    borderRadius: '50%', border: 'none', backgroundColor: '#ff3b30', color: '#fff',
                    fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 6px rgba(255,59,48,0.4)'
                  }} title="Remove screenshot">×</button>
                  <SingleScreenPreview
                    screenshot={screen} index={item.index} isSelected={item.index === selectedIndex}
                    style={style} deviceSize={deviceSize} onClick={() => onSelectIndex(item.index)}
                    onSettingsChange={(settings) => updateSettings(item.index, settings)}
                    onStyleChange={onStyleChange} onLinkToNext={() => linkScreens(item.index)}
                    showLinkButton={item.index < screenshots.length - 1}
                    translationData={translationData} selectedLanguage={selectedLanguage}
                    allScreenshots={screenshots} dragMode={dragMode}
                  />
                </div>
                {textInput(item.index)}
              </div>
            );
          }
        })}

        {screenshots.length < maxScreenshots && (
          <UploadCard onFilesSelected={handleFilesSelected} onAddTextSlide={handleAddTextSlide} isCompact />
        )}
      </div>
    </div>
  );
};
