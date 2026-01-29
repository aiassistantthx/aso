import { Template, TemplatePreset, TemplateCategory, GradientConfig, BackgroundPattern } from '../types';

// Alternating color variant for multi-screen templates
export interface AlternatingColorVariant {
  backgroundColor: string;
  gradient: GradientConfig;
  textColor?: string;
  highlightColor?: string;
}

// Full template preset with colors, pattern, fonts, and styling
export interface ThemePreset {
  id: string;
  name: string;
  backgroundColor: string;
  gradient: GradientConfig;
  textColor: string;
  highlightColor: string;
  mockupColor: 'black' | 'white' | 'natural';
  pattern?: BackgroundPattern;
  // Font settings (full template)
  fontFamily: string;
  fontSize: number;
  textAlign?: 'left' | 'center' | 'right';
  mockupScale?: number;
  // Alternating colors for different screens (cycles through)
  alternatingColors?: AlternatingColorVariant[];
}

// Helper to create a "no pattern" config
const noPattern: BackgroundPattern = { type: 'none', color: '#000', opacity: 0, size: 0, spacing: 0 };

// Full template presets - colors, fonts, and styling
export const THEME_PRESETS: ThemePreset[] = [
  // Dark themes - modern, sleek fonts
  {
    id: 'dark-navy',
    name: 'Dark Navy',
    backgroundColor: '#1a1a2e',
    gradient: { enabled: true, color1: '#1a1a2e', color2: '#16213e', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#60a5fa',
    mockupColor: 'black',
    pattern: { type: 'grid', color: '#ffffff', opacity: 0.05, size: 1, spacing: 40 },
    fontFamily: 'Inter, sans-serif',
    fontSize: 80,
    textAlign: 'left'
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    backgroundColor: '#2d1b4e',
    gradient: { enabled: true, color1: '#2d1b4e', color2: '#1a0a2e', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#c084fc',
    mockupColor: 'black',
    pattern: { type: 'dots', color: '#a855f7', opacity: 0.08, size: 4, spacing: 30 },
    fontFamily: 'Poppins, sans-serif',
    fontSize: 76,
    textAlign: 'left'
  },
  {
    id: 'pure-black',
    name: 'Pure Black',
    backgroundColor: '#000000',
    gradient: { enabled: false, color1: '#000000', color2: '#1a1a1a', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#fbbf24',
    mockupColor: 'black',
    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 72,
    textAlign: 'center'
  },

  // Purple/Violet themes - bold, expressive fonts
  {
    id: 'electric-violet',
    name: 'Electric Violet',
    backgroundColor: '#7C3AED',
    gradient: { enabled: false, color1: '#7C3AED', color2: '#6D28D9', angle: 135 },
    textColor: '#ffffff',
    highlightColor: '#fde047',
    mockupColor: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 84,
    textAlign: 'left'
  },
  {
    id: 'purple-gradient',
    name: 'Purple Gradient',
    backgroundColor: '#7C3AED',
    gradient: { enabled: true, color1: '#A855F7', color2: '#7C3AED', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#fef08a',
    mockupColor: 'white',
    pattern: { type: 'circles', color: '#ffffff', opacity: 0.08, size: 2, spacing: 50 },
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 80,
    textAlign: 'center'
  },
  {
    id: 'bright-magenta',
    name: 'Bright Magenta',
    backgroundColor: '#D946EF',
    gradient: { enabled: true, color1: '#D946EF', color2: '#A855F7', angle: 135 },
    textColor: '#ffffff',
    highlightColor: '#fef9c3',
    mockupColor: 'white',
    fontFamily: 'Raleway, sans-serif',
    fontSize: 76,
    textAlign: 'left'
  },

  // Blue themes - professional, clean fonts
  {
    id: 'tech-blue',
    name: 'Tech Blue',
    backgroundColor: '#2563EB',
    gradient: { enabled: true, color1: '#3B82F6', color2: '#2563EB', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#fde047',
    mockupColor: 'black',
    pattern: { type: 'dots', color: '#ffffff', opacity: 0.12, size: 6, spacing: 24 },
    fontFamily: 'Anton, sans-serif',
    fontSize: 88,
    textAlign: 'center'
  },
  {
    id: 'deep-blue',
    name: 'Deep Blue',
    backgroundColor: '#1E40AF',
    gradient: { enabled: true, color1: '#2563EB', color2: '#1E40AF', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#93c5fd',
    mockupColor: 'black',
    pattern: { type: 'grid', color: '#60a5fa', opacity: 0.1, size: 1, spacing: 35 },
    fontFamily: 'Inter, sans-serif',
    fontSize: 76,
    textAlign: 'left'
  },
  {
    id: 'indigo',
    name: 'Indigo',
    backgroundColor: '#4F46E5',
    gradient: { enabled: true, color1: '#6366F1', color2: '#4F46E5', angle: 135 },
    textColor: '#ffffff',
    highlightColor: '#fbbf24',
    mockupColor: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 80,
    textAlign: 'center'
  },

  // Green themes - fresh, modern fonts
  {
    id: 'spotify-green',
    name: 'Spotify Green',
    backgroundColor: '#1DB954',
    gradient: { enabled: false, color1: '#1DB954', color2: '#1ed760', angle: 135 },
    textColor: '#ffffff',
    highlightColor: '#000000',
    mockupColor: 'black',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 80,
    textAlign: 'left'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    backgroundColor: '#10B981',
    gradient: { enabled: true, color1: '#34D399', color2: '#10B981', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#fef3c7',
    mockupColor: 'black',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 80,
    textAlign: 'center'
  },
  {
    id: 'teal',
    name: 'Teal',
    backgroundColor: '#14B8A6',
    gradient: { enabled: true, color1: '#2DD4BF', color2: '#14B8A6', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#fde68a',
    mockupColor: 'black',
    fontFamily: 'Lato, sans-serif',
    fontSize: 76,
    textAlign: 'left'
  },

  // Cyan/Mint themes - light, airy fonts
  {
    id: 'cyan-fresh',
    name: 'Cyan Fresh',
    backgroundColor: '#06B6D4',
    gradient: { enabled: true, color1: '#22D3EE', color2: '#06B6D4', angle: 180 },
    textColor: '#0c4a6e',
    highlightColor: '#fbbf24',
    mockupColor: 'black',
    fontFamily: 'Open Sans, sans-serif',
    fontSize: 76,
    textAlign: 'center'
  },
  {
    id: 'mint',
    name: 'Mint',
    backgroundColor: '#5EEAD4',
    gradient: { enabled: true, color1: '#99F6E4', color2: '#5EEAD4', angle: 180 },
    textColor: '#134e4a',
    highlightColor: '#0d9488',
    mockupColor: 'black',
    fontFamily: 'Raleway, sans-serif',
    fontSize: 72,
    textAlign: 'center'
  },

  // Orange themes - bold, energetic fonts
  {
    id: 'orange',
    name: 'Orange',
    backgroundColor: '#F97316',
    gradient: { enabled: true, color1: '#FB923C', color2: '#F97316', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#7c2d12',
    mockupColor: 'black',
    pattern: { type: 'diagonal-lines', color: '#ffffff', opacity: 0.1, size: 2, spacing: 25 },
    fontFamily: 'Anton, sans-serif',
    fontSize: 88,
    textAlign: 'center'
  },
  {
    id: 'amber',
    name: 'Amber',
    backgroundColor: '#F59E0B',
    gradient: { enabled: true, color1: '#FBBF24', color2: '#F59E0B', angle: 180 },
    textColor: '#451a03',
    highlightColor: '#78350f',
    mockupColor: 'black',
    fontFamily: 'Oswald, sans-serif',
    fontSize: 84,
    textAlign: 'left'
  },

  // Pink themes - playful, modern fonts
  {
    id: 'hot-pink',
    name: 'Hot Pink',
    backgroundColor: '#EC4899',
    gradient: { enabled: true, color1: '#F472B6', color2: '#EC4899', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#831843',
    mockupColor: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 84,
    textAlign: 'left'
  },
  {
    id: 'rose',
    name: 'Rose',
    backgroundColor: '#F43F5E',
    gradient: { enabled: true, color1: '#FB7185', color2: '#F43F5E', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#881337',
    mockupColor: 'white',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 80,
    textAlign: 'center'
  },

  // Multi-color gradients - expressive fonts (with alternating colors)
  {
    id: 'messenger',
    name: 'Messenger',
    backgroundColor: '#3B82F6',
    gradient: { enabled: true, color1: '#3B82F6', color2: '#EC4899', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#1e3a8a',
    mockupColor: 'white',
    fontFamily: 'Inter, sans-serif',
    fontSize: 76,
    textAlign: 'left',
    alternatingColors: [
      { backgroundColor: '#EC4899', gradient: { enabled: true, color1: '#EC4899', color2: '#8B5CF6', angle: 180 }, textColor: '#ffffff', highlightColor: '#831843' },
      { backgroundColor: '#8B5CF6', gradient: { enabled: true, color1: '#8B5CF6', color2: '#3B82F6', angle: 180 }, textColor: '#ffffff', highlightColor: '#4c1d95' }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    backgroundColor: '#E1306C',
    gradient: { enabled: true, color1: '#FCAF45', color2: '#E1306C', angle: 135 },
    textColor: '#ffffff',
    highlightColor: '#831843',
    mockupColor: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 80,
    textAlign: 'left',
    alternatingColors: [
      { backgroundColor: '#833AB4', gradient: { enabled: true, color1: '#E1306C', color2: '#833AB4', angle: 135 }, textColor: '#ffffff', highlightColor: '#4c1d95' },
      { backgroundColor: '#405DE6', gradient: { enabled: true, color1: '#833AB4', color2: '#405DE6', angle: 135 }, textColor: '#ffffff', highlightColor: '#1e3a8a' }
    ]
  },
  {
    id: 'sunset',
    name: 'Sunset',
    backgroundColor: '#F97316',
    gradient: { enabled: true, color1: '#FBBF24', color2: '#F97316', angle: 135 },
    textColor: '#ffffff',
    highlightColor: '#7c2d12',
    mockupColor: 'white',
    fontFamily: 'Bebas Neue, sans-serif',
    fontSize: 96,
    textAlign: 'center',
    alternatingColors: [
      { backgroundColor: '#F43F5E', gradient: { enabled: true, color1: '#F97316', color2: '#F43F5E', angle: 135 }, textColor: '#ffffff', highlightColor: '#881337' },
      { backgroundColor: '#EC4899', gradient: { enabled: true, color1: '#F43F5E', color2: '#EC4899', angle: 135 }, textColor: '#ffffff', highlightColor: '#701a75' }
    ]
  },
  {
    id: 'aurora',
    name: 'Aurora',
    backgroundColor: '#4F46E5',
    gradient: { enabled: true, color1: '#06B6D4', color2: '#4F46E5', angle: 135 },
    textColor: '#ffffff',
    highlightColor: '#312e81',
    mockupColor: 'white',
    pattern: { type: 'dots', color: '#ffffff', opacity: 0.1, size: 3, spacing: 35 },
    fontFamily: 'Raleway, sans-serif',
    fontSize: 80,
    textAlign: 'center',
    alternatingColors: [
      { backgroundColor: '#8B5CF6', gradient: { enabled: true, color1: '#4F46E5', color2: '#EC4899', angle: 135 }, textColor: '#ffffff', highlightColor: '#4c1d95' },
      { backgroundColor: '#06B6D4', gradient: { enabled: true, color1: '#EC4899', color2: '#06B6D4', angle: 135 }, textColor: '#ffffff', highlightColor: '#164e63' }
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean',
    backgroundColor: '#0284C7',
    gradient: { enabled: true, color1: '#22D3EE', color2: '#0284C7', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#0c4a6e',
    mockupColor: 'black',
    fontFamily: 'Lato, sans-serif',
    fontSize: 76,
    textAlign: 'left',
    alternatingColors: [
      { backgroundColor: '#0369A1', gradient: { enabled: true, color1: '#0284C7', color2: '#0369A1', angle: 180 }, textColor: '#ffffff', highlightColor: '#0c4a6e' },
      { backgroundColor: '#075985', gradient: { enabled: true, color1: '#0369A1', color2: '#075985', angle: 180 }, textColor: '#ffffff', highlightColor: '#082f49' }
    ]
  },
  {
    id: 'forest',
    name: 'Forest',
    backgroundColor: '#166534',
    gradient: { enabled: true, color1: '#22C55E', color2: '#166534', angle: 180 },
    textColor: '#ffffff',
    highlightColor: '#052e16',
    mockupColor: 'black',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 80,
    textAlign: 'center',
    alternatingColors: [
      { backgroundColor: '#15803D', gradient: { enabled: true, color1: '#166534', color2: '#14532D', angle: 180 }, textColor: '#ffffff', highlightColor: '#052e16' },
      { backgroundColor: '#14532D', gradient: { enabled: true, color1: '#14532D', color2: '#052E16', angle: 180 }, textColor: '#ffffff', highlightColor: '#022c22' }
    ]
  },
  // New multi-color templates with alternating screens
  {
    id: 'rainbow',
    name: 'Rainbow',
    backgroundColor: '#EF4444',
    gradient: { enabled: true, color1: '#F97316', color2: '#EF4444', angle: 135 },
    textColor: '#ffffff',
    highlightColor: '#7f1d1d',
    mockupColor: 'white',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 84,
    textAlign: 'center',
    alternatingColors: [
      { backgroundColor: '#F59E0B', gradient: { enabled: true, color1: '#FBBF24', color2: '#F59E0B', angle: 135 }, textColor: '#ffffff', highlightColor: '#78350f' },
      { backgroundColor: '#22C55E', gradient: { enabled: true, color1: '#4ADE80', color2: '#22C55E', angle: 135 }, textColor: '#ffffff', highlightColor: '#14532d' },
      { backgroundColor: '#3B82F6', gradient: { enabled: true, color1: '#60A5FA', color2: '#3B82F6', angle: 135 }, textColor: '#ffffff', highlightColor: '#1e3a8a' },
      { backgroundColor: '#8B5CF6', gradient: { enabled: true, color1: '#A78BFA', color2: '#8B5CF6', angle: 135 }, textColor: '#ffffff', highlightColor: '#4c1d95' },
      { backgroundColor: '#EC4899', gradient: { enabled: true, color1: '#F472B6', color2: '#EC4899', angle: 135 }, textColor: '#ffffff', highlightColor: '#831843' }
    ]
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    backgroundColor: '#1a1a2e',
    gradient: { enabled: true, color1: '#1a1a2e', color2: '#16213e', angle: 180 },
    textColor: '#00ff88',
    highlightColor: '#ff00ff',
    mockupColor: 'black',
    pattern: { type: 'grid', color: '#00ff88', opacity: 0.08, size: 1, spacing: 40 },
    fontFamily: 'Inter, sans-serif',
    fontSize: 80,
    textAlign: 'left',
    alternatingColors: [
      { backgroundColor: '#1a1a2e', gradient: { enabled: true, color1: '#16213e', color2: '#1a1a2e', angle: 180 }, textColor: '#ff00ff', highlightColor: '#00ff88' },
      { backgroundColor: '#1a1a2e', gradient: { enabled: true, color1: '#1a1a2e', color2: '#0f0f1a', angle: 180 }, textColor: '#00d4ff', highlightColor: '#ff6b6b' }
    ]
  },
  {
    id: 'pastel-rainbow',
    name: 'Pastel Rainbow',
    backgroundColor: '#FBCFE8',
    gradient: { enabled: true, color1: '#FCE7F3', color2: '#FBCFE8', angle: 180 },
    textColor: '#9d174d',
    highlightColor: '#db2777',
    mockupColor: 'black',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 76,
    textAlign: 'center',
    alternatingColors: [
      { backgroundColor: '#DDD6FE', gradient: { enabled: true, color1: '#EDE9FE', color2: '#DDD6FE', angle: 180 }, textColor: '#4c1d95', highlightColor: '#8b5cf6' },
      { backgroundColor: '#BFDBFE', gradient: { enabled: true, color1: '#DBEAFE', color2: '#BFDBFE', angle: 180 }, textColor: '#1e40af', highlightColor: '#2563eb' },
      { backgroundColor: '#A7F3D0', gradient: { enabled: true, color1: '#D1FAE5', color2: '#A7F3D0', angle: 180 }, textColor: '#065f46', highlightColor: '#059669' },
      { backgroundColor: '#FDE68A', gradient: { enabled: true, color1: '#FEF3C7', color2: '#FDE68A', angle: 180 }, textColor: '#92400e', highlightColor: '#d97706' },
      { backgroundColor: '#FED7AA', gradient: { enabled: true, color1: '#FFEDD5', color2: '#FED7AA', angle: 180 }, textColor: '#9a3412', highlightColor: '#ea580c' }
    ]
  },

  // Pastel themes - elegant, soft fonts
  {
    id: 'pastel-lavender',
    name: 'Pastel Lavender',
    backgroundColor: '#DDD6FE',
    gradient: { enabled: true, color1: '#EDE9FE', color2: '#DDD6FE', angle: 180 },
    textColor: '#4c1d95',
    highlightColor: '#8b5cf6',
    mockupColor: 'black',
    pattern: { type: 'dots', color: '#a78bfa', opacity: 0.2, size: 4, spacing: 25 },
    fontFamily: 'Playfair Display, serif',
    fontSize: 72,
    textAlign: 'center'
  },
  {
    id: 'pastel-pink',
    name: 'Pastel Pink',
    backgroundColor: '#FBCFE8',
    gradient: { enabled: true, color1: '#FCE7F3', color2: '#FBCFE8', angle: 180 },
    textColor: '#9d174d',
    highlightColor: '#db2777',
    mockupColor: 'black',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 76,
    textAlign: 'center'
  },
  {
    id: 'pastel-mint',
    name: 'Pastel Mint',
    backgroundColor: '#A7F3D0',
    gradient: { enabled: true, color1: '#D1FAE5', color2: '#A7F3D0', angle: 180 },
    textColor: '#065f46',
    highlightColor: '#059669',
    mockupColor: 'black',
    fontFamily: 'Raleway, sans-serif',
    fontSize: 72,
    textAlign: 'center'
  },
  {
    id: 'pastel-yellow',
    name: 'Pastel Yellow',
    backgroundColor: '#FDE68A',
    gradient: { enabled: true, color1: '#FEF3C7', color2: '#FDE68A', angle: 180 },
    textColor: '#92400e',
    highlightColor: '#d97706',
    mockupColor: 'black',
    fontFamily: 'Open Sans, sans-serif',
    fontSize: 76,
    textAlign: 'left'
  },
  {
    id: 'pastel-blue',
    name: 'Pastel Blue',
    backgroundColor: '#BFDBFE',
    gradient: { enabled: true, color1: '#DBEAFE', color2: '#BFDBFE', angle: 180 },
    textColor: '#1e40af',
    highlightColor: '#2563eb',
    mockupColor: 'black',
    pattern: { type: 'circles', color: '#3b82f6', opacity: 0.15, size: 2, spacing: 40 },
    fontFamily: 'Inter, sans-serif',
    fontSize: 72,
    textAlign: 'center'
  },
  {
    id: 'pastel-peach',
    name: 'Pastel Peach',
    backgroundColor: '#FED7AA',
    gradient: { enabled: true, color1: '#FFEDD5', color2: '#FED7AA', angle: 180 },
    textColor: '#9a3412',
    highlightColor: '#ea580c',
    mockupColor: 'black',
    fontFamily: 'Lato, sans-serif',
    fontSize: 76,
    textAlign: 'left'
  },

  // Light/White themes - clean, professional fonts
  {
    id: 'clean-white',
    name: 'Clean White',
    backgroundColor: '#ffffff',
    gradient: { enabled: false, color1: '#ffffff', color2: '#f5f5f7', angle: 180 },
    textColor: '#1d1d1f',
    highlightColor: '#0071e3',
    mockupColor: 'black',
    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 72,
    textAlign: 'center'
  },
  {
    id: 'warm-white',
    name: 'Warm White',
    backgroundColor: '#FFFBEB',
    gradient: { enabled: true, color1: '#FFFBEB', color2: '#FEF3C7', angle: 180 },
    textColor: '#78350f',
    highlightColor: '#d97706',
    mockupColor: 'black',
    pattern: { type: 'dots', color: '#fbbf24', opacity: 0.15, size: 3, spacing: 30 },
    fontFamily: 'Poppins, sans-serif',
    fontSize: 76,
    textAlign: 'left'
  },
  {
    id: 'cool-gray',
    name: 'Cool Gray',
    backgroundColor: '#F1F5F9',
    gradient: { enabled: true, color1: '#F8FAFC', color2: '#F1F5F9', angle: 180 },
    textColor: '#0f172a',
    highlightColor: '#3b82f6',
    mockupColor: 'black',
    pattern: { type: 'grid', color: '#94a3b8', opacity: 0.15, size: 1, spacing: 30 },
    fontFamily: 'Inter, sans-serif',
    fontSize: 72,
    textAlign: 'left'
  }
];

// Legacy alias for backwards compatibility
export const COLOR_PRESETS = THEME_PRESETS;
export type ColorPreset = ThemePreset;

// Full template definitions (includes more styling options)
export const TEMPLATES: Template[] = [
  {
    id: 'purple-bold',
    name: 'Purple Bold',
    category: 'bold',
    layout: 'classic-bottom',
    backgroundColor: '#f5f5f7',
    gradient: { enabled: false, color1: '#667eea', color2: '#764ba2', angle: 135 },
    textColor: '#5B4FD9',
    pattern: noPattern,
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
    highlightColor: '#fde047',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },
  {
    id: 'finance-purple',
    name: 'Finance Purple',
    category: 'gradient',
    layout: 'classic-bottom',
    backgroundColor: '#7C3AED',
    gradient: { enabled: true, color1: '#7C3AED', color2: '#5B21B6', angle: 135 },
    textColor: '#FFFFFF',
    pattern: noPattern,
    fontFamily: 'Poppins, sans-serif',
    fontSize: 80,
    textAlign: 'left',
    subtitleEnabled: false,
    highlightColor: '#fef08a',
    highlightStyle: 'none',
    mockupColor: 'white',
    mockupScale: 0.95,
    mockupShadow: true,
    paddingTop: 100,
    paddingBottom: 80,
    paddingSide: 80
  },
  {
    id: 'clean-white',
    name: 'Clean White',
    category: 'minimal',
    layout: 'classic-top',
    backgroundColor: '#FFFFFF',
    gradient: { enabled: false, color1: '#FFFFFF', color2: '#F5F5F7', angle: 180 },
    textColor: '#1D1D1F',
    pattern: noPattern,
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
    highlightColor: '#c084fc',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 80
  },
  {
    id: 'pink-dating',
    name: 'Pink Vibrant',
    category: 'colorful',
    layout: 'classic-top',
    backgroundColor: '#EC4899',
    gradient: { enabled: true, color1: '#EC4899', color2: '#DB2777', angle: 135 },
    textColor: '#FFFFFF',
    pattern: noPattern,
    fontFamily: 'Poppins, sans-serif',
    fontSize: 84,
    textAlign: 'left',
    subtitleEnabled: false,
    highlightColor: '#fef08a',
    highlightStyle: 'none',
    mockupColor: 'white',
    mockupScale: 0.95,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 80
  },
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
  {
    id: 'green-fresh',
    name: 'Green Fresh',
    category: 'colorful',
    layout: 'classic-top',
    backgroundColor: '#10B981',
    gradient: { enabled: true, color1: '#10B981', color2: '#059669', angle: 135 },
    textColor: '#FFFFFF',
    pattern: noPattern,
    fontFamily: 'Poppins, sans-serif',
    fontSize: 80,
    textAlign: 'center',
    subtitleEnabled: true,
    subtitleFontSize: 30,
    subtitleColor: 'rgba(255,255,255,0.85)',
    highlightColor: '#fef3c7',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.9,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },
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
    highlightColor: '#fef3c7',
    highlightStyle: 'none',
    mockupColor: 'black',
    mockupScale: 0.95,
    mockupShadow: true,
    paddingTop: 80,
    paddingBottom: 60,
    paddingSide: 60
  },
  {
    id: 'soft-gradient',
    name: 'Soft Gradient',
    category: 'gradient',
    layout: 'classic-top',
    backgroundColor: '#E0E7FF',
    gradient: { enabled: true, color1: '#E0E7FF', color2: '#C7D2FE', angle: 135 },
    textColor: '#3730A3',
    pattern: noPattern,
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

// Template presets for quick access
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

// Get theme preset by ID
export const getThemePresetById = (id: string): ThemePreset | undefined => {
  return THEME_PRESETS.find(p => p.id === id);
};

// Legacy alias
export const getColorPresetById = getThemePresetById;

// All categories with labels
export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
  { id: 'minimal', label: 'Minimal', icon: '○' },
  { id: 'bold', label: 'Bold', icon: '■' },
  { id: 'gradient', label: 'Gradient', icon: '◐' },
  { id: 'pattern', label: 'Pattern', icon: '⬡' },
  { id: 'dark', label: 'Dark', icon: '●' },
  { id: 'colorful', label: 'Colorful', icon: '◆' }
];

// Theme preset groups for UI - three rows
export const THEME_PRESET_GROUPS = [
  { id: 'multi', label: 'Multi-Color (alternating)', presets: ['rainbow', 'pastel-rainbow', 'neon-nights', 'messenger', 'instagram', 'sunset', 'aurora', 'ocean', 'forest'] },
  { id: 'gradient', label: 'Gradient', presets: [
    'purple-gradient', 'bright-magenta', 'tech-blue', 'deep-blue', 'indigo',
    'emerald', 'teal', 'cyan-fresh', 'hot-pink', 'rose'
  ]},
  { id: 'solid', label: 'Solid', presets: [
    'dark-navy', 'dark-purple', 'pure-black',
    'electric-violet', 'spotify-green', 'mint', 'orange', 'amber',
    'pastel-lavender', 'pastel-pink', 'pastel-mint', 'pastel-yellow', 'pastel-blue', 'pastel-peach',
    'clean-white', 'warm-white', 'cool-gray'
  ]}
];

// Legacy alias
export const COLOR_PRESET_GROUPS = THEME_PRESET_GROUPS;

// Pattern type options for UI
export const PATTERN_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'diagonal-lines', label: 'Lines' },
  { value: 'circles', label: 'Circles' },
  { value: 'squares', label: 'Squares' }
];
