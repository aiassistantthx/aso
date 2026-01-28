import { Template, TemplatePreset, TemplateCategory } from '../types';

// Full template definitions
export const TEMPLATES: Template[] = [
  // 1. Purple Bold - Like "Productivity organizer"
  {
    id: 'purple-bold',
    name: 'Purple Bold',
    category: 'bold',
    layout: 'classic-bottom',
    backgroundColor: '#f5f5f7',
    gradient: { enabled: false, color1: '#667eea', color2: '#764ba2', angle: 135 },
    textColor: '#5B4FD9',
    pattern: { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 },
    fontFamily: 'Poppins, sans-serif',
    fontSize: 96,
    textAlign: 'left',
    subtitleEnabled: true,
    subtitleFontSize: 36,
    subtitleColor: '#666666',
    highlightColor: '#5B4FD9',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.85,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 120,
    paddingSide: 80
  },

  // 2. Blue Pattern - Like "Scan ID" app
  {
    id: 'blue-pattern',
    name: 'Blue Pattern',
    category: 'pattern',
    layout: 'classic-top',
    backgroundColor: '#2563EB',
    gradient: { enabled: true, color1: '#2563EB', color2: '#1D4ED8', angle: 180 },
    textColor: '#FFFFFF',
    pattern: { type: 'dots', color: '#FFFFFF', opacity: 0.15, size: 8, spacing: 24 },
    fontFamily: 'Anton, sans-serif',
    fontSize: 88,
    textAlign: 'center',
    subtitleEnabled: true,
    subtitleFontSize: 32,
    subtitleColor: 'rgba(255,255,255,0.8)',
    highlightColor: '#FFFFFF',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },

  // 3. Finance Purple - Like "Finance spending" app
  {
    id: 'finance-purple',
    name: 'Finance Purple',
    category: 'gradient',
    layout: 'classic-bottom',
    backgroundColor: '#7C3AED',
    gradient: { enabled: true, color1: '#7C3AED', color2: '#5B21B6', angle: 135 },
    textColor: '#FFFFFF',
    pattern: { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 },
    fontFamily: 'Poppins, sans-serif',
    fontSize: 80,
    textAlign: 'left',
    subtitleEnabled: false,
    highlightColor: '#FFFFFF',
    highlightStyle: 'none',
    mockupColor: 'white',
    mockupScale: 0.95,
    mockupShadow: true,
    paddingTop: 100,
    paddingBottom: 80,
    paddingSide: 80
  },

  // 4. Clean White - Minimal light design
  {
    id: 'clean-white',
    name: 'Clean White',
    category: 'minimal',
    layout: 'classic-top',
    backgroundColor: '#FFFFFF',
    gradient: { enabled: false, color1: '#FFFFFF', color2: '#F5F5F7', angle: 180 },
    textColor: '#1D1D1F',
    pattern: { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 },
    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 72,
    textAlign: 'center',
    subtitleEnabled: true,
    subtitleFontSize: 32,
    subtitleColor: '#86868B',
    highlightColor: '#0071E3',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 1.0,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },

  // 5. Dark Neon - Like "Crypto" app
  {
    id: 'dark-neon',
    name: 'Dark Neon',
    category: 'dark',
    layout: 'classic-top',
    backgroundColor: '#0F0F1A',
    gradient: { enabled: true, color1: '#1A1A2E', color2: '#0F0F1A', angle: 180 },
    textColor: '#FFFFFF',
    pattern: { type: 'grid', color: '#7C3AED', opacity: 0.1, size: 1, spacing: 40 },
    fontFamily: 'Inter, sans-serif',
    fontSize: 76,
    textAlign: 'left',
    subtitleEnabled: true,
    subtitleFontSize: 28,
    subtitleColor: '#A78BFA',
    highlightColor: '#A78BFA',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 80
  },

  // 6. Pink Dating - Like "Dating live" app
  {
    id: 'pink-dating',
    name: 'Pink Vibrant',
    category: 'colorful',
    layout: 'classic-top',
    backgroundColor: '#EC4899',
    gradient: { enabled: true, color1: '#EC4899', color2: '#DB2777', angle: 135 },
    textColor: '#FFFFFF',
    pattern: { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 },
    fontFamily: 'Poppins, sans-serif',
    fontSize: 84,
    textAlign: 'left',
    subtitleEnabled: false,
    highlightColor: '#FFFFFF',
    highlightStyle: 'none',
    mockupColor: 'white',
    mockupScale: 0.95,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 80
  },

  // 7. Dots Pattern Light - Clean with subtle pattern
  {
    id: 'dots-light',
    name: 'Dots Pattern',
    category: 'pattern',
    layout: 'classic-top',
    backgroundColor: '#F8FAFC',
    gradient: { enabled: false, color1: '#F8FAFC', color2: '#F1F5F9', angle: 180 },
    textColor: '#1E293B',
    pattern: { type: 'dots', color: '#CBD5E1', opacity: 0.5, size: 4, spacing: 20 },
    fontFamily: 'Inter, sans-serif',
    fontSize: 72,
    textAlign: 'center',
    subtitleEnabled: true,
    subtitleFontSize: 30,
    subtitleColor: '#64748B',
    highlightColor: '#3B82F6',
    highlightStyle: 'background',
    mockupColor: 'black',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },

  // 8. Business Finance - Dark blue professional
  {
    id: 'business-dark',
    name: 'Business Dark',
    category: 'dark',
    layout: 'classic-top',
    backgroundColor: '#1E3A5F',
    gradient: { enabled: true, color1: '#1E3A5F', color2: '#0F172A', angle: 180 },
    textColor: '#FFFFFF',
    pattern: { type: 'dots', color: '#FFFFFF', opacity: 0.08, size: 6, spacing: 20 },
    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 76,
    textAlign: 'left',
    subtitleEnabled: true,
    subtitleFontSize: 28,
    subtitleColor: 'rgba(255,255,255,0.7)',
    highlightColor: '#60A5FA',
    highlightStyle: 'none',
    mockupColor: 'white',
    mockupScale: 0.85,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 80,
    paddingSide: 80
  },

  // 9. Green Fresh - Nature/health apps
  {
    id: 'green-fresh',
    name: 'Green Fresh',
    category: 'colorful',
    layout: 'classic-top',
    backgroundColor: '#10B981',
    gradient: { enabled: true, color1: '#10B981', color2: '#059669', angle: 135 },
    textColor: '#FFFFFF',
    pattern: { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 },
    fontFamily: 'Poppins, sans-serif',
    fontSize: 80,
    textAlign: 'center',
    subtitleEnabled: true,
    subtitleFontSize: 30,
    subtitleColor: 'rgba(255,255,255,0.85)',
    highlightColor: '#FFFFFF',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },

  // 10. Orange Energy - Fitness/productivity
  {
    id: 'orange-energy',
    name: 'Orange Energy',
    category: 'bold',
    layout: 'classic-top',
    backgroundColor: '#F97316',
    gradient: { enabled: true, color1: '#F97316', color2: '#EA580C', angle: 135 },
    textColor: '#FFFFFF',
    pattern: { type: 'diagonal-lines', color: '#FFFFFF', opacity: 0.1, size: 2, spacing: 30 },
    fontFamily: 'Anton, sans-serif',
    fontSize: 88,
    textAlign: 'center',
    subtitleEnabled: false,
    highlightColor: '#FFFFFF',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.95,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },

  // 11. Soft Gradient - Calm, relaxing
  {
    id: 'soft-gradient',
    name: 'Soft Gradient',
    category: 'gradient',
    layout: 'classic-top',
    backgroundColor: '#E0E7FF',
    gradient: { enabled: true, color1: '#E0E7FF', color2: '#C7D2FE', angle: 135 },
    textColor: '#3730A3',
    pattern: { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 },
    fontFamily: 'Poppins, sans-serif',
    fontSize: 72,
    textAlign: 'center',
    subtitleEnabled: true,
    subtitleFontSize: 28,
    subtitleColor: '#6366F1',
    highlightColor: '#6366F1',
    highlightStyle: 'background',
    mockupColor: 'white',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },

  // 12. Grid Tech - Technical/developer apps
  {
    id: 'grid-tech',
    name: 'Grid Tech',
    category: 'pattern',
    layout: 'classic-top',
    backgroundColor: '#18181B',
    gradient: { enabled: false, color1: '#18181B', color2: '#27272A', angle: 180 },
    textColor: '#FAFAFA',
    pattern: { type: 'grid', color: '#3F3F46', opacity: 0.5, size: 1, spacing: 32 },
    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 72,
    textAlign: 'left',
    subtitleEnabled: true,
    subtitleFontSize: 26,
    subtitleColor: '#A1A1AA',
    highlightColor: '#22D3EE',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 80
  }
];

// Template presets for quick access (simplified)
export const TEMPLATE_PRESETS: TemplatePreset[] = TEMPLATES.map(t => ({
  id: t.id,
  name: t.name,
  category: t.category,
  description: getCategoryDescription(t.category),
  template: t
}));

function getCategoryDescription(category: TemplateCategory): string {
  switch (category) {
    case 'minimal': return 'Clean and simple';
    case 'bold': return 'Strong typography';
    case 'gradient': return 'Smooth color transitions';
    case 'pattern': return 'With background patterns';
    case 'dark': return 'Dark mode style';
    case 'light': return 'Bright and airy';
    case 'colorful': return 'Vibrant colors';
    default: return '';
  }
}

// Get templates by category
export const getTemplatesByCategory = (category: TemplateCategory): Template[] => {
  return TEMPLATES.filter(t => t.category === category);
};

// Get template by ID
export const getTemplateById = (id: string): Template | undefined => {
  return TEMPLATES.find(t => t.id === id);
};

// All categories with labels
export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
  { id: 'minimal', label: 'Minimal', icon: '○' },
  { id: 'bold', label: 'Bold', icon: '■' },
  { id: 'gradient', label: 'Gradient', icon: '◐' },
  { id: 'pattern', label: 'Pattern', icon: '⬡' },
  { id: 'dark', label: 'Dark', icon: '●' },
  { id: 'colorful', label: 'Colorful', icon: '◆' }
];
