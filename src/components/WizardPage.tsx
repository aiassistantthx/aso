import React, { useState, useEffect, useCallback, useRef } from 'react';
import { unified as unifiedApi, UnifiedProjectFull, ApiError } from '../services/api';
import { useAuth } from '../services/authContext';
import { AppHeader } from './AppHeader';
import { TONE_PRESETS, LAYOUT_PRESETS } from '../constants/tonePresets';
import { APP_STORE_LANGUAGES, getLanguageName } from '../constants/languages';
import { THEME_PRESETS, THEME_PRESET_GROUPS } from '../constants/templates';
import { generatePreviewCanvas, generateScreenshotImage } from '../services/canvas';
import { StyleConfig, DeviceSize, Screenshot, Decoration, ScreenshotStyleOverride, ScreenshotMockupSettings } from '../types';
import { ScreensFlowEditor } from './ScreensFlowEditor';
import { StyleEditor } from './StyleEditor';
import JSZip from 'jszip';


// Adapter type to map UnifiedProjectFull to legacy wizard project interface
type WizardProjectData = {
  id: string;
  userId: string;
  appName: string;
  briefDescription: string;
  targetKeywords: string;
  uploadedScreenshots: string[] | null;
  generateScreenshots: boolean;
  generateIcon: boolean;
  generateMetadata: boolean;
  tone: string;
  layoutPreset: string;
  selectedTemplateId: string | null;
  sourceLanguage: string;
  targetLanguages: string[];
  generatedHeadlines: string[] | null;
  editedHeadlines: string[] | null;
  generatedMetadata: Record<string, string> | null;
  editedMetadata: Record<string, string> | null;
  generatedIconUrl: string | null;
  translatedHeadlines: Record<string, string[]> | null;
  translatedMetadata: Record<string, Record<string, string>> | null;
  styleConfig: Record<string, unknown> | null;
  screenshotEditorData: Array<{
    decorations?: unknown;
    styleOverride?: unknown;
    mockupSettings?: unknown;
    linkedMockupIndex?: number;
  }> | null;
  currentStep: number;
  status: string;
  generationErrors?: string[];
  createdAt: string;
  updatedAt: string;
};

// Convert UnifiedProjectFull to WizardProjectData
function toWizardData(p: UnifiedProjectFull): WizardProjectData {
  return {
    id: p.id,
    userId: p.userId,
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
    currentStep: p.wizardCurrentStep,
    status: p.wizardStatus,
    generationErrors: p.generationErrors,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// Convert wizard update data to unified update data
function toUnifiedUpdate(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Direct mappings
  if ('appName' in data) result.appName = data.appName;
  if ('briefDescription' in data) result.briefDescription = data.briefDescription;
  if ('targetKeywords' in data) result.targetKeywords = data.targetKeywords;
  if ('sourceLanguage' in data) result.sourceLanguage = data.sourceLanguage;
  if ('targetLanguages' in data) result.targetLanguages = data.targetLanguages;
  if ('styleConfig' in data) result.styleConfig = data.styleConfig;

  // Wizard-specific field mappings
  if ('tone' in data) result.wizardTone = data.tone;
  if ('layoutPreset' in data) result.wizardLayoutPreset = data.layoutPreset;
  if ('selectedTemplateId' in data) result.wizardSelectedTemplateId = data.selectedTemplateId;
  if ('currentStep' in data) result.wizardCurrentStep = data.currentStep;
  if ('status' in data) result.wizardStatus = data.status;
  if ('editedHeadlines' in data) result.wizardEditedHeadlines = data.editedHeadlines;
  if ('editedMetadata' in data) result.editedMetadata = data.editedMetadata;
  if ('screenshotEditorData' in data) result.wizardScreenshotEditorData = data.screenshotEditorData;
  if ('generateScreenshots' in data) result.wizardGenerateScreenshots = data.generateScreenshots;
  if ('generateIcon' in data) result.wizardGenerateIcon = data.generateIcon;
  if ('generateMetadata' in data) result.wizardGenerateMetadata = data.generateMetadata;

  return result;
}

interface Props {
  projectId?: string;
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}

const STEPS = [
  { num: 1, label: 'App Info' },
  { num: 2, label: 'Screenshots' },
  { num: 3, label: 'Services' },
  { num: 4, label: 'Tone' },
  { num: 5, label: 'Generate' },
  { num: 6, label: 'Review' },
  { num: 7, label: 'Translate' },
  { num: 8, label: 'Export' },
];

const IOS_LIMITS: Record<string, number> = {
  appName: 30,
  subtitle: 30,
  description: 4000,
  whatsNew: 4000,
  keywords: 100,
};

const IOS_FIELD_LABELS: Record<string, string> = {
  appName: 'App Name',
  subtitle: 'Subtitle',
  description: 'Description',
  whatsNew: "What's New",
  keywords: 'Keywords',
};

// Helper: resolve StyleConfig from wizard project data
function resolveStyleConfig(project: WizardProjectData): StyleConfig | null {
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
    mockupScale: themePreset.mockupScale || 1.0,
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
function buildEditorScreenshots(project: WizardProjectData): Screenshot[] {
  const urls = project.uploadedScreenshots || [];
  const headlines = project.editedHeadlines || [];
  const editorData = project.screenshotEditorData || [];

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

    if (!mockupSettings && !hasSavedStyle && layoutStyle.mockupOffset) {
      // Convert pixel-based mockupOffset to percentage-based mockupSettings
      mockupSettings = {
        offsetX: (layoutStyle.mockupOffset.x / deviceWidth) * 100,
        offsetY: (layoutStyle.mockupOffset.y / deviceHeight) * 100,
        rotation: layoutStyle.mockupRotation ?? 0,
        scale: layoutStyle.mockupScale, // Use layout preset scale if provided
      } as ScreenshotMockupSettings;
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

export const WizardPage: React.FC<Props> = ({ projectId, onBack, onNavigate }) => {
  const { user } = useAuth();
  const plan = user?.plan ?? 'FREE';

  // Editor state
  const [project, setProject] = useState<WizardProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Step 7 embedded editor state
  const [step6Tab, setStep6Tab] = useState<'review' | 'editor'>('review');
  const [editorScreenshots, setEditorScreenshots] = useState<Screenshot[]>([]);
  const [editorStyle, setEditorStyle] = useState<StyleConfig | null>(null);
  const [editorSelectedIndex, setEditorSelectedIndex] = useState(0);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const editorSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [genStage, setGenStage] = useState('');

  // Translation state
  const [translating, setTranslating] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Translation tab
  const [activeLang, setActiveLang] = useState<string>('');

  // Editor language selection (for step 6 editor tab)
  const [editorLang, setEditorLang] = useState<string>('source');

  // Translated screenshot previews
  const [translatedPreviews, setTranslatedPreviews] = useState<HTMLCanvasElement[]>([]);
  const [translatedPreviewLoading, setTranslatedPreviewLoading] = useState(false);

  // Load specific project
  const loadProject = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const p = await unifiedApi.get(id);
      setProject(toWizardData(p));
      setStep(p.wizardCurrentStep || 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  // Auto-save helper
  const saveField = useCallback(async (data: Record<string, unknown>) => {
    if (!project) return;
    setSaving(true);
    try {
      const updated = await unifiedApi.update(project.id, toUnifiedUpdate(data));
      setProject(toWizardData(updated));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [project]);

  // Navigate steps
  const goToStep = (s: number) => {
    setStep(s);
    if (project && s > (project.currentStep || 1)) {
      saveField({ currentStep: s });
    }
  };

  const nextStep = () => goToStep(step + 1);
  const prevStep = () => goToStep(step - 1);

  // Step validation
  const canProceed = (s: number): boolean => {
    if (!project) return false;
    switch (s) {
      case 1: return project.appName.trim().length > 0 && project.briefDescription.trim().length > 0;
      case 2: return (project.uploadedScreenshots || []).length >= 3;
      case 3: return project.generateScreenshots || project.generateMetadata;
      case 4: return !!project.tone;
      case 5: return true;
      default: return true;
    }
  };

  // Screenshot upload
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!project || !e.target.files) return;
    const files = Array.from(e.target.files);
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });
      try {
        const result = await unifiedApi.uploadScreenshot(project.id, files[i]);
        if (result.project) {
          setProject(toWizardData(result.project));
        }
      } catch {
        setError('Failed to upload screenshot');
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleRemoveScreenshot = async (index: number) => {
    if (!project) return;
    try {
      const result = await unifiedApi.removeScreenshot(project.id, index);
      // Result could be UnifiedProjectFull or { ok: boolean }
      if ('id' in result) {
        setProject(toWizardData(result as UnifiedProjectFull));
      } else {
        // Reload project to get updated data
        const updated = await unifiedApi.get(project.id);
        setProject(toWizardData(updated));
      }
    } catch {
      setError('Failed to remove screenshot');
    }
  };

  // Generation
  const handleGenerate = async () => {
    if (!project) return;
    setGenerating(true);
    setGenStage('Generating headlines and metadata...');
    setError(null);

    try {
      const updated = await unifiedApi.generateAll(project.id);
      const wizardData = toWizardData(updated);
      // Check for partial generation errors
      if (wizardData.generationErrors && wizardData.generationErrors.length > 0) {
        setError('Some generation steps failed: ' + wizardData.generationErrors.join('; '));
      }
      setProject(wizardData);
      setStep(6);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
      setGenStage('');
    }
  };

  // Initialize embedded editor when switching to Editor tab
  const initializeEditor = useCallback(() => {
    if (!project || editorInitialized) return;
    const screenshots = buildEditorScreenshots(project);
    const style = resolveStyleConfig(project);
    if (!style) return;
    setEditorScreenshots(screenshots);
    setEditorStyle(style);
    setEditorSelectedIndex(0);
    setEditorInitialized(true);
  }, [project, editorInitialized]);

  // Reset editor when project changes significantly (e.g. regeneration)
  const prevProjectRef = useRef<string | null>(null);
  useEffect(() => {
    if (!project) return;
    const key = `${project.selectedTemplateId}-${project.generatedHeadlines?.length}-${project.uploadedScreenshots?.length}`;
    if (prevProjectRef.current !== null && prevProjectRef.current !== key) {
      setEditorInitialized(false);
      setStep6Tab('review');
    }
    prevProjectRef.current = key;
  }, [project?.selectedTemplateId, project?.generatedHeadlines?.length, project?.uploadedScreenshots?.length]);

  // Initialize editor data when reaching step 6 (for both Review and Editor tabs)
  useEffect(() => {
    if (step === 6 && !editorInitialized) {
      initializeEditor();
    }
  }, [step, editorInitialized, initializeEditor]);

  // Debounced autosave from editor changes
  const scheduleEditorSave = useCallback((data: Record<string, unknown>) => {
    if (!project) return;
    if (editorSaveTimerRef.current) clearTimeout(editorSaveTimerRef.current);
    editorSaveTimerRef.current = setTimeout(async () => {
      try {
        const updated = await unifiedApi.update(project.id, toUnifiedUpdate(data));
        setProject(toWizardData(updated));
      } catch {
        // silent fail for autosave
      }
    }, 2000);
  }, [project]);

  // Handle screenshot changes from embedded editor
  const handleEditorScreenshotsChange = useCallback(async (newScreenshots: Screenshot[]) => {
    if (!project) return;
    const currentUrls = project.uploadedScreenshots || [];

    // Detect new screenshots (file !== null)
    const newFiles = newScreenshots.filter(s => s.file !== null);
    if (newFiles.length > 0) {
      // Upload new files
      for (const s of newFiles) {
        if (!s.file) continue;
        try {
          const result = await unifiedApi.uploadScreenshot(project.id, s.file);
          // Replace blob URL with server URL in the screenshots array
          const idx = newScreenshots.indexOf(s);
          if (idx >= 0) {
            newScreenshots[idx] = {
              ...newScreenshots[idx],
              file: null,
              preview: result.screenshotUrl,
            };
          }
          if (result.project) {
            setProject(toWizardData(result.project));
          }
        } catch {
          setError('Failed to upload screenshot');
        }
      }
    }

    // Detect removed screenshots
    if (newScreenshots.length < currentUrls.length) {
      // Find removed indices by comparing preview URLs
      const newUrls = newScreenshots.map(s => s.preview);
      for (let i = currentUrls.length - 1; i >= 0; i--) {
        if (!newUrls.includes(currentUrls[i])) {
          try {
            const result = await unifiedApi.removeScreenshot(project.id, i);
            if ('id' in result) {
              setProject(toWizardData(result as UnifiedProjectFull));
            }
          } catch {
            setError('Failed to remove screenshot');
          }
        }
      }
    }

    setEditorScreenshots(newScreenshots);

    // Extract data to save
    const editedHeadlines = newScreenshots.map(s => s.text);
    const screenshotEditorData = newScreenshots.map(s => ({
      decorations: s.decorations,
      styleOverride: s.styleOverride,
      mockupSettings: s.mockupSettings,
      linkedMockupIndex: s.linkedMockupIndex,
    }));

    // Update local project state immediately
    setProject(prev => prev ? {
      ...prev,
      editedHeadlines,
      screenshotEditorData,
    } : prev);

    scheduleEditorSave({ editedHeadlines, screenshotEditorData });
  }, [project, scheduleEditorSave]);

  // Handle style changes from embedded editor
  const handleEditorStyleChange = useCallback((newStyle: StyleConfig) => {
    setEditorStyle(newStyle);
    setProject(prev => prev ? { ...prev, styleConfig: newStyle as unknown as Record<string, unknown> } : prev);
    scheduleEditorSave({ styleConfig: newStyle });
  }, [scheduleEditorSave]);

  // Translation
  const handleTranslate = async () => {
    if (!project) return;
    setTranslating(true);
    setError(null);

    try {
      const updated = await unifiedApi.translate(project.id);
      const wizardData = toWizardData(updated);
      setProject(wizardData);
      if (wizardData.targetLanguages.length > 0) {
        const firstTarget = wizardData.targetLanguages.find(l => l !== wizardData.sourceLanguage);
        if (firstTarget) setActiveLang(firstTarget);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  // Generate translated screenshot previews
  useEffect(() => {
    if (!project || step !== 7) return;
    if (!activeLang || !project.translatedHeadlines?.[activeLang]) {
      setTranslatedPreviews([]);
      return;
    }
    if (!project.uploadedScreenshots?.length) {
      setTranslatedPreviews([]);
      return;
    }

    const templateId = project.selectedTemplateId;
    const themePreset = templateId ? THEME_PRESETS.find(t => t.id === templateId) : null;
    if (!themePreset) {
      setTranslatedPreviews([]);
      return;
    }

    const screenshots = project.uploadedScreenshots;
    const headlines = project.translatedHeadlines[activeLang];
    const deviceSize: DeviceSize = '6.9';
    const editorData = project.screenshotEditorData || [];

    const style: StyleConfig = {
      backgroundColor: themePreset.backgroundColor,
      gradient: themePreset.gradient,
      textColor: themePreset.textColor,
      fontFamily: themePreset.fontFamily,
      fontSize: themePreset.fontSize,
      textPosition: 'top',
      textAlign: themePreset.textAlign || 'center',
      paddingTop: 80,
      paddingBottom: 60,
      showMockup: true,
      mockupColor: themePreset.mockupColor,
      mockupStyle: 'flat',
      mockupVisibility: 'full',
      mockupAlignment: 'bottom',
      mockupOffset: { x: 0, y: 60 },
      textOffset: { x: 0, y: 0 },
      mockupScale: themePreset.mockupScale || 1.0,
      mockupRotation: 0,
      mockupContinuation: 'none',
      highlightColor: themePreset.highlightColor,
      highlightPadding: 12,
      highlightBorderRadius: 8,
      pattern: themePreset.pattern,
    };

    const generateTranslatedPreviews = async () => {
      setTranslatedPreviewLoading(true);
      const canvases: HTMLCanvasElement[] = [];
      const layoutPreset = LAYOUT_PRESETS.find(l => l.id === project.layoutPreset) || LAYOUT_PRESETS[0];

      for (let i = 0; i < Math.min(screenshots.length, headlines.length); i++) {
        const effectiveStyle = { ...style };

        if (themePreset.alternatingColors && i > 0) {
          const altIdx = (i - 1) % themePreset.alternatingColors.length;
          const alt = themePreset.alternatingColors[altIdx];
          effectiveStyle.backgroundColor = alt.backgroundColor;
          effectiveStyle.gradient = alt.gradient;
          if (alt.textColor) effectiveStyle.textColor = alt.textColor;
          if (alt.highlightColor) effectiveStyle.highlightColor = alt.highlightColor;
        }

        const layoutStyle = layoutPreset.getStyle(i);
        effectiveStyle.textPosition = layoutStyle.textPosition;
        effectiveStyle.mockupAlignment = layoutStyle.mockupAlignment;
        effectiveStyle.mockupVisibility = layoutStyle.mockupVisibility;
        effectiveStyle.mockupOffset = layoutStyle.mockupOffset;
        if (layoutStyle.mockupContinuation) {
          effectiveStyle.mockupContinuation = layoutStyle.mockupContinuation;
        }
        if (layoutStyle.mockupRotation !== undefined) {
          effectiveStyle.mockupRotation = layoutStyle.mockupRotation;
        }
        if (layoutStyle.mockupScale !== undefined) {
          effectiveStyle.mockupScale = layoutStyle.mockupScale;
        }

        // Determine which screenshot to use for mockup (for spanning layout)
        const mockupScreenshotIdx = layoutStyle.mockupScreenshotIndex ?? i;
        const mockupScreenshot = screenshots[mockupScreenshotIdx] ?? screenshots[i];

        // Use layout preset mockupSettings for spanning layout (each screen needs different offset)
        // For non-spanning layouts, use saved mockupSettings or convert from layout preset
        const deviceWidth = 1290;
        const deviceHeight = 2796;
        const isSpanningLayout = layoutStyle.mockupScreenshotIndex !== undefined;

        let mockupSettings: { offsetX: number; offsetY: number; scale: number; rotation: number } | undefined;

        if (isSpanningLayout && layoutStyle.mockupOffset) {
          // For spanning layout, always use layout preset values (each screen has unique offset)
          mockupSettings = {
            offsetX: (layoutStyle.mockupOffset.x / deviceWidth) * 100,
            offsetY: (layoutStyle.mockupOffset.y / deviceHeight) * 100,
            scale: layoutStyle.mockupScale ?? 1,
            rotation: layoutStyle.mockupRotation ?? 0,
          };
        } else {
          // For other layouts, use saved editor settings or fallback to layout preset
          mockupSettings = editorData[i]?.mockupSettings as { offsetX: number; offsetY: number; scale: number; rotation: number } | undefined;

          if (!mockupSettings && layoutStyle.mockupOffset) {
            mockupSettings = {
              offsetX: (layoutStyle.mockupOffset.x / deviceWidth) * 100,
              offsetY: (layoutStyle.mockupOffset.y / deviceHeight) * 100,
              scale: layoutStyle.mockupScale ?? 1,
              rotation: layoutStyle.mockupRotation ?? 0,
            };
          }
        }

        try {
          const canvas = document.createElement('canvas');
          await generatePreviewCanvas(canvas, {
            screenshot: screenshots[i],
            text: headlines[i],
            style: effectiveStyle,
            deviceSize,
            mockupScreenshot: mockupScreenshot !== screenshots[i] ? mockupScreenshot : undefined,
            mockupContinuation: layoutStyle.mockupContinuation,
            mockupSettings,
          });
          canvases.push(canvas);
        } catch (err) {
          console.error(`Translated preview ${i} failed:`, err);
        }
      }
      setTranslatedPreviews(canvases);
      setTranslatedPreviewLoading(false);
    };

    generateTranslatedPreviews();
  }, [project?.translatedHeadlines, activeLang, step, project?.selectedTemplateId, project?.layoutPreset, project?.uploadedScreenshots]);

  // Export ZIP
  const handleExport = async () => {
    if (!project) return;
    setExporting(true);
    setExportProgress(0);

    try {
      const zip = new JSZip();
      const screenshots = project.uploadedScreenshots || [];
      const headlines = project.editedHeadlines || [];
      const templateId = project.selectedTemplateId;
      const themePreset = templateId ? THEME_PRESETS.find(t => t.id === templateId) : null;
      const savedStyle = project.styleConfig ? project.styleConfig as unknown as StyleConfig : null;
      const editorData = project.screenshotEditorData || [];

      // Collect all languages
      const allLangs = [project.sourceLanguage, ...project.targetLanguages.filter(l => l !== project.sourceLanguage)];
      const totalSteps = allLangs.length * screenshots.length;
      let completedSteps = 0;

      const baseStyle: StyleConfig = savedStyle || (themePreset ? {
        backgroundColor: themePreset.backgroundColor,
        gradient: themePreset.gradient,
        textColor: themePreset.textColor,
        fontFamily: themePreset.fontFamily,
        fontSize: themePreset.fontSize,
        textPosition: 'top',
        textAlign: themePreset.textAlign || 'center',
        paddingTop: 80,
        paddingBottom: 60,
        showMockup: true,
        mockupColor: themePreset.mockupColor,
        mockupStyle: 'flat',
        mockupVisibility: 'full',
        mockupAlignment: 'bottom',
        mockupOffset: { x: 0, y: 60 },
        textOffset: { x: 0, y: 0 },
        mockupScale: themePreset.mockupScale || 1.0,
        mockupRotation: 0,
        mockupContinuation: 'none',
        highlightColor: themePreset.highlightColor,
        highlightPadding: 12,
        highlightBorderRadius: 8,
        pattern: themePreset.pattern,
      } : null as unknown as StyleConfig);

      const layoutPreset = LAYOUT_PRESETS.find(l => l.id === project.layoutPreset) || LAYOUT_PRESETS[0];

      for (const lang of allLangs) {
        const isSource = lang === project.sourceLanguage;
        const langHeadlines = isSource
          ? headlines
          : (project.translatedHeadlines?.[lang] || headlines);
        const langMetadata = isSource
          ? (project.editedMetadata || {})
          : (project.translatedMetadata?.[lang] || project.editedMetadata || {});

        // Generate screenshots for each device size
        for (const size of ['6.9', '6.5'] as DeviceSize[]) {
          for (let i = 0; i < Math.min(screenshots.length, langHeadlines.length); i++) {
            if (!baseStyle) continue;

            const effectiveStyle = { ...baseStyle };

            // Apply per-screenshot style overrides from editor data
            if (editorData[i]?.styleOverride) {
              const override = editorData[i].styleOverride as Record<string, unknown>;
              if (override.backgroundColor) effectiveStyle.backgroundColor = override.backgroundColor as string;
              if (override.textColor) effectiveStyle.textColor = override.textColor as string;
              if (override.highlightColor) effectiveStyle.highlightColor = override.highlightColor as string;
              if (override.gradient) effectiveStyle.gradient = override.gradient as StyleConfig['gradient'];
              if (override.textPosition) effectiveStyle.textPosition = override.textPosition as StyleConfig['textPosition'];
            }

            if (!savedStyle && themePreset?.alternatingColors && i > 0 && !editorData[i]?.styleOverride) {
              const altIdx = (i - 1) % themePreset.alternatingColors.length;
              const alt = themePreset.alternatingColors[altIdx];
              effectiveStyle.backgroundColor = alt.backgroundColor;
              effectiveStyle.gradient = alt.gradient;
              if (alt.textColor) effectiveStyle.textColor = alt.textColor;
              if (alt.highlightColor) effectiveStyle.highlightColor = alt.highlightColor;
            }

            // Apply layout preset only when not using saved editor styleConfig
            const layoutStyle = layoutPreset.getStyle(i);
            if (!savedStyle) {
              effectiveStyle.textPosition = layoutStyle.textPosition;
              effectiveStyle.mockupAlignment = layoutStyle.mockupAlignment;
              effectiveStyle.mockupVisibility = layoutStyle.mockupVisibility;
              effectiveStyle.mockupOffset = layoutStyle.mockupOffset;
              if (layoutStyle.mockupContinuation) {
                effectiveStyle.mockupContinuation = layoutStyle.mockupContinuation;
              }
              if (layoutStyle.mockupRotation !== undefined) {
                effectiveStyle.mockupRotation = layoutStyle.mockupRotation;
              }
              if (layoutStyle.mockupScale !== undefined) {
                effectiveStyle.mockupScale = layoutStyle.mockupScale;
              }
            }

            // Determine which screenshot to use for mockup (for spanning layout)
            const mockupScreenshotIdx = layoutStyle.mockupScreenshotIndex ?? i;
            const mockupScreenshot = screenshots[mockupScreenshotIdx] ?? screenshots[i];

            // Get mockup settings from editor data, with fallback to layout preset
            const deviceWidth = size === '6.9' ? 1290 : 1242;
            const deviceHeight = size === '6.9' ? 2796 : 2688;
            const isSpanningLayout = layoutStyle.mockupScreenshotIndex !== undefined;

            let mockupSettings: ScreenshotMockupSettings | undefined;

            if (isSpanningLayout && layoutStyle.mockupOffset) {
              // For spanning layout, always use layout preset values (each screen has unique offset)
              mockupSettings = {
                offsetX: (layoutStyle.mockupOffset.x / deviceWidth) * 100,
                offsetY: (layoutStyle.mockupOffset.y / deviceHeight) * 100,
                scale: layoutStyle.mockupScale ?? 1,
                rotation: layoutStyle.mockupRotation ?? 0,
              };
            } else {
              // For other layouts, use saved editor settings or fallback to layout preset
              mockupSettings = editorData[i]?.mockupSettings as ScreenshotMockupSettings | undefined;

              if (!mockupSettings && layoutStyle.mockupOffset && !savedStyle) {
                mockupSettings = {
                  offsetX: (layoutStyle.mockupOffset.x / deviceWidth) * 100,
                  offsetY: (layoutStyle.mockupOffset.y / deviceHeight) * 100,
                  scale: layoutStyle.mockupScale ?? 1,
                  rotation: layoutStyle.mockupRotation ?? 0,
                };
              }
            }

            try {
              const blob = await generateScreenshotImage({
                screenshot: screenshots[i],
                text: langHeadlines[i],
                style: effectiveStyle,
                deviceSize: size,
                mockupScreenshot: mockupScreenshot !== screenshots[i] ? mockupScreenshot : undefined,
                mockupContinuation: layoutStyle.mockupContinuation,
                mockupSettings,
              });

              const sizeLabel = size === '6.9' ? '6.9-inch' : '6.5-inch';
              const arrayBuffer = await blob.arrayBuffer();
              zip.file(
                `${lang}/${sizeLabel}/screenshot_${String(i + 1).padStart(2, '0')}.png`,
                arrayBuffer
              );
            } catch {
              // skip failed
            }

            completedSteps++;
            setExportProgress(Math.round((completedSteps / totalSteps) * 100));
          }
        }

        // Add metadata JSON
        zip.file(`${lang}/metadata.json`, JSON.stringify(langMetadata, null, 2));
      }

      setExportProgress(100);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wizard-export-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export failed');
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  // Redirect to dashboard if no project ID (list view is now in Dashboard)
  useEffect(() => {
    if (!projectId) {
      onBack();
    }
  }, [projectId, onBack]);

  if (!projectId) {
    return null;
  }

  // --- EDITOR VIEW ---
  if (loading || !project) {
    return (
      <div style={pageStyles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <p style={{ color: '#86868b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      <AppHeader
        currentPage="wizard"
        onNavigate={onNavigate}
        rightContent={
          <>
            <button style={pageStyles.backButton} onClick={onBack}>Back</button>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1d1d1f' }}>
              {project.appName || 'ASO Wizard'}
            </span>
            {saving && <span style={{ fontSize: '12px', color: '#86868b' }}>Saving...</span>}
          </>
        }
      />

      {/* Step indicator */}
      <div style={pageStyles.stepBar} className="wizard-step-bar">
        {STEPS.map(s => (
          <div
            key={s.num}
            style={{
              ...pageStyles.stepItem,
              cursor: s.num <= (project.currentStep || step) ? 'pointer' : 'default',
              opacity: s.num <= (project.currentStep || step) ? 1 : 0.4,
            }}
            className="wizard-step-item"
            onClick={() => s.num <= (project.currentStep || step) && goToStep(s.num)}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 600,
              backgroundColor: step === s.num ? '#FF6B4A' : s.num < step ? '#34c759' : '#e5e5ea',
              color: step === s.num || s.num < step ? '#fff' : '#86868b',
              transition: 'all 0.2s',
            }}>
              {s.num < step ? '\u2713' : s.num}
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 500,
              color: step === s.num ? '#FF6B4A' : '#86868b',
              marginTop: '4px',
            }} className="wizard-step-label">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        ...pageStyles.content,
        ...(step === 6 && { maxWidth: '1100px' }),
      }} className="wizard-content">
        {error && (
          <div style={pageStyles.errorBanner}>
            {error}
            <button
              style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step 1: App Info */}
        {step === 1 && (
          <div style={pageStyles.stepContent} className="wizard-step-content">
            <h2 style={pageStyles.stepTitle} className="wizard-step-title">App Information</h2>
            <p style={pageStyles.stepDesc} className="wizard-step-desc">Tell us about your app</p>

            <label style={pageStyles.label}>App Name *</label>
            <input
              style={pageStyles.input}
              value={project.appName}
              onChange={e => setProject({ ...project, appName: e.target.value })}
              onBlur={() => saveField({ appName: project.appName })}
              placeholder="My Amazing App"
            />

            <label style={pageStyles.label}>Brief Description *</label>
            <textarea
              style={{ ...pageStyles.input, minHeight: '100px', resize: 'vertical' }}
              value={project.briefDescription}
              onChange={e => setProject({ ...project, briefDescription: e.target.value })}
              onBlur={() => saveField({ briefDescription: project.briefDescription })}
              placeholder="A short description of what your app does..."
            />

            <label style={pageStyles.label}>Target Keywords</label>
            <input
              style={pageStyles.input}
              value={project.targetKeywords}
              onChange={e => setProject({ ...project, targetKeywords: e.target.value })}
              onBlur={() => saveField({ targetKeywords: project.targetKeywords })}
              placeholder="fitness, workout, health tracker"
            />

            <div style={pageStyles.stepActions} className="wizard-step-actions">
              <div />
              <button
                style={{ ...pageStyles.primaryButton, opacity: canProceed(1) ? 1 : 0.5 }}
                disabled={!canProceed(1)}
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Screenshots */}
        {step === 2 && (
          <div style={pageStyles.stepContent} className="wizard-step-content">
            <h2 style={pageStyles.stepTitle} className="wizard-step-title">Upload Screenshots</h2>
            <p style={pageStyles.stepDesc} className="wizard-step-desc">Upload 3-8 app UI screenshots</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }} className="wizard-screenshots-grid">
              {(project.uploadedScreenshots || []).map((url, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5ea', aspectRatio: '9/19.5' }}>
                  <img src={url} alt={`Screenshot ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      backgroundColor: 'rgba(255,59,48,0.9)', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => handleRemoveScreenshot(i)}
                  >
                    x
                  </button>
                </div>
              ))}

              {(project.uploadedScreenshots || []).length < 8 && !uploading && (
                <label style={{
                  borderRadius: '12px', border: '2px dashed #d1d1d6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', aspectRatio: '9/19.5', flexDirection: 'column',
                  color: '#86868b', fontSize: '13px', gap: '4px',
                }}>
                  <span style={{ fontSize: '24px' }}>+</span>
                  <span>Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleScreenshotUpload}
                  />
                </label>
              )}
            </div>

            {uploading ? (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <div style={{ flex: 1, height: '6px', backgroundColor: '#e5e5ea', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`,
                      height: '100%',
                      backgroundColor: '#FF6B4A',
                      borderRadius: '3px',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#86868b', minWidth: '40px' }}>
                    {uploadProgress.current}/{uploadProgress.total}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#FF6B4A', fontWeight: 500 }}>
                  Uploading screenshot {uploadProgress.current} of {uploadProgress.total}...
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#86868b' }}>
                {(project.uploadedScreenshots || []).length}/8 screenshots uploaded
                {(project.uploadedScreenshots || []).length < 3 && ' (minimum 3)'}
              </p>
            )}

            <div style={pageStyles.stepActions} className="wizard-step-actions">
              <button style={pageStyles.secondaryButton} onClick={prevStep} disabled={uploading}>Back</button>
              <button
                style={{ ...pageStyles.primaryButton, opacity: canProceed(2) && !uploading ? 1 : 0.5 }}
                disabled={!canProceed(2) || uploading}
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div style={pageStyles.stepContent} className="wizard-step-content">
            <h2 style={pageStyles.stepTitle} className="wizard-step-title">What to Generate</h2>
            <p style={pageStyles.stepDesc} className="wizard-step-desc">Choose which assets to create</p>

            {([
              { key: 'generateScreenshots' as const, label: 'Screenshots with Headlines', desc: 'AI-generated headlines on your screenshots with professional templates' },
              { key: 'generateMetadata' as const, label: 'ASO Metadata', desc: 'Title, subtitle, description, keywords optimized for App Store' },
            ] as const).map(svc => {
              const isActive = project[svc.key];
              return (
                <div
                  key={svc.key}
                  style={{
                    ...pageStyles.toggleCard,
                    borderColor: isActive ? '#FF6B4A' : '#e5e5ea',
                    backgroundColor: isActive ? '#f0f7ff' : '#fff',
                  }}
                  onClick={() => {
                    const val = !isActive;
                    setProject({ ...project, [svc.key]: val });
                    saveField({ [svc.key]: val });
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      border: `2px solid ${isActive ? '#FF6B4A' : '#d1d1d6'}`,
                      backgroundColor: isActive ? '#FF6B4A' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '14px', fontWeight: 700,
                    }}>
                      {isActive ? '\u2713' : ''}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1d1d1f', marginBottom: '2px' }}>{svc.label}</div>
                      <div style={{ fontSize: '13px', color: '#86868b' }}>{svc.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={pageStyles.stepActions} className="wizard-step-actions">
              <button style={pageStyles.secondaryButton} onClick={prevStep}>Back</button>
              <button
                style={{ ...pageStyles.primaryButton, opacity: canProceed(3) ? 1 : 0.5 }}
                disabled={!canProceed(3)}
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Tone */}
        {step === 4 && (
          <div style={pageStyles.stepContent} className="wizard-step-content">
            <h2 style={pageStyles.stepTitle} className="wizard-step-title">Visual Style</h2>
            <p style={pageStyles.stepDesc} className="wizard-step-desc">Choose a color tone for your screenshots</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }} className="wizard-template-grid">
              {TONE_PRESETS.map(tone => (
                <div
                  key={tone.id}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: `2px solid ${project.tone === tone.id ? '#FF6B4A' : '#e5e5ea'}`,
                    backgroundColor: project.tone === tone.id ? '#f0f7ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    setProject({ ...project, tone: tone.id });
                    saveField({ tone: tone.id });
                  }}
                >
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                    {tone.previewColors.map((color, i) => (
                      <div
                        key={i}
                        style={{
                          width: '28px', height: '28px', borderRadius: '8px',
                          backgroundColor: color,
                          border: '1px solid rgba(0,0,0,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontWeight: 600, color: '#1d1d1f', marginBottom: '4px' }}>{tone.name}</div>
                  <div style={{ fontSize: '13px', color: '#86868b' }}>{tone.description}</div>
                </div>
              ))}
            </div>

            {/* Layout Presets */}
            <h3 style={{ ...pageStyles.sectionTitle, marginTop: '32px' }}>Layout</h3>
            <p style={{ fontSize: '13px', color: '#86868b', marginBottom: '16px' }}>Choose how mockups are positioned on screenshots</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }} className="wizard-layout-grid">
              {LAYOUT_PRESETS.map(layout => (
                <div
                  key={layout.id}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: `2px solid ${project.layoutPreset === layout.id ? '#FF6B4A' : '#e5e5ea'}`,
                    backgroundColor: project.layoutPreset === layout.id ? '#f0f7ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    setProject({ ...project, layoutPreset: layout.id });
                    saveField({ layoutPreset: layout.id });
                  }}
                >
                  <div style={{ marginBottom: '12px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {layout.id === 'bottom' && (
                      <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
                        <rect x="4" y="2" width="40" height="52" rx="4" stroke="#d1d1d6" strokeWidth="1.5" fill="none"/>
                        <rect x="10" y="8" width="28" height="4" rx="2" fill="#FF6B4A" opacity="0.6"/>
                        <rect x="14" y="24" width="20" height="28" rx="3" stroke="#FF6B4A" strokeWidth="1.5" fill="#e0f0ff"/>
                      </svg>
                    )}
                    {layout.id === 'center' && (
                      <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
                        <rect x="4" y="2" width="40" height="52" rx="4" stroke="#d1d1d6" strokeWidth="1.5" fill="none"/>
                        <rect x="10" y="6" width="28" height="4" rx="2" fill="#FF6B4A" opacity="0.6"/>
                        <rect x="14" y="16" width="20" height="30" rx="3" stroke="#FF6B4A" strokeWidth="1.5" fill="#e0f0ff"/>
                      </svg>
                    )}
                    {layout.id === 'alternating' && (
                      <svg width="80" height="56" viewBox="0 0 80 56" fill="none">
                        <rect x="2" y="2" width="34" height="52" rx="4" stroke="#d1d1d6" strokeWidth="1.5" fill="none"/>
                        <rect x="8" y="6" width="22" height="4" rx="2" fill="#FF6B4A" opacity="0.6"/>
                        <rect x="10" y="24" width="18" height="26" rx="3" stroke="#FF6B4A" strokeWidth="1.5" fill="#e0f0ff"/>
                        <rect x="44" y="2" width="34" height="52" rx="4" stroke="#d1d1d6" strokeWidth="1.5" fill="none"/>
                        <rect x="50" y="46" width="22" height="4" rx="2" fill="#FF6B4A" opacity="0.6"/>
                        <rect x="52" y="4" width="18" height="26" rx="3" stroke="#FF6B4A" strokeWidth="1.5" fill="#e0f0ff"/>
                      </svg>
                    )}
                    {layout.id === 'outofbox' && (
                      <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
                        <rect x="4" y="2" width="40" height="52" rx="4" stroke="#d1d1d6" strokeWidth="1.5" fill="none"/>
                        <rect x="10" y="8" width="28" height="4" rx="2" fill="#FF6B4A" opacity="0.6"/>
                        <rect x="12" y="22" width="24" height="40" rx="3" stroke="#FF6B4A" strokeWidth="1.5" fill="#e0f0ff"/>
                      </svg>
                    )}
                    {layout.id === 'spanning' && (
                      <svg width="80" height="56" viewBox="0 0 80 56" fill="none">
                        <rect x="2" y="2" width="34" height="52" rx="4" stroke="#d1d1d6" strokeWidth="1.5" fill="none"/>
                        <rect x="8" y="6" width="22" height="4" rx="2" fill="#FF6B4A" opacity="0.6"/>
                        <rect x="20" y="20" width="20" height="32" rx="3" stroke="#FF6B4A" strokeWidth="1.5" fill="#e0f0ff" strokeDasharray="3 2"/>
                        <rect x="44" y="2" width="34" height="52" rx="4" stroke="#d1d1d6" strokeWidth="1.5" fill="none"/>
                        <rect x="50" y="6" width="22" height="4" rx="2" fill="#FF6B4A" opacity="0.6"/>
                        <rect x="40" y="20" width="20" height="32" rx="3" stroke="#FF6B4A" strokeWidth="1.5" fill="#e0f0ff" strokeDasharray="3 2"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, color: '#1d1d1f', marginBottom: '4px' }}>{layout.name}</div>
                  <div style={{ fontSize: '13px', color: '#86868b' }}>{layout.description}</div>
                </div>
              ))}
            </div>

            <div style={pageStyles.stepActions} className="wizard-step-actions">
              <button style={pageStyles.secondaryButton} onClick={prevStep}>Back</button>
              <button
                style={{ ...pageStyles.primaryButton, opacity: canProceed(4) ? 1 : 0.5 }}
                disabled={!canProceed(4)}
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Generate */}
        {step === 5 && (
          <div style={pageStyles.stepContent} className="wizard-step-content">
            <h2 style={pageStyles.stepTitle} className="wizard-step-title">Generate</h2>
            <p style={pageStyles.stepDesc} className="wizard-step-desc">
              AI will generate {[
                project.generateScreenshots && 'headlines',
                project.generateMetadata && 'metadata',
              ].filter(Boolean).join(', ')} in English
            </p>

            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              {generating ? (
                <div>
                  <div style={pageStyles.spinner} />
                  <p style={{ marginTop: '16px', fontSize: '15px', color: '#1d1d1f', fontWeight: 500 }}>
                    {genStage}
                  </p>
                  <p style={{ fontSize: '13px', color: '#86868b', marginTop: '4px' }}>
                    This may take a moment...
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#FF6B4A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: '15px', color: '#86868b' }}>
                      Ready to generate. This will use AI to create your assets.
                    </p>
                  </div>
                  <button style={pageStyles.primaryButton} onClick={handleGenerate}>
                    Generate All
                  </button>
                </div>
              )}
            </div>

            <div style={pageStyles.stepActions} className="wizard-step-actions">
              <button style={pageStyles.secondaryButton} onClick={prevStep} disabled={generating}>Back</button>
              <div />
            </div>
          </div>
        )}

        {/* Step 6: Review & Editor */}
        {step === 6 && (
          <div style={pageStyles.stepContent} className="wizard-step-content">
            <h2 style={pageStyles.stepTitle} className="wizard-step-title">Review & Edit</h2>
            <p style={pageStyles.stepDesc} className="wizard-step-desc">Review generated content or fine-tune in the editor</p>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid #e5e5ea' }}>
              {(['review', 'editor'] as const).map(tab => (
                <button
                  key={tab}
                  style={{
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: 'none',
                    borderBottom: step6Tab === tab ? '2px solid #FF6B4A' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: step6Tab === tab ? '#FF6B4A' : '#86868b',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}
                  onClick={() => {
                    setStep6Tab(tab);
                    if (tab === 'editor') initializeEditor();
                  }}
                >
                  {tab === 'review' ? 'Review' : 'Editor'}
                </button>
              ))}
            </div>

            {/* Review tab */}
            {step6Tab === 'review' && (
              <>
                {/* Color Theme Picker */}
                {project.generateScreenshots && (
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={pageStyles.sectionTitle}>Color Theme</h3>
                    {THEME_PRESET_GROUPS.map(group => (
                      <div key={group.id} style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#86868b', textTransform: 'uppercase', marginBottom: '8px' }}>
                          {group.label}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {group.presets.map(presetId => {
                            const preset = THEME_PRESETS.find(t => t.id === presetId);
                            if (!preset) return null;
                            const isSelected = project.selectedTemplateId === presetId;
                            const bg = preset.gradient?.enabled
                              ? `linear-gradient(${preset.gradient.angle || 135}deg, ${preset.gradient.color1}, ${preset.gradient.color2})`
                              : preset.backgroundColor;
                            return (
                              <div
                                key={presetId}
                                title={preset.name}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: bg,
                                  border: isSelected ? '3px solid #FF6B4A' : '2px solid rgba(0,0,0,0.1)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  boxShadow: isSelected ? '0 0 0 2px #fff, 0 0 0 4px #FF6B4A' : 'none',
                                }}
                                onClick={() => {
                                  setProject({ ...project, selectedTemplateId: presetId, styleConfig: null });
                                  saveField({ selectedTemplateId: presetId, styleConfig: null as unknown as undefined });
                                  setEditorInitialized(false);
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Screenshot previews using ScreensFlowEditor in readOnly mode */}
                {project.generateScreenshots && (
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={pageStyles.sectionTitle}>Screenshots</h3>

                    {!editorInitialized || !editorStyle ? (
                      <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <div style={pageStyles.spinner} />
                        <p style={{ marginTop: '12px', fontSize: '14px', color: '#86868b' }}>Loading previews...</p>
                      </div>
                    ) : editorScreenshots.length > 0 ? (
                      <ScreensFlowEditor
                        screenshots={editorScreenshots}
                        selectedIndex={editorSelectedIndex}
                        onSelectIndex={setEditorSelectedIndex}
                        onScreenshotsChange={handleEditorScreenshotsChange}
                        style={editorStyle}
                        deviceSize="6.9"
                        readOnly={true}
                      />
                    ) : (
                      <p style={{ fontSize: '14px', color: '#86868b' }}>No screenshots uploaded.</p>
                    )}

                    {(project.editedHeadlines?.length ?? 0) > 0 ? (
                      <div style={{ marginTop: '16px' }}>
                        <label style={pageStyles.label}>Headlines (edit below)</label>
                        {(project.editedHeadlines || []).map((headline, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#86868b', minWidth: '24px' }}>{i + 1}.</span>
                            <input
                              style={{ ...pageStyles.input, marginBottom: 0 }}
                              value={headline}
                              onChange={e => {
                                const newHeadlines = [...(project.editedHeadlines || [])];
                                newHeadlines[i] = e.target.value;
                                setProject({ ...project, editedHeadlines: newHeadlines });
                              }}
                              onBlur={() => saveField({ editedHeadlines: project.editedHeadlines })}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fef3cd', borderRadius: '12px', fontSize: '14px', color: '#856404' }}>
                        No headlines were generated. Go back to Step 6 and try generating again.
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata */}
                {project.generateMetadata && project.editedMetadata && (
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={pageStyles.sectionTitle}>App Store Metadata</h3>
                    {Object.entries(IOS_LIMITS).map(([field, limit]) => {
                      const value = (project.editedMetadata as Record<string, string>)?.[field] || '';
                      const pct = value.length / limit;
                      return (
                        <div key={field} style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={pageStyles.label}>{IOS_FIELD_LABELS[field] || field}</label>
                            <span style={{
                              fontSize: '12px', fontWeight: 500,
                              color: pct > 0.95 ? '#dc2626' : pct > 0.8 ? '#f59e0b' : '#34c759',
                            }}>
                              {value.length}/{limit}
                            </span>
                          </div>
                          {limit > 100 ? (
                            <textarea
                              style={{ ...pageStyles.input, minHeight: field === 'keywords' ? '60px' : '120px', resize: 'vertical' }}
                              value={value}
                              onChange={e => {
                                const newMeta = { ...(project.editedMetadata || {}), [field]: e.target.value };
                                setProject({ ...project, editedMetadata: newMeta });
                              }}
                              onBlur={() => saveField({ editedMetadata: project.editedMetadata })}
                            />
                          ) : (
                            <input
                              style={pageStyles.input}
                              value={value}
                              maxLength={limit}
                              onChange={e => {
                                const newMeta = { ...(project.editedMetadata || {}), [field]: e.target.value };
                                setProject({ ...project, editedMetadata: newMeta });
                              }}
                              onBlur={() => saveField({ editedMetadata: project.editedMetadata })}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </>
            )}

            {/* Editor tab */}
            {step6Tab === 'editor' && editorStyle && editorInitialized && (() => {
              // Build available languages for editor
              const translatedLangs = project.translatedHeadlines ? Object.keys(project.translatedHeadlines) : [];
              const hasTranslations = translatedLangs.length > 0;

              // Build translation data for ScreensFlowEditor
              const editorTranslationData = hasTranslations ? {
                headlines: project.translatedHeadlines || {},
                laurelTexts: {},
              } : null;

              // Get the selected language for ScreensFlowEditor ('all' means source language)
              const selectedLangForEditor = editorLang === 'source' ? 'all' : editorLang;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Language selector when translations exist */}
                  {hasTranslations && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e5e5ea',
                    }}>
                      <span style={{ fontSize: '13px', color: '#86868b', marginRight: '8px' }}>Language:</span>
                      <button
                        onClick={() => setEditorLang('source')}
                        style={{
                          padding: '6px 12px',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: `1px solid ${editorLang === 'source' ? '#FF6B4A' : '#e5e5ea'}`,
                          borderRadius: '8px',
                          backgroundColor: editorLang === 'source' ? '#FF6B4A' : '#fff',
                          color: editorLang === 'source' ? '#fff' : '#1d1d1f',
                          cursor: 'pointer',
                        }}
                      >
                        {project.sourceLanguage ? APP_STORE_LANGUAGES.find(l => l.code === project.sourceLanguage)?.name || project.sourceLanguage : 'Source'}
                      </button>
                      {translatedLangs.map(lang => (
                        <button
                          key={lang}
                          onClick={() => setEditorLang(lang)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: `1px solid ${editorLang === lang ? '#FF6B4A' : '#e5e5ea'}`,
                            borderRadius: '8px',
                            backgroundColor: editorLang === lang ? '#FF6B4A' : '#fff',
                            color: editorLang === lang ? '#fff' : '#1d1d1f',
                            cursor: 'pointer',
                          }}
                        >
                          {APP_STORE_LANGUAGES.find(l => l.code === lang)?.name || lang}
                        </button>
                      ))}
                    </div>
                  )}

                  <ScreensFlowEditor
                    screenshots={editorScreenshots}
                    selectedIndex={editorSelectedIndex}
                    onSelectIndex={setEditorSelectedIndex}
                    onScreenshotsChange={handleEditorScreenshotsChange}
                    style={editorStyle}
                    deviceSize="6.9"
                    translationData={editorTranslationData}
                    selectedLanguage={selectedLangForEditor}
                  />
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #e5e5ea'
                  }}>
                    <StyleEditor
                      style={editorStyle}
                      onStyleChange={handleEditorStyleChange}
                      deviceSize="6.9"
                      screenshots={editorScreenshots}
                      selectedIndex={editorSelectedIndex}
                      onScreenshotsChange={handleEditorScreenshotsChange}
                      translationData={editorTranslationData}
                      selectedLanguage={selectedLangForEditor}
                    />
                  </div>
                </div>
              );
            })()}

            {step6Tab === 'editor' && !editorInitialized && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#86868b' }}>
                <p>Could not initialize editor. Make sure you have a color theme selected and screenshots uploaded.</p>
              </div>
            )}

            <div style={pageStyles.stepActions} className="wizard-step-actions">
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={pageStyles.secondaryButton} onClick={() => goToStep(5)}>Regenerate</button>
              </div>
              <button style={pageStyles.primaryButton} onClick={nextStep}>
                Continue to Translation
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Translate */}
        {step === 7 && (() => {
          const targetLangs = project.targetLanguages.filter(l => l !== project.sourceLanguage);
          const hasTranslations = !!(project.translatedHeadlines || project.translatedMetadata);
          const untranslatedLangs = targetLangs.filter(l => !project.translatedHeadlines?.[l]);
          const needsRetranslation = hasTranslations && untranslatedLangs.length > 0;
          const availableLangs = APP_STORE_LANGUAGES.filter(l => l.code !== project.sourceLanguage);
          const allSelected = availableLangs.every(l => project.targetLanguages.includes(l.code));

          return (
          <div style={pageStyles.stepContent} className="wizard-step-content">
            <h2 style={pageStyles.stepTitle} className="wizard-step-title">Translate</h2>
            <p style={pageStyles.stepDesc} className="wizard-step-desc">
              Select target languages and translate all content
            </p>

            {/* Language selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ ...pageStyles.label, marginBottom: 0 }}>
                Target Languages
                {plan === 'FREE' && <span style={{ fontSize: '12px', color: '#86868b', marginLeft: '8px' }}>(max 2 on Free plan)</span>}
              </label>
              {plan === 'PRO' && (
                <button
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e5ea',
                    backgroundColor: '#fff',
                    color: '#FF6B4A',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: translating ? 'not-allowed' : 'pointer',
                    opacity: translating ? 0.5 : 1,
                  }}
                  disabled={translating}
                  onClick={() => {
                    const newTargets = allSelected ? [] : availableLangs.map(l => l.code);
                    setProject({ ...project, targetLanguages: newTargets });
                    saveField({ targetLanguages: newTargets });
                  }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {APP_STORE_LANGUAGES
                .filter(l => l.code !== project.sourceLanguage)
                .map(l => {
                  const selected = project.targetLanguages.includes(l.code);
                  const disabled = !selected && plan === 'FREE' && project.targetLanguages.length >= 2;
                  return (
                    <button
                      key={l.code}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: `1px solid ${selected ? '#FF6B4A' : '#e5e5ea'}`,
                        backgroundColor: selected ? '#e0f0ff' : disabled ? '#f5f5f7' : '#fff',
                        color: selected ? '#FF6B4A' : disabled ? '#c7c7cc' : '#1d1d1f',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                      disabled={disabled || translating}
                      onClick={() => {
                        const newTargets = selected
                          ? project.targetLanguages.filter(c => c !== l.code)
                          : [...project.targetLanguages, l.code];
                        setProject({ ...project, targetLanguages: newTargets });
                        saveField({ targetLanguages: newTargets });
                      }}
                    >
                      {l.name}
                    </button>
                  );
                })}
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {translating ? (
                <div>
                  <div style={pageStyles.spinner} />
                  <p style={{ marginTop: '16px', fontSize: '15px', color: '#1d1d1f', fontWeight: 500 }}>
                    Translating to all target languages...
                  </p>
                </div>
              ) : hasTranslations && !needsRetranslation ? (
                <div>
                  <p style={{ fontSize: '15px', color: '#34c759', fontWeight: 600, marginBottom: '16px' }}>
                    Translation complete!
                  </p>

                  {/* Language tabs */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {targetLangs
                      .filter(l => project.translatedHeadlines?.[l] || project.translatedMetadata?.[l])
                      .map(l => (
                        <button
                          key={l}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: `1px solid ${activeLang === l ? '#FF6B4A' : '#e5e5ea'}`,
                            backgroundColor: activeLang === l ? '#FF6B4A' : '#fff',
                            color: activeLang === l ? '#fff' : '#1d1d1f',
                            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                          }}
                          onClick={() => setActiveLang(l)}
                        >
                          {getLanguageName(l)}
                        </button>
                      ))}
                  </div>

                  {activeLang && (
                    <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                      {project.translatedHeadlines?.[activeLang] && (
                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Headlines</h4>
                          {project.translatedHeadlines[activeLang].map((h, i) => (
                            <p key={i} style={{ fontSize: '14px', color: '#1d1d1f', padding: '4px 0' }}>
                              {i + 1}. {h}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Translated screenshot previews */}
                      {project.translatedHeadlines?.[activeLang] && project.uploadedScreenshots?.length && (
                        <div style={{ marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Screenshot Previews</h4>
                          {translatedPreviewLoading ? (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                              <div style={pageStyles.spinner} />
                              <p style={{ marginTop: '12px', fontSize: '14px', color: '#86868b' }}>Generating previews...</p>
                            </div>
                          ) : translatedPreviews.length > 0 ? (
                            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
                              {translatedPreviews.map((canvas, i) => (
                                <div key={`${activeLang}-${i}`} style={{ flexShrink: 0, width: '180px' }}>
                                  <img
                                    src={canvas.toDataURL()}
                                    alt={`Preview ${i + 1}`}
                                    style={{ width: '100%', borderRadius: '12px', border: '1px solid #e5e5ea' }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}

                      {project.translatedMetadata?.[activeLang] && (
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Metadata</h4>
                          {Object.entries(project.translatedMetadata[activeLang]).map(([field, value]) => (
                            <div key={field} style={{ marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#86868b', textTransform: 'uppercase' }}>{field}</span>
                              <p style={{ fontSize: '14px', color: '#1d1d1f', whiteSpace: 'pre-wrap' }}>{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <button style={pageStyles.primaryButton} onClick={nextStep}>
                      Continue to Export
                    </button>
                    <button
                      style={{
                        ...pageStyles.secondaryButton,
                        fontSize: '13px',
                        padding: '8px 16px',
                      }}
                      onClick={() => {
                        // Go back to step 6 Editor tab with first translated language selected
                        const firstTranslatedLang = Object.keys(project.translatedHeadlines || {})[0];
                        if (firstTranslatedLang) {
                          setEditorLang(firstTranslatedLang);
                        }
                        setStep6Tab('editor');
                        goToStep(6);
                      }}
                    >
                      Edit Translations
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {needsRetranslation && (
                    <p style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '12px' }}>
                      New languages added — translate again to include them.
                    </p>
                  )}
                  {targetLangs.length === 0 ? (
                    <p style={{ fontSize: '14px', color: '#86868b' }}>
                      Select at least one target language above to translate.
                    </p>
                  ) : (
                    <button style={pageStyles.primaryButton} onClick={handleTranslate}>
                      Translate All
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={pageStyles.stepActions} className="wizard-step-actions">
              <button style={pageStyles.secondaryButton} onClick={prevStep} disabled={translating}>Back</button>
              <div />
            </div>
          </div>
          );
        })()}

        {/* Step 8: Export */}
        {step === 8 && (
          <div style={pageStyles.stepContent} className="wizard-step-content">
            <h2 style={pageStyles.stepTitle} className="wizard-step-title">Export</h2>
            <p style={pageStyles.stepDesc} className="wizard-step-desc">Download your complete ASO package as a ZIP file</p>

            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '15px', color: '#1d1d1f', marginBottom: '8px' }}>
                  ZIP will contain:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, color: '#86868b', fontSize: '14px' }}>
                  {project.generateScreenshots && <li>Screenshots for {1 + project.targetLanguages.filter(l => l !== project.sourceLanguage).length} language(s) in 2 device sizes</li>}
                  {project.generateMetadata && <li>Metadata JSON per language</li>}
                </ul>
              </div>

              {exporting ? (
                <div>
                  <div style={{ width: '300px', height: '8px', backgroundColor: '#e5e5ea', borderRadius: '4px', margin: '0 auto 12px' }}>
                    <div style={{
                      width: `${exportProgress}%`,
                      height: '100%',
                      backgroundColor: '#FF6B4A',
                      borderRadius: '4px',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <p style={{ fontSize: '13px', color: '#86868b' }}>Generating and packaging... {exportProgress}%</p>
                </div>
              ) : (
                <button style={pageStyles.primaryButton} onClick={handleExport}>
                  Download ZIP
                </button>
              )}
            </div>

            <div style={pageStyles.stepActions} className="wizard-step-actions">
              <button style={pageStyles.secondaryButton} onClick={prevStep} disabled={exporting}>Back</button>
              <div />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const pageStyles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
  },
  header: {
    background: 'rgba(255, 255, 255, 0.72)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
  },
  headerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 24px',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1d1d1f',
    flex: 1,
  },
  backButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #e0e0e5',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
  },
  createButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
  },
  stepBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    overflowX: 'auto',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    minWidth: '60px',
  },
  stepContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  stepTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1d1d1f',
    marginBottom: '4px',
  },
  stepDesc: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '24px',
  },
  stepActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #f0f0f5',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '6px',
    marginTop: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1px solid #e5e5ea',
    borderRadius: '12px',
    backgroundColor: '#fafafa',
    color: '#1d1d1f',
    outline: 'none',
    marginBottom: '8px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  },
  primaryButton: {
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A65 100%)',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255, 107, 74, 0.35)',
    transition: 'all 0.2s',
  },
  secondaryButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 500,
    border: '1px solid #e0e0e5',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
  },
  smallButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #e0e0e5',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#1d1d1f',
    cursor: 'pointer',
  },
  toggleCard: {
    padding: '16px 20px',
    borderRadius: '14px',
    border: '2px solid #e5e5ea',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'all 0.2s',
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 20px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1d1d1f',
    marginBottom: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e5ea',
    borderTopColor: '#FF6B4A',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },
};

// Inject spinner animation and responsive styles
if (typeof document !== 'undefined') {
  const styleEl = document.getElementById('wizard-spinner-style') || document.createElement('style');
  styleEl.id = 'wizard-spinner-style';
  styleEl.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Wizard responsive styles */
    @media (max-width: 768px) {
      .wizard-content {
        padding: 12px !important;
      }
      .wizard-step-content {
        padding: 16px !important;
        border-radius: 14px !important;
      }
      .wizard-step-title {
        font-size: 18px !important;
      }
      .wizard-step-desc {
        font-size: 13px !important;
        margin-bottom: 16px !important;
      }
      .wizard-step-bar {
        gap: 4px !important;
        padding: 12px 16px !important;
        overflow-x: auto !important;
        justify-content: space-between !important;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .wizard-step-bar::-webkit-scrollbar {
        display: none;
      }
      .wizard-step-item {
        min-width: 55px !important;
        flex-shrink: 0 !important;
      }
      .wizard-step-label {
        display: block !important;
        font-size: 9px !important;
        white-space: nowrap !important;
      }
      .wizard-step-actions {
        flex-direction: column-reverse !important;
        gap: 10px !important;
        margin-top: 20px !important;
        padding-top: 16px !important;
      }
      .wizard-step-actions > button {
        width: 100% !important;
      }
      .wizard-screenshots-grid {
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 6px !important;
      }
      .wizard-headline-item {
        padding: 10px !important;
      }
      .wizard-headline-text {
        font-size: 13px !important;
      }
      .wizard-tabs {
        flex-wrap: wrap !important;
      }
      .wizard-language-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .wizard-preview-grid {
        flex-direction: column !important;
      }
      .wizard-editor-container {
        flex-direction: column !important;
      }
      .wizard-editor-sidebar {
        width: 100% !important;
        max-height: 300px !important;
        overflow-y: auto !important;
      }
      .wizard-template-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }
      .wizard-layout-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }
      .wizard-metadata-panel {
        max-width: 100% !important;
      }
    }
    @media (max-width: 480px) {
      .wizard-step-title {
        font-size: 16px !important;
      }
      .wizard-screenshots-grid {
        grid-template-columns: repeat(3, 1fr) !important;
      }
      .wizard-language-grid {
        grid-template-columns: 1fr !important;
      }
      .wizard-template-grid {
        grid-template-columns: 1fr !important;
      }
      .wizard-layout-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  if (!styleEl.parentNode) document.head.appendChild(styleEl);
}
