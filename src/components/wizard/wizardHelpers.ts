import { UnifiedProjectFull } from '../../services/api';
import { StyleConfig, Screenshot, Decoration, ScreenshotStyleOverride, ScreenshotMockupSettings, Platform } from '../../types';
import { LAYOUT_PRESETS } from '../../constants/tonePresets';
import { THEME_PRESETS } from '../../constants/templates';
import { WizardProjectData } from './wizardTypes';

// Convert UnifiedProjectFull to WizardProjectData
export function toWizardData(p: UnifiedProjectFull): WizardProjectData {
  return {
    id: p.id,
    userId: p.userId,
    platform: (p.metadataPlatform as Platform) || 'ios',
    appName: p.appName,
    briefDescription: p.briefDescription,
    targetKeywords: p.targetKeywords,
    uploadedScreenshots: p.wizardUploadedScreenshots,
    generateScreenshots: p.wizardGenerateScreenshots,
    generateIcon: p.wizardGenerateIcon,
    generateMetadata: p.wizardGenerateMetadata,
    tone: p.wizardTone,
    layoutPreset: p.wizardLayoutPreset,
    selectedTemplateId: p.wizardSelectedTemplateId,
    sourceLanguage: p.sourceLanguage,
    targetLanguages: p.targetLanguages,
    generatedHeadlines: p.wizardGeneratedHeadlines,
    editedHeadlines: p.wizardEditedHeadlines,
    generatedMetadata: p.generatedMetadata,
    editedMetadata: p.editedMetadata,
    generatedIconUrl: p.wizardGeneratedIconUrl,
    translatedHeadlines: p.wizardTranslatedHeadlines,
    translatedMetadata: p.metadataTranslations,
    styleConfig: p.styleConfig,
    screenshotEditorData: p.wizardScreenshotEditorData,
    translatedEditorData: p.wizardTranslatedEditorData,
    currentStep: p.wizardCurrentStep,
    status: p.wizardStatus,
    generationErrors: p.generationErrors,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// Convert wizard update data to unified update data
export function toUnifiedUpdate(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Direct mappings
  if ('appName' in data) result.appName = data.appName;
  if ('briefDescription' in data) result.briefDescription = data.briefDescription;
  if ('targetKeywords' in data) result.targetKeywords = data.targetKeywords;
  if ('sourceLanguage' in data) result.sourceLanguage = data.sourceLanguage;
  if ('targetLanguages' in data) result.targetLanguages = data.targetLanguages;
  if ('styleConfig' in data) result.styleConfig = data.styleConfig;
  if ('platform' in data) result.metadataPlatform = data.platform;

  // Wizard-specific field mappings
  if ('tone' in data) result.wizardTone = data.tone;
  if ('layoutPreset' in data) result.wizardLayoutPreset = data.layoutPreset;
  if ('selectedTemplateId' in data) result.wizardSelectedTemplateId = data.selectedTemplateId;
  if ('currentStep' in data) result.wizardCurrentStep = data.currentStep;
  if ('status' in data) result.wizardStatus = data.status;
  if ('editedHeadlines' in data) result.wizardEditedHeadlines = data.editedHeadlines;
  if ('editedMetadata' in data) result.editedMetadata = data.editedMetadata;
  if ('screenshotEditorData' in data) result.wizardScreenshotEditorData = data.screenshotEditorData;
  if ('translatedEditorData' in data) result.wizardTranslatedEditorData = data.translatedEditorData;
  if ('generateScreenshots' in data) result.wizardGenerateScreenshots = data.generateScreenshots;
  if ('generateIcon' in data) result.wizardGenerateIcon = data.generateIcon;
  if ('generateMetadata' in data) result.wizardGenerateMetadata = data.generateMetadata;

  return result;
}

// Helper: resolve StyleConfig from wizard project data
export function resolveStyleConfig(project: WizardProjectData): StyleConfig | null {
  // If user already edited in editor and saved a styleConfig, use it directly
  if (project.styleConfig) {
    return project.styleConfig as unknown as StyleConfig;
  }

  // Otherwise resolve from template + layout preset
  const templateId = project.selectedTemplateId;
  const themePreset = templateId ? THEME_PRESETS.find(t => t.id === templateId) : null;
  if (!themePreset) return null;

  const editorLayoutPreset = LAYOUT_PRESETS.find(l => l.id === project.layoutPreset) || LAYOUT_PRESETS[0];
  const editorLayoutStyle = editorLayoutPreset.getStyle(0);

  return {
    backgroundColor: themePreset.backgroundColor,
    gradient: themePreset.gradient,
    textColor: themePreset.textColor,
    fontFamily: themePreset.fontFamily,
    fontSize: themePreset.fontSize,
    textPosition: editorLayoutStyle.textPosition,
    textAlign: themePreset.textAlign || 'center',
    paddingTop: 80,
    paddingBottom: 60,
    showMockup: true,
    mockupColor: themePreset.mockupColor,
    mockupStyle: 'flat',
    mockupVisibility: editorLayoutStyle.mockupVisibility,
    mockupAlignment: editorLayoutStyle.mockupAlignment,
    mockupOffset: editorLayoutStyle.mockupOffset,
    textOffset: { x: 0, y: 0 },
    mockupScale: themePreset.mockupScale || 1.15,
    mockupRotation: 0,
    mockupContinuation: editorLayoutStyle.mockupContinuation || 'none',
    highlightColor: themePreset.highlightColor,
    highlightPadding: 12,
    highlightBorderRadius: 8,
    pattern: themePreset.pattern,
    alternatingColors: themePreset.alternatingColors,
  } as StyleConfig;
}

// Helper: build Screenshot[] from wizard project data
export function buildEditorScreenshots(project: WizardProjectData, lang?: string): Screenshot[] {
  const urls = project.uploadedScreenshots || [];

  // Use language-specific headlines and settings if editing a translated language
  const isTranslatedLang = lang && lang !== 'source' && project.translatedHeadlines?.[lang];
  const headlines = isTranslatedLang
    ? (project.translatedHeadlines?.[lang] || [])
    : (project.editedHeadlines || []);

  // Use language-specific editor data if available, otherwise use source data
  type EditorDataEntry = {
    decorations?: unknown;
    styleOverride?: unknown;
    mockupSettings?: unknown;
    linkedMockupIndex?: number;
  };
  const langEditorData: EditorDataEntry[] = isTranslatedLang
    ? (project.translatedEditorData?.[lang]?.screenshotSettings || [])
    : [];
  const sourceEditorData: EditorDataEntry[] = project.screenshotEditorData || [];
  // Merge: prefer language-specific settings, fall back to source settings
  const editorData: EditorDataEntry[] = urls.map((_, i) => langEditorData[i] || sourceEditorData[i] || {});

  // Get theme and layout presets for alternating colors
  const templateId = project.selectedTemplateId;
  const themePreset = templateId ? THEME_PRESETS.find(t => t.id === templateId) : null;
  const layoutPreset = LAYOUT_PRESETS.find(l => l.id === project.layoutPreset) || LAYOUT_PRESETS[0];

  // Only apply alternating styles if no saved styleConfig (user hasn't edited globally)
  const hasSavedStyle = !!project.styleConfig;

  // Device dimensions for converting pixel offsets to percentages
  const deviceWidth = 1290; // 6.9" width
  const deviceHeight = 2796; // 6.9" height

  return urls.map((url, i) => {
    // Start with saved editor data styleOverride if exists
    let styleOverride = editorData[i]?.styleOverride as ScreenshotStyleOverride | undefined;

    // Apply alternating colors and layout preset if not already customized
    const layoutStyle = layoutPreset.getStyle(i);

    if (!styleOverride && !hasSavedStyle && themePreset) {
      // For first screenshot, use base theme colors
      if (i === 0) {
        styleOverride = {
          textPosition: layoutStyle.textPosition,
          mockupAlignment: layoutStyle.mockupAlignment,
        };
      } else if (themePreset.alternatingColors) {
        // For subsequent screenshots, use alternating colors
        const altIdx = (i - 1) % themePreset.alternatingColors.length;
        const alt = themePreset.alternatingColors[altIdx];
        styleOverride = {
          backgroundColor: alt.backgroundColor,
          gradient: alt.gradient,
          textColor: alt.textColor,
          highlightColor: alt.highlightColor,
          textPosition: layoutStyle.textPosition,
          mockupAlignment: layoutStyle.mockupAlignment,
        };
      } else {
        styleOverride = {
          textPosition: layoutStyle.textPosition,
          mockupAlignment: layoutStyle.mockupAlignment,
        };
      }
    }

    // Use saved mockupSettings or initialize from layout preset
    let mockupSettings = editorData[i]?.mockupSettings as ScreenshotMockupSettings | undefined;

    // Check if this is a spanning layout (next screenshot uses this one's image)
    const nextLayoutStyle = layoutPreset.getStyle(i + 1);
    const isSpanningStart = nextLayoutStyle?.mockupScreenshotIndex === i;

    if (!mockupSettings && !hasSavedStyle && layoutStyle.mockupOffset) {
      // Convert pixel-based mockupOffset to percentage-based mockupSettings
      mockupSettings = {
        offsetX: (layoutStyle.mockupOffset.x / deviceWidth) * 100,
        offsetY: (layoutStyle.mockupOffset.y / deviceHeight) * 100,
        rotation: layoutStyle.mockupRotation ?? 0,
        // scale intentionally omitted — falls back to style.mockupScale from global slider
        linkedToNext: isSpanningStart, // Link to next for spanning layout
      } as ScreenshotMockupSettings;
    } else if (mockupSettings && isSpanningStart && !mockupSettings.linkedToNext) {
      // Ensure linkedToNext is set for spanning layout even if settings exist
      mockupSettings = { ...mockupSettings, linkedToNext: true };
    }

    // Use saved linkedMockupIndex or get from layout preset (for spanning layout)
    const linkedMockupIndex = editorData[i]?.linkedMockupIndex ??
      (layoutStyle.mockupScreenshotIndex !== undefined && layoutStyle.mockupScreenshotIndex !== i
        ? layoutStyle.mockupScreenshotIndex
        : undefined);

    return {
      id: `wizard-${i}`,
      file: null,
      preview: url,
      text: headlines[i] || '',
      decorations: editorData[i]?.decorations as Decoration[] | undefined,
      styleOverride,
      mockupSettings,
      mockupContinuation: layoutStyle.mockupContinuation,
      linkedMockupIndex,
    };
  });
}
