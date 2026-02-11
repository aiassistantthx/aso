import { getIdToken as getFirebaseIdToken, isFirebaseEnabled } from './firebase';

const API_BASE = '';

// Token source: 'firebase' or 'legacy'
let tokenSource: 'firebase' | 'legacy' = 'legacy';

function getLegacyToken(): string | null {
  return localStorage.getItem('auth_token');
}

function setLegacyToken(token: string) {
  localStorage.setItem('auth_token', token);
}

function clearLegacyToken() {
  localStorage.removeItem('auth_token');
}

export function setTokenSource(source: 'firebase' | 'legacy') {
  tokenSource = source;
}

export function getTokenSource(): 'firebase' | 'legacy' {
  return tokenSource;
}

async function getToken(): Promise<string | null> {
  // If using Firebase, try to get Firebase token first
  if (tokenSource === 'firebase' && isFirebaseEnabled()) {
    const firebaseToken = await getFirebaseIdToken();
    if (firebaseToken) {
      return firebaseToken;
    }
  }

  // Fallback to legacy token
  return getLegacyToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type when there's a body and it's not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || data.error || 'Request failed', data.limit);
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public limit?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auth
export const auth = {
  register: async (email: string, password: string, name?: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setLegacyToken(data.token);
    setTokenSource('legacy');
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setLegacyToken(data.token);
    setTokenSource('legacy');
    return data;
  },

  firebaseVerify: async (idToken: string) => {
    const data = await request<{ user: UserWithPlan }>('/api/auth/firebase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    setTokenSource('firebase');
    return data;
  },

  me: async () => {
    return request<UserWithPlan>('/api/auth/me');
  },

  logout: () => {
    clearLegacyToken();
    setTokenSource('legacy');
  },

  hasToken: () => {
    // Check for legacy token synchronously
    // Firebase token check happens asynchronously in getToken()
    return !!getLegacyToken() || (isFirebaseEnabled() && tokenSource === 'firebase');
  },

  hasLegacyToken: () => !!getLegacyToken(),

  togglePlan: () =>
    request<{ plan: 'FREE' | 'PRO' }>('/api/auth/toggle-plan', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};

// Translation
export const translate = {
  translate: (texts: string[], sourceLanguage: string, targetLanguages: string[]) =>
    request<{ translations: Record<string, string[]> }>('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ texts, sourceLanguage, targetLanguages }),
    }),
};

// Polar
export const polar = {
  checkout: () =>
    request<{ url: string }>('/api/polar/checkout', { method: 'POST' }),

  portal: () =>
    request<{ url: string }>('/api/polar/portal', { method: 'POST' }),
};

// Unified billing helper (Polar only)
export const billing = {
  checkout: () => polar.checkout(),
  portal: () => polar.portal(),
};

// Unified Projects API
export const unified = {
  list: (mode?: 'wizard' | 'manual') =>
    request<UnifiedProjectListItem[]>(`/api/unified${mode ? `?mode=${mode}` : ''}`),

  get: (id: string) => request<UnifiedProjectFull>(`/api/unified/${id}`),

  create: (mode: 'wizard' | 'manual' = 'wizard', name?: string) =>
    request<UnifiedProjectFull>('/api/unified', {
      method: 'POST',
      body: JSON.stringify({ mode, name }),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request<UnifiedProjectFull>(`/api/unified/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ ok: boolean }>(`/api/unified/${id}`, { method: 'DELETE' }),

  uploadScreenshot: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ screenshotUrl: string; project?: UnifiedProjectFull; screenshot?: UnifiedScreenshotRecord }>(
      `/api/unified/${id}/screenshots`,
      { method: 'POST', body: formData },
    );
  },

  removeScreenshot: (id: string, index: number | string) =>
    request<UnifiedProjectFull | { ok: boolean }>(`/api/unified/${id}/screenshots/${index}`, {
      method: 'DELETE',
    }),

  generateAll: (id: string) =>
    request<UnifiedProjectFull>(`/api/unified/${id}/generate-all`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  translate: (id: string) =>
    request<UnifiedProjectFull>(`/api/unified/${id}/translate`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  convertToManual: (id: string) =>
    request<UnifiedProjectFull>(`/api/unified/${id}/convert-to-manual`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  autosave: (id: string, data: Record<string, unknown>) =>
    request<{ ok: boolean; updatedAt: string }>(`/api/unified/${id}/autosave`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  bulkUpdateScreenshots: (id: string, screenshotsList: Array<Record<string, unknown>>) =>
    request<{ ok: boolean }>(`/api/unified/${id}/screenshots/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ screenshots: screenshotsList }),
    }),

  reorderScreenshots: (id: string, order: string[]) =>
    request<{ ok: boolean }>(`/api/unified/${id}/screenshots/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ order }),
    }),

  generateMetadata: (id: string) =>
    request<UnifiedProjectFull>(`/api/unified/${id}/generate-metadata`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  translateMetadata: (id: string, targetLanguages: string[]) =>
    request<UnifiedProjectFull>(`/api/unified/${id}/translate-metadata`, {
      method: 'POST',
      body: JSON.stringify({ targetLanguages }),
    }),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface UserWithPlan extends User {
  plan: 'FREE' | 'PRO';
  subscription: {
    status: string;
    plan: string;
    currentPeriodEnd: string;
  } | null;
}

// Unified Project Types
export interface UnifiedProjectListItem {
  id: string;
  name: string;
  mode: 'wizard' | 'manual';
  appName: string;
  wizardStatus: string;
  wizardCurrentStep: number;
  wizardTone: string;
  updatedAt: string;
  screenshotCount: number;
  thumbnail: string | null;
}

export interface UnifiedScreenshotRecord {
  id: string;
  projectId: string;
  order: number;
  imagePath: string | null;
  text: string;
  decorations: unknown;
  styleOverride: unknown;
  mockupSettings: unknown;
}

export interface UnifiedProjectFull {
  id: string;
  userId: string;
  name: string;
  mode: 'wizard' | 'manual';
  appName: string;
  briefDescription: string;
  targetKeywords: string;
  screenshots: UnifiedScreenshotRecord[];
  styleConfig: Record<string, unknown> | null;
  deviceSize: string;
  metadataPlatform: string;
  generatedMetadata: Record<string, string> | null;
  editedMetadata: Record<string, string> | null;
  metadataTranslations: Record<string, Record<string, string>> | null;
  sourceLanguage: string;
  targetLanguages: string[];
  translationData: Record<string, unknown> | null;
  wizardCurrentStep: number;
  wizardTone: string;
  wizardLayoutPreset: string;
  wizardSelectedTemplateId: string | null;
  wizardGeneratedHeadlines: string[] | null;
  wizardEditedHeadlines: string[] | null;
  wizardGeneratedIconUrl: string | null;
  wizardStatus: string;
  wizardUploadedScreenshots: string[] | null;
  wizardScreenshotEditorData: Array<{
    decorations?: unknown;
    styleOverride?: unknown;
    mockupSettings?: unknown;
    linkedMockupIndex?: number;
  }> | null;
  wizardTranslatedHeadlines: Record<string, string[]> | null;
  wizardTranslatedEditorData: Record<string, {
    mockupScale?: number;
    screenshotSettings?: Array<{
      decorations?: unknown;
      styleOverride?: unknown;
      mockupSettings?: unknown;
      linkedMockupIndex?: number;
    }>;
  }> | null;
  wizardGenerateScreenshots: boolean;
  wizardGenerateIcon: boolean;
  wizardGenerateMetadata: boolean;
  generationErrors?: string[];
  createdAt: string;
  updatedAt: string;
}
