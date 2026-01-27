import { Screenshot, StyleConfig, DeviceSize, ScreenshotStyleOverride } from '../types';

const STORAGE_KEY = 'aso_project';
const PROJECTS_LIST_KEY = 'aso_projects_list';

export interface ProjectData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  screenshots: SerializedScreenshot[];
  styleConfig: StyleConfig;
  deviceSize: DeviceSize;
  sourceLanguage: string;
  targetLanguages: string[];
}

interface SerializedScreenshot {
  id: string;
  preview: string;  // base64 data URL
  text: string;
  decorations?: Screenshot['decorations'];
  styleOverride?: ScreenshotStyleOverride;
}

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Serialize screenshots (remove File objects, keep base64 preview)
const serializeScreenshots = (screenshots: Screenshot[]): SerializedScreenshot[] => {
  return screenshots.map(s => ({
    id: s.id,
    preview: s.preview,
    text: s.text,
    decorations: s.decorations,
    styleOverride: s.styleOverride
  }));
};

// Deserialize screenshots (File will be null)
const deserializeScreenshots = (data: SerializedScreenshot[]): Screenshot[] => {
  return data.map(s => ({
    id: s.id,
    file: null,  // File can't be restored from storage
    preview: s.preview,
    text: s.text,
    decorations: s.decorations,
    styleOverride: s.styleOverride
  }));
};

// Save current project
export const saveProject = (
  name: string,
  screenshots: Screenshot[],
  styleConfig: StyleConfig,
  deviceSize: DeviceSize,
  sourceLanguage: string,
  targetLanguages: string[],
  existingId?: string
): ProjectData => {
  const now = new Date().toISOString();
  const project: ProjectData = {
    id: existingId || generateId(),
    name,
    createdAt: existingId ? (getProject(existingId)?.createdAt || now) : now,
    updatedAt: now,
    screenshots: serializeScreenshots(screenshots),
    styleConfig,
    deviceSize,
    sourceLanguage,
    targetLanguages
  };

  // Save project data
  localStorage.setItem(`${STORAGE_KEY}_${project.id}`, JSON.stringify(project));

  // Update projects list
  const projects = getProjectsList();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  if (existingIndex >= 0) {
    projects[existingIndex] = { id: project.id, name: project.name, updatedAt: project.updatedAt };
  } else {
    projects.unshift({ id: project.id, name: project.name, updatedAt: project.updatedAt });
  }
  localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(projects));

  return project;
};

// Get project by ID
export const getProject = (id: string): ProjectData | null => {
  const data = localStorage.getItem(`${STORAGE_KEY}_${id}`);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Load project and return deserialized data
export const loadProject = (id: string): {
  screenshots: Screenshot[];
  styleConfig: StyleConfig;
  deviceSize: DeviceSize;
  sourceLanguage: string;
  targetLanguages: string[];
} | null => {
  const project = getProject(id);
  if (!project) return null;

  return {
    screenshots: deserializeScreenshots(project.screenshots),
    styleConfig: project.styleConfig,
    deviceSize: project.deviceSize,
    sourceLanguage: project.sourceLanguage,
    targetLanguages: project.targetLanguages
  };
};

// Get list of all saved projects
export const getProjectsList = (): { id: string; name: string; updatedAt: string }[] => {
  const data = localStorage.getItem(PROJECTS_LIST_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Delete project
export const deleteProject = (id: string): void => {
  localStorage.removeItem(`${STORAGE_KEY}_${id}`);
  const projects = getProjectsList().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(projects));
};

// Auto-save to a special "autosave" slot
export const autoSave = (
  screenshots: Screenshot[],
  styleConfig: StyleConfig,
  deviceSize: DeviceSize,
  sourceLanguage: string,
  targetLanguages: string[]
): void => {
  const data = {
    screenshots: serializeScreenshots(screenshots),
    styleConfig,
    deviceSize,
    sourceLanguage,
    targetLanguages,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(`${STORAGE_KEY}_autosave`, JSON.stringify(data));
};

// Load autosave
export const loadAutoSave = (): {
  screenshots: Screenshot[];
  styleConfig: StyleConfig;
  deviceSize: DeviceSize;
  sourceLanguage: string;
  targetLanguages: string[];
} | null => {
  const data = localStorage.getItem(`${STORAGE_KEY}_autosave`);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return {
      screenshots: deserializeScreenshots(parsed.screenshots),
      styleConfig: parsed.styleConfig,
      deviceSize: parsed.deviceSize,
      sourceLanguage: parsed.sourceLanguage,
      targetLanguages: parsed.targetLanguages
    };
  } catch {
    return null;
  }
};

// Check if autosave exists
export const hasAutoSave = (): boolean => {
  return localStorage.getItem(`${STORAGE_KEY}_autosave`) !== null;
};

// Clear autosave
export const clearAutoSave = (): void => {
  localStorage.removeItem(`${STORAGE_KEY}_autosave`);
};
