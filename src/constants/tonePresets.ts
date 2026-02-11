export interface TonePreset {
  id: string;
  name: string;
  description: string;
  templateIds: string[];
  previewColors: string[];
}

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'bright',
    name: 'Bright',
    description: 'Vibrant, energetic colors that pop',
    templateIds: ['rainbow', 'neon-nights', 'hot-pink', 'electric-violet', 'sunset', 'instagram'],
    previewColors: ['#EF4444', '#F97316', '#1DB954', '#7C3AED', '#EC4899'],
  },
  {
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft, elegant tones',
    templateIds: ['pastel-rainbow', 'pastel-lavender', 'pastel-pink', 'pastel-mint', 'clean-white'],
    previewColors: ['#FBCFE8', '#DDD6FE', '#BFDBFE', '#A7F3D0', '#FDE68A'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Professional and trustworthy',
    templateIds: ['deep-blue', 'tech-blue', 'indigo', 'cool-gray', 'ocean'],
    previewColors: ['#1E40AF', '#2563EB', '#4F46E5', '#F1F5F9', '#0284C7'],
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek, modern dark themes',
    templateIds: ['pure-black', 'dark-navy', 'dark-purple', 'neon-nights'],
    previewColors: ['#000000', '#1a1a2e', '#2d1b4e', '#16213e'],
  },
];

export const TONE_ADJECTIVES: Record<string, string> = {
  bright: 'vibrant, bold',
  pastel: 'soft, pastel',
  classic: 'professional, blue-toned',
  dark: 'dark, sleek',
};

export const getTonePreset = (id: string): TonePreset | undefined => {
  return TONE_PRESETS.find(t => t.id === id);
};

export interface LayoutPresetStyle {
  textPosition: 'top' | 'bottom';
  mockupAlignment: 'top' | 'center' | 'bottom';
  mockupVisibility: 'full';
  mockupOffset: { x: number; y: number };
  mockupContinuation?: 'left-start' | 'left-end';
  mockupRotation?: number;
  mockupScale?: number;
  // For spanning: which screenshot index to use for mockup
  mockupScreenshotIndex?: number;
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  getStyle: (index: number) => LayoutPresetStyle;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'bottom',
    name: 'Classic',
    description: 'Text on top, mockup at the bottom',
    getStyle: (_index: number) => ({
      textPosition: 'top' as const,
      mockupAlignment: 'bottom' as const,
      mockupVisibility: 'full' as const,
      mockupOffset: { x: 0, y: 60 },
    }),
  },
  {
    id: 'text-bottom',
    name: 'Text Bottom',
    description: 'Mockup on top, text at the bottom',
    getStyle: (_index: number) => ({
      textPosition: 'bottom' as const,
      mockupAlignment: 'top' as const,
      mockupVisibility: 'full' as const,
      mockupOffset: { x: 0, y: -60 },
    }),
  },
  {
    id: 'center',
    name: 'Center',
    description: 'Mockup centered, text on top',
    getStyle: (_index: number) => ({
      textPosition: 'top' as const,
      mockupAlignment: 'center' as const,
      mockupVisibility: 'full' as const,
      mockupOffset: { x: 0, y: 0 },
    }),
  },
  {
    id: 'alternating',
    name: 'Alternating',
    description: 'Mockup alternates bottom/top per screenshot',
    getStyle: (index: number) => ({
      textPosition: (index % 2 === 0 ? 'top' : 'bottom') as 'top' | 'bottom',
      mockupAlignment: (index % 2 === 0 ? 'bottom' : 'top') as 'bottom' | 'top',
      mockupVisibility: 'full' as const,
      mockupOffset: { x: 0, y: index % 2 === 0 ? 60 : -60 },
    }),
  },
  {
    id: 'outofbox',
    name: 'Out of Box',
    description: 'Mockup extends beyond the bottom edge',
    getStyle: (_index: number) => ({
      textPosition: 'top' as const,
      mockupAlignment: 'bottom' as const,
      mockupVisibility: 'full' as const,
      mockupOffset: { x: 0, y: 300 },
      mockupScale: 1.3,
    }),
  },
  {
    id: 'spanning',
    name: 'Spanning',
    description: 'One mockup spans two consecutive screenshots',
    getStyle: (index: number) => {
      // Screenshots 0 and 1 share the same mockup image spanning across both
      // Values based on: X:41% Y:12% R:27° for linked pair
      if (index === 0) {
        return {
          textPosition: 'top' as const,
          mockupAlignment: 'bottom' as const,
          mockupVisibility: 'full' as const,
          mockupOffset: { x: 530, y: 335 }, // ~41% X, 12% Y
          mockupRotation: 27,
          mockupScreenshotIndex: 0,
        };
      } else if (index === 1) {
        return {
          textPosition: 'top' as const,
          mockupAlignment: 'bottom' as const,
          mockupVisibility: 'full' as const,
          mockupOffset: { x: -530, y: 335 }, // Mirrored X position
          mockupRotation: 27,
          mockupScreenshotIndex: 0, // Use same screenshot 0's image
        };
      } else {
        // Rest of screenshots: X:-1% Y:11%
        return {
          textPosition: 'top' as const,
          mockupAlignment: 'bottom' as const,
          mockupVisibility: 'full' as const,
          mockupOffset: { x: -13, y: 307 }, // ~-1% X, 11% Y
        };
      }
    },
  },
];
