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
