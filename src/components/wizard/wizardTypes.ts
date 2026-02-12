import { Platform } from '../../types';

// Adapter type to map UnifiedProjectFull to legacy wizard project interface
export type WizardProjectData = {
  id: string;
  userId: string;
  platform: Platform;
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
  // Per-language editor settings (mockupScale, positions, etc.)
  translatedEditorData: Record<string, {
    mockupScale?: number;
    screenshotSettings?: Array<{
      decorations?: unknown;
      styleOverride?: unknown;
      mockupSettings?: unknown;
      linkedMockupIndex?: number;
    }>;
  }> | null;
  currentStep: number;
  status: string;
  generationErrors?: string[];
  createdAt: string;
  updatedAt: string;
};

export interface Props {
  projectId?: string;
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}

export const STEPS = [
  { num: 1, label: 'App Info' },
  { num: 2, label: 'Screenshots' },
  { num: 3, label: 'Services' },
  { num: 4, label: 'Tone' },
  { num: 5, label: 'Generate' },
  { num: 6, label: 'Review' },
  { num: 7, label: 'Translate' },
  { num: 8, label: 'Export' },
];

// Platform-specific metadata field order
export const METADATA_FIELDS: Record<Platform, string[]> = {
  ios: ['appName', 'subtitle', 'keywords', 'description', 'whatsNew'],
  android: ['appName', 'shortDescription', 'fullDescription', 'whatsNew'],
};
