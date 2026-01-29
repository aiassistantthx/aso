const API_BASE = '';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

function clearToken() {
  localStorage.removeItem('auth_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
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
    throw new ApiError(response.status, data.error || 'Request failed', data.limit);
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
    setToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  me: async () => {
    return request<UserWithPlan>('/api/auth/me');
  },

  logout: () => {
    clearToken();
  },

  hasToken: () => !!getToken(),
};

// Projects
export const projects = {
  list: () => request<ProjectListItem[]>('/api/projects'),

  get: (id: string) => request<ProjectFull>(`/api/projects/${id}`),

  create: (name: string, styleConfig?: Record<string, unknown>) =>
    request<ProjectFull>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name, styleConfig }),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    request<ProjectFull>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/api/projects/${id}`, { method: 'DELETE' }),

  autosave: (id: string, data: Record<string, unknown>) =>
    request<{ ok: boolean; updatedAt: string }>(`/api/projects/${id}/autosave`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Screenshots
export const screenshots = {
  upload: async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<ScreenshotRecord & { imageUrl: string }>(
      `/api/projects/${projectId}/screenshots`,
      { method: 'POST', body: formData },
    );
  },

  update: (projectId: string, sid: string, data: Record<string, unknown>) =>
    request<ScreenshotRecord>(`/api/projects/${projectId}/screenshots/${sid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (projectId: string, sid: string) =>
    request<void>(`/api/projects/${projectId}/screenshots/${sid}`, {
      method: 'DELETE',
    }),

  reorder: (projectId: string, order: string[]) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/screenshots/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ order }),
    }),

  bulkUpdate: (projectId: string, screenshotsList: Array<Record<string, unknown>>) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/screenshots/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ screenshots: screenshotsList }),
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

// Stripe
export const stripe = {
  checkout: () =>
    request<{ url: string }>('/api/stripe/checkout', { method: 'POST' }),

  portal: () =>
    request<{ url: string }>('/api/stripe/portal', { method: 'POST' }),
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

export interface ProjectListItem {
  id: string;
  name: string;
  updatedAt: string;
  screenshotCount: number;
  thumbnail: string | null;
}

export interface ProjectFull {
  id: string;
  userId: string;
  name: string;
  styleConfig: Record<string, unknown>;
  deviceSize: string;
  sourceLanguage: string;
  targetLanguages: string[];
  translationData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  screenshots: ScreenshotRecord[];
}

export interface ScreenshotRecord {
  id: string;
  projectId: string;
  order: number;
  imagePath: string | null;
  text: string;
  decorations: unknown;
  styleOverride: unknown;
  mockupSettings: unknown;
}
