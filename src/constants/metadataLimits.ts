export interface FieldDef {
  key: string;
  label: string;
  limit: number;
  multiline: boolean;
}

export const IOS_FIELDS: FieldDef[] = [
  { key: 'appName', label: 'App Name', limit: 30, multiline: false },
  { key: 'subtitle', label: 'Subtitle', limit: 30, multiline: false },
  { key: 'description', label: 'Description', limit: 4000, multiline: true },
  { key: 'whatsNew', label: "What's New", limit: 4000, multiline: true },
  { key: 'keywords', label: 'Keywords', limit: 100, multiline: false },
];

export const ANDROID_FIELDS: FieldDef[] = [
  { key: 'appName', label: 'App Name', limit: 30, multiline: false },
  { key: 'shortDescription', label: 'Short Description', limit: 80, multiline: false },
  { key: 'fullDescription', label: 'Full Description', limit: 4000, multiline: true },
  { key: 'whatsNew', label: "What's New", limit: 500, multiline: true },
];

export function getFieldsForPlatform(platform: string): FieldDef[] {
  return platform === 'android' ? ANDROID_FIELDS : IOS_FIELDS;
}

export function getCharColor(current: number, limit: number): string {
  const ratio = current / limit;
  if (ratio > 0.95) return '#ff3b30';
  if (ratio > 0.8) return '#ff9500';
  return '#34c759';
}
